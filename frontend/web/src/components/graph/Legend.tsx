"use client";

import { NODE_COLORS } from "@/lib/types";

interface LegendProps {
  typeCounts: Record<string, number>;
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
}

export default function Legend({
  typeCounts,
  hiddenTypes,
  onToggleType,
}: LegendProps) {
  const sorted = Object.entries(typeCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="space-y-0.5">
      <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
        Node Types
      </h3>
      {sorted.map(([type, count]) => {
        const hidden = hiddenTypes.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={`legend-item w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all hover:bg-[rgba(77,163,255,0.06)] ${
              hidden ? "opacity-35" : ""
            }`}
          >
            <span
              className="legend-dot"
              style={{ backgroundColor: NODE_COLORS[type] || "#888" }}
            />
            <span className="flex-1 text-left text-[var(--text)]">{type}</span>
            <span className="text-[11px] text-[var(--text-dim)] font-mono">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
