import { Badge } from "@/components/ui/badge";

export type LeaveRequest = {
  id: string;
  user_id: string;
  leave_type: string | null;
  start_date: string;
  end_date: string;
  days: number | null;
  reason: string | null;
  status: "pending" | "approved" | "declined" | "info_requested";
  hr_note: string | null;
  employee_response: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string | null;
  employee_name?: string | null;
  department?: string | null;
};

export const LEAVE_STATUS_LABEL: Record<LeaveRequest["status"], string> = {
  pending: "Awaiting HR",
  approved: "Approved",
  declined: "Declined",
  info_requested: "More information needed",
};

export function LeaveStatusBadge({ status }: { status: LeaveRequest["status"] }) {
  const cls =
    status === "approved"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "declined"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
        : status === "info_requested"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400";
  return <Badge variant="outline" className={`text-[10px] ${cls}`}>{LEAVE_STATUS_LABEL[status] ?? status}</Badge>;
}
