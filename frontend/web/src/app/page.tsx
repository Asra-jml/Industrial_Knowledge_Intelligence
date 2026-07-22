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
import HeroImageGallery from "@/components/landing/HeroImageGallery";
import InteractivePipeline from "@/components/landing/InteractivePipeline";
import Waves from "@/components/landing/Waves";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { GlassButton } from "@/components/ui/GlassButton";
import BentoStats from "@/components/landing/BentoStats";
import BentoProblemStats from "@/components/landing/BentoProblemStats";
import StickyFeatureScroll from "@/components/landing/StickyFeatureScroll";
import GoldenThreadFinale from "@/components/landing/GoldenThreadFinale";


const METRICS = [
  { value: "100%", label: "golden-thread recall", sub: "target was 90%" },
  { value: "12 s", label: "incremental re-ingest", sub: "incl. Neo4j upsert" },
  { value: "12", label: "document types on P-101", sub: "one connected node" },
  { value: "11/11", label: "acceptance checks", sub: "verified, repeatable" },
];

const navItems = [
  { name: "Modules", link: "#modules" },
  { name: "Platform", link: "#platform" },
  { name: "Metrics", link: "#metrics" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* ---------------------------------------------------------- nav */}
      <FloatingNav navItems={navItems} />

      <main>
        {/* ------------------------------------------------------- hero */}
        <section className="relative overflow-hidden h-auto min-h-screen pb-20 pt-16 lg:pb-28 lg:pt-24 flex items-center bg-[#050b14]">
          <Waves
            lineColor="rgba(59, 130, 246, 0.3)"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
            className="z-0"
          />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] w-full mt-24">
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
                className="font-display text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.5rem]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                The operations brain for industrial plants
              </motion.h1>

              <motion.p
                className="mt-6 max-w-lg text-lg sm:text-xl leading-relaxed text-muted"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
              >
                AssetAtlas ingests the drawings, work orders, inspections, emails and
                regulations scattered across a dozen systems — and connects the
                dots your best engineer can&apos;t.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
              >
                <GlassButton href="/knowledge-graph" variant="primary" width={240} height={50}>
                  Explore Knowledge Graph
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
                <GlassButton href="/copilot" variant="secondary" width={180} height={50}>
                  Try Expert Copilot
                </GlassButton>
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
              <HeroImageGallery />
            </motion.div>
          </div>
        </section>

        {/* -------------------------------------------------- problem */}
        <BentoProblemStats />

        {/* -------------------------------------------------- modules */}
        <StickyFeatureScroll />

        {/* -------------------------------------------------- finale */}
        <GoldenThreadFinale />

        {/* ------------------------------------------------- platform */}
        <InteractivePipeline />

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

          <BentoStats />
        </section>

        {/* ------------------------------------------------------ cta */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 pt-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#060d18] px-8 py-24 text-center shadow-2xl">
              {/* Soft gradient glow similar to the design */}
              <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[60%] w-[80%] rounded-[100%] bg-gradient-to-b from-white/10 to-transparent blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="mx-auto max-w-xl font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                  Ready to transform your data?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-[14px] sm:text-[15px] text-white/50 leading-relaxed">
                  Join industrial teams worldwide who are transforming fragmented plant records into an intelligent, actionable knowledge graph.
                </p>
                <div className="mt-10 flex justify-center">
                  <GlassButton
                    href="/knowledge-graph"
                    variant="primary"
                    width={200}
                    height={50}
                  >
                    See the Demo
                  </GlassButton>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ------------------------------------------------------ footer */}
      <footer className="relative overflow-hidden pt-4 pb-0">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-24">
          {/* The rounded footer card */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0a111a]/50 p-8 sm:p-12 shadow-xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24">
              
              {/* Left Column: Brand & Description */}
              <div className="max-w-xs">
                <div className="flex items-center gap-2">
                  <BrandMark />
                  <span className="font-display text-lg font-semibold text-white tracking-tight">AssetAtlas</span>
                </div>
                <p className="mt-5 text-[13px] leading-relaxed text-white/50">
                  AssetAtlas empowers industrial teams to transform fragmented plant records into an intelligent knowledge graph — making root cause analysis easier to share, understand, and act on.
                </p>
                
                {/* Social Icons */}
                <div className="mt-6 flex items-center gap-4 text-white/40">
                  <a href="#" className="hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://github.com/adivish31/iki-corpus" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  </a>
                </div>
              </div>

              {/* Right Column: Link Grid (Cleaned up from empty links) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full max-w-2xl">
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-white mb-4">Product</h4>
                  <ul className="space-y-3">
                    <li><Link href="#features" className="text-[13px] text-white/50 hover:text-white transition-colors">Features</Link></li>
                    <li><Link href="/knowledge-graph" className="text-[13px] text-white/50 hover:text-white transition-colors">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-white mb-4">Resources</h4>
                  <ul className="space-y-3">
                    <li><a href="https://github.com/adivish31/iki-corpus" target="_blank" rel="noreferrer" className="text-[13px] text-white/50 hover:text-white transition-colors">Project Corpus</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-white mb-4">Hackathon</h4>
                  <ul className="space-y-3">
                    <li><span className="text-[13px] text-white/50">ET AI Hackathon 2026</span></li>
                    <li><span className="text-[13px] text-white/50">Problem Statement 8</span></li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Bottom row */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[12px] text-white/40">
                © 2026 AssetAtlas. All rights reserved.
              </span>
              <div className="flex items-center gap-6 text-[12px] text-white/40">
                <span className="hover:text-white transition-colors cursor-pointer hover:underline underline-offset-2">Privacy Policy</span>
                <span className="hover:text-white transition-colors cursor-pointer hover:underline underline-offset-2">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Large Watermark text sunken into the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pointer-events-none select-none z-0 translate-y-[32%]">
          <span className="font-display font-black text-transparent text-[16vw] tracking-tighter bg-clip-text bg-gradient-to-t from-white/10 to-transparent leading-none">
            AssetAtlas
          </span>
        </div>
      </footer>
    </div>
  );
}
