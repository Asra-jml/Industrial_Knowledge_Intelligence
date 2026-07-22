"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Network,
  MessagesSquare,
  Wrench,
  ShieldCheck,
  Lightbulb,
  Factory,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  module: string;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Knowledge Graph", href: "/knowledge-graph", icon: Network, module: "F1" },
  { name: "Expert Copilot", href: "/copilot", icon: MessagesSquare, module: "F2" },
  { name: "Maintenance & RCA", href: "/maintenance", icon: Wrench, module: "F3" },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck, module: "F4" },
  { name: "Lessons Learned", href: "/lessons", icon: Lightbulb, module: "F5" },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg border border-accent/25 bg-accent/10",
        className
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="3" r="1.6" fill="var(--accent)" />
        <circle cx="3" cy="12" r="1.6" fill="var(--accent)" opacity="0.75" />
        <circle cx="13" cy="12" r="1.6" fill="var(--accent)" opacity="0.75" />
        <path
          d="M8 3L3 12M8 3l5 9M3 12h10"
          stroke="var(--accent)"
          strokeWidth="0.9"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
        Modules
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "text-fg"
                : "text-dim hover:bg-white/[0.03] hover:text-muted"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg border border-accent/20 bg-accent/[0.07]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon
              className={cn(
                "relative h-4 w-4 transition-colors",
                isActive ? "text-accent" : "text-dim group-hover:text-muted"
              )}
            />
            <span className="relative flex-1 font-medium">{item.name}</span>
            <span
              className={cn(
                "relative rounded px-1.5 py-0.5 font-mono text-[10px]",
                isActive ? "bg-accent/15 text-accent" : "bg-raised text-dim"
              )}
            >
              {item.module}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-edge bg-surface lg:flex">
      {/* brand */}
      <div className="flex h-14 items-center border-b border-edge px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          <div className="leading-none">
            <div className="font-display text-[15px] font-semibold tracking-tight">
              AssetAtlas
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-wide text-dim">
              INDUSTRIAL INTELLIGENCE
            </div>
          </div>
        </Link>
      </div>

      {/* workspace */}
      <div className="border-b border-edge p-3">
        <button className="flex w-full items-center gap-2.5 rounded-lg border border-edge bg-raised px-3 py-2 text-left transition-colors hover:border-edge-strong">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
            <Factory className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[13px] font-medium text-fg">
              Deccan Refinery
            </span>
            <span className="block text-[11px] text-dim">
              Visakhapatnam · Unit&nbsp;2
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-dim" />
        </button>
      </div>

      <SidebarNav />

      {/* profile */}
      <div className="border-t border-edge p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-raised font-display text-[12px] font-semibold text-accent">
            AD
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[13px] font-medium text-fg">Aditya</span>
            <span className="block text-[11px] text-dim">Knowledge Engineer</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-success" title="Online" />
        </div>
      </div>
    </aside>
  );
}
