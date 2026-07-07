import * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 items-center rounded border border-edge bg-raised px-1.5 font-mono text-[10px] font-medium text-dim",
        className
      )}
      {...props}
    />
  );
}
