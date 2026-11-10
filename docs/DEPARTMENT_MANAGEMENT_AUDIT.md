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

## 6. System-wide separation audit (10 November 2026, second pass)

Every active account was run through the live role and landing logic, and the database access helpers were reviewed.

| Found | Cause | Fixed in |
|---|---|---|
| HR staff (an intern and the receptionist) got the HR workspace **and** read/write access to every HR table, payroll included | `msp_is_hr` / HR role matched anyone in the HR department or with "HR" in their title | Database helpers `msp_is_hr` / `msp_is_finance` now require the HR / Finance manager appointment; app roles likewise (`computeAccess` with appointments) |
| Accounts with a manager tier but no appointment (Shamah Muchena, Sipho Kupiso) landed on an empty Department workspace | Department-manager role inferred from tier/title | Department-manager role requires an appointment; otherwise staff home |
| "sales admin" had Sales-manager rights with no Sales manager appointed | Title/tier inference | Sales-manager rights require the Sales manager appointment |
| The Media Buying manager could see and review every task it had ever assigned, in IT, Websites and Operations | "Assigning manager keeps oversight" rule | Oversight comes only from managing the task's department (GM/admin company-wide); submissions notify that department's manager, else the GM |
| Department dashboard was written for Media Buying for every department ("Paid Ads & Acquisition", media budgets, a fixed 93.3% target) | Single hard-coded page | Department-aware dashboard built from the department's own tasks and employees, with a focus section suited to the department |
| Client tools (Client Delivery, Monthly Reports) shown to internal departments | One sidebar for all | Shown only to client-facing departments and company-wide roles |
| Appointment did not set a manager's role (an HR manager whose title lacked "HR" did not get the HR workspace) | Role came from titles | The appointment grants the department's role (HR, Finance, Operations, Sales, Department manager) |

Verified with an automated check across all 16 departments (215 checks): each manager sees and assigns only their own department's work and employees, cannot review or view another department's tasks, submissions or scorecards, lands on the right dashboard, and only their own manager is notified of submissions; the GM and CEO see every department.

Needs a decision: the new account **Sipho Kupiso** (manager tier, IT Department, no job title) is not placed in a department or appointed — confirm whether he is the IT manager.

## 7. Department-specific management tools (10 November 2026, third pass)

| Department | Tools |
|---|---|
| HR, Finance & Administration, Sales, Operations | Existing dedicated workspaces (reused) |
| Onboarding | Existing client onboarding module in Operations (now open to the Onboarding manager) |
| IT | Support requests, incidents, assets & infrastructure, maintenance schedule |
| Marketing | Campaigns, content calendar |
| SEO | SEO projects, keyword tracking, ranking reports |
| Creative | Design briefs (brief → design → review → revisions → approved) |
| Media Buying | Ad campaigns by platform with client ad budget and spend (client money, labelled) |
| Websites & Software | Development projects, bugs, releases, change requests |
| Client Success | Client relationships, complaints & escalations, satisfaction checks |
| CRM & AI Automation | Automation workflows, integrations, CRM requests |
| Reporting | Report schedule, data issues |
| Strategy | Strategic initiatives |
| MSP Academy | Training programmes, learners, assessments |

Definitions: `src/lib/department-modules.ts`; storage `public.department_records` (server-only); API `/api/staff/records` (`src/lib/department-records.server.ts`).
Requests to other departments (IT support, design briefs, bugs, website changes, CRM work, reports, client complaints) are raised from **Requests to Departments** and go to that department's manager (or the GM when it has none); the requester is notified as the stage changes.
Tasks can be assigned to several employees at once (one task each). Add Staff uses the 16 departments, places the person, and can appoint them as manager.
Temporary manager appointments were recorded for the 12 departments without a manager (`temp.<department>.manager@…`); an administrator creates the logins with **Provision pending accounts**.
Tested: 448 workflow checks across 16 departments and 27 record types; 215 separation checks; sidebar check per department.
