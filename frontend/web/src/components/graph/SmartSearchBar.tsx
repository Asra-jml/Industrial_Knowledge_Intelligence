"use client";

import React, { useState, useEffect } from "react";
import { Search, Command, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSearch: (query: string) => void;
}

export default function SmartSearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("graph-smart-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setFocused(false);
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  return (
    <div className="relative z-50">
      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-center w-[300px] md:w-[400px] h-11 bg-[#0A111A]/80 backdrop-blur-xl border transition-all duration-300 rounded-xl overflow-hidden shadow-xl
          ${focused ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' : 'border-white/10 hover:border-white/20'}`}
      >
        <Search className={`absolute left-3 w-4 h-4 transition-colors ${focused ? 'text-blue-400' : 'text-white/40'}`} />
        
        <input
          id="graph-smart-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search Digital Twin..."
          className="w-full h-full bg-transparent outline-none pl-10 pr-12 text-sm text-white placeholder:text-white/30"
          autoComplete="off"
        />

        {!value && !focused && (
          <div className="absolute right-3 flex items-center gap-1 opacity-50">
            <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[10px] font-mono text-white">⌘K</kbd>
          </div>
        )}
        
        <AnimatePresence>
          {value && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="submit"
              className="absolute right-2 p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-14 left-0 w-full bg-[#0A111A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="p-2">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Suggestions</div>
              <button onMouseDown={() => { setValue("Pump P-101"); onSearch("Pump P-101"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/80 transition-colors">
                <Command className="w-3.5 h-3.5 text-blue-400" /> Pump P-101
              </button>
              <button onMouseDown={() => { setValue("NCR-2026-014"); onSearch("NCR-2026-014"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/80 transition-colors">
                <Command className="w-3.5 h-3.5 text-red-400" /> Incident NCR-2026-014
              </button>
              <button onMouseDown={() => { setValue("OISD-119"); onSearch("OISD-119"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/80 transition-colors">
                <Command className="w-3.5 h-3.5 text-purple-400" /> Regulation OISD-119
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
