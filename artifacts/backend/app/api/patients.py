from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

# In‑memory placeholder store
_patients = []

@router.get("/", response_model=List[dict])
def list_patients():
    return _patients

@router.post("/", response_model=dict)
def create_patient(patient: dict):
    _patients.append(patient)
    return patient

@router.get("/{patient_id}", response_model=dict)
def get_patient(patient_id: int):
    for p in _patients:
        if p.get("id") == patient_id:
            return p
    raise HTTPException(status_code=404, detail="Patient not found")
