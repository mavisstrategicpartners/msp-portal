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
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      return {
        user: u.user,
        profile: profile as Profile | null,
        isAdmin: (roles ?? []).some((r) => r.role === "admin"),
        roleTier: ((profile as any)?.role_tier ?? "staff") as "root_admin" | "manager" | "staff" | "intern",
        isRootAdmin: ((profile as any)?.role_tier ?? "staff") === "root_admin",
        isManagerOrAbove: ["root_admin", "manager"].includes(((profile as any)?.role_tier ?? "staff") as string),
      };
    },
    staleTime: 60_000,
  });
}