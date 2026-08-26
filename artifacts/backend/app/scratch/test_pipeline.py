import os
import numpy as np
import SimpleITK as sitk
from fastapi import UploadFile
from io import BytesIO

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.services.reconstruction_service import process_files_to_glb

def create_synthetic_shoulder_nifti(filepath: str):
    print("Generating synthetic shoulder NIfTI...")
    # Create a 64x64x64 volume
    volume = np.zeros((64, 64, 64), dtype=np.float32)
    
    # Simulate Scapula / Glenoid (Box-ish shape with a cup)
    volume[20:44, 20:44, 10:25] = 400.0  # HU value for bone
    
    # Simulate Humerus (Sphere)
    z, y, x = np.ogrid[0:64, 0:64, 0:64]
    mask = ((x - 32)**2 + (y - 32)**2 + (z - 45)**2) <= 12**2
    volume[mask] = 300.0  # HU value for bone
    
    # Add some noise
    noise = np.random.normal(0, 20, volume.shape)
    volume += noise
    
    # Convert to SimpleITK image
    img = sitk.GetImageFromArray(volume)
    img.SetSpacing((2.0, 2.0, 2.0))
    
    sitk.WriteImage(img, filepath)
    print(f"Saved synthetic volume to {filepath}")


class MockUploadFile:
    def __init__(self, filename, file_obj):
        self.filename = filename
        self.file = file_obj

def test_pipeline():
    test_file = "test_shoulder.nii.gz"
    create_synthetic_shoulder_nifti(test_file)
    
    print("\nRunning reconstruction pipeline...")
    with open(test_file, "rb") as f:
        content = f.read()
    
    mock_upload = MockUploadFile(filename=test_file, file_obj=BytesIO(content))
    
    try:
        result = process_files_to_glb(
            files=[mock_upload],
            use_deep_learning=False,
            use_otsu=False
        )
        print("Pipeline succeeded!")
        print(f"Modality detected: {result['modality']}")
        print(f"Structures found: {result['structures']}")
        print(f"Measurements: {result['measurements']}")
        print(f"GLB size: {len(result['glb'])} bytes")
        
        # Save output GLB
        out_glb = "test_output.glb"
        with open(out_glb, "wb") as f:
            f.write(result['glb'])
        print(f"Saved GLB to {out_glb}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    test_pipeline()
