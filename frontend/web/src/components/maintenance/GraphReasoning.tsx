"use client";

import { motion } from "framer-motion";
import {
  Network,
  FileSearch,
  ClipboardList,
  AlertTriangle,
  Cpu,
  BookOpen,
  Package,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { GraphReasoning as GraphType } from "./types";

interface Props {
  graph: GraphType;
}

function Section({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-edge bg-raised p-5">
      <div className="mb-4 flex items-center gap-3">
        {icon}

        <h3 className="font-semibold text-fg">
          {title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge
            key={index}
            variant="outline"
            className="px-3 py-1"
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function GraphReasoning({
  graph,
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
              <Network className="h-5 w-5 text-accent" />
            </span>

            <div>
              <CardTitle className="font-display text-xl">
                Knowledge Graph Reasoning
              </CardTitle>

              <p className="mt-1 text-sm text-muted">
                AI reasoning generated from inspections, work orders,
                failures, manuals and industrial knowledge graph.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Summary */}

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent" />

              <h3 className="font-semibold text-fg">
                AI Summary
              </h3>
            </div>

            <p className="leading-7 text-muted">
              {graph.summary}
            </p>
          </div>

          {/* Sections */}

          <div className="grid gap-5 md:grid-cols-2">
            <Section
              title="Inspections"
              items={graph.inspection}
              icon={<FileSearch className="h-5 w-5 text-blue-400" />}
            />

            <Section
              title="Work Orders"
              items={graph.work_orders}
              icon={<ClipboardList className="h-5 w-5 text-yellow-400" />}
            />

            <Section
              title="Failures"
              items={graph.failures}
              icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
            />

            <Section
              title="Related Assets"
              items={graph.related_assets}
              icon={<Network className="h-5 w-5 text-cyan-400" />}
            />

            <Section
              title="Manuals"
              items={graph.manuals}
              icon={<BookOpen className="h-5 w-5 text-indigo-400" />}
            />

            <Section
              title="Spare Parts"
              items={graph.spare_parts}
              icon={<Package className="h-5 w-5 text-orange-400" />}
            />

            <Section
              title="Permits"
              items={graph.permits}
              icon={<ShieldCheck className="h-5 w-5 text-green-400" />}
            />
          </div>

          {/* Regulations */}

          {graph.regulations.length > 0 && (
            <div className="rounded-xl border border-edge bg-raised p-6">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-success" />

                <h3 className="font-semibold text-fg">
                  Compliance Regulations
                </h3>
              </div>

              <div className="space-y-4">
                {graph.regulations.map((reg, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-edge bg-background p-5 transition-all duration-300 hover:border-edge-strong"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="font-semibold text-fg">
                        {reg.name}
                      </h4>

                      <Badge
                        variant={
                          reg.status === "PASS"
                            ? "success"
                            : "warning"
                        }
                      >
                        {reg.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />

                      <p className="text-sm leading-6 text-muted">
                        {reg.gap}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}