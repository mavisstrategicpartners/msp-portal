/**
 * MSP service departments — the single list used for task ownership,
 * department workspaces, reporting and the CEO overview (browser and server).
 * Pure module: no Supabase imports.
 */
export type DepartmentDef = { key: string; name: string; match: string[] };

export const DEPARTMENTS: DepartmentDef[] = [
  { key: "sales", name: "Sales", match: ["sales", "business development"] },
  { key: "hr", name: "Human Resources", match: ["human resources", "hr", "people & culture"] },
  { key: "finance", name: "Finance & Administration", match: ["finance", "accounting", "accountant", "billing"] },
  { key: "operations", name: "Operations & Client Relationships", match: ["operations", "relationship"] },
  { key: "media-buying", name: "Media Buying", match: ["media buying", "paid media", "paid ads"] },
  { key: "seo", name: "SEO", match: ["seo"] },
  { key: "creative", name: "Creative", match: ["creative", "graphic", "design", "social media", "content"] },
  { key: "strategy", name: "Strategy", match: ["strategy", "strategist"] },
  { key: "onboarding", name: "Onboarding", match: ["onboarding"] },
  { key: "websites-software", name: "Websites & Software", match: ["websites & software", "website", "web development", "software", "developer"] },
  { key: "crm-ai", name: "CRM & AI Automation", match: ["crm", "automation"] },
  { key: "reporting", name: "Reporting", match: ["reporting"] },
  { key: "client-success", name: "Client Success", match: ["client success", "account manager"] },
  { key: "academy", name: "MSP Academy", match: ["academy"] },
];

/** Shown on tasks whose department could not be established from the record. */
export const UNASSIGNED_DEPARTMENT = "Department not assigned – Review required";
export const UNASSIGNED_KEY = "unassigned";

const norm = (v?: string | null) => (v || "").trim().toLowerCase();

function keywordHit(text: string, kw: string) {
  if (!text) return false;
  if (kw.length <= 3) return new RegExp(`(^|[^a-z])${kw.replace(/[^a-z]/g, "")}([^a-z]|$)`).test(text);
  return text.includes(kw);
}

export function isUnassignedDepartment(value?: string | null) {
  const v = norm(value);
  return !v || v === norm(UNASSIGNED_DEPARTMENT) || v === UNASSIGNED_KEY;
}

/** Exact department by key or display name (no keyword guessing). */
export function departmentExact(value?: string | null): DepartmentDef | null {
  const v = norm(value);
  return DEPARTMENTS.find((d) => d.key === v || norm(d.name) === v) ?? null;
}

/** Department a free-text label refers to (e.g. a job title). Keyword match. */
export function departmentFromText(value?: string | null): DepartmentDef | null {
  const t = norm(value);
  if (!t) return null;
  return departmentExact(t) ?? DEPARTMENTS.find((d) => d.match.some((kw) => keywordHit(t, kw))) ?? null;
}

export function departmentName(key: string) {
  if (key === UNASSIGNED_KEY) return UNASSIGNED_DEPARTMENT;
  return DEPARTMENTS.find((d) => d.key === key)?.name ?? key;
}
