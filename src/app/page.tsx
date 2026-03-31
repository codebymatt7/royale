import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bell, Users, Code } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="container-shell py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink-1)]">
              Log in
            </Link>
            <Link href="/signup" className={buttonClasses({ size: "sm" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="container-shell px-4 py-12 sm:py-16">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-1)] sm:text-4xl lg:text-5xl">
            Know the moment someone signs up.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-2)] sm:text-base">
            Zero code. Push notifications on your phone every time a new user signs up.
          </p>
          <div className="mt-8">
            <Link href="/signup" className={buttonClasses({ size: "md" })}>
              Start tracking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-12 grid max-w-3xl gap-3 sm:mt-16 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Code className="h-4 w-4" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-[var(--ink-1)]">Zero code</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">
              Set up a Supabase webhook in clicks. No SDK, no keys.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Bell className="h-4 w-4" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-[var(--ink-1)]">Push alerts</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">
              Real push notifications on your phone. Add to home screen.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Users className="h-4 w-4" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-[var(--ink-1)]">Dashboard</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">
              Total users, new today, new this week. Chart your growth.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
