"use server";

import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { buildQueryString } from "@/lib/utils";

export async function connectAppAction(formData: FormData) {
  const user = await requireAuthenticatedUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(`/dashboard/connect${buildQueryString({ status: "error", message: "App name is required." })}`);
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    redirect(`/dashboard/connect${buildQueryString({ status: "error", message: "Server error." })}`);
  }

  const { data: existing } = await supabase
    .from("apps")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (existing) {
    redirect("/dashboard");
  }

  const { error } = await supabase.from("apps").insert({
    owner_id: user.id,
    name,
  });

  if (error) {
    redirect(`/dashboard/connect${buildQueryString({ status: "error", message: error.message })}`);
  }

  redirect(`/dashboard${buildQueryString({ status: "success", message: "App created! Set up the webhook to start getting alerts." })}`);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 100);
  const instagram = String(formData.get("instagram") ?? "").trim().replace(/^@/, "");
  const tiktok = String(formData.get("tiktok") ?? "").trim().replace(/^@/, "");
  const x_handle = String(formData.get("x_handle") ?? "").trim().replace(/^@/, "");

  if (!name) {
    redirect(`/dashboard/profile${buildQueryString({ status: "error", message: "App name is required." })}`);
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    redirect(`/dashboard/profile${buildQueryString({ status: "error", message: "Server error." })}`);
  }

  const { error } = await supabase
    .from("apps")
    .update({
      name,
      bio: bio || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      x_handle: x_handle || null,
    })
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/dashboard/profile${buildQueryString({ status: "error", message: error.message })}`);
  }

  redirect(`/dashboard/profile${buildQueryString({ status: "success", message: "Profile updated!" })}`);
}
