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
  // Fetch swagger/openapi spec to see ALL tables in public
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_PUBLISHABLE_KEY}`);
  const spec = await res.json();
  console.log("ALL DEFINITIONS IN SCHEMA:");
  console.log(Object.keys(spec.definitions || {}));
}

main().catch(console.error);
