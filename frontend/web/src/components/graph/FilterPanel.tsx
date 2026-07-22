"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}

const CATEGORIES = [
  { id: "assets", label: "Assets", types: ["Equipment", "Person"] },
  { id: "documents", label: "Documents", types: ["Document", "Email"] },
  { id: "events", label: "Events", types: ["Incident", "Maintenance", "Inspection"] },
];

export default function FilterPanel({ hiddenTypes, onToggleType, isOpen, setIsOpen }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["assets", "documents", "events"]));

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0 }}
      className="h-full bg-[#071321]/90 backdrop-blur-xl border-r border-blue-900/30 overflow-hidden flex flex-col pointer-events-auto shadow-[20px_0_40px_rgba(0,0,0,0.2)]"
    >
      <div className="w-[260px] flex flex-col h-full">
        <div className="p-4 border-b border-blue-900/30 flex items-center justify-between shrink-0">
          <span className="font-semibold text-white/90 text-sm">Smart Filters</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {CATEGORIES.map(category => (
            <div key={category.id} className="mb-2">
              <button 
                onClick={() => toggleSection(category.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-xs font-semibold text-white/60 tracking-wider uppercase"
              >
                {category.label}
                {expanded.has(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {expanded.has(category.id) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="py-1 px-2 space-y-1">
                      {category.types.map(type => {
                        const isVisible = !hiddenTypes.has(type);
                        return (
                          <div 
                            key={type} 
                            onClick={() => onToggleType(type)}
                            className="flex items-center gap-3 p-1.5 rounded-md hover:bg-white/5 cursor-pointer group transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isVisible ? "bg-blue-500 border-blue-500" : "bg-transparent border-white/20 group-hover:border-white/40"}`}>
                              {isVisible && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${isVisible ? "text-white/90" : "text-white/40"}`}>{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <div className="my-4 border-t border-white/10" />

          {/* Depth Filter */}
          <div className="mb-2">
            <div className="p-2 text-xs font-semibold text-white/60 tracking-wider uppercase">Relationship Depth</div>
            <div className="px-3 space-y-2 mt-1">
              <input type="range" min="1" max="4" defaultValue="2" className="w-full accent-blue-500" />
              <div className="flex justify-between text-[10px] text-white/40">
                <span>1 Hop</span>
                <span>Entire Graph</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
