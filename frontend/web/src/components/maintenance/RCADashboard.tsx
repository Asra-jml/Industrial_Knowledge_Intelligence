"use client";

import { useState } from "react";
import { Loader2, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { analyzeRCA } from "./api";

import RCAForm from "./RCAForm";
import RCACards from "./RCACards";
import VibrationChart from "./VibrationChart";
import Timeline from "./Timeline";
import GraphReasoning from "./GraphReasoning";
import MaintenanceSchedule from "./MaintenanceSchedule";
import SpareParts from "./SpareParts";
import EvidenceChain from "./EvidenceChain";
// import MaintenanceHistory from "./MaintenanceHistory";
import Recommendations from "./Recommendations";
import AnalysisSummary from "./AnalysisSummary";

import { RCAResponse } from "./types";

export default function RCADashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RCAResponse | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze(equipment: string, fault: string) {
    try {
      setLoading(true);
      setError("");

      const data = await analyzeRCA(equipment, fault);

      setResult(data);
    } catch (err) {
      console.error("RCA Error:", err);
      setError("Unable to analyze equipment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="accent">F3</Badge>

        <h1 className="mt-3 flex items-center gap-2 text-3xl font-bold text-fg">
          <Wrench className="h-7 w-7 text-accent" />
          Maintenance Intelligence & RCA
        </h1>

        <p className="mt-2 max-w-3xl text-muted">
          AI powered Root Cause Analysis using vibration trends, inspection
          history, work orders, failure records, OEM knowledge and Knowledge
          Graph.
        </p>
      </div>

      {/* Form */}
      <RCAForm onAnalyze={handleAnalyze} loading={loading} />

      {/* Loading */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
          {error}
        </div>
      )}

      {/* RCA Result */}
      {result && !loading && (
        <div className="mt-8 space-y-6">
          {/* Summary + Root Cause + Prediction */}
          <RCACards result={result} />

          <AnalysisSummary result={result} />

          {/* Knowledge Graph reasoning */}
          <GraphReasoning graph={result.graph_reasoning} />

          {/* Sensor Trend */}
          <VibrationChart
            history={result.vibration.history}
            alarmLimit={result.vibration.alarm_limit}
            tripLimit={result.vibration.trip_limit}
          />

          {/* Timeline of events */}
          <Timeline timeline={result.timeline} />

          
          {/* Evidence from Documents */}
          <EvidenceChain data={result.evidence_chain} />

          {/* Maintenance schedule */}
          <MaintenanceSchedule
            schedule={result.optimized_schedule}
            maintenance={result.maintenance_schedule}
          />

          {/* Spare parts needed */}
          <SpareParts parts={result.spare_parts} />

          {/* Maintenance Actions */}
          <Recommendations data={result.recommendations} />
        </div>
      )}
    </div>
  );
}