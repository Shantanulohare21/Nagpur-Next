import { useState } from "react";
import { Link } from "wouter";
import { Check, X, ChevronDown, ChevronUp, ArrowRight, Zap } from "lucide-react";
import { pricingFeatures, faqs } from "../data/mockData";

const tiers = [
  {
    id: "hospital",
    name: "Hospital",
    price: "$2,800",
    period: "/seat/year",
    description: "Per-seat license for surgical departments and hospital systems",
    badge: null,
    cta: "Request Hospital Demo",
  },
  {
    id: "manufacturer",
    name: "Manufacturer",
    price: "Custom",
    period: "enterprise pricing",
    description: "Unlimited enterprise access for implant companies and R&D teams",
    badge: "Most Popular",
    cta: "Talk to Enterprise Sales",
  },
  {
    id: "academic",
    name: "Research / Academic",
    price: "$890",
    period: "/seat/year",
    description: "For research institutions, universities, and clinical investigators",
    badge: null,
    cta: "Apply for Access",
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Pricing</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Straightforward Pricing</h1>
          <p className="text-[hsl(215,20%,60%)] text-lg max-w-xl mx-auto">
            Three tiers built for every use case — from individual surgeons to global implant enterprises.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-[hsl(222,47%,8%)] border rounded-xl p-7 flex flex-col ${
                tier.badge
                  ? "border-[hsl(188,100%,45%,0.5)] glow-cyan"
                  : "border-[hsl(217,32%,16%)]"
              }`}
              data-testid={`pricing-tier-${tier.id}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] text-xs font-bold rounded-full whitespace-nowrap">
                  {tier.badge}
                </div>
              )}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {tier.badge && <Zap className="w-4 h-4 text-[hsl(188,100%,45%)]" />}
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold ${tier.badge ? "text-gradient-cyan" : "text-white"}`}>{tier.price}</span>
                  <span className="text-[hsl(215,20%,50%)] text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-[hsl(215,20%,55%)]">{tier.description}</p>
              </div>
              <div className="flex-1" />
              <Link
                href="/contact"
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded font-semibold text-sm transition-colors ${
                  tier.badge
                    ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)]"
                    : "border border-[hsl(217,32%,24%)] text-white hover:bg-[hsl(217,32%,16%)]"
                }`}
                data-testid={`button-cta-${tier.id}`}
              >
                {tier.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Feature Comparison</h2>
          <p className="text-[hsl(215,20%,55%)] text-sm text-center mb-8">Everything you get with each tier</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(217,32%,20%)]">
                  <th className="text-left py-3 pr-6 text-[hsl(215,20%,55%)] font-medium w-1/2">Feature</th>
                  {tiers.map((t) => (
                    <th key={t.id} className={`text-center py-3 px-4 font-semibold ${t.badge ? "text-[hsl(188,100%,45%)]" : "text-white"}`}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingFeatures.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-[hsl(217,32%,12%)] ${i % 2 === 0 ? "" : "bg-[hsl(222,47%,7%,0.4)]"}`}>
                    <td className="py-3 pr-6 text-[hsl(215,20%,75%)]">{row.feature}</td>
                    {(["hospital", "manufacturer", "academic"] as const).map((tid) => {
                      const val = row[tid];
                      const tier = tiers.find((t) => t.id === tid)!;
                      return (
                        <td key={tid} className={`py-3 px-4 text-center ${tier.badge ? "bg-[hsl(188,100%,45%,0.03)]" : ""}`}>
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check className="w-4 h-4 text-[hsl(188,100%,45%)] mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-[hsl(217,32%,30%)] mx-auto" />
                            )
                          ) : (
                            <span className="text-[hsl(215,20%,70%)] text-xs">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Frequently Asked Questions</h2>
          <p className="text-[hsl(215,20%,55%)] text-sm text-center mb-8">Everything you need to know about ShoulderSim AI</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg overflow-hidden" data-testid={`faq-item-${i}`}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[hsl(188,100%,45%)] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[hsl(215,20%,45%)] shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[hsl(215,20%,60%)] leading-relaxed border-t border-[hsl(217,32%,14%)] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-[hsl(215,20%,55%)] mb-4">Still have questions? Our team is here to help.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan">
            Talk to Sales <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
