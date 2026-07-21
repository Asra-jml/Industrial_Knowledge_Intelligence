"use client";

import { motion } from "framer-motion";
import {
  Package,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  parts: string[];
}

export default function SpareParts({
  parts,
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-warning/20 bg-warning/10">
              <Package className="h-5 w-5 text-warning" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Recommended Spare Parts
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Spare parts suggested by the AI based on historical failures,
                OEM manuals and predictive maintenance analysis.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {parts.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No spare parts recommended.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parts.map((part, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 rounded-xl border border-edge bg-raised p-4 transition-all duration-300 hover:-translate-y-1 hover:border-warning/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10">
                    {index % 2 === 0 ? (
                      <Package className="h-5 w-5 text-warning" />
                    ) : (
                      <Wrench className="h-5 w-5 text-warning" />
                    )}
                  </span>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-fg">
                      {part}
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                      AI Recommended Component
                    </p>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}