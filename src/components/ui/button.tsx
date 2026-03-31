import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function buttonClasses({
  className,
  size = "md",
  variant = "primary",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-10 px-4 text-sm",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-12 px-6 text-base",
    variant === "primary" &&
      "bg-[var(--ink-1)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-[var(--accent-strong)]",
    variant === "secondary" &&
      "border border-[var(--line)] bg-white/90 text-[var(--ink-1)] hover:border-[var(--line-strong)] hover:bg-white",
    variant === "ghost" &&
      "text-[var(--ink-2)] hover:bg-white/80 hover:text-[var(--ink-1)]",
    variant === "danger" &&
      "bg-[var(--rose)] text-white shadow-[0_1px_2px_rgba(225,29,72,0.12)] hover:bg-rose-700",
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ className, size, variant })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
