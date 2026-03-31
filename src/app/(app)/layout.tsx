import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { requireAuthenticatedUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { buttonClasses } from "@/components/ui/button";

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
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink-1)]">
              Dashboard
            </Link>
            <form action={signOutAction}>
              <button type="submit" className={buttonClasses({ size: "sm", variant: "ghost" })}>
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-shell py-6">
        {children}
      </main>
    </div>
  );
}
