import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-C4gGyK0D.js
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseAdminClient() {
	const rawUrl = process.env.SUPABASE_URL || "https://tkjytjaerfjpghusrwom.supabase.co";
	const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";
	const SUPABASE_URL = (rawUrl || "").trim();
	const SUPABASE_SERVICE_ROLE_KEY = (rawKey || "").trim();
	if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.warn("[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is not set. Operating with fallback.");
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY) },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
var _supabaseAdmin;
var supabaseAdmin = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
	return Reflect.get(_supabaseAdmin, prop, receiver);
} });
//#endregion
export { supabaseAdmin };
