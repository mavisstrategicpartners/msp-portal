import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accountsToProvision = [
  {
    email: "mavis@mavisstrateegicpartners.co.za",
    password: "MSPAdmin@2026!",
    fullName: "Mavis Muchena",
    jobTitle: "Chief Executive Officer & Administrator",
    department: "CEO",
    roleTier: "root_admin",
    appRole: "admin",
  },
  {
    email: "manager@mavisstrateegicpartners.co.za",
    password: "MSPManager@2026!",
    fullName: "Sales Manager",
    jobTitle: "Head of Sales & Business Development",
    department: "Sales Team",
    roleTier: "manager",
    appRole: "user",
  },
  {
    email: "consultant1@mavisstrateegicpartners.co.za",
    password: "MSPConsultant1@2026!",
    fullName: "Sales Consultant 1",
    jobTitle: "Senior Sales Consultant",
    department: "Sales Team",
    roleTier: "staff",
    appRole: "user",
  },
  {
    email: "consultant2@mavisstrateegicpartners.co.za",
    password: "MSPConsultant2@2026!",
    fullName: "Sales Consultant 2",
    jobTitle: "Sales Consultant",
    department: "Sales Team",
    roleTier: "staff",
    appRole: "user",
  },
  {
    email: "consultant3@mavisstrateegicpartners.co.za",
    password: "MSPConsultant3@2026!",
    fullName: "Sales Consultant 3",
    jobTitle: "Junior Sales Consultant",
    department: "Sales Team",
    roleTier: "staff",
    appRole: "user",
  },
];

async function seed() {
  console.log("Provisioning MSP Sales accounts with valid DB enums...");

  for (const acc of accountsToProvision) {
    try {
      const { data: userList } = await supabase.auth.admin.listUsers();
      let existingUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === acc.email.toLowerCase()
      );

      let userId;
      if (existingUser) {
        const { error: updateErr } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: acc.password,
            user_metadata: { full_name: acc.fullName, must_change_password: false },
            email_confirm: true,
          }
        );
        if (updateErr) console.warn(`Error updating ${acc.email}:`, updateErr.message);
        userId = existingUser.id;
      } else {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { full_name: acc.fullName, must_change_password: false },
        });
        if (createErr) {
          console.error(`Failed to create ${acc.email}:`, createErr.message);
          continue;
        }
        userId = created.user.id;
      }

      // Upsert Profile
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: acc.email,
          full_name: acc.fullName,
          job_title: acc.jobTitle,
          department: acc.department,
          role_tier: acc.roleTier,
          is_active: true,
          onboarding_completed: true,
        },
        { onConflict: "id" }
      );
      if (profileErr) console.error(`Profile error for ${acc.email}:`, profileErr.message);

      // Upsert User Role
      const { error: roleErr } = await supabase.from("user_roles").upsert(
        {
          user_id: userId,
          role: acc.appRole,
        },
        { onConflict: "user_id,role" }
      );
      if (roleErr) console.error(`Role error for ${acc.email}:`, roleErr.message);

      console.log(`✓ Cleanly provisioned: ${acc.email} | Dept: ${acc.department} | Tier: ${acc.roleTier} | Role: ${acc.appRole}`);
    } catch (e) {
      console.error(`Exception provisioning ${acc.email}:`, e);
    }
  }

  console.log("Sales accounts fully synced with Supabase.");
}

seed();
