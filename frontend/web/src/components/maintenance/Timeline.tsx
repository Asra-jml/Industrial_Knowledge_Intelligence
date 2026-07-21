"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { TimelineEvent } from "./types";

interface Props {
  timeline: TimelineEvent[];
}

function getConfig(severity: string) {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return {
        color: "bg-red-500",
        badge: "danger",
        text: "text-red-400",
      };

    case "HIGH":
      return {
        color: "bg-orange-500",
        badge: "warning",
        text: "text-orange-400",
      };

    case "RESOLVED":
      return {
        color: "bg-green-500",
        badge: "success",
        text: "text-green-400",
      };

    default:
      return {
        color: "bg-blue-500",
        badge: "accent",
        text: "text-blue-400",
      };
  }
}

export default function Timeline({
  timeline,
}: Props) {
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
              <CalendarDays className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Maintenance Timeline
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Complete sequence of maintenance events and equipment history.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {timeline.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No maintenance history available.
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.map((item, index) => {
                const config = getConfig(item.severity);

                return (
                  <div
                    key={index}
                    className="flex gap-5"
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`h-4 w-4 rounded-full ${config.color}`}
                      />

                      {index !== timeline.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-border" />
                      )}
                    </div>

                    {/* Event Card */}
                    <div className="flex-1 rounded-xl border border-edge bg-raised p-5 transition-all duration-300 hover:border-edge-strong">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold text-fg">
                          {item.event}
                        </h3>

                        <Badge variant={config.badge as any}>
                          {item.severity}
                        </Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          {item.date}
                        </div>

                        <div
                          className={`flex items-center gap-2 ${config.text}`}
                        >
                          {item.severity === "RESOLVED" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}

                          {item.severity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}