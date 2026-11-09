import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, ArrowRight, BarChart3, BookOpen, Bot, Briefcase, Building2, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, Clock, Compass, Edit3, ExternalLink,
  FileSignature, Gauge, ListTree, Lock, Mail, Map as MapIcon, MessageCircle, Phone, Plus, Search, Send,
  ShieldCheck, Sparkles, Tag, Target, User, UserX, Users, Wrench, Eye, EyeOff, KeyRound,
  RotateCcw, PowerOff, FileBarChart2, Crown, Laptop, Code2, Megaphone, Share2, Sliders, UserCheck, Layers, GitBranch, ArrowUpRight, Check,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { createTeamMember, setAdminRole, updateTeamMember } from "@/lib/admin.functions";
import { useProfile } from "@/lib/use-profile";
import {
  useStaffNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/staff-tasks.service";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContentEditor } from "@/components/ContentEditor";

type Icon = ComponentType<{ className?: string }>;
type Sop = { id: string; slug: string; department: string; title: string; reports_to: string | null; oversees: string | null; primary_tools: string | null; role_purpose: string | null; core_responsibilities: string | null; daily_weekly_monthly: string | null; key_sops: string | null; kpis: string | null; };
type Service = { id: string; slug: string; name: string; tagline: string | null; who_for: string | null; what_we_do: string | null; client_receives: string | null; outcome: string | null; };
type Package = { id: string; name: string; price: string; best_for: string | null };
type PricingItem = { id: string; section: string; name: string; description: string | null; price: string; sort_order: number };
type Tool = { id: string; slug: string; name: string; category: string | null; login_url: string | null; admin_only: boolean; what_it_is: string | null; why_we_use: string | null; how_to_use: string | null; who_uses: string | null; };
type GlossaryTerm = { id: string; term: string; definition: string; full_definition: string | null; why_it_matters: string | null; how_to_steps: string[] | null; tool_slug: string | null; service_slug: string | null };
type ProfileRow = { id: string; full_name: string | null; email: string; department: string | null; job_title: string | null; phone: string | null; is_active: boolean; onboarding_completed: boolean; last_login_at?: string | null; created_at?: string; avatar_url?: string | null; };
type AuditLog = { id: string; actor_id: string | null; action: string; target_id: string | null; details: unknown; created_at: string };

async function copyToClipboard(text: string, successMessage: string) {
  try { await navigator.clipboard.writeText(text); toast.success(successMessage); }
  catch { toast.info(text); }
}

export type DepartmentDefinition = {
  id: string;
  name: string;
  shortName: string;
  category: "Executive & Management" | "Technology & Delivery" | "Growth & Revenue" | "Operations & Administration";
  purpose: string;
  reports_to: string;
  oversees: string;
  matchKeys: string[];
  keyFunctions: string[];
  primaryTools: string[];
  sopSlug: string;
  icon: ComponentType<{ className?: string }>;
};

export const DEPARTMENT_DEFINITIONS: DepartmentDefinition[] = [
  {
    id: "it-department",
    name: "IT & Software Engineering",
    shortName: "IT Department",
    category: "Technology & Delivery",
    purpose: "Engineers, maintains, and secures internal portal infrastructure, client web applications, database architectures, cloud hosting, and technical end-user support.",
    reports_to: "General Manager / Managing Director",
    oversees: "Software Development, Cloud Infrastructure, Database Architecture, IT Helpdesk & QA",
    matchKeys: ["it department", "it support", "developer", "software", "scram", "scrum", "technical", "intern"],
    keyFunctions: [
      "Maintains and extends MSP internal portal systems, authentication, and attendance tracking.",
      "Develops and tests custom client web applications, landing pages, and API integrations.",
      "Monitors database performance, backups, and security policies on Supabase and cloud servers.",
      "Provides responsive IT technical support, hardware setup, and access management."
    ],
    primaryTools: ["GitHub", "Supabase", "VS Code", "Vercel", "PostgreSQL", "Google Workspace"],
    sopSlug: "it-department",
    icon: Code2,
  },
  {
    id: "marketing-team",
    name: "Marketing & Growth",
    shortName: "Marketing Team",
    category: "Growth & Revenue",
    purpose: "Drives MSP's market authority, organic search ranking, inbound lead funnels, and performance marketing campaigns for agency brand expansion.",
    reports_to: "General Manager / Managing Director",
    oversees: "SEO Strategy, Inbound Demand Generation, Content Marketing, Campaign QA",
    matchKeys: ["marketing team", "marketing", "seo", "marketer", "account manager"],
    keyFunctions: [
      "Conducts full technical and on-page SEO audits, keyword research, and ranking optimizations.",
      "Develops educational content and marketing assets that attract high-value agency clients.",
      "Tracks and analyzes traffic acquisition, bounce rates, and conversion funnels via GA4 & Search Console.",
      "Collaborates with sales and creative teams to align messaging with monthly growth targets."
    ],
    primaryTools: ["Google Search Console", "Google Analytics 4", "Ahrefs", "Canva", "GoHighLevel"],
    sopSlug: "marketing-team",
    icon: Megaphone,
  },
  {
    id: "social-media",
    name: "Social Media & Content Creation",
    shortName: "Social Media Manager",
    category: "Growth & Revenue",
    purpose: "Formulates content strategies, designs high-converting multimedia assets, and stewards active online communities across Meta, LinkedIn, TikTok, and YouTube.",
    reports_to: "Operations Manager / General Manager",
    oversees: "Content Planning, Visual Design, Short-Form Video, Community Engagement",
    matchKeys: ["social media manager", "social media", "social", "creative content", "graphics"],
    keyFunctions: [
      "Builds monthly multi-platform content calendars aligned with client marketing retainers.",
      "Designs professional social carousels, ad creatives, infographics, and reel edits.",
      "Manages day-to-day community interactions, message replies, and post distribution.",
      "Monitors social metrics, follower engagement, and audience retention rates."
    ],
    primaryTools: ["Meta Business Suite", "Canva", "CapCut", "TikTok", "LinkedIn", "Instagram"],
    sopSlug: "social-media",
    icon: Share2,
  },
  {
    id: "operations",
    name: "Operations & Delivery Management",
    shortName: "Operations Manager",
    category: "Operations & Administration",
    purpose: "Orchestrates agency-wide service delivery, governs client onboarding pipelines, resolves operational blockers, and upholds quality standards.",
    reports_to: "Managing Director / General Manager",
    oversees: "Client Onboarding, Workflow Governance, Cross-Team Dependencies, Verification Queue",
    matchKeys: ["operations manager", "operations", "delivery"],
    keyFunctions: [
      "Governs end-to-end client build roadmap from contract signing to final handover.",
      "Resolves cross-departmental blockers and approves operational dependency handoffs.",
      "Monitors project deadlines, sprint velocity, and service level agreements (SLAs).",
      "Leads weekly delivery review meetings and coordinates client recovery plans."
    ],
    primaryTools: ["GoHighLevel", "Slack", "Google Drive", "MSP Portal", "Notion"],
    sopSlug: "operations",
    icon: Sliders,
  },
  {
    id: "human-resources",
    name: "Human Resources & People",
    shortName: "Human Resources",
    category: "Operations & Administration",
    purpose: "Stewards talent recruitment, structured employee onboarding, performance governance, leave administration, statutory compliance, and workplace culture.",
    reports_to: "Managing Director / General Manager",
    oversees: "Talent Acquisition, Employee Relations, Leave Approvals, Compliance & Declarations",
    matchKeys: ["human resources", "hr", "people", "recruitment"],
    keyFunctions: [
      "Manages recruitment pipelines, interview scheduling, and employment agreements.",
      "Administers employee leave balances, daily attendance presence, and timesheets.",
      "Guides new team members through structured 14-day onboarding and training.",
      "Maintains signed employee compliance declarations, NDAs, and workplace policies."
    ],
    primaryTools: ["MSP HR Portal", "Google Workspace", "Resend", "WhatsApp Business"],
    sopSlug: "human-resources",
    icon: UserCheck,
  },
  {
    id: "admin-department",
    name: "Admin & Financial Operations",
    shortName: "Admin Department",
    category: "Operations & Administration",
    purpose: "Manages accounting reconciliation, client invoicing, accounts receivable, office facilities, front desk reception, and statutory paperwork.",
    reports_to: "Managing Director / General Manager",
    oversees: "Client Invoicing, Accounts Receivable, Reception & Office Administration",
    matchKeys: ["admin department", "admin", "administration", "receptionist", "finance"],
    keyFunctions: [
      "Generates and issues monthly retainer invoices, quotes, and payment receipts.",
      "Tracks incoming client payments, aged debtors, and bank reconciliation.",
      "Operates front desk reception, call routing, and client greeting protocols.",
      "Maintains physical and digital administrative documentation and office supplies."
    ],
    primaryTools: ["Zoho Books", "Microsoft Excel", "Standard Bank", "Google Drive"],
    sopSlug: "admin-department",
    icon: ShieldCheck,
  },
  {
    id: "managing-director",
    name: "General Management & Managing Director",
    shortName: "Managing Director",
    category: "Executive & Management",
    purpose: "Drives company-wide operational execution, financial revenue performance, department head accountability, and strategic resource allocation.",
    reports_to: "Chief Executive Officer (CEO)",
    oversees: "Operations Manager, IT Department, Marketing Team, HR, Admin & Finance",
    matchKeys: ["managing director", "general manager", "general.manager", "gm"],
    keyFunctions: [
      "Translates executive vision into quarterly departmental execution targets and KPIs.",
      "Monitors company revenue actuals versus monthly budget targets.",
      "Approves senior personnel allocations, budget adjustments, and policy updates.",
      "Chairs executive alignment sessions and unblocks high-level inter-departmental hurdles."
    ],
    primaryTools: ["MSP GM Command Centre", "Zoho Books", "Slack", "Google Workspace"],
    sopSlug: "managing-director",
    icon: Briefcase,
  },
  {
    id: "ceo",
    name: "Executive Leadership (CEO)",
    shortName: "CEO",
    category: "Executive & Management",
    purpose: "Establishes corporate vision, strategic market positioning, shareholder governance, executive leadership, and major partnership acquisitions.",
    reports_to: "Board of Directors / Founder",
    oversees: "Managing Director, General Manager, Executive Functions, Legal & Compliance",
    matchKeys: ["ceo", "executive", "shamah"],
    keyFunctions: [
      "Sets long-range commercial strategy, company mission, and core values.",
      "Reviews macro financial health, operating profit margins, and expansion initiatives.",
      "Fosters high-level stakeholder, enterprise, and institutional client relationships.",
      "Exercises final approval on major contracts, corporate structure, and executive hires."
    ],
    primaryTools: ["MSP CEO Executive Dashboard", "Google Workspace", "Slack"],
    sopSlug: "ceo",
    icon: Crown,
  },
  {
    id: "sales-team",
    name: "Sales & Business Development",
    shortName: "Sales Team",
    category: "Growth & Revenue",
    purpose: "Identifies prospective SME and enterprise clients, conducts discovery consultations, structures custom growth proposals, and secures new agency retainers.",
    reports_to: "General Manager / Managing Director",
    oversees: "Outbound Prospecting, Discovery & Pipeline, Deal Closing, Proposal Handoff",
    matchKeys: ["sales team", "sales", "business development"],
    keyFunctions: [
      "Conducts rigorous discovery calls using BANT qualification criteria.",
      "Builds tailored client proposals leveraging MSP standard service packages.",
      "Maintains speed-to-lead under 10 minutes on all inbound inquiries.",
      "Completes structured contract handovers to Operations upon deal closure."
    ],
    primaryTools: ["GoHighLevel", "Sales Playbook", "WhatsApp Business", "Google Meet"],
    sopSlug: "sales-team",
    icon: Target,
  },
  {
    id: "client-relationship-manager",
    name: "Client Relationship Management (CRM)",
    shortName: "Client Relationship Manager",
    category: "Growth & Revenue",
    purpose: "Protects account retention, leads client communication cadence, coordinates monthly report calls, and identifies expansion opportunities.",
    reports_to: "Operations Manager",
    oversees: "Client Communications, Monthly Report Reviews, Retention & Upsells",
    matchKeys: ["client relationship manager", "client relationship", "crm", "account manager"],
    keyFunctions: [
      "Acts as the dedicated client advocate and primary strategic point of contact.",
      "Compiles and presents comprehensive monthly ROI and performance reports by the 7th.",
      "Conducts quarterly account reviews to assess growth and identify upsell opportunities.",
      "Resolves client concerns proactively to maintain retention rate above 92%."
    ],
    primaryTools: ["GoHighLevel", "Google Meet", "WhatsApp Business", "Manus AI"],
    sopSlug: "client-relationship-manager",
    icon: Users,
  },
  {
    id: "media-buying",
    name: "Media Buying & Paid Advertising",
    shortName: "Media Buying",
    category: "Growth & Revenue",
    purpose: "Deploys, tests, and scales multi-channel paid ad campaigns on Meta, Google, and TikTok to generate predictable, cost-efficient customer leads.",
    reports_to: "Operations Manager",
    oversees: "Paid Campaigns, Tracking Pixels, Ad Set A/B Testing, Budget Optimization",
    matchKeys: ["media buying", "media buyer", "paid ads", "ads"],
    keyFunctions: [
      "Sets up and validates tracking pixels, conversion events, and server-side tracking.",
      "Builds high-intent audience segments, lookalikes, and retargeting campaigns.",
      "Tests multiple creative hooks and ad angles to lower cost-per-lead (CPL).",
      "Conducts daily spend monitoring and optimizes winning campaigns at Day 2 and Day 7."
    ],
    primaryTools: ["Meta Ads Manager", "Google Ads", "TikTok Ads Manager", "Google Tag Manager"],
    sopSlug: "media-buying",
    icon: BarChart3,
  },
];

export const DEPARTMENTS = [
  "IT Department", "Marketing Team", "Social Media Manager", "Operations Manager",
  "Human Resources", "Admin Department", "Managing Director", "CEO",
  "Sales Team", "Client Relationship Manager", "Media Buying",
];

export const DEPARTMENT_META: Record<string, { purpose: string; reports_to: string; sop_slug?: string }> = {
  "IT Department": { purpose: "Manages internal portal infrastructure, client web applications, database security, and technical support.", reports_to: "General Manager / Managing Director", sop_slug: "it-department" },
  "Marketing Team": { purpose: "Drives MSP's own brand marketing, SEO authority, inbound leads, and positioning.", reports_to: "General Manager / Managing Director", sop_slug: "marketing-team" },
  "Social Media Manager": { purpose: "Plans, produces, designs, and publishes agency and client social content.", reports_to: "Operations Manager / General Manager", sop_slug: "social-media" },
  "Operations Manager": { purpose: "Runs delivery workflows, onboarding, cross-team coordination, and blocker resolution.", reports_to: "Managing Director / General Manager", sop_slug: "operations" },
  "Human Resources": { purpose: "Talent recruitment, onboarding, leave administration, declarations, and employee welfare.", reports_to: "Managing Director / General Manager", sop_slug: "human-resources" },
  "Admin Department": { purpose: "Invoicing, accounts receivable, office management, and front desk reception.", reports_to: "Managing Director / General Manager", sop_slug: "admin-department" },
  "Managing Director": { purpose: "Drives day-to-day company execution against strategy and financial targets.", reports_to: "Chief Executive Officer (CEO)", sop_slug: "managing-director" },
  "CEO": { purpose: "Sets vision, strategic market direction, governance, and final executive approvals.", reports_to: "Board of Directors / Founder", sop_slug: "ceo" },
  "Sales Team": { purpose: "Identifies, qualifies, structures proposals, and closes new business retainers.", reports_to: "General Manager / Managing Director", sop_slug: "sales-team" },
  "Client Relationship Manager": { purpose: "Owns client retention, communications cadence, and monthly reporting rhythm.", reports_to: "Operations Manager", sop_slug: "client-relationship-manager" },
  "Media Buying": { purpose: "Executes, optimizes, and scales paid ad campaigns on Meta, Google, and TikTok.", reports_to: "Operations Manager", sop_slug: "media-buying" },
};

export const DEFAULT_SOPS: Sop[] = [
  {
    id: "sop-it-default",
    slug: "it-department",
    department: "IT Department",
    title: "IT Engineering & Systems Administration SOP",
    reports_to: "General Manager / Managing Director",
    oversees: "Software Development, Cloud Infrastructure, Database Architecture, IT Helpdesk & QA",
    primary_tools: "GitHub, Supabase, VS Code, Vercel, PostgreSQL, Google Workspace",
    role_purpose: "Ensures the highest standard of technical stability, security, portal availability, and software quality across MSP internal infrastructure and client digital deployments.",
    core_responsibilities: "Develop and test custom portal features, authentication flows, and real-time workforce tracking · Maintain database schemas, backups, and security policies on Supabase · Provide prompt IT technical assistance, device provisioning, and access management · Enforce code review standards, PR approvals, and zero-defect QA verification before production release",
    daily_weekly_monthly: "Daily: Morning technical standup, review overnight system logs and Supabase auth telemetry · Weekly: Sprint backlog planning, database index and storage audits · Monthly: Infrastructure security review, disaster recovery tests, and software license audit",
    key_sops: "1. Code deployment protocol: feature branch -> local unit testing -> PR creation -> peer review -> staging check -> production deploy. 2. New employee hardware & account onboarding: provision Google Workspace account -> assign Supabase role -> grant GitHub/tool access -> 2FA enforcement. 3. Incident response: log issue severity -> isolate failing service -> apply patch/hotfix -> run verification -> post-incident retrospective within 24h.",
    kpis: "Portal uptime >= 99.9% · P1 bug resolution < 2 hours · PR review turnaround < 6 hours · Zero unauthenticated security incidents",
  },
  {
    id: "sop-marketing-default",
    slug: "marketing-team",
    department: "Marketing Team",
    title: "Marketing Strategy & SEO Operations SOP",
    reports_to: "General Manager / Managing Director",
    oversees: "SEO Strategy, Inbound Demand Generation, Content Marketing, Campaign QA",
    primary_tools: "Google Search Console, Google Analytics 4, Ahrefs, SEMrush, GoHighLevel, Canva",
    role_purpose: "Drives organic acquisition, high-intent traffic, domain authority, and inbound qualified opportunities for MSP's core agency services.",
    core_responsibilities: "Perform technical SEO audits, site speed optimization, and on-page keyword structuring · Produce high-value case studies, service landing pages, and lead magnets · Track and report organic keyword movements, impressions, and conversions monthly · Coordinate with the sales team to ensure inbound lead quality and attribution accuracy",
    daily_weekly_monthly: "Daily: Monitor Google Search Console crawl errors and inbound lead form captures · Weekly: Keyword ranking checks, content publishing schedule, and backlink analysis · Monthly: Full organic performance audit and competitive positioning report",
    key_sops: "1. SEO Audit Protocol: crawl website via audit tool -> identify indexing/schema/speed bottlenecks -> prioritize fixes -> verify in Search Console. 2. Content Brief & Publishing: research commercial keyword -> write structured outline (H1, H2, FAQ) -> draft copy with internal links -> QA metadata -> publish and request indexing. 3. Monthly SEO Report: extract Search Console & GA4 data -> highlight top performing pages and keyword gains -> identify next month's focus.",
    kpis: "Month-on-month organic traffic growth >= 15% · Average ranking improvement for core terms · Speed-to-index for new content < 48 hours · Inbound qualified leads >= 25/month",
  },
  {
    id: "sop-social-default",
    slug: "social-media",
    department: "Social Media Manager",
    title: "Social Media Planning & Content Creation SOP",
    reports_to: "Operations Manager / General Manager",
    oversees: "Content Planning, Visual Design, Short-Form Video, Community Engagement",
    primary_tools: "Meta Business Suite, Canva, CapCut, TikTok, LinkedIn, Instagram",
    role_purpose: "Builds MSP's social presence and client social authority through consistent, engaging, high-retention content and proactive audience community management.",
    core_responsibilities: "Design monthly content calendars mapped to strategic agency and client objectives · Produce creative carousels, static graphics, reel scripts, and video edits · Schedule all approved posts in platform schedulers with optimized captions and hashtags · Monitor comments, DMs, and mentions daily, maintaining responsive engagement",
    daily_weekly_monthly: "Daily: Post scheduling verification, comment moderation, and story updates · Weekly: Performance analytics review (reach, engagement, shares) and creative ideation · Monthly: Content calendar submission by the 25th for following month's client approval",
    key_sops: "1. Content Calendar Assembly: gather client promotional priorities -> assemble post grid with captions & media -> submit for client review by the 25th -> apply feedback. 2. Asset Creation: follow brand kit guidelines -> design in platform-native aspect ratios (4:5, 9:16) -> QA copy and visuals before scheduling. 3. Community Engagement: review notifications twice daily -> reply to genuine queries within 2 hours -> escalate sales leads to GHL.",
    kpis: "100% on-time calendar approvals by the 28th · Engagement rate >= 3.5% across primary platforms · Zero missed scheduled posts · Community response time < 2 hours",
  },
  {
    id: "sop-ops-default",
    slug: "operations",
    department: "Operations Manager",
    title: "Operations Governance & Client Delivery SOP",
    reports_to: "Managing Director / General Manager",
    oversees: "Client Onboarding, Workflow Governance, Cross-Team Dependencies, Verification Queue",
    primary_tools: "GoHighLevel, Slack, Google Drive, MSP Portal, Notion",
    role_purpose: "Guarantees smooth, on-time client execution from signed contract to final launch while eliminating delivery bottlenecks across all production teams.",
    core_responsibilities: "Govern the 8-stage Client Build Roadmap across every active account · Review and resolve inter-departmental blocker escalations within 4 business hours · Enforce QA standards before client handoffs, website launches, or campaign live dates · Lead weekly cross-departmental delivery scrums and coordinate recovery plans",
    daily_weekly_monthly: "Daily: Review Verification Queue and unblock urgent cross-team dependencies · Weekly: Project status scrum, SLA breach risk assessment, and resource capacity review · Monthly: Delivery efficiency audit, client turnaround time analysis, and process optimization",
    key_sops: "1. Client Onboarding Handover: receive signed contract from Sales -> verify deposit payment -> trigger welcome email and GHL sub-account within 24 hours -> schedule kickoff call. 2. Blocker Escalation Protocol: review dependency request -> assign responsible department lead -> establish 24h turnaround target -> verify resolution. 3. Final Launch QA: complete 20-point pre-launch checklist -> obtain client sign-off in writing -> authorize live campaign/site.",
    kpis: "Onboarding completion within 14 business days · Project delivery SLA adherence >= 95% · Blocker resolution time < 24 hours · Zero unauthorized campaign launches",
  },
  {
    id: "sop-hr-default",
    slug: "human-resources",
    department: "Human Resources",
    title: "Human Resources & Talent Management SOP",
    reports_to: "Managing Director / General Manager",
    oversees: "Talent Acquisition, Employee Relations, Leave Approvals, Compliance & Declarations",
    primary_tools: "MSP HR Portal, Google Workspace, Resend, WhatsApp Business",
    role_purpose: "Attracts top-tier digital talent, fosters a disciplined and supportive company culture, and upholds strict statutory compliance and workforce records.",
    core_responsibilities: "Manage recruitment pipelines, job postings, candidate screening, and employment offers · Administer employee leave requests, attendance monitoring, and timesheet validations · Lead comprehensive 14-day employee onboarding, orientation, and training schedules · Maintain employee records, confidentiality agreements, and compliance declarations",
    daily_weekly_monthly: "Daily: Review morning presence board and process pending leave/declaration items · Weekly: Check in with new hires and monitor attendance discrepancies · Monthly: Payroll verification summary, timesheet sign-offs, and HR performance reporting",
    key_sops: "1. Hiring & Onboarding: publish role brief -> screen applicants -> conduct two-stage interview -> issue formal offer -> collect signed contract & ID -> initialize portal profile. 2. Leave Administration: receive request -> verify leave balance -> check operational coverage with department manager -> approve or decline with written rationale within 24 hours. 3. Compliance Maintenance: issue annual policy declaration -> track signature status -> archive in employee digital file.",
    kpis: "Leave request response time < 24 hours · 100% compliance declaration completion · 90-day new hire retention >= 90% · Zero unresolved employee relations grievances",
  },
  {
    id: "sop-admin-default",
    slug: "admin-department",
    department: "Admin Department",
    title: "Admin & Financial Operations SOP",
    reports_to: "Managing Director / General Manager",
    oversees: "Client Invoicing, Accounts Receivable, Reception & Office Administration",
    primary_tools: "Zoho Books, Microsoft Excel, Standard Bank, Google Drive",
    role_purpose: "Maintains financial accuracy, prompt client billing, healthy cash flow, and professional administrative operations across the organization.",
    core_responsibilities: "Generate and dispatch monthly client retainer invoices and project quotes via Zoho Books · Reconcile incoming bank deposits, track accounts receivable, and follow up on overdue accounts · Operate office reception, manage call routing, and welcome visitors with professional hospitality · Oversee general procurement, office consumables, software subscriptions, and administrative filings",
    daily_weekly_monthly: "Daily: Bank feed reconciliation, payment receipting, and front desk operations · Weekly: Aged debtors review, follow-up on invoices overdue by 5+ days · Monthly: Month-end billing run on the 25th, supplier payments reconciliation, and financial report summary",
    key_sops: "1. Invoicing Protocol: verify active client retainers and scope changes -> generate invoice in Zoho Books -> send via email with banking details -> verify receipt. 2. Accounts Receivable Follow-up: automated reminder at Due Date -> personal reminder at Day 3 -> manager escalation at Day 7 -> service pause warning at Day 14. 3. Office Reception: greet guests immediately -> offer refreshments -> notify host team member -> ensure sign-in protocol is observed.",
    kpis: "100% of recurring invoices dispatched by 25th · Aged receivables > 30 days kept below 5% · Bank reconciliation completed daily · Zero invoice billing discrepancies",
  },
  {
    id: "sop-md-default",
    slug: "managing-director",
    department: "Managing Director",
    title: "General Management & Operational Execution SOP",
    reports_to: "Chief Executive Officer (CEO)",
    oversees: "Operations Manager, IT Department, Marketing Team, HR, Admin & Finance",
    primary_tools: "MSP GM Command Centre, Zoho Books, Slack, Google Workspace",
    role_purpose: "Drives day-to-day operational execution, cross-departmental accountability, financial delivery against budgets, and tactical achievement of the CEO's growth mandate.",
    core_responsibilities: "Translate strategic goals into measurable weekly and monthly departmental execution targets · Review company financial performance, revenue actuals, margins, and operational burn · Arbitrate complex cross-departmental blockers and approve critical resource shifts · Chair weekly leadership scrums and ensure healthy workload capacity utilization",
    daily_weekly_monthly: "Daily: Review GM Command Centre execution metrics and critical escalations · Weekly: Leadership management scrum with department heads and capacity planning · Monthly: Comprehensive company performance review, financial reconciliation, and CEO briefing",
    key_sops: "1. Cross-Department Arbitration: receive escalation from Operations or Department Lead -> assess business impact -> convene relevant heads -> issue binding decision within 4 hours. 2. Capacity & Resource Allocation: review team utilization rates -> identify over/under-utilized units -> authorize contractor or team shift. 3. Monthly Executive Reporting: synthesize departmental metrics -> compile executive summary -> present to CEO with recommendations.",
    kpis: "Company-wide project SLA adherence >= 95% · Team capacity utilization 75%–85% · Operational budget variance < 5% · Departmental KPI achievement rate >= 90%",
  },
  {
    id: "sop-ceo-default",
    slug: "ceo",
    department: "CEO",
    title: "Executive Leadership & Corporate Governance SOP",
    reports_to: "Board of Directors / Founder",
    oversees: "Managing Director, General Manager, Executive Functions, Legal & Compliance",
    primary_tools: "MSP CEO Executive Dashboard, Google Workspace, Slack",
    role_purpose: "Sets corporate vision, strategic market positioning, shareholder governance, executive leadership, and major partnership acquisitions.",
    core_responsibilities: "Define multi-year agency vision, core values, and strategic capital allocation · Evaluate long-term executive health, revenue profitability, and client retention trends · Negotiate high-value enterprise partnerships and institutional relationships · Hold final signing authority on executive mandates, corporate governance, and strategy",
    daily_weekly_monthly: "Daily: Review executive pulse dashboard (revenue health, key client status) · Weekly: Strategic sync with Managing Director / General Manager · Monthly: Board reporting, commercial growth reviews, and major strategic milestone sign-offs",
    key_sops: "1. Strategic Review: assess agency positioning and market trends quarterly -> adjust service offerings and package tiers -> issue executive directives. 2. High-Value Client Engagement: participate in enterprise client pitches and strategic QBRs -> cement relationship at executive level. 3. Corporate Governance: review statutory filings, legal compliance, and major partner agreements.",
    kpis: "Annual revenue growth >= 40% · Client retention rate >= 90% · Net profit margin targets met · Executive employee satisfaction >= 90%",
  },
  {
    id: "sop-sales-default",
    slug: "sales-team",
    department: "Sales Team",
    title: "Sales Prospecting & Client Acquisition SOP",
    reports_to: "General Manager / Managing Director",
    oversees: "Outbound Prospecting, Discovery & Pipeline, Deal Closing, Proposal Handoff",
    primary_tools: "GoHighLevel, Sales Playbook, WhatsApp Business, Google Meet",
    role_purpose: "Identifies, qualifies, and closes prospective SME and corporate clients for MSP marketing retainers, web builds, and automation solutions.",
    core_responsibilities: "Respond to new inbound leads within 10 minutes at minimum (target 5 minutes) · Conduct structured discovery calls using BANT qualification criteria · Prepare professional proposal documents aligned with MSP standard service tiers · Secure signed service agreements and initial deposit payments before handover",
    daily_weekly_monthly: "Daily: Process pipeline in GHL, conduct discovery calls, and follow up with qualified deals · Weekly: Sales pipeline review meeting, deal velocity analysis, and conversion rate tracking · Monthly: Sales target reconciliation and review of won/lost reasons",
    key_sops: "1. Speed-to-Lead Response: receive lead notification -> review lead context -> trigger WhatsApp/call within 10 minutes -> log outcome in GHL. 2. Discovery Call Flow: confirm business goals -> uncover current bottlenecks -> qualify budget and timeline -> agree next step. 3. Deal Closure & Handover: issue contract & invoice -> confirm signed agreement and deposit -> schedule kickoff handover with Operations.",
    kpis: "Speed-to-lead < 10 minutes (90%+ under 5 mins) · Discovery to Proposal conversion >= 60% · Monthly new contract revenue targets met · 100% compliant handover documentation",
  },
  {
    id: "sop-crm-default",
    slug: "client-relationship-manager",
    department: "Client Relationship Manager",
    title: "Client Relationship Management & Retention SOP",
    reports_to: "Operations Manager",
    oversees: "Client Communications, Monthly Report Reviews, Retention & Upsells",
    primary_tools: "GoHighLevel, Google Meet, WhatsApp Business, Manus AI",
    role_purpose: "Serves as the dedicated advocate and trusted growth advisor for existing clients, securing high retention rates and identifying service expansion opportunities.",
    core_responsibilities: "Manage day-to-day client communications via authorized WhatsApp Business channels · Coordinate and dispatch monthly performance reports by the 7th of every month · Conduct monthly reporting video calls to review deliverables and strategize next steps · Identify account growth triggers and present structured upsell proposals",
    daily_weekly_monthly: "Daily: Monitor client WhatsApp channels and respond to client queries within 1 hour · Weekly: Review client deliverables status with Operations to ensure on-time completion · Monthly: Generate and send monthly reports by the 7th, host reporting review calls",
    key_sops: "1. Monthly Reporting Protocol: pull analytics/lead data by the 3rd -> draft report using template -> QA figures with Delivery -> dispatch by the 7th -> book review call. 2. Client Escalation Handling: acknowledge concern within 30 minutes -> investigate with delivery team -> present concrete solution within 4 hours. 3. Retention & Upsell: identify milestone achievements -> prepare 1-page proposal for additional service -> present during monthly call.",
    kpis: "Client retention rate >= 92% · 100% of reports sent by the 7th · Monthly report review call completion >= 85% · Client inquiry response time < 1 hour",
  },
  {
    id: "sop-media-default",
    slug: "media-buying",
    department: "Media Buying",
    title: "Paid Media Strategy & Campaign Optimization SOP",
    reports_to: "Operations Manager",
    oversees: "Paid Campaigns, Tracking Pixels, Ad Set A/B Testing, Budget Optimization",
    primary_tools: "Meta Ads Manager, Google Ads, TikTok Ads Manager, Google Tag Manager",
    role_purpose: "Engineers, monitors, and scales multi-channel paid ad campaigns to deliver predictable, cost-effective qualified leads for client accounts.",
    core_responsibilities: "Build and verify tracking pixels, conversions, and server-side tracking before launch · Construct targeted audience segments, lookalikes, and custom retargeting layers · Write compelling ad copy angles and coordinate creative requirements with design team · Monitor campaign metrics daily, optimizing winning ad sets and pruning losers",
    daily_weekly_monthly: "Daily: Check ad spend pacing, lead flow, and campaign delivery alerts · Weekly: Day 2 and Day 7 campaign performance reviews, creative fatigue audits · Monthly: Compile ad performance figures (CPL, CTR, ROAS, Spend) for the client monthly report",
    key_sops: "1. Pre-Launch Tracking Verification: install pixel via GTM -> test lead event with Pixel Helper -> verify event in Events Manager -> confirm zero tracking errors. 2. Campaign Build: create campaign structure -> configure 3 audience sets -> load 3 creative variations per set -> set client direct-pay billing. 3. Optimization Protocol: review Day 2 (CTR/delivery) -> review Day 7 (CPL/conversions) -> pause ad sets with CPL 20%+ above benchmark -> scale top performers by 15-20%.",
    kpis: "Cost-per-lead (CPL) maintained within agreed client benchmark · Click-through rate (CTR) >= 1.5% · Zero ad spend overruns · 100% tracking verification before any ad spend",
  },
];

const ROADMAP = [
  { title: "Contract signed", owner: "Sales", detail: "Signed proposal, invoice, payment confirmation and kickoff handover." },
  { title: "Welcome + setup", owner: "Operations", detail: "Welcome message, GHL sub-account, folders, channels and access list." },
  { title: "Kickoff call", owner: "CRM", detail: "Confirm goals, offer, audience, assets, timelines and approval process." },
  { title: "Strategy document", owner: "Operations", detail: "Translate business goals into funnel, content, tracking and reporting plan." },
  { title: "Build phase", owner: "Delivery", detail: "Campaigns, websites, automations, forms, pixels, integrations and QA." },
  { title: "Launch", owner: "Operations", detail: "Final checklist, client approval, budgets live, monitoring window scheduled." },
  { title: "Optimise", owner: "Delivery", detail: "Weekly checks, creative refresh, CRM hygiene, client updates and escalations." },
  { title: "Report + retain", owner: "CRM", detail: "Monthly report by the 7th, call, upsell triggers and retention plan." },
];

const FAQS = [
  { q: "Do we guarantee leads?", a: "No. We sell a system: offer, tracking, creative, follow-up and optimisation. We forecast honestly and improve from data." },
  { q: "Who pays ad spend?", a: "The client pays platforms directly. MSP never handles ad spend money." },
  { q: "How fast should leads be contacted?", a: "Within 10 minutes at minimum; within 5 minutes where possible. Speed is a sales advantage." },
  { q: "Can clients use stock images?", a: "Only as a last resort. Real photos and videos from the client usually outperform generic content." },
  { q: "When does SEO work?", a: "Local SEO can move in 4–8 weeks. Full SEO usually takes 3–6 months or longer in competitive industries." },
];

const CONTENT_TABLES = ["sops", "services", "packages", "pricing_items", "tools", "glossary_terms", "sales_faq"];

const PRICING_TAB_ORDER = [
  "Monthly Marketing Retainers",
  "Website Development (once-off)",
  "CRM & Automation Setup (once-off)",
  "SEO",
  "Social Media Add-Ons",
  "AI Chatbot & Integrations",
  "Mobile App Development",
  "Standalone / One-Off Services",
];

function pageTitle(icon: Icon, eyebrow: string, title: string, description: string) {
  const IconComponent = icon;
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <IconComponent className="h-3.5 w-3.5" /> {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed p-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function useTable<T>(key: string, table: string, order = "sort_order") {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any).from(table).select("*").order(order, { ascending: true });
        if (error) {
          console.warn(`Error querying table ${table}:`, error);
          return [] as T[];
        }
        return (data ?? []) as T[];
      } catch (err) {
        console.warn(`Query exception for table ${table}:`, err);
        return [] as T[];
      }
    },
    staleTime: 60_000,
  });
}

function splitText(value?: string | null) {
  if (!value) return [];
  return value.split(/\s*·\s*|\n|;\s*/).map((part) => part.trim()).filter(Boolean);
}

function parseNumberedSteps(text?: string | null) {
  if (!text) return [];
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((line) => line.replace(/^\d+\.\s*/, ""));
}

export function WhoWeArePage() {
  return (
    <div className="space-y-6">
      {pageTitle(Compass, "Company OS", "Who We Are", "Mavis Strategic Partners is a growth systems partner: marketing, websites, automation, apps and AI built around measurable outcomes.")}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Internal operating promise</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We do not run random campaigns. We build systems that help clients capture leads, respond fast, convert better and retain more customers. Every team member works from SOPs, reports through the correct channel and escalates with a recommended solution.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Leads over followers", "Revenue beats vanity metrics."],
              ["Systems over campaigns", "A repeatable machine beats one-off work."],
              ["Automation over manual work", "If it can be automated, it should be."],
              ["Data over opinions", "Numbers decide. Opinions guide."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-md border border-border bg-secondary/30 p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Escalation rule</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Problems move upward only with context, options and a recommended decision. Client threats, legal risk, budget decisions and unresolved performance issues must be escalated fast.
          </p>
          <div className="mt-5 space-y-3">
            {DEPARTMENTS.slice(0, 5).map((department, index) => (
              <div key={department} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">{index + 1}</span>
                <span>{department}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ SERVICES with expanded step lists + real action links ============
const SERVICE_TOOL_MAP: Record<string, string> = {
  "meta-ads": "meta-business",
  "facebook-ads": "meta-business",
  "google-ads": "google-ads",
  "tiktok-ads": "tiktok-ads",
  "social-media": "meta-business",
  "crm-automation": "gohighlevel",
  "chatbots": "gohighlevel",
  "seo": "google-ads",
  "web-development": "gohighlevel",
  "reporting": "gohighlevel",
};

export function ServicesPage() {
  const { data = [], isLoading } = useTable<Service>("services", "services");
  const { data: tools = [] } = useTable<Tool>("tools-svc", "tools");
  return (
    <div>
      {pageTitle(Briefcase, "Offer library", "Our Services", "The approved services MSP sells, with a step-by-step of exactly how we deliver each one — plus direct links to the tools and pages that back them up.")}
      {isLoading ? <EmptyState title="Loading services" description="Pulling the latest service library." /> : (
        <div className="space-y-4">
          {data.map((service) => {
            const steps = parseNumberedSteps(service.what_we_do);
            const toolSlug = SERVICE_TOOL_MAP[service.slug];
            const relatedTool = toolSlug ? tools.find((t) => t.slug === toolSlug) : undefined;
            return (
              <Card key={service.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold">{service.name}</h2>
                    <p className="mt-1 text-sm text-primary">{service.tagline}</p>
                  </div>
                  <Badge variant="outline" className="w-fit">Service</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
                  <div className="rounded-md border border-border bg-secondary/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Who it's for</p>
                    <p className="mt-1 text-sm">{service.who_for}</p>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client receives</p>
                    <p className="mt-1 text-sm">{service.client_receives}</p>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Outcome</p>
                    <p className="mt-1 text-sm">{service.outcome}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What we do — step by step</p>
                  <ol className="mt-3 space-y-2">
                    {steps.length ? steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
                        <span className="leading-6">{step}</span>
                      </li>
                    )) : <li className="text-sm text-muted-foreground">Steps not yet documented.</li>}
                  </ol>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Link to="/pricing"><Button size="sm"><Tag className="mr-2 h-4 w-4" /> See pricing</Button></Link>
                  <Link to="/sops"><Button size="sm" variant="outline"><BookOpen className="mr-2 h-4 w-4" /> SOP for this</Button></Link>
                  <Link to="/roadmap"><Button size="sm" variant="outline"><MapIcon className="mr-2 h-4 w-4" /> Delivery roadmap</Button></Link>
                  {relatedTool?.login_url && (
                    <a href={relatedTool.login_url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> Open {relatedTool.name}</Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ PRICING ============
export function PricingPage() {
  const { data: packages = [] } = useTable<Package>("packages", "packages");
  const { data: items = [] } = useTable<PricingItem>("pricing-items", "pricing_items");

  const grouped = useMemo(() => {
    const map = new Map<string, PricingItem[]>();
    for (const item of items) {
      const list = map.get(item.section) ?? [];
      list.push(item);
      map.set(item.section, list);
    }
    return map;
  }, [items]);

  const sections = ["Monthly Marketing Retainers", ...PRICING_TAB_ORDER.slice(1).filter((s) => grouped.has(s))];

  return (
    <div>
      {pageTitle(Tag, "Rate card", "Pricing & Packages", "The full internal price list — monthly retainers plus every à la carte service. Every figure is editable by admins.")}
      <Tabs defaultValue={sections[0]} className="w-full">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {sections.map((s) => <TabsTrigger key={s} value={s} className="text-xs">{s}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="Monthly Marketing Retainers" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg, index) => (
              <Card key={pkg.id} className={cn("p-5", index === 2 && "border-primary/40 bg-primary/5")}>
                <Badge variant={index === 2 ? "default" : "outline"}>{index === 2 ? "Popular" : "Retainer"}</Badge>
                <h2 className="mt-4 text-xl font-semibold">{pkg.name}</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-primary">{pkg.price}</p>
                <p className="mt-3 text-sm text-muted-foreground">{pkg.best_for}</p>
                <Button className="mt-5 w-full" variant={index === 2 ? "default" : "outline"}
                  onClick={() => copyToClipboard(`${pkg.name} — ${pkg.price}: ${pkg.best_for ?? ""}`, "Package copied for proposal")}>
                  Use in proposal
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {PRICING_TAB_ORDER.slice(1).map((section) => (
          <TabsContent key={section} value={section} className="mt-4">
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-1/5 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(grouped.get(section) ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.description}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{row.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Alert className="mt-6 border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Never included in packages</AlertTitle>
        <AlertDescription>
          Ad spend (paid directly by the client to the platform), CRM setup & automation (unless on Scale Plus / Elite Unlimited), website development, and mobile app development — these are always scoped and quoted individually.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ============ GLOSSARY with detail drawer ============
export function GlossaryPage() {
  const { data = [] } = useTable<GlossaryTerm>("glossary", "glossary_terms", "term");
  const { data: tools = [] } = useTable<Tool>("tools-lookup", "tools");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<GlossaryTerm | null>(null);
  const filtered = data.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(query.toLowerCase()));
  const activeTool = active ? tools.find((t) => t.slug === active.tool_slug) : undefined;
  return (
    <div>
      {pageTitle(ListTree, "Language", "Glossary", "Every acronym, metric and delivery term used at MSP — click any term for the full breakdown and how to act on it.")}
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search terms…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <button key={item.id} onClick={() => setActive(item)} className="text-left">
            <Card className="p-4 transition hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{item.term}</h2>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.definition}</p>
            </Card>
          </button>
        ))}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl">{active.term}</SheetTitle>
                <SheetDescription>{active.definition}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">Full definition</h3>
                  <p className="mt-2 text-sm leading-6">{active.full_definition || active.definition}</p>
                </section>
                {active.why_it_matters && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">Why it matters at MSP</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.why_it_matters}</p>
                  </section>
                )}
                {active.how_to_steps && active.how_to_steps.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">How to work with this — step by step</h3>
                    <ol className="mt-2 space-y-2">
                      {active.how_to_steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
                          <span className="leading-6">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
                <section className="flex flex-wrap gap-2">
                  {activeTool && activeTool.login_url && (
                    <a href={activeTool.login_url} target="_blank" rel="noreferrer">
                      <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Open {activeTool.name}</Button>
                    </a>
                  )}
                  {active.service_slug && (
                    <Link to="/services"><Button size="sm" variant="outline"><Briefcase className="mr-2 h-4 w-4" /> Related service</Button></Link>
                  )}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============ SOPS ============
export function SopsPage() {
  const { data = [], isLoading } = useTable<Sop>("sops", "sops");
  const [department, setDepartment] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("dept");
      if (p) {
        // Find best match in DEPARTMENTS
        const match = DEPARTMENTS.find(
          (d) => d.toLowerCase() === p.toLowerCase() || d.toLowerCase().includes(p.toLowerCase())
        );
        setDepartment(match || p);
      }
    }
  }, []);

  const allSops = useMemo(() => {
    if (data.length > 0) return data;
    return DEFAULT_SOPS;
  }, [data]);

  const filtered = useMemo(() => {
    if (department === "all") return allSops;
    const lower = department.toLowerCase();
    return allSops.filter(
      (sop) =>
        sop.department.toLowerCase() === lower ||
        sop.department.toLowerCase().includes(lower) ||
        sop.slug.toLowerCase() === lower ||
        lower.includes(sop.slug.toLowerCase())
    );
  }, [allSops, department]);

  return (
    <div>
      {pageTitle(BookOpen, "How we work", "SOP Library", "Department roles, reporting lines, KPIs, operating rhythms and key procedures from the master portal document.")}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-xs">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments ({allSops.length})</SelectItem>
              {DEPARTMENTS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {department !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setDepartment("all")} className="text-xs text-muted-foreground">
            Clear filter (show all)
          </Button>
        )}
      </div>
      {isLoading ? <EmptyState title="Loading SOPs" description="Pulling the latest SOP library." /> : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 opacity-40" />
              <p className="mt-3 text-sm font-medium">No standard operating procedures found for this filter.</p>
              <Button variant="outline" size="sm" onClick={() => setDepartment("all")} className="mt-4">
                View all SOPs
              </Button>
            </Card>
          ) : (
            filtered.map((sop) => (
              <Card key={sop.id} className="p-5 transition hover:border-primary/30">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{sop.department}</Badge>
                    <h2 className="mt-3 text-xl font-semibold">{sop.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{sop.role_purpose}</p>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground md:text-right">
                    <p><span className="font-medium text-foreground">Reports to:</span> {sop.reports_to || "—"}</p>
                    {sop.oversees && <p><span className="font-medium text-foreground">Oversees:</span> {sop.oversees}</p>}
                    <p><span className="font-medium text-foreground">Tools:</span> {sop.primary_tools || "—"}</p>
                  </div>
                </div>
                <Tabs defaultValue="responsibilities" className="mt-5">
                  <TabsList className="flex h-auto flex-wrap justify-start">
                    <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                    <TabsTrigger value="rhythm">Operating Rhythm</TabsTrigger>
                    <TabsTrigger value="sops">Key SOPs</TabsTrigger>
                    <TabsTrigger value="kpis">KPIs & Metrics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="responsibilities"><BulletList items={splitText(sop.core_responsibilities)} fallback={sop.core_responsibilities} /></TabsContent>
                  <TabsContent value="rhythm"><p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{sop.daily_weekly_monthly}</p></TabsContent>
                  <TabsContent value="sops"><p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{sop.key_sops}</p></TabsContent>
                  <TabsContent value="kpis"><BulletList items={splitText(sop.kpis)} fallback={sop.kpis} /></TabsContent>
                </Tabs>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BulletList({ items, fallback }: { items: string[]; fallback?: string | null }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{fallback || "No details added yet."}</p>;
  return (
    <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
      {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}
    </ul>
  );
}

export function RoadmapPage() {
  return (
    <div>
      {pageTitle(MapIcon, "Client delivery", "Client Build Roadmap", "The standard path from signed client to launch, optimisation and retention.")}
      <div className="grid gap-4 md:grid-cols-2">
        {ROADMAP.map((step, index) => (
          <Card key={step.title} className="p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{step.title}</h2>
                  <Badge variant="outline">{step.owner}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/sops"><Button size="sm" variant="outline" className="h-7 text-xs"><BookOpen className="mr-1.5 h-3 w-3" /> {step.owner} SOP</Button></Link>
                  <Link to="/tools"><Button size="sm" variant="outline" className="h-7 text-xs"><Wrench className="mr-1.5 h-3 w-3" /> Tools</Button></Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ TOOLS: clickable, grouped by category ============
const CATEGORY_ORDER = ["CRM", "Ads & Social", "Ads", "Analytics", "SEO", "Tracking", "Local SEO", "Finance", "Internal Comms", "Files", "Client Comms", "Design", "AI Reporting", "Admin/Infra"];

export function ToolsPage() {
  const { data = [] } = useTable<Tool>("tools", "tools");
  const { data: profileData } = useProfile();
  const isAdmin = profileData?.isAdmin ?? false;

  const visible = data.filter((t) => !t.admin_only || isAdmin);
  const grouped = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const t of visible) {
      const cat = t.category || "Other";
      const list = map.get(cat) ?? [];
      list.push(t);
      map.set(cat, list);
    }
    return map;
  }, [visible]);
  const orderedCats = [...CATEGORY_ORDER.filter((c) => grouped.has(c)), ...[...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c))];

  return (
    <div>
      {pageTitle(Wrench, "Systems", "Tools & Systems", "Every approved company platform, grouped by category. Every card opens the tool's real login page in a new tab.")}
      <div className="space-y-8">
        {orderedCats.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(grouped.get(cat) ?? []).map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{tool.name}</h3>
            {tool.admin_only && <Badge variant="outline" className="text-[10px]"><Lock className="mr-1 h-2.5 w-2.5" /> Admin</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{tool.category}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{tool.what_it_is}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tool.login_url && (
          <a href={tool.login_url} target="_blank" rel="noreferrer" className="inline-flex">
            <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Open login</Button>
          </a>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide details" : "How we use it"}
        </Button>
      </div>
      {open && (
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <p><span className="font-medium">What it is: </span><span className="text-muted-foreground">{tool.what_it_is}</span></p>
          <p><span className="font-medium">Why we use it: </span><span className="text-muted-foreground">{tool.why_we_use}</span></p>
          <p><span className="font-medium">How to set it up: </span><span className="text-muted-foreground">{tool.how_to_use}</span></p>
          <p><span className="font-medium">Who uses it: </span><span className="text-muted-foreground">{tool.who_uses}</span></p>
        </div>
      )}
    </Card>
  );
}

// ============ DEPARTMENTS ============
export function DepartmentsPage() {
  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("*");
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  // Helper to map profiles to departments based on matchKeys and department field
  const getDeptProfiles = (dept: DepartmentDefinition, allProfiles: ProfileRow[]) => {
    return allProfiles.filter((p) => {
      const rawDept = (p.department || "").toLowerCase().trim();
      if (rawDept && dept.matchKeys.some((k) => rawDept.includes(k))) {
        return true;
      }
      if (!rawDept || rawDept === "unassigned") {
        const title = (p.job_title || "").toLowerCase().trim();
        return dept.matchKeys.some((k) => title.includes(k));
      }
      return false;
    });
  };

  const deptData = useMemo(() => {
    return DEPARTMENT_DEFINITIONS.map((dept) => {
      const members = getDeptProfiles(dept, profiles);
      return {
        ...dept,
        members,
      };
    });
  }, [profiles]);

  return (
    <div>
      {pageTitle(
        Building2,
        "Org structure",
        "Departments",
        "Every department, its purpose, who it reports to and who's currently in it. Click through to that department's SOP."
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deptData.map((dept) => {
          const members = dept.members;
          const targetSopName = dept.shortName || dept.name;
          return (
            <Card
              key={dept.id}
              className="flex flex-col justify-between p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <Badge variant="outline">{members.length}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{dept.purpose}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Reports to:</span> {dept.reports_to}
                </p>
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Team members</p>
                  {members.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          title={`${m.full_name || m.email} — ${m.job_title || "Team Member"}`}
                          className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 py-1 pl-1 pr-3"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/15 text-[10px] font-medium text-primary">
                              {(m.full_name || m.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {m.full_name || m.email.split("@")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">No one assigned yet.</p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  to="/sops"
                  search={{ dept: targetSopName } as any}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  View SOP <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ PROFILE (self-service, single scroll) ============
export function ProfilePage() {
  const queryClient = useQueryClient();
  const { data } = useProfile();
  const profile = data?.profile;
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [prefs, setPrefs] = useState({ digest: true, logChat: true });
  const [declaration, setDeclaration] = useState<any>(null);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "", email: profile.email || "" });
  }, [profile?.id]);

  useEffect(() => {
    (async () => {
      const { data: rows } = await (supabase as any).from("employee_declarations").select("*").order("submitted_at", { ascending: false }).limit(1);
      setDeclaration(rows?.[0] ?? null);
    })();
  }, []);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const cleanEmail = form.email.trim().toLowerCase();
      const profileUpdate: any = { full_name: form.full_name, phone: form.phone || null };

      // If email changed, update it in both profiles table and Supabase auth
      const emailChanged = cleanEmail && cleanEmail !== profile!.email.toLowerCase();
      if (emailChanged) {
        profileUpdate.email = cleanEmail;
        const { error: authError } = await supabase.auth.updateUser({ email: cleanEmail });
        if (authError) throw new Error("Failed to update auth email: " + authError.message);
      }

      const { error } = await (supabase as any).from("profiles").update(profileUpdate).eq("id", profile!.id);
      if (error) throw error;

      return emailChanged;
    },
    onSuccess: (emailChanged) => {
      if (emailChanged) {
        toast.success("Profile updated — check your new email", {
          description: "A confirmation link has been sent to your new email address. Please confirm it to complete the change.",
        });
      } else {
        toast.success("Profile updated");
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (!passwordForm.currentPassword) {
        throw new Error("Please enter your current/temporary password.");
      }
      if (passwordForm.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long.");
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New password and confirm password do not match.");
      }
      if (passwordForm.currentPassword === passwordForm.newPassword) {
        throw new Error("New password must be different from your current temporary password.");
      }

      // Verify current password first
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile!.email,
        password: passwordForm.currentPassword,
      });
      if (verifyError) {
        throw new Error("Current password is incorrect.");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Password updated successfully!", {
        description: "Your corporate account password has been updated.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!profile) return <EmptyState title="Loading profile" description="One moment." />;

  return (
    <div>
      {pageTitle(User, "Workspace", "My Profile", "Everything about you in one scrollable panel — no tabs, no wizards.")}
      <div className="max-w-2xl space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary/15 text-lg text-primary">{(profile.full_name || profile.email).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            <div>
              <p className="text-lg font-semibold">{profile.full_name || "Portal user"}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {data?.isAdmin && <Badge className="mt-1"><ShieldCheck className="mr-1 h-3 w-3" /> Admin</Badge>}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Your details</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Work Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.co.za" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27…" /></div>
            <div><Label>Department</Label><Input value={profile.department || "Not set"} disabled /><p className="mt-1 text-xs text-muted-foreground">Changed by an admin.</p></div>
            <div><Label>Job title</Label><Input value={profile.job_title || "Not set"} disabled /></div>
          </div>
          <Button className="mt-4" disabled={saveProfile.isPending} onClick={() => saveProfile.mutate()}>Save changes</Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Change Password</h3>
              <p className="text-xs text-muted-foreground">
                Enter your current password, then set your new password.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePassword.mutate();
            }}
            className="mt-4 space-y-3.5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current Password *</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New Password *</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm-pw"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                !passwordForm.currentPassword ||
                passwordForm.newPassword.length < 8 ||
                passwordForm.confirmPassword.length < 8 ||
                changePassword.isPending
              }
              className="mt-1"
            >
              {changePassword.isPending ? "Updating password…" : "Update Password"}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Notification preferences</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border p-3"><span className="text-sm">Email digest</span><Switch checked={prefs.digest} onCheckedChange={(v) => setPrefs({ ...prefs, digest: v })} /></div>
            <div className="flex items-center justify-between rounded-md border border-border p-3"><span className="text-sm">Log chatbot conversations</span><Switch checked={prefs.logChat} onCheckedChange={(v) => setPrefs({ ...prefs, logChat: v })} /></div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Non-Solicitation / HR Declaration</h3>
          {declaration ? (
            <p className="mt-2 text-sm text-success flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Completed on {declaration.declaration_date}</p>
          ) : (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Not yet completed.</p>
              <Link to="/me/declaration"><Button size="sm">Complete now</Button></Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============ LEAVE ============
export function LeavePage() {
  const queryClient = useQueryClient();
  const { data: profileData } = useProfile();
  const { data = [] } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const { data: rows, error } = await (supabase as any).from("leave_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return rows ?? [];
    },
  });
  const [form, setForm] = useState({ start: "", end: "", reason: "" });
  const submit = useMutation({
    mutationFn: async () => {
      const userId = profileData?.user?.id;
      if (!userId) throw new Error("You must be signed in.");
      const { error } = await (supabase as any).from("leave_requests").insert({ user_id: userId, start_date: form.start, end_date: form.end, reason: form.reason, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Leave request submitted"); setForm({ start: "", end: "", reason: "" }); queryClient.invalidateQueries({ queryKey: ["leave-requests"] }); },
    onError: (error) => toast.error((error as Error).message),
  });
  return (
    <div className="space-y-6">
      {pageTitle(CalendarDays, "HR", "Leave Requests", "Submit and track your leave requests inside the portal.")}
      <Card className="p-5">
        <h2 className="font-semibold">New request</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div><Label>Start date</Label><Input type="date" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} /></div>
          <div><Label>End date</Label><Input type="date" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} /></div>
          <div className="md:col-span-3"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Family responsibility, annual leave, sick leave…" /></div>
        </div>
        <Button className="mt-4" disabled={!form.start || !form.end || !form.reason || submit.isPending} onClick={() => submit.mutate()}>Submit request</Button>
      </Card>
      <Card className="p-5">
        <h2 className="font-semibold">My requests</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Dates</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{data.map((row: any) => <TableRow key={row.id}><TableCell>{row.start_date} → {row.end_date}</TableCell><TableCell>{row.reason}</TableCell><TableCell><Badge variant="outline">{row.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ============ DECLARATION ============
export function DeclarationPage() {
  const queryClient = useQueryClient();
  const { data: profileData } = useProfile();
  const [ack, setAck] = useState(false);
  const [signature, setSignature] = useState("");
  const [outsideWork, setOutsideWork] = useState("");
  const { data: existing } = useQuery({
    queryKey: ["declaration"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("employee_declarations").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const submit = useMutation({
    mutationFn: async () => {
      const profile = profileData?.profile;
      const user = profileData?.user;
      if (!user) throw new Error("You must be signed in.");
      const { error } = await (supabase as any).from("employee_declarations").insert({
        user_id: user.id,
        company_name: "Mavis Strategic Partners",
        employee_name: profile?.full_name || user.email || signature,
        position: profile?.job_title || "Team Member",
        id_number: "N/A",
        declaration_date: new Date().toISOString().slice(0, 10),
        outside_employment_details: outsideWork || null,
        non_solicitation_months: 12,
        confidentiality_acknowledged: ack,
        signature_typed_name: signature,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("HR declaration submitted"); queryClient.invalidateQueries({ queryKey: ["declaration"] }); },
    onError: (error) => toast.error((error as Error).message),
  });
  return (
    <div className="space-y-6">
      {pageTitle(FileSignature, "HR", "HR Documents", "Sign the internal confidentiality and conflict declaration.")}
      {existing ? <Alert className="border-primary/20 bg-primary/5"><CheckCircle2 className="h-4 w-4" /><AlertTitle>Declaration submitted</AlertTitle><AlertDescription>Signed as {existing.signature_typed_name} on {existing.declaration_date}.</AlertDescription></Alert> : null}
      <Card className="p-5">
        <h2 className="font-semibold">Employee declaration</h2>
        <p className="mt-2 text-sm text-muted-foreground">I acknowledge confidentiality, non-solicitation and company information handling rules for Mavis Strategic Partners.</p>
        <div className="mt-4 space-y-4">
          <div><Label>Outside employment / conflict details</Label><Textarea value={outsideWork} onChange={(e) => setOutsideWork(e.target.value)} placeholder="Type none, or explain any outside work." /></div>
          <label className="flex items-start gap-3 text-sm"><Checkbox checked={ack} onCheckedChange={(value) => setAck(Boolean(value))} /><span>I understand and acknowledge the confidentiality declaration.</span></label>
          <div><Label>Typed signature</Label><Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your full name" /></div>
        </div>
        <Button className="mt-4" disabled={!ack || signature.length < 2 || submit.isPending || Boolean(existing)} onClick={() => submit.mutate()}><FileSignature className="mr-2 h-4 w-4" /> Submit declaration</Button>
      </Card>
    </div>
  );
}

// ============ TEAM MANAGEMENT (simplified inline actions) ============
type TeamRow = ProfileRow & { is_admin?: boolean };

export function TeamPage() {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const isAdmin = profileData?.isAdmin ?? false;

  const { data = [] } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        (supabase as any).from("profiles").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("*"),
      ]);
      const adminIds = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
      return (profiles ?? []).map((p: any) => ({ ...p, is_admin: adminIds.has(p.id) })) as TeamRow[];
    },
  });

  return (
    <div className="space-y-4">
      {pageTitle(Users, "Admin", "Team Management", "One table, one click. Add, edit, promote or deactivate — no wizards.")}
      {profileLoading ? null : isAdmin ? (
        <div className="flex justify-end"><Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add user</Button></div>
      ) : (
        <Alert className="border-primary/20 bg-primary/5">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Admins only</AlertTitle>
          <AlertDescription>Only administrators can add or manage portal users.</AlertDescription>
        </Alert>
      )}
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => <TeamRowActions key={row.id} row={row} onEdit={() => setEditing(row)} canManage={isAdmin} />)}
          </TableBody>
        </Table>
      </Card>

      {isAdmin && <AddUserDrawer open={addOpen} onOpenChange={setAddOpen} onCreated={() => queryClient.invalidateQueries({ queryKey: ["team"] })} />}
      <EditUserDrawer row={editing} onClose={() => setEditing(null)} onSaved={() => queryClient.invalidateQueries({ queryKey: ["team"] })} />
    </div>
  );
}

function TeamRowActions({ row, onEdit, canManage }: { row: TeamRow; onEdit: () => void; canManage: boolean }) {
  const queryClient = useQueryClient();
  const toggleAdmin = useMutation({
    mutationFn: () => setAdminRole({ data: { userId: row.id, makeAdmin: !row.is_admin } }),
    onSuccess: () => { toast.success(row.is_admin ? "Admin revoked" : "Admin granted"); queryClient.invalidateQueries({ queryKey: ["team"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const toggleActive = useMutation({
    mutationFn: () => updateTeamMember({ data: { userId: row.id, isActive: !row.is_active } }),
    onSuccess: () => { toast.success(row.is_active ? "User deactivated" : "User reactivated"); queryClient.invalidateQueries({ queryKey: ["team"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{row.full_name || "—"}</div>
        <div className="text-xs text-muted-foreground">{row.job_title || "Team member"}</div>
      </TableCell>
      <TableCell className="text-sm">{row.email}</TableCell>
      <TableCell className="text-sm">{row.department || "—"}</TableCell>
      <TableCell>
        <Badge variant={row.is_admin ? "default" : "outline"}>
          {row.is_admin ? "Admin" : row.department === "Intern" ? "Intern" : "Staff"}
        </Badge>
      </TableCell>
      <TableCell><Badge variant={row.is_active ? "default" : "outline"} className={row.is_active ? "" : "text-muted-foreground"}>{row.is_active ? "Active" : "Inactive"}</Badge></TableCell>
      <TableCell className="text-xs text-muted-foreground">{row.last_login_at ? new Date(row.last_login_at).toLocaleDateString() : "—"}</TableCell>
      <TableCell className="text-right">
        {canManage && <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}><Edit3 className="h-3.5 w-3.5" /></Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost"><ShieldCheck className="h-3.5 w-3.5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm">{row.is_admin ? "Revoke admin rights?" : "Grant admin rights?"}</p>
              <Button size="sm" className="mt-3 w-full" disabled={toggleAdmin.isPending} onClick={() => toggleAdmin.mutate()}>
                {row.is_admin ? "Revoke admin" : "Grant admin"}
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost"><UserX className="h-3.5 w-3.5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm">{row.is_active ? "Deactivate this user?" : "Reactivate this user?"}</p>
              <Button size="sm" className="mt-3 w-full" variant={row.is_active ? "destructive" : "default"} disabled={toggleActive.isPending} onClick={() => toggleActive.mutate()}>
                {row.is_active ? "Deactivate" : "Reactivate"}
              </Button>
            </PopoverContent>
          </Popover>
        </div>}
      </TableCell>
    </TableRow>
  );
}

function AddUserDrawer({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: "", fullName: "", department: "Sales Team", jobTitle: "", accessLevel: "staff" });
  const [password, setPassword] = useState("");
  const create = useMutation({
    mutationFn: () => createTeamMember({ data: { ...form, password: password || generateTempPassword(), role: "user" } }),
    onSuccess: () => {
      toast.success("Invite sent — user provisioned");
      onCreated();
      onOpenChange(false);
      setForm({ email: "", fullName: "", department: "Sales Team", jobTitle: "", accessLevel: "staff" });
      setPassword("");
    },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader><SheetTitle>Add user</SheetTitle><SheetDescription>One form. Fires the invite immediately.</SheetDescription></SheetHeader>
        <div className="mt-6 grid gap-3">
          <div><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Department</Label>
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Access level</Label>
            <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v, ...(v === "hr" ? { department: "Human Resources" } : {}) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
          <div><Label>Temporary password (optional)</Label><Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to auto-generate" /></div>
        </div>
        <Button className="mt-6 w-full" disabled={!form.email || !form.fullName || create.isPending} onClick={() => create.mutate()}>
          <Send className="mr-2 h-4 w-4" /> Send invite
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function generateTempPassword() {
  return "Msp" + Math.random().toString(36).slice(2, 10) + "!";
}

function EditUserDrawer({ row, onClose, onSaved }: { row: TeamRow | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ fullName: "", department: "", jobTitle: "", phone: "", isActive: true });
  useEffect(() => {
    if (row) setForm({ fullName: row.full_name || "", department: row.department || "", jobTitle: row.job_title || "", phone: row.phone || "", isActive: row.is_active });
  }, [row?.id]);
  const save = useMutation({
    mutationFn: () => updateTeamMember({ data: { userId: row!.id, fullName: form.fullName, department: form.department || null, jobTitle: form.jobTitle || null, phone: form.phone || null, isActive: form.isActive } }),
    onSuccess: () => { toast.success("User updated"); onSaved(); onClose(); },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader><SheetTitle>Edit user</SheetTitle><SheetDescription>{row?.email}</SheetDescription></SheetHeader>
        <div className="mt-6 grid gap-3">
          <div><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><Label>Department</Label>
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="flex items-center justify-between rounded-md border border-border p-3"><span className="text-sm">Active</span><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /></div>
        </div>
        <Button className="mt-6 w-full" disabled={save.isPending} onClick={() => save.mutate()}>Save</Button>
      </SheetContent>
    </Sheet>
  );
}

// ============ AUDIT ============
export function AuditPage() {
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const isSuperOrAdmin = (profileData?.isAdmin || profileData?.isRootAdmin) && !profileData?.isFinance;

  const { data = [] } = useQuery({
    queryKey: ["audit-logs"],
    enabled: !!isSuperOrAdmin,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
  });

  if (!profileLoading && !isSuperOrAdmin) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          Audit Logs are restricted to the Chief Executive Officer and System Administrator. The Finance & Administration role is not authorized to view system audit events.
        </p>
      </div>
    );
  }

  return (
    <div>
      {pageTitle(ShieldCheck, "Admin", "Audit Logs", "System events and admin actions recorded for accountability.")}
      <Card className="p-5">
        {data.length ? <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Details</TableHead></TableRow></TableHeader><TableBody>{data.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.created_at).toLocaleString()}</TableCell><TableCell>{row.action}</TableCell><TableCell>{row.target_id || "—"}</TableCell><TableCell className="max-w-xs truncate">{JSON.stringify(row.details ?? {})}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState title="No audit logs yet" description="Admin actions will appear here as the portal is used." />}
      </Card>
    </div>
  );
}

// ============ SALES PLAYBOOK ============
export function SalesPlaybookPage() {
  const services = useTable<Service>("services", "services").data ?? [];
  return (
    <div className="space-y-6">
      {pageTitle(ClipboardList, "Admin", "Sales Playbook", "Approved talk tracks, qualification rules and objection answers for MSP sales calls.")}
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5"><h2 className="font-semibold">Qualification criteria</h2><BulletList items={["Budget", "Intent", "Authority", "Timeline", "Need at least 3 of 4 before proposal"]} /></Card>
        <Card className="p-5"><h2 className="font-semibold">Proposal structure</h2><BulletList items={["Problem", "Strategy", "Platforms", "Deliverables", "Pricing", "Outcomes", "Clear CTA"]} /></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {FAQS.map((faq) => <Card key={faq.q} className="p-5"><h2 className="font-semibold">{faq.q}</h2><p className="mt-2 text-sm text-muted-foreground">{faq.a}</p></Card>)}
      </div>
      <Card className="p-5"><h2 className="font-semibold">Service pitch shortcuts</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{services.map((service) => <Link key={service.id} to="/services" className="rounded-md border border-border p-3 transition hover:border-primary/40"><p className="text-sm font-medium">{service.name}</p><p className="text-xs text-muted-foreground">{service.tagline}</p></Link>)}</div></Card>
    </div>
  );
}

// ============ KPIS ============
export function KpisPage() {
  const metrics = [
    ["Client retention", 90, "Target 90%+"],
    ["On-time reports", 100, "Due by 7th"],
    ["Lead response", 86, "Under 10 min"],
    ["SOP compliance", 94, "Weekly audit"],
  ] as const;
  return (
    <div>
      {pageTitle(BarChart3, "Admin", "KPI Dashboards", "A lightweight operating scorecard until live BI dashboards are connected.")}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([name, value, note]) => <Card key={name} className="p-5"><Gauge className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{name}</p><p className="text-3xl font-bold">{value}%</p><Progress className="mt-3" value={value} /><p className="mt-2 text-xs text-muted-foreground">{note}</p></Card>)}
      </div>
    </div>
  );
}

// ============ CONTENT EDITOR ============
export function ContentEditorPage() {
  return <ContentEditor />;
}


// ============ MSP AI ASSISTANT ============
export function MspChatPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  type ChatMsg = { from: "msp" | "you"; text: string };
  const initial: ChatMsg[] = [
    { from: "msp", text: "Hi, I'm Msp — the Mavis Strategic Partners assistant. Ask about SOPs, services, pricing, tools or the client roadmap." },
  ];
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const shortcuts = useMemo(() => ["What's included in Growth Pro?", "How fast should I contact a new lead?", "Where do monthly reports live?", "What tools do we use?"], []);
  const { data: profileData } = useProfile();

  async function send(value = input) {
    const question = value.trim();
    if (!question || pending) return;
    const next: ChatMsg[] = [...messages, { from: "you" as const, text: question }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const payload = next.map((m) => ({ role: (m.from === "you" ? "user" : "assistant") as "user" | "assistant", content: m.text }));
      const { askMsp } = await import("@/lib/msp.functions");
      const result = await askMsp({ data: { messages: payload } });
      setMessages((items) => [...items, { from: "msp" as const, text: result.text }]);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Msp is unavailable right now. Try again in a moment.";
      setMessages((items) => [...items, { from: "msp" as const, text: `Sorry — ${msg}` }]);
    } finally {
      setPending(false);
    }
  }
  function reset() {
    setMessages(initial);
    setInput("");
    toast.success("Started a fresh Msp chat.");
  }
  async function endChat() {
    if (profileData?.user && messages.length > 1) {
      try {
        const transcript = messages.map((m) => `${m.from}: ${m.text}`).join("\n");
        await (supabase as any).from("chat_logs").insert({ user_id: profileData.user.id, role: "transcript", content: transcript });
        toast.success("Chat transcript saved.");
      } catch { toast.info("Chat ended."); }
    }
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden border-border/80 p-0 shadow-2xl">
        <DialogHeader>
          <div className="border-b border-border bg-secondary/30 px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <DialogTitle className="flex items-center gap-2 text-base">Msp Assistant <Badge variant="outline" className="gap-1 border-success/30 text-[10px] font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Online</Badge></DialogTitle>
                  <DialogDescription className="mt-0.5 text-xs">Your internal guide to MSP workflows, tools, services and SOPs.</DialogDescription>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={reset} title="Reset conversation" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[min(46vh,420px)] min-h-64 space-y-4 overflow-y-auto bg-background/60 px-5 py-5 sm:px-6">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-end gap-2.5", message.from === "you" && "justify-end")}>
              {message.from === "msp" && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Bot className="h-4 w-4" /></div>}
              <div className={cn("max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm", message.from === "you" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground")}>{message.text}</div>
            </div>
          ))}
          {pending && <div className="flex items-end gap-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Bot className="h-4 w-4" /></div><div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></span></div></div>}
        </div>
        <div className="space-y-3 border-t border-border bg-secondary/20 px-5 py-4 sm:px-6">
          {messages.length === 1 && <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Suggested prompts</p><div className="flex flex-wrap gap-2">{shortcuts.map((shortcut) => <Button key={shortcut} variant="outline" size="sm" className="h-8 rounded-full bg-background text-xs" disabled={pending} onClick={() => send(shortcut)}>{shortcut}</Button>)}</div></div>}
          <form className="flex items-center gap-2 rounded-xl border border-input bg-background p-1.5 shadow-sm" onSubmit={(event) => { event.preventDefault(); send(); }}>
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask Msp anything about the portal…" disabled={pending} className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button type="submit" size="icon" disabled={pending || !input.trim()} className="h-9 w-9 shrink-0 rounded-lg"><Send className="h-4 w-4" /></Button>
          </form>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">Msp uses approved MSP knowledge and may need confirmation for sensitive decisions.</p>
            <Button type="button" variant="ghost" size="sm" onClick={endChat} className="shrink-0 text-xs text-muted-foreground hover:text-destructive"><PowerOff className="mr-1.5 h-3.5 w-3.5" /> End chat &amp; save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: notifData } = useStaffNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <div>
              <DialogTitle className="text-base font-bold">Staff Notifications</DialogTitle>
              <DialogDescription className="text-xs">
                Assignments, deadline alerts, dependency responses & reviews.
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                className="text-[11px] h-7 text-primary font-semibold"
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs transition space-y-1 ${
                  !n.read ? "bg-primary/5 border-primary/30" : "bg-card border-border opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    {n.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground">{n.message}</p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => markReadMutation.mutate({ id: n.id, read: !n.read })}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    {n.read ? "Mark unread" : "Mark as read"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HelpPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Help</DialogTitle><DialogDescription>Fast paths for common portal actions.</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <Link to="/sops" onClick={() => onOpenChange(false)} className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary/40"><span><BookOpen className="mr-2 inline h-4 w-4 text-primary" />Read SOPs</span><ChevronRight className="h-4 w-4" /></Link>
          <Link to="/admin/team" onClick={() => onOpenChange(false)} className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary/40"><span><Users className="mr-2 inline h-4 w-4 text-primary" />Add team member</span><ChevronRight className="h-4 w-4" /></Link>
          <button onClick={() => { onOpenChange(false); window.dispatchEvent(new Event("msp:open")); }} className="flex items-center justify-between rounded-md border border-border p-3 text-left text-sm hover:border-primary/40"><span><MessageCircle className="mr-2 inline h-4 w-4 text-primary" />Ask Msp</span><ChevronRight className="h-4 w-4" /></button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PortalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: profileData } = useProfile();
  const isSuperOrAdmin = (profileData?.isAdmin || profileData?.isRootAdmin) && !profileData?.isFinance;

  const items: readonly (readonly [string, string, ComponentType<{ className?: string }>])[] = [
    ["Dashboard", "/home", Compass], ["Who We Are", "/who-we-are", Compass], ["Services", "/services", Briefcase],
    ["Pricing", "/pricing", Tag], ["Glossary", "/glossary", ListTree], ["SOP Library", "/sops", BookOpen],
    ["Roadmap", "/roadmap", MapIcon], ["Tools", "/tools", Wrench], ["Departments", "/departments", Building2],
    ["My Profile", "/me/profile", User], ["Leave Requests", "/me/leave", CalendarDays], ["HR Documents", "/me/declaration", FileSignature],
    ["Team Management", "/admin/team", Users],
    ...(isSuperOrAdmin ? [["Audit Logs", "/admin/audit", ShieldCheck] as const] : []),
    ["Sales Playbook", "/admin/sales-playbook", ClipboardList], ["KPI Dashboards", "/admin/kpis", BarChart3],
    ["Content Editor", "/admin/content", Edit3],
    ["Monthly Reports", "/reports", FileBarChart2],
  ];
  const [query, setQuery] = useState("");
  const filtered = items.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Search portal</DialogTitle><DialogDescription>Jump to any working portal page.</DialogDescription></DialogHeader>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input autoFocus className="pl-9" placeholder="Search pages…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {filtered.map(([label, to, IconComponent]) => <Link key={to} to={to as any} onClick={() => onOpenChange(false)} className="flex items-center gap-3 rounded-md p-3 text-sm hover:bg-secondary"><IconComponent className="h-4 w-4 text-primary" />{label}<ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" /></Link>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [compact, setCompact] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Portal settings</DialogTitle><DialogDescription>Local display preferences for this device.</DialogDescription></DialogHeader>
        <div className="flex items-center justify-between rounded-md border border-border p-3"><div><p className="text-sm font-medium">Compact mode</p><p className="text-xs text-muted-foreground">Tighten spacing for denser review.</p></div><Switch checked={compact} onCheckedChange={setCompact} /></div>
        <div className="grid gap-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@msp.co.za</p><p className="flex items-center gap-2"><Phone className="h-4 w-4" /> Company contact details can be added by admins.</p><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Invite-only internal portal.</p></div>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewPage() {
  const pages = ["Dashboard", "Who We Are", "Services", "Pricing", "Glossary", "SOPs", "Roadmap", "Tools", "Departments", "Profile", "Leave", "HR Documents", "Team", "Audit", "Sales Playbook", "KPIs", "Content Editor", "Msp Chat"];
  return (
    <div>
      {pageTitle(ClipboardCheck, "Portal review", "Portal Functionality Review", "A quick checklist of what is now wired and working.")}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => <Card key={page} className="flex items-center gap-3 p-4"><CheckCircle2 className="h-5 w-5 text-primary" /><span className="text-sm font-medium">{page}</span></Card>)}
      </div>
    </div>
  );
}

// ============ MONTHLY REPORTS ============
type Client = { id: string; name: string; industry: string | null; active_package: string | null; contact_name: string | null; contact_email: string | null };
type MonthlyReport = { id: string; client_id: string; report_type: "growth_strategy" | "ads_performance" | "seo_gbp" | "website_spec"; title: string; reporting_month: string; reporting_period_start: string | null; reporting_period_end: string | null; prepared_by_name: string | null; status: "draft" | "internal_review" | "sent_to_client"; data: any; created_at: string };

const REPORT_TYPE_LABEL: Record<MonthlyReport["report_type"], string> = {
  growth_strategy: "Growth Strategy / Content Audit",
  ads_performance: "Ads Performance",
  seo_gbp: "SEO & Google Business Profile",
  website_spec: "Website Development Spec",
};

const STATUS_LABEL: Record<MonthlyReport["status"], string> = {
  draft: "Draft",
  internal_review: "Internal Review",
  sent_to_client: "Sent to Client",
};

export function MonthlyReportsPage() {
  const { data: profileData } = useProfile();
  const canEdit = profileData?.isManagerOrAbove ?? false;
  const [selectedClient, setSelectedClient] = useState<string | "all">("all");
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("clients").select("*").order("name");
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["monthly_reports"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("monthly_reports").select("*").order("reporting_month", { ascending: false });
      if (error) throw error;
      return data as MonthlyReport[];
    },
  });

  const filteredReports = selectedClient === "all" ? reports : reports.filter((r) => r.client_id === selectedClient);
  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  return (
    <div>
      {pageTitle(FileBarChart2, "Client Delivery", "Monthly Reports", canEdit ? "Create, review and export monthly client reports across all four report types." : "Read-only view of live client reports — a learning window into how we present results.")}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label className="mb-1 text-xs">Filter by client</Label>
          <Select value={selectedClient} onValueChange={(v) => setSelectedClient(v as any)}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {canEdit && <Button className="ml-auto" disabled title="Report authoring UI coming next"><Plus className="mr-1 h-4 w-4" /> New report</Button>}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => {
          const rc = reports.filter((r) => r.client_id === c.id);
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
                <Badge variant="outline">{rc.length} report{rc.length === 1 ? "" : "s"}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Package:</span> {c.active_package || "—"}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Contact:</span> {c.contact_email || "—"}</p>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Prepared by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>{clientMap.get(r.client_id)?.name || "—"}</TableCell>
                <TableCell><Badge variant="outline">{REPORT_TYPE_LABEL[r.report_type]}</Badge></TableCell>
                <TableCell>{format(parseISO(r.reporting_month), "MMM yyyy")}</TableCell>
                <TableCell>{r.prepared_by_name || "—"}</TableCell>
                <TableCell><Badge className={cn(r.status === "sent_to_client" && "bg-success/20 text-success", r.status === "internal_review" && "bg-warning/20 text-warning", r.status === "draft" && "bg-muted text-muted-foreground")}>{STATUS_LABEL[r.status]}</Badge></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setSelectedReport(r)}>Open <ChevronRight className="ml-1 h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {filteredReports.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No reports yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedReport && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedReport.title}</SheetTitle>
                <SheetDescription>
                  {clientMap.get(selectedReport.client_id)?.name} · {REPORT_TYPE_LABEL[selectedReport.report_type]} · {format(parseISO(selectedReport.reporting_month), "MMMM yyyy")} · {STATUS_LABEL[selectedReport.status]}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ReportBody report={selectedReport} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
      <div className="text-sm text-foreground">{children}</div>
    </section>
  );
}

function ReportBody({ report }: { report: MonthlyReport }) {
  const d = report.data || {};
  const attachment = d.pdf_url ? (
    <Section title="Attached document">
      <a
        href={d.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        <FileBarChart2 className="h-4 w-4 text-primary" />
        {d.pdf_name || "Download full report (PDF)"}
      </a>
    </Section>
  ) : null;
  if (report.report_type === "growth_strategy") {
    return (
      <div>
        {attachment}
        {d.introduction && <Section title="Introduction"><p>{d.introduction}</p></Section>}
        {d.doing_well && <Section title="What we're doing well"><ul className="list-disc pl-5 space-y-1">{d.doing_well.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></Section>}
        {d.missing_opportunities && <Section title="Where we're missing opportunities"><ul className="list-disc pl-5 space-y-1">{d.missing_opportunities.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></Section>}
        {d.market_context && <Section title="Market context"><p>{d.market_context}</p></Section>}
        {d.roadmap && <Section title="Strategic roadmap">{d.roadmap.map((p: any, i: number) => (
          <div key={i} className="mb-3">
            <p className="font-semibold">{p.title}</p>
            <ul className="list-disc pl-5">{p.actions.map((a: string, j: number) => <li key={j}>{a}</li>)}</ul>
          </div>
        ))}</Section>}
        {d.next_steps && <Section title="Next steps"><ol className="list-decimal pl-5 space-y-1">{d.next_steps.map((x: string, i: number) => <li key={i}>{x}</li>)}</ol></Section>}
      </div>
    );
  }
  if (report.report_type === "ads_performance") {
    return (
      <div>
        {attachment}
        {d.executive_summary && <Section title="Executive summary"><p>{d.executive_summary}</p></Section>}
        {d.campaigns && <Section title="Campaigns">
          <Table><TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Spend</TableHead><TableHead>Leads</TableHead><TableHead>CPL</TableHead><TableHead>Impr.</TableHead><TableHead>CTR</TableHead></TableRow></TableHeader>
            <TableBody>{d.campaigns.map((c: any, i: number) => <TableRow key={i}><TableCell>{c.name}</TableCell><TableCell>R{c.spend}</TableCell><TableCell>{c.leads}</TableCell><TableCell>R{c.cpl}</TableCell><TableCell>{c.impressions.toLocaleString()}</TableCell><TableCell>{c.ctr}%</TableCell></TableRow>)}</TableBody></Table>
        </Section>}
        {d.ad_sets && <Section title="Ad set breakdown">
          <Table><TableHeader><TableRow><TableHead>Ad set</TableHead><TableHead>Spend</TableHead><TableHead>Leads</TableHead><TableHead>CPL</TableHead><TableHead>CTR</TableHead></TableRow></TableHeader>
            <TableBody>{d.ad_sets.map((c: any, i: number) => <TableRow key={i}><TableCell>{c.name}</TableCell><TableCell>R{c.spend}</TableCell><TableCell>{c.leads}</TableCell><TableCell>R{c.cpl}</TableCell><TableCell>{c.ctr}%</TableCell></TableRow>)}</TableBody></Table>
        </Section>}
        {d.platform_split && <Section title="Platform split"><p>Facebook: {d.platform_split.facebook_impressions_pct}% impressions / {d.platform_split.facebook_leads} leads · CPM R{d.platform_split.facebook_cpm}</p><p>Instagram: {d.platform_split.instagram_impressions_pct}% impressions / {d.platform_split.instagram_leads} leads · CPM R{d.platform_split.instagram_cpm}</p></Section>}
        {d.device_split && <Section title="Device split"><ul className="list-disc pl-5">{d.device_split.map((x: any, i: number) => <li key={i}>{x.device}: {x.impressions.toLocaleString()} impressions, {x.leads} leads</li>)}</ul></Section>}
        {d.demographics && <Section title="Demographics"><div className="grid gap-4 md:grid-cols-2">
          <div><p className="font-medium">Gender</p><ul className="list-disc pl-5">{d.demographics.gender.map((x: any, i: number) => <li key={i}>{x.label}: {x.leads} leads @ R{x.cpl} CPL ({x.impressions_pct}% impressions)</li>)}</ul></div>
          <div><p className="font-medium">Age</p><ul className="list-disc pl-5">{d.demographics.age.map((x: any, i: number) => <li key={i}>{x.bracket}: {x.leads} leads @ R{x.cpl} CPL</li>)}</ul></div>
        </div></Section>}
        {d.recommendations && <Section title="Recommendations"><p className="whitespace-pre-line">{d.recommendations}</p></Section>}
      </div>
    );
  }
  if (report.report_type === "seo_gbp") {
    return (
      <div>
        {attachment}
        {d.executive_summary && <Section title="Executive summary"><p>{d.executive_summary}</p></Section>}
        {d.business_overview && <Section title="Client business overview"><p>{d.business_overview}</p></Section>}
        {d.gbp_actions && <Section title="GBP actions completed"><ul className="list-disc pl-5">{d.gbp_actions.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></Section>}
        {d.gbp_metrics && <Section title="GBP performance"><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{Object.entries(d.gbp_metrics).map(([k, v]) => <Card key={k} className="p-3"><p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p><p className="text-2xl font-bold text-primary">{String(v)}</p></Card>)}</div></Section>}
        {d.keywords && <Section title="Keyword research">{Object.entries(d.keywords).map(([group, kws]: any) => (
          <div key={group} className="mb-2"><p className="text-sm font-medium capitalize">{group.replace(/_/g, " ")}</p><div className="mt-1 flex flex-wrap gap-1.5">{(kws as string[]).map((k) => <Badge key={k} variant="outline">{k}</Badge>)}</div></div>
        ))}</Section>}
        {d.visibility_check && <Section title="Manual visibility check"><p>{d.visibility_check}</p></Section>}
        {d.issues_identified && <Section title="Issues identified"><ul className="list-disc pl-5">{d.issues_identified.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></Section>}
        {d.next_actions && <Section title="Next actions">{Object.entries(d.next_actions).map(([g, list]: any) => (
          <div key={g} className="mb-2"><p className="text-sm font-medium capitalize">{g.replace(/_/g, " ")}</p><ul className="list-disc pl-5">{(list as string[]).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        ))}</Section>}
        {d.final_summary && <Section title="Final summary"><p>{d.final_summary}</p></Section>}
      </div>
    );
  }
  if (report.report_type === "website_spec") {
    return (
      <div>
        {attachment}
        {d.website_type && <Section title="Website type"><p>{d.website_type}</p></Section>}
        {d.primary_objective && <Section title="Primary objective"><p>{d.primary_objective}</p></Section>}
        {d.navigation && <Section title="Navigation"><div className="flex flex-wrap gap-1.5">{d.navigation.map((n: string) => <Badge key={n} variant="outline">{n}</Badge>)}</div></Section>}
        {d.pages && <Section title="Pages">{d.pages.map((p: any, i: number) => (
          <div key={i} className="mb-4 rounded-md border border-border p-3">
            <p className="font-semibold">{p.name} <span className="text-xs text-muted-foreground">— H1: {p.h1}</span></p>
            <p className="mt-1 text-sm">{p.body}</p>
            {p.ctas?.length ? <p className="mt-2 text-xs"><span className="font-medium">CTAs:</span> {p.ctas.join(" · ")}</p> : null}
            {p.sections?.length ? <ul className="mt-2 list-disc pl-5 text-sm">{p.sections.map((s: any, j: number) => <li key={j}><span className="font-medium">{s.label}:</span> {s.body}</li>)}</ul> : null}
          </div>
        ))}</Section>}
        {d.technical_seo && <Section title="Technical SEO"><ul className="grid grid-cols-2 gap-1">{Object.entries(d.technical_seo).map(([k, v]) => <li key={k} className="flex items-center gap-2 text-sm"><CheckCircle2 className={cn("h-4 w-4", v ? "text-success" : "text-muted-foreground")} />{k.replace(/_/g, " ")}</li>)}</ul></Section>}
        {d.url_structure && <Section title="URL structure"><ul className="grid grid-cols-2 gap-1 font-mono text-xs">{d.url_structure.map((u: string) => <li key={u}>{u}</li>)}</ul></Section>}
      </div>
    );
  }
  return <pre className="text-xs">{JSON.stringify(d, null, 2)}</pre>;
}
