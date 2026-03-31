import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthButton } from "@/components/auth/oauth-button";
import { FormLabel } from "@/components/ui/form-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUpAction } from "@/lib/actions/auth";
import { env } from "@/lib/env";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      description="Create an account, set up the startup profile, choose the first metrics to connect, and enter the live traction loop."
      message={params.message}
      status={params.status}
      title="Create your account"
    >
      <>
        <form action={signUpAction} className="mt-6 space-y-4">
          <div>
            <FormLabel>Your name</FormLabel>
            <Input name="displayName" placeholder="Alex Morgan" required />
          </div>
          <div>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" placeholder="founder@startup.com" required />
          </div>
          <div>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" placeholder="Create a secure password" required />
          </div>
          <SubmitButton className="w-full" pendingLabel="Creating account...">
            Sign up
          </SubmitButton>
        </form>

        {env.enableGoogleOAuth ? (
          <div className="mt-4">
            <OAuthButton />
          </div>
        ) : null}

        <p className="mt-6 text-sm text-[var(--ink-2)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)]">
            Log in
          </Link>
          .
        </p>
      </>
    </AuthShell>
  );
}
