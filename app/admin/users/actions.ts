"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const permissionNames = [
  "view_dashboard",

  "view_pending_requests",
  "approve_pending_requests",
  "defer_pending_requests",
  "edit_pending_requests",
  "delete_pending_requests",
  "view_pending_id_proof",

  "view_final_meeting_attendance",
  "mark_final_meeting_attendance",
  "undo_final_meeting_attendance",

  "view_registrations",
  "edit_registrations",
  "delete_registrations",
  "convert_group_tokens",
  "view_registration_id_proof",

  "view_reports",
  "export_registrations",
  "print_registration_list",
  "print_devotee_forms",

  "manage_final_meeting",
  "manage_diksha",
  "mark_diksha_completed",
  "view_diksha_completed",

  "view_slots",
  "edit_slot_capacity",

  "view_candidate_history",
  "view_user_activity",
  "manage_users",
] as const;

async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("admin_users")
    .select("id, username, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !profile.is_active ||
    profile.role !== "super_admin"
  ) {
    redirect("/admin");
  }

  return profile;
}

function normalizeUsername(username: string) {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function getPermissionValues(formData: FormData) {
  return Object.fromEntries(
    permissionNames.map((permission) => [
      permission,
      formData.get(permission) === "on",
    ])
  );
}

export async function createDashboardUserAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const fullName = String(formData.get("full_name") || "").trim();
  const username = normalizeUsername(
    String(formData.get("username") || "")
  );
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "sadhak");

  if (!fullName || !username || !password) {
    redirect("/admin/users?error=missing-fields");
  }

  if (username.length < 3) {
    redirect("/admin/users?error=short-username");
  }

  if (password.length < 8) {
    redirect("/admin/users?error=short-password");
  }

  if (!["super_admin", "sadhak"].includes(role)) {
    redirect("/admin/users?error=invalid-role");
  }

  const loginEmail = `${username}@diksha.local`;

  const { data: existingProfiles } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    redirect("/admin/users?error=username-exists");
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: fullName,
      },
    });

  if (authError || !authData.user) {
    redirect(
      `/admin/users?error=create-failed&message=${encodeURIComponent(
        authError?.message || "Could not create user"
      )}`
    );
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from("admin_users")
    .insert({
      id: userId,
      username,
      full_name: fullName,
      role,
      is_active: true,
      created_by: currentAdmin.id,
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);

    redirect(
      `/admin/users?error=create-failed&message=${encodeURIComponent(
        profileError.message
      )}`
    );
  }

  const permissionValues =
    role === "super_admin"
      ? Object.fromEntries(
          permissionNames.map((permission) => [permission, true])
        )
      : getPermissionValues(formData);

  const { error: permissionError } = await supabaseAdmin
    .from("admin_user_permissions")
    .insert({
      user_id: userId,
      ...permissionValues,
    });

  if (permissionError) {
    await supabaseAdmin.from("admin_users").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    redirect(
      `/admin/users?error=create-failed&message=${encodeURIComponent(
        permissionError.message
      )}`
    );
  }

  await supabaseAdmin.from("admin_activity_logs").insert({
    actor_user_id: currentAdmin.id,
    actor_username: currentAdmin.username,
    actor_name: currentAdmin.full_name,
    actor_role: currentAdmin.role,
    action_type: "Dashboard User Created",
    entity_type: "admin_user",
    entity_id: userId,
    notes: `Created @${username} with role ${role}`,
    new_value: {
      username,
      full_name: fullName,
      role,
      permissions: permissionValues,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?success=user-created");
}

export async function updateUserPermissionsAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const userId = String(formData.get("user_id") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "sadhak");

  if (!userId || !fullName) {
    redirect("/admin/users?error=missing-fields");
  }

  const { data: oldProfile } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!oldProfile) {
    redirect("/admin/users?error=user-not-found");
  }

  const permissionValues =
    role === "super_admin"
      ? Object.fromEntries(
          permissionNames.map((permission) => [permission, true])
        )
      : getPermissionValues(formData);

  const { error: profileError } = await supabaseAdmin
    .from("admin_users")
    .update({
      full_name: fullName,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    redirect(
      `/admin/users?error=update-failed&message=${encodeURIComponent(
        profileError.message
      )}`
    );
  }

  const { error: permissionError } = await supabaseAdmin
    .from("admin_user_permissions")
    .upsert(
      {
        user_id: userId,
        ...permissionValues,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (permissionError) {
    redirect(
      `/admin/users?error=update-failed&message=${encodeURIComponent(
        permissionError.message
      )}`
    );
  }

  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      username: oldProfile.username,
      full_name: fullName,
    },
  });

  await supabaseAdmin.from("admin_activity_logs").insert({
    actor_user_id: currentAdmin.id,
    actor_username: currentAdmin.username,
    actor_name: currentAdmin.full_name,
    actor_role: currentAdmin.role,
    action_type: "User Permissions Updated",
    entity_type: "admin_user",
    entity_id: userId,
    notes: `Updated permissions for @${oldProfile.username}`,
    old_value: oldProfile,
    new_value: {
      full_name: fullName,
      role,
      permissions: permissionValues,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?success=permissions-updated");
}

export async function toggleUserStatusAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const userId = String(formData.get("user_id") || "");
  const newStatus = String(formData.get("new_status") || "") === "true";

  if (!userId || userId === currentAdmin.id) {
    redirect("/admin/users?error=cannot-disable-self");
  }

  const { data: targetUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, username, full_name, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!targetUser) {
    redirect("/admin/users?error=user-not-found");
  }

  const { error } = await supabaseAdmin
    .from("admin_users")
    .update({
      is_active: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    redirect("/admin/users?error=status-update-failed");
  }

  await supabaseAdmin.from("admin_activity_logs").insert({
    actor_user_id: currentAdmin.id,
    actor_username: currentAdmin.username,
    actor_name: currentAdmin.full_name,
    actor_role: currentAdmin.role,
    action_type: newStatus
      ? "Dashboard User Enabled"
      : "Dashboard User Disabled",
    entity_type: "admin_user",
    entity_id: userId,
    notes: `${newStatus ? "Enabled" : "Disabled"} @${targetUser.username}`,
    old_value: {
      is_active: targetUser.is_active,
    },
    new_value: {
      is_active: newStatus,
    },
  });

  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();

  const userId = String(formData.get("user_id") || "");
  const newPassword = String(formData.get("new_password") || "");

  if (!userId || newPassword.length < 8) {
    redirect("/admin/users?error=short-password");
  }

  const { data: targetUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, username, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!targetUser) {
    redirect("/admin/users?error=user-not-found");
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    redirect(
      `/admin/users?error=password-update-failed&message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  await supabaseAdmin.from("admin_activity_logs").insert({
    actor_user_id: currentAdmin.id,
    actor_username: currentAdmin.username,
    actor_name: currentAdmin.full_name,
    actor_role: currentAdmin.role,
    action_type: "Dashboard User Password Reset",
    entity_type: "admin_user",
    entity_id: userId,
    notes: `Password reset for @${targetUser.username}`,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?success=password-updated");
}