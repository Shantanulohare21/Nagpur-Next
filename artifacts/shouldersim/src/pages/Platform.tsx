import { Link } from "wouter";
import { Scan, Cpu, Brain, FlaskConical, Stethoscope, Check, ArrowRight } from "lucide-react";
import { modules } from "../data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scan, Cpu, Brain, FlaskConical, Stethoscope,
};

const moduleDetails = [
  {
    visual: (
      <div className="w-full h-48 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(217,32%,20%)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative flex flex-col items-center gap-2">
          <div className="w-16 h-20 relative">
            <div className="absolute inset-0 border border-[hsl(188,100%,45%,0.4)] rounded-lg" style={{clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}} />
            <div className="absolute inset-2 border border-[hsl(188,100%,45%,0.2)] rounded" style={{clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[hsl(188,100%,45%,0.5)] glow-cyan-sm" />
            </div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[hsl(188,100%,45%,0.6)] scan-line" />
          </div>
          <span className="text-xs font-mono text-[hsl(188,100%,45%)]">DICOM → 3D Mesh</span>
        </div>
      </div>
    ),
  },
  {
    visual: (
      <div className="w-full h-48 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(217,32%,20%)] flex items-center justify-center relative overflow-hidden">
        <div className="relative w-32 h-32">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute inset-0 border border-[hsl(210,100%,60%,0.2)] rounded-full" style={{transform:`scale(${0.3+i*0.18})`, animationDelay:`${i*0.4}s`}} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,60%,0.2)] border border-[hsl(210,100%,60%,0.5)] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[hsl(210,100%,60%)]" />
            </div>
          </div>
          {[0,72,144,216,288].map((deg, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-gradient-to-t from-transparent to-[hsl(210,100%,60%,0.4)]" style={{transform:`rotate(${deg}deg) translateX(-50%)`, transformOrigin:"top"}} />
          ))}
        </div>
      </div>
    ),
  },
  {
    visual: (
      <div className="w-full h-48 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(217,32%,20%)] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
          <defs>
            <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(188,100%,45%)" />
              <stop offset="100%" stopColor="hsl(210,100%,60%)" />
            </linearGradient>
          </defs>
          {[[40,30],[100,20],[160,30],[40,60],[100,50],[160,60],[70,90],[130,90]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="none" stroke="url(#aiGrad)" strokeOpacity="0.8" strokeWidth="1.5" />
          ))}
          {[[40,30,100,20],[100,20,160,30],[40,30,40,60],[100,20,100,50],[160,30,160,60],[40,60,100,50],[100,50,160,60],[40,60,70,90],[160,60,130,90],[70,90,130,90]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#aiGrad)" strokeOpacity="0.2" strokeWidth="1" />
          ))}
          <circle cx="100" cy="50" r="8" fill="hsl(188,100%,45%)" fillOpacity="0.3" stroke="hsl(188,100%,45%)" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
  {
    visual: (
      <div className="w-full h-48 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(217,32%,20%)] flex items-center justify-center relative overflow-hidden">
        <div className="flex gap-3 items-end pb-4">
          {[
            { label: "A", h: 76, color: "hsl(188,100%,45%)", win: true },
            { label: "B", h: 56, color: "hsl(210,100%,60%)", win: false },
            { label: "C", h: 42, color: "hsl(215,20%,40%)", win: false },
          ].map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-mono ${bar.win ? "text-[hsl(188,100%,45%)]" : "text-[hsl(215,20%,50%)]"}`}>
                {bar.win ? "94%" : bar.label === "B" ? "87%" : "79%"}
              </span>
              <div
                className="w-10 rounded-t transition-all duration-500"
                style={{ height: `${bar.h}px`, background: bar.color, opacity: bar.win ? 1 : 0.5 }}
              />
              <span className="text-xs text-[hsl(215,20%,55%)]">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-3 right-3 text-xs text-[hsl(188,100%,45%)] font-semibold border border-[hsl(188,100%,45%,0.3)] rounded px-2 py-0.5 bg-[hsl(188,100%,45%,0.1)]">
          Winner: A
        </div>
      </div>
    ),
  },
  {
    visual: (
      <div className="w-full h-48 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(217,32%,20%)] flex flex-col items-start justify-center gap-2 p-4 relative overflow-hidden">
        {[
          { label: "Implant Selected", value: "Tornier Aequalis M", status: "done" },
          { label: "Surgical Approach", value: "Deltopectoral", status: "done" },
          { label: "Est. Range of Motion", value: "165° / 55°", status: "done" },
          { label: "Risk Score", value: "Low (4.2%)", status: "good" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between w-full text-xs">
            <span className="text-[hsl(215,20%,55%)]">{row.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold">{row.value}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${row.status === "done" ? "bg-[hsl(188,100%,45%)]" : "bg-[hsl(160,80%,50%)]"}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Platform() {
  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Platform</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">The ShoulderSim AI Engine</h1>
          <p className="text-[hsl(215,20%,60%)] text-lg max-w-2xl mx-auto">
            Five deeply integrated modules — each powered by AI, validated by clinical data, designed for surgical precision.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {modules.map((mod, idx) => {
          const Icon = iconMap[mod.icon];
          const isEven = idx % 2 === 0;
          return (
            <div
              key={mod.number}
              className={`grid lg:grid-cols-2 gap-10 items-center ${!isEven ? "lg:flex-row-reverse" : ""}`}
              id={`module-${mod.number}`}
              data-testid={`platform-module-${mod.number}`}
            >
              <div className={isEven ? "" : "lg:order-2"}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold font-mono text-[hsl(188,100%,45%,0.6)]">{mod.number}</span>
                  <div className="w-10 h-10 rounded-lg bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center">
                    {Icon && <Icon className="w-5 h-5 text-[hsl(188,100%,45%)]" />}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{mod.title}</h2>
                <p className="text-[hsl(215,20%,60%)] leading-relaxed mb-6">{mod.description}</p>
                <ul className="space-y-2">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[hsl(188,100%,45%)]" />
                      </div>
                      <span className="text-[hsl(215,20%,75%)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={isEven ? "" : "lg:order-1"}>
                {moduleDetails[idx]?.visual}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[hsl(222,47%,5%)] border-t border-[hsl(217,32%,14%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">See It in Action</h2>
          <p className="text-[hsl(215,20%,60%)] mb-6">Try the interactive simulation demo with your own case parameters.</p>
          <Link href="/simulation" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors">
            Open Simulation Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
