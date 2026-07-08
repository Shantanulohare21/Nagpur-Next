import { Link } from "wouter";
import { CheckCircle, User, Brain, Activity, Package, FileText } from "lucide-react";
import { usePatient } from "@/contexts/PatientContext";

const STEPS = [
  { id: "info",     label: "Patient Intake",   icon: User,        href: "/intake" },
  { id: "analysis", label: "Scan Analysis",    icon: Brain,       href: "/scan-analysis" },
  { id: "sim",      label: "3D Simulation",    icon: Activity,    href: "/simulation" },
  { id: "implants", label: "Implants",         icon: Package,     href: "/implants" },
  { id: "report",   label: "Report",           icon: FileText,    href: "/reports" },
];

const STEP_GATE: Record<string, string[]> = {
  info:     [],
  analysis: ["info", "clinical", "scans"],
  sim:      ["info"],
  implants: ["info"],
  report:   ["info"],
};

export function WorkflowBanner({ current }: { current: string }) {
  const { state } = usePatient();
  const done = new Set(state.completedSteps);
  const hasPatient = !!state.info;

  const isUnlocked = (stepId: string) => {
    const required = STEP_GATE[stepId] || [];
    return required.every(r => done.has(r));
  };

  return (
    <div className="w-full bg-[hsl(222,47%,6%)] border-b border-[hsl(217,32%,13%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {STEPS.map((step, i) => {
          const isDone = done.has(step.id) || (step.id === "sim" && hasPatient) || (step.id === "implants" && hasPatient) || (step.id === "report" && hasPatient);
          const isActive = step.id === current;
          const unlocked = isUnlocked(step.id) || step.id === "sim" || step.id === "implants" || step.id === "report";
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center shrink-0">
              <Link href={unlocked ? step.href : "#"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-teal-500/15 text-teal-400 border border-teal-500/30"
                    : isDone
                    ? "text-teal-500 hover:bg-teal-500/10"
                    : unlocked
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                    : "text-slate-600 cursor-default"
                }`}>
                {isDone && !isActive
                  ? <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                  : <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : isDone ? "text-teal-500" : "text-slate-500"}`} />
                }
                {step.label}
              </Link>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px mx-1 shrink-0 ${isDone ? "bg-teal-700" : "bg-[hsl(217,32%,18%)]"}`} />
              )}
            </div>
          );
        })}

        {hasPatient && (
          <div className="ml-auto pl-4 shrink-0 flex items-center gap-2">
            <div className="w-px h-4 bg-[hsl(217,32%,18%)]" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <User className="w-3 h-3 text-teal-400" />
              </div>
              <span className="text-xs text-teal-300 font-medium whitespace-nowrap">{state.info!.name}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{state.info!.mrn}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
