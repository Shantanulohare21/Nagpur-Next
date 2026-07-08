import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "Simulation", href: "/simulation" },
  { label: "Implants", href: "/implants" },
  {
    label: "Solutions",
    children: [
      { label: "For Surgeons", href: "/surgeons" },
      { label: "For Manufacturers", href: "/manufacturers" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdown(false);
  }, [location]);

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-200 ${scrolled ? "bg-[hsl(222,47%,6%,0.97)] backdrop-blur-md shadow-lg" : "bg-[hsl(222,47%,6%)]"} border-b border-[hsl(217,32%,14%)]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[hsl(188,100%,45%,0.15)] border border-[hsl(188,100%,45%,0.4)] flex items-center justify-center group-hover:border-[hsl(188,100%,45%,0.8)] transition-colors">
              <Activity className="w-4 h-4 text-[hsl(188,100%,45%)]" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Shoulder<span className="text-[hsl(188,100%,45%)]">Sim</span> AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setDropdown((d) => !d)}
                    onBlur={() => setTimeout(() => setDropdown(false), 150)}
                    className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${item.children.some((c) => c.href === location) ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.08)]" : "text-[hsl(215,20%,70%)] hover:text-white hover:bg-[hsl(217,32%,14%)]"}`}
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdown ? "rotate-180" : ""}`} />
                  </button>
                  {dropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded-lg shadow-2xl overflow-hidden z-50">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}
                          className={`block px-4 py-2.5 text-sm transition-colors ${location === child.href ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.1)]" : "text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,16%)]"}`}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.href} href={item.href!}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${location === item.href ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.08)]" : "text-[hsl(215,20%,70%)] hover:text-white hover:bg-[hsl(217,32%,14%)]"}`}>
                  {item.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/simulation" className="text-sm text-[hsl(215,20%,65%)] hover:text-white transition-colors px-3 py-2 rounded hover:bg-[hsl(217,32%,14%)]">
              Try Demo
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded text-sm font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan">
              Request Demo
            </Link>
          </div>

          <button className="md:hidden p-2 rounded text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,14%)] transition-colors" onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[hsl(217,32%,14%)] bg-[hsl(222,47%,5%)]">
          <div className="px-4 py-3 space-y-0.5">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[hsl(215,20%,35%)] mt-2">{item.label}</div>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}
                      className={`block px-3 py-2.5 rounded text-sm transition-colors ml-2 ${location === child.href ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.08)]" : "text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,14%)]"}`}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.href} href={item.href!}
                  className={`block px-3 py-2.5 rounded text-sm transition-colors ${location === item.href ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.08)]" : "text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,14%)]"}`}>
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-[hsl(217,32%,14%)] mt-2">
              <Link href="/contact" className="w-full flex items-center justify-center py-2.5 rounded font-semibold text-sm bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)]">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
