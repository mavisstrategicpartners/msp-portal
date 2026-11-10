// src/scripts/create-demo-accounts.js
/**
 * Simple Node script to ensure the demo Finance Administration and Sales accounts exist.
 * It uses the Supabase service role key to create/auth admin users and assign roles.
 * Run with:
 *   node src/scripts/create-demo-accounts.js
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const demoUsers = [
  {
    email: 'financeadministration@mavisstrategicpartners.co.za',
    password: process.env.DEMO_ACCOUNT_PASSWORD,
    role: 'finance_administration',
  },
  {
    email: 'sales@mavisstrategicpartners.co.za',
    password: process.env.DEMO_ACCOUNT_PASSWORD,
    role: 'sales',
  },
  {
    email: 'hr@mavisstrategicpartners.co.za',
    password: process.env.DEMO_ACCOUNT_PASSWORD,
    role: 'staff',
  },
];

async function upsertUser({ email, password, role }) {
  // Try to find existing user
  const { data: existing, error: listErr } = await supabase
    .auth
    .admin
    .listUsers();
  const user = existing?.users?.find(u => u.email === email);
  if (user) {
    console.log(`User ${email} already exists (id=${user.id})`);
    // Ensure role assignment exists
    await assignRole(user.id, role);
    return;
  }
  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error(`Failed to create user ${email}:`, error.message);
    return;
  }
  console.log(`Created user ${email} (id=${data.user.id})`);
  await assignRole(data.user.id, role);
}

async function assignRole(userId, role) {
  // Upsert into user_roles table (assumes unique constraint on user_id)
  const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) {
    console.error(`Failed to assign role '${role}' to user ${userId}:`, error.message);
  } else {
    console.log(`Assigned role '${role}' to user ${userId}`);
  }
}

(async () => {
  for (const u of demoUsers) {
    await upsertUser(u);
  }
  console.log('Demo account setup complete');
})();
