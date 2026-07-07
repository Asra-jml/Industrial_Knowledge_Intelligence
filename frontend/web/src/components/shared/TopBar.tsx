"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Menu, Search, X } from "lucide-react";
import { fetchIngestStatus } from "@/lib/api";
import type { IngestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { BrandMark, NAV_ITEMS, SidebarNav } from "@/components/shared/Sidebar";

export default function TopBar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchIngestStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <>
      <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-edge bg-surface px-4">
        {/* mobile nav trigger */}
        <button
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.04] hover:text-fg lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* breadcrumb */}
        <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/"
            className="hidden font-display font-semibold tracking-tight text-muted transition-colors hover:text-fg sm:block"
          >
            IKI
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 text-dim sm:block" />
          <span className="truncate font-medium text-fg">
            {current?.name ?? "Overview"}
          </span>
          {current && (
            <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-dim">
              {current.module}
            </span>
          )}
        </nav>

        <div className="flex-1" />

        {/* search (visual affordance) */}
        <button className="hidden h-8 w-64 items-center gap-2 rounded-lg border border-edge bg-bg px-3 text-[13px] text-dim transition-colors hover:border-edge-strong md:flex">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search assets, records…</span>
          <Kbd>⌘K</Kbd>
        </button>

        {/* pipeline status */}
        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex",
            status?.ingested
              ? "border-success/25 bg-success/10 text-success"
              : "border-edge bg-raised text-dim"
          )}
          title={
            status?.ingested
              ? `Pipeline ${status.pipeline_version} · ${status.documents} documents`
              : "Backend offline"
          }
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status?.ingested ? "bg-success" : "bg-dim"
            )}
          />
          {status?.ingested
            ? `${status.nodes} nodes · ${status.edges} edges`
            : "offline"}
        </div>

        <button
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-raised font-display text-[12px] font-semibold text-accent">
          AD
        </span>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-edge bg-surface lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex h-14 items-center justify-between border-b border-edge px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <BrandMark />
                  <span className="font-display text-[15px] font-semibold">IKI</span>
                </Link>
                <button
                  className="rounded-lg p-1.5 text-muted hover:text-fg"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
