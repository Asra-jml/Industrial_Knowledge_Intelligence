"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  History,
  FileText,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  WorkOrder,
  FailureHistory,
} from "./types";

interface Props {
  workOrders: WorkOrder[];
  failures: FailureHistory[];
}

export default function MaintenanceHistory({
  workOrders,
  failures,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid gap-6 lg:grid-cols-2"
    >
      {/* Work Orders */}

      <Card className="overflow-hidden transition-all duration-300 hover:border-edge-strong">
        <CardHeader className="border-b border-edge bg-raised/40">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <ClipboardList className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Maintenance Work Orders
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Historical maintenance work orders retrieved by the AI engine.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {workOrders.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No work orders found.
            </div>
          ) : (
            workOrders.map((wo, index) => (
              <div
                key={index}
                className="rounded-xl border border-edge bg-raised p-5 transition-all duration-300 hover:border-accent/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="accent">
                    {wo.source}
                  </Badge>

                  <FileText className="h-5 w-5 text-muted" />
                </div>

                <div className="space-y-3">
                  {Object.entries(wo.details || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 border-b border-edge pb-2 last:border-none"
                      >
                        <span className="text-sm font-medium text-muted">
                          {key}
                        </span>

                        <span className="text-sm text-fg text-right">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Failure History */}

      <Card className="overflow-hidden transition-all duration-300 hover:border-edge-strong">
        <CardHeader className="border-b border-edge bg-raised/40">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-danger/20 bg-danger/10">
              <History className="h-5 w-5 text-danger" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Failure History
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Previous equipment failures and historical incident records.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {failures.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No previous failures found.
            </div>
          ) : (
            failures.map((failure, index) => (
              <div
                key={index}
                className="rounded-xl border border-edge bg-raised p-5 transition-all duration-300 hover:border-danger/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="danger">
                    {failure.source}
                  </Badge>

                  <AlertTriangle className="h-5 w-5 text-danger" />
                </div>

                <div className="space-y-3">
                  {Object.entries(failure.record || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 border-b border-edge pb-2 last:border-none"
                      >
                        <span className="text-sm font-medium text-muted">
                          {key}
                        </span>

                        <span className="text-sm text-fg text-right">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}