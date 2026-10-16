// src/scripts/list-demo-accounts.ts
/**
 * List users in Supabase matching the demo accounts.
 * Useful for debugging login issues.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

async function listDemoUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  const demoEmails = [
    'financeadministration@mavisstrategicpartners.co.za',
    'sales@mavisstrategicpartners.co.za',
  ];
  const demoUsers = data.users.filter((u) => demoEmails.includes(u.email ?? ''));
  console.log('Demo users found:', demoUsers.length);
  demoUsers.forEach((u) => {
    console.log(`- ${u.email} (id=${u.id}, confirmed=${u.email_confirmed_at ? 'yes' : 'no'})`);
  });
}

listDemoUsers().catch((e) => {
  console.error('Unexpected error:', e);
});
