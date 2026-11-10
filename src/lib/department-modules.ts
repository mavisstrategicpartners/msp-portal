/**
 * Department-specific management modules.
 *
 * Departments without a dedicated workspace (HR, Finance, Sales and Operations have one) get
 * their own record types here — the things each department actually manages: IT support
 * requests and incidents, marketing campaigns and content, SEO projects and keyword tracking,
 * design briefs, ad campaigns, development projects, bugs and releases, client relationships and
 * complaints, automation workflows, report schedules, strategic initiatives and training.
 * Each type has its own fields, stages, priority, deadline and responsible person.
 *
 * Records live in public.department_records and go through /api/staff/records
 * (src/lib/department-records.server.ts), which enforces department permissions. Types marked
 * `openToAll` are requests any employee can raise and follow — the authorised route for work
 * to cross departments. Shared by server and client. No sample data.
 */

export type FieldType = "text" | "textarea" | "number" | "money" | "percent" | "rating" | "date" | "url" | "select";

export type ModuleField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  /** Shown as a column in the list. */
  list?: boolean;
  help?: string;
  /** Can be filled in by an employee raising a request. */
  intake?: boolean;
};

export type RecordType = {
  key: string;
  slug: string;
  department: string;
  label: string;
  singular: string;
  description: string;
  /** Stages; new records start in the first. */
  statuses: string[];
  /** Stages that count as finished. */
  done: string[];
  priority?: boolean;
  /** Records have a deadline (with the label shown for it). */
  due?: { label: string };
  /** Records relate to a client (or are internal). */
  client?: boolean;
  /** Records have a responsible person from the department. */
  assignee?: { label: string };
  /** Any employee may raise one and sees their own (a request to this department). */
  openToAll?: { action: string; titleLabel: string };
  /** A numeric field summed in the summary. */
  total?: { field: string; label: string };
  fields: ModuleField[];
};

export type DeptRecord = {
  id: string;
  department_key: string;
  record_type: string;
  title: string;
  status: string;
  priority: string | null;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  client_name: string | null;
  due_date: string | null;
  data: Record<string, any>;
  task_id: string | null;
  created_by: string | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
};

export const RECORD_PRIORITIES = ["Low", "Normal", "High", "Urgent"];

const PLATFORMS = ["Meta (Facebook & Instagram)", "TikTok", "Google Ads", "LinkedIn", "YouTube", "Other"];

export const RECORD_TYPES: RecordType[] = [
  // ── IT ──────────────────────────────────────────────────────────────────────
  {
    key: "it-support",
    slug: "it-support",
    department: "it",
    label: "Support requests",
    singular: "support request",
    description: "Help requests from staff: hardware, software, access, network and email.",
    statuses: ["New", "In progress", "Waiting on requester", "Resolved", "Closed"],
    done: ["Resolved", "Closed"],
    priority: true,
    due: { label: "Due date" },
    assignee: { label: "Technician" },
    openToAll: { action: "Request IT support", titleLabel: "What do you need help with?" },
    fields: [
      { key: "category", label: "Category", type: "select", options: ["Hardware", "Software", "Access & accounts", "Network & internet", "Email", "Phone", "Other"], required: true, list: true, intake: true },
      { key: "details", label: "Details", type: "textarea", required: true, intake: true },
      { key: "location", label: "Device or location", type: "text", intake: true },
      { key: "resolution", label: "Resolution", type: "textarea" },
    ],
  },
  {
    key: "it-incident",
    slug: "it-incident",
    department: "it",
    label: "Incidents",
    singular: "incident",
    description: "Outages and technical incidents affecting MSP systems or clients.",
    statuses: ["Open", "Investigating", "Mitigated", "Resolved"],
    done: ["Resolved"],
    priority: true,
    assignee: { label: "Incident lead" },
    fields: [
      { key: "system", label: "Affected system", type: "text", required: true, list: true },
      { key: "impact", label: "Impact", type: "select", options: ["Single user", "Team", "Company-wide", "Client-facing"], required: true, list: true },
      { key: "startedAt", label: "Started", type: "date", list: true },
      { key: "rootCause", label: "Root cause", type: "textarea" },
      { key: "actions", label: "Actions taken", type: "textarea" },
    ],
  },
  {
    key: "it-asset",
    slug: "it-asset",
    department: "it",
    label: "Assets & infrastructure",
    singular: "asset",
    description: "Laptops, devices, licences and infrastructure MSP owns.",
    statuses: ["In use", "Spare", "In repair", "Retired"],
    done: ["Retired"],
    assignee: { label: "Custodian" },
    fields: [
      { key: "assetType", label: "Type", type: "select", options: ["Laptop", "Desktop", "Phone", "Monitor", "Network equipment", "Software licence", "Server / hosting", "Other"], required: true, list: true },
      { key: "serial", label: "Serial / licence key reference", type: "text", list: true },
      { key: "purchaseDate", label: "Purchase date", type: "date" },
      { key: "renewalDate", label: "Renewal / warranty date", type: "date", list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "it-maintenance",
    slug: "it-maintenance",
    department: "it",
    label: "Maintenance schedule",
    singular: "maintenance item",
    description: "Recurring maintenance: backups, updates, renewals and checks.",
    statuses: ["Scheduled", "Done", "Overdue"],
    done: ["Done"],
    due: { label: "Next due" },
    assignee: { label: "Responsible" },
    fields: [
      { key: "system", label: "System", type: "text", required: true, list: true },
      { key: "frequency", label: "Frequency", type: "select", options: ["Weekly", "Monthly", "Quarterly", "Annually", "Once-off"], list: true },
      { key: "lastDone", label: "Last done", type: "date", list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },

  // ── Marketing ───────────────────────────────────────────────────────────────
  {
    key: "mkt-campaign",
    slug: "mkt-campaign",
    client: true,
    department: "marketing",
    label: "Campaigns",
    singular: "campaign",
    description: "Marketing campaigns for MSP and its clients, with objectives, dates and results.",
    statuses: ["Planned", "In production", "Live", "Paused", "Completed"],
    done: ["Completed"],
    due: { label: "End date" },
    assignee: { label: "Campaign owner" },
    total: { field: "budget", label: "Planned campaign budget" },
    fields: [
      { key: "channel", label: "Main channel", type: "select", options: ["Social media", "Email", "WhatsApp", "Website", "Events", "Print", "Multi-channel"], list: true },
      { key: "objective", label: "Objective", type: "text", required: true },
      { key: "startDate", label: "Start", type: "date", list: true },
      { key: "budget", label: "Budget (R)", type: "money" },
      { key: "results", label: "Results", type: "textarea", help: "Record actual results when known." },
    ],
  },
  {
    key: "mkt-content",
    slug: "mkt-content",
    client: true,
    department: "marketing",
    label: "Content calendar",
    singular: "content item",
    description: "Planned posts, emails and articles with publish dates.",
    statuses: ["Idea", "Drafting", "In review", "Scheduled", "Published"],
    done: ["Published"],
    due: { label: "Publish date" },
    assignee: { label: "Writer" },
    fields: [
      { key: "channel", label: "Channel", type: "select", options: ["Facebook", "Instagram", "TikTok", "LinkedIn", "Email", "Blog", "WhatsApp", "Other"], required: true, list: true },
      { key: "link", label: "Draft / post link", type: "url" },
    ],
  },

  // ── SEO ─────────────────────────────────────────────────────────────────────
  {
    key: "seo-project",
    slug: "seo-project",
    client: true,
    department: "seo",
    label: "SEO projects",
    singular: "SEO project",
    description: "Optimisation projects per client website.",
    statuses: ["Audit", "In progress", "Monitoring", "Completed"],
    done: ["Completed"],
    due: { label: "Due date" },
    assignee: { label: "SEO specialist" },
    fields: [
      { key: "website", label: "Website", type: "url", required: true, list: true },
      { key: "scope", label: "Scope", type: "select", options: ["Technical SEO", "On-page", "Content", "Local SEO", "Link building", "Full SEO"], list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "seo-keyword",
    slug: "seo-keyword",
    client: true,
    department: "seo",
    label: "Keyword tracking",
    singular: "keyword",
    description: "Target keywords and their latest recorded ranking.",
    statuses: ["Tracking", "Paused", "Dropped"],
    done: ["Dropped"],
    fields: [
      { key: "targetUrl", label: "Target page", type: "url", list: true },
      { key: "currentRank", label: "Current rank", type: "number", list: true },
      { key: "previousRank", label: "Previous rank", type: "number", list: true },
      { key: "searchVolume", label: "Monthly searches", type: "number" },
      { key: "checkedOn", label: "Last checked", type: "date", list: true },
    ],
  },
  {
    key: "seo-report",
    slug: "seo-report",
    client: true,
    department: "seo",
    label: "Ranking reports",
    singular: "ranking report",
    description: "Periodic SEO reports sent to clients.",
    statuses: ["Due", "In preparation", "Sent"],
    done: ["Sent"],
    due: { label: "Send by" },
    assignee: { label: "Prepared by" },
    fields: [
      { key: "period", label: "Period", type: "text", required: true, list: true, help: "e.g. October 2026" },
      { key: "link", label: "Report link", type: "url" },
    ],
  },

  // ── Creative ────────────────────────────────────────────────────────────────
  {
    key: "creative-brief",
    slug: "creative-brief",
    client: true,
    department: "creative",
    label: "Design briefs",
    singular: "design brief",
    description: "Creative requests from brief to approved delivery, including revisions.",
    statuses: ["Brief received", "In design", "Internal review", "Client review", "Revisions", "Approved", "Delivered"],
    done: ["Approved", "Delivered"],
    priority: true,
    due: { label: "Due date" },
    assignee: { label: "Designer" },
    openToAll: { action: "Submit a design brief", titleLabel: "What needs designing?" },
    fields: [
      { key: "deliverable", label: "Deliverable", type: "select", options: ["Social post", "Carousel", "Video / reel", "Banner / ad", "Logo / branding", "Presentation", "Print", "Website graphics", "Other"], required: true, list: true, intake: true },
      { key: "brief", label: "Brief", type: "textarea", required: true, intake: true },
      { key: "format", label: "Sizes / format", type: "text", intake: true },
      { key: "revisions", label: "Revision rounds", type: "number", list: true },
      { key: "link", label: "Design file link", type: "url" },
    ],
  },

  // ── Media Buying ────────────────────────────────────────────────────────────
  {
    key: "mb-campaign",
    slug: "mb-campaign",
    client: true,
    department: "media-buying",
    label: "Ad campaigns",
    singular: "ad campaign",
    description: "Paid advertising campaigns per client and platform. Ad budgets are the client's money, paid directly to the platform.",
    statuses: ["Setup", "In review (platform)", "Live", "Paused", "Ended"],
    done: ["Ended"],
    assignee: { label: "Media buyer" },
    total: { field: "spendToDate", label: "Client ad spend recorded" },
    fields: [
      { key: "platform", label: "Platform", type: "select", options: PLATFORMS, required: true, list: true },
      { key: "objective", label: "Objective", type: "select", options: ["Leads", "Sales", "Traffic", "Awareness", "Engagement", "Messages", "App installs"], list: true },
      { key: "monthlyBudget", label: "Client monthly ad budget (R)", type: "money", list: true, help: "Paid by the client to the platform, not MSP revenue." },
      { key: "spendToDate", label: "Spend to date (R)", type: "money", list: true },
      { key: "results", label: "Results (e.g. leads)", type: "number", list: true },
      { key: "startDate", label: "Start", type: "date" },
      { key: "notes", label: "Optimisation notes", type: "textarea" },
    ],
  },

  // ── Websites & Software ─────────────────────────────────────────────────────
  {
    key: "dev-project",
    slug: "dev-project",
    client: true,
    department: "websites-software",
    label: "Development projects",
    singular: "development project",
    description: "Websites, apps and integrations from discovery to launch.",
    statuses: ["Discovery", "Design", "Build", "QA", "Launched", "Maintenance"],
    done: ["Launched"],
    due: { label: "Target launch" },
    assignee: { label: "Lead developer" },
    fields: [
      { key: "kind", label: "Type", type: "select", options: ["Website", "Web app", "Mobile app", "Integration", "Internal tool"], required: true, list: true },
      { key: "repo", label: "Repository / staging link", type: "url" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "dev-bug",
    slug: "dev-bug",
    client: true,
    department: "websites-software",
    label: "Bugs",
    singular: "bug",
    description: "Defects reported on websites and software, from report to verified fix.",
    statuses: ["Reported", "Confirmed", "In progress", "Fixed", "Verified", "Won't fix"],
    done: ["Verified", "Won't fix"],
    priority: true,
    assignee: { label: "Developer" },
    openToAll: { action: "Report a website or software bug", titleLabel: "What is wrong?" },
    fields: [
      { key: "pageUrl", label: "Page or screen", type: "url", intake: true },
      { key: "steps", label: "Steps to reproduce", type: "textarea", required: true, intake: true },
      { key: "fix", label: "Fix notes", type: "textarea" },
    ],
  },
  {
    key: "dev-release",
    slug: "dev-release",
    client: true,
    department: "websites-software",
    label: "Releases",
    singular: "release",
    description: "Planned and completed releases.",
    statuses: ["Planned", "Ready", "Released", "Rolled back"],
    done: ["Released", "Rolled back"],
    due: { label: "Release date" },
    assignee: { label: "Release owner" },
    fields: [
      { key: "version", label: "Version", type: "text", list: true },
      { key: "notes", label: "Release notes", type: "textarea" },
    ],
  },
  {
    key: "dev-change",
    slug: "dev-change",
    client: true,
    department: "websites-software",
    label: "Change requests",
    singular: "change request",
    description: "Requested changes to client websites or software.",
    statuses: ["Requested", "Approved", "In progress", "Done", "Declined"],
    done: ["Done", "Declined"],
    priority: true,
    due: { label: "Due date" },
    assignee: { label: "Developer" },
    openToAll: { action: "Request a website change", titleLabel: "What should change?" },
    fields: [
      { key: "details", label: "Details", type: "textarea", required: true, intake: true },
    ],
  },

  // ── Client Success ──────────────────────────────────────────────────────────
  {
    key: "cs-health",
    slug: "cs-health",
    client: true,
    department: "client-success",
    label: "Client relationships",
    singular: "client relationship",
    description: "Health, last contact and next review for each client.",
    statuses: ["Healthy", "Needs attention", "At risk", "Churned"],
    done: ["Churned"],
    assignee: { label: "Relationship owner" },
    fields: [
      { key: "lastContact", label: "Last contact", type: "date", list: true },
      { key: "nextReview", label: "Next review", type: "date", list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "cs-complaint",
    slug: "cs-complaint",
    client: true,
    department: "client-success",
    label: "Complaints & escalations",
    singular: "complaint",
    description: "Client complaints from first report to resolution.",
    statuses: ["Received", "Investigating", "Resolution proposed", "Resolved"],
    done: ["Resolved"],
    priority: true,
    due: { label: "Due date" },
    assignee: { label: "Handled by" },
    openToAll: { action: "Log a client complaint", titleLabel: "Summary of the complaint" },
    fields: [
      { key: "category", label: "Category", type: "select", options: ["Results", "Communication", "Billing", "Delivery delay", "Quality", "Other"], required: true, list: true, intake: true },
      { key: "details", label: "What happened", type: "textarea", required: true, intake: true },
      { key: "resolution", label: "Resolution", type: "textarea" },
    ],
  },
  {
    key: "cs-satisfaction",
    slug: "cs-satisfaction",
    client: true,
    department: "client-success",
    label: "Satisfaction checks",
    singular: "satisfaction check",
    description: "Recorded client satisfaction scores.",
    statuses: ["Recorded", "Followed up"],
    done: ["Followed up"],
    fields: [
      { key: "score", label: "Score (1–10)", type: "number", required: true, list: true },
      { key: "date", label: "Date", type: "date", list: true },
      { key: "comments", label: "Comments", type: "textarea" },
    ],
  },

  // ── CRM & AI Automation ─────────────────────────────────────────────────────
  {
    key: "crm-workflow",
    slug: "crm-workflow",
    client: true,
    department: "crm-ai",
    label: "Automation workflows",
    singular: "automation workflow",
    description: "CRM and AI automations per client, with their current state.",
    statuses: ["Draft", "Testing", "Live", "Paused", "Broken"],
    done: [],
    assignee: { label: "Builder" },
    fields: [
      { key: "platform", label: "Platform", type: "select", options: ["GoHighLevel", "WhatsApp", "Zapier / Make", "Custom", "Other"], required: true, list: true },
      { key: "trigger", label: "Trigger", type: "text", list: true },
      { key: "lastChecked", label: "Last checked", type: "date", list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "crm-integration",
    slug: "crm-integration",
    client: true,
    department: "crm-ai",
    label: "Integrations",
    singular: "integration",
    description: "Connections between CRM and other systems.",
    statuses: ["Planned", "Connected", "Error", "Disconnected"],
    done: ["Disconnected"],
    assignee: { label: "Owner" },
    fields: [
      { key: "system", label: "Connected system", type: "text", required: true, list: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "crm-request",
    slug: "crm-request",
    client: true,
    department: "crm-ai",
    label: "CRM requests",
    singular: "CRM request",
    description: "Requests for CRM set-up, pipelines, forms and automations.",
    statuses: ["New", "In progress", "Done", "Declined"],
    done: ["Done", "Declined"],
    priority: true,
    due: { label: "Due date" },
    assignee: { label: "Assigned to" },
    openToAll: { action: "Request CRM or automation work", titleLabel: "What do you need?" },
    fields: [
      { key: "details", label: "Details", type: "textarea", required: true, intake: true },
    ],
  },

  // ── Reporting ───────────────────────────────────────────────────────────────
  {
    key: "rep-schedule",
    slug: "rep-schedule",
    client: true,
    department: "reporting",
    label: "Report schedule",
    singular: "scheduled report",
    description: "Recurring client and internal reports with their next due dates.",
    statuses: ["Due", "In preparation", "Quality check", "Sent"],
    done: ["Sent"],
    due: { label: "Next due" },
    assignee: { label: "Prepared by" },
    openToAll: { action: "Request a report", titleLabel: "Which report do you need?" },
    fields: [
      { key: "reportType", label: "Report", type: "select", options: ["Monthly performance", "Ads performance", "SEO", "Social media", "Executive", "Custom"], required: true, list: true, intake: true },
      { key: "frequency", label: "Frequency", type: "select", options: ["Weekly", "Monthly", "Quarterly", "Once-off"], list: true, intake: true },
      { key: "link", label: "Report link", type: "url" },
    ],
  },
  {
    key: "rep-data-issue",
    slug: "rep-data-issue",
    client: true,
    department: "reporting",
    label: "Data issues",
    singular: "data issue",
    description: "Data accuracy problems found while reporting.",
    statuses: ["Open", "Investigating", "Fixed"],
    done: ["Fixed"],
    priority: true,
    assignee: { label: "Owner" },
    fields: [
      { key: "source", label: "Data source", type: "text", required: true, list: true },
      { key: "details", label: "Details", type: "textarea", required: true },
    ],
  },

  // ── Strategy ────────────────────────────────────────────────────────────────
  {
    key: "strategy-initiative",
    slug: "strategy-initiative",
    department: "strategy",
    label: "Strategic initiatives",
    singular: "initiative",
    description: "Business objectives, the actions behind them and their progress.",
    statuses: ["Proposed", "Approved", "In progress", "On hold", "Achieved", "Dropped"],
    done: ["Achieved", "Dropped"],
    due: { label: "Target date" },
    assignee: { label: "Initiative owner" },
    fields: [
      { key: "objective", label: "Business objective", type: "text", required: true, list: true },
      { key: "measure", label: "Success measure", type: "text", list: true },
      { key: "progress", label: "Progress (%)", type: "percent", list: true },
      { key: "actions", label: "Key actions", type: "textarea" },
    ],
  },

  // ── MSP Academy ─────────────────────────────────────────────────────────────
  {
    key: "academy-programme",
    slug: "academy-programme",
    department: "academy",
    label: "Training programmes",
    singular: "programme",
    description: "Courses and programmes, their audience and dates.",
    statuses: ["Planned", "Enrolling", "Running", "Completed"],
    done: ["Completed"],
    due: { label: "End date" },
    assignee: { label: "Facilitator" },
    fields: [
      { key: "audience", label: "Audience", type: "select", options: ["MSP staff", "Interns", "Clients", "Public"], list: true },
      { key: "startDate", label: "Start", type: "date", list: true },
      { key: "materials", label: "Learning materials link", type: "url" },
    ],
  },
  {
    key: "academy-learner",
    slug: "academy-learner",
    department: "academy",
    label: "Learners",
    singular: "learner",
    description: "Learner progress and certification per programme.",
    statuses: ["Enrolled", "In progress", "Completed", "Certified", "Withdrawn"],
    done: ["Certified", "Withdrawn"],
    fields: [
      { key: "programme", label: "Programme", type: "text", required: true, list: true },
      { key: "progress", label: "Progress (%)", type: "percent", list: true },
      { key: "contact", label: "Contact (email)", type: "text" },
    ],
  },
  {
    key: "academy-assessment",
    slug: "academy-assessment",
    department: "academy",
    label: "Assessments",
    singular: "assessment",
    description: "Assessment results per learner.",
    statuses: ["Scheduled", "Marked"],
    done: ["Marked"],
    due: { label: "Assessment date" },
    assignee: { label: "Assessor" },
    fields: [
      { key: "programme", label: "Programme", type: "text", required: true, list: true },
      { key: "learner", label: "Learner", type: "text", required: true, list: true },
      { key: "score", label: "Score (%)", type: "percent", list: true },
      { key: "result", label: "Result", type: "select", options: ["Pass", "Fail", "Resubmit"], list: true },
    ],
  },
];

export const typesFor = (department: string) => RECORD_TYPES.filter((t) => t.department === department);
export const typeByKey = (key: string) => RECORD_TYPES.find((t) => t.key === key);
export const typeBySlug = (slug: string) => RECORD_TYPES.find((t) => t.slug === slug);
export const REQUEST_TYPES = RECORD_TYPES.filter((t) => t.openToAll);

const today = () => new Date().toISOString().slice(0, 10);

export function isRecordOverdue(type: RecordType, r: Pick<DeptRecord, "due_date" | "status">) {
  return Boolean(type.due && r.due_date && r.due_date < today() && !type.done.includes(r.status));
}

/** Summary figures for a record type, counted from its records. */
export function computeKpis(type: RecordType, records: DeptRecord[]): { label: string; value: string | number; alert?: boolean }[] {
  const open = records.filter((r) => !type.done.includes(r.status));
  const out: { label: string; value: string | number; alert?: boolean }[] = [{ label: "Open", value: open.length }];
  if (type.due) {
    const late = open.filter((r) => isRecordOverdue(type, r)).length;
    out.push({ label: "Overdue", value: late, alert: late > 0 });
  }
  if (type.priority) {
    const urgent = open.filter((r) => r.priority === "Urgent" || r.priority === "High").length;
    out.push({ label: "High / urgent", value: urgent, alert: urgent > 0 });
  }
  if (type.assignee) out.push({ label: "Unassigned", value: open.filter((r) => !r.assigned_to).length });
  if (type.total) {
    const sum = records.reduce((a, r) => a + (Number(r.data?.[type.total!.field]) || 0), 0);
    out.push({ label: type.total.label, value: `R${Math.round(sum).toLocaleString("en-ZA")}` });
  }
  out.push({ label: "Finished", value: records.length - open.length });
  return out.slice(0, 4);
}

/** Departments whose dedicated management module already exists elsewhere in the portal. */
export const DEDICATED_WORKSPACES: Record<string, { to: string; label: string }[]> = {
  hr: [
    { to: "/hr", label: "Employee records" },
    { to: "/hr/attendance", label: "Attendance" },
    { to: "/hr/leave", label: "Leave" },
    { to: "/hr/recruitment", label: "Recruitment" },
    { to: "/hr/payroll", label: "Payroll" },
    { to: "/hr/performance", label: "Performance reviews" },
  ],
  finance: [{ to: "/finance", label: "Invoices, expenses & budgets" }],
  sales: [{ to: "/sales", label: "Leads, pipeline & targets" }],
  operations: [
    { to: "/operations/onboarding", label: "Client onboarding" },
    { to: "/operations/workflows", label: "Workflows" },
    { to: "/operations/escalations", label: "Escalations" },
  ],
  onboarding: [
    { to: "/operations/onboarding", label: "Client onboarding" },
    { to: "/operations/deadlines", label: "Onboarding deadlines" },
  ],
};
