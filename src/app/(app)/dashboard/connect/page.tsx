import { redirect } from "next/navigation";
import { FormLabel } from "@/components/ui/form-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBanner } from "@/components/ui/status-banner";
import { connectAppAction } from "@/lib/actions/app";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getApp } from "@/lib/db/queries";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const app = await getApp(user.id);
  const params = await searchParams;

  if (app) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-xl font-semibold">Name your app</h1>
      <p className="mt-1 text-sm text-[var(--ink-2)]">
        We&apos;ll show you how to connect in the next step. No keys or credentials needed.
      </p>

      <StatusBanner
        className="mt-4"
        message={params.message}
        tone={params.status === "error" ? "error" : params.status === "success" ? "success" : "info"}
      />

      <form action={connectAppAction} className="mt-6 space-y-4">
        <div>
          <FormLabel>App name</FormLabel>
          <Input name="name" placeholder="My Cool App" required />
        </div>
        <SubmitButton className="w-full" pendingLabel="Creating...">
          Create app
        </SubmitButton>
      </form>
    </div>
  );
}
