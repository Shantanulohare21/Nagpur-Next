import { Link } from "wouter";
import { Check, ArrowRight, FlaskConical, Activity, Shield, FileText, TrendingUp, X } from "lucide-react";

const useCases = [
  {
    icon: FlaskConical,
    title: "Virtual Testing Sandbox",
    description: "Test any implant design iteration against a library of 50,000+ patient-specific bone models without physical prototyping costs.",
    features: ["Digital twin of any implant geometry via STL/STEP upload", "Testing against 200+ patient anatomy archetypes", "Automated batch test runs across size ranges", "Comparative analysis vs. competitor designs"],
  },
  {
    icon: Activity,
    title: "Wear & Tear Simulation",
    description: "Model 10-year implant wear trajectories using validated material science models — accelerated lifecycle simulation in hours.",
    features: ["UHMWPE, CoCrMo, Ti-6Al-4V material models", "Polyethylene wear prediction (ARMD validated)", "Corrosion and fretting fatigue analysis", "FDA Guidance Document 1807 compliance mapping"],
  },
  {
    icon: Shield,
    title: "Impingement Testing",
    description: "Automatically detect and quantify scapular notching, glenoid impingement, and subacromial conflict across full ROM arcs.",
    features: ["Dynamic ROM impingement detection", "Notching grade prediction (Sirveaux classification)", "Glenoid baseplate tilt optimization", "Automated size recommendation per bone morphology"],
  },
  {
    icon: FileText,
    title: "Regulatory Documentation",
    description: "Generate FDA 510(k) and CE Mark supporting documentation directly from simulation results — traceability from bench to brief.",
    features: ["ISO 14242-1 wear test equivalency reports", "ASTM F1820 performance benchmarks", "Automated technical file generation", "CFD and FEA results with method statements"],
  },
];

const comparisonRows = [
  { feature: "Time per test cycle", physical: "6-12 weeks", virtual: "<2 hours" },
  { feature: "Cost per iteration", physical: "$40,000 – $120,000", virtual: "$0 (SaaS)" },
  { feature: "Patient anatomy variants", physical: "1-3 cadavers", virtual: "50,000+ bone models" },
  { feature: "Regulatory evidence", physical: "Manual documentation", virtual: "Auto-generated" },
  { feature: "Iteration speed", physical: "Months", virtual: "Days" },
  { feature: "Risk of prototype failure", physical: "High", virtual: "None" },
];

const partners = ["DePuy Synthes", "Zimmer Biomet", "Arthrex", "Smith+Nephew", "Exactech"];

export default function Manufacturers() {
  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">For Manufacturers</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Compress Your Development Cycle</h1>
          <p className="text-[hsl(215,20%,60%)] text-lg max-w-2xl">
            Replace months of physical testing with hours of virtual simulation. ShoulderSim AI lets implant manufacturers iterate faster, reduce costs, and generate regulatory evidence — all in one platform.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { v: "95%", l: "Cost Reduction vs Physical" },
              { v: "50x", l: "Faster Iteration" },
              { v: "200+", l: "Anatomy Variants" },
              { v: "FDA/CE", l: "Compliant Output" },
            ].map((s) => (
              <div key={s.l} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded px-5 py-3 text-center">
                <div className="text-2xl font-bold text-gradient-cyan">{s.v}</div>
                <div className="text-xs text-[hsl(215,20%,55%)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Capabilities</div>
          <h2 className="text-3xl font-bold text-white mb-3">Four Core Testing Modules</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div key={uc.title} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6 hover:border-[hsl(188,100%,45%,0.3)] transition-colors" data-testid={`manufacturer-usecase-${uc.title.replace(/\s+/g, "-").toLowerCase()}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[hsl(188,100%,45%)]" />
                  </div>
                  <h3 className="text-base font-bold text-white">{uc.title}</h3>
                </div>
                <p className="text-sm text-[hsl(215,20%,60%)] leading-relaxed mb-4">{uc.description}</p>
                <ul className="space-y-1.5">
                  {uc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-[hsl(188,100%,45%)] shrink-0 mt-0.5" />
                      <span className="text-[hsl(215,20%,65%)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <section className="bg-[hsl(222,47%,5%)] border-y border-[hsl(217,32%,14%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Competitive Analysis</div>
            <h2 className="text-3xl font-bold text-white mb-3">Virtual vs. Physical Testing</h2>
          </div>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(217,32%,20%)]">
                  <th className="text-left py-3 pr-6 text-[hsl(215,20%,55%)] font-medium">Factor</th>
                  <th className="text-center py-3 px-4 text-[hsl(215,20%,45%)] font-medium">Physical Testing</th>
                  <th className="text-center py-3 px-4 font-semibold text-[hsl(188,100%,45%)]">ShoulderSim AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-[hsl(217,32%,12%)] ${i % 2 === 0 ? "" : "bg-[hsl(222,47%,7%,0.3)]"}`}>
                    <td className="py-3 pr-6 text-white font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-[hsl(215,20%,45%)]">{row.physical}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[hsl(188,100%,45%)] font-semibold">{row.virtual}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Partner Network</div>
          <h2 className="text-2xl font-bold text-white mb-2">Trusted by Leading Manufacturers</h2>
          <p className="text-[hsl(215,20%,55%)] text-sm">Working with the world's top orthopedic implant companies</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {partners.map((p) => (
            <div key={p} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg px-8 py-4 text-sm font-semibold text-[hsl(215,20%,65%)] hover:border-[hsl(188,100%,45%,0.3)] hover:text-white transition-colors">
              {p}
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-r from-[hsl(222,47%,8%)] to-[hsl(188,60%,12%,0.4)] border border-[hsl(188,100%,45%,0.2)] rounded-xl p-10">
          <TrendingUp className="w-10 h-10 text-[hsl(188,100%,45%)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Enterprise Partnership</h2>
          <p className="text-[hsl(215,20%,60%)] mb-6 max-w-md mx-auto">Custom integrations, dedicated simulation infrastructure, and co-publication of clinical validation studies.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan">
            Contact Enterprise Sales <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
