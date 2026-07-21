"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BellRing,
  BookMarked,
  Lightbulb,
  Radar,
  Repeat2,
  Sparkles,
} from "lucide-react";
import { fetchLessonsAlerts, fetchLessonsPatterns } from "@/lib/api";
import type { FailurePattern, LessonsAlert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function AlertCard({ alert }: { alert: LessonsAlert }) {
  const danger = alert.severity === "danger";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl border p-5",
        danger ? "border-danger/30 bg-danger/[0.05]" : "border-warning/30 bg-warning/[0.05]"
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border",
            danger
              ? "border-danger/30 bg-danger/10"
              : "border-warning/30 bg-warning/10"
          )}
        >
          <BellRing className={cn("h-4 w-4", danger ? "text-danger" : "text-warning")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-semibold text-fg">
            Proactive alert — <span className="font-mono">{alert.target}</span>
          </div>
          <div className="text-[12px] text-muted">{alert.title}</div>
        </div>
        <Badge variant={danger ? "warning" : "warning"}>
          {alert.severity === "danger" ? "Act now" : "Watch"}
        </Badge>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-fg">{alert.rationale}</p>

      {alert.summary && (
        <div className="mt-3 rounded-lg border border-edge bg-surface p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
            <Sparkles className="h-3 w-3 text-accent" />
            Recommended this week
          </div>
          <p className="text-[12.5px] leading-relaxed text-muted">{alert.summary}</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
            Internal evidence
          </div>
          <div className="space-y-1">
            {alert.evidence.map((item) => (
              <div key={item.id} className="flex items-baseline gap-2 text-[12.5px]">
                <span className="font-mono font-medium text-accent">{item.key}</span>
                <span className="font-mono text-[11px] text-dim">{item.date}</span>
                <span className="truncate text-muted">{item.summary}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
            <BookMarked className="h-3 w-3" />
            Industry precedents
          </div>
          <div className="space-y-1">
            {alert.precedents.length === 0 && (
              <span className="text-[12px] text-dim">—</span>
            )}
            {alert.precedents.map((precedent) => (
              <div key={precedent.doc_id} className="text-[12.5px]">
                <span className="font-medium text-fg">{precedent.title}</span>
                {precedent.page && (
                  <span className="font-mono text-[11px] text-dim"> · p.{precedent.page}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PatternCard({ pattern, index }: { pattern: FailurePattern; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-xl border border-edge bg-surface p-5"
    >
      <div className="flex items-center gap-2">
        <Repeat2 className="h-4 w-4 text-accent" />
        <h3 className="font-display text-[14px] font-semibold capitalize text-fg">
          {pattern.title}
        </h3>
        <span className="ml-auto font-mono text-[11px] text-dim">
          {pattern.members.length} events
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {pattern.members.map((member) => (
          <div key={member.id} className="flex items-baseline gap-2 text-[12.5px]">
            <span className="w-24 shrink-0 font-mono text-[11px] text-dim">
              {member.date}
            </span>
            <span className="font-mono font-medium text-accent">{member.key}</span>
            <span className="truncate text-muted">{member.summary}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-edge pt-3">
        <span className="text-[11px] uppercase tracking-wide text-dim">Affected class:</span>
        {pattern.equipment.map((tag) => (
          <span key={tag} className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent">
            {tag}
          </span>
        ))}
        {pattern.at_risk_siblings.map((sibling) => (
          <span
            key={sibling.tag}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]",
              sibling.risk === "watch" || sibling.risk === "alarm"
                ? "bg-warning/10 text-warning"
                : "bg-raised text-dim"
            )}
          >
            <Radar className="h-3 w-3" />
            {sibling.tag}
            {sibling.latest_value != null && ` · ${sibling.latest_value} mm/s`}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function LessonsPage() {
  const [alerts, setAlerts] = useState<LessonsAlert[] | null>(null);
  const [patterns, setPatterns] = useState<FailurePattern[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchLessonsAlerts().catch(() => null),
      fetchLessonsPatterns().catch(() => null),
    ]).then(([alertData, patternData]) => {
      if (alertData === null && patternData === null) {
        setError("Backend unreachable — start it with: uvicorn backend.api.main:app --reload");
        return;
      }
      setAlerts(alertData ?? []);
      setPatterns(patternData ?? []);
    });
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-edge bg-surface p-6 text-center text-sm text-muted">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
            <Lightbulb className="h-4.5 w-4.5 text-accent" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Failure intelligence
            </h1>
            <p className="text-[12.5px] text-muted">
              Systemic patterns from internal records + CSB / OISD industry databases
            </p>
          </div>
        </div>

        {/* proactive alerts */}
        {alerts === null ? (
          <Skeleton className="h-56 w-full" />
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-edge bg-surface p-5 text-center text-[13px] text-muted">
            No active alerts — no sibling equipment currently trending toward a known
            failure pattern.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.target} alert={alert} />
            ))}
          </div>
        )}

        {/* patterns */}
        <h2 className="mb-3 mt-10 flex items-center gap-2 font-display text-[15px] font-semibold">
          <Repeat2 className="h-4 w-4 text-accent" />
          Recurring patterns
        </h2>
        {patterns === null ? (
          <Skeleton className="h-40 w-full" />
        ) : patterns.length === 0 ? (
          <p className="text-[13px] text-muted">No recurring patterns detected.</p>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern, i) => (
              <PatternCard key={pattern.pattern} pattern={pattern} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
