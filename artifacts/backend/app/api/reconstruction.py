from fastapi import APIRouter, HTTPException
from typing import Dict

router = APIRouter()

@router.post("/reconstruction/{study_id}")
async def enqueue_reconstruction(study_id: int):
    """Enqueue a reconstruction task for the given study.
    Returns a Celery task ID that can be polled via /reconstruction/status/{task_id}.
    """
    # Import lazily to avoid circular imports
    from app.tasks.reconstruction import run_reconstruction_task
    task = run_reconstruction_task.delay(study_id)
    return {"task_id": task.id, "status": "queued"}

@router.get("/reconstruction/status/{task_id}")
async def get_task_status(task_id: str):
    from app.celery_worker import celery_app
    result = celery_app.AsyncResult(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": task_id, "status": result.status, "result": result.result}

@router.get("/reconstruction/mesh/{study_id}")
async def get_mesh(study_id: int):
    """Serve the generated GLB mesh for a completed reconstruction.
    Returns a JSON with the file URL (served by FastAPI static files).
    """
    from app.models.reconstruction import Reconstruction
    from app.db import get_session
    async with get_session() as session:
        recon = await session.get(Reconstruction, study_id)
        if not recon or not recon.mesh_path:
            raise HTTPException(status_code=404, detail="Mesh not found")
    return {"mesh_path": recon.mesh_path}

from typing import List
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
import io
import trimesh
from app.services.reconstruction_service import process_files_to_glb

@router.post("/generate", summary="Generate 3D shoulder model from uploaded imaging files")
async def generate_3d_model(
    modality: str = "ct",
    files: List[UploadFile] = File(...)
) -> StreamingResponse:
    """Full pipeline for CT/MR/X‑ray inputs.
    Args:
        modality: one of "ct", "mr", "xray" – determines preprocessing (currently same placeholder).
        files: uploaded DICOM/NIfTI/IMG files.
    Returns:
        Streaming GLB mesh.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    # Future: switch segmentation based on modality.
    try:
        glb_bytes = process_files_to_glb(files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    glb_io = io.BytesIO(glb_bytes)
    glb_io.seek(0)
    return StreamingResponse(
        glb_io,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": f"attachment; filename=shoulder_model_{modality}.glb"},
    )
