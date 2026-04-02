import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 text-sm text-[var(--ink-1)] outline-none focus:border-[var(--line-strong)]",
      className,
      props.disabled && "cursor-not-allowed opacity-60",
    )}
    {...props}
  />
));

Select.displayName = "Select";
