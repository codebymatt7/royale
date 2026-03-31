import Link from "next/link";
import { ArrowRight, Bell, Users, Code } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="container-shell py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink-1)]">
              Log in
            </Link>
            <Link href="/signup" className={buttonClasses({ size: "sm" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="container-shell py-16">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink-1)] sm:text-4xl lg:text-5xl">
            Know the moment someone signs up.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--ink-2)]">
            One line of code. No API keys. Get push notifications on your phone every time a new user signs up.
          </p>
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--ink-1)] px-5 py-3">
            <code className="text-sm text-emerald-400">
              fetch(&quot;royale.app/api/track/YOUR_TOKEN&quot;, {"{"} method: &quot;POST&quot; {"}"})
            </code>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonClasses({ size: "md" })}>
              Start tracking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Code className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-[var(--ink-1)]">One line</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">
              Drop a single fetch call into your signup flow. No SDKs, no keys.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Bell className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-[var(--ink-1)]">Push alerts</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">
              Real push notifications on your phone. Add to home screen, get pinged.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-[var(--ink-1)]">Dashboard</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">
              Total users, new today, new this week. The numbers that matter.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
