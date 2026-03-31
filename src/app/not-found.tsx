import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold">404</h1>
        <p className="mt-2 text-sm text-[var(--ink-2)]">Page not found.</p>
        <div className="mt-4">
          <Link href="/" className={buttonClasses({ size: "sm" })}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
