import React, { createContext, useContext, useState, useEffect } from "react";
import { runPredictionEngine } from "@/lib/predictionEngine";

export interface PatientInfo {
  name: string; dob: string; mrn: string; sex: "M" | "F"; age: number;
  weight: string; height: string; phone: string; email: string; insurance: string;
}

export interface ClinicalHistory {
  diagnosis: string; affectedSide: "Left" | "Right" | "Bilateral";
  painScore: number; symptoms: string[]; activityLevel: string;
  durationMonths: number; priorTreatments: string[];
  previousSurgeries: string; medications: string; allergies: string;
  surgeon: string; facility: string;
}

export interface ScanFile {
  name: string; type: string; size: number; uploadedAt: string; modality: "MRI" | "CT" | "XRAY" | "DICOM";
  dataUrl?: string;
  previewUrl?: string;
  file?: File;
}

export interface AnalysisResult {
  boneQuality: number;
  rotatorCuffIntegrity: number;
  cartilageCondition: number;
  jointAlignment: number;
  glenoVersion: number;
  humeralOffset: number;
  pathologies: { name: string; severity: "mild" | "moderate" | "severe"; confidence: number }[];
  recommendedImplant: string;
  implantSize: string;
  approach: string;
  aiScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  successRate: number;
  revisionRisk: number;
  romPredicted: number;
  recoveryMonths: string;
  stressIndex: number;
  impingementRisk: number;
  flexion: number;
  abduction: number;
  externalRotation: number;
  internalRotation: number;
  contraindications: string[];
  surgicalSteps: string[];
  complications: { name: string; prob: number; note?: string }[];
  findings: string[];
  // Extended fields from evidence-based engine
  implantRationale?: string;
  implantEvidence?: "A" | "B" | "C";
  implantAlternatives?: string[];
  survivalFactors?: { name: string; effect: number; hr: number; source: string }[];
  survivalCI?: { low: number; high: number };
  romPredictedAbduction?: number;
  romPredictedER?: number;
  romModifiers?: { name: string; effect: number; source: string }[];
  preOpFlexion?: number;
  engineVersion?: string;
  dataSources?: { key: string; name: string; n: number; year: number }[];
  totalEvidenceN?: number;
  meshUrl?: string;
}

export interface PatientState {
  info: PatientInfo | null;
  clinical: ClinicalHistory | null;
  scans: ScanFile[];
  rawFiles?: File[];
  reconstruction: {
    glbUrl?: string;
    glbBase64?: string;
    metadata?: Record<string, any>;
    measurements?: Record<string, any>;
    structures?: string[];
    modality?: string;
  } | null;
  analysis: AnalysisResult | null;
  completedSteps: string[];
  reportId: string;
  reportDate: string;
}

const EMPTY: PatientState = {
  info: null, clinical: null, scans: [], rawFiles: [], reconstruction: null, analysis: null,
  completedSteps: [], reportId: "", reportDate: "",
};

interface PatientContextType {
  state: PatientState;
  setInfo: (info: PatientInfo) => void;
  setClinical: (c: ClinicalHistory) => void;
  setScans: (s: ScanFile[]) => void;
  setRawFiles: (files: File[]) => void;
  setReconstruction: (r: any) => void;
  setAnalysis: (a: AnalysisResult | ((prev: AnalysisResult | null) => AnalysisResult | null)) => void;
  markStep: (step: string) => void;
  reset: () => void;
}

const PatientCtx = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PatientState>(() => {
    try {
      const saved = localStorage.getItem("ssim_patient");
      return saved ? JSON.parse(saved) : EMPTY;
    } catch { return EMPTY; }
  });

  useEffect(() => {
    localStorage.setItem("ssim_patient", JSON.stringify(state));
  }, [state]);

  const setInfo = (info: PatientInfo) =>
    setState(s => ({ ...s, info, reportId: `RPT-${Date.now().toString().slice(-8)}`, reportDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) }));

  const setClinical = (clinical: ClinicalHistory) => setState(s => ({ ...s, clinical }));
  const setScans = (scans: ScanFile[]) => setState(s => ({ ...s, scans }));
  const setRawFiles = (rawFiles: File[]) => setState(s => ({ ...s, rawFiles }));
  const setReconstruction = (reconstruction: any) => setState(s => ({ ...s, reconstruction }));
  const setAnalysis = (analysis: AnalysisResult | ((prev: AnalysisResult | null) => AnalysisResult | null)) =>
    setState(s => ({
      ...s,
      analysis: typeof analysis === "function" ? analysis(s.analysis) : analysis,
    }));
  const markStep = (step: string) => setState(s => ({ ...s, completedSteps: [...new Set([...s.completedSteps, step])] }));
  const reset = () => { setState(EMPTY); localStorage.removeItem("ssim_patient"); };

  return <PatientCtx.Provider value={{ state, setInfo, setClinical, setScans, setRawFiles, setReconstruction, setAnalysis, markStep, reset }}>{children}</PatientCtx.Provider>;
}

export function usePatient() {
  const ctx = useContext(PatientCtx);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}

/** Thin wrapper — delegates to the evidence-based prediction engine */
export function generateAnalysis(info: PatientInfo, clinical: ClinicalHistory): AnalysisResult {
  return runPredictionEngine(info, clinical);
}
