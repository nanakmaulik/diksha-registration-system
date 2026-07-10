import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminDashboard from "../admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function SadhakDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sadhak-login");
  }

  const { data: sadhakProfile, error: profileError } =
    await supabase
      .from("admin_users")
      .select("id, username, full_name, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

  if (
    profileError ||
    !sadhakProfile ||
    !sadhakProfile.is_active ||
    sadhakProfile.role !== "sadhak"
  ) {
    redirect("/sadhak-login");
  }

  const [
    registrationsResult,
    slotsResult,
    activityLogsResult,
    registrationRequestsResult,
    permissionsResult,
  ] = await Promise.all([
    supabase
      .from("registrations")
      .select(
        `
        *,
        slots (
          slot_date,
          slot_time
        )
      `
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("slots")
      .select("*")
      .order("slot_date", { ascending: true }),

    supabase
      .from("candidate_activity_logs")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("registration_requests")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("admin_user_permissions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (registrationsResult.error) {
    throw new Error(registrationsResult.error.message);
  }

  if (slotsResult.error) {
    throw new Error(slotsResult.error.message);
  }

  if (activityLogsResult.error) {
    throw new Error(activityLogsResult.error.message);
  }

  if (registrationRequestsResult.error) {
    throw new Error(registrationRequestsResult.error.message);
  }

  if (permissionsResult.error) {
    throw new Error(permissionsResult.error.message);
  }

  const cleanedRegistrations = (
    registrationsResult.data || []
  ).map((person: any) => ({
    ...person,
    slots: Array.isArray(person.slots)
      ? person.slots[0] || null
      : person.slots,
  }));

  return (
    <AdminDashboard
      registrations={cleanedRegistrations}
      slots={slotsResult.data || []}
      activityLogs={activityLogsResult.data || []}
      registrationRequests={
        registrationRequestsResult.data || []
      }
      accessMode="sadhak"
      permissions={
        (permissionsResult.data || null) as Record<
          string,
          boolean
        > | null
      }
      loggedInUsername={sadhakProfile.username}
    />
  );
}