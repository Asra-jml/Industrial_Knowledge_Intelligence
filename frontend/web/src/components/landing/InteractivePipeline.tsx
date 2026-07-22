"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FolderUp, ScanLine, Database, Network, Layers, Sparkles, CheckCircle2 } from "lucide-react";

// ----------------------------------------------------------------------
// Vis Component 1: Upload
// ----------------------------------------------------------------------
const VisUpload = () => {
  const docs = ["PDF", "P&ID", "Excel", "Email", "Report"];
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-48 h-48 rounded-full border border-blue-500/30 border-dashed absolute flex items-center justify-center"
      >
        <div className="w-32 h-32 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(60,120,255,0.2)]">
          <FolderUp className="w-10 h-10 text-blue-400" />
        </div>
      </motion.div>
      
      {docs.map((doc, i) => (
        <motion.div
          key={doc}
          initial={{ opacity: 0, x: -150, y: (i - 2) * 40, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], x: 0, y: 0, scale: [0.8, 1, 0.5] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            delay: i * 0.5,
            ease: "easeInOut"
          }}
          className="absolute left-10 px-4 py-2 bg-[#0F172A] border border-blue-500/30 rounded-lg shadow-lg text-xs font-mono text-blue-300"
        >
          {doc}
        </motion.div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// Vis Component 2: OCR
// ----------------------------------------------------------------------
const VisOCR = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-8">
      <div className="w-full h-full max-w-md border border-white/10 bg-[#0F172A] rounded-xl relative p-6">
        {/* Mock drawing lines */}
        <div className="w-full h-full border-2 border-dashed border-blue-500/20 rounded relative">
          <motion.div 
            className="absolute top-4 left-4 w-16 h-16 border border-blue-400 bg-blue-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-24 h-8 border border-blue-400 bg-blue-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
          
          {/* Scanner Line */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] z-10"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Extracted Text Floating Out */}
        <motion.div 
          className="absolute -right-8 top-12 bg-[#071321] border border-blue-500/40 px-3 py-1 rounded shadow-lg text-xs font-mono text-blue-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: [0, 1, 0], x: 20 }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          P-101
        </motion.div>
        <motion.div 
          className="absolute -right-12 bottom-12 bg-[#071321] border border-blue-500/40 px-3 py-1 rounded shadow-lg text-xs font-mono text-blue-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: [0, 1, 0], x: 20 }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        >
          VALVE_17
        </motion.div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Vis Component 3: Entity Extraction
// ----------------------------------------------------------------------
const VisEntities = () => {
  const entities = [
    { type: "ASSET", val: "Pump P-101" },
    { type: "METRIC", val: "12.4 mm/s" },
    { type: "DATE", val: "2026-07-22" },
    { type: "PERSON", val: "J. Smith" }
  ];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {entities.map((ent, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.2 }}
          className="flex items-center w-64 bg-[#0F172A] border border-white/10 rounded-lg p-3 shadow-md"
        >
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded mr-3 w-16 text-center">{ent.type}</span>
          <span className="text-sm font-mono text-white/90">{ent.val}</span>
        </motion.div>
      ))}
      <motion.div 
        className="absolute inset-0 border-[1px] border-blue-500/20 rounded-3xl pointer-events-none"
        animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// Vis Component 4: Knowledge Graph
// ----------------------------------------------------------------------
const VisGraph = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        <motion.line x1="200" y1="200" x2="100" y2="120" stroke="#3B82F6" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        <motion.line x1="200" y1="200" x2="300" y2="120" stroke="#3B82F6" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.line x1="200" y1="200" x2="100" y2="280" stroke="#3B82F6" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.4 }} />
        <motion.line x1="200" y1="200" x2="300" y2="280" stroke="#3B82F6" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 }} />
      </svg>

      <motion.div 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
        className="absolute w-20 h-20 bg-blue-500/20 border border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(60,120,255,0.4)] z-10 backdrop-blur-md"
      >
        <span className="text-xs font-bold text-white text-center leading-tight">Pump<br/>P-101</span>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} className="absolute -translate-x-[100px] -translate-y-[80px] px-3 py-1 bg-[#0F172A] border border-blue-500/30 rounded-full text-[10px] text-blue-300">P&ID</motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} className="absolute translate-x-[100px] -translate-y-[80px] px-3 py-1 bg-[#0F172A] border border-blue-500/30 rounded-full text-[10px] text-blue-300">Manual</motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} className="absolute -translate-x-[100px] translate-y-[80px] px-3 py-1 bg-[#0F172A] border border-blue-500/30 rounded-full text-[10px] text-blue-300">Inspection</motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }} className="absolute translate-x-[100px] translate-y-[80px] px-3 py-1 bg-[#0F172A] border border-blue-500/30 rounded-full text-[10px] text-blue-300">Maintenance</motion.div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Vis Component 5: RAG Index
// ----------------------------------------------------------------------
const VisRAG = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: [0, 1, 0], y: [0, 50, 100], scale: [1, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            className="w-16 h-20 bg-[#0F172A] border border-blue-400/50 rounded flex items-center justify-center"
          >
            <div className="text-[8px] font-mono text-blue-300 break-all px-1 text-center opacity-50">
              [0.12, -0.4, 0.8...]
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div 
        className="mt-8 w-40 h-16 bg-blue-500/10 border border-blue-500/40 rounded-[50%] flex items-center justify-center relative shadow-[0_0_20px_rgba(60,120,255,0.2)]"
        animate={{ scale: [1, 1.05, 1], borderColor: ["rgba(60,120,255,0.4)", "rgba(60,120,255,0.8)", "rgba(60,120,255,0.4)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-mono text-blue-400">Vector DB</span>
        <div className="absolute -bottom-2 w-40 h-16 border-b border-blue-500/40 rounded-[50%]" />
        <div className="absolute -bottom-4 w-40 h-16 border-b border-blue-500/20 rounded-[50%]" />
      </motion.div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Vis Component 6: Copilot
// ----------------------------------------------------------------------
const VisCopilot = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="self-end bg-[#1E293B] border border-white/5 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white/90 shadow-lg"
        >
          Why did Pump P-101 fail?
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="self-start bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tl-sm px-4 py-4 text-sm text-blue-100 shadow-[0_0_30px_rgba(60,120,255,0.1)] w-full relative"
        >
          <Sparkles className="absolute -top-3 -left-3 w-6 h-6 text-blue-400 bg-[#071321] rounded-full p-1 border border-blue-500/30" />
          Based on the <span className="text-blue-400 font-medium">maintenance logs</span> and <span className="text-blue-400 font-medium">vibration telemetry</span>, the mechanical seal degraded due to a delayed PM schedule.
          
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-400 px-2 py-1 rounded">WO-20491</span>
            <span className="text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Tag V-101A</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// Main Pipeline Component
// ----------------------------------------------------------------------

const PIPELINE_STEPS = [
  { id: 1, title: "Upload Documents", desc: "Ingest PDFs, P&IDs, Excel, and Emails.", icon: FolderUp, Vis: VisUpload },
  { id: 2, title: "OCR + Vision", desc: "Extract text, tables, and bounding boxes.", icon: ScanLine, Vis: VisOCR },
  { id: 3, title: "Entity Extraction", desc: "Identify assets, dates, and metrics.", icon: Database, Vis: VisEntities },
  { id: 4, title: "Knowledge Graph", desc: "Build relationships across all data.", icon: Network, Vis: VisGraph },
  { id: 5, title: "RAG Index", desc: "Chunk and vectorize for fast retrieval.", icon: Layers, Vis: VisRAG },
  { id: 6, title: "AI Copilot", desc: "Ask questions, get cited answers.", icon: Sparkles, Vis: VisCopilot },
];

const StepCard = ({ 
  step, 
  index, 
  isActive, 
  setActiveIndex 
}: { 
  step: typeof PIPELINE_STEPS[0];
  index: number;
  isActive: boolean;
  setActiveIndex: (val: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.6, margin: "-10% 0px -40% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveIndex(index);
    }
  }, [isInView, index, setActiveIndex]);

  return (
    <div ref={ref} className="relative min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center">
      
      {/* Mobile only Vis */}
      <div className="block md:hidden w-full h-[300px] rounded-2xl bg-[#071321] border border-blue-500/20 mb-8 overflow-hidden relative shadow-lg">
         {isActive && <step.Vis />}
      </div>

      <motion.div
        animate={isActive ? { opacity: 1, scale: 1, x: 10 } : { opacity: 0.4, scale: 0.98, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-start gap-6 group"
      >
        <div className={`shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors duration-500 relative z-10
          ${isActive ? 'bg-blue-500/10 border-blue-400 shadow-[0_0_20px_rgba(60,120,255,0.3)] backdrop-blur-md' : 'bg-surface/50 border-white/10'}`}
        >
          <step.icon className={`w-6 h-6 transition-colors duration-500 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />
        </div>
        
        <div className="pt-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${isActive ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
              Step 0{step.id}
            </span>
            {isActive && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-[10px] text-blue-400">
                <CheckCircle2 className="w-3 h-3" /> Processing
              </motion.div>
            )}
          </div>
          <h3 className={`text-2xl font-display font-semibold transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/60'}`}>
            {step.title}
          </h3>
          <p className={`mt-2 text-base transition-colors duration-500 ${isActive ? 'text-white/70' : 'text-white/40'}`}>
            {step.desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
};


export default function InteractivePipeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  const ActiveVis = PIPELINE_STEPS[activeIndex].Vis;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32 relative border-y border-edge bg-surface/30">
      
      {/* Header */}
      <div className="mb-12 md:mb-24">
        <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-blue-400">
          How It Works
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white max-w-2xl leading-tight">
          From scattered documents <br/>
          <span className="text-white/50">to connected intelligence.</span>
        </h2>
      </div>

      <div className="relative flex flex-col md:flex-row items-start w-full gap-12 lg:gap-20">
        
        {/* Left Scroll Column (Steps) */}
        <div className="w-full md:w-[45%] relative">
          
          {/* Vertical Glowing Connector Line */}
          <div className="hidden md:block absolute left-7 top-10 bottom-10 w-[2px] bg-white/5 z-0" />
          
          {/* Flowing Particle */}
          <motion.div 
            className="hidden md:block absolute left-[27px] w-1.5 h-8 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(60,120,255,1)] z-10"
            animate={{ top: `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ translateY: "-50%" }}
          />
          
          <div className="flex flex-col w-full relative z-10">
            {PIPELINE_STEPS.map((step, i) => (
              <StepCard 
                key={step.id}
                index={i}
                step={step}
                isActive={activeIndex === i}
                setActiveIndex={setActiveIndex}
              />
            ))}
          </div>
        </div>

        {/* Right Sticky Column (Live Vis) */}
        <div className="hidden md:flex flex-col w-[55%] sticky top-32 h-[calc(100vh-10rem)] min-h-[500px] max-h-[800px] pb-12">
           <div className="w-full h-full rounded-[2.5rem] bg-[#071321] border border-blue-500/20 shadow-[0_0_50px_rgba(60,120,255,0.06)] overflow-hidden relative group">
             
             {/* Deep glow background */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
             
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full h-full relative z-10"
                >
                  <ActiveVis />
                </motion.div>
             </AnimatePresence>

             {/* UI Glass Overlay details */}
             <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                 <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                 <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
               </div>
               <div className="text-[10px] font-mono text-blue-400/50 uppercase">
                 Live Preview
               </div>
             </div>
           </div>
        </div>

      </div>
    </section>
  );
}
