"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";

const STAGES = [
  {
    id: 0,
    title: "Incident Detected",
    text: "High vibration detected on Pump P-101.\n\nMaintenance overdue.\nInspection missed.\nPotential production impact identified.",
    svg: "/f61.svg",
    timelineLabel: "Incident",
  },
  {
    id: 1,
    title: "AI Connects the Dots",
    text: "AssetAtlas automatically connected 9 disconnected information sources across your entire enterprise.\n\nP&ID • Inspection • SOP • Email • Maintenance • Compliance",
    svg: "/f62.svg",
    timelineLabel: "Correlation",
  },
  {
    id: 2,
    title: "Resolution",
    text: "✓ Root Cause Identified\n✓ Compliance Evidence Generated\n✓ Maintenance Scheduled\n✓ Lessons Stored\n✓ Downtime Prevented",
    svg: "/f63.svg",
    timelineLabel: "Resolution",
  }
];

export default function GoldenThreadFinale() {
  const [activeStage, setActiveStage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3, once: true });
  const isFinished = activeStage === STAGES.length - 1;

  // Cinematic Auto-play logic
  useEffect(() => {
    if (!isInView || isFinished) return;

    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 7000); // 7 seconds per stage to allow time to read and watch animations

    return () => clearInterval(timer);
  }, [isInView, isFinished]);

  return (
    <section className="relative w-full bg-[#071321] py-24 md:py-32 overflow-hidden border-t border-blue-900/30">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10" ref={ref}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-4 font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-blue-400">
            The Golden Thread
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            One incident.<br/>
            <span className="text-white/50">Every document.</span><br/>
            <span className="text-blue-400">One connected story.</span>
          </h2>
        </div>

        {/* Cinematic Viewer Container */}
        <div className="relative w-full rounded-[2.5rem] bg-[#0A111A]/80 backdrop-blur-xl border border-blue-500/20 shadow-[0_0_80px_rgba(60,120,255,0.08)] overflow-hidden aspect-[4/3] md:aspect-[21/9]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              
              {/* Left Narrative Panel */}
              <div className="w-full md:w-[35%] h-full p-8 md:p-12 flex flex-col justify-center relative z-20 bg-gradient-to-r from-[#071321] via-[#071321]/90 to-transparent">
                <motion.h3 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="font-display text-3xl font-semibold text-white mb-6"
                >
                  {STAGES[activeStage].title}
                </motion.h3>
                
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-lg leading-relaxed text-blue-100/70 whitespace-pre-line"
                >
                  {STAGES[activeStage].text}
                </motion.div>
              </div>

              {/* Right Visual Panel (SVG) */}
              <div className="absolute inset-0 w-full h-full z-10 md:pl-[25%] flex items-center justify-end overflow-hidden">
                <motion.div 
                  className="w-full h-full relative"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Overlay gradient to fade the left edge of the image into the dark background */}
                  <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#071321] to-transparent z-10 hidden md:block" />
                  
                  <img 
                    src={STAGES[activeStage].svg} 
                    alt={`Stage ${activeStage + 1}`}
                    className="w-full h-full object-cover md:object-contain object-right"
                  />
                </motion.div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Progress Timeline */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#020617] to-transparent z-30 px-8 md:px-16 flex items-center justify-between">
            <div className="flex items-center w-full max-w-2xl mx-auto gap-4">
              {STAGES.map((stage, idx) => (
                <React.Fragment key={stage.id}>
                  {/* Node */}
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-center whitespace-nowrap absolute -top-6">
                      <span className={`transition-colors duration-1000 ${activeStage >= idx ? "text-blue-400" : "text-white/30"}`}>
                        {stage.timelineLabel}
                      </span>
                    </div>
                    <motion.div 
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-1000 ${
                        activeStage === idx ? "bg-blue-500 border-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.8)]" : 
                        activeStage > idx ? "bg-blue-900 border-blue-700" : "bg-transparent border-white/20"
                      }`}
                    />
                  </div>
                  
                  {/* Connector Line */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex-1 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                      <motion.div 
                        className="absolute top-0 left-0 bottom-0 bg-blue-500 shadow-[0_0_10px_rgba(60,120,255,1)]"
                        initial={{ width: "0%" }}
                        animate={{ width: activeStage > idx ? "100%" : activeStage === idx ? "50%" : "0%" }}
                        transition={{ duration: activeStage === idx ? 7 : 1, ease: "linear" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Replay Button */}
            <AnimatePresence>
              {isFinished && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setActiveStage(0)}
                  className="absolute right-8 bottom-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Replay Sequence"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Final Reveal Footer */}
        <AnimatePresence>
          {isFinished && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-20 text-center max-w-2xl mx-auto"
            >
              <h3 className="font-display text-2xl font-semibold text-white mb-4">
                Every document. Every inspection. Every maintenance record.
              </h3>
              <p className="text-blue-200/60 leading-relaxed mb-10">
                Connected into one operational intelligence layer. This is the Golden Thread.
              </p>
              
              <div className="flex justify-center">
                <GlassButton href="/knowledge-graph" variant="primary" width={240} height={50}>
                  See AssetAtlas in Action
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
