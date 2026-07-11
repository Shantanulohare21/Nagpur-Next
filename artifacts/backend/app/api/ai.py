from fastapi import APIRouter, HTTPException
from typing import Dict

router = APIRouter()

# Placeholder in‑memory task store
_tasks: Dict[str, Dict] = {}

@router.post("/segment/{study_id}")
async def queue_segmentation(study_id: int):
    task_id = f"seg-{study_id}"
    _tasks[task_id] = {"status": "queued", "type": "segmentation", "study_id": study_id}
    return {"task_id": task_id, "status": "queued"}

@router.post("/reconstruct/{study_id}")
async def queue_reconstruction(study_id: int):
    task_id = f"rec-{study_id}"
    _tasks[task_id] = {"status": "queued", "type": "reconstruction", "study_id": study_id}
    return {"task_id": task_id, "status": "queued"}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
