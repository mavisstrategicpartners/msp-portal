import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { departmentExact, departmentFromText, isUnassignedDepartment, UNASSIGNED_KEY } from "@/lib/departments";

export type DepartmentInfo = {
  key: string;
  name: string;
  lead: { id: string; name: string; title: string; active: boolean } | null;
};

export type DepartmentsResponse = {
  departments: DepartmentInfo[];
  assignable: string[];
  canManageLeads: boolean;
  canCorrectAny: boolean;
};

/** Departments, confirmed leads, and what the signed-in user may assign into. */
export function useDepartments() {
  return useQuery({
    queryKey: ["staff", "departments"],
    queryFn: async (): Promise<DepartmentsResponse> => {
      const res = await fetch("/api/staff/departments", { headers: await getAuthHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Could not load departments");
      return body;
    },
    staleTime: 60_000,
  });
}

/** Key of the department recorded on a task ("unassigned" when none/unknown). */
export function taskDepartmentKey(department?: string | null): string {
  if (isUnassignedDepartment(department)) return UNASSIGNED_KEY;
  return (departmentExact(department) ?? departmentFromText(department))?.key ?? UNASSIGNED_KEY;
}

/**
 * Departments a page may offer in its department picker: everything for
 * company-wide roles, otherwise the departments the user manages.
 */
export function useDepartmentOptions(companyWide: boolean) {
  const q = useDepartments();
  const options = useMemo(() => {
    const all = q.data?.departments ?? [];
    if (companyWide || q.data?.canCorrectAny) return all;
    const mine = new Set(q.data?.assignable ?? []);
    return all.filter((d) => mine.has(d.key));
  }, [q.data, companyWide]);
  return { ...q, options };
}
