import Link from "next/link";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ink-1)] text-white shadow-[0_12px_32px_rgba(17,24,39,0.14)]">
        <Trophy className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-lg font-semibold tracking-tight text-[var(--ink-1)]">
          Traction Royale
        </span>
        <span className="block text-xs uppercase tracking-[0.22em] text-[var(--ink-3)]">
          Know when they sign up.
        </span>
      </span>
    </Link>
  );
}
