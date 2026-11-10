/**
 * Shapes returned by /api/executive (CEO company-wide oversight).
 * Shared by the server (executive-server.ts) and the CEO pages.
 */

export type Severity = "critical" | "warning" | "info";

export type DepartmentKey =
  | "sales"
  | "hr"
  | "finance"
  | "operations"
  | "creative"
  | "seo"
  | "media-buying"
  | "strategy"
  | "onboarding"
  | "websites-software"
  | "crm-ai"
  | "reporting"
  | "client-success"
  | "academy"
  | string;

export interface ExecPerson {
  id: string;
  name: string;
  email: string;
  title: string;
  orgDepartment: string;
  departments: DepartmentKey[];
  roleLabel: string;
  /** named: a real person. shared-role: a generic login for a role or mailbox.
   *  setup-script: created by scripts/seed-sales-users.mjs, not by HR. */
  accountType: "named" | "shared-role" | "setup-script" | "executive";
  tier: string;
  active: boolean;
  lastLoginAt: string | null;
  attendanceToday: "Clocked In" | "On Break" | "Clocked Out" | "No clock-in";
  clockInToday: string | null;
  clockOutToday: string | null;
  hoursToday: string | null;
  daysPresentLast7: number;
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export interface ExecTask {
  id: string;
  title: string;
  department: string;
  departmentKey: DepartmentKey;
  status: string;
  priority: string;
  dueDate: string | null;
  overdue: boolean;
  assignedToId: string;
  assignedToName: string;
  assignedByName: string;
  clientName: string | null;
  createdAt: string;
  completionDate: string | null;
  latestEvidenceId: string | null;
  latestEvidenceStatus: string | null;
}

export interface ExecEvidence {
  id: string;
  taskId: string;
  taskTitle: string;
  departmentKey: DepartmentKey;
  department: string;
  status: string;
  submittedAt: string;
  submittedBy: string;
  submittedById: string;
  reviewedBy: string | null;
  reviewerFeedback: string | null;
  fileCount: number;
  linkCount: number;
  hoursWaiting: number | null;
}

export interface DepartmentScorecard {
  key: DepartmentKey;
  name: string;
  leads: { id: string; name: string; title: string }[];
  members: number;
  tasksTotal: number;
  tasksOpen: number;
  tasksCompleted: number;
  tasksOverdue: number;
  tasksBlocked: number;
  awaitingReview: number;
  changesRequested: number;
  completionRate: number | null;
  onTimeRate: number | null;
  evidenceApprovalRate: number | null;
  presentToday: number;
  status: "attention" | "watch" | "on-track" | "no-activity";
  statusReasons: string[];
}

export interface ExecClient {
  id: string;
  name: string;
  industry: string | null;
  package: string | null;
  createdAt: string | null;
  accountManager: string | null;
  onboarding: {
    stage: string;
    completedSteps: number;
    totalSteps: number;
    progress: number;
    startDate: string | null;
    targetDate: string | null;
    delayed: boolean;
    daysOverdue: number;
    blocker: string | null;
    escalation: string | null;
    nextStep: string | null;
  } | null;
  openTasks: number;
  overdueTasks: number;
  atRisk: boolean;
  riskReasons: string[];
}

export interface FollowUp {
  id: string;
  subject: string;
  note: string;
  priority: "Normal" | "High" | "Urgent";
  departmentKey: DepartmentKey | null;
  departmentName: string | null;
  assigneeId: string;
  assigneeName: string;
  relatedTaskId: string | null;
  relatedClientId: string | null;
  status: "Open" | "Acknowledged" | "Resolved";
  response: string | null;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

export interface FeedItem {
  id: string;
  severity: Severity;
  category:
    | "deliverables"
    | "tasks"
    | "clients"
    | "attendance"
    | "leave"
    | "finance"
    | "sales"
    | "people"
    | "follow-ups";
  title: string;
  detail: string;
  at: string | null;
  link: string;
  departmentKey?: DepartmentKey | null;
}

export interface ExecutiveOverview {
  generatedAt: string;
  today: string;
  business: {
    activeClients: number;
    clientsAddedLast30: number;
    onboardingInProgress: number;
    onboardingDelayed: number;
    atRiskClients: number;
    /** Named employees only (shared role logins and script-created accounts excluded). */
    headcount: number;
    sharedAccounts: number;
    joinersLast30: number;
    openTasks: number;
    overdueTasks: number;
    awaitingReview: number;
    attentionCount: number;
    status: "attention" | "watch" | "on-track";
    statusReasons: string[];
  };
  departments: DepartmentScorecard[];
  people: ExecPerson[];
  attendance: {
    workday: boolean;
    clockedIn: number;
    onBreak: number;
    clockedOut: number;
    noClockIn: number;
    missingClockOut: { id: string; name: string; since: string }[];
  };
  leave: {
    pending: { id: string; name: string; start: string; end: string; reason: string | null; createdAt: string }[];
    upcomingApproved: { id: string; name: string; start: string; end: string }[];
    total: number;
  };
  tasks: ExecTask[];
  evidence: ExecEvidence[];
  clients: ExecClient[];
  sales: {
    recorded: boolean;
    leads: number;
    byStage: { stage: string; count: number; value: number }[];
    openPipelineValue: number;
    wonThisMonth: number;
    wonValueThisMonth: number;
    lost: number;
  };
  finance: {
    recorded: boolean;
    invoicedAgencyFees: number;
    collected: number;
    overdueAmount: number;
    overdueInvoices: number;
    awaitingPayment: number;
    expensesPaid: number;
    expensesPending: number;
    budgets: { dept: string; budget: number; actual: number }[];
    pendingApprovals: { id: string; title: string; department: string; amount: number; requestedBy: string; date: string }[];
    netPosition: number | null;
  };
  followUps: FollowUp[];
  feed: FeedItem[];
  decisions: FeedItem[];
}
