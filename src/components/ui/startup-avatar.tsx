import { cn, getInitials } from "@/lib/utils";

export function StartupAvatar({
  className,
  logoUrl,
  name,
  size = "lg",
}: {
  className?: string;
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,_rgba(15,118,110,0.14),_rgba(37,99,235,0.12))] text-[var(--ink-1)] shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
        size === "sm" && "h-12 w-12 rounded-2xl text-sm",
        size === "md" && "h-16 w-16 text-base",
        size === "lg" && "h-20 w-20 text-xl",
        size === "xl" && "h-24 w-24 text-2xl",
        className,
      )}
    >
      {logoUrl ? (
        <>
          {/* Plain img avoids next/image remote config requirements for user-provided urls. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
        </>
      ) : (
        <span className="font-display font-semibold tracking-tight">{getInitials(name)}</span>
      )}
    </div>
  );
}
