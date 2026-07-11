from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter()

# In‑memory placeholder store for studies
_studies: List[Dict] = []

@router.get("/", response_model=List[Dict])
def list_studies():
    return _studies

@router.post("/", response_model=Dict)
def create_study(study: Dict):
    _studies.append(study)
    return study

@router.get("/{study_id}", response_model=Dict)
def get_study(study_id: int):
    for s in _studies:
        if s.get("id") == study_id:
            return s
    raise HTTPException(status_code=404, detail="Study not found")
