import { useState } from "react";
import { Search, Filter, ArrowRight, Star } from "lucide-react";
import { implants } from "../data/mockData";
import { Link } from "wouter";

const types = ["All Types", "Total Shoulder", "Reverse Shoulder", "Partial"];
const manufacturers = ["All Manufacturers", "Tornier", "DePuy Synthes", "Zimmer Biomet", "Arthrex", "Smith+Nephew", "Exactech"];

function ScoreBadge({ score }: { score: number }) {
  let color = "hsl(188,100%,45%)";
  let bg = "hsl(188,100%,45%,0.1)";
  let border = "hsl(188,100%,45%,0.3)";
  if (score < 85) { color = "hsl(40,100%,60%)"; bg = "hsl(40,100%,60%,0.1)"; border = "hsl(40,100%,60%,0.3)"; }
  if (score < 78) { color = "hsl(215,20%,60%)"; bg = "hsl(215,20%,60%,0.1)"; border = "hsl(215,20%,60%,0.3)"; }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, background: bg, border: `1px solid ${border}` }}>
      <Star className="w-2.5 h-2.5 fill-current" />
      {score}% match
    </span>
  );
}

export default function Implants() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [mfgFilter, setMfgFilter] = useState("All Manufacturers");

  const filtered = implants.filter((imp) => {
    const matchSearch = imp.name.toLowerCase().includes(search.toLowerCase()) ||
      imp.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || imp.type === typeFilter;
    const matchMfg = mfgFilter === "All Manufacturers" || imp.manufacturer === mfgFilter;
    return matchSearch && matchType && matchMfg;
  });

  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Implant Library</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">400+ Validated Implants</h1>
          <p className="text-[hsl(215,20%,60%)] max-w-xl">
            Every major shoulder implant from the world's leading manufacturers — each validated, characterized, and ready for AI-powered simulation.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,45%)]" />
            <input
              type="search"
              placeholder="Search implants or manufacturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded text-sm text-white placeholder:text-[hsl(215,20%,40%)] focus:outline-none focus:border-[hsl(188,100%,45%,0.5)] transition-colors"
              data-testid="input-search-implants"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(215,20%,45%)]" />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[hsl(188,100%,45%,0.5)] transition-colors"
            data-testid="select-type-filter"
          >
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select
            value={mfgFilter}
            onChange={(e) => setMfgFilter(e.target.value)}
            className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[hsl(188,100%,45%,0.5)] transition-colors"
            data-testid="select-manufacturer-filter"
          >
            {manufacturers.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="text-xs text-[hsl(215,20%,45%)] mb-5 font-mono">
          Showing {filtered.length} of {implants.length} implants
          {(typeFilter !== "All Types" || mfgFilter !== "All Manufacturers" || search) && (
            <button
              onClick={() => { setSearch(""); setTypeFilter("All Types"); setMfgFilter("All Manufacturers"); }}
              className="ml-3 text-[hsl(188,100%,45%)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((imp) => (
            <div
              key={imp.id}
              className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-5 hover:border-[hsl(188,100%,45%,0.3)] transition-all group"
              data-testid={`implant-card-${imp.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-sm font-bold text-white leading-tight mb-0.5 truncate">{imp.name}</h3>
                  <div className="text-xs text-[hsl(215,20%,55%)]">{imp.manufacturer}</div>
                </div>
                <ScoreBadge score={imp.compatScore} />
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Type</span>
                  <span className="text-[hsl(215,20%,75%)] font-medium">{imp.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Size</span>
                  <span className="text-[hsl(215,20%,75%)]">{imp.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Material</span>
                  <span className="text-[hsl(215,20%,65%)] truncate ml-4 text-right">{imp.material}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Ref</span>
                  <span className="font-mono text-[hsl(188,100%,45%,0.7)]">{imp.catalogRef}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[hsl(215,20%,45%)]">Compatibility</span>
                  <span className="text-[hsl(188,100%,45%)]">{imp.compatScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-[hsl(217,32%,14%)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${imp.compatScore}%`,
                      background: imp.compatScore >= 90 ? "hsl(188,100%,45%)" : imp.compatScore >= 82 ? "hsl(40,100%,60%)" : "hsl(215,20%,50%)",
                    }}
                  />
                </div>
              </div>

              <Link
                href="/simulation"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold bg-[hsl(188,100%,45%,0.1)] border border-[hsl(188,100%,45%,0.2)] text-[hsl(188,100%,45%)] hover:bg-[hsl(188,100%,45%,0.2)] transition-colors group-hover:border-[hsl(188,100%,45%,0.5)]"
                data-testid={`button-test-simulator-${imp.id}`}
              >
                Test in Simulator <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[hsl(215,20%,45%)]">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <div className="text-sm">No implants match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
