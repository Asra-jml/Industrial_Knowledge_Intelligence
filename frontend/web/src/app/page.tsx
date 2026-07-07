import Link from "next/link";
import { ArrowRight, Network, MessageSquare, ShieldCheck, Wrench, Lightbulb } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[rgba(10,14,26,0.8)] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(77,163,255,0.1)] border border-[rgba(77,163,255,0.2)] flex items-center justify-center text-[var(--accent)] font-bold text-lg">
            I
          </div>
          <span className="font-semibold text-lg tracking-tight">IKI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/knowledge-graph" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Demo
          </Link>
          <a href="https://github.com/adivish31/iki-corpus" target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Corpus Repo
          </a>
          <Link
            href="/copilot"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[#0a0e1a] font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            Try Copilot
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(77,163,255,0.3)] bg-[rgba(77,163,255,0.05)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-4">
            ET AI Hackathon 2026 • Problem 8
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--text-muted)] leading-[1.1]">
            Industrial Knowledge Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-muted)] font-light max-w-2xl mx-auto">
            Connect the dots your best engineer can't. A unified asset & operations brain.
          </p>
          <div className="flex justify-center gap-4 pt-8">
            <Link
              href="/knowledge-graph"
              className="group px-6 py-3 rounded-xl bg-white text-[#0a0e1a] font-semibold text-base hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(77,163,255,0.2)]"
            >
              Explore the Graph
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Problem Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          {[
            { value: "35%", label: "Time wasted searching across 12+ systems", color: "text-[var(--danger)]" },
            { value: "20%", label: "Unplanned downtime due to fragmentation", color: "text-[var(--warning)]" },
            { value: "25%", label: "Expert workforce retiring in a decade", color: "text-[var(--accent)]" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center space-y-2">
              <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-[var(--text-muted)] text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Five Unified Modules</h2>
            <p className="text-[var(--text-muted)]">All powered by a single shared knowledge graph.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/knowledge-graph" className="glass-card p-6 hover:border-[var(--accent)] transition-colors group">
              <Network className="w-8 h-8 text-[var(--accent)] mb-4" />
              <div className="font-mono text-xs text-[var(--accent)] mb-1">F1</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">Knowledge Graph</h3>
              <p className="text-sm text-[var(--text-muted)]">Ingests PDFs, P&IDs, CSVs to build a unified graph linking all asset records.</p>
            </Link>
            <Link href="/copilot" className="glass-card p-6 hover:border-[var(--accent)] transition-colors group">
              <MessageSquare className="w-8 h-8 text-[#57c785] mb-4" />
              <div className="font-mono text-xs text-[#57c785] mb-1">F2</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">Expert Copilot</h3>
              <p className="text-sm text-[var(--text-muted)]">Conversational AI answering queries with citations and confidence scores.</p>
            </Link>
            <Link href="/maintenance" className="glass-card p-6 hover:border-[var(--accent)] transition-colors group">
              <Wrench className="w-8 h-8 text-[#ff9950] mb-4" />
              <div className="font-mono text-xs text-[#ff9950] mb-1">F3</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">Maintenance RCA</h3>
              <p className="text-sm text-[var(--text-muted)]">Predictive alerts and root cause analysis fused from sensor data and manuals.</p>
            </Link>
            <Link href="/compliance" className="glass-card p-6 hover:border-[var(--accent)] transition-colors group">
              <ShieldCheck className="w-8 h-8 text-[#b0d94e] mb-4" />
              <div className="font-mono text-xs text-[#b0d94e] mb-1">F4</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">Compliance</h3>
              <p className="text-sm text-[var(--text-muted)]">Maps regulatory requirements against procedures and flags compliance gaps.</p>
            </Link>
            <Link href="/lessons" className="glass-card p-6 hover:border-[var(--accent)] transition-colors group">
              <Lightbulb className="w-8 h-8 text-[#f2a1ff] mb-4" />
              <div className="font-mono text-xs text-[#f2a1ff] mb-1">F5</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">Lessons Learned</h3>
              <p className="text-sm text-[var(--text-muted)]">Surfaces systemic patterns from internal incidents and external databases.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
