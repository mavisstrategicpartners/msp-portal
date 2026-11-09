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
  EvidenceReviewStatus, EvidenceFile, EvidenceDetail } from "./staff-tasks.types";
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
      uploadedFiles?: EvidenceFile[];
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

/**
 * Upload one evidence file to the private "evidence" bucket.
 * The server checks the task and file, then issues a one-time upload slot; the
 * file goes straight to storage. Throws on any failure — there is no
 * browser-only fallback, so a submission can never reference a file that the
 * reviewing manager cannot open.
 */
export async function uploadEvidenceFile(file: File, taskId: string): Promise<EvidenceFile> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds the 25 MB upload limit.");
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && !/^image\//.test(file.type) && file.type !== "video/mp4" && !file.type.includes("presentation") && file.type !== "application/vnd.ms-powerpoint") {
    throw new Error(`File format not permitted (${file.type}). Allowed: PDF, Word, Excel, PowerPoint, images, CSV, TXT, ZIP, MP4.`);
  }
  const mimeType = file.type || "application/octet-stream";
  const headers = await getAuthHeaders();
  const slotRes = await fetch("/api/staff/evidence/upload-url", {
    method: "POST",
    headers,
    body: JSON.stringify({ taskId, fileName: file.name, mimeType, size: file.size }),
  });
  const slot = await slotRes.json().catch(() => ({}));
  if (!slotRes.ok || !slot.path || !slot.token) {
    throw new Error(slot.error || "Could not prepare the upload. Please try again.");
  }
  const { error } = await supabase.storage
    .from("evidence")
    .uploadToSignedUrl(slot.path, slot.token, file, { contentType: mimeType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { name: file.name, path: slot.path, url: "", size: file.size, mimeType };
}

/** Full submission with short-lived links to view/download each file. */
export async function fetchEvidenceDetail(evidenceId: string): Promise<EvidenceDetail> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/staff/evidence/${encodeURIComponent(evidenceId)}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load the submission.");
  return data.evidence as EvidenceDetail;
}

export function useEvidenceDetail(evidenceId: string | null | undefined) {
  return useQuery({
    queryKey: ["staff", "evidence", "detail", evidenceId],
    queryFn: () => fetchEvidenceDetail(evidenceId!),
    enabled: Boolean(evidenceId),
    staleTime: 60_000, // signed links last 30 minutes
  });
}
