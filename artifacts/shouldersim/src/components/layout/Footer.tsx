import { Link } from "wouter";
import { Activity, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[hsl(222,47%,4%)] border-t border-[hsl(217,32%,14%)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-[hsl(188,100%,45%)] opacity-60" />
                <div className="absolute inset-1 rounded-full border border-[hsl(188,100%,45%)] opacity-40" />
                <Activity className="absolute inset-0 w-full h-full p-1.5 text-[hsl(188,100%,45%)]" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-gradient-cyan">Shoulder</span>
                <span className="text-white">Sim AI</span>
              </span>
            </div>
            <p className="text-[hsl(215,20%,55%)] text-sm leading-relaxed mb-6 max-w-xs">
              The world's most advanced AI-powered biomechanical simulation platform for orthopedic shoulder surgery planning and implant testing.
            </p>
            <div className="space-y-2 text-sm text-[hsl(215,20%,55%)]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <span>contact@shouldersim.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <span>+1 (617) 482-9100</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                <span>One Medical Center Drive, Boston, MA 02115</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Overview", href: "/" },
                { label: "Modules", href: "/platform" },
                { label: "Simulation Demo", href: "/simulation" },
                { label: "Implant Library", href: "/implants" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[hsl(215,20%,55%)] hover:text-[hsl(188,100%,45%)] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Solutions</h4>
            <ul className="space-y-2">
              {[
                { label: "For Surgeons", href: "/surgeons" },
                { label: "For Manufacturers", href: "/manufacturers" },
                { label: "Pricing", href: "/pricing" },
                { label: "Request Demo", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[hsl(215,20%,55%)] hover:text-[hsl(188,100%,45%)] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "/contact" },
                { label: "Clinical Evidence", href: "/surgeons" },
                { label: "Regulatory", href: "/contact" },
                { label: "Privacy Policy", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[hsl(215,20%,55%)] hover:text-[hsl(188,100%,45%)] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[hsl(217,32%,14%)] flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-1.5 text-xs bg-[hsl(0,62%,40%,0.15)] border border-[hsl(0,62%,40%,0.3)] text-[hsl(0,62%,65%)] rounded px-3 py-2 max-w-xl">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> For surgical planning use only — not a substitute for clinical judgment. ShoulderSim AI outputs are decision support tools intended to assist, not replace, qualified medical professionals.
            </span>
          </div>
          <p className="text-[hsl(215,20%,40%)] text-xs whitespace-nowrap">
            &copy; 2024 ShoulderSim AI, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
