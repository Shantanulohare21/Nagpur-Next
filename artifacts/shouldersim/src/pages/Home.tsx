import { Link } from "wouter";
import { ArrowRight, Upload, Brain, Package, Play, FileText, ChevronRight, Star, Scan, Cpu, FlaskConical, Stethoscope } from "lucide-react";
import { stats, modules, workflowSteps, testimonials } from "../data/mockData";
import ShoulderVisualization from "../components/ShoulderVisualization";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Upload, Brain, Package, Play, FileText, Scan, Cpu, FlaskConical, Stethoscope,
};

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(222,47%,6%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(188,100%,45%,0.04)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[hsl(210,100%,60%,0.05)] rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(188,100%,45%,0.3)] bg-[hsl(188,100%,45%,0.08)] text-xs font-semibold text-[hsl(188,100%,45%)] mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(188,100%,45%)] animate-pulse" />
              FDA 510(k) Cleared &bull; AI-Powered
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              <span className="text-white">Simulate Before</span>
              <br />
              <span className="text-gradient-cyan">You Operate.</span>
            </h1>
            <p className="text-[hsl(215,20%,65%)] text-lg leading-relaxed mb-8 max-w-xl">
              ShoulderSim AI transforms CT/MRI scans into precision biomechanical simulations — giving surgeons and implant manufacturers the confidence to make better decisions before a single incision.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                data-testid="button-hero-demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan"
              >
                Request Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/simulation"
                data-testid="button-hero-simulation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold border border-[hsl(217,32%,24%)] text-white hover:border-[hsl(188,100%,45%,0.5)] hover:bg-[hsl(217,32%,16%)] transition-colors"
              >
                Try Simulation <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <ShoulderVisualization />
            <div className="absolute -top-4 -right-4 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg p-3 shadow-lg">
              <div className="text-xs text-[hsl(215,20%,55%)] mb-1 font-mono">CASE SSM-2024-0441</div>
              <div className="text-sm font-semibold text-white mb-2">Confidence Scores</div>
              {[
                { name: "Tornier Aequalis", score: 94, color: "hsl(188,100%,45%)" },
                { name: "Arthrex Univers", score: 87, color: "hsl(210,100%,60%)" },
                { name: "DePuy Global", score: 79, color: "hsl(215,20%,40%)" },
              ].map((item) => (
                <div key={item.name} className="mb-1.5">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-[hsl(215,20%,65%)]">{item.name}</span>
                    <span style={{ color: item.color }}>{item.score}%</span>
                  </div>
                  <div className="w-36 h-1.5 bg-[hsl(217,32%,16%)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.score}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-[hsl(217,32%,16%)] text-xs text-[hsl(188,100%,45%)] font-semibold">
                Rec: Tornier Aequalis M
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[hsl(217,32%,14%)] bg-[hsl(222,47%,5%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center" data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="text-3xl sm:text-4xl font-bold text-gradient-cyan mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-xs text-[hsl(215,20%,55%)] leading-snug">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Platform Architecture</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Five Integrated Modules</h2>
          <p className="text-[hsl(215,20%,60%)] max-w-xl mx-auto">From raw DICOM scan to surgical recommendation — every step powered by AI and validated biomechanics.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = iconMap[mod.icon];
            return (
              <div
                key={mod.number}
                className="group bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6 hover:border-[hsl(188,100%,45%,0.4)] transition-all duration-300 hover:bg-[hsl(222,47%,9%)] cursor-pointer"
                data-testid={`module-card-${mod.number}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-xs font-bold font-mono text-[hsl(188,100%,45%,0.6)] w-8 shrink-0 pt-1">{mod.number}</div>
                  <div className="w-10 h-10 rounded-lg bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.2)] flex items-center justify-center group-hover:border-[hsl(188,100%,45%,0.5)] transition-colors">
                    {Icon && <Icon className="w-5 h-5 text-[hsl(188,100%,45%)]" />}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-[hsl(215,20%,55%)] leading-relaxed mb-4">{mod.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-[hsl(217,32%,14%)] text-[hsl(215,20%,65%)] border border-[hsl(217,32%,20%)]">{f}</span>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="bg-[hsl(188,100%,45%,0.05)] border border-[hsl(188,100%,45%,0.2)] rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="text-sm text-[hsl(215,20%,55%)] mb-3">Full platform documentation</div>
            <Link href="/platform" className="inline-flex items-center gap-2 text-[hsl(188,100%,45%)] text-sm font-semibold hover:gap-3 transition-all">
              Explore Platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[hsl(222,47%,5%)] border-y border-[hsl(217,32%,14%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Surgical Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">From Scan to Surgical Plan</h2>
            <p className="text-[hsl(215,20%,60%)] max-w-xl mx-auto">Five steps. Under 10 minutes. Complete AI-powered pre-operative planning.</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-0 lg:gap-0">
            {workflowSteps.map((step, i) => {
              const Icon = iconMap[step.icon];
              return (
                <div key={step.step} className="flex flex-col lg:flex-row items-center flex-1 w-full">
                  <div className="flex flex-col items-center text-center px-4 py-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[hsl(188,100%,45%,0.1)] border-2 border-[hsl(188,100%,45%,0.4)] flex items-center justify-center mb-3 relative">
                      {Icon && <Icon className="w-6 h-6 text-[hsl(188,100%,45%)]" />}
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{step.title}</div>
                    <div className="text-xs text-[hsl(215,20%,55%)] leading-snug max-w-[120px]">{step.description}</div>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <div className="flex items-center justify-center w-8 shrink-0 my-2 lg:my-0">
                      <ChevronRight className="w-5 h-5 text-[hsl(188,100%,45%,0.4)] rotate-90 lg:rotate-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/simulation" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.3)] text-[hsl(188,100%,45%)] hover:bg-[hsl(188,100%,45%,0.15)] transition-colors">
              Try the Demo <Play className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Clinical Validation</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Trusted by Leading Surgeons</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[hsl(40,100%,60%)] text-[hsl(40,100%,60%)]" />
                ))}
              </div>
              <p className="text-[hsl(215,20%,70%)] text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div className="pt-4 border-t border-[hsl(217,32%,16%)]">
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-xs text-[hsl(215,20%,55%)]">{t.role}</div>
                <div className="text-xs text-[hsl(188,100%,45%,0.7)] mt-0.5">{t.specialty}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-r from-[hsl(222,47%,8%)] to-[hsl(188,60%,12%,0.4)] border border-[hsl(188,100%,45%,0.2)] rounded-xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Simulate?
            </h2>
            <p className="text-[hsl(215,20%,60%)] mb-8 max-w-md mx-auto">
              Join 340+ hospitals and leading implant manufacturers already using ShoulderSim AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan">
                Request Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold border border-[hsl(217,32%,24%)] text-white hover:bg-[hsl(217,32%,16%)] transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
