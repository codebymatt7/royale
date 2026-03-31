"use server";

import { redirect } from "next/navigation";
import { getBaseUrl, hasPublicSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildQueryString } from "@/lib/utils";

export async function signUpAction(formData: FormData) {
  if (!hasPublicSupabaseEnv) {
    redirect(`/signup${buildQueryString({ status: "error", message: "Configure Supabase env vars first." })}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(`/signup${buildQueryString({ status: "error", message: "Supabase client unavailable." })}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    redirect(`/signup${buildQueryString({ status: "error", message: error.message })}`);
  }

  if (!data.session) {
    redirect(
      `/login${buildQueryString({
        status: "success",
        message: "Account created. Check your inbox if email confirmation is enabled.",
      })}`,
    );
  }

  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  if (!hasPublicSupabaseEnv) {
    redirect(`/login${buildQueryString({ status: "error", message: "Configure Supabase env vars first." })}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(`/login${buildQueryString({ status: "error", message: "Supabase client unavailable." })}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login${buildQueryString({ status: "error", message: error.message })}`);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
