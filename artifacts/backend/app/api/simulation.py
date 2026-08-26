from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import math

router = APIRouter()

class ImplantParams(BaseModel):
    glenoid_version: float = Field(default=0.0, description="Glenoid retroversion/anteversion in degrees")
    glenoid_tilt: float = Field(default=0.0, description="Glenoid inclination tilt in degrees")
    glenoid_size: str = Field(default="29mm", description="Glenoid component size")
    humeral_head_size: str = Field(default="44mm", description="Humeral head component size")
    humeral_offset: float = Field(default=6.0, description="Posterior/lateral humeral offset in mm")
    stem_inclination: float = Field(default=135.0, description="Humeral stem inclination angle in degrees")
    retroversion_angle: float = Field(default=20.0, description="Humeral retroversion angle in degrees")

class KinematicsRequest(BaseModel):
    study_id: Optional[int] = None
    implant: ImplantParams = Field(default_factory=ImplantParams)

class KinematicsResponse(BaseModel):
    abduction_max: float
    flexion_max: float
    external_rotation_max: float
    internal_rotation_max: float
    impingement_detected: bool
    impingement_location: Optional[str] = None
    joint_stability_score: float
    poly_wear_risk_index: float

@router.post("/kinematics", response_model=KinematicsResponse, summary="Simulate shoulder joint kinematics & range of motion")
async def calculate_kinematics(req: KinematicsRequest):
    """
    Calculate biomechanical joint range of motion (ROM), impingement points, and stability scores
    based on specified implant geometry and orientation parameters.
    """
    p = req.implant
    
    # Biomechanical heuristic calculations based on glenoid tilt & version
    base_abduction = 140.0 - (p.glenoid_tilt * 1.5) + (p.humeral_offset * 1.2)
    base_flexion = 150.0 - (abs(p.glenoid_version) * 0.8)
    base_er = 45.0 + (p.retroversion_angle * 0.5) - (p.glenoid_version * 0.6)
    base_ir = 60.0 - (p.retroversion_angle * 0.4) + (p.glenoid_version * 0.5)
    
    # Bound values within realistic clinical constraints
    abduction = max(60.0, min(180.0, base_abduction))
    flexion = max(70.0, min(180.0, base_flexion))
    er = max(10.0, min(90.0, base_er))
    ir = max(15.0, min(90.0, base_ir))
    
    # Impingement detection heuristics
    impingement = False
    imp_location = None
    
    if p.glenoid_tilt > 10.0:
        impingement = True
        imp_location = "Superior acromial arch impingement"
    elif p.glenoid_version < -15.0:
        impingement = True
        imp_location = "Posterior glenoid rim impingement"
    elif p.humeral_offset < 2.0:
        impingement = True
        imp_location = "Medial bony impingement against scapular neck"
        
    stability = 95.0 - (abs(p.glenoid_version) * 1.1) - (abs(p.glenoid_tilt) * 1.4)
    stability = max(30.0, min(99.0, stability))
    
    wear_risk = 0.05 + (abs(p.glenoid_tilt) * 0.015) + (abs(p.glenoid_version) * 0.01)
    wear_risk = min(0.95, round(wear_risk, 3))
    
    return KinematicsResponse(
        abduction_max=round(abduction, 1),
        flexion_max=round(flexion, 1),
        external_rotation_max=round(er, 1),
        internal_rotation_max=round(ir, 1),
        impingement_detected=impingement,
        impingement_location=imp_location,
        joint_stability_score=round(stability, 1),
        poly_wear_risk_index=wear_risk
    )

@router.post("/implant-fit", summary="Evaluate implant sizing and bone contact surface area")
async def evaluate_implant_fit(req: KinematicsRequest):
    """
    Evaluate glenoid vault seating, bone contact coverage percentage, and cortical wall thickness.
    """
    p = req.implant
    
    # Fit calculation heuristics
    coverage_pct = 88.5 + (p.humeral_offset * 0.8) - (abs(p.glenoid_version) * 0.5)
    coverage_pct = max(50.0, min(99.5, round(coverage_pct, 1)))
    
    vault_penetration = False
    if abs(p.glenoid_version) > 18.0 or p.glenoid_tilt > 12.0:
        vault_penetration = True
        
    return {
        "study_id": req.study_id,
        "glenoid_vault_coverage_pct": coverage_pct,
        "cortical_vault_perforation_risk": vault_penetration,
        "recommended_augment": "10-degree step wedge" if abs(p.glenoid_version) > 12.0 else "None",
        "screw_trajectories_safe": not vault_penetration,
        "bone_stock_preservation_score": round(100 - (abs(p.glenoid_tilt) * 2.5), 1)
    }
