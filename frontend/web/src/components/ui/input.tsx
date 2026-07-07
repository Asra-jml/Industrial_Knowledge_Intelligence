import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full rounded-lg border border-edge bg-bg px-3 text-sm text-fg placeholder:text-dim transition-colors focus-visible:border-accent focus-visible:outline-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
