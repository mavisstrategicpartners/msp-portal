// src/scripts/create-demo-accounts.ts
/**
 * Script to create demo accounts for Finance Administration and Sales dashboards.
 * Run with Node.js after setting the SUPABASE_SERVICE_ROLE_KEY environment variable.
 * Example:
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-key ts-node src/scripts/create-demo-accounts.ts
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Service role key has admin privileges to manage auth users.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

// Create a Supabase client with admin privileges (service_role).
const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

interface DemoUser {
  email: string;
  password: string;
  role: string; // role name as stored in user_roles table
}

const demoUsers: DemoUser[] = [
  {
    email: 'financeadministration@mavisstrategicpartners.co.za',
    password: 'Finance2026!',
    role: 'finance_administration',
  },
  {
    email: 'sales@mavisstrategicpartners.co.za',
    password: 'Sales2026!',
    role: 'sales',
  },
  {
    email: 'hr@mavisstrategicpartners.co.za',
    password: 'MspHr2026!',
    role: 'staff',
  },
];

async function createUser(user: DemoUser) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });
  if (authError) {
    console.error(`Failed to create auth user ${user.email}:`, authError.message);
    return null;
  }
  console.log(`Created auth user ${user.email} with id ${authData.user.id}`);

  // Assign role in user_roles table (assumes a simple schema: user_id, role)
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: authData.user.id, role: user.role as any });
  if (roleError) {
    console.error(`Failed to assign role for ${user.email}:`, roleError.message);
  } else {
    console.log(`Assigned role '${user.role}' to ${user.email}`);
  }
  return authData.user.id;
}

async function main() {
  for (const u of demoUsers) {
    await createUser(u);
  }
  console.log('Demo account provisioning complete.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
