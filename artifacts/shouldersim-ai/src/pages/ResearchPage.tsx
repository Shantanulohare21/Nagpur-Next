import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Microscope, Database, Download, BarChart3, TrendingUp,
  Users, Filter, Search, FileText, Calendar, Globe, Award, Shield,
  ChevronRight, Plus, BookOpen, Zap, Activity, Brain, Star,
  GitBranch, Clock, Check, AlertTriangle, ArrowUpRight, Package
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, Legend
} from "recharts";

/* ─── DATA ─── */
const studyData = [
  { id: "STU-2024-001", title: "Long-term RSA Outcomes in Cuff Tear Arthropathy", pi: "Dr. Sarah Chen", institution: "Mayo Clinic", status: "Active", phase: "Data Collection", patients: 312, enrolled: 289, startDate: "Jan 2024", implant: "RSA — Multiple", metric: "10yr ROM + Revision", aiScore: 94 },
  { id: "STU-2024-002", title: "AI-Predicted vs. Actual ROM in TSA Patients", pi: "Dr. James Novak", institution: "HSS New York", status: "Analysis", phase: "Data Analysis", patients: 180, enrolled: 180, startDate: "Sep 2023", implant: "TSA — Arthrex Univers", metric: "ROM Accuracy at 2yr", aiScore: 97 },
  { id: "STU-2024-003", title: "Walch B2 Glenoid Augmented vs. Corrective Reaming", pi: "Dr. Priya Mehta", institution: "Johns Hopkins", status: "Active", phase: "Enrollment", patients: 240, enrolled: 112, startDate: "Mar 2024", implant: "TSA — Augmented Glenoid", metric: "Glenoid Survival 5yr", aiScore: 91 },
  { id: "STU-2024-004", title: "Stemless TSA in Patients Under 60: 5-Year Results", pi: "Dr. Tom Erikson", institution: "Stanford Medicine", status: "Published", phase: "Published", patients: 95, enrolled: 95, startDate: "Jan 2020", implant: "Zimmer Sidus Stem-Free", metric: "Bone Preservation + ROM", aiScore: 88 },
  { id: "STU-2023-007", title: "Predictive Biomarkers for Aseptic Loosening", pi: "Dr. Sarah Chen", institution: "Mayo Clinic", status: "Complete", phase: "Complete", patients: 420, enrolled: 420, startDate: "Jun 2022", implant: "Multiple", metric: "Loosening at 3yr", aiScore: 93 },
];

const survivalCurveData = [
  { year: 0, arthrex: 100, zimmer: 100, depuy: 100 },
  { year: 1, arthrex: 99.4, zimmer: 99.1, depuy: 99.0 },
  { year: 2, arthrex: 98.8, zimmer: 98.3, depuy: 98.1 },
  { year: 3, arthrex: 98.1, zimmer: 97.4, depuy: 97.2 },
  { year: 5, arthrex: 97.2, zimmer: 96.1, depuy: 95.8 },
  { year: 7, arthrex: 96.1, zimmer: 94.4, depuy: 93.9 },
  { year: 10, arthrex: 94.3, zimmer: 92.1, depuy: 91.6 },
  { year: 12, arthrex: 92.8, zimmer: 89.3, depuy: 88.7 },
];

const romDistribution = [
  { label: "<100°", preop: 18, postop: 2 },
  { label: "100–120°", preop: 35, postop: 8 },
  { label: "120–140°", preop: 30, postop: 24 },
  { label: "140–160°", preop: 14, postop: 41 },
  { label: ">160°", preop: 3, postop: 25 },
];

const outcomeCohortData = [
  { name: "TSA — Primary", ases: 78, vr12: 52, satisfaction: 88 },
  { name: "RSA — Primary", ases: 74, vr12: 49, satisfaction: 85 },
  { name: "TSA — Revision", ases: 64, vr12: 43, satisfaction: 76 },
  { name: "RSA — Revision", ases: 61, vr12: 41, satisfaction: 72 },
  { name: "Resurfacing", ases: 72, vr12: 51, satisfaction: 82 },
];

const PUBLICATIONS = [
  { title: "AI-Driven Implant Selection in TSA: A Multicenter Validation", journal: "JBJS", year: 2025, impact: 5.3, citations: 47, type: "Clinical Study" },
  { title: "Finite Element Analysis of Glenoid Loosening Mechanisms", journal: "J Biomech", year: 2025, impact: 3.1, citations: 23, type: "Biomechanics" },
  { title: "Machine Learning Prediction of RSA Scapular Notching", journal: "J Shoulder Elbow", year: 2024, impact: 4.2, citations: 61, type: "AI/ML" },
  { title: "Patient-Specific Digital Twins for Shoulder Arthroplasty Planning", journal: "Bone Joint J", year: 2024, impact: 4.7, citations: 89, type: "Digital Twin" },
  { title: "WebXR-Assisted Surgical Training: RCT Results", journal: "J Surg Educ", year: 2024, impact: 2.8, citations: 34, type: "VR/AR" },
];

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    Active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    Analysis: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    Published: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    Complete: "bg-[hsl(189,94%,40%,0.1)] border-[hsl(189,94%,40%,0.3)] text-[hsl(189,94%,60%)]",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${m[status] || "border-[hsl(217,32%,20%)] text-[hsl(215,20%,50%)]"}`}>{status}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[hsl(215,20%,60%)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>{p.name.includes("survival") || p.name.includes("arthrex") || p.name.includes("zimmer") || p.name.includes("depuy") ? "%" : ""}</p>
      ))}
    </div>
  );
};

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "studies" | "outcomes" | "publications">("overview");
  const [searchStudy, setSearchStudy] = useState("");

  const filteredStudies = studyData.filter(s => !searchStudy || s.title.toLowerCase().includes(searchStudy.toLowerCase()) || s.pi.toLowerCase().includes(searchStudy.toLowerCase()));

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
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/40 flex items-center justify-center">
                <Microscope className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h1 className="text-sm font-bold text-white">Research &amp; Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(215,20%,40%)] hidden sm:block">IRB-Compliant · GDPR Ready</span>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)] text-xs hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export Dataset
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className="border-b border-[hsl(217,32%,14%)] bg-[hsl(222,47%,6%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0.5">
            {(["overview", "studies", "outcomes", "publications"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 capitalize ${
                  activeTab === t ? "border-[hsl(189,94%,40%)] text-[hsl(189,94%,60%)]" : "border-transparent text-[hsl(215,20%,50%)] hover:text-white"
                }`}
              >
                {t === "overview" ? "Overview" : t === "studies" ? "Clinical Studies" : t === "outcomes" ? "Outcome Data" : "Publications"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Active Studies", val: "3", sub: "Multi-center trials", icon: Microscope, color: "text-[hsl(189,94%,40%)]", bg: "bg-[hsl(189,94%,40%,0.1)]" },
                { label: "Total Patients", val: "1,247", sub: "Enrolled across studies", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Publications", val: "5", sub: "Peer-reviewed journals", icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10" },
                { label: "Dataset Records", val: "50,000+", sub: "Surgical outcomes", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              ].map(s => (
                <div key={s.label} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{s.val}</p>
                  <p className="text-xs text-[hsl(215,20%,45%)] mt-0.5">{s.label}</p>
                  <p className="text-xs text-[hsl(215,20%,35%)]">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Implant survival */}
              <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Kaplan-Meier Implant Survival Curves</h3>
                <p className="text-xs text-[hsl(215,20%,45%)] mb-4">Pooled dataset · 12-year follow-up · n=1,247</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={survivalCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,32%,16%)" />
                    <XAxis dataKey="year" stroke="hsl(215,20%,40%)" tick={{ fontSize: 11 }} label={{ value: "Years", position: "insideBottom", offset: -4, fill: "hsl(215,20%,40%)", fontSize: 11 }} />
                    <YAxis domain={[85, 101]} stroke="hsl(215,20%,40%)" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215,20%,55%)" }} />
                    <Line type="monotone" dataKey="arthrex" stroke="hsl(189,94%,40%)" strokeWidth={2} dot={false} name="Arthrex TSA" />
                    <Line type="monotone" dataKey="zimmer" stroke="#818cf8" strokeWidth={2} dot={false} name="Zimmer RSA" />
                    <Line type="monotone" dataKey="depuy" stroke="#fb923c" strokeWidth={2} dot={false} name="DePuy TSA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ROM distribution */}
              <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">ROM Distribution: Pre-op vs. 2yr Post-op</h3>
                <p className="text-xs text-[hsl(215,20%,45%)] mb-4">Flexion arc — Primary TSA cohort · n=312</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={romDistribution} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,32%,16%)" />
                    <XAxis dataKey="label" stroke="hsl(215,20%,40%)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(215,20%,40%)" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215,20%,55%)" }} />
                    <Bar dataKey="preop" name="Pre-op" fill="hsl(215,20%,30%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="postop" name="2yr Post-op" fill="hsl(189,94%,40%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outcome scores */}
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Functional Outcome Scores by Cohort</h3>
              <p className="text-xs text-[hsl(215,20%,45%)] mb-4">ASES score, VR-12 Physical, Patient Satisfaction % — 2-year outcomes</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={outcomeCohortData} barGap={4} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,32%,16%)" />
                  <XAxis dataKey="name" stroke="hsl(215,20%,40%)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="hsl(215,20%,40%)" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215,20%,55%)" }} />
                  <Bar dataKey="ases" name="ASES Score" fill="hsl(189,94%,40%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="vr12" name="VR-12 Physical" fill="#818cf8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="satisfaction" name="Satisfaction %" fill="#34d399" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === "studies" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(215,20%,40%)]" />
                <input
                  value={searchStudy}
                  onChange={e => setSearchStudy(e.target.value)}
                  placeholder="Search studies by title or PI…"
                  className="w-full pl-9 pr-3 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg text-sm text-white placeholder-[hsl(215,20%,35%)] outline-none focus:border-[hsl(189,94%,40%,0.5)]"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(189,94%,40%)] text-[hsl(222,47%,5%)] font-semibold text-sm hover:bg-[hsl(189,94%,45%)] transition-colors">
                <Plus className="w-4 h-4" />
                New Study
              </button>
            </div>
            <div className="space-y-4">
              {filteredStudies.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 hover:border-[hsl(217,32%,24%)] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-[hsl(215,20%,50%)]">
                        <span>{s.pi}</span>
                        <span>·</span>
                        <span>{s.institution}</span>
                        <span>·</span>
                        <span>Started {s.startDate}</span>
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    {[
                      { label: "Target N", val: s.patients },
                      { label: "Enrolled", val: s.enrolled },
                      { label: "Implant", val: s.implant },
                      { label: "Primary Metric", val: s.metric },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-[hsl(215,20%,40%)]">{f.label}</p>
                        <p className="text-xs font-medium text-white mt-0.5 truncate">{f.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[hsl(215,20%,45%)]">Enrollment progress</span>
                        <span className="text-[hsl(189,94%,40%)]">{Math.round((s.enrolled / s.patients) * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(217,32%,14%)]">
                        <div className="h-full rounded-full bg-[hsl(189,94%,40%)]" style={{ width: `${(s.enrolled / s.patients) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[hsl(189,94%,40%)]">AI Confidence: {s.aiScore}%</span>
                    <button className="text-[hsl(215,20%,50%)] hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "outcomes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">10-Year Revision Rates by Implant Type</h3>
              <div className="space-y-3">
                {[
                  { label: "TSA — Augmented Glenoid", rate: 3.8, n: 212 },
                  { label: "RSA — Lateralized", rate: 4.2, n: 341 },
                  { label: "TSA — Standard Glenoid", rate: 6.1, n: 189 },
                  { label: "Stemless TSA", rate: 4.9, n: 98 },
                  { label: "RSA — Standard", rate: 7.3, n: 156 },
                  { label: "Resurfacing", rate: 5.4, n: 74 },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[hsl(215,20%,60%)]">{r.label}</span>
                      <span className="text-white font-medium">{r.rate}% <span className="text-[hsl(215,20%,40%)]">(n={r.n})</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(217,32%,14%)]">
                      <div className={`h-full rounded-full ${r.rate < 5 ? "bg-emerald-500" : r.rate < 6.5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(r.rate / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Patient Satisfaction by Diagnosis</h3>
              <div className="space-y-3">
                {[
                  { dx: "Primary OA (TSA)", satisfied: 91, neutral: 7, poor: 2 },
                  { dx: "Cuff Tear Arthropathy (RSA)", satisfied: 84, neutral: 11, poor: 5 },
                  { dx: "Post-traumatic OA", satisfied: 79, neutral: 14, poor: 7 },
                  { dx: "Inflammatory Arthritis", satisfied: 82, neutral: 12, poor: 6 },
                  { dx: "AVN", satisfied: 76, neutral: 16, poor: 8 },
                  { dx: "Revision", satisfied: 68, neutral: 22, poor: 10 },
                ].map(r => (
                  <div key={r.dx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[hsl(215,20%,60%)]">{r.dx}</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${r.satisfied}%` }} title={`Satisfied: ${r.satisfied}%`} />
                      <div className="bg-amber-500 h-full" style={{ width: `${r.neutral}%` }} title={`Neutral: ${r.neutral}%`} />
                      <div className="bg-red-500 h-full rounded-r-full flex-1" title={`Poor: ${r.poor}%`} />
                    </div>
                    <div className="flex gap-4 text-xs mt-0.5 text-[hsl(215,20%,40%)]">
                      <span className="text-emerald-400">{r.satisfied}% satisfied</span>
                      <span className="text-amber-400">{r.neutral}% neutral</span>
                      <span className="text-red-400">{r.poor}% poor</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "publications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {PUBLICATIONS.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-5 hover:border-[hsl(217,32%,24%)] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1 text-[hsl(215,20%,55%)]"><BookOpen className="w-3 h-3" />{p.journal}</span>
                      <span className="flex items-center gap-1 text-[hsl(215,20%,55%)]"><Calendar className="w-3 h-3" />{p.year}</span>
                      <span className="flex items-center gap-1 text-[hsl(189,94%,40%)]"><Star className="w-3 h-3" />IF: {p.impact}</span>
                      <span className="flex items-center gap-1 text-[hsl(215,20%,55%)]"><GitBranch className="w-3 h-3" />{p.citations} citations</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{p.type}</span>
                    <button className="flex items-center gap-1 text-xs text-[hsl(215,20%,50%)] hover:text-white transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      View Paper
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
