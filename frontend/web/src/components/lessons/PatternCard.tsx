"use client";

import { BrainCircuit, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PatternCardProps {
  pattern: string;
}

export default function PatternCard({
  pattern,
}: PatternCardProps) {
  return (
    <Card className="border-white/10 bg-zinc-900 p-6">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-cyan-500/10 p-3">
          <BrainCircuit className="h-7 w-7 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            AI Detected Pattern
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            The AI engine identified a recurring systemic failure pattern
            from historical operational records and incident history.
          </p>
        </div>

      </div>

      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <div className="mb-2 flex items-center gap-2">

          <Sparkles className="h-5 w-5 text-cyan-300" />

          <span className="text-sm font-medium uppercase tracking-wide text-cyan-300">
            Failure Pattern
          </span>

        </div>

        <p className="text-2xl font-semibold leading-relaxed text-cyan-100">
          {pattern}
        </p>

      </div>

    </Card>
  );
}