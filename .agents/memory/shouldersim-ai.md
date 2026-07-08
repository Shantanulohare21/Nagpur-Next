---
name: ShoulderSIM AI Platform
description: Key architectural decisions and quirks for the shouldersim-ai artifact.
---

## Patient Data Flow
- PatientContext (`src/contexts/PatientContext.tsx`) stores all state in localStorage under key `ssim_patient`.
- Flow: `/intake` → `/scan-analysis` → `/simulation` → `/reports`
- `generateAnalysis(info, clinical)` in PatientContext derives AI findings deterministically from patient inputs — no backend needed.
- ScanAnalysisPage redirects to `/intake` if no patient data is loaded; its route is `/scan-analysis` (NOT `/analysis`).

## PDF Report Generation
- jsPDF is installed as a dependency in `artifacts/shouldersim-ai`.
- `src/lib/reportGenerator.ts` exports `generatePDFReport`, `generateJSONReport`, `generateCSVReport`.
- ReportsPage uses patient context data when available; falls back to static demo data for legacy report items.

## WebGL / Three.js — CRITICAL ENVIRONMENT CONSTRAINT
- **WebGL does NOT work in Replit preview.** React error boundaries only catch JS errors, not WebGL context loss (which is a browser-level event).
- **Fix:** Detect WebGL support proactively with `useMemo(() => !!canvas.getContext('webgl'))` before rendering the Canvas. Show `ShoulderAnatomyViewer` (canvas-2D) when WebGL is unavailable.
- `runtimeErrorOverlay` plugin was removed from vite.config.ts to suppress GPU-unavailable errors.

## ShoulderAnatomyViewer — Canvas-2D Fallback
- File: `src/components/ShoulderAnatomyViewer.tsx`
- Full canvas-2D anatomical shoulder viewer with 3 views: AP X-Ray, Axial CT, Lateral
- Props: `analysis?: AnalysisResult | null`, `scanImage?: string`, `scanModality?`, `showImplant?`, `height?`, `className?`
- Shows uploaded scan image with DICOM-style overlay when `scanImage` is provided
- Interactive drag-to-rotate, implant visualization (TSA/RSA/hemi), measurement badges
- Used in: (1) SimulationPage — shown when `!webglAvailable`, (2) ScanAnalysisPage overview tab, (3) WebGLErrorBoundary fallback

## Real Scan Upload (FileReader)
- `PatientIntakePage.tsx`: `addFiles` uses `FileReader.readAsDataURL()` — stores actual image bytes as `dataUrl` and `previewUrl` on `ScanFile`.
- Image files get thumbnail previews in the upload list with "✓ Image data read — ready for AI analysis" badge.
- `ScanFile` interface in PatientContext has `dataUrl?: string` and `previewUrl?: string` fields.

## API Server — AI Scan Analysis Endpoint
- File: `artifacts/api-server/src/routes/scan.ts`
- POST `/api/scan/analyze` — accepts `{ imageDataUrl, modality, patientAge, patientSex, diagnosis }`
- Uses Anthropic Vision API (`claude-opus-4-5`) to extract biomechanical measurements from scan images
- Returns structured JSON: boneQuality, glenoVersion, humeralOffset, flexion, ROM, riskLevel, recommendedImplant, pathologies, etc.
- Falls back gracefully when `ANTHROPIC_API_KEY` is not set (returns `reason: "no_api_key"`)
- API server runs on port 8080; accessible from frontend via Replit proxy at `/api-server/api/scan/analyze`

## SimulationPage — Import Order Quirk
- `WebGLErrorBoundary` class is defined very early in the file (before most imports). Two `import` statements for `ShoulderAnatomyViewer` and `AnalysisResult` are placed mid-file right after the class. Valid ES module hoisting — TypeScript and Vite handle it fine.
- **Why:** The class was at the top of the file and refactoring its position would risk breaking complex JSX structure.

## ScanAnalysisPage Overview Tab Structure
- Added `ShoulderAnatomyViewer` + scan thumbnails above existing assessment scores.
- Outer wrapper: `<div className="space-y-5">` around the entire overview content.
- New anatomy section: `<div className="grid lg:grid-cols-2 gap-4">` (anatomy viewer + scan list).
- Then existing `<div className="grid lg:grid-cols-3 gap-5">` for scores/measurements/findings.
- Needs exactly **3 closing `</div>`** at the end of the overview conditional.

## Navbar
- Home.tsx Navbar: left=logo, center=marketing anchors + app module pill group, right=theme toggle + "New Patient" outline button + "Launch →" teal CTA.
- `User` icon must be imported from lucide-react (not `Users`) for the New Patient button.

**Why:** These quirks are non-obvious from code inspection alone and cost time when re-encountered.
