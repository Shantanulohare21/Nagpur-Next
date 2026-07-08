import { Link } from "wouter";
import { Check, ArrowRight, TrendingUp, Shield, Glasses } from "lucide-react";
import { caseStudies } from "../data/mockData";

const useCases = [
  {
    icon: TrendingUp,
    title: "Pre-operative Planning",
    subtitle: "Evidence-based implant selection before every case",
    description: "Upload your patient's CT/MRI, let ShoulderSim generate a precise 3D bone model, then simulate multiple implant configurations against real biomechanical loads.",
    features: [
      "Patient-specific bone model from DICOM in <90 seconds",
      "Simultaneous comparison of up to 6 implant configurations",
      "Predicted ROM, stress distribution, and failure risk",
      "PDF surgical plan for the OR team",
      "PACS and EMR integration for seamless workflow",
    ],
    stat: "40% reduction in OR time",
  },
  {
    icon: Shield,
    title: "Training Simulation",
    subtitle: "Resident and fellow education on real case anatomy",
    description: "Expose trainees to rare anatomy, complex revisions, and challenging presentations — without patient risk. Build surgical judgment through repeated simulation on diverse case libraries.",
    features: [
      "Access to 50,000+ anonymized training cases",
      "Step-by-step guided simulation walkthrough",
      "Performance scoring and learning analytics",
      "Peer comparison and benchmarking",
      "CME credits integration (pending accreditation)",
    ],
    stat: "98.1% surgeon satisfaction rate",
  },
  {
    icon: Glasses,
    title: "AR/VR Visualization",
    subtitle: "Immersive 3D case review before the OR",
    description: "Export your simulation as an interactive 3D model for Apple Vision Pro, Quest 3, or WebXR. Walk through the joint anatomy, overlay the planned implant, and rehearse the approach.",
    features: [
      "WebXR export — works in any modern browser",
      "Apple Vision Pro native integration",
      "Meta Quest 2/3 support via SteamVR",
      "Haptic feedback for surgical gesture rehearsal",
      "Team review mode for pre-op case discussions",
    ],
    stat: "Used in 340+ hospitals worldwide",
  },
];

export default function Surgeons() {
  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">For Surgeons</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Plan Every Case With Confidence</h1>
          <p className="text-[hsl(215,20%,60%)] text-lg max-w-2xl">
            ShoulderSim AI gives orthopedic surgeons a precision edge — from the first scan to the final incision. Every decision backed by biomechanical simulation and AI trained on 50,000+ cases.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { v: "340+", l: "Hospitals" },
              { v: "98.1%", l: "Surgeon Satisfaction" },
              { v: "40%", l: "Less OR Time" },
              { v: "22%", l: "Fewer Revisions" },
            ].map((s) => (
              <div key={s.l} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded px-5 py-3 text-center">
                <div className="text-2xl font-bold text-gradient-cyan">{s.v}</div>
                <div className="text-xs text-[hsl(215,20%,55%)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {useCases.map((uc, idx) => {
          const Icon = uc.icon;
          const isEven = idx % 2 === 0;
          return (
            <div key={uc.title} className={`grid lg:grid-cols-2 gap-10 items-center`} data-testid={`surgeon-usecase-${idx}`}>
              <div className={isEven ? "" : "lg:order-2"}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[hsl(188,100%,45%)]" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)]">{uc.subtitle}</div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{uc.title}</h2>
                <p className="text-[hsl(215,20%,60%)] leading-relaxed mb-6">{uc.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {uc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[hsl(188,100%,45%)]" />
                      </div>
                      <span className="text-[hsl(215,20%,75%)]">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(188,100%,45%,0.08)] border border-[hsl(188,100%,45%,0.2)] text-sm font-semibold text-[hsl(188,100%,45%)]">
                  <TrendingUp className="w-4 h-4" />
                  {uc.stat}
                </div>
              </div>
              <div className={isEven ? "" : "lg:order-1"}>
                <div className="bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                    <span className="text-sm font-semibold text-white">{uc.title} Preview</span>
                  </div>
                  <div className="space-y-2">
                    {uc.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-2 border-b border-[hsl(217,32%,12%)] last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(188,100%,45%)] shrink-0" />
                        <span className="text-[hsl(215,20%,65%)]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-[hsl(222,47%,5%)] border-t border-[hsl(217,32%,14%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Case Studies</div>
            <h2 className="text-3xl font-bold text-white mb-3">Clinical Outcomes</h2>
            <p className="text-[hsl(215,20%,60%)] max-w-lg mx-auto">Real anonymized cases from partner hospitals demonstrating ShoulderSim-guided surgical planning.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((cs) => (
              <div key={cs.scanId} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6" data-testid={`case-study-${cs.scanId}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-xs text-[hsl(188,100%,45%)]">{cs.scanId}</div>
                  <div className="flex items-center gap-1 bg-[hsl(160,80%,50%,0.1)] border border-[hsl(160,80%,50%,0.3)] text-[hsl(160,80%,50%)] rounded-full px-2 py-0.5 text-xs font-semibold">
                    <Check className="w-3 h-3" /> {cs.outcome}
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{cs.patient}</div>
                <div className="text-xs text-[hsl(215,20%,55%)] mb-3">Implant: {cs.implant}</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">AI Confidence</span>
                    <span className="text-[hsl(188,100%,45%)] font-semibold">{cs.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(215,20%,45%)]">ROM Achieved</span>
                    <span className="text-white font-mono">{cs.rom}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[hsl(217,32%,14%)] text-xs text-[hsl(215,20%,55%)] italic">{cs.followUp}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Transform Your OR?</h2>
        <p className="text-[hsl(215,20%,60%)] mb-6">Join 340+ hospitals using ShoulderSim AI for pre-operative planning.</p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan">
          Request Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
