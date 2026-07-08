import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  ArrowLeft, Headphones, Smartphone, Monitor, Play, RotateCcw,
  ZoomIn, Move3d, Eye, Brain, Shield, Zap, Target, ChevronRight,
  Activity, Check, Info, Settings, Download, Layers, Maximize2,
  Camera, Radio, Star, Users, Award, Clock
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[hsl(222,47%,7%)] rounded-2xl border border-[hsl(217,32%,18%)]">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Headphones className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-white font-semibold text-sm mb-1">3D Preview Unavailable</p>
          <p className="text-[hsl(215,20%,45%)] text-xs text-center px-6">WebGL is not supported in this environment. All AR/VR features remain fully functional on supported devices.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── 3D SHOULDER MODEL ─── */
function ShoulderModel({ mode, animate }: { mode: string; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const humRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (animate) {
      const t = clock.getElapsedTime();
      humRef.current.rotation.z = Math.sin(t * 0.8) * 0.4 - 0.2;
      humRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
    groupRef.current.rotation.y += 0.003;
  });

  const scapColor = mode === "ar" ? "#22d3ee" : "#8b9db5";
  const humColor = mode === "ar" ? "#34d399" : "#b0c4d8";
  const implantColor = "#06b6d4";
  const glowColor = mode === "ar" ? "#22d3ee" : "#94a3b8";

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.4}>
      {/* Scapula body */}
      <mesh position={[0, 0, -0.3]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial color={scapColor} transparent opacity={mode === "ar" ? 0.35 : 0.85} roughness={0.4} metalness={0.3} wireframe={mode === "ar"} />
      </mesh>
      {/* Glenoid */}
      <mesh position={[0.25, 0.1, 0]} rotation={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
        <meshStandardMaterial color={mode === "ar" ? "#22d3ee" : "#a0b4c8"} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Implant glenoid component */}
      <mesh position={[0.32, 0.1, 0]} rotation={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.20, 0.20, 0.04, 32]} />
        <meshStandardMaterial color={implantColor} roughness={0.1} metalness={0.9} emissive={implantColor} emissiveIntensity={mode === "ar" ? 0.4 : 0.1} />
      </mesh>
      {/* Humerus head */}
      <mesh ref={humRef} position={[0.52, 0.1, 0.05]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={humColor} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Implant humeral head */}
      <mesh position={[0.52, 0.1, 0.05]}>
        <sphereGeometry args={[0.265, 24, 24]} />
        <meshStandardMaterial color={implantColor} transparent opacity={0.7} roughness={0.05} metalness={0.95} emissive={implantColor} emissiveIntensity={0.2} />
      </mesh>
      {/* Humerus shaft */}
      <mesh position={[0.9, -0.5, 0.05]} rotation={[0.2, 0, 0.5]}>
        <cylinderGeometry args={[0.1, 0.14, 1.1, 16]} />
        <meshStandardMaterial color={humColor} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Implant stem */}
      <mesh position={[0.85, -0.3, 0.05]} rotation={[0.2, 0, 0.5]}>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 12]} />
        <meshStandardMaterial color={implantColor} roughness={0.1} metalness={0.95} emissive={implantColor} emissiveIntensity={0.15} />
      </mesh>
      {/* AR overlay guide lines */}
      {mode === "ar" && (
        <>
          <mesh position={[0.52, 0.1, 0.05]}>
            <torusGeometry args={[0.35, 0.01, 8, 48]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.52, 0.1, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35, 0.01, 8, 48]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} transparent opacity={0.4} />
          </mesh>
        </>
      )}
      {/* Ambient particles for VR mode */}
      {mode === "vr" && Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * Math.PI * 0.25) * 1.5,
          Math.cos(i * Math.PI * 0.25) * 0.8,
          Math.sin(i * 0.7) * 0.5
        ]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ mode, animate }: { mode: string; animate: boolean }) {
  return (
    <>
      <ambientLight intensity={mode === "ar" ? 0.4 : 0.6} />
      <directionalLight position={[5, 5, 5]} intensity={mode === "ar" ? 0.8 : 1.2} color={mode === "ar" ? "#22d3ee" : "#ffffff"} />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#0ea5e9" />
      <pointLight position={[2, -2, -2]} intensity={0.3} color="#8b5cf6" />
      <ShoulderModel mode={mode} animate={animate} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} autoRotate={false} />
    </>
  );
}

/* ─── FEATURE CARDS ─── */
const AR_FEATURES = [
  { icon: Layers, title: "Anatomy Overlay", desc: "Project bone, muscle, and tendon layers onto patient's shoulder in real-time using camera feed.", badge: "Live" },
  { icon: Target, title: "Implant Positioning", desc: "Visualize exact implant placement with AR guidance markers before incision.", badge: "Precision" },
  { icon: Smartphone, title: "Mobile AR Viewer", desc: "Use iOS/Android device camera to view patient-specific anatomy overlays at bedside.", badge: "Mobile" },
  { icon: Brain, title: "AI Landmark Detection", desc: "Automatic detection of coracoid, acromion, and glenoid landmarks for AR calibration.", badge: "AI" },
];

const VR_FEATURES = [
  { icon: Headphones, title: "Surgical Rehearsal", desc: "Full immersive simulation of the deltopectoral approach with tactile tool feedback.", badge: "Immersive" },
  { icon: Monitor, title: "Virtual OR", desc: "Realistic operating room environment with positioning, lighting, and team simulation.", badge: "Training" },
  { icon: Move3d, title: "Implant Training", desc: "Practice component insertion, impaction, and reduction in a zero-risk virtual environment.", badge: "Practice" },
  { icon: Users, title: "Multi-User Sessions", desc: "Collaborative VR sessions for surgical team briefing and pre-op planning review.", badge: "Team" },
];

const METRICS = [
  { label: "Training Completion Rate", val: "94%", trend: "+12% vs traditional" },
  { label: "Procedure Accuracy Gain", val: "+23%", trend: "vs. standard training" },
  { label: "VR Case Library", val: "180+", trend: "Shoulder procedures" },
  { label: "Error Reduction", val: "31%", trend: "Post-VR training" },
];

type XRMode = "overview" | "ar" | "vr";

export default function ARVRPage() {
  const [activeMode, setActiveMode] = useState<XRMode>("overview");
  const [animating, setAnimating] = useState(true);
  const [vrStep, setVrStep] = useState(0);
  const [arLayer, setArLayer] = useState({ bone: true, muscle: true, tendon: false, implant: true });

  const vrSteps = [
    { title: "Load Patient Model", desc: "Import patient DICOM scan — generates patient-specific 3D anatomy for rehearsal", done: vrStep > 0 },
    { title: "Select Procedure", desc: "Choose surgery type: TSA, RSA, Resurfacing, or Revision approach", done: vrStep > 1 },
    { title: "Virtual Preparation", desc: "Position patient, select instruments, configure OR lighting and team", done: vrStep > 2 },
    { title: "Execute Rehearsal", desc: "Full procedure simulation with real-time guidance and performance metrics", done: vrStep > 3 },
    { title: "Review & Score", desc: "Receive AI performance scoring, error analysis, and improvement suggestions", done: vrStep > 4 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)]">
      {/* Header */}
      <header className="border-b border-[hsl(217,32%,14%)] bg-[hsl(222,47%,6%)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[hsl(215,20%,50%)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/40 flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <h1 className="text-sm font-bold text-white">AR / VR Module</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(215,20%,40%)]">WebXR Ready</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-violet-400">XR Engine Active</span>
            </div>
          </div>
        </div>
      </header>
      <WorkflowBanner current="sim" />

      {/* Hero */}
      <div className="border-b border-[hsl(217,32%,12%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
                <Radio className="w-3.5 h-3.5" />
                WebXR · Three.js · Babylon.js Compatible
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Immersive Surgical<br />
                <span className="text-violet-400">AR &amp; VR Experience</span>
              </h2>
              <p className="text-[hsl(215,20%,60%)] mb-6 leading-relaxed">
                Train, rehearse, and plan shoulder arthroplasty procedures in a fully immersive extended reality environment. Patient-specific anatomy, real-time AI guidance, and multi-user collaboration — built for the modern surgical team.
              </p>

              {/* Mode selector */}
              <div className="flex gap-2 mb-6">
                {(["overview", "ar", "vr"] as XRMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setActiveMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                      activeMode === m
                        ? m === "ar" ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                          : m === "vr" ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-[hsl(189,94%,40%,0.2)] border-[hsl(189,94%,40%,0.4)] text-[hsl(189,94%,60%)]"
                        : "bg-transparent border-[hsl(217,32%,20%)] text-[hsl(215,20%,55%)] hover:border-[hsl(217,32%,30%)] hover:text-white"
                    }`}
                  >
                    {m === "overview" ? "Overview" : m === "ar" ? "AR Mode" : "VR Mode"}
                  </button>
                ))}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3">
                {METRICS.map(m => (
                  <div key={m.label} className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-3">
                    <p className="text-xl font-bold text-white">{m.val}</p>
                    <p className="text-xs text-[hsl(215,20%,55%)] mt-0.5">{m.label}</p>
                    <p className="text-xs text-violet-400 mt-0.5">{m.trend}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[hsl(217,32%,18%)] bg-[hsl(222,47%,7%)]">
              <WebGLErrorBoundary>
                <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
                  <Suspense fallback={null}>
                    <Scene mode={activeMode === "overview" ? "default" : activeMode} animate={animating} />
                  </Suspense>
                </Canvas>
              </WebGLErrorBoundary>

              {/* Overlay UI */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                <div className="flex flex-col gap-1.5">
                  {activeMode === "ar" && (
                    <>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300">
                        <Camera className="w-3 h-3" /> AR Camera Active
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-white">
                        <Target className="w-3 h-3 text-cyan-400" /> Implant overlay: ON
                      </div>
                    </>
                  )}
                  {activeMode === "vr" && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300">
                      <Headphones className="w-3 h-3" /> VR Simulation Mode
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setAnimating(a => !a)}
                  className="pointer-events-auto p-1.5 rounded bg-black/40 border border-white/10 text-[hsl(215,20%,50%)] hover:text-white transition-colors"
                >
                  {animating ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bottom labels */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
                <div className="text-xs text-[hsl(215,20%,40%)]">Drag to rotate · Scroll to zoom</div>
                <div className="flex gap-1">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-[hsl(189,94%,40%,0.2)] text-[hsl(189,94%,60%)] border border-[hsl(189,94%,40%,0.3)]">Implant</span>
                  <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">Bone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">
          {activeMode === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* AR section */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Augmented Reality</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Mobile + Tablet</span>
                  </div>
                  <div className="space-y-3">
                    {AR_FEATURES.map(f => (
                      <div key={f.title} className="flex gap-3 p-4 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl hover:border-cyan-500/20 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <f.icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{f.badge}</span>
                          </div>
                          <p className="text-xs text-[hsl(215,20%,55%)] leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VR section */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/40 flex items-center justify-center">
                      <Headphones className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Virtual Reality</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">WebXR · Quest 3</span>
                  </div>
                  <div className="space-y-3">
                    {VR_FEATURES.map(f => (
                      <div key={f.title} className="flex gap-3 p-4 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl hover:border-violet-500/20 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                          <f.icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{f.badge}</span>
                          </div>
                          <p className="text-xs text-[hsl(215,20%,55%)] leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeMode === "ar" && (
            <motion.div key="ar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-4">AR Anatomy Overlay Controls</h3>
                  <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-xl p-6">
                    <p className="text-sm text-[hsl(215,20%,60%)] mb-5">Toggle anatomical layers visible in the AR overlay. These layers are projected in real-time onto the patient's shoulder using the device camera.</p>
                    <div className="space-y-4">
                      {(["bone", "muscle", "tendon", "implant"] as const).map(layer => (
                        <div key={layer} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              layer === "bone" ? "bg-blue-400" :
                              layer === "muscle" ? "bg-red-400" :
                              layer === "tendon" ? "bg-amber-400" :
                              "bg-cyan-400"
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-white capitalize">{layer} Layer</p>
                              <p className="text-xs text-[hsl(215,20%,45%)]">
                                {layer === "bone" ? "Cortical and cancellous bone structure" :
                                 layer === "muscle" ? "Deltoid, rotator cuff musculature" :
                                 layer === "tendon" ? "Subscapularis, supraspinatus insertion" :
                                 "Prosthetic component overlay"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setArLayer(l => ({ ...l, [layer]: !l[layer] }))}
                            className={`relative w-11 h-6 rounded-full transition-colors ${arLayer[layer] ? "bg-cyan-500" : "bg-[hsl(217,32%,18%)]"}`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${arLayer[layer] ? "translate-x-5" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-[hsl(215,20%,60%)]">
                          <strong className="text-white">WebXR Requirements:</strong> Device must support WebXR Device API. Compatible with Apple Vision Pro (visionOS 1.1+), Meta Quest 3, and ARCore/ARKit devices. Internet Explorer not supported.
                        </div>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-3 rounded-xl bg-cyan-500 text-[hsl(222,47%,5%)] font-bold text-sm hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      Launch AR Session
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">AR Requirements</h3>
                  <div className="space-y-3">
                    {[
                      { label: "iOS / iPadOS 16+", check: true },
                      { label: "Android ARCore 1.3+", check: true },
                      { label: "Apple Vision Pro", check: true },
                      { label: "Camera Permission", check: true },
                      { label: "DICOM Scan Loaded", check: true },
                      { label: "Calibration Marker", check: false },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-3 px-4 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.check ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-[hsl(217,32%,14%)] border border-[hsl(217,32%,20%)]"}`}>
                          {r.check && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-sm text-[hsl(215,20%,65%)]">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeMode === "vr" && (
            <motion.div key="vr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-4">Surgical Rehearsal Workflow</h3>
                  <div className="space-y-3">
                    {vrSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                          vrStep === i ? "bg-violet-500/10 border-violet-500/30" :
                          step.done ? "bg-emerald-500/5 border-emerald-500/20" :
                          "bg-[hsl(222,47%,8%)] border-[hsl(217,32%,16%)] hover:border-[hsl(217,32%,24%)]"
                        }`}
                        onClick={() => setVrStep(i)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                          step.done ? "bg-emerald-500 text-white" :
                          vrStep === i ? "bg-violet-500 text-white" :
                          "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,45%)]"
                        }`}>
                          {step.done ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="text-xs text-[hsl(215,20%,50%)] mt-0.5">{step.desc}</p>
                        </div>
                        {vrStep === i && <ChevronRight className="w-4 h-4 text-violet-400 self-center" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setVrStep(s => Math.min(s + 1, vrSteps.length - 1))}
                      className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {vrStep >= vrSteps.length - 1 ? "Launch VR Session" : "Next Step"}
                    </button>
                    <button onClick={() => setVrStep(0)} className="px-4 py-3 rounded-xl border border-[hsl(217,32%,20%)] text-[hsl(215,20%,60%)] hover:text-white transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">VR Performance Metrics</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Procedure Time", val: "28 min", note: "Target: <35 min", good: true },
                      { label: "Positioning Accuracy", val: "94%", note: "+6% from last session", good: true },
                      { label: "Impingement Events", val: "2", note: "Target: 0", good: false },
                      { label: "Component Alignment", val: "97%", note: "Excellent", good: true },
                      { label: "Sessions Completed", val: "12", note: "This month", good: true },
                    ].map(m => (
                      <div key={m.label} className="p-3 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-[hsl(215,20%,55%)]">{m.label}</span>
                          <span className={`text-sm font-bold ${m.good ? "text-emerald-400" : "text-amber-400"}`}>{m.val}</span>
                        </div>
                        <p className="text-xs text-[hsl(215,20%,35%)]">{m.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
