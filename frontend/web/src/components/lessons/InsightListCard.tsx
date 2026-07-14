"use client";

import {
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";

interface InsightListCardProps {
  title: string;
  items: string[];
}

export default function InsightListCard({
  title,
  items,
}: InsightListCardProps) {

  const getIcon = () => {

    switch (title) {

      case "Root Causes":
        return <AlertTriangle className="h-6 w-6 text-red-400" />;

      case "Repeated Risks":
        return <RefreshCcw className="h-6 w-6 text-yellow-400" />;

      case "Lessons Learned":
        return <BookOpen className="h-6 w-6 text-blue-400" />;

      case "Preventive Actions":
        return <ShieldCheck className="h-6 w-6 text-emerald-400" />;

      default:
        return <CheckCircle2 className="h-6 w-6 text-cyan-400" />;
    }
  };

  return (
    <Card className="border-white/10 bg-zinc-900 p-6">

      <div className="mb-5 flex items-center gap-3">

        {getIcon()}

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

      </div>

      {items.length === 0 ? (

        <p className="text-sm text-zinc-500">
          No information available.
        </p>

      ) : (

        <ul className="space-y-4">

          {items.map((item, index) => (

            <li
              key={index}
              className="flex items-start gap-3"
            >

              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />

              <span className="text-sm leading-6 text-zinc-300">
                {item}
              </span>

            </li>

          ))}

        </ul>

      )}

    </Card>
  );
}