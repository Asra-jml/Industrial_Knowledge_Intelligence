"use client";

import { motion } from "framer-motion";
import {
  Link2,
  FileSearch,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Evidence } from "./types";

interface Props {
  data: Evidence[];
}

export default function EvidenceChain({
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <Link2 className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Evidence Chain
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                AI traceability showing how every conclusion is supported by
                inspection records, maintenance history and industrial data.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {data.length === 0 ? (
            <div className="rounded-xl border border-edge bg-raised p-6 text-center text-muted">
              No supporting evidence available.
            </div>
          ) : (
            data.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-edge bg-raised p-5 transition-all duration-300 hover:border-accent/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileSearch className="h-5 w-5 text-accent" />

                    <h3 className="font-semibold text-fg">
                      {item.source}
                    </h3>
                  </div>

                  <Badge variant="outline">
                    Evidence {index + 1}
                  </Badge>
                </div>

                <div className="mt-5 rounded-lg border border-edge bg-background p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />

                    <span className="text-sm font-semibold text-fg">
                      Finding
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted">
                    {item.finding}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                  <ArrowRight className="h-4 w-4 text-accent" />

                  <span className="text-sm font-medium text-muted">
                    Relationship
                  </span>

                  <Badge variant="accent">
                    {item.relation}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}