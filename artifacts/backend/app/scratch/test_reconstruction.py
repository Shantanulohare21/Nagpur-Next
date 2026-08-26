import os, sys, io
import numpy as np
from fastapi import UploadFile
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.reconstruction_service import process_files_to_glb
def create_png_bytes(width=64, height=64):
    from PIL import Image
    img = Image.fromarray(np.random.randint(0, 256, (height, width), dtype=np.uint8))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

def create_dicom_bytes(shape=(64, 64), is_multi_frame=False):
    import pydicom
    from pydicom.dataset import Dataset, FileMetaDataset
    ds = Dataset()
    ds.file_meta = FileMetaDataset()
    ds.is_little_endian = True
    ds.is_implicit_VR = True
    ds.SOPClassUID = pydicom.uid.generate_uid()
    ds.SOPInstanceUID = pydicom.uid.generate_uid()
    ds.PatientName = "Test^Patient"
    ds.PatientID = "12345"
    ds.Modality = "CT"
    ds.Rows, ds.Columns = shape
    if is_multi_frame:
        # multi-frame DICOM: store pixel data as (num_frames, rows, cols)
        num_frames = 2
        pixel_array = np.random.randint(0, 256, (num_frames, *shape), dtype=np.uint16)
        ds.NumberOfFrames = str(num_frames)
        ds.PixelData = pixel_array.tobytes()
    else:
        pixel_array = np.random.randint(0, 256, shape, dtype=np.uint16)
        ds.PixelData = pixel_array.tobytes()
    ds.BitsAllocated = 16
    ds.BitsStored = 12
    ds.HighBit = 11
    ds.PixelRepresentation = 0
    buf = io.BytesIO()
    pydicom.filewriter.dcmwrite(buf, ds)
    return buf.getvalue()

def test_with_files(file_bytes_list, filenames):
    upload_files = []
    for content, name in zip(file_bytes_list, filenames):
        file_like = io.BytesIO(content)
        upload = UploadFile(filename=name, file=file_like)
        upload_files.append(upload)
    result = process_files_to_glb(upload_files, use_otsu=True)
    print("Verification:")
    for k, v in result['verification'].items():
        if k == 'preview_png':
            print(f"{k}: {len(v)} bytes")
        else:
            print(f"{k}: {v}")
    print("Metadata:", result.get('metadata'))
    print("GLB size:", len(result['glb']))

if __name__ == '__main__':
    # Test PNG (single slice)
    print('--- Testing PNG ---')
    png_bytes = create_png_bytes()
    test_with_files([png_bytes], ['slice1.png'])
    # Test single-frame DICOM (X-ray)
    print('--- Testing single-frame DICOM ---')
    dcm_bytes = create_dicom_bytes(is_multi_frame=False)
    test_with_files([dcm_bytes], ['xray.dcm'])
    # Test multi-frame DICOM (CT series)
    print('--- Testing multi-frame DICOM series (2 frames) ---')
    dcm_series_bytes = create_dicom_bytes(is_multi_frame=True)
    test_with_files([dcm_series_bytes], ['ct_series.dcm'])
