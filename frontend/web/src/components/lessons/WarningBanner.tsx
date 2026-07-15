"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WarningBannerProps {
  risk: string;
  message: string;
}

export default function WarningBanner({
  risk,
  message,
}: WarningBannerProps) {
  const highRisk = risk.toUpperCase() === "HIGH";

  return (
    <Card
      className={`border p-5 ${
        highRisk
          ? "border-red-500/30 bg-red-500/10"
          : "border-yellow-500/30 bg-yellow-500/10"
      }`}
    >
      <div className="flex items-start gap-4">

        <div
          className={`rounded-full p-2 ${
            highRisk
              ? "bg-red-500/20"
              : "bg-yellow-500/20"
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${
              highRisk
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          />
        </div>

        <div className="flex-1">

          <h2
            className={`text-lg font-semibold ${
              highRisk
                ? "text-red-300"
                : "text-yellow-300"
            }`}
          >
            🚨 Proactive Warning
          </h2>

          <p className="mt-2 text-sm text-zinc-300">
            {message}
          </p>

          {highRisk && (
            <p className="mt-3 rounded-md bg-black/20 p-3 text-sm text-zinc-200">
              Current operating conditions resemble historical failure
              patterns. Immediate inspection and preventive action are
              recommended to reduce the likelihood of recurrence.
            </p>
          )}

        </div>

      </div>
    </Card>
  );
}