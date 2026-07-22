"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Network, MessagesSquare, Wrench, ShieldCheck, Lightbulb, Sparkles, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Feature {
  code: string;
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  status: "live" | "soon";
}

const FEATURES: Feature[] = [
  {
    code: "F1",
    name: "Knowledge Graph",
    href: "/knowledge-graph",
    icon: Network,
    description: "Ingests P&IDs, manuals, registers and emails into one unified graph — every asset record connected and queryable.",
    status: "live",
  },
  {
    code: "F2",
    name: "Expert Copilot",
    href: "/copilot",
    icon: MessagesSquare,
    description: "Conversational answers across the full corpus, with citations to source documents and confidence scores.",
    status: "live",
  },
  {
    code: "F3",
    name: "Maintenance & RCA",
    href: "/maintenance",
    icon: Wrench,
    description: "Predictive alerts from vibration trends, plus root-cause analysis walked directly out of the graph.",
    status: "live",
  },
  {
    code: "F4",
    name: "Compliance Intelligence",
    href: "/compliance",
    icon: ShieldCheck,
    description: "Regulations mapped to assets and procedures. Gaps flagged automatically, evidence packs on demand.",
    status: "live",
  },
  {
    code: "F5",
    name: "Lessons Learned",
    href: "/lessons",
    icon: Lightbulb,
    description: "Systemic failure patterns clustered from internal incidents and external industry databases.",
    status: "live",
  }
];

const MobileCarousel = ({ featureIndex }: { featureIndex: number }) => {
  const [imgIdx, setImgIdx] = useState(0);
  
  useEffect(() => {
    const t = setInterval(() => setImgIdx(p => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="absolute inset-0 bg-blue-500/10 blur-3xl pointer-events-none" />
      <AnimatePresence mode="wait">
        <motion.img
          key={imgIdx}
          src={`/f${featureIndex + 1}${imgIdx + 1}.svg`}
          initial={{ opacity: 0, scale: 1, filter: "blur(2px)" }}
          animate={{ opacity: 1, scale: 1.05, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(2px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full object-cover relative z-10"
          style={{ 
            maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)" 
          }}
          alt={`Feature screenshot ${imgIdx + 1}`}
        />
      </AnimatePresence>
    </>
  );
};

const FeatureCard = ({ 
  index, 
  feature, 
  isActive, 
  setActiveIndex 
}: { 
  index: number; 
  feature: Feature; 
  isActive: boolean; 
  setActiveIndex: (val: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.5, margin: "-10% 0px -10% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveIndex(index);
    }
  }, [isInView, index, setActiveIndex]);

  return (
    <div ref={ref} className="relative min-h-[60vh] md:min-h-[85vh] py-12 md:py-32 flex flex-col justify-center">
      
      {/* Mobile only Carousel */}
      <div className="block md:hidden w-full h-[250px] sm:h-[320px] rounded-2xl bg-[#071321] border border-blue-500/20 mb-8 overflow-hidden relative shadow-lg">
         <MobileCarousel featureIndex={index} />
      </div>

      {/* Progress marker for Desktop */}
      <div className="hidden md:flex absolute left-[-48px] lg:left-[-80px] top-1/2 -translate-y-1/2 items-center z-10">
        <motion.div 
          className={`w-12 lg:w-20 h-[2px] ${isActive ? 'bg-blue-400' : 'bg-transparent'}`}
          animate={{ width: isActive ? (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 80 : 48) : 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div 
          className={`w-3 h-3 rounded-full border-2 absolute right-0 translate-x-1.5 transition-colors duration-300 ${isActive ? 'border-blue-400 bg-blue-500 shadow-[0_0_12px_rgba(96,165,250,0.8)]' : 'border-white/10 bg-[#050b14]'}`}
        />
      </div>

      <Link href={feature.href} className="block group">
        <motion.div
          animate={isActive ? {
            opacity: 1,
            scale: 1,
            x: 12,
            filter: "blur(0px)"
          } : {
            opacity: 0.55,
            scale: 0.96,
            x: 0,
            filter: "blur(1px)"
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden rounded-[2rem] border p-8 md:p-12 transition-colors duration-500 ${isActive ? 'bg-[#0a111a] border-blue-500/30 shadow-[0_0_40px_rgba(60,120,255,0.08)]' : 'bg-surface/30 border-white/5'}`}
        >
          {/* Subtle active glow */}
          {isActive && <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />}

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-500 ${isActive ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.15)]' : 'border-white/10 bg-white/5'}`}>
                <feature.icon className={`h-5 w-5 transition-colors duration-500 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />
              </span>
              <div className="flex items-center gap-2">
                {feature.status === "live" ? (
                  <Badge variant="success">Live</Badge>
                ) : (
                  <Badge>In development</Badge>
                )}
                <span className="font-mono text-[12px] text-white/40">{feature.code}</span>
              </div>
            </div>
            
            <h3 className={`mt-8 font-display text-3xl font-semibold tracking-tight transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/60'}`}>
              {feature.name}
            </h3>
            
            <p className={`mt-4 text-[17px] leading-relaxed transition-colors duration-500 max-w-lg ${isActive ? 'text-white/70' : 'text-white/40'}`}>
              {feature.description}
            </p>
            
            <div className={`mt-10 flex items-center gap-1 text-sm font-medium transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-white/30 group-hover:text-blue-400/50'}`}>
              Explore module
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};

export default function StickyFeatureScroll() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cycle images every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeFeatureIndex]);

  // Reset image index when scrolling to a new feature
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeFeatureIndex]);

  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-24 md:py-32 relative">
      
      {/* Header (optional, if you want a title for the section) */}
      <div className="mb-12 md:mb-24 text-center">
        <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-blue-400">
          The Operating System
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Complete Industrial Intelligence
        </h2>
      </div>

      <div className="relative flex flex-col md:flex-row items-start w-full">
        
        {/* Left Sticky Column (45%) */}
        <div className="hidden md:flex flex-col w-[45%] sticky top-32 h-[calc(100vh-10rem)] min-h-[500px] max-h-[800px] pb-12">
           <div className="w-full h-full rounded-[2.5rem] bg-[#071321] border border-blue-500/20 shadow-[0_0_50px_rgba(60,120,255,0.06)] overflow-hidden p-10 relative group">
             
             {/* Deep glow background */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
             <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
             
             {/* Carousel */}
             <AnimatePresence mode="wait">
               <motion.img
                 key={`${activeFeatureIndex}-${currentImageIndex}`}
                 src={`/f${activeFeatureIndex + 1}${currentImageIndex + 1}.svg`}
                 initial={{ opacity: 0, scale: 1, filter: "blur(4px)" }}
                 animate={{ opacity: 1, scale: 1.05, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
                 transition={{ duration: 0.8, ease: "easeInOut" }}
                 className="w-full h-full object-cover relative z-10"
                 style={{ 
                   maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
                   WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)" 
                 }}
                 alt={`${FEATURES[activeFeatureIndex].name} preview ${currentImageIndex + 1}`}
               />
             </AnimatePresence>

             {/* Minimal Image Indicators (optional, just dots at bottom) */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
               {[0, 1, 2].map((idx) => (
                 <div 
                   key={idx} 
                   className={`h-1.5 rounded-full transition-all duration-500 ${currentImageIndex === idx ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/20'}`}
                 />
               ))}
             </div>
           </div>
        </div>
        
        {/* Right Scroll Column (55%) */}
        <div className="w-full md:w-[55%] relative md:pl-12 lg:pl-20">
          
          {/* Vertical Progress Track */}
          <div className="hidden md:block absolute left-0 top-32 bottom-32 w-[2px] bg-white/5 z-0 rounded-full" />
          
          <div className="flex flex-col w-full">
            {FEATURES.map((feature, i) => (
              <FeatureCard 
                key={feature.code}
                index={i}
                feature={feature}
                isActive={activeFeatureIndex === i}
                setActiveIndex={setActiveFeatureIndex}
              />
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
