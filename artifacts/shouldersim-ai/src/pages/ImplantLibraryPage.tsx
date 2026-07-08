import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  Activity, ArrowLeft, Search, X, Check, ChevronRight,
  Star, BarChart3, Award, SlidersHorizontal, Download, Eye, Info
} from "lucide-react";

interface Implant {
  id: string; name: string; manufacturer: string; type: "Anatomic TSA" | "Reverse TSA" | "Resurfacing" | "Partial";
  material: string; bearing: string; cemented: boolean; glenoidSize: string;
  aiScore: number; successRate: number; revisionRate: number; romPredicted: number;
  longevity: number; stressScore: number; wearRate: string;
  indications: string[]; boneQuality: string[]; useCases: string[];
  tags: string[];
}

const implants: Implant[] = [
  { id: "i1", name: "Univers Arch TSA", manufacturer: "Arthrex", type: "Anatomic TSA", material: "Ti6Al4V", bearing: "UHMWPE", cemented: false, glenoidSize: "32–44mm", aiScore: 96, successRate: 94.8, revisionRate: 4.2, romPredicted: 142, longevity: 18, stressScore: 92, wearRate: "0.08mm/yr", indications: ["Primary OA", "Post-traumatic OA", "AVN"], boneQuality: ["Good", "Excellent"], useCases: ["Primary"], tags: ["Cementless", "Anatomic"] },
  { id: "i2", name: "Comprehensive Reverse", manufacturer: "Zimmer Biomet", type: "Reverse TSA", material: "Titanium", bearing: "XLPE", cemented: true, glenoidSize: "36–46mm", aiScore: 93, successRate: 92.3, revisionRate: 6.1, romPredicted: 128, longevity: 16, stressScore: 88, wearRate: "0.11mm/yr", indications: ["Irreparable RC Tear", "RSA Revision", "Fracture Sequelae"], boneQuality: ["Moderate", "Good"], useCases: ["Primary", "Revision"], tags: ["Cemented", "Modular"] },
  { id: "i3", name: "Global AP TSA", manufacturer: "DePuy Synthes", type: "Anatomic TSA", material: "CoCr", bearing: "UHMWPE", cemented: true, glenoidSize: "34–48mm", aiScore: 91, successRate: 93.1, revisionRate: 5.4, romPredicted: 138, longevity: 17, stressScore: 89, wearRate: "0.09mm/yr", indications: ["Primary OA", "RA", "CTA"], boneQuality: ["Good", "Excellent"], useCases: ["Primary"], tags: ["Cemented", "Anatomic"] },
  { id: "i4", name: "Equinoxe Reverse", manufacturer: "Exactech", type: "Reverse TSA", material: "Titanium", bearing: "XLPE", cemented: false, glenoidSize: "38–44mm", aiScore: 89, successRate: 91.5, revisionRate: 7.2, romPredicted: 124, longevity: 15, stressScore: 85, wearRate: "0.13mm/yr", indications: ["Irreparable RC", "Revision", "Complex Primary"], boneQuality: ["Poor", "Moderate"], useCases: ["Primary", "Revision"], tags: ["Cementless", "Reverse"] },
  { id: "i5", name: "GLOBAL UNITE", manufacturer: "Smith & Nephew", type: "Anatomic TSA", material: "Ti6Al4V", bearing: "UHMWPE", cemented: false, glenoidSize: "30–46mm", aiScore: 94, successRate: 94.2, revisionRate: 4.8, romPredicted: 140, longevity: 17, stressScore: 91, wearRate: "0.08mm/yr", indications: ["Primary OA", "AVN", "Dysplasia"], boneQuality: ["Moderate", "Good", "Excellent"], useCases: ["Primary"], tags: ["Cementless", "Anatomic"] },
  { id: "i6", name: "Triathlon Total", manufacturer: "Stryker", type: "Anatomic TSA", material: "CoCr", bearing: "XLPE", cemented: true, glenoidSize: "32–44mm", aiScore: 90, successRate: 93.6, revisionRate: 5.1, romPredicted: 136, longevity: 16, stressScore: 87, wearRate: "0.10mm/yr", indications: ["Primary OA", "Post-traumatic"], boneQuality: ["Good", "Excellent"], useCases: ["Primary"], tags: ["Cemented", "XLPE"] },
  { id: "i7", name: "ReUnion Reverse", manufacturer: "DJO Global", type: "Reverse TSA", material: "Titanium", bearing: "UHMWPE", cemented: false, glenoidSize: "36–42mm", aiScore: 87, successRate: 90.8, revisionRate: 8.1, romPredicted: 122, longevity: 14, stressScore: 83, wearRate: "0.15mm/yr", indications: ["Irreparable RC Tear", "Cuff Tear Arthropathy"], boneQuality: ["Moderate"], useCases: ["Primary", "Revision"], tags: ["Cementless", "Reverse"] },
  { id: "i8", name: "SMR Reverse", manufacturer: "Lima Corporate", type: "Reverse TSA", material: "Tantalum", bearing: "XLPE", cemented: false, glenoidSize: "38–46mm", aiScore: 88, successRate: 91.2, revisionRate: 7.8, romPredicted: 126, longevity: 15, stressScore: 86, wearRate: "0.12mm/yr", indications: ["Complex Revision", "Massive RC Tear", "Tumor"], boneQuality: ["Poor", "Moderate"], useCases: ["Revision", "Complex"], tags: ["Trabecular Metal", "Revision"] },
  { id: "i9", name: "IDES Reverse", manufacturer: "Arthrex", type: "Reverse TSA", material: "Titanium", bearing: "XLPE", cemented: false, glenoidSize: "34–42mm", aiScore: 92, successRate: 92.9, revisionRate: 5.8, romPredicted: 130, longevity: 16, stressScore: 90, wearRate: "0.10mm/yr", indications: ["Cuff Arthropathy", "Fracture", "Revision"], boneQuality: ["Moderate", "Good"], useCases: ["Primary", "Revision"], tags: ["Cementless", "High-arch"] },
  { id: "i10", name: "Aequalis Ascend", manufacturer: "Tornier/Wright", type: "Anatomic TSA", material: "Ti6Al4V", bearing: "UHMWPE", cemented: false, glenoidSize: "30–44mm", aiScore: 89, successRate: 93.0, revisionRate: 5.5, romPredicted: 137, longevity: 16, stressScore: 88, wearRate: "0.09mm/yr", indications: ["Primary OA", "RA", "CTA"], boneQuality: ["Moderate", "Good"], useCases: ["Primary"], tags: ["Cementless", "Convertible"] },
  { id: "i11", name: "Eclipse Resurfacing", manufacturer: "Arthrex", type: "Resurfacing", material: "CoCr", bearing: "Native Glenoid", cemented: true, glenoidSize: "N/A", aiScore: 84, successRate: 88.5, revisionRate: 9.2, romPredicted: 132, longevity: 12, stressScore: 80, wearRate: "0.06mm/yr", indications: ["Early OA", "AVN", "Young Active Patients"], boneQuality: ["Good", "Excellent"], useCases: ["Primary"], tags: ["Bone-conserving", "Resurfacing"] },
  { id: "i12", name: "HemiCAP Partial", manufacturer: "Arthrosurface", type: "Partial", material: "CoCr", bearing: "Native", cemented: false, glenoidSize: "N/A", aiScore: 79, successRate: 85.2, revisionRate: 12.4, romPredicted: 125, longevity: 10, stressScore: 75, wearRate: "0.05mm/yr", indications: ["Focal Cartilage Defect", "Young Patient", "Partial Arthritis"], boneQuality: ["Good", "Excellent"], useCases: ["Primary"], tags: ["Minimal-invasive", "Partial"] },
];

const filterDefs = {
  type: ["Anatomic TSA", "Reverse TSA", "Resurfacing", "Partial"],
  material: ["Ti6Al4V", "Titanium", "CoCr", "Tantalum"],
  boneQuality: ["Poor", "Moderate", "Good", "Excellent"],
  useCase: ["Primary", "Revision", "Complex"],
};

function ScoreBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`} />
    </div>
  );
}

function ImplantCard({ implant, selected, onToggleCompare, onView }: { implant: Implant; selected: boolean; onToggleCompare: () => void; onView: () => void }) {
  const typeColor = implant.type === "Anatomic TSA" ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
    : implant.type === "Reverse TSA" ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
    : implant.type === "Resurfacing" ? "bg-green-500/15 text-green-400 border-green-500/30"
    : "bg-orange-500/15 text-orange-400 border-orange-500/30";
  const scoreColor = implant.aiScore >= 93 ? "text-green-400" : implant.aiScore >= 86 ? "text-yellow-400" : "text-orange-400";

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-card/50 border rounded-xl p-4 backdrop-blur-sm hover:border-primary/40 transition-all group ${selected ? "border-primary/60 ring-1 ring-primary/20" : "border-border/60"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border mb-2 ${typeColor}`}>{implant.type}</div>
          <h3 className="text-sm font-bold text-foreground leading-tight">{implant.name}</h3>
          <p className="text-[11px] text-muted-foreground">{implant.manufacturer}</p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-display font-bold ${scoreColor}`}>{implant.aiScore}</div>
          <div className="text-[9px] text-muted-foreground">AI Score</div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Material</span><span className="font-medium">{implant.material}</span></div>
        <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Bearing</span><span className="font-medium">{implant.bearing}</span></div>
        <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Glenoid</span><span className="font-medium">{implant.glenoidSize}</span></div>
      </div>

      <div className="mb-3 space-y-1.5">
        <div className="flex justify-between text-[10px] mb-1"><span className="text-muted-foreground">Success Rate</span><span className="text-green-400 font-mono font-bold">{implant.successRate}%</span></div>
        <ScoreBar value={implant.successRate} color="bg-green-500" />
        <div className="flex justify-between text-[10px] mt-2 mb-1"><span className="text-muted-foreground">Longevity</span><span className="text-primary font-mono font-bold">{implant.longevity}yr</span></div>
        <ScoreBar value={implant.longevity} max={20} color="bg-primary" />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {implant.tags.map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-border/30 text-muted-foreground border border-border/40">{t}</span>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onView} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-background/50 border border-border/50 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
          <Eye className="w-3 h-3" />View
        </button>
        <button onClick={onToggleCompare}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all border ${selected ? "bg-primary/20 text-primary border-primary/40" : "bg-background/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>
          {selected ? <><Check className="w-3 h-3" />Added</> : <>+ Compare</>}
        </button>
      </div>
    </motion.div>
  );
}

function ImplantDetailModal({ implant, onClose }: { implant: Implant; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-bold">{implant.name}</h2>
            <p className="text-sm text-muted-foreground">{implant.manufacturer} · {implant.type}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "AI Score", value: `${implant.aiScore}/100`, color: implant.aiScore >= 93 ? "text-green-400" : "text-yellow-400" },
            { label: "Success Rate", value: `${implant.successRate}%`, color: "text-green-400" },
            { label: "Revision Rate (10yr)", value: `${implant.revisionRate}%`, color: implant.revisionRate < 6 ? "text-green-400" : "text-yellow-400" },
            { label: "Predicted ROM", value: `${implant.romPredicted}°`, color: "text-primary" },
            { label: "Longevity", value: `${implant.longevity} years`, color: "text-primary" },
            { label: "Wear Rate", value: implant.wearRate, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="bg-background/60 rounded-xl p-3 border border-border/40">
              <div className={`text-base font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[["Material", implant.material], ["Bearing Surface", implant.bearing], ["Fixation", implant.cemented ? "Cemented" : "Cementless"], ["Glenoid Size", implant.glenoidSize]].map(([k, v]) => (
                <div key={k} className="flex justify-between bg-background/40 rounded-lg px-3 py-2 border border-border/30"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Indications</h4>
            <div className="flex flex-wrap gap-1.5">
              {implant.indications.map(i => <span key={i} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary">{i}</span>)}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Suitable Bone Quality</h4>
            <div className="flex flex-wrap gap-1.5">
              {implant.boneQuality.map(b => <span key={b} className="px-2 py-1 rounded-lg bg-border/30 border border-border/50 text-[11px] text-foreground">{b}</span>)}
            </div>
          </div>
        </div>
        <button className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
          <Download className="w-4 h-4" />Download Implant Datasheet
        </button>
      </motion.div>
    </motion.div>
  );
}

function CompareModal({ items, onClose }: { items: Implant[]; onClose: () => void }) {
  const metrics = [
    { label: "AI Score", key: "aiScore" as keyof Implant, unit: "/100", color: (v: number) => v >= 93 ? "text-green-400" : v >= 86 ? "text-yellow-400" : "text-orange-400" },
    { label: "Success Rate", key: "successRate" as keyof Implant, unit: "%", color: (v: number) => v >= 93 ? "text-green-400" : "text-yellow-400" },
    { label: "Revision Rate", key: "revisionRate" as keyof Implant, unit: "%", color: (v: number) => v < 5 ? "text-green-400" : v < 8 ? "text-yellow-400" : "text-red-400" },
    { label: "ROM Predicted", key: "romPredicted" as keyof Implant, unit: "°", color: (_v: number) => "text-primary" },
    { label: "Longevity", key: "longevity" as keyof Implant, unit: "yr", color: (_v: number) => "text-primary" },
    { label: "Stress Score", key: "stressScore" as keyof Implant, unit: "/100", color: (v: number) => v >= 88 ? "text-green-400" : "text-yellow-400" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-4xl max-h-[70vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg">Implant Comparison</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-border/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <td className="pb-4 pr-4 text-xs text-muted-foreground font-medium">Metric</td>
                {items.map(i => (
                  <th key={i.id} className="pb-4 px-4 text-left">
                    <div className="text-sm font-bold">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">{i.manufacturer}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {metrics.map(m => (
                <tr key={m.label}>
                  <td className="py-3 pr-4 text-[11px] text-muted-foreground whitespace-nowrap">{m.label}</td>
                  {items.map(i => {
                    const val = i[m.key] as number;
                    const best = Math.max(...items.map(x => x[m.key] as number));
                    const isBest = m.key === "revisionRate" ? val === Math.min(...items.map(x => x[m.key] as number)) : val === best;
                    return (
                      <td key={i.id} className="py-3 px-4">
                        <span className={`font-mono font-bold text-sm ${m.color(val)}`}>{val}{m.unit}</span>
                        {isBest && <span className="ml-2 text-[9px] text-yellow-400">★ Best</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="py-3 pr-4 text-[11px] text-muted-foreground">Type</td>
                {items.map(i => <td key={i.id} className="py-3 px-4 text-[11px]">{i.type}</td>)}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[11px] text-muted-foreground">Material</td>
                {items.map(i => <td key={i.id} className="py-3 px-4 text-[11px]">{i.material}</td>)}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[11px] text-muted-foreground">Wear Rate</td>
                {items.map(i => <td key={i.id} className="py-3 px-4 font-mono text-[11px]">{i.wearRate}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ImplantLibraryPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({ type: [], material: [], boneQuality: [], useCase: [] });
  const [compareList, setCompareList] = useState<string[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (cat: string, val: string) => {
    setFilters(f => ({ ...f, [cat]: f[cat].includes(val) ? f[cat].filter(x => x !== val) : [...f[cat], val] }));
  };

  const filtered = useMemo(() => implants.filter(imp => {
    const matchSearch = !search || imp.name.toLowerCase().includes(search.toLowerCase()) || imp.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchType = !filters.type.length || filters.type.includes(imp.type);
    const matchMaterial = !filters.material.length || filters.material.includes(imp.material);
    const matchBone = !filters.boneQuality.length || filters.boneQuality.some(b => imp.boneQuality.includes(b));
    const matchUse = !filters.useCase.length || filters.useCase.some(u => imp.useCases.includes(u));
    return matchSearch && matchType && matchMaterial && matchBone && matchUse;
  }), [search, filters]);

  const toggleCompare = (id: string) => {
    setCompareList(l => l.includes(id) ? l.filter(x => x !== id) : l.length < 3 ? [...l, id] : l);
  };

  const activeFilterCount = Object.values(filters).flat().length;
  const viewingImplant = viewingId ? implants.find(i => i.id === viewingId) : null;
  const compareImplants = compareList.map(id => implants.find(i => i.id === id)!).filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Link>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /><span className="font-display font-bold text-sm">Implant <span className="text-primary">Library</span></span></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{filtered.length} of {implants.length} implants</span>
            {compareList.length > 0 && (
              <button onClick={() => setShowCompare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all">
                Compare ({compareList.length})
              </button>
            )}
          </div>
        </div>
      </header>
      <WorkflowBanner current="implants" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search + filter bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search implants, manufacturers…"
              className="w-full h-10 pl-10 pr-4 bg-card/60 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-sm font-medium transition-all ${showFilters || activeFilterCount ? "bg-primary/10 text-primary border-primary/30" : "bg-card/60 border-border/60 text-muted-foreground hover:text-foreground"}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters{activeFilterCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6">
              <div className="bg-card/50 border border-border/60 rounded-xl p-5 backdrop-blur-sm grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(filterDefs).map(([cat, opts]) => (
                  <div key={cat}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{cat.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="space-y-1.5">
                      {opts.map(opt => (
                        <button key={opt} onClick={() => toggleFilter(cat, opt)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-all border ${filters[cat].includes(opt) ? "bg-primary/10 text-primary border-primary/30" : "bg-background/40 border-border/40 text-muted-foreground hover:text-foreground"}`}>
                          <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${filters[cat].includes(opt) ? "bg-primary border-primary" : "border-border/60"}`}>
                            {filters[cat].includes(opt) && <Check className="w-2 h-2 text-primary-foreground" />}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Implant grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map(imp => (
              <ImplantCard key={imp.id} implant={imp} selected={compareList.includes(imp.id)}
                onToggleCompare={() => toggleCompare(imp.id)}
                onView={() => setViewingId(imp.id)} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-20 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No implants match your filters.</p>
              <button onClick={() => { setFilters({ type: [], material: [], boneQuality: [], useCase: [] }); setSearch(""); }} className="mt-2 text-xs text-primary hover:underline">Clear all filters</button>
            </div>
          )}
        </div>

        {/* Compare tray */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl">
                <div className="flex items-center gap-2">
                  {compareList.map(id => {
                    const imp = implants.find(i => i.id === id)!;
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1">
                        <span className="text-xs font-medium text-primary">{imp.name}</span>
                        <button onClick={() => toggleCompare(id)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setShowCompare(true)} disabled={compareList.length < 2}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                  Compare <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {viewingImplant && <ImplantDetailModal implant={viewingImplant} onClose={() => setViewingId(null)} />}
        {showCompare && compareImplants.length >= 2 && <CompareModal items={compareImplants} onClose={() => setShowCompare(false)} />}
      </AnimatePresence>
    </div>
  );
}
