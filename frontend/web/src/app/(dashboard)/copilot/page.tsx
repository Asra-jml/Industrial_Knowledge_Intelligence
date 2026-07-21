"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUp,
  BookOpenText,
  FileText,
  Gauge,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { askCopilot, fetchSuggestions } from "@/lib/api";
import { focusNodeIdFor } from "@/lib/graph-utils";
import type { Citation, CopilotResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Turn {
  question: string;
  response?: CopilotResponse;
  error?: string;
}

const FALLBACK_SUGGESTIONS = [
  "What's the status of P-101?",
  "Why did P-101 fail on 2026-06-25?",
  "Which inspections are overdue?",
  "Is P-205 at risk of the same failure as P-101?",
];

function confidenceVariant(confidence: number) {
  if (confidence >= 0.75) return "success" as const;
  if (confidence >= 0.5) return "warning" as const;
  return "default" as const;
}

/** Render [n] citation markers as accent superscripts. */
function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[\d{1,2}\])/g);
  return (
    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-fg">
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d{1,2})\]$/);
        if (m) {
          return (
            <sup key={i} className="mx-0.5 font-mono text-[10px] font-semibold text-accent">
              [{m[1]}]
            </sup>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  const focusId = focusNodeIdFor(citation);
  return (
    <div className="rounded-lg border border-edge bg-bg p-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold text-accent">
          [{citation.ref}]
        </span>
        <FileText className="h-3 w-3 text-dim" />
        <span className="truncate font-mono text-[11px] text-muted" title={citation.doc_id}>
          {citation.doc_id}
          {citation.page ? ` · p.${citation.page}` : ""}
        </span>
        <Link
          href={
            focusId
              ? `/knowledge-graph?focus=${encodeURIComponent(focusId)}`
              : "/knowledge-graph"
          }
          className="ml-auto shrink-0 text-[11px] font-medium text-accent hover:text-accent-hover"
        >
          graph →
        </Link>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
        {citation.snippet}
      </p>
      {citation.equipment_tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {citation.equipment_tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CopilotPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSuggestions().then(setSuggestions).catch(() => undefined);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setInput("");
      setBusy(true);
      setTurns((prev) => [...prev, { question: q }]);
      try {
        const history = turns
          .filter((t) => t.response)
          .map((t) => ({ question: t.question, answer: t.response!.answer }));
        const response = await askCopilot(q, history);
        setTurns((prev) =>
          prev.map((t, i) => (i === prev.length - 1 ? { ...t, response } : t))
        );
      } catch {
        setTurns((prev) =>
          prev.map((t, i) =>
            i === prev.length - 1
              ? { ...t, error: "Backend unreachable — is uvicorn running on :8000?" }
              : t
          )
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, turns]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        {turns.length === 0 ? (
          /* empty state */
          <div className="relative flex h-full flex-col items-center justify-center px-6">
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
            <motion.div
              className="relative w-full max-w-xl text-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                <MessagesSquare className="h-5 w-5 text-accent" />
              </span>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Ask the plant anything
              </h1>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                Answers are grounded in 8,050 indexed passages across manuals,
                work orders, inspections, emails and regulations — every claim cited.
              </p>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {suggestions.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-edge bg-surface px-3.5 py-2.5 text-left text-[13px] text-muted transition-all hover:border-accent/30 hover:text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* conversation */
          <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
            {turns.map((turn, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-br-sm border border-accent/20 bg-accent/[0.07] px-4 py-2.5 text-[14px] text-fg">
                    {turn.question}
                  </div>
                </div>

                {turn.error ? (
                  <div className="rounded-xl border border-danger/25 bg-danger/[0.06] p-4 text-[13px] text-danger">
                    {turn.error}
                  </div>
                ) : !turn.response ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-xl border border-edge bg-surface p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant={confidenceVariant(turn.response.confidence)}>
                        <Gauge className="h-3 w-3" />
                        {Math.round(turn.response.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant={turn.response.mode === "llm" ? "accent" : "outline"}>
                        <Sparkles className="h-3 w-3" />
                        {turn.response.mode === "llm" ? "AI synthesis" : "extractive"}
                      </Badge>
                      <span className="ml-auto font-mono text-[11px] text-dim">
                        {(turn.response.latency_ms / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <AnswerText text={turn.response.answer} />
                    {turn.response.citations.length > 0 && (
                      <div className="mt-4 border-t border-edge pt-3">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                          <BookOpenText className="h-3 w-3" />
                          Sources ({turn.response.citations.length})
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {turn.response.citations.map((c) => (
                            <CitationCard key={c.ref} citation={c} />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-edge bg-surface px-6 py-4">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about equipment, inspections, regulations…"
            className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-edge bg-bg px-4 py-2.5 text-[14px] text-fg placeholder:text-dim focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className={cn(
              "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl transition-all",
              busy || !input.trim()
                ? "cursor-not-allowed border border-edge bg-raised text-dim"
                : "bg-accent text-[#06070a] hover:bg-accent-hover"
            )}
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-dim">
          Grounded in the plant corpus — answers cite their sources.
        </p>
      </div>
    </div>
  );
}
