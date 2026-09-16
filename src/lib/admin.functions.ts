import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createTeamMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  accessLevel: z.enum(["staff", "manager", "hr", "superadmin"]).default("staff"),
  role: z.enum(["admin", "user"]).default("user"),
});

export const createTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createTeamMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { data: allowed, error: roleError } = await db.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError || !allowed) {
      throw new Response("Only admins can add portal users", { status: 403 });
    }

    if (data.accessLevel === "superadmin") {
      const { data: rootAdmin, error: rootError } = await db.rpc("is_root_admin", {
        _user_id: context.userId,
      });
      if (rootError || !rootAdmin) throw new Response("Only superadmins can create superadmin accounts", { status: 403 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

    if (createError) throw createError;
    const user = created.user;
    if (!user) throw new Error("The user account was not created.");

    const profilePayload = {
      id: user.id,
      email: data.email,
      full_name: data.fullName,
      job_title: data.jobTitle || null,
      department: data.accessLevel === "hr" ? "Human Resources" : data.department || null,
      role_tier: data.accessLevel === "manager" ? "manager" : data.accessLevel === "superadmin" ? "root_admin" : "staff",
      is_active: true,
      onboarding_completed: false,
    };

    const { error: profileError } = await (supabaseAdmin as any)
      .from("profiles")
      .upsert(profilePayload);
    if (profileError) throw profileError;

    const { error: roleInsertError } = await (supabaseAdmin as any)
      .from("user_roles")
      .upsert({ user_id: user.id, role: data.accessLevel === "manager" || data.accessLevel === "superadmin" ? "admin" : data.role }, { onConflict: "user_id,role" });
    if (roleInsertError) throw roleInsertError;

    await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: context.userId,
      action: "team_member_created",
      target_id: user.id,
      details: { email: data.email, accessLevel: data.accessLevel, role: data.role, department: data.department || null },
    });

    return { id: user.id, email: data.email };
  });

async function ensureAdmin(context: any) {
  const { data: allowed, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !allowed) throw new Response("Admins only", { status: 403 });
}

const updateTeamMemberSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().optional(),
  jobTitle: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateTeamMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {};
    if (data.fullName !== undefined) patch.full_name = data.fullName;
    if (data.jobTitle !== undefined) patch.job_title = data.jobTitle;
    if (data.department !== undefined) patch.department = data.department;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    const { error } = await (supabaseAdmin as any).from("profiles").update(patch).eq("id", data.userId);
    if (error) throw error;
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
  .inputValidator((data) => setRoleSchema.parse(data))
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