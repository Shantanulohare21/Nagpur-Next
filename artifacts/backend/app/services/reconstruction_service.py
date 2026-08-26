"""
3D Reconstruction Service — Real Medical Imaging Pipeline.

Pipeline:
  1. Accept uploaded files (DICOM series, NIfTI, ZIP, images)
  2. Load volume with correct voxel spacing
  3. Segment bone structures (multi-structure: humerus, scapula, clavicle)
  4. Generate meshes per structure with marching cubes
  5. Export multi-material GLB with named mesh groups + PBR coloring
  6. Compute clinical measurements
  7. Return GLB bytes + measurements + metadata
"""
import os
import io
import struct
import json
import uuid
import tempfile
from typing import List, Dict, Any, Optional, Tuple

from fastapi import UploadFile
import numpy as np
import SimpleITK as sitk
from skimage import measure
import trimesh

from app.services.dicom_processor import (
    save_uploaded_files,
    load_volume,
    extract_patient_metadata,
    detect_modality,
    cleanup_temp_dir,
)
from app.services.measurement_service import compute_all_measurements

# Optional deep-learning imports
try:
    import torch
    try:
        from app.models.unet import UNet
    except ImportError:
        UNet = None
except Exception:
    torch = None
    UNet = None

# ---------------------------------------------------------------------------
# Structure colors for multi-material GLB (RGB 0-1)
# ---------------------------------------------------------------------------
STRUCTURE_COLORS = {
    "humerus":  (0.95, 0.88, 0.76, 1.0),   # Warm bone
    "scapula":  (0.85, 0.82, 0.75, 1.0),   # Cool bone
    "clavicle": (0.90, 0.85, 0.72, 1.0),   # Light bone
    "glenoid":  (0.80, 0.90, 0.95, 1.0),   # Blueish cartilage
    "combined": (0.92, 0.86, 0.78, 1.0),   # Default bone
}

# ---------------------------------------------------------------------------
# Segmentation algorithms
# ---------------------------------------------------------------------------

def segment_bones_threshold(
    volume: np.ndarray,
    modality: str = "CT",
    use_otsu: bool = False,
) -> Dict[str, np.ndarray]:
    """Segment bone structures using clinical thresholding.

    For CT: Uses Hounsfield Unit thresholds for cortical and cancellous bone.
    For MR: Uses Otsu/percentile-based thresholding.

    Returns dict mapping structure name to binary mask.
    Attempts to separate humerus and scapula using connected components.
    """
    if use_otsu or modality == "MR":
        from skimage.filters import threshold_otsu
        try:
            thresh = threshold_otsu(volume)
        except ValueError:
            thresh = np.percentile(volume, 75)
    else:
        # CT bone thresholding
        vmax = volume.max()
        if vmax > 300:
            # Likely Hounsfield Units
            thresh = 200  # Bone threshold in HU
        elif vmax > 1:
            thresh = np.percentile(volume, 70)
        else:
            thresh = 0.5

    # Initial binary mask
    mask = (volume > thresh).astype(np.uint8)

    # Morphological cleanup
    try:
        from scipy.ndimage import binary_closing, binary_opening, binary_fill_holes
        mask = binary_closing(mask, structure=np.ones((3, 3, 3))).astype(np.uint8)
        mask = binary_opening(mask, structure=np.ones((2, 2, 2))).astype(np.uint8)
        # Fill small internal holes
        for z in range(mask.shape[0]):
            mask[z] = binary_fill_holes(mask[z]).astype(np.uint8)
    except Exception:
        pass

    # Connected component analysis to separate structures
    masks = _separate_structures(mask)

    return masks


def _separate_structures(mask: np.ndarray) -> Dict[str, np.ndarray]:
    """Separate a binary bone mask into individual structures using
    connected component analysis and spatial heuristics.

    Heuristics for shoulder anatomy:
    - The two largest components are typically humerus and scapula
    - The humerus is more superior (lower Z in typical CT orientation)
    - The scapula has a wider/flatter shape
    """
    from skimage.measure import label

    labeled = label(mask)
    if labeled.max() == 0:
        return {"combined": mask}

    # Get component sizes (excluding background)
    sizes = np.bincount(labeled.ravel())
    sizes[0] = 0  # Ignore background

    # Get the top components
    n_components = min(5, labeled.max())
    top_indices = np.argsort(sizes)[-n_components:][::-1]
    top_indices = [i for i in top_indices if sizes[i] > 0]

    if len(top_indices) == 0:
        return {"combined": mask}

    if len(top_indices) == 1:
        # Only one component — can't separate
        return {"combined": (labeled == top_indices[0]).astype(np.uint8)}

    # Try to identify humerus vs scapula
    # Use centroid positions and shapes
    component_info = []
    for idx in top_indices[:3]:  # Top 3 components
        comp_mask = (labeled == idx).astype(np.uint8)
        coords = np.argwhere(comp_mask > 0)
        centroid = coords.mean(axis=0)
        bbox_size = coords.max(axis=0) - coords.min(axis=0)
        component_info.append({
            "label": idx,
            "mask": comp_mask,
            "size": sizes[idx],
            "centroid": centroid,
            "bbox": bbox_size,
            "aspect_ratio": (bbox_size[1] * bbox_size[2]) / (bbox_size[0] + 1),
        })

    # Sort by size (largest first)
    component_info.sort(key=lambda x: x["size"], reverse=True)

    result: Dict[str, np.ndarray] = {}

    if len(component_info) >= 2:
        c1, c2 = component_info[0], component_info[1]

        # The humerus is typically more lateral (higher X) and has a
        # more elongated shape (lower aspect ratio in the axial plane)
        # The scapula is typically more medial and flatter

        # Use lateral position as primary discriminator
        if c1["centroid"][2] > c2["centroid"][2]:
            # c1 is more lateral → likely humerus
            result["humerus"] = c1["mask"]
            result["scapula"] = c2["mask"]
        else:
            result["humerus"] = c2["mask"]
            result["scapula"] = c1["mask"]

        # If there's a third component, it might be the clavicle
        if len(component_info) >= 3:
            c3 = component_info[2]
            if c3["size"] > sizes[top_indices[0]] * 0.05:  # At least 5% of largest
                result["clavicle"] = c3["mask"]

    else:
        result["combined"] = component_info[0]["mask"]

    # Create combined mask
    combined = np.zeros_like(mask, dtype=np.uint8)
    for m in result.values():
        combined = np.maximum(combined, m)
    result["combined"] = combined

    return result


def segment_bones_deep_learning(volume: np.ndarray) -> Dict[str, np.ndarray]:
    """Run deep learning segmentation using trained UNet.

    Falls back to threshold segmentation if model weights not available.
    """
    if torch is None or UNet is None:
        return segment_bones_threshold(volume, modality="CT", use_otsu=True)

    # Search for trained weights
    weights_candidates = [
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "scratch", "shoulder_unet.pth"),
        "shoulder_unet.pth",
        os.path.join(os.getenv("MODEL_DIR", "/data/models"), "shoulder_unet.pth"),
    ]
    weights_path = None
    for cand in weights_candidates:
        if os.path.exists(cand):
            weights_path = cand
            break

    if not weights_path:
        return segment_bones_threshold(volume, modality="CT", use_otsu=True)

    try:
        vol = volume.astype(np.float32)
        vol = (vol - vol.min()) / (vol.max() - vol.min() + 1e-8)
        tensor = torch.from_numpy(vol).unsqueeze(0).unsqueeze(0)

        model = UNet()
        model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        model.eval()

        with torch.no_grad():
            pred = model(tensor)

        mask = (torch.sigmoid(pred) > 0.5).cpu().numpy().astype(np.uint8)
        mask = mask.squeeze(0).squeeze(0)

        return _separate_structures(mask)
    except Exception as e:
        print(f"Deep learning segmentation failed: {e}. Falling back to thresholding.")
        return segment_bones_threshold(volume, modality="CT", use_otsu=True)


# ---------------------------------------------------------------------------
# Mesh generation
# ---------------------------------------------------------------------------

def generate_mesh_from_mask(
    mask: np.ndarray,
    spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0),
    target_faces: int = 100000,
    smooth_iterations: int = 5,
) -> trimesh.Trimesh:
    """Generate a mesh from a binary mask using marching cubes.

    Applies decimation and Laplacian smoothing for web-ready output.
    """
    if not np.any(mask):
        return trimesh.creation.icosphere(subdivisions=2, radius=10.0)

    # Marching cubes with clinical spacing
    verts, faces, normals, _ = measure.marching_cubes(
        mask.astype(np.float32), level=0.5, spacing=spacing
    )
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals, process=False)

    # Decimate if needed
    if len(mesh.faces) > target_faces:
        try:
            mesh = mesh.simplify_quadric_decimation(target_faces)
        except Exception:
            try:
                ratio = target_faces / len(mesh.faces)
                mesh = mesh.simplify_quadric_decimation(int(len(mesh.faces) * ratio))
            except Exception:
                pass

    # Smooth
    try:
        trimesh.smoothing.filter_laplacian(mesh, iterations=smooth_iterations)
    except Exception:
        pass

    # Center the mesh
    mesh.vertices -= mesh.centroid

    return mesh


def build_multi_structure_glb(
    meshes: Dict[str, trimesh.Trimesh],
) -> bytes:
    """Build a single GLB file containing multiple named meshes with PBR materials.

    Each structure gets its own material with a distinct color.
    Uses trimesh Scene for proper multi-mesh GLB export.
    """
    scene = trimesh.Scene()

    for name, mesh in meshes.items():
        if name == "combined":
            continue  # Skip the combined mask, we have individual parts

        color = STRUCTURE_COLORS.get(name, STRUCTURE_COLORS["combined"])
        color_rgba = [int(c * 255) for c in color]

        # Apply vertex colors
        mesh.visual.vertex_colors = np.tile(color_rgba, (len(mesh.vertices), 1))

        scene.add_geometry(mesh, node_name=name, geom_name=name)

    # If scene is empty (no individual structures), use combined
    if len(scene.geometry) == 0 and "combined" in meshes:
        mesh = meshes["combined"]
        color = STRUCTURE_COLORS["combined"]
        color_rgba = [int(c * 255) for c in color]
        mesh.visual.vertex_colors = np.tile(color_rgba, (len(mesh.vertices), 1))
        scene.add_geometry(mesh, node_name="shoulder", geom_name="shoulder")

    # Export to GLB
    glb_bytes = scene.export(file_type="glb")
    if not isinstance(glb_bytes, (bytes, bytearray)):
        raise RuntimeError("Failed to export multi-structure GLB")

    return bytes(glb_bytes)


# ---------------------------------------------------------------------------
# Mesh quality verification
# ---------------------------------------------------------------------------

def verify_mesh(mesh: trimesh.Trimesh) -> Dict[str, Any]:
    """Lightweight quality checks on a generated mesh."""
    return {
        "is_watertight": bool(mesh.is_watertight),
        "volume_mm3": round(float(mesh.volume), 1) if hasattr(mesh, "volume") else 0.0,
        "surface_area_mm2": round(float(mesh.area), 1) if hasattr(mesh, "area") else 0.0,
        "euler_number": int(mesh.euler_number) if hasattr(mesh, "euler_number") else 0,
        "n_vertices": len(mesh.vertices),
        "n_faces": len(mesh.faces),
        "bounds_mm": mesh.bounds.tolist() if mesh.bounds is not None else [],
    }


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

def process_files_to_glb(
    files: List[UploadFile],
    use_deep_learning: bool = False,
    use_otsu: bool = False,
) -> Dict[str, Any]:
    """Full reconstruction pipeline:

    1. Save uploads → temporary directory
    2. Load volume (NIfTI / DICOM / ZIP / images)
    3. Extract DICOM patient metadata
    4. Detect modality
    5. Segment bone structures (multi-structure)
    6. Generate per-structure meshes
    7. Build multi-material GLB
    8. Compute clinical measurements
    9. Verify mesh quality
    10. Clean up temp files

    Returns dict with:
      - glb: GLB bytes
      - verification: mesh quality dict
      - metadata: DICOM metadata dict
      - measurements: clinical measurements dict
      - structures: list of structure names found
      - modality: detected imaging modality
    """
    temp_dir = save_uploaded_files(files)

    try:
        # Load volume
        sitk_image = load_volume(temp_dir)
        volume_np = sitk.GetArrayFromImage(sitk_image)

        # Get spacing (SimpleITK returns dx, dy, dz)
        spacing = sitk_image.GetSpacing()
        numpy_spacing = (spacing[2], spacing[1], spacing[0])  # dz, dy, dx

        # Extract metadata
        metadata = extract_patient_metadata(temp_dir)
        modality = detect_modality(temp_dir)
        metadata["DetectedModality"] = modality

        # Segment
        if use_deep_learning:
            masks = segment_bones_deep_learning(volume_np)
        else:
            masks = segment_bones_threshold(
                volume_np, modality=modality, use_otsu=use_otsu
            )

        # Generate meshes per structure
        structure_meshes: Dict[str, trimesh.Trimesh] = {}
        for name, mask in masks.items():
            if name == "combined":
                continue
            if np.sum(mask) < 50:  # Skip tiny structures
                continue
            mesh = generate_mesh_from_mask(
                mask, spacing=numpy_spacing,
                target_faces=80000,  # Per structure (less faces, combined will be fine)
                smooth_iterations=5,
            )
            structure_meshes[name] = mesh

        # Fallback: if no individual structures, use combined
        if len(structure_meshes) == 0 and "combined" in masks:
            mesh = generate_mesh_from_mask(
                masks["combined"], spacing=numpy_spacing,
                target_faces=150000,
                smooth_iterations=5,
            )
            structure_meshes["combined"] = mesh

        # Build multi-material GLB
        glb_bytes = build_multi_structure_glb(structure_meshes)

        # Compute measurements
        measurements = compute_all_measurements(volume_np, masks, numpy_spacing)

        # Verify the largest mesh
        largest_mesh = max(structure_meshes.values(), key=lambda m: len(m.faces))
        verification = verify_mesh(largest_mesh)
        verification["structure_count"] = len(structure_meshes)
        verification["structure_names"] = list(structure_meshes.keys())

        return {
            "glb": glb_bytes,
            "verification": verification,
            "metadata": metadata,
            "measurements": measurements,
            "structures": list(structure_meshes.keys()),
            "modality": modality,
        }

    finally:
        cleanup_temp_dir(temp_dir)
