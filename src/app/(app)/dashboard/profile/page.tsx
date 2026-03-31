import { redirect } from "next/navigation";
import { FormLabel } from "@/components/ui/form-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBanner } from "@/components/ui/status-banner";
import { updateProfileAction } from "@/lib/actions/app";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getApp } from "@/lib/db/queries";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const app = await getApp(user.id);
  const params = await searchParams;

  if (!app) {
    redirect("/dashboard/connect");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Edit profile</h1>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          This shows up on the public leaderboard.
        </p>
      </div>

      <StatusBanner
        message={params.message}
        tone={params.status === "error" ? "error" : params.status === "success" ? "success" : "info"}
      />

      <form action={updateProfileAction} className="space-y-4">
        <div>
          <FormLabel>App name</FormLabel>
          <Input name="name" defaultValue={app.name} required />
        </div>

        <div>
          <FormLabel>Bio</FormLabel>
          <Input
            name="bio"
            defaultValue={app.bio ?? ""}
            placeholder="What does your app do? (100 chars max)"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-[var(--ink-3)]">100 characters max</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--ink-1)]">Socials</p>

          <div>
            <FormLabel>Instagram</FormLabel>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--ink-3)]">@</span>
              <Input
                name="instagram"
                defaultValue={app.instagram ?? ""}
                placeholder="yourapp"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <FormLabel>TikTok</FormLabel>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--ink-3)]">@</span>
              <Input
                name="tiktok"
                defaultValue={app.tiktok ?? ""}
                placeholder="yourapp"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <FormLabel>X (Twitter)</FormLabel>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--ink-3)]">@</span>
              <Input
                name="x_handle"
                defaultValue={app.x_handle ?? ""}
                placeholder="yourapp"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <SubmitButton className="w-full" pendingLabel="Saving...">
          Save profile
        </SubmitButton>
      </form>
    </div>
  );
}
