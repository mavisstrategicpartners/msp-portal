// src/scripts/setup-demo-accounts.cjs
/**
 * Node script (CommonJS) to ensure the Finance Administration and Sales demo accounts exist.
 * It reads the Supabase URL and service role key from the .env file (simple parser) to avoid
 * requiring the 'dotenv' package, which may not be available.
 * Run with (PowerShell may block .ps1 scripts, so use cmd):
 *   cmd /c "node src/scripts/setup-demo-accounts.cjs"
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Simple .env parser (ignores comments and empty lines)
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  const env = {};
  try {
    const content = fs.readFileSync(envPath, { encoding: 'utf8' });
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx);
      const value = trimmed.slice(eqIdx + 1).replace(/^"|"$/g, '');
      env[key] = value;
    });
  } catch (e) {
    console.warn('Could not read .env file, relying on process.env');
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
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
  // List existing users (admin endpoint)
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing users:', listErr.message);
    return;
  }
  const existing = listData.users.find((u) => u.email === email);
  if (existing) {
    console.log(`User ${email} already exists (id=${existing.id}), updating password...`);
    await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    await assignRole(existing.id, role);
    return;
  }
  // Create new auth user
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
  // Upsert role mapping – assumes user_roles(user_id, role) unique on user_id
  const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
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
