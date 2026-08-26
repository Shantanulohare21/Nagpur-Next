from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Study(Base):
    __tablename__ = "studies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="studies")
    reconstructions = relationship("Reconstruction", back_populates="study")
