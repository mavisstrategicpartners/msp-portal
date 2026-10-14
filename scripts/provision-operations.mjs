import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function provisionOperationsAccount() {
  const targetEmail = "operations@maviststrategicpartners.co.za";
  const initialPassword = process.env.OPS_INITIAL_PASSWORD || process.argv[2];
  if (!initialPassword) {
    throw new Error("Password must be supplied via OPS_INITIAL_PASSWORD environment variable or argv");
  }

  console.log(`[Provisioning] Checking if account exists for: ${targetEmail}`);

  // 1. List users to check if email exists
  const { data: userListData, error: listError } = await adminSupabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  let existingUser = userListData.users.find(
    (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
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
          full_name: "Operations & Relationship Manager",
          role: "OPERATIONS_RELATIONSHIP_MANAGER",
        },
      }
    );
    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }
    console.log(`[Provisioning] User auth updated successfully.`);
  } else {
    console.log(`[Provisioning] Creating new user for ${targetEmail}...`);
    const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: targetEmail,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Operations & Relationship Manager",
        role: "OPERATIONS_RELATIONSHIP_MANAGER",
      },
    });
    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }
    userId = createData.user.id;
    console.log(`[Provisioning] User auth created successfully (ID: ${userId}).`);
  }

  // 2. Ensure profile exists and has Operations Manager department and manager tier
  const { data: profileData, error: profileError } = await adminSupabase
    .from("profiles")
    .upsert({
      id: userId,
      email: targetEmail,
      full_name: "Operations & Relationship Manager",
      department: "Operations Manager",
      job_title: "Operations & Relationship Manager",
      role_tier: "manager",
      is_active: true,
      onboarding_completed: true,
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(`Failed to upsert profile: ${profileError.message}`);
  }
  console.log(`[Provisioning] Profile upserted:`, profileData);

  // 3. Ensure user_roles has entry
  const { data: existingRoles, error: rolesQueryErr } = await adminSupabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (rolesQueryErr) {
    console.warn(`[Provisioning] Warning querying user_roles:`, rolesQueryErr.message);
  } else if (!existingRoles || existingRoles.length === 0) {
    const { error: insertRoleErr } = await adminSupabase.from("user_roles").insert({
      user_id: userId,
      role: "user",
    });
    if (insertRoleErr) {
      console.warn(`[Provisioning] user_roles insert warning:`, insertRoleErr.message);
    } else {
      console.log(`[Provisioning] user_roles record assigned.`);
    }
  }

  // 4. Test authenticate using supabase public auth client with credentials
  const testClient = createClient(supabaseUrl, "sb_publishable_kU8G-7AUhbhiWPqd8XD6Ow_GNViYCDs", {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authTest, error: authTestErr } = await testClient.auth.signInWithPassword({
    email: targetEmail,
    password: initialPassword,
  });

  if (authTestErr || !authTest.user) {
    throw new Error(`Auth verification failed: ${authTestErr?.message}`);
  }

  console.log(`[Provisioning] AUTH TEST SUCCESSFUL! Authenticated user ID: ${authTest.user.id}`);
}

provisionOperationsAccount().catch((err) => {
  console.error("[Provisioning Error]:", err);
  process.exit(1);
});
