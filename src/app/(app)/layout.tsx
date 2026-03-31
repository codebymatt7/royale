import Link from "next/link";
import { Trophy } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="container-shell flex items-center justify-between py-3">
          <Logo href="/dashboard" />
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink-1)]"
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
        </div>
      </header>
      <main className="container-shell py-5">
        {children}
      </main>
    </div>
  );
}
