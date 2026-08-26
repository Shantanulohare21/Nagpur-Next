import React, { useRef, useEffect, useCallback, useState } from "react";
import type { AnalysisResult } from "@/contexts/PatientContext";
import { RotateCw, Layers, Ruler, Eye, ZoomIn, ZoomOut, Box as BoxIcon } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Sphere, Cylinder, Box, ContactShadows, useGLTF } from "@react-three/drei";

interface ShoulderAnatomyViewerProps {
  analysis?: AnalysisResult | null;
  scanImage?: string;
  scanModality?: string;
  showImplant?: boolean;
  className?: string;
  height?: number;
}

type ViewMode = "ap" | "axial" | "lateral" | "scan" | "3d";

function drawAPView(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: {
    rotX: number;
    boneQuality: number;
    jointSpaceMm: number;
    glenoidVersion: number;
    implant: string;
    pathologies: string[];
    showImplant: boolean;
    glenoVersion: number;
  }
) {
  const { rotX, boneQuality, jointSpaceMm, implant, pathologies, showImplant, glenoVersion } = opts;
  const u = Math.min(w, h) / 6.5;
  const cx = w * 0.48;
  const cy = h * 0.42;

  const bv = Math.round(160 + boneQuality * 60); // bone value: 160–220

  // ── BACKGROUND ─────────────────────────────────────────────
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8);
  bgGrad.addColorStop(0, "#0a1520");
  bgGrad.addColorStop(1, "#040810");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid (medical viewer grid)
  ctx.strokeStyle = "rgba(20,80,120,0.15)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += u * 0.8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += u * 0.8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // ── SOFT TISSUE SILHOUETTE ──────────────────────────────────
  const stGrad = ctx.createRadialGradient(cx, cy, u * 0.5, cx, cy, u * 2.8);
  stGrad.addColorStop(0, "rgba(60,55,50,0.0)");
  stGrad.addColorStop(1, "rgba(30,28,25,0.35)");
  ctx.beginPath();
  ctx.ellipse(cx + u * 0.4, cy - u * 0.1, u * 2.2, u * 2.6, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = stGrad;
  ctx.fill();

  // ── SCAPULA BODY ────────────────────────────────────────────
  const scapGrad = ctx.createLinearGradient(cx - u * 1.8, cy - u * 0.5, cx - u * 0.3, cy + u * 2.5);
  scapGrad.addColorStop(0, `rgba(${bv - 30},${bv - 30},${bv - 28},0.9)`);
  scapGrad.addColorStop(0.5, `rgba(${bv - 55},${bv - 55},${bv - 52},0.85)`);
  scapGrad.addColorStop(1, `rgba(${bv - 70},${bv - 70},${bv - 68},0.8)`);

  ctx.beginPath();
  ctx.moveTo(cx - u * 1.7, cy - u * 0.5);
  ctx.bezierCurveTo(cx - u * 1.9, cy + u * 0.6, cx - u * 1.85, cy + u * 1.5, cx - u * 1.3, cy + u * 2.5);
  ctx.bezierCurveTo(cx - u * 0.8, cy + u * 2.8, cx - u * 0.2, cy + u * 2.4, cx - u * 0.45, cy + u * 1.5);
  ctx.bezierCurveTo(cx - u * 0.5, cy + u * 0.7, cx - u * 0.65, cy + u * 0.1, cx - u * 0.8, cy - u * 0.15);
  ctx.bezierCurveTo(cx - u * 1.1, cy - u * 0.4, cx - u * 1.4, cy - u * 0.6, cx - u * 1.7, cy - u * 0.5);
  ctx.closePath();
  ctx.fillStyle = scapGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv - 10},${bv - 10},${bv - 10},0.7)`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Scapula spine (diagonal bar)
  ctx.beginPath();
  ctx.moveTo(cx - u * 1.7, cy - u * 0.35);
  ctx.bezierCurveTo(cx - u * 1.3, cy - u * 0.55, cx - u * 1.0, cy - u * 0.48, cx - u * 0.7, cy - u * 0.28);
  ctx.lineWidth = u * 0.22;
  ctx.strokeStyle = `rgba(${bv - 15},${bv - 15},${bv - 15},0.85)`;
  ctx.stroke();

  // Coracoid process
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.72, cy - u * 0.28);
  ctx.bezierCurveTo(cx - u * 0.55, cy - u * 0.6, cx - u * 0.35, cy - u * 0.75, cx - u * 0.18, cy - u * 0.7);
  ctx.lineWidth = u * 0.2;
  ctx.strokeStyle = `rgba(${bv - 10},${bv - 10},${bv - 10},0.8)`;
  ctx.stroke();

  // ── GLENOID ─────────────────────────────────────────────────
  const versionRad = (glenoVersion * Math.PI) / 180;
  const gx = cx - u * 0.55 + Math.sin(rotX * 0.3) * u * 0.4;
  const gy = cy + u * 0.15;
  const grxBase = u * 0.28;
  const grx = grxBase * (1 + Math.abs(rotX) * 0.2);
  const gry = u * 0.52;

  const gGrad = ctx.createRadialGradient(gx + u * 0.08, gy - u * 0.06, u * 0.04, gx, gy, grx + u * 0.15);
  gGrad.addColorStop(0, `rgba(${bv + 8},${bv + 8},${bv + 5},0.95)`);
  gGrad.addColorStop(0.6, `rgba(${bv - 10},${bv - 10},${bv - 8},0.9)`);
  gGrad.addColorStop(1, `rgba(${bv - 30},${bv - 30},${bv - 28},0.85)`);

  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(versionRad);
  ctx.beginPath();
  ctx.ellipse(0, 0, grx, gry, 0, 0, Math.PI * 2);
  ctx.fillStyle = gGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 25},${bv + 25},${bv + 25},0.9)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Glenoid labrum
  ctx.beginPath();
  ctx.ellipse(0, 0, grx + u * 0.06, gry + u * 0.08, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(100,180,255,0.3)";
  ctx.lineWidth = u * 0.08;
  ctx.stroke();
  ctx.restore();

  // Cartilage layer (joint-facing side)
  ctx.beginPath();
  ctx.ellipse(gx + u * 0.08, gy, grx * 0.5, gry * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(100,200,255,0.12)";
  ctx.fill();

  // OA grading — osteophytes if severe
  if (pathologies.some(p => p.toLowerCase().includes("arthritis") || p.toLowerCase().includes("oa"))) {
    ctx.beginPath();
    ctx.arc(gx - grx * 0.6, gy + gry * 0.85, u * 0.08, 0, Math.PI * 2);
    ctx.arc(gx + grx * 0.3, gy + gry * 0.9, u * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bv - 5},${bv - 5},${bv - 5},0.9)`;
    ctx.fill();
  }

  // ── HUMERAL SHAFT ────────────────────────────────────────────
  const hx = cx + u * 0.72 + Math.sin(rotX * 0.5) * u * 0.15;
  const hy = cy - u * 0.05;

  const shaftGrad = ctx.createLinearGradient(hx - u * 0.32, hy, hx + u * 0.32, hy);
  shaftGrad.addColorStop(0, `rgba(${bv + 5},${bv + 5},${bv + 5},0.95)`);
  shaftGrad.addColorStop(0.25, `rgba(${bv + 18},${bv + 18},${bv + 18},1.0)`);
  shaftGrad.addColorStop(0.75, `rgba(${bv},${bv},${bv},0.9)`);
  shaftGrad.addColorStop(1, `rgba(${bv - 25},${bv - 25},${bv - 25},0.85)`);

  ctx.beginPath();
  ctx.moveTo(hx - u * 0.3, hy + u * 0.55);
  ctx.bezierCurveTo(hx - u * 0.36, hy + u * 1.0, hx - u * 0.32, hy + u * 1.8, hx - u * 0.28, hy + u * 2.4);
  ctx.lineTo(hx + u * 0.28, hy + u * 2.4);
  ctx.bezierCurveTo(hx + u * 0.32, hy + u * 1.8, hx + u * 0.36, hy + u * 1.0, hx + u * 0.3, hy + u * 0.55);
  ctx.closePath();
  ctx.fillStyle = shaftGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 20},${bv + 20},${bv + 20},0.7)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── HUMERAL HEAD ────────────────────────────────────────────
  const hrx = u * 0.82 * (1 - Math.abs(rotX) * 0.05);
  const hry = u * 0.77;

  const hGrad = ctx.createRadialGradient(hx - hrx * 0.3, hy - hry * 0.28, u * 0.05, hx, hy, hrx * 1.05);
  hGrad.addColorStop(0, `rgba(${bv + 28},${bv + 28},${bv + 25},1.0)`);
  hGrad.addColorStop(0.45, `rgba(${bv + 10},${bv + 10},${bv + 8},0.97)`);
  hGrad.addColorStop(0.85, `rgba(${bv - 15},${bv - 15},${bv - 12},0.92)`);
  hGrad.addColorStop(1, `rgba(${bv - 45},${bv - 45},${bv - 42},0.85)`);

  ctx.beginPath();
  ctx.ellipse(hx, hy, hrx, hry, 0, 0, Math.PI * 2);
  ctx.fillStyle = hGrad;
  ctx.fill();

  // Cortical rim (bright X-ray edge)
  ctx.strokeStyle = `rgba(${bv + 40},${bv + 40},${bv + 40},0.9)`;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Greater tuberosity
  ctx.beginPath();
  ctx.ellipse(hx + hrx * 0.78, hy - hry * 0.25, u * 0.22, u * 0.3, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${bv + 5},${bv + 5},${bv + 5},0.9)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 25},${bv + 25},${bv + 25},0.7)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Humeral head articular cartilage
  ctx.beginPath();
  ctx.ellipse(hx - hrx * 0.52, hy + hry * 0.1, hrx * 0.28, hry * 0.6, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(100,200,255,0.1)";
  ctx.fill();

  // Pathology: avascular necrosis (AVN)
  if (pathologies.some(p => p.toLowerCase().includes("avn") || p.toLowerCase().includes("necrosis"))) {
    ctx.beginPath();
    ctx.ellipse(hx - u * 0.1, hy - u * 0.1, u * 0.3, u * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240,100,50,0.25)";
    ctx.fill();
  }

  // ── CLAVICLE ─────────────────────────────────────────────────
  const clavGrad = ctx.createLinearGradient(cx - u * 1.2, cy - u * 1.08, cx + u * 1.15, cy - u * 0.88);
  clavGrad.addColorStop(0, `rgba(${bv + 5},${bv + 5},${bv + 3},0.85)`);
  clavGrad.addColorStop(0.5, `rgba(${bv + 15},${bv + 15},${bv + 12},0.9)`);
  clavGrad.addColorStop(1, `rgba(${bv},${bv},${bv},0.85)`);

  ctx.beginPath();
  ctx.moveTo(cx - u * 1.2, cy - u * 1.05);
  ctx.bezierCurveTo(cx - u * 0.4, cy - u * 1.22, cx + u * 0.3, cy - u * 1.0, cx + u * 1.12, cy - u * 0.85);
  ctx.lineWidth = u * 0.22;
  ctx.strokeStyle = clavGrad;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${bv + 25},${bv + 25},${bv + 25},0.6)`;
  ctx.stroke();

  // ── ACROMION ─────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(cx + u * 1.12, cy - u * 0.85);
  ctx.bezierCurveTo(cx + u * 1.25, cy - u * 0.72, cx + u * 1.3, cy - u * 0.45, cx + u * 1.15, cy - u * 0.3);
  ctx.bezierCurveTo(cx + u * 1.05, cy - u * 0.2, cx + u * 0.9, cy - u * 0.15, cx + u * 0.82, cy - u * 0.12);
  ctx.lineWidth = u * 0.2;
  ctx.strokeStyle = `rgba(${bv + 8},${bv + 8},${bv + 8},0.88)`;
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${bv + 28},${bv + 28},${bv + 28},0.6)`;
  ctx.stroke();

  // AC joint line
  ctx.beginPath();
  ctx.moveTo(cx + u * 1.12, cy - u * 0.85);
  ctx.lineTo(cx + u * 1.09, cy - u * 0.82);
  ctx.strokeStyle = "rgba(100,180,255,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ── IMPLANT VISUALIZATION ────────────────────────────────────
  if (showImplant && implant !== "None") {
    const isRSA = implant.toLowerCase().includes("reverse");
    const isTSA = implant.toLowerCase().includes("total") || implant.toLowerCase().includes("tsa");

    if (isRSA) {
      // Glenosphere (metallic ball on glenoid side)
      const gsGrad = ctx.createRadialGradient(gx - u * 0.1, gy - u * 0.1, u * 0.02, gx, gy, u * 0.35);
      gsGrad.addColorStop(0, "rgba(180,230,255,0.95)");
      gsGrad.addColorStop(0.5, "rgba(6,182,212,0.85)");
      gsGrad.addColorStop(1, "rgba(2,100,140,0.75)");
      ctx.beginPath();
      ctx.arc(gx + u * 0.08, gy, u * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = gsGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(6,182,212,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Humeral cup (concave socket)
      ctx.beginPath();
      ctx.arc(hx - hrx * 0.55, hy + hry * 0.08, u * 0.36, 0.5, Math.PI - 0.5);
      ctx.strokeStyle = "rgba(6,182,212,0.85)";
      ctx.lineWidth = u * 0.12;
      ctx.stroke();

      // Humeral stem
      ctx.beginPath();
      ctx.moveTo(hx - u * 0.12, hy + u * 0.5);
      ctx.lineTo(hx, hy + u * 1.8);
      ctx.lineWidth = u * 0.14;
      ctx.strokeStyle = "rgba(6,182,212,0.6)";
      ctx.stroke();
    } else if (isTSA) {
      // Glenoid component (polyethylene)
      ctx.beginPath();
      ctx.ellipse(gx + u * 0.08, gy, grx * 0.85, gry * 0.85, versionRad, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,230,255,0.2)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120,200,255,0.8)";
      ctx.lineWidth = u * 0.1;
      ctx.stroke();

      // Humeral head (polished metal)
      ctx.beginPath();
      ctx.ellipse(hx, hy, hrx * 0.82, hry * 0.82, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6,182,212,0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(6,182,212,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Humeral stem
      ctx.beginPath();
      ctx.moveTo(hx - u * 0.12, hy + u * 0.6);
      ctx.lineTo(hx - u * 0.05, hy + u * 1.9);
      ctx.moveTo(hx + u * 0.12, hy + u * 0.6);
      ctx.lineTo(hx + u * 0.05, hy + u * 1.9);
      ctx.lineWidth = u * 0.13;
      ctx.strokeStyle = "rgba(6,182,212,0.55)";
      ctx.stroke();
    } else {
      // Hemi-arthroplasty (humeral component only)
      ctx.beginPath();
      ctx.ellipse(hx, hy, hrx * 0.8, hry * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6,182,212,0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(6,182,212,0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ── JOINT SPACE MEASUREMENT ──────────────────────────────────
  const jointSpaceColor = jointSpaceMm < 1.5 ? "#ef4444" : jointSpaceMm < 2.5 ? "#f59e0b" : "#22c55e";
  const jsMidY = hy + hry * 0.08;

  ctx.setLineDash([u * 0.18, u * 0.14]);
  ctx.beginPath();
  ctx.moveTo(gx + grx * 0.55, jsMidY);
  ctx.lineTo(hx - hrx * 0.88, jsMidY);
  ctx.strokeStyle = jointSpaceColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Measurement end marks
  [gx + grx * 0.55, hx - hrx * 0.88].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, jsMidY - u * 0.08);
    ctx.lineTo(x, jsMidY + u * 0.08);
    ctx.strokeStyle = jointSpaceColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Joint space label
  ctx.fillStyle = jointSpaceColor;
  ctx.font = `bold ${u * 0.22}px 'SF Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillText(`${jointSpaceMm.toFixed(1)} mm`, (gx + grx * 0.55 + hx - hrx * 0.88) / 2, jsMidY - u * 0.14);

  // ── HUMERAL HEAD DIAMETER MEASUREMENT ───────────────────────
  ctx.setLineDash([u * 0.1, u * 0.08]);
  ctx.beginPath();
  ctx.moveTo(hx - hrx * 0.95, hy - u * 0.7);
  ctx.lineTo(hx + hrx * 0.95, hy - u * 0.7);
  ctx.strokeStyle = "rgba(139,92,246,0.7)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(167,139,250,0.9)";
  ctx.font = `${u * 0.2}px 'SF Mono', monospace`;
  ctx.textAlign = "center";
  const diam = (hrx * 2 / u * 8).toFixed(0);
  ctx.fillText(`Ø ${diam} mm`, hx, hy - u * 0.8);

  // ── ANATOMY LABELS ────────────────────────────────────────────
  function label(txt: string, x: number, y: number, size = u * 0.19) {
    ctx.font = `${size}px Inter, sans-serif`;
    ctx.textAlign = "left";
    const m = ctx.measureText(txt);
    ctx.fillStyle = "rgba(5,12,22,0.7)";
    ctx.fillRect(x - 2, y - size, m.width + 4, size + 3);
    ctx.fillStyle = "rgba(200,220,240,0.9)";
    ctx.fillText(txt, x, y);
  }

  label("Humeral Head", hx + hrx * 0.7 + u * 0.1, hy - hry * 0.5);
  label("Glenoid", gx - u * 1.2, gy - gry * 0.7);
  label("Acromion", cx + u * 1.1, cy - u * 0.62);
  label("Clavicle", cx - u * 0.6, cy - u * 1.25);
  label("Coracoid", cx - u * 0.18, cy - u * 0.85);
  label("Scapula", cx - u * 1.65, cy + u * 1.5);
  label("Greater\nTuberosity", hx + u * 0.5, hy - hry * 0.1);

  // ── PATIENT/VIEW ANNOTATION (DICOM-style) ────────────────────
  ctx.font = `bold ${u * 0.18}px 'SF Mono', monospace`;
  ctx.fillStyle = "rgba(255,255,200,0.7)";
  ctx.textAlign = "left";
  ctx.fillText("R", u * 0.2, u * 0.35);
  ctx.textAlign = "right";
  ctx.fillText("L", w - u * 0.2, u * 0.35);
  ctx.textAlign = "left";
  ctx.font = `${u * 0.15}px 'SF Mono', monospace`;
  ctx.fillStyle = "rgba(180,210,240,0.55)";
  ctx.fillText("AP VIEW", u * 0.2, h - u * 0.2);
  ctx.textAlign = "right";
  ctx.fillText("ShoulderSIM AI", w - u * 0.2, h - u * 0.2);
}

function drawAxialView(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { glenoVersion: number; boneQuality: number; implant: string; showImplant: boolean }
) {
  const { glenoVersion, boneQuality, implant, showImplant } = opts;
  const u = Math.min(w, h) / 5;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const bv = Math.round(160 + boneQuality * 60);
  const versionRad = (glenoVersion * Math.PI) / 180;

  ctx.fillStyle = "#040810";
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(20,80,120,0.2)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += u * 0.6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += u * 0.6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Scapula neck cross section
  const scapGrad = ctx.createLinearGradient(cx - u * 1.5, cy, cx, cy);
  scapGrad.addColorStop(0, `rgba(${bv - 60},${bv - 60},${bv - 58},0)`);
  scapGrad.addColorStop(0.5, `rgba(${bv - 40},${bv - 40},${bv - 38},0.85)`);
  scapGrad.addColorStop(1, `rgba(${bv - 20},${bv - 20},${bv - 18},0.9)`);
  ctx.beginPath();
  ctx.moveTo(cx - u * 1.5, cy - u * 0.6);
  ctx.bezierCurveTo(cx - u * 0.8, cy - u * 0.65, cx - u * 0.4, cy - u * 0.5, cx - u * 0.22, cy - u * 0.3);
  ctx.lineTo(cx - u * 0.22, cy + u * 0.3);
  ctx.bezierCurveTo(cx - u * 0.4, cy + u * 0.5, cx - u * 0.8, cy + u * 0.65, cx - u * 1.5, cy + u * 0.6);
  ctx.closePath();
  ctx.fillStyle = scapGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv},${bv},${bv},0.7)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glenoid (axial cross-section)
  ctx.save();
  ctx.translate(cx - u * 0.22, cy);
  ctx.rotate(versionRad);
  const gGrad = ctx.createRadialGradient(u * 0.05, 0, u * 0.02, 0, 0, u * 0.18);
  gGrad.addColorStop(0, `rgba(${bv + 10},${bv + 10},${bv + 8},0.95)`);
  gGrad.addColorStop(1, `rgba(${bv - 20},${bv - 20},${bv - 18},0.85)`);
  ctx.beginPath();
  ctx.ellipse(0, 0, u * 0.16, u * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = gGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 25},${bv + 25},${bv + 25},0.9)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Version angle arc
  ctx.beginPath();
  ctx.arc(0, 0, u * 0.55, -Math.PI / 2, -Math.PI / 2 + versionRad, glenoVersion < 0);
  ctx.strokeStyle = "rgba(251,191,36,0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (showImplant && implant !== "None") {
    const isRSA = implant.toLowerCase().includes("reverse");
    const baseRad = isRSA ? u * 0.35 : u * 0.16;
    ctx.beginPath();
    ctx.ellipse(isRSA ? u * 0.1 : 0, 0, baseRad, isRSA ? u * 0.35 : u * 0.42, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(6,182,212,0.85)";
    ctx.lineWidth = u * 0.1;
    ctx.stroke();
  }

  ctx.restore();

  // Humeral head (axial cross-section)
  const hhx = cx + u * 0.55;
  const hGrad = ctx.createRadialGradient(hhx - u * 0.18, cy - u * 0.15, u * 0.04, hhx, cy, u * 0.52);
  hGrad.addColorStop(0, `rgba(${bv + 25},${bv + 25},${bv + 22},1.0)`);
  hGrad.addColorStop(0.6, `rgba(${bv},${bv},${bv},0.95)`);
  hGrad.addColorStop(1, `rgba(${bv - 35},${bv - 35},${bv - 32},0.85)`);
  ctx.beginPath();
  ctx.ellipse(hhx, cy, u * 0.52, u * 0.48, 0, 0, Math.PI * 2);
  ctx.fillStyle = hGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 35},${bv + 35},${bv + 35},0.9)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (showImplant && implant !== "None") {
    ctx.beginPath();
    ctx.ellipse(hhx, cy, u * 0.42, u * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(6,182,212,0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(6,182,212,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Version label
  ctx.font = `bold ${u * 0.22}px 'SF Mono', monospace`;
  ctx.fillStyle = "rgba(251,191,36,0.9)";
  ctx.textAlign = "left";
  ctx.fillText(`Version: ${glenoVersion.toFixed(1)}°`, u * 0.12, h - u * 0.25);

  // Labels
  ctx.font = `${u * 0.18}px Inter, sans-serif`;
  ctx.fillStyle = "rgba(180,210,240,0.8)";
  ctx.textAlign = "center";
  ctx.fillText("Glenoid", cx - u * 0.22, cy - u * 0.52);
  ctx.fillText("Humerus", hhx, cy - u * 0.62);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(180,210,240,0.5)";
  ctx.font = `${u * 0.16}px 'SF Mono', monospace`;
  ctx.fillText("AXIAL VIEW", u * 0.15, h - u * 0.12);
}

function drawLateralView(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { boneQuality: number; implant: string; showImplant: boolean }
) {
  const { boneQuality, implant, showImplant } = opts;
  const u = Math.min(w, h) / 6;
  const cx = w * 0.5;
  const cy = h * 0.42;
  const bv = Math.round(160 + boneQuality * 60);

  ctx.fillStyle = "#040810";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(20,80,120,0.18)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += u * 0.7) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += u * 0.7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Scapula (Y-view shape characteristic of lateral scapula)
  ctx.beginPath();
  ctx.moveTo(cx, cy - u * 0.5);
  ctx.bezierCurveTo(cx + u * 0.3, cy + u * 0.2, cx + u * 1.0, cy + u * 0.8, cx + u * 1.4, cy + u * 1.8);
  ctx.moveTo(cx, cy - u * 0.5);
  ctx.bezierCurveTo(cx - u * 0.3, cy + u * 0.2, cx - u * 1.0, cy + u * 0.8, cx - u * 1.4, cy + u * 1.8);
  ctx.moveTo(cx, cy - u * 0.5);
  ctx.lineTo(cx, cy - u * 1.8);
  ctx.strokeStyle = `rgba(${bv - 10},${bv - 10},${bv - 10},0.85)`;
  ctx.lineWidth = u * 0.22;
  ctx.lineCap = "round";
  ctx.stroke();

  // Glenoid (en face — circle)
  const gGrad = ctx.createRadialGradient(cx - u * 0.08, cy - u * 0.1, u * 0.04, cx, cy, u * 0.55);
  gGrad.addColorStop(0, `rgba(${bv + 15},${bv + 15},${bv + 12},0.95)`);
  gGrad.addColorStop(0.6, `rgba(${bv - 5},${bv - 5},${bv - 5},0.88)`);
  gGrad.addColorStop(1, `rgba(${bv - 30},${bv - 30},${bv - 28},0.75)`);
  ctx.beginPath();
  ctx.ellipse(cx, cy, u * 0.55, u * 0.72, 0, 0, Math.PI * 2);
  ctx.fillStyle = gGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${bv + 30},${bv + 30},${bv + 30},0.85)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subacromial space
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.6, cy - u * 1.05);
  ctx.bezierCurveTo(cx - u * 0.1, cy - u * 1.15, cx + u * 0.4, cy - u * 1.1, cx + u * 0.7, cy - u * 0.98);
  ctx.lineWidth = u * 0.18;
  ctx.strokeStyle = `rgba(${bv - 5},${bv - 5},${bv - 5},0.8)`;
  ctx.stroke();

  if (showImplant && implant !== "None") {
    ctx.beginPath();
    ctx.ellipse(cx, cy, u * 0.44, u * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(6,182,212,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(6,182,212,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.font = `${u * 0.2}px Inter, sans-serif`;
  ctx.fillStyle = "rgba(180,210,240,0.8)";
  ctx.textAlign = "center";
  ctx.fillText("Glenoid (en face)", cx, cy + u * 0.9);
  ctx.fillStyle = "rgba(180,210,240,0.5)";
  ctx.font = `${u * 0.16}px 'SF Mono', monospace`;
  ctx.textAlign = "left";
  ctx.fillText("LATERAL VIEW", u * 0.15, h - u * 0.15);
}

function RealGLBMesh({ url }: { url: string }) {
  try {
    const { scene } = useGLTF(url);
    return (
      <primitive
        object={scene}
        scale={[0.08, 0.08, 0.08]}
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 4, 0]}
      />
    );
  } catch {
    return null;
  }
}

function MockShoulderMesh({ glenoVersion, boneQuality, implant, showImplant }: { glenoVersion: number, boneQuality: number, implant: string, showImplant: boolean }) {
  const boneColor = boneQuality > 0.8 ? "#e2e8f0" : "#cbd5e1"; // Healthy vs osteopenic
  const isRSA = implant.toLowerCase().includes("reverse");
  const isTSA = implant.toLowerCase().includes("total") || implant.toLowerCase().includes("tsa");
  const isHemi = implant.toLowerCase().includes("hemi");
  const hasImplant = showImplant && (isRSA || isTSA || isHemi);

  return (
    <group position={[0, -0.5, 0]}>
      {/* Humeral Shaft */}
      <Cylinder args={[0.5, 0.4, 4, 32]} position={[1.5, -2, 0]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </Cylinder>
      
      {/* Humeral Head */}
      {(!hasImplant || (!isTSA && !isRSA && !isHemi)) && (
        <Sphere args={[0.8, 32, 32]} position={[1.1, 0.2, 0]}>
          <meshStandardMaterial color={boneColor} roughness={0.5} />
        </Sphere>
      )}

      {/* Scapula/Glenoid Neck */}
      <Box args={[1.5, 1.2, 1.8]} position={[-1, 0, 0]} rotation={[0, glenoVersion * Math.PI / 180, 0]}>
        <meshStandardMaterial color={boneColor} roughness={0.8} />
      </Box>
      {/* Scapula Body */}
      <Box args={[2.5, 2.5, 0.4]} position={[-2.5, -0.5, -0.5]} rotation={[0, glenoVersion * Math.PI / 180, 0]}>
        <meshStandardMaterial color={boneColor} roughness={0.8} />
      </Box>

      {/* Glenoid Socket */}
      {(!hasImplant || (!isTSA && !isRSA)) && (
        <Cylinder args={[0.7, 0.7, 0.2, 32]} position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </Cylinder>
      )}

      {/* IMPLANTS */}
      {hasImplant && isTSA && (
        <group>
          {/* Glenoid Component (Poly) */}
          <Cylinder args={[0.7, 0.7, 0.2, 32]} position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.2} opacity={0.8} transparent />
          </Cylinder>
          {/* Humeral Head Component (Metal) */}
          <Sphere args={[0.78, 32, 32]} position={[0.7, 0.2, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#a5f3fc" metalness={0.9} roughness={0.1} />
          </Sphere>
          {/* Humeral Stem */}
          <Cylinder args={[0.2, 0.1, 2, 32]} position={[1.3, -1, 0]} rotation={[0, 0, 0.2]}>
            <meshStandardMaterial color="#a5f3fc" metalness={0.9} roughness={0.2} />
          </Cylinder>
        </group>
      )}

      {hasImplant && isRSA && (
        <group>
          {/* Glenosphere (Metal ball on glenoid) */}
          <Sphere args={[0.6, 32, 32]} position={[-0.1, 0, 0]}>
            <meshStandardMaterial color="#a5f3fc" metalness={0.9} roughness={0.1} />
          </Sphere>
          {/* Humeral Cup (Poly socket on humerus) */}
          <Cylinder args={[0.65, 0.65, 0.3, 32]} position={[0.6, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </Cylinder>
          {/* Humeral Stem */}
          <Cylinder args={[0.2, 0.1, 2, 32]} position={[1.2, -1.2, 0]} rotation={[0, 0, 0.2]}>
            <meshStandardMaterial color="#a5f3fc" metalness={0.9} roughness={0.2} />
          </Cylinder>
        </group>
      )}
    </group>
  );
}

export function ShoulderAnatomyViewer({
  analysis,
  scanImage,
  scanModality,
  showImplant = true,
  className = "",
  height = 480,
}: ShoulderAnatomyViewerProps) {
  const [view, setView] = useState<ViewMode>(scanImage ? "scan" : "ap");
  const [rotX, setRotX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);

  const boneQuality = (analysis?.boneQuality ?? 70) / 100;
  const glenoVersion = analysis?.glenoVersion ?? -8;
  const jointSpaceMm = Math.max(0.5, 4.5 - (1 - boneQuality) * 4);
  const implant = analysis?.recommendedImplant ?? "None";
  const pathologies = analysis?.pathologies?.map(p => p.name) ?? [];

  const drawMain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    const opts = { rotX, boneQuality, glenoVersion, jointSpaceMm, implant, pathologies, showImplant, boneQualityNum: boneQuality };

    if (view === "ap") {
      drawAPView(ctx, w, h, { ...opts, glenoidVersion: glenoVersion });
    } else if (view === "axial") {
      drawAxialView(ctx, w, h, { glenoVersion, boneQuality, implant, showImplant });
    } else if (view === "lateral") {
      drawLateralView(ctx, w, h, { boneQuality, implant, showImplant });
    }
  }, [view, rotX, boneQuality, glenoVersion, jointSpaceMm, implant, showImplant, pathologies]);

  const drawScan = useCallback(() => {
    const canvas = scanCanvasRef.current;
    if (!canvas || !scanImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#040810";
      ctx.fillRect(0, 0, w, h);

      // Fit image maintaining aspect ratio
      const imgAR = img.width / img.height;
      const canvasAR = w / h;
      let dw: number, dh: number, dx: number, dy: number;
      if (imgAR > canvasAR) {
        dw = w; dh = w / imgAR; dx = 0; dy = (h - dh) / 2;
      } else {
        dh = h; dw = h * imgAR; dx = (w - dw) / 2; dy = 0;
      }

      ctx.globalAlpha = 0.92;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalAlpha = 1;

      // DICOM-style overlay info
      ctx.font = "bold 11px 'SF Mono', monospace";
      ctx.fillStyle = "rgba(255,255,200,0.75)";
      ctx.textAlign = "left";
      ctx.fillText(scanModality ?? "XRAY", 10, 20);
      ctx.fillStyle = "rgba(180,210,240,0.6)";
      ctx.font = "10px 'SF Mono', monospace";
      ctx.fillText("ShoulderSIM AI", 10, h - 10);
      ctx.textAlign = "right";
      ctx.fillText("Uploaded Scan", w - 10, h - 10);

      // Measurement crosshair overlay
      const mw = dw * 0.38, mh = dh * 0.38;
      const mx = dx + dw * 0.52, my = dy + dh * 0.42;
      ctx.strokeStyle = "rgba(6,182,212,0.5)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx - mw, my); ctx.lineTo(mx + mw, my); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my - mh); ctx.lineTo(mx, my + mh); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(6,182,212,0.6)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mx - mw * 0.5, my - mh * 0.6, mw, mh * 1.2);
      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "rgba(6,182,212,0.85)";
      ctx.textAlign = "left";
      ctx.fillText("Analysis ROI", mx - mw * 0.5, my - mh * 0.6 - 4);
    };
    img.src = scanImage;
  }, [scanImage, scanModality]);

  useEffect(() => {
    if (view !== "scan") drawMain();
  }, [view, drawMain]);

  useEffect(() => {
    if (view === "scan") drawScan();
  }, [view, drawScan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (view !== "ap") return;
    setIsDragging(true);
    setDragStartX(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || view !== "ap") return;
    const delta = (e.clientX - dragStartX) / 200;
    setRotX(r => Math.max(-1, Math.min(1, r + delta)));
    setDragStartX(e.clientX);
  };
  const handleMouseUp = () => setIsDragging(false);

  const tabs: { id: ViewMode; label: string }[] = [
    { id: "ap", label: "AP X-Ray" },
    { id: "axial", label: "Axial CT" },
    { id: "lateral", label: "Lateral" },
    ...(scanImage ? [{ id: "scan" as ViewMode, label: "Uploaded Scan" }] : []),
    ...(analysis?.meshUrl ? [{ id: "3d" as ViewMode, label: "3D AI Mesh" }] : []),
  ];

  // Auto-switch to 3D if the analysis comes in and we were looking at the scan
  useEffect(() => {
    if (analysis?.meshUrl && view === "scan") {
      setView("3d");
    }
  }, [analysis?.meshUrl]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* View mode tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === t.id
                ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                : "bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.id === "3d" && <BoxIcon className="w-3.5 h-3.5 inline mr-1 mb-0.5" />}
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        {view !== "3d" && (
          <>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-300">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-300">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setRotX(0)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-teal-400">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-xl overflow-hidden flex-1 bg-[#040810] border border-[hsl(217,32%,14%)] cursor-crosshair"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {view === "3d" && (
          <div className="absolute inset-0 bg-[#0a1520]">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} />
              <Environment preset="city" />
              {analysis?.meshUrl ? (
                <React.Suspense fallback={
                  <MockShoulderMesh
                    glenoVersion={glenoVersion}
                    boneQuality={boneQuality}
                    implant={implant}
                    showImplant={showImplant}
                  />
                }>
                  <RealGLBMesh url={analysis.meshUrl} />
                </React.Suspense>
              ) : (
                <MockShoulderMesh
                  glenoVersion={glenoVersion}
                  boneQuality={boneQuality}
                  implant={implant}
                  showImplant={showImplant}
                />
              )}
              <OrbitControls makeDefault minDistance={2} maxDistance={20} />
              <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -3.5, 0]} />
            </Canvas>
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-500">Interactive 3D Render • Generated from AI segmentation</span>
            </div>
          </div>
        )}
        
        {view !== "scan" && view !== "3d" && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            width={800}
            height={600}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        )}
        {view === "scan" && (
          <canvas
            ref={scanCanvasRef}
            className="absolute inset-0 w-full h-full"
            width={800}
            height={600}
          />
        )}

        {/* Interaction hint */}
        {view === "ap" && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-500">Drag to rotate</span>
          </div>
        )}

        {/* Measurements badge */}
        <div className="absolute top-2 right-2 space-y-1">
          {view === "ap" && (
            <>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-green-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-mono text-green-400">JS {jointSpaceMm.toFixed(1)} mm</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-violet-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-[10px] font-mono text-violet-400">Glenoid V. {glenoVersion.toFixed(0)}°</span>
              </div>
            </>
          )}
          {view === "axial" && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-amber-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-mono text-amber-400">Version {glenoVersion.toFixed(1)}°</span>
            </div>
          )}
        </div>

        {/* Bone quality badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/50 border border-slate-700/50">
          <span className="text-[10px] font-mono text-slate-400">
            BQ {analysis?.boneQuality ?? 70}/100
          </span>
        </div>
      </div>

      {/* Key measurements row */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {[
          { label: "Joint Space", value: `${jointSpaceMm.toFixed(1)} mm`, color: jointSpaceMm < 2 ? "text-red-400" : "text-green-400" },
          { label: "Glenoid Ver.", value: `${glenoVersion.toFixed(1)}°`, color: Math.abs(glenoVersion) > 15 ? "text-amber-400" : "text-teal-400" },
          { label: "Bone Quality", value: `${Math.round(boneQuality * 100)}%`, color: boneQuality > 0.6 ? "text-green-400" : boneQuality > 0.4 ? "text-amber-400" : "text-red-400" },
          { label: "Humeral Ø", value: `${Math.round(48 + boneQuality * 8)} mm`, color: "text-violet-400" },
        ].map(m => (
          <div key={m.label} className="bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,14%)] rounded-lg p-2 text-center">
            <p className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
