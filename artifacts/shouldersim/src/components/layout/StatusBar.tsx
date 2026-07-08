import { useState, useEffect } from "react";
import { Circle } from "lucide-react";

export default function StatusBar() {
  const [count, setCount] = useState(247);
  const [queued, setQueued] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) - 1);
      setQueued((q) => Math.max(10, q + Math.floor(Math.random() * 3) - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)] px-4 py-1.5 text-xs font-mono"
      style={{ fontFamily: "'Space Grotesk', monospace" }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-[hsl(188,100%,45%)]">
          <Circle className="w-2 h-2 fill-current animate-pulse" />
          <span>{count} Active Simulations</span>
        </div>
        <div className="w-px h-3 bg-[hsl(217,32%,20%)]" />
        <div className="flex items-center gap-1.5 text-[hsl(215,20%,60%)]">
          <span className="text-[hsl(210,100%,60%)]">AI Model</span>
          <span>v4.2.1</span>
        </div>
        <div className="w-px h-3 bg-[hsl(217,32%,20%)]" />
        <div className="flex items-center gap-1.5 text-[hsl(215,20%,60%)]">
          <Circle className="w-2 h-2 fill-[hsl(160,80%,50%)] text-[hsl(160,80%,50%)] animate-pulse" />
          <span>{queued} Queued Tests</span>
        </div>
        <div className="w-px h-3 bg-[hsl(217,32%,20%)]" />
        <div className="flex items-center gap-1.5">
          <Circle className="w-2 h-2 fill-[hsl(160,80%,50%)] text-[hsl(160,80%,50%)]" />
          <span className="text-[hsl(160,80%,50%)]">System Status: Optimal</span>
        </div>
        <div className="w-px h-3 bg-[hsl(217,32%,20%)]" />
        <span className="text-[hsl(215,20%,40%)]">HIPAA Compliant &bull; SOC 2 Type II &bull; FDA 510(k) Cleared</span>
      </div>
    </div>
  );
}
