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
  const [tasks, escalations, approvals, profiles, clients] = await Promise.all([
    supabase.from("ops_tasks").select("count"),
    supabase.from("ops_escalations").select("count"),
    supabase.from("ops_approvals").select("count"),
    supabase.from("profiles").select("count"),
    supabase.from("clients").select("count")
  ]);

  console.log("Tasks count:", tasks.count, "error:", tasks.error?.message);
  console.log("Escalations count:", escalations.count, "error:", escalations.error?.message);
  console.log("Approvals count:", approvals.count, "error:", approvals.error?.message);
  console.log("Profiles count:", profiles.count, "error:", profiles.error?.message);
  console.log("Clients count:", clients.count, "error:", clients.error?.message);
}

main().catch(console.error);
