import { cn } from "@/lib/utils";

export function FormLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-2 block text-sm font-semibold text-[var(--ink-1)]", className)}>
      {children}
    </label>
  );
}
