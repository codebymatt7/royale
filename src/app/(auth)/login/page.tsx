import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthButton } from "@/components/auth/oauth-button";
import { FormLabel } from "@/components/ui/form-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/lib/actions/auth";
import { env } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      description="Jump back into your dashboard, finish any missing connections, and track movement across your category boards."
      message={params.message}
      status={params.status}
      title="Log in"
    >
      <>
        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" placeholder="founder@startup.com" required />
          </div>
          <div>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" placeholder="••••••••" required />
          </div>
          <SubmitButton className="w-full" pendingLabel="Logging in...">
            Log in
          </SubmitButton>
        </form>

        {env.enableGoogleOAuth ? (
          <div className="mt-4">
            <OAuthButton />
          </div>
        ) : null}

        <p className="mt-6 text-sm text-[var(--ink-2)]">
          No account yet?{" "}
          <Link href="/signup" className="font-semibold text-[var(--accent)]">
            Create one
          </Link>
          .
        </p>
      </>
    </AuthShell>
  );
}
