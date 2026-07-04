import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

import AdminDashboard from "./AdminDashboard";
import { adminLoginAction, adminLogoutAction } from "./actions";

export const dynamic = "force-dynamic";

type AdminProfile = {
  id: string;
  username: string;
  full_name: string;
  role: "super_admin" | "sadhak";
  is_active: boolean;
};

type AdminPermissions = {
  user_id: string;

  view_dashboard: boolean;

  view_pending_requests: boolean;
  approve_pending_requests: boolean;
  defer_pending_requests: boolean;
  edit_pending_requests: boolean;
  delete_pending_requests: boolean;
  view_pending_id_proof: boolean;

  view_final_meeting_attendance: boolean;
  mark_final_meeting_attendance: boolean;
  undo_final_meeting_attendance: boolean;

  view_registrations: boolean;
  edit_registrations: boolean;
  delete_registrations: boolean;
  convert_group_tokens: boolean;
  view_registration_id_proof: boolean;

  view_reports: boolean;
  export_registrations: boolean;
  print_registration_list: boolean;
  print_devotee_forms: boolean;

  manage_final_meeting: boolean;
  manage_diksha: boolean;
  mark_diksha_completed: boolean;
  view_diksha_completed: boolean;

  view_slots: boolean;
  edit_slot_capacity: boolean;

  view_candidate_history: boolean;
  view_user_activity: boolean;
  manage_users: boolean;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error || "";

  const authClient = await createSupabaseServerClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return <AdminLoginPage error={error} />;
  }

  const { data: adminProfile, error: profileError } = await authClient
    .from("admin_users")
    .select("id, username, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError || !adminProfile) {
    return (
      <AccessErrorPage
        title="Admin Profile Not Found"
        message="This login does not have an admin profile."
        messageHi="इस लॉगिन की admin profile नहीं मिली।"
      />
    );
  }

  if (!adminProfile.is_active) {
    return (
      <AccessErrorPage
        title="Account Disabled"
        message="This account has been disabled by Super Admin."
        messageHi="यह account Super Admin द्वारा disable किया गया है।"
      />
    );
  }

  const { data: permissions } = await authClient
    .from("admin_user_permissions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<AdminPermissions>();

  const isSuperAdmin = adminProfile.role === "super_admin";

  if (!isSuperAdmin && !permissions?.view_dashboard) {
    return (
      <AccessErrorPage
        title="Dashboard Access Denied"
        message="You do not have permission to access this dashboard."
        messageHi="आपके पास इस dashboard को खोलने की permission नहीं है।"
      />
    );
  }

  const { data: registrations, error: registrationsError } = await supabase
    .from("registrations")
    .select(
      `
      id,
      token,
      slot_id,
      full_name,
      age,
      gender,
      occupation,
      marital_status,
      mobile,
      whatsapp,
      address,
      city,
      state,
      country,
      pin_code,
      spouse_name,
      father_name,
      mother_name,
      family_name,
      family_relation,
      family_mobile,
      id_type,
      id_number,
      remarks_by,
      status,
      candidate_status,
      final_meeting_attendance,
      diksha_attendance,
      final_meeting_date,
      final_meeting_time,
      diksha_date,
      diksha_time,
      evaluator_name,
      evaluator_notes,
      admin_remarks,
      created_at,
      aadhaar_file_url,
      aadhaar_file_name,
      referred_to,
      slots (
        slot_date,
        slot_time
      )
    `
    )
    .order("final_meeting_date", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .order("slot_date", { ascending: true });

  const { data: activityLogs, error: activityLogsError } = await supabase
    .from("candidate_activity_logs")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: registrationRequests, error: registrationRequestsError } =
    await supabase
      .from("registration_requests")
      .select("*")
      .order("created_at", { ascending: false });

  if (
    registrationsError ||
    slotsError ||
    activityLogsError ||
    registrationRequestsError
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4">
        <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-red-700">
            Admin Data Error
          </h1>

          <p className="mt-4 text-stone-700">
            Could not load admin dashboard data.
          </p>

          <p className="mt-2 text-sm text-stone-500">
            {registrationsError?.message ||
              slotsError?.message ||
              activityLogsError?.message ||
              registrationRequestsError?.message}
          </p>
        </div>
      </main>
    );
  }

  const cleanedRegistrations = (registrations || []).map((person: any) => ({
    ...person,
    slots: Array.isArray(person.slots)
      ? person.slots[0] || null
      : person.slots,
  }));

  return (
    <>
      <div className="admin-screen fixed right-4 top-4 z-50 flex items-center gap-3">
        <div className="hidden rounded-2xl bg-white px-4 py-2 text-right shadow-sm md:block">
          <p className="text-xs font-bold text-stone-500">
            Logged in as
          </p>

          <p className="text-sm font-extrabold text-stone-800">
            {adminProfile.full_name}
          </p>

          <p className="text-xs font-semibold text-orange-700">
            @{adminProfile.username} ·{" "}
            {isSuperAdmin ? "Super Admin" : "Sadhak"}
          </p>
        </div>

        {isSuperAdmin && (
  <Link
    href="/admin/users"
    className="rounded-2xl bg-purple-700 px-4 py-3 text-center text-xs font-bold text-white shadow-sm"
  >
    Users & Permissions
    <span className="block text-[10px] font-normal">
      उपयोगकर्ता बनाएं
    </span>
  </Link>
)}

        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 shadow-sm"
          >
            Logout
            <span className="block text-[10px] font-normal">
              लॉगआउट
            </span>
          </button>
        </form>
      </div>

      <AdminDashboard
        registrations={cleanedRegistrations}
        slots={slots || []}
        activityLogs={activityLogs || []}
        registrationRequests={registrationRequests || []}
        accessMode={isSuperAdmin ? "admin" : "sadhak"}
      />
    </>
  );
}

function AdminLoginPage({ error }: { error: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4 py-10 text-[#2d2418]">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mx-auto mb-5 w-24">
          <Image
            src="/logo.png"
            alt="Diksha Logo"
            width={250}
            height={250}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold">
            Dashboard Login
          </h1>

          <h2 className="mt-1 text-xl font-bold text-orange-800">
            डैशबोर्ड लॉगिन
          </h2>

          <p className="mt-3 text-sm text-stone-600">
            Enter your username and password.
          </p>

          <p className="text-sm text-stone-600">
            अपना username और password भरें।
          </p>
        </div>

        {error === "missing-fields" && (
          <LoginError>
            Username and password are required.
            <span className="block font-normal">
              Username और password दोनों भरें।
            </span>
          </LoginError>
        )}

        {error === "wrong-login" && (
          <LoginError>
            Wrong username or password.
            <span className="block font-normal">
              Username या password गलत है।
            </span>
          </LoginError>
        )}

        {error === "profile-not-found" && (
          <LoginError>
            Admin profile was not found.
            <span className="block font-normal">
              इस user की admin profile नहीं मिली।
            </span>
          </LoginError>
        )}

        {error === "account-disabled" && (
          <LoginError>
            This account has been disabled.
            <span className="block font-normal">
              यह account disable कर दिया गया है।
            </span>
          </LoginError>
        )}

        <form action={adminLoginAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block font-bold">
              Username / यूज़रनेम
            </label>

            <input
              type="text"
              name="username"
              placeholder="Example: superadmin"
              autoComplete="username"
              className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">
              Password / पासवर्ड
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-700 px-5 py-3 font-bold text-white"
          >
            Login
            <span className="block text-sm font-normal">
              लॉगिन करें
            </span>
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-500">
          Authorized Super Admin and Sadhak users only.
        </p>
      </div>
    </main>
  );
}

function LoginError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
      {children}
    </div>
  );
}

function AccessErrorPage({
  title,
  message,
  messageHi,
}: {
  title: string;
  message: string;
  messageHi: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-red-700">
          {title}
        </h1>

        <p className="mt-4 font-semibold text-stone-700">
          {message}
        </p>

        <p className="mt-1 text-sm text-stone-600">
          {messageHi}
        </p>

        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="mt-6 rounded-2xl bg-red-100 px-6 py-3 font-bold text-red-700"
          >
            Logout and return to login
          </button>
        </form>
      </div>
    </main>
  );
}