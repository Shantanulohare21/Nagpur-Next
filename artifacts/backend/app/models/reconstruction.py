from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base

class Reconstruction(Base):
    __tablename__ = "reconstructions"

    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=False)
    status = Column(String, nullable=False, default="queued")  # queued, processing, completed, failed
    mesh_path = Column(String, nullable=True)  # absolute or relative path to GLB file
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    study = relationship("Study", backref="reconstructions")

    def __repr__(self) -> str:
        return f"<Reconstruction {self.id} study={self.study_id} status={self.status}>"
