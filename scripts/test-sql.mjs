import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tkjytjaerfjpghusrwom.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Test if any rpc exists to execute sql
  const { data, error } = await adminSupabase.rpc("exec_sql", { query: "SELECT 1;" });
  console.log("exec_sql:", data, error?.message);

  // Check what enum values exist by querying pg_enum
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });
  console.log("rpc endpoints status:", res.status);
}

main().catch(console.error);
