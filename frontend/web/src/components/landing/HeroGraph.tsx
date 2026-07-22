"use client";

import { motion } from "framer-motion";

/**
 * Animated rendition of the real P-101 "golden thread" from the corpus:
 * the failure chain AssetAtlas connects across inspections, work orders, emails,
 * incident records and regulations. Handcrafted SVG — no stock art.
 */

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  r?: number;
  ring?: "gold" | "warn";
}

const NODES: Node[] = [
  { id: "p101", label: "P-101", x: 360, y: 215, color: "#e8b33d", r: 14, ring: "gold" },
  { id: "insp1", label: "INSP-2026-0412", x: 208, y: 112, color: "#f0b45f" },
  { id: "insp2", label: "INSP-2026-0615", x: 228, y: 272, color: "#f16a6a" },
  { id: "email", label: "field email", x: 316, y: 84, color: "#98a1b3" },
  { id: "wo", label: "WO-2026-0625", x: 478, y: 92, color: "#3ecf8e" },
  { id: "fr", label: "FR-2026-0625", x: 556, y: 178, color: "#f16a6a" },
  { id: "inc", label: "INC-2026-07", x: 636, y: 104, color: "#ff7597" },
  { id: "ncr", label: "NCR-2026-014", x: 578, y: 296, color: "#ff9950" },
  { id: "capa", label: "CAPA-2026-009", x: 652, y: 362, color: "#67e0d2" },
  { id: "reg", label: "Factories Act 1948", x: 424, y: 356, color: "#b0d94e" },
  { id: "p102", label: "P-102", x: 152, y: 348, color: "#4da3ff", r: 9 },
  { id: "p205", label: "P-205", x: 92, y: 196, color: "#4da3ff", r: 9, ring: "warn" },
];

interface Edge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

const EDGES: Edge[] = [
  { from: "p101", to: "insp1", label: "INSPECTED_BY" },
  { from: "p101", to: "insp2" },
  { from: "email", to: "p101" },
  { from: "p101", to: "wo", label: "HAS_WORKORDER" },
  { from: "p101", to: "fr", label: "HAS_FAILURE" },
  { from: "fr", to: "inc" },
  { from: "ncr", to: "p101" },
  { from: "ncr", to: "capa", label: "ADDRESSED_BY" },
  { from: "p101", to: "reg", label: "GOVERNED_BY" },
  { from: "p101", to: "p102", dashed: true },
  { from: "p101", to: "p205", label: "SAME_CLASS_AS", dashed: true },
];

const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));

export default function HeroGraph() {
  return (
    <div className="glow-accent relative overflow-hidden rounded-2xl border border-edge bg-surface">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-edge bg-raised/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-edge-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-edge-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-edge-strong" />
        <span className="ml-2 font-mono text-[11px] text-dim">
          knowledge-graph · Deccan Refinery — Unit 2
        </span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-golden/30 bg-golden/10 px-2 py-0.5 text-[10px] font-medium text-golden sm:flex">
          ⭑ Golden Thread
        </span>
      </div>

      <div className="grid-bg absolute inset-x-0 bottom-0 top-10 opacity-60" />

      <svg viewBox="0 0 720 430" className="relative w-full" role="img" aria-label="Knowledge graph of the P-101 failure chain">
        {/* edges */}
        {EDGES.map((e, i) => {
          const a = nodeById[e.from];
          const b = nodeById[e.to];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={`${e.from}-${e.to}`}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.dashed ? "rgba(77,163,255,0.45)" : "rgba(93,102,117,0.5)"}
                strokeWidth={e.dashed ? 1.6 : 1.2}
                strokeDasharray={e.dashed ? "5 5" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease: "easeOut" }}
              />
              {e.label && (
                <motion.text
                  x={mx}
                  y={my - 6}
                  textAnchor="middle"
                  className="fill-[#5d6675] font-mono"
                  fontSize="8.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.12 }}
                >
                  {e.label}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {NODES.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.15 + i * 0.07,
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            {n.ring === "gold" && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={22}
                fill="none"
                stroke="#e8b33d"
                strokeOpacity={0.35}
                animate={{ r: [20, 26, 20], strokeOpacity: [0.35, 0.1, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {n.ring === "warn" && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={15}
                fill="none"
                stroke="#f0b45f"
                strokeOpacity={0.5}
                animate={{ r: [13, 18, 13], strokeOpacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <circle cx={n.x} cy={n.y} r={n.r ?? 7} fill={n.color} />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r ?? 7}
              fill="none"
              stroke="#0a0b0f"
              strokeWidth="1.5"
            />
            <text
              x={n.x}
              y={n.y + (n.r ?? 7) + 14}
              textAnchor="middle"
              fontSize="10"
              className="font-mono"
              fill={n.id === "p101" ? "#e8b33d" : "#98a1b3"}
              fontWeight={n.id === "p101" ? 600 : 400}
            >
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* callouts */}
      <motion.div
        className="absolute left-4 top-16 rounded-lg border border-danger/30 bg-[#1a1114]/90 px-2.5 py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        <div className="font-mono text-[10px] font-medium text-danger">
          INSP-2026-0615 · OVERDUE
        </div>
        <div className="text-[10px] text-muted">inspector reassigned, never rebooked</div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 rounded-lg border border-warning/30 bg-[#191510]/90 px-2.5 py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <div className="font-mono text-[10px] font-medium text-warning">
          P-205 · vibration rising
        </div>
        <div className="text-[10px] text-muted">same class as P-101 — warned early</div>
      </motion.div>
    </div>
  );
}
