"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  data: string[];
}

export default function Recommendations({
  data,
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-success/20 bg-success/10">
              <Sparkles className="h-5 w-5 text-success" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                AI Maintenance Recommendations
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                Suggested actions generated using predictive maintenance
                analytics and historical failure records.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {data.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No recommendations available.
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 rounded-xl border border-edge bg-raised p-4 transition-all duration-300 hover:border-success/30 hover:bg-success/[0.04]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-success/20 bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </span>

                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-fg">
                      Recommendation {index + 1}
                    </h3>

                    <p className="text-sm leading-6 text-muted">
                      {item}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}