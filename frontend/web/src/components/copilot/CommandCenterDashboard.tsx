"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, FileText, Database, Network, BookOpen, Clock, 
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Wrench, Activity 
} from "lucide-react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

interface Props {
  onAsk: (q: string) => void;
  busy: boolean;
}

const PLACEHOLDERS = [
  "Ask about Pump P-101...",
  "Find overdue inspections...",
  "Explain OISD compliance...",
  "Compare Pump P-101 with P-205...",
  "Show maintenance history...",
  "Find similar failures..."
];

const SEARCH_SOURCES = [
  "P&IDs", "SOPs", "Inspection Reports", "Work Orders", "Emails", "Regulations", "OEM Manuals", "Incident Reports"
];

const QUICK_ACTIONS = [
  { id: 1, title: "Pump P-101", icon: Wrench, metric: "Health 96%", label: "Ask Status →", query: "What's the status of P-101?" },
  { id: 2, title: "Recent Incident", icon: AlertTriangle, metric: "P-101 Failure", label: "View RCA →", query: "Why did P-101 fail?" },
  { id: 3, title: "Compliance", icon: ShieldAlert, metric: "Inspections", label: "Open →", query: "Which inspections are overdue?" },
];

const ACTIVITY_FEED = [
  { time: "Just now", text: "Inspection Report Uploaded", icon: FileText, color: "text-blue-400" },
  { time: "2m ago", text: "Knowledge Graph Updated", icon: Network, color: "text-blue-400" },
  { time: "15m ago", text: "Embedding Index Refreshed", icon: Database, color: "text-blue-400" },
  { time: "1h ago", text: "Compliance Rule Added", icon: ShieldAlert, color: "text-blue-400" },
  { time: "2h ago", text: "Maintenance Record Synced", icon: Wrench, color: "text-blue-400" },
];

const RECENT_CONVOS = [
  { time: "Yesterday", text: "Why did Pump P-101 fail?" },
  { time: "Today", text: "Missing inspections" },
  { time: "Today", text: "Bearing vibration limits" },
  { time: "Today", text: "Compare Pump P-101 and P-205" }
];

export default function CommandCenterDashboard({ onAsk, busy }: Props) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");

  // Cycle placeholder text
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onAsk(inputValue);
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-[#071321]">
      {/* Background ambient elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating AI Status Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="hidden lg:flex absolute top-6 right-6 flex-col gap-2 p-4 rounded-2xl bg-[#0A111A]/80 border border-white/5 backdrop-blur-md shadow-xl z-20"
      >
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/60 w-28">Knowledge Graph</span>
          <span className="text-emerald-400">Healthy</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/60 w-28">Embedding Index</span>
          <span className="text-emerald-400">Synced</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-white/60 w-28">Doc Pipeline</span>
          <span className="text-blue-400">Live</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-white/60 w-28">Copilot</span>
          <span className="text-blue-400">Ready</span>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10 flex flex-col items-center">
        
        {/* Personalization & Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center w-full max-w-3xl"
        >
          <div className="text-blue-400/80 font-mono text-[13px] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Good Afternoon, Aditya
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mb-8">
            Ask the Plant Anything
          </h1>

          {/* Metric Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-blue-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(60,120,255,0.05)]">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium text-sm">8,050</span>
              <span className="text-white/50 text-xs uppercase tracking-wider">Documents</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-blue-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(60,120,255,0.05)]">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium text-sm">664</span>
              <span className="text-white/50 text-xs uppercase tracking-wider">Assets</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-blue-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(60,120,255,0.05)]">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium text-sm">589</span>
              <span className="text-white/50 text-xs uppercase tracking-wider">Relations</span>
            </div>
          </div>
        </motion.div>

        {/* Search Experience */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-3xl mb-8"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex items-center w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-colors hover:border-white/20">
              <Search className="w-6 h-6 text-white/50 ml-4 mr-2" />
              <div className="relative flex-1 h-14 overflow-hidden flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={busy}
                  className="absolute inset-0 w-full h-full bg-transparent outline-none text-lg text-white placeholder-transparent z-10 px-2"
                  autoFocus
                />
                {!inputValue && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={placeholderIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center px-2 text-lg text-white/30 pointer-events-none"
                    >
                      {PLACEHOLDERS[placeholderIdx]}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
              <div className="ml-2 shrink-0">
                <GlassButton 
                  variant="primary" 
                  width={140} 
                  height={48} 
                  onClick={handleSubmit}
                  className={busy || !inputValue.trim() ? 'opacity-50 pointer-events-none' : ''}
                >
                  <div className="flex items-center justify-center w-full h-full text-white font-medium">
                    Ask Copilot
                  </div>
                </GlassButton>
              </div>
            </div>
          </form>

          {/* Search Sources */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-[11px] text-white/40 uppercase tracking-widest mr-2 py-1">Searching Across</span>
            {SEARCH_SOURCES.map((src, i) => (
              <motion.div 
                key={src}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (i * 0.05) }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200"
              >
                <CheckCircle2 className="w-3 h-3 text-blue-400" /> {src}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center">
             <span className="text-[11px] text-white/40">All responses include citations mapped back to the source documents.</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
        >
          {QUICK_ACTIONS.map((action) => (
            <div 
              key={action.id}
              onClick={() => !busy && onAsk(action.query)}
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            >
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{action.title}</div>
                    <div className="text-white/50 text-xs mt-0.5">{action.metric}</div>
                  </div>
                </div>
              </div>
              <div className="text-blue-400 font-medium text-sm flex items-center relative z-10 group-hover:text-blue-300">
                {action.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Intelligence Dashboard */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-24">
          
          {/* Left: Activity & History */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="space-y-10">
            {/* Recent Plant Activity */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Live Data Pipeline
              </h3>
              <div className="relative border-l border-white/10 ml-3 space-y-6">
                {ACTIVITY_FEED.map((item, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#071321] border border-blue-400" />
                    {i === 0 && <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />}
                    <div className="text-xs text-blue-300 mb-1">{item.time}</div>
                    <div className="text-sm text-white/70 flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-white/40" /> {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent AI Conversations */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Recent Investigations
              </h3>
              <div className="space-y-2">
                {RECENT_CONVOS.map((conv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer transition-colors" onClick={() => !busy && onAsk(conv.text)}>
                    <div className="text-sm text-white/70">{conv.text}</div>
                    <div className="text-xs text-white/30">{conv.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Graph & Assets */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="space-y-10">
            {/* Graph Preview */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" /> Enterprise Graph
              </h3>
              <div className="w-full h-48 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center group cursor-pointer hover:border-blue-500/30 transition-colors">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 300 200">
                  <line x1="150" y1="100" x2="80" y2="60" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4" />
                  <line x1="150" y1="100" x2="220" y2="60" stroke="#3B82F6" strokeWidth="1" />
                  <line x1="150" y1="100" x2="80" y2="140" stroke="#3B82F6" strokeWidth="1" />
                  <line x1="150" y1="100" x2="220" y2="140" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4" />
                  <circle cx="150" cy="100" r="16" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="2" />
                  <circle cx="80" cy="60" r="10" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                  <circle cx="220" cy="60" r="10" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                  <circle cx="80" cy="140" r="10" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                  <circle cx="220" cy="140" r="10" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-blue-300 font-bold mb-10 bg-[#071321] px-1">P-101</span>
                </div>
                <Link href="/knowledge-graph" className="text-xs text-blue-400 font-medium group-hover:scale-105 transition-transform bg-[#071321]/80 px-3 py-1.5 rounded-full border border-blue-500/20 backdrop-blur pointer-events-auto z-20">
                  View full graph →
                </Link>
              </div>
            </div>

            {/* Popular Assets */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> Critical Assets
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Pump P-101", health: "96%", date: "Insp. Yesterday" },
                  { name: "Valve V-17", health: "98%", date: "Insp. 4 days ago" },
                  { name: "Compressor C-05", health: "91%", date: "Insp. 2 weeks ago" }
                ].map((asset, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{asset.name}</div>
                        <div className="text-[11px] text-white/40">{asset.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-emerald-400 font-mono">Health {asset.health}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
