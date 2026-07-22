"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Users } from "lucide-react";

// The ReactBits GlassIcon implementation adapted for individual use within cards
const SingleGlassIcon = ({ icon, color }: { icon: React.ReactNode; color: string }) => {
  const gradientMapping: Record<string, string> = {
    blue: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
    purple: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
    red: "linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))",
    indigo: "linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))",
    orange: "linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))",
    green: "linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))",
  };
  const getBackgroundStyle = (c: string) => ({ background: gradientMapping[c] || c });

  return (
    <div className="relative bg-transparent w-[3.5em] h-[3.5em] [perspective:24em] [transform-style:preserve-3d] group inline-block cursor-pointer">
      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.2em,-0.2em,0.2em)]"
        style={{
          ...getBackgroundStyle(color),
          boxShadow: "0.2em -0.2em 0.5em hsla(223, 10%, 10%, 0.15)",
        }}
      ></span>
      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.5em] [-webkit-backdrop-filter:blur(0.5em)] group-hover:[transform:translate3d(0,0,1em)]"
        style={{ boxShadow: "0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset" }}
      >
        <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center text-white" aria-hidden="true">
          {icon}
        </span>
      </span>
    </div>
  );
};

export default function BentoProblemStats() {
  const cards = [
    {
      value: "35%",
      label: "Time wasted searching",
      sub: "of engineers' time is spent searching for information across 7–12 disconnected systems",
      colSpan: "lg:col-span-2",
      bgClass: "bg-[#040e1b] border-accent/20",
      isLarge: true,
      icon: <Search className="h-5 w-5" />,
      color: "blue",
      image: "/35_engineer.svg",
    },
    {
      value: "22%",
      label: "Unplanned downtime",
      sub: "in heavy industry traces back to fragmented knowledge",
      colSpan: "lg:col-span-1",
      bgClass: "bg-[#091524] border-white/5",
      isLarge: false,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "red",
      image: "/22_downtime.svg",
    },
    {
      value: "25%",
      label: "Knowledge lost",
      sub: "of experienced industrial engineers retire within a decade — their context undocumented",
      colSpan: "lg:col-span-1",
      bgClass: "bg-[#091524] border-white/5",
      isLarge: false,
      icon: <Users className="h-5 w-5" />,
      color: "orange",
      image: "/25_retired.svg",
    },
  ];

  return (
    <section className="border-y border-edge bg-surface/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`relative rounded-3xl border overflow-hidden p-6 sm:p-10 flex flex-col justify-between min-h-[350px] ${card.colSpan} ${card.bgClass} shadow-xl group`}
            >
              {/* Subtle Grid background for large cards mimicking the design */}
              {card.isLarge && (
                <div className="absolute inset-0 z-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              )}

              {/* Background Illustration */}
              {card.image && (
                <img 
                  src={card.image} 
                  alt="" 
                  className="absolute right-[-2%] bottom-[-2%] w-[65%] sm:w-[60%] h-auto opacity-[0.35] pointer-events-none z-0 mix-blend-plus-lighter" 
                  style={{ 
                    maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)", 
                    WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)",
                    objectFit: "contain"
                  }} 
                  aria-hidden="true" 
                />
              )}

              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-500 z-0" />

              <div className="relative z-10 mb-8">
                 <SingleGlassIcon icon={card.icon} color={card.color} />
              </div>
              
              <div className="relative z-10 mt-auto flex flex-col items-start w-full">
                <h3 className={`font-display font-semibold tracking-tighter text-white ${card.isLarge ? 'text-[6rem] md:text-[8rem] leading-[0.8]' : 'text-[5rem] md:text-[6rem] leading-[0.9]'} text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70`}>
                  {card.value}
                </h3>
                <div className={`mt-6 ${card.isLarge ? 'text-white text-lg md:text-xl font-medium' : 'text-white/90 text-base font-medium'}`}>
                  {card.label}
                </div>
                <div className={`mt-2 ${card.isLarge ? 'text-white/60 text-sm md:text-base max-w-md' : 'text-white/50 text-xs md:text-sm'}`}>
                  {card.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
