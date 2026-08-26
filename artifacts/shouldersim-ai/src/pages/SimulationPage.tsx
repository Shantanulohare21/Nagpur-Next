
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { ShoulderAnatomyViewer } from "@/components/ShoulderAnatomyViewer";
import type { AnalysisResult } from "@/contexts/PatientContext";

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; analysis?: AnalysisResult | null; scanImage?: string; scanModality?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; analysis?: AnalysisResult | null; scanImage?: string; scanModality?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full p-2">
          <ShoulderAnatomyViewer
            analysis={this.props.analysis}
            scanImage={this.props.scanImage}
            scanModality={this.props.scanModality}
            className="w-full h-full"
            height={420}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { usePatient } from "@/contexts/PatientContext";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import {
  Activity, ArrowLeft, Save, Download, Play, Pause,
  Brain, AlertTriangle, TrendingUp, Clock, ChevronRight, Sliders,
  Target, FileText, Zap, Layers, Check, Info, X,
  RefreshCw, User, Mic, MicOff, AlertCircle, Thermometer,
  Shield, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line as ThreeLine, Grid } from "@react-three/drei";
import * as THREE from "three";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

type LayerKey = "bones" | "muscles" | "tendons" | "cartilage" | "implant" | "nerves";
interface PlanningValues { angle: number; anteversion: number; depth: number; offset: number; }
interface MotionValues { flexion: number; extension: number; abduction: number; rotation: number; }

const patients = [
  { id: "P-2024-0142", name: "James R., 67M", diagnosis: "Glenohumeral OA Stage IV", implant: "Total Shoulder Arthroplasty" },
  { id: "P-2024-0138", name: "Susan K., 58F", diagnosis: "Rotator Cuff Tear + OA", implant: "Reverse Total Shoulder" },
  { id: "P-2024-0129", name: "Robert M., 72M", diagnosis: "Humeral Head AVN", implant: "Humeral Resurfacing" },
];

const recoveryData = [
  { week: "0", rom: 20, pain: 80, strength: 10 },
  { week: "2", rom: 35, pain: 65, strength: 18 },
  { week: "4", rom: 55, pain: 48, strength: 30 },
  { week: "6", rom: 70, pain: 35, strength: 45 },
  { week: "8", rom: 82, pain: 25, strength: 58 },
  { week: "12", rom: 95, pain: 15, strength: 70 },
  { week: "16", rom: 105, pain: 10, strength: 80 },
  { week: "24", rom: 120, pain: 8, strength: 88 },
  { week: "52", rom: 140, pain: 3, strength: 95 },
];


// Stability testing component
function StabilityTab({ planning }: { planning: PlanningValues }) {
  // Simple metric based on deviation from optimal angles
  const deviation = Math.abs(planning.angle - 135) + Math.abs(planning.anteversion - 20);
  const stabilityScore = Math.max(0, 100 - deviation * 2);
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-primary">Stability Assessment</h4>
      <p className="text-xs text-muted-foreground">Higher score indicates better implant stability under simulated loads.</p>
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden"><div className="bg-primary h-full" style={{ width: `${stabilityScore}%` }} /></div>
      <div className="text-center text-sm font-bold" style={{ color: stabilityScore > 80 ? '#22c55e' : stabilityScore > 50 ? '#eab308' : '#ef4444' }}>
        {Math.round(stabilityScore)}% Stability
      </div>
    </div>
  );
}

// Wear simulation component
function WearSimulationTab({ planning }: { planning: PlanningValues }) {
  // Simulate wear progression over time based on implant depth and offset
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 0.5));
    }, 200);
    return () => clearInterval(interval);
  }, []);
  const wearFactor = (planning.depth / 40) + (Math.abs(planning.offset) / 20);
  const wearLevel = Math.min(100, progress * wearFactor);
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-primary">Implant Wear Simulation</h4>
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden"><div className="bg-primary h-full" style={{ width: `${wearLevel}%` }} /></div>
      <p className="text-xs text-muted-foreground">Wear increases over simulated time; higher depth/offset accelerates wear.</p>
    </div>
  );
}

// Procedural 3D Scapula component
function ScapulaMesh({ layers, planning, stressLevel, heatmap }: { layers: Set<LayerKey>; planning: PlanningValues; stressLevel: number; heatmap: boolean }) {
  if (!layers.has("bones")) return null;

  // Glenosphere placement based on inclination & anteversion planning parameters
  const inclinationRad = ((planning.angle - 135) * Math.PI) / 180;
  const anteversionRad = ((planning.anteversion - 20) * Math.PI) / 180;

  // High-stress color indicator
  const stressColor = stressLevel < 0.3 ? "#22c55e" : stressLevel < 0.6 ? "#eab308" : "#ef4444";

  return (
    <group position={[-1.2, 0, 0]}>
      {/* Scapula Body (procedural wing shape) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 0.15]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.1} wireframe={false} />
      </mesh>

      {/* Glenoid Neck */}
      <mesh position={[0.8, 0.2, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.3, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>

      {/* Glenoid Socket / Baseplate */}
      <group position={[1.1, 0.3, 0]} rotation={[0, anteversionRad, inclinationRad]}>
        {/* Glenoid Bone base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        {/* Cartilage layer */}
        {layers.has("cartilage") && (
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.47, 0.47, 0.05, 32]} />
            <meshStandardMaterial color="#86efac" transparent opacity={0.6} roughness={0.2} />
          </mesh>
        )}

        {/* Implant Glenosphere */}
        {layers.has("implant") && (
          <group position={[0, 0.15, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Glenoid cup stress heatmap indicator */}
            {heatmap && (
              <mesh position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.41, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial color={stressColor} transparent opacity={0.4} wireframe />
              </mesh>
            )}
          </group>
        )}
      </group>
    </group>
  );
}

// Procedural 3D Humerus & Stem component
function HumerusMesh({
  layers,
  motionVals,
  planning,
  simulationRunning,
}: {
  layers: Set<LayerKey>;
  motionVals: MotionValues;
  planning: PlanningValues;
  simulationRunning: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Apply real-time kinematic calculations inside the animation frame
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Joint rotation angles based on ROM sliders + optional micro-motion if sim running
    let flex = motionVals.flexion;
    let abd = motionVals.abduction;
    let rot = motionVals.rotation;
    let ext = motionVals.extension;

    if (simulationRunning) {
      const time = state.clock.getElapsedTime();
      flex += Math.sin(time * 2.5) * 12;
      abd += Math.cos(time * 2.0) * 10;
    }

    // Convert to radians
    const rotX = (flex * Math.PI) / 180;
    const rotY = (rot * Math.PI) / 180;
    const rotZ = ((abd - ext) * Math.PI) / 180;

    groupRef.current.rotation.set(-rotX, rotY, -rotZ);
  });

  if (!layers.has("bones")) return null;

  // Implant offset configuration
  const humeralOffset = planning.offset / 10;

  return (
    <group ref={groupRef} position={[0.3, -0.3, 0]}>
      {/* Humeral Shaft */}
      <mesh position={[0, -1.2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.28, 2.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Humeral Head / Joint Interface */}
      <group position={[humeralOffset, 0, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>

        {/* Humeral Implant Stem & Cup */}
        {layers.has("implant") && (
          <group position={[0, -0.15, 0]}>
            {/* Implant Stem (inside bone) */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.15, 0.08, 0.9, 16]} />
              <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.9} transparent opacity={0.6} />
            </mesh>
            {/* Humeral Cup interface */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.49, 0.44, 0.15, 32]} />
              <meshStandardMaterial color="#0891b2" roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// Procedural Musculoskeletal, Tendon, and Nerve layers
function SoftTissueLayers({ layers, motionVals }: { layers: Set<LayerKey>; motionVals: MotionValues }) {
  if (!layers.has("muscles") && !layers.has("tendons") && !layers.has("nerves")) return null;

  // Calculate dynamic line positions for attachments
  const abdRad = (motionVals.abduction * Math.PI) / 180;
  const flexRad = (motionVals.flexion * Math.PI) / 180;

  // Humerus attachment point updates dynamically based on rotation
  const humAttachY = -0.3 - Math.sin(abdRad) * 0.5;
  const humAttachX = 0.3 + Math.cos(abdRad) * 0.4;
  const humAttachZ = Math.sin(flexRad) * 0.3;

  return (
    <group>
      {/* Supraspinatus Muscle (delivers muscle force) */}
      {layers.has("muscles") && (
        <ThreeLine
          points={[[-1.2, 0.8, 0], [-0.5, 0.6, 0.1], [humAttachX, humAttachY + 0.3, humAttachZ]]}
          color="#3b82f6"
          lineWidth={4}
        />
      )}

      {/* Infraspinatus Tendon Pathway */}
      {layers.has("tendons") && (
        <ThreeLine
          points={[[-1.0, -0.6, 0.4], [humAttachX, humAttachY, humAttachZ + 0.2]]}
          color="#fbbf24"
          lineWidth={2.5}
        />
      )}

      {/* Brachial Plexus Nerves Route */}
      {layers.has("nerves") && (
        <group>
          <ThreeLine
            points={[[-1.5, 1.2, -0.2], [-0.8, 0.1, -0.4], [0.1, -1.0, -0.3]]}
            color="#faccc9"
            lineWidth={1.5}
          />
          <ThreeLine
            points={[[-1.5, 1.2, -0.2], [-0.6, -0.2, 0.2], [0.3, -1.2, 0.1]]}
            color="#eab308"
            lineWidth={1.2}
          />
        </group>
      )}
    </group>
  );
}

// Custom 2D Multi-Planar Reconstruction (MPR) CT Slice Viewer

function CtSliceViewer({
  sliceIndex,
  planning,
  layers,
}: {
  sliceIndex: number;
  planning: PlanningValues;
  layers: Set<LayerKey>;
}) {
  const axialRef = useRef<HTMLCanvasElement>(null);
  const coronalRef = useRef<HTMLCanvasElement>(null);
  const sagittalRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawSlice = (
      canvas: HTMLCanvasElement | null,
      type: "axial" | "coronal" | "sagittal"
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw medical black-grey backdrop
      ctx.fillStyle = "#0c111d";
      ctx.fillRect(0, 0, w, h);

      // Draw target grid overlay
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Dynamic geometry based on slice index (depth simulator)
      const depthScale = Math.max(0.2, 1.0 - Math.abs(sliceIndex - 64) / 100);
      const angleRad = ((planning.angle - 135) * Math.PI) / 180;
      const anteRad = ((planning.anteversion - 20) * Math.PI) / 180;

      if (type === "axial") {
        // AXIAL VIEW: cross-section of humerus shaft and glenoid
        ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
        ctx.lineWidth = 2.0;

        // Scapula neck cross section
        ctx.beginPath();
        ctx.moveTo(-70, -10);
        ctx.quadraticCurveTo(-30, -5, -15, -15);
        ctx.lineTo(-10, 20);
        ctx.quadraticCurveTo(-45, 10, -70, -10);
        ctx.stroke();

        // Glenoid base outline (impacted by anteversion planning)
        ctx.save();
        ctx.rotate(anteRad);
        ctx.beginPath();
        ctx.ellipse(-8, 5, 10, 25, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Humerus head cross-section
        ctx.beginPath();
        ctx.arc(30 + planning.offset, 5, 26 * depthScale, 0, Math.PI * 2);
        ctx.stroke();

        // Implant stem (if layer active)
        if (layers.has("implant")) {
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(30 + planning.offset, 5, 10 * depthScale, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (type === "coronal") {
        // CORONAL VIEW: Humerus shaft extending down + glenoid profile
        ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
        ctx.lineWidth = 2.0;

        // Scapula wing
        ctx.beginPath();
        ctx.moveTo(-50, -60);
        ctx.lineTo(-40, 40);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-50, -60);
        ctx.stroke();

        // Glenoid inclined socket
        ctx.save();
        ctx.translate(-15, 0);
        ctx.rotate(angleRad);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 30, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (layers.has("implant")) {
          // Glenosphere outline
          ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
          ctx.strokeStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(6, 0, 15, -Math.PI / 2, Math.PI / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // Humerus shaft and head
        ctx.beginPath();
        ctx.arc(28 + planning.offset, 0, 28 * depthScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15 + planning.offset, 15);
        ctx.lineTo(15 + planning.offset, 70);
        ctx.lineTo(41 + planning.offset, 70);
        ctx.lineTo(41 + planning.offset, 15);
        ctx.stroke();
      } else if (type === "sagittal") {
        // SAGITTAL VIEW: Circular glenoid socket projection
        ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
        ctx.lineWidth = 2.0;

        // Glenoid circle profile
        ctx.beginPath();
        ctx.ellipse(-15, 0, 22 * depthScale, 30 * depthScale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Humerus head circle offset
        ctx.beginPath();
        ctx.arc(25 + planning.offset, 0, 28, 0, Math.PI * 2);
        ctx.stroke();

        if (layers.has("implant")) {
          // Inner implant stem projection circle
          ctx.strokeStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(-15, 0, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Top label indicators
      ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`${type.toUpperCase()} VIEW`, 8, 14);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`Slice: ${sliceIndex}/128`, 8, 25);
    };

    drawSlice(axialRef.current, "axial");
    drawSlice(coronalRef.current, "coronal");
    drawSlice(sagittalRef.current, "sagittal");
  }, [sliceIndex, planning, layers]);

  return (
    <div className="grid grid-cols-3 gap-2 h-full w-full">
      {["axial", "coronal", "sagittal"].map((type, i) => (
        <div key={type} className="relative rounded-lg overflow-hidden border border-border/40">
          <canvas
            ref={i === 0 ? axialRef : i === 1 ? coronalRef : sagittalRef}
            width={160}
            height={280}
            className="w-full h-full block"
          />
        </div>
      ))}
    </div>
  );
}

// 3D Collision Detection and Impingement Visualizer
function ImpingementIndicator({ motionVals }: { motionVals: MotionValues }) {
  // If adduction (low abduction) or high flexion exceeds safety margins, render impingement sphere
  const isImpingement = motionVals.abduction < 20 || motionVals.flexion > 135;
  if (!isImpingement) return null;

  // Position of contact point between scapula and humeral neck
  const contactPos: [number, number, number] = motionVals.abduction < 20 ? [-0.2, 0.05, 0.05] : [0.1, 0.25, 0.15];

  return (
    <group position={contactPos}>
      {/* Pulsing red collision sphere */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
      </mesh>
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}

// Dynamic 3D Force Vectors Component
function ForceVectors({ motionVals }: { motionVals: MotionValues }) {
  const abdRad = (motionVals.abduction * Math.PI) / 180;
  const jointForceMag = Math.max(0.3, 0.8 + Math.sin(abdRad) * 0.8);
  const isHighLoad = jointForceMag > 1.25;

  return (
    <group>
      {/* Joint Reaction Force Vector (exiting glenosphere center) */}
      <group position={[-0.1, 0.3, 0]} rotation={[0, 0, -1.1 + abdRad * 0.5]}>
        {/* Shaft of the Arrow */}
        <mesh position={[0, jointForceMag / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, jointForceMag, 8]} />
          <meshBasicMaterial color={isHighLoad ? "#ef4444" : "#06b6d4"} />
        </mesh>
        {/* Tip of the Arrow */}
        <mesh position={[0, jointForceMag + 0.05, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.07, 0.15, 8]} />
          <meshBasicMaterial color={isHighLoad ? "#ef4444" : "#06b6d4"} />
        </mesh>
      </group>

      {/* Deltoid Pull Vector (pulling humerus upwards and inwards) */}
      <group position={[0.5, 0.4, 0]} rotation={[0, 0, 0.3 - abdRad * 0.2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[0, 0.8 + 0.04, 0]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
      </group>
    </group>
  );
}

// Stereoscopic side-by-side 3D view implementation
function StereoscopicCanvas({
  layers,
  motionVals,
  heatmap,
  planning,
  simulationRunning,
}: {
  layers: Set<LayerKey>;
  motionVals: MotionValues;
  heatmap: boolean;
  planning: PlanningValues;
  simulationRunning: boolean;
}) {
  const angleDelta = Math.abs(planning.angle - 135) / 45;
  const anteDelta = Math.abs(planning.anteversion - 20) / 20;
  const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);

  return (
    <div className="grid grid-cols-2 gap-1 h-full w-full bg-black">
      {/* Left Eye Viewport */}
      <div className="relative border-r border-slate-800">
        <WebGLErrorBoundary>
          <Canvas camera={{ position: [-0.08, 0.5, 3.2], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <group position={[0, 0.2, 0]}>
              <ScapulaMesh layers={layers} planning={planning} stressLevel={stressLevel} heatmap={heatmap} />
              <HumerusMesh layers={layers} motionVals={motionVals} planning={planning} simulationRunning={simulationRunning} />
              <SoftTissueLayers layers={layers} motionVals={motionVals} />
              <ImpingementIndicator motionVals={motionVals} />
              <ForceVectors motionVals={motionVals} />
            </group>
            <Grid renderOrder={-1} position={[0, -1.5, 0]} args={[6, 6]} cellSize={0.5} cellColor="#1e293b" sectionColor="#334155" />
          </Canvas>
        </WebGLErrorBoundary>
        <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white/30">LEFT EYE</span>
      </div>

      {/* Right Eye Viewport */}
      <div className="relative">
        <WebGLErrorBoundary>
          <Canvas camera={{ position: [0.08, 0.5, 3.2], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <group position={[0, 0.2, 0]}>
              <ScapulaMesh layers={layers} planning={planning} stressLevel={stressLevel} heatmap={heatmap} />
              <HumerusMesh layers={layers} motionVals={motionVals} planning={planning} simulationRunning={simulationRunning} />
              <SoftTissueLayers layers={layers} motionVals={motionVals} />
            <ImpingementIndicator motionVals={motionVals} />
            <ForceVectors motionVals={motionVals} />
          </group>
          <Grid renderOrder={-1} position={[0, -1.5, 0]} args={[6, 6]} cellSize={0.5} cellColor="#1e293b" sectionColor="#334155" />
          </Canvas>
        </WebGLErrorBoundary>
        <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white/30">RIGHT EYE</span>
      </div>
    </div>
  );
}

// Printable Pre-Operative Surgical Plan Report Modal
function SurgicalReportModal({
  planning,
  motionVals,
  patient,
  onClose,
}: {
  planning: PlanningValues;
  motionVals: MotionValues;
  patient: typeof patients[number];
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-sm">Pre-Operative Planning Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-border/40 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 print:overflow-visible print:p-8 text-foreground print:text-black">
          {/* Header Block */}
          <div className="flex justify-between items-start border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-primary print:text-blue-900">ShoulderSIM AI Plan</h2>
              <p className="text-[10px] text-muted-foreground print:text-slate-500">Generated on: May 29, 2026</p>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 font-medium print:border-green-600 print:text-green-800">
                PLAN VERIFIED
              </span>
            </div>
          </div>

          {/* Demographics Block */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-muted-foreground print:text-slate-500">Patient Name:</span>{" "}
                <span className="font-semibold">{patient.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground print:text-slate-500">Patient ID:</span>{" "}
                <span className="font-mono">{patient.id}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-muted-foreground print:text-slate-500">Diagnosis:</span>{" "}
                <span className="font-semibold">{patient.diagnosis}</span>
              </div>
              <div>
                <span className="text-muted-foreground print:text-slate-500">Procedure:</span>{" "}
                <span className="font-semibold">{patient.implant}</span>
              </div>
            </div>
          </div>

          {/* Planning Metrics Table */}
          <div>
            <h4 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider print:text-blue-900">
              Implant Alignment Details
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: "Inclination", val: `${planning.angle}°`, target: "135°" },
                { label: "Anteversion", val: `${planning.anteversion}°`, target: "20°" },
                { label: "Depth", val: `${planning.depth}mm`, target: "28mm" },
                { label: "Humeral Offset", val: `${planning.offset}mm`, target: "0mm" },
              ].map((m) => (
                <div key={m.label} className="p-3 bg-muted/20 border border-border/30 rounded-xl print:bg-slate-100">
                  <div className="font-mono font-bold text-sm text-foreground print:text-black">{m.val}</div>
                  <div className="text-[10px] text-muted-foreground print:text-slate-500 mt-0.5">{m.label}</div>
                  <div className="text-[8px] text-primary/70 mt-1">Target: {m.target}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Biomechanical prognosis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/40 space-y-2 print:bg-slate-50">
              <h5 className="text-[11px] font-bold text-primary uppercase tracking-wider print:text-blue-900">
                Predicted Range of Motion
              </h5>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Flexion:</span> <span className="font-semibold text-foreground print:text-black">138°</span>
                </div>
                <div className="flex justify-between">
                  <span>Abduction:</span> <span className="font-semibold text-foreground print:text-black">124°</span>
                </div>
                <div className="flex justify-between">
                  <span>External Rotation:</span>{" "}
                  <span className="font-semibold text-foreground print:text-black">68°</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/40 space-y-2 print:bg-slate-50">
              <h5 className="text-[11px] font-bold text-primary uppercase tracking-wider print:text-blue-900">
                Surgical Complexity Assessment
              </h5>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Glenoid Bone Loss:</span> <span className="text-green-400 font-semibold print:text-green-700">None</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotator Cuff Condition:</span> <span className="font-semibold text-foreground print:text-black">Intact</span>
                </div>
                <div className="flex justify-between">
                  <span>Dislocation Probability:</span> <span className="font-mono font-semibold text-foreground print:text-black">2.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Surgeon sign-off block */}
          <div className="pt-6 border-t border-border/40 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground print:text-slate-500">Planning Surgeon:</div>
              <div className="font-bold">Dr. Sarah Chen, MD</div>
              <div className="text-[10px] text-muted-foreground">Department of Orthopedic Surgery</div>
            </div>
            <div className="space-y-1 flex flex-col justify-end items-end">
              <div className="w-40 border-b border-border/60 h-8 flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                *CHEN SIGNATURE VALID*
              </div>
              <div className="text-[10px] text-muted-foreground">Electronic Approval Sign-off</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/15 flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" className="text-xs" onClick={onClose}>
            Close
          </Button>
          <Button className="text-xs bg-primary text-primary-foreground flex items-center gap-2" onClick={handlePrint}>
            <Download className="w-3.5 h-3.5" /> Print / Save PDF Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShoulderSimViewer({
  layers,
  motionVals,
  heatmap,
  planning,
  simulationRunning,
  selectedPatient,
}: {
  layers: Set<LayerKey>;
  motionVals: MotionValues;
  heatmap: boolean;
  planning: PlanningValues;
  simulationRunning: boolean;
  selectedPatient: number;
}) {
  const [viewMode, setViewMode] = useState<"3d" | "ct">("3d");
  const [vrMode, setVrMode] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(64);
  const [showReport, setShowReport] = useState(false);

  const webglAvailable = useMemo(() => {
    try {
      const testCanvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  }, []);

  const angleDelta = Math.abs(planning.angle - 135) / 45;
  const anteDelta = Math.abs(planning.anteversion - 20) / 20;
  const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
  const stressTextColor = stressLevel < 0.3 ? "text-green-400" : stressLevel < 0.6 ? "text-yellow-400" : "text-red-400";

  // Collision state check
  const isImpingement = motionVals.abduction < 20 || motionVals.flexion > 135;

  return (
    <div className="space-y-3">
      {/* Simulation Engine Selector HUD */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/50">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setViewMode("3d");
              setVrMode(false);
            }}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "3d" && !vrMode ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-3 h-3" /> 3D Kinematics
          </button>
          <button
            onClick={() => {
              setViewMode("3d");
              setVrMode(true);
            }}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              vrMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3 h-3" /> Stereoscopic VR
          </button>
          <button
            onClick={() => setViewMode("ct")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "ct" ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-3 h-3" /> 2D CT Slices (MPR)
          </button>
        </div>
        <Button
          size="sm"
          className="h-7 text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          onClick={() => setShowReport(true)}
        >
          <FileText className="w-3 h-3 mr-1" /> Planning Report
        </Button>
      </div>

      {/* Main Viewport */}
      <div
        className="relative h-[360px] rounded-xl overflow-hidden border border-border/40"
        style={{ background: "radial-gradient(ellipse at center, rgba(15,23,42,0.95) 0%, rgba(2,6,23,1.0) 100%)" }}
      >
        {vrMode ? (
          <StereoscopicCanvas
            layers={layers}
            motionVals={motionVals}
            heatmap={heatmap}
            planning={planning}
            simulationRunning={simulationRunning}
          />
        ) : viewMode === "ct" ? (
          <div className="p-3 h-full flex flex-col justify-between">
            <div className="flex-1 min-h-0">
              <CtSliceViewer sliceIndex={sliceIndex} planning={planning} layers={layers} />
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">CT Depth (Slice):</span>
              <input
                type="range"
                min={1}
                max={128}
                value={sliceIndex}
                onChange={(e) => setSliceIndex(Number(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full bg-border/50 cursor-pointer accent-primary"
              />
              <span className="text-[9px] font-mono font-bold text-primary w-8">{sliceIndex}/128</span>
            </div>
          </div>
        ) : webglAvailable ? (
          <WebGLErrorBoundary>
          <Canvas camera={{ position: [0, 0.5, 3.2], fov: 45 }}>
            <color attach="background" args={["#030712"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <spotLight position={[-10, 15, -10]} angle={0.3} penumbra={1} intensity={1} castShadow />

            <group position={[0, 0.2, 0]}>
              <ScapulaMesh layers={layers} planning={planning} stressLevel={stressLevel} heatmap={heatmap} />
              <HumerusMesh layers={layers} motionVals={motionVals} planning={planning} simulationRunning={simulationRunning} />
              <SoftTissueLayers layers={layers} motionVals={motionVals} />
              <ImpingementIndicator motionVals={motionVals} />
              <ForceVectors motionVals={motionVals} />
            </group>

            {/* HUD visual grids */}
            <Grid
              renderOrder={-1}
              position={[0, -1.5, 0]}
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#1e293b"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#334155"
            />
            <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={1.5} maxDistance={6} />
          </Canvas>
          </WebGLErrorBoundary>
        ) : (
          <div className="w-full h-full bg-[#030712] p-2">
            <ShoulderAnatomyViewer
              showImplant={layers.has("implant")}
              height={440}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Impingement detection warning badge overlay */}
        {isImpingement && viewMode === "3d" && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-[9px] text-red-400 font-mono pointer-events-none">
            <AlertTriangle className="w-3.5 h-3.5" /> BONE IMPINGEMENT DETECTED AT NECK JUNCTION
          </div>
        )}

        <div className="absolute top-3 left-3 text-[10px] font-mono text-primary/70 space-y-0.5 pointer-events-none">
          <div>FLEX: {motionVals.flexion}°</div>
          <div>ABD: {motionVals.abduction}°</div>
          <div>ROT: {motionVals.rotation}°</div>
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-right space-y-0.5 pointer-events-none">
          <div className="text-primary/70">ANG: {planning.angle}°</div>
          <div className="text-primary/70">ANT: {planning.anteversion}°</div>
          <div className={`font-bold ${stressTextColor}`}>STRESS: {Math.round(stressLevel * 100)}%</div>
        </div>
        {simulationRunning && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-primary pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> SIM RUNNING
          </div>
        )}
      </div>

      {showReport && (
        <SurgicalReportModal
          planning={planning}
          motionVals={motionVals}
          patient={patients[selectedPatient]}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}


function AIAdvisorTab({ planning }: { planning: PlanningValues }) {
  const [voiceActive, setVoiceActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const mockResponses = [
    "Based on CT morphology and bone quality score of 7.2/10, Total Shoulder Arthroplasty with a 36mm glenoid component is optimal. The patient's glenohumeral OA Stage IV and preserved deltoid function make TSA the evidence-based choice over RSA.",
    `Current inclination angle of ${planning.angle}° ${Math.abs(planning.angle - 135) > 10 ? "deviates significantly from the ideal 135°. Consider adjusting to reduce superior migration risk by ~18%" : "is within acceptable range (130-140°). Minor optimization possible"}.`,
    "Predicted 10-year implant survival: 94.2% based on comparable patient cohorts (n=1,247). Primary risk factors: contralateral ASES score, BMI 28.4, bone mineral density T-score -1.2.",
  ];
  const handleQuery = () => {
    if (!query.trim()) return;
    setIsTyping(true); setResponse(null);
    setTimeout(() => { setIsTyping(false); setResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]); }, 1800);
    setQuery("");
  };
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-foreground mb-1">AI Recommendation — <span className="text-primary">94.7% confidence</span></div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Total Shoulder Arthroplasty (TSA)</strong> with cemented glenoid. Preferred over RSA due to intact rotator cuff and active patient profile.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[{ label: "Success Rate", value: "94.2%", good: true }, { label: "ROM Predicted", value: "138°", good: true }, { label: "Revision Risk", value: "5.8%", good: true }, { label: "Recovery", value: "8–12 mo", good: null }].map(s => (
            <div key={s.label} className="bg-background/50 rounded-lg p-2 text-center">
              <div className={`text-sm font-bold font-mono ${s.good === true ? "text-green-400" : s.good === false ? "text-red-400" : "text-primary"}`}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">Contraindications & Warnings</span>
        </div>
        {["Active infection — screen with CRP/ESR pre-operatively", "Axillary nerve palsy — verify motor function", "Severe glenoid bone loss — consider RSA if >30% erosion"].map((c, i) => (
          <div key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1.5">
            <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>{c}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-background/40 border border-border/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold">Ask AI Advisor</span>
          <button onClick={() => setVoiceActive(v => !v)}
            className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center transition-all ${voiceActive ? "bg-red-500/20 text-red-400" : "bg-border/40 text-muted-foreground"}`}>
            {voiceActive ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
        </div>
        {voiceActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 flex items-center gap-2 text-[10px] text-red-400 font-mono">
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-500" />
            Listening… speak your query
          </motion.div>
        )}
        {response && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mb-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground leading-relaxed">{response}</motion.div>
        )}
        {isTyping && (
          <div className="mb-2 flex items-center gap-1 px-1">
            {[0.1, 0.2, 0.3].map(d => (
              <motion.div key={d} animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 rounded-full bg-primary" />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()}
            placeholder="Ask about risks, alternatives, outcomes…"
            className="flex-1 text-[11px] bg-background/60 border border-border/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50" />
          <button onClick={handleQuery} className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ComplicationsTab({ planning }: { planning: PlanningValues }) {
  const ad = Math.abs(planning.angle - 135) / 45;
  const aa = Math.abs(planning.anteversion - 20) / 20;
  const dd = Math.abs(planning.depth - 28) / 16;
  const risks = [
    { label: "Dislocation Risk", value: Math.min(20 + ad * 35 + aa * 20, 85), icon: AlertTriangle },
    { label: "Implant Loosening", value: Math.min(12 + dd * 40 + ad * 15, 70), icon: AlertCircle },
    { label: "Revision (10yr)", value: Math.min(8 + ad * 25 + aa * 15, 60), icon: RefreshCw },
    { label: "Infection Risk", value: Math.min(3 + dd * 5 + 2, 18), icon: Zap },
    { label: "Scapular Notching", value: Math.min(15 + aa * 30 + ad * 20, 75), icon: Target },
    { label: "Long-term Wear", value: Math.min(10 + dd * 20 + ad * 15, 55), icon: Clock },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Risk assessment updates in real-time based on your Planning parameters.</p>
      {risks.map((r) => {
        const color = r.value < 25 ? "bg-green-500" : r.value < 50 ? "bg-yellow-500" : "bg-red-500";
        const tc = r.value < 25 ? "text-green-400" : r.value < 50 ? "text-yellow-400" : "text-red-400";
        return (
          <div key={r.label} className="bg-background/40 rounded-lg p-3 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><r.icon className={`w-3.5 h-3.5 ${tc}`} /><span className="text-xs font-medium">{r.label}</span></div>
              <span className={`text-xs font-bold font-mono ${tc}`}>{Math.round(r.value)}%</span>
            </div>
            <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${r.value}%` }} transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${color}`} />
            </div>
          </div>
        );
      })}
      <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <span>Ideal placement: 135° inclination, 20° anteversion. Current deviation: <span className="text-primary font-medium">{Math.round(Math.abs(planning.angle - 135))}° inclination</span>, <span className="text-primary font-medium">{Math.round(Math.abs(planning.anteversion - 20))}° anteversion</span>.</span>
      </div>
    </div>
  );
}

function RecoveryTab() {
  return (
    <div className="space-y-4">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recoveryData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="rom" name="ROM (°)" stroke="#06b6d4" fill="rgba(6,182,212,0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="strength" name="Strength (%)" stroke="#3b82f6" fill="rgba(59,130,246,0.08)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {[
          { week: "Week 1–2", label: "Sling immobilization, passive ROM exercises begin", icon: Clock },
          { week: "Week 4–6", label: "Active-assisted ROM, grip strengthening initiated", icon: TrendingUp },
          { week: "Week 8–12", label: "Active ROM, light resistive exercises", icon: Zap },
          { week: "Month 4–6", label: "Progressive strengthening, functional activities", icon: Target },
          { week: "Month 6–12", label: "Return to sport/work, full ROM expected", icon: Check },
        ].map((m) => (
          <div key={m.week} className="flex items-start gap-3 p-2.5 rounded-lg bg-background/40 border border-border/40">
            <m.icon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div><div className="text-xs font-bold text-primary">{m.week}</div><div className="text-[11px] text-muted-foreground">{m.label}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningTab({ planning, setPlanningValues }: { planning: PlanningValues; setPlanningValues: (fn: (p: PlanningValues) => PlanningValues) => void }) {
  const implants = ["Arthrex Univers Arch TSA", "Zimmer Biomet Comprehensive", "DJO Global ReUnion TSA", "Stryker Triathlon Total Shoulder", "Smith & Nephew GLOBAL UNITE"];
  const controls = [
    { key: "angle" as keyof PlanningValues, label: "Glenoid Inclination", min: 110, max: 155, unit: "°", optimal: 135 },
    { key: "anteversion" as keyof PlanningValues, label: "Glenoid Anteversion", min: 5, max: 40, unit: "°", optimal: 20 },
    { key: "depth" as keyof PlanningValues, label: "Cup Penetration Depth", min: 20, max: 38, unit: "mm", optimal: 28 },
    { key: "offset" as keyof PlanningValues, label: "Humeral Offset", min: -10, max: 10, unit: "mm", optimal: 0 },
  ];
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Implant System</label>
        <select className="w-full text-xs bg-background/60 border border-border/40 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary/50">
          {implants.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>
      {controls.map(({ key, label, min, max, unit, optimal }) => {
        const val = planning[key];
        const dev = Math.abs(val - optimal);
        const dc = dev < 3 ? "text-green-400" : dev < 8 ? "text-yellow-400" : "text-red-400";
        return (
          <div key={key} className="bg-background/40 rounded-lg p-3 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Opt: {optimal}{unit}</span>
                <span className={`text-xs font-bold font-mono ${dc}`}>{val}{unit}</span>
              </div>
            </div>
            <input type="range" min={min} max={max} value={val}
              onChange={e => setPlanningValues(p => ({ ...p, [key]: Number(e.target.value) }))}
              className="w-full h-1.5 appearance-none rounded-full bg-border/50 cursor-pointer accent-primary" />
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>{min}{unit}</span><span>{max}{unit}</span></div>
          </div>
        );
      })}
      <button className="w-full py-2.5 rounded-xl bg-primary/20 text-primary text-xs font-medium border border-primary/30 hover:bg-primary/30 transition-all flex items-center justify-center gap-2">
        <FileText className="w-3.5 h-3.5" />Generate Planning Report
      </button>
    </div>
  );
}

function FailureSimTab({ planning }: { planning: PlanningValues }) {
  const [playing, setPlaying] = useState(false);
  const sl = Math.min((Math.abs(planning.angle - 135) / 45 + Math.abs(planning.anteversion - 20) / 20) / 2, 1);
  const failureModes = [
    { name: "Superior Migration", top: "24%", left: "38%", risk: Math.min(sl * 60 + 10, 70), desc: "Rotator cuff tear leading to proximal head migration" },
    { name: "Glenoid Loosening", top: "42%", left: "30%", risk: Math.min(sl * 50 + 8, 55), desc: "Eccentric loading — rocking horse phenomenon" },
    { name: "Stress Concentration", top: "56%", left: "43%", risk: Math.min(sl * 70 + 15, 80), desc: "Implant-bone shear exceeding fatigue threshold" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Failure Mode Replay</span>
        <button onClick={() => setPlaying(p => !p)}
          className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-all ${playing ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-border/30 text-muted-foreground border-border/40 hover:text-foreground"}`}>
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {playing ? "Stop" : "Run Replay"}
        </button>
      </div>
      <div className="h-[140px] rounded-xl border border-border/40 relative overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse, rgba(239,68,68,0.04), rgba(2,6,23,0.95))" }}>
        <div className="relative w-[160px] h-[160px]">
          <div className="absolute w-16 h-16 rounded-full border border-slate-600/50" style={{ top: "28%", left: "26%", background: "rgba(148,163,184,0.06)" }} />
          <div className="absolute w-20 h-20 rounded-full border border-slate-500/30" style={{ top: "22%", left: "22%", background: "rgba(148,163,184,0.04)" }} />
          {failureModes.map((f) => (
            <motion.div key={f.name}
              animate={playing ? { scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] } : { scale: 1, opacity: 0.5 }}
              transition={{ duration: 1.5, repeat: playing ? Infinity : 0 }}
              className="absolute w-6 h-6 rounded-full"
              style={{ top: f.top, left: f.left, background: `radial-gradient(circle, rgba(239,68,68,${0.3 + f.risk / 200}), transparent)`, border: "1px solid rgba(239,68,68,0.5)" }} />
          ))}
        </div>
        {playing && (
          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-red-400 flex items-center gap-1">
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>●</motion.span>
            REPLAYING FAILURE SEQUENCE
          </div>
        )}
      </div>
      {failureModes.map((f) => (
        <div key={f.name} className="p-3 rounded-lg bg-background/40 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{f.name}</span>
            <span className={`text-xs font-mono font-bold ${f.risk < 30 ? "text-green-400" : f.risk < 55 ? "text-yellow-400" : "text-red-400"}`}>{Math.round(f.risk)}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1.5">{f.desc}</p>
          <div className="h-1 bg-border/40 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${f.risk}%` }} transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${f.risk < 30 ? "bg-green-500" : f.risk < 55 ? "bg-yellow-500" : "bg-red-500"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LifestyleTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const activities = [
    { id: "swimming", label: "Swimming", emoji: "🏊", stress: 22, lifespan: 20, mobility: 96, risk: "Very Low", desc: "Low-impact, excellent for shoulder recovery. Highly recommended post-TSA." },
    { id: "daily", label: "Daily Activities", emoji: "🏠", stress: 18, lifespan: 20, mobility: 98, risk: "Very Low", desc: "Normal ADLs pose minimal stress. Unrestricted after full recovery (6–9 months)." },
    { id: "running", label: "Running / Walking", emoji: "🏃", stress: 30, lifespan: 19, mobility: 92, risk: "Low", desc: "Axial impact transmitted to shoulder is low. Generally permitted after 3 months." },
    { id: "cycling", label: "Cycling", emoji: "🚴", stress: 28, lifespan: 19, mobility: 94, risk: "Low", desc: "Stationary cycling is low-risk. Road cycling permitted after 6 months." },
    { id: "tennis", label: "Tennis", emoji: "🎾", stress: 68, lifespan: 14, mobility: 82, risk: "Moderate", desc: "Overhead loading elevates stress. Recreational doubles tennis permitted; overhead serves discouraged." },
    { id: "badminton", label: "Badminton", emoji: "🏸", stress: 62, lifespan: 15, mobility: 84, risk: "Moderate", desc: "Repetitive overhead motion. Recreational play may be permitted after surgeon review." },
    { id: "cricket", label: "Cricket / Baseball", emoji: "🏏", stress: 74, lifespan: 13, mobility: 78, risk: "High", desc: "Bowling/throwing creates significant shoulder stress. Not recommended after TSA." },
    { id: "weightlifting", label: "Weightlifting", emoji: "🏋️", stress: 88, lifespan: 10, mobility: 68, risk: "Very High", desc: "Axial loading is the highest risk activity. Heavy lifting is contraindicated post-TSA." },
  ];
  const act = activities.find(a => a.id === selected);
  const barData = activities.map(a => ({ name: a.label.split(" ")[0], lifespan: a.lifespan, stress: a.stress }));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-primary">Lifestyle-Based Implant Simulation</h4>
      <p className="text-xs text-muted-foreground">Select an activity to see predicted implant lifespan, stress level, and mobility impact.</p>
      <div className="grid grid-cols-4 gap-2">
        {activities.map(a => (
          <button key={a.id} onClick={() => setSelected(a.id === selected ? null : a.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${selected === a.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 bg-card/40 text-muted-foreground hover:border-border/60"}`}>
            <span className="text-xl">{a.emoji}</span>
            <span className="text-[10px] text-center leading-tight">{a.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>
      {act && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{act.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{act.label}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${act.risk === "Very Low" || act.risk === "Low" ? "bg-green-500/15 text-green-400" : act.risk === "Moderate" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{act.risk} Risk</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{act.desc}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Implant Lifespan", val: `${act.lifespan} yrs`, color: act.lifespan >= 18 ? "text-green-400" : act.lifespan >= 14 ? "text-amber-400" : "text-red-400" },
              { label: "Stress Level", val: `${act.stress}%`, color: act.stress <= 30 ? "text-green-400" : act.stress <= 65 ? "text-amber-400" : "text-red-400" },
              { label: "Mobility Score", val: `${act.mobility}%`, color: "text-primary" },
            ].map(m => (
              <div key={m.label} className="text-center bg-background/40 rounded-lg p-2">
                <p className={`text-base font-bold ${m.color}`}>{m.val}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Implant Stress</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${act.stress}%` }} transition={{ duration: 0.6 }}
                className={`h-full rounded-full ${act.stress <= 30 ? "bg-green-500" : act.stress <= 65 ? "bg-amber-500" : "bg-red-500"}`} />
            </div>
          </div>
        </motion.div>
      )}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Predicted Implant Lifespan by Activity</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} domain={[0, 22]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
              <Bar dataKey="lifespan" name="Years" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const { state: patientState } = usePatient();
  const ctxPatient = patientState.info ? {
    id: patientState.info.mrn,
    name: `${patientState.info.name}, ${patientState.info.age}${String(patientState.info.sex).startsWith("M") ? "M" : "F"}`,
    diagnosis: patientState.clinical?.diagnosis || "Shoulder Pathology",
    implant: patientState.analysis?.recommendedImplant || "AI Recommendation Pending",
  } : null;

  const handleSaveCase = async () => {
    try {
      const payload = {
        patientName: patientState.info?.name ?? "Unknown Patient",
        diagnosis: patientState.clinical?.diagnosis ?? "Shoulder Pathology",
        surgeon: patientState.clinical?.surgeon ?? "Dr. Sarah Chen",
        facility: patientState.clinical?.facility ?? "ShoulderSIM Medical Center",
        implant: patientState.analysis?.recommendedImplant ?? "AI Recommendation Pending",
        riskLevel: patientState.analysis?.riskLevel ?? "Moderate",
        aiScore: patientState.analysis?.aiScore ?? 90,
        status: "draft",
      };

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Case save failed with ${response.status}`);
      }

      const result = await response.json();
      if (!result?.success) {
        throw new Error("The case save API returned an unsuccessful payload");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      setSaved(false);
    }
  };

  const allPatients = ctxPatient ? [ctxPatient, ...patients] : patients;

  const [selectedPatient, setSelectedPatient] = useState(0);
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["bones", "muscles", "tendons", "cartilage", "implant"]));
  const [motionVals, setMotionVals] = useState<MotionValues>({ flexion: 30, extension: 10, abduction: 45, rotation: 15 });
  const [heatmap, setHeatmap] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [planning, setPlanningValues] = useState<PlanningValues>({ angle: 135, anteversion: 20, depth: 28, offset: 0 });
  const [saved, setSaved] = useState(false);

  const toggleLayer = (k: LayerKey) => setLayers(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const tabs = [
    { id: "ai", label: "AI Advisor", icon: Brain },
    { id: "comp", label: "Complications", icon: AlertTriangle },
    { id: "recovery", label: "Recovery", icon: TrendingUp },
    { id: "planning", label: "Planning", icon: Sliders },
    { id: "stability", label: "Stability Test", icon: Shield },
    { id: "wear", label: "Wear Sim", icon: Wrench },
    { id: "lifestyle", label: "Lifestyle Sim", icon: Zap },
  ];

  const layerConfig: { key: LayerKey; label: string; color: string }[] = [
    { key: "bones", label: "Bones", color: "bg-slate-400" },
    { key: "muscles", label: "Muscles", color: "bg-blue-500" },
    { key: "tendons", label: "Tendons", color: "bg-yellow-500" },
    { key: "cartilage", label: "Cartilage", color: "bg-green-500" },
    { key: "implant", label: "Implant", color: "bg-cyan-500" },
    { key: "nerves", label: "Nerves", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Link>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm">ShoulderSIM <span className="text-primary">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs">
              <User className="w-3 h-3 text-primary" />
              <select value={selectedPatient} onChange={e => setSelectedPatient(Number(e.target.value))} className="bg-transparent text-xs border-none outline-none cursor-pointer">
                {allPatients.map((p, i) => <option key={p.id} value={i}>{i === 0 && ctxPatient ? `★ ${p.id} — ${p.name}` : `${p.id} — ${p.name}`}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/40 border border-border/40 px-2.5 py-1.5 rounded-lg">
              <span className="text-green-400">●</span>{allPatients[selectedPatient].diagnosis}
            </div>
            <button onClick={() => setSimulationRunning(r => !r)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${simulationRunning ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"}`}>
              {simulationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {simulationRunning ? "Stop Sim" : "Run Sim"}
            </button>
            <button onClick={handleSaveCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-all">
              {saved ? <Check className="w-3 h-3 text-green-400" /> : <Save className="w-3 h-3" />}
              {saved ? "Saved!" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-all">
              <Download className="w-3 h-3" /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>
      <WorkflowBanner current="sim" />

      {ctxPatient && selectedPatient === 0 && (
        <div className="bg-teal-500/10 border-b border-teal-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-teal-400 font-semibold"><span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />Viewing intake patient</div>
            <div className="text-slate-300 font-medium">{patientState.info!.name}</div>
            <div className="text-slate-500">·</div>
            <div className="text-slate-400">{ctxPatient.diagnosis}</div>
            {patientState.analysis && (<><div className="text-slate-500">·</div><div className="text-teal-300 font-medium">Rec: {patientState.analysis.recommendedImplant}</div></>)}
            <Link href="/scan-analysis" className="ml-auto text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2">← Back to AI Analysis</Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
          <div className="space-y-4">
            <ShoulderSimViewer layers={layers} motionVals={motionVals} heatmap={heatmap} planning={planning} simulationRunning={simulationRunning} selectedPatient={selectedPatient} />
            <div className="bg-card/50 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold"><Layers className="w-3.5 h-3.5 text-primary" />Anatomy Layers</div>
                <button onClick={() => setHeatmap(h => !h)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all border ${heatmap ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-border/30 text-muted-foreground border-border/40 hover:text-foreground"}`}>
                  <Thermometer className="w-3 h-3" />Heatmap
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {layerConfig.map(({ key, label, color }) => (
                  <button key={key} onClick={() => toggleLayer(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border ${layers.has(key) ? "bg-card border-border/60 text-foreground" : "bg-transparent border-border/30 text-muted-foreground"}`}>
                    <span className={`w-2 h-2 rounded-full ${layers.has(key) ? color : "bg-border/50"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card/50 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-3"><RefreshCw className="w-3.5 h-3.5 text-primary" />Motion Simulation</div>
              <div className="space-y-3">
                {[
                  { key: "flexion" as keyof MotionValues, label: "Flexion", max: 180 },
                  { key: "abduction" as keyof MotionValues, label: "Abduction", max: 180 },
                  { key: "rotation" as keyof MotionValues, label: "Ext. Rotation", max: 90 },
                  { key: "extension" as keyof MotionValues, label: "Extension", max: 60 },
                ].map(({ key, label, max }) => (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-primary">{motionVals[key]}°</span>
                    </div>
                    <input type="range" min={0} max={max} value={motionVals[key]}
                      onChange={e => setMotionVals(m => ({ ...m, [key]: Number(e.target.value) }))}
                      className="w-full h-1.5 appearance-none rounded-full bg-border/50 cursor-pointer accent-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border/60 rounded-xl backdrop-blur-sm overflow-hidden">
            <div className="flex border-b border-border/60 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === t.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {activeTab === "ai" && <AIAdvisorTab planning={planning} />}
                  {activeTab === "comp" && <ComplicationsTab planning={planning} />}
                  {activeTab === "recovery" && <RecoveryTab />}
                  {activeTab === "planning" && <PlanningTab planning={planning} setPlanningValues={setPlanningValues} />}
                  {activeTab === "stability" && <StabilityTab planning={planning} />}
                  {activeTab === "wear" && <WearSimulationTab planning={planning} />}
                  {activeTab === "lifestyle" && <LifestyleTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
