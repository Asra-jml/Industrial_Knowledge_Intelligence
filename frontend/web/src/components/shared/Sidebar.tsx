"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Network,
  MessageSquare,
  Wrench,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Knowledge Graph",
    href: "/knowledge-graph",
    icon: Network,
    module: "F1",
  },
  {
    name: "Copilot",
    href: "/copilot",
    icon: MessageSquare,
    module: "F2",
  },
  {
    name: "Maintenance & RCA",
    href: "/maintenance",
    icon: Wrench,
    module: "F3",
  },
  {
    name: "Quality & Compliance",
    href: "/compliance",
    icon: ShieldCheck,
    module: "F4",
  },
  {
    name: "Lessons Learned",
    href: "/lessons",
    icon: Lightbulb,
    module: "F5",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--panel)] border-r border-[var(--border)] flex flex-col min-h-0 flex-shrink-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[rgba(77,163,255,0.1)] border border-[rgba(77,163,255,0.2)] flex items-center justify-center text-[var(--accent)] font-bold text-sm group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
            I
          </div>
          <span className="font-semibold text-[15px] tracking-tight">
            IKI Platform
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold px-3 mb-3">
          Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[rgba(77,163,255,0.1)] text-[var(--accent)] font-medium"
                  : "text-[var(--text-dim)] hover:bg-[rgba(77,163,255,0.05)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-[rgba(77,163,255,0.2)] text-[var(--accent)]"
                    : "bg-[var(--bg)] text-[var(--text-muted)]"
                }`}
              >
                {item.module}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
