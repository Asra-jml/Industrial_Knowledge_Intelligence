"use client";

import { motion } from "framer-motion";
import { Activity, Network, Layers, Sparkles } from "lucide-react";

export default function GraphAnalyticsWidget() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="pointer-events-none flex items-center gap-6 px-5 py-2.5 rounded-full bg-[#0A111A]/80 backdrop-blur-md border border-white/10 shadow-xl"
    >
      <div className="flex items-center gap-2">
        <Network className="w-4 h-4 text-blue-400" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Components</span>
          <span className="text-sm font-semibold text-white leading-tight">8</span>
        </div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Avg Degree</span>
          <span className="text-sm font-semibold text-white leading-tight">6.2</span>
        </div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Golden Threads</span>
          <span className="text-sm font-semibold text-white leading-tight">21</span>
        </div>
      </div>
    </motion.div>
  );
}
