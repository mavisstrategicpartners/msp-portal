# Mavis Strategic Partners (MSP) — Complete System Guide
**Company Operations and Performance Dashboard**

* **Document Title:** MSP Dashboard — Complete System Guide  
* **System Purpose:** Company-Wide Operations, Revenue Health, Pipeline Governance & Performance Telemetry  
* **Version:** 2.0.0 (Production Release)  
* **Documentation Date:** 16 October 2026  
* **Implementation Status:** Verified & Fully Operational  

---

## 1. Executive Summary

The **Mavis Strategic Partners (MSP) Company Operations and Performance Dashboard** is an enterprise-grade SaaS operational hub engineered specifically for Mavis Strategic Partners—a premier digital performance marketing, growth architecture, and business consulting agency. 

The platform centralizes every operational layer of the company:
- High-level CEO command telemetry and corporate health diagnostics.
- General Manager execution pipelines and capacity controls.
- Operations & Client Relationship delivery workflows, 2-day client onboarding, and SLA deadline tracking.
- Dedicated Sales and Revenue Pipeline governance.
- Strict Finance & Administration controls, enforcing the payment verification gate and separating pure agency retainer fees from direct client advertising spend.
- Department Manager task allocation, QA checkpoints, and delivery blockers.
- Individual employee workspaces for task execution, deliverable submissions, and attendance tracking.
- Comprehensive HR administration, leave requests, employee scorecards, and payroll platform oversight.

---

## 2. Business Problems Solved

1. **Elimination of Fragmented Operational Silos:** Replaces disconnected spreadsheets, ad hoc WhatsApp chats, and disjointed task lists with an integrated, role-based system.
2. **Strict Financial Boundary Rule:** Solves the critical agency challenge of commingled funds by strictly separating client pass-through media spend (Meta, Google Ads) from pure agency monthly service retainers.
3. **Onboarding Gate Enforcement:** Prevents the operational delivery team from burning uncompensated hours by requiring an authoritative **Payment Verification Gate** clearance from Finance before the 2-day client intake clock can start.
4. **Actionable Executive Health:** Eliminates false "green" health statuses. A single overdue milestone or missing delivery evidence automatically escalates into the CEO Priority Action Queue.
5. **Role-Appropriate Separation:** Eliminates employee confusion by providing distinct, purpose-built workspaces for Sales, Finance, Executive Management, and Delivery Staff.

---

## 3. Technology Stack & Architecture

* **Frontend Framework:** React 19 with Vite 8.3 & TanStack Router 1.170 (file-based routing with SSR capability).
* **State & Data Fetching:** TanStack React Query v5 with optimistic updates and background invalidation.
* **Database & Authentication:** Supabase (PostgreSQL 15+ engine with Row Level Security, pg_cron, and Auth service).
* **Styling & Design System:** Tailwind CSS v4, Radix UI primitives, Lucide React icons, and Sonner notifications.
* **Data Visualizations:** Recharts responsive charting engine for revenue, pipeline velocity, and capacity pacing.
* **Document Engine:** jsPDF and jsPDF-AutoTable for client deliverables and financial exports; docx engine for executive reports.
* **Calendar Engine:** Custom South African business clock enforcing 08:00–17:00 SAST working hours with international timezone bridging.

---

## 4. Role & Permission Architecture

The MSP platform enforces a strict, multi-tiered Role-Based Access Control (RBAC) hierarchy:

| Role Identifier | Role Title | Key Authority & Access Scope | Default Route |
| :--- | :--- | :--- | :--- |
| **`ceo`** | Chief Executive Officer | Command Centre: 5 executive health views, high-level escalations, company-wide audit logs. | `/ceo` |
| **`general_manager`** | Managing Director / GM | Company execution, target revenue pacing, capacity oversight, manager approvals, cross-dept dependencies. | `/gm` |
| **`operations`** | Operations & Relationship Manager | All client workflows, 2-day onboarding intake pipeline, deliverable deadlines, QA verifications, retention recovery. | `/operations` |
| **`sales`** | Sales & Business Development | Dedicated CRM pipeline: Prospect lead qualification, proposal tracking, win/loss recordings, operations handoff. | `/sales` |
| **`finance_admin`** | Finance & Administration | Financial oversight: Invoicing, payment verification gate, expense disbursements, budget controls, audit exports. | `/finance` |
| **`department_manager`** | Department Manager (Media/Creative) | Department workload distribution, QA reviews, deliverable approvals, operational blockers. | `/department` |
| **`hr`** | Human Resources & Performance | Workforce directory, attendance oversight, leave approval workflows, employee performance scorecards. | `/host/hr` |
| **`admin`** | System Administrator | User provisioning, role assignment, system configuration, audit trails, and platform integrations. | `/admin/users` |
| **`staff`** | Employee / Specialist | Individual workspace: Assigned tasks, deliverable submission, clock-in attendance, SOP library, knowledge resources. | `/home` |

---

## 5. Detailed Dashboard Explanations

### 5.1 CEO Command Centre (`/ceo`)
The CEO Command Centre aggregates real-time company telemetry across **Five Business Health Dimensions**:
1. **Sales Health (`/ceo/sales`):** Active pipeline volume, weighted forecast, discovery-to-won conversion rate, and sales rep deal velocity.
2. **Revenue Health (`/ceo/revenue`):** Monthly recurring revenue (MRR), gross invoiced agency fees, verified collections, and overdue receivables.
3. **Client Health (`/ceo/clients`):** Account health indices, active retention recovery interventions, and client satisfaction (CSAT) indicators.
4. **Delivery Health (`/ceo/delivery`):** SLA compliance, overdue deliverable counts, approaching deadlines (7-day window), and QA verification backlogs.
5. **Team Health (`/ceo/team`):** Live workforce presence, team utilization rates, burnout risks, and outstanding leave requests.

**The Actionable Priority Queue:**
A high-visibility decision engine displaying the affected client, service or milestone, original baseline due date, revised due date, working hours late, active blocker, accountable owner, responsible manager, delay categorization, required next action, and escalation recipient. Overdue critical work is permanently highlighted in red and cannot be marked healthy.

---

### 5.2 General Manager Dashboard (`/gm`)
Designed for the Managing Director to drive weekly and monthly business execution:
- **Company Execution (`/gm/execution`):** Departmental velocity, cross-functional SLA commitments, and manager accountability tracking.
- **Revenue Performance (`/gm/revenue`):** Target vs. actual variance analysis and gross billing forecasts.
- **Capacity & Workload (`/gm/capacity`):** Headcount capacity utilization, over-servicing alerts, and specialist allocations.
- **Manager Approvals (`/gm/approvals`):** High-level sign-offs for exceptions, budget overrides, and contract adjustments.
- **Cross-Department Dependencies (`/gm/dependencies`):** Critical path tracking between Graphics, Media Buying, Copywriting, and Tech.
- **Escalations (`/gm/escalations`):** Formal dispute resolution for operational bottlenecks exceeding 24 hours.

---

### 5.3 Operations & Relationship Dashboard (`/operations`)
The operational engine of MSP ensuring client retention and flawless delivery:
- **Client Workflows (`/operations/workflows`):** Lifecycle management from contract inception to mature monthly retainer.
- **Client Onboarding (`/operations/onboarding`):** Strict 2-day client setup protocol (Technical access, GHL account, pixel placement, WhatsApp API connection).
- **Service Deadlines (`/operations/deadlines`):** Live deliverable schedule with SLA risk indicators (Low, Moderate, High, Breached).
- **Client Communications (`/operations/communications`):** Scheduled touchpoints, executive QBRs, and client complaint tracking.
- **Recovery Plans (`/operations/recovery`):** Structured 30-day intervention workflows for accounts flagged at risk of churn.
- **Verification Queue (`/operations/verifications`):** Formal QA gate where submitted work must be independently audited before client handoff.

---

### 5.4 Sales Dashboard — Dedicated Workspace (`/sales`)
A purpose-built commercial CRM workspace completely distinct from employee task boards:
- **Pipeline KPI Summary:** Active pipeline value, monthly closed-won revenue, conversion rate, and pending proposals.
- **Sales Targets:** Visual progress bar against the ZAR 300,000 monthly quota.
- **Leads & Prospects:** Prospect directory supporting lead qualification (`Hot`, `Warm`, `Cold`), lead sources (Meta Ads, Website, Cold Outreach, LinkedIn), and search.
- **Interactive Pipeline Board:** Sequential stage tracking (`New` → `Contacted` → `Discovery` → `Proposal Sent` → `Won` / `Lost`).
- **Follow-ups & Meetings:** Overdue follow-up alerts, consultation schedules, and interactive touchpoint logger.
- **Operations Handover:** Direct handoff trigger transmitting closed-won deal details, ad spend figures, and kickoff dates to Operations.

---

### 5.5 Finance & Administration Dashboard — Dedicated Workspace (`/finance`)
Financial governance and revenue verification workspace:
- **Financial Boundary Rule:** Explicit separation of invoiced agency fees from client direct advertising budgets.
- **Payment Verification Gate:** Authoritative toggle where Finance verifies proof of payment, automatically unlocking the Operations onboarding clock.
- **Invoices & Billing:** Creation and management of client tax invoices with status tracking (`Paid & Verified`, `Awaiting Payment`, `Overdue`).
- **Revenue & Operating Expenses:** Recording of operational overhead, SaaS subscriptions, and specialist contractor payouts.
- **Budgets & Profitability:** Departmental budget allocations vs. actual expenditures with variance meters and gross margin calculations.
- **Financial Approvals:** Review and sign-off queue for departmental purchase requests and expense claims.
- **Audit Trail & CSV Export:** Live downloading of complete financial records and standing notice of external Xero/Sage integration status.

---

### 5.6 Staff & Employee Workspace (`/home`)
Employee-focused daily productivity cockpit:
- **Live Attendance Widget:** Digital clock-in / clock-out tracking SAST working hours.
- **Assigned Tasks Board:** Tasks organized by status (`Ready`, `In Progress`, `Blocked`, `Submitted for Review`, `Accepted Complete`).
- **Deliverable Submission & Evidence:** File attachment and link submission required prior to QA sign-off.
- **Quick Knowledge Links:** Direct access to SOP Library, 7 Core Agency Services, Pricing Packages, and Technical Tooling.
- **Core Operating Principles:** Constant alignment with MSP rules (Leads over Followers, Systems over Campaigns, Automation over Manual Work, Data over Opinions).

---

### 5.7 HR & Workforce Management (`/host/hr`)
Integrated human capital management platform:
- **Live Workforce Presence:** Real-time visibility into who is clocked in across all departments.
- **Leave Management:** Annual, sick, maternity, and compassionate leave request and approval workflows.
- **Timesheets & Capacity:** Weekly submission of billable vs. non-billable client delivery hours.
- **Payroll Platform:** Employee remuneration registers, tax withholdings, and contractor disbursement records.
- **Employee Documents:** Secure storage of contracts, employment declarations, and performance reviews.

---

### 5.8 System Administrator Control (`/admin`)
Technical governance and audit suite:
- **Manage Staff (`/admin/users`):** Account provisioning, role assignments, department assignments, and deactivation.
- **Audit Logs (`/admin/audit`):** Immutable chronological record of system access, permission modifications, and data updates.
- **Content Editor & Sales Playbook (`/admin/content`, `/admin/sales-playbook`):** Central management of client-facing pitch materials and SOP definitions.

---

## 6. Business Clocks, Operating Calendars & SLA Rules

MSP operates under strict business hour governance:
* **Operating Hours:** Monday to Friday, 08:00 to 17:00 SAST (Africa/Johannesburg).
* **Working Hours per Business Day:** 9 productive hours per day.
* **Public Holidays Observed:** Automatically pauses delivery clocks for statutory holidays in South Africa, Zimbabwe, and Colorado (US).
* **Tri-Timer Tracking Model:**
  1. *Client Elapsed Time:* Total calendar time from initial engagement to completion.
  2. *Internal Service Time:* Active working hours spent by MSP specialists on the task.
  3. *Stage Time:* Duration a task resides in a specific workflow stage.

---

## 7. Data Privacy, Security & POPIA Compliance

1. **Authentication:** Supabase Auth utilizing JSON Web Tokens (JWT) with automatic refresh.
2. **Access Control:** Row Level Security (RLS) ensures staff members cannot access HR records, salary data, or company-level financial margins.
3. **South African POPIA Compliance:** Personal identifying information (PII) including ID numbers, residential addresses, and banking details are encrypted at rest and restricted exclusively to HR and Executive roles.
4. **Credential Protection:** Secrets, service role keys, and API credentials are kept strictly in server-side environment variables and are never bundled into client distributions.

---

## 8. Integration Architecture & Fallback Procedures

* **GoHighLevel (GHL) CRM:** Inbound lead sync and automated WhatsApp appointment funnels. *Fallback:* Manual lead entry via `/sales` with full pipeline persistence.
* **Meta & Google Ads:** Attribution and pacing monitoring. *Fallback:* Direct ad spend logging on invoices separating pass-through spend from retainer fees.
* **Accounting (Xero / Sage):** Cloud ledger synchronization. *Fallback:* Native MSP database billing ledger with live CSV export functionality.
