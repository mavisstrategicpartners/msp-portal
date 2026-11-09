import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeAccess } from "@/lib/roles";

function normalizeDepartment(dept?: string | null): string | null {
  if (!dept) return null;
  const map: Record<string, string> = {
    "it": "IT Department",
    "it department": "IT Department",
    "engineering": "IT Department",
    "marketing": "Marketing Team",
    "marketing team": "Marketing Team",
    "graphics": "Graphics Team",
    "graphics team": "Graphics Team",
    "sales": "Sales Team",
    "sales team": "Sales Team",
    "hr": "Human Resources",
    "human resources": "Human Resources",
    "admin": "Admin Department",
    "admin department": "Admin Department",
    "operations": "Operations Manager",
    "operations manager": "Operations Manager",
    "finance": "Admin Department",
    "management": "Managing Director",
    "client relationships": "Client Relationship Manager",
    "client relationship manager": "Client Relationship Manager",
    "social media": "Social Media Manager",
    "social media manager": "Social Media Manager",
    "managing director": "Managing Director",
    "ceo": "CEO",
    "intern": "Intern",
  };
  return map[dept.toLowerCase().trim()] ?? dept;
}

const createTeamMemberSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  accessLevel: z.enum(["staff", "intern", "manager", "hr", "superadmin"]).default("staff"),
  role: z.enum(["admin", "user"]).default("user"),
  password: z.string().min(6).optional(),
});

export const createTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => createTeamMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    await ensureAdmin(context);

    if (data.accessLevel === "superadmin") {
      const { data: rootAdmin, error: rootError } = await db.rpc("is_root_admin", {
        _user_id: context.userId,
      });
      if (rootError || !rootAdmin) throw new Response("Only superadmins can create superadmin accounts", { status: 403 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let user;
    if (data.password) {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName },
      });
      if (createError) throw createError;
      user = created.user;
    } else {
      const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        { data: { full_name: data.fullName } }
      );
      if (inviteError) throw inviteError;
      user = invited.user;
    }

    if (!user) throw new Error("The user could not be created.");

    const profilePayload = {
      id: user.id,
      email: data.email,
      full_name: data.fullName,
      job_title: data.jobTitle || null,
      department: data.accessLevel === "hr" ? "Human Resources" : normalizeDepartment(data.department),
      role_tier: data.accessLevel === "manager" ? "manager" : data.accessLevel === "superadmin" ? "root_admin" : data.accessLevel === "intern" ? "intern" : "staff",
      is_active: true,
      onboarding_completed: false,
    };

    const { error: profileError } = await (supabaseAdmin as any)
      .from("profiles")
      .upsert(profilePayload);
    if (profileError) throw profileError;

    const { error: roleInsertError } = await (supabaseAdmin as any)
      .from("user_roles")
      // Only superadmins get the database "admin" role. Managers manage their team; they are not administrators.
      .upsert({ user_id: user.id, role: data.accessLevel === "superadmin" ? "admin" : data.role }, { onConflict: "user_id,role" });
    if (roleInsertError) throw roleInsertError;

    await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: context.userId,
      action: "team_member_created",
      target_id: user.id,
      details: { email: data.email, accessLevel: data.accessLevel, role: data.role, department: data.department || null },
    });

    return { id: user.id, email: data.email };
  });

/**
 * Administrator check for staff-management actions. Uses the shared role model
 * (src/lib/roles.ts): only the CEO, root admins and explicitly granted admins.
 * Managers are NOT administrators, even though older database rules gave every
 * manager the "admin" role.
 */
async function ensureAdmin(context: any) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const [{ data: profile }, { data: roles }, { data: authUser }] = await Promise.all([
    db.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
    db.from("user_roles").select("role").eq("user_id", context.userId),
    supabaseAdmin.auth.admin.getUserById(context.userId),
  ]);
  const access = computeAccess(profile, authUser?.user?.email, roles ?? []);
  if (!access.isAdmin || (profile && profile.is_active === false)) {
    throw new Response("Admins only", { status: 403 });
  }
  return access;
}

const updateTeamMemberSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  jobTitle: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  roleTier: z.enum(["root_admin", "manager", "staff", "intern"]).optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => updateTeamMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    const actor = await ensureAdmin(context);
    if (data.roleTier === "root_admin" && actor.roleTier !== "root_admin") {
      throw new Response("Only root administrators can grant root admin access", { status: 403 });
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {};
    if (data.fullName !== undefined) patch.full_name = data.fullName;
    if (data.email !== undefined) patch.email = data.email.trim().toLowerCase();
    if (data.jobTitle !== undefined) patch.job_title = data.jobTitle;
    if (data.department !== undefined) patch.department = normalizeDepartment(data.department);
    if (data.roleTier !== undefined) patch.role_tier = data.roleTier;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    // If email changed, also update in Supabase auth via admin API
    if (data.email !== undefined) {
      const { error: authEmailError } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        email: data.email.trim().toLowerCase(),
        email_confirm: true,
      });
      if (authEmailError) throw new Error("Failed to update auth email: " + authEmailError.message);
    }

    const { error } = await (supabaseAdmin as any).from("profiles").update(patch).eq("id", data.userId);
    if (error) throw error;

    if (data.roleTier !== undefined) {
      const db = supabaseAdmin as any;
      // Only root admins hold the database "admin" role; managers do not.
      if (data.roleTier === "root_admin") {
        await db.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      } else {
        await db.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
      }
    }

    await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: context.userId,
      action: "team_member_updated",
      target_id: data.userId,
      details: patch,
    });
    return { ok: true };
  });

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  makeAdmin: z.boolean(),
});

export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => setRoleSchema.parse(data))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    if (data.makeAdmin) {
      await db.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      await db.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    }
    await db.from("audit_logs").insert({
      actor_id: context.userId,
      action: data.makeAdmin ? "admin_granted" : "admin_revoked",
      target_id: data.userId,
    });
    return { ok: true };
  });

const deleteTeamMemberSchema = z.object({
  userId: z.string().uuid(),
});

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => deleteTeamMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    if (data.userId === context.userId) {
      throw new Response("You cannot delete your own account.", { status: 400 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: profile } = await db
      .from("profiles")
      .select("email, full_name")
      .eq("id", data.userId)
      .maybeSingle();

    await db.from("user_roles").delete().eq("user_id", data.userId);
    await db.from("profiles").delete().eq("id", data.userId);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (authError) {
      console.warn("Auth deletion error:", authError.message);
    }

    await db.from("audit_logs").insert({
      actor_id: context.userId,
      action: "team_member_deleted",
      target_id: data.userId,
      details: { email: profile?.email, fullName: profile?.full_name },
    });

    return { ok: true };
  });