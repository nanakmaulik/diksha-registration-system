import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function adminLoginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    redirect("/admin?error=missing-password");
  }

  if (password !== adminPassword) {
    redirect("/admin?error=wrong-password");
  }

  const cookieStore = await cookies();

  cookieStore.set("diksha_admin_auth", hashValue(adminPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

async function adminLogoutAction() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete("diksha_admin_auth");

  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error || "";

  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("diksha_admin_auth")?.value;

  const isLoggedIn =
    !!adminPassword && adminCookie === hashValue(adminPassword);

  if (!isLoggedIn) {
    return <AdminLoginPage error={error} />;
  }

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
      <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4">
        <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-red-700">
            Admin Data Error
          </h1>
          <p className="mt-4 text-stone-700">
            Could not load admin dashboard data.
          </p>
          <p className="mt-2 text-sm text-stone-500">
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
    <>
      <form action={adminLogoutAction} className="admin-screen fixed right-4 top-4 z-50">
        <button
          type="submit"
          className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 shadow-sm"
        >
          Logout
          <span className="block text-[10px] font-normal">लॉगआउट</span>
        </button>
      </form>

      <AdminDashboard
        registrations={cleanedRegistrations}
        slots={slots || []}
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
          <h1 className="text-2xl font-extrabold">Admin Login</h1>
          <h2 className="mt-1 text-xl font-bold text-orange-800">
            प्रशासन लॉगिन
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Please enter admin password to access the dashboard.
          </p>
          <p className="text-sm text-stone-600">
            डैशबोर्ड खोलने के लिए एडमिन पासवर्ड डालें।
          </p>
        </div>

        {error === "wrong-password" && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            Wrong password. Please try again.
            <span className="block font-normal">गलत पासवर्ड। फिर से प्रयास करें।</span>
          </div>
        )}

        {error === "missing-password" && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            ADMIN_PASSWORD is missing in environment variables.
            <span className="block font-normal">
              .env.local या Vercel env में ADMIN_PASSWORD add करें।
            </span>
          </div>
        )}

        <form action={adminLoginAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block font-bold">
              Password / पासवर्ड
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-700 px-5 py-3 font-bold text-white"
          >
            Login
            <span className="block text-sm font-normal">लॉगिन करें</span>
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-500">
          This page is protected for sewadars/admin use only.
        </p>
      </div>
    </main>
  );
}