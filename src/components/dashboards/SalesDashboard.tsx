import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { useState, useMemo, useEffect } from "react";
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
  Users,
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
  Share2,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  Crown,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Phone,
} from "lucide-react";
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
import { useProfile } from "@/lib/use-profile";
import {
  MSP_INDUSTRIES,
  Industry,
  LeadItem,
  SalesActivityItem,
  DuplicateCheckResult,
  SalesTarget,
  GHLAppointment,
} from "@/lib/sales.types";
import {
  useSalesLeads,
  useCheckDuplicateLead,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useSalesTargets,
  useAssignSalesTarget,
  useSalesLeaderboard,
  useIndustryPerformance,
  useGHLAppointments,
  useSyncGHL,
} from "@/lib/sales.service";

export function SalesDashboard() {
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const isAdmin = Boolean(profileData?.isAdmin || profileData?.isRootAdmin);
  const isManager = Boolean(profileData?.isSalesManager || profileData?.isManagerOrAbove || isAdmin);
  const isConsultant = !isManager && Boolean(profileData?.isSalesConsultant || profileData?.isSales);

  const currentUserId = profileData?.user?.id || "";
  const currentUserEmail = profileData?.profile?.email || "";
  const currentUserName = profileData?.profile?.full_name || "Sales Specialist";

  // Tab & Filters
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Queries
  const {
    data: leads = [],
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = useSalesLeads({
    consultantId: isConsultant ? currentUserId : consultantFilter !== "all" ? consultantFilter : undefined,
    industry: industryFilter !== "all" ? industryFilter : undefined,
    stage: stageFilter !== "all" ? stageFilter : undefined,
  });

  const { data: targets = [], refetch: refetchTargets } = useSalesTargets(selectedMonth);
  const { data: leaderboard = [], refetch: refetchLeaderboard } = useSalesLeaderboard(selectedMonth);
  const { data: industryPerformance = [] } = useIndustryPerformance();
  const { data: appointments = [], refetch: refetchAppointments } = useGHLAppointments();

  // Mutations
  const checkDuplicateMutation = useCheckDuplicateLead();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const assignTargetMutation = useAssignSalesTarget();
  const syncGhlMutation = useSyncGHL();

  // Activities state (in-memory for touchpoint log)
  const [activities, setActivities] = useState<SalesActivityItem[]>([
    {
      id: "act-1",
      leadId: "lead-init-103",
      businessName: "Apex Capital Advisors",
      type: "Meeting",
      notes: "Executive contract review completed on Zoom. Deposit confirmed.",
      activityDate: "2026-11-08 14:00",
      performedBy: "Sales Consultant 2",
    },
    {
      id: "act-2",
      leadId: "lead-init-101",
      businessName: "First National Logistics SA",
      type: "WhatsApp",
      notes: "Commercial schedule transmitted to operations dispatch team.",
      activityDate: "2026-11-07 10:30",
      performedBy: "Sales Consultant 1",
    },
  ]);

  // ── Modals State ───────────────────────────────────────────────────────────
  // Add Lead Modal State
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState<Industry>("Financial Services");
  const [source, setSource] = useState<LeadItem["source"]>("Inbound Meta Ads");
  const [estimatedValue, setEstimatedValue] = useState("45000");
  const [leadQuality, setLeadQuality] = useState<LeadItem["leadQuality"]>("Hot");
  const [packageInterest, setPackageInterest] = useState("Performance Ads + GHL WhatsApp CRM");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [assignedConsultantId, setAssignedConsultantId] = useState("");

  // Live Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);

  // Edit Lead Modal State
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIndustry, setEditIndustry] = useState<Industry>("Other");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");
  const [editLeadQuality, setEditLeadQuality] = useState<LeadItem["leadQuality"]>("Hot");
  const [editStage, setEditStage] = useState<LeadItem["stage"]>("New");
  const [editPackageInterest, setEditPackageInterest] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editDuplicateWarning, setEditDuplicateWarning] = useState<DuplicateCheckResult | null>(null);

  // Assign Target Modal State (Manager)
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetConsultantId, setTargetConsultantId] = useState("cons-1-uuid-001");
  const [targetConsultantName, setTargetConsultantName] = useState("Sales Consultant 1");
  const [targetAmountInput, setTargetAmountInput] = useState("120000");

  // Log Activity Modal State
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<LeadItem | null>(null);
  const [activityType, setActivityType] = useState<SalesActivityItem["type"]>("Call");
  const [activityNotes, setActivityNotes] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  // Operations Handover Modal State
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverLead, setHandoverLead] = useState<LeadItem | null>(null);
  const [kickoffDate, setKickoffDate] = useState("");
  const [handoverSpecialNotes, setHandoverSpecialNotes] = useState("");

  // Debounced Duplicate Check for Add Modal
  useEffect(() => {
    if (!addLeadOpen) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (email.trim() || phone.trim() || businessName.trim().length > 3) {
        try {
          const res = await checkDuplicateMutation.mutateAsync({
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            businessName: businessName.trim() || undefined,
          });
          setDuplicateWarning(res.isDuplicate ? res : null);
        } catch {}
      } else {
        setDuplicateWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email, phone, businessName, addLeadOpen]);

  // Debounced Duplicate Check for Edit Modal
  useEffect(() => {
    if (!editLeadOpen || !selectedLead) {
      setEditDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (editEmail.trim() || editPhone.trim() || editBusinessName.trim().length > 3) {
        try {
          const res = await checkDuplicateMutation.mutateAsync({
            email: editEmail.trim() || undefined,
            phone: editPhone.trim() || undefined,
            businessName: editBusinessName.trim() || undefined,
            excludeId: selectedLead.id,
          });
          setEditDuplicateWarning(res.isDuplicate ? res : null);
        } catch {}
      } else {
        setEditDuplicateWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editEmail, editPhone, editBusinessName, editLeadOpen, selectedLead]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        searchQuery === "" ||
        l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        l.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStage = stageFilter === "all" || l.stage === stageFilter;
      const matchQuality = qualityFilter === "all" || l.leadQuality === qualityFilter;
      const matchIndustry = industryFilter === "all" || l.industry === industryFilter;
      return matchSearch && matchStage && matchQuality && matchIndustry;
    });
  }, [leads, searchQuery, stageFilter, qualityFilter, industryFilter]);

  // Telemetry Calculations
  const wonLeads = leads.filter((l) => l.stage === "Won");
  const lostLeads = leads.filter((l) => l.stage === "Lost");
  const wonValue = wonLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
  const activePipelineValue = leads
    .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
    .reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
  const totalPipelineValue = wonValue + activePipelineValue;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  // Active target for current view
  const currentConsultantTarget = useMemo(() => {
    if (isConsultant) {
      return (
        targets.find(
          (t) =>
            t.consultantId === currentUserId ||
            (t.consultantEmail && t.consultantEmail.toLowerCase() === currentUserEmail.toLowerCase())
        ) || {
          targetAmount: 100000,
          consultantName: currentUserName,
        }
      );
    }
    // Team aggregated target
    const totalTarget = targets.reduce((acc, t) => acc + t.targetAmount, 0) || 300000;
    return {
      targetAmount: totalTarget,
      consultantName: "Consolidated Sales Team",
    };
  }, [isConsultant, targets, currentUserId, currentUserEmail, currentUserName]);

  const targetPercentage = Math.min(
    150,
    Math.round((wonValue / (currentConsultantTarget.targetAmount || 1)) * 100)
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueFollowUps = leads.filter(
    (l) => l.stage !== "Won" && l.stage !== "Lost" && l.followUpDate < todayStr
  );
  const pendingProposals = leads.filter((l) => l.stage === "Proposal Sent");

  // Handlers: Add Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim()) {
      toast.error("Business name and contact person are required.");
      return;
    }

    if (duplicateWarning?.isDuplicate) {
      toast.error("Duplicate Lead Blocked", {
        description: duplicateWarning.reason || "A duplicate lead already exists in the system.",
      });
      return;
    }

    try {
      await createLeadMutation.mutateAsync({
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        industry,
        source,
        stage: "New",
        leadQuality,
        estimatedValue: Number(estimatedValue) || 35000,
        assignedConsultantId: isConsultant ? currentUserId : assignedConsultantId || currentUserId,
        assignedConsultantEmail: isConsultant ? currentUserEmail : undefined,
        assignedSalesperson: isConsultant ? currentUserName : undefined,
        followUpDate: followUpDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        proposalStatus: "Draft",
        packageInterest,
        notes,
      });

      toast.success("Opportunity Registered", {
        description: `${businessName} successfully created in pipeline.`,
      });

      setAddLeadOpen(false);
      setBusinessName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setNotes("");
    } catch (err: any) {
      if (err.duplicate) {
        setDuplicateWarning(err.duplicate);
        toast.error("Duplicate Lead Detected", { description: err.duplicate.reason });
      } else {
        toast.error(err.message || "Failed to create lead.");
      }
    }
  };

  // Handlers: Edit Lead
  const handleOpenEdit = (lead: LeadItem) => {
    setSelectedLead(lead);
    setEditBusinessName(lead.businessName);
    setEditContactPerson(lead.contactPerson);
    setEditEmail(lead.email || "");
    setEditPhone(lead.phone || "");
    setEditIndustry(lead.industry || "Other");
    setEditEstimatedValue(String(lead.estimatedValue || ""));
    setEditLeadQuality(lead.leadQuality);
    setEditStage(lead.stage);
    setEditPackageInterest(lead.packageInterest || "");
    setEditNotes(lead.notes || "");
    setEditFollowUpDate(lead.followUpDate || "");
    setEditDuplicateWarning(null);
    setEditLeadOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (editDuplicateWarning?.isDuplicate) {
      toast.error("Duplicate Conflict", {
        description: editDuplicateWarning.reason || "Conflicting information with another lead.",
      });
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        id: selectedLead.id,
        businessName: editBusinessName,
        contactPerson: editContactPerson,
        email: editEmail,
        phone: editPhone,
        industry: editIndustry,
        estimatedValue: Number(editEstimatedValue) || 0,
        leadQuality: editLeadQuality,
        stage: editStage,
        packageInterest: editPackageInterest,
        notes: editNotes,
        followUpDate: editFollowUpDate,
      });

      toast.success("Opportunity Updated", {
        description: `Changes saved for ${editBusinessName}.`,
      });
      setEditLeadOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead.");
    }
  };

  // Handlers: Assign Target
  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignTargetMutation.mutateAsync({
        consultantId: targetConsultantId,
        consultantName: targetConsultantName,
        month: selectedMonth,
        targetAmount: Number(targetAmountInput) || 100000,
      });
      toast.success("Target Assigned", {
        description: `${targetConsultantName} target set to ${formatZAR(Number(targetAmountInput))} for ${selectedMonth}.`,
      });
      setTargetModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign target");
    }
  };

  // Handlers: Touchpoint Activity
  const handleOpenLogActivity = (lead: LeadItem) => {
    setActivityLead(lead);
    setActivityNotes("");
    setNextFollowUpDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
    setLogActivityOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityLead || !activityNotes.trim()) return;

    const newAct: SalesActivityItem = {
      id: `act-${Date.now()}`,
      leadId: activityLead.id,
      businessName: activityLead.businessName,
      type: activityType,
      notes: activityNotes.trim(),
      activityDate: new Date().toLocaleString("en-ZA"),
      performedBy: currentUserName,
    };

    setActivities((prev) => [newAct, ...prev]);

    if (nextFollowUpDate) {
      await updateLeadMutation.mutateAsync({
        id: activityLead.id,
        followUpDate: nextFollowUpDate,
      });
    }

    toast.success("Activity Logged", {
      description: `${activityType} recorded for ${activityLead.businessName}.`,
    });
    setLogActivityOpen(false);
  };

  // Handlers: Operations Handover
  const handleOpenHandover = (lead: LeadItem) => {
    setHandoverLead(lead);
    setKickoffDate(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
    setHandoverSpecialNotes("");
    setHandoverOpen(true);
  };

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverLead) return;

    await updateLeadMutation.mutateAsync({
      id: handoverLead.id,
      handoverCompleted: true,
    });

    toast.success("Operations Handover Dispatched", {
      description: `Client ${handoverLead.businessName} transferred to Operations onboarding queue.`,
    });
    setHandoverOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isConsultant
                ? `Sales Consultant Workspace — ${currentUserName}`
                : isManager
                ? "Sales Performance & Management System"
                : "Executive Sales Dashboard"}
            </h1>
            <Badge
              variant="outline"
              className={
                isAdmin
                  ? "bg-purple-500/15 text-purple-600 border-purple-300 text-[10px]"
                  : isManager
                  ? "bg-blue-500/15 text-blue-600 border-blue-300 text-[10px]"
                  : "bg-emerald-500/15 text-emerald-600 border-emerald-300 text-[10px]"
              }
            >
              {isAdmin ? "Administrator" : isManager ? "Sales Manager" : "Sales Consultant"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isConsultant
              ? "Your personal deal pipeline, assigned monthly target quota, scheduled appointments, and daily follow-up queue."
              : "Consolidated team telemetry, consultant target management, GoHighLevel calendar integration, and industry intelligence."}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Consultant Switcher for Managers/Admins */}
          {isManager && (
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={consultantFilter}
                onChange={(e) => setConsultantFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">Team View (All Consultants)</option>
                <option value="cons-1-uuid-001">Consultant 1 (Senior)</option>
                <option value="cons-2-uuid-002">Consultant 2 (Mid-Level)</option>
                <option value="cons-3-uuid-003">Consultant 3 (Junior)</option>
                <option value="mgr-sales-uuid-001">Sales Manager</option>
              </select>
            </div>
          )}

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          {/* Assign Target Button (Manager only) */}
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTargetModalOpen(true)}
              className="text-xs h-8 gap-1.5 border-border"
            >
              <Target className="h-3.5 w-3.5 text-primary" />
              Assign Targets
            </Button>
          )}

          {/* Add Opportunity Button */}
          <Button
            size="sm"
            onClick={() => setAddLeadOpen(true)}
            className="bg-primary text-xs font-semibold text-primary-foreground gap-1.5 h-8 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Register Lead
          </Button>
        </div>
      </div>

      {/* ─── My attendance (clock in / out) ─────────────────────────────── */}
      <StaffAttendanceWidget />

      {/* ─── Telemetry KPI Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Monthly Won Revenue vs Target */}
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Monthly Won Revenue</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(wonValue)}</p>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, targetPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{targetPercentage}% of quota</span>
              <span>Target: {formatZAR(currentConsultantTarget.targetAmount, { compact: true })}</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Active Pipeline Value */}
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Pipeline</span>
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatZAR(activePipelineValue)}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} qualified opportunities in progress
          </p>
        </Card>

        {/* Metric 3: Lead Conversion Rate */}
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Conversion Win Rate</span>
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{conversionRate}%</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {wonLeads.length} won deals from {leads.length} total opportunities
          </p>
        </Card>

        {/* Metric 4: GHL Appointments & Follow-ups */}
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Scheduled Touchpoints</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{appointments.length} Meetings</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {overdueFollowUps.length > 0 ? (
              <span className="text-rose-500 font-medium">{overdueFollowUps.length} follow-ups need attention</span>
            ) : (
              <span className="text-emerald-500">All follow-ups on schedule</span>
            )}
          </p>
        </Card>
      </div>

      {/* ─── Sales Sub-Navigation Tabs ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/70 p-1 rounded-lg border border-border flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Leads & Prospects ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Pipeline Board
          </TabsTrigger>
          <TabsTrigger value="targets" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Targets & Leaderboard
          </TabsTrigger>
          <TabsTrigger value="industry" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Industry Performance
          </TabsTrigger>
          <TabsTrigger value="ghl" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            GoHighLevel Calendar ({appointments.length})
          </TabsTrigger>
          <TabsTrigger value="followups" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Follow-ups & Touchpoints
          </TabsTrigger>
          <TabsTrigger value="handover" className="text-xs px-3 py-1.5 data-[state=active]:bg-card font-medium">
            Operations Handover
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Left 2 Cols: Pipeline Distribution */}
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
                          <p className="text-[10px] text-muted-foreground truncate font-mono">
                            {formatZAR(val, { compact: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Top Performing Industries Quick Bar */}
              <Card className="p-5 border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Top Performing Industry Verticals</h3>
                    <p className="text-xs text-muted-foreground">High-value revenue sectors for targeted ad spend</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setActiveTab("industry")}>
                    Detailed Breakdown <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  {industryPerformance.slice(0, 4).map((ind) => (
                    <div key={ind.industry} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{ind.industry}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {ind.wonDeals} deals won ({ind.conversionRate}% win rate)
                        </Badge>
                      </div>
                      <span className="font-bold text-emerald-500 font-mono">{formatZAR(ind.totalRevenue)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Col: Target Status & GHL Next Meetings */}
            <div className="space-y-4">
              {/* Target Status Card */}
              <Card className="p-5 border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-sm font-bold text-foreground">Target Quota Progress</h3>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Achieved this month:</span>
                    <span className="font-bold text-emerald-500">{formatZAR(wonValue)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, targetPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{targetPercentage}% of quota</span>
                    <span>{formatZAR(Math.max(0, currentConsultantTarget.targetAmount - wonValue))} remaining</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("targets")}
                  className="w-full text-xs"
                >
                  View Performance Rankings
                </Button>
              </Card>

              {/* Upcoming GHL Meetings Card */}
              <Card className="p-5 border-border space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-sm font-bold text-foreground">Upcoming Client Meetings</h3>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-300">
                    GHL Synced
                  </Badge>
                </div>
                <div className="space-y-2">
                  {appointments.slice(0, 3).map((app) => (
                    <div key={app.id} className="p-2.5 rounded-lg border border-border bg-card text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{app.clientName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(app.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{app.notes || "Strategy Discovery"}</p>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2 text-center">No appointments scheduled.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: LEADS & PROSPECTS ────────────────────────────────────── */}
        <TabsContent value="leads" className="space-y-4">
          <Card className="p-4 border-border space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Industry Filter */}
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="all">All Industries</option>
                  {MSP_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>

                {/* Stage Filter */}
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

                <Button
                  size="sm"
                  onClick={() => setAddLeadOpen(true)}
                  className="bg-primary text-xs text-white h-8 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Lead
                </Button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Company & Contact</th>
                    <th className="p-3">Industry</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Monthly Value</th>
                    <th className="p-3">Assigned Consultant</th>
                    <th className="p-3">Follow-up</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No opportunities matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{lead.businessName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {lead.contactPerson} &bull; {lead.phone || lead.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] bg-secondary/50 font-normal">
                            {lead.industry}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`text-[10px] ${
                              lead.stage === "Won"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                                : lead.stage === "Proposal Sent"
                                ? "bg-purple-500/15 text-purple-600 border-purple-300"
                                : lead.stage === "Lost"
                                ? "bg-rose-500/15 text-rose-600 border-rose-300"
                                : "bg-blue-500/15 text-blue-600 border-blue-300"
                            }`}
                          >
                            {lead.stage}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {formatZAR(lead.estimatedValue)}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-primary" />
                            <span>{lead.assignedSalesperson}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {lead.followUpDate}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleOpenLogActivity(lead)}
                            >
                              <PhoneCall className="h-3 w-3 mr-1" /> Log
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleOpenEdit(lead)}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 3: PIPELINE BOARD ────────────────────────────────────────── */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {(["New", "Contacted", "Discovery", "Proposal Sent", "Won"] as const).map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage);
              const stageTotal = stageLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
              return (
                <div key={stage} className="p-3 rounded-xl border border-border bg-card/60 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-bold text-xs text-foreground">{stage}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    Total: {formatZAR(stageTotal, { compact: true })}
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[550px] pr-1">
                    {stageLeads.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => handleOpenEdit(l)}
                        className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-foreground leading-snug">{l.businessName}</h4>
                          <Badge variant="outline" className="text-[9px] py-0 px-1">
                            {l.industry.split(" ")[0]}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{l.contactPerson}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                          <span className="font-bold text-emerald-500 font-mono">{formatZAR(l.estimatedValue)}</span>
                          <span className="text-muted-foreground">{l.assignedSalesperson.split(" ")[0]}</span>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="p-6 text-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
                        Empty stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 4: TARGETS & PERFORMANCE RANKINGS ────────────────────────── */}
        <TabsContent value="targets" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Current Target Status Box */}
            <Card className="p-5 border-border space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Monthly Target Progress ({selectedMonth})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quota for: <strong className="text-foreground">{currentConsultantTarget.consultantName}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Won Revenue to Date:</span>
                  <span className="font-bold text-emerald-500">{formatZAR(wonValue)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, targetPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{targetPercentage}% of quota</span>
                  <span>{formatZAR(Math.max(0, currentConsultantTarget.targetAmount - wonValue))} remaining</span>
                </div>
              </div>

              {isManager && (
                <Button
                  onClick={() => setTargetModalOpen(true)}
                  className="w-full text-xs font-semibold bg-primary text-white"
                >
                  <Target className="h-3.5 w-3.5 mr-1.5" /> Adjust Consultant Targets
                </Button>
              )}
            </Card>

            {/* Monthly Sales Leaderboard Table */}
            <Card className="p-5 border-border md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Monthly Sales Leaderboard & Performance Rankings
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Authoritative rankings calculated from actual closed-won database deal records.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedMonth}
                </Badge>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 w-16">Rank</th>
                      <th className="p-3">Consultant</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Actual Won</th>
                      <th className="p-3">Achievement</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaderboard.map((rank) => (
                      <tr
                        key={rank.consultantId}
                        className={rank.rank === 1 ? "bg-amber-500/5 font-semibold" : "hover:bg-muted/20"}
                      >
                        <td className="p-3">
                          {rank.rank === 1 ? (
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Crown className="h-4 w-4" /> #1
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-bold">#{rank.rank}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{rank.consultantName}</div>
                          <div className="text-[10px] text-muted-foreground">{rank.consultantEmail}</div>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">{formatZAR(rank.targetAmount)}</td>
                        <td className="p-3 font-mono font-bold text-emerald-500">
                          {formatZAR(rank.actualWonAmount)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono">{rank.percentageAchieved}%</span>
                            <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  rank.percentageAchieved >= 100 ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, rank.percentageAchieved)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            className={`text-[10px] ${
                              rank.status === "exceeded"
                                ? "bg-purple-500/15 text-purple-600 border-purple-300"
                                : rank.status === "reached"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                                : "bg-rose-500/15 text-rose-600 border-rose-300"
                            }`}
                          >
                            {rank.status === "exceeded"
                              ? "Exceeded Quota"
                              : rank.status === "reached"
                              ? "Target Reached"
                              : "Below Quota"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 5: INDUSTRY PERFORMANCE ──────────────────────────────────── */}
        <TabsContent value="industry" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Industry Categorisation & Marketing Intelligence
                </h3>
                <p className="text-xs text-muted-foreground">
                  Identifies which client industries perform best to optimize ad spend and campaign targeting.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industryPerformance.map((ind) => (
                <div key={ind.industry} className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{ind.industry}</h4>
                      <p className="text-xs text-muted-foreground">{ind.totalLeads} total leads entered</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold text-primary">
                      {ind.conversionRate}% Win
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Won Deals: {ind.wonDeals}</span>
                    <span className="font-bold text-emerald-500 font-mono">{formatZAR(ind.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 6: GOHIGHLEVEL CALENDAR INTEGRATION ───────────────────────── */}
        <TabsContent value="ghl" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">GoHighLevel Calendar & Appointments</h3>
                  <Badge className="bg-purple-500/15 text-purple-600 border-purple-300 text-[10px]">
                    GHL API Connected
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automated appointment scheduling retrieved from your GoHighLevel agency calendar.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await syncGhlMutation.mutateAsync();
                    toast.info(res.message || "Calendar synchronized");
                    refetchAppointments();
                  } catch (e: any) {
                    toast.error("Failed to sync GHL calendar");
                  }
                }}
                disabled={syncGhlMutation.isPending}
                className="text-xs gap-1.5 h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncGhlMutation.isPending ? "animate-spin" : ""}`} />
                {syncGhlMutation.isPending ? "Syncing GHL..." : "Synchronise Calendar"}
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Client Prospect</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Assigned Consultant</th>
                    <th className="p-3">Meeting Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Follow-Up Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No scheduled appointments recorded from GoHighLevel.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-muted/20">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{app.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {app.contactEmail || app.contactPhone || "Scheduled Contact"}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-medium">
                          {new Date(app.appointmentDate).toLocaleString("en-ZA")}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-primary" />
                            <span>{app.consultantName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{app.location || "Online Discovery"}</td>
                        <td className="p-3">
                          <Badge
                            className={`text-[10px] ${
                              app.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                                : app.status === "confirmed"
                                ? "bg-blue-500/15 text-blue-600 border-blue-300"
                                : "bg-amber-500/15 text-amber-600 border-amber-300"
                            }`}
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-medium text-primary">
                          {app.followUpInfo || "Standard follow-up"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 7: FOLLOW-UPS & TOUCHPOINTS ──────────────────────────────── */}
        <TabsContent value="followups" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <h3 className="text-base font-bold text-foreground">Follow-Up Schedule & Touchpoints</h3>
            <div className="space-y-3">
              {leads
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
                            <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {lead.contactPerson} &bull; {lead.phone || lead.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">Due: {lead.followUpDate}</p>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-primary text-white"
                        onClick={() => handleOpenLogActivity(lead)}
                      >
                        <PhoneCall className="h-3 w-3 mr-1" /> Log Touchpoint
                      </Button>
                    </div>
                  );
                })}
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 8: OPERATIONS HANDOVER ───────────────────────────────────── */}
        <TabsContent value="handover" className="space-y-4">
          <Card className="p-5 border-border space-y-4">
            <h3 className="text-base font-bold text-foreground">Client Handover to Operations</h3>
            <p className="text-xs text-muted-foreground">
              Transfer verified closed-won deals to the 2-day onboarding pipeline.
            </p>
            <div className="space-y-3">
              {wonLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{lead.businessName}</span>
                      {lead.handoverCompleted ? (
                        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/40 text-[10px]">
                          Active in Operations
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                          Pending Handover
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly Value: <strong className="text-foreground">{formatZAR(lead.estimatedValue)}</strong> &bull;{" "}
                      Contact: {lead.contactPerson}
                    </p>
                  </div>
                  {!lead.handoverCompleted && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-8"
                      onClick={() => handleOpenHandover(lead)}
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1.5" /> Dispatch Handover
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL: ADD LEAD WITH DUPLICATE DETECTION ──────────────────────── */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Register New Lead Opportunity</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              All records are validated in real-time to prevent duplicate company, email, and phone entries.
            </DialogDescription>
          </DialogHeader>

          {/* Duplicate Warning Banner */}
          {duplicateWarning?.isDuplicate && (
            <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Duplicate Lead Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed">{duplicateWarning.reason}</p>
              {duplicateWarning.matchingLead && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-amber-500/50 text-amber-800 dark:text-amber-200"
                  onClick={() => {
                    setAddLeadOpen(false);
                    handleOpenEdit(duplicateWarning.matchingLead!);
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Open Existing Lead
                </Button>
              )}
            </div>
          )}

          <form onSubmit={handleCreateLead} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Business / Company Name *</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Logistics Group"
                required
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Contact Person *</Label>
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Sipho Dlamini"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Industry Vertical *</Label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as Industry)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  {MSP_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Work Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.co.za"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="082 123 4567"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Estimated Monthly Value (ZAR)</Label>
                <Input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Lead Quality</Label>
                <select
                  value={leadQuality}
                  onChange={(e) => setLeadQuality(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  <option value="Hot">Hot (Ready to buy)</option>
                  <option value="Warm">Warm (Discovery)</option>
                  <option value="Cold">Cold (Top of funnel)</option>
                </select>
              </div>
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
              <Button
                type="submit"
                size="sm"
                disabled={Boolean(duplicateWarning?.isDuplicate) || createLeadMutation.isPending}
                className="bg-primary text-white font-semibold"
              >
                {createLeadMutation.isPending ? "Saving..." : "Save Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: EDIT LEAD ─────────────────────────────────────────────── */}
      <Dialog open={editLeadOpen} onOpenChange={setEditLeadOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Opportunity Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update prospect milestones, expected values, or contact details.
            </DialogDescription>
          </DialogHeader>

          {editDuplicateWarning?.isDuplicate && (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Duplicate Conflict Warning
              </p>
              <p className="text-[11px]">{editDuplicateWarning.reason}</p>
            </div>
          )}

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
                <Label className="text-xs font-medium">Industry</Label>
                <select
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value as Industry)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                >
                  {MSP_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
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
                <Label className="text-xs font-medium">Monthly Value (ZAR)</Label>
                <Input
                  type="number"
                  value={editEstimatedValue}
                  onChange={(e) => setEditEstimatedValue(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Follow-Up Date</Label>
              <Input
                type="date"
                value={editFollowUpDate}
                onChange={(e) => setEditFollowUpDate(e.target.value)}
                className="text-xs h-8"
              />
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
              <Button
                type="submit"
                size="sm"
                disabled={Boolean(editDuplicateWarning?.isDuplicate) || updateLeadMutation.isPending}
                className="bg-primary text-white font-semibold"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: ASSIGN TARGET (MANAGER) ──────────────────────────────── */}
      <Dialog open={targetModalOpen} onOpenChange={setTargetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Assign Monthly Sales Quota</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set or adjust individual sales consultant targets for {selectedMonth}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTarget} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Select Sales Consultant</Label>
              <select
                value={targetConsultantId}
                onChange={(e) => {
                  setTargetConsultantId(e.target.value);
                  const name =
                    e.target.value === "cons-1-uuid-001"
                      ? "Sales Consultant 1"
                      : e.target.value === "cons-2-uuid-002"
                      ? "Sales Consultant 2"
                      : "Sales Consultant 3";
                  setTargetConsultantName(name);
                }}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
              >
                <option value="cons-1-uuid-001">Sales Consultant 1 (consultant1@mavisstrateegicpartners.co.za)</option>
                <option value="cons-2-uuid-002">Sales Consultant 2 (consultant2@mavisstrateegicpartners.co.za)</option>
                <option value="cons-3-uuid-003">Sales Consultant 3 (consultant3@mavisstrateegicpartners.co.za)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Monthly Target Quota (ZAR)</Label>
              <Input
                type="number"
                value={targetAmountInput}
                onChange={(e) => setTargetAmountInput(e.target.value)}
                required
                className="text-xs h-8"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setTargetModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white font-semibold">
                Set Quota
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
              <Label className="text-xs font-medium">Meeting Outcome & Notes</Label>
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
              <p className="text-muted-foreground">Industry: {handoverLead?.industry}</p>
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
