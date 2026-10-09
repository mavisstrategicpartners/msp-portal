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

      if (!user) {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("msp.authenticatedUser");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
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
                isAdmin: true,
                isHR: false,
                roleTier: "root_admin" as const,
                isRootAdmin: true,
                isManagerOrAbove: true,
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

      const isCeo =
        user?.email?.toLowerCase() === "ceo@mavisstrategicpartners.co.za" ||
        profile?.job_title === "Chief Executive Officer";

      if (isCeo && profile) {
        profile.full_name = profile.full_name || "Mavis Muchena";
        profile.job_title = "Chief Executive Officer";
        profile.department = "Executive";
        profile.role_tier = "root_admin";
      }

      const resolvedTier: "root_admin" | "manager" | "staff" | "intern" =
        profile?.role_tier || (isCeo ? "root_admin" : "staff");

      const isAdmin =
        roles.some((r) => r.role === "admin") ||
        resolvedTier === "root_admin" ||
        isCeo;

      const deptLower = (profile?.department || "").toLowerCase();
      const titleLower = (profile?.job_title || "").toLowerCase();
      const isHR =
        deptLower.includes("human resources") ||
        deptLower.includes("hr") ||
        titleLower.includes("hr");

      const isManagerOrAbove = resolvedTier === "manager";

      return {
        user,
        profile,
        isAdmin,
        isHR,
        roleTier: resolvedTier,
        isRootAdmin: Boolean(isCeo),
        isManagerOrAbove,
      };
    },
    staleTime: 60_000,
  });
}