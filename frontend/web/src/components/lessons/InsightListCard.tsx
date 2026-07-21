"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InsightListCardProps {
  title: string;
  items: string[];
}

export default function InsightListCard({
  title,
  items,
}: InsightListCardProps) {
  const config = (() => {
    switch (title) {
      case "Root Causes":
        return {
          icon: AlertTriangle,
          color: "#ef4444",
        };

      case "Repeated Risks":
        return {
          icon: RefreshCcw,
          color: "#f59e0b",
        };

      case "Lessons Learned":
        return {
          icon: BookOpen,
          color: "#3b82f6",
        };

      case "Preventive Actions":
        return {
          icon: ShieldCheck,
          color: "#22c55e",
        };

      default:
        return {
          icon: CheckCircle2,
          color: "#06b6d4",
        };
    }
  })();

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-edge-strong">
        <CardHeader className="border-b border-edge bg-raised/40">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{
                background: `${config.color}12`,
                borderColor: `${config.color}30`,
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: config.color }}
              />
            </span>

            <CardTitle className="font-display text-lg">
              {title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted italic">
              No information available.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />

                  <span className="text-sm leading-6 text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}