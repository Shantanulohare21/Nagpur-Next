import os
import uuid
import tempfile
from typing import List
from fastapi import UploadFile
import numpy as np
import SimpleITK as sitk
from skimage import measure
import trimesh

def _save_uploaded_files(files: List[UploadFile]) -> str:
    """Save uploaded files to a temporary directory and return the path.
    Returns the directory path containing the saved files.
    """
    temp_dir = tempfile.mkdtemp(prefix="recon_")
    for upload in files:
        # Generate a safe filename
        filename = f"{uuid.uuid4().hex}_{upload.filename}"
        file_path = os.path.join(temp_dir, filename)
        with open(file_path, "wb") as f:
            content = upload.file.read()
            f.write(content)
        # Reset file pointer for potential further reads
        upload.file.seek(0)
    return temp_dir

def _load_volume_from_directory(dir_path: str) -> sitk.Image:
    """Load a medical volume from the given directory.
    Attempts to read a single NIfTI file; if multiple, picks the first.
    """
    # Find supported files
    for entry in os.listdir(dir_path):
        if entry.lower().endswith(('.nii', '.nii.gz')):
            return sitk.ReadImage(os.path.join(dir_path, entry))
        if entry.lower().endswith('.dcm'):
            # DICOM series: use ImageSeriesReader
            series_IDs = sitk.ImageSeriesReader.GetGDCMSeriesIDs(dir_path)
            if series_IDs:
                series_file_names = sitk.ImageSeriesReader.GetGDCMSeriesFileNames(dir_path, series_IDs[0])
                reader = sitk.ImageSeriesReader()
                reader.SetFileNames(series_file_names)
                return reader.Execute()
    raise RuntimeError("No supported medical image file found in upload.")

def _simple_segmentation(volume: np.ndarray) -> np.ndarray:
    """Very naive segmentation: threshold at 70th percentile intensity.
    Returns a binary mask (uint8).
    """
    thresh = np.percentile(volume, 70)
    mask = (volume > thresh).astype(np.uint8)
    return mask

def generate_mesh_from_volume(volume: np.ndarray) -> trimesh.Trimesh:
    """Create a mesh from a binary volume using marching cubes.
    """
    verts, faces, _, _ = measure.marching_cubes(volume, level=0.5)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    return mesh

def process_files_to_glb(files: List[UploadFile]) -> bytes:
    """Complete pipeline: save uploads, load volume, segment, mesh, export GLB.
    Returns GLB binary data.
    """
    temp_dir = _save_uploaded_files(files)
    try:
        sitk_image = _load_volume_from_directory(temp_dir)
        volume_np = sitk.GetArrayFromImage(sitk_image)  # shape: z, y, x
        # Simple segmentation
        mask = _simple_segmentation(volume_np)
        # Generate mesh from mask
        mesh = generate_mesh_from_volume(mask)
        glb_bytes = mesh.export(file_type="glb")
        if not isinstance(glb_bytes, (bytes, bytearray)):
            raise RuntimeError("Failed to export GLB mesh")
        return glb_bytes
    finally:
        # Cleanup temporary directory
        try:
            for f in os.listdir(temp_dir):
                os.remove(os.path.join(temp_dir, f))
            os.rmdir(temp_dir)
        except Exception:
            pass
