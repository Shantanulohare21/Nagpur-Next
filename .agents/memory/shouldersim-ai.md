---
name: ShoulderSIM AI Platform
description: Key architectural decisions and quirks for the shouldersim-ai artifact.
---

## Patient Data Flow
- PatientContext (`src/contexts/PatientContext.tsx`) stores all state in localStorage under key `ssim_patient`.
- Flow: `/intake` → `/scan-analysis` → `/simulation` → `/reports`
- `generateAnalysis(info, clinical)` in PatientContext derives AI findings deterministically from patient inputs — no backend needed.
- ScanAnalysisPage redirects to `/intake` if no patient data is loaded.

## PDF Report Generation
- jsPDF is installed as a dependency in `artifacts/shouldersim-ai`.
- `src/lib/reportGenerator.ts` exports `generatePDFReport`, `generateJSONReport`, `generateCSVReport`.
- ReportsPage uses patient context data when available; falls back to static demo data for legacy report items.

## WebGL / Three.js
- WebGL is unavailable in Replit preview screenshots — all Canvas elements are wrapped in WebGLErrorBoundary.
- `runtimeErrorOverlay` plugin was removed from vite.config.ts to suppress GPU-unavailable errors.

## Navbar
- Home.tsx Navbar: left=logo, center=marketing anchors + app module pill group, right=theme toggle + "New Patient" outline button + "Launch →" teal CTA.
- `User` icon must be imported from lucide-react (not `Users`) for the New Patient button.

**Why:** These quirks are non-obvious from code inspection alone and cost time when re-encountered.
