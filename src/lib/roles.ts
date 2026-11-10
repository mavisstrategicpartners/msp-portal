/**
 * MSP role model — shared by the browser (useProfile, navigation) and the
 * server (custom /api handlers and server functions). Pure functions only:
 * no Supabase client imports, so this file is safe on both sides.
 */
export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  is_active: boolean;
  onboarding_completed: boolean;
  role_tier?: "root_admin" | "manager" | "staff" | "intern" | null;
};

export type MspSystemRole =
  | "ceo"
  | "general_manager"
  | "operations"
  | "department_manager"
  | "staff"
  | "finance_admin"
  | "hr"
  | "admin"
  | "sales"
  | "sales_manager"
  | "sales_consultant"
  | "client_success";

export function resolveSystemRole(
  profile: Profile | null,
  userEmail?: string,
  roles: any[] = [],
): MspSystemRole {
  const email = (userEmail || profile?.email || "").toLowerCase();
  const dept = (profile?.department || "").toLowerCase();
  const title = (profile?.job_title || "").toLowerCase();
  const tier = profile?.role_tier;

  // 1. CEO — only an explicit "ceo" role grant in user_roles. Job titles,
  //    departments and mailbox names never make someone the CEO, because the
  //    CEO has company-wide visibility.
  if (roles.some((r) => r?.role === "ceo")) {
    return "ceo";
  }

  // 2. General Manager / Managing Director
  if (
    email === "general.manager@mavisstrategicpartners.co.za" ||
    title.includes("general manager") ||
    title.includes("managing director") ||
    title === "gm" ||
    title === "md"
  ) {
    return "general_manager";
  }

  // 3. Operations & Relationship Manager
  if (
    email === "operations@mavisstrategicpartners.co.za" ||
    email === "operations@maviststrategicpartners.co.za" ||
    roles.some(
      (r) =>
        r.role === "OPERATIONS_RELATIONSHIP_MANAGER" ||
        r.role === "operations" ||
        r.role === "operations_relationship_manager",
    ) ||
    dept.includes("operations") ||
    dept.includes("client relationship") ||
    title.includes("operations manager") ||
    title.includes("relationship manager") ||
    title.includes("head of operations")
  ) {
    return "operations";
  }

  // 4. Finance & Administration
  if (
    email.startsWith("finance") ||
    email.includes("financeadministration@") ||
    roles.some(
      (r) =>
        r.role === "finance_administration" || r.role === "finance_admin" || r.role === "finance",
    ) ||
    dept.includes("finance") ||
    dept.includes("accounting") ||
    (dept.includes("admin department") &&
      (title.includes("finance") || email.includes("finance") || tier === "manager")) ||
    title.includes("finance") ||
    title.includes("accountant") ||
    title.includes("billing")
  ) {
    return "finance_admin";
  }

  // 5. HR and Performance
  if (
    dept.includes("human resources") ||
    dept.includes("hr") ||
    title.includes("hr") ||
    title.includes("people & culture")
  ) {
    return "hr";
  }

  // 6. System Administrator (Root Admin)
  //    Admin rights come only from an explicit grant: the root_admin tier, the
  //    system administrator mailbox, or an admin role on a non-manager account.
  //    A manager is NOT an administrator: older database rules automatically
  //    added the "admin" role to every manager, so that role is ignored for
  //    manager-tier accounts. Job titles never grant admin rights.
  if (
    tier === "root_admin" ||
    email.startsWith("superadmin@") ||
    email.startsWith("admin@") ||
    (roles.some((r) => r.role === "admin") && tier !== "manager")
  ) {
    return "admin";
  }

  // 7. Sales (including manager & consultant roles)
  if (
    email.startsWith("sales@") ||
    email.startsWith("manager@") ||
    email.includes("sales") ||
    email.includes("consultant") ||
    roles.some((r) => r.role === "sales") ||
    dept.includes("sales") ||
    dept.includes("business development") ||
    title.includes("sales") ||
    title.includes("business development")
  ) {
    if (
      email.startsWith("manager@") ||
      title.includes("manager") ||
      title.includes("head") ||
      tier === "manager"
    ) {
      return "sales_manager";
    }
    return "sales_consultant";
  }

  // 8. Client Success
  if (
    dept.includes("client success") ||
    title.includes("client success") ||
    title.includes("account manager")
  ) {
    return "client_success";
  }

  // 9. Specialist roles that contain "manager" in the title but are staff-level
  //    (e.g. SEO Manager, Social Media Manager, Content Manager)
  const specialistManagerTitles = [
    "seo manager",
    "social media manager",
    "content manager",
    "community manager",
    "campaign manager",
  ];
  const isSpecialistTitle = specialistManagerTitles.some((s) => title === s || title.startsWith(s));
  if (isSpecialistTitle && tier !== "manager") {
    return "staff";
  }

  // 10. Department Manager (Media Buying / Authorized department)
  if (
    email.startsWith("department.manager@") ||
    roles.some((r) => r.role === "DEPARTMENT_MANAGER" || r.role === "department_manager") ||
    title.includes("department manager") ||
    title.includes("lead") ||
    tier === "manager" ||
    title.includes("head of")
  ) {
    return "department_manager";
  }

  // 10. Default: Staff / Specialist Employee
  return "staff";
}

export function getDefaultDashboardRoute(role: MspSystemRole): string {
  switch (role) {
    case "ceo":
      return "/ceo";
    case "general_manager":
      return "/gm";
    case "operations":
      return "/operations";
    case "department_manager":
      return "/department";
    case "finance_admin":
      return "/finance";
    case "hr":
      return "/hr";
    case "admin":
      return "/admin/users";
    case "sales":
    case "sales_manager":
    case "sales_consultant":
      return "/sales";
    case "client_success":
      // There is no /client-success page; Client Success staff use the staff dashboard.
      return "/home";
    case "staff":
    default:
      return "/home";
  }
}

/**
 * Where a user lands after signing in. Role-based, plus one structural rule: an appointed
 * department manager (department_leads) whose role would otherwise give them the generic staff
 * home lands on their Department workspace.
 */
export function landingPath(access: { isCEO: boolean; systemRole: MspSystemRole }, leadDepartments: string[] = []) {
  if (access.isCEO) return "/ceo";
  const base = getDefaultDashboardRoute(access.systemRole);
  return base === "/home" && leadDepartments.length ? "/department" : base;
}

export type RoleTier = "root_admin" | "manager" | "staff" | "intern";

export type AccessFlags = {
  systemRole: MspSystemRole;
  roleTier: RoleTier;
  /** Explicitly granted CEO: company-wide read access, not administrator rights. */
  isCEO: boolean;
  /** May see every department's records (CEO or system administrator). */
  canViewCompany: boolean;
  isAdmin: boolean;
  isRootAdmin: boolean;
  isHR: boolean;
  isGM: boolean;
  isOperations: boolean;
  isFinance: boolean;
  isSales: boolean;
  isSalesManager: boolean;
  isSalesConsultant: boolean;
  isDepartmentManager: boolean;
  /** Manages people/work (assign tasks, approve deliverables). NOT admin rights. */
  isManagerOrAbove: boolean;
};

/** Single place that turns a profile + roles into permission flags. */
export function computeAccess(
  profile: Profile | null,
  userEmail?: string,
  roles: any[] = [],
): AccessFlags {
  const systemRole = resolveSystemRole(profile, userEmail, roles);
  const tier = (profile?.role_tier ?? null) as RoleTier | null;
  const roleTier: RoleTier =
    tier === "root_admin" || systemRole === "admin"
      ? "root_admin"
      : systemRole === "ceo"
        ? "manager"
        : tier || (systemRole.includes("manager") ? "manager" : "staff");
  const isSales =
    systemRole === "sales" || systemRole === "sales_manager" || systemRole === "sales_consultant";
  // root_admin tier is an explicit admin grant (set via Manage Staff "superadmin").
  // The CEO is deliberately NOT an administrator: she sees everything, but
  // approvals, payroll and user management stay with their owners.
  const isAdmin = systemRole === "admin" || tier === "root_admin";
  const isCEO = systemRole === "ceo";
  return {
    systemRole,
    roleTier,
    isCEO,
    canViewCompany: isCEO || isAdmin,
    isAdmin,
    isRootAdmin: tier === "root_admin",
    isHR: systemRole === "hr",
    isGM: systemRole === "general_manager",
    isOperations: systemRole === "operations",
    isFinance: systemRole === "finance_admin",
    isSales,
    isSalesManager: systemRole === "sales_manager",
    isSalesConsultant: systemRole === "sales_consultant" || systemRole === "sales",
    isDepartmentManager: systemRole === "department_manager",
    isManagerOrAbove:
      roleTier === "root_admin" ||
      roleTier === "manager" ||
      [
        "ceo",
        "general_manager",
        "operations",
        "department_manager",
        "sales_manager",
        "admin",
      ].includes(systemRole),
  };
}
