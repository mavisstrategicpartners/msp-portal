# Mavis Strategic Partners (MSP) — System Administrator & Technical Handover Guide

* **Document Title:** Technical Handover & System Administrator Manual  
* **Target Audience:** Lead Engineers, DevOps, System Administrators, CTO  
* **Version:** 2.0.0  
* **Publication Date:** 16 October 2026  

---

## 1. Project Directory Structure

```
msp-portal/
├── .env                              # Environment variable configuration (Local / Staging)
├── index.html                        # Application entry HTML template
├── package.json                      # Node dependencies and project build scripts
├── vite.config.ts                    # Vite build pipeline & TanStack start plugins
├── tsconfig.json                     # TypeScript compiler configuration
├── docs/                             # Official MSP System Documentation Pack
│   ├── MSP_COMPLETE_SYSTEM_GUIDE.md
│   ├── MSP_USER_MANUAL.md
│   ├── MSP_ADMIN_TECHNICAL_HANDOVER.md
│   ├── MSP_USER_ACCESS_REGISTER.md
│   ├── MSP_IMPLEMENTATION_ACCEPTANCE_REPORT.md
│   └── MSP_COMPLETE_SYSTEM_AND_LOGIN_DOCUMENTATION.md
├── src/
│   ├── main.tsx                      # Frontend hydration entrypoint
│   ├── routeTree.gen.ts              # TanStack Router auto-generated route manifest
│   ├── components/                   # Reusable UI component library
│   │   ├── app-shell.tsx             # Global application layout, topbar & dynamic sidebar
│   │   ├── dashboards/               # Dedicated role dashboard components
│   │   │   ├── CeoDashboard.tsx
│   │   │   ├── GeneralManagerDashboard.tsx
│   │   │   ├── OperationsDashboard.tsx
│   │   │   ├── DepartmentManagerDashboard.tsx
│   │   │   ├── SalesDashboard.tsx
│   │   │   ├── FinanceAdminDashboard.tsx
│   │   │   ├── StaffWorkspaceDashboard.tsx
│   │   │   ├── HrDashboard.tsx
│   │   │   └── ClientSuccessDashboard.tsx
│   │   └── ui/                       # Radix UI design primitives (Card, Badge, Button, Dialog)
│   ├── lib/                          # Utility functions, business logic, API clients
│   │   ├── currency.ts               # South African Rand (ZAR) formatting engine
│   │   ├── use-profile.ts            # RBAC role resolution and profile hooks
│   │   ├── useSupabaseTable.js       # Resilient Supabase data binding hook
│   │   └── operations-manager.service.ts # Authoritative operations database service
│   ├── routes/                       # TanStack file-based routing architecture
│   │   ├── __root.tsx                # Root route wrapper
│   │   ├── auth.tsx                  # Authentication, login form & role-based redirector
│   │   └── _authenticated/           # Protected layout requiring valid session
│   │       ├── home.tsx              # Employee workspace & role redirector
│   │       ├── sales.tsx             # Dedicated Sales CRM Pipeline route
│   │       ├── finance.tsx           # Dedicated Finance & Administration route
│   │       ├── ceo/                  # CEO 5 health views and command routes
│   │       ├── gm/                   # General Manager execution and capacity routes
│   │       ├── operations/           # Operations workflows, onboarding, deadlines
│   │       ├── department/           # Department manager QA and workload routes
│   │       └── admin/                # Admin user management and audit logs
│   └── host-portal/                  # Integrated HR, Payroll & Timesheet sub-application
└── supabase/
    └── migrations/                   # PostgreSQL schema definitions and migrations
        ├── 20260630205519_base_schema.sql
        ├── 20261015160000_staff_dashboard.sql
        ├── 20261020000000_create_finance_invoices.sql
        └── 20261021000000_create_sales_deals.sql
```

---

## 2. Environment Variables Specification

The system requires the following environment variables configured in `.env` (or cloud deployment secrets):

| Variable Name | Description | Environment | Confidentiality |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project API gateway endpoint | Client & Server | Public / Safe |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon / Public API key | Client & Server | Public / Safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase master administrative key | Server-side only | **STRICTLY CONFIDENTIAL** |
| `VITE_APP_NAME` | Portal application branding name | Client | Public |
| `VITE_APP_DOMAIN` | Production web application domain | Client | Public |
| `OPENROUTER_API_KEY` | AI SOP assistant reasoning API key | Server-side only | **CONFIDENTIAL** |
| `OPENAI_API_KEY` | Secondary LLM fallback key | Server-side only | **CONFIDENTIAL** |

> **Security Rule:** Never commit `.env` or paste `SUPABASE_SERVICE_ROLE_KEY` into frontend bundles, documentation, or public repositories.

---

## 3. Database Architecture & Relationships

The database is built on **PostgreSQL 15+** managed via Supabase:

### Core Tables & Schemas:
1. **`public.profiles`:**
   - Primary key: `id` (UUID references `auth.users.id`).
   - Fields: `full_name`, `email`, `phone`, `department` (Enum: `CEO`, `Managing Director`, `Operations Manager`, `Sales Team`, `Admin Department`, `Marketing Team`, `IT Department`, `Human Resources`), `job_title`, `role_tier` (`root_admin`, `manager`, `staff`), `is_active`.
2. **`public.user_roles`:**
   - Maps user UUIDs to system permissions (`admin`, `user`).
3. **`public.clients`:**
   - Stores authoritative client accounts, active retainers, package specifications, and onboarding dates.
4. **`public.sales_deals`:**
   - Active commercial pipeline records: `business_name`, `contact_person`, `stage` (`New`, `Contacted`, `Discovery`, `Proposal Sent`, `Won`, `Lost`), `lead_quality` (`Hot`, `Warm`, `Cold`), `estimated_value` (ZAR), `follow_up_date`, `notes`.
5. **`public.finance_invoices`:**
   - Client billing and gate records: `invoice_number`, `client_id`, `amount`, `status` (`draft`, `sent`, `paid`, `overdue`), `due_date`, verified timestamp and actor.
6. **`public.audit_logs`:**
   - Immutable historical record of security, permission, and financial events.

---

## 4. Local Development & Operational Commands

Execute the following commands from the root directory:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (starts on http://localhost:8081)
npm run dev

# 3. Compile development bundle
npm run build:dev

# 4. Compile production distribution (Nitro + Cloudflare module)
npm run build

# 5. Type-check TypeScript codebase without emitting files
cmd /c "npx tsc --noEmit"

# 6. Execute linting rules
npm run lint
```

---

## 5. User Account Provisioning & Deactivation Procedures

### 5.1 Creating an Authorized Employee Account
1. An administrator signs in and accesses `/admin/users`.
2. Click **Add User** and supply their official `@mavisstrategicpartners.co.za` email address.
3. Assign the appropriate Department and Job Title.
4. The system creates the user in Supabase Auth and seeds a matching record in `public.profiles`.
5. The employee receives a secure password invitation requiring a mandatory change upon initial authentication.

### 5.2 Deactivating a Departed Team Member
1. Navigate to `/admin/users`.
2. Locate the employee record and click **Deactivate Account**.
3. The system sets `is_active = false` and revokes all active JWT tokens in Supabase Auth.
4. Open tasks assigned to the employee are automatically flagged for managerial reassignment to prevent delivery pauses.

---

## 6. Security Controls & POPIA Compliance

1. **Row Level Security (RLS):** Enforced across all PostgreSQL tables. Staff cannot execute queries against `payroll_records`, `financial_margins`, or executive logs.
2. **Session Lifetimes:** JWT authentication tokens expire after 3,600 seconds (1 hour) and are automatically refreshed via secure HTTP cookies.
3. **No Credential Logging:** Passwords and sensitive personal details are filtered out of application debug logs.

---

## 7. Backup, Restoration & Disaster Recovery

1. **Automated Daily Backups:** Supabase executes automated daily physical snapshots with point-in-time recovery (PITR) up to 7 days.
2. **Manual Schema Snapshot:**
   ```bash
   # Dump complete database schema and data
   npx supabase db dump -f supabase_backup_$(date +%Y%m%d).sql
   ```
3. **Restoration Protocol:** In the event of catastrophic data corruption, restore from the latest verified snapshot via the Supabase Management Console or CLI.
