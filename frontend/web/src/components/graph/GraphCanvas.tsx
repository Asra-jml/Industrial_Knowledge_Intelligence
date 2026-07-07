"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { GraphData, GraphNode, GraphEdge } from "@/lib/types";
import { NODE_COLORS, NODE_SIZES, DEFAULT_NODE_SIZE } from "@/lib/types";
import { nHopNeighborhood } from "@/lib/graph-utils";

interface GraphCanvasProps {
  graph: GraphData;
  hiddenTypes: Set<string>;
  goldenMode: boolean;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  focusNodeId: string | null;
}

// We'll use a canvas-based renderer for performance with 600+ nodes
export default function GraphCanvas({
  graph,
  hiddenTypes,
  goldenMode,
  selectedNodeId,
  onSelectNode,
  focusNodeId,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<LayoutNode[]>([]);
  const edgesRef = useRef<LayoutEdge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: LayoutNode | null; offsetX: number; offsetY: number }>({ node: null, offsetX: 0, offsetY: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  interface LayoutNode {
    id: string;
    type: string;
    key: string;
    props: Record<string, unknown>;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    visible: boolean;
    pinned: boolean;
    golden: boolean;
    overdue: boolean;
    isTarget: boolean;
  }

  interface LayoutEdge {
    source: string;
    target: string;
    rel: string;
    visible: boolean;
  }

  // Build layout nodes from graph data
  const buildLayout = useCallback(() => {
    const goldenSet = goldenMode
      ? nHopNeighborhood("Equipment:P-101", graph.edges)
      : null;

    const nodes: LayoutNode[] = graph.nodes.map((n, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2;
      const radius = 300 + Math.random() * 200;
      const visible = goldenMode
        ? goldenSet!.has(n.id)
        : !hiddenTypes.has(n.type);

      return {
        id: n.id,
        type: n.type,
        key: n.key,
        props: n.props || {},
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        size: NODE_SIZES[n.type] || DEFAULT_NODE_SIZE,
        color: NODE_COLORS[n.type] || "#888",
        visible,
        pinned: false,
        golden: goldenMode && n.id === "Equipment:P-101",
        overdue: goldenMode && n.props?.result === "OVERDUE",
        isTarget: n.id === selectedNodeId,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edges: LayoutEdge[] = graph.edges.map((e) => ({
      source: e.source,
      target: e.target,
      rel: e.rel,
      visible:
        (nodeMap.get(e.source)?.visible ?? false) &&
        (nodeMap.get(e.target)?.visible ?? false),
    }));

    return { nodes, edges };
  }, [graph, hiddenTypes, goldenMode, selectedNodeId]);

  // Force simulation step
  const simulate = useCallback((nodes: LayoutNode[], edges: LayoutEdge[]) => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const k = 0.008; // spring constant
    const repulsion = 5000;
    const damping = 0.85;

    // Repulsion between visible nodes
    const visible = nodes.filter((n) => n.visible);
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i];
        const b = visible[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!a.pinned) { a.vx += fx; a.vy += fy; }
        if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
      }
    }

    // Spring attraction along edges
    for (const e of edges) {
      if (!e.visible) continue;
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = k * (dist - 120);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    }

    // Center gravity
    for (const n of visible) {
      if (n.pinned) continue;
      n.vx -= n.x * 0.001;
      n.vy -= n.y * 0.001;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
    }
  }, []);

  // Draw the graph
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pan = panRef.current;
    const zoom = zoomRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
    ctx.scale(zoom, zoom);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Draw edges
    for (const e of edges) {
      if (!e.visible) continue;
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = e.rel === "SAME_CLASS_AS" ? "rgba(77, 163, 255, 0.3)" : "rgba(59, 74, 110, 0.4)";
      ctx.lineWidth = e.rel === "SAME_CLASS_AS" ? 2 : 0.8;
      if (e.rel === "CO_OCCURS_WITH") ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
    }

    // Draw nodes
    for (const n of nodes) {
      if (!n.visible) continue;
      const size = n.golden ? 18 : n.overdue ? 14 : n.isTarget ? n.size + 3 : n.size;
      const color = n.golden ? "#ffd21f" : n.overdue ? "#ff3b3b" : n.color;

      // Glow for selected/golden
      if (n.isTarget || n.golden || n.id === hovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, size + 6, 0, Math.PI * 2);
        ctx.fillStyle = n.golden
          ? "rgba(255, 210, 31, 0.2)"
          : "rgba(77, 163, 255, 0.2)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (n.isTarget || n.golden) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      const label = n.key.length > 20 ? n.key.slice(0, 18) + "…" : n.key;
      ctx.font = `${n.golden ? "600 12px" : "11px"} Inter, system-ui, sans-serif`;
      ctx.fillStyle = n.golden ? "#ffe58a" : n.overdue ? "#ffb3b3" : "#dfe7f5";
      ctx.textAlign = "center";
      ctx.fillText(label, n.x, n.y + size + 14);
    }

    ctx.restore();
  }, [hovered]);

  // Animation loop
  const tick = useCallback(() => {
    simulate(nodesRef.current, edgesRef.current);
    draw();
    animRef.current = requestAnimationFrame(tick);
  }, [simulate, draw]);

  // Initialize
  useEffect(() => {
    const { nodes, edges } = buildLayout();
    nodesRef.current = nodes;
    edgesRef.current = edges;

    // Run initial simulation steps for stability
    for (let i = 0; i < 100; i++) {
      simulate(nodes, edges);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [buildLayout, simulate, tick]);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Focus on a node
  useEffect(() => {
    if (!focusNodeId) return;
    const node = nodesRef.current.find((n) => n.id === focusNodeId);
    if (!node) return;
    panRef.current = { x: -node.x * zoomRef.current, y: -node.y * zoomRef.current };
  }, [focusNodeId]);

  // Mouse interaction handlers
  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2 - panRef.current.x;
    const cy = e.clientY - rect.top - rect.height / 2 - panRef.current.y;
    return { x: cx / zoomRef.current, y: cy / zoomRef.current };
  }, []);

  const findNode = useCallback((wx: number, wy: number) => {
    for (const n of nodesRef.current) {
      if (!n.visible) continue;
      const dx = n.x - wx;
      const dy = n.y - wy;
      const r = (NODE_SIZES[n.type] || DEFAULT_NODE_SIZE) + 4;
      if (dx * dx + dy * dy < r * r) return n;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = getWorldPos(e);
    const node = findNode(x, y);
    if (node) {
      dragRef.current = { node, offsetX: x - node.x, offsetY: y - node.y };
      node.pinned = true;
    } else {
      isPanningRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [getWorldPos, findNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.node) {
      const { x, y } = getWorldPos(e);
      dragRef.current.node.x = x - dragRef.current.offsetX;
      dragRef.current.node.y = y - dragRef.current.offsetY;
    } else if (isPanningRef.current) {
      panRef.current.x += e.clientX - lastMouseRef.current.x;
      panRef.current.y += e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const { x, y } = getWorldPos(e);
      const node = findNode(x, y);
      setHovered(node?.id || null);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = node ? "pointer" : "grab";
    }
  }, [getWorldPos, findNode]);

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.node) {
      dragRef.current.node.pinned = false;
      onSelectNode(dragRef.current.node.id);
      dragRef.current = { node: null, offsetX: 0, offsetY: 0 };
    }
    isPanningRef.current = false;
  }, [onSelectNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    zoomRef.current = Math.max(0.1, Math.min(5, zoomRef.current * factor));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = getWorldPos(e);
    const node = findNode(x, y);
    if (node) onSelectNode(node.id);
  }, [getWorldPos, findNode, onSelectNode]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />
    </div>
  );
}
