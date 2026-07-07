"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BellRing,
  CircleDashed,
  FileCheck,
  FileSearch,
  Gauge,
  GitBranch,
  Lightbulb,
  MessagesSquare,
  Quote,
  Radar,
  Repeat2,
  ScanSearch,
  ShieldCheck,
  Siren,
  TimerReset,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerGroup, StaggerItem } from "@/components/shared/Reveal";

/* Icon registry: pages are Server Components, so they pass icon NAMES
   (serializable) instead of component functions across the RSC boundary. */
const ICONS = {
  Activity,
  BellRing,
  FileCheck,
  FileSearch,
  Gauge,
  GitBranch,
  Lightbulb,
  MessagesSquare,
  Quote,
  Radar,
  Repeat2,
  ScanSearch,
  ShieldCheck,
  Siren,
  TimerReset,
  Wrench,
} satisfies Record<string, LucideIcon>;

export type ModuleIconName = keyof typeof ICONS;

export interface ModuleFeature {
  icon: ModuleIconName;
  title: string;
  description: string;
}

export interface ModulePlaceholderProps {
  module: string;
  title: string;
  tagline: string;
  description: string;
  icon: ModuleIconName;
  features: ModuleFeature[];
  reads: string[];
  acceptance: string;
}

export default function ModulePlaceholder({
  module,
  title,
  tagline,
  description,
  icon,
  features,
  reads,
  acceptance,
}: ModulePlaceholderProps) {
  const Icon = ICONS[icon];

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-4xl px-6 py-14 lg:py-20">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-2xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <Icon className="h-5 w-5 text-accent" />
            </span>
            <Badge variant="accent" className="font-mono">
              {module}
            </Badge>
            <Badge variant="warning">
              <CircleDashed className="h-3 w-3 animate-[spin_4s_linear_infinite]" />
              In development
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 font-display text-[15px] font-medium text-accent">
            {tagline}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {description}
          </p>
        </motion.div>

        {/* feature preview */}
        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-3">
          {features.map((f) => {
            const FeatureIcon = ICONS[f.icon];
            return (
              <StaggerItem key={f.title}>
                <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-edge-strong">
                  <CardContent className="p-5">
                    <FeatureIcon className="mb-3 h-4.5 w-4.5 text-accent" />
                    <div className="font-display text-[14px] font-semibold text-fg">
                      {f.title}
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* data contract */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 rounded-xl border border-edge bg-surface p-5"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
            Wired to the shared layer today
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {reads.map((r) => (
              <code
                key={r}
                className="rounded-md border border-edge bg-bg px-2 py-1 font-mono text-[12px] text-muted"
              >
                {r}
              </code>
            ))}
          </div>
          <p className="mt-4 border-l-2 border-accent/40 pl-3 text-[13px] italic leading-relaxed text-muted">
            “{acceptance}”
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link href="/knowledge-graph">
              <Button variant="secondary" size="sm">
                Explore the graph it builds on
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
