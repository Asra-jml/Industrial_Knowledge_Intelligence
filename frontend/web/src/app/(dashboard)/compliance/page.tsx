"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  FileCheck,
  FileWarning,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { fetchComplianceNarrative, fetchComplianceRegister } from "@/lib/api";
import type { ComplianceRegister, ComplianceRequirement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGE: Record<string, "success" | "warning" | "default"> = {
  COMPLIANT: "success",
  GAP: "warning",
  OPEN: "default",
};

const ROLE_LABEL: Record<string, string> = {
  cited: "Cited evidence",
  corrective_action: "Corrective action",
  procedure: "Procedure",
  regulation_text: "Regulation text",
};

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger" | "success" | "muted";
}) {
  return (
    <div className="rounded-xl border border-edge bg-surface p-4">
      <div
        className={cn(
          "font-display text-2xl font-semibold",
          tone === "danger" && "text-warning",
          tone === "success" && "text-success",
          (!tone || tone === "muted") && "text-fg"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-muted">{label}</div>
    </div>
  );
}

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceRegister | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ComplianceRequirement | null>(null);

  useEffect(() => {
    fetchComplianceRegister()
      .then((register) => {
        setData(register);
        setSelected(register.requirements.find((r) => r.status === "GAP") ?? null);
      })
      .catch(() =>
        setError("Backend unreachable — start it with: uvicorn backend.api.main:app --reload")
      );
    fetchComplianceNarrative().then(setNarrative).catch(() => undefined);
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
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data ? (
            <>
              <SummaryTile label="Requirements tracked" value={data.summary.total} />
              <SummaryTile label="Compliant" value={data.summary.compliant} tone="success" />
              <SummaryTile label="Gaps detected" value={data.summary.gaps} tone="danger" />
              <SummaryTile label="Open items" value={data.summary.open} />
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[76px]" />)
          )}
        </div>

        {/* AI gap narrative */}
        {narrative && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/[0.05] p-4"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                AI summary for leadership
              </div>
              <p className="text-[13px] leading-relaxed text-fg">{narrative}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* register table */}
          <div className="overflow-hidden rounded-xl border border-edge bg-surface">
            <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
              <ScrollText className="h-4 w-4 text-accent" />
              <h2 className="font-display text-[14px] font-semibold">
                Compliance register
              </h2>
              <span className="ml-auto font-mono text-[11px] text-dim">
                compliance_register.csv × knowledge graph
              </span>
            </div>
            {!data ? (
              <div className="space-y-2 p-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-edge">
                {data.requirements.map((req) => (
                  <button
                    key={req.req_id}
                    onClick={() => setSelected(req)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      selected?.req_id === req.req_id
                        ? "bg-accent/[0.06]"
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    <span className="w-16 shrink-0 font-mono text-[12px] text-muted">
                      {req.req_id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-fg">
                        {req.regulation}
                        <span className="text-dim"> · {req.clause}</span>
                      </span>
                      <span className="block truncate text-[12px] text-muted">
                        {req.requirement}
                      </span>
                    </span>
                    <span className="hidden shrink-0 rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">
                      {req.applies_to}
                    </span>
                    <Badge variant={STATUS_BADGE[req.status] ?? "default"}>
                      {req.status}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-dim" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* evidence pack */}
          <div className="h-fit rounded-xl border border-edge bg-surface lg:sticky lg:top-4">
            <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
              <FileCheck className="h-4 w-4 text-accent" />
              <h2 className="font-display text-[14px] font-semibold">Evidence pack</h2>
            </div>
            {!selected ? (
              <p className="p-4 text-[13px] text-muted">
                Select a requirement to assemble its audit evidence.
              </p>
            ) : (
              <motion.div
                key={selected.req_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-4"
              >
                <div className="flex items-start gap-2">
                  {selected.status === "GAP" ? (
                    <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  )}
                  <div>
                    <div className="text-[13px] font-semibold text-fg">
                      {selected.req_id} — {selected.regulation}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      {selected.requirement}
                    </p>
                    {selected.gap_note && (
                      <p className="mt-2 border-l-2 border-warning/50 pl-2.5 text-[12.5px] leading-relaxed text-warning">
                        {selected.gap_note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {selected.evidence.length === 0 && (
                    <p className="text-[12px] text-dim">No linked records.</p>
                  )}
                  {selected.evidence.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-edge bg-bg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {item.in_graph ? (
                          <Link
                            href={`/knowledge-graph?focus=${encodeURIComponent(item.id)}`}
                            className="font-mono text-[12px] font-medium text-accent hover:text-accent-hover hover:underline"
                          >
                            {item.key.length > 34 ? `…${item.key.slice(-30)}` : item.key}
                          </Link>
                        ) : (
                          <span className="font-mono text-[12px] font-medium text-muted">
                            {item.key.length > 34 ? `…${item.key.slice(-30)}` : item.key}
                          </span>
                        )}
                        {item.date && (
                          <span className="font-mono text-[10px] text-dim">{item.date}</span>
                        )}
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-dim">
                          {ROLE_LABEL[item.role] ?? item.role}
                        </span>
                      </div>
                      {item.title && (
                        <p className="mt-0.5 truncate text-[12px] text-muted">{item.title}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Link
                  href={
                    /^[A-Z]{1,3}-\d{2,4}$/.test(selected.applies_to)
                      ? `/knowledge-graph?focus=${encodeURIComponent(`Equipment:${selected.applies_to}`)}`
                      : "/knowledge-graph"
                  }
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent-hover"
                >
                  Trace {selected.applies_to} in the knowledge graph
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
