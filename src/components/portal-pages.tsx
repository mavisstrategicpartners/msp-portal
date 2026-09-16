import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, ArrowRight, BarChart3, BookOpen, Bot, Briefcase, Building2, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, Clock, Compass, Edit3, ExternalLink,
  FileSignature, Gauge, ListTree, Lock, Mail, Map as MapIcon, MessageCircle, Phone, Plus, Search, Send,
  ShieldCheck, Sparkles, Tag, Target, User, UserX, Users, Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { RotateCcw, PowerOff, FileBarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createTeamMember, setAdminRole, updateTeamMember } from "@/lib/admin.functions";
import { useProfile } from "@/lib/use-profile";
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

const DEPARTMENTS = [
  "CEO", "Managing Director", "Operations Manager", "Client Relationship Manager",
  "Sales Team", "Social Media Manager", "Admin Department", "Human Resources",
  "Graphics Team", "Marketing Team", "IT Department", "Intern",
];

const DEPARTMENT_META: Record<string, { purpose: string; reports_to: string; sop_slug?: string }> = {
  "CEO": { purpose: "Sets vision, direction and final approvals across the company.", reports_to: "The board / founder" },
  "Managing Director": { purpose: "Owns day-to-day execution against the CEO's strategy.", reports_to: "CEO" },
  "Operations Manager": { purpose: "Runs delivery, workflows and cross-team coordination.", reports_to: "Managing Director" },
  "Client Relationship Manager": { purpose: "Owns client retention, communication and reporting rhythm.", reports_to: "Operations Manager" },
  "Sales Team": { purpose: "Books, qualifies and closes new business.", reports_to: "Managing Director" },
  "Social Media Manager": { purpose: "Plans, produces and publishes client social content.", reports_to: "Operations Manager" },
  "Admin Department": { purpose: "Invoicing, finance, HR admin and internal systems.", reports_to: "Managing Director" },
  "Human Resources": { purpose: "People, culture, leave, declarations and onboarding.", reports_to: "Managing Director" },
  "Graphics Team": { purpose: "Designs all client and internal visual assets — social graphics, ad creatives, presentation materials.", reports_to: "Operations Manager" },
  "Marketing Team": { purpose: "Owns MSP's own brand marketing, lead generation, and market positioning — separate from client campaign work.", reports_to: "Managing Director" },
  "IT Department": { purpose: "Manages internal tools, portal infrastructure, hosting, domains, and technical support for the team.", reports_to: "Operations Manager" },
  "Intern": { purpose: "Learning across departments and supporting live delivery.", reports_to: "Assigned mentor / Operations Manager" },
};

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
  const filtered = department === "all" ? data : data.filter((sop) => sop.department === department);
  return (
    <div>
      {pageTitle(BookOpen, "How we work", "SOP Library", "Department roles, reporting lines, KPIs, operating rhythms and key procedures from the master portal document.")}
      <div className="mb-4 max-w-xs">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <EmptyState title="Loading SOPs" description="Pulling the latest SOP library." /> : (
        <div className="space-y-4">
          {filtered.map((sop) => (
            <Card key={sop.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge variant="outline">{sop.department}</Badge>
                  <h2 className="mt-3 text-xl font-semibold">{sop.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{sop.role_purpose}</p>
                </div>
                <div className="text-sm text-muted-foreground md:text-right">
                  <p><span className="text-foreground">Reports to:</span> {sop.reports_to || "—"}</p>
                  <p><span className="text-foreground">Tools:</span> {sop.primary_tools || "—"}</p>
                </div>
              </div>
              <Tabs defaultValue="responsibilities" className="mt-5">
                <TabsList className="flex h-auto flex-wrap justify-start">
                  <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                  <TabsTrigger value="rhythm">Rhythm</TabsTrigger>
                  <TabsTrigger value="sops">Key SOPs</TabsTrigger>
                  <TabsTrigger value="kpis">KPIs</TabsTrigger>
                </TabsList>
                <TabsContent value="responsibilities"><BulletList items={splitText(sop.core_responsibilities)} fallback={sop.core_responsibilities} /></TabsContent>
                <TabsContent value="rhythm"><p className="text-sm leading-6 text-muted-foreground">{sop.daily_weekly_monthly}</p></TabsContent>
                <TabsContent value="sops"><p className="text-sm leading-6 text-muted-foreground">{sop.key_sops}</p></TabsContent>
                <TabsContent value="kpis"><BulletList items={splitText(sop.kpis)} fallback={sop.kpis} /></TabsContent>
              </Tabs>
            </Card>
          ))}
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
  const { data = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("*");
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });
  const byDept = useMemo(() => {
    const map = new Map<string, ProfileRow[]>();
    for (const p of data) {
      const d = p.department || "Unassigned";
      const list = map.get(d) ?? [];
      list.push(p);
      map.set(d, list);
    }
    return map;
  }, [data]);

  return (
    <div>
      {pageTitle(Building2, "Org structure", "Departments", "Every department, its purpose, who it reports to and who's currently in it. Click through to that department's SOP.")}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DEPARTMENTS.map((dept) => {
          const meta = DEPARTMENT_META[dept];
          const members = byDept.get(dept) ?? [];
          return (
            <Card key={dept} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold">{dept}</h3>
                <Badge variant="outline">{members.length}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{meta?.purpose}</p>
              <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Reports to:</span> {meta?.reports_to}</p>
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">Team members</p>
                {members.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 py-1 pl-1 pr-3">
                        <Avatar className="h-6 w-6"><AvatarFallback className="bg-primary/15 text-[10px] text-primary">{dept === "CEO" ? "EX" : (m.full_name || m.email).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="text-xs">{dept === "CEO" ? "Executive team" : m.full_name || m.email.split("@")[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-2 text-xs italic text-muted-foreground">No one assigned yet.</p>}
              </div>
              <Link to="/sops" className="mt-4 inline-flex text-sm text-primary hover:underline">View SOP <ChevronRight className="h-4 w-4" /></Link>
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
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [password, setPassword] = useState("");
  const [prefs, setPrefs] = useState({ digest: true, logChat: true });
  const [declaration, setDeclaration] = useState<any>(null);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "" });
  }, [profile?.id]);

  useEffect(() => {
    (async () => {
      const { data: rows } = await (supabase as any).from("employee_declarations").select("*").order("submitted_at", { ascending: false }).limit(1);
      setDeclaration(rows?.[0] ?? null);
    })();
  }, []);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("profiles").update({ full_name: form.full_name, phone: form.phone || null }).eq("id", profile!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); queryClient.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Password updated"); setPassword(""); },
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
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27…" /></div>
            <div><Label>Department</Label><Input value={profile.department || "Not set"} disabled /><p className="mt-1 text-xs text-muted-foreground">Changed by an admin.</p></div>
            <div><Label>Job title</Label><Input value={profile.job_title || "Not set"} disabled /></div>
          </div>
          <Button className="mt-4" disabled={saveProfile.isPending} onClick={() => saveProfile.mutate()}>Save changes</Button>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Password</h3>
          <div className="mt-3 flex gap-2">
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button disabled={password.length < 8 || changePassword.isPending} onClick={() => changePassword.mutate()}>Update</Button>
          </div>
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
  const { data = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
  });
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
  const [table, setTable] = useState("services");
  return (
    <div className="space-y-6">
      {pageTitle(Edit3, "Admin", "Content Editor", "Review portal content tables — quick verify before publishing SOP or pricing changes.")}
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-semibold">Content status</h2><p className="text-sm text-muted-foreground">Every content table used in the portal.</p></div>
          <Select value={table} onValueChange={setTable}><SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger><SelectContent>{CONTENT_TABLES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        </div>
        <ContentPreview table={table} />
      </Card>
    </div>
  );
}

function ContentPreview({ table }: { table: string }) {
  const { data = [] } = useQuery({
    queryKey: ["content-preview", table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
  return <pre className="mt-4 max-h-96 overflow-auto rounded-md border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Notifications</DialogTitle><DialogDescription>Portal alerts and reminders.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          {["Monthly reports are due by the 7th.", "New users must be added by an admin only.", "Use Msp for SOP and pricing questions."].map((item) => <div key={item} className="flex gap-3 rounded-md border border-border p-3 text-sm"><Clock className="mt-0.5 h-4 w-4 text-primary" />{item}</div>)}
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
  const items = [
    ["Dashboard", "/home", Compass], ["Who We Are", "/who-we-are", Compass], ["Services", "/services", Briefcase],
    ["Pricing", "/pricing", Tag], ["Glossary", "/glossary", ListTree], ["SOP Library", "/sops", BookOpen],
    ["Roadmap", "/roadmap", MapIcon], ["Tools", "/tools", Wrench], ["Departments", "/departments", Building2],
    ["My Profile", "/me/profile", User], ["Leave Requests", "/me/leave", CalendarDays], ["HR Documents", "/me/declaration", FileSignature],
    ["Team Management", "/admin/team", Users], ["Audit Logs", "/admin/audit", ShieldCheck],
    ["Sales Playbook", "/admin/sales-playbook", ClipboardList], ["KPI Dashboards", "/admin/kpis", BarChart3],
    ["Content Editor", "/admin/content", Edit3],
    ["Monthly Reports", "/reports", FileBarChart2],
  ] as const;
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
