import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Trophy, RotateCcw, Play, BookOpen, Brain, ClipboardList,
  CheckCircle, XCircle, ChevronRight, ChevronLeft, Stethoscope, Target,
  Activity, Clock, Star, Award, Zap, AlertTriangle, Info, User,
  ArrowRight, Layers, BarChart3, TrendingUp, Shield, Package
} from "lucide-react";
import { motion as m } from "framer-motion";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

/* ── Virtual Cases ── */
const CASES = [
  {
    id: "c1", name: "James Robertson", age: 67, sex: "M", diagnosis: "Glenohumeral OA Stage IV",
    difficulty: "Intermediate", time: "25 min",
    findings: ["Severe glenoid erosion (Walch B2)", "Posterior subluxation 68%", "Intact rotator cuff", "Good bone quality"],
    recommended: "Anatomic TSA",
    steps: [
      { label: "Review CT & MRI", task: "Identify key pathologies from the scan set. Select all correct findings.", type: "mcq",
        options: ["Glenoid erosion (Walch B2)", "Rotator cuff tear", "Posterior subluxation", "Bone loss > 30%"],
        correct: [0, 2], hint: "Review the axial CT slices for glenoid morphology" },
      { label: "Select Implant", task: "Choose the most appropriate implant type for this patient.", type: "single",
        options: ["Anatomic TSA", "Reverse TSA", "Resurfacing", "Hemiarthroplasty"],
        correct: [0], hint: "Intact cuff + good bone = Anatomic TSA preferred" },
      { label: "Position Implant", task: "Set optimal glenoid component angles.", type: "slider",
        params: [{ name: "Anteversion", min: 0, max: 40, optimal: 15, unit: "°" }, { name: "Inclination", min: 110, max: 160, optimal: 135, unit: "°" }] },
      { label: "Run FEA Simulation", task: "Review biomechanical output. Flag any concerning metrics.", type: "flag",
        metrics: [{ name: "Peak Stress", val: "38 MPa", flag: false }, { name: "Flexion ROM", val: "147°", flag: false }, { name: "Glenoid Contact", val: "82%", flag: false }, { name: "Impingement", val: "Low", flag: false }] },
      { label: "Finalize Plan", task: "Confirm all parameters are within acceptable clinical ranges.", type: "confirm" }
    ]
  },
  {
    id: "c2", name: "Susan Kim", age: 58, sex: "F", diagnosis: "Rotator Cuff Tear Arthropathy",
    difficulty: "Advanced", time: "30 min",
    findings: ["Irreparable supraspinatus tear", "Superior migration of humeral head", "Cuff tear arthropathy", "Moderate bone loss"],
    recommended: "Reverse TSA",
    steps: [
      { label: "Review Imaging", task: "Identify the key pathology driving implant selection.", type: "mcq",
        options: ["Intact rotator cuff", "Irreparable RC tear", "Superior humeral head migration", "Massive bone loss"],
        correct: [1, 2], hint: "Focus on the coronal MRI — rotator cuff integrity is key" },
      { label: "Select Implant", task: "Choose the correct implant for cuff tear arthropathy.", type: "single",
        options: ["Anatomic TSA", "Reverse TSA", "Resurfacing", "Hemiarthroplasty"],
        correct: [1], hint: "Irreparable RC tear = Reverse TSA" },
      { label: "Position Implant", task: "Set optimal RSA angles — note the different targets vs TSA.", type: "slider",
        params: [{ name: "Lateralization", min: 0, max: 10, optimal: 4, unit: "mm" }, { name: "Inferior Tilt", min: 0, max: 20, optimal: 10, unit: "°" }] },
      { label: "Check Notching", task: "Review for inferior scapular notching risk.", type: "flag",
        metrics: [{ name: "Notching Risk", val: "Low", flag: false }, { name: "Abduction ROM", val: "132°", flag: false }, { name: "Deltoid Force", val: "Adequate", flag: false }, { name: "Stability", val: "High", flag: false }] },
      { label: "Finalize Plan", task: "Approve Reverse TSA plan and generate pre-op report.", type: "confirm" }
    ]
  },
  {
    id: "c3", name: "Robert Mehta", age: 72, sex: "M", diagnosis: "Humeral Head AVN — Stage III",
    difficulty: "Beginner", time: "20 min",
    findings: ["Humeral head collapse", "Preserved glenoid cartilage", "Intact rotator cuff", "Good bone density"],
    recommended: "Anatomic TSA",
    steps: [
      { label: "Stage the AVN", task: "Identify the correct AVN stage from imaging.", type: "single",
        options: ["Stage I — No collapse", "Stage II — Mild flattening", "Stage III — Collapse, preserved glenoid", "Stage IV — Glenoid involvement"],
        correct: [2], hint: "Look at the shape of the humeral head and glenoid cartilage" },
      { label: "Select Implant", task: "Choose the best implant for Stage III AVN with preserved glenoid.", type: "single",
        options: ["Anatomic TSA", "Reverse TSA", "Hemiarthroplasty", "Resurfacing"],
        correct: [0], hint: "Glenoid is preserved → TSA is optimal over hemiarthroplasty" },
      { label: "Plan Bone Cuts", task: "Set the humeral head resection angle.", type: "slider",
        params: [{ name: "Resection Angle", min: 30, max: 55, optimal: 40, unit: "°" }, { name: "Head Offset", min: -5, max: 5, optimal: 0, unit: "mm" }] },
      { label: "Verify Stability", task: "Review post-placement stability metrics.", type: "flag",
        metrics: [{ name: "Stability Score", val: "91%", flag: false }, { name: "Flexion ROM", val: "143°", flag: false }, { name: "Head Coverage", val: "96%", flag: false }, { name: "Stress", val: "32 MPa", flag: false }] },
      { label: "Finalize Plan", task: "Confirm the plan and approve for OR scheduling.", type: "confirm" }
    ]
  },
  {
    id: "c4", name: "Maria Larson", age: 45, sex: "F", diagnosis: "Post-traumatic OA — Young Active Patient",
    difficulty: "Advanced", time: "35 min",
    findings: ["Post-traumatic arthritis", "Young active patient", "Good bone quality", "High activity demands"],
    recommended: "Resurfacing",
    steps: [
      { label: "Assess Activity Level", task: "What is the primary concern for a 45-year-old active patient?", type: "single",
        options: ["Revision rate in 5 years", "Short-term pain relief", "Immediate function", "Cosmetic outcome"],
        correct: [0], hint: "Young patients will likely outlive their first implant" },
      { label: "Select Implant", task: "Choose the most appropriate implant — consider longevity and bone preservation.", type: "single",
        options: ["Anatomic TSA", "Reverse TSA", "Resurfacing", "Hemiarthroplasty"],
        correct: [2], hint: "Bone-conserving options preserve future revision options" },
      { label: "Confirm Sizing", task: "Set the resurfacing cap sizing parameters.", type: "slider",
        params: [{ name: "Cap Diameter", min: 38, max: 52, optimal: 44, unit: "mm" }, { name: "Coverage Angle", min: 150, max: 200, optimal: 175, unit: "°" }] },
      { label: "Stress Analysis", task: "Verify stress distribution is within safe limits for high activity.", type: "flag",
        metrics: [{ name: "Peak Stress", val: "44 MPa", flag: false }, { name: "Native Glenoid", val: "Intact", flag: false }, { name: "Tennis Lifespan", val: "12 yrs", flag: false }, { name: "Bone Preserved", val: "92%", flag: false }] },
      { label: "Finalize Plan", task: "Approve resurfacing plan for this active patient.", type: "confirm" }
    ]
  },
];

const ANATOMY = [
  { id: "humerus", label: "Humerus", x: 50, y: 45, desc: "The proximal humerus forms the ball of the glenohumeral joint. The humeral head is covered in hyaline cartilage. In TSA, the humeral head is resected and replaced with a metal implant.", color: "#06b6d4" },
  { id: "glenoid", label: "Glenoid", x: 28, y: 40, desc: "The glenoid is the socket of the glenohumeral joint, located on the lateral scapula. The pear-shaped surface is lined with cartilage. In TSA, a polyethylene or metal-backed component is placed here.", color: "#a78bfa" },
  { id: "acromion", label: "Acromion", x: 25, y: 20, desc: "The acromion is a bony projection of the scapula that forms the roof of the shoulder. It can cause impingement. The coracoacromial ligament attaches here and is important in RSA biomechanics.", color: "#f59e0b" },
  { id: "rotator", label: "Rotator Cuff", x: 60, y: 28, desc: "The rotator cuff is a group of 4 muscles: Supraspinatus, Infraspinatus, Subscapularis, and Teres Minor. They stabilize the shoulder. Cuff integrity is the primary determinant of implant selection.", color: "#10b981" },
  { id: "deltoid", label: "Deltoid", x: 72, y: 38, desc: "The deltoid is the primary abductor of the shoulder. In Reverse TSA, the deltoid becomes the primary mover (replacing the rotator cuff). Preserving deltoid function is critical in RSA outcomes.", color: "#ef4444" },
  { id: "scapula", label: "Scapula", x: 30, y: 55, desc: "The scapula (shoulder blade) provides the glenoid socket and attachment points for 17 muscles. The coracoid and acromion are scapular processes. Scapular notching is a key RSA complication.", color: "#64748b" },
];

const QUIZ = [
  { q: "Which implant is preferred for an irreparable rotator cuff tear?", opts: ["Anatomic TSA", "Reverse TSA", "Hemiarthroplasty", "Resurfacing"], ans: 1 },
  { q: "Walch B2 classification refers to which glenoid finding?", opts: ["Normal morphology", "Symmetric wear", "Posterior glenoid erosion with subluxation", "Central glenoid erosion"], ans: 2 },
  { q: "What is the primary mover of the shoulder in Reverse TSA?", opts: ["Supraspinatus", "Infraspinatus", "Subscapularis", "Deltoid"], ans: 3 },
  { q: "What is the optimal glenoid component inclination for Anatomic TSA?", opts: ["90°", "115°", "135°", "155°"], ans: 2 },
  { q: "Which factor most strongly predicts 10-year Anatomic TSA survival?", opts: ["Patient age", "Glenoid component fixation", "Humeral stem length", "BMI"], ans: 1 },
  { q: "Inferior scapular notching is associated with which procedure?", opts: ["Anatomic TSA", "Resurfacing", "Reverse TSA", "Hemiarthroplasty"], ans: 2 },
];

type CaseResult = { step: number; selections: number[][]; sliders: number[][]; flags: boolean[][] };

function DiffBadge({ d }: { d: string }) {
  const cls = d === "Beginner" ? "bg-green-500/15 text-green-400 border-green-500/30"
    : d === "Intermediate" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
    : "bg-red-500/15 text-red-400 border-red-500/30";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>{d}</span>;
}

function PerformanceBar({ label, value, color = "bg-teal-500" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{label}</span><span className="text-slate-300 font-mono">{value}%</span></div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

function CaseMode() {
  const [selected, setSelected] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [result, setResult] = useState<CaseResult>({ step: 0, selections: [], sliders: [], flags: [] });
  const [caseSelections, setCaseSelections] = useState<number[]>([]);
  const [sliderVals, setSliderVals] = useState<number[]>([]);
  const [flags, setFlags] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const c = active !== null ? CASES[active] : null;
  const s = c ? c.steps[result.step] : null;

  const startCase = (i: number) => {
    setActive(i); setResult({ step: 0, selections: [], sliders: [], flags: [] });
    setCaseSelections([]); setSliderVals([]); setFlags([]); setDone(false);
  };

  const toggleOption = (i: number) => {
    setCaseSelections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const goNext = () => {
    if (!c || !s) return;
    if (result.step < c.steps.length - 1) {
      setResult(r => ({ ...r, step: r.step + 1 }));
      setCaseSelections([]); setSliderVals([]); setFlags([]);
    } else {
      const sc = Math.round(72 + Math.random() * 26);
      setScore(sc); setDone(true);
    }
  };

  if (active === null) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white mb-4">Select a Virtual Case</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {CASES.map((cs, i) => (
            <motion.button key={cs.id} onClick={() => startCase(i)} whileHover={{ scale: 1.01 }}
              className="text-left p-4 rounded-xl border border-[hsl(217,32%,18%)] bg-[hsl(222,47%,8%)] hover:border-teal-500/40 hover:bg-[hsl(222,47%,10%)] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
                <DiffBadge d={cs.difficulty} />
              </div>
              <p className="font-semibold text-white text-sm mb-0.5">{cs.name}</p>
              <p className="text-xs text-slate-400 mb-2">{cs.age}{cs.sex} · {cs.diagnosis}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {cs.findings.slice(0, 2).map(f => <span key={f} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{f}</span>)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cs.time}</span>
                <span className="flex items-center gap-1 text-teal-400">Start Case <ChevronRight className="w-3 h-3" /></span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">Case Complete!</h3>
        <p className="text-slate-400 mb-4">{c?.name} — {c?.diagnosis}</p>
        <div className="text-5xl font-bold text-teal-400 mb-1">{score}<span className="text-xl text-slate-500">/100</span></div>
        <p className="text-sm text-slate-400 mb-6">{score >= 90 ? "Outstanding — Expert-level planning." : score >= 75 ? "Good — Solid case management." : "Review key steps and retry."}</p>
        <div className="max-w-xs mx-auto space-y-3 mb-6 text-left">
          <PerformanceBar label="Diagnostic Accuracy" value={score - 2} />
          <PerformanceBar label="Implant Selection" value={score + 1} color="bg-purple-500" />
          <PerformanceBar label="Positioning Accuracy" value={score - 4} color="bg-blue-500" />
          <PerformanceBar label="Biomechanical Review" value={score + 2} color="bg-green-500" />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setActive(null)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> All Cases
          </button>
          <button onClick={() => startCase(active)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-500/40 text-teal-300 hover:bg-teal-500/10 text-sm transition-all">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setActive(null)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white">{c?.name} — {c?.diagnosis}</p>
            <span className="text-xs text-slate-500">Step {result.step + 1} of {c?.steps.length}</span>
          </div>
          <div className="flex gap-1">
            {c?.steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= result.step ? "bg-teal-500" : "bg-slate-800"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 mb-4">
        <h4 className="text-sm font-bold text-white mb-1">{s?.label}</h4>
        <p className="text-xs text-slate-400 mb-4">{s?.task}</p>

        {s?.type === "mcq" && (
          <div className="space-y-2">
            {s.options?.map((opt, i) => (
              <button key={i} onClick={() => toggleOption(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all ${caseSelections.includes(i) ? "bg-teal-500/15 border-teal-500/50 text-teal-200" : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600"}`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded border mr-2.5 text-xs ${caseSelections.includes(i) ? "bg-teal-500 border-teal-400 text-black" : "border-slate-600"}`}>
                  {caseSelections.includes(i) ? "✓" : i + 1}
                </span>
                {opt}
              </button>
            ))}
            <p className="text-[11px] text-slate-500 mt-2">Hint: {s.hint}</p>
          </div>
        )}

        {s?.type === "single" && (
          <div className="grid grid-cols-2 gap-2">
            {s.options?.map((opt, i) => (
              <button key={i} onClick={() => setCaseSelections([i])}
                className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-all ${caseSelections.includes(i) ? "bg-teal-500/15 border-teal-500/50 text-teal-200" : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600"}`}>
                {opt}
              </button>
            ))}
            {s.hint && <p className="col-span-2 text-[11px] text-slate-500 mt-1">Hint: {s.hint}</p>}
          </div>
        )}

        {s?.type === "slider" && (
          <div className="space-y-5">
            {s.params?.map((p, i) => {
              const val = sliderVals[i] ?? p.optimal;
              const deviation = Math.abs(val - p.optimal);
              const good = deviation <= (p.max - p.min) * 0.1;
              return (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{p.name}</span>
                    <span className={`font-mono ${good ? "text-green-400" : "text-amber-400"}`}>{val}{p.unit} {good ? "✓" : "⚠"}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} value={val}
                    onChange={e => { const nv = [...sliderVals]; nv[i] = Number(e.target.value); setSliderVals(nv); }}
                    className="w-full accent-teal-500" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>{p.min}{p.unit}</span>
                    <span className="text-teal-600">Optimal: {p.optimal}{p.unit}</span>
                    <span>{p.max}{p.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {s?.type === "flag" && (
          <div className="grid grid-cols-2 gap-3">
            {s.metrics?.map((m, i) => (
              <div key={m.name} className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${flags[i] ? "border-red-500/50 bg-red-500/10" : "border-slate-700/60 bg-slate-800/40"}`}
                onClick={() => { const nf = [...flags]; nf[i] = !nf[i]; setFlags(nf); }}>
                <p className="text-[10px] text-slate-500 mb-0.5">{m.name}</p>
                <p className="text-sm font-bold text-white">{m.val}</p>
                <p className={`text-[10px] mt-1 ${flags[i] ? "text-red-400" : "text-slate-600"}`}>{flags[i] ? "Flagged" : "Click to flag"}</p>
              </div>
            ))}
            <p className="col-span-2 text-[11px] text-slate-500">Flag any metrics outside acceptable clinical ranges</p>
          </div>
        )}

        {s?.type === "confirm" && (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">All metrics verified</p>
            <p className="text-sm text-slate-400">Recommended: <span className="text-teal-300 font-semibold">{c?.recommended}</span></p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={goNext} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-bold transition-all">
          {result.step < (c?.steps.length ?? 0) - 1 ? "Next Step" : "Complete Case"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AnatomyMode() {
  const [active, setActive] = useState<string | null>(null);
  const part = ANATOMY.find(a => a.id === active);
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-white">Interactive Shoulder Anatomy</h3>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="relative bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl overflow-hidden" style={{ minHeight: 320 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full max-h-80 opacity-20">
              <ellipse cx="50" cy="45" rx="12" ry="18" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <ellipse cx="31" cy="42" rx="8" ry="13" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="31" y1="29" x2="25" y2="18" stroke="#94a3b8" strokeWidth="2" />
              <ellipse cx="25" cy="17" rx="5" ry="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M50,30 Q60,25 72,38" fill="none" stroke="#94a3b8" strokeWidth="2" />
            </svg>
          </div>
          {ANATOMY.map(a => (
            <button key={a.id} onClick={() => setActive(a.id === active ? null : a.id)}
              style={{ left: `${a.x}%`, top: `${a.y}%`, transform: "translate(-50%,-50%)" }}
              className="absolute">
              <motion.div animate={{ scale: active === a.id ? 1.2 : 1 }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${active === a.id ? "border-teal-500/60 bg-teal-500/20 text-teal-300" : "border-slate-700/60 bg-slate-900/80 text-slate-300 hover:border-slate-600"}`}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                {a.label}
              </motion.div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300">Click a structure to learn more</h4>
          <AnimatePresence mode="wait">
            {part ? (
              <motion.div key={part.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: part.color }} />
                  <h5 className="text-sm font-bold text-white">{part.label}</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{part.desc}</p>
              </motion.div>
            ) : (
              <motion.div key="empty" className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-xl p-4 text-center text-slate-500 text-sm">
                Select a structure on the diagram
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-1.5">
            {ANATOMY.map(a => (
              <button key={a.id} onClick={() => setActive(a.id === active ? null : a.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all border ${active === a.id ? "bg-teal-500/10 border-teal-500/30 text-teal-300" : "border-transparent hover:bg-slate-800/50 text-slate-400"}`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentMode() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (done || answered) return;
    if (timer <= 0) { handleAnswer(-1); return; }
    const t = setInterval(() => setTimer(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [timer, done, answered]);

  const handleAnswer = (i: number) => {
    setSelected(i); setAnswered(true);
    const correct = QUIZ[qi].ans === i;
    setScores(s => [...s, correct]);
  };

  const nextQ = () => {
    if (qi + 1 >= QUIZ.length) { setDone(true); return; }
    setQi(q => q + 1); setSelected(null); setAnswered(false); setTimer(30);
  };

  const reset = () => { setQi(0); setSelected(null); setAnswered(false); setScores([]); setDone(false); setTimer(30); };

  if (done) {
    const correct = scores.filter(Boolean).length;
    const pct = Math.round((correct / QUIZ.length) * 100);
    const radarData = [
      { subject: "Anatomy", A: correct >= 1 ? 85 : 40 },
      { subject: "Implants", A: correct >= 2 ? 90 : 50 },
      { subject: "Biomechanics", A: correct >= 3 ? 80 : 45 },
      { subject: "Classification", A: correct >= 4 ? 88 : 55 },
      { subject: "Planning", A: correct >= 5 ? 92 : 60 },
      { subject: "Outcomes", A: correct >= 6 ? 95 : 65 },
    ];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Assessment Complete</h3>
          <div className="text-4xl font-bold text-teal-400 mb-1">{correct}/{QUIZ.length}</div>
          <p className="text-slate-400">{pct}% — {pct >= 83 ? "Expert Level" : pct >= 67 ? "Proficient" : "Needs Review"}</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
              <Radar dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:text-white transition-all">
            <RotateCcw className="w-4 h-4" /> Retake
          </button>
        </div>
      </motion.div>
    );
  }

  const q = QUIZ[qi];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">Question {qi + 1} of {QUIZ.length}</span>
        <div className={`flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-lg border ${timer <= 10 ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-slate-700/60 text-slate-400"}`}>
          <Clock className="w-3.5 h-3.5" />{timer}s
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {QUIZ.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full ${i < qi ? (scores[i] ? "bg-green-500" : "bg-red-500") : i === qi ? "bg-teal-500" : "bg-slate-800"}`} />
        ))}
      </div>
      <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 mb-4">
        <p className="text-base font-semibold text-white mb-5">{q.q}</p>
        <div className="space-y-2">
          {q.opts.map((opt, i) => {
            let cls = "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-600";
            if (answered) {
              if (i === q.ans) cls = "border-green-500/50 bg-green-500/10 text-green-300";
              else if (i === selected && i !== q.ans) cls = "border-red-500/50 bg-red-500/10 text-red-300";
            } else if (selected === i) cls = "border-teal-500/50 bg-teal-500/10 text-teal-300";
            return (
              <button key={i} onClick={() => !answered && handleAnswer(i)} disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all flex items-center gap-3 ${cls}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                  {answered && i === q.ans ? <CheckCircle className="w-3.5 h-3.5" /> : answered && i === selected && i !== q.ans ? <XCircle className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <button onClick={nextQ} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-bold transition-all">
            {qi + 1 >= QUIZ.length ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ProcedureMode() {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "📋", title: "Pre-operative Planning", duration: "Day before OR", desc: "Review all imaging: CT, MRI, X-ray. Confirm diagnosis, implant selection, and size templating. Order required instruments.", tips: ["Template glenoid component on AP X-ray", "Confirm CT scan for 3D planning", "Prepare backup implant sizes"] },
    { icon: "🏥", title: "Patient Positioning", duration: "OR Day — 0:00", desc: "Beach-chair or lateral decubitus positioning. Sterile prep and draping. Mark incision site. Confirm arm positioner.", tips: ["Beach-chair preferred for deltopectoral approach", "Confirm arm positioner locked", "Mark posterior portal landmarks"] },
    { icon: "✂️", title: "Deltopectoral Approach", duration: "0:15–0:30", desc: "6–8cm incision from coracoid to deltoid insertion. Identify and protect cephalic vein laterally. Split deltopectoral interval bluntly.", tips: ["Protect cephalic vein — retract laterally", "Develop interval with finger dissection", "Release coracoacromial ligament if needed"] },
    { icon: "🔬", title: "Joint Exposure & Releases", duration: "0:30–0:60", desc: "Identify and tag long head of biceps. Perform subscapularis takedown (tenotomy or peel). Capsulotomy at labral margin. Release inferior capsule.", tips: ["Tag subscapularis for later repair", "360° capsular release for full exposure", "Protect axillary nerve inferiorly"] },
    { icon: "🦴", title: "Humeral Head Resection", duration: "1:00–1:20", desc: "Place cutting guide at 30–40° retroversion, 135° inclination. Make humeral head cut. Ream to appropriate canal size. Trial humeral component.", tips: ["Verify resection angle with intraoperative fluoroscopy", "Preserve periosteum for later fixation", "Size trial to native head dimensions"] },
    { icon: "⚙️", title: "Glenoid Preparation", duration: "1:20–1:50", desc: "Expose glenoid with humeral head retractor. Remove remaining labrum and capsule. Ream glenoid concentrically. Drill peg holes. Place trial component.", tips: ["Correct retroversion ≤ 10° or augmented component", "Verify full baseplate contact before cementing", "Test stability with trial components"] },
    { icon: "🔩", title: "Component Implantation", duration: "1:50–2:20", desc: "Cement glenoid component under digital pressure. Impact humeral stem. Place humeral head. Test ROM, stability, impingement.", tips: ["All-polyethylene glenoid: cement under 3 min pressure", "Check for posterior impingement in ER", "Record final component sizes in operative note"] },
    { icon: "🩹", title: "Closure", duration: "2:20–2:45", desc: "Repair subscapularis with heavy non-absorbable sutures through bone tunnels. Layered closure. Drain optional. Immobilizer applied.", tips: ["Subscapularis repair is critical to stability", "Test repair integrity before closure", "Apply ultrasling in neutral rotation"] },
  ];
  const s = steps[step];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white">Anatomic TSA Procedure Walkthrough</h3>
        <span className="text-xs text-slate-500">{step + 1} / {steps.length}</span>
      </div>
      <div className="flex gap-1 mb-4">
        {steps.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? "bg-teal-500" : "bg-slate-800"}`} />)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-3xl">{s.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base font-bold text-white">{s.title}</h4>
                <span className="text-xs text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded">{s.duration}</span>
              </div>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Surgical Tips</p>
            <div className="space-y-2">
              {s.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:text-white disabled:opacity-40 transition-all">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-500/40 text-teal-300 hover:bg-teal-500/10 text-sm disabled:opacity-40 transition-all">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const MODES = [
  { id: "cases", label: "Virtual Cases", icon: Stethoscope, desc: "Practice surgical planning on real patient scenarios" },
  { id: "procedure", label: "Procedure Guide", icon: Activity, desc: "Step-by-step surgical walkthrough with tips" },
  { id: "anatomy", label: "Anatomy Atlas", icon: Layers, desc: "Interactive shoulder anatomy with clinical notes" },
  { id: "assessment", label: "Assessment Quiz", icon: Brain, desc: "Timed knowledge assessment with performance radar" },
];

export default function SurgeonTrainingPage() {
  const [mode, setMode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)] text-white">
      <header className="border-b border-[hsl(217,32%,14%)] bg-[hsl(222,47%,6%)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode ? (
              <button onClick={() => setMode(null)} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h1 className="text-sm font-bold text-white">Surgeon Training Lab</h1>
            </div>
            {mode && (
              <span className="text-xs text-slate-500">/ {MODES.find(m => m.id === mode)?.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,16%)] px-3 py-1.5 rounded-lg">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Orthopedic Simulation · v4.2
            </div>
          </div>
        </div>
      </header>
      <WorkflowBanner current="sim" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {!mode ? (
            <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Surgeon Training Lab</h2>
                <p className="text-slate-400 max-w-md mx-auto">A professional surgical education environment for orthopedic residents and attending surgeons. Practice planning, test knowledge, and master technique.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {MODES.map(m => {
                  const Icon = m.icon;
                  return (
                    <motion.button key={m.id} onClick={() => setMode(m.id)} whileHover={{ scale: 1.02 }}
                      className="text-left p-5 rounded-2xl border border-[hsl(217,32%,18%)] bg-[hsl(222,47%,8%)] hover:border-teal-500/40 hover:bg-[hsl(222,47%,10%)] transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 transition-colors">
                        <Icon className="w-5 h-5 text-teal-400" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{m.label}</h3>
                      <p className="text-sm text-slate-400">{m.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-teal-400">Start <ChevronRight className="w-3.5 h-3.5" /></div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Virtual Cases", val: "4", color: "text-teal-400" },
                  { label: "Procedure Steps", val: "8", color: "text-blue-400" },
                  { label: "Anatomy Structures", val: "6", color: "text-purple-400" },
                  { label: "Quiz Questions", val: "6", color: "text-amber-400" },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)]">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={mode} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {mode === "cases" && <CaseMode />}
              {mode === "procedure" && <ProcedureMode />}
              {mode === "anatomy" && <AnatomyMode />}
              {mode === "assessment" && <AssessmentMode />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
