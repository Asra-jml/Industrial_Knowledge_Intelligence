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
import Recommendations from "./Recommendations";
import AnalysisSummary from "./AnalysisSummary";

import { RCAResponse } from "./types";


export default function RCADashboard() {

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RCAResponse | null>(null);
  const [error, setError] = useState("");


  async function handleAnalyze(
    equipment: string,
    fault: string
  ) {

    try {

      setLoading(true);
      setError("");

      const data = await analyzeRCA(
        equipment,
        fault
      );

      setResult(data);

    } catch (err) {

      console.error("RCA Error:", err);

      setError(
        "Unable to analyze equipment."
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

        <div className="mb-8">


          <div className="mb-3 flex items-center gap-3">


            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">

              <Wrench className="h-5 w-5 text-accent" />

            </span>



            <Badge 
              variant="accent"
              className="font-mono"
            >
              F3
            </Badge>


          </div>




          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">

            Maintenance Intelligence & RCA

          </h1>




          <p className="mt-1.5 max-w-3xl text-[15px] text-muted">

            AI powered Root Cause Analysis using vibration trends,
            inspection history, work orders, failure records,
            OEM knowledge and Knowledge Graph.

          </p>



        </div>





        {/* RCA Input Form */}

        <div className="mb-8">

          <RCAForm
            onAnalyze={handleAnalyze}
            loading={loading}
          />

        </div>







        {/* Loading */}

        {loading && (

          <div className="mt-8 flex justify-center">

            <Loader2
              className="h-10 w-10 animate-spin text-accent"
            />

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

          <div className="space-y-6">



            <RCACards
              result={result}
            />




            <AnalysisSummary
              result={result}
            />





            <GraphReasoning
              graph={result.graph_reasoning}
            />





            <VibrationChart

              history={
                result.vibration.history
              }

              alarmLimit={
                result.vibration.alarm_limit
              }

              tripLimit={
                result.vibration.trip_limit
              }

            />






            <Timeline
              timeline={
                result.timeline
              }
            />







            <EvidenceChain
              data={
                result.evidence_chain
              }
            />







            <MaintenanceSchedule

              schedule={
                result.optimized_schedule
              }

              maintenance={
                result.maintenance_schedule
              }

            />







            <SpareParts
              parts={
                result.spare_parts
              }
            />







            <Recommendations

              data={
                result.recommendations
              }

            />




          </div>

        )}



      </div>


    </div>

  );

}