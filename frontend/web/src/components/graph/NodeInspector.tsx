"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Activity, FileText, Database, Network, Clock, 
  Wrench, ShieldAlert, CheckCircle2, MessageSquare, AlertTriangle, Play 
} from "lucide-react";
import type { GraphNode } from "@/lib/types";
import { GlassButton } from "@/components/ui/GlassButton";

interface Props {
  node: GraphNode | null;
  onClose: () => void;
  onGoldenThread: () => void;
}

export default function NodeInspector({ node, onClose, onGoldenThread }: Props) {
  
  if (!node) {
    return null;
  }

  // Selected State
  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-[400px] h-full bg-[#0A111A]/95 backdrop-blur-xl border-l border-blue-500/20 flex flex-col pointer-events-auto shadow-[-20px_0_40px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="relative p-6 pb-0 shrink-0">
        <button onClick={onClose} className="absolute top-6 right-6 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="text-[10px] uppercase tracking-widest text-blue-400 font-mono mb-2">{node.type}</div>
        <h2 className="font-display text-2xl font-semibold text-white mb-6 break-words pr-8">
          {node.props?.title || node.id.split(":")[1] || node.id}
        </h2>

        {/* Health / Main Metric */}
        {node.type === "Equipment" && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-100">Asset Health</span>
            </div>
            <span className="text-xl font-semibold text-emerald-400">96%</span>
          </div>
        )}
        {node.type === "Incident" && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-100">Severity</span>
            </div>
            <span className="text-xl font-semibold text-red-400">Critical</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-8 mt-4 custom-scrollbar">
        
        {/* Properties */}
        {Object.keys(node.props || {}).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Properties</h3>
            <div className="space-y-2">
              {Object.entries(node.props).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-mono">{k}</span>
                  <span className="text-sm text-white/90 break-words">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connections Summary */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Connections</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-xl font-semibold text-white mb-1">12</span>
              <span className="text-[10px] text-white/50 uppercase">Assets</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-xl font-semibold text-white mb-1">18</span>
              <span className="text-[10px] text-white/50 uppercase">Documents</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-xl font-semibold text-white mb-1">7</span>
              <span className="text-[10px] text-white/50 uppercase">Inspections</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-xl font-semibold text-white mb-1">2</span>
              <span className="text-[10px] text-white/50 uppercase">Failures</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="relative border-l border-white/10 ml-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#0A111A]" />
              <div className="text-[11px] text-blue-400 mb-0.5">Today</div>
              <div className="text-sm text-white/80">Routine Inspection Completed</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-[#0A111A]" />
              <div className="text-[11px] text-white/40 mb-0.5">Last Week</div>
              <div className="text-sm text-white/80">Preventative Maintenance WO-921</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative pl-5">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-400 border-2 border-[#0A111A]" />
              <div className="text-[11px] text-white/40 mb-0.5">Last Month</div>
              <div className="text-sm text-white/80">Vibration Anomaly Detected</div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Quick Actions Footer */}
      <div className="p-6 border-t border-white/5 bg-[#0A111A] shrink-0 space-y-3">
        {node.id === "Equipment:P-101" && (
          <GlassButton width="100%" height={44} onClick={onGoldenThread} className="mb-2">
            <div className="flex items-center justify-center gap-2 w-full">
              <Play className="w-4 h-4 text-blue-300 fill-blue-300" />
              <span className="font-medium text-white">Play Golden Thread</span>
            </div>
          </GlassButton>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-white transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Ask Copilot
          </button>
          <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-white transition-colors">
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Documents
          </button>
        </div>
      </div>

    </motion.div>
  );
}
