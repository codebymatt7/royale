import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBanner({
  tone = "info",
  message,
  className,
}: {
  tone?: "info" | "success" | "error";
  message?: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  const Icon = tone === "error" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
        tone === "error" &&
          "border-rose-200 bg-rose-50/90 text-rose-800",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50/90 text-emerald-800",
        tone === "info" &&
          "border-blue-200 bg-blue-50/90 text-blue-800",
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
