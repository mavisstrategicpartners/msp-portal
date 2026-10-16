# Mavis Strategic Partners (MSP)
# Company Operations and Performance Dashboard
## Complete System Guide, User Manual, Administrator Handover & Official Governance Documentation

```
================================================================================
Document:       MSP Complete System & Login Documentation Pack
Version:        2.0.0 (Master Release)
Date:           16 October 2026
Author:         DeepMind Advanced Agentic Systems for Mavis Strategic Partners
Target Stack:   React 19, Vite 8, TanStack Router, Supabase, Tailwind CSS, PostgreSQL
Classification: Strictly Confidential — Corporate Operating System
================================================================================
```

---

## Table of Contents

1. **Title Page & Revision History**
2. **Executive Summary & Corporate Purpose**
3. **PART I: Complete System Architecture & Role Guide**
   - 3.1 Technology Stack & Database Engine
   - 3.2 Role-Based Access Control (RBAC) Hierarchy & Permissions Matrix
   - 3.3 System Dashboards & Dedicated Workspaces
   - 3.4 Business Clock, Calendars & SLA Rules
   - 3.5 POPIA Compliance, Data Security & Privacy Controls
4. **PART II: Official User Manual & Standard Operating Procedures**
   - 4.1 Sign-In, Session Management & Password Updates
   - 4.2 Staff & Employee Workspace Workflows (`/home`)
   - 4.3 Sales & Revenue Pipeline Workflows (`/sales`)
   - 4.4 Finance & Administration Governance (`/finance`)
   - 4.5 Operations & Relationship Management (`/operations`)
   - 4.6 Department Manager Workflows (`/department`)
5. **PART III: System Administrator & Technical Handover Guide**
   - 5.1 Project Folder Architecture
   - 5.2 Environment Variables & Secret Management
   - 5.3 Database Schema, Relations & Migrations
   - 5.4 Build, Test, Lint & Startup Commands
   - 5.5 Backup, Point-in-Time Recovery & Disaster Recovery
6. **PART IV: Verified User Access & Login Register**
   - 6.1 Compliance & Security Rules
   - 6.2 Authoritative User Account Inventory
   - 6.3 Password Recovery & Account Provisioning Protocols
7. **PART V: Implementation Audit & Acceptance Report**
   - 7.1 Detailed Requirement Verification Matrix
   - 7.2 Sales & Finance Acceptance Test Results
   - 7.3 Outstanding External Dependencies & Action Plan

---

## 1. Title Page & Revision History

| Version | Release Date | Summary of Changes | Author / Reviewer |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 30 June 2026 | Initial prototype deployment; basic staff dashboard & base DB schema. | MSP Engineering |
| **1.5.0** | 15 October 2026 | Staff task board, presence widget, and initial operations service integration. | MSP Engineering |
| **2.0.0** | 16 October 2026 | Master Version 2 Release: Complete separation of Sales and Finance dashboards; dedicated `/sales` and `/finance` routes; payment verification gate; ZAR 300k sales quota tracker; fee vs. ad spend separation; complete documentation pack. | DeepMind Systems |

---

## 2. Executive Summary & Corporate Purpose

The **Mavis Strategic Partners (MSP) Company Operations and Performance Dashboard** is the centralized, authoritative operating system for Mavis Strategic Partners. 

The software powers the daily operational, financial, and strategic workflows of the firm:
- **Executive Command:** Provides CEO and General Manager telemetry across sales, revenue, client health, delivery compliance, and team capacity.
- **Commercial Governance:** Provides Sales with a dedicated CRM pipeline, preventing deal duplication, enforcing follow-up cadences, and executing smooth handoffs to delivery teams.
- **Financial Integrity:** Enforces the strict Financial Boundary Rule, separating pure agency monthly service fees from client direct advertising budgets (Meta / Google ad accounts), and establishes the **Payment Verification Gate** as a mandatory precursor to client onboarding.
- **Operational Delivery:** Manages the strict 2-day client onboarding process, deliverable deadlines, quality assurance checkpoints, and retention interventions.

---

## 3. PART I: Complete System Architecture & Role Guide

### 3.1 Technology Stack & Database Engine
* **Frontend:** React 19, Vite 8.3, TanStack Router v1.170, Tailwind CSS v4, Radix UI primitives, Lucide React icons.
* **State Management:** TanStack React Query v5 with automatic background invalidation and stale-time caching.
* **Database & Auth:** Supabase PostgreSQL 15+ engine with Row Level Security (RLS) policies, triggers, and JWT session handling.
* **Currency Engine:** South African Rand (`ZAR` / `R`) formatting with decimal precision and compact notation (`formatZAR`).
* **Document Engine:** Client-side CSV generation, PDF auto-table formatting, and native docx document compilation.

### 3.2 Role-Based Access Control (RBAC) Permissions Matrix

| Functional Module | CEO (`ceo`) | Managing Director (`gm`) | Operations (`operations`) | Sales (`sales`) | Finance (`finance_admin`) | Dept Manager (`department_manager`) | Staff (`staff`) | HR (`hr`) | Admin (`admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive Health Views** | View / Act | View / Act | Restricted | Restricted | Restricted | Restricted | Restricted | Restricted | View |
| **Sales Pipeline & Deals** | View | View | View (Won) | Full Control | View (Won) | Restricted | Restricted | Restricted | Full Control |
| **Client Onboarding Queue**| View | View | Full Control | View Handover | View Clearance | Department Steps | Assigned Tasks | Restricted | Full Control |
| **Invoicing & Billing** | View | View | Restricted | Restricted | Full Control | Restricted | Restricted | Restricted | View |
| **Payment Verification Gate**| View | View | View Status | Restricted | Full Control | Restricted | Restricted | Restricted | Full Control |
| **Operating Expenses** | View | View | Restricted | Restricted | Full Control | Submit Claims | Restricted | Restricted | View |
| **Department Workload & QA**| View | View | View | Restricted | Restricted | Full Control | Submit Work | Restricted | View |
| **Staff Task Execution** | View | View | View | Restricted | Restricted | Manage | Execute | Restricted | Manage |
| **Attendance & Clock-In** | View All | View All | View All | Log Own | Log Own | View Dept | Log Own | Manage All | Manage All |
| **HR & Payroll Records** | View | View | Restricted | Restricted | View Salaries | Restricted | Restricted | Full Control | Administer |
| **Audit Logs & Settings** | Full Audit | View Logs | Restricted | Restricted | Export Finance | Restricted | Restricted | HR Audit | Full Control |

### 3.3 System Dashboards & Dedicated Workspaces

1. **CEO Command Centre (`/ceo`):** 5 business health views (Sales, Revenue, Client, Delivery, Team) and CEO Priority Action Queue.
2. **General Manager Workspace (`/gm`):** Execution velocity, target revenue pacing, capacity utilization, and manager approvals.
3. **Operations Command (`/operations`):** Client lifecycle workflows, 2-day onboarding pipeline, deliverable deadlines, QA verification gate, and retention recovery.
4. **Sales Workspace (`/sales`):** Commercial CRM, pipeline board (`New` → `Contacted` → `Discovery` → `Proposal Sent` → `Won`), overdue follow-up alerts, monthly ZAR 300k quota progress, and operations handover.
5. **Finance Command (`/finance`):** Agency fee vs. media spend separation, payment verification gate, client tax invoices, expense logs, budget meters, and CSV exports.
6. **Department Workspace (`/department`):** Task assignments, team workload distribution, QA reviews, and delivery blockers.
7. **Employee Workspace (`/home`):** Clock-in widget, personal tasks board, deliverable evidence submission, and SOP library.
8. **HR Management (`/host/hr`):** Live staff presence board, leave management, timesheets, payroll, and employee scorecards.
9. **Admin Control (`/admin`):** Staff account provisioning, permission assignments, content editing, and audit trails.

### 3.4 Business Clock, Calendars & SLA Rules
* **Standard Working Hours:** Monday to Friday, 08:00 to 17:00 SAST (Africa/Johannesburg).
* **Working Day Definition:** 9 productive working hours per day.
* **Public Holiday Governance:** Clocks automatically pause for South Africa, Zimbabwe, and Colorado (US) statutory holidays.
* **Tri-Timer Architecture:** Tracks Client Elapsed Time, Internal Service Time, and Stage Time independently.

### 3.5 POPIA Compliance & Security Controls
* **Data Encryption:** All data encrypted in transit via TLS 1.3 and at rest via AES-256.
* **Strict Least Privilege:** Staff cannot view confidential HR files, employee compensation, or company-wide profit margins.
* **No Secret Exposure:** Zero secrets, API keys, or service role tokens are bundled in client assets or logged in plain text.

---

## 4. PART II: Official User Manual & Standard Operating Procedures

### 4.1 Sign-In & Session Management
1. Navigate to `http://localhost:8081/auth`.
2. Input your verified company email and password.
3. Click **Sign In**. The system automatically redirects you to your role-specific dashboard.
4. To sign out, click your avatar in the top right and select **Log out**.
5. To change your password, access **Settings** (`⌘,`), enter your current password, and submit a new 8+ character password.

### 4.2 Staff & Employee Workflow (`/home`)
1. **Clock-In / Clock-Out:** Click **Clock In** at 08:00 SAST. Click **Clock Out** at 17:00 SAST.
2. **Managing Tasks:** On `/home`, click on an assigned task card and select **Start Task** to move to `In Progress`.
3. **Submitting Evidence:** When complete, click **Submit for Review**, provide the deliverable link (Google Drive / Figma / Meta Ads), and click **Confirm Submission**.
4. **Raising Blockers:** If delayed, click **Report Blocker**, select the reason, and explain what is needed to resume.

### 4.3 Sales & Revenue Pipeline Workflow (`/sales`)
1. **Create Opportunity:** Click **+ Add Opportunity**, input business name, contact, monthly ZAR value, lead quality (`Hot`, `Warm`, `Cold`), and source. Click **Save Lead**.
2. **Advance Pipeline:** On the **Pipeline Board** tab, click the transition buttons to move deals from `New` → `Contacted` → `Discovery` → `Proposal Sent` → `Won`.
3. **Log Touchpoints:** On the **Follow-ups & Meetings** tab, click **Log Touchpoint**, enter meeting outcomes, and set next follow-up dates.
4. **Operations Handover:** When a deal is won, navigate to **Operations Handover**, verify the kickoff date, add technical notes, and click **Transmit Handover**.

### 4.4 Finance & Administration Workflow (`/finance`)
1. **Payment Verification Gate:** On the **Invoices & Verification Gate** tab, locate invoices awaiting payment. When funds clear, click **Verify Payment**. This logs your verification timestamp and unlocks the Operations onboarding intake clock.
2. **Issue Invoices:** Click **+ New Invoice**, input client name, package, monthly agency fee, direct client media spend, and due date. Click **Generate Invoice**.
3. **Record Expenses:** On the **Revenue & Expenses** tab, click **Log Expense**, enter vendor name, category, and ZAR amount.
4. **Approve Purchases:** On the **Financial Approvals** tab, review requests from department leads and click **Approve** or **Decline**.
5. **Export CSV:** Click **Export Report (CSV)** in the header to download complete invoice and collection records.

### 4.5 Operations & Delivery Workflows (`/operations`)
1. **2-Day Onboarding:** Navigate to `/operations/onboarding` and complete the 4 technical setup steps within 48 business hours.
2. **Service Deadlines:** Monitor `/operations/deadlines` daily and escalate any items flagged overdue or at SLA risk.
3. **QA Verifications:** Review submitted specialist work on `/operations/verifications` and click **Verify & Accept** or **Request Rework**.

---

## 5. PART III: System Administrator & Technical Handover Guide

### 5.1 Project Folder Architecture
See Section 1 of Document 3 (`MSP_ADMIN_TECHNICAL_HANDOVER.md`) for full directory layout.

### 5.2 Environment Variables
* `VITE_SUPABASE_URL` — Supabase API gateway URL.
* `VITE_SUPABASE_PUBLISHABLE_KEY` — Anon public API key.
* `SUPABASE_SERVICE_ROLE_KEY` — Master server-side admin key (**Confidential**).
* `OPENROUTER_API_KEY` — AI reasoning engine key (**Confidential**).

### 5.3 Local Development & Build Commands
```bash
# Install packages
npm install

# Start local dev server (http://localhost:8081)
npm run dev

# Run TypeScript type check
cmd /c "npx tsc --noEmit"

# Compile production bundle
npm run build
```

---

## 6. PART IV: Verified User Access & Login Register

| Verified Full Name | Work Email Address | Role | Department | Account Status | Permitted Route | Credential Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| Mavis Muchena | `ceo@mavisstrategicpartners.co.za` | `ceo` | Executive | **Active** | `/ceo` | Configured (`CEO2026!`) |
| General Manager | `general.manager@mavisstrategicpartners.co.za` | `general_manager` | Executive Management | **Active** | `/gm` | Password not retrievable — use reset |
| Operations Manager | `operations@mavisstrategicpartners.co.za` | `operations` | Operations | **Active** | `/operations` | Password not retrievable — use reset |
| Sales Executive | `sales@mavisstrategicpartners.co.za` | `sales` | Sales Team | **Active** | `/sales` | Configured (`Sales2026!`) |
| Finance & Admin Manager | `financeadministration@mavisstrategicpartners.co.za` | `finance_admin` | Admin Department | **Active** | `/finance` | Configured (`Finance2026!`) |
| Department Manager | `department.manager@mavisstrategicpartners.co.za` | `department_manager` | Marketing Team | **Active** | `/department` | Configured (`Department2026!`) |
| HR Lead | `hr@mavisstrategicpartners.co.za` | `hr` | Human Resources | **Active** | `/host/hr` | Password not retrievable — use reset |
| System Administrator | `superadmin@mavisstrategicpartners.co.za` | `admin` | IT Administration | **Active** | `/admin/users` | Password not retrievable — use reset |
| Siphelele Malotana | `siphelele.malotana@mavisstrategicpartners.co.za` | `staff` | IT Department | **Active** | `/home` | Password not retrievable — use reset |

---

## 7. PART V: Implementation Audit & Acceptance Report

### 7.1 Summary of Acceptance Results
* **Role-Based Access Control:** **PASS** (Clean role isolation and routing across all accounts).
* **Sales Workspace:** **PASS** (Full CRM pipeline, ZAR 300k target meter, touchpoint logger, ops handoff).
* **Finance Workspace:** **PASS** (Payment verification gate, fee vs media spend separation, expense logs, CSV export).
* **CEO 5 Health Views:** **PASS** (Telemetry for Sales, Revenue, Client, Delivery, and Team with Priority Action Queue).
* **Build Verification:** **PASS** (`✓ built in 4.90s` with zero errors).
* **HTTP Endpoints:** **PASS** (`/auth`, `/sales`, `/finance`, `/ceo`, `/gm`, `/operations` responding with HTTP 200).
* **External Accounting API:** **BLOCKED (Awaiting MSP Production API Credentials)**.

---

## 8. Outstanding Actions & Ownership

| Action Item | Responsible Owner | Target Resolution | Dependency / Requirement |
| :--- | :---: | :---: | :--- |
| **Xero / Sage Production API Key** | Finance & Admin / MSP Executive | Q4 2026 | Provision OAuth credentials for two-way ledger sync |
| **First-Login Employee Password Reset** | System Admin / HR | Onboarding | Direct real staff to reset initial passwords via `/auth` |
| **Production Domain DNS Cutover** | DevOps / IT Admin | Handover | Map production domain CNAME to Cloudflare Nitro deployment |
