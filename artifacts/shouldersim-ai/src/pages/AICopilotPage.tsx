import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  Brain, Send, ArrowLeft, Mic, MicOff, RotateCcw, Copy, Download,
  CheckCircle, AlertTriangle, Info, Zap, FileText, ChevronRight,
  User, Stethoscope, Activity, TrendingUp, Shield, Package, Sparkles,
  MessageSquare, Clock, BarChart3, Star, X, Plus
} from "lucide-react";

const CYAN = "hsl(189,94%,40%)";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  type?: "text" | "analysis" | "recommendation" | "risk";
  metadata?: {
    confidence?: number;
    sources?: string[];
    implants?: string[];
    riskLevel?: "Low" | "Moderate" | "High";
  };
}

const STARTER_PROMPTS = [
  { icon: FileText, label: "Explain scan findings", prompt: "Based on the uploaded CT scan showing glenohumeral osteoarthritis with posterior glenoid erosion, what are the key findings I should document in my surgical plan?" },
  { icon: Package, label: "Recommend implant size", prompt: "My patient is a 67-year-old male, 84kg, with Stage III Walch B2 glenoid. Which TSA implant and glenoid size would you recommend, and why?" },
  { icon: Shield, label: "Assess surgical risks", prompt: "What are the primary risk factors and potential complications for a reverse shoulder arthroplasty in a 72-year-old female with rotator cuff arthropathy and type II diabetes?" },
  { icon: TrendingUp, label: "Recovery forecast", prompt: "What post-operative ROM and functional recovery timeline can I expect for a TSA patient with pre-op flexion of 85° and intact rotator cuff?" },
  { icon: Stethoscope, label: "Surgical approach", prompt: "Compare the deltopectoral vs. anterosuperior approach for primary total shoulder arthroplasty in terms of exposure, complication rate, and recovery." },
  { icon: BarChart3, label: "Implant comparison", prompt: "Compare the Arthrex Univers II versus the DePuy Global AP for a primary TSA in a 58-year-old active female with good bone stock." },
];

const AI_RESPONSES: Record<string, Message> = {
  scan: {
    id: "r1", role: "assistant", timestamp: new Date(),
    type: "analysis",
    metadata: { confidence: 94, sources: ["CT Analysis AI v3.2", "MONAI Segmentation", "Clinical Literature DB"], riskLevel: "Moderate" },
    content: `## CT Scan Analysis — Glenohumeral Osteoarthritis (Walch B2)

**Key Findings:**

**Glenoid Morphology**
- Posterior glenoid erosion: ~6.2mm at maximum depth
- Biconcave glenoid (Walch B2) — confirmed by 3D reconstruction
- Glenoid retroversion: 18° (normal: 0–7°)
- Posterior humeral head subluxation: 68% (measured at equatorial plane)

**Humeral Head**
- Osteophyte formation: moderate — superior and posterior margins
- Articular cartilage loss: near-complete medially, 30% preserved laterally
- No evidence of avascular necrosis

**Rotator Cuff (MRI correlation)**
- Supraspinatus: intact, mild tendinosis
- Infraspinatus: intact
- Subscapularis: intact, minor upper third delamination

**Bone Quality Assessment**
- Cortical thickness: 3.8mm (adequate for cementless fixation)
- Estimated T-score: −0.8 (good quality)

---
**Clinical Implications:**
The Walch B2 configuration with 18° retroversion is the primary surgical challenge. Consider augmented glenoid component or corrective reaming to restore neutral version. TSA with an anatomic or augmented glenoid is appropriate given intact rotator cuff.

*Confidence: 94% | Sources: CT AI Analysis, MONAI v3.2, Walch Classification Guidelines*`
  },
  implant: {
    id: "r2", role: "assistant", timestamp: new Date(),
    type: "recommendation",
    metadata: { confidence: 91, implants: ["Arthrex Univers II", "DePuy Global AP", "Zimmer Sidus"], sources: ["Implant Database v2.1", "Outcome ML Model"] },
    content: `## Implant Recommendation — 67M, 84kg, Walch B2

**Top Recommendation: Arthrex Univers II TSA**

| Parameter | Specification |
|-----------|---------------|
| Humeral Head | 50mm diameter, +4mm offset |
| Glenoid Component | Augmented Cemented (8° posterior buildup) |
| Stem | Short metaphyseal — Size 4 |
| Material | Ti-6Al-4V / UHMWPE |
| AI Match Score | **94/100** |

**Why this implant?**
- The augmented glenoid directly addresses the 18° retroversion, restoring neutral version without aggressive posterior reaming that would compromise bone stock
- Superior 10-year survival: 96.2% (vs. category average 91.8%)
- 50mm humeral head appropriate for 84kg male — optimizes joint reaction force distribution
- Excellent clinical evidence in Walch B2: multicenter RCT (n=312, 8yr follow-up)

---
**Alternative Options:**

**DePuy Global AP** — Score: 88/100
- Standard cemented glenoid (requires more corrective reaming)
- Strong long-term data but less optimal for B2 morphology

**Zimmer Sidus Stem-Free** — Score: 79/100
- Stemless design preserves bone, but not ideal for 84kg male — higher micromotion risk

---
*Predicted post-op ROM: Flexion 145°, ER 55°, ABD 140°*
*10-year revision probability: 4.2%*`
  },
  risk: {
    id: "r3", role: "assistant", timestamp: new Date(),
    type: "risk",
    metadata: { confidence: 89, riskLevel: "Moderate", sources: ["Risk ML Model v4.1", "ACS NSQIP Database", "Literature Review"] },
    content: `## Surgical Risk Assessment — RSA, 72F, Rotator Cuff Arthropathy, T2DM

**Overall Risk Profile: MODERATE**

---
**Procedure-Specific Risks (RSA):**

🔴 **High Priority:**
- **Scapular notching** — 18% incidence at 2yr (Nerot Grade 1–2 most common)
  - *Mitigation: Inferior tilt 10°, lateralized design (155° neck-shaft angle)*
- **Acromial stress fracture** — elevated in females >70 with low bone density
  - *Mitigation: Confirm DEXA score pre-op; supplement vitamin D if T-score <−1.5*

🟡 **Moderate Priority:**
- **Surgical site infection** — T2DM increases risk 2.4× (baseline 0.8% → estimated 1.9%)
  - *Mitigation: HbA1c <7.5 pre-op, IV cefazolin + vancomycin powder, glycemic monitoring 24h post-op*
- **Component instability / dislocation** — 2.1% at 90 days (RSA baseline)
  - *Mitigation: Optimize glenosphere lateralization, confirm adequate deltoid tension intraoperatively*

🟢 **Lower Priority:**
- Neurological injury (axillary nerve): 0.4%
- Deep vein thrombosis: 0.6% (standard prophylaxis sufficient)
- Periprosthetic fracture: 0.3% at 1yr

---
**Pre-operative Optimization Checklist:**
1. ✅ HbA1c target: <7.5% (current: document and optimize if needed)
2. ✅ Bone density: DEXA scan if not within 12 months
3. ✅ Nutritional status: albumin >3.5 g/dL
4. ✅ Smoking cessation: >6 weeks pre-op
5. ✅ Anesthesia consult: cardiac risk stratification

*Risk confidence: 89% | Validated against ACS-NSQIP shoulder arthroplasty registry (n=8,421)*`
  },
};

function getAIResponse(prompt: string): Message {
  const lower = prompt.toLowerCase();
  if (lower.includes("scan") || lower.includes("ct") || lower.includes("mri") || lower.includes("finding")) return { ...AI_RESPONSES.scan, id: Date.now().toString(), timestamp: new Date() };
  if (lower.includes("implant") || lower.includes("size") || lower.includes("recommend") || lower.includes("univers") || lower.includes("global")) return { ...AI_RESPONSES.implant, id: Date.now().toString(), timestamp: new Date() };
  if (lower.includes("risk") || lower.includes("complication") || lower.includes("diabetes") || lower.includes("comorbid")) return { ...AI_RESPONSES.risk, id: Date.now().toString(), timestamp: new Date() };

  return {
    id: Date.now().toString(),
    role: "assistant",
    timestamp: new Date(),
    type: "text",
    metadata: { confidence: 87, sources: ["Clinical Knowledge Base", "PubMed Integration"] },
    content: `## Clinical Analysis

Thank you for your query. Based on the available clinical evidence and biomechanical principles, here is my analysis:

**Key Considerations:**

The question touches on several important biomechanical and clinical factors in shoulder arthroplasty. When approaching ${prompt.slice(0, 60)}..., the primary considerations are:

**1. Patient-Specific Factors**
- Age, sex, BMI, activity level, and bone quality all significantly influence implant selection and surgical technique
- Comorbidities (diabetes, osteoporosis, prior surgery) must be systematically risk-stratified

**2. Biomechanical Analysis**
- Glenohumeral joint reaction forces vary from 0.4–1.0× body weight during ADLs
- Rotator cuff integrity is the primary determinant between anatomic TSA and reverse shoulder arthroplasty
- Glenoid version and morphology (Walch classification) guide glenoid component selection

**3. Evidence-Based Recommendations**
- Current meta-analyses support cementless humeral fixation in patients <65 with good bone stock
- RSA demonstrates superior outcomes in cuff-deficient patients (ASES improvement: +38 points at 2yr)
- Return to sport: 68% of recreational athletes return to prior activity level by 12 months post-TSA

**Clinical Bottom Line:**
The optimal approach requires integrating patient-specific 3D biomechanical simulation with individualized risk stratification. I recommend running a full simulation with your patient's scan data for definitive implant sizing and surgical planning.

*Confidence: 87% | Based on 2,340 peer-reviewed publications and 50,000+ simulated cases*`,
  };
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.replace("## ", "")}</h2>;
        if (line.startsWith("**") && line.endsWith("**") && !line.includes("|")) return <p key={i} className="font-semibold text-[hsl(189,94%,60%)] mt-2">{line.replace(/\*\*/g, "")}</p>;
        if (line.startsWith("- ")) return <div key={i} className="flex gap-2 ml-2"><span className="text-[hsl(189,94%,40%)] mt-0.5 shrink-0">•</span><span className="text-[hsl(215,20%,75%)]" dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>") }} /></div>;
        if (line.startsWith("🔴 ") || line.startsWith("🟡 ") || line.startsWith("🟢 ")) return <div key={i} className="font-semibold text-white mt-2">{line}</div>;
        if (line.startsWith("  - ")) return <div key={i} className="ml-6 text-[hsl(215,20%,60%)] text-xs italic">{line.slice(4)}</div>;
        if (line.startsWith("|") && line.includes("|")) {
          const cells = line.split("|").filter(c => c.trim());
          const isHeader = lines[i + 1]?.startsWith("|---");
          const isSep = line.includes("---");
          if (isSep) return null;
          return (
            <div key={i} className={`grid gap-2 text-xs ${cells.length === 2 ? "grid-cols-[1fr_2fr]" : "grid-cols-4"} ${isHeader ? "text-[hsl(189,94%,50%)] font-semibold border-b border-[hsl(189,94%,40%,0.3)] pb-1" : "text-[hsl(215,20%,70%)]"}`}>
              {cells.map((c, j) => <span key={j} dangerouslySetInnerHTML={{ __html: c.trim().replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>") }} />)}
            </div>
          );
        }
        if (line.startsWith("*") && line.endsWith("*")) return <p key={i} className="text-[hsl(215,20%,50%)] text-xs italic mt-2">{line.replace(/\*/g, "")}</p>;
        if (line.startsWith("---")) return <hr key={i} className="border-[hsl(217,32%,20%)] my-3" />;
        if (line.startsWith("1. ") || /^\d+\. /.test(line)) return <div key={i} className="flex gap-2 ml-2"><span className="text-[hsl(189,94%,40%)] shrink-0 font-mono text-xs">{line.match(/^(\d+)\./)?.[1]}.</span><span className="text-[hsl(215,20%,75%)]" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, "").replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>") }} /></div>;
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="text-[hsl(215,20%,75%)]" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>") }} />;
      })}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeColor = msg.metadata?.riskLevel === "High" ? "text-red-400 bg-red-400/10 border-red-400/20"
    : msg.metadata?.riskLevel === "Moderate" ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
    : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-[hsl(189,94%,40%,0.15)] border border-[hsl(189,94%,40%,0.4)] flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-4 h-4 text-[hsl(189,94%,40%)]" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "max-w-[65%]" : ""}`}>
        {!isUser && msg.metadata && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {msg.type === "analysis" && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">Scan Analysis</span>}
            {msg.type === "recommendation" && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Implant Recommendation</span>}
            {msg.type === "risk" && <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeColor}`}>Risk Assessment</span>}
            {msg.metadata.confidence && <span className="text-xs text-[hsl(215,20%,40%)]">Confidence: {msg.metadata.confidence}%</span>}
            {msg.metadata.riskLevel && <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeColor}`}>{msg.metadata.riskLevel} Risk</span>}
          </div>
        )}
        <div className={`rounded-xl px-4 py-3 ${isUser
          ? "bg-[hsl(189,94%,40%,0.15)] border border-[hsl(189,94%,40%,0.3)] text-white text-sm"
          : "bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,18%)]"
        }`}>
          {isUser ? (
            <p className="text-sm">{msg.content}</p>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
        </div>
        {!isUser && msg.metadata?.sources && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {msg.metadata.sources.map((s, i) => (
              <span key={i} className="text-xs text-[hsl(215,20%,35%)] bg-[hsl(222,47%,8%)] px-2 py-0.5 rounded border border-[hsl(217,32%,14%)]">{s}</span>
            ))}
            <button onClick={copy} className="ml-auto text-[hsl(215,20%,35%)] hover:text-white transition-colors">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
        <p className="text-[hsl(215,20%,30%)] text-xs mt-1 px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-[hsl(217,32%,16%)] border border-[hsl(217,32%,22%)] flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-[hsl(215,20%,65%)]" />
        </div>
      )}
    </motion.div>
  );
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  timestamp: new Date(),
  type: "text",
  metadata: { confidence: 99, sources: ["ShoulderSim AI v4.2", "Clinical Knowledge Base"] },
  content: `## ShoulderSim AI Copilot — Ready

I'm your AI clinical assistant, trained on 50,000+ shoulder arthroplasty cases and integrated with the latest orthopedic literature. I can help you with:

- **Scan interpretation** — CT/MRI findings, Walch classification, bone morphology
- **Implant selection** — size recommendations, material comparison, compatibility scoring
- **Risk assessment** — complication prediction, patient-specific risk factors
- **Surgical planning** — approach selection, component positioning, technique guidance
- **Post-operative forecasting** — ROM prediction, recovery timelines, outcome probability

Select a quick prompt below, or type your clinical question to get started.`,
};

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sessionId] = useState(`SIM-${Date.now().toString(36).toUpperCase()}`);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1400 + Math.random() * 800));

    const response = getAIResponse(msg);
    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shouldersim-copilot-${sessionId}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[hsl(217,32%,14%)] bg-[hsl(222,47%,6%,0.95)] backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[hsl(215,20%,50%)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[hsl(189,94%,40%,0.15)] border border-[hsl(189,94%,40%,0.4)] flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[hsl(189,94%,40%)]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">AI Copilot</h1>
                <p className="text-xs text-[hsl(215,20%,40%)]">ShoulderSim Clinical Intelligence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">AI Online</span>
            </div>
            <span className="text-xs text-[hsl(215,20%,30%)] font-mono hidden sm:block">{sessionId}</span>
            <button onClick={exportChat} className="p-1.5 rounded text-[hsl(215,20%,45%)] hover:text-white hover:bg-[hsl(217,32%,14%)] transition-colors" title="Export chat">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={reset} className="p-1.5 rounded text-[hsl(215,20%,45%)] hover:text-white hover:bg-[hsl(217,32%,14%)] transition-colors" title="New session">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <WorkflowBanner current="sim" />

      <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
          {/* Quick prompts */}
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">Quick Prompts</h3>
            <div className="space-y-1.5">
              {STARTER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p.prompt)}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,14%)] border border-transparent hover:border-[hsl(217,32%,20%)] transition-all"
                >
                  <p.icon className="w-3.5 h-3.5 text-[hsl(189,94%,40%)] shrink-0" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">AI Capabilities</h3>
            <div className="space-y-2">
              {[
                { label: "DICOM Analysis", val: 94 },
                { label: "Risk Prediction", val: 91 },
                { label: "Implant Matching", val: 97 },
                { label: "ROM Forecasting", val: 88 },
                { label: "Report Generation", val: 96 },
              ].map(cap => (
                <div key={cap.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[hsl(215,20%,60%)]">{cap.label}</span>
                    <span className="text-[hsl(189,94%,40%)]">{cap.val}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-[hsl(217,32%,14%)]">
                    <div className="h-full rounded-full bg-[hsl(189,94%,40%)]" style={{ width: `${cap.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">Knowledge Base</h3>
            <div className="space-y-2">
              {[
                { label: "Training Cases", val: "50,000+" },
                { label: "Publications", val: "2,340" },
                { label: "Implant Models", val: "400+" },
                { label: "AI Model Version", val: "v4.2" },
                { label: "Last Updated", val: "May 2026" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-[hsl(215,20%,50%)]">{s.label}</span>
                  <span className="text-white font-medium">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Loading indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(189,94%,40%,0.15)] border border-[hsl(189,94%,40%,0.4)] flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-[hsl(189,94%,40%)]" />
                  </div>
                  <div className="bg-[hsl(222,47%,10%)] border border-[hsl(217,32%,18%)] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-[hsl(215,20%,50%)]">
                      <Sparkles className="w-4 h-4 text-[hsl(189,94%,40%)] animate-pulse" />
                      <span>Analyzing clinical data</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(189,94%,40%)] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Mobile quick prompts */}
          {messages.length === 1 && (
            <div className="lg:hidden grid grid-cols-2 gap-2 mb-4">
              {STARTER_PROMPTS.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p.prompt)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-[hsl(215,20%,65%)] hover:text-white bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] hover:border-[hsl(189,94%,40%,0.4)] transition-all"
                >
                  <p.icon className="w-3.5 h-3.5 text-[hsl(189,94%,40%)] shrink-0" />
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,18%)] rounded-xl p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a clinical question about shoulder arthroplasty, implant selection, risk factors, or surgical planning…"
              rows={3}
              className="w-full bg-transparent text-white text-sm placeholder-[hsl(215,20%,35%)] resize-none outline-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecording(r => !r)}
                  className={`p-2 rounded-lg transition-all ${recording ? "bg-red-500/20 border border-red-500/30 text-red-400" : "text-[hsl(215,20%,40%)] hover:text-white hover:bg-[hsl(217,32%,14%)]"}`}
                  title="Voice input"
                >
                  {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <span className="text-xs text-[hsl(215,20%,30%)]">Press Enter to send · Shift+Enter for new line</span>
              </div>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(189,94%,40%)] text-[hsl(222,47%,5%)] font-semibold text-sm hover:bg-[hsl(189,94%,45%)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? "Thinking…" : "Send"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[hsl(215,20%,28%)] mt-3">
            ShoulderSim AI Copilot is a decision-support tool. Clinical decisions must be validated by a licensed orthopedic surgeon.
          </p>
        </div>
      </div>
    </div>
  );
}
