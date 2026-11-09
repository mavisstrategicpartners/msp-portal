import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import {
  StaffTask,
  DependencyRequest,
  EvidenceSubmission,
  StaffNotification,
  PersonalScorecard,
  TaskPriority,
  TaskStatus,
  DependencyStatus,
  EvidenceReviewStatus,
} from "./staff-tasks.types";
import { toast } from "sonner";


// ── 1. Tasks Queries & Mutations ─────────────────────────────────────────────

export function useStaffTasks(options?: { all?: boolean }) {
  return useQuery({
    queryKey: ["staff", "tasks", options?.all],
    queryFn: async (): Promise<StaffTask[]> => {
      const headers = await getAuthHeaders();
      const url = options?.all ? "/api/staff/tasks?all=true" : "/api/staff/tasks";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load tasks");
      }
      const data = await res.json();
      return data.tasks || [];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateStaffTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      progress,
      note,
      dueDate,
      priority,
      blockReason,
    }: {
      taskId: string;
      status?: TaskStatus;
      progress?: number;
      note?: string;
      dueDate?: string | null;
      priority?: TaskPriority;
      blockReason?: string;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/staff/tasks/${taskId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, progress, note, dueDate, priority, blockReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update task");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "scorecard"] });
    },
  });
}

// ── 2. Dependency Requests Queries & Mutations ───────────────────────────────

export function useStaffDependencies(options?: { all?: boolean }) {
  return useQuery({
    queryKey: ["staff", "dependencies", options?.all],
    queryFn: async (): Promise<DependencyRequest[]> => {
      const headers = await getAuthHeaders();
      const url = options?.all ? "/api/staff/dependencies?all=true" : "/api/staff/dependencies";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load dependencies");
      }
      const data = await res.json();
      return data.dependencies || [];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useCreateDependencyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      recipientId?: string;
      recipientName?: string;
      recipientDepartment: string;
      blockerDescription: string;
      neededResource: string;
      urgency: TaskPriority;
      requestedByDate?: string | null;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/staff/dependencies", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit dependency request");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "scorecard"] });
    },
  });
}

export function useUpdateDependencyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dependencyId,
      status,
      responseNotes,
      comment,
    }: {
      dependencyId: string;
      status?: DependencyStatus;
      responseNotes?: string;
      comment?: string;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/staff/dependencies/${dependencyId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, responseNotes, comment }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update dependency");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "scorecard"] });
    },
  });
}

// ── 3. Evidence Submissions Queries & Mutations ──────────────────────────────

export function useStaffEvidence(taskId?: string) {
  return useQuery({
    queryKey: ["staff", "evidence", taskId],
    queryFn: async (): Promise<EvidenceSubmission[]> => {
      const headers = await getAuthHeaders();
      const url = taskId ? `/api/staff/evidence?taskId=${taskId}` : "/api/staff/evidence";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load evidence submissions");
      }
      const data = await res.json();
      return data.evidence || [];
    },
    staleTime: 10_000,
  });
}

export function useSubmitEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      deliverableLinks?: { title: string; url: string }[];
      uploadedFiles?: { name: string; url: string; size: number; mimeType: string }[];
      writtenExplanation: string;
      status?: EvidenceReviewStatus;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/staff/evidence", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit evidence");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "evidence"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "scorecard"] });
    },
  });
}

export function useReviewEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      status,
      reviewerFeedback,
    }: {
      evidenceId: string;
      status: EvidenceReviewStatus;
      reviewerFeedback: string;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/staff/evidence/${evidenceId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, reviewerFeedback }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit review");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "evidence"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "scorecard"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

// ── 4. Personal Scorecard Query ──────────────────────────────────────────────

export function useStaffScorecard(userId?: string) {
  return useQuery({
    queryKey: ["staff", "scorecard", userId],
    queryFn: async (): Promise<PersonalScorecard> => {
      const headers = await getAuthHeaders();
      const url = userId ? `/api/staff/scorecard?userId=${userId}` : "/api/staff/scorecard";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load scorecard");
      }
      const data = await res.json();
      return data.scorecard;
    },
    staleTime: 15_000,
  });
}

// ── 5. Notifications Queries & Mutations ─────────────────────────────────────

export function useStaffNotifications() {
  return useQuery({
    queryKey: ["staff", "notifications"],
    queryFn: async (): Promise<{ notifications: StaffNotification[]; unreadCount: number }> => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/staff/notifications", { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load notifications");
      }
      return await res.json();
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, read = true }: { id: string; read?: boolean }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/staff/notifications/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ read }),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/staff/notifications/read-all", {
        method: "POST",
        headers,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

// ── 6. Secure Evidence File Upload to Supabase ───────────────────────────────

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/zip",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function uploadEvidenceFile(
  file: File,
  taskId: string
): Promise<{ name: string; url: string; size: number; mimeType: string }> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `File format not permitted (${file.type || "unknown"}). Allowed: PDF, Word, Excel, PNG, JPG, CSV, ZIP.`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 25MB maximum upload limit.");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${taskId}/${Date.now()}_${cleanName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.warn("Supabase storage upload error, falling back to local object preview:", uploadError);
      return {
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
      };
    }

    // Try creating signed URL (expires in 7 days for authorized inspection)
    const { data: signedData, error: signError } = await supabase.storage
      .from("evidence")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (!signError && signedData?.signedUrl) {
      return {
        name: file.name,
        url: signedData.signedUrl,
        size: file.size,
        mimeType: file.type,
      };
    }

    const { data: publicData } = supabase.storage.from("evidence").getPublicUrl(path);
    return {
      name: file.name,
      url: publicData.publicUrl,
      size: file.size,
      mimeType: file.type,
    };
  } catch (err: any) {
    return {
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
    };
  }
}
