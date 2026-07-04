import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

import {
  createDashboardUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  updateUserPermissionsAction,
} from "./actions";

export const dynamic = "force-dynamic";

const permissionGroups = [
  {
    title: "Pending Verification Requests",
    titleHi: "लंबित सत्यापन अनुरोध",
    permissions: [
      ["view_pending_requests", "View Pending Requests"],
      ["approve_pending_requests", "Accept & Generate Token"],
      ["defer_pending_requests", "Defer Requests"],
      ["edit_pending_requests", "Edit Pending Requests"],
      ["delete_pending_requests", "Delete Pending Requests"],
      ["view_pending_id_proof", "View Pending ID Proof"],
    ],
  },
  {
    title: "Final Meeting",
    titleHi: "फाइनल मीटिंग",
    permissions: [
      ["view_final_meeting_attendance", "View Attendance Section"],
      ["mark_final_meeting_attendance", "Mark Present"],
      ["undo_final_meeting_attendance", "Undo Attendance"],
      ["manage_final_meeting", "Manage / Reschedule Meeting"],
    ],
  },
  {
    title: "Registrations",
    titleHi: "पंजीकरण",
    permissions: [
      ["view_registrations", "View Registrations"],
      ["edit_registrations", "Edit Registrations"],
      ["delete_registrations", "Delete Registrations"],
      ["convert_group_tokens", "Convert Couple / Family Tokens"],
      ["view_registration_id_proof", "View Registration ID Proof"],
      ["view_candidate_history", "View Candidate History"],
    ],
  },
  {
    title: "Diksha",
    titleHi: "दीक्षा",
    permissions: [
      ["manage_diksha", "Manage / Reschedule Diksha"],
      ["mark_diksha_completed", "Mark Diksha Completed"],
      ["view_diksha_completed", "View Diksha Completed"],
    ],
  },
  {
    title: "Reports, Print & Export",
    titleHi: "रिपोर्ट, प्रिंट और एक्सपोर्ट",
    permissions: [
      ["view_reports", "View Reports"],
      ["export_registrations", "Export CSV"],
      ["print_registration_list", "Print Registration List"],
      ["print_devotee_forms", "Print Devotee Forms"],
    ],
  },
  {
    title: "Meeting Slots",
    titleHi: "मीटिंग स्लॉट",
    permissions: [
      ["view_slots", "View Meeting Slots"],
      ["edit_slot_capacity", "Edit Slot Capacity"],
    ],
  },
  {
    title: "Administration",
    titleHi: "प्रशासन",
    permissions: [
      ["view_user_activity", "View User Activity Logs"],
      ["manage_users", "Manage Users"],
    ],
  },
] as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    success?: string;
    message?: string;
  }>;
}) {
  const params = await searchParams;

  const authClient = await createSupabaseServerClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: currentProfile } = await authClient
    .from("admin_users")
    .select("id, username, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !currentProfile ||
    !currentProfile.is_active ||
    currentProfile.role !== "super_admin"
  ) {
    redirect("/admin");
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from("admin_users")
    .select(
      `
      id,
      username,
      full_name,
      role,
      is_active,
      created_at,
      admin_user_permissions (*)
    `
    )
    .order("created_at", { ascending: true });

  if (usersError) {
    return (
      <main className="min-h-screen bg-[#fff8ed] p-6">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8">
          <h1 className="text-2xl font-extrabold text-red-700">
            Users Loading Error
          </h1>

          <p className="mt-3">{usersError.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-8 text-[#2d2418]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">
                Users & Permissions
              </h1>

              <h2 className="mt-1 text-xl font-bold text-orange-800">
                उपयोगकर्ता और अनुमतियां
              </h2>

              <p className="mt-3 text-sm text-stone-600">
                Create dashboard users and control what they can view or change.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-2xl border border-orange-300 px-5 py-3 text-center font-bold text-orange-800"
            >
              Back to Dashboard
              <span className="block text-sm font-normal">
                डैशबोर्ड पर वापस जाएं
              </span>
            </Link>
          </div>
        </header>

        {params?.success && (
          <div className="mb-6 rounded-2xl bg-green-100 p-4 font-bold text-green-800">
            {params.success === "user-created" &&
              "User created successfully."}

            {params.success === "permissions-updated" &&
              "User permissions updated successfully."}

            {params.success === "password-updated" &&
              "User password updated successfully."}
          </div>
        )}

        {params?.error && (
          <div className="mb-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
            {getErrorMessage(params.error, params.message)}
          </div>
        )}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-extrabold">
            Create New Dashboard User
          </h3>

          <h4 className="mt-1 text-lg font-bold text-orange-800">
            नया डैशबोर्ड उपयोगकर्ता बनाएं
          </h4>

          <form action={createDashboardUserAction} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field
                label="Full Name / पूरा नाम"
                name="full_name"
                placeholder="Example: Ramesh Kumar"
              />

              <Field
                label="Username / यूज़रनेम"
                name="username"
                placeholder="Example: ramesh"
              />

              <Field
                label="Password / पासवर्ड"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
              />

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Role / भूमिका
                </label>

                <select
                  name="role"
                  defaultValue="sadhak"
                  className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none"
                >
                  <option value="sadhak">Sadhak</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <PermissionsEditor />

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-orange-700 px-6 py-4 text-lg font-extrabold text-white"
            >
              Create User
              <span className="block text-sm font-normal">
                उपयोगकर्ता बनाएं
              </span>
            </button>
          </form>
        </section>

        <section className="space-y-6">
          {(users || []).map((dashboardUser: any) => {
            const permissions = Array.isArray(
              dashboardUser.admin_user_permissions
            )
              ? dashboardUser.admin_user_permissions[0] || {}
              : dashboardUser.admin_user_permissions || {};

            return (
              <article
                key={dashboardUser.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold">
                      {dashboardUser.full_name}
                    </h3>

                    <p className="mt-1 font-bold text-orange-800">
                      @{dashboardUser.username}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                        {dashboardUser.role === "super_admin"
                          ? "Super Admin"
                          : "Sadhak"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          dashboardUser.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dashboardUser.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {dashboardUser.id !== currentProfile.id && (
                    <form action={toggleUserStatusAction}>
                      <input
                        type="hidden"
                        name="user_id"
                        value={dashboardUser.id}
                      />

                      <input
                        type="hidden"
                        name="new_status"
                        value={
                          dashboardUser.is_active ? "false" : "true"
                        }
                      />

                      <button
                        type="submit"
                        className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                          dashboardUser.is_active
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {dashboardUser.is_active
                          ? "Disable User"
                          : "Enable User"}
                      </button>
                    </form>
                  )}
                </div>

                <form
                  action={updateUserPermissionsAction}
                  className="mt-6"
                >
                  <input
                    type="hidden"
                    name="user_id"
                    value={dashboardUser.id}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Full Name"
                      name="full_name"
                      defaultValue={dashboardUser.full_name}
                    />

                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        Role
                      </label>

                      <select
                        name="role"
                        defaultValue={dashboardUser.role}
                        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none"
                      >
                        <option value="sadhak">Sadhak</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <PermissionsEditor permissions={permissions} />

                  <button
                    type="submit"
                    className="mt-5 rounded-2xl bg-blue-700 px-6 py-3 font-bold text-white"
                  >
                    Save User Permissions
                  </button>
                </form>

                <form
                  action={resetUserPasswordAction}
                  className="mt-6 flex flex-col gap-3 rounded-2xl bg-orange-50 p-4 md:flex-row md:items-end"
                >
                  <input
                    type="hidden"
                    name="user_id"
                    value={dashboardUser.id}
                  />

                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-bold">
                      New Password for @{dashboardUser.username}
                    </label>

                    <input
                      type="password"
                      name="new_password"
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-2xl bg-stone-800 px-6 py-3 font-bold text-white"
                  >
                    Reset Password
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function PermissionsEditor({
  permissions = {},
}: {
  permissions?: Record<string, boolean>;
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <input
        type="hidden"
        name="view_dashboard"
        value="on"
      />

      {permissionGroups.map((group) => (
        <div
          key={group.title}
          className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
        >
          <h4 className="font-extrabold">{group.title}</h4>

          <p className="text-sm font-semibold text-orange-800">
            {group.titleHi}
          </p>

          <div className="mt-4 space-y-3">
            {group.permissions.map(([name, label]) => (
              <label
                key={name}
                className="flex items-start gap-3 text-sm font-semibold"
              >
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={Boolean(permissions[name])}
                  className="mt-0.5 h-5 w-5 accent-orange-700"
                />

                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
        required
      />
    </div>
  );
}

function getErrorMessage(error: string, message?: string) {
  if (error === "missing-fields") {
    return "Please complete all required fields.";
  }

  if (error === "short-username") {
    return "Username must contain at least 3 characters.";
  }

  if (error === "short-password") {
    return "Password must contain at least 8 characters.";
  }

  if (error === "username-exists") {
    return "This username already exists.";
  }

  if (error === "cannot-disable-self") {
    return "You cannot disable your own Super Admin account.";
  }

  if (error === "user-not-found") {
    return "Dashboard user was not found.";
  }

  return message || "Something went wrong. Please try again.";
}