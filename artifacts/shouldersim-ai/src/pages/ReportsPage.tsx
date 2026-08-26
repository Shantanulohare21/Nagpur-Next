import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, FileText, Download, Plus, Search, Filter, Check,
  BarChart3, Activity, User, Shield, TrendingUp, Calendar,
  Printer, Share2, Eye, ChevronRight, Package, Brain, Clock,
  AlertTriangle, Star, CheckCircle, XCircle, Copy, Zap, FileDown
} from "lucide-react";
import { usePatient } from "@/contexts/PatientContext";
import { generatePDFReport, generateJSONReport, generateCSVReport } from "@/lib/reportGenerator";
import type { PatientData, SimulationData } from "@/lib/reportGenerator";
import { WorkflowBanner } from "@/components/WorkflowBanner";

interface ReportItem {
  id: string;
  patient: string;
  age: number;
  sex: "M" | "F";
  diagnosis: string;
  implant: string;
  surgeon: string;
  date: string;
  status: "Draft" | "Final" | "Exported";
  aiScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  type: "Pre-op" | "Post-op" | "Follow-up";
}

const REPORTS: ReportItem[] = [
  { id: "RPT-2026-0142", patient: "James R.", age: 67, sex: "M", diagnosis: "Glenohumeral OA — Walch B2", implant: "Arthrex Univers II TSA", surgeon: "Dr. Sarah Chen", date: "May 28, 2026", status: "Final", aiScore: 96, riskLevel: "Low", type: "Pre-op" },
  { id: "RPT-2026-0138", patient: "Susan K.", age: 58, sex: "F", diagnosis: "Rotator Cuff Tear Arthropathy", implant: "Zimmer Comprehensive RSA", surgeon: "Dr. Sarah Chen", date: "May 26, 2026", status: "Final", aiScore: 91, riskLevel: "Moderate", type: "Pre-op" },
  { id: "RPT-2026-0129", patient: "Robert M.", age: 72, sex: "M", diagnosis: "Humeral Head AVN — Stage III", implant: "Arthrex Eclipse Resurfacing", surgeon: "Dr. James Novak", date: "May 24, 2026", status: "Exported", aiScore: 84, riskLevel: "Moderate", type: "Pre-op" },
  { id: "RPT-2026-0117", patient: "Maria L.", age: 63, sex: "F", diagnosis: "Post-traumatic OA", implant: "DePuy Global AP TSA", surgeon: "Dr. Sarah Chen", date: "May 21, 2026", status: "Final", aiScore: 89, riskLevel: "Low", type: "Pre-op" },
  { id: "RPT-2026-0108", patient: "William C.", age: 70, sex: "M", diagnosis: "Cuff Tear Arthropathy", implant: "Arthrex IDES RSA", surgeon: "Dr. James Novak", date: "May 19, 2026", status: "Exported", aiScore: 93, riskLevel: "Low", type: "Pre-op" },
  { id: "RPT-2026-0094", patient: "Lisa A.", age: 61, sex: "F", diagnosis: "Inflammatory Arthritis — RA", implant: "Zimmer Sidus Stem-Free", surgeon: "Dr. Tom Erikson", date: "May 15, 2026", status: "Draft", aiScore: 78, riskLevel: "High", type: "Pre-op" },
  { id: "FUP-2026-0082", patient: "George P.", age: 65, sex: "M", diagnosis: "Glenohumeral OA — 6mo Follow-up", implant: "Arthrex Univers II TSA (placed)", surgeon: "Dr. Sarah Chen", date: "May 12, 2026", status: "Final", aiScore: 94, riskLevel: "Low", type: "Follow-up" },
];

const REPORT_SECTIONS = [
  { id: "patient", label: "Patient Summary", icon: User, desc: "Demographics, medical history, comorbidities" },
  { id: "scan", label: "Scan Findings", icon: Activity, desc: "DICOM analysis, Walch classification, bone measurements" },
  { id: "anatomy", label: "Anatomical Measurements", icon: BarChart3, desc: "Glenoid version, humeral head offset, bone quality" },
  { id: "implant", label: "Implant Recommendation", icon: Package, desc: "AI-ranked implant list, sizing, compatibility scores" },
  { id: "surgical", label: "Surgical Plan", icon: Zap, desc: "Approach, bone preparation, component positioning" },
  { id: "risk", label: "Risk Analysis", icon: Shield, desc: "Patient-specific risk scoring, complication probabilities" },
  { id: "recovery", label: "Recovery Forecast", icon: TrendingUp, desc: "ROM prediction, timeline, rehabilitation protocol" },
  { id: "simulation", label: "Simulation Results", icon: Brain, desc: "FEA outputs, stress maps, impingement analysis" },
];

const EXPORT_FORMATS = [
  { id: "pdf", label: "PDF Report", icon: FileText, desc: "Formatted clinical report, print-ready", color: "text-red-400" },
  { id: "excel", label: "Excel / CSV", icon: BarChart3, desc: "Raw data tables for research and audit", color: "text-emerald-400" },
  { id: "json", label: "JSON Export", icon: Copy, desc: "Structured data for EHR integration", color: "text-blue-400" },
  { id: "dicom", label: "DICOM SR", icon: Activity, desc: "Structured reporting for PACS systems", color: "text-violet-400" },
];

function StatusBadge({ status }: { status: ReportItem["status"] }) {
  const map = {
    Draft: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    Final: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    Exported: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status]}`}>{status}</span>;
}

function RiskBadge({ level }: { level: ReportItem["riskLevel"] }) {
  const map = {
    Low: "text-emerald-400",
    Moderate: "text-amber-400",
    High: "text-red-400",
  };
  return <span className={`text-xs font-medium ${map[level]}`}>{level}</span>;
}

function ReportPreview({ report }: { report: ReportItem }) {
  const [sections, setSections] = useState<Set<string>>(new Set(["patient", "scan", "implant", "risk", "surgical", "recovery", "simulation"]));
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const { state } = usePatient();

  const toggleSection = (id: string) => {
    setSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildPatientData = (): PatientData => {
    if (state.info && state.clinical) {
      return {
        name: state.info.name,
        age: state.info.age,
        sex: state.info.sex,
        mrn: state.info.mrn,
        dob: state.info.dob,
        diagnosis: state.clinical.diagnosis,
        affectedSide: state.clinical.affectedSide,
        weight: state.info.weight || "N/A",
        height: state.info.height || "N/A",
        surgeon: state.clinical.surgeon,
        facility: state.clinical.facility,
        reportId: state.reportId || report.id,
        reportDate: state.reportDate || report.date,
      };
    }
    return {
      name: report.patient, age: report.age, sex: report.sex,
      mrn: report.id.replace("RPT-", "MRN-"), dob: "1958-03-12",
      diagnosis: report.diagnosis, affectedSide: "Right",
      weight: "82 kg", height: "175 cm",
      surgeon: report.surgeon, facility: "ShoulderSIM Medical Center",
      reportId: report.id, reportDate: report.date,
    };
  };

  const buildSimData = (): SimulationData => {
    const a = state.analysis;
    if (a) {
      return {
        implant: a.recommendedImplant, implantSize: a.implantSize,
        approach: a.approach, aiScore: a.aiScore, successRate: a.successRate,
        revisionRisk: a.revisionRisk, romPredicted: a.romPredicted,
        recoveryMonths: a.recoveryMonths, riskLevel: a.riskLevel,
        flexion: a.flexion, abduction: a.abduction,
        externalRotation: a.externalRotation, internalRotation: a.internalRotation,
        glenoVersion: a.glenoVersion, humeralOffset: a.humeralOffset,
        stressIndex: a.stressIndex, impingementRisk: a.impingementRisk,
        contraindications: a.contraindications, surgicalSteps: a.surgicalSteps,
        complications: a.complications,
      };
    }
    return {
      implant: report.implant, implantSize: "Standard (46mm glenoid)",
      approach: "Deltopectoral approach", aiScore: report.aiScore,
      successRate: 92, revisionRisk: 5, romPredicted: 142,
      recoveryMonths: "6–9", riskLevel: report.riskLevel,
      flexion: 60, abduction: 45, externalRotation: 20, internalRotation: 25,
      glenoVersion: -14, humeralOffset: 3.2, stressIndex: 4.1, impingementRisk: 6,
      contraindications: ["Standard pre-operative screening required", "Confirm bone mineral density"],
      surgicalSteps: [
        "Beach-chair positioning; standard prep and drape",
        "Deltopectoral approach — protect cephalic vein",
        "Subscapularis takedown — lesser tuberosity osteotomy",
        "Humeral head resection at 135° inclination, 20° retroversion",
        "Sequential glenoid reaming — target version < 5°",
        "Component placement; trial reduction — confirm ROM and stability",
        "Definitive fixation; wound closure in layers",
      ],
      complications: [
        { name: "Periprosthetic Infection", prob: 1.4 },
        { name: "Nerve Injury", prob: 1.8 },
        { name: "Component Loosening (10yr)", prob: 5.2 },
        { name: "Periprosthetic Fracture", prob: 1.2 },
        { name: "Stiffness / Adhesions", prob: 8.4 },
      ],
    };
  };

  const doExport = async (format: string) => {
    setExporting(true);
    try {
      const patientData = buildPatientData();
      const simData = buildSimData();
      await new Promise(r => setTimeout(r, 400));
      if (format === "pdf") {
        generatePDFReport(patientData, simData, sections);
      } else if (format === "json") {
        generateJSONReport(patientData, simData, sections);
      } else if (format === "excel") {
        generateCSVReport(patientData, simData);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      setExported(format);
      setTimeout(() => setExported(null), 3000);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Section picker */}
      <div className="lg:col-span-2">
        <h4 className="text-sm font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">Report Sections</h4>
        <div className="space-y-2">
          {REPORT_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                sections.has(s.id)
                  ? "bg-[hsl(189,94%,40%,0.1)] border-[hsl(189,94%,40%,0.3)]"
                  : "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,16%)] hover:border-[hsl(217,32%,24%)]"
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${sections.has(s.id) ? "bg-[hsl(189,94%,40%)] border-[hsl(189,94%,40%)]" : "border-[hsl(217,32%,30%)]"}`}>
                {sections.has(s.id) && <Check className="w-3 h-3 text-[hsl(222,47%,5%)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.label}</p>
                <p className="text-xs text-[hsl(215,20%,45%)] truncate">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview + export */}
      <div className="lg:col-span-3 space-y-4">
        {/* Mini preview */}
        <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[hsl(217,32%,14%)] flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Report Preview</p>
            <span className="text-xs text-[hsl(215,20%,40%)]">{sections.size} of {REPORT_SECTIONS.length} sections</span>
          </div>
          {/* Simulated report content */}
          <div className="p-5 space-y-4 font-mono text-xs">
            <div>
              <div className="text-[hsl(189,94%,40%)] font-bold text-sm mb-1">SHOULDERSIM AI — SURGICAL PLANNING REPORT</div>
              <div className="text-[hsl(215,20%,40%)]">{report.id} · Generated {report.date} · {report.surgeon}</div>
            </div>
            <hr className="border-[hsl(217,32%,18%)]" />
            {sections.has("patient") && (
              <div>
                <div className="text-[hsl(189,94%,50%)] font-semibold mb-1">■ PATIENT SUMMARY</div>
                <div className="text-[hsl(215,20%,65%)] space-y-0.5">
                  <div>Patient: {report.patient} | Age: {report.age} | Sex: {report.sex}</div>
                  <div>Diagnosis: {report.diagnosis}</div>
                  <div>AI Risk Score: {100 - report.aiScore}% | Risk Level: {report.riskLevel}</div>
                </div>
              </div>
            )}
            {sections.has("scan") && (
              <div>
                <div className="text-[hsl(189,94%,50%)] font-semibold mb-1">■ SCAN FINDINGS (CT)</div>
                <div className="text-[hsl(215,20%,65%)] space-y-0.5">
                  <div>Glenoid retroversion: 18° | Morphology: Walch B2</div>
                  <div>Posterior subluxation: 68% | Bone quality: Good</div>
                  <div>Rotator cuff: Intact supraspinatus, infraspinatus, subscapularis</div>
                </div>
              </div>
            )}
            {sections.has("implant") && (
              <div>
                <div className="text-[hsl(189,94%,50%)] font-semibold mb-1">■ IMPLANT RECOMMENDATION</div>
                <div className="text-[hsl(215,20%,65%)] space-y-0.5">
                  <div>Recommended: {report.implant}</div>
                  <div>AI Compatibility Score: {report.aiScore}/100 | Grade: Excellent</div>
                  <div>10yr revision probability: 4.2%</div>
                </div>
              </div>
            )}
            {sections.has("risk") && (
              <div>
                <div className="text-[hsl(189,94%,50%)] font-semibold mb-1">■ RISK ANALYSIS</div>
                <div className="text-[hsl(215,20%,65%)] space-y-0.5">
                  <div>Overall Risk: {report.riskLevel} | Confidence: 94%</div>
                  <div>Primary concerns: {report.riskLevel === "High" ? "DM glycemic control, bone density" : "Standard peri-operative monitoring"}</div>
                  <div>Recommendation: Proceed with standard protocol</div>
                </div>
              </div>
            )}
            <div className="text-[hsl(215,20%,30%)] text-xs pt-2 border-t border-[hsl(217,32%,14%)]">
              FOR CLINICAL DECISION SUPPORT ONLY · HIPAA COMPLIANT · SHOULDERSIM AI v4.2
            </div>
          </div>
        </div>

        {/* Export formats */}
        <div>
          <h4 className="text-sm font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">Export Format</h4>
          <div className="grid grid-cols-2 gap-3">
            {EXPORT_FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => doExport(f.id)}
                disabled={exporting}
                className="flex items-center gap-3 p-3 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg hover:border-[hsl(217,32%,26%)] hover:bg-[hsl(222,47%,10%)] transition-all text-left disabled:opacity-50"
              >
                <f.icon className={`w-5 h-5 ${f.color} shrink-0`} />
                <div>
                  <p className="text-sm font-medium text-white">{f.label}</p>
                  <p className="text-xs text-[hsl(215,20%,45%)]">{f.desc}</p>
                </div>
                {exported === f.id ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                ) : (
                  <Download className="w-4 h-4 text-[hsl(215,20%,35%)] ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={generateReport} disabled={reportGenerating} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(189,94%,40%)] text-[hsl(222,47%,5%)] font-bold text-sm hover:bg-[hsl(189,94%,45%)] transition-colors disabled:opacity-65">
            {reportGenerating ? (
              <><div className="w-4 h-4 border-2 border-[hsl(222,47%,5%)] border-t-transparent rounded-full animate-spin" />Generating…</>
            ) : (
              <><FileDown className="w-4 h-4" />Generate Report</>
            )}
          </button>
          <button className="px-4 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)] hover:text-white transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          <button className="px-4 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)] hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [quickExporting, setQuickExporting] = useState<string | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [apiReports, setApiReports] = useState<ReportItem[]>([]);
  const { state } = usePatient();
  const { generatePDFReport: _pdf, generateJSONReport: _json, generateCSVReport: _csv } = { generatePDFReport, generateJSONReport, generateCSVReport };

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
          throw new Error(`Failed to read reports ${response.status}`);
        }

        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];

        const liveReports = data.map((entry: any): ReportItem => {
          const status = String(entry.status ?? "Draft");
          const normalizedStatus = status.toLowerCase() === "final" || status.toLowerCase() === "completed" ? "Final" :
            status.toLowerCase() === "exported" ? "Exported" : "Draft";

          return {
            id: String(entry.id ?? entry.reportId ?? "RPT-UNKNOWN"),
            patient: String(entry.patientName ?? "Unknown Patient"),
            age: 65,
            sex: "M",
            diagnosis: String(entry.diagnosis ?? "Shoulder pathology"),
            implant: String(entry.implant ?? "AI recommendation pending"),
            surgeon: String(entry.surgeon ?? "Dr. Sarah Chen"),
            date: new Date(String(entry.createdAt ?? Date.now())).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: normalizedStatus as ReportItem["status"],
            aiScore: Number(entry.aiScore ?? 90),
            riskLevel: (String(entry.riskLevel ?? "Moderate") as ReportItem["riskLevel"]),
            type: "Pre-op",
          };
        });

        setApiReports(liveReports);
      } catch (error) {
        console.warn("Reports API unavailable; using default report shell", error);
        setApiReports([]);
      }
    };

    void loadReports();
  }, []);

  const hasPatient = !!(state.info && state.clinical);

  const generateReport = async () => {
    if (!state.info || !state.clinical) return;

    setReportGenerating(true);

    try {
      const payload = {
        reportId: state.reportId || `RPT-${Date.now().toString(36).toUpperCase()}`,
        patientName: state.info.name,
        diagnosis: state.clinical.diagnosis,
        implant: state.analysis?.recommendedImplant || "AI recommendation pending",
        surgeon: state.clinical.surgeon,
        facility: state.clinical.facility,
        aiScore: state.analysis?.aiScore ?? 90,
        riskLevel: state.analysis?.riskLevel ?? "Moderate",
        status: "draft",
      };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Report save failed with ${response.status}`);
      }

      const result = await response.json();
      if (!result?.success) {
        throw new Error("Report API did not return success");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReportGenerating(false);
    }
  };

  const quickExport = async (format: string) => {
    if (!state.info || !state.clinical) return;
    setQuickExporting(format);
    const pd: PatientData = {
      name: state.info.name, age: state.info.age, sex: state.info.sex,
      mrn: state.info.mrn, dob: state.info.dob,
      diagnosis: state.clinical.diagnosis, affectedSide: state.clinical.affectedSide,
      weight: state.info.weight || "N/A", height: state.info.height || "N/A",
      surgeon: state.clinical.surgeon, facility: state.clinical.facility,
      reportId: state.reportId, reportDate: state.reportDate,
    };
    const a = state.analysis;
    const sd: SimulationData = a ? {
      implant: a.recommendedImplant, implantSize: a.implantSize, approach: a.approach,
      aiScore: a.aiScore, successRate: a.successRate, revisionRisk: a.revisionRisk,
      romPredicted: a.romPredicted, recoveryMonths: a.recoveryMonths, riskLevel: a.riskLevel,
      flexion: a.flexion, abduction: a.abduction, externalRotation: a.externalRotation,
      internalRotation: a.internalRotation, glenoVersion: a.glenoVersion,
      humeralOffset: a.humeralOffset, stressIndex: a.stressIndex,
      impingementRisk: a.impingementRisk, contraindications: a.contraindications,
      surgicalSteps: a.surgicalSteps, complications: a.complications,
    } : {
      implant: "Total Shoulder Arthroplasty (TSA)", implantSize: "Standard (46mm)", approach: "Deltopectoral",
      aiScore: 88, successRate: 91, revisionRisk: 6, romPredicted: 140, recoveryMonths: "6–9", riskLevel: "Low",
      flexion: 55, abduction: 40, externalRotation: 20, internalRotation: 25,
      glenoVersion: -14, humeralOffset: 3.2, stressIndex: 4.1, impingementRisk: 6,
      contraindications: ["Standard pre-operative screening required"],
      surgicalSteps: ["Beach-chair positioning", "Deltopectoral approach", "Humeral head resection", "Glenoid preparation", "Component placement"],
      complications: [{ name: "Infection", prob: 1.4 }, { name: "Stiffness", prob: 8 }, { name: "Loosening (10yr)", prob: 5 }],
    };
    const allSections = new Set(["patient", "scan", "implant", "risk", "surgical", "recovery", "simulation"]);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (format === "pdf") generatePDFReport(pd, sd, allSections);
      else if (format === "json") generateJSONReport(pd, sd, allSections);
      else if (format === "csv") generateCSVReport(pd, sd);
    } finally {
      setQuickExporting(null);
    }
  };

  const reportPool = apiReports.length > 0 ? apiReports : REPORTS;

  const filtered = reportPool.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)]">
      {/* Header */}
      <header className="border-b border-[hsl(217,32%,14%)] bg-[hsl(222,47%,6%)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[hsl(215,20%,50%)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[hsl(189,94%,40%,0.15)] border border-[hsl(189,94%,40%,0.4)] flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-[hsl(189,94%,40%)]" />
              </div>
              <h1 className="text-sm font-bold text-white">Reporting Engine</h1>
            </div>
          </div>
          <button
            onClick={() => { setShowBuilder(true); setSelected(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(189,94%,40%)] text-[hsl(222,47%,5%)] font-semibold text-sm hover:bg-[hsl(189,94%,45%)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </header>
      <WorkflowBanner current="report" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Current patient quick-action card */}
        {hasPatient && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-[hsl(222,47%,8%)] to-[hsl(222,47%,8%)] p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Current Patient Analysis Ready</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-0.5">{state.info!.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
                  <span>MRN: <span className="text-slate-300 font-mono">{state.info!.mrn}</span></span>
                  <span>·</span>
                  <span>{state.info!.age} yr · {state.info!.sex}</span>
                  {state.clinical && <><span>·</span><span>{state.clinical.diagnosis}</span></>}
                </div>
                {state.analysis && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-teal-500/15 text-teal-300 border border-teal-500/25 font-medium">
                      {state.analysis.recommendedImplant}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-slate-700/60 text-slate-300 border border-slate-600/40">
                      AI Score: {state.analysis.aiScore}/100
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs border font-medium ${
                      state.analysis.riskLevel === "Low" ? "bg-green-500/15 text-green-300 border-green-500/25" :
                      state.analysis.riskLevel === "Moderate" ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" :
                      "bg-red-500/15 text-red-300 border-red-500/25"
                    }`}>Risk: {state.analysis.riskLevel}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-slate-700/60 text-slate-300 border border-slate-600/40">
                      Success: {state.analysis.successRate}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                {[
                  { id: "pdf", label: "Download PDF", icon: FileDown, cls: "bg-teal-500 text-[hsl(222,47%,5%)] hover:bg-teal-400" },
                  { id: "json", label: "Export JSON", icon: FileDown, cls: "bg-[hsl(222,47%,12%)] text-teal-300 border border-teal-500/30 hover:bg-[hsl(222,47%,16%)]" },
                  { id: "csv", label: "Export CSV", icon: FileDown, cls: "bg-[hsl(222,47%,12%)] text-slate-300 border border-slate-600/40 hover:bg-[hsl(222,47%,16%)]" },
                ].map(btn => (
                  <button key={btn.id} onClick={() => quickExport(btn.id)} disabled={!!quickExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${btn.cls}`}>
                    {quickExporting === btn.id ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : <btn.icon className="w-4 h-4" />}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", val: REPORTS.length.toString(), icon: FileText, color: "text-[hsl(189,94%,40%)]" },
            { label: "Finalized", val: REPORTS.filter(r => r.status === "Final").length.toString(), icon: CheckCircle, color: "text-emerald-400" },
            { label: "Exported", val: REPORTS.filter(r => r.status === "Exported").length.toString(), icon: Download, color: "text-blue-400" },
            { label: "Drafts", val: REPORTS.filter(r => r.status === "Draft").length.toString(), icon: Clock, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-[hsl(215,20%,50%)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Report list */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(215,20%,40%)]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="w-full pl-9 pr-3 py-2 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg text-sm text-white placeholder-[hsl(215,20%,35%)] outline-none focus:border-[hsl(189,94%,40%,0.5)]"
                />
              </div>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "Pre-op", "Post-op", "Follow-up"].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-xs transition-all border ${typeFilter === t ? "bg-[hsl(189,94%,40%,0.2)] border-[hsl(189,94%,40%,0.4)] text-[hsl(189,94%,60%)]" : "border-[hsl(217,32%,18%)] text-[hsl(215,20%,50%)] hover:text-white"}`}>
                  {t === "all" ? "All Types" : t}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filtered.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setSelected(r); setShowBuilder(false); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === r.id
                      ? "bg-[hsl(189,94%,40%,0.1)] border-[hsl(189,94%,40%,0.3)]"
                      : "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,16%)] hover:border-[hsl(217,32%,24%)]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{r.patient}</p>
                      <p className="text-xs text-[hsl(215,20%,40%)] font-mono">{r.id}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-[hsl(215,20%,55%)] mb-2 truncate">{r.diagnosis}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[hsl(215,20%,40%)]">{r.date}</span>
                      <RiskBadge level={r.riskLevel} />
                    </div>
                    <span className="text-xs font-semibold text-[hsl(189,94%,40%)]">{r.aiScore}/100</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-[hsl(215,20%,40%)] text-sm">No reports match your filters</div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  {/* Report header */}
                  <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 mb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{selected.patient}, {selected.age}{selected.sex}</h3>
                        <p className="text-sm text-[hsl(215,20%,55%)]">{selected.diagnosis}</p>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Report ID", val: selected.id },
                        { label: "Surgeon", val: selected.surgeon },
                        { label: "AI Score", val: `${selected.aiScore}/100` },
                        { label: "Risk", val: selected.riskLevel },
                      ].map(f => (
                        <div key={f.label} className="text-xs">
                          <p className="text-[hsl(215,20%,40%)] mb-0.5">{f.label}</p>
                          <p className="text-white font-medium">{f.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ReportPreview report={selected} />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-80 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,18%)] flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[hsl(215,20%,35%)]" />
                  </div>
                  <p className="text-[hsl(215,20%,50%)] text-sm mb-1">Select a report from the list</p>
                  <p className="text-[hsl(215,20%,35%)] text-xs">or create a new one to configure sections and export format</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
