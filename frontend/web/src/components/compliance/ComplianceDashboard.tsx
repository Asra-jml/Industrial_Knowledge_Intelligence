"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  FileWarning,
  Wrench,
  Scale,
  Package,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchComplianceDashboard,
  fetchComplianceGaps,
  fetchEvidencePack,
  fetchNCRs,
} from "@/lib/api";
import type {
  ComplianceDashboardData,
  ComplianceEntry,
  EvidencePack,
  NCRRecord,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const step = (ts: number) => {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}</>;
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  if (upper === "GAP")
    return (
      <Badge variant="danger" className="gap-1">
        <AlertTriangle className="h-3 w-3" /> GAP
      </Badge>
    );
  if (upper === "COMPLIANT")
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" /> Compliant
      </Badge>
    );
  if (upper === "OPEN")
    return (
      <Badge variant="warning" className="gap-1">
        <Clock className="h-3 w-3" /> Open
      </Badge>
    );
  return <Badge variant="default">{status}</Badge>;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity.toLowerCase() === "major")
    return <Badge variant="danger">{severity}</Badge>;
  return <Badge variant="warning">{severity}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-edge-strong">
        <div
          className="absolute inset-0 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"
          style={{ background: `radial-gradient(ellipse at 30% 30%, ${color}, transparent 70%)` }}
        />
        <CardContent className="relative flex items-center gap-4 p-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
            style={{
              background: `${color}12`,
              borderColor: `${color}30`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </span>
          <div>
            <div className="font-display text-3xl font-bold tracking-tight" style={{ color }}>
              <AnimatedCounter value={value} />
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-muted">{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Regulation chart colors                                             */
/* ------------------------------------------------------------------ */

const CHART_COLORS = {
  gap: "#f16a6a",
  compliant: "#3ecf8e",
  open: "#f0b45f",
};

/* ------------------------------------------------------------------ */
/* Evidence Pack Panel                                                 */
/* ------------------------------------------------------------------ */

function EvidencePanel({
  pack,
  onClose,
}: {
  pack: EvidencePack;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-edge bg-surface shadow-2xl lg:max-w-2xl"
    >
      {/* header */}
      <div className="flex items-center justify-between border-b border-edge px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <Package className="h-5 w-5 text-accent" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Evidence Pack — {pack.equipment_tag}
            </h2>
            <p className="text-[12px] text-muted">
              {pack.compliance_entries.length} requirements · {pack.ncrs.length} NCRs · {pack.capas.length} CAPAs
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* AI narrative */}
        {pack.narrative && (
          <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-accent">
                AI Compliance Summary
              </span>
            </div>
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted">
              {pack.narrative}
            </p>
          </div>
        )}

        {/* compliance entries */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
            <Scale className="h-3.5 w-3.5" /> Regulatory Requirements
          </h3>
          <div className="space-y-2">
            {pack.compliance_entries.map((entry) => (
              <div
                key={entry.req_id}
                className="rounded-lg border border-edge bg-raised p-4 transition-colors hover:border-edge-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono text-accent">{entry.req_id}</code>
                      <StatusBadge status={entry.status} />
                    </div>
                    <div className="mt-1.5 text-[13px] font-medium text-fg">
                      {entry.regulation}
                    </div>
                    <div className="text-[12px] text-muted">{entry.clause}</div>
                    {entry.gap_note && (
                      <p className="mt-2 rounded-md bg-bg px-3 py-2 text-[12px] text-muted">
                        {entry.gap_note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {pack.compliance_entries.length === 0 && (
              <p className="text-[13px] text-dim italic">No compliance entries mapped.</p>
            )}
          </div>
        </div>

        {/* NCR chain */}
        {pack.ncrs.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
              <FileWarning className="h-3.5 w-3.5" /> Non-Conformance Reports
            </h3>
            <div className="space-y-2">
              {pack.ncrs.map((ncr) => (
                <div
                  key={ncr.ncr_id}
                  className="rounded-lg border border-edge bg-raised p-4"
                >
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-danger">{ncr.ncr_id}</code>
                    <SeverityBadge severity={ncr.severity} />
                    <span className="text-[11px] text-dim">{ncr.date_raised}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-fg">{ncr.description}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    <span className="text-dim">Regulation: </span>
                    {ncr.regulation_breached}
                  </p>
                  <p className="text-[12px] text-muted">
                    <span className="text-dim">Procedure: </span>
                    {ncr.procedure_breached}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAPAs */}
        {pack.capas.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
              <Wrench className="h-3.5 w-3.5" /> Corrective & Preventive Actions
            </h3>
            <div className="space-y-2">
              {pack.capas.map((capa) => (
                <div
                  key={capa.capa_id}
                  className="rounded-lg border border-edge bg-raised p-4"
                >
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-success">{capa.capa_id}</code>
                    <Badge variant={capa.status.toLowerCase() === "closed" ? "success" : "warning"}>
                      {capa.status}
                    </Badge>
                    <Badge variant="default">{capa.capa_type}</Badge>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[12px] text-muted">
                      <span className="font-medium text-dim">Root cause: </span>
                      {capa.root_cause}
                    </p>
                    <p className="text-[12px] text-muted">
                      <span className="font-medium text-dim">Corrective: </span>
                      {capa.corrective_action}
                    </p>
                    <p className="text-[12px] text-muted">
                      <span className="font-medium text-dim">Preventive: </span>
                      {capa.preventive_action}
                    </p>
                    <p className="text-[12px] text-dim">
                      Owner: {capa.owner} · Target: {capa.target_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspections */}
        {pack.inspections.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
              <FileText className="h-3.5 w-3.5" /> Linked Inspections
            </h3>
            <div className="space-y-2">
              {pack.inspections.map((insp) => {
                const p = insp.props || {};
                return (
                  <div
                    key={insp.id}
                    className="rounded-lg border border-edge bg-raised p-3"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono text-warning">{insp.key}</code>
                      <Badge
                        variant={
                          String(p.result || "").includes("OVERDUE")
                            ? "danger"
                            : String(p.result || "").includes("PASS")
                            ? "success"
                            : "default"
                        }
                      >
                        {String(p.result || "N/A")}
                      </Badge>
                      <span className="text-[11px] text-dim">{String(p.date || "")}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {String(p.finding || "No findings recorded")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Linked documents */}
        {pack.linked_documents.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
              <FileText className="h-3.5 w-3.5" /> Linked Documents
            </h3>
            <div className="flex flex-wrap gap-2">
              {pack.linked_documents.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-bg px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-edge-strong"
                >
                  <FileText className="h-3 w-3 text-dim" />
                  <span className="max-w-[200px] truncate">{doc.title || doc.doc_id}</span>
                  <Badge variant="default" className="ml-1 text-[9px]">{doc.doc_type}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* NCR → CAPA chain                                                    */
/* ------------------------------------------------------------------ */

function NCRChainRow({ ncr }: { ncr: NCRRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-edge bg-surface transition-colors hover:border-edge-strong">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 border border-danger/20">
          <FileWarning className="h-4 w-4 text-danger" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="text-[12px] font-mono text-fg">{ncr.ncr_id}</code>
            <SeverityBadge severity={ncr.severity} />
            <span className="text-[11px] text-dim">{ncr.date_raised}</span>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">{ncr.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={ncr.status.toLowerCase() === "closed" ? "success" : "warning"}>
            {ncr.status}
          </Badge>
          {open ? (
            <ChevronDown className="h-4 w-4 text-dim" />
          ) : (
            <ChevronRight className="h-4 w-4 text-dim" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-edge px-4 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <span className="text-dim">Equipment: </span>
                  <span className="font-medium text-fg">{ncr.tag}</span>
                </div>
                <div>
                  <span className="text-dim">Raised by: </span>
                  <span className="text-fg">{ncr.raised_by}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-dim">Regulation breached: </span>
                  <span className="text-fg">{ncr.regulation_breached}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-dim">Procedure breached: </span>
                  <span className="text-fg">{ncr.procedure_breached}</span>
                </div>
              </div>

              {/* CAPA link */}
              {ncr.capa && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-3.5 w-3.5 text-success" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                      Linked CAPA
                    </span>
                  </div>
                  <div className="rounded-lg border border-success/20 bg-success/[0.04] p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono text-success">
                        {ncr.capa.capa_id}
                      </code>
                      <Badge variant={ncr.capa.status.toLowerCase() === "closed" ? "success" : "warning"}>
                        {ncr.capa.status}
                      </Badge>
                      <Badge variant="default">{ncr.capa.capa_type}</Badge>
                    </div>
                    <p className="text-[12px] text-muted">
                      <span className="text-dim">Root cause: </span>
                      {ncr.capa.root_cause}
                    </p>
                    <p className="text-[12px] text-muted">
                      <span className="text-dim">Corrective: </span>
                      {ncr.capa.corrective_action}
                    </p>
                    <p className="text-[12px] text-muted">
                      <span className="text-dim">Preventive: </span>
                      {ncr.capa.preventive_action}
                    </p>
                    <p className="text-[11px] text-dim">
                      Owner: {ncr.capa.owner} · Target: {ncr.capa.target_date}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Custom tooltip for charts                                           */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-edge bg-surface px-3 py-2 shadow-xl">
      <p className="text-[12px] font-medium text-fg mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[11px] text-muted">
          <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ background: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export default function ComplianceDashboard() {
  const [dashboard, setDashboard] = useState<ComplianceDashboardData | null>(null);
  const [gaps, setGaps] = useState<ComplianceEntry[]>([]);
  const [ncrs, setNcrs] = useState<NCRRecord[]>([]);
  const [evidencePack, setEvidencePack] = useState<EvidencePack | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gaps" | "ncr" | "register">("gaps");

  // Load data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dash, gapData, ncrData] = await Promise.all([
          fetchComplianceDashboard(),
          fetchComplianceGaps(),
          fetchNCRs(),
        ]);
        setDashboard(dash);
        setGaps(gapData.gaps);
        setNcrs(ncrData.ncrs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openEvidencePack = useCallback(async (tag: string) => {
    setEvidenceLoading(true);
    try {
      const pack = await fetchEvidencePack(tag);
      setEvidencePack(pack);
    } catch (e) {
      console.error("Failed to load evidence pack:", e);
    } finally {
      setEvidenceLoading(false);
    }
  }, []);

  // loading state
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-[14px] text-muted">Loading compliance data…</p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-md rounded-xl border border-danger/30 bg-danger/[0.06] p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-danger" />
          <h2 className="mt-3 font-display text-lg font-semibold text-fg">Connection Error</h2>
          <p className="mt-2 text-[13px] text-muted">{error}</p>
          <p className="mt-4 text-[12px] text-dim">
            Make sure the backend is running: <code className="text-accent">uvicorn backend.api.main:app --reload</code>
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // Prepare chart data
  const regBreakdownData = Object.entries(dashboard.regulation_breakdown).map(
    ([reg, counts]) => ({
      name: reg.length > 25 ? reg.slice(0, 22) + "…" : reg,
      fullName: reg,
      gap: counts.gap,
      compliant: counts.compliant,
      open: counts.open,
    })
  );

  const pieData = [
    { name: "Compliant", value: dashboard.compliant, color: CHART_COLORS.compliant },
    { name: "Gap", value: dashboard.gaps, color: CHART_COLORS.gap },
    { name: "Open", value: dashboard.open, color: CHART_COLORS.open },
  ].filter((d) => d.value > 0);

  return (
    <div className="relative flex-1 overflow-y-auto">
      {/* background pattern */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </span>
            <Badge variant="accent" className="font-mono">F4</Badge>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Quality & Compliance Intelligence
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Every regulation mapped to every asset. Gaps flagged before the audit.
          </p>
        </motion.div>

        {/* stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <StatCard
            icon={FileText}
            label="Total Requirements"
            value={dashboard.total_requirements}
            color="#4da3ff"
            delay={0}
          />
          <StatCard
            icon={AlertTriangle}
            label="Gaps Flagged"
            value={dashboard.gaps}
            color="#f16a6a"
            delay={0.07}
          />
          <StatCard
            icon={CheckCircle2}
            label="Compliant"
            value={dashboard.compliant}
            color="#3ecf8e"
            delay={0.14}
          />
          <StatCard
            icon={Clock}
            label="Open Items"
            value={dashboard.open}
            color="#f0b45f"
            delay={0.21}
          />
        </div>

        {/* charts row */}
        <div className="grid gap-4 lg:grid-cols-5 mb-8">
          {/* pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-[12px] text-muted">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>By Regulation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={regBreakdownData} barCategoryGap="20%">
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#5d6675", fontSize: 10 }}
                      axisLine={{ stroke: "#1d222d" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#5d6675", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="compliant" stackId="a" fill={CHART_COLORS.compliant} radius={[0, 0, 0, 0]} name="Compliant" />
                    <Bar dataKey="gap" stackId="a" fill={CHART_COLORS.gap} radius={[0, 0, 0, 0]} name="Gap" />
                    <Bar dataKey="open" stackId="a" fill={CHART_COLORS.open} radius={[4, 4, 0, 0]} name="Open" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* asset status cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-dim">
            Asset Compliance Status
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboard.asset_status.map((asset) => {
              const hasGap = asset.gap > 0;
              return (
                <Card
                  key={asset.tag}
                  className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                    hasGap
                      ? "border-danger/30 hover:border-danger/50"
                      : "hover:border-edge-strong"
                  }`}
                  onClick={() => openEvidencePack(asset.tag)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-[14px] font-semibold text-fg">
                        {asset.tag}
                      </code>
                      {hasGap ? (
                        <AlertTriangle className="h-4 w-4 text-danger" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      {asset.compliant > 0 && (
                        <Badge variant="success">{asset.compliant} Compliant</Badge>
                      )}
                      {asset.gap > 0 && (
                        <Badge variant="danger">{asset.gap} Gap</Badge>
                      )}
                      {asset.open > 0 && (
                        <Badge variant="warning">{asset.open} Open</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-accent">
                      View evidence pack <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* tabbed section — gaps / NCR chain */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* tab bar */}
          <div className="mb-4 flex items-center gap-1 rounded-lg border border-edge bg-surface p-1">
            {(
              [
                { key: "gaps" as const, label: "Compliance Gaps", count: gaps.length },
                { key: "ncr" as const, label: "NCR → CAPA Chain", count: ncrs.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-md px-4 py-2 text-[13px] font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                {tab.label}
                <span className="ml-2 rounded-full bg-raised px-1.5 py-0.5 text-[10px] font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* gaps table */}
          {activeTab === "gaps" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-edge bg-surface overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-edge bg-raised">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Req ID</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Regulation</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Clause</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Asset</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Status</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">Gap Note</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map((gap, i) => (
                      <tr
                        key={gap.req_id}
                        className="border-b border-edge/50 transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <code className="text-[12px] font-mono text-accent">{gap.req_id}</code>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-fg">{gap.regulation}</td>
                        <td className="px-4 py-3 text-[12px] text-muted">{gap.clause}</td>
                        <td className="px-4 py-3">
                          <code className="text-[12px] font-mono text-fg">{gap.applies_to}</code>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={gap.status} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-[12px] text-muted">
                          {gap.gap_note}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEvidencePack(gap.applies_to)}
                            className="text-[11px]"
                          >
                            Evidence <ArrowRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {gaps.length === 0 && (
                <div className="p-8 text-center text-[14px] text-dim">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
                  No compliance gaps detected — all requirements met.
                </div>
              )}
            </motion.div>
          )}

          {/* NCR → CAPA chain */}
          {activeTab === "ncr" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {ncrs.map((ncr) => (
                <NCRChainRow key={ncr.ncr_id} ncr={ncr} />
              ))}
              {ncrs.length === 0 && (
                <div className="rounded-xl border border-edge bg-surface p-8 text-center text-[14px] text-dim">
                  No non-conformance reports found.
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* evidence pack slide-over */}
      <AnimatePresence>
        {evidencePack && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setEvidencePack(null)}
            />
            <EvidencePanel pack={evidencePack} onClose={() => setEvidencePack(null)} />
          </>
        )}
      </AnimatePresence>

      {/* evidence loading overlay */}
      {evidenceLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-edge bg-surface px-6 py-4 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <span className="text-[14px] text-fg">Loading evidence pack…</span>
          </div>
        </div>
      )}
    </div>
  );
}
