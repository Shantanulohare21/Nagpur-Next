from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from typing import List

router = APIRouter()

# Allowed extensions for medical imaging files
ALLOWED_EXTENSIONS = {"dcm", "dicom", "nii", "nii.gz", "nifti", "stl", "obj", "ply", "jpeg", "jpg", "png"}

def validate_extension(filename: str) -> bool:
    ext = filename.lower().split('.')[-1]
    return ext in ALLOWED_EXTENSIONS

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")

@router.post("/", response_model=dict)
async def upload_files(files: List[UploadFile] = File(...)):
    saved = []
    for upload in files:
        if not validate_extension(upload.filename):
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {upload.filename}")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, upload.filename)
        with open(file_path, "wb") as out_file:
            content = await upload.read()
            out_file.write(content)
        saved.append({"filename": upload.filename, "path": file_path})
    return {"uploaded": saved}
