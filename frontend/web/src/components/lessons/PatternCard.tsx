"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PatternCardProps {
  pattern: string;
}

export default function PatternCard({
  pattern,
}: PatternCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:border-edge-strong">
        <CardHeader className="border-b border-edge bg-raised/40">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <BrainCircuit className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                AI Detected Pattern
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Historical operational intelligence identified the following recurring pattern.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="rounded-xl border border-accent/20 bg-accent/[0.05] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />

              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
                Failure Pattern
              </span>
            </div>

            <p className="text-lg font-semibold leading-8 text-fg">
              {pattern}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}