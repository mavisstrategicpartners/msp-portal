import { useState, useMemo } from "react";
import { formatZAR } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  Target,
  Banknote,
  Calendar,
  Clock,
  Mail,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Search,
  PhoneCall,
  MessageSquare,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Share2,
  Building2,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { useSupabaseTable } from "@/lib/useSupabaseTable.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface LeadItem {
  id: string;
  businessName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  source: "Inbound Meta Ads" | "Website Referral" | "Cold Outreach" | "LinkedIn" | "Google Ads";
  stage: "New" | "Contacted" | "Discovery" | "Proposal Sent" | "Won" | "Lost";
  leadQuality: "Hot" | "Warm" | "Cold";
  estimatedValue: number; // Monthly ZAR
  assignedSalesperson: string;
  followUpDate: string;
  proposalStatus: "Draft" | "Sent" | "Awaiting Signature" | "Accepted" | "Declined";
  packageInterest: string;
  notes: string;
  lastActivityDate?: string;
  handoverCompleted?: boolean;
}

export interface SalesActivityItem {
  id: string;
  leadId: string;
  businessName: string;
  type: "Call" | "Meeting" | "Email" | "WhatsApp" | "Proposal Sent";
  notes: string;
  activityDate: string;
  performedBy: string;
}

const DEFAULT_LEADS: LeadItem[] = [];

const DEFAULT_ACTIVITIES: SalesActivityItem[] = [];

const MONTHLY_SALES_TARGET = 300000; // ZAR 300k target

export function SalesDashboard() {
  // Supabase table sync with fallback seed
  const [leadsRaw, updateLeads, loading] = useSupabaseTable("sales_deals", DEFAULT_LEADS);
  const leads: LeadItem[] = (leadsRaw as LeadItem[]) || DEFAULT_LEADS;
  const [activities, setActivities] = useState<SalesActivityItem[]>(DEFAULT_ACTIVITIES);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");

  // Add Lead Modal State
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadItem["source"]>("Inbound Meta Ads");
  const [estimatedValue, setEstimatedValue] = useState("35000");
  const [leadQuality, setLeadQuality] = useState<LeadItem["leadQuality"]>("Hot");
  const [packageInterest, setPackageInterest] = useState("Performance Ads + GHL WhatsApp CRM");
  const [notes, setNotes] = useState("");

  // Edit Lead Modal State
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");
  const [editLeadQuality, setEditLeadQuality] = useState<LeadItem["leadQuality"]>("Hot");
  const [editStage, setEditStage] = useState<LeadItem["stage"]>("New");
  const [editPackageInterest, setEditPackageInterest] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");

  // Log Activity Modal State
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [activityLeadId, setActivityLeadId] = useState("");
  const [activityType, setActivityType] = useState<SalesActivityItem["type"]>("Call");
  const [activityNotes, setActivityNotes] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  // Handover Modal State
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverLead, setHandoverLead] = useState<LeadItem | null>(null);
  const [kickoffDate, setKickoffDate] = useState("");
  const [handoverSpecialNotes, setHandoverSpecialNotes] = useState("");

  // Calculate Metrics
  const activeOpportunities = leads.filter((l) => l.stage !== "Lost");
  const wonLeads = leads.filter((l) => l.stage === "Won");
  const lostLeads = leads.filter((l) => l.stage === "Lost");
  const wonValue = wonLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
  const activePipelineValue = leads
    .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
    .reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
  const totalPipelineValue = wonValue + activePipelineValue;

  const targetPercentage = Math.min(100, Math.round((wonValue / MONTHLY_SALES_TARGET) * 100));
  const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueFollowUps = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost" && l.followUpDate < todayStr);
  const pendingProposals = leads.filter((l) => l.stage === "Proposal Sent");

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        searchQuery === "" ||
        l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStage = stageFilter === "all" || l.stage === stageFilter;
      const matchQuality = qualityFilter === "all" || l.leadQuality === qualityFilter;
      return matchSearch && matchStage && matchQuality;
    });
  }, [leads, searchQuery, stageFilter, qualityFilter]);

  const revenueByPackage = useMemo(() => {
    const pkgMap = new Map<string, number>();
    for (const lead of leads) {
      const pkg = lead.packageInterest || "General Services";
      pkgMap.set(pkg, (pkgMap.get(pkg) || 0) + (Number(lead.estimatedValue) || 0));
    }
    const colors = ["bg-purple-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500"];
    const maxVal = Math.max(1, ...Array.from(pkgMap.values()));
    return Array.from(pkgMap.entries()).map(([name, value], i) => ({
      name,
      value,
      pct: Math.min(100, Math.round((value / maxVal) * 100)),
      color: colors[i % colors.length],
    }));
  }, [leads]);

  // Handlers
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim() || "Primary Contact",
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      source,
      stage: "New",
      leadQuality,
      estimatedValue: Number(estimatedValue) || 30000,
      assignedSalesperson: "Sales Executive",
      followUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      proposalStatus: "Draft",
      packageInterest,
      notes: notes.trim(),
      lastActivityDate: todayStr,
      handoverCompleted: false,
    };

    updateLeads((prev) => [newLead, ...prev]);
    toast.success("New Opportunity Created", {
      description: `${newLead.businessName} (ZAR ${formatZAR(newLead.estimatedValue)}) added to sales pipeline.`,
    });

    setAddLeadOpen(false);
    setBusinessName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setNotes("");
  };

  const handleOpenEdit = (lead: LeadItem) => {
    setSelectedLead(lead);
    setEditBusinessName(lead.businessName);
    setEditContactPerson(lead.contactPerson);
    setEditEmail(lead.email || "");
    setEditPhone(lead.phone || "");
    setEditEstimatedValue(String(lead.estimatedValue));
    setEditLeadQuality(lead.leadQuality);
    setEditStage(lead.stage);
    setEditPackageInterest(lead.packageInterest || "");
    setEditNotes(lead.notes || "");
    setEditFollowUpDate(lead.followUpDate || todayStr);
    setEditLeadOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    updateLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id
          ? {
              ...l,
              businessName: editBusinessName.trim() || l.businessName,
              contactPerson: editContactPerson.trim() || l.contactPerson,
              email: editEmail.trim() || l.email,
              phone: editPhone.trim() || l.phone,
              estimatedValue: Number(editEstimatedValue) || l.estimatedValue,
              leadQuality: editLeadQuality,
              stage: editStage,
              packageInterest: editPackageInterest,
              notes: editNotes.trim(),
              followUpDate: editFollowUpDate,
            }
          : l
      )
    );

    toast.success("Opportunity Updated", {
      description: `Changes to ${editBusinessName} saved successfully.`,
    });
    setEditLeadOpen(false);
  };

  const handleAdvanceStage = (id: string, newStage: LeadItem["stage"]) => {
    updateLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, stage: newStage, lastActivityDate: todayStr };
          if (newStage === "Proposal Sent") updated.proposalStatus = "Sent";
          if (newStage === "Won") updated.proposalStatus = "Accepted";
          if (newStage === "Lost") updated.proposalStatus = "Declined";
          return updated;
        }
        return l;
      })
    );

    if (newStage === "Won") {
      toast.success("Deal Marked as WON! 🎉", {
        description: "Congratulations! Remember to initiate the Operations Client Handover.",
      });
    } else {
      toast.success(`Pipeline Stage Updated: ${newStage}`);
    }
  };

  const handleOpenLogActivity = (lead: LeadItem) => {
    setActivityLeadId(lead.id);
    setActivityType("Call");
    setActivityNotes("");
    setNextFollowUpDate(new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]);
    setLogActivityOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === activityLeadId);
    if (!lead) return;

    const newActivity: SalesActivityItem = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      businessName: lead.businessName,
      type: activityType,
      notes: activityNotes.trim() || `${activityType} conducted with ${lead.contactPerson}`,
      activityDate: todayStr,
      performedBy: "Sales Executive",
    };

    setActivities((prev) => [newActivity, ...prev]);

    // Update follow up date on lead
    if (nextFollowUpDate) {
      updateLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, followUpDate: nextFollowUpDate, lastActivityDate: todayStr } : l))
      );
    }

    toast.success("Sales Activity Logged", {
      description: `${activityType} recorded for ${lead.businessName}. Follow-up set to ${nextFollowUpDate}.`,
    });
    setLogActivityOpen(false);
  };

  const handleOpenHandover = (lead: LeadItem) => {
    setHandoverLead(lead);
    setKickoffDate(new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]);
    setHandoverSpecialNotes("");
    setHandoverOpen(true);
  };

  const handleExecuteHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverLead) return;

    updateLeads((prev) =>
      prev.map((l) => (l.id === handoverLead.id ? { ...l, handoverCompleted: true } : l))
    );

    toast.success("Client Handover Transmitted to Operations", {
      description: `${handoverLead.businessName} dispatched to Operations 2-Day Intake Pipeline. Kickoff target: ${kickoffDate}.`,
    });
    setHandoverOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Role Authority Banner ────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-[#2a1338] via-[#1d0d27] to-[#12071a] p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 uppercase tracking-wider text-[10px]">
                Sales & Business Development
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40 text-[10px]">
                CRM Pipeline Active
              </Badge>
              <span className="text-xs text-purple-200/60 font-mono">
                SAST 08:00–17:00 &bull; Target: {formatZAR(MONTHLY_SALES_TARGET)}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
              <TrendingUp className="h-7 w-7 text-emerald-400" />
              Sales & Revenue Pipeline Command
            </h1>
            <p className="mt-1 text-sm text-purple-200/80 max-w-3xl">
              Dedicated sales workspace: Manage prospect leads, advance pipeline stages, track proposal velocity, verify closed-won revenue, and initiate operations handovers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setAddLeadOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Opportunity
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Overdue Follow-up Alert (if any) ──────────────────────────────── */}
      {overdueFollowUps.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>
              <strong>{overdueFollowUps.length} Follow-up{overdueFollowUps.length > 1 ? "s" : ""} Overdue:</strong> Contact required immediately to preserve deal conversion momentum ({overdueFollowUps.map((l) => l.businessName).join(", ")}).
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] border-rose-500/40 text-rose-200 hover:bg-rose-500/20"
            onClick={() => {
              setActiveTab("followups");
            }}
          >
            Review Follow-ups
          </Button>
        </div>
      )}

      {/* ─── KPI Telemetry Grid ───────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Monthly Won Revenue */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Closed-Won Revenue</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2">{formatZAR(wonValue)}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{wonLeads.length} won contracts</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {targetPercentage}% of {formatZAR(MONTHLY_SALES_TARGET, { compact: true })}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${targetPercentage}%` }}
            />
          </div>
        </Card>

        {/* Metric 2: Active Pipeline Value */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Active Pipeline Value</span>
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(activePipelineValue)}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} qualified prospects in flight
          </p>
        </Card>

        {/* Metric 3: Proposals Awaiting Decision */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Pending Proposals</span>
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2">{pendingProposals.length}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Value: {formatZAR(pendingProposals.reduce((a, b) => a + b.estimatedValue, 0))} awaiting signature
          </p>
        </Card>

        {/* Metric 4: Conversion Rate */}
        <Card className="p-4 border-border bg-card shadow-sm hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Sales Conversion Rate</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{conversionRate}%</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {wonLeads.length} won / {lostLeads.length} lost ({leads.length} total opportunities)
          </p>
        </Card>
      </div>

      {/* ─── Sales Sub-Navigation Tabs ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/70 p-1 rounded-lg border border-border flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Sales Overview
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Leads & Prospects ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Pipeline Board
          </TabsTrigger>
          <TabsTrigger value="followups" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Follow-ups & Meetings ({overdueFollowUps.length > 0 ? `${overdueFollowUps.length} alert` : "Schedule"})
          </TabsTrigger>
          <TabsTrigger value="targets" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Targets & Performance
          </TabsTrigger>
          <TabsTrigger value="handover" className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground font-medium">
            Operations Handover ({wonLeads.filter((l) => !l.handoverCompleted).length} pending)
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Left 2 cols: Pipeline Health & Next Actions */}
            <div className="md:col-span-2 space-y-4">
              <Card className="p-5 border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Pipeline Stage Distribution</h3>
                    <p className="text-xs text-muted-foreground">Opportunities across defined conversion milestones</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setActiveTab("pipeline")}>
                    View Board <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {(["New", "Contacted", "Discovery", "Proposal Sent", "Won"] as const).map((stage) => {
                    const count = leads.filter((l) => l.stage === stage).length;
                    const val = leads
                      .filter((l) => l.stage === stage)
                      .reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
                    return (
                      <div key={stage} className="p-3 rounded-lg border border-border bg-card/60 flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground">{stage}</span>
                        <div className="mt-2">
                          <p className="text-lg font-bold text-foreground">{count}</p>
                          <p className="text-[10px] text-muted-foreground truncate font-mono">{formatZAR(val, { compact: true })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Priority Follow-ups Table */}
              <Card className="p-5 border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Immediate Sales Follow-ups Due</h3>
                    <p className="text-xs text-muted-foreground">Next scheduled client contact points</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} Active Contacts
                  </Badge>
                </div>

                <div className="divide-y divide-border text-xs">
                  {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No scheduled follow-ups due.
                    </div>
                  ) : (
                    leads
                      .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
                      .slice(0, 4)
                      .map((lead) => {
                        const isOverdue = lead.followUpDate < todayStr;
                        return (
                          <div key={lead.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-foreground">{lead.businessName}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {lead.contactPerson} &bull; {lead.packageInterest}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-mono text-[11px] ${isOverdue ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                                {lead.followUpDate}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px]"
                                onClick={() => handleOpenLogActivity(lead)}
                              >
                                Log Call
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </Card>
            </div>

            {/* Right col: Recent Activity Feed */}
            <div className="space-y-4">
              <Card className="p-5 border-border h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <h3 className="text-sm font-bold text-foreground">Recent Sales Activity</h3>
                  <Badge variant="outline" className="text-[10px]">Live</Badge>
                </div>

                <div className="space-y-3.5 flex-1">
                  {activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No sales activities logged yet.
                    </div>
                  ) : (
                    activities.slice(0, 5).map((act) => (
                      <div key={act.id} className="text-xs border-l-2 border-primary/50 pl-3 py-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground">{act.businessName}</span>
                          <span className="text-muted-foreground font-mono">{act.activityDate}</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] py-0 px-1.5">{act.type}</Badge>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{act.notes}</p>
                      </div>
                    ))
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs mt-4"
                  onClick={() => setActiveTab("followups")}
                >
                  View Activity Calendar
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: LEADS & PROSPECTS ────────────────────────────────────── */}
        <TabsContent value="leads" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Leads & Prospective Accounts</h3>
                <p className="text-xs text-muted-foreground">
                  Complete directory of inbound and outbound sales prospects.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search prospect or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>

                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="all">All Stages</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>

                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="all">All Quality</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>

                <Button size="sm" onClick={() => setAddLeadOpen(true)} className="h-8 text-xs bg-primary text-white font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Lead
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase font-semibold text-muted-foreground text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Business & Contact</th>
                    <th className="py-2.5 px-3">Quality</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Monthly Value</th>
                    <th className="py-2.5 px-3">Follow-up</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                        No sales opportunities found. Click &quot;Add Lead&quot; to register a prospect.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                    const isOverdue = lead.followUpDate < todayStr && lead.stage !== "Won" && lead.stage !== "Lost";
                    return (
                      <tr key={lead.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{lead.businessName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {lead.contactPerson} {lead.email ? `• ${lead.email}` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              lead.leadQuality === "Hot"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold"
                                : lead.leadQuality === "Warm"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/30"
                            }`}
                          >
                            {lead.leadQuality}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{lead.source}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              lead.stage === "Won"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                                : lead.stage === "Lost"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            {lead.stage}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">{formatZAR(lead.estimatedValue)}</td>
                        <td className="py-3 px-3">
                          <span className={`font-mono text-[11px] ${isOverdue ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                            {lead.followUpDate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => handleOpenLogActivity(lead)}>
                            Log
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleOpenEdit(lead)}>
                            Edit
                          </Button>
                          {lead.stage !== "Won" && lead.stage !== "Lost" && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleAdvanceStage(lead.id, "Won")}
                            >
                              Won
                            </Button>
                          )}
                          {lead.stage === "Won" && !lead.handoverCompleted && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleOpenHandover(lead)}
                            >
                              Handover
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 3: PIPELINE BOARD ───────────────────────────────────────── */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Interactive Sales Pipeline Board</h3>
              <p className="text-xs text-muted-foreground">Move qualified prospects along sequential pipeline milestones.</p>
            </div>
            <Button size="sm" onClick={() => setAddLeadOpen(true)} className="text-xs bg-primary text-white">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Opportunity
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
            {(["New", "Contacted", "Discovery", "Proposal Sent", "Won"] as const).map((colStage) => {
              const colLeads = leads.filter((l) => l.stage === colStage);
              const colValue = colLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);

              return (
                <div key={colStage} className="bg-card/70 border border-border rounded-xl p-3 flex flex-col min-w-[240px]">
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{colStage}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{formatZAR(colValue, { compact: true })}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{colLeads.length}</Badge>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colLeads.length === 0 ? (
                      <div className="p-4 border border-dashed border-border rounded-lg text-center text-[11px] text-muted-foreground">
                        No deals in {colStage}
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3 rounded-lg border border-border bg-card shadow-xs hover:border-primary/40 transition space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs text-foreground leading-tight">{lead.businessName}</span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 ${
                                lead.leadQuality === "Hot"
                                  ? "text-rose-500 border-rose-500/30"
                                  : "text-muted-foreground border-border"
                              }`}
                            >
                              {lead.leadQuality}
                            </Badge>
                          </div>

                          <div className="text-[11px] text-muted-foreground space-y-0.5">
                            <p className="font-semibold text-foreground/90">{formatZAR(lead.estimatedValue)}/mo</p>
                            <p className="truncate">Contact: {lead.contactPerson}</p>
                            <p className="text-[10px] font-mono">Follow-up: {lead.followUpDate}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/60">
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => handleOpenEdit(lead)}>
                              Edit
                            </Button>
                            <div className="flex items-center gap-1">
                              {colStage === "Discovery" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-1.5"
                                  onClick={() => handleAdvanceStage(lead.id, "Proposal Sent")}
                                >
                                  Proposal &rarr;
                                </Button>
                              )}
                              {colStage === "Proposal Sent" && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => handleAdvanceStage(lead.id, "Won")}
                                >
                                  Win Deal
                                </Button>
                              )}
                              {colStage === "New" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-1.5"
                                  onClick={() => handleAdvanceStage(lead.id, "Contacted")}
                                >
                                  Contacted &rarr;
                                </Button>
                              )}
                              {colStage === "Contacted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-1.5"
                                  onClick={() => handleAdvanceStage(lead.id, "Discovery")}
                                >
                                  Discovery &rarr;
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 4: FOLLOW-UPS & MEETINGS ────────────────────────────────── */}
        <TabsContent value="followups" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Follow-ups & Consultation Schedule</h3>
                <p className="text-xs text-muted-foreground">Log conversations, customer objections, and scheduled meetings.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Scheduled Follow-up Calls</h4>
                {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No pending follow-ups scheduled.
                  </div>
                ) : (
                  leads
                    .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
                    .map((lead) => {
                      const isOverdue = lead.followUpDate < todayStr;
                      return (
                        <div
                          key={lead.id}
                          className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                            isOverdue ? "border-rose-500/40 bg-rose-500/5" : "border-border bg-card"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground">{lead.businessName}</span>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1.5">OVERDUE</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {lead.contactPerson} &bull; {lead.phone || lead.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">Due: {lead.followUpDate}</p>
                          </div>
                          <Button size="sm" className="h-7 text-xs bg-primary text-white" onClick={() => handleOpenLogActivity(lead)}>
                            <PhoneCall className="h-3 w-3 mr-1" /> Log Touchpoint
                          </Button>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Logged Activity History</h4>
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                      No activities logged yet.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{act.businessName}</span>
                          <span className="text-muted-foreground text-[10px] font-mono">{act.activityDate}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px]">{act.type}</Badge>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{act.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 5: TARGETS & PERFORMANCE ────────────────────────────────── */}
        <TabsContent value="targets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-border space-y-4">
              <h3 className="text-base font-bold text-foreground">Monthly Target Progress (October 2026)</h3>
              <p className="text-xs text-muted-foreground">
                Target: {formatZAR(MONTHLY_SALES_TARGET)} in new monthly recurring revenue.
              </p>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Won Revenue to Date:</span>
                  <span className="font-bold text-emerald-500">{formatZAR(wonValue)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${targetPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{targetPercentage}% of quota</span>
                  <span>{formatZAR(Math.max(0, MONTHLY_SALES_TARGET - wonValue))} remaining</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <h4 className="font-semibold text-foreground">Key Performance Ratios:</h4>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Average Won Deal Size:</span>
                  <span className="font-bold text-foreground">
                    {formatZAR(wonLeads.length > 0 ? wonValue / wonLeads.length : 0)}/mo
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Discovery-to-Proposal Rate:</span>
                  <span className="font-bold text-foreground">
                    {leads.length > 0 ? Math.round(((pendingProposals.length + wonLeads.length) / leads.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Lead Conversion Rate:</span>
                  <span className="font-bold text-foreground">{conversionRate}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border space-y-4">
              <h3 className="text-base font-bold text-foreground">Revenue by Service Package</h3>
              <p className="text-xs text-muted-foreground">Pipeline composition by core MSP agency offerings</p>

              <div className="space-y-3 pt-2 text-xs">
                {revenueByPackage.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No package revenue recorded yet.
                  </div>
                ) : (
                  revenueByPackage.map((pkg) => (
                    <div key={pkg.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-foreground">{pkg.name}</span>
                        <span className="font-mono text-muted-foreground">{formatZAR(pkg.value)}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className={`${pkg.color} h-1.5 rounded-full`} style={{ width: `${pkg.pct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 6: OPERATIONS HANDOVER ──────────────────────────────────── */}
        <TabsContent value="handover" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Client Handover to Operations</h3>
                <p className="text-xs text-muted-foreground">
                  When deals are closed-won, trigger the mandatory 2-day client onboarding process with Operations & Relationship Management.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {wonLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No won deals ready for handover yet.
                </div>
              ) : (
                wonLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{lead.businessName}</span>
                        {lead.handoverCompleted ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                            Handover Dispatched
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                            Pending Operations Intake
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contract Value: <strong className="text-foreground">{formatZAR(lead.estimatedValue)}/mo</strong> &bull; Contact: {lead.contactPerson} ({lead.email || lead.phone})
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Package: {lead.packageInterest}</p>
                    </div>

                    <div>
                      {lead.handoverCompleted ? (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> Active in Operations
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-8"
                          onClick={() => handleOpenHandover(lead)}
                        >
                          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Transmit Handover
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL: ADD LEAD ─────────────────────────────────────────────── */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create New Opportunity</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a qualified prospective client to the sales pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Business / Company Name *</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Solar SA"
                required
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Contact Person</Label>
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Thabo Mthembu"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Monthly Contract Value (ZAR)</Label>
                <Input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="35000"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thabo@company.co.za"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Phone / WhatsApp</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 82 123 4567"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Lead Quality</Label>
                <select
                  value={leadQuality}
                  onChange={(e) => setLeadQuality(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="Hot">Hot (High Intent)</option>
                  <option value="Warm">Warm (Nurture)</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Lead Source</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="Inbound Meta Ads">Inbound Meta Ads</option>
                  <option value="Website Referral">Website Referral</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Google Ads">Google Ads</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Target Package</Label>
              <Input
                value={packageInterest}
                onChange={(e) => setPackageInterest(e.target.value)}
                placeholder="e.g. Performance Ads + CRM Automation"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Discovery Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific client requirements, goals, and budget notes..."
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Save Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: EDIT LEAD ─────────────────────────────────────────────── */}
      <Dialog open={editLeadOpen} onOpenChange={setEditLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Opportunity Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update prospect milestones, expected values, or contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Business Name *</Label>
              <Input
                value={editBusinessName}
                onChange={(e) => setEditBusinessName(e.target.value)}
                required
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Contact Person</Label>
                <Input
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Monthly Value (ZAR)</Label>
                <Input
                  type="number"
                  value={editEstimatedValue}
                  onChange={(e) => setEditEstimatedValue(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Pipeline Stage</Label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Follow-up Due Date</Label>
                <Input
                  type="date"
                  value={editFollowUpDate}
                  onChange={(e) => setEditFollowUpDate(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditLeadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: LOG ACTIVITY ─────────────────────────────────────────── */}
      <Dialog open={logActivityOpen} onOpenChange={setLogActivityOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Sales Touchpoint</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record outcome from client call, meeting, or email exchange.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveActivity} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Activity Type</Label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
              >
                <option value="Call">Phone Call</option>
                <option value="Meeting">Discovery / Zoom Meeting</option>
                <option value="WhatsApp">WhatsApp Conversation</option>
                <option value="Email">Email Communication</option>
                <option value="Proposal Sent">Proposal Walkthrough</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Meeting Outcome & Client Notes</Label>
              <Textarea
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Key objections resolved, agreed next steps..."
                required
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Next Follow-Up Date</Label>
              <Input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setLogActivityOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Save Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: OPERATIONS HANDOVER ──────────────────────────────────── */}
      <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Initiate Operations Handover</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transfer closed-won account {handoverLead?.businessName} into the 2-day onboarding pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteHandover} className="space-y-3.5 py-2">
            <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
              <p className="font-semibold text-foreground">Client: {handoverLead?.businessName}</p>
              <p className="text-muted-foreground">Monthly Fee: {formatZAR(handoverLead?.estimatedValue)}</p>
              <p className="text-muted-foreground">Package: {handoverLead?.packageInterest}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Target Kickoff Date</Label>
              <Input
                type="date"
                value={kickoffDate}
                onChange={(e) => setKickoffDate(e.target.value)}
                required
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Special Client Notes for Operations Lead</Label>
              <Textarea
                value={handoverSpecialNotes}
                onChange={(e) => setHandoverSpecialNotes(e.target.value)}
                placeholder="Client specific brand tone, technical domain details, or key stakeholder instructions..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setHandoverOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Confirm Handover to Operations
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
