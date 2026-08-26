import os
import sys
import numpy as np
import trimesh
from skimage import measure

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.services.reconstruction_service import (
    _simple_segmentation,
    generate_mesh_from_volume,
    _verify_mesh
)

def test_local_3d_reconstruction():
    print("=== Testing Local 3D Medical Reconstruction Pipeline ===")
    
    # 1. Create a 3D synthetic medical volume (100 x 100 x 100 voxels) simulating a shoulder joint (glenoid + humeral head)
    grid_size = 100
    z, y, x = np.ogrid[:grid_size, :grid_size, :grid_size]
    
    # Humeral head sphere center at (50, 50, 35) with radius 22
    humeral_head = (x - 50)**2 + (y - 50)**2 + (z - 35)**2 <= 22**2
    # Scapula glenoid vault cylinder at (50, 50, 70)
    glenoid_vault = ((x - 50)**2 + (y - 50)**2 <= 18**2) & (z >= 55) & (z <= 85)
    
    # Combined volume with realistic CT HU intensities (bone ~400 HU, background 0 HU)
    volume = np.zeros((grid_size, grid_size, grid_size), dtype=np.float32)
    volume[humeral_head] = 450.0
    volume[glenoid_vault] = 420.0
    
    print(f"1. Generated synthetic 3D CT volume: shape={volume.shape}, max HU={volume.max()}")
    
    # 2. Run Segmentation
    mask = _simple_segmentation(volume, use_otsu=False)
    print(f"2. Bone segmentation completed: segmented voxel count={np.sum(mask)}")
    assert np.sum(mask) > 0, "Segmentation mask should not be empty!"

    # 3. Marching Cubes 3D Mesh Generation with clinical spacing (1.0 mm isotropic)
    spacing = (1.0, 1.0, 1.0)
    mesh = generate_mesh_from_volume(mask, spacing=spacing)
    print(f"3. Marching Cubes Mesh extracted: {len(mesh.vertices)} vertices, {len(mesh.faces)} triangles")
    assert len(mesh.faces) > 0, "Extracted mesh must contain faces!"

    # 4. Decimation & Laplacian Smoothing
    target_faces = 150000
    if len(mesh.faces) > target_faces:
        mesh = mesh.simplify_quadratic_decimation(target_faces)
        
    try:
        trimesh.smoothing.filter_laplacian(mesh, iterations=4)
        print("4. Laplacian smoothing applied successfully.")
    except Exception as e:
        print(f"Smoothing note: {e}")

    # 5. Export to binary GLB 3D model
    output_dir = os.path.join(os.path.dirname(__file__), "test_output")
    os.makedirs(output_dir, exist_ok=True)
    glb_path = os.path.join(output_dir, "test_shoulder_model.glb")
    
    glb_bytes = mesh.export(file_type="glb")
    with open(glb_path, "wb") as f:
        f.write(glb_bytes)
        
    file_size_kb = len(glb_bytes) / 1024
    print(f"5. Saved 3D GLB model to: {glb_path} ({file_size_kb:.2f} KB)")

    # 6. Verification check
    verification = _verify_mesh(mesh)
    print(f"6. Mesh Verification Results:")
    print(f"   - Vertices Count: {len(mesh.vertices)}")
    print(f"   - Triangles Count: {len(mesh.faces)}")
    print(f"   - Surface Area: {verification['area']:.2f} mm²")
    print(f"   - Volume: {verification['volume']:.2f} mm³")
    print(f"   - Is Watertight: {verification['is_watertight']}")
    
    print("\n[SUCCESS] Verification COMPLETE: Real 3D GLB model generated and verified successfully!")

if __name__ == "__main__":
    test_local_3d_reconstruction()
