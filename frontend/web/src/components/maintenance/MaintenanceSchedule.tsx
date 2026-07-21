"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock3,
  ShieldCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  schedule: {
    inspection: string;
    lubrication: string;
    alignment: string;
    bearing_check: string;
  };

  maintenance: {
    urgent: string;
    preventive: string;
  };
}

export default function MaintenanceSchedule({
  schedule,
  maintenance,
}: Props) {
  const scheduleItems = [
    {
      title: "Inspection",
      value: schedule.inspection,
    },
    {
      title: "Lubrication",
      value: schedule.lubrication,
    },
    {
      title: "Alignment",
      value: schedule.alignment,
    },
    {
      title: "Bearing Check",
      value: schedule.bearing_check,
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-success/20 bg-success/10">
              <CalendarClock className="h-5 w-5 text-success" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Maintenance Schedule
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                AI optimized maintenance schedule and recommended actions.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          {/* Optimized Schedule */}

          <div className="rounded-xl border border-edge bg-raised p-5">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-accent" />

              <h3 className="font-semibold text-fg">
                Optimized Schedule
              </h3>
            </div>

            <div className="space-y-4">
              {scheduleItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-edge px-4 py-3"
                >
                  <span className="text-sm text-muted">
                    {item.title}
                  </span>

                  <span className="font-semibold text-fg">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}

          <div className="rounded-xl border border-edge bg-raised p-5">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />

              <h3 className="font-semibold text-fg">
                AI Recommendation
              </h3>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-red-400" />

                  <span className="text-sm font-semibold text-red-400">
                    Urgent Action
                  </span>
                </div>

                <p className="text-sm leading-6 text-muted">
                  {maintenance.urgent}
                </p>
              </div>

              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />

                  <span className="text-sm font-semibold text-green-400">
                    Preventive Plan
                  </span>
                </div>

                <p className="text-sm leading-6 text-muted">
                  {maintenance.preventive}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}