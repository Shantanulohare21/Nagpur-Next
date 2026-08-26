from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Patient
from app.schemas.patient import PatientCreate, PatientRead
from app.dependencies import get_db

router = APIRouter()

@router.get("/", response_model=List[PatientRead])
async def list_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    return patients

@router.post("/", response_model=PatientRead)
async def create_patient(payload: PatientCreate, db: AsyncSession = Depends(get_db)):
    patient = Patient(name=payload.name, date_of_birth=payload.date_of_birth)
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
