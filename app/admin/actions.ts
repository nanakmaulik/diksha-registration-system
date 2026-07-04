"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function getLoginEmail(username: string) {
  return `${normalizeUsername(username)}@diksha.local`;
}

export async function adminLoginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    redirect("/admin?error=missing-fields");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: getLoginEmail(username),
    password,
  });

  if (error || !data.user) {
    redirect("/admin?error=wrong-login");
  }

  const { data: adminUser, error: profileError } = await supabase
    .from("admin_users")
    .select("id, username, full_name, role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !adminUser) {
    await supabase.auth.signOut();
    redirect("/admin?error=profile-not-found");
  }

  if (!adminUser.is_active) {
    await supabase.auth.signOut();
    redirect("/admin?error=account-disabled");
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/admin");
}