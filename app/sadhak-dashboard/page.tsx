import { supabase } from "@/lib/supabase";
import AdminDashboard from "../admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function SadhakDashboardPage() {
  const [
    registrationsResult,
    slotsResult,
    activityLogsResult,
    registrationRequestsResult,
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

  return (
    <AdminDashboard
      registrations={registrationsResult.data || []}
      slots={slotsResult.data || []}
      activityLogs={activityLogsResult.data || []}
      registrationRequests={registrationRequestsResult.data || []}
      accessMode="sadhak"
    />
  );
}