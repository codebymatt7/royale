import { Logo } from "@/components/ui/logo";
import { StatusBanner } from "@/components/ui/status-banner";

export function AuthShell({
  children,
  description,
  message,
  status,
  title,
}: {
  children: React.ReactNode;
  description: string;
  message?: string;
  status?: string;
  title: string;
}) {
  return (
    <main className="container-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-1)] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">{description}</p>
        </div>
        <StatusBanner
          className="mt-4"
          message={message}
          tone={status === "error" ? "error" : status === "success" ? "success" : "info"}
        />
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
