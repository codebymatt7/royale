import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink-2)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
