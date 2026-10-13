import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tkjytjaerfjpghusrwom.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";

function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY) },
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const tables = [
    'profiles', 'clients', 'leave_requests', 'monthly_reports', 'audit_logs',
    'employee_declarations', 'user_roles', 'packages', 'services', 'tools', 'sops'
  ];

  for (const table of tables) {
    const { data, count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact' });
    if (error) {
      console.log(`[${table}]: ERROR - ${error.message}`);
    } else {
      console.log(`[${table}]: ${data?.length} rows`);
      if (data && data.length > 0) {
        console.log(`  Sample:`, Object.keys(data[0]));
      }
    }
  }

  const { data: users, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
  if (uErr) {
    console.log("auth.users error:", uErr.message);
  } else {
    console.log(`auth.users: ${users.users.length} users:`);
    users.users.forEach(u => console.log(` - ${u.email} (id: ${u.id})`));
  }
}

main().catch(console.error);
