import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import type { ExecutiveOverview, FollowUp } from "@/lib/executive.types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { ...(await getAuthHeaders()), ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body as T;
}

/** Company-wide executive overview (CEO / administrators only). */
export function useExecutiveOverview() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["executive-overview"],
    queryFn: async () => {
      const data = await api<ExecutiveOverview>("/api/executive/overview");
      // Loading the overview records any new CEO alerts; refresh the notification list to show them.
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
      return data;
    },
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });
}

/** Follow-ups the signed-in user may see (CEO: all; managers: their own). */
export function useFollowUps(enabled = true) {
  return useQuery({
    queryKey: ["executive-followups"],
    queryFn: async () => (await api<{ followUps: FollowUp[] }>("/api/executive/followups")).followUps,
    enabled,
    staleTime: 60_000,
  });
}

export type NewFollowUp = {
  subject: string;
  note?: string;
  assigneeId: string;
  departmentKey?: string | null;
  departmentName?: string | null;
  priority?: FollowUp["priority"];
  relatedTaskId?: string | null;
  relatedClientId?: string | null;
  dueDate?: string | null;
};

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewFollowUp) =>
      api<{ followUp: FollowUp }>("/api/executive/followups", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executive-followups"] });
      qc.invalidateQueries({ queryKey: ["executive-overview"] });
    },
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, response }: { id: string; status: FollowUp["status"]; response?: string }) =>
      api<{ followUp: FollowUp }>(`/api/executive/followups/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, response }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executive-followups"] });
      qc.invalidateQueries({ queryKey: ["executive-overview"] });
      qc.invalidateQueries({ queryKey: ["staff-notifications"] });
    },
  });
}
