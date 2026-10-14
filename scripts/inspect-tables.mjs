import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tkjytjaerfjpghusrwom.supabase.co";
const serviceRoleKey = "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const tables = ["ops_tasks", "ops_escalations", "ops_onboarding", "ops_approvals", "deliverables", "clients", "profiles"];
  for (const t of tables) {
    const { data, error } = await adminSupabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`Table [${t}] error:`, error.message);
    } else {
      console.log(`Table [${t}] exists, rows count sample: ${data.length}, columns:`, data.length > 0 ? Object.keys(data[0]) : "empty table");
    }
  }
}

main().catch(console.error);
