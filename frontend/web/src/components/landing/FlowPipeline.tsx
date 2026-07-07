"use client";

import { motion } from "framer-motion";
import {
  FileImage,
  Layers,
  Lightbulb,
  MessagesSquare,
  Network,
  ScanText,
  type LucideIcon,
} from "lucide-react";

interface Stage {
  icon: LucideIcon;
  name: string;
  detail: string;
}

const STAGES: Stage[] = [
  { icon: FileImage, name: "P&ID & documents", detail: "9 formats, 475 files" },
  { icon: ScanText, name: "OCR + CV", detail: "Tesseract · YOLO labels" },
  { icon: Network, name: "Knowledge graph", detail: "664 nodes · Neo4j" },
  { icon: Layers, name: "RAG index", detail: "8,050 tagged chunks" },
  { icon: MessagesSquare, name: "Copilot", detail: "cited answers" },
  { icon: Lightbulb, name: "Insights", detail: "RCA · gaps · patterns" },
];

export default function FlowPipeline() {
  return (
    <div className="relative">
      {/* desktop: horizontal rail */}
      <div className="hidden grid-cols-6 gap-0 lg:grid">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.name}
              className="relative flex flex-col items-center px-3 text-center"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.09 }}
            >
              {/* connector */}
              {i < STAGES.length - 1 && (
                <div className="absolute left-[calc(50%+28px)] right-[calc(-50%+28px)] top-7 h-px overflow-hidden bg-edge">
                  <motion.div
                    className="h-full w-10 bg-gradient-to-r from-transparent via-accent to-transparent"
                    animate={{ x: ["-40px", "220px"] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.35,
                    }}
                  />
                </div>
              )}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-edge bg-raised transition-colors">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-3 font-display text-[13px] font-semibold text-fg">
                {stage.name}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-dim">{stage.detail}</div>
            </motion.div>
          );
        })}
      </div>

      {/* mobile: vertical rail */}
      <div className="space-y-1 lg:hidden">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.name}
              className="flex items-stretch gap-4"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-raised">
                  <Icon className="h-4.5 w-4.5 text-accent" />
                </div>
                {i < STAGES.length - 1 && <div className="w-px flex-1 bg-edge" />}
              </div>
              <div className="pb-6 pt-1.5">
                <div className="font-display text-[14px] font-semibold text-fg">
                  {stage.name}
                </div>
                <div className="font-mono text-[11px] text-dim">{stage.detail}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
