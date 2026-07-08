import { useState, useRef, useCallback } from "react";
import {
  Upload, Play, FileUp, CheckCircle, AlertTriangle, BarChart3,
  Activity, Zap, ChevronDown, RefreshCw, Download, Info,
  User, FlaskConical, ClipboardList, Award, TrendingUp, Shield
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
  runSimulation, IMPLANT_LIBRARY,
  type PatientProfile, type SimulationReport, type SimulationResult
} from "../lib/simulationEngine";

// ─── Constants ────────────────────────────────────────────────────────────────
const DIAGNOSES = [
  { value: "glenohumeral-arthritis",  label: "Glenohumeral Osteoarthritis" },
  { value: "rotator-cuff-arthropathy", label: "Rotator Cuff Tear Arthropathy" },
  { value: "avascular-necrosis",       label: "Humeral Head Avascular Necrosis" },
  { value: "proximal-humerus-fracture",label: "Proximal Humerus Fracture" },
  { value: "inflammatory-arthritis",   label: "Inflammatory Arthritis (RA / PsA)" },
  { value: "revision-arthroplasty",    label: "Revision Arthroplasty" },
  { value: "instability-arthropathy",  label: "Instability Arthropathy" },
];

const BONE_QUALITY_OPTIONS = [
  { value: "excellent", label: "Excellent — dense cortical, normal T-score" },
  { value: "good",      label: "Good — normal density, minor changes" },
  { value: "fair",      label: "Fair — mild osteopenia (T: -1.0 to -2.0)" },
  { value: "poor",      label: "Poor — moderate osteopenia (T < -2.0)" },
  { value: "osteoporotic", label: "Osteoporotic — T-score < -2.5, fragility risk" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary",  label: "Sedentary — minimal physical activity" },
  { value: "low",        label: "Low — light ADL, no sport" },
  { value: "moderate",   label: "Moderate — walking, light recreation" },
  { value: "high",       label: "High — regular sport, manual labour" },
  { value: "very_high",  label: "Very High — competitive sport, heavy labour" },
];

const SCORE_COLORS = [
  "hsl(188,100%,45%)", "hsl(210,100%,60%)", "hsl(160,80%,50%)",
  "hsl(40,100%,60%)", "hsl(280,70%,60%)", "hsl(215,20%,45%)",
  "hsl(340,70%,55%)", "hsl(25,90%,55%)", "hsl(188,60%,35%)",
];

type Step = "intake" | "implants" | "running" | "results";

const defaultProfile: Omit<PatientProfile, "scanId"> = {
  age: 68,
  sex: "male",
  weight: 84,
  height: 175,
  diagnosis: "glenohumeral-arthritis",
  boneQuality: "good",
  activityLevel: "moderate",
  dominantSide: "right",
  affectedSide: "right",
  priorSurgery: false,
  smoker: false,
  diabetes: false,
};

// ─── Helper Components ────────────────────────────────────────────────────────
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-white mb-1.5">
      {children}
      {hint && (
        <div className="relative">
          <Info
            className="w-3.5 h-3.5 text-[hsl(215,20%,40%)] cursor-help"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
          />
          {show && (
            <div className="absolute left-5 top-0 w-56 bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,24%)] rounded p-2 text-xs text-[hsl(215,20%,65%)] z-50 shadow-xl leading-relaxed">
              {hint}
            </div>
          )}
        </div>
      )}
    </label>
  );
}

function ScoreBadge({ score, contraindicated }: { score: number; contraindicated: boolean }) {
  if (contraindicated) return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[hsl(0,62%,40%,0.15)] border border-[hsl(0,62%,40%,0.4)] text-[hsl(0,62%,65%)]">
      ✗ Contraindicated
    </span>
  );
  const color = score >= 85 ? "hsl(188,100%,45%)" : score >= 72 ? "hsl(40,100%,60%)" : "hsl(215,20%,50%)";
  const bg = score >= 85 ? "hsl(188,100%,45%,0.1)" : score >= 72 ? "hsl(40,100%,60%,0.1)" : "hsl(215,20%,16%)";
  const border = score >= 85 ? "hsl(188,100%,45%,0.4)" : score >= 72 ? "hsl(40,100%,60%,0.4)" : "hsl(215,20%,25%)";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ color, background: bg, border: `1px solid ${border}` }}>
      {score.toFixed(1)}%
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Low: "bg-[hsl(160,80%,50%,0.1)] border-[hsl(160,80%,50%,0.35)] text-[hsl(160,80%,55%)]",
    Moderate: "bg-[hsl(40,100%,60%,0.1)] border-[hsl(40,100%,60%,0.35)] text-[hsl(40,100%,65%)]",
    High: "bg-[hsl(0,62%,50%,0.1)] border-[hsl(0,62%,50%,0.35)] text-[hsl(0,62%,65%)]",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[level] ?? styles.Moderate}`}>
      {level} Risk
    </span>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,20%)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,35%)] focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Simulation() {
  const [step, setStep] = useState<Step>("intake");
  const [profile, setProfile] = useState<Omit<PatientProfile, "scanId">>(defaultProfile);
  const [selectedImplants, setSelectedImplants] = useState<string[]>([]);
  const [compareAll, setCompareAll] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"scores" | "rom" | "stress" | "wear">("scores");
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback(<K extends keyof typeof profile>(k: K, v: typeof profile[K]) => {
    setProfile(p => ({ ...p, [k]: v }));
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) setFileName(e.dataTransfer.files[0].name);
  };

  const toggleImplant = (id: string) => {
    setSelectedImplants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const PROGRESS_STEPS = [
    "Parsing patient demographics...",
    "Loading DICOM bone model...",
    "Running AI bone segmentation...",
    "Generating 3D mesh...",
    "Initialising FEA solver...",
    "Applying muscle force model...",
    "Running biomechanical simulation...",
    "Scoring implant configurations...",
    "Applying AI outcome prediction...",
    "Computing ROM trajectories...",
    "Calculating wear projections...",
    "Generating surgical recommendation...",
    "Compiling report...",
  ];

  const runSim = () => {
    setStep("running");
    setProgress(0);
    let p = 0;
    let msgIdx = 0;
    setProgressMsg(PROGRESS_STEPS[0]);

    intervalRef.current = setInterval(() => {
      p += Math.random() * 5 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(intervalRef.current!);
        const scanId = `SSM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const fullProfile: PatientProfile = { ...profile, scanId };
        const implantIds = compareAll ? [] : selectedImplants;
        const result = runSimulation(fullProfile, implantIds);
        setReport(result);
        setActiveTab("scores");
        setExpandedResult(null);
        setTimeout(() => setStep("results"), 600);
      } else {
        const newMsgIdx = Math.min(Math.floor(p / (100 / PROGRESS_STEPS.length)), PROGRESS_STEPS.length - 1);
        if (newMsgIdx !== msgIdx) { msgIdx = newMsgIdx; setProgressMsg(PROGRESS_STEPS[newMsgIdx]); }
      }
      setProgress(Math.min(p, 100));
    }, 130);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep("intake");
    setReport(null);
    setProgress(0);
    setFileName(null);
  };

  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const bmiColor = bmi > 35 ? "hsl(0,62%,55%)" : bmi > 30 ? "hsl(40,100%,60%)" : "hsl(188,100%,45%)";

  // ── STEP: Patient Intake ──────────────────────────────────────────────────
  if (step === "intake") return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-2">AI Simulation Lab</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Patient Intake & Simulation Setup</h1>
          <p className="text-[hsl(215,20%,60%)] max-w-2xl text-sm">Enter patient clinical parameters. The AI biomechanical engine will simulate implant performance, predict outcomes, and generate a ranked recommendation — all based on your inputs.</p>
          <div className="flex items-center gap-6 mt-4">
            {[{ n: "01", l: "Patient Profile" }, { n: "02", l: "Implant Selection" }, { n: "03", l: "AI Simulation" }, { n: "04", l: "Results" }].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i === 0 ? "border-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.2)] text-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,24%)] text-[hsl(215,20%,40%)]"}`}>{s.n}</div>
                <span className={`text-xs font-medium hidden sm:block ${i === 0 ? "text-[hsl(188,100%,45%)]" : "text-[hsl(215,20%,40%)]"}`}>{s.l}</span>
                {i < 3 && <div className="w-6 h-px bg-[hsl(217,32%,20%)]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scan upload */}
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileUp className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">CT / MRI Scan</h2>
                <span className="text-xs text-[hsl(215,20%,45%)]">(optional — demo uses pre-loaded anonymized case)</span>
              </div>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${fileName ? "border-[hsl(188,100%,45%,0.5)] bg-[hsl(188,100%,45%,0.04)]" : "border-[hsl(217,32%,22%)] hover:border-[hsl(188,100%,45%,0.35)] hover:bg-[hsl(217,32%,10%)]"}`}
                onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              >
                <input type="file" id="scan-upload" className="hidden" accept=".dcm,.dicom,.nii,.gz" onChange={handleFile} />
                <label htmlFor="scan-upload" className="cursor-pointer">
                  {fileName
                    ? <><CheckCircle className="w-8 h-8 text-[hsl(188,100%,45%)] mx-auto mb-2" /><div className="text-sm font-semibold text-[hsl(188,100%,45%)]">{fileName}</div><div className="text-xs text-[hsl(215,20%,50%)] mt-0.5">Scan loaded — ready for simulation</div></>
                    : <><Upload className="w-8 h-8 text-[hsl(215,20%,35%)] mx-auto mb-2" /><div className="text-sm font-semibold text-white mb-1">Drop DICOM / NIfTI here or click to browse</div><div className="text-xs text-[hsl(215,20%,50%)]">CT preferred (≤1.5mm slices). MRI T1/T2 accepted.</div></>}
                </label>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Patient Demographics</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Age" hint="Patient age in years. Affects implant type preference and risk scoring.">
                  <div className="flex items-center gap-3">
                    <input type="range" min={40} max={90} value={profile.age} onChange={e => update("age", +e.target.value)}
                      className="flex-1 accent-[hsl(188,100%,45%)]" />
                    <span className="text-[hsl(188,100%,45%)] font-bold font-mono w-12 text-right">{profile.age} yrs</span>
                  </div>
                </Field>
                <Field label="Biological Sex">
                  <div className="flex gap-2">
                    {(["male","female"] as const).map(s => (
                      <button key={s} onClick={() => update("sex", s)}
                        className={`flex-1 py-2.5 rounded text-sm font-semibold capitalize transition-colors ${profile.sex === s ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)]" : "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,60%)] hover:bg-[hsl(217,32%,18%)]"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Weight (kg)" hint="Used to calculate BMI and joint load multipliers.">
                  <div className="flex items-center gap-3">
                    <input type="range" min={45} max={150} value={profile.weight} onChange={e => update("weight", +e.target.value)} className="flex-1 accent-[hsl(188,100%,45%)]" />
                    <span className="text-white font-mono w-14 text-right font-bold">{profile.weight} kg</span>
                  </div>
                </Field>
                <Field label="Height (cm)">
                  <div className="flex items-center gap-3">
                    <input type="range" min={145} max={210} value={profile.height} onChange={e => update("height", +e.target.value)} className="flex-1 accent-[hsl(188,100%,45%)]" />
                    <span className="text-white font-mono w-14 text-right font-bold">{profile.height} cm</span>
                  </div>
                </Field>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-[hsl(215,20%,45%)]">BMI:</span>
                <span className="font-bold font-mono" style={{ color: bmiColor }}>{bmi.toFixed(1)}</span>
                <span style={{ color: bmiColor }}>
                  {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : bmi < 35 ? "Obese I" : "Obese II+"}
                </span>
              </div>
            </div>

            {/* Clinical Parameters */}
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Clinical Parameters</h2>
              </div>
              <div className="space-y-4">
                <Field label="Primary Diagnosis" hint="Primary indication for shoulder arthroplasty. Has the highest impact on implant type selection.">
                  <select value={profile.diagnosis} onChange={e => update("diagnosis", e.target.value)} className={selectCls}>
                    {DIAGNOSES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Bone Quality" hint="Based on DEXA scan or intraoperative assessment. Determines fixation strategy and stemless suitability.">
                    <select value={profile.boneQuality} onChange={e => update("boneQuality", e.target.value as PatientProfile["boneQuality"])} className={selectCls}>
                      {BONE_QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Activity Level" hint="Determines joint load multipliers for wear and stress calculations.">
                    <select value={profile.activityLevel} onChange={e => update("activityLevel", e.target.value as PatientProfile["activityLevel"])} className={selectCls}>
                      {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Dominant Side">
                    <div className="flex gap-2">
                      {(["left","right"] as const).map(s => (
                        <button key={s} onClick={() => update("dominantSide", s)}
                          className={`flex-1 py-2.5 rounded text-sm font-semibold capitalize transition-colors ${profile.dominantSide === s ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)]" : "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,60%)] hover:bg-[hsl(217,32%,18%)]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Affected Side">
                    <div className="flex gap-2">
                      {(["left","right"] as const).map(s => (
                        <button key={s} onClick={() => update("affectedSide", s)}
                          className={`flex-1 py-2.5 rounded text-sm font-semibold capitalize transition-colors ${profile.affectedSide === s ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)]" : "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,60%)] hover:bg-[hsl(217,32%,18%)]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Comorbidities & Risk Factors</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {([
                  { key: "priorSurgery", label: "Prior Shoulder Surgery", hint: "Increases risk, may limit stemless options" },
                  { key: "smoker",       label: "Active Smoker",           hint: "Impairs osseointegration; increases infection risk" },
                  { key: "diabetes",     label: "Diabetes Mellitus",        hint: "2-3× infection risk; tight glycemic control required" },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => update(f.key, !profile[f.key])}
                    className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                      profile[f.key]
                        ? "border-[hsl(0,62%,50%,0.5)] bg-[hsl(0,62%,50%,0.08)] text-white"
                        : "border-[hsl(217,32%,20%)] text-[hsl(215,20%,55%)] hover:border-[hsl(217,32%,30%)]"
                    }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mb-2 transition-colors ${profile[f.key] ? "bg-[hsl(0,62%,50%)] border-[hsl(0,62%,50%)]" : "border-[hsl(217,32%,30%)]"}`}>
                      {profile[f.key] && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className="text-xs font-semibold">{f.label}</span>
                    <span className="text-xs text-[hsl(215,20%,45%)] mt-0.5 leading-snug">{f.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar summary */}
          <div className="space-y-5">
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 sticky top-20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(215,20%,45%)] mb-4">Patient Summary</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { l: "Age", v: `${profile.age} years old` },
                  { l: "Sex", v: profile.sex === "male" ? "Male" : "Female" },
                  { l: "BMI", v: `${bmi.toFixed(1)} kg/m²` },
                  { l: "Diagnosis", v: DIAGNOSES.find(d => d.value === profile.diagnosis)?.label.split(" ")[0] ?? "" },
                  { l: "Bone Quality", v: profile.boneQuality.charAt(0).toUpperCase() + profile.boneQuality.slice(1) },
                  { l: "Activity", v: profile.activityLevel.replace("_", " ") },
                  { l: "Affected Side", v: profile.affectedSide.charAt(0).toUpperCase() + profile.affectedSide.slice(1) },
                ].map(row => (
                  <div key={row.l} className="flex justify-between gap-2">
                    <span className="text-[hsl(215,20%,45%)]">{row.l}</span>
                    <span className="text-white font-medium text-right">{row.v}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-2">
                  <span className="text-[hsl(215,20%,45%)]">Risk flags</span>
                  <span className={`font-medium ${[profile.priorSurgery, profile.smoker, profile.diabetes].filter(Boolean).length > 1 ? "text-[hsl(0,62%,60%)]" : "text-white"}`}>
                    {[profile.priorSurgery && "Prior Sx", profile.smoker && "Smoker", profile.diabetes && "DM"].filter(Boolean).join(", ") || "None"}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[hsl(217,32%,14%)]">
                <div className="text-xs text-[hsl(215,20%,45%)] mb-1">Expected implant class</div>
                <div className="text-sm font-bold text-[hsl(188,100%,45%)]">
                  {profile.diagnosis === "rotator-cuff-arthropathy" ? "Reverse Shoulder" :
                   profile.diagnosis === "proximal-humerus-fracture" ? "Reverse / Stemmed TSA" :
                   (profile.boneQuality === "excellent" || profile.boneQuality === "good") && profile.age < 65 ? "Stemless Total Shoulder" :
                   "Total Shoulder / Reverse"}
                </div>
              </div>
              <button
                onClick={() => setStep("implants")}
                className="mt-5 w-full py-3 rounded font-semibold text-sm bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors flex items-center justify-center gap-2"
              >
                Next: Select Implants →
              </button>
            </div>
            <div className="bg-[hsl(188,100%,45%,0.05)] border border-[hsl(188,100%,45%,0.2)] rounded-xl p-4 text-xs text-[hsl(215,20%,55%)]">
              <div className="text-[hsl(188,100%,45%)] font-semibold mb-2 text-xs uppercase tracking-wide">How it works</div>
              <ul className="space-y-1.5 leading-relaxed">
                <li>• Demographics feed BMI + load multipliers</li>
                <li>• Diagnosis determines implant class weighting</li>
                <li>• Bone quality governs fixation strategy</li>
                <li>• Activity level drives stress + wear rates</li>
                <li>• Comorbidities add clinical risk penalties</li>
                <li>• Results are unique to every patient profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP: Implant Selection ────────────────────────────────────────────────
  if (step === "implants") return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-2">Step 2 of 4</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Implant Selection</h1>
          <p className="text-[hsl(215,20%,60%)] text-sm">Choose which implants to compare, or run against the full library.</p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCompareAll(a => !a)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${compareAll ? "border-[hsl(188,100%,45%,0.5)] bg-[hsl(188,100%,45%,0.1)] text-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)]"}`}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${compareAll ? "bg-[hsl(188,100%,45%)] border-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,30%)]"}`}>
              {compareAll && <span className="text-[hsl(222,47%,6%)] text-xs font-bold">✓</span>}
            </div>
            Compare all {IMPLANT_LIBRARY.length} implants in library
          </button>
          <span className="text-xs text-[hsl(215,20%,45%)]">{compareAll ? `All ${IMPLANT_LIBRARY.length}` : `${selectedImplants.length}`} selected</span>
        </div>
        <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${compareAll ? "opacity-40 pointer-events-none" : ""}`}>
          {IMPLANT_LIBRARY.map(imp => {
            const sel = selectedImplants.includes(imp.id);
            return (
              <button key={imp.id} onClick={() => toggleImplant(imp.id)}
                className={`text-left p-4 rounded-xl border transition-all ${sel ? "border-[hsl(188,100%,45%,0.5)] bg-[hsl(188,100%,45%,0.06)]" : "border-[hsl(217,32%,16%)] bg-[hsl(222,47%,8%)] hover:border-[hsl(217,32%,28%)]"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${sel ? "bg-[hsl(188,100%,45%)] border-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,30%)]"}`}>
                    {sel && <span className="text-[hsl(222,47%,6%)] text-xs font-bold">✓</span>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    imp.type === "Reverse Shoulder" ? "bg-[hsl(210,100%,60%,0.1)] border-[hsl(210,100%,60%,0.3)] text-[hsl(210,100%,70%)]" :
                    imp.type === "Stemless Total" ? "bg-[hsl(160,80%,50%,0.1)] border-[hsl(160,80%,50%,0.3)] text-[hsl(160,80%,60%)]" :
                    imp.type === "Partial" ? "bg-[hsl(40,100%,60%,0.1)] border-[hsl(40,100%,60%,0.3)] text-[hsl(40,100%,65%)]" :
                    "bg-[hsl(188,100%,45%,0.1)] border-[hsl(188,100%,45%,0.3)] text-[hsl(188,100%,50%)]"
                  }`}>{imp.type}</span>
                </div>
                <div className="text-sm font-bold text-white mb-0.5">{imp.name}</div>
                <div className="text-xs text-[hsl(215,20%,50%)]">{imp.manufacturer}</div>
                <div className="text-xs text-[hsl(215,20%,40%)] mt-1 font-mono">{imp.catalogRef}</div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setStep("intake")} className="px-5 py-3 rounded border border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)] hover:border-[hsl(217,32%,30%)] text-sm font-semibold transition-colors">
            ← Back
          </button>
          <button onClick={runSim}
            disabled={!compareAll && selectedImplants.length === 0}
            className="flex-1 py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-cyan">
            <Play className="w-4 h-4" />
            Run AI Biomechanical Simulation
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP: Running ─────────────────────────────────────────────────────────
  if (step === "running") return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[hsl(217,32%,20%)]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[hsl(188,100%,45%)] animate-spin" />
          <div className="absolute inset-3 rounded-full border-2 border-[hsl(188,100%,45%,0.2)] flex items-center justify-center">
            <span className="text-[hsl(188,100%,45%)] font-bold font-mono text-sm">{Math.round(progress)}%</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Running Simulation</h2>
        <p className="text-sm text-[hsl(188,100%,45%)] font-mono mb-6 h-5 transition-all">{progressMsg}</p>
        <div className="w-full h-2 bg-[hsl(217,32%,14%)] rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all duration-200 bg-[hsl(188,100%,45%)]" style={{ width: `${progress}%`, boxShadow: "0 0 12px hsl(188,100%,45%,0.5)" }} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { l: "FEA Mesh", done: progress > 20 },
            { l: "Biomechanical Solver", done: progress > 40 },
            { l: "AI Outcome Model", done: progress > 65 },
            { l: "Wear Projection", done: progress > 78 },
            { l: "Risk Assessment", done: progress > 87 },
            { l: "Report Compilation", done: progress > 95 },
          ].map(s => (
            <div key={s.l} className={`flex items-center gap-2 p-2.5 rounded border transition-colors ${s.done ? "border-[hsl(188,100%,45%,0.3)] bg-[hsl(188,100%,45%,0.05)] text-white" : "border-[hsl(217,32%,16%)] text-[hsl(215,20%,35%)]"}`}>
              <div className={`w-3 h-3 rounded-full border transition-colors ${s.done ? "bg-[hsl(188,100%,45%)] border-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,24%)]"}`} />
              {s.l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP: Results ─────────────────────────────────────────────────────────
  if (!report) return null;
  const top = report.recommendation;

  return (
    <div>
      {/* Header */}
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-[hsl(188,100%,45%)] mb-1">Scan ID: {report.scanId} • {new Date(report.timestamp).toLocaleString()}</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Simulation Results</h1>
              <p className="text-sm text-[hsl(215,20%,55%)] mt-1">{report.patient.age}yo {report.patient.sex} • {DIAGNOSES.find(d => d.value === report.patient.diagnosis)?.label} • {report.bmiCategory} BMI {report.bmi}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded border border-[hsl(217,32%,24%)] text-sm text-[hsl(215,20%,60%)] hover:text-white hover:border-[hsl(217,32%,35%)] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> New Simulation
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded border border-[hsl(188,100%,45%,0.3)] text-sm text-[hsl(188,100%,45%)] hover:bg-[hsl(188,100%,45%,0.1)] transition-colors">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Recommendation hero */}
        <div className="bg-gradient-to-r from-[hsl(188,60%,10%)] to-[hsl(222,47%,8%)] border border-[hsl(188,100%,45%,0.35)] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[hsl(188,100%,45%)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(188,100%,45%)]">AI Recommendation</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[hsl(160,80%,50%,0.15)] border border-[hsl(160,80%,50%,0.3)] text-[hsl(160,80%,55%)]">Grade: {top.grade}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{top.implantName} — {top.recommendedSize}</h2>
              <div className="text-sm text-[hsl(215,20%,60%)] mb-2">{top.manufacturer} &bull; {top.type}</div>
              <div className="text-sm text-[hsl(215,20%,60%)] mb-4">Surgical approach: <span className="text-white font-medium">{report.surgicalApproach}</span></div>
              <p className="text-sm text-[hsl(215,20%,70%)] leading-relaxed mb-4">{report.reportSummary}</p>
              <div className="flex flex-wrap gap-2">
                {top.strengths.slice(0, 4).map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.25)] text-[hsl(188,100%,55%)]">{s}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
              {[
                { l: "AI Score", v: `${top.score}%`, color: "hsl(188,100%,45%)" },
                { l: "Confidence", v: top.grade, color: top.grade === "Excellent" ? "hsl(160,80%,50%)" : "hsl(40,100%,60%)" },
                { l: "Predicted Flexion", v: `${top.rom.flexion}°`, color: "hsl(210,100%,60%)" },
                { l: "10yr Revision", v: `${top.tenYearRevisionProb}%`, color: top.tenYearRevisionProb < 9 ? "hsl(160,80%,50%)" : "hsl(40,100%,60%)" },
                { l: "ASES Estimate", v: `${top.asesEstimate.low}–${top.asesEstimate.high}`, color: "hsl(188,100%,45%)" },
                { l: "Peak Stress", v: `${top.stressMax} MPa`, color: top.stressMax < 60 ? "hsl(160,80%,50%)" : "hsl(40,100%,60%)" },
                { l: "Risk Level", v: top.riskLevel, color: top.riskLevel === "Low" ? "hsl(160,80%,50%)" : top.riskLevel === "Moderate" ? "hsl(40,100%,60%)" : "hsl(0,62%,60%)" },
                { l: "Ext. Rotation", v: `${top.rom.er}°`, color: "hsl(210,100%,60%)" },
              ].map(m => (
                <div key={m.l} className="bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,18%)] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.v}</div>
                  <div className="text-xs text-[hsl(215,20%,45%)] mt-0.5 leading-tight">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart tabs */}
        <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl overflow-hidden">
          <div className="flex border-b border-[hsl(217,32%,16%)] overflow-x-auto">
            {([
              { id: "scores", label: "Implant Scores", Icon: BarChart3 },
              { id: "rom",    label: "Range of Motion", Icon: Activity },
              { id: "stress", label: "Stress Analysis", Icon: Zap },
              { id: "wear",   label: "Wear Projection", Icon: TrendingUp },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? "border-[hsl(188,100%,45%)] text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.05)]" : "border-transparent text-[hsl(215,20%,55%)] hover:text-white"}`}>
                <tab.Icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "scores" && (
              <div>
                <p className="text-xs text-[hsl(215,20%,50%)] mb-4">AI compatibility score (0–100) for each implant against this patient's profile. Higher = better fit. Contraindicated implants scored separately.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.results.map((r, i) => ({ name: r.implantName.split(" ").slice(-2).join(" "), score: r.score, idx: i, ci: r.contraindicated }))} barCategoryGap="25%">
                    <XAxis dataKey="name" tick={{ fill: "hsl(215,20%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(215,20%,40%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid hsl(217,32%,20%)", borderRadius: 8, color: "white", fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Score"]} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {report.results.map((r, i) => (
                        <Cell key={i} fill={r.contraindicated ? "hsl(215,20%,25%)" : r.implantId === top.implantId ? "hsl(188,100%,45%)" : SCORE_COLORS[i % SCORE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === "rom" && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[hsl(215,20%,50%)] mb-4">Predicted post-operative ROM for recommended implant vs. population norms.</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={report.romChartData}>
                      <PolarGrid stroke="hsl(217,32%,20%)" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} />
                      <Radar name="Patient" dataKey="value" stroke="hsl(188,100%,45%)" fill="hsl(188,100%,45%)" fillOpacity={0.2} />
                      <Radar name="Normal" dataKey="normal" stroke="hsl(217,32%,35%)" fill="hsl(217,32%,35%)" fillOpacity={0.1} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215,20%,55%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid hsl(217,32%,20%)", borderRadius: 8, color: "white", fontSize: 12 }} formatter={(v: number) => [`${v}°`]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {report.romChartData.map(d => (
                    <div key={d.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[hsl(215,20%,55%)]">{d.name}</span>
                        <span className="text-white font-mono font-bold">{d.value}° <span className="text-[hsl(215,20%,40%)] font-normal">/ {d.normal}°</span></span>
                      </div>
                      <div className="w-full h-2 bg-[hsl(217,32%,14%)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[hsl(188,100%,45%)]" style={{ width: `${(d.value / d.normal) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "stress" && (
              <div>
                <p className="text-xs text-[hsl(215,20%,50%)] mb-4">Von Mises stress distribution across implant-bone interface zones. Safe threshold shown in red dashed line.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.stressChartData} barCategoryGap="30%">
                    <CartesianGrid stroke="hsl(217,32%,14%)" vertical={false} />
                    <XAxis dataKey="region" tick={{ fill: "hsl(215,20%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215,20%,40%)", fontSize: 10 }} axisLine={false} tickLine={false} unit=" MPa" />
                    <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid hsl(217,32%,20%)", borderRadius: 8, color: "white", fontSize: 12 }} formatter={(v: number) => [`${v} MPa`]} />
                    <Bar dataKey="stress" name="Stress" radius={[4, 4, 0, 0]}>
                      {report.stressChartData.map((d, i) => (
                        <Cell key={i} fill={d.stress > d.safe ? "hsl(0,62%,50%)" : d.stress > d.safe * 0.75 ? "hsl(40,100%,60%)" : "hsl(188,100%,45%)"} />
                      ))}
                    </Bar>
                    <Bar dataKey="safe" name="Safe Threshold" fill="hsl(215,20%,25%)" radius={[4, 4, 0, 0]} fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215,20%,55%)" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === "wear" && (
              <div>
                <p className="text-xs text-[hsl(215,20%,50%)] mb-4">Projected polyethylene liner wear volume (mm³) over implant lifetime for recommended implant at patient's activity level.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={report.wearProjection}>
                    <CartesianGrid stroke="hsl(217,32%,14%)" />
                    <XAxis dataKey="year" tick={{ fill: "hsl(215,20%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Years", position: "insideBottom", offset: -2, fill: "hsl(215,20%,40%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(215,20%,40%)", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "mm³", angle: -90, position: "insideLeft", fill: "hsl(215,20%,40%)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid hsl(217,32%,20%)", borderRadius: 8, color: "white", fontSize: 12 }} formatter={(v: number) => [`${v} mm³`, "Cumulative Wear"]} labelFormatter={(l: number) => `Year ${l}`} />
                    <Line type="monotone" dataKey="wear" stroke="hsl(188,100%,45%)" strokeWidth={2.5} dot={{ fill: "hsl(188,100%,45%)", r: 4 }} name="Wear Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Full ranked table */}
        <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(217,32%,14%)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">All Implant Rankings</h3>
            <span className="text-xs text-[hsl(215,20%,45%)]">{report.results.length} implants evaluated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(217,32%,14%)] text-xs text-[hsl(215,20%,45%)] font-medium">
                  <th className="text-left px-6 py-3">Rank</th>
                  <th className="text-left px-3 py-3">Implant</th>
                  <th className="text-center px-3 py-3">Score</th>
                  <th className="text-center px-3 py-3">Size</th>
                  <th className="text-center px-3 py-3">Flexion</th>
                  <th className="text-center px-3 py-3">Stress</th>
                  <th className="text-center px-3 py-3">10yr Rev.</th>
                  <th className="text-center px-3 py-3">Risk</th>
                  <th className="text-center px-3 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((r, i) => (
                  <>
                    <tr key={r.implantId} className={`border-b border-[hsl(217,32%,10%)] hover:bg-[hsl(217,32%,10%,0.5)] transition-colors ${r.contraindicated ? "opacity-50" : ""}`}>
                      <td className="px-6 py-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 && !r.contraindicated ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)]" : "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,55%)]"}`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-white text-xs">{r.implantName}</div>
                        <div className="text-xs text-[hsl(215,20%,45%)]">{r.manufacturer}</div>
                      </td>
                      <td className="px-3 py-3 text-center"><ScoreBadge score={r.score} contraindicated={r.contraindicated} /></td>
                      <td className="px-3 py-3 text-center text-xs text-[hsl(215,20%,65%)]">{r.recommendedSize}</td>
                      <td className="px-3 py-3 text-center font-mono text-xs text-white">{r.rom.flexion}°</td>
                      <td className="px-3 py-3 text-center font-mono text-xs" style={{ color: r.stressMax < 60 ? "hsl(160,80%,55%)" : r.stressMax < 75 ? "hsl(40,100%,65%)" : "hsl(0,62%,60%)" }}>{r.stressMax} MPa</td>
                      <td className="px-3 py-3 text-center text-xs text-[hsl(215,20%,65%)]">{r.tenYearRevisionProb}%</td>
                      <td className="px-3 py-3 text-center"><RiskBadge level={r.riskLevel} /></td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => setExpandedResult(expandedResult === r.implantId ? null : r.implantId)}
                          className="text-xs text-[hsl(188,100%,45%)] hover:underline flex items-center gap-1 mx-auto">
                          {expandedResult === r.implantId ? "Hide" : "Show"}
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedResult === r.implantId ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>
                    {expandedResult === r.implantId && (
                      <tr key={`${r.implantId}-detail`} className="bg-[hsl(222,47%,6%)]">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid sm:grid-cols-3 gap-4 text-xs">
                            <div>
                              <div className="text-[hsl(215,20%,45%)] font-semibold mb-2 uppercase tracking-widest text-xs">Range of Motion</div>
                              {[["Flexion", `${r.rom.flexion}°`], ["Ext. Rotation", `${r.rom.er}°`], ["Abduction", `${r.rom.abd}°`]].map(([k, v]) => (
                                <div key={k} className="flex justify-between py-1 border-b border-[hsl(217,32%,10%)]">
                                  <span className="text-[hsl(215,20%,55%)]">{k}</span><span className="text-white font-mono">{v}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-[hsl(215,20%,45%)] font-semibold mb-2 uppercase tracking-widest text-xs">Biomechanics</div>
                              {[["Peak Stress", `${r.stressMax} MPa`], ["Contact Pressure", `${r.contactPressure} MPa`], ["Wear Rate", r.wearRate > 0 ? `${r.wearRate} mm³/Mcyc` : "N/A"]].map(([k, v]) => (
                                <div key={k} className="flex justify-between py-1 border-b border-[hsl(217,32%,10%)]">
                                  <span className="text-[hsl(215,20%,55%)]">{k}</span><span className="text-white font-mono">{v}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-[hsl(215,20%,45%)] font-semibold mb-2 uppercase tracking-widest text-xs">Strengths</div>
                              <ul className="space-y-1">{r.strengths.slice(0, 3).map(s => <li key={s} className="text-[hsl(188,100%,55%)] flex gap-1.5"><span className="shrink-0">✓</span>{s}</li>)}</ul>
                              {r.concerns.length > 0 && (
                                <><div className="text-[hsl(215,20%,45%)] font-semibold mt-2 mb-1 uppercase tracking-widest text-xs">Concerns</div>
                                <ul className="space-y-1">{r.concerns.slice(0, 2).map(c => <li key={c} className="text-[hsl(40,100%,65%)] flex gap-1.5"><span className="shrink-0">⚠</span>{c}</li>)}</ul></>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk factors + clinical notes */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[hsl(40,100%,60%)]" />
              <h3 className="text-sm font-bold text-white">Patient Risk Factors</h3>
            </div>
            {report.riskFactors.length === 0
              ? <p className="text-sm text-[hsl(215,20%,55%)]">No significant risk factors identified.</p>
              : <ul className="space-y-2">{report.riskFactors.map(rf => (
                  <li key={rf} className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 mt-0.5 text-[hsl(40,100%,60%)]">⚠</span>
                    <span className="text-[hsl(215,20%,70%)] leading-relaxed">{rf}</span>
                  </li>
                ))}</ul>
            }
          </div>
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-[hsl(188,100%,45%)]" />
              <h3 className="text-sm font-bold text-white">Clinical Notes</h3>
            </div>
            <ul className="space-y-2">{report.clinicalNotes.map(note => (
              <li key={note} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 mt-0.5 text-[hsl(188,100%,45%)]">→</span>
                <span className="text-[hsl(215,20%,70%)] leading-relaxed">{note}</span>
              </li>
            ))}</ul>
            <div className="mt-4 pt-3 border-t border-[hsl(217,32%,14%)] text-xs text-[hsl(215,20%,45%)]">
              Approach rationale: <span className="text-[hsl(215,20%,60%)] leading-relaxed">{report.approachRationale}</span>
            </div>
          </div>
        </div>

        {/* Processing metadata */}
        <div className="text-center text-xs text-[hsl(215,20%,35%)] font-mono pb-4">
          Simulation completed in {report.processingTime}ms &bull; ShoulderSim AI v4.2.1 &bull; FEA mesh: 847,320 elements &bull; {report.results.length} configurations evaluated
        </div>
      </div>
    </div>
  );
}
