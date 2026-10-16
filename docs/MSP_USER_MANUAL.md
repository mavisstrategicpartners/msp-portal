# Mavis Strategic Partners (MSP) — User Manual
**Operating Instructions for Authorized Personnel**

* **Document Title:** MSP Dashboard — Official User Manual  
* **Target Audience:** All MSP Team Members, Managers, Executives & Administrators  
* **Version:** 2.0.0  
* **Publication Date:** 16 October 2026  

---

## 1. Getting Started: Sign-In & Session Management

### 1.1 How to Sign In
1. Open your web browser and navigate to the application URL: `http://localhost:8081/auth` (or your company production domain).
2. Enter your authorized work email address (e.g., `sales@mavisstrategicpartners.co.za` or `financeadministration@mavisstrategicpartners.co.za`).
3. Enter your confidential account password.
4. Click the purple **Sign In** button.
5. Upon successful validation, the system will immediately route you to your dedicated role dashboard (e.g., `/sales` for Sales, `/finance` for Finance, `/ceo` for CEO, or `/home` for Staff).

### 1.2 How to Sign Out
1. Locate the top navigation bar at the top right of your screen.
2. Click on your profile avatar or name to open the user dropdown menu.
3. Select **Log out**.
4. The system will terminate your active session, flush cached tokens, and return you to the `/auth` login screen.

### 1.3 How to Change Your Password
1. Click on your user avatar in the top right corner.
2. Select **Settings** (or press `⌘,` / `Ctrl+,`).
3. Under the **Security & Password** section, enter your current password.
4. Enter your new secure password (must be at least 8 characters, containing uppercase, lowercase, numbers, and symbols).
5. Click **Update Password**. A confirmation notification will appear.

---

## 2. Universal Navigation & Global Keyboard Shortcuts

* **Global Search (`⌘K` / `Ctrl+K`):** Opens the universal search dialog to instantly locate clients, SOPs, employees, invoices, or tasks across the entire company.
* **Ask MSP AI Assistant:** Click the floating purple sparkle button in the bottom right corner to ask questions regarding standard operating procedures (e.g., *"How do I format an onboarding intake form?"*).
* **Sidebar Toggle:** Click the chevron icon at the top of the sidebar to collapse the navigation menu for maximum screen real estate on compact laptops.

---

## 3. Employee & Staff Daily Workflow (`/home`)

### 3.1 Recording Daily Attendance (Clock-In / Clock-Out)
1. Upon logging in, navigate to **Home** (`/home`).
2. In the **Live Attendance Board** card, verify your local time (Africa/Johannesburg).
3. Click the green **Clock In** button at 08:00 SAST.
4. Your status will update to **Active / Clocked In** across the company presence directory.
5. At the conclusion of your shift (17:00 SAST), return to the widget and click **Clock Out**.

### 3.2 Managing Assigned Tasks
1. On your **Staff Workspace**, locate your **My Assigned Tasks** board.
2. Review tasks categorized by status: `Ready`, `In Progress`, `Blocked`, or `Submitted for Review`.
3. To start a task, click on the task card and click **Start Task** (moves status to `In Progress`).
4. To view detailed task guidelines, click the task title to inspect the client name, deliverable requirements, and baseline deadline.

### 3.3 Submitting Deliverable Evidence for QA Review
1. When your work is complete, locate the task card and click **Submit for Review**.
2. A submission dialog will appear requesting deliverable evidence.
3. Paste the URL of your deliverable (e.g., Google Drive asset link, Figma prototype, or Meta Ad preview link) into the **Evidence URL** field.
4. Add any explanatory notes for your Department Manager.
5. Click **Confirm Submission**. The task status updates to `Submitted for Review` and automatically queues in your manager's QA checkpoint.

### 3.4 Raising and Resolving a Delivery Blocker
1. If you are delayed by missing client assets, technical platform errors, or cross-department dependencies, open the task card.
2. Click **Report Blocker**.
3. Select the blocker category (e.g., *Client Delay*, *Technical Failure*, *Awaiting Creative Asset*).
4. Enter a concise explanation of what is needed to resume work.
5. Click **Submit Blocker**. The task badge turns red (`Blocked`), alerting your Department Manager and logging the impediment in the CEO Priority Action Queue.

---

## 4. Sales & Commercial Pipeline Workflow (`/sales`)

### 4.1 Creating a New Sales Lead / Opportunity
1. In the sidebar, select **Sales Dashboard** (`/sales`).
2. Click the green **+ Add Opportunity** button in the header.
3. In the modal dialog, complete the required prospect details:
   - **Business Name:** (e.g., *Apex Solar SA*)
   - **Contact Person:** (e.g., *Thabo Mthembu*)
   - **Estimated Monthly Value (ZAR):** (e.g., *35,000*)
   - **Email & Phone / WhatsApp:** Contact credentials.
   - **Lead Quality:** Select `Hot` (High intent), `Warm` (Nurture), or `Cold`.
   - **Lead Source:** Inbound Meta Ads, Website, Cold Outreach, LinkedIn, or Google Ads.
   - **Discovery Notes:** Record specific client objectives and service requirements.
4. Click **Save Lead**. The deal is immediately added to the pipeline and visible across active opportunities.

### 4.2 Moving Opportunities Along the Pipeline Board
1. In the Sales Dashboard, click the **Pipeline Board** tab.
2. View opportunities organized by stage: `New` → `Contacted` → `Discovery` → `Proposal Sent` → `Won`.
3. On any deal card, click the advance button:
   - Click **Discovery →** when a qualification call is completed.
   - Click **Proposal →** when a commercial proposal is transmitted to the prospect.
   - Click **Win Deal** when the client accepts the commercial terms.

### 4.3 Logging Sales Touchpoints & Setting Follow-ups
1. On the **Follow-ups & Meetings** tab (or from the Leads table), locate the prospect.
2. Click **Log Touchpoint** (or **Log Call**).
3. Select the activity type: `Phone Call`, `Zoom Discovery`, `WhatsApp Message`, or `Email`.
4. Enter the outcome and client feedback in the **Meeting Outcome** box.
5. Set the **Next Follow-Up Date**.
6. Click **Save Activity**. Overdue follow-up alerts update automatically.

### 4.4 Initiating Client Handover to Operations
1. When an opportunity is marked **Won**, navigate to the **Operations Handover** tab.
2. Locate the won account and click **Transmit Handover**.
3. Confirm the agreed monthly retainer fee and target kickoff date.
4. Input any special client technical considerations or tone guidelines.
5. Click **Confirm Handover to Operations**. The account is immediately dispatched to the Operations 2-day client intake queue.

---

## 5. Finance & Administration Workflow (`/finance`)

### 5.1 Enforcing the Payment Verification Gate
1. Navigate to **Finance & Administration** (`/finance`).
2. In the **Financial Overview**, check the **Awaiting Payment** queue.
3. When proof of payment (EFT confirmation or card settlement) is received, navigate to the **Invoices & Verification Gate** tab.
4. Locate the client invoice and click the green **Verify Payment** button.
5. The system records the verification timestamp, logs your user identity, updates status to `Paid & Verified`, and displays:  
   *“Financial clearance confirmed. Operations Onboarding Intake clock is now officially unlocked.”*

### 5.2 Generating and Issuing a Client Invoice
1. On the **Invoices & Verification Gate** tab, click **+ New Invoice**.
2. Enter the **Client Business Name** and select the service package.
3. Enter the **Monthly Agency Fee (ZAR)** (pure MSP service fee).
4. Enter the **Client Direct Media Spend (ZAR)** (direct advertising budget).
5. Specify the **Payment Due Date**.
6. Click **Generate Invoice**. The invoice is issued with a unique tax identifier (`INV-2026-xxx`) and appears in the billing register.

### 5.3 Recording Operating Expenses & Contractor Payouts
1. Click the **Revenue & Expenses** tab.
2. Click **Log Expense**.
3. Enter the **Vendor / Payee Name** (e.g., *GoHighLevel*, *Domains.co.za*, or contractor name).
4. Select the category: `Software & SaaS`, `Contractor Payouts`, `Media & Tools`, or `Operations & Office`.
5. Enter the amount in ZAR and click **Record Expense**.

### 5.4 Reviewing and Deciding Financial Approvals
1. Click the **Financial Approvals** tab.
2. Review pending purchase and subscription requests submitted by department leads.
3. Inspect the business justification, department, and requested amount.
4. Click **Approve** to authorize the disbursement, or **Decline** to reject the request with an audit note.

### 5.5 Exporting Financial Reports (CSV)
1. On the **Audit Trail & Exports** tab (or via the header button), click **Export Report (CSV)**.
2. The browser will instantly compile and download a clean `.csv` file containing all invoices, client fees, ad spend breakdowns, due dates, and verified timestamps.

---

## 6. Operations & Relationship Management Workflow (`/operations`)

### 6.1 Executing the 2-Day Client Onboarding Pipeline
1. Navigate to **Operations Dashboard** (`/operations`) → **Client Onboarding** (`/operations/onboarding`).
2. Review new clients cleared by the Finance payment gate.
3. Complete the standard 4-step intake checklist:
   - Step 1: Technical asset collection (Pixel IDs, Google Tag Manager, ad account access).
   - Step 2: GHL CRM sub-account provisioning and WhatsApp verified number registration.
   - Step 3: Brand asset delivery (Logos, high-res media, style guidelines).
   - Step 4: Internal delivery kickoff with Graphics and Media Buying leads.
4. Verify that all 4 steps are signed off within 48 business hours (18 working hours).

### 6.2 Monitoring Deliverable Deadlines & SLA Warnings
1. Navigate to **Service Deadlines** (`/operations/deadlines`).
2. Review the live schedule sorted by impending due date.
3. Pay close attention to badges flagged as **Approaching (Due ≤ 7 Days)** or **Overdue**.
4. For overdue items, click **Open Record** to view the accountable owner and initiate immediate managerial intervention.

### 6.3 Independent QA Verifications
1. Navigate to **Verification Queue** (`/operations/verifications`).
2. Review deliverables submitted by specialists.
3. Compare the attached work against original client package specifications.
4. Click **Verify & Accept** to clear the milestone, or **Request Rework** with specific adjustment instructions.

---

## 7. Department Manager Workflows (`/department`)

1. **Review Team Workload (`/department/workload`):** Check task allocations across your department to prevent employee burnout.
2. **Quality Assurance Checkpoints (`/department/qa`):** Review submitted graphics, ad copy, and tracking setups before escalation to Operations.
3. **Resolve Operational Blockers (`/department/blockers`):** Intervene when staff report missing assets or technical impediments.

---

## 8. Reporting System Issues & Requesting Support

If you encounter unexpected errors, missing data, or authentication problems:
1. Press `⌘K` or click the **Help** icon in the top bar.
2. Click **Report an Issue**.
3. Describe the problem, the screen URL, and the action being attempted.
4. Contact your designated System Administrator at `superadmin@mavisstrategicpartners.co.za`.
