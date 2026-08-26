import { Router } from "express";

const router = Router();

interface CasePayload {
  patientName?: string;
  diagnosis?: string;
  surgeon?: string;
  facility?: string;
  implant?: string;
  riskLevel?: string;
  aiScore?: number;
  status?: string;
}

const activeCases = new Map<string, Record<string, unknown>>();

router.get("/api/cases", (_req, res) => {
  const cases = Array.from(activeCases.values());
  return res.json({ success: true, data: cases, count: cases.length });
});

router.get("/api/cases/:id", (req, res) => {
  const caseId = String(req.params.id);
  const found = activeCases.get(caseId);

  if (!found) {
    return res.status(404).json({ success: false, reason: "not_found", message: "Case not found" });
  }

  return res.json({ success: true, data: found });
});

router.post("/api/cases", (req, res) => {
  try {
    const body = (req.body ?? {}) as CasePayload;
    const timestamp = new Date().toISOString();
    const caseId = `CASE-${Date.now().toString(36).toUpperCase()}`;

    const result = {
      id: caseId,
      reportId: `RPT-${Date.now().toString().slice(-8)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      patientName: body.patientName || "Unknown Patient",
      diagnosis: body.diagnosis || "Shoulder pathology",
      surgeon: body.surgeon || "Dr. Sarah Chen",
      facility: body.facility || "ShoulderSIM Medical Center",
      implant: body.implant || "AI Implant Planning",
      riskLevel: body.riskLevel || "Moderate",
      aiScore: Number(body.aiScore ?? 90),
      status: body.status || "draft",
    };

    activeCases.set(caseId, result);

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
});

export default router;
