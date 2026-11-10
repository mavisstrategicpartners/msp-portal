# Department management — audit and implementation checklist

Audit of the live system on 10 November 2026, before changing the department manager experience.

## 1. Works — retained

| Area | Where |
|---|---|
| 16 departments, one list used everywhere | `src/lib/departments.ts` |
| Department membership (main + "also works in") | `public.department_members` |
| Department managers | `public.department_leads` |
| Assignment rules: managers → own department's employees; GM directs managers / covers vacancies; admin within department; CEO read-only | `src/lib/org-structure.server.ts`, `src/lib/staff-server.ts` |
| Task creation, priorities, deadlines, reassignment, progress, evidence submission, review/approval, overdue flags | `/api/staff/tasks`, `/api/staff/evidence`; Department workspace pages |
| Notifications (assignment, submission, deadline, review) with stored read state | ledger `staff_notif_upsert`; bell + panels |
| Staff account creation with one-time password + forced change | `createTeamMember`, `/set-password` |
| Landing pages by role; appointed staff-level managers → Department workspace | `landingPath` in `src/lib/roles.ts` |
| Department Structure page (CEO/admin edit, GM view) | `/ceo/structure`, `/admin/structure`, `/gm/structure` |

## 2. Existed but needed improvement — improved

| Issue | Change |
|---|---|
| Department workspace team list showed **every account in the company** | Team = employees of the manager's own department(s); GM/admin see all |
| Team "On-time delivery" was a fixed **100%** for everyone | Calculated from the person's completed tasks with due dates; "—" when none |

## 3. Duplicated — consolidated

| Duplicate | Resolution |
|---|---|
| Department Review page had its own "set manager" controls (admin) alongside Department Structure | Review page manager list is read-only and points to Department Structure (the single place to appoint) |

## 4. Missing — created

| Gap | Change |
|---|---|
| No way to record the person appointed to a vacant manager position | `public.manager_appointments` (server-only) + "Appoint" on Department Structure → Manager accounts |
| Manager accounts had to be created one by one | Admin-only **Provision pending accounts**: links existing accounts (password untouched) or creates new ones with one-time passwords; idempotent; summary of existing / created / linked / failed / still vacant; temporary passwords shown once, never stored |
| No view of manager login health | Manager accounts tab: active, last sign-in, still on temporary password, deactivated |

## 5. Not created — needs a real person

No verified identity exists for these positions (the HR employee register is empty, and every person in the system already has an account). They are flagged as vacant until the CEO or an administrator appoints someone:

IT Department, Marketing Department, Sales, Client Success, Strategy, Creative, SEO, Websites & Software, CRM & AI Automation, Reporting, Onboarding, MSP Academy.

Existing managers (accounts retained, passwords not changed): Operations — Xongile Mhlari; Human Resources — HR Manager login; Finance & Administration — Finance & Administration Manager login; Media Buying — Department Manager (Media Buying) login.
