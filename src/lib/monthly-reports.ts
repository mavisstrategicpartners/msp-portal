/** Sections of a department's monthly report (shared by the form, the viewer and the server). */
export const REPORT_SECTIONS = [
  { key: "summary", label: "Summary", help: "The month in a few sentences: overall performance and the main outcome.", required: true },
  { key: "achievements", label: "Achievements and completed work", help: "What was delivered, launched or closed this month." },
  { key: "key_figures", label: "Key figures", help: "The numbers that matter for this department, from your own records." },
  { key: "challenges", label: "Challenges and risks", help: "What slowed the team down or could go wrong." },
  { key: "next_priorities", label: "Priorities for next month", help: "What the department will focus on." },
  { key: "support_needed", label: "Support needed", help: "Decisions, resources or help needed from management." },
] as const;

export type ReportSectionKey = (typeof REPORT_SECTIONS)[number]["key"];

export type ReportFile = { name: string; path: string; size: number; mimeType: string; url?: string; downloadUrl?: string; available?: boolean };

export type MonthlyReportRow = {
  id: string;
  client_id: string | null;
  department_key: string | null;
  department_name: string | null;
  report_type: string;
  title: string;
  reporting_month: string;
  prepared_by_id: string | null;
  prepared_by_name: string | null;
  status: string;
  submitted_at: string | null;
  data: Record<string, any>;
  attachments: ReportFile[];
  status_history: { status: string; at: string; by: string }[];
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  can_manage: boolean;
};
