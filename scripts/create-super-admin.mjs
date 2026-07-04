import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local file not found");
  }

  const envText = fs.readFileSync(envPath, "utf8");

  for (const line of envText.split("\n")) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
}

if (!username) {
  throw new Error("ADMIN_USERNAME missing");
}

if (!password) {
  throw new Error("ADMIN_INITIAL_PASSWORD missing");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const normalizedUsername = username.trim().toLowerCase();
const loginEmail = `${normalizedUsername}@diksha.local`;

async function createSuperAdmin() {
  const { data: existingUsersData, error: listError } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listError) {
    throw listError;
  }

  let authUser = existingUsersData.users.find(
    (user) => user.email?.toLowerCase() === loginEmail
  );

  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: normalizedUsername,
        full_name: "Super Admin",
      },
    });

    if (error) {
      throw error;
    }

    authUser = data.user;
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      {
        password,
        email_confirm: true,
      }
    );

    if (error) {
      throw error;
    }
  }

  const { error: profileError } = await supabaseAdmin
    .from("admin_users")
    .upsert(
      {
        id: authUser.id,
        username: normalizedUsername,
        full_name: "Super Admin",
        role: "super_admin",
        is_active: true,
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    throw profileError;
  }

  const { error: permissionError } = await supabaseAdmin
    .from("admin_user_permissions")
    .upsert(
      {
        user_id: authUser.id,

        view_dashboard: true,

        view_pending_requests: true,
        approve_pending_requests: true,
        defer_pending_requests: true,
        edit_pending_requests: true,
        delete_pending_requests: true,
        view_pending_id_proof: true,

        view_final_meeting_attendance: true,
        mark_final_meeting_attendance: true,
        undo_final_meeting_attendance: true,

        view_registrations: true,
        edit_registrations: true,
        delete_registrations: true,
        convert_group_tokens: true,
        view_registration_id_proof: true,

        view_reports: true,
        export_registrations: true,
        print_registration_list: true,
        print_devotee_forms: true,

        manage_final_meeting: true,
        manage_diksha: true,
        mark_diksha_completed: true,
        view_diksha_completed: true,

        view_slots: true,
        edit_slot_capacity: true,

        view_candidate_history: true,
        view_user_activity: true,
        manage_users: true,
      },
      {
        onConflict: "user_id",
      }
    );

  if (permissionError) {
    throw permissionError;
  }

  console.log("");
  console.log("Super Admin created successfully");
  console.log(`Username: ${normalizedUsername}`);
  console.log(`Internal email: ${loginEmail}`);
  console.log("");
}

createSuperAdmin().catch((error) => {
  console.error("Super Admin creation failed:");
  console.error(error);
  process.exit(1);
});