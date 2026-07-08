import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, User, ClipboardList, Upload, CheckCircle,
  Activity, ChevronRight, AlertCircle, FileText, X, Scan,
  Heart, Pill, AlertTriangle, Stethoscope, RotateCcw, Target,
  Zap, Camera, Image as ImageIcon, Shield
} from "lucide-react";
import { usePatient, generateAnalysis, type PatientInfo, type ClinicalHistory, type ScanFile } from "@/contexts/PatientContext";
import { WorkflowBanner } from "@/components/WorkflowBanner";

const STEPS = [
  { id: "info", label: "Patient Info", icon: User },
  { id: "clinical", label: "Clinical History", icon: ClipboardList },
  { id: "scans", label: "Scan Upload", icon: Upload },
  { id: "review", label: "Review & Submit", icon: CheckCircle },
];

const SYMPTOMS = [
  "Shoulder pain at rest", "Pain during movement", "Night pain", "Weakness",
  "Grinding/clicking", "Limited ROM", "Swelling", "Numbness/tingling",
  "Instability", "Difficulty overhead", "Pain radiating to arm", "Muscle wasting",
];

const PRIOR_TREATMENTS = [
  "Physiotherapy", "Corticosteroid injections", "NSAIDs / analgesics",
  "Hyaluronic acid injection", "PRP therapy", "Previous arthroscopy",
  "Nerve block", "Activity modification",
];

const ACTIVITIES = [
  "Sedentary (office work)", "Light (walking, light housework)", "Moderate (golf, swimming)",
  "Active (tennis, cycling)", "Very active (gym, sports)", "Manual labor", "Athlete (competitive)",
];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                done ? "bg-teal-500 border-teal-500" : active ? "bg-teal-500/20 border-teal-500" : "bg-[hsl(222,47%,10%)] border-[hsl(217,32%,20%)]"
              }`}>
                {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-500"}`} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? "text-teal-400" : done ? "text-teal-500" : "text-slate-500"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mb-5 mx-1 transition-all duration-500 ${done ? "bg-teal-500" : "bg-[hsl(217,32%,18%)]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepInfo({ onNext }: { onNext: (d: PatientInfo) => void }) {
  const [form, setForm] = useState({ name: "", dob: "", mrn: "", sex: "M", age: "", weight: "", height: "", phone: "", email: "", insurance: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.dob) e.dob = "Required";
    if (!form.mrn.trim()) e.mrn = "Required";
    if (!form.age || isNaN(Number(form.age))) e.age = "Valid age required";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ ...form, sex: form.sex as "M" | "F", age: Number(form.age) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Patient Demographics</h2>
        <p className="text-sm text-slate-400">Enter the patient's personal and contact information</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { k: "name", label: "Full Name *", placeholder: "e.g. James Robertson", col: 2 },
          { k: "dob", label: "Date of Birth *", type: "date" },
          { k: "age", label: "Age *", placeholder: "e.g. 67", type: "number" },
          { k: "sex", label: "Sex *", type: "select", opts: [{ v: "M", l: "Male" }, { v: "F", l: "Female" }] },
          { k: "mrn", label: "Medical Record No. *", placeholder: "e.g. MRN-2026-0142" },
          { k: "insurance", label: "Insurance / Policy No.", placeholder: "e.g. BCBS-12345678" },
          { k: "weight", label: "Weight (kg)", placeholder: "e.g. 82 kg" },
          { k: "height", label: "Height (cm)", placeholder: "e.g. 175 cm" },
          { k: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
          { k: "email", label: "Email Address", placeholder: "patient@email.com", type: "email" },
        ].map(f => (
          <div key={f.k} className={f.col === 2 ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
            {f.type === "select" ? (
              <select value={(form as Record<string,string>)[f.k]} onChange={e => set(f.k, e.target.value)}
                className="w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-lg text-white text-sm outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all">
                {f.opts?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ) : (
              <input type={f.type || "text"} value={(form as Record<string,string>)[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder}
                className={`w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all ${errors[f.k] ? "border-red-500/60" : "border-[hsl(217,32%,18%)]"}`} />
            )}
            {errors[f.k] && <p className="text-xs text-red-400 mt-1">{errors[f.k]}</p>}
          </div>
        ))}
      </div>
      <button onClick={submit} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20">
        Continue to Clinical History <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepClinical({ info, onNext, onBack }: { info: PatientInfo; onNext: (d: ClinicalHistory) => void; onBack: () => void }) {
  const [form, setForm] = useState({
    diagnosis: "", affectedSide: "Right", painScore: 5, activityLevel: ACTIVITIES[0],
    durationMonths: 6, previousSurgeries: "", medications: "", allergies: "",
    surgeon: "Dr. Sarah Chen", facility: "ShoulderSIM Medical Center",
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleTreatment = (t: string) => setSelectedTreatments(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const submit = () => {
    if (!form.diagnosis.trim()) { setErrors({ diagnosis: "Required" }); return; }
    onNext({
      ...form, affectedSide: form.affectedSide as "Left" | "Right" | "Bilateral",
      symptoms: selectedSymptoms, priorTreatments: selectedTreatments,
    });
  };

  const painColors = ["bg-green-500", "bg-green-400", "bg-lime-400", "bg-yellow-400", "bg-yellow-500", "bg-orange-400", "bg-orange-500", "bg-red-400", "bg-red-500", "bg-red-600", "bg-red-700"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Clinical History — {info.name}</h2>
        <p className="text-sm text-slate-400">Document the patient's shoulder condition and treatment history</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Primary Diagnosis *</label>
          <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Glenohumeral Osteoarthritis — Walch B2"
            className={`w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-teal-500/60 transition-all ${errors.diagnosis ? "border-red-500/60" : "border-[hsl(217,32%,18%)]"}`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Affected Side</label>
          <div className="flex gap-2">
            {["Left", "Right", "Bilateral"].map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, affectedSide: s }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.affectedSide === s ? "bg-teal-500/20 border-teal-500 text-teal-400" : "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,18%)] text-slate-400 hover:border-slate-500"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Duration (months)</label>
          <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-lg text-white text-sm outline-none focus:border-teal-500/60 transition-all" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pain Score: <span className="text-white text-sm">{form.painScore}/10</span></label>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${form.painScore <= 3 ? "bg-green-500/20 text-green-400" : form.painScore <= 6 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
            {form.painScore <= 3 ? "Mild" : form.painScore <= 6 ? "Moderate" : "Severe"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 11 }, (_, i) => (
            <button key={i} onClick={() => setForm(f => ({ ...f, painScore: i }))}
              className={`flex-1 h-8 rounded text-xs font-bold transition-all ${i === form.painScore ? `${painColors[i]} text-white scale-110 shadow-lg` : "bg-[hsl(222,47%,10%)] text-slate-500 hover:bg-[hsl(222,47%,14%)]"}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Symptoms (select all that apply)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SYMPTOMS.map(s => (
            <button key={s} onClick={() => toggleSymptom(s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left border transition-all ${selectedSymptoms.includes(s) ? "bg-teal-500/15 border-teal-500/50 text-teal-300" : "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,16%)] text-slate-400 hover:border-slate-500"}`}>
              {selectedSymptoms.includes(s) && <CheckCircle className="w-3 h-3 shrink-0 text-teal-400" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Activity Level</label>
        <select value={form.activityLevel} onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value }))}
          className="w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-lg text-white text-sm outline-none focus:border-teal-500/60 transition-all">
          {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Prior Treatments</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIOR_TREATMENTS.map(t => (
            <button key={t} onClick={() => toggleTreatment(t)}
              className={`px-3 py-2 rounded-lg text-xs text-left border transition-all ${selectedTreatments.includes(t) ? "bg-teal-500/15 border-teal-500/50 text-teal-300" : "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,16%)] text-slate-400 hover:border-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { k: "surgeon", label: "Attending Surgeon" },
          { k: "facility", label: "Facility / Hospital" },
        ].map(f => (
          <div key={f.k}>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
            <input value={(form as unknown as Record<string, string>)[f.k]} onChange={e => setForm(fv => ({ ...fv, [f.k]: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-lg text-white text-sm outline-none focus:border-teal-500/60 transition-all" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20">
          Continue to Scan Upload <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const MODALITY_CONFIG = {
  MRI: { icon: Scan, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", label: "MRI", desc: "Soft tissue detail, rotator cuff assessment" },
  CT: { icon: Activity, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", label: "CT Scan", desc: "Bone morphology, glenoid version analysis" },
  XRAY: { icon: ImageIcon, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "X-Ray", desc: "Joint alignment, bone density assessment" },
  DICOM: { icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "DICOM", desc: "Full resolution medical imaging data" },
};

function StepScans({ info, clinical, onNext, onBack }: { info: PatientInfo; clinical: ClinicalHistory; onNext: (s: ScanFile[]) => void; onBack: () => void }) {
  const [files, setFiles] = useState<ScanFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [quest, setQuest] = useState({ previousSurgeries: clinical.previousSurgeries, medications: clinical.medications, allergies: clinical.allergies, contrastAllergy: "No", pacemaker: "No", claustrophobia: "No", kidneyDisease: "No", pregnancyStatus: "N/A" });
  const fileRef = useRef<HTMLInputElement>(null);

  const detectModality = (name: string): ScanFile["modality"] => {
    const n = name.toLowerCase();
    if (n.endsWith(".dcm") || n.includes("dicom")) return "DICOM";
    if (n.includes("mri") || n.includes("mr_")) return "MRI";
    if (n.includes("ct") || n.includes("scan")) return "CT";
    return "XRAY";
  };

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(file => {
      const modality = detectModality(file.name);
      const sf: ScanFile = { name: file.name, type: file.type || "application/octet-stream", size: file.size, uploadedAt: new Date().toISOString(), modality };
      setUploading(file.name);
      setTimeout(() => {
        setUploading(null);
        setFiles(prev => [...prev.filter(f => f.name !== file.name), sf]);
        setShowQuestionnaire(true);
      }, 1200 + Math.random() * 800);
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

  const submit = () => {
    if (files.length === 0) return;
    onNext(files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Medical Scan Upload — {info.name}</h2>
        <p className="text-sm text-slate-400">Upload MRI, CT, X-Ray, or DICOM files for AI analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(MODALITY_CONFIG).map(([key, cfg]) => (
          <div key={key} className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} text-center`}>
            <cfg.icon className={`w-5 h-5 ${cfg.color} mx-auto mb-1`} />
            <p className="text-xs font-bold text-white">{cfg.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cfg.desc}</p>
          </div>
        ))}
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${dragging ? "border-teal-400 bg-teal-500/10 scale-[1.01]" : "border-[hsl(217,32%,22%)] hover:border-teal-500/50 hover:bg-teal-500/5 bg-[hsl(222,47%,7%)]"}`}
      >
        <input ref={fileRef} type="file" multiple accept=".dcm,.jpg,.jpeg,.png,.dicom,image/*" className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-teal-400" />
        </div>
        <p className="text-white font-semibold mb-1">Drop scan files here or click to browse</p>
        <p className="text-sm text-slate-400">Supports DICOM (.dcm), MRI, CT, X-Ray — any format</p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {["MRI Series", "CT Axial", "DICOM Files", "X-Ray AP/Lat"].map(t => (
            <span key={t} className="px-2 py-1 bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,18%)] rounded text-xs text-slate-400">{t}</span>
          ))}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-2xl bg-[hsl(222,47%,7%)]/80 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-teal-300 font-medium">Uploading {uploading}…</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{files.length} file{files.length !== 1 ? "s" : ""} ready for analysis</p>
          {files.map(f => {
            const cfg = MODALITY_CONFIG[f.modality];
            return (
              <div key={f.name} className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{cfg.label} · {(f.size / 1024).toFixed(0)} KB</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <button onClick={() => removeFile(f.name)} className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center">
                  <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Safety Questionnaire</p>
                <p className="text-xs text-slate-400">Required before AI scan analysis — takes 60 seconds</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { k: "contrastAllergy", label: "Contrast agent allergy?", opts: ["No", "Yes — iodine", "Yes — gadolinium", "Unknown"] },
                { k: "pacemaker", label: "Pacemaker or metal implants?", opts: ["No", "Yes — pacemaker", "Yes — other metal", "Unsure"] },
                { k: "claustrophobia", label: "Claustrophobia (for MRI)?", opts: ["No", "Mild", "Moderate — may need sedation", "Severe"] },
                { k: "kidneyDisease", label: "Kidney disease (eGFR concern)?", opts: ["No", "Yes — CKD Stage 3", "Yes — CKD Stage 4/5", "Unknown"] },
                { k: "pregnancyStatus", label: "Pregnancy status", opts: ["N/A", "Not pregnant", "Possibly pregnant", "Pregnant"] },
              ].map(q => (
                <div key={q.k}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">{q.label}</label>
                  <select value={(quest as Record<string, string>)[q.k]} onChange={e => setQuest(v => ({ ...v, [q.k]: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg text-white text-sm outline-none focus:border-amber-500/50 transition-all">
                    {q.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Current Medications</label>
              <textarea value={quest.medications} onChange={e => setQuest(v => ({ ...v, medications: e.target.value }))} rows={2} placeholder="e.g. Aspirin 81mg, Metformin 500mg, Lisinopril 10mg…"
                className="w-full px-3 py-2 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-amber-500/50 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Known Allergies</label>
              <input value={quest.allergies} onChange={e => setQuest(v => ({ ...v, allergies: e.target.value }))} placeholder="e.g. Penicillin, latex, sulfa drugs…"
                className="w-full px-3 py-2 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-amber-500/50 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Previous Shoulder Surgeries</label>
              <textarea value={quest.previousSurgeries} onChange={e => setQuest(v => ({ ...v, previousSurgeries: e.target.value }))} rows={2} placeholder="e.g. Right shoulder arthroscopy 2019 (rotator cuff repair)…"
                className="w-full px-3 py-2 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-amber-500/50 transition-all resize-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && (
        <div className="rounded-xl border border-[hsl(217,32%,18%)] bg-[hsl(222,47%,7%)] p-4 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-slate-400">Upload at least one scan file to proceed. The AI analysis requires imaging data to generate recommendations.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={submit} disabled={files.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20">
          Continue to Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StepReview({ info, clinical, scans, onBack, onSubmit }: {
  info: PatientInfo; clinical: ClinicalHistory; scans: ScanFile[]; onBack: () => void; onSubmit: () => void;
}) {
  const sections = [
    {
      icon: User, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20",
      title: "Patient Information",
      rows: [["Name", info.name], ["MRN", info.mrn], ["DOB", info.dob], ["Age / Sex", `${info.age} years, ${info.sex === "M" ? "Male" : "Female"}`], ["Weight / Height", `${info.weight || "—"} / ${info.height || "—"}`]],
    },
    {
      icon: Stethoscope, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20",
      title: "Clinical Summary",
      rows: [["Diagnosis", clinical.diagnosis], ["Affected Side", clinical.affectedSide], ["Pain Score", `${clinical.painScore}/10 (${clinical.painScore <= 3 ? "Mild" : clinical.painScore <= 6 ? "Moderate" : "Severe"})`], ["Duration", `${clinical.durationMonths} months`], ["Surgeon", clinical.surgeon]],
    },
    {
      icon: Scan, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
      title: "Uploaded Scans",
      rows: scans.map(s => [s.modality, s.name]),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Review & Confirm</h2>
        <p className="text-sm text-slate-400">Verify all information before starting AI analysis</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {sections.map(s => (
          <div key={s.title} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs font-bold text-white uppercase tracking-wide">{s.title}</p>
            </div>
            <div className="space-y-2">
              {s.rows.map(([label, val], i) => (
                <div key={i}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className="text-xs text-slate-200 font-medium truncate">{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {clinical.symptoms.length > 0 && (
        <div className="rounded-xl border border-[hsl(217,32%,18%)] bg-[hsl(222,47%,8%)] p-4">
          <p className="text-xs font-bold text-white uppercase tracking-wide mb-3">Reported Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {clinical.symptoms.map(s => (
              <span key={s} className="px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-300">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Ready to Start AI Analysis</p>
            <p className="text-xs text-slate-400">ShoulderSIM AI will analyze the uploaded scans and clinical data to generate bone structure detection, rotator cuff assessment, cartilage condition grading, implant recommendations, and a comprehensive surgical planning report.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onSubmit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-teal-500/30 shadow-xl">
          <Zap className="w-4 h-4" /> Start AI Analysis
        </button>
      </div>
    </div>
  );
}

export default function PatientIntakePage() {
  const [step, setStep] = useState(0);
  const { state, setInfo, setClinical, setScans, markStep } = usePatient();
  const [, setLocation] = useLocation();

  const handleInfo = (info: PatientInfo) => {
    setInfo(info); markStep("info"); setStep(1);
  };
  const handleClinical = (c: ClinicalHistory) => {
    setClinical(c); markStep("clinical"); setStep(2);
  };
  const handleScans = (s: ScanFile[]) => {
    setScans(s); markStep("scans"); setStep(3);
  };
  const handleSubmit = () => {
    markStep("review");
    setLocation("/scan-analysis");
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)]">
      <header className="border-b border-[hsl(217,32%,12%)] bg-[hsl(222,47%,5%)]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <div className="w-px h-4 bg-[hsl(217,32%,18%)]" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <span className="text-sm font-semibold text-white">Patient Intake</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.completedSteps.length > 0 && (
              <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</span>
            )}
          </div>
        </div>
      </header>
      <WorkflowBanner current="info" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <ProgressBar step={step} />
        <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {step === 0 && <StepInfo onNext={handleInfo} />}
              {step === 1 && state.info && <StepClinical info={state.info} onNext={handleClinical} onBack={() => setStep(0)} />}
              {step === 2 && state.info && state.clinical && <StepScans info={state.info} clinical={state.clinical} onNext={handleScans} onBack={() => setStep(1)} />}
              {step === 3 && state.info && state.clinical && <StepReview info={state.info} clinical={state.clinical} scans={state.scans} onBack={() => setStep(2)} onSubmit={handleSubmit} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
