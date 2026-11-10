/**
 * MSP organisation structure (server only) and the task-assignment rules built on it.
 *
 *   CEO              sees everything; does not assign daily work.
 *   General Manager  oversees every department; directs work to department managers, and
 *                    covers a department that has no manager until one is appointed.
 *   Department mgr   (public.department_leads) assigns work in the department(s) they lead,
 *                    to that department's employees.
 *   Employee         (public.department_members) receives work from their department manager.
 *   Administrator    system administration; may assign within any department to its employees.
 *
 * Membership and managers come only from the database (configured by the CEO or an administrator),
 * never from job titles.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEPARTMENTS } from "@/lib/departments";
import type { AccessFlags } from "@/lib/roles";

export type OrgPerson = {
  id: string;
  name: string;
  email: string;
  title: string;
  active: boolean;
  recordedDepartment: string | null;
};
export type OrgMembership = { userId: string; departmentKey: string; isPrimary: boolean; source: string };
export type OrgStructure = {
  people: Map<string, OrgPerson>;
  leads: Map<string, string>; // department key -> manager user id
  memberships: OrgMembership[];
};

export type Actor = { userId: string; access: AccessFlags };

let cache: { at: number; org: OrgStructure } | null = null;
export function invalidateOrgStructure() {
  cache = null;
}

export async function loadOrgStructure(force = false): Promise<OrgStructure> {
  if (!force && cache && Date.now() - cache.at < 30_000) return cache.org;
  const db = supabaseAdmin as any;
  const [p, l, m] = await Promise.all([
    db.from("profiles").select("id, full_name, email, job_title, department, is_active"),
    db.from("department_leads").select("department_key, user_id"),
    db.from("department_members").select("user_id, department_key, is_primary, source"),
  ]);
  const people = new Map<string, OrgPerson>();
  for (const r of p.data || [])
    people.set(r.id, {
      id: r.id,
      name: r.full_name || r.email || "Unnamed",
      email: r.email || "",
      title: r.job_title || "",
      active: r.is_active !== false,
      recordedDepartment: r.department ?? null,
    });
  const org: OrgStructure = {
    people,
    leads: new Map((l.data || []).map((r: any) => [r.department_key, r.user_id])),
    memberships: (m.data || []).map((r: any) => ({
      userId: r.user_id,
      departmentKey: r.department_key,
      isPrimary: Boolean(r.is_primary),
      source: r.source || "manual",
    })),
  };
  cache = { at: Date.now(), org };
  return org;
}

export const departmentName = (key: string) => DEPARTMENTS.find((d) => d.key === key)?.name ?? key;

export function primaryDepartment(org: OrgStructure, userId: string): string | null {
  return org.memberships.find((m) => m.userId === userId && m.isPrimary)?.departmentKey ?? null;
}
export function memberDepartments(org: OrgStructure, userId: string): string[] {
  return org.memberships.filter((m) => m.userId === userId).map((m) => m.departmentKey);
}
export function ledDepartments(org: OrgStructure, userId: string): string[] {
  return [...org.leads.entries()].filter(([, id]) => id === userId).map(([k]) => k);
}
/** Active employees of a department (members), plus its manager. */
export function departmentPeople(org: OrgStructure, key: string): string[] {
  const ids = new Set(org.memberships.filter((m) => m.departmentKey === key).map((m) => m.userId));
  const lead = org.leads.get(key);
  if (lead) ids.add(lead);
  return [...ids].filter((id) => org.people.get(id)?.active);
}
/** The manager an employee reports to: the manager of their primary department. */
export function managerOf(org: OrgStructure, userId: string): string | null {
  const dept = primaryDepartment(org, userId);
  const lead = dept ? org.leads.get(dept) : undefined;
  return lead && lead !== userId ? lead : null;
}

export type AssignPolicy = {
  /** The caller may create/assign work in this department. */
  allowed: boolean;
  /** Who the caller may make responsible (user ids). */
  assignees: string[];
  /** Why not / what applies, in plain words. */
  reason: string;
  via: "admin" | "manager" | "general-manager" | "none";
};

/** What may this caller assign in department `key`? */
export function assignPolicy(org: OrgStructure, actor: Actor, key: string): AssignPolicy {
  const name = departmentName(key);
  if (!DEPARTMENTS.some((d) => d.key === key))
    return { allowed: false, assignees: [], reason: "Unknown department.", via: "none" };
  const lead = org.leads.get(key);
  const people = departmentPeople(org, key);
  if (actor.access.isAdmin) return { allowed: true, assignees: people, reason: `Administrator: ${name} employees.`, via: "admin" };
  if (lead && lead === actor.userId) {
    const team = people.filter((id) => id !== actor.userId);
    return {
      allowed: true,
      assignees: [...team, actor.userId],
      reason: team.length
        ? `You manage ${name}.`
        : `You manage ${name}, but no employees are recorded in it yet. Ask the CEO or an administrator to add them.`,
      via: "manager",
    };
  }
  if (actor.access.isGM) {
    if (lead)
      return {
        allowed: true,
        assignees: org.people.get(lead)?.active ? [lead] : [],
        reason: `${name} has a manager: the General Manager directs ${name} work to them.`,
        via: "general-manager",
      };
    return {
      allowed: true,
      assignees: people,
      reason: `${name} has no manager yet, so the General Manager assigns its work.`,
      via: "general-manager",
    };
  }
  if (actor.access.isCEO)
    return { allowed: false, assignees: [], reason: "The CEO view is read-only; work is assigned by managers.", via: "none" };
  return {
    allowed: false,
    assignees: [],
    reason: lead
      ? `Only the ${name} manager (or the General Manager) can assign ${name} work.`
      : `${name} has no manager yet. The General Manager assigns its work until one is appointed.`,
    via: "none",
  };
}

/** Departments the caller may assign into. */
export function assignableDepartments(org: OrgStructure, actor: Actor): string[] {
  return DEPARTMENTS.filter((d) => assignPolicy(org, actor, d.key).allowed).map((d) => d.key);
}

/** May the caller oversee/review work in this department (approve, reassign, correct)? */
export function managesDepartment(org: OrgStructure, actor: Actor, key: string | null): boolean {
  if (actor.access.isAdmin || actor.access.isGM) return true;
  return Boolean(key && org.leads.get(key) === actor.userId);
}

/** May the CEO / an administrator change the structure (members and managers)? */
export function canConfigureStructure(access: AccessFlags) {
  return access.isCEO || access.isAdmin;
}
