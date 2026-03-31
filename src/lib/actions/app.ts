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

  // Check if user already has an app
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

  redirect(`/dashboard${buildQueryString({ status: "success", message: "App created! Add the tracking snippet to start getting alerts." })}`);
}
