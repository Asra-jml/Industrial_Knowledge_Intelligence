"use client";

import {
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Activity,
  FileSearch,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  risk: string;
  matchedCases: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-edge-strong">
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{
            background: `${color}12`,
            borderColor: `${color}30`,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color }}
          />
        </span>

        <div>
          <div
            className="text-3xl font-bold tracking-tight"
            style={{ color }}
          >
            {value}
          </div>

          <div className="mt-1 text-sm text-muted">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RiskSummary({
  risk,
  matchedCases,
}: Props) {
  const upper = risk.toUpperCase();

  const riskColor =
    upper === "HIGH"
      ? "#ef4444"
      : upper === "MEDIUM"
      ? "#f59e0b"
      : "#22c55e";

  const RiskIcon =
    upper === "HIGH"
      ? ShieldAlert
      : upper === "MEDIUM"
      ? AlertTriangle
      : AlertCircle;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={RiskIcon}
        label="Current Risk"
        value={upper}
        color={riskColor}
      />

      <StatCard
        icon={FileSearch}
        label="Historical Matches"
        value={matchedCases}
        color="#3b82f6"
      />

      <StatCard
        icon={Activity}
        label="Engine Status"
        value="ACTIVE"
        color="#22c55e"
      />

      <StatCard
        icon={ShieldAlert}
        label="Assessment"
        value={
          upper === "HIGH"
            ? "Immediate"
            : upper === "MEDIUM"
            ? "Monitor"
            : "Normal"
        }
        color="#8b5cf6"
      />
    </div>
  );
}