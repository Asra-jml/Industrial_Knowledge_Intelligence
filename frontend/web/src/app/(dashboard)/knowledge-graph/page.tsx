"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ServerCrash, Sparkles, CheckCircle2, ShieldAlert, Settings2 } from "lucide-react";
import type { GraphData, GraphNode, IngestStatus } from "@/lib/types";
import { fetchGraph, fetchIngestStatus } from "@/lib/api";
import { searchNodes, countByType, nHopNeighborhood } from "@/lib/graph-utils";
import GraphCanvas from "@/components/graph/GraphCanvas";
import SmartSearchBar from "@/components/graph/SmartSearchBar";
import Legend from "@/components/graph/Legend";
import NodeInspector from "@/components/graph/NodeInspector";
import FilterPanel from "@/components/graph/FilterPanel";
import GraphAnalyticsWidget from "@/components/graph/GraphAnalyticsWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "framer-motion";

export default function KnowledgeGraphPage() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(
    new Set(["Document", "Person"])
  );
  const [goldenMode, setGoldenMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);

  // Load graph data (+ honor ?focus=Node:id deep links from other modules)
  useEffect(() => {
    Promise.all([
      fetchGraph().catch(() => null),
      fetchIngestStatus().catch(() => null),
    ]).then(([g, s]) => {
      if (g) {
        setGraph(g);
        setStatus(s);
        setLoading(false);
        const focus = new URLSearchParams(window.location.search).get("focus");
        const hit = focus ? g.nodes.find((n) => n.id === focus) : null;
        if (hit) {
          setHiddenTypes((prev) => {
            const next = new Set(prev);
            next.delete(hit.type);
            return next;
          });
          setSelectedNodeId(hit.id);
          setFocusNodeId(hit.id);
        }
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
    setGoldenMode((prev) => !prev);
    setSelectedNodeId(null);
    setFocusNodeId(null);
  }, []);

  // Search logic
  const handleSearch = useCallback(
    (query: string) => {
      if (!graph) return;
      const q = query.trim();
      if (!q) {
        setFocusNodeId(null);
        return;
      }
      const results = searchNodes(graph.nodes, q);
      if (results.length > 0) {
        const top = results[0];
        if (!goldenMode) {
          setHiddenTypes((prev) => {
            const next = new Set(prev);
            next.delete(top.type);
            return next;
          });
        }
        setSelectedNodeId(top.id);
        setFocusNodeId(top.id);
      }
    },
    [graph, goldenMode]
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-[#071321]">
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-blue-200/50">Loading digital twin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-[#071321]">
        <div className="max-w-lg rounded-xl border border-white/10 bg-[#0A111A]/80 backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
            <ServerCrash className="h-5 w-5 text-red-400" />
          </div>
          <h2 className="font-display text-lg font-semibold text-white">
            Backend unreachable
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative bg-[#071321]">
      
      {/* Top Command Header */}
      <div className="h-16 border-b border-white/5 bg-[#0A111A]/90 backdrop-blur-xl flex items-center justify-between px-6 z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setFilterOpen(!filterOpen)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
            <span className="font-display font-semibold text-white tracking-wide">Digital Twin Explorer</span>
          </div>
          
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider text-emerald-100/60">Plant Health</span>
              <span className="text-xs font-mono font-bold text-emerald-400">97%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] uppercase tracking-wider text-blue-100/60">Critical Assets</span>
              <span className="text-xs font-mono font-bold text-blue-400">14</span>
            </div>
          </div>
        </div>

        <SmartSearchBar onSearch={handleSearch} />
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Filter Panel */}
        <FilterPanel 
          isOpen={filterOpen} 
          setIsOpen={setFilterOpen} 
          hiddenTypes={hiddenTypes} 
          onToggleType={handleToggleType} 
        />

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#071321]">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <GraphCanvas
            graph={graph}
            hiddenTypes={hiddenTypes}
            goldenMode={goldenMode}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            focusNodeId={focusNodeId}
          />

          {/* Floating Analytics Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <GraphAnalyticsWidget />
          </div>

          {/* Legend Bottom Left */}
          <div className="absolute bottom-6 left-6 z-10 bg-[#0A111A]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
            <Legend typeCounts={typeCounts} hiddenTypes={hiddenTypes} onToggleType={handleToggleType} />
          </div>
        </div>

        {/* Right Node Inspector */}
        <AnimatePresence>
          {selectedNode && (
            <div className="shrink-0 z-20 h-full">
              <NodeInspector 
                node={selectedNode} 
                onClose={() => setSelectedNodeId(null)} 
                onGoldenThread={handleGoldenToggle}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
