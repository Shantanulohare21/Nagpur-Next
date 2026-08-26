import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function Simulation() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [showReference, setShowReference] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const response = await fetch("http://localhost:5000/api/reconstruction/generate?modality=ct", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to generate model");
      }
      const data = await response.json();
      // Convert base64 GLB to Blob URL
      const binary = Uint8Array.from(atob(data.glb_base64), c => c.charCodeAt(0));
      const blob = new Blob([binary], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      setModelUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!modelUrl && !showReference) return;
    const container = document.getElementById("three-container");
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    const loader = new GLTFLoader();
    const models: Promise<any>[] = [];
    if (modelUrl) {
      models.push(new Promise(res => loader.load(modelUrl, res, undefined, (err: ErrorEvent | unknown) => { console.error(err); setError("Failed to load model"); })));
    }
    if (showReference) {
      const refUrl = "/static/realistic_shoulder.glb";
      models.push(new Promise(res => loader.load(refUrl, res, undefined, (err: ErrorEvent | unknown) => { console.error(err); setError("Failed to load reference model"); })));
    }
    Promise.all(models).then(gltfs => {
      gltfs.forEach(gltf => scene.add(gltf.scene));
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      scene.scale.setScalar(2 / maxDim);
      camera.position.set(0, 0, 3);
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    });
    return () => { renderer.dispose(); };
  }, [modelUrl, showReference]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shoulder Simulation</h1>
      <input type="file" multiple onChange={handleUpload} className="mb-4" />
      <label className="inline-flex items-center mb-4">
        <input type="checkbox" checked={showReference} onChange={e => setShowReference(e.target.checked)} className="mr-2" />
        Show Realistic Reference Shoulder
      </label>
      {loading && <p>Processing files, please wait...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      <div id="three-container" className="mt-4 w-full h-96 border" />
    </div>
  );
}

export default Simulation;

