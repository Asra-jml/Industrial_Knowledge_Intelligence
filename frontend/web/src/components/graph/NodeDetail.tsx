"use client";

import { NODE_COLORS } from "@/lib/types";
import type { GraphNode, GraphEdge } from "@/lib/types";
import { getNodeEdges } from "@/lib/graph-utils";

interface NodeDetailProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onNavigate: (nodeId: string) => void;
}

export default function NodeDetail({
  node,
  edges,
  allNodes,
  onNavigate,
}: NodeDetailProps) {
  if (!node) {
    return (
      <div className="text-[var(--text-muted)] text-[13px] leading-relaxed">
        <p className="mb-2">Click a node to see its details.</p>
        <p>
          <strong className="text-[var(--accent)]">Tip:</strong> Search{" "}
          <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded text-[12px]">
            P-101
          </code>{" "}
          and press the <span className="text-[#ffd479]">Golden Thread</span>{" "}
          button — the failure chain nobody connected, connected.
        </p>
      </div>
    );
  }

  const nodeEdges = getNodeEdges(node.id, edges);
  const props = Object.entries(node.props || {}).filter(
    ([, v]) => v !== "" && v != null
  );

  return (
    <div className="space-y-4">
      {/* Node header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: NODE_COLORS[node.type] || "#888" }}
          />
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
            {node.type}
          </span>
        </div>
        <p className="text-[var(--accent)] font-semibold text-[14px] break-all leading-tight">
          {node.key}
        </p>
      </div>

      {/* Properties */}
      {props.length > 0 && (
        <div>
          <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
            Properties
          </h4>
          <div className="space-y-0.5">
            {props.map(([key, value]) => (
              <div
                key={key}
                className="flex gap-2 text-[12.5px] py-1 border-b border-[rgba(30,42,69,0.5)]"
              >
                <span className="text-[var(--text-muted)] whitespace-nowrap min-w-[70px]">
                  {key}
                </span>
                <span className="text-[var(--text)] break-all">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
          Relationships ({nodeEdges.length})
        </h4>
        <div className="space-y-1 max-h-[280px] overflow-y-auto">
          {nodeEdges.slice(0, 60).map((e, i) => {
            const otherId = e.source === node.id ? e.target : e.source;
            const dir = e.source === node.id ? "→" : "←";
            const otherNode = allNodes.find((n) => n.id === otherId);
            const otherColor = otherNode
              ? NODE_COLORS[otherNode.type] || "#888"
              : "#888";

            return (
              <div key={i} className="flex items-start gap-1.5 text-[12.5px]">
                <span className="text-[#ffd479] font-semibold whitespace-nowrap">
                  {e.rel}
                </span>
                <span className="text-[var(--text-dim)]">{dir}</span>
                <button
                  onClick={() => onNavigate(otherId)}
                  className="rel-link text-left break-all flex items-center gap-1"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 inline-block"
                    style={{ backgroundColor: otherColor }}
                  />
                  {otherId.split(":").slice(1).join(":")}
                </button>
              </div>
            );
          })}
          {nodeEdges.length > 60 && (
            <p className="text-[var(--text-dim)] text-[11px] italic">
              +{nodeEdges.length - 60} more…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
