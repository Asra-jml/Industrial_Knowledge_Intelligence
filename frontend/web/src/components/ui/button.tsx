import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "golden";
type Size = "sm" | "default" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  default:
    "bg-accent text-[#06070a] font-semibold hover:bg-accent-hover shadow-[0_0_0_1px_rgba(77,163,255,0.2),0_8px_24px_-12px_rgba(77,163,255,0.5)]",
  secondary:
    "bg-raised text-fg border border-edge hover:border-edge-strong hover:bg-[#1a1f2b]",
  outline:
    "border border-edge bg-transparent text-muted hover:text-fg hover:border-edge-strong",
  ghost: "text-muted hover:text-fg hover:bg-white/[0.04]",
  golden: "golden-btn",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  default: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-6 text-[15px] rounded-xl gap-2",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
