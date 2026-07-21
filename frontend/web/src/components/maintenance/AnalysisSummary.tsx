"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RCAResponse } from "./types";

interface Props {
  result: RCAResponse;
}

export default function AnalysisSummary({
  result,
}: Props) {
  const stats = [
    {
      title: "Total Work Orders",
      value: result.work_order_analysis.total,
      icon: <ClipboardList className="h-5 w-5 text-blue-400" />,
      color: "text-blue-400",
    },
    {
      title: "Preventive",
      value: result.work_order_analysis.preventive,
      icon: <ShieldCheck className="h-5 w-5 text-green-400" />,
      color: "text-green-400",
    },
    {
      title: "Corrective",
      value: result.work_order_analysis.corrective,
      icon: <Wrench className="h-5 w-5 text-yellow-400" />,
      color: "text-yellow-400",
    },
    {
      title: "Overdue",
      value: result.work_order_analysis.overdue,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: "text-red-400",
    },
  ];

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
              <BarChart3 className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Maintenance Analysis Summary
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                AI summarized maintenance history, work order statistics and
                equipment reliability trends.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Statistics */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl border border-edge bg-raised p-5 transition-all duration-300 hover:-translate-y-1 hover:border-edge-strong"
              >
                <div className="mb-4 flex items-center justify-between">
                  {stat.icon}
                </div>

                <p className="text-sm text-muted">
                  {stat.title}
                </p>

                <h3 className={`mt-2 text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Failure Analysis */}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-edge bg-raised p-5">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-warning" />

                <h3 className="font-semibold text-fg">
                  Repeat Failures
                </h3>
              </div>

              <p className="text-4xl font-bold text-warning">
                {result.failure_analysis.repeat_failures}
              </p>

              <p className="mt-2 text-sm text-muted">
                Similar failures detected from historical maintenance records.
              </p>
            </div>

            <div className="rounded-xl border border-edge bg-raised p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />

                <h3 className="font-semibold text-fg">
                  Failure Trend
                </h3>
              </div>

              <p className="text-lg font-semibold text-fg">
                {result.failure_analysis.trend}
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                AI trend analysis based on work orders, inspections and
                historical equipment failures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}