"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Lightbulb,
  MessagesSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/shared/Sidebar";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Reveal";
import HeroGraph from "@/components/landing/HeroGraph";
import FlowPipeline from "@/components/landing/FlowPipeline";

interface Module {
  code: string;
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  status: "live" | "soon";
}

const MODULES: Module[] = [
  {
    code: "F1",
    name: "Knowledge Graph",
    href: "/knowledge-graph",
    icon: Network,
    description:
      "Ingests P&IDs, manuals, registers and emails into one unified graph — every asset record connected and queryable.",
    status: "live",
  },
  {
    code: "F2",
    name: "Expert Copilot",
    href: "/copilot",
    icon: MessagesSquare,
    description:
      "Conversational answers across the full corpus, with citations to source documents and confidence scores.",
    status: "soon",
  },
  {
    code: "F3",
    name: "Maintenance & RCA",
    href: "/maintenance",
    icon: Wrench,
    description:
      "Predictive alerts from vibration trends, plus root-cause analysis walked directly out of the graph.",
    status: "soon",
  },
  {
    code: "F4",
    name: "Compliance Intelligence",
    href: "/compliance",
    icon: ShieldCheck,
    description:
      "Regulations mapped to assets and procedures. Gaps flagged automatically, evidence packs on demand.",
    status: "soon",
  },
  {
    code: "F5",
    name: "Lessons Learned",
    href: "/lessons",
    icon: Lightbulb,
    description:
      "Systemic failure patterns clustered from internal incidents and external industry databases.",
    status: "soon",
  },
];

const METRICS = [
  { value: "100%", label: "golden-thread recall", sub: "target was 90%" },
  { value: "12 s", label: "incremental re-ingest", sub: "incl. Neo4j upsert" },
  { value: "12", label: "document types on P-101", sub: "one connected node" },
  { value: "11/11", label: "acceptance checks", sub: "verified, repeatable" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* ---------------------------------------------------------- nav */}
      <header className="sticky top-0 z-50 border-b border-edge bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              IKI
            </span>
          </Link>
          <div className="hidden items-center gap-5 text-[13px] font-medium text-muted md:flex">
            <a href="#modules" className="transition-colors hover:text-fg">
              Modules
            </a>
            <a href="#platform" className="transition-colors hover:text-fg">
              Platform
            </a>
            <a href="#metrics" className="transition-colors hover:text-fg">
              Metrics
            </a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/adivish31/iki-corpus"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-fg sm:flex"
            >
              Corpus
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href="/knowledge-graph">
              <Button size="sm">Open dashboard</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ------------------------------------------------------- hero */}
        <section className="relative overflow-hidden">
          <div className="grid-bg pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pb-28 lg:pt-24">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="accent" className="mb-6">
                  <Sparkles className="h-3 w-3" />
                  ET AI Hackathon 2026 · Problem 8
                </Badge>
              </motion.div>

              <motion.h1
                className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                The operations brain for industrial plants
              </motion.h1>

              <motion.p
                className="mt-5 max-w-md text-[16px] leading-relaxed text-muted"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
              >
                IKI ingests the drawings, work orders, inspections, emails and
                regulations scattered across a dozen systems — and connects the
                dots your best engineer can&apos;t.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
              >
                <Link href="/knowledge-graph">
                  <Button size="lg">
                    Explore Knowledge Graph
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/copilot">
                  <Button size="lg" variant="secondary">
                    Try Expert Copilot
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12px] text-dim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span>475 documents</span>
                <span className="text-edge-strong">·</span>
                <span>664 nodes / 589 edges</span>
                <span className="text-edge-strong">·</span>
                <span>9 file formats</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <HeroGraph />
            </motion.div>
          </div>
        </section>

        {/* -------------------------------------------------- problem */}
        <section className="border-y border-edge bg-surface/50">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
            {[
              {
                value: "35%",
                label: "of engineers' time is spent searching for information across 7–12 disconnected systems",
              },
              {
                value: "18–22%",
                label: "of unplanned downtime in heavy industry traces back to fragmented knowledge",
              },
              {
                value: "25%",
                label: "of experienced industrial engineers retire within a decade — their context undocumented",
              },
            ].map((stat, i) => (
              <Reveal key={stat.value} delay={i * 0.08}>
                <div className="border-l-2 border-accent/40 pl-4">
                  <div className="font-display text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------- modules */}
        <section id="modules" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="max-w-xl">
            <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
              Five modules
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              One graph. Every answer.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Every module reads the same shared knowledge layer — so the copilot
              cites the inspection the RCA engine blamed, and compliance flags
              the gap both of them saw.
            </p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <StaggerItem key={mod.code}>
                  <Link
                    href={mod.href}
                    className="group relative block h-full overflow-hidden rounded-xl border border-edge bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/30"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/[0.06] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                          <Icon className="h-4 w-4 text-accent" />
                        </span>
                        <div className="flex items-center gap-2">
                          {mod.status === "live" ? (
                            <Badge variant="success">Live</Badge>
                          ) : (
                            <Badge>In development</Badge>
                          )}
                          <span className="font-mono text-[11px] text-dim">
                            {mod.code}
                          </span>
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-[16px] font-semibold tracking-tight">
                        {mod.name}
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                        {mod.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-accent opacity-0 transition-all duration-200 group-hover:opacity-100">
                        Open module
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}

            {/* golden thread feature tile */}
            <StaggerItem>
              <Link
                href="/knowledge-graph"
                className="group relative block h-full overflow-hidden rounded-xl border border-golden/25 bg-golden/[0.04] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-golden/50"
              >
                <div className="relative">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-golden/30 bg-golden/10">
                    <Sparkles className="h-4 w-4 text-golden" />
                  </span>
                  <h3 className="mt-4 font-display text-[16px] font-semibold tracking-tight text-golden">
                    The Golden Thread
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                    Watch the P-101 failure chain assemble live — the overdue
                    inspection, the ignored email, the regulation breached. One
                    click.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-golden">
                    Run the demo
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </section>

        {/* ------------------------------------------------- platform */}
        <section id="platform" className="border-y border-edge bg-surface/50">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="max-w-xl">
              <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
                How it works
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                From scanned drawing to cited answer
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                One idempotent pipeline parses every format, extracts entities
                against a formal ontology, and rebuilds the graph in seconds
                when a new record lands.
              </p>
            </Reveal>

            <div className="mt-14">
              <FlowPipeline />
            </div>

            <Reveal delay={0.15} className="mt-14">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-dim">
                  Shared layer
                </span>
                {["documents.jsonl", "corpus_index.jsonl", "graph.json", "Neo4j Aura"].map(
                  (artifact) => (
                    <code
                      key={artifact}
                      className="rounded-md border border-edge bg-bg px-2 py-1 font-mono text-[12px] text-muted"
                    >
                      {artifact}
                    </code>
                  )
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------- metrics */}
        <section id="metrics" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="max-w-xl">
            <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
              Verified, not vibes
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Acceptance-tested on a real corpus
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Every number below is asserted by an automated verification
              scorecard against 1.14 GB of real and synthesized plant records.
            </p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-px overflow-hidden rounded-xl border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <StaggerItem key={metric.label} className="bg-surface">
                <div className="p-6">
                  <div className="font-display text-3xl font-semibold tracking-tight text-accent">
                    {metric.value}
                  </div>
                  <div className="mt-1.5 text-[13px] font-medium text-fg">
                    {metric.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-dim">
                    {metric.sub}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* ------------------------------------------------------ cta */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-edge bg-surface px-8 py-14 text-center">
              <div className="grid-bg pointer-events-none absolute inset-0" />
              <div className="relative">
                <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight">
                  See the failure chain nobody connected
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
                  Pump P-101 failed on 2026-06-25. Every warning signal existed.
                  IKI connects them before the trip.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/knowledge-graph">
                    <Button size="lg">
                      <Sparkles className="h-4 w-4" />
                      Run the Golden Thread demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ------------------------------------------------------ footer */}
      <footer className="border-t border-edge">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <div className="font-display text-[14px] font-semibold">IKI</div>
                <div className="text-[12px] text-dim">
                  Industrial Knowledge Intelligence
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[13px] text-muted">
              <Link href="/knowledge-graph" className="transition-colors hover:text-fg">
                Dashboard
              </Link>
              <a
                href="https://github.com/adivish31/iki-corpus"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                Corpus
              </a>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col items-start justify-between gap-2 text-[12px] text-dim sm:flex-row">
            <span>ET AI Hackathon 2026 · Problem 8 · Team of three</span>
            <span className="font-mono">
              Deccan Refinery & Petrochemicals · demo corpus
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
