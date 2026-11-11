/**
 * Moves an employee to another department (Manage Staff → Edit Staff Profile).
 *
 * The organisation structure (public.department_members) is what the portal uses for department
 * dashboards, task assignment and permissions, so the change is made there: the chosen department
 * becomes the person's main department; other departments they also work in are kept.
 *
 * The older profiles.department label is kept in step, because a few legacy access rules still
 * read it. It is set only to labels that carry no management rights (never "Operations Manager"
 * or "Client Relationship Manager", which open the Operations workspace), and cleared when the
 * department has no legacy equivalent, so an old label can't keep the previous department's access.
 *
 * Nothing here grants a manager or administrator role or changes a manager appointment:
 * appointments are made on Department Structure.
 */
import { DEPARTMENTS } from "@/lib/departments";

/** Legacy profiles.department label for each department (enum values with no management rights). */
export const PROFILE_LABEL_FOR: Record<string, string> = {
  it: "IT Department",
  marketing: "Marketing Team",
  sales: "Sales Team",
  hr: "Human Resources",
  finance: "Admin Department",
  creative: "Graphics Team",
};

export type DepartmentMove = { profileLabel: string | null; previous: string | null; warnings: string[] };

export async function setMainDepartment(db: any, userId: string, departmentKey: string, actorId: string): Promise<DepartmentMove> {
  const dept = DEPARTMENTS.find((d) => d.key === departmentKey);
  if (!dept) throw new Error("Choose one of the company's departments.");

  const [{ data: roleRows }, { data: rows }, { data: leads }] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", userId),
    db.from("department_members").select("*").eq("user_id", userId),
    db.from("department_leads").select("department_key").eq("user_id", userId),
  ]);
  if ((roleRows || []).some((r: any) => r.role === "ceo")) throw new Error("The CEO is not placed in a department.");

  const current: any[] = rows || [];
  const previous = current.find((r) => r.is_primary)?.department_key ?? null;
  const now = new Date().toISOString();
  const keep = current.filter((r) => !r.is_primary && r.department_key !== departmentKey);
  const next = [
    { user_id: userId, department_key: departmentKey, is_primary: true, source: "manual", assigned_by: actorId, assigned_at: now },
    ...keep.map((r) => ({
      user_id: userId,
      department_key: r.department_key,
      is_primary: false,
      source: r.source ?? "manual",
      assigned_by: r.assigned_by ?? actorId,
      assigned_at: r.assigned_at ?? now,
    })),
  ];
  const { error: delErr } = await db.from("department_members").delete().eq("user_id", userId);
  if (delErr) throw new Error(delErr.message);
  const { error: insErr } = await db.from("department_members").insert(next);
  if (insErr) {
    // Put the previous placement back rather than leave the person in no department.
    if (current.length) await db.from("department_members").insert(current);
    throw new Error(insErr.message);
  }

  const warnings: string[] = [];
  const led = (leads || []).map((l: any) => l.department_key).filter((k: string) => k !== departmentKey);
  for (const k of led)
    warnings.push(
      `Still appointed manager of ${DEPARTMENTS.find((d) => d.key === k)?.name ?? k}. Change managers on Department Structure if needed.`,
    );
  return { profileLabel: PROFILE_LABEL_FOR[departmentKey] ?? null, previous, warnings };
}
