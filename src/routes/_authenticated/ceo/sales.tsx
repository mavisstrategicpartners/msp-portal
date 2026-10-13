import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  UserCheck,
  Target,
  Mail,
  ChevronRight,
  ExternalLink,
  Users,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export const Route = createFileRoute("/_authenticated/ceo/sales")({
  head: () => ({ meta: [{ title: "Sales Health — CEO Command Centre" }] }),
  component: SalesHealthPage,
});

interface SalesOpportunity {
  id: string;
  leadName: string;
  industry: string;
  package: string;
  value: number;
  stage: "won" | "negotiation" | "proposal_sent" | "discovery" | "overdue_touch";
  probability: number;
  salesRep: string;
  lastContact: string;
  nextAction: string;
  competitorRisk: string;
  notes: string;
}

const SALES_OPPORTUNITIES: SalesOpportunity[] = [
  {
    id: "opp-1",
    leadName: "TechNova Solutions",
    industry: "Enterprise SaaS",
    package: "GHL AI Automation + Full Retainer",
    value: 140000,
    stage: "won",
    probability: 100,
    salesRep: "Sarah Jenkins",
    lastContact: "Today, 10:00 SAST",
    nextAction: "Operations Handover pack signed; invoice cleared",
    competitorRisk: "None (Direct referral)",
    notes: "Contract signed for 6-month minimum commitment.",
  },
  {
    id: "opp-2",
    leadName: "Omega Corp",
    industry: "Financial Services",
    package: "Paid Ads (Meta/Google) + Funnel",
    value: 45000,
    stage: "overdue_touch",
    probability: 40,
    salesRep: "Sarah Jenkins",
    lastContact: "3 days ago",
    nextAction: "CFO follow-up call overdue by 24h",
    competitorRisk: "Competitor agency pitch mentioned by CFO",
    notes: "Proposal delivered Oct 3. Needs senior executive re-engagement.",
  },
  {
    id: "opp-3",
    leadName: "Apex Solar SA (Expansion)",
    industry: "Renewable Energy",
    package: "WhatsApp Automation Add-on",
    value: 45000,
    stage: "won",
    probability: 100,
    salesRep: "Sarah Jenkins",
    lastContact: "Yesterday, 14:00 SAST",
    nextAction: "Go-live scheduled with Tech Delivery",
    competitorRisk: "None (Upsell)",
    notes: "Client expanded initial contract to cover nationwide branch routing.",
  },
  {
    id: "opp-4",
    leadName: "Global Logistics Network",
    industry: "Supply Chain",
    package: "CRM Architecture & Custom Workflows",
    value: 65000,
    stage: "discovery",
    probability: 25,
    salesRep: "Unassigned (Queue)",
    lastContact: "4 days ago",
    nextAction: "Assign dedicated sales consultant immediately",
    competitorRisk: "Unknown",
    notes: "Inbound inquiry through website. Sitting unassigned in intake.",
  },
  {
    id: "opp-5",
    leadName: "BluePeak Capital",
    industry: "Asset Management",
    package: "Executive Brand & Authority Site",
    value: 95000,
    stage: "negotiation",
    probability: 75,
    salesRep: "Sarah Jenkins",
    lastContact: "Oct 7, 15:30 SAST",
    nextAction: "Contract review with general counsel scheduled Oct 9",
    competitorRisk: "Low",
    notes: "Pricing terms agreed in principle, finalizing SLA scope clauses.",
  },
  {
    id: "opp-6",
    leadName: "Kalahari Hospitality",
    industry: "Tourism & Hotels",
    package: "Paid Search & Performance Booking",
    value: 38000,
    stage: "proposal_sent",
    probability: 50,
    salesRep: "David Cole",
    lastContact: "Oct 6, 11:00 SAST",
    nextAction: "Review proposal with Managing Director",
    competitorRisk: "Medium",
    notes: "Presented 3-tier campaign packages. Client reviewing budget.",
  },
  {
    id: "opp-7",
    leadName: "Zenith Retail Partners",
    industry: "E-Commerce",
    package: "Full Funnel Paid Ads + CRM",
    value: 55000,
    stage: "negotiation",
    probability: 70,
    salesRep: "David Cole",
    lastContact: "Yesterday, 16:00 SAST",
    nextAction: "Send revised proposal with split setup fee",
    competitorRisk: "Low",
    notes: "Very high intent; requested 2-stage onboarding payment structure.",
  },
];

const FUNNEL_DATA = [
  { stage: "Inbound Leads", count: 14, value: 480 },
  { stage: "Consultations", count: 9, value: 340 },
  { stage: "Proposals Sent", count: 6, value: 235 },
  { stage: "Negotiation", count: 4, value: 150 },
  { stage: "Closed Won", count: 2, value: 185 },
];

const SALES_TREND = [
  { month: "May 2026", Won: 110, Target: 150 },
  { month: "Jun 2026", Won: 135, Target: 160 },
  { month: "Jul 2026", Won: 145, Target: 170 },
  { month: "Aug 2026", Won: 160, Target: 180 },
  { month: "Sep 2026", Won: 172, Target: 190 },
  { month: "Oct 2026", Won: 185, Target: 200 },
];

function SalesHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedOpp, setSelectedOpp] = useState<SalesOpportunity | null>(null);

  const filteredOpps = SALES_OPPORTUNITIES.filter((opp) => {
    const matchesSearch =
      opp.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.salesRep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.industry.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (stageFilter === "all") return true;
    return opp.stage === stageFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/ceo" className="hover:text-foreground inline-flex items-center gap-1 font-medium text-[#3b1d4d] dark:text-primary">
          <ArrowLeft className="h-3 w-3" /> Executive Command Centre
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Sales Health & Pipeline</span>
      </div>

      {/* ─── Executive Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3b1d4d]/10 px-2.5 py-1 text-xs font-semibold text-[#3b1d4d] dark:bg-white/10 dark:text-white">
                <TrendingUp className="h-3.5 w-3.5" /> Commercial Telemetry
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                Win Rate: 28.5%
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sales Health & Pipeline Conversion
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time monitoring of commercial lead generation, consultation bookings, proposal conversion ratios, and closed-won contract value.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("CRM pipeline synced with Lead Intake webhooks.")}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Pipeline
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Commercial pipeline report exported to CSV.")}
              className="h-9 gap-1.5 bg-[#3b1d4d] hover:bg-[#3b1d4d]/90 text-white text-xs font-medium shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Pipeline CSV
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Verified Won MTD</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              On Target
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">R185,000</span>
            <span className="text-xs text-muted-foreground">/ R200k target</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +18.2% MoM
            </span>
            <span className="text-muted-foreground">92.5% Paced</span>
          </div>
          <Progress value={92.5} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Pipeline</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Healthy Volume
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">R420,000</span>
            <span className="text-xs text-muted-foreground">Weighted</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <Users className="h-3 w-3" /> 14 Active Deals
            </span>
            <span className="text-muted-foreground">R480k Gross</span>
          </div>
          <Progress value={78} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Conversion Win Rate</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              Above Target
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">28.5%</span>
            <span className="text-xs text-muted-foreground">Discovery to Close</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +3.2% vs Q3
            </span>
            <span className="text-muted-foreground">Benchmark: 25%</span>
          </div>
          <Progress value={85} className="mt-2.5 h-1.5 bg-muted" />
        </Card>

        <Card className="p-4.5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Average Deal Size</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
              Optimal
            </Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">R35,000</span>
            <span className="text-xs text-muted-foreground">Avg ACV</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +14% vs 2025
            </span>
            <span className="text-muted-foreground">Setup + Retainer</span>
          </div>
          <Progress value={70} className="mt-2.5 h-1.5 bg-muted" />
        </Card>
      </div>

      {/* ─── Sales Visualizations Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Funnel Progression (2 Cols) */}
        <Card className="border-border p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Pipeline Stage Conversion Funnel (R '000)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Value volume moving through each commercial milestone.</p>
            </div>
            <Badge variant="outline" className="text-xs">October 2026 MTD</Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#3b1d4d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Closed Won Trajectory (1 Col) */}
        <Card className="border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Monthly Closed-Won Growth</h3>
              <Badge variant="outline" className="text-xs">6 Months</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Realized new revenue vs monthly target.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="Won" stroke="#3b1d4d" fill="#3b1d4d" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs space-y-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Commercial Velocity:</span>
            <p className="text-foreground text-[11px] leading-relaxed">
              Steady upward slope since June 2026. High demand for GHL automation packages driving 65% of contract value.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Interactive Opportunities Table ───────────────────────────────── */}
      <Card className="border-border overflow-hidden shadow-xs">
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-[#3b1d4d] dark:text-primary" />
                Active Opportunities & Leads Directory
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every enterprise prospect under active sales review, consultation, or final contract closing.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter lead, rep, package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background w-full sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setStageFilter("all")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    stageFilter === "all" ? "bg-[#3b1d4d] text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({SALES_OPPORTUNITIES.length})
                </button>
                <button
                  onClick={() => setStageFilter("won")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    stageFilter === "won" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Won
                </button>
                <button
                  onClick={() => setStageFilter("negotiation")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    stageFilter === "negotiation" ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Negotiation
                </button>
                <button
                  onClick={() => setStageFilter("overdue_touch")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    stageFilter === "overdue_touch" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overdue
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3.5">Lead / Company</th>
                <th className="p-3.5">Service Package</th>
                <th className="p-3.5 text-right">Value</th>
                <th className="p-3.5">Assigned Rep</th>
                <th className="p-3.5 text-center">Stage & Win Prob</th>
                <th className="p-3.5">Next Touchpoint</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOpps.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <strong className="text-sm text-foreground block">{opp.leadName}</strong>
                    <span className="text-muted-foreground text-[11px]">{opp.industry}</span>
                  </td>
                  <td className="p-3.5 font-medium text-foreground max-w-[200px]">
                    {opp.package}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-sm text-foreground">
                    R{opp.value.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-foreground">{opp.salesRep}</td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        opp.stage === "won"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : opp.stage === "overdue_touch"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      }`}
                    >
                      {opp.stage === "won" && <CheckCircle2 className="mr-1 h-3 w-3 inline" />}
                      {opp.stage === "overdue_touch" && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
                      {opp.stage.replace("_", " ").toUpperCase()} ({opp.probability}%)
                    </Badge>
                  </td>
                  <td className="p-3.5 text-muted-foreground max-w-[220px]">
                    <span className="text-foreground font-medium block truncate">{opp.nextAction}</span>
                    <span className="text-[10px] text-muted-foreground">Last: {opp.lastContact}</span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOpp(opp);
                      }}
                    >
                      Inspect <ChevronRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Opportunity Detail Modal ──────────────────────────────────────── */}
      {selectedOpp && (
        <Dialog open={Boolean(selectedOpp)} onOpenChange={() => setSelectedOpp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Briefcase className="h-5 w-5 text-[#3b1d4d] dark:text-primary" />
                Deal Overview — {selectedOpp.leadName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedOpp.industry} · {selectedOpp.package}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contract Value</span>
                  <strong className="text-lg font-bold text-foreground">
                    R{selectedOpp.value.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Win Probability</span>
                  <strong className="text-lg font-bold text-[#3b1d4d] dark:text-primary">
                    {selectedOpp.probability}%
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Assigned Consultant</span>
                  <span className="text-foreground font-semibold">{selectedOpp.salesRep}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Last Contact</span>
                  <span className="text-foreground font-semibold">{selectedOpp.lastContact}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="font-semibold text-foreground">Competitor Presence & Risk:</span>
                <p className="text-muted-foreground leading-relaxed">{selectedOpp.competitorRisk}</p>
              </div>

              <div className="rounded-lg border border-[#3b1d4d]/30 bg-[#3b1d4d]/5 dark:border-primary/30 dark:bg-primary/5 p-3 space-y-1">
                <span className="font-semibold text-[#3b1d4d] dark:text-primary">Next Action Directive:</span>
                <p className="text-foreground leading-relaxed">{selectedOpp.nextAction}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedOpp(null)}
              >
                Close View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
