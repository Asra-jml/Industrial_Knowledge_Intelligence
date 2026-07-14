"use client";

import { useState } from "react";

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

    } catch (err: any) {
      setError(err.message || "Unable to analyze.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      <SearchPanel
        loading={loading}
        onAnalyze={handleAnalyze}
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {result && (
        <>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
        </>
      )}

    </div>
  );
}
