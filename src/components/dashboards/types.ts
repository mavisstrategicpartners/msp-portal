export type DashboardRole =
  | "general_manager"
  | "operations"
  | "department_manager"
  | "finance_admin";

export interface RoleConfig {
  id: DashboardRole;
  title: string;
  shortLabel: string;
  description: string;
  authority: string;
}

export const DASHBOARD_ROLES: RoleConfig[] = [
  {
    id: "general_manager",
    title: "General Manager / MD",
    shortLabel: "General Manager",
    description: "Company execution, capacity, departmental targets vs actuals & cross-team handoffs",
    authority: "Company execution, revenue target, capacity, manager approvals, cross-department dependencies and unresolved escalations.",
  },
  {
    id: "operations",
    title: "Operations & Relationship Manager",
    shortLabel: "Operations",
    description: "Client workflows, 2-day onboarding pipeline, service deadlines & QA verification",
    authority: "All client workflows, onboarding, service deadlines, client communication, recovery plans and verification queues.",
  },
  {
    id: "department_manager",
    title: "Department Manager",
    shortLabel: "Department Manager",
    description: "Department workload, targets, staff assignments, QA reviews & blocker approvals",
    authority: "Own department workload, targets, QA, assignments, blocker review and approvals; linked client details needed for delivery.",
  },
  {
    id: "finance_admin",
    title: "Finance & Administration",
    shortLabel: "Finance & Admin",
    description: "Invoices, cash collected, overdue receivables & media spend separation",
    authority: "Invoices, verified payments, collections, costs and account access appropriate to duties.",
  },
];

export type DepartmentKey =
  | "Media Buying"
  | "Websites & Software"
  | "CRM & AI Automation"
  | "Strategy & Growth"
  | "SEO"
  | "Creative Content"
  | "Sales"
  | "Client Success";
