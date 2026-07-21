"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card
        className={`overflow-hidden transition-all duration-300 ${
          highRisk
            ? "border-danger/30 bg-danger/[0.05]"
            : "border-warning/30 bg-warning/[0.05]"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                highRisk
                  ? "border-danger/20 bg-danger/10"
                  : "border-warning/20 bg-warning/10"
              }`}
            >
              {highRisk ? (
                <ShieldAlert className="h-6 w-6 text-danger" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-warning" />
              )}
            </span>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-semibold text-fg">
                  Proactive Warning
                </h2>

                <Badge
                  variant={highRisk ? "danger" : "warning"}
                >
                  {risk.toUpperCase()} RISK
                </Badge>
              </div>

              <p className="mt-3 text-[14px] leading-7 text-muted">
                {message}
              </p>

              {highRisk && (
                <div className="mt-5 rounded-xl border border-danger/20 bg-danger/[0.06] p-4">
                  <p className="text-sm leading-6 text-muted">
                    Current operating conditions closely resemble historical
                    failure patterns. Immediate inspection, maintenance and
                    preventive actions are strongly recommended to minimize
                    recurrence and reduce operational risk.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}