"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  GitBranch,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchRcaAnalysis,
  fetchRcaEquipment,
  fetchRcaTrend,
} from "@/lib/api";
import type { EquipmentHealth, RcaResponse, TrendResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const RISK_STYLE: Record<string, { label: string; className: string }> = {
  tripped: { label: "Tripped", className: "border-danger/30 bg-danger/10 text-danger" },
  alarm: { label: "Alarm", className: "border-danger/30 bg-danger/10 text-danger" },
  watch: { label: "Watch", className: "border-warning/30 bg-warning/10 text-warning" },
  normal: { label: "Healthy", className: "border-success/25 bg-success/10 text-success" },
};

const SEVERITY_DOT: Record<string, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-accent",
};

function TrendChart({ trend }: { trend: TrendResponse }) {
  const data = useMemo(() => {
    const byDate = new Map<string, { date: string; value?: number; projected?: number }>();
    for (const p of trend.series) {
      byDate.set(p.date, { date: p.date, value: p.value });
    }
    for (const p of trend.projection) {
      const row = byDate.get(p.date) ?? { date: p.date };
      row.projected = p.value;
      byDate.set(p.date, row);
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [trend]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--text-dim)", fontSize: 11 }}
          tickFormatter={(d: string) => d.slice(5)}
          stroke="var(--border)"
        />
        <YAxis
          tick={{ fill: "var(--text-dim)", fontSize: 11 }}
          stroke="var(--border)"
          domain={[0, (trend.trip ?? 8) + 1]}
          unit=""
        />
        <Tooltip
          contentStyle={{
            background: "var(--panel-raised)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text)",
          }}
          labelStyle={{ color: "var(--text-muted)" }}
        />
        {trend.alarm != null && (
          <ReferenceLine
            y={trend.alarm}
            stroke="var(--warning)"
            strokeDasharray="6 4"
            label={{ value: `alarm ${trend.alarm}`, fill: "var(--warning)", fontSize: 11, position: "insideTopRight" }}
          />
        )}
        {trend.trip != null && (
          <ReferenceLine
            y={trend.trip}
            stroke="var(--danger)"
            strokeDasharray="6 4"
            label={{ value: `trip ${trend.trip}`, fill: "var(--danger)", fontSize: 11, position: "insideTopRight" }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          name="DE vibration (mm/s)"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="projected"
          name="trend projection"
          stroke="var(--warning)"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function MaintenancePage() {
  const [equipment, setEquipment] = useState<EquipmentHealth[] | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{
    tag: string;
    trend: TrendResponse | null;
    rca: RcaResponse | null;
  }>({ tag: "", trend: null, rca: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRcaEquipment()
      .then((list) => {
        setEquipment(list);
        if (list.length) setTag(list[0].tag);
      })
      .catch(() =>
        setError("Backend unreachable — start it with: uvicorn backend.api.main:app --reload")
      );
  }, []);

  useEffect(() => {
    if (!tag) return;
    let cancelled = false;
    Promise.all([
      fetchRcaTrend(tag).catch(() => null),
      fetchRcaAnalysis(tag).catch(() => null),
    ]).then(([trendData, rcaData]) => {
      if (!cancelled) setLoaded({ tag, trend: trendData, rca: rcaData });
    });
    return () => {
      cancelled = true;
    };
  }, [tag]);

  // data for a previously selected tag is treated as not-yet-loaded
  const trend = loaded.tag === tag ? loaded.trend : null;
  const rca = loaded.tag === tag ? loaded.rca : null;

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
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* equipment selector */}
        <div className="flex flex-wrap items-center gap-2">
          {equipment === null ? (
            <>
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </>
          ) : (
            equipment.map((eq) => {
              const risk = RISK_STYLE[eq.risk] ?? RISK_STYLE.normal;
              const active = eq.tag === tag;
              return (
                <button
                  key={eq.tag}
                  onClick={() => setTag(eq.tag)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-all",
                    active
                      ? "border-accent/40 bg-accent/10 text-fg"
                      : "border-edge bg-surface text-muted hover:border-edge-strong hover:text-fg"
                  )}
                >
                  <span className="font-mono">{eq.tag}</span>
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[10px]",
                      risk.className
                    )}
                  >
                    {risk.label}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* prediction banner */}
        {trend?.prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 flex items-start gap-3 rounded-xl border p-4",
              trend.prediction.kind === "forecast"
                ? "border-warning/30 bg-warning/[0.06]"
                : "border-accent/25 bg-accent/[0.05]"
            )}
          >
            {trend.prediction.kind === "forecast" ? (
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warning" />
            ) : (
              <CalendarClock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
            )}
            <div>
              <div className="font-display text-[14px] font-semibold text-fg">
                {trend.prediction.kind === "forecast"
                  ? `Predictive alert — ${trend.tag}`
                  : `Validated on history — ${trend.tag}`}
                {trend.prediction.lead_days != null && (
                  <span className="ml-2 font-mono text-[12px] text-muted">
                    {trend.prediction.lead_days} days lead time
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {trend.prediction.note}
              </p>
            </div>
          </motion.div>
        )}

        {/* trend chart */}
        <div className="mt-6 rounded-xl border border-edge bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-display text-[15px] font-semibold">
              DE bearing vibration — {tag ?? "…"}
            </h2>
            {trend?.fit && (
              <span className="ml-auto font-mono text-[11px] text-dim">
                +{trend.fit.slope_per_day} mm/s·day · R² {trend.fit.r2}
              </span>
            )}
          </div>
          {trend ? <TrendChart trend={trend} /> : <Skeleton className="h-[280px] w-full" />}
        </div>

        {/* RCA */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-xl border border-edge bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-accent" />
              <h2 className="font-display text-[15px] font-semibold">Causal chain</h2>
              <span className="ml-auto font-mono text-[11px] text-dim">
                from the knowledge graph
              </span>
            </div>
            {!rca ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/6" />
              </div>
            ) : rca.chain.length === 0 ? (
              <p className="text-[13px] text-muted">No recorded events for {tag}.</p>
            ) : (
              <div className="relative space-y-0">
                {rca.chain.map((step, i) => (
                  <div key={step.id} className="relative flex gap-3 pb-4">
                    {i < rca.chain.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-edge" />
                    )}
                    <span
                      className={cn(
                        "relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-surface",
                        SEVERITY_DOT[step.severity],
                        step.overdue && "animate-pulse"
                      )}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] font-semibold text-fg">
                          {step.key}
                        </span>
                        <span className="text-[11px] text-dim">{step.type}</span>
                        {step.date && (
                          <span className="font-mono text-[11px] text-dim">{step.date}</span>
                        )}
                        {step.overdue && <Badge variant="warning">OVERDUE</Badge>}
                      </div>
                      {step.title && (
                        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                          {step.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* root cause */}
            <div className="rounded-xl border border-edge bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-danger" />
                <h2 className="font-display text-[15px] font-semibold">Root cause</h2>
              </div>
              {!rca ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <p className="text-[13.5px] leading-relaxed text-fg">
                    {rca.root_cause ?? "No failure recorded for this equipment."}
                  </p>
                  {rca.narrative && (
                    <div className="mt-3 border-t border-edge pt-3">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                        <Sparkles className="h-3 w-3 text-accent" />
                        AI narrative
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-muted">
                        {rca.narrative}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* regulation gaps + CAPAs */}
            {rca && (rca.regulation_gaps.length > 0 || rca.corrective_actions.length > 0) && (
              <div className="rounded-xl border border-edge bg-surface p-5">
                {rca.regulation_gaps.length > 0 && (
                  <>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                      Regulations breached
                    </h3>
                    <div className="mb-4 space-y-1.5">
                      {rca.regulation_gaps.map((gap) => (
                        <div key={gap.regulation} className="text-[12.5px]">
                          <span className="font-medium text-warning">{gap.regulation}</span>
                          <span className="text-dim"> · {gap.clause}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {rca.corrective_actions.length > 0 && (
                  <>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                      Corrective actions
                    </h3>
                    <div className="space-y-1.5">
                      {rca.corrective_actions.map((capa) => (
                        <div key={capa.key} className="flex items-center gap-2 text-[12.5px]">
                          <span className="font-mono font-medium text-success">{capa.key}</span>
                          <span className="truncate text-muted">{capa.title}</span>
                          {capa.status && (
                            <span className="ml-auto shrink-0 text-[11px] text-dim">
                              {capa.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
