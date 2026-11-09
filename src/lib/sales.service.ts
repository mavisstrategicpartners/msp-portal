import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import {
  LeadItem,
  DuplicateCheckResult,
  SalesTarget,
  ConsultantPerformanceRanking,
  IndustryPerformanceSummary,
  GHLAppointment,
} from "./sales.types";


// ── 1. Leads Hooks ───────────────────────────────────────────────────────────

export function useSalesLeads(filters?: {
  consultantId?: string;
  industry?: string;
  stage?: string;
}) {
  return useQuery({
    queryKey: ["sales", "leads", filters],
    queryFn: async (): Promise<LeadItem[]> => {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.consultantId) params.set("consultantId", filters.consultantId);
      if (filters?.industry) params.set("industry", filters.industry);
      if (filters?.stage) params.set("stage", filters.stage);

      const url = `/api/sales/leads${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load leads");
      }
      const data = await res.json();
      return data.leads || [];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useCheckDuplicateLead() {
  return useMutation({
    mutationFn: async (payload: {
      email?: string;
      phone?: string;
      businessName?: string;
      excludeId?: string;
    }): Promise<DuplicateCheckResult> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/check-duplicate", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to check duplicate lead");
      }
      return await res.json();
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadData: Partial<LeadItem>): Promise<LeadItem> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/leads", {
        method: "POST",
        headers,
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error || "Failed to create lead");
        (err as any).duplicate = data.duplicate;
        throw err;
      }
      return data.lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "industry-performance"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<LeadItem> & { id: string }): Promise<LeadItem> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/sales/leads/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error || "Failed to update lead");
        (err as any).duplicate = data.duplicate;
        throw err;
      }
      return data.lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "industry-performance"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/sales/leads/${leadId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete lead");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "industry-performance"] });
    },
  });
}

// ── 2. Targets & Leaderboard Hooks ───────────────────────────────────────────

export function useSalesTargets(month?: string) {
  return useQuery({
    queryKey: ["sales", "targets", month],
    queryFn: async (): Promise<SalesTarget[]> => {
      const headers = await getAuthHeaders();
      const url = month ? `/api/sales/targets?month=${month}` : "/api/sales/targets";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error("Failed to load targets");
      }
      const data = await res.json();
      return data.targets || [];
    },
    staleTime: 15_000,
  });
}

export function useAssignSalesTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      consultantId: string;
      consultantName?: string;
      consultantEmail?: string;
      month: string;
      targetAmount: number;
    }): Promise<SalesTarget> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/targets", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to assign target");
      }
      return data.target;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "targets"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "leaderboard"] });
    },
  });
}

export function useSalesLeaderboard(month?: string) {
  return useQuery({
    queryKey: ["sales", "leaderboard", month],
    queryFn: async (): Promise<ConsultantPerformanceRanking[]> => {
      const headers = await getAuthHeaders();
      const url = month ? `/api/sales/leaderboard?month=${month}` : "/api/sales/leaderboard";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error("Failed to load leaderboard");
      }
      const data = await res.json();
      return data.rankings || [];
    },
    staleTime: 10_000,
  });
}

// ── 3. Industry Performance Hook ─────────────────────────────────────────────

export function useIndustryPerformance() {
  return useQuery({
    queryKey: ["sales", "industry-performance"],
    queryFn: async (): Promise<IndustryPerformanceSummary[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/industry-performance", { headers });
      if (!res.ok) {
        throw new Error("Failed to load industry performance");
      }
      const data = await res.json();
      return data.industryPerformance || [];
    },
    staleTime: 15_000,
  });
}

// ── 4. GoHighLevel Appointments Hooks ─────────────────────────────────────────

export function useGHLAppointments() {
  return useQuery({
    queryKey: ["sales", "ghl", "appointments"],
    queryFn: async (): Promise<GHLAppointment[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/ghl/appointments", { headers });
      if (!res.ok) {
        throw new Error("Failed to load GoHighLevel appointments");
      }
      const data = await res.json();
      return data.appointments || [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useSyncGHL() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/sales/ghl/sync", {
        method: "POST",
        headers,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "ghl", "appointments"] });
    },
  });
}

