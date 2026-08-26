"""
DICOM / NIfTI processing service.

Handles:
  - ZIP archives containing DICOM series
  - DICOM folder uploads (multiple .dcm files)
  - NIfTI (.nii / .nii.gz) volumes
  - Single-frame DICOM (X-ray / CR / DX)
  - Raster images (PNG, JPG, TIFF) — stacked as pseudo-volume

Outputs a unified SimpleITK Image + patient metadata dict.
"""
import os
import uuid
import shutil
import tempfile
import zipfile
from typing import Dict, Any, List, Optional, Tuple

from fastapi import UploadFile
import numpy as np
import SimpleITK as sitk

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SUPPORTED_EXTS = {
    ".dcm", ".dicom",
    ".nii",  # .nii.gz handled separately
    ".png", ".jpg", ".jpeg", ".tif", ".tiff",
    ".zip",
}

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def save_uploaded_files(files: List[UploadFile]) -> str:
    """Save uploaded files to a temporary directory and return its path."""
    temp_dir = tempfile.mkdtemp(prefix="recon_")
    for upload in files:
        safe_name = f"{uuid.uuid4().hex[:8]}_{upload.filename}"
        file_path = os.path.join(temp_dir, safe_name)
        with open(file_path, "wb") as f:
            content = upload.file.read()
            f.write(content)
        upload.file.seek(0)
    return temp_dir


def extract_zip_if_present(dir_path: str) -> str:
    """If there is a ZIP file in dir_path, extract it and return the extraction path."""
    for entry in os.listdir(dir_path):
        if entry.lower().endswith(".zip"):
            zip_path = os.path.join(dir_path, entry)
            extract_dir = os.path.join(dir_path, "extracted")
            os.makedirs(extract_dir, exist_ok=True)
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extract_dir)
            # If extracted dir contains a single subfolder, step into it
            children = os.listdir(extract_dir)
            if len(children) == 1 and os.path.isdir(os.path.join(extract_dir, children[0])):
                return os.path.join(extract_dir, children[0])
            return extract_dir
    return dir_path


def load_volume(dir_path: str) -> sitk.Image:
    """Load a medical volume from a directory. Returns a SimpleITK Image.

    Priority order:
      1. NIfTI files
      2. DICOM series (multi-slice)
      3. Single-frame DICOM
      4. Raster images stacked as pseudo-volume
    """
    # Handle ZIP files first
    dir_path = extract_zip_if_present(dir_path)

    # Gather all files (including subdirectories)
    all_files: List[str] = []
    for root, _, fnames in os.walk(dir_path):
        for fn in fnames:
            all_files.append(os.path.join(root, fn))

    # 1. NIfTI
    nifti_files = [f for f in all_files if f.lower().endswith((".nii", ".nii.gz"))]
    if nifti_files:
        return sitk.ReadImage(nifti_files[0])

    # 2. DICOM series (multi-slice)
    # Try to find a directory containing DICOM files
    dcm_dirs = set()
    for f in all_files:
        if f.lower().endswith((".dcm", ".dicom")):
            dcm_dirs.add(os.path.dirname(f))

    # Also check directories without extension (common for DICOM)
    for root, dirs, fnames in os.walk(dir_path):
        for fn in fnames:
            # DICOM files sometimes have no extension
            full = os.path.join(root, fn)
            if not os.path.splitext(fn)[1]:
                dcm_dirs.add(root)

    for dcm_dir in dcm_dirs:
        series_ids = sitk.ImageSeriesReader.GetGDCMSeriesIDs(dcm_dir)
        if series_ids:
            series_files = sitk.ImageSeriesReader.GetGDCMSeriesFileNames(
                dcm_dir, series_ids[0]
            )
            if len(series_files) > 1:
                reader = sitk.ImageSeriesReader()
                reader.SetFileNames(series_files)
                reader.MetaDataDictionaryArrayUpdateOn()
                reader.LoadPrivateTagsOn()
                return reader.Execute()

    # 3. Single-frame DICOM (X-ray / CR / DX)
    dcm_files = [f for f in all_files if f.lower().endswith((".dcm", ".dicom"))]
    if dcm_files:
        try:
            import pydicom
            ds = pydicom.dcmread(dcm_files[0])
            arr = ds.pixel_array.astype(np.float64)
            if arr.ndim == 2:
                arr = arr[np.newaxis, :, :]  # Add slice dimension
            img = sitk.GetImageFromArray(arr)
            # Try to set spacing from DICOM
            if hasattr(ds, "PixelSpacing") and ds.PixelSpacing:
                ps = [float(x) for x in ds.PixelSpacing]
                img.SetSpacing((ps[1], ps[0], 1.0))
            elif hasattr(ds, "ImagerPixelSpacing") and ds.ImagerPixelSpacing:
                ps = [float(x) for x in ds.ImagerPixelSpacing]
                img.SetSpacing((ps[1], ps[0], 1.0))
            return img
        except Exception:
            pass

    # 4. Raster images
    raster_exts = (".png", ".jpg", ".jpeg", ".tif", ".tiff")
    raster_files = sorted(
        [f for f in all_files if f.lower().endswith(raster_exts)]
    )
    if raster_files:
        from PIL import Image
        slices = []
        for fpath in raster_files:
            img = Image.open(fpath).convert("L")
            slices.append(np.array(img, dtype=np.float64))
        volume = np.stack(slices, axis=0)
        return sitk.GetImageFromArray(volume)

    raise RuntimeError(
        "No supported medical image file found in upload. "
        "Supported: NIfTI (.nii/.nii.gz), DICOM (.dcm), ZIP, PNG, JPG, TIFF"
    )


def extract_patient_metadata(dir_path: str) -> Dict[str, Any]:
    """Extract patient and study metadata from the first DICOM file found.

    Returns a dict with keys like PatientName, PatientID, Modality,
    StudyDate, SliceThickness, PixelSpacing, etc.
    """
    # Handle ZIP
    dir_path = extract_zip_if_present(dir_path)

    all_files: List[str] = []
    for root, _, fnames in os.walk(dir_path):
        for fn in fnames:
            all_files.append(os.path.join(root, fn))

    dcm_files = [f for f in all_files if f.lower().endswith((".dcm", ".dicom"))]
    if not dcm_files:
        # Check for NIfTI — limited metadata
        nifti = [f for f in all_files if f.lower().endswith((".nii", ".nii.gz"))]
        if nifti:
            return {"Modality": "NIfTI", "SourceFile": os.path.basename(nifti[0])}
        return {}

    import pydicom
    ds = pydicom.dcmread(dcm_files[0], stop_before_pixels=True)

    meta: Dict[str, Any] = {}
    tag_map = {
        "PatientName": "PatientName",
        "PatientID": "PatientID",
        "PatientBirthDate": "PatientBirthDate",
        "PatientSex": "PatientSex",
        "PatientAge": "PatientAge",
        "StudyDate": "StudyDate",
        "Modality": "Modality",
        "StudyDescription": "StudyDescription",
        "SeriesDescription": "SeriesDescription",
        "BodyPartExamined": "BodyPartExamined",
        "Manufacturer": "Manufacturer",
        "InstitutionName": "InstitutionName",
        "SliceThickness": "SliceThickness",
        "PixelSpacing": "PixelSpacing",
        "Rows": "Rows",
        "Columns": "Columns",
        "NumberOfFrames": "NumberOfFrames",
    }
    for dcm_tag, key in tag_map.items():
        if hasattr(ds, dcm_tag):
            val = getattr(ds, dcm_tag)
            if isinstance(val, pydicom.sequence.Sequence):
                continue
            meta[key] = str(val)

    # Count total DICOM files (slices)
    meta["TotalSlices"] = len(dcm_files)

    return meta


def detect_modality(dir_path: str) -> str:
    """Detect the imaging modality from files in the directory."""
    dir_path = extract_zip_if_present(dir_path)

    all_files = []
    for root, _, fnames in os.walk(dir_path):
        for fn in fnames:
            all_files.append(os.path.join(root, fn))

    dcm_files = [f for f in all_files if f.lower().endswith((".dcm", ".dicom"))]
    if dcm_files:
        try:
            import pydicom
            ds = pydicom.dcmread(dcm_files[0], stop_before_pixels=True)
            modality = str(getattr(ds, "Modality", "UNKNOWN"))
            return modality
        except Exception:
            pass

    nifti = [f for f in all_files if f.lower().endswith((".nii", ".nii.gz"))]
    if nifti:
        name = os.path.basename(nifti[0]).lower()
        if "ct" in name:
            return "CT"
        if "mr" in name or "mri" in name:
            return "MR"
        return "CT"  # Default for NIfTI

    return "XRAY"


def cleanup_temp_dir(dir_path: str) -> None:
    """Remove a temporary directory and all its contents."""
    try:
        shutil.rmtree(dir_path, ignore_errors=True)
    except Exception:
        pass
