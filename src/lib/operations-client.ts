import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import {
  ClientRecord,
  CreateClientInput,
  UpdateClientInput,
  ClientCommunicationLog,
} from "./operations.types";


export async function fetchOperationsClients(): Promise<ClientRecord[]> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/operations/clients", { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch clients" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.clients || [];
}

export async function createOperationsClient(input: CreateClientInput): Promise<ClientRecord> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/operations/clients", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Failed to create client (${res.status})`);
  }
  return json.client;
}

export async function updateOperationsClient(
  clientId: string,
  updates: UpdateClientInput
): Promise<ClientRecord> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/operations/clients/${clientId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Failed to update client (${res.status})`);
  }
  return json.client;
}

export async function updateOperationsStep(
  clientId: string,
  stepKey: string,
  completed: boolean,
  blocker?: string | null
): Promise<ClientRecord> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/operations/clients/${clientId}/steps`, {
    method: "POST",
    headers,
    body: JSON.stringify({ stepKey, completed, blocker }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Failed to update onboarding step (${res.status})`);
  }
  return json.client;
}

export async function recordOperationsCommunication(
  clientId: string,
  comm: Partial<ClientCommunicationLog>
): Promise<ClientRecord> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/operations/clients/${clientId}/communications`, {
    method: "POST",
    headers,
    body: JSON.stringify(comm),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Failed to record communication log (${res.status})`);
  }
  return json.client;
}

// ── React Query Hooks ────────────────────────────────────────────────────────

export function useOperationsClients() {
  return useQuery({
    queryKey: ["operations-clients"],
    queryFn: fetchOperationsClients,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOperationsClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-clients"] });
    },
  });
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, updates }: { clientId: string; updates: UpdateClientInput }) =>
      updateOperationsClient(clientId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-clients"] });
    },
  });
}

export function useUpdateStepMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      stepKey,
      completed,
      blocker,
    }: {
      clientId: string;
      stepKey: string;
      completed: boolean;
      blocker?: string | null;
    }) => updateOperationsStep(clientId, stepKey, completed, blocker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-clients"] });
    },
  });
}

export function useRecordCommunicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      comm,
    }: {
      clientId: string;
      comm: Partial<ClientCommunicationLog>;
    }) => recordOperationsCommunication(clientId, comm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-clients"] });
    },
  });
}
