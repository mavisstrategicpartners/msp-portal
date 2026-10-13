import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tkjytjaerfjpghusrwom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kU8G-7AUhbhiWPqd8XD6Ow_GNViYCDs";

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

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) }
});

async function main() {
  const tables = [
    'profiles', 'clients', 'leave_requests', 'monthly_reports', 'audit_logs',
    'hr_employees', 'hr_attendance', 'hr_leave', 'hr_payroll_records', 'hr_reviews'
  ];

  for (const table of tables) {
    const { data, count, error } = await supabase.from(table).select('*', { count: 'exact' });
    if (error) {
      console.log(`[${table}]: ERROR - ${error.message}`);
    } else {
      console.log(`[${table}]: ${data?.length} rows`);
      if (data && data.length > 0) {
        console.log(` Sample:`, data[0]);
      }
    }
  }
}

main().catch(console.error);
