"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Clock,
  FileText,
  Loader2,
  MessagesSquare,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { askCopilot, fetchCopilotSuggestions } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import CitationCard from "./CitationCard";
import ConfidenceMeter from "./ConfidenceMeter";

/* ------------------------------------------------------------------ */
/* Loading dots                                                        */
/* ------------------------------------------------------------------ */

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (q: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-1 flex-col items-center justify-center px-4 py-12"
    >
      {/* Hero icon */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.07]">
          <MessagesSquare className="h-9 w-9 text-accent" />
        </div>
        <motion.div
          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/15"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
        </motion.div>
      </div>

      <h2 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        Ask the plant anything
      </h2>
      <p className="mt-2 max-w-md text-center text-[14px] leading-relaxed text-muted">
        The IKI Expert Copilot searches across manuals, work orders, inspections,
        emails and regulations to give you cited, confident answers.
      </p>

      {/* Suggested queries */}
      {suggestions.length > 0 && (
        <div className="mt-8 w-full max-w-xl">
          <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
            Try asking
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.slice(0, 6).map((q) => (
              <button
                key={q}
                onClick={() => onSelect(q)}
                className="group rounded-lg border border-edge bg-surface px-3 py-2 text-left text-[13px] text-muted transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/[0.04] hover:text-fg"
              >
                <Sparkles className="mr-1.5 inline h-3 w-3 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Message bubble                                                      */
/* ------------------------------------------------------------------ */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-edge bg-raised"
            : "border-accent/25 bg-accent/10"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-muted" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-accent" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "min-w-0 max-w-[85%] sm:max-w-[75%]",
          isUser ? "text-right" : "text-left"
        )}
      >
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
            isUser
              ? "rounded-tr-md bg-accent text-[#06070a]"
              : "rounded-tl-md border border-edge bg-surface text-fg"
          )}
        >
          {/* Render answer with markdown-like formatting */}
          <div className="whitespace-pre-wrap [&_strong]:font-semibold">
            {message.content}
          </div>
        </div>

        {/* Assistant metadata */}
        {!isUser && (
          <div className="mt-2 space-y-2">
            {/* Confidence */}
            {message.confidence != null && (
              <ConfidenceMeter value={message.confidence} className="max-w-xs" />
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-dim">
              {message.sources_used != null && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {message.sources_used} sources
                </span>
              )}
              {message.latency_ms != null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {message.latency_ms < 1000
                    ? `${message.latency_ms}ms`
                    : `${(message.latency_ms / 1000).toFixed(1)}s`}
                </span>
              )}
            </div>

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
                  Sources
                </div>
                {message.citations.map((cit, i) => (
                  <CitationCard key={cit.chunk_id} citation={cit} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main chat component                                                 */
/* ------------------------------------------------------------------ */

export default function CopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load suggestions on mount
  useEffect(() => {
    fetchCopilotSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // Auto-resize textarea back
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        const result = await askCopilot(trimmed);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.answer,
          citations: result.citations,
          confidence: result.confidence,
          sources_used: result.sources_used,
          latency_ms: result.latency_ms,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong. Please check that the backend is running."}`,
          timestamp: Date.now(),
          confidence: 0,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background grid */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6"
      >
        {messages.length === 0 && !isLoading ? (
          <EmptyState
            suggestions={suggestions}
            onSelect={(q) => sendMessage(q)}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="rounded-2xl rounded-tl-md border border-edge bg-surface px-4 py-3">
                  <div className="flex items-center gap-2 text-[13px] text-muted">
                    <Zap className="h-3.5 w-3.5 text-accent" />
                    Searching the knowledge base
                    <ThinkingDots />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative border-t border-edge bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-end gap-2 rounded-xl border border-edge bg-bg p-2 transition-colors focus-within:border-accent/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about equipment, maintenance, inspections, compliance…"
              rows={1}
              disabled={isLoading}
              className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-fg placeholder:text-dim focus:outline-none disabled:opacity-50"
            />
            <Button
              size="icon"
              variant={input.trim() ? "default" : "secondary"}
              disabled={!input.trim() || isLoading}
              onClick={() => sendMessage(input)}
              className="h-9 w-9 shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-dim">
            <span>
              Press <kbd className="rounded border border-edge bg-raised px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to send · <kbd className="rounded border border-edge bg-raised px-1 py-0.5 font-mono text-[9px]">Shift+Enter</kbd> for new line
            </span>
            <span>Powered by IKI RAG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
