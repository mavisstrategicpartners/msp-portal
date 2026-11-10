import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("=== PROFILES ===");
  const { data: profiles, error: profErr } = await adminSupabase
    .from("profiles")
    .select("*");

  if (profErr) {
    console.error("Error fetching profiles:", profErr);
  } else {
    console.log(`Total profiles: ${profiles.length}`);
    if (profiles.length > 0) {
      console.log("Profile columns:", Object.keys(profiles[0]));
    }
    for (const p of profiles) {
      console.log(`- ${p.full_name} (${p.email}) | Dept: [${p.department}] | Title: [${p.job_title}] | Tier: [${p.role_tier}]`);
    }
  }

  console.log("\n=== DISTINCT DEPARTMENTS IN PROFILES ===");
  const depts = [...new Set(profiles?.map(p => p.department).filter(Boolean))];
  console.log(depts);

  console.log("\n=== CHECKING DEPARTMENTS IN TASKS OR OPS_TASKS ===");
  const { data: opsTasks, error: taskErr } = await adminSupabase
    .from("ops_tasks")
    .select("department")
    .limit(100);

  if (!taskErr && opsTasks) {
    const taskDepts = [...new Set(opsTasks.map(t => t.department).filter(Boolean))];
    console.log("Departments in ops_tasks:", taskDepts);
  }

  console.log("\n=== CHECKING IF department.manager ALREADY EXISTS IN AUTH ===");
  const { data: users, error: userErr } = await adminSupabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Error listing users:", userErr);
  } else {
    const mgrUsers = users.users.filter(u => u.email?.toLowerCase().includes("department") || u.email?.toLowerCase().includes("manager"));
    console.log("Manager/Department users found in auth:");
    mgrUsers.forEach(u => console.log(`- ${u.email} (id: ${u.id})`));
  }
}

main().catch(console.error);
