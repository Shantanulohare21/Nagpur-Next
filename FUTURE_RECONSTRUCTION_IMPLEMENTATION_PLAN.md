# ShoulderSim AI – Future Implementation and Continuation Plan

This document is the handoff/continuation guide for the current project. It is written for the next engineer or owner to continue the real upload-to-3D shoulder biomechanical reconstruction platform instead of restarting from zero.

## 1. Product Goal

Build a real medical imaging and simulation workflow for shoulder surgery planning.

The system should do these things:

- Accept patient scan image files such as CT, MRI, DICOM, and uploaded image sets.
- Analyze them with anatomical and biomechanical logic.
- Produce a patient-specific, real 3D shoulder model surface or reconstruction response.
- Convert the scanned/segmented representation into a GLB-like binary mesh contract for the frontend viewer.
- Show a 3D shoulder anatomy visualization inside the web app.
- Generate measurement summaries, implant planning, risk notes, and simulation output.

The important medical requirement is that the model must be generated from real uploaded data and real reconstruction logic, not fake drawing-only UI geometry.

## 2. Current Working State

The repository already has the high-level structure for a real implementation:

- A React/Vite frontend lives in the `shouldersim-ai` package.
- An API server exists in the `api-server` package.
- A Python/FastAPI reconstruction backend exists under the `backend` package.
- Upload analysis and direct reconstruction routes are already declared.
- The UI is already prepared to receive a 3D mesh response and write it into patient state.

## 3. What Is Already Completed

The following artifacts are present in the repository and should be treated as the baseline:

### Frontend

- The UI has pages for patient, scan intake, shoulder anatomy, implant options, simulation, and reporting.
- The UI can present scan analysis results.
- The UI can receive mesh payloads and overlay them into the patient state.
- The viewer receives a mesh URL or GLB payload point.

### API Layer

- The API server has a scan analysis endpoint that accepts files.
- The scan route can call the Python reconstruction route.
- The reconstruction response contract includes: `glb_base64`, `metadata`, `measurements`, `structures`, and `modality`.
- The UI-side TypeScript contract is aligned to a possible `meshUrl` response branch.

### Python Backend

- A reconstruction API contract exists in the backend.
- A Python service layer is planned for segmentation + mesh generation.
- The `POST /reconstruction/generate` endpoint is intended to accept files, run segmentation, and return a GLB base64 payload.

## 4. What Is Still Not Proven

This is the critical area:

The backend scientific Python stack is not currently proven in the selected runtime environment. The repository currently carries a backend dependency stack that has compatibility issues with the installed Python runtime. Most of the scientific pipeline packages need a supported environment, not just a normal web runtime install.

The following issues are known:

- The selected Python runtime is the 3.14 family, which does not suit the backend scientific package pins.
- Packages such as `torch`, `scikit-image`, `SimpleITK`, and imaging support libraries need compatible interpreter and wheel availability.
- The backend rebuild/install path was blocked by missing native build support and package compatibility warnings.

The frontend and API server build can compile, but the actual medical imaging reconstruction pipeline is not runtime-validated.

## 5. Hard Runtime Requirements

To make the platform proper and real, the following are mandatory:

### Required runtime stack

Use one Python interpreter version that is compatible with the reconstruction dependency chain.

Recommended:

- Python 3.11.x

Reason:

- The medical imaging stack is more likely to resolve on CPython 3.11 than on 3.14.
- The PyPI and binary libraries available for this stack are more stable on 3.11.

### Required build tools

- A working compiler stack for native wheel builds.
- On Windows, a compatible C/C++ toolchain or Visual Studio build tools should be installed.
- `pip` should be used from the selected interpreter, not from an unrelated runtime.

## 6. Future Implementation Sequence

The next work should proceed in the following order.

### Step 1 – Stabilize the backend Python interpreter

Create a correct environment for the backend:

- Select Python 3.11 as the active backend runtime.
- Confirm by command:

  `py -3.11 -V`

- Confirm pip uses that interpreter:

  `py -3.11 -m pip --version`

- Create or point to a virtual environment for the backend.

Example command:

  `py -3.11 -m venv .venv`

Activate it:

  `.venv\Scripts\activate`

### Step 2 – Install Python requirements inside the backend environment

Install from the backend requirements file using the correct interpreter:

  `python -m pip install --upgrade pip setuptools wheel`

  `python -m pip install -r artifacts/backend/requirements.txt`

Important: If requirements fail, fix them deliberately. Do not keep moving the code around. The root cause is package resolution and ABI compatibility.

Expected package categories:

- FastAPI / Uvicorn
- Pydantic
- SQLAlchemy
- Numpy
- Pillow / image processing utilities
- Scikit-image
- SimpleITK
- Trimesh
- Open3D or a mesh-oriented library if in use
- Optional Tensor or PyTorch-based support if needed for segmentation

### Step 3 – Prove the reconstruction service imports

Once installation is successful:

- Start a Python shell and import the implementation modules.
- Check that `reconstruction_service.py` can import.
- Check that the `reconstruction.py` endpoint file can be imported.
- Confirm the app can start up without failing on service import.

Example commands:

  `python -c "import app.api.reconstruction"`

  `python -c "from app.services.reconstruction_service import process_files_to_glb"`

### Step 4 – Start the API service locally

Run the backend host in a way that exposes the reconstruction endpoint.

The expected host is likely:

- `http://127.0.0.1:8000`

Start using the real backend launcher or uvicorn command:

  `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

From inside the backend service directory.

### Step 5 – Validate a real upload round-trip

Use a real image file or DICOM sample, or else a CT/MRI slice set.

The API endpoint contract expected:

- `POST /reconstruction/generate`
- multipart file upload
- optional `use_otsu` parameter
- optional modality / processing options

Expected response shape:

- `glb_base64`
- `metadata`
- `measurements`
- `structures`
- `modality`

The response must be proof that a real GLB mesh can be created from the patient upload.

### Step 6 – Confirm frontend mesh handoff

The frontend page should call the reconstruction endpoint and then persist the returned mesh response into patient context.

Relevant code path:

- Scan analysis UI page calls reconstruction route directly.
- `setReconstruction` stores the returned mesh data.
- `setAnalysis` updates the current analysis result with `meshUrl`.

The viewer should load the returned mesh as a binary GLB data URL or object URL.

### Step 7 – Render the mesh viewer

Once the GLB payload is returned and placed in state, it must be consumed by the viewer component and be displayed in the 3D viewer panel.

The current viewer code should be treated as a contract boundary and should be extended to handle:

- Data URL mesh input
- `meshUrl` from patient state
- real GLB binary payloads
- measurement overlays

### Step 8 – Medical quality checks

After the visualization path is working, add real quality and safety checks:

- Check that uploaded ROI/structure orientation is consistent.
- Validate anatomical landmark extraction.
- Merge structure-level measurements into a medical report.
- Reject malformed uploads before reconstruction begins.

### Step 9 – Simulation calling path

After reconstruction and viewer evidence is stable, the UI should call the simulation engine to compute planning recommendations:

- implant type recommendations
- stress distribution reasoning
- outcome scenarios
- risk/opportunity output

### Step 10 – Product and UX polish

After the pipeline is real, work on user experience:

- Better scan upload state
- Better upload progress indicators
- File-type validation
- Patient context editing and embedded outcomes
- Case history and report export

## 7. Reliable Implementation Commands

The repository is a pnpm monorepo. Use these commands as the build reference:

### Install workspace packages

  `pnpm install`

### Typecheck API server

  `pnpm --filter @workspace/api-server run typecheck`

### Build frontend

  `pnpm --filter @workspace/shouldersim-ai run build`

### Backend service

  `uvicorn app.main:app --reload`

Or from whichever backend service entry point is current.

## 8. Main Files to Track

The following files are the major anchors for the current work:

- The frontend patient/workflow page: `shouldersim-ai/src/pages/ScanAnalysisPage.tsx`
- The patient state context: `shouldersim-ai/src/contexts/PatientContext.tsx`
- The 3D viewer: `shouldersim-ai/src/components/ShoulderAnatomyViewer.tsx`
- API scan route: `artifacts/api-server/src/routes/scan.ts`
- Reconstruction Python endpoint: `artifacts/backend/app/api/reconstruction.py`
- Reconstruction service layer: `artifacts/backend/app/services/reconstruction_service.py`
- Backend dependencies: `artifacts/backend/requirements.txt`

## 9. Required Evidence Before Claiming Completion

The implementation is not complete until each of the following has been observed:

- The backend can import and run under a supported Python runtime.
- A real image upload reaches `/reconstruction/generate`.
- The endpoint responds with a GLB payload and metadata.
- The GLB payload is stored in frontend patient state.
- The frontend viewer renders or resolves the mesh data.
- Simulation and analysis surfaces update from real response data instead of placeholders.

## 10. Recommended Final Completion Target

The final product should be a platform that supports:

- Patient upload and identity
- Upload-based shoulder anatomy extraction
- Patient-specific 3D GLB reconstruction
- Implant recommendation surface
- Visualization across the anatomy, glenoid, humeral head, and implant context
- Report generation and case storage

This is a real clinical workflow, not a static mockup.

## 11. Recommended Next Immediate Action

Create a Python 3.11 backend environment, repair dependency compatibility, install the backend stack into that environment, and then run the reconstruction API locally. Once that is stable, the patient upload-to-3D real model pipeline can be validated with direct evidence.
