"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import SearchPanel from "./SearchPanel";
import WarningBanner from "./WarningBanner";
import RiskSummary from "./RiskSummary";
import PatternCard from "./PatternCard";
import InsightListCard from "./InsightListCard";

import { analyzeLessons } from "./api";
import type { LessonsResponse } from "./types";

export default function LessonDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LessonsResponse | null>(null);

  async function handleAnalyze(query: string) {
    try {
      setLoading(true);
      setError("");

      const data = await analyzeLessons(query);

      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex-1 overflow-y-auto">
      {/* Background */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </span>

            <Badge variant="accent" className="font-mono">
              F5
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Operational Lessons Intelligence
          </h1>

          <p className="mt-2 max-w-3xl text-[15px] text-muted">
            Analyze incidents, operational conditions, audit findings and
            equipment failures to identify historical patterns, understand
            root causes and receive AI-powered preventive recommendations.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
        >
          <SearchPanel
            loading={loading}
            onAnalyze={handleAnalyze}
          />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger"
          >
            {error}
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="mt-8 space-y-6"
          >
            <WarningBanner
              risk={result.risk}
              message={result.message}
            />

            <RiskSummary
              risk={result.risk}
              matchedCases={result.matched_cases}
            />

            <PatternCard
              pattern={result.analysis.pattern_found}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <InsightListCard
                title="Root Causes"
                items={result.analysis.root_causes}
              />

              <InsightListCard
                title="Repeated Risks"
                items={result.analysis.repeated_risks}
              />

              <InsightListCard
                title="Lessons Learned"
                items={result.analysis.lessons_learned}
              />

              <InsightListCard
                title="Preventive Actions"
                items={result.analysis.preventive_actions}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}