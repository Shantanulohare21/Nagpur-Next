export default function ShoulderVisualization() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square">
      <div className="absolute inset-0 flex items-center justify-center float-anim">
        <div className="relative w-64 h-64">
          <div
            className="absolute inset-0 rounded-full border border-[hsl(188,100%,45%,0.15)]"
            style={{ transform: "scale(1.4)" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-[hsl(188,100%,45%,0.1)]"
            style={{ transform: "scale(1.7)" }}
          />
          <div
            className="absolute inset-0 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] border-2 border-[hsl(188,100%,45%,0.5)] rotate-ring"
          />
          <div
            className="absolute inset-6 rounded-[60%_40%_40%_60%/60%_60%_40%_40%] border border-[hsl(210,100%,60%,0.4)] rotate-ring-reverse"
          />
          <div className="absolute inset-12 rounded-full bg-[hsl(188,100%,45%,0.08)] border border-[hsl(188,100%,45%,0.3)] flex items-center justify-center">
            <div className="relative w-full h-full">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="boneGrad" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="hsl(188,100%,45%)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(222,47%,20%)" stopOpacity="0.8" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <ellipse cx="45" cy="42" rx="18" ry="22" fill="url(#boneGrad)" filter="url(#glow)" />
                <ellipse cx="44" cy="28" rx="12" ry="10" fill="hsl(188,100%,45%)" fillOpacity="0.3" filter="url(#glow)" />
                <path d="M52 55 Q60 65 55 78 Q50 85 44 82 Q38 79 38 70 Q38 62 45 58Z" fill="url(#boneGrad)" filter="url(#glow)" />
                <circle cx="44" cy="40" r="4" fill="hsl(188,100%,45%)" fillOpacity="0.8" filter="url(#glow)" />
                <circle cx="44" cy="40" r="7" fill="none" stroke="hsl(188,100%,45%)" strokeOpacity="0.4" strokeWidth="0.5" />
                <line x1="44" y1="20" x2="44" y2="26" stroke="hsl(188,100%,45%)" strokeOpacity="0.6" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="55" y1="40" x2="62" y2="38" stroke="hsl(188,100%,45%)" strokeOpacity="0.6" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="44" y1="54" x2="44" y2="60" stroke="hsl(188,100%,45%)" strokeOpacity="0.6" strokeWidth="0.5" strokeDasharray="2,2" />
              </svg>
              <div
                className="absolute inset-0 scan-line"
                style={{
                  background: "linear-gradient(transparent, hsl(188,100%,45%,0.15) 50%, transparent)",
                  height: "30%",
                }}
              />
            </div>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-2 py-0.5 bg-[hsl(188,100%,45%,0.15)] border border-[hsl(188,100%,45%,0.4)] rounded text-xs font-mono text-[hsl(188,100%,45%)] whitespace-nowrap">
            AI Segmenting...
          </div>
          <div className="absolute bottom-0 right-0 translate-x-2 translate-y-2 px-2 py-0.5 bg-[hsl(160,80%,50%,0.15)] border border-[hsl(160,80%,50%,0.4)] rounded text-xs font-mono text-[hsl(160,80%,50%)] whitespace-nowrap">
            97.8% Match
          </div>
          {[
            { x: "20%", y: "25%", delay: "0s" },
            { x: "75%", y: "30%", delay: "0.5s" },
            { x: "25%", y: "70%", delay: "1s" },
            { x: "70%", y: "65%", delay: "1.5s" },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[hsl(188,100%,45%)]"
              style={{ left: dot.x, top: dot.y, animationDelay: dot.delay }}
            >
              <div className="absolute inset-0 rounded-full bg-[hsl(188,100%,45%)] animate-ping opacity-75" style={{ animationDelay: dot.delay }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
