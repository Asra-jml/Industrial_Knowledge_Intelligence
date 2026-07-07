"use client";

import type { IngestStatus } from "@/lib/types";
import {
  Database,
  FileText,
  GitBranch,
  Layers,
  Workflow,
} from "lucide-react";

interface StatsBarProps {
  status: IngestStatus | null;
  visibleNodes: number;
  totalNodes: number;
  visibleEdges: number;
  totalEdges: number;
  goldenMode: boolean;
}

export default function StatsBar({
  status,
  visibleNodes,
  totalNodes,
  visibleEdges,
  totalEdges,
  goldenMode,
}: StatsBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="stat-badge flex items-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5" />
        <span>
          {visibleNodes}/{totalNodes} nodes
        </span>
      </div>
      <div className="stat-badge flex items-center gap-1.5">
        <Workflow className="w-3.5 h-3.5" />
        <span>
          {visibleEdges}/{totalEdges} edges
        </span>
      </div>
      {goldenMode && (
        <div className="stat-badge !border-[rgba(255,210,31,0.3)] !text-[#ffd479] !bg-[rgba(255,210,31,0.08)]">
          ⭑ GOLDEN THREAD
        </div>
      )}
      {status?.ingested && (
        <>
          <div className="stat-badge flex items-center gap-1.5 opacity-70">
            <FileText className="w-3.5 h-3.5" />
            <span>{status.documents} docs</span>
          </div>
          <div className="stat-badge flex items-center gap-1.5 opacity-70">
            <Layers className="w-3.5 h-3.5" />
            <span>{status.chunks} chunks</span>
          </div>
          <div className="stat-badge flex items-center gap-1.5 opacity-70">
            <Database className="w-3.5 h-3.5" />
            <span>v{status.pipeline_version}</span>
          </div>
        </>
      )}
    </div>
  );
}
