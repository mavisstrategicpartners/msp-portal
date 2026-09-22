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

      if (!user && typeof window !== "undefined") {
        const demo = localStorage.getItem("msp.demoUser");
        if (demo) {
          try {
            user = JSON.parse(demo);
          } catch {}
        }
      }

      if (!user) return null;

      let profile: Profile | null = null;
      let roles: any[] = [];
      try {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);
        profile = p as Profile | null;
        roles = r ?? [];
      } catch (e) {
        console.warn("Error fetching profile from Supabase:", e);
      }

      const emailLower = (user.email || "").toLowerCase();
      const isSuperAdmin = emailLower.includes("superadmin");
      const isHRUser = emailLower.includes("thandi");

      const selectedRole = typeof window !== "undefined" ? localStorage.getItem("msp.selectedPortal") || "staff" : "staff";
      const resolvedTier: "root_admin" | "manager" | "staff" | "intern" =
        isSuperAdmin
          ? "root_admin"
          : profile?.role_tier ||
            (selectedRole === "admin" ? "root_admin" : selectedRole === "manager" ? "manager" : isHRUser ? "manager" : "staff");

      const defaultName = isSuperAdmin
        ? "Super Admin"
        : isHRUser
        ? "Thandi Mokoena"
        : user.user_metadata?.full_name || (user.email ? user.email.split("@")[0].replace(".", " ") : "Team Member");

      const resolvedProfile: Profile = profile || {
        id: user.id,
        full_name: defaultName,
        email: user.email || "superadmin@mavisstrategicpartners.co.za",
        phone: "+27 11 000 0000",
        avatar_url: null,
        department: isHRUser ? "Human Resources" : isSuperAdmin ? "Engineering & Operations" : "Staff Department",
        job_title: isHRUser ? "HR Manager" : isSuperAdmin ? "System Administrator" : "Staff Member",
        is_active: true,
        onboarding_completed: true,
        role_tier: resolvedTier,
      };

      const isAdmin = roles.some((r) => r.role === "admin") || resolvedTier === "root_admin";

      return {
        user,
        profile: resolvedProfile,
        isAdmin,
        isHR: resolvedProfile.department === "Human Resources" || isHRUser,
        roleTier: resolvedTier,
        isRootAdmin: resolvedTier === "root_admin",
        isManagerOrAbove: ["root_admin", "manager"].includes(resolvedTier),
      };
    },
    staleTime: 60_000,
  });
}