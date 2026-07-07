"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Mail,
  ClipboardList,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Gauge,
  Wrench,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Citation } from "@/lib/types";

const DOC_TYPE_ICONS: Record<string, LucideIcon> = {
  email: Mail,
  work_order: ClipboardList,
  inspection: FileCheck,
  manual: BookOpen,
  regulation: ShieldCheck,
  incident_report: AlertTriangle,
  compliance: Gauge,
  asset_register: Wrench,
};

const DOC_TYPE_COLORS: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  work_order: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  inspection: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  manual: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  regulation: "bg-lime-500/10 text-lime-400 border-lime-500/25",
  incident_report: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  compliance: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  asset_register: "bg-orange-500/10 text-orange-400 border-orange-500/25",
  dataset: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  permit: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  project_doc: "bg-teal-500/10 text-teal-400 border-teal-500/25",
  inventory: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  kg_metadata: "bg-violet-500/10 text-violet-400 border-violet-500/25",
};

function shortDocId(docId: string): string {
  const parts = docId.split("/");
  return parts.length > 1 ? parts.slice(-1)[0] : docId;
}

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = DOC_TYPE_ICONS[citation.doc_type] || FileText;
  const badgeColor = DOC_TYPE_COLORS[citation.doc_type] || "bg-raised text-muted border-edge";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group rounded-lg border border-edge bg-bg/60 transition-colors hover:border-edge-strong"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left"
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
            badgeColor
          )}
        >
          <Icon className="h-3 w-3" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[12px] font-medium text-fg">
            {shortDocId(citation.doc_id)}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-dim">
            <Badge
              variant="default"
              className="px-1.5 py-0 text-[10px]"
            >
              {citation.doc_type.replace(/_/g, " ")}
            </Badge>
            {citation.page != null && (
              <span>p.{citation.page}</span>
            )}
            <span className="font-mono opacity-60">
              {Math.round(citation.score * 100)}% match
            </span>
          </span>
        </span>

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-dim transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-edge px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-muted">
                {citation.snippet || "No preview available."}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-dim">
                <code className="rounded bg-raised px-1.5 py-0.5 font-mono">
                  {citation.chunk_id}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
