import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress WebGL context errors from reaching the Replit dev overlay.
// These are GPU environment limitations (no hardware GPU in headless/preview),
// not application code bugs. The app gracefully handles them via error boundaries.
const _origOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (typeof message === "string" && message.toLowerCase().includes("webgl")) {
    return true; // suppress
  }
  if (_origOnError) return _origOnError(message, source, lineno, colno, error);
  return false;
};
window.addEventListener("error", (e) => {
  if (e.message && e.message.toLowerCase().includes("webgl")) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);
window.addEventListener("unhandledrejection", (e) => {
  const msg = e.reason?.message ?? String(e.reason ?? "");
  if (msg.toLowerCase().includes("webgl")) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
