import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { computeAccess, getDefaultDashboardRoute, type Profile } from "@/lib/roles";

export { computeAccess, getDefaultDashboardRoute, resolveSystemRole } from "@/lib/roles";
export type { AccessFlags, MspSystemRole, Profile, RoleTier } from "@/lib/roles";

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

      // No Supabase session means not signed in. (The old browser-storage
      // "fallback" login was removed: it let anyone pose as any user.)
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

      const access = computeAccess(profile, user?.email, roles);
      const systemRole = access.systemRole;

      if (systemRole === "ceo" && profile) {
        profile.full_name = profile.full_name || "Mavis Muchena";
        profile.job_title = profile.job_title || "Chief Executive Officer";
        profile.department = profile.department || "Executive";
      }
      if (systemRole === "admin" && profile && (!profile.job_title || profile.job_title === "Staff Member")) {
        profile.job_title = "Root Administrator";
      }

      return {
        user,
        profile,
        ...access,
        defaultDashboard: getDefaultDashboardRoute(systemRole),
        departmentName:
          (user?.user_metadata?.department as string) ||
          (profile?.department === "Marketing Team" && profile?.job_title?.includes("Media Buying")
            ? "Media Buying"
            : profile?.department || "Media Buying"),
      };
    },
    staleTime: 60_000,
  });
}