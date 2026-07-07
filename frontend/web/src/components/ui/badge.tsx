import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "accent" | "success" | "warning" | "golden";

const variantClasses: Record<Variant, string> = {
  default: "bg-raised border-edge text-muted",
  outline: "bg-transparent border-edge text-muted",
  accent: "bg-accent/10 border-accent/25 text-accent",
  success: "bg-success/10 border-success/25 text-success",
  warning: "bg-warning/10 border-warning/25 text-warning",
  golden: "bg-golden/10 border-golden/30 text-golden",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
