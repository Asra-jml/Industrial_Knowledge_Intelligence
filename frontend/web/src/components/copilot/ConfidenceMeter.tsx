"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0–1
  className?: string;
}

export default function ConfidenceMeter({ value, className }: ConfidenceMeterProps) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80
      ? "bg-success"
      : pct >= 50
        ? "bg-warning"
        : "bg-danger";

  const glowColor =
    pct >= 80
      ? "shadow-[0_0_8px_rgba(62,207,142,0.3)]"
      : pct >= 50
        ? "shadow-[0_0_8px_rgba(240,180,95,0.3)]"
        : "shadow-[0_0_8px_rgba(241,106,106,0.3)]";

  const label =
    pct >= 80
      ? "High confidence"
      : pct >= 50
        ? "Moderate confidence"
        : "Low confidence";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", color, glowColor)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
        />
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-[11px] font-medium",
          pct >= 80 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger"
        )}
      >
        {pct}%
      </span>
      <span className="hidden text-[11px] text-dim sm:block">{label}</span>
    </div>
  );
}
