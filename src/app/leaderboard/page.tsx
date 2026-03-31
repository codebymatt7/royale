import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/db/queries";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="container-shell flex items-center justify-between py-3">
          <Logo />
          <Link href="/login" className={buttonClasses({ size: "sm", variant: "secondary" })}>
            Log in
          </Link>
        </div>
      </header>

      <main className="container-shell py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="font-display text-xl font-semibold">Leaderboard</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            Apps ranked by total users
          </p>

          {leaderboard.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-sm text-[var(--ink-3)]">No apps yet. Be the first!</p>
              <Link href="/signup" className={buttonClasses({ size: "sm", className: "mt-4" })}>
                Sign up
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {leaderboard.map((app, i) => (
                <div
                  key={app.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white px-4 py-3"
                >
                  {/* Rank */}
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-amber-100 text-amber-700"
                      : i === 1
                        ? "bg-gray-100 text-gray-600"
                        : i === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-[var(--surface-1)] text-[var(--ink-3)]"
                  }`}>
                    {i + 1}
                  </span>

                  {/* Logo placeholder */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-1)] text-sm font-bold text-[var(--ink-3)]">
                    {app.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--ink-1)]">
                      {app.name}
                    </p>
                    {app.bio && (
                      <p className="truncate text-xs text-[var(--ink-2)]">{app.bio}</p>
                    )}
                    {(app.instagram || app.tiktok || app.xHandle) && (
                      <div className="mt-0.5 flex gap-2 text-xs text-[var(--ink-3)]">
                        {app.instagram && (
                          <a
                            href={`https://instagram.com/${app.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--ink-2)]"
                          >
                            @{app.instagram}
                          </a>
                        )}
                        {app.tiktok && (
                          <a
                            href={`https://tiktok.com/@${app.tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--ink-2)]"
                          >
                            TikTok
                          </a>
                        )}
                        {app.xHandle && (
                          <a
                            href={`https://x.com/${app.xHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--ink-2)]"
                          >
                            X
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User count */}
                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--ink-1)]">
                    <Users className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                    {app.totalUsers.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
