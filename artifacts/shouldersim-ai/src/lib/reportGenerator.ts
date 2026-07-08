import { jsPDF } from "jspdf";

export interface PatientData {
  name: string;
  age: number;
  sex: "M" | "F";
  mrn: string;
  dob: string;
  diagnosis: string;
  affectedSide: "Left" | "Right" | "Bilateral";
  weight: string;
  height: string;
  surgeon: string;
  facility: string;
  reportId: string;
  reportDate: string;
}

export interface SimulationData {
  implant: string;
  implantSize: string;
  approach: string;
  aiScore: number;
  successRate: number;
  revisionRisk: number;
  romPredicted: number;
  recoveryMonths: string;
  riskLevel: "Low" | "Moderate" | "High";
  flexion: number;
  abduction: number;
  externalRotation: number;
  internalRotation: number;
  glenoVersion: number;
  humeralOffset: number;
  stressIndex: number;
  impingementRisk: number;
  contraindications: string[];
  surgicalSteps: string[];
  complications: { name: string; prob: number }[];
}

const PRIMARY = [20, 184, 166] as [number, number, number];
const DARK = [7, 14, 30] as [number, number, number];
const MUTED = [100, 116, 139] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const LIGHT_BG = [248, 250, 252] as [number, number, number];
const BORDER = [226, 232, 240] as [number, number, number];
const SUCCESS = [16, 185, 129] as [number, number, number];
const WARNING = [245, 158, 11] as [number, number, number];
const DANGER = [239, 68, 68] as [number, number, number];

function riskColor(level: string): [number, number, number] {
  if (level === "Low") return SUCCESS;
  if (level === "Moderate") return WARNING;
  return DANGER;
}

export function generatePDFReport(patient: PatientData, sim: SimulationData, sections: Set<string>): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = 20;
    drawHeaderBar();
    drawPageFooter();
  };

  const checkPage = (needed: number) => {
    if (y + needed > H - 20) addPage();
  };

  const drawHeaderBar = () => {
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 14, "F");
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, 4, 14, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("SHOULDERSIM AI", 8, 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Biomechanical Shoulder Simulation Platform  |  Clinical Report", 8, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(`${patient.reportId}  |  ${patient.reportDate}`, W - 6, 5.5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`${patient.facility}  |  ${patient.surgeon}`, W - 6, 10, { align: "right" });
  };

  const drawPageFooter = () => {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(10, H - 12, W - 10, H - 12);
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("FOR CLINICAL USE ONLY — ShoulderSIM AI v2.0 — AI-generated report for qualified medical professionals", 10, H - 8);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, W - 10, H - 8, { align: "right" });
  };

  const sectionTitle = (title: string, icon?: string) => {
    checkPage(14);
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(10, y, W - 20, 8, 1, 1, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text((icon ? icon + " " : "") + title.toUpperCase(), 15, y + 5.5);
    y += 11;
  };

  const dataRow = (label: string, value: string, bold = false) => {
    checkPage(7);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, 15, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(value, 85, y);
    y += 5.5;
  };

  const infoBox = (text: string, type: "info" | "warn" | "danger" = "info") => {
    const col = type === "info" ? PRIMARY : type === "warn" ? WARNING : DANGER;
    checkPage(12);
    doc.setFillColor(col[0], col[1], col[2], 0.08);
    doc.setDrawColor(...col);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y, W - 20, 9, 1, 1, "FD");
    doc.setTextColor(...col);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(text, 14, y + 5.5);
    y += 12;
  };

  const tableHeader = (cols: string[], widths: number[]) => {
    checkPage(8);
    doc.setFillColor(...DARK);
    let x = 10;
    cols.forEach((col, i) => {
      doc.rect(x, y, widths[i], 6, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(col, x + 2, y + 4);
      x += widths[i];
    });
    y += 6;
  };

  const tableRow = (cells: string[], widths: number[], shade: boolean) => {
    checkPage(7);
    let x = 10;
    if (shade) {
      doc.setFillColor(...LIGHT_BG);
      doc.rect(10, y, widths.reduce((a, b) => a + b, 0), 6, "F");
    }
    cells.forEach((cell, i) => {
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(cell, x + 2, y + 4);
      x += widths[i];
    });
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.1);
    doc.line(10, y + 6, W - 10, y + 6);
    y += 6;
  };

  drawHeaderBar();
  drawPageFooter();
  y = 18;

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(10, y, W - 20, 38, 2, 2, "F");
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, y, W - 20, 38, 2, 2, "D");

  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRE-OPERATIVE SURGICAL PLANNING REPORT", W / 2, y + 10, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("AI-Powered Biomechanical Analysis  |  ShoulderSIM AI v2.0", W / 2, y + 17, { align: "center" });

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(patient.name, W / 2, y + 26, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`MRN: ${patient.mrn}  |  ${patient.age}${patient.sex}  |  ${patient.diagnosis}`, W / 2, y + 32, { align: "center" });
  y += 44;

  doc.setFillColor(...DARK);
  doc.roundedRect(10, y, W - 20, 22, 1.5, 1.5, "F");
  const cols4 = (W - 20) / 4;
  const metrics = [
    { label: "AI Confidence", value: `${sim.aiScore}%`, color: PRIMARY },
    { label: "Success Rate", value: `${sim.successRate}%`, color: SUCCESS },
    { label: "Risk Level", value: sim.riskLevel, color: riskColor(sim.riskLevel) },
    { label: "ROM Predicted", value: `${sim.romPredicted}°`, color: PRIMARY },
  ];
  metrics.forEach((m, i) => {
    const x = 10 + i * cols4 + cols4 / 2;
    doc.setTextColor(...m.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(m.value, x, y + 11, { align: "center" });
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(m.label, x, y + 17, { align: "center" });
    if (i < 3) {
      doc.setDrawColor(40, 60, 80);
      doc.line(10 + (i + 1) * cols4, y + 3, 10 + (i + 1) * cols4, y + 20);
    }
  });
  y += 28;

  if (sections.has("patient")) {
    sectionTitle("Patient Summary", "■");
    dataRow("Patient Name:", patient.name, true);
    dataRow("Date of Birth:", patient.dob);
    dataRow("MRN:", patient.mrn);
    dataRow("Sex / Age:", `${patient.sex === "M" ? "Male" : "Female"}, ${patient.age} years`);
    dataRow("Weight / Height:", `${patient.weight}  |  ${patient.height}`);
    dataRow("Primary Diagnosis:", patient.diagnosis, true);
    dataRow("Affected Side:", patient.affectedSide);
    dataRow("Attending Surgeon:", patient.surgeon, true);
    dataRow("Report Generated:", patient.reportDate);
    y += 3;
  }

  if (sections.has("implant")) {
    sectionTitle("Implant Recommendation", "■");
    doc.setFillColor(20, 184, 166, 0.06);
    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y, W - 20, 24, 1.5, 1.5, "FD");
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(sim.implant, 15, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text(`Size: ${sim.implantSize}  |  Approach: ${sim.approach}  |  AI Score: ${sim.aiScore}%`, 15, y + 15);
    doc.text(`Estimated Recovery: ${sim.recoveryMonths} months post-op  |  Revision Risk: ${sim.revisionRisk}%`, 15, y + 21);
    y += 28;

    tableHeader(["Metric", "Value", "Benchmark", "Status"], [55, 45, 55, 35]);
    const implantRows = [
      ["Component Compatibility", `${sim.aiScore}%`, "≥ 85%", sim.aiScore >= 85 ? "✓ Pass" : "✗ Review"],
      ["Impingement Risk", `${sim.impingementRisk}%`, "< 10%", sim.impingementRisk < 10 ? "✓ Pass" : "✗ Flag"],
      ["Stress Index", `${sim.stressIndex.toFixed(1)}`, "< 6.0", sim.stressIndex < 6 ? "✓ Pass" : "✗ Flag"],
      ["Predicted ROM", `${sim.romPredicted}°`, "≥ 130°", sim.romPredicted >= 130 ? "✓ Pass" : "✗ Review"],
    ];
    implantRows.forEach((r, i) => tableRow(r, [55, 45, 55, 35], i % 2 === 0));
    y += 4;
  }

  if (sections.has("scan")) {
    sectionTitle("Anatomical Measurements", "■");
    tableHeader(["Measurement", "Value", "Normal Range", "Classification"], [55, 35, 55, 45]);
    const scanRows = [
      ["Glenoid Version", `${sim.glenoVersion}°`, "-10° to +5°", sim.glenoVersion > 5 ? "Retroversion" : "Normal"],
      ["Humeral Head Offset", `${sim.humeralOffset} mm`, "0–4 mm", "Within Range"],
      ["Flexion (Current)", `${sim.flexion}°`, "≥ 140°", sim.flexion < 100 ? "Severely Limited" : "Moderately Limited"],
      ["Abduction (Current)", `${sim.abduction}°`, "≥ 120°", "Limited"],
      ["Ext. Rotation (Current)", `${sim.externalRotation}°`, "≥ 40°", "Limited"],
      ["Int. Rotation (Current)", `${sim.internalRotation}°`, "≥ 40°", "Normal"],
    ];
    scanRows.forEach((r, i) => tableRow(r, [55, 35, 55, 45], i % 2 === 0));
    y += 4;
  }

  if (sections.has("surgical")) {
    sectionTitle("Surgical Plan", "■");
    sim.surgicalSteps.forEach((step, i) => {
      checkPage(7);
      doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
      doc.rect(10, y, W - 20, 6, "F");
      doc.setDrawColor(...BORDER);
      doc.line(10, y + 6, W - 10, y + 6);
      doc.setFillColor(...PRIMARY);
      doc.circle(17, y + 3, 2, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text(String(i + 1), 17, y + 3.8, { align: "center" });
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(step, 22, y + 4);
      y += 6;
    });
    y += 4;
  }

  if (sections.has("risk")) {
    sectionTitle("Risk Analysis", "■");
    tableHeader(["Complication", "Probability", "Risk Level", "Mitigation"], [60, 35, 35, 60]);
    sim.complications.forEach((c, i) => {
      const risk = c.prob < 5 ? "Low" : c.prob < 15 ? "Moderate" : "High";
      tableRow([c.name, `${c.prob}%`, risk, risk === "Low" ? "Standard protocol" : "Enhanced monitoring"], [60, 35, 35, 60], i % 2 === 0);
    });
    y += 4;

    if (sim.contraindications.length > 0) {
      infoBox("⚠  CONTRAINDICATIONS & WARNINGS — Review before proceeding", "warn");
      sim.contraindications.forEach(ci => {
        checkPage(6);
        doc.setTextColor(...WARNING);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text("•", 14, y);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "normal");
        doc.text(ci, 18, y);
        y += 5;
      });
      y += 3;
    }
  }

  if (sections.has("recovery")) {
    sectionTitle("Recovery Forecast", "■");
    const milestones = [
      { week: "Week 0–2", goal: "Immobilization, pain management, wound healing" },
      { week: "Week 2–6", goal: "Passive ROM exercises; target 60° flexion, 20° abduction" },
      { week: "Week 6–12", goal: "Active-assisted exercises; target 90° flexion, 45° abduction" },
      { week: "Month 3–6", goal: "Strengthening protocol; target 120° flexion, 80° abduction" },
      { week: "Month 6–12", goal: `Full recovery expected; target ${sim.romPredicted}° flexion, near-normal function` },
    ];
    tableHeader(["Phase", "Rehabilitation Goal"], [50, 140]);
    milestones.forEach((m, i) => tableRow([m.week, m.goal], [50, 140], i % 2 === 0));
    y += 4;
  }

  if (sections.has("simulation")) {
    sectionTitle("Simulation Results Summary", "■");
    infoBox(`FEA Stress Analysis — Stress Index: ${sim.stressIndex.toFixed(1)} | Impingement Risk: ${sim.impingementRisk}%`, "info");
    dataRow("Peak Predicted Flexion:", `${sim.romPredicted}° (post-op)`, true);
    dataRow("Abduction Range:", `${sim.abduction + 60}° (predicted post-op)`);
    dataRow("Stress Index (FEA):", `${sim.stressIndex.toFixed(2)} MPa/normalized`);
    dataRow("Impingement Risk:", `${sim.impingementRisk}% — ${sim.impingementRisk < 10 ? "Acceptable" : "Requires Review"}`);
    dataRow("Simulation Confidence:", `${sim.aiScore}% (${sim.aiScore >= 90 ? "High" : "Moderate"})`);
    y += 4;
  }

  checkPage(40);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(10, y, W - 10, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("PHYSICIAN SIGN-OFF", 15, y);
  y += 6;

  const sigBoxes = [
    { label: "Attending Surgeon", name: patient.surgeon },
    { label: "Reviewing Physician", name: "_________________________" },
    { label: "Date of Approval", name: patient.reportDate },
  ];
  sigBoxes.forEach((s, i) => {
    const x = 10 + i * ((W - 20) / 3);
    const w = (W - 20) / 3 - 4;
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(x, y, w, 16, 1, 1, "F");
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, w, 16, 1, 1, "D");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(s.label, x + 3, y + 5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(s.name, x + 3, y + 12);
  });
  y += 22;

  infoBox("This report was generated by ShoulderSIM AI and is intended to assist, not replace, clinical judgment. Always verify recommendations with the attending physician.", "info");

  const filename = `ShoulderSIM_Report_${patient.mrn}_${patient.reportDate.replace(/[^0-9]/g, "")}.pdf`;
  doc.save(filename);
}

export function generateJSONReport(patient: PatientData, sim: SimulationData, sections: Set<string>): void {
  const data: Record<string, unknown> = {
    meta: {
      reportId: patient.reportId,
      generatedAt: new Date().toISOString(),
      platform: "ShoulderSIM AI v2.0",
      format: "JSON v1",
    },
  };

  if (sections.has("patient")) {
    data.patient = {
      name: patient.name,
      mrn: patient.mrn,
      dob: patient.dob,
      age: patient.age,
      sex: patient.sex,
      weight: patient.weight,
      height: patient.height,
      diagnosis: patient.diagnosis,
      affectedSide: patient.affectedSide,
      surgeon: patient.surgeon,
      facility: patient.facility,
    };
  }

  if (sections.has("implant")) {
    data.implantRecommendation = {
      name: sim.implant,
      size: sim.implantSize,
      approach: sim.approach,
      aiScore: sim.aiScore,
      successRate: sim.successRate,
      revisionRisk: sim.revisionRisk,
      estimatedRecoveryMonths: sim.recoveryMonths,
      riskLevel: sim.riskLevel,
    };
  }

  if (sections.has("scan")) {
    data.anatomicalMeasurements = {
      glenoVersion_deg: sim.glenoVersion,
      humeralOffset_mm: sim.humeralOffset,
      flexion_deg: sim.flexion,
      abduction_deg: sim.abduction,
      externalRotation_deg: sim.externalRotation,
      internalRotation_deg: sim.internalRotation,
    };
  }

  if (sections.has("risk")) {
    data.riskAnalysis = {
      overallRisk: sim.riskLevel,
      contraindications: sim.contraindications,
      complications: sim.complications,
    };
  }

  if (sections.has("simulation")) {
    data.simulationResults = {
      stressIndex: sim.stressIndex,
      impingementRisk_pct: sim.impingementRisk,
      predictedROM_deg: sim.romPredicted,
      aiConfidence_pct: sim.aiScore,
    };
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ShoulderSIM_Report_${patient.mrn}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateCSVReport(patient: PatientData, sim: SimulationData): void {
  const rows: string[][] = [
    ["ShoulderSIM AI — Clinical Data Export"],
    ["Report ID", patient.reportId],
    ["Generated", patient.reportDate],
    [],
    ["PATIENT DATA"],
    ["Field", "Value"],
    ["Name", patient.name],
    ["MRN", patient.mrn],
    ["Age", String(patient.age)],
    ["Sex", patient.sex],
    ["Diagnosis", patient.diagnosis],
    ["Affected Side", patient.affectedSide],
    ["Surgeon", patient.surgeon],
    [],
    ["IMPLANT RECOMMENDATION"],
    ["Implant", sim.implant],
    ["Size", sim.implantSize],
    ["Approach", sim.approach],
    ["AI Score (%)", String(sim.aiScore)],
    ["Success Rate (%)", String(sim.successRate)],
    ["Revision Risk (%)", String(sim.revisionRisk)],
    ["Predicted ROM (°)", String(sim.romPredicted)],
    [],
    ["ANATOMICAL MEASUREMENTS"],
    ["Glenoid Version (°)", String(sim.glenoVersion)],
    ["Humeral Offset (mm)", String(sim.humeralOffset)],
    ["Flexion (°)", String(sim.flexion)],
    ["Abduction (°)", String(sim.abduction)],
    ["External Rotation (°)", String(sim.externalRotation)],
    ["Internal Rotation (°)", String(sim.internalRotation)],
    [],
    ["SIMULATION RESULTS"],
    ["Stress Index", String(sim.stressIndex)],
    ["Impingement Risk (%)", String(sim.impingementRisk)],
    ["AI Confidence (%)", String(sim.aiScore)],
  ];

  const csv = rows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ShoulderSIM_Data_${patient.mrn}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
