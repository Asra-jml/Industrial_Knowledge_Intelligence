"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchPanelProps {
  loading: boolean;
  onAnalyze: (query: string) => void;
}

export default function SearchPanel({
  loading,
  onAnalyze,
}: SearchPanelProps) {
  const [query, setQuery] = useState(
    "Pump P-101 vibration increased to 6.2 mm/s during operation. Temperature is rising and abnormal bearing noise observed. Last inspection was overdue by 15 days."
  );

  const handleAnalyze = () => {
    const value = query.trim();

    if (!value) return;

    onAnalyze(value);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-6 space-y-5">

      <div>
        <h2 className="text-2xl font-semibold text-white">
          Analyze Operational Condition
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Enter an incident report, near-miss observation, audit finding,
          quality issue, or equipment condition to identify historical
          failure patterns and receive AI-generated recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">

        <Input
          className="flex-1"
          placeholder="Example: Pump P-101 vibration increased and bearing temperature is rising..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAnalyze();
            }
          }}
        />

        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="min-w-[150px]"
        >
          <Search className="mr-2 h-4 w-4" />

          {loading ? "Analyzing..." : "Analyze"}
        </Button>

      </div>

    </div>
  );
}