"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, EyeOff, Maximize, ServerCrash, Sparkles } from "lucide-react";
import type { GraphData, GraphNode, IngestStatus } from "@/lib/types";
import { fetchGraph, fetchIngestStatus } from "@/lib/api";
import { searchNodes, countByType, nHopNeighborhood } from "@/lib/graph-utils";
import GraphCanvas from "@/components/graph/GraphCanvas";
import SearchBar from "@/components/graph/SearchBar";
import Legend from "@/components/graph/Legend";
import NodeDetail from "@/components/graph/NodeDetail";
import StatsBar from "@/components/graph/StatsBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function KnowledgeGraphPage() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(
    new Set(["Document", "Person"])
  );
  const [goldenMode, setGoldenMode] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  // Load graph data
  useEffect(() => {
    Promise.all([
      fetchGraph().catch(() => null),
      fetchIngestStatus().catch(() => null),
    ]).then(([g, s]) => {
      if (g) {
        setGraph(g);
        setStatus(s);
        setLoading(false);
      } else {
        setError(
          "Could not load graph. Make sure the FastAPI backend is running: uvicorn backend.api.main:app --reload"
        );
        setLoading(false);
      }
    });
  }, []);

  // Type counts for legend
  const typeCounts = useMemo(
    () => (graph ? countByType(graph.nodes) : {}),
    [graph]
  );

  // Visible counts
  const visibleCounts = useMemo(() => {
    if (!graph) return { nodes: 0, edges: 0 };
    const goldenSet = goldenMode
      ? nHopNeighborhood("Equipment:P-101", graph.edges)
      : null;

    const visibleNodes = graph.nodes.filter((n) =>
      goldenMode ? goldenSet!.has(n.id) : !hiddenTypes.has(n.type)
    );
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = graph.edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
    return { nodes: visibleNodes.length, edges: visibleEdges.length };
  }, [graph, hiddenTypes, goldenMode]);

  // Selected node object
  const selectedNode = useMemo<GraphNode | null>(
    () => graph?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph, selectedNodeId]
  );

  // Toggle type visibility
  const handleToggleType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Toggle golden thread
  const handleGoldenToggle = useCallback(() => {
    setGoldenMode((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          setSelectedNodeId("Equipment:P-101");
          setFocusNodeId("Equipment:P-101");
        }, 300);
      }
      return next;
    });
  }, []);

  // Toggle documents visibility
  const handleDocsToggle = useCallback(() => {
    setShowDocs((prev) => {
      const next = !prev;
      setHiddenTypes((h) => {
        const updated = new Set(h);
        if (next) updated.delete("Document");
        else updated.add("Document");
        return updated;
      });
      return next;
    });
  }, []);

  // Search handler
  const handleSearch = useCallback(
    (query: string) => {
      if (!graph) return;
      const hit = searchNodes(graph.nodes, query);
      if (hit) {
        setHiddenTypes((prev) => {
          const next = new Set(prev);
          next.delete(hit.type);
          return next;
        });
        setSelectedNodeId(hit.id);
        setFocusNodeId(hit.id);
      }
    },
    [graph]
  );

  // Navigate to node (from NodeDetail)
  const handleNavigate = useCallback(
    (nodeId: string) => {
      if (!graph) return;
      const node = graph.nodes.find((n) => n.id === nodeId);
      if (node) {
        if (!goldenMode) {
          setHiddenTypes((prev) => {
            const next = new Set(prev);
            next.delete(node.type);
            return next;
          });
        }
        setSelectedNodeId(nodeId);
        setFocusNodeId(nodeId);
      }
    },
    [graph, goldenMode]
  );

  // Fit view
  const handleFit = useCallback(() => {
    setFocusNodeId(null);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-edge bg-surface px-4 py-2.5">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-36" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading knowledge graph…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border border-edge bg-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-danger/25 bg-danger/10">
            <ServerCrash className="h-5 w-5 text-danger" />
          </div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Backend unreachable
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{error}</p>
          <code className="mt-4 block rounded-lg border border-edge bg-bg p-3 font-mono text-[12px] text-accent">
            uvicorn backend.api.main:app --reload
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* toolbar */}
      <div className="z-10 flex flex-wrap items-center gap-2 border-b border-edge bg-surface px-4 py-2.5">
        <SearchBar onSearch={handleSearch} />

        <Button
          variant="golden"
          size="sm"
          onClick={handleGoldenToggle}
          className={goldenMode ? "active" : ""}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Golden Thread (P-101)
        </Button>

        <Button variant="secondary" size="sm" onClick={handleDocsToggle}>
          {showDocs ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {showDocs ? "Hide" : "Show"} documents
        </Button>

        <Button variant="secondary" size="sm" onClick={handleFit}>
          <Maximize className="h-3.5 w-3.5" />
          Fit
        </Button>

        <div className="ml-auto">
          <StatsBar
            status={status}
            visibleNodes={visibleCounts.nodes}
            totalNodes={graph.nodes.length}
            visibleEdges={visibleCounts.edges}
            totalEdges={graph.edges.length}
            goldenMode={goldenMode}
          />
        </div>
      </div>

      {/* canvas + inspector */}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 bg-bg-secondary">
          <GraphCanvas
            graph={graph}
            hiddenTypes={hiddenTypes}
            goldenMode={goldenMode}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            focusNodeId={focusNodeId}
          />
        </div>

        <aside className="panel-transition flex w-[320px] shrink-0 flex-col border-l border-edge bg-surface max-lg:hidden">
          <div className="max-h-[45%] overflow-y-auto border-b border-edge p-3">
            <Legend
              typeCounts={typeCounts}
              hiddenTypes={hiddenTypes}
              onToggleType={handleToggleType}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
              Inspector
            </h3>
            <NodeDetail
              node={selectedNode}
              edges={graph.edges}
              allNodes={graph.nodes}
              onNavigate={handleNavigate}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
