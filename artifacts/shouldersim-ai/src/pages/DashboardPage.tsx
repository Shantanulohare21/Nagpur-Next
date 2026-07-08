import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  Activity, ArrowLeft, Upload, BarChart3, Users, FileText,
  TrendingUp, Clock, Check, ChevronRight, X, Download,
  Brain, AlertTriangle, Zap, Star, Plus, Trash2, Eye,
  MessageSquare, Share2, Bell, Settings
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

const savedCases = [
  { id: "P-2024-0142", patient: "James R., 67M", diagnosis: "Glenohumeral OA Stage IV", implant: "TSA — Arthrex Univers", aiScore: 96, date: "May 26, 2026", status: "Ready for Review", tags: ["Primary", "TSA"] },
  { id: "P-2024-0138", patient: "Susan K., 58F", diagnosis: "Rotator Cuff Tear + OA", implant: "RSA — Zimmer Comprehensive", aiScore: 91, date: "May 24, 2026", status: "Simulation Complete", tags: ["Reverse", "Complex"] },
  { id: "P-2024-0129", patient: "Robert M., 72M", diagnosis: "Humeral Head AVN", implant: "Resurfacing — Eclipse", aiScore: 84, date: "May 22, 2026", status: "Pending Review", tags: ["Resurfacing"] },
  { id: "P-2024-0117", patient: "Maria L., 63F", diagnosis: "Post-traumatic OA", implant: "TSA — Global AP", aiScore: 89, date: "May 19, 2026", status: "Simulation Complete", tags: ["Primary", "TSA"] },
  { id: "P-2024-0108", patient: "William C., 70M", diagnosis: "Cuff Tear Arthropathy", implant: "RSA — Arthrex IDES", aiScore: 93, date: "May 16, 2026", status: "Exported PDF", tags: ["Reverse"] },
];

const monthlyData = [
  { month: "Jan", simulations: 48, surgeries: 12, exports: 38 },
  { month: "Feb", simulations: 62, surgeries: 18, exports: 54 },
  { month: "Mar", simulations: 71, surgeries: 22, exports: 60 },
  { month: "Apr", simulations: 88, surgeries: 28, exports: 75 },
  { month: "May", simulations: 104, surgeries: 34, exports: 91 },
  { month: "Jun", simulations: 119, surgeries: 38, exports: 102 },
];

const outcomeData = [
  { name: "Excellent", value: 48, fill: "#22c55e" },
  { name: "Good", value: 35, fill: "#06b6d4" },
  { name: "Fair", value: 12, fill: "#f59e0b" },
  { name: "Poor", value: 5, fill: "#ef4444" },
];

const complicationData = [
  { name: "None", value: 74 },
  { name: "Notching", value: 11 },
  { name: "Migration", value: 7 },
  { name: "Loosening", value: 5 },
  { name: "Infection", value: 3 },
];

const teamMembers = [
  { name: "Dr. Sarah Chen", role: "Lead Surgeon", avatar: "SC", status: "online", cases: 42 },
  { name: "Dr. James Novak", role: "Orthopedic Fellow", avatar: "JN", status: "online", cases: 18 },
  { name: "Dr. Priya Mehta", role: "Research Lead", avatar: "PM", status: "away", cases: 31 },
  { name: "Dr. Tom Erikson", role: "Sports Medicine", avatar: "TE", status: "offline", cases: 27 },
];

const notes = [
  { author: "Dr. Sarah Chen", time: "2h ago", content: "Case P-2024-0142 — recommend reviewing anteversion, CT shows subtle retroversion. Consider 15° instead of 20°.", tags: ["Planning", "Urgent"] },
  { author: "Dr. James Novak", time: "5h ago", content: "Arthrex Univers availability confirmed for next week OR block. TSA cases P-0142 and P-0117 can proceed.", tags: ["Logistics"] },
  { author: "Dr. Priya Mehta", time: "1d ago", content: "New Exactech Equinoxe RSA study published — 15yr survival 88.3%. Updated library scores accordingly.", tags: ["Research"] },
];

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Cases", value: "142K+", delta: "+18%", icon: FileText, color: "text-primary" },
          { label: "Simulations Today", value: "23", delta: "+4", icon: Brain, color: "text-secondary" },
          { label: "Avg. AI Score", value: "91.4", delta: "+0.8", icon: Star, color: "text-yellow-400" },
          { label: "PDFs Exported", value: "3,841", delta: "+12%", icon: Download, color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="bg-card/50 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-green-400 mt-1">{s.delta} this month</div>
          </div>
        ))}
      </div>
      <div className="bg-card/50 border border-border/60 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-4">Platform Activity (2026)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.96)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="simulations" name="Simulations" stroke="#06b6d4" fill="rgba(6,182,212,0.08)" strokeWidth={2} />
              <Area type="monotone" dataKey="exports" name="PDF Exports" stroke="#3b82f6" fill="rgba(59,130,246,0.06)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card/50 border border-border/60 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold mb-4">Outcome Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="h-[140px] w-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" strokeWidth={0}>
                    {outcomeData.map((e) => <Cell key={e.name} fill={e.fill} opacity={0.9} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              {outcomeData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />{d.name}</div>
                  <span className="font-mono font-bold" style={{ color: d.fill }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-card/50 border border-border/60 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold mb-4">Complication Rates</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complicationData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "rgba(15,23,42,0.96)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" name="%" fill="#06b6d4" opacity={0.8} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function DicomSection() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const startUpload = () => {
    setUploadState("uploading");
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 15;
      setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(t); setUploadState("processing"); setTimeout(() => setUploadState("done"), 2000); }
    }, 200);
  };

  const steps = [
    { label: "DICOM Upload", desc: "Upload CT/MRI DICOM series via secure upload", done: uploadState === "done" || uploadState === "processing" },
    { label: "AI Segmentation", desc: "Automated bone segmentation and mesh generation", done: uploadState === "done" },
    { label: "3D Reconstruction", desc: "Patient-specific 3D anatomy model created", done: false },
    { label: "Simulation Ready", desc: "Model loaded into simulation workspace", done: false },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card/50 border border-border/60 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-1">DICOM / CT / MRI Upload</h3>
        <p className="text-xs text-muted-foreground mb-5">Upload patient scan data for AI-powered 3D reconstruction and simulation preparation.</p>

        {uploadState === "idle" && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); startUpload(); }}
            onClick={startUpload}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-primary/60 bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-primary/3"}`}>
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop DICOM files here or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports .dcm, .nii, .nii.gz, ZIP archive — max 2GB</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
              {["HIPAA Encrypted", "AES-256", "SOC 2 Certified"].map(t => <span key={t} className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" />{t}</span>)}
            </div>
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Uploading scan data…</span><span className="font-mono text-primary">{Math.round(progress)}%</span></div>
            <div className="h-2 bg-border/40 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }}
                className="h-full rounded-full bg-primary" style={{ boxShadow: "0 0 8px rgba(6,182,212,0.5)" }} />
            </div>
            <p className="text-xs text-muted-foreground">CT_SHOULDER_RIGHT_20260526.zip · {Math.round(progress * 14.2 / 100 * 10) / 10} MB / 14.2 MB</p>
          </div>
        )}

        {(uploadState === "processing" || uploadState === "done") && (
          <div className="space-y-3">
            {steps.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${s.done ? "bg-green-500/5 border-green-500/20" : "bg-background/40 border-border/40"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${s.done ? "bg-green-500/20 text-green-400" : "bg-border/30 text-muted-foreground"}`}>
                  {s.done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${s.done ? "text-green-400" : "text-muted-foreground"}`}>{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
                {i === 1 && uploadState === "processing" && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="ml-auto">
                    <Brain className="w-4 h-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            ))}
            {uploadState === "done" && (
              <Link href="/simulation" className="mt-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                Open in Simulation Workspace <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Scan preview mock */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-4">Recent Scan Preview</h3>
        <div className="grid grid-cols-3 gap-3">
          {["Coronal", "Sagittal", "Axial"].map((view, i) => (
            <div key={view} className="rounded-lg overflow-hidden border border-border/40 aspect-square relative"
              style={{ background: `radial-gradient(ellipse at ${40 + i * 10}% ${40 + i * 5}%, rgba(6,182,212,0.08), rgba(0,0,0,0.9))` }}>
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <defs>
                  <pattern id={`scan-grid-${i}`} width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#scan-grid-${i})`} />
              </svg>
              {/* Mock anatomy shape */}
              <svg className="absolute inset-0 w-full h-full">
                <ellipse cx="50%" cy="50%" rx="28%" ry="35%" fill="none" stroke="rgba(226,232,240,0.25)" strokeWidth="1"/>
                <ellipse cx="50%" cy="42%" rx="18%" ry="22%" fill="none" stroke="rgba(226,232,240,0.35)" strokeWidth="0.8"/>
                <circle cx="52%" cy="46%" r="14%" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.8" strokeDasharray="3,2"/>
              </svg>
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-primary/80">{view}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">P-2024-0142 · CT Right Shoulder · 512×512 · 128 slices · 0.6mm slice thickness</p>
      </div>
    </div>
  );
}

function CasesSection() {
  const [compareSelected, setCompareSelected] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saved Simulations ({savedCases.length})</h3>
        <div className="flex items-center gap-2">
          {compareSelected.length >= 2 && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
              Compare ({compareSelected.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all">
            <Plus className="w-3.5 h-3.5" />New Case
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {savedCases.map((c) => {
          const sel = compareSelected.includes(c.id);
          return (
            <motion.div key={c.id} layout className={`bg-card/50 border rounded-xl p-4 backdrop-blur-sm transition-all ${sel ? "border-primary/50 ring-1 ring-primary/15" : "border-border/60 hover:border-border/80"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button onClick={() => setCompareSelected(s => s.includes(c.id) ? s.filter(x => x !== c.id) : s.length < 3 ? [...s, c.id] : s)}
                    className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${sel ? "bg-primary border-primary" : "border-border/60"}`}>
                    {sel && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{c.patient}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                      {c.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-border/30 text-[9px] text-muted-foreground border border-border/40">{t}</span>)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{c.diagnosis}</div>
                    <div className="text-[11px] text-primary mt-1">{c.implant}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-base font-display font-bold ${c.aiScore >= 93 ? "text-green-400" : c.aiScore >= 87 ? "text-yellow-400" : "text-orange-400"}`}>{c.aiScore}</div>
                  <div className="text-[9px] text-muted-foreground">AI Score</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${c.status === "Exported PDF" ? "bg-green-500/10 text-green-400 border-green-500/20" : c.status === "Simulation Complete" ? "bg-primary/10 text-primary border-primary/20" : c.status === "Ready for Review" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-border/30 text-muted-foreground border-border/40"}`}>
                    <span className="w-1 h-1 rounded-full bg-current" />{c.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{c.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href="/simulation" className="p-1.5 rounded-lg bg-border/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Eye className="w-3.5 h-3.5" /></Link>
                  <button className="p-1.5 rounded-lg bg-border/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Download className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg bg-border/30 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CollaborationSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Surgical Team</h3>
        <div className="space-y-3">
          {teamMembers.map(m => (
            <div key={m.name} className="flex items-center gap-3 p-3 bg-card/50 border border-border/60 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-[11px] text-muted-foreground">{m.role}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-[10px] flex items-center gap-1 justify-end ${m.status === "online" ? "text-green-400" : m.status === "away" ? "text-yellow-400" : "text-muted-foreground"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />{m.status}
                </div>
                <div className="text-[10px] text-muted-foreground">{m.cases} cases</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 rounded-lg bg-border/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><MessageSquare className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg bg-border/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Share2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-2.5 rounded-xl bg-card/40 border border-dashed border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2">
          <Plus className="w-3.5 h-3.5" />Invite Colleague
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Team Notes</h3>
          <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add Note</button>
        </div>
        <div className="space-y-3">
          {notes.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 bg-card/50 border border-border/60 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-[9px] font-bold text-primary">{n.author.split(" ").map(w => w[0]).join("")}</div>
                  <span className="text-xs font-medium">{n.author}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{n.content}</p>
              <div className="flex gap-1.5">
                {n.tags.map(t => <span key={t} className={`px-2 py-0.5 rounded text-[9px] border ${t === "Urgent" ? "bg-red-500/10 text-red-400 border-red-500/20" : t === "Research" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-border/30 text-muted-foreground border-border/40"}`}>{t}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "dicom", label: "DICOM Upload", icon: Upload },
    { id: "cases", label: "My Cases", icon: FileText },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "collaboration", label: "Collaboration", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Link>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /><span className="font-display font-bold text-sm">Surgeon <span className="text-primary">Dashboard</span></span></div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">SC</div>
          </div>
        </div>
      </header>
      <WorkflowBanner current="info" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[200px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-card/60"}`}>
                <s.icon className="w-4 h-4 flex-shrink-0" />{s.label}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-border/40">
              <Link href="/simulation" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
                <Zap className="w-4 h-4" />New Simulation
              </Link>
              <Link href="/implants" className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
                <Star className="w-4 h-4" />Implant Library
              </Link>
            </div>
          </div>

          {/* Main content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === "overview" && <OverviewSection />}
              {activeSection === "dicom" && <DicomSection />}
              {activeSection === "cases" && <CasesSection />}
              {activeSection === "analytics" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold">Research Analytics Dashboard</h3>
                  <OverviewSection />
                </div>
              )}
              {activeSection === "collaboration" && <CollaborationSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
