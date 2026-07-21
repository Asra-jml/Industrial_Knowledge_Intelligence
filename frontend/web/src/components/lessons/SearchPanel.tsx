"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="overflow-hidden border-edge bg-surface shadow-lg transition-all duration-300 hover:border-edge-strong">
      <CardContent className="space-y-5 p-6">
        {/* Small label */}
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" />
          AI Incident Analysis
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAnalyze();
              }
            }}
            placeholder="Describe an equipment failure, audit finding or operational incident..."
            className="h-12 flex-1 rounded-lg"
          />

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="h-12 min-w-[170px] gap-2 rounded-lg"
          >
            <Search className="h-4 w-4" />

            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-xs leading-5 text-muted">
          Enter equipment failures, near misses, audit observations or quality
          issues. The AI compares them with historical lessons learned and
          recommends preventive actions.
        </p>
      </CardContent>
    </Card>
  );
}