import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kU8G-7AUhbhiWPqd8XD6Ow_GNViYCDs";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function provisionDeptManager(email, initialPassword, departmentName) {
  console.log(`[Provisioning] Checking if account exists for: ${email}`);

  const { data: userListData, error: listError } = await adminSupabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  let existingUser = userListData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId;

  if (existingUser) {
    console.log(`[Provisioning] Existing user found (ID: ${existingUser.id}). Updating password and metadata...`);
    userId = existingUser.id;
    const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        password: initialPassword,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: `Department Manager (${departmentName})`,
          role: "DEPARTMENT_MANAGER",
          department: departmentName,
        },
      }
    );
    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }
    console.log(`[Provisioning] User auth updated successfully.`);
  } else {
    console.log(`[Provisioning] Creating new user for ${email}...`);
    const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `Department Manager (${departmentName})`,
        role: "DEPARTMENT_MANAGER",
        department: departmentName,
      },
    });
    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }
    userId = createData.user.id;
    console.log(`[Provisioning] User auth created successfully (ID: ${userId}).`);
  }

  // Ensure profile has manager role_tier and title
  const { data: profileData, error: profileError } = await adminSupabase
    .from("profiles")
    .upsert({
      id: userId,
      email: email,
      full_name: `Department Manager (${departmentName})`,
      department: "Marketing Team",
      job_title: `${departmentName} Lead & Department Manager`,
      role_tier: "manager",
      is_active: true,
      onboarding_completed: true,
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(`Failed to upsert profile: ${profileError.message}`);
  }
  console.log(`[Provisioning] Profile upserted successfully:`, profileData);

  // Verify auth using public Supabase auth client
  const testClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authTest, error: authTestErr } = await testClient.auth.signInWithPassword({
    email,
    password: initialPassword,
  });

  if (authTestErr || !authTest.user) {
    throw new Error(`Auth verification failed: ${authTestErr?.message}`);
  }

  console.log(`[Provisioning] AUTH TEST SUCCESSFUL for ${email}! User ID: ${authTest.user.id}`);
}

async function main() {
  const targetEmail = process.env.DEPT_MGR_EMAIL || "department.manager@mavistrategicpartners.co.za";
  const initialPassword = process.env.DEPT_MGR_PASSWORD || process.argv[2];
  if (!initialPassword) { console.error("Set DEPT_MGR_PASSWORD or pass a password argument."); process.exit(1); }
  const department = "Media Buying";

  await provisionDeptManager(targetEmail, initialPassword, department);

  // Also provision the single 't' domain variant (department.manager@mavisstrategicpartners.co.za) so either spelling signs in seamlessly
  const alternateEmail = "department.manager@mavisstrategicpartners.co.za";
  if (alternateEmail.toLowerCase() !== targetEmail.toLowerCase()) {
    try {
      await provisionDeptManager(alternateEmail, initialPassword, department);
    } catch (e) {
      console.warn("Alternate email provisioning note:", e.message);
    }
  }
}

main().catch((err) => {
  console.error("[Provisioning Fatal Error]:", err);
  process.exit(1);
});
