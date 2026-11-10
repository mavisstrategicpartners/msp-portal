/**
 * Department manager provisioning (server only).
 *
 * 1. The CEO or an administrator records an appointment: the verified person (name + company
 *    email) who will manage a department that has no manager.
 * 2. An administrator runs provisioning once. For each pending appointment it either
 *    - links an existing account (no password change), or
 *    - creates the account with a one-time temporary password that must be changed at first
 *      sign-in,
 *    then appoints the person as the department's manager and places them in the department.
 *
 * Idempotent: processed appointments are never processed again, an email with an existing
 * account is linked rather than recreated, and a department that already has a manager is
 * never overwritten. Temporary passwords are returned once in the response and are never
 * stored or logged.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import { generateTemporaryPassword } from "@/lib/temporary-password.server";
import { invalidateOrgStructure, loadOrgStructure } from "@/lib/org-structure.server";

const db = () => supabaseAdmin as any;
const COMPANY_DOMAIN = "@mavisstrategicpartners.co.za";

/** Profile "department" values (database enum) that correspond to a department. */
export const PROFILE_DEPARTMENT: Record<string, string> = {
  it: "IT Department",
  marketing: "Marketing Team",
  sales: "Sales Team",
  hr: "Human Resources",
  finance: "Admin Department",
  operations: "Operations Manager",
  creative: "Social Media Manager",
};

const deptName = (key: string) => DEPARTMENTS.find((d) => d.key === key)?.name ?? key;

export type AccountStatus = {
  exists: boolean;
  active: boolean;
  lastSignInAt: string | null;
  mustChangePassword: boolean;
};

async function accountStatus(userId: string, profileActive: boolean): Promise<AccountStatus> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    const u: any = data?.user;
    if (!u) return { exists: false, active: false, lastSignInAt: null, mustChangePassword: false };
    const banned = u.banned_until && new Date(u.banned_until) > new Date();
    return {
      exists: true,
      active: profileActive && !banned,
      lastSignInAt: u.last_sign_in_at ?? null,
      mustChangePassword: Boolean(u.app_metadata?.must_change_password),
    };
  } catch {
    return { exists: false, active: false, lastSignInAt: null, mustChangePassword: false };
  }
}

/** Where every department stands: an existing manager, an appointment awaiting provisioning, or vacant. */
export async function managerReport() {
  const org = await loadOrgStructure(true);
  const { data: appts } = await db().from("manager_appointments").select("*").order("created_at", { ascending: false });
  const pending = new Map<string, any>((appts || []).filter((a: any) => a.status === "pending").map((a: any) => [a.department_key, a]));
  const departments = await Promise.all(
    DEPARTMENTS.map(async (d) => {
      const leadId = org.leads.get(d.key);
      const p = leadId ? org.people.get(leadId) : undefined;
      const manager =
        p && p.active
          ? { id: p.id, name: p.name, email: p.email, title: p.title, account: await accountStatus(p.id, p.active) }
          : null;
      const a = pending.get(d.key);
      return {
        key: d.key,
        name: d.name,
        manager,
        appointment: a ? { id: a.id, fullName: a.full_name, email: a.email, jobTitle: a.job_title, createdAt: a.created_at } : null,
        state: manager ? "existing" : a ? "pending" : "vacant",
      };
    }),
  );
  const history = (appts || [])
    .filter((a: any) => a.status !== "pending")
    .slice(0, 50)
    .map((a: any) => ({
      id: a.id,
      departmentKey: a.department_key,
      department: deptName(a.department_key),
      fullName: a.full_name,
      email: a.email,
      status: a.status,
      failureReason: a.failure_reason,
      processedAt: a.processed_at,
    }));
  return { departments, history };
}

export function validateAppointment(body: any): { ok: true; value: { departmentKey: string; fullName: string; email: string; jobTitle: string } } | { ok: false; error: string } {
  const departmentKey = String(body?.departmentKey || "");
  const fullName = String(body?.fullName || "").trim().replace(/\s+/g, " ");
  const email = String(body?.email || "").trim().toLowerCase();
  if (!DEPARTMENTS.some((d) => d.key === departmentKey)) return { ok: false, error: "Choose a department." };
  if (fullName.length < 3 || !/\s/.test(fullName)) return { ok: false, error: "Enter the person's full name (first name and surname)." };
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || !email.endsWith(COMPANY_DOMAIN))
    return { ok: false, error: `Use the person's MSP work email (ending ${COMPANY_DOMAIN}).` };
  const jobTitle = String(body?.jobTitle || "").trim().slice(0, 120) || `${deptName(departmentKey)} Manager`;
  return { ok: true, value: { departmentKey, fullName: fullName.slice(0, 120), email, jobTitle } };
}

/** Record an appointment for a department without a manager. */
export async function createAppointment(input: { departmentKey: string; fullName: string; email: string; jobTitle: string }, actorId: string) {
  const org = await loadOrgStructure(true);
  const lead = org.leads.get(input.departmentKey);
  if (lead && org.people.get(lead)?.active)
    return { status: 409, error: `${deptName(input.departmentKey)} already has a manager (${org.people.get(lead)!.name}). Change it on Department Structure.` };
  const { data: prof } = await db().from("profiles").select("id, is_active").ilike("email", input.email).maybeSingle();
  if (prof) {
    const { data: roles } = await db().from("user_roles").select("role").eq("user_id", prof.id);
    if ((roles || []).some((r: any) => r.role === "ceo")) return { status: 400, error: "The CEO is not appointed as a department manager." };
    if (prof.is_active === false) return { status: 400, error: "That account is deactivated. Reactivate it in Manage Staff first." };
  }
  const { data, error } = await db()
    .from("manager_appointments")
    .insert({
      department_key: input.departmentKey,
      full_name: input.fullName,
      email: input.email,
      job_title: input.jobTitle,
      status: "pending",
      created_by: actorId,
    })
    .select()
    .maybeSingle();
  if (error) {
    if (/duplicate|unique/i.test(error.message))
      return { status: 409, error: "There is already an open appointment for this department or this person." };
    return { status: 500, error: error.message };
  }
  return { status: 201, appointment: data };
}

export async function cancelAppointment(id: string, actorId: string) {
  const { data } = await db().from("manager_appointments").select("id, status").eq("id", id).maybeSingle();
  if (!data || data.status !== "pending") return { status: 404, error: "No pending appointment found." };
  await db()
    .from("manager_appointments")
    .update({ status: "cancelled", processed_by: actorId, processed_at: new Date().toISOString() })
    .eq("id", id);
  return { status: 200 };
}

async function placeAsManager(userId: string, key: string, actorId: string) {
  const { data: rows } = await db().from("department_members").select("department_key, is_primary").eq("user_id", userId);
  const hasPrimary = (rows || []).some((r: any) => r.is_primary);
  const inDept = (rows || []).some((r: any) => r.department_key === key);
  if (!inDept)
    await db().from("department_members").insert({
      user_id: userId,
      department_key: key,
      is_primary: !hasPrimary,
      source: "manual",
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });
  const { error } = await db()
    .from("department_leads")
    .upsert({ department_key: key, user_id: userId, assigned_by: actorId, assigned_at: new Date().toISOString(), note: "Appointed through manager provisioning" });
  if (error) throw new Error(error.message);
}

export type ProvisionResult = {
  existing: { department: string; name: string; email: string; title: string }[];
  created: { department: string; name: string; email: string; role: string; temporaryPassword: string }[];
  linked: { department: string; name: string; email: string; role: string }[];
  failed: { department: string; name: string; email: string; reason: string }[];
  awaiting: { department: string }[];
};

/** Process every pending appointment once. Administrators only (checked by the caller). */
export async function runProvisioning(actor: { userId: string; fullName: string }): Promise<ProvisionResult> {
  const result: ProvisionResult = { existing: [], created: [], linked: [], failed: [], awaiting: [] };
  const org = await loadOrgStructure(true);
  const { data: pending } = await db().from("manager_appointments").select("*").eq("status", "pending").order("created_at");
  const done = async (id: string, status: string, patch: Record<string, any> = {}) =>
    db()
      .from("manager_appointments")
      .update({ status, processed_by: actor.userId, processed_at: new Date().toISOString(), ...patch })
      .eq("id", id)
      .eq("status", "pending");

  for (const a of pending || []) {
    const department = deptName(a.department_key);
    const fail = async (reason: string) => {
      result.failed.push({ department, name: a.full_name, email: a.email, reason });
      await done(a.id, "failed", { failure_reason: reason });
    };
    try {
      const lead = org.leads.get(a.department_key);
      if (lead && org.people.get(lead)?.active) {
        await fail(`${department} already has a manager (${org.people.get(lead)!.name}); nothing was changed.`);
        continue;
      }
      // Existing account: link it, never touch the password.
      const { data: prof } = await db().from("profiles").select("id, full_name, is_active").ilike("email", a.email).maybeSingle();
      if (prof) {
        if (prof.is_active === false) {
          await fail("The account with this email is deactivated. Reactivate it in Manage Staff, then record the appointment again.");
          continue;
        }
        await placeAsManager(prof.id, a.department_key, actor.userId);
        org.leads.set(a.department_key, prof.id);
        result.linked.push({ department, name: prof.full_name || a.full_name, email: a.email, role: `${department} manager` });
        await done(a.id, "linked", { user_id: prof.id });
        continue;
      }
      // New account with a one-time temporary password (must be changed at first sign-in).
      const temporaryPassword = generateTemporaryPassword();
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: a.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { full_name: a.full_name },
        app_metadata: { must_change_password: true },
      });
      const user: any = created?.user;
      if (createError || !user) {
        const msg = createError?.message || "unknown error";
        await fail(
          /already|registered|exists/i.test(msg)
            ? "A login with this email already exists but has no staff profile. Resolve it in Manage Staff."
            : `The account could not be created (${msg}).`,
        );
        continue;
      }
      const { error: profileError } = await db().from("profiles").upsert({
        id: user.id,
        email: a.email,
        full_name: a.full_name,
        job_title: a.job_title || `${department} Manager`,
        department: PROFILE_DEPARTMENT[a.department_key] ?? null,
        role_tier: "manager",
        is_active: true,
        onboarding_completed: false,
      });
      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(user.id).catch(() => undefined);
        await fail(`The staff profile could not be saved (${profileError.message}); the login was removed so it can be retried.`);
        continue;
      }
      await db().from("user_roles").upsert({ user_id: user.id, role: "user" }, { onConflict: "user_id,role" });
      await placeAsManager(user.id, a.department_key, actor.userId);
      org.leads.set(a.department_key, user.id);
      await db().from("audit_logs").insert({
        actor_id: actor.userId,
        action: "team_member_created",
        target_id: user.id,
        details: { email: a.email, accessLevel: "manager", department: department, via: "manager_provisioning" },
      });
      result.created.push({ department, name: a.full_name, email: a.email, role: `${department} manager`, temporaryPassword });
      await done(a.id, "provisioned", { user_id: user.id });
    } catch (e: any) {
      await fail(`Unexpected error: ${e?.message || e}`);
    }
  }

  invalidateOrgStructure();
  const after = await loadOrgStructure(true);
  for (const d of DEPARTMENTS) {
    const lead = after.leads.get(d.key);
    const p = lead ? after.people.get(lead) : undefined;
    if (p && p.active) {
      if (!result.created.some((c) => c.email === p.email) && !result.linked.some((l) => l.email === p.email))
        result.existing.push({ department: d.name, name: p.name, email: p.email, title: p.title });
    } else result.awaiting.push({ department: d.name });
  }
  // Record that the run happened (names only, never passwords).
  await db().from("audit_logs").insert({
    actor_id: actor.userId,
    action: "manager_provisioning_run",
    details: {
      by: actor.fullName,
      created: result.created.map((c) => ({ department: c.department, email: c.email })),
      linked: result.linked.map((c) => ({ department: c.department, email: c.email })),
      failed: result.failed.map((c) => ({ department: c.department, email: c.email, reason: c.reason })),
      awaiting: result.awaiting.length,
    },
  });
  return result;
}
