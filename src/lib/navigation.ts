/**
 * MSP Portal — single source of truth for navigation.
 *
 * Every sidebar, the portal search dialog and the workspace access guard read
 * from this file. To add, rename or move a page, change it here only.
 *
 * Concepts
 * - Workspace: a role-specific area of the portal (CEO, GM, HR, Sales, ...).
 *   Each workspace owns a set of URL prefixes, a list of nav groups and an
 *   access rule. A user's "home" workspace comes from their system role.
 * - Shared groups: features every signed-in user needs (personal items and the
 *   company knowledge base). They appear exactly once per sidebar, never
 *   inside a workspace group.
 * - Shared pages (e.g. /services, /me/*, /admin/sales-playbook) do not belong
 *   to a workspace, so visiting them keeps the user's own workspace sidebar.
 */
import {
  AlertTriangle,
  Activity,
  Banknote,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  Compass,
  Crown,
  FileBarChart2,
  FileSignature,
  Folder,
  GitBranch,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListChecks,
  ListTree,
  Map as MapIcon,
  MessageCircle,
  Network,
  Plug,
  Settings,
  ShieldCheck,
  Tag,
  Target,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import type { MspSystemRole } from "@/lib/use-profile";

export type NavIcon = typeof LayoutDashboard;

export type NavItem = {
  to: string;
  label: string;
  icon: NavIcon;
  /** Only highlight on an exact path match (used for workspace root pages). */
  exact?: boolean;
  /** Extra paths that should also highlight this item. */
  alsoActive?: string[];
  /** Optional visibility rule on top of the workspace/group rule. */
  visible?: (ctx: NavContext) => boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
  /** Initial expanded state before the user toggles it. Defaults to true. */
  defaultOpen?: boolean;
  visible?: (ctx: NavContext) => boolean;
};

export type WorkspaceKey =
  "staff" | "admin" | "hr" | "ceo" | "gm" | "operations" | "department" | "sales" | "finance";

export type NavContext = {
  systemRole: MspSystemRole;
  /** Explicit CEO grant: may open every department workspace (read-only oversight). */
  isCEO?: boolean;
  /** CEO or system administrator. */
  canViewCompany?: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isSales: boolean;
  isManagerOrAbove: boolean;
  departmentName?: string | null;
  /** Appointed manager of at least one department (department_leads). */
  isDepartmentLead?: boolean;
};

type Workspace = {
  title: (ctx: NavContext) => string;
  subtitle: string;
  /** Landing page of the workspace (used by the workspace switcher). */
  home: string;
  /** URL prefixes owned by this workspace. */
  prefixes: string[];
  /** Who may open pages in this workspace. Mirrors the pre-existing page guards. */
  access: (ctx: NavContext) => boolean;
  /**
   * Who sees this workspace in the "Workspaces" switcher. Defaults to `access`.
   * Use it when a role may open a workspace by link but does not work in it day to day.
   */
  listFor?: (ctx: NavContext) => boolean;
  groups: NavGroup[];
};

const isManagerOnly = (ctx: NavContext) => ctx.isManagerOrAbove || ctx.isAdmin;

export const WORKSPACES: Record<WorkspaceKey, Workspace> = {
  staff: {
    title: () => "Staff Portal",
    subtitle: "Internal operations portal",
    home: "/home",
    prefixes: [],
    access: () => true,
    groups: [
      {
        id: "staff-home",
        label: "Home",
        items: [{ to: "/home", label: "Dashboard", icon: LayoutDashboard, exact: true }],
      },
      {
        id: "staff-delivery",
        label: "Client Delivery",
        visible: isManagerOnly,
        items: [{ to: "/reports", label: "Monthly Reports", icon: FileBarChart2 }],
      },
    ],
  },

  ceo: {
    title: () => "CEO Executive Dashboard",
    subtitle: "Company-wide Executive Oversight",
    home: "/ceo",
    prefixes: ["/ceo"],
    access: (ctx) => Boolean(ctx.isCEO) || ctx.isAdmin,
    // The CEO's own navigation. Shown on every page she opens (see
    // activeWorkspace), so visiting a department workspace never turns her
    // sidebar into the GM's, Operations' or a manager's.
    groups: [
      {
        id: "ceo-exec",
        label: "Executive",
        items: [
          { to: "/ceo", label: "Executive Overview", icon: LayoutDashboard, exact: true },
          { to: "/ceo/performance", label: "Company Performance", icon: TrendingUp },
          { to: "/ceo/departments", label: "Departments", icon: Building2 },
          { to: "/ceo/structure", label: "Department Structure", icon: Network },
        ],
      },
      {
        id: "ceo-org",
        label: "Organisation",
        items: [
          { to: "/ceo/team", label: "People & Workforce", icon: Users },
          { to: "/ceo/clients", label: "Clients & Onboarding", icon: Briefcase },
          { to: "/ceo/delivery", label: "Operations & Deliverables", icon: ListChecks },
          { to: "/ceo/evidence", label: "Evidence & Approvals", icon: CheckSquare },
        ],
      },
      {
        id: "ceo-finance",
        label: "Finance & Reporting",
        items: [
          { to: "/ceo/revenue", label: "Financial Overview", icon: Banknote },
          { to: "/reports", label: "Reports & Analytics", icon: FileBarChart2 },
        ],
      },
      {
        id: "ceo-leadership",
        label: "Leadership",
        items: [
          { to: "/ceo/initiatives", label: "Strategic Initiatives", icon: Target },
          { to: "/ceo/notifications", label: "Notifications", icon: AlertTriangle },
        ],
      },
      {
        id: "ceo-inspect",
        label: "Inspect Department Workspaces",
        defaultOpen: false,
        visible: (ctx) => Boolean(ctx.isCEO),
        items: [
          { to: "/gm", label: "GM Workspace (view)", icon: Crown, exact: true },
          { to: "/operations", label: "Operations Workspace (view)", icon: Layers, exact: true },
          { to: "/department", label: "Department Workspace (view)", icon: Building2, exact: true },
          { to: "/sales", label: "Sales Workspace (view)", icon: TrendingUp, exact: true },
          { to: "/finance", label: "Finance Workspace (view)", icon: Banknote, exact: true },
          { to: "/hr", label: "HR Workspace (view)", icon: Users, exact: true },
        ],
      },
      {
        id: "ceo-account",
        label: "Account",
        visible: (ctx) => Boolean(ctx.isCEO),
        items: [{ to: "/me/profile", label: "Account Settings", icon: Settings }],
      },
    ],
  },

  gm: {
    title: () => "GM Workspace",
    subtitle: "Company Execution & Operations",
    home: "/gm",
    prefixes: ["/gm"],
    access: (ctx) => ctx.systemRole === "general_manager" || ctx.isAdmin || Boolean(ctx.isCEO),
    groups: [
      {
        id: "gm-command",
        label: "GM Command Centre",
        items: [
          { to: "/gm", label: "GM Dashboard", icon: LayoutDashboard, exact: true },
          { to: "/gm/execution", label: "Company Execution", icon: Target },
          { to: "/gm/revenue", label: "Revenue Performance", icon: Banknote },
          { to: "/gm/capacity", label: "Capacity & Workload", icon: Users },
          { to: "/gm/structure", label: "Department Structure", icon: Network },
          { to: "/gm/approvals", label: "Manager Approvals", icon: CheckSquare },
          { to: "/gm/dependencies", label: "Cross-Dept Dependencies", icon: GitBranch },
          { to: "/gm/escalations", label: "Escalations", icon: AlertTriangle },
        ],
      },
    ],
  },

  operations: {
    title: () => "Operations & Relationships",
    subtitle: "Client Delivery & Retention",
    home: "/operations",
    prefixes: ["/operations"],
    access: (ctx) =>
      ctx.systemRole === "operations" ||
      ctx.systemRole === "general_manager" ||
      ctx.isAdmin ||
      Boolean(ctx.isCEO),
    groups: [
      {
        id: "ops-delivery",
        label: "Client Delivery",
        items: [
          { to: "/operations", label: "Operations Dashboard", icon: LayoutDashboard, exact: true },
          { to: "/operations/onboarding", label: "Client Onboarding", icon: ClipboardList },
          { to: "/operations/workflows", label: "Client Workflows", icon: Layers },
          { to: "/operations/deadlines", label: "Service Deadlines", icon: Clock },
          { to: "/operations/verifications", label: "Verification Queue", icon: CheckSquare },
          { to: "/reports", label: "Monthly Reports", icon: FileBarChart2 },
        ],
      },
      {
        id: "ops-relationships",
        label: "Client Relationships",
        items: [
          { to: "/operations/communications", label: "Client Communications", icon: MessageCircle },
          { to: "/operations/recovery", label: "Recovery Plans", icon: ShieldCheck },
          { to: "/operations/escalations", label: "Escalations", icon: AlertTriangle },
        ],
      },
    ],
  },

  department: {
    title: (ctx) =>
      ctx.isCEO ? "Departments (company view)" : `${ctx.departmentName || "Media Buying"} Workspace`,
    subtitle: "Team Execution & QA Approval",
    home: "/department",
    prefixes: ["/department"],
    // Department managers run their own team; Operations and the GM oversee
    // delivery across departments. Other managers (Sales, Finance, HR) are not
    // given another department's workspace just because they manage people.
    access: (ctx) =>
      ctx.isAdmin ||
      Boolean(ctx.isCEO) ||
      Boolean(ctx.isDepartmentLead) ||
      ["department_manager", "operations", "general_manager"].includes(ctx.systemRole),
    groups: [
      {
        id: "dept-team",
        label: "Team Execution",
        items: [
          { to: "/department", label: "Department Dashboard", icon: LayoutDashboard, exact: true },
          { to: "/department/tasks", label: "Department Tasks", icon: ListChecks },
          { to: "/department/workload", label: "Team Workload", icon: Users },
          { to: "/department/qa", label: "Quality Assurance", icon: ShieldCheck },
          { to: "/department/approvals", label: "Approvals", icon: CheckSquare },
          { to: "/department/review", label: "Department Review", icon: ClipboardList },
          { to: "/department/blockers", label: "Blockers & Dependencies", icon: GitBranch },
        ],
      },
      {
        id: "dept-performance",
        label: "Performance & Clients",
        items: [
          { to: "/department/performance", label: "Targets & Performance", icon: Target },
          { to: "/department/clients", label: "Client Delivery Details", icon: Building2 },
          { to: "/reports", label: "Monthly Reports", icon: FileBarChart2 },
        ],
      },
    ],
  },

  sales: {
    title: () => "Sales Workspace",
    subtitle: "Pipeline & Revenue Generation",
    home: "/sales",
    prefixes: ["/sales"],
    access: (ctx) =>
      ctx.isSales || ctx.systemRole === "general_manager" || ctx.isAdmin || Boolean(ctx.isCEO),
    groups: [
      {
        id: "sales-command",
        label: "Sales Command",
        items: [
          { to: "/sales", label: "Sales Dashboard", icon: LayoutDashboard, exact: true },
          { to: "/admin/sales-playbook", label: "Sales Playbook", icon: ClipboardList },
        ],
      },
    ],
  },

  finance: {
    title: () => "Finance & Administration",
    subtitle: "Financial Oversight & Control",
    home: "/finance",
    prefixes: ["/finance"],
    // Mirrors the beforeLoad guard on /finance.
    access: (ctx) => ["finance_admin", "ceo", "admin", "general_manager"].includes(ctx.systemRole),
    groups: [
      {
        id: "finance-main",
        label: "Finance & Admin",
        items: [{ to: "/finance", label: "Finance Dashboard", icon: LayoutDashboard, exact: true }],
      },
    ],
  },

  hr: {
    title: () => "HR Workspace",
    subtitle: "Human Resources Management",
    home: "/hr",
    prefixes: ["/hr", "/host/hr"],
    // Mirrors the beforeLoad guards on /hr/*.
    access: (ctx) => ctx.isHR || ctx.isAdmin || Boolean(ctx.isCEO),
    groups: [
      {
        id: "hr-overview",
        label: "HR Overview",
        items: [
          {
            to: "/hr",
            label: "HR Dashboard",
            icon: LayoutDashboard,
            exact: true,
            alsoActive: ["/host/hr"],
          },
          { to: "/hr/attendance", label: "Live Staff Presence", icon: Clock },
        ],
      },
      {
        id: "hr-time-pay",
        label: "Time, Leave & Pay",
        items: [
          {
            to: "/hr/leave",
            label: "Leave Management",
            icon: CalendarDays,
            alsoActive: ["/host/hr/leave"],
          },
          {
            to: "/hr/timesheets",
            label: "Timesheets",
            icon: ClipboardList,
            alsoActive: ["/host/hr/timesheets"],
          },
          { to: "/hr/payroll", label: "Payroll", icon: Banknote, alsoActive: ["/host/hr/payroll"] },
        ],
      },
      {
        id: "hr-people",
        label: "People",
        items: [
          {
            to: "/hr/documents",
            label: "Employee Documents",
            icon: Folder,
            alsoActive: ["/host/hr/documents"],
          },
          {
            to: "/hr/relations",
            label: "Employee Relations",
            icon: HeartHandshake,
            alsoActive: ["/host/hr/relations"],
          },
          {
            to: "/hr/recruitment",
            label: "Recruitment",
            icon: UserPlus,
            alsoActive: ["/host/hr/recruitment"],
          },
          { to: "/host/hr/talent", label: "Talent Management", icon: Crown },
          { to: "/host/hr/training", label: "Training & Development", icon: GraduationCap },
        ],
      },
      {
        id: "hr-insights",
        label: "Insights & Admin",
        items: [
          {
            to: "/hr/performance",
            label: "HR Performance",
            icon: BarChart3,
            alsoActive: ["/host/hr/performance"],
          },
          { to: "/host/hr/admin", label: "HR Administration", icon: Settings },
          { to: "/host/hr/integrations", label: "HR Integrations", icon: Plug },
        ],
      },
    ],
  },

  admin: {
    title: () => "Admin Control",
    subtitle: "MSP Admin Control Panel",
    home: "/admin/users",
    prefixes: [
      "/admin/users",
      "/admin/team",
      "/admin/attendance",
      "/admin/operations",
      "/admin/kpis",
      "/admin/content",
      "/admin/audit",
      "/admin/structure",
    ],
    // Mirrors the /admin/audit guard: admins and the CEO, never Finance.
    access: (ctx) => ctx.isAdmin && ctx.systemRole !== "finance_admin",
    groups: [
      {
        id: "admin-people",
        label: "People & Presence",
        items: [
          {
            to: "/home",
            label: "Admin Overview",
            icon: LayoutDashboard,
            exact: true,
            // /home is the admin control panel for system admins; the CEO is redirected to /ceo.
            visible: (ctx) => ctx.systemRole !== "ceo",
          },
          { to: "/admin/users", label: "Manage Staff", icon: Users },
          { to: "/admin/structure", label: "Department Structure", icon: Network },
          { to: "/admin/attendance", label: "Live Staff Presence", icon: Clock },
        ],
      },
      {
        id: "admin-control",
        label: "System Control",
        items: [
          { to: "/admin/operations", label: "Operations Control", icon: Activity },
          { to: "/admin/kpis", label: "KPI Dashboards", icon: BarChart3 },
          { to: "/admin/content", label: "Content Editor", icon: Settings },
          { to: "/admin/sales-playbook", label: "Sales Playbook", icon: ClipboardList },
          { to: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
        ],
      },
    ],
  },
};

/** Workspace order used by the workspace switcher. */
const WORKSPACE_ORDER: WorkspaceKey[] = [
  "ceo",
  "gm",
  "operations",
  "department",
  "sales",
  "finance",
  "hr",
  "admin",
];

/** Personal items: every employee, but not the CEO or the system administrator. */
export const PERSONAL_GROUP: NavGroup = {
  id: "my-workspace",
  label: "My Workspace",
  visible: (ctx) => ctx.systemRole !== "ceo" && ctx.systemRole !== "admin" && !ctx.isAdmin,
  items: [
    { to: "/me/leave", label: "My Leave Requests", icon: CalendarDays },
    { to: "/me/declaration", label: "My HR Documents", icon: FileSignature },
  ],
};

/** Company knowledge base: shown once, collapsed by default, for everyone. */
export const KNOWLEDGE_GROUP: NavGroup = {
  id: "knowledge",
  label: "Knowledge Base",
  defaultOpen: false,
  items: [
    { to: "/who-we-are", label: "Who We Are", icon: Compass },
    { to: "/services", label: "Our Services", icon: Briefcase },
    { to: "/pricing", label: "Pricing & Packages", icon: Tag },
    { to: "/sops", label: "SOP Library", icon: BookOpen },
    { to: "/glossary", label: "Glossary", icon: ListTree },
    { to: "/roadmap", label: "Client Build Roadmap", icon: MapIcon },
    { to: "/tools", label: "Tools & Systems", icon: Wrench },
    { to: "/departments", label: "Departments Directory", icon: Building2 },
  ],
};

/** Pages reachable only from the account menu or search, never the sidebar. */
const ACCOUNT_ITEMS: NavItem[] = [
  { to: "/me/profile", label: "My Profile", icon: User },
  {
    to: "/admin/team",
    label: "Team & Admin Rights",
    icon: KeyRound,
    visible: (ctx) => WORKSPACES.admin.access(ctx),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function pathMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function isItemActive(item: NavItem, pathname: string) {
  const targets = [item.to, ...(item.alsoActive ?? [])];
  return targets.some((t) => (item.exact ? pathname === t : pathMatches(pathname, t)));
}

/** The workspace that owns a URL, or null for shared pages. */
export function workspaceForPath(pathname: string): WorkspaceKey | null {
  for (const key of WORKSPACE_ORDER) {
    if (WORKSPACES[key].prefixes.some((p) => pathMatches(pathname, p))) return key;
  }
  return null;
}

/** The workspace a user lands in, based on their role. */
export function homeWorkspace(ctx: NavContext): WorkspaceKey {
  switch (ctx.systemRole) {
    case "ceo":
      return "ceo";
    case "general_manager":
      return "gm";
    case "operations":
      return "operations";
    case "department_manager":
      return "department";
    case "hr":
      return "hr";
    case "finance_admin":
      return "finance";
    case "sales":
    case "sales_manager":
    case "sales_consultant":
      return "sales";
    case "admin":
      return "admin";
    default:
      return ctx.isAdmin ? "admin" : "staff";
  }
}

/** Whether the user may open a URL. Shared pages are always allowed here. */
/**
 * Shared pages (no workspace sidebar of their own) that are still restricted.
 * The Sales Playbook appears in both the Sales and Admin sidebars.
 */
const RESTRICTED_SHARED_PAGES: { prefix: string; access: (ctx: NavContext) => boolean }[] = [
  {
    prefix: "/admin/sales-playbook",
    access: (ctx) =>
      ctx.isSales || ctx.isAdmin || ctx.systemRole === "general_manager" || Boolean(ctx.isCEO),
  },
];

export function canAccessPath(pathname: string, ctx: NavContext) {
  const rule = RESTRICTED_SHARED_PAGES.find((r) => pathMatches(pathname, r.prefix));
  if (rule) return rule.access(ctx);
  const ws = workspaceForPath(pathname);
  return ws ? WORKSPACES[ws].access(ctx) : true;
}

/** The workspace whose sidebar should be shown for the current URL. */
export function activeWorkspace(pathname: string, ctx: NavContext): WorkspaceKey {
  // The CEO always sees her own executive navigation, whichever page she opens.
  if (ctx.isCEO) return "ceo";
  const ws = workspaceForPath(pathname);
  if (ws && WORKSPACES[ws].access(ctx)) return ws;
  return homeWorkspace(ctx);
}

function visibleGroups(groups: NavGroup[], ctx: NavContext): NavGroup[] {
  return groups
    .filter((g) => !g.visible || g.visible(ctx))
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.visible || i.visible(ctx)) }))
    .filter((g) => g.items.length > 0);
}

/** Other workspaces the user may switch to (excludes the one being shown). */
export function workspaceSwitcherGroup(current: WorkspaceKey, ctx: NavContext): NavGroup | null {
  // The CEO's sidebar has its own "Inspect Department Workspaces" section.
  if (ctx.isCEO) return null;
  const home = homeWorkspace(ctx);
  const items: NavItem[] = WORKSPACE_ORDER.filter((key) => {
    if (key === current) return false;
    const ws = WORKSPACES[key];
    return key === home ? ws.access(ctx) : (ws.listFor ?? ws.access)(ctx);
  }).map((key) => ({
    to: WORKSPACES[key].home,
    label: key === home ? `Back to ${WORKSPACES[key].title(ctx)}` : WORKSPACES[key].title(ctx),
    icon: key === home ? LayoutDashboard : WORKSPACE_ICONS[key],
    exact: true,
  }));
  if (home === "staff" && current !== "staff") {
    items.unshift({
      to: "/home",
      label: "Back to Staff Portal",
      icon: LayoutDashboard,
      exact: true,
    });
  }
  return items.length ? { id: "workspaces", label: "Workspaces", items } : null;
}

const WORKSPACE_ICONS: Record<WorkspaceKey, NavIcon> = {
  staff: LayoutDashboard,
  ceo: Crown,
  gm: Target,
  operations: Layers,
  department: Building2,
  sales: TrendingUp,
  finance: Banknote,
  hr: Users,
  admin: KeyRound,
};

/**
 * The full sidebar for a user at a URL: the active workspace's groups, then
 * personal items, the workspace switcher and the knowledge base. Every
 * destination appears at most once.
 */
export function buildSidebar(pathname: string, ctx: NavContext) {
  const current = activeWorkspace(pathname, ctx);
  const ws = WORKSPACES[current];
  const switcher = workspaceSwitcherGroup(current, ctx);
  const groups = visibleGroups(
    [...ws.groups, PERSONAL_GROUP, ...(switcher ? [switcher] : []), KNOWLEDGE_GROUP],
    ctx,
  );

  // Defensive de-duplication: a destination is listed once, in its first group.
  const seen = new Set<string>();
  const deduped = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => (seen.has(i.to) ? false : (seen.add(i.to), true))),
    }))
    .filter((g) => g.items.length > 0);

  return { workspace: current, title: ws.title(ctx), subtitle: ws.subtitle, groups: deduped };
}

/** Every page the user may open, for the portal search dialog. */
export function searchableItems(ctx: NavContext): NavItem[] {
  const groups: NavGroup[] = [];
  for (const key of WORKSPACE_ORDER.concat("staff")) {
    if (!WORKSPACES[key].access(ctx)) continue;
    if (key === "staff" && homeWorkspace(ctx) !== "staff") continue;
    groups.push(...WORKSPACES[key].groups);
  }
  groups.push(PERSONAL_GROUP, KNOWLEDGE_GROUP, {
    id: "account",
    label: "Account",
    items: ACCOUNT_ITEMS,
  });
  const seen = new Set<string>();
  const out: NavItem[] = [];
  for (const g of visibleGroups(groups, ctx)) {
    for (const item of g.items) {
      if (seen.has(item.to)) continue;
      seen.add(item.to);
      out.push(item);
    }
  }
  return out;
}

/** Build the navigation context from the useProfile() result. */
export function navContextFromProfile(data: any): NavContext | null {
  if (!data) return null;
  return {
    systemRole: (data.systemRole ?? "staff") as MspSystemRole,
    isCEO: !!data.isCEO,
    canViewCompany: !!data.canViewCompany,
    isAdmin: !!data.isAdmin,
    isHR: !!data.isHR,
    isSales: !!data.isSales,
    isManagerOrAbove: !!data.isManagerOrAbove,
    departmentName: data.departmentName ?? null,
    isDepartmentLead: Boolean(data.isDepartmentLead),
  };
}
