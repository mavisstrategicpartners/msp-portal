/**
 * Provision the General Manager account in Supabase.
 * 
 * Usage: node scripts/provision-gm.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tkjytjaerfjpghusrwom.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";

const GM_EMAIL = "general.manager@mavisstrategicpartners.co.za";
const GM_PASSWORD = "General2026!";

function isNewApiKey(value) {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(key) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }
    if (isNewApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY) },
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("=== GM Account Provisioning ===\n");

  // Step 1: Check if user already exists
  console.log("1. Checking for existing account...");
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  let userId = null;
  if (listError) {
    console.warn("   Could not list users:", listError.message);
  } else {
    const existing = existingUsers?.users?.find(u => u.email === GM_EMAIL);
    if (existing) {
      userId = existing.id;
      console.log(`   Found existing user: ${userId}`);
    }
  }

  // Step 2: Create or update user
  if (!userId) {
    console.log("2. Creating new auth user...");
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: GM_EMAIL,
      password: GM_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "MSP General Manager",
        job_title: "General Manager",
        department: "Executive",
      },
    });

    if (createError) {
      console.error("   FAILED to create user:", createError.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`   Created user: ${userId}`);
  } else {
    console.log("2. Updating existing user password & metadata...");
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: GM_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "MSP General Manager",
        job_title: "General Manager",
        department: "Executive",
      },
    });
    if (updateError) {
      console.warn("   Warning updating user:", updateError.message);
    } else {
      console.log("   Updated successfully.");
    }
  }

  // Step 3: Upsert profile
  console.log("3. Upserting profile record...");
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email: GM_EMAIL,
    full_name: "MSP General Manager",
    department: "Managing Director",
    job_title: "General Manager",
    is_active: true,
    onboarding_completed: true,
    role_tier: "manager",
  }, { onConflict: "id" });

  if (profileError) {
    console.warn("   Profile upsert warning:", profileError.message);
  } else {
    console.log("   Profile upserted.");
  }

  // Step 4: Assign user_role
  console.log("4. Assigning user_role...");
  const { data: existingRoles } = await supabaseAdmin
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (existingRoles && existingRoles.length > 0) {
    console.log("   Existing role:", existingRoles[0].role);
    if (existingRoles[0].role !== "admin") {
      await supabaseAdmin.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
      console.log("   Updated user_roles to 'admin'");
    }
  } else {
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "admin",
    });
    if (roleError) {
      console.warn("   Role assignment warning:", roleError.message);
    } else {
      console.log("   Role 'admin' assigned in user_roles.");
    }
  }

  // Step 5: Audit log
  console.log("5. Recording audit entry...");
  const { error: auditError } = await supabaseAdmin.from("audit_logs").insert({
    action: "gm_account_provisioned",
    details: {
      email: GM_EMAIL,
      user_id: userId,
      timestamp: new Date().toISOString(),
      provisioned_by: "system_script",
    },
  });
  if (auditError) {
    console.warn("   Audit log warning:", auditError.message);
  } else {
    console.log("   Audit entry recorded.");
  }

  console.log("\n=== PROVISIONING COMPLETE ===");
  console.log(`Email:    ${GM_EMAIL}`);
  console.log(`User ID:  ${userId}`);
  console.log(`Role:     General Manager`);
  console.log(`Status:   Ready to login`);
}

main().catch(err => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
