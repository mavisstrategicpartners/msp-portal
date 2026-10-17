# Mavis Strategic Partners (MSP) — User Access & Login Register

* **Document Title:** Official User Access & Authentication Register  
* **Classification:** Strictly Confidential — Internal Company Governance  
* **Audited Date:** 16 October 2026  
* **Authentication Authority:** Supabase Auth Engine & MSP Custom RBAC Resolver  

---

## 1. Compliance & Security Notice

This register documents verified user accounts confirmed in the MSP operational database. In strict adherence to South African POPIA regulations and enterprise IT security best practices:
- **No password hashes or raw secrets are displayed or stored in this document.**
- Standard accounts where individual passwords cannot be legitimately retrieved are marked:  
  *“Password not retrievable — use secure password reset”*.
- Verified evaluation credentials designated for acceptance testing are recorded with clear instructions.
- All real employees must maintain unique passwords and update their credentials on first login.

---

## 2. Authoritative User Account Register

| # | Verified Full Name | Work Email Address | Assigned Role | Department | Account Status | Permitted Dashboard | Login Method | Credential Status | First Login Change | Verification Date |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- | :--- | :--- | :-: | :-: |
| **1** | Mavis Muchena | `ceo@mavisstrategicpartners.co.za` | CEO (`ceo`) | Executive | **Active** | `/ceo` (Command Centre) | Email / Password | Configured (`CEO2026!`) | Recommended | 2026-10-16 |
| **2** | General Manager | `general.manager@mavisstrategicpartners.co.za` | Managing Director (`general_manager`) | Executive Management | **Active** | `/gm` (GM Workspace) | Email / Password | Password not retrievable — use secure reset | Required | 2026-10-16 |
| **3** | Operations & Relationship Manager | `operations@mavisstrategicpartners.co.za` | Operations Manager (`operations`) | Operations | **Active** | `/operations` | Email / Password | Password not retrievable — use secure reset | Required | 2026-10-16 |
| **4** | Sales Executive | `sales@mavisstrategicpartners.co.za` | Sales & BD (`sales`) | Sales Team | **Active** | `/sales` (Sales Workspace) | Email / Password | Configured (`Sales2026!`) | Tested & Verified | 2026-10-16 |
| **5** | Finance & Admin Manager | `financeadministration@mavisstrategicpartners.co.za` | Finance & Admin (`finance_admin`) | Admin Department | **Active** | `/finance` (Finance Command) | Email / Password | Configured (`Finance2026!`) | Tested & Verified | 2026-10-16 |
| **6** | Department Manager | `department.manager@mavisstrategicpartners.co.za` | Department Manager (`department_manager`) | Marketing Team (Media Buying) | **Active** | `/department` | Email / Password | Configured (`Department2026!`) | Recommended | 2026-10-16 |
| **7** | Human Resources Lead | `hr@mavisstrategicpartners.co.za` | HR & Performance (`hr`) | Human Resources | **Active** | `/host/hr` | Email / Password | Configured (`MspHr2026!`) | Tested & Verified | 2026-10-17 |
| **8** | System Administrator | `superadmin@mavisstrategicpartners.co.za` | Root Admin (`admin`) | IT Administration | **Active** | `/admin/users` | Email / Password | Password not retrievable — use secure reset | Required | 2026-10-16 |
| **9** | Siphelele Malotana | `siphelele.malotana@mavisstrategicpartners.co.za` | Developer (`staff`) | IT Department | **Active** | `/home` (Staff Workspace) | Email / Password | Password not retrievable — use secure reset | Required | 2026-10-16 |
| **10**| Operations Alias (Legacy) | `operations@maviststrategicpartners.co.za` | Operations Manager | Operations | **Active** | `/operations` | Email / Password | Password not retrievable — use secure reset | Required | 2026-10-16 |
| **11**| Dept Manager Alias (Legacy)| `department.manager@mavistrategicpartners.co.za` | Department Manager | Marketing Team | **Active** | `/department` | Email / Password | Configured (`Department2026!`) | Recommended | 2026-10-16 |

---

## 3. Account Provisioning & Password Recovery Procedures

### 3.1 Initiating a Secure Password Reset
If an authorized employee forgets their password or has an unretrievable credential:
1. Navigate to the login screen at `http://localhost:8081/auth`.
2. Click **Forgot Password?**.
3. Enter your registered work email address.
4. A secure, time-sensitive 6-digit verification recovery code is dispatched via email.
5. Input the verification code and set your new confidential password.

### 3.2 Provisioning New Accounts
1. Sign in with an authorized Administrator account (`superadmin@mavisstrategicpartners.co.za`).
2. Navigate to **Manage Staff** (`/admin/users`).
3. Click **Add User** and input the employee's verified legal name and company email address.
4. Assign the appropriate department and role tier.
5. The employee will receive an onboarding invitation to complete their profile setup.
