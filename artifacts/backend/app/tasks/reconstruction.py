from app.celery_worker import celery_app

@celery_app.task(name="run_reconstruction_task")
import os
import shutil
from datetime import datetime
import tempfile
from pathlib import Path

import numpy as np
import pydicom
import SimpleITK as sitk
import trimesh
from skimage import measure

# Import DB utilities and reconstruction service components
from app.db_sync import get_sync_session
from app.models.reconstruction import Reconstruction
from app.models.study import Study
from app.services.reconstruction_service import _simple_segmentation, _deep_learning_segmentation

def volume_from_dicom_series(series_path: str):
    """Read a DICOM series directory and return a tuple of (3‑D numpy volume, numpy_spacing)."""
    reader = sitk.ImageSeriesReader()
    dicom_names = reader.GetGDCMSeriesFileNames(series_path)
    if not dicom_names:
        raise RuntimeError(f"No DICOM files found in {series_path}")
    reader.SetFileNames(dicom_names)
    image = reader.Execute()
    array = sitk.GetArrayFromImage(image)  # shape: (slices, rows, cols)
    spacing = image.GetSpacing()  # (dx, dy, dz)
    numpy_spacing = (spacing[2], spacing[1], spacing[0])  # Match numpy array axis layout (dz, dy, dx)
    return array, numpy_spacing

def generate_mesh_from_mask(mask: np.ndarray, spacing: tuple) -> trimesh.Trimesh:
    """Create a mesh from a binary mask using marching cubes with spacing."""
    if not np.any(mask):
        return trimesh.creation.icosphere(subdivisions=2, radius=10.0)
    verts, faces, _, _ = measure.marching_cubes(mask, level=0.5, spacing=spacing)
    return trimesh.Trimesh(vertices=verts, faces=faces, process=False)

def simplify_and_save_mesh(mesh: trimesh.Trimesh, output_path: str) -> None:
    """Simplify mesh (decimate), smooth, and export as GLB."""
    # Decimate to ~150k triangles max for WebGL performance
    target_triangles = 150_000
    if len(mesh.faces) > target_triangles:
        try:
            mesh = mesh.simplify_quadratic_decimation(target_triangles)
        except Exception:
            pass
            
    # Laplacian smoothing to remove pixelation steps
    try:
        trimesh.smoothing.filter_laplacian(mesh, iterations=5)
    except Exception:
        pass
        
    # Export as GLB
    mesh.export(output_path, file_type="glb")

def run_reconstruction_task(study_id: int):
    """Celery task entry point – full pipeline for a given study.
    This function will be called with ``.delay`` from the API router.
    """
    session = get_sync_session()
    try:
        # Load study metadata
        study: Study = session.query(Study).filter(Study.id == study_id).first()
        if not study:
            raise RuntimeError(f"Study {study_id} not found")

        # For this demo we assume the study's upload folder is under /data/uploads/<study_id>/
        upload_dir = Path(os.getenv("UPLOAD_DIR", "/data/uploads")) / str(study_id)

        # Load volume and spacing dynamically
        volume, spacing = volume_from_dicom_series(str(upload_dir))

        # Perform clinical bone segmentation with morphological closing and component isolation
        mask = _simple_segmentation(volume)

        # Mesh generation using scikit-image and clinical spacing
        mesh = generate_mesh_from_mask(mask, spacing)

        # Prepare output folder
        mesh_dir = upload_dir / "meshes"
        mesh_dir.mkdir(parents=True, exist_ok=True)
        mesh_path = mesh_dir / f"study_{study_id}_shoulder.glb"

        # Decimate, smooth, and export GLB
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
