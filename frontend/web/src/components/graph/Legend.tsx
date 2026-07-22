"use client";

import { useState } from "react";
import { NODE_COLORS } from "@/lib/types";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LegendProps {
  typeCounts: Record<string, number>;
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
}

export default function Legend({
  typeCounts,
  hiddenTypes,
  onToggleType,
}: LegendProps) {
  const [isOpen, setIsOpen] = useState(true);
  const sorted = Object.entries(typeCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="flex flex-col w-56">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer w-full"
      >
        <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">
          Node Types
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-0.5 mt-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {sorted.map(([type, count]) => {
                const hidden = hiddenTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleType(type)}
                    className={`legend-item w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all hover:bg-[rgba(77,163,255,0.1)] ${
                      hidden ? "opacity-30 grayscale" : ""
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: NODE_COLORS[type] || "#888" }}
                    />
                    <span className="flex-1 text-left text-white/80">{type}</span>
                    <span className="text-[11px] text-white/40 font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
