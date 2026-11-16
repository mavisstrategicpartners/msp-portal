import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api-auth-headers";

/** Calls /api/sales-arena with the signed-in user's token. Errors carry the HTTP status. */
export async function arenaFetch<T = any>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" };
  const res = await fetch(`/api/sales-arena${path}`, { method: init?.method ?? "GET", headers, body: init?.body === undefined ? undefined : JSON.stringify(init.body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data as T;
}
export async function arenaDownload(path: string, filename: string) {
  const res = await fetch(`/api/sales-arena${path}`, { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Export failed");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export type ArenaMe = {
  isCEO: boolean;
  salesperson: { id: string; name: string; is_setter: boolean; is_closer: boolean } | null;
  isPreparer: boolean;
  people: { id: string; name: string; is_setter: boolean; is_closer: boolean }[];
};
export const useArenaMe = () => useQuery({ queryKey: ["arena", "me"], queryFn: () => arenaFetch<ArenaMe>("/me"), staleTime: 60_000, retry: false });

export function useArenaQuery<T = any>(key: unknown[], path: string | null, opts?: { enabled?: boolean }) {
  return useQuery({ queryKey: ["arena", ...key], queryFn: () => arenaFetch<T>(path!), enabled: Boolean(path) && (opts?.enabled ?? true), retry: false, staleTime: 15_000 });
}
export function useArenaMutation(method: "POST" | "PATCH" | "PUT", invalidate: string[] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) => arenaFetch(path, { method, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["arena"] });
      for (const k of invalidate) qc.invalidateQueries({ queryKey: [k] });
    },
  });
}

export const zar = (n: number | null | undefined, opts?: { cents?: boolean }) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? "—"
    : `${Number(n) < 0 ? "-" : ""}R ${Math.abs(Number(n)).toLocaleString("en-ZA", { minimumFractionDigits: opts?.cents ? 2 : 0, maximumFractionDigits: opts?.cents ? 2 : 0 })}`;
export const pctText = (p: { value: number | null; label: string | null } | null | undefined) =>
  !p ? "—" : p.label ? p.label : `${Math.round((p.value ?? 0) * 1000) / 10}%`;
export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(`${d.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
export const fmtDateTime = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" }) : "—";
export const monthLabel = (m: string) => new Date(`${m.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" });
