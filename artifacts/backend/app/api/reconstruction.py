"""
Reconstruction API endpoints.

Provides:
  POST /reconstruction/generate — Upload scans → get real 3D GLB model + measurements
  POST /reconstruction/reconstruction/{study_id} — Queue reconstruction for a study
  GET  /reconstruction/reconstruction/status/{task_id} — Poll task status
  GET  /reconstruction/reconstruction/mesh/{study_id} — Get mesh URL for a study
  POST /reconstruction/reconstruction/run/{study_id} — Run reconstruction synchronously
"""
import os
import base64
from typing import Dict, Any, List
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/generate", summary="Generate 3D shoulder model from uploaded imaging files")
async def generate_3d_model(
    files: List[UploadFile] = File(...),
    modality: str = Form("auto"),
    use_otsu: bool = Form(False),
    use_deep_learning: bool = Form(False),
) -> Dict[str, Any]:
    """Full reconstruction pipeline for CT/MR/X-ray inputs.

    Accepts:
      - DICOM files (.dcm)
      - NIfTI files (.nii, .nii.gz)
      - ZIP archives containing DICOM series
      - Image files (.png, .jpg) for X-ray

    Returns JSON with:
      - glb_base64: Base64-encoded GLB mesh (multi-structure with colors)
      - verification: Mesh quality metrics
      - metadata: Patient/study metadata from DICOM headers
      - measurements: Clinical measurements (bone density, glenoid version, etc.)
      - structures: List of segmented structure names
      - modality: Detected imaging modality
    """
    from app.services.reconstruction_service import process_files_to_glb

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    try:
        result = process_files_to_glb(
            files,
            use_deep_learning=use_deep_learning,
            use_otsu=use_otsu,
        )

        glb_bytes = result["glb"]
        glb_base64 = base64.b64encode(glb_bytes).decode("utf-8")

        # Remove non-serializable verification fields
        verification = result.get("verification", {})
        if "preview_png" in verification:
            del verification["preview_png"]

        return {
            "glb_base64": glb_base64,
            "glb_size_bytes": len(glb_bytes),
            "verification": verification,
            "metadata": result.get("metadata", {}),
            "measurements": result.get("measurements", {}),
            "structures": result.get("structures", []),
            "modality": result.get("modality", "UNKNOWN"),
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reconstruction/{study_id}")
async def enqueue_reconstruction(study_id: int):
    """Enqueue a reconstruction task for the given study.
    Returns a Celery task ID that can be polled via /reconstruction/status/{task_id}.
    """
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
async def get_mesh(study_id: int, request: Request):
    """Return a public URL for the generated GLB mesh.
    The mesh is stored on disk under the uploads directory. This endpoint
    constructs a URL that the frontend can use to download the file.
    """
    from app.models.reconstruction import Reconstruction
    from app.db_sync import get_sync_session
    session = get_sync_session()
    recon = session.query(Reconstruction).filter(Reconstruction.study_id == study_id).first()
    if not recon or not recon.mesh_path:
        raise HTTPException(status_code=404, detail="Mesh not found")
    mesh_path = Path(recon.mesh_path)
    relative = mesh_path.relative_to(Path(os.getenv("UPLOAD_DIR", "/data/uploads")))
    mesh_url = str(request.base_url.join(f"uploads/{relative}"))
    return {"mesh_url": mesh_url}


@router.post("/reconstruction/run/{study_id}", summary="Run reconstruction and wait for result")
async def run_reconstruction(study_id: int, timeout: int = 30):
    """
    Trigger reconstruction task and wait for completion, returning mesh URL.
    """
    from app.tasks.reconstruction import run_reconstruction_task
    task = run_reconstruction_task.delay(study_id)
    try:
        result = task.get(timeout=timeout)
        if result.get("status") == "completed" and result.get("mesh_path"):
            return {"status": "completed", "mesh_path": result["mesh_path"]}
        else:
            raise HTTPException(status_code=500, detail="Reconstruction failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
