import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: registrations, error: registrationsError } = await supabase
    .from("registrations")
    .select(
      `
      id,
      token,
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
      pin_code,
      guardian_relation,
      guardian_name,
      guardian_mobile,
      family_name,
      family_relation,
      family_mobile,
      id_type,
      id_number,
      remarks_by,
      status,
      created_at,
      aadhaar_file_url,
      aadhaar_file_name,
      slots (
        slot_date,
        slot_time
      )
    `
    )
    .order("created_at", { ascending: false });

  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .order("slot_date", { ascending: true });

  if (registrationsError || slotsError) {
    return (
      <main className="min-h-screen bg-[#fff8ed] p-8 text-[#2d2418]">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-red-700">
            Admin Dashboard Error
          </h1>

          <p className="mt-4 font-semibold">
            {registrationsError?.message || slotsError?.message}
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
    <AdminDashboard
      registrations={cleanedRegistrations}
      slots={slots || []}
    />
  );
}