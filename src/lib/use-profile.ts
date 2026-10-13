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
    dept.includes("operations") ||
    title.includes("operations manager") ||
    title.includes("relationship manager") ||
    title.includes("head of operations")
  ) {
    return "operations";
  }

  // 4. Finance & Administration
  if (
    dept.includes("finance") ||
    dept.includes("accounting") ||
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

  // 6. System Administrator
  if (
    roles.some((r) => r.role === "admin") ||
    title.includes("superadmin") ||
    title.includes("system admin") ||
    title.includes("it admin") ||
    email.startsWith("superadmin@")
  ) {
    return "admin";
  }

  // 7. Sales
  if (
    dept.includes("sales") ||
    dept.includes("business development") ||
    title.includes("sales") ||
    title.includes("business development")
  ) {
    return "sales";
  }

  // 8. Client Success
  if (
    dept.includes("client success") ||
    title.includes("client success") ||
    title.includes("account manager")
  ) {
    return "client_success";
  }

  // 9. Department Manager
  if (
    tier === "manager" ||
    title.includes("lead") ||
    title.includes("manager") ||
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
      return "/host/hr";
    case "admin":
      return "/admin/users";
    case "sales":
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

      const resolvedTier: "root_admin" | "manager" | "staff" | "intern" =
        profile?.role_tier || (systemRole === "ceo" || systemRole === "admin" ? "root_admin" : systemRole.includes("manager") ? "manager" : "staff");

      const isAdmin = systemRole === "admin" || systemRole === "ceo";
      const isHR = systemRole === "hr";
      const isManagerOrAbove =
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
        roleTier: resolvedTier,
        isRootAdmin: systemRole === "ceo",
        isManagerOrAbove,
      };
    },
    staleTime: 60_000,
  });
}