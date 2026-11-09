import { supabase } from "@/integrations/supabase/client";

/**
 * Headers for calls to the portal's own /api endpoints. Identity is proven
 * only by the Supabase session token; the server ignores any user id or role
 * a browser claims in other headers.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}
