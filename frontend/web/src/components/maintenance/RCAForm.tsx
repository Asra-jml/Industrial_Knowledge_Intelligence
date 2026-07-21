"use client";

import { useState } from "react";
import { Search, Wrench, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface RCAFormProps {
  onAnalyze: (
    equipment: string,
    fault: string
  ) => void;

  loading: boolean;
}

export default function RCAForm({
  onAnalyze,
  loading,
}: RCAFormProps) {
  const [equipment, setEquipment] = useState("P-101");

  const [fault, setFault] = useState(
    "bearing vibration"
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!equipment.trim() || !fault.trim()) return;

    onAnalyze(equipment, fault);
  }

  return (
    <Card className="overflow-hidden border-edge bg-surface shadow-lg transition-all duration-300 hover:border-edge-strong">
      <CardContent className="space-y-6 p-6">
        {/* Top Label */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" />
            AI Root Cause Analysis
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Maintenance
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={submit}
          className="grid gap-4 lg:grid-cols-[220px_1fr_180px]"
        >
          <div className="relative">
            <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <Input
              value={equipment}
              onChange={(e) =>
                setEquipment(e.target.value)
              }
              placeholder="Equipment ID"
              className="h-12 pl-10"
            />
          </div>

          <Input
            value={fault}
            onChange={(e) =>
              setFault(e.target.value)
            }
            placeholder="Describe the fault or abnormal condition..."
            className="h-12"
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-12 gap-2 rounded-lg"
          >
            <Search className="h-4 w-4" />

            {loading
              ? "Analyzing..."
              : "Analyze RCA"}
          </Button>
        </form>

        {/* Helper */}

        <div className="rounded-xl border border-edge bg-raised/40 p-4">
          <p className="text-sm leading-6 text-muted">
            Enter an equipment ID and fault description.
            The AI engine combines vibration history,
            maintenance records, work orders, OEM manuals
            and knowledge graph reasoning to determine the
            most probable root cause and recommend
            corrective actions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}