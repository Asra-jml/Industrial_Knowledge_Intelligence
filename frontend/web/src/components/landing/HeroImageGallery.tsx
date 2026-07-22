"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassSurface from "@/components/ui/GlassSurface";
import HeroGraph from "@/components/landing/HeroGraph";

const CopilotMock = () => (
  <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-[#0a111a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
    <div className="text-[10px] sm:text-xs font-display font-semibold text-purple-400 mb-4 border-b border-white/10 pb-2">Expert Copilot</div>
    <div className="space-y-3 flex-1 flex flex-col justify-center">
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white/70 text-[10px] sm:text-xs text-left w-5/6 shadow-sm">
        What is the root cause for P-101 vibration?
      </div>
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-white/90 text-[10px] sm:text-xs text-left ml-auto w-11/12 shadow-sm">
        Based on INSP-2026-0412 and recent similar incidents, the likely cause is bearing wear exacerbated by overdue maintenance.
      </div>
    </div>
  </div>
);

const MaintenanceMock = () => (
  <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-[#0a111a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
    <div className="text-[10px] sm:text-xs font-display font-semibold text-emerald-400 mb-2 border-b border-white/10 pb-2">Predictive Maintenance</div>
    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 mb-2 mt-4 px-2">
      {[40, 45, 42, 50, 65, 80, 95].map((h, i) => (
        <motion.div 
          key={i} 
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`w-full rounded-t-sm ${h > 75 ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-emerald-500/50'}`} 
        />
      ))}
    </div>
    <div className="text-[10px] text-red-400 text-center uppercase tracking-widest mt-2 animate-pulse font-bold font-display">Critical Alert: P-101</div>
  </div>
);

const ComplianceMock = () => (
  <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-[#0a111a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
    <div className="text-[10px] sm:text-xs font-display font-semibold text-amber-400 mb-4 border-b border-white/10 pb-2">Compliance Automation</div>
    <div className="space-y-4 flex-1 flex flex-col justify-center">
      {[1, 2, 3].map((i, idx) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.15 }}
          className="flex items-center gap-3"
        >
          <div className="w-4 h-4 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-500/10 shrink-0">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-1.5 bg-white/30 rounded-full w-full" />
            <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const LessonsMock = () => (
  <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-[#0a111a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
    <div className="text-[10px] sm:text-xs font-display font-semibold text-rose-400 mb-2 border-b border-white/10 pb-2">Lessons Learned</div>
    <div className="flex-1 flex flex-col justify-center space-y-3">
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-white/90 text-[10px] sm:text-xs shadow-sm">
        <span className="font-bold text-rose-400">Incident:</span> Valve failure on Unit 3.
      </div>
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white/70 text-[10px] sm:text-xs shadow-sm w-11/12 ml-auto">
        <span className="font-bold text-white">Action:</span> Replaced seal with high-temp variant.
      </div>
    </div>
  </div>
);

const features = [
  { id: "kg", title: "Knowledge Graph Engine", color: "bg-blue-500/10", border: "border-blue-500/20", component: <HeroGraph /> },
  { id: "copilot", title: "Expert Copilot AI", color: "bg-purple-500/10", border: "border-purple-500/20", component: <CopilotMock /> },
  { id: "rca", title: "Predictive Maintenance", color: "bg-emerald-500/10", border: "border-emerald-500/20", component: <MaintenanceMock /> },
  { id: "compliance", title: "Compliance Automation", color: "bg-amber-500/10", border: "border-amber-500/20", component: <ComplianceMock /> },
  { id: "lessons", title: "Lessons Learned", color: "bg-rose-500/10", border: "border-rose-500/20", component: <LessonsMock /> },
];

export default function HeroImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000); // Slightly longer interval to allow animations to finish
    return () => clearInterval(timer);
  }, []);

  const currentFeature = features[currentIndex] || features[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[500px] sm:h-[400px] w-full mt-8 lg:mt-0">
      {/* 1. Static Uploaded Image (Control Room) */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#08101e]/80 group h-full">
        <img 
          src="/control-room.png" 
          alt="Operations Control Room" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-10"
          onError={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-0">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
            <span className="text-white/30 text-xs font-display font-bold">IMG</span>
          </div>
          <p className="text-white/50 text-[12px] leading-relaxed">
            Please save your uploaded<br/>image as:<br/>
            <strong className="text-white/70">public/control-room.png</strong>
          </p>
        </div>
      </div>

      {/* 2. Animated Feature Glimpses Carousel */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#050b14] h-full flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(2px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`absolute inset-0 flex flex-col p-4 ${currentFeature.color}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[90%] h-[80%] flex items-center justify-center relative">
                  {currentFeature.component}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Carousel controls and title (fixed at bottom) */}
        <div className="h-16 border-t border-white/5 bg-black/20 flex items-center justify-between px-6 z-20">
          <span className="font-display font-semibold text-white/90 text-sm sm:text-base leading-tight break-words">
            {currentFeature.title}
          </span>
          <div className="flex gap-1.5 shrink-0 ml-4">
            {features.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
