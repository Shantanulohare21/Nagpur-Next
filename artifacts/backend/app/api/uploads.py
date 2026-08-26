from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from typing import List

router = APIRouter()

# Allowed extensions for medical imaging files
ALLOWED_EXTENSIONS = {
    "dcm", "dicom", "nii", "nii.gz", "nifti",
    "stl", "obj", "ply", "jpeg", "jpg", "png", "zip"
}

def validate_extension(filename: str) -> bool:
    """Return True if the file extension is allowed.

    Handles the special case of .nii.gz files.
    """
    ext = filename.lower().split('.')[-1]
    if ext == "gz" and filename.lower().endswith('.nii.gz'):
        ext = "nii.gz"
    return ext in ALLOWED_EXTENSIONS

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")

@router.post("/", response_model=dict)
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload one or more medical imaging files.

    Files are saved to the configured UPLOAD_DIR.
    """
    saved = []
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    for upload in files:
        if not validate_extension(upload.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {upload.filename}"
            )
        file_path = os.path.join(UPLOAD_DIR, upload.filename)
        content = await upload.read()
        with open(file_path, "wb") as out_file:
            out_file.write(content)
        saved.append({"filename": upload.filename, "path": file_path})
    return {"uploaded": saved}
