import os
import tempfile
import shutil
from datetime import datetime
from pathlib import Path

import numpy as np
import pydicom
import SimpleITK as sitk
import open3d as o3d

# Import DB utilities
from app.db_sync import get_sync_session
from app.models.reconstruction import Reconstruction
from app.models.study import Study

# Placeholder segmentation – in real use replace with MONAI model inference
def dummy_segmentation(volume: np.ndarray) -> np.ndarray:
    """Return a binary mask where bone voxels are > 200 HU (simplified)."""
    # Assuming volume is in Hounsfield Units
    mask = (volume > 200).astype(np.uint8)
    return mask

def volume_from_dicom_series(series_path: str) -> np.ndarray:
    """Read a DICOM series directory and return a 3‑D numpy volume (HU)."""
    reader = sitk.ImageSeriesReader()
    dicom_names = reader.GetGDCMSeriesFileNames(series_path)
    if not dicom_names:
        raise RuntimeError(f"No DICOM files found in {series_path}")
    reader.SetFileNames(dicom_names)
    image = reader.Execute()
    array = sitk.GetArrayFromImage(image)  # shape: (slices, rows, cols)
    return array

def generate_mesh_from_mask(mask: np.ndarray, spacing: tuple) -> o3d.geometry.TriangleMesh:
    """Create a mesh from a binary mask using marching cubes."""
    # Convert mask to Open3D voxel grid
    vol = o3d.geometry.Volume()
    # Use Open3D built‑in marching cubes via VoxelGrid -> Surface extraction
    # For simplicity we use the built‑in method on a binary volume
    mesh = o3d.geometry.TriangleMesh.create_from_volume_image(mask.astype(np.float32), iso_value=0.5)
    # Apply spacing
    mesh.scale(spacing[0], center=mesh.get_center())
    mesh.compute_vertex_normals()
    return mesh

def simplify_and_save_mesh(mesh: o3d.geometry.TriangleMesh, output_path: str) -> None:
    """Simplify mesh (decimate) and export as GLB."""
    # Decimate to ~200k triangles max (adjust as needed)
    target_triangles = 200_000
    if len(mesh.triangles) > target_triangles:
        mesh = mesh.simplify_quadric_decimation(target_triangles)
    # Laplacian smoothing
    mesh = mesh.filter_smooth_simple(number_of_iterations=5)
    # Export GLB
    o3d.io.write_triangle_mesh(output_path, mesh, write_ascii=False)

def run_reconstruction_task(study_id: int):
    """Celery task entry point – full pipeline for a given study.
    This function will be called with ``.delay`` from the API router.
    """
    session = get_sync_session()
    try:
        # Load study metadata (placeholder – assumes a folder path stored elsewhere)
        study: Study = session.query(Study).filter(Study.id == study_id).first()
        if not study:
            raise RuntimeError(f"Study {study_id} not found")

        # For this demo we assume the study's upload folder is under /data/uploads/<study_id>/
        upload_dir = Path(os.getenv("UPLOAD_DIR", "/data/uploads")) / str(study_id)
        if not upload_dir.is_dir():
            raise RuntimeError(f"Upload directory {upload_dir} missing")

        # Load volume (CT/MRI) – pick first DICOM series in the folder
        volume = volume_from_dicom_series(str(upload_dir))

        # Simple segmentation (replace with real MONAI model later)
        mask = dummy_segmentation(volume)

        # Get spacing from SimpleITK image (placeholder values)
        spacing = (1.0, 1.0, 1.0)

        # Mesh generation
        mesh = generate_mesh_from_mask(mask, spacing)

        # Prepare output folder
        mesh_dir = upload_dir / "meshes"
        mesh_dir.mkdir(parents=True, exist_ok=True)
        mesh_path = mesh_dir / f"study_{study_id}_shoulder.glb"

        # Simplify & save
        simplify_and_save_mesh(mesh, str(mesh_path))

        # Record result in DB
        recon = Reconstruction(
            study_id=study_id,
            status="completed",
            mesh_path=str(mesh_path),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(recon)
        session.commit()
        return {"status": "completed", "mesh_path": str(mesh_path)}
    except Exception as e:
        session.rollback()
        # Record failure
        recon = Reconstruction(
            study_id=study_id,
            status="failed",
            mesh_path=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(recon)
        session.commit()
        raise e
    finally:
        session.close()
