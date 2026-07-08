import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Activity, Brain, Cpu, Database, Eye, Stethoscope, ChevronRight, Play,
  Moon, Sun, Zap, Shield, TrendingUp, Users, Building2, Award, ArrowRight,
  FileText, Upload, Microscope, BarChart3, Layers, Scan, Target, User,
  Headphones, Star, Mail, Phone, MapPin, Send, Check, AlertTriangle,
  RefreshCw, Clock, ChevronDown, GitBranch, Box, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from "recharts";

/* ─────────── THEME HOOK ─────────── */
function useTheme() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);
  return { isDark, toggle: () => setIsDark(d => !d) };
}

/* ─────────── COUNTER HOOK ─────────── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return { count, ref };
}

/* ─────────── SCROLL ANIMATION VARIANTS ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
  hidden: {}
};

/* ─────────── CSS 3D SHOULDER VISUALIZATION ─────────── */
function ShoulderVisualization() {
  const nodes = Array.from({ length: 16 }, (_, i) => ({
    angle: (i / 16) * 360,
    r: 80 + (i % 3) * 20,
    size: 3 + (i % 4),
    dur: 8 + (i % 6),
    delay: i * 0.3
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Starfield */}
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
          }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* Central glow */}
      <div className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute w-40 h-40 rounded-full bg-secondary/15 blur-2xl" />

      {/* Outer decorative rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[320px] h-[320px] rounded-full border border-primary/10"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute w-[270px] h-[270px] rounded-full border border-secondary/15"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute w-[210px] h-[210px] rounded-full border border-violet-500/20"
        style={{ borderStyle: "dashed" }}
      />

      {/* Orbital nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={{ rotate: 360 }}
          transition={{ duration: node.dur, repeat: Infinity, ease: "linear", delay: node.delay }}
          style={{ width: node.r * 2, height: node.r * 2 }}
        >
          <div
            className="absolute rounded-full bg-primary"
            style={{
              width: node.size,
              height: node.size,
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 ${node.size * 3}px rgba(6,182,212,0.6)`,
            }}
          />
        </motion.div>
      ))}

      {/* Core sphere */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-36 h-36 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(6,182,212,0.5), rgba(59,130,246,0.3), rgba(139,92,246,0.2))",
          boxShadow: "0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(59,130,246,0.15), inset 0 0 30px rgba(6,182,212,0.1)",
          border: "1px solid rgba(6,182,212,0.4)"
        }}
      >
        {/* Wireframe grid lines on sphere */}
        <svg width="144" height="144" viewBox="0 0 144 144" className="absolute inset-0 opacity-30">
          <ellipse cx="72" cy="72" rx="70" ry="70" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="0.5" />
          <ellipse cx="72" cy="72" rx="50" ry="70" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
          <ellipse cx="72" cy="72" rx="25" ry="70" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
          <line x1="2" y1="72" x2="142" y2="72" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
          <line x1="72" y1="2" x2="72" y2="142" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
          <ellipse cx="72" cy="50" rx="60" ry="15" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
          <ellipse cx="72" cy="72" rx="70" ry="18" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
          <ellipse cx="72" cy="94" rx="60" ry="15" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
        </svg>
        <Activity className="w-10 h-10 text-primary relative z-10" style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.8))" }} />
      </motion.div>

      {/* Stress zone indicators */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute top-12 right-16 w-8 h-8 rounded-full bg-red-500/30 border border-red-500/60 flex items-center justify-center text-red-400 text-xs font-mono font-bold"
      >H</motion.div>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
        className="absolute bottom-20 left-16 w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 text-xs font-mono font-bold"
      >M</motion.div>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
        className="absolute top-24 left-14 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 text-xs font-mono font-bold"
      >L</motion.div>

      {/* Scan lines effect */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{ background: "linear-gradient(transparent 40%, rgba(6,182,212,0.03) 50%, transparent 60%)" }}
        animate={{ y: [-200, 200] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─────────── PARTICLE FIELD ─────────── */
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: Math.random() * 4 + 4,
    delay: Math.random() * 4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─────────── NAVBAR ─────────── */
function Navbar({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anchorLinks = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Research", href: "#research" },
  ];
  const appLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Simulation", href: "/simulation" },
    { label: "AI Copilot", href: "/copilot" },
    { label: "Reports", href: "/reports" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "border-b border-border/40 bg-background/90 backdrop-blur-2xl shadow-lg shadow-black/20" : "bg-transparent"}`}>
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between" style={{ height: "60px" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)] group-hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] transition-all">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight text-foreground">
              ShoulderSIM <span className="text-primary">AI</span>
            </span>
            <div className="text-[9px] text-muted-foreground/60 -mt-0.5 tracking-widest uppercase">Surgical Platform</div>
          </div>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Marketing links */}
          {anchorLinks.map(l => (
            <a key={l.label} href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
              {l.label}
            </a>
          ))}

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-border/50 rounded-full" />

          {/* App module pills */}
          <div className="flex items-center gap-1 bg-muted/20 border border-border/40 rounded-xl px-1.5 py-1">
            {appLinks.map(pl => (
              <Link key={pl.href} href={pl.href}
                className="px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all">
                {pl.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <Link href="/intake"
            className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 text-xs font-semibold transition-all"
            data-testid="button-new-patient">
            <User className="w-3.5 h-3.5" />
            New Patient
          </Link>

          <Link href="/intake"
            className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_14px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
            data-testid="button-request-demo">
            Launch →
          </Link>

          {/* Mobile hamburger */}
          <button className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5" onClick={() => setMenuOpen(o => !o)} data-testid="button-mobile-menu">
            <motion.div className="w-5 h-0.5 bg-foreground rounded-full" animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }} transition={{ duration: 0.2 }} />
            <motion.div className="w-5 h-0.5 bg-foreground rounded-full" animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.2 }} />
            <motion.div className="w-5 h-0.5 bg-foreground rounded-full" animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }} transition={{ duration: 0.2 }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-2xl border-b border-border/50 px-5 pb-5 pt-2"
          >
            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 px-1">Platform</p>
              {anchorLinks.map(l => (
                <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/30 transition-all">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="border-t border-border/30 pt-3 mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 px-1">Modules</p>
              {[...appLinks, { label: "Implants", href: "/implants" }, { label: "AR / VR", href: "/arvr" }, { label: "Research", href: "/research" }, { label: "Training", href: "/training" }].map(pl => (
                <Link key={pl.href} href={pl.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 text-sm text-primary hover:text-primary/80 rounded-lg hover:bg-primary/5 transition-all font-medium">
                  {pl.label}
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              ))}
            </div>
            <Link href="/intake" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20">
              <User className="w-4 h-4" /> Start New Patient Intake
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─────────── HERO ─────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <ParticleField />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            ShoulderSIM Engine v2.0 — Live
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl xl:text-7xl font-display font-bold leading-[1.05] mb-6 tracking-tight">
            The future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-secondary">
              shoulder surgery
            </span><br />
            starts here.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
            The world's first AI-powered biomechanical shoulder simulation platform. Test implants virtually, predict outcomes before incision, and plan surgeries with quantum-grade precision.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-12">
            <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_25px_rgba(6,182,212,0.4)] border-0 font-medium" data-testid="button-start-simulation">
              Start Simulation
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border/50 hover:border-primary/40 backdrop-blur-sm" data-testid="button-watch-demo">
              <Play className="mr-2 w-4 h-4 fill-current" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-6 text-sm text-muted-foreground">
            {[["142K+", "Simulations"], ["98.4%", "AI Accuracy"], ["850+", "Implants"]].map(([v, l]) => (
              <div key={l} className="flex flex-col">
                <span className="text-xl font-bold font-display text-foreground">{v}</span>
                <span className="text-xs">{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="h-[550px] relative"
        >
          <ShoulderVisualization />

          {/* HUD overlays */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
            className="absolute top-8 right-6 glass rounded-xl p-3 font-mono text-xs space-y-1"
          >
            <div className="text-primary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />SIM_ACTIVE</div>
            <div className="text-muted-foreground">MESH_NODES: <span className="text-foreground">42,091</span></div>
            <div className="text-muted-foreground">CONF: <span className="text-green-400">99.8%</span></div>
            <div className="text-muted-foreground">FPS: <span className="text-foreground">60</span></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
            className="absolute bottom-16 left-6 glass rounded-xl p-3 font-mono text-xs space-y-1"
          >
            <div className="text-secondary text-xs font-medium mb-1">AI PREDICTION</div>
            <div className="flex items-center gap-2"><span className="w-12 h-1.5 rounded-full bg-green-500/60" /><span className="text-green-400">Low Risk</span></div>
            <div className="text-muted-foreground">Dislocation: <span className="text-green-400">2.1%</span></div>
            <div className="text-muted-foreground">Recovery: <span className="text-foreground">12 wks</span></div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────── ABOUT / STATS ─────────── */
function StatCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="platform" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
            <Database className="w-3.5 h-3.5" /> About the Platform
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
            Biomechanical intelligence,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">engineered for surgeons.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ShoulderSIM AI transforms standard DICOM scans into living, breathing digital shoulder models. Our deep-learning engine predicts surgical outcomes, tests implant compatibility, and generates evidence-based surgical plans — all before the patient enters the OR.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {[
            { value: 142000, suffix: "+", label: "Simulations Completed" },
            { value: 98, suffix: ".4%", label: "AI Prediction Accuracy" },
            { value: 850, suffix: "+", label: "Implant Models Tested" },
            { value: 340, suffix: "+", label: "Surgeons Onboarded" }
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              className="p-8 rounded-2xl bg-card border border-card-border relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}
          className="grid lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Scan, title: "DICOM-Native Processing",
              desc: "Upload CT, MRI, or X-ray files directly. Our AI reconstructs full 3D anatomy from standard medical imaging with sub-millimeter precision."
            },
            {
              icon: Brain, title: "Deep Learning at Core",
              desc: "Trained on 500,000+ shoulder cases, our neural networks understand biomechanical relationships that even experienced surgeons miss."
            },
            {
              icon: Shield, title: "Clinical-Grade Validation",
              desc: "Validated in partnership with 12 leading orthopedic research centers across North America and Europe. FDA clearance pathway active."
            }
          ].map((card, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              className="p-8 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── FEATURES ─────────── */
function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);

  const features = [
    {
      icon: Eye, title: "3D Shoulder Digitization",
      desc: "Convert DICOM scans to hyper-accurate 3D patient-specific models. Visualize bones, cartilage, tendons, and muscles with individual layer toggling.",
      tags: ["CT/MRI Support", "Sub-mm Accuracy", "Layer Control"]
    },
    {
      icon: Cpu, title: "Biomechanical Simulation",
      desc: "Dynamic stress distribution mapping across flexion, extension, abduction, and rotation. Real-time heatmaps show red/yellow/green stress zones.",
      tags: ["Real-time FEA", "Stress Heatmaps", "Motion Analysis"]
    },
    {
      icon: Brain, title: "AI Prediction System",
      desc: "Deep learning models predict dislocation risk, implant loosening, scapular notching, and 10-year revision probability with confidence intervals.",
      tags: ["Risk Scoring", "Outcome Prediction", "Explainable AI"]
    },
    {
      icon: Box, title: "Implant Testing Sandbox",
      desc: "Drag, rotate, and reposition implants in 3D space. Test 850+ implant models from major manufacturers with live compatibility scoring.",
      tags: ["850+ Implants", "Live Scoring", "Version Control"]
    },
    {
      icon: Target, title: "Surgical Planning Interface",
      desc: "Build a complete preoperative plan with annotated screenshots, implant specs, approach guidance, and exportable PDF surgical reports.",
      tags: ["PDF Export", "Team Sharing", "OR-Ready Plans"]
    },
    {
      icon: Radio, title: "AR/VR Visualization",
      desc: "Immersive pre-op visualization via WebXR. Walk through the surgical approach in 3D before entering the OR. Training simulations for residents.",
      tags: ["WebXR", "Training Mode", "Haptic Ready"]
    }
  ];

  return (
    <section id="features" className="py-28 relative bg-card/30 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" /> Platform Capabilities
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Every tool surgeons need.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">One unified platform.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From raw scan to surgical plan in under 10 minutes. Six intelligent modules working in harmony.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial="hidden" animate={inView ? "visible" : "hidden"}
              variants={fadeUp} custom={i}
              onClick={() => setActive(i)}
              className={`group p-7 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${active === i
                ? "bg-card border-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                : "bg-card/50 border-card-border hover:border-primary/30 hover:bg-card"}`}
              data-testid={`card-feature-${i}`}
            >
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-secondary transition-opacity ${active === i ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all ${active === i ? "bg-primary/20 border border-primary/30 scale-110" : "bg-muted border border-border group-hover:scale-110"}`}>
                <feat.icon className={`w-6 h-6 transition-colors ${active === i ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <h3 className="text-lg font-display font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feat.desc}</p>
              <div className="flex flex-wrap gap-2">
                {feat.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── DASHBOARD PREVIEW ─────────── */
const recoveryData = [
  { week: "Wk 1", pain: 75, mobility: 10 }, { week: "Wk 2", pain: 65, mobility: 20 },
  { week: "Wk 4", pain: 50, mobility: 38 }, { week: "Wk 6", pain: 35, mobility: 55 },
  { week: "Wk 8", pain: 25, mobility: 70 }, { week: "Wk 12", pain: 12, mobility: 85 },
  { week: "Wk 16", pain: 6, mobility: 94 }
];

const riskData = [
  { name: "Dislocation Risk", value: 8, fill: "#22c55e" },
  { name: "Revision Prob.", value: 22, fill: "#3b82f6" },
  { name: "Inf. Risk", value: 5, fill: "#06b6d4" }
];

function DashboardPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("simulation");

  return (
    <section className="py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
            <BarChart3 className="w-3.5 h-3.5" /> Live Platform Preview
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            See inside the platform.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A surgical intelligence dashboard that makes complex biomechanical data immediately actionable.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.08)]"
        >
          {/* Mock browser bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 max-w-sm mx-auto">
              <div className="bg-background/60 rounded-md px-4 py-1 text-xs text-muted-foreground font-mono text-center border border-border/40">
                app.shouldersim.ai/workspace/patient-8821
              </div>
            </div>
            <div className="flex gap-2">
              {["Simulation", "AI Analysis", "Recovery"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab.toLowerCase().replace(" ", ""))}
                  className={`text-xs px-3 py-1 rounded-md transition-all ${activeTab === tab.toLowerCase().replace(" ", "") ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid={`button-tab-${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-[520px]">
            {/* Left Panel */}
            <div className="w-56 border-r border-border/60 p-4 bg-muted/10 flex flex-col gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Patient</div>
                <div className="p-3 rounded-xl bg-card border border-border/60">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-2">
                    <span className="text-primary font-bold text-sm">JD</span>
                  </div>
                  <div className="text-sm font-bold">John Doe</div>
                  <div className="text-xs text-muted-foreground">64M · Right Shoulder</div>
                  <div className="text-xs text-muted-foreground">Dx: Glenohumeral OA</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Scan Type</div>
                <div className="space-y-1">
                  {[["CT Scan", true], ["MRI", false], ["X-Ray", false]].map(([t, a]) => (
                    <div key={String(t)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg cursor-pointer ${a ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted/50"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${a ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      {String(t)}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Layers</div>
                {[["Bone", true], ["Cartilage", true], ["Tendon", false], ["Implant", true]].map(([l, on]) => (
                  <div key={String(l)} className="flex items-center justify-between text-xs py-1.5">
                    <span className={on ? "text-foreground" : "text-muted-foreground"}>{String(l)}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${on ? "bg-primary/60" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${on ? "right-0.5" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Panel - 3D Viewer */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 grid-overlay opacity-20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/20 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/10" />
              
              {/* Mock 3D shoulder visualization */}
              <div className="relative w-44 h-44">
                <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-spin" style={{ animationDuration: "12s" }} />
                <div className="absolute inset-4 rounded-full border border-secondary/30 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 via-primary/30 to-secondary/20 border border-primary/50 flex items-center justify-center">
                  <div className="text-xs text-primary font-mono text-center">
                    <div>3D MODEL</div>
                    <div className="text-muted-foreground">Active</div>
                  </div>
                </div>
                {/* Stress zones */}
                <div className="absolute -top-2 right-6 w-6 h-6 rounded-full bg-red-500/40 border border-red-500/60 flex items-center justify-center text-red-400 text-xs font-mono">H</div>
                <div className="absolute -bottom-2 left-8 w-5 h-5 rounded-full bg-yellow-500/30 border border-yellow-500/50 flex items-center justify-center text-yellow-400 text-xs font-mono">M</div>
                <div className="absolute top-4 -left-2 w-5 h-5 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center text-green-400 text-xs font-mono">L</div>
              </div>

              <div className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground space-y-0.5">
                <div><span className="text-primary">IMPLANT:</span> Reverse TSA — DJO Reverse Shoulder</div>
                <div><span className="text-primary">ANGLE:</span> 135° inclination / 20° retroversion</div>
              </div>
              <div className="absolute top-4 right-4 font-mono text-xs text-muted-foreground text-right space-y-0.5">
                <div><span className="text-green-400">●</span> Stress OK</div>
                <div>Peak: 2.4 MPa</div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-64 border-l border-border/60 p-4 bg-muted/10 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">AI Recommendations</div>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Best Match</span>
                </div>
                <div className="text-sm font-bold mb-1">Reverse TSA</div>
                <div className="text-xs text-muted-foreground">DJO Reverse Shoulder System</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[92%] bg-primary rounded-full" />
                  </div>
                  <span className="text-xs text-primary font-mono">92%</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Risk Assessment</div>
              {[
                { label: "Dislocation", pct: 8, color: "bg-green-500" },
                { label: "Loosening", pct: 15, color: "bg-yellow-500" },
                { label: "Notching", pct: 6, color: "bg-green-500" },
                { label: "Revision (5yr)", pct: 22, color: "bg-blue-500" }
              ].map(r => (
                <div key={r.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono text-foreground">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full transition-all duration-1000`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}

              <div className="mt-4 space-y-2">
                <Button size="sm" className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8" data-testid="button-export-report">
                  <FileText className="w-3 h-3 mr-2" /> Export PDF Report
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs border-border/50 h-8" data-testid="button-save-simulation">
                  <Database className="w-3 h-3 mr-2" /> Save Simulation
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── WORKFLOW ─────────── */
function Workflow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { icon: Upload, num: "01", title: "DICOM Upload", desc: "Upload CT, MRI, or X-ray scans. Supports DICOM, NIfTI, and standard image formats.", color: "from-cyan-500 to-blue-500" },
    { icon: Scan, num: "02", title: "AI Reconstruction", desc: "Deep learning engine reconstructs full 3D anatomical model in under 90 seconds.", color: "from-blue-500 to-violet-500" },
    { icon: Layers, num: "03", title: "3D Digitization", desc: "Bones, tendons, cartilage, and implant zones segmented with layer-by-layer control.", color: "from-violet-500 to-purple-600" },
    { icon: Activity, num: "04", title: "Biomechanical Sim", desc: "Full range-of-motion simulation with real-time stress heatmaps and force analysis.", color: "from-purple-600 to-pink-500" },
    { icon: Brain, num: "05", title: "AI Analysis", desc: "Complication prediction, implant scoring, and recovery timeline generation.", color: "from-pink-500 to-rose-500" },
    { icon: Target, num: "06", title: "Surgical Plan", desc: "AI-generated surgical plan with implant specs, approach guidance, and risk mitigation.", color: "from-rose-500 to-orange-500" },
    { icon: FileText, num: "07", title: "PDF Export", desc: "One-click export of complete surgical report with charts and recommendations.", color: "from-orange-500 to-yellow-500" }
  ];

  return (
    <section id="workflow" className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
            <GitBranch className="w-3.5 h-3.5" /> Clinical Workflow
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Scan to surgical plan.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From raw imaging data to a complete, evidence-based surgical strategy in under 10 minutes.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 mb-4 group-hover:scale-110 transition-transform`}>
                  <div className="w-full h-full rounded-2xl bg-background/90 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{i + 1}</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">{step.num}</div>
                <div className="text-sm font-display font-bold mb-2 leading-tight">{step.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed hidden lg:block">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── AI INTELLIGENCE ─────────── */
function AIIntelligence() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-secondary/3 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Brain className="w-3.5 h-3.5" /> AI Intelligence Engine
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Intelligence that explains itself.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not just predictions — full clinical reasoning. Every recommendation comes with a transparent rationale.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Left: Charts */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
            {/* Recovery prediction */}
            <div className="p-6 rounded-2xl bg-card border border-card-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Post-Op Recovery Prediction</div>
                  <div className="text-lg font-display font-bold">Recovery Timeline</div>
                </div>
                <div className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">Full Recovery: 16 wks</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={recoveryData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mobGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="pain" stroke="#ef4444" fill="url(#painGrad)" strokeWidth={2} name="Pain %" />
                  <Area type="monotone" dataKey="mobility" stroke="#06b6d4" fill="url(#mobGrad)" strokeWidth={2} name="Mobility %" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-red-500 inline-block" />Pain Level</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-primary inline-block" />Mobility</div>
              </div>
            </div>

            {/* Risk radials */}
            <div className="p-6 rounded-2xl bg-card border border-card-border">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Complication Risk Profile</div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Dislocation", value: 8, color: "#22c55e" },
                  { label: "Loosening", value: 15, color: "#3b82f6" },
                  { label: "Notching", value: 6, color: "#06b6d4" }
                ].map(r => (
                  <div key={r.label} className="text-center">
                    <div className="relative h-20 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={80}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: r.value, fill: r.color }]} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="value" cornerRadius={4} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <span className="absolute text-sm font-bold font-mono" style={{ color: r.color }}>{r.value}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: AI features */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }} className="space-y-5">
            {[
              {
                icon: Brain, title: "Complication Prediction Engine",
                desc: "Calculates dislocation risk, implant loosening probability, scapular notching likelihood, infection risk, and 5/10-year revision probability — all with confidence intervals.",
                color: "text-primary", bg: "bg-primary/10", border: "border-primary/20"
              },
              {
                icon: Clock, title: "Recovery Timeline Forecasting",
                desc: "Patient-specific recovery curves showing expected pain reduction, mobility milestones, and return-to-activity targets based on age, BMI, bone quality, and implant type.",
                color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20"
              },
              {
                icon: Eye, title: "Explainable AI Panels",
                desc: "Every recommendation displays the exact clinical factors that drove the prediction — bone quality score, muscle condition, patient comorbidities — in plain clinical language.",
                color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20"
              },
              {
                icon: Users, title: "Patient Digital Twin",
                desc: "A persistent, patient-specific biomechanical model that evolves with follow-up scans. Track implant wear, bone remodeling, and long-term outcomes over years.",
                color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex gap-5 p-5 rounded-2xl bg-card border border-card-border hover:border-primary/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <feat.icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── IMPLANT ECOSYSTEM ─────────── */
function ImplantEcosystem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState("All");

  const implants = [
    { type: "Total Shoulder", brand: "Zimmer Biomet", material: "Ti-6Al-4V", score: 94, compat: "Excellent", bone: "Good", tags: ["OA", "RCT", "Revision"] },
    { type: "Reverse TSA", brand: "DJO Global", material: "CoCr + UHMWPE", score: 91, compat: "Excellent", bone: "Poor–Good", tags: ["RCT", "Massive Tear", "Elder"] },
    { type: "Hemi Arthroplasty", brand: "Arthrex", material: "Ti Alloy", score: 78, compat: "Good", bone: "Excellent", tags: ["Fracture", "AVN", "Young"] },
    { type: "Stemless Anatomic", brand: "Stryker", material: "Ti + PE Glenoid", score: 88, compat: "Very Good", bone: "Good", tags: ["OA", "Younger", "HA"] }
  ];

  const filters = ["All", "OA", "RCT", "Fracture", "Revision"];

  return (
    <section id="implants" className="py-28 relative bg-card/20 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-14">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <Box className="w-3.5 h-3.5" /> Implant Intelligence Hub
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            850+ implants. Instantly ranked.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-ranked implant library with compatibility scores, material analysis, and patient-specific fit predictions from every major manufacturer.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} className="flex gap-3 justify-center mb-10 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-5 py-2 rounded-full border transition-all ${filter === f ? "bg-primary/20 border-primary/40 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
              data-testid={`button-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {implants.map((imp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-all group hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] relative overflow-hidden"
              data-testid={`card-implant-${i}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-2xl" />

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <Box className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold text-foreground">{imp.score}</div>
                  <div className="text-xs text-muted-foreground">AI Score</div>
                </div>
              </div>

              <div className="mb-1">
                <div className="font-display font-bold text-base">{imp.type}</div>
                <div className="text-xs text-muted-foreground">{imp.brand}</div>
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4 mt-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }} animate={inView ? { width: `${imp.score}%` } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>

              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                <div className="flex justify-between"><span>Material</span><span className="text-foreground">{imp.material}</span></div>
                <div className="flex justify-between"><span>Compatibility</span><span className="text-green-400">{imp.compat}</span></div>
                <div className="flex justify-between"><span>Bone Quality</span><span className="text-foreground">{imp.bone}</span></div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {imp.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} className="text-center mt-10">
          <Button variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary" data-testid="button-browse-implants">
            Browse All 850+ Implants
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── AR/VR SECTION ─────────── */
function ARVRSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
              <Headphones className="w-3.5 h-3.5" /> Immersive Visualization
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
              Step inside the surgery.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-primary">Before you perform it.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              ShoulderSIM AI's WebXR integration lets surgeons walk through the entire surgical approach in immersive 3D. See tissue layers, validate implant fit, and rehearse the operation — all from a browser or XR headset.
            </p>
            <div className="space-y-4 mb-10">
              {[
                { icon: Check, text: "Full AR overlay for intraoperative guidance", color: "text-green-400" },
                { icon: Check, text: "VR surgical training simulator for residents", color: "text-green-400" },
                { icon: Check, text: "Haptic feedback integration (Haption, Force Dimension)", color: "text-green-400" },
                { icon: Check, text: "WebXR-native — works on Meta Quest, Apple Vision Pro, HoloLens", color: "text-green-400" }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                    <Check className={`w-3 h-3 ${item.color}`} />
                  </div>
                  <span className="text-muted-foreground text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]" data-testid="button-explore-arvr">
              Explore AR/VR Features
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[480px] flex items-center justify-center"
          >
            {/* Circular ring visualization */}
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-spin" style={{ animationDuration: "25s" }} />
              <div className="absolute inset-8 rounded-full border border-primary/15 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-violet-900/40 to-primary/20 border border-violet-500/30 flex flex-col items-center justify-center gap-2">
                <Headphones className="w-12 h-12 text-violet-400" />
                <span className="text-sm font-display font-bold text-violet-400">AR/VR Mode</span>
                <span className="text-xs text-muted-foreground">WebXR Active</span>
              </div>
              {/* Floating feature dots */}
              {[
                { label: "AR Overlay", top: "5%", left: "50%", color: "bg-violet-500" },
                { label: "VR Training", top: "50%", right: "0%", color: "bg-primary" },
                { label: "Haptic", bottom: "5%", left: "50%", color: "bg-secondary" },
                { label: "Hologram", top: "50%", left: "0%", color: "bg-purple-400" }
              ].map((dot, i) => (
                <motion.div
                  key={i} animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, delay: i * 0.75, repeat: Infinity }}
                  className="absolute flex flex-col items-center gap-1"
                  style={{ top: dot.top, bottom: dot.bottom, left: dot.left, right: dot.right, transform: "translate(-50%, -50%)" }}
                >
                  <div className={`w-3 h-3 rounded-full ${dot.color}`} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{dot.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── BENEFITS ─────────── */
function Benefits() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const groups = [
    {
      icon: Stethoscope, title: "For Surgeons",
      color: "from-primary/20 to-primary/5", border: "border-primary/30", iconColor: "text-primary",
      benefits: [
        "Reduce intraoperative surprises with preoperative simulation",
        "AI-guided implant selection saves 45 min of OR prep time",
        "Share surgical plans with the team instantly",
        "Access 10-year outcome data for evidence-based decisions",
        "Built-in voice-command simulation assistant"
      ]
    },
    {
      icon: Users, title: "For Patients",
      color: "from-secondary/20 to-secondary/5", border: "border-secondary/30", iconColor: "text-secondary",
      benefits: [
        "Personalized implant matched to your specific anatomy",
        "Predicted recovery timeline before consenting",
        "Lower risk of complications through AI optimization",
        "Digital twin model stored for lifetime follow-up",
        "Clear visual explanations of the surgical plan"
      ]
    },
    {
      icon: Building2, title: "For Manufacturers",
      color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", iconColor: "text-emerald-400",
      benefits: [
        "Virtual biomechanical testing on 100K+ patient models",
        "Accelerated design iteration with AI feedback loops",
        "Regulatory submission data with full traceability",
        "Real-world outcome analytics for product development",
        "Integration with existing CAD/CAM workflows"
      ]
    }
  ];

  return (
    <section className="py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
            <TrendingUp className="w-3.5 h-3.5" /> Who Benefits
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Built for everyone in the OR.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From the surgeon planning the case, to the patient recovering at home, to the manufacturer designing the next generation implant.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {groups.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`p-8 rounded-2xl bg-gradient-to-br ${g.color} border ${g.border} relative overflow-hidden`}
              data-testid={`card-benefit-${i}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-center mb-6">
                <g.icon className={`w-7 h-7 ${g.iconColor}`} />
              </div>
              <h3 className="text-xl font-display font-bold mb-6">{g.title}</h3>
              <ul className="space-y-3">
                {g.benefits.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 w-4 h-4 rounded-full bg-background/50 border border-white/10 flex items-center justify-center flex-shrink-0`}>
                      <Check className={`w-2.5 h-2.5 ${g.iconColor}`} />
                    </div>
                    <span className="text-foreground/80 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── TECH STACK ─────────── */
function TechStack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const techs = [
    { name: "React Three Fiber", category: "3D Rendering", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { name: "TensorFlow", category: "Deep Learning", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: "DICOM Processor", category: "Medical Imaging", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "WebGL 2.0", category: "GPU Rendering", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { name: "WebXR API", category: "AR/VR Platform", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { name: "FEA Engine", category: "Biomechanics", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { name: "Edge Computing", category: "Infrastructure", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { name: "HL7 FHIR", category: "EHR Integration", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  ];

  return (
    <section className="py-24 relative bg-card/20 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-14">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium mb-6">
            <Cpu className="w-3.5 h-3.5" /> Technology Foundation
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Enterprise-grade infrastructure.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on the most advanced stack available for medical simulation — from GPU-accelerated rendering to real-time FEA biomechanics.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {techs.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-2xl ${t.bg} border ${t.border} text-center group hover:scale-105 transition-transform`}
              data-testid={`card-tech-${i}`}
            >
              <div className={`text-lg font-display font-bold mb-1 ${t.color}`}>{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.category}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── RESEARCH & TESTIMONIALS ─────────── */
function Research() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      quote: "ShoulderSIM AI is the most significant advancement in preoperative shoulder planning I've seen in 25 years of practice. The complication prediction accuracy is remarkable.",
      name: "Dr. Sarah Chen", title: "Chief of Orthopedics, Cleveland Clinic", stars: 5
    },
    {
      quote: "The AI implant recommendation engine saved my team hours of decision-making per case. The explainable AI panel means I can justify every choice to the patient and their family.",
      name: "Dr. Matthias Weber", title: "Professor of Orthopaedic Surgery, Charité Berlin", stars: 5
    },
    {
      quote: "We've integrated ShoulderSIM AI into our research pipeline. The digital twin capability and long-term outcome tracking is exactly what the field has been waiting for.",
      name: "Dr. James Park", title: "Head of Shoulder Research, HSS New York", stars: 5
    }
  ];

  return (
    <section id="research" className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/2 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-6">
            <Award className="w-3.5 h-3.5" /> Trusted by Researchers
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Validated in leading institutions.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            12 academic medical centers. 3 published clinical trials. 340 active surgeons worldwide.
          </motion.p>
        </motion.div>

        {/* Research stats banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid sm:grid-cols-4 gap-6 mb-16 p-8 rounded-2xl bg-card border border-card-border"
        >
          {[
            { value: "12", label: "Research Centers", icon: Building2 },
            { value: "3", label: "Clinical Trials", icon: Microscope },
            { value: "98.4%", label: "Prediction Accuracy", icon: Target },
            { value: "142K+", label: "Published Cases", icon: FileText }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-display font-bold text-foreground mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="p-7 rounded-2xl bg-card border border-card-border relative group hover:border-primary/20 transition-all"
              data-testid={`card-testimonial-${i}`}
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                  {t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── CONTACT / DEMO ─────────── */
function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "Surgeon", institution: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
              <Send className="w-3.5 h-3.5" /> Book a Demo
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
              Ready to transform<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">your surgical planning?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Get a personalized 30-minute demo with one of our orthopedic simulation specialists. We'll load a real shoulder case and walk through the full AI workflow.
            </p>

            <div className="space-y-5">
              {[
                { icon: Mail, label: "enterprise@shouldersim.ai" },
                { icon: Phone, label: "+1 (617) 555-0187" },
                { icon: MapPin, label: "Boston, MA — San Francisco, CA — Munich, Germany" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="p-8 rounded-3xl bg-card border border-card-border shadow-[0_0_50px_rgba(6,182,212,0.06)]">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3">Request Received!</h3>
                    <p className="text-muted-foreground">Our team will reach out within 24 hours to schedule your personalized demo.</p>
                    <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setSubmitted(false)} data-testid="button-send-another">
                      Send Another Request
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Full Name</label>
                        <Input
                          placeholder="Dr. Jane Smith"
                          value={formData.name}
                          onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                          className="bg-background/50 border-border/60 focus:border-primary/50 h-11"
                          data-testid="input-name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Email</label>
                        <Input
                          type="email" placeholder="jane@hospital.org"
                          value={formData.email}
                          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                          className="bg-background/50 border-border/60 focus:border-primary/50 h-11"
                          data-testid="input-email"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Role</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        data-testid="select-role"
                      >
                        <option>Surgeon</option>
                        <option>Researcher</option>
                        <option>Implant Manufacturer</option>
                        <option>Hospital Administrator</option>
                        <option>Resident / Fellow</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Hospital / Institution</label>
                      <Input
                        placeholder="Cleveland Clinic"
                        value={formData.institution}
                        onChange={e => setFormData(f => ({ ...f, institution: e.target.value }))}
                        className="bg-background/50 border-border/60 focus:border-primary/50 h-11"
                        data-testid="input-institution"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Message (optional)</label>
                      <Textarea
                        placeholder="Tell us about your use case..."
                        value={formData.message}
                        onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                        className="bg-background/50 border-border/60 focus:border-primary/50 resize-none"
                        rows={4}
                        data-testid="textarea-message"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)]" data-testid="button-submit-demo">
                      Schedule My Demo
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to our privacy policy. No spam, ever.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── DIGITAL TWIN SECTION ─────────── */
function DigitalTwin() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeLayer, setActiveLayer] = useState(0);
  const layers = [
    { label: "Bone Structure", color: "text-slate-300", bg: "bg-slate-400/20 border-slate-400/40", desc: "Patient-specific cortical and trabecular bone geometry extracted from CT scan with ±0.3mm precision." },
    { label: "Muscle Groups", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/40", desc: "Volumetric muscle models with fiber direction tracking — deltoid, rotator cuff, biceps, triceps." },
    { label: "Cartilage Layer", color: "text-green-400", bg: "bg-green-500/20 border-green-500/40", desc: "T2 MRI mapping identifies cartilage thickness (0.5–3mm) and degeneration zones across the glenohumeral joint." },
    { label: "Neural Pathways", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40", desc: "Axillary nerve, brachial plexus proximity mapped for surgical safety zones. Collision detection enabled." },
    { label: "Vascular Map", color: "text-red-400", bg: "bg-red-500/20 border-red-500/40", desc: "Anterior circumflex humeral artery and venous drainage mapped from 3D angiogram overlay." },
    { label: "Implant Virtual", color: "text-primary", bg: "bg-primary/20 border-primary/40", desc: "Proposed implant rendered into patient anatomy with stress simulation at bone-implant interface." },
  ];

  return (
    <section ref={ref} className="py-28 relative overflow-hidden" id="digital-twin">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
              <Scan className="w-3.5 h-3.5" />Patient-Specific Digital Twin
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Every patient is <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-primary">anatomically unique.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed mb-8">
              ShoulderSIM AI creates a precise 3D digital replica of each patient's shoulder — bones, cartilage, muscles, nerves, and vasculature — reconstructed from DICOM data. Surgeons plan on the actual patient, not a generic atlas.
            </motion.p>
            <motion.div variants={stagger} className="space-y-2">
              {layers.map((l, i) => (
                <motion.button key={l.label} variants={fadeUp} onClick={() => setActiveLayer(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeLayer === i ? `${l.bg} ${l.color}` : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${activeLayer === i ? "bg-current" : "bg-border/60"}`} />
                  <span className="text-sm font-medium">{l.label}</span>
                  {activeLayer === i && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.8 }}>
            <div className="relative bg-card/40 border border-border/60 rounded-2xl p-6 backdrop-blur-sm">
              {/* Mock CT-scan style viewer */}
              <div className="bg-slate-950/80 rounded-xl overflow-hidden mb-4" style={{ height: 300, background: "radial-gradient(ellipse, rgba(139,92,246,0.06), rgba(0,0,0,0.95))" }}>
                <div className="relative h-full flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs><pattern id="twingrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="0.4"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#twingrid)" />
                  </svg>
                  {/* Simplified anatomy layers */}
                  <div className="relative w-[220px] h-[220px]">
                    {activeLayer >= 0 && <div className="absolute inset-6 rounded-full border-2 border-slate-400/30" style={{ background: "rgba(226,232,240,0.05)" }} />}
                    {activeLayer >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-2 rounded-full border border-blue-500/30" style={{ background: "rgba(59,130,246,0.06)" }} />}
                    {activeLayer >= 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute" style={{ width: 80, height: 96, top: "35%", left: "27%", border: "1.5px solid rgba(34,197,94,0.4)", borderRadius: "50%", background: "rgba(34,197,94,0.06)" }} />}
                    {activeLayer >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <svg className="absolute inset-0 w-full h-full"><path d="M 80 130 Q 100 110 130 120 Q 160 130 175 150" fill="none" stroke="rgba(250,204,21,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/></svg>
                    </motion.div>}
                    {activeLayer >= 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <svg className="absolute inset-0 w-full h-full"><path d="M 95 88 Q 120 84 132 96 Q 144 108 140 124" fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth="2"/></svg>
                    </motion.div>}
                    {activeLayer >= 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute" style={{ width: 70, height: 86, top: "calc(35% + 5px)", left: "calc(27% + 5px)", border: "1.5px solid rgba(6,182,212,0.5)", borderRadius: "50%", background: "rgba(6,182,212,0.08)", boxShadow: "0 0 12px rgba(6,182,212,0.2)" }} />}
                    {/* Core humeral head */}
                    <div className="absolute w-20 h-20 rounded-full" style={{ top: "31%", left: "31%", background: "radial-gradient(circle at 35% 30%, rgba(226,232,240,0.18), rgba(148,163,184,0.05))", border: "1.5px solid rgba(148,163,184,0.5)" }} />
                  </div>
                  <div className="absolute top-3 left-3 text-[9px] font-mono text-violet-400/70 space-y-0.5">
                    <div>PATIENT: P-2024-0142</div>
                    <div>LAYER: {layers[activeLayer].label.toUpperCase()}</div>
                  </div>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeLayer} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-3 rounded-lg border ${layers[activeLayer].bg}`}>
                  <div className={`text-xs font-semibold mb-1 ${layers[activeLayer].color}`}>{layers[activeLayer].label}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{layers[activeLayer].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── VOICE ASSISTANT SECTION ─────────── */
function VoiceAssistant() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [typingResponse, setTypingResponse] = useState(false);

  const demoQueries = [
    { q: "What's the dislocation risk for patient P-0142 with current implant placement?", a: "Dislocation risk for P-0142 is currently 23.4% — elevated due to 8° deviation from optimal inclination. Recommend adjusting from 143° to 135°. Risk reduces to 14.1% with correction." },
    { q: "Show me all reverse shoulder implants with >92% success rate", a: "Found 2 implants matching criteria: Arthrex IDES Reverse (92.9% success, AI score 92) and Zimmer Comprehensive Reverse (92.3%, score 93). Both available in your implant library." },
    { q: "Generate PDF report for today's planned cases", a: "Generating surgical planning reports for 3 cases: P-0142 (TSA), P-0138 (RSA), P-0129 (Resurfacing). Reports include AI analysis, risk scores, and implant specs. Ready in ~12 seconds." },
  ];
  const [queryIdx, setQueryIdx] = useState(0);

  const runDemo = () => {
    if (isActive) return;
    setIsActive(true);
    const demo = demoQueries[queryIdx % demoQueries.length];
    setTranscript(""); setResponse("");
    let i = 0;
    const t1 = setInterval(() => { i++; setTranscript(demo.q.slice(0, i)); if (i >= demo.q.length) clearInterval(t1); }, 30);
    setTimeout(() => {
      setTypingResponse(true);
      setTimeout(() => {
        setTypingResponse(false);
        let j = 0;
        const t2 = setInterval(() => { j++; setResponse(demo.a.slice(0, j)); if (j >= demo.a.length) { clearInterval(t2); setIsActive(false); setQueryIdx(q => q + 1); } }, 15);
      }, 1000);
    }, demo.q.length * 30 + 400);
  };

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/3 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Radio className="w-3.5 h-3.5" />Voice Command Intelligence
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
            Surgical intelligence at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">speed of speech.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ShoulderSIM AI voice assistant understands clinical language. Query risk scores, pull implant data, generate reports, and control simulations — all hands-free.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <div className="bg-card/50 border border-border/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono text-muted-foreground">VOICE INTERFACE — READY</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">ShoulderSIM v2.0</span>
              </div>

              {/* Waveform visualization */}
              <div className="flex items-center justify-center gap-1 h-16 mb-5">
                {Array.from({ length: 28 }, (_, i) => (
                  <motion.div key={i}
                    className="w-1.5 rounded-full bg-primary/60"
                    animate={isActive ? { height: [4, Math.random() * 32 + 8, 4] } : { height: 4 }}
                    transition={{ duration: 0.4 + Math.random() * 0.3, repeat: isActive ? Infinity : 0, delay: i * 0.04, ease: "easeInOut" }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>

              {/* Transcript */}
              <div className="mb-4 min-h-[60px]">
                {transcript && (
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40 mb-3">
                    <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Radio className="w-3 h-3 text-primary" />SURGEON</div>
                    <p className="text-sm text-foreground">{transcript}</p>
                  </div>
                )}
                {(typingResponse || response) && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-[10px] text-primary mb-1 flex items-center gap-1"><Brain className="w-3 h-3" />AI ASSISTANT</div>
                    {typingResponse ? (
                      <div className="flex items-center gap-1">
                        {[0.1, 0.2, 0.3].map(d => (
                          <motion.div key={d} animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.5, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">{response}</p>
                    )}
                  </div>
                )}
              </div>

              <button onClick={runDemo} disabled={isActive}
                className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${isActive ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(6,182,212,0.3)]"}`}>
                {isActive ? <><Radio className="w-4 h-4 animate-pulse" />Listening…</> : <>▶ Try Demo Query</>}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="space-y-4">
              {[
                { cmd: "\"Simulate flexion to 160 degrees\"", result: "Motion simulation updated — stress increases 12% in supraspinatus region at 160°", icon: RefreshCw },
                { cmd: "\"What implants work with poor bone quality?\"", result: "4 implants match: SMR Reverse (Tantalum), Equinoxe Reverse, ReUnion RSA, HemiCAP Partial", icon: Database },
                { cmd: "\"Export surgical report for all today's cases\"", result: "3 PDF reports generated: P-0142, P-0138, P-0129 — sent to OR planning system", icon: FileText },
                { cmd: "\"Set anteversion to 18 degrees\"", result: "Glenoid anteversion updated 20° → 18°. Dislocation risk reduced by 2.3%", icon: Target },
              ].map((item) => (
                <div key={item.cmd} className="flex gap-4 p-4 bg-card/40 border border-border/50 rounded-xl hover:border-primary/30 transition-all">
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-mono text-primary mb-1">{item.cmd}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">{item.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── IMPLANT FAILURE SECTION ─────────── */
function ImplantFailureSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeMode, setActiveMode] = useState(0);

  const failureModes = [
    { label: "Superior Migration", risk: 28, severity: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", desc: "Rotator cuff tear allows superior humeral head displacement. Detected via humeral head–acromion distance < 7mm threshold.", finding: "Supraspinatus integrity < 40% — migration risk elevated" },
    { label: "Glenoid Loosening", risk: 18, severity: "Low", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", desc: "Eccentric loading pattern creates cyclical stress at the bone-cement interface — the 'rocking horse' phenomenon.", finding: "Eccentric loading index: 0.14 — within safe zone" },
    { label: "Stress Fracture", risk: 44, severity: "High", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", desc: "Periprosthetic fracture risk at humeral stem tip. T-score -2.1 creates elevated cortical thinning susceptibility.", finding: "Cortical bone thickness 2.1mm — below 3mm safety threshold" },
    { label: "Polyethylene Wear", risk: 12, severity: "Low", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", desc: "UHMWPE bearing surface wear estimated at 0.09mm/yr based on joint kinematics and patient activity level.", finding: "Projected 20yr wear: 1.8mm — within ASTM limits" },
  ];

  return (
    <section ref={ref} className="py-28 relative overflow-hidden" id="failure-analysis">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />Implant Failure Simulation
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
            Predict failure. <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Before it happens.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ShoulderSIM AI simulates every known failure mode — stress concentrations, loosening, migration, and wear — using patient-specific bone quality scores and biomechanical models validated against 142K+ surgical outcomes.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <div className="space-y-3">
              {failureModes.map((f, i) => (
                <button key={f.label} onClick={() => setActiveMode(i)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${activeMode === i ? f.bg : "bg-card/40 border-border/50 hover:border-border/80"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-mono ${activeMode === i ? f.color : "text-muted-foreground"} bg-background/50`}>
                    {f.risk}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${activeMode === i ? f.color : "text-foreground"}`}>{f.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${activeMode === i ? f.bg : "bg-border/30 border-border/40 text-muted-foreground"}`}>{f.severity}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeMode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                className="bg-card/50 border border-border/60 rounded-2xl p-6 backdrop-blur-sm sticky top-24">

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border mb-5 ${failureModes[activeMode].bg} ${failureModes[activeMode].color}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />{failureModes[activeMode].label} — {failureModes[activeMode].severity} Risk
                </div>

                {/* Stress visualization */}
                <div className="h-[180px] rounded-xl mb-5 relative overflow-hidden flex items-center justify-center"
                  style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(${activeMode === 2 ? "239,68,68" : activeMode === 0 ? "234,179,8" : "6,182,212"},0.06), rgba(0,0,0,0.9))` }}>
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs><pattern id="failgrid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#failgrid)" />
                  </svg>
                  <div className="relative w-[140px] h-[140px]">
                    {/* Base anatomy */}
                    <div className="absolute w-14 h-14 rounded-full border border-slate-500/40" style={{ top: "30%", left: "25%", background: "rgba(148,163,184,0.06)" }} />
                    <div className="absolute w-18 h-20 rounded-full border border-slate-400/30" style={{ width: 72, height: 80, top: "22%", left: "21%", background: "rgba(148,163,184,0.04)" }} />
                    {/* Humeral head */}
                    <div className="absolute w-16 h-16 rounded-full border border-slate-400/50" style={{ top: "28%", left: "28%", background: "rgba(203,213,225,0.08)" }} />
                    {/* Failure zone */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute rounded-full"
                      style={{
                        width: 36, height: 36,
                        top: activeMode === 0 ? "15%" : activeMode === 1 ? "42%" : activeMode === 2 ? "58%" : "38%",
                        left: activeMode === 0 ? "36%" : activeMode === 1 ? "28%" : activeMode === 2 ? "44%" : "52%",
                        background: `radial-gradient(circle, ${activeMode === 2 ? "rgba(239,68,68,0.4)" : activeMode === 0 ? "rgba(234,179,8,0.35)" : "rgba(59,130,246,0.3)"}, transparent)`,
                        border: `1px solid ${activeMode === 2 ? "rgba(239,68,68,0.5)" : activeMode === 0 ? "rgba(234,179,8,0.45)" : "rgba(59,130,246,0.4)"}`,
                      }}
                    />
                  </div>
                </div>

                {/* Risk meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Failure Probability</span>
                    <span className={`font-bold font-mono ${failureModes[activeMode].color}`}>{failureModes[activeMode].risk}%</span>
                  </div>
                  <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${failureModes[activeMode].risk}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${activeMode === 2 ? "bg-red-500" : activeMode === 0 ? "bg-yellow-500" : "bg-primary"}`} />
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${failureModes[activeMode].bg} ${failureModes[activeMode].color}`}>
                  <div className="font-semibold mb-1">AI Finding</div>
                  <div className="text-muted-foreground">{failureModes[activeMode].finding}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  const links = {
    "Platform": ["3D Digitization", "Biomechanical Sim", "AI Prediction", "Implant Hub", "AR/VR Mode"],
    "Company": ["About Us", "Research", "Clinical Trials", "Careers", "Press"],
    "Resources": ["Documentation", "Case Studies", "Webinars", "Support", "API"],
    "Legal": ["Privacy Policy", "Terms of Use", "HIPAA", "FDA 510(k)", "SOC 2"]
  };

  return (
    <footer className="border-t border-border/60 bg-card/20">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-xl">ShoulderSIM <span className="text-primary">AI</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              The world's first AI-powered biomechanical shoulder simulation platform. Built for surgeons, validated by researchers.
            </p>
            <div className="flex gap-3">
              {["Twitter", "LinkedIn", "GitHub", "YouTube"].map(s => (
                <a key={s} href="#" className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all text-xs font-bold">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">{group}</div>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ShoulderSIM AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />All systems operational</span>
            <span>HIPAA Compliant</span>
            <span>SOC 2 Type II</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── MAIN PAGE ─────────── */
export default function Home() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar isDark={isDark} toggle={toggle} />
      <main>
        <Hero />
        <About />
        <Features />
        <DashboardPreview />
        <Workflow />
        <AIIntelligence />
        <ImplantEcosystem />
        <ARVRSection />
        <Benefits />
        <TechStack />
        <Research />
        <DigitalTwin />
        <ImplantFailureSection />
        <VoiceAssistant />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
