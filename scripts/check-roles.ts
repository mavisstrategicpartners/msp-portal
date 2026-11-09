// Role model regression check. Run: npm run test:roles
// Guards the rule that managers (Sales, SEO, Creative, ...) are never administrators.
import { computeAccess } from "../src/lib/roles.ts";
const mk = (email: string, job_title: string, department: string, role_tier: string, roles: string[] = ["user"]) =>
  ({ p: { id: "x", email, job_title, department, role_tier, full_name: "", phone: null, avatar_url: null, is_active: true, onboarding_completed: true } as any, roles: roles.map((role) => ({ role })) });
// [label, account, expected systemRole, expected isAdmin]
const cases: [string, ReturnType<typeof mk>, string, boolean][] = [
  ["CEO", mk("ceo@mavisstrategicpartners.co.za", "Chief Executive Officer", "CEO", "root_admin", ["user", "admin"]), "ceo", true],
  ["General Manager (auto-admin row)", mk("general.manager@mavisstrategicpartners.co.za", "General Manager", "Managing Director", "manager", ["user", "admin"]), "general_manager", false],
  ["Operations Manager (auto-admin row)", mk("operations@mavisstrategicpartners.co.za", "Operations & Relationship Manager", "Operations Manager", "manager", ["user", "admin"]), "operations", false],
  ["Finance Manager (auto-admin row)", mk("financeadministration@mavisstrategicpartners.co.za", "Finance & Admin Manager", "Admin Department", "manager", ["user", "admin"]), "finance_admin", false],
  ["HR Lead (auto-admin row)", mk("hr@mavisstrategicpartners.co.za", "Human Resources Lead", "Human Resources", "manager", ["user", "admin"]), "hr", false],
  ["Sales Manager (auto-admin row)", mk("thabo@mavisstrategicpartners.co.za", "Sales Manager", "Sales Team", "manager", ["user", "admin"]), "sales_manager", false],
  ["Head of Sales (auto-admin row)", mk("manager@mavisstrategicpartners.co.za", "Head of Sales & Business Development", "Sales Team", "manager", ["user", "admin"]), "sales_manager", false],
  ["Sales consultant", mk("sales@mavisstrategicpartners.co.za", "Sales Executive", "Sales Team", "staff"), "sales_consultant", false],
  ["Media Buying manager", mk("department.manager@mavisstrategicpartners.co.za", "Department Manager", "Marketing Team", "manager", ["user", "admin"]), "department_manager", false],
  ["SEO Manager (manager tier)", mk("seo@mavisstrategicpartners.co.za", "SEO Manager", "Marketing Team", "manager", ["user", "admin"]), "department_manager", false],
  ["SEO Manager (staff tier)", mk("seo2@mavisstrategicpartners.co.za", "SEO Manager", "Marketing Team", "staff"), "staff", false],
  ["Creative Lead", mk("creative@mavisstrategicpartners.co.za", "Creative Lead", "Graphics Team", "manager", ["user", "admin"]), "department_manager", false],
  ["Websites & Software Head", mk("web@mavisstrategicpartners.co.za", "Head of Websites & Software", "IT Department", "manager", ["user", "admin"]), "department_manager", false],
  ["CRM & AI Automation Manager", mk("crm@mavisstrategicpartners.co.za", "CRM & AI Automation Manager", "IT Department", "manager", ["user", "admin"]), "department_manager", false],
  ["Developer (staff)", mk("siphelele.malotana@mavisstrategicpartners.co.za", "Developer", "IT Department", "staff"), "staff", false],
  ["IT Administrator title only", mk("it@mavisstrategicpartners.co.za", "IT Administrator", "IT Department", "staff"), "staff", false],
  ["System administrator (root)", mk("superadmin@mavisstrategicpartners.co.za", "System Administrator", "Admin Department", "root_admin", ["user", "admin"]), "admin", true],
  ["Staff explicitly granted admin", mk("explicit@mavisstrategicpartners.co.za", "Office Coordinator", "Admin Department", "staff", ["user", "admin"]), "admin", true],
  ["Intern", mk("intern@mavisstrategicpartners.co.za", "Intern", "Intern", "intern"), "staff", false],
];
let fail = 0;
for (const [label, a, role, admin] of cases) {
  const r = computeAccess(a.p, a.p.email, a.roles);
  const ok = r.systemRole === role && r.isAdmin === admin;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(36)} -> ${r.systemRole.padEnd(18)} admin=${r.isAdmin} manager=${r.isManagerOrAbove}${ok ? "" : `   (expected ${role}, admin=${admin})`}`);
}
console.log(fail ? `${fail} FAILED` : "all passed");
process.exit(fail ? 1 : 0);
