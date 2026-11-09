import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck } from "lucide-react";
import { GeneralManagerDashboard } from "./GeneralManagerDashboard";
import { OperationsDashboard } from "./OperationsDashboard";
import { DepartmentManagerDashboard } from "./DepartmentManagerDashboard";
import { FinanceAdminDashboard } from "./FinanceAdminDashboard";
import { CeoDashboard } from "./CeoDashboard";
import { StaffWorkspaceDashboard } from "./StaffWorkspaceDashboard";
import { SalesDashboard } from "./SalesDashboard";
import { ClientSuccessDashboard } from "./ClientSuccessDashboard";
import { HRStaffDashboard } from "./HRStaffDashboard";
import { useProfile, MspSystemRole } from "@/lib/use-profile";

const ROLE_AUTHORITY_MAP: Record<MspSystemRole, { title: string; authority: string }> = {
  ceo: {
    title: "Chief Executive Officer (Command Centre)",
    authority: "Company-wide executive command, 5 health views, strategic actions and high-level escalations.",
  },
  general_manager: {
    title: "Managing Director / General Manager",
    authority: "Company execution, revenue target, capacity, manager approvals, cross-department dependencies and unresolved escalations.",
  },
  operations: {
    title: "Operations & Relationship Manager",
    authority: "All client workflows, 2-day onboarding pipeline, service deadlines, recovery plans and verification queues.",
  },
  department_manager: {
    title: "Department Manager",
    authority: "Own department workload, targets, QA, assignments, blocker review and approvals.",
  },
  finance_admin: {
    title: "Finance & Administration",
    authority: "Invoices, verified payments, collections, costs and account access appropriate to duties.",
  },
  hr: {
    title: "Human Resources & Performance",
    authority: "Workforce directory, attendance oversight, leave approval and employee performance scorecards.",
  },
  admin: {
    title: "System Administrator",
    authority: "User account management, access provisioning, audit logs and integration maintenance.",
  },
  sales: {
    title: "Sales & Business Development",
    authority: "Lead pipeline, consultation follow-ups, proposal submissions and verified closed-won opportunities.",
  },
  sales_manager: {
    title: "Sales Manager Command",
    authority: "Team revenue performance, consultant quota assignment, GHL calendar integration and lead deduplication.",
  },
  sales_consultant: {
    title: "Sales Consultant Workspace",
    authority: "Personal deal pipeline, assigned monthly target quota, scheduled appointments, and daily follow-up queue.",
  },
  client_success: {
    title: "Client Success & Relationship",
    authority: "Account health tracking, monthly client check-ins, customer satisfaction scores and retention recovery.",
  },
  staff: {
    title: "Employee / Specialist Workspace",
    authority: "Assigned tasks, deliverable evidence submission, live time tracking, personal scorecards and leave requests.",
  },
};

export function RoleDashboardContainer() {
  const { data: profileData } = useProfile();
  const systemRole: MspSystemRole = profileData?.systemRole || "staff";
  const roleConfig = ROLE_AUTHORITY_MAP[systemRole] || ROLE_AUTHORITY_MAP.staff;

  return (
    <div className="space-y-6">
      {/* ─── Role Authority Eyebrow Banner (Strictly Verified, No Switcher) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-foreground">{roleConfig.title}:</span>
          <span>{roleConfig.authority}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock className="h-3 w-3" /> Africa/Johannesburg (08:00–17:00 SAST)
        </div>
      </div>

      {/* ─── Render Verified Role Dashboard ─────────────────────────────────── */}
      {systemRole === "ceo" && <CeoDashboard />}
      {systemRole === "general_manager" && <GeneralManagerDashboard />}
      {systemRole === "operations" && <OperationsDashboard />}
      {systemRole === "department_manager" && <DepartmentManagerDashboard />}
      {systemRole === "finance_admin" && <FinanceAdminDashboard />}
      {(systemRole === "sales" || systemRole === "sales_manager" || systemRole === "sales_consultant") && (
        <SalesDashboard />
      )}
      {systemRole === "client_success" && <ClientSuccessDashboard />}
      {systemRole === "staff" && <StaffWorkspaceDashboard />}
      {systemRole === "admin" && <GeneralManagerDashboard />}
      {systemRole === "hr" && <HRStaffDashboard />}
    </div>
  );
}
