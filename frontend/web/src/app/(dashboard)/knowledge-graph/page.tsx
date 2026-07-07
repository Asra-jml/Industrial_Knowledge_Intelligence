"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Eye, EyeOff, Maximize } from "lucide-react";
import type { GraphData, GraphNode, IngestStatus } from "@/lib/types";
import { fetchGraph, fetchIngestStatus } from "@/lib/api";
import { searchNodes, countByType, nHopNeighborhood } from "@/lib/graph-utils";
import GraphCanvas from "@/components/graph/GraphCanvas";
import SearchBar from "@/components/graph/SearchBar";
import Legend from "@/components/graph/Legend";
import NodeDetail from "@/components/graph/NodeDetail";
import StatsBar from "@/components/graph/StatsBar";

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
    () =>
      graph?.nodes.find((n) => n.id === selectedNodeId) ?? null,
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
        // Ensure the type is visible
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
    // Reset zoom/pan will be handled by canvas
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--text-muted)] text-sm">
            Loading knowledge graph…
          </p>
        </div>
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="glass-card p-8 max-w-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,93,93,0.1)] flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-[var(--danger)]">
            Connection Error
          </h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            {error || "Failed to load the knowledge graph."}
          </p>
          <code className="block text-[12px] bg-[var(--bg)] p-3 rounded-lg text-[var(--accent)]">
            uvicorn backend.api.main:app --reload
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2.5 bg-[var(--panel)] border-b border-[var(--border)] flex-wrap z-10">
        <h1 className="text-[15px] font-semibold mr-1 flex items-center gap-1.5">
          <span className="text-[var(--accent)]">IKI</span>
          <span className="text-[var(--text)]">Knowledge Graph</span>
        </h1>

        <SearchBar onSearch={handleSearch} />

        <button
          onClick={handleGoldenToggle}
          className={`golden-btn px-3 py-1.5 rounded-lg text-[13px] flex items-center gap-1.5 ${
            goldenMode ? "active" : ""
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Golden Thread (P-101)
        </button>

        <button
          onClick={handleDocsToggle}
          className="px-3 py-1.5 rounded-lg text-[13px] bg-[#223052] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
        >
          {showDocs ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {showDocs ? "Hide" : "Show"} Documents
        </button>

        <button
          onClick={handleFit}
          className="px-3 py-1.5 rounded-lg text-[13px] bg-[#223052] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
        >
          <Maximize className="w-3.5 h-3.5" />
          Fit
        </button>

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
      </header>

      {/* Main content */}
      <main className="flex-1 flex min-h-0">
        {/* Graph canvas */}
        <div className="flex-1 min-w-0">
          <GraphCanvas
            graph={graph}
            hiddenTypes={hiddenTypes}
            goldenMode={goldenMode}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            focusNodeId={focusNodeId}
          />
        </div>

        {/* Side panel */}
        <aside className="w-[320px] bg-[var(--panel)] border-l border-[var(--border)] flex flex-col min-h-0 panel-transition">
          {/* Legend */}
          <div className="p-3 border-b border-[var(--border)] overflow-y-auto max-h-[45%]">
            <Legend
              typeCounts={typeCounts}
              hiddenTypes={hiddenTypes}
              onToggleType={handleToggleType}
            />
          </div>

          {/* Node detail */}
          <div className="flex-1 p-3 overflow-y-auto">
            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
              Details
            </h3>
            <NodeDetail
              node={selectedNode}
              edges={graph.edges}
              allNodes={graph.nodes}
              onNavigate={handleNavigate}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
