/** HR lists shared by the server API and the HR pages (no secrets, safe for the browser). */
export const FOLDER_CATEGORIES = [
  "Personal information",
  "Employment contract",
  "Identity documents",
  "Qualifications",
  "Certificates",
  "Leave records",
  "Disciplinary records",
  "Performance",
  "Tax & banking",
  "Policies & declarations",
  "Other",
] as const;
export const LEAVE_TYPES = ["Annual leave", "Sick leave", "Family responsibility leave", "Maternity leave", "Parental leave", "Study leave", "Unpaid leave", "Other"] as const;
export const EMPLOYMENT_TYPES = ["Permanent", "Fixed-term contract", "Part-time", "Intern", "Learnership", "Freelance"] as const;

/** Working days between two dates, inclusive (Monday–Friday). */
export function workingDays(start: string, end: string) {
  let n = 0;
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}
