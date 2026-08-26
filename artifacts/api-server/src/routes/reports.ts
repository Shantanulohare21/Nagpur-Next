import { Router } from "express";

const router = Router();

interface ReportPayload {
  reportId?: string;
  patientName?: string;
  diagnosis?: string;
  implant?: string;
  surgeon?: string;
  facility?: string;
  aiScore?: number;
  riskLevel?: string;
  status?: string;
}

const activeReports = new Map<string, Record<string, unknown>>();

router.get("/api/reports", (_req, res) => {
  const reports = Array.from(activeReports.values());
  return res.json({ success: true, data: reports, count: reports.length });
});

router.get("/api/reports/:id", (req, res) => {
  const reportId = String(req.params.id);
  const found = activeReports.get(reportId);

  if (!found) {
    return res.status(404).json({ success: false, reason: "not_found", message: "Report not found" });
  }

  return res.json({ success: true, data: found });
});

router.post("/api/reports", (req, res) => {
  try {
    const body = (req.body ?? {}) as ReportPayload;
    const timestamp = new Date().toISOString();
    const reportId = String(body.reportId ?? `RPT-${Date.now().toString(36).toUpperCase()}`);

    const result = {
      id: reportId,
      patientName: body.patientName || "Unknown Patient",
      diagnosis: body.diagnosis || "Shoulder pathology",
      implant: body.implant || "AI recommendation pending",
      surgeon: body.surgeon || "Dr. Sarah Chen",
      facility: body.facility || "ShoulderSIM Medical Center",
      aiScore: Number(body.aiScore ?? 90),
      riskLevel: body.riskLevel || "Moderate",
      status: body.status || "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
      sections: ["patient", "scan", "implant", "risk", "surgical", "recovery", "simulation"],
    };

    activeReports.set(reportId, result);

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
});

export default router;
