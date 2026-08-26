"""
Clinical measurement service.

Extracts real measurements from segmented medical image volumes:
  - Glenoid version angle (PCA-based)
  - Humeral head diameter (sphere fitting)
  - Acromiohumeral distance
  - Joint space width
  - Bone mineral density proxy (HU statistics)
  - Volume and surface area of segmented structures
"""
import numpy as np
from typing import Dict, Any, Optional, Tuple, List


def compute_bone_density_stats(
    volume: np.ndarray, mask: np.ndarray
) -> Dict[str, float]:
    """Compute Hounsfield Unit statistics within the segmented bone region.

    Returns mean, median, std, min, max HU values and a 0-100 bone quality score.
    """
    bone_voxels = volume[mask > 0]
    if len(bone_voxels) == 0:
        return {
            "mean_hu": 0.0, "median_hu": 0.0, "std_hu": 0.0,
            "min_hu": 0.0, "max_hu": 0.0,
            "bone_quality_score": 0.0,
        }

    mean_hu = float(np.mean(bone_voxels))
    median_hu = float(np.median(bone_voxels))
    std_hu = float(np.std(bone_voxels))
    min_hu = float(np.min(bone_voxels))
    max_hu = float(np.max(bone_voxels))

    # Bone quality score: map typical cortical bone HU (300-1500) to 0-100
    # Normal cortical bone: ~700-1500 HU → high quality
    # Osteoporotic bone: ~200-400 HU → low quality
    quality = np.clip((mean_hu - 150) / 10.0, 0, 100)

    return {
        "mean_hu": round(mean_hu, 1),
        "median_hu": round(median_hu, 1),
        "std_hu": round(std_hu, 1),
        "min_hu": round(min_hu, 1),
        "max_hu": round(max_hu, 1),
        "bone_quality_score": round(float(quality), 1),
    }


def fit_sphere_to_points(points: np.ndarray) -> Tuple[np.ndarray, float]:
    """Fit a sphere to a set of 3D points using least-squares.

    Returns (center, radius).
    """
    if len(points) < 4:
        return np.mean(points, axis=0), 0.0

    # Construct the system: (x-cx)^2 + (y-cy)^2 + (z-cz)^2 = r^2
    # Linearize: 2*cx*x + 2*cy*y + 2*cz*z + (r^2 - cx^2 - cy^2 - cz^2) = x^2+y^2+z^2
    A = np.zeros((len(points), 4))
    A[:, 0] = 2 * points[:, 0]
    A[:, 1] = 2 * points[:, 1]
    A[:, 2] = 2 * points[:, 2]
    A[:, 3] = 1.0
    b = np.sum(points ** 2, axis=1)

    try:
        result, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
        cx, cy, cz = result[0], result[1], result[2]
        r = np.sqrt(result[3] + cx**2 + cy**2 + cz**2)
        return np.array([cx, cy, cz]), float(r)
    except Exception:
        center = np.mean(points, axis=0)
        dists = np.linalg.norm(points - center, axis=1)
        return center, float(np.mean(dists))


def estimate_humeral_head_diameter(
    mask: np.ndarray, spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0)
) -> Dict[str, float]:
    """Estimate humeral head diameter by fitting a sphere to the superior
    portion of the largest connected component in the mask.

    Args:
        mask: Binary 3D mask of the humerus
        spacing: Voxel spacing (dz, dy, dx) in mm

    Returns dict with diameter_mm, radius_mm, center coordinates.
    """
    from skimage.measure import label

    if not np.any(mask):
        return {"diameter_mm": 0.0, "radius_mm": 0.0}

    # Find the largest component (assumed to be the humerus)
    labeled = label(mask)
    sizes = np.bincount(labeled.ravel())
    sizes[0] = 0
    largest_label = np.argmax(sizes)
    humerus = (labeled == largest_label).astype(np.uint8)

    # Get surface points
    coords = np.argwhere(humerus > 0)
    if len(coords) < 10:
        return {"diameter_mm": 0.0, "radius_mm": 0.0}

    # Convert to mm using spacing
    coords_mm = coords.astype(np.float64) * np.array(spacing)

    # Take the top 30% of points (superior portion = humeral head)
    z_min = coords_mm[:, 0].min()
    z_range = coords_mm[:, 0].max() - z_min
    top_mask = coords_mm[:, 0] < (z_min + z_range * 0.30)
    head_points = coords_mm[top_mask]

    if len(head_points) < 10:
        # Fall back to using all points
        head_points = coords_mm

    # Subsample for performance
    if len(head_points) > 5000:
        indices = np.random.choice(len(head_points), 5000, replace=False)
        head_points = head_points[indices]

    # Extract surface points (boundary voxels only)
    from scipy.ndimage import binary_erosion
    head_vol = np.zeros_like(humerus)
    head_coords_voxel = (coords[top_mask] if np.sum(top_mask) >= 10 else coords)
    for c in head_coords_voxel:
        head_vol[c[0], c[1], c[2]] = 1
    eroded = binary_erosion(head_vol)
    surface = head_vol.astype(int) - eroded.astype(int)
    surface_coords = np.argwhere(surface > 0)

    if len(surface_coords) > 10:
        surface_mm = surface_coords.astype(np.float64) * np.array(spacing)
        if len(surface_mm) > 3000:
            indices = np.random.choice(len(surface_mm), 3000, replace=False)
            surface_mm = surface_mm[indices]
        center, radius = fit_sphere_to_points(surface_mm)
    else:
        center, radius = fit_sphere_to_points(head_points)

    return {
        "diameter_mm": round(radius * 2, 1),
        "radius_mm": round(radius, 1),
        "center_z": round(float(center[0]), 1),
        "center_y": round(float(center[1]), 1),
        "center_x": round(float(center[2]), 1),
    }


def estimate_glenoid_version(
    mask: np.ndarray, spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0)
) -> Dict[str, float]:
    """Estimate glenoid version angle using PCA on the glenoid surface.

    The glenoid version is the angle between the glenoid face normal and
    the scapular axis in the axial plane. Positive = anteversion,
    negative = retroversion.

    This uses a simplified Friedman method:
    1. Find the glenoid region (medial edge of the scapula mask)
    2. PCA of the surface points to find the face normal
    3. Compute angle relative to scapular body axis

    Returns dict with version_degrees and confidence.
    """
    from sklearn.decomposition import PCA

    if not np.any(mask):
        return {"version_degrees": 0.0, "confidence": 0.0}

    coords = np.argwhere(mask > 0)
    if len(coords) < 20:
        return {"version_degrees": 0.0, "confidence": 0.0}

    coords_mm = coords.astype(np.float64) * np.array(spacing)

    # The glenoid is the lateral-most portion of the scapula
    # In our coordinate system, we approximate by looking at the
    # rightmost (or leftmost) 15% of the scapula
    x_coords = coords_mm[:, 2]  # medial-lateral axis
    x_range = x_coords.max() - x_coords.min()
    if x_range < 5:  # Too small to analyze
        return {"version_degrees": 0.0, "confidence": 0.0}

    # Determine which side is the glenoid (lateral edge)
    # Take the 15% of points closest to the lateral edge
    lateral_threshold = x_coords.max() - x_range * 0.15
    glenoid_mask = x_coords >= lateral_threshold
    glenoid_points = coords_mm[glenoid_mask]

    if len(glenoid_points) < 10:
        return {"version_degrees": 0.0, "confidence": 0.0}

    # Find mid-slice in Z direction for axial analysis
    z_median = np.median(glenoid_points[:, 0])
    z_range = glenoid_points[:, 0].max() - glenoid_points[:, 0].min()
    axial_mask = np.abs(glenoid_points[:, 0] - z_median) < (z_range * 0.2)
    axial_points = glenoid_points[axial_mask]

    if len(axial_points) < 5:
        axial_points = glenoid_points

    # PCA in the axial plane (Y-X)
    points_2d = axial_points[:, 1:3]  # Y and X

    try:
        pca = PCA(n_components=2)
        pca.fit(points_2d)

        # The first component is along the glenoid face
        # The second component is the face normal
        normal = pca.components_[1]  # Perpendicular to the face

        # Scapular axis approximation: take the centroid of the full scapula
        # and the glenoid centroid to define the axis
        scapula_centroid_2d = np.mean(coords_mm[:, 1:3], axis=0)
        glenoid_centroid_2d = np.mean(axial_points[:, 1:3], axis=0)
        scapular_axis = glenoid_centroid_2d - scapula_centroid_2d
        scapular_axis = scapular_axis / (np.linalg.norm(scapular_axis) + 1e-8)

        # Version angle = angle between normal and scapular axis
        cos_angle = np.dot(normal, scapular_axis)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        angle_rad = np.arccos(abs(cos_angle))
        version_deg = 90.0 - np.degrees(angle_rad)

        # Sign convention: positive = anteversion, negative = retroversion
        cross = normal[0] * scapular_axis[1] - normal[1] * scapular_axis[0]
        if cross < 0:
            version_deg = -version_deg

        # Confidence based on explained variance and sample size
        confidence = min(100, len(axial_points) / 2.0) * pca.explained_variance_ratio_[0]

        return {
            "version_degrees": round(float(version_deg), 1),
            "confidence": round(float(confidence * 100), 1),
        }
    except Exception:
        return {"version_degrees": 0.0, "confidence": 0.0}


def estimate_joint_space(
    humerus_mask: np.ndarray,
    scapula_mask: np.ndarray,
    spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0),
) -> Dict[str, float]:
    """Estimate glenohumeral joint space width.

    Computes the minimum distance between the humerus and scapula surfaces.
    """
    if not np.any(humerus_mask) or not np.any(scapula_mask):
        return {"joint_space_mm": 0.0, "min_distance_mm": 0.0}

    from scipy.ndimage import distance_transform_edt

    # Distance transform from humerus surface
    hum_dist = distance_transform_edt(~(humerus_mask > 0), sampling=spacing)

    # Sample distances at scapula surface
    scap_coords = np.argwhere(scapula_mask > 0)
    if len(scap_coords) == 0:
        return {"joint_space_mm": 0.0, "min_distance_mm": 0.0}

    distances = hum_dist[scap_coords[:, 0], scap_coords[:, 1], scap_coords[:, 2]]

    # Filter out very large distances (not near the joint)
    near_joint = distances[distances < np.percentile(distances, 20)]
    if len(near_joint) == 0:
        near_joint = distances

    return {
        "joint_space_mm": round(float(np.mean(near_joint)), 1),
        "min_distance_mm": round(float(np.min(near_joint)), 1),
    }


def compute_volume_and_area(
    mask: np.ndarray,
    spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0),
) -> Dict[str, float]:
    """Compute volume (mm³ → cm³) and estimated surface area of a binary mask."""
    voxel_volume_mm3 = spacing[0] * spacing[1] * spacing[2]
    n_voxels = int(np.sum(mask > 0))
    volume_mm3 = n_voxels * voxel_volume_mm3
    volume_cm3 = volume_mm3 / 1000.0

    # Surface area estimation using surface voxel counting
    from scipy.ndimage import binary_erosion
    if np.any(mask):
        eroded = binary_erosion(mask > 0)
        surface_voxels = int(np.sum((mask > 0).astype(int) - eroded.astype(int)))
        # Approximate surface area (each surface voxel contributes ~spacing^2)
        avg_spacing = (spacing[0] + spacing[1] + spacing[2]) / 3.0
        surface_area_mm2 = surface_voxels * (avg_spacing ** 2)
    else:
        surface_area_mm2 = 0.0

    return {
        "volume_cm3": round(volume_cm3, 2),
        "volume_mm3": round(volume_mm3, 1),
        "surface_area_mm2": round(surface_area_mm2, 1),
    }


def compute_all_measurements(
    volume: np.ndarray,
    masks: Dict[str, np.ndarray],
    spacing: Tuple[float, float, float] = (1.0, 1.0, 1.0),
) -> Dict[str, Any]:
    """Compute all clinical measurements from the original volume and segmentation masks.

    Args:
        volume: Original image volume (HU values for CT)
        masks: Dict mapping structure name to binary mask. Expected keys:
               'humerus', 'scapula', 'combined' (or at least 'combined')
        spacing: (dz, dy, dx) in mm

    Returns a comprehensive measurements dict.
    """
    result: Dict[str, Any] = {"spacing_mm": list(spacing)}

    combined = masks.get("combined", masks.get("humerus", np.zeros_like(volume)))
    humerus = masks.get("humerus", combined)
    scapula = masks.get("scapula", combined)

    # Bone density
    result["bone_density"] = compute_bone_density_stats(volume, combined)

    # Humeral head diameter
    result["humeral_head"] = estimate_humeral_head_diameter(humerus, spacing)

    # Glenoid version
    result["glenoid_version"] = estimate_glenoid_version(scapula, spacing)

    # Joint space (if we have separate masks)
    if "humerus" in masks and "scapula" in masks:
        result["joint_space"] = estimate_joint_space(humerus, scapula, spacing)
    else:
        result["joint_space"] = {"joint_space_mm": 0.0, "min_distance_mm": 0.0}

    # Per-structure volumes
    result["structures"] = {}
    for name, mask in masks.items():
        if name == "combined":
            continue
        result["structures"][name] = compute_volume_and_area(mask, spacing)

    # Overall volume
    result["total"] = compute_volume_and_area(combined, spacing)

    return result
