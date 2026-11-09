import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export function resolveSystemRole(profile: Profile | null, userEmail?: string, roles: any[] = []): MspSystemRole {
  const email = (userEmail || profile?.email || "").toLowerCase();
  const dept = (profile?.department || "").toLowerCase();
  const title = (profile?.job_title || "").toLowerCase();
  const tier = profile?.role_tier;

  // 1. CEO
  if (
    email === "ceo@mavisstrategicpartners.co.za" ||
    title === "chief executive officer" ||
    title === "ceo" ||
    (dept === "ceo" && tier === "root_admin") ||
    (dept === "executive" && (title.includes("ceo") || title.includes("chief executive")))
  ) {
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
    roles.some((r) => r.role === "OPERATIONS_RELATIONSHIP_MANAGER" || r.role === "operations" || r.role === "operations_relationship_manager") ||
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
    roles.some((r) => r.role === "finance_administration" || r.role === "finance_admin" || r.role === "finance") ||
    dept.includes("finance") ||
    dept.includes("accounting") ||
    (dept.includes("admin department") && (title.includes("finance") || email.includes("finance") || tier === "manager")) ||
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
  if (
    roles.some((r) => r.role === "admin") ||
    tier === "root_admin" ||
    title.includes("superadmin") ||
    title.includes("root") ||
    title.includes("system admin") ||
    title.includes("it admin") ||
    email.startsWith("superadmin@") ||
    email.startsWith("admin@")
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
      return "/client-success";
    case "staff":
    default:
      return "/home";
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      let user: any = null;
      try {
        const { data: u } = await supabase.auth.getUser();
        user = u?.user ?? null;
      } catch (e) {
        console.warn("Error fetching user in useProfile:", e);
      }

      if (!user) {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("msp.authenticatedUser");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const fallbackRole = resolveSystemRole(parsed, parsed.email, [{ role: parsed.role_tier === "root_admin" ? "admin" : "user" }]);
              return {
                user: { id: parsed.id || "ceo-user-id", email: parsed.email },
                profile: {
                  id: parsed.id || "ceo-user-id",
                  full_name: parsed.full_name || "Mavis Muchena",
                  email: parsed.email,
                  phone: null,
                  avatar_url: null,
                  department: parsed.department || "Executive",
                  job_title: parsed.job_title || "Chief Executive Officer",
                  is_active: true,
                  onboarding_completed: true,
                  role_tier: (parsed.role_tier as any) || "root_admin",
                },
                systemRole: fallbackRole,
                defaultDashboard: getDefaultDashboardRoute(fallbackRole),
                isAdmin: fallbackRole === "admin" || fallbackRole === "ceo",
                isHR: fallbackRole === "hr",
                isGM: fallbackRole === "general_manager",
                isOperations: fallbackRole === "operations",
                isFinance: fallbackRole === "finance_admin",
                isSales: fallbackRole === "sales" || fallbackRole === "sales_manager" || fallbackRole === "sales_consultant",
                isSalesManager: fallbackRole === "sales_manager" || parsed.role_tier === "manager",
                isSalesConsultant: fallbackRole === "sales_consultant" && parsed.role_tier !== "manager",
                isDepartmentManager: fallbackRole === "department_manager",
                roleTier: (parsed.role_tier as any) || "root_admin",
                isRootAdmin: fallbackRole === "ceo",
                isManagerOrAbove: parsed.role_tier === "manager" || fallbackRole === "department_manager" || fallbackRole === "general_manager" || fallbackRole === "operations",
              };
            } catch {}
          }
        }
        return null;
      }

      let profile: Profile | null = null;
      let roles: any[] = [];
      try {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);
        profile = p as Profile | null;
        roles = r ?? [];

        // If the user is authenticated in Supabase but doesn't have a profile row yet, initialize it
        if (!profile && user.email) {
          const defaultName =
            user.user_metadata?.full_name ||
            (user.email ? user.email.split("@")[0].replace(".", " ") : "Team Member");

          const newProfilePayload = {
            id: user.id,
            email: user.email,
            full_name: defaultName,
            phone: null,
            avatar_url: null,
            department: null,
            job_title: "Staff Member",
            is_active: true,
            onboarding_completed: false,
            role_tier: "staff" as const,
          };

          const { data: inserted } = await supabase
            .from("profiles")
            .upsert(newProfilePayload)
            .select()
            .maybeSingle();

          profile = (inserted as Profile) || (newProfilePayload as Profile);
        }
      } catch (e) {
        console.warn("Error fetching profile from Supabase:", e);
      }

      const systemRole = resolveSystemRole(profile, user?.email, roles);

      if (systemRole === "ceo" && profile) {
        profile.full_name = profile.full_name || "Mavis Muchena";
        profile.job_title = profile.job_title || "Chief Executive Officer";
        profile.department = profile.department || "Executive";
        profile.role_tier = "root_admin";
      }

      if (systemRole === "admin" && profile) {
        profile.role_tier = "root_admin";
        if (!profile.job_title || profile.job_title === "Staff Member") {
          profile.job_title = "Root Administrator";
        }
      }

      const resolvedTier: "root_admin" | "manager" | "staff" | "intern" =
        profile?.role_tier === "root_admin" || systemRole === "ceo" || systemRole === "admin"
          ? "root_admin"
          : profile?.role_tier || (systemRole.includes("manager") ? "manager" : "staff");

      const isAdmin = systemRole === "admin" || systemRole === "ceo" || resolvedTier === "root_admin";
      const isHR = systemRole === "hr";
      const isManagerOrAbove =
        resolvedTier === "root_admin" ||
        resolvedTier === "manager" ||
        systemRole === "department_manager" ||
        systemRole === "general_manager" ||
        systemRole === "operations" ||
        systemRole === "ceo";

      return {
        user,
        profile,
        systemRole,
        defaultDashboard: getDefaultDashboardRoute(systemRole),
        isAdmin,
        isHR,
        isGM: systemRole === "general_manager",
        isOperations: systemRole === "operations",
        isFinance: systemRole === "finance_admin",
        isSales: systemRole === "sales" || systemRole === "sales_manager" || systemRole === "sales_consultant",
        isSalesManager: systemRole === "sales_manager" || (resolvedTier === "manager" && (systemRole === "sales" || profile?.department === "Sales Team")),
        isSalesConsultant: systemRole === "sales_consultant" || (resolvedTier !== "manager" && !isAdmin && (systemRole === "sales" || profile?.department === "Sales Team")),
        isDepartmentManager: systemRole === "department_manager",
        departmentName:
          (user?.user_metadata?.department as string) ||
          (profile?.department === "Marketing Team" && profile?.job_title?.includes("Media Buying")
            ? "Media Buying"
            : profile?.department || "Media Buying"),
        roleTier: resolvedTier,
        isRootAdmin: systemRole === "ceo",
        isManagerOrAbove,
      };
    },
    staleTime: 60_000,
  });
}