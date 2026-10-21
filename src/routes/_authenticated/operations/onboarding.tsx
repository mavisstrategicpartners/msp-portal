import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList, Search, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Building2, CheckSquare, XCircle, AlertCircle, ArrowUpRight, MessageSquare,
  ShieldAlert, User, ExternalLink, ListChecks, Plus, Mail, Phone, MapPin,
  Briefcase, Calendar, UserCheck, ShieldCheck, FileText, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useOperationsClients,
  useCreateClientMutation,
  useUpdateClientMutation,
  useUpdateStepMutation,
  useRecordCommunicationMutation,
} from "@/lib/operations-client";
import {
  ClientRecord,
  ClientType,
  OnboardingStage,
  OnboardingStep,
  CreateClientInput,
} from "@/lib/operations.types";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/_authenticated/operations/onboarding")({
  head: () => ({ meta: [{ title: "Client Onboarding — MSP Operations" }] }),
  component: ClientOnboardingPage,
});

const STANDARD_PACKAGES = [
  "SEO + Website Build & Content",
  "Google Search & Paid Ads Retainer",
  "Social Media Growth + Content Production",
  "Full Growth Retainer (SEO, Ads, Web)",
  "Tailored Digital Advisory Retainer",
];

const ONBOARDING_STAGES: OnboardingStage[] = [
  "New Client",
  "Initial Contact",
  "Information Required",
  "Verification in Progress",
  "Documentation Pending",
  "Ready for Approval",
  "Onboarding Completed",
  "On Hold",
  "Declined",
  "Draft",
];

export function ClientOnboardingPage() {
  const { data: profileData } = useProfile();
  const { data: clients = [], isLoading: loading, refetch } = useOperationsClients();

  const createClientMutation = useCreateClientMutation();
  const updateClientMutation = useUpdateClientMutation();
  const updateStepMutation = useUpdateStepMutation();
  const recordCommMutation = useRecordCommunicationMutation();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Selected client for detail modal
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "steps" | "comms">("overview");

  // Edit Client Details state (inside modal)
  const [editPrimaryContact, setEditPrimaryContact] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editServices, setEditServices] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStage, setEditStage] = useState<OnboardingStage>("New Client");
  const [editBlocker, setEditBlocker] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Communication log state
  const [commChannel, setCommChannel] = useState<any>("Email");
  const [commSummary, setCommSummary] = useState("");
  const [commFollowUp, setCommFollowUp] = useState("");
  const [commNextDate, setCommNextDate] = useState("");
  const [isLoggingComm, setIsLoggingComm] = useState(false);

  // Add Client Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<ClientType>("Business");
  const [formRegNo, setFormRegNo] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formServices, setFormServices] = useState(STANDARD_PACKAGES[0]);
  const [formCustomServices, setFormCustomServices] = useState("");
  const [formManagerId, setFormManagerId] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formTargetDate, setFormTargetDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [formNotes, setFormNotes] = useState("");
  const [formSpecialReqs, setFormSpecialReqs] = useState("");
  const [isDraftAction, setIsDraftAction] = useState(false);

  // Blocker Flagging Modal State for individual steps
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [stepBlockerText, setStepBlockerText] = useState("");

  // Sync selected client when client list updates
  const activeClient = useMemo(() => {
    if (!selectedClient) return null;
    return clients.find((c) => c.id === selectedClient.id) || selectedClient;
  }, [clients, selectedClient]);

  const openClientDetail = (client: ClientRecord, tab: "overview" | "steps" | "comms" = "overview") => {
    setSelectedClient(client);
    setEditPrimaryContact(client.primaryContact);
    setEditContactPhone(client.contactPhone);
    setEditContactEmail(client.contactEmail);
    setEditAddress(client.address);
    setEditServices(client.servicesRequired);
    setEditNotes(client.notes);
    setEditStage(client.stage);
    setEditBlocker(client.blocker || "");
    setDetailTab(tab);
    setDetailModalOpen(true);
  };

  const resetAddForm = () => {
    setFormName("");
    setFormType("Business");
    setFormRegNo("");
    setFormContactName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormServices(STANDARD_PACKAGES[0]);
    setFormCustomServices("");
    setFormManagerId("");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormTargetDate(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
    setFormNotes("");
    setFormSpecialReqs("");
  };

  const handleSaveClient = async (isDraft = false) => {
    // Validation
    const name = formName.trim();
    if (!name || name.length < 2) {
      toast.error("Please enter a valid Company or Client Name (minimum 2 characters).");
      return;
    }

    const contactName = formContactName.trim();
    if (!contactName) {
      toast.error("Primary Contact Person is mandatory.");
      return;
    }

    const email = formEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please provide a valid contact email address.");
      return;
    }

    const phone = formPhone.trim();
    if (!phone) {
      toast.error("Contact phone number is required.");
      return;
    }

    const address = formAddress.trim();
    if (!address) {
      toast.error("Physical or business address is required.");
      return;
    }

    const services = formServices === "Custom" ? formCustomServices.trim() : formServices;
    if (!services) {
      toast.error("Please specify the required services or products.");
      return;
    }

    setIsDraftAction(isDraft);

    const payload: CreateClientInput = {
      name,
      clientType: formType,
      primaryContact: contactName,
      contactEmail: email,
      contactPhone: phone,
      businessRegistrationNumber: formRegNo.trim() || undefined,
      address,
      servicesRequired: services,
      accountManagerId: formManagerId || undefined,
      onboardingStartDate: formStartDate,
      targetCompletionDate: formTargetDate,
      notes: formNotes.trim(),
      specialRequirements: formSpecialReqs.trim(),
      isDraft,
    };

    try {
      const created = await createClientMutation.mutateAsync(payload);
      toast.success(isDraft ? "Client saved as Draft" : "Client registered successfully!", {
        description: `"${created.name}" is now active in the Onboarding Pipeline.`,
      });
      setAddModalOpen(false);
      resetAddForm();
    } catch (err: any) {
      toast.error("Failed to register client", {
        description: err.message || "An unexpected error occurred.",
      });
    }
  };

  const handleSaveEditClient = async () => {
    if (!activeClient) return;
    setIsSavingEdit(true);
    try {
      await updateClientMutation.mutateAsync({
        clientId: activeClient.id,
        updates: {
          primaryContact: editPrimaryContact.trim(),
          contactPhone: editContactPhone.trim(),
          contactEmail: editContactEmail.trim(),
          address: editAddress.trim(),
          servicesRequired: editServices.trim(),
          notes: editNotes.trim(),
          stage: editStage,
          blocker: editBlocker.trim() || null,
        },
      });
      toast.success("Client details updated successfully.");
    } catch (err: any) {
      toast.error("Failed to update client details", { description: err.message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleStep = async (step: OnboardingStep) => {
    if (!activeClient) return;
    try {
      const willComplete = !step.completed;
      await updateStepMutation.mutateAsync({
        clientId: activeClient.id,
        stepKey: step.stepKey,
        completed: willComplete,
        blocker: willComplete ? null : step.blocker,
      });
      toast.success(willComplete ? "Step marked complete" : "Step marked incomplete", {
        description: `${step.title} has been updated.`,
      });
    } catch (err: any) {
      toast.error("Failed to update step", { description: err.message });
    }
  };

  const handleSaveStepBlocker = async () => {
    if (!activeClient || !activeStep) return;
    try {
      await updateStepMutation.mutateAsync({
        clientId: activeClient.id,
        stepKey: activeStep.stepKey,
        completed: false,
        blocker: stepBlockerText.trim() || null,
      });
      toast.success("Blocker note recorded for step", {
        description: activeStep.title,
      });
      setStepModalOpen(false);
    } catch (err: any) {
      toast.error("Error saving step blocker", { description: err.message });
    }
  };

  const handleLogCommunication = async () => {
    if (!activeClient || !commSummary.trim()) {
      toast.error("Please enter a communication summary.");
      return;
    }
    setIsLoggingComm(true);
    try {
      await recordCommMutation.mutateAsync({
        clientId: activeClient.id,
        comm: {
          channel: commChannel,
          summary: commSummary.trim(),
          promisedFollowUp: commFollowUp.trim() || undefined,
          nextCommunicationDate: commNextDate || undefined,
          interactionDate: new Date().toISOString().split("T")[0],
        },
      });
      toast.success("Communication interaction logged.");
      setCommSummary("");
      setCommFollowUp("");
      setCommNextDate("");
    } catch (err: any) {
      toast.error("Failed to log communication", { description: err.message });
    } finally {
      setIsLoggingComm(false);
    }
  };

  // Filtered Client List
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(q) ||
        c.primaryContact.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q) ||
        c.servicesRequired.toLowerCase().includes(q) ||
        (c.blocker && c.blocker.toLowerCase().includes(q));

      const matchesStage = filterStage === "all" || c.stage === filterStage;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "blockers" && !!c.blocker) ||
        (filterStatus === "overdue" && c.escalationStatus === "Overdue Blocker") ||
        (filterStatus === "completed" && c.stage === "Onboarding Completed");

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [clients, search, filterStage, filterStatus]);

  // Derived Summary Counts
  const totalClients = clients.length;
  const inPipelineCount = clients.filter(
    (c) => c.stage !== "Onboarding Completed" && c.stage !== "Declined" && c.stage !== "Draft"
  ).length;
  const blockersCount = clients.filter((c) => !!c.blocker || c.escalationStatus === "Overdue Blocker").length;
  const completedCount = clients.filter((c) => c.stage === "Onboarding Completed").length;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Client Onboarding Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Register new clients directly to the database, track technical integrations, manage KYC verification steps, and monitor delivery SLAs across all accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              resetAddForm();
              setAddModalOpen(true);
            }}
            className="h-9 px-3.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Client
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs cursor-pointer h-9 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Accounts</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{totalClients}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Persistent database records</p>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Onboarding</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary mt-2">{inPipelineCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">In onboarding pipeline</p>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Roadblocks</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{blockersCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Requiring intervention</p>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Live & Handed Over</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed onboarding</p>
        </Card>
      </div>

      {/* ── Filters Bar ─────────────────────────────────────────────────────── */}
      <Card className="border-border p-3.5 bg-card shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, contacts, emails, blockers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-background border-border text-foreground h-9"
            />
          </div>

          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
              <SelectValue placeholder="Stage: All" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Workflow Stages</SelectItem>
              {ONBOARDING_STAGES.map((stg) => (
                <SelectItem key={stg} value={stg}>
                  {stg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operational Statuses</SelectItem>
              <SelectItem value="blockers">Active Roadblocks</SelectItem>
              <SelectItem value="overdue">Overdue Blockers</SelectItem>
              <SelectItem value="completed">Completed Onboarding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ── Onboarding Client Cards List ────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Loading authoritative client records...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground border-dashed border-border bg-card">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-foreground">No onboarding records found.</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "No clients match your filter criteria." : "Get started by adding your first client."}
            </p>
            <Button
              size="sm"
              onClick={() => {
                resetAddForm();
                setAddModalOpen(true);
              }}
              className="mt-4 bg-primary text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Client
            </Button>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const steps = client.steps || [];
            const completedStepsCount = steps.filter((s) => s.completed).length;
            const totalSteps = steps.length;
            const progress = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
            const hasBlocker = !!client.blocker;

            return (
              <Card
                key={client.id}
                className="border-border bg-card shadow-xs hover:border-primary/50 transition duration-150"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <CardTitle className="text-base font-bold text-foreground">
                          {client.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-border bg-muted/60 text-foreground font-semibold px-2 py-0.2"
                        >
                          {client.clientType}
                        </Badge>
                        <Badge
                          className={`text-[10px] font-semibold px-2 py-0.2 ${
                            client.stage === "Onboarding Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300"
                              : client.stage === "Draft"
                              ? "bg-muted text-muted-foreground"
                              : client.stage === "On Hold" || client.stage === "Declined"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300"
                              : "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300"
                          }`}
                        >
                          {client.stage}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <strong>Contact:</strong> {client.primaryContact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {client.contactEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {client.contactPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <strong>Manager:</strong> {client.accountManagerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-none ${
                          client.escalationStatus === "Overdue Blocker"
                            ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            : client.escalationStatus === "Escalated"
                            ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                            : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            client.escalationStatus === "Overdue Blocker"
                              ? "bg-rose-500"
                              : client.escalationStatus === "Escalated"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {client.escalationStatus}
                      </Badge>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-3 cursor-pointer"
                        onClick={() => openClientDetail(client, "overview")}
                      >
                        <ListChecks className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        Manage Client ({completedStepsCount}/{totalSteps})
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {hasBlocker && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-xs text-amber-950 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <strong className="text-amber-950 dark:text-amber-300 font-bold">Active Roadblock:</strong> {client.blocker}
                      </div>
                    </div>
                  )}

                  {/* Step Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {steps.map((st, idx) => (
                      <div
                        key={st.id}
                        onClick={() => openClientDetail(client, "steps")}
                        className={`cursor-pointer rounded border p-2 text-[11px] transition ${
                          st.completed
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-300 font-medium"
                            : st.blocker
                            ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/20 dark:text-rose-300 font-medium"
                            : "border-border bg-muted/40 text-foreground/80 hover:border-primary/50"
                        }`}
                        title={st.blocker ? `Blocked: ${st.blocker}` : st.completed ? "Verified" : "Pending step"}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-semibold">Step {idx + 1}</span>
                          {st.completed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : st.blocker ? (
                            <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="font-semibold truncate mt-1">{st.title}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>
                      <strong>Package:</strong> {client.servicesRequired}
                    </span>
                    <span>
                      Started: {client.onboardingStartDate} ({client.businessDaysAge} business days) &bull; Target: {client.targetCompletionDate}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD CLIENT (Connected to Real Supabase Database)
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-bold">Register New Client Account</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Add a persistent client to the Mavis Strategic Partners database. This client will immediately become available in the Onboarding Pipeline and Operations telemetry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Section 1: Entity Details */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Building2 className="h-4 w-4 text-primary" /> 1. Entity & Company Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Company or Client Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Makurung Mining Technologies (Pty) Ltd"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Client Type <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                    <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business (Corporate / SME)</SelectItem>
                      <SelectItem value="Individual">Individual (Private Client)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formType === "Business" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Business Registration Number (CIPC / Tax Ref)</Label>
                  <Input
                    placeholder="e.g. 2024/781920/07"
                    value={formRegNo}
                    onChange={(e) => setFormRegNo(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>
              )}
            </div>

            {/* Section 2: Contact Information */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <User className="h-4 w-4 text-primary" /> 2. Primary Contact & Location
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Thabo Ndlovu"
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Contact Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. thabo@makurung.co.za"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. +27 11 982 4400"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Physical / Billing Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. 150 West Street, Sandton, Johannesburg, 2196"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="h-9 text-xs bg-background border-border text-foreground"
                />
              </div>
            </div>

            {/* Section 3: Engagement Scope & Assignment */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Briefcase className="h-4 w-4 text-primary" /> 3. Services & Operations Ownership
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Services / Products Required <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={formServices} onValueChange={setFormServices}>
                    <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARD_PACKAGES.map((pkg) => (
                        <SelectItem key={pkg} value={pkg}>
                          {pkg}
                        </SelectItem>
                      ))}
                      <SelectItem value="Custom">Custom Service Scope...</SelectItem>
                    </SelectContent>
                  </Select>

                  {formServices === "Custom" && (
                    <Input
                      placeholder="Specify custom retainer scope..."
                      value={formCustomServices}
                      onChange={(e) => setFormCustomServices(e.target.value)}
                      className="mt-1.5 h-9 text-xs bg-background border-border text-foreground"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assigned Relationship Manager</Label>
                  <Select value={formManagerId} onValueChange={setFormManagerId}>
                    <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                      <SelectValue placeholder="Operations & Relationship Manager (Default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Operations & Relationship Manager (Lead)</SelectItem>
                      <SelectItem value="0b392afd-8d44-4ea7-8078-5f63293d09b4">Operations Manager (Account Manager)</SelectItem>
                      <SelectItem value="9560ff89-fffc-406d-b345-95ef79e78568">MSP General Manager</SelectItem>
                      <SelectItem value="ccc81675-9a50-4abf-ba94-238511cb33f2">Media Buying Department Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Onboarding Start Date</Label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Completion SLA Date</Label>
                  <Input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Operational Notes */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <FileText className="h-4 w-4 text-primary" /> 4. Notes & Special Requirements
              </h4>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operational Requirements / Retainer Context</Label>
                <Textarea
                  placeholder="Specify client expectations, technical integration constraints, billing parameters, or scope notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="text-xs bg-background border-border text-foreground min-h-[75px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (formName || formContactName || formEmail) {
                  if (confirm("Discard unsaved client registration changes?")) {
                    setAddModalOpen(false);
                    resetAddForm();
                  }
                } else {
                  setAddModalOpen(false);
                }
              }}
              className="text-xs"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSaveClient(true)}
                disabled={createClientMutation.isPending}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveClient(false)}
                disabled={createClientMutation.isPending}
                className="bg-primary text-white font-semibold text-xs px-4"
              >
                {createClientMutation.isPending && !isDraftAction ? "Saving to Database..." : "Save Client"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CLIENT DETAIL & MANAGEMENT DRAWER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeClient && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-3xl bg-card border-border text-foreground max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-bold">{activeClient.name}</DialogTitle>
                <Badge variant="outline" className="text-xs font-semibold">
                  {activeClient.clientType}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Client ID: {activeClient.id} &bull; Started: {activeClient.onboardingStartDate} ({activeClient.businessDaysAge} business days)
              </DialogDescription>
            </DialogHeader>

            <Tabs value={detailTab} onValueChange={(v: any) => setDetailTab(v)} className="space-y-4 pt-2">
              <TabsList className="grid grid-cols-3 h-9 bg-muted/60 p-1">
                <TabsTrigger value="overview" className="text-xs font-semibold">
                  Overview & Contact
                </TabsTrigger>
                <TabsTrigger value="steps" className="text-xs font-semibold">
                  Onboarding Steps ({activeClient.steps.filter((s) => s.completed).length}/{activeClient.steps.length})
                </TabsTrigger>
                <TabsTrigger value="comms" className="text-xs font-semibold">
                  Communications ({activeClient.communications?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: OVERVIEW & CONTACT EDIT */}
              <TabsContent value="overview" className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary Contact Name</Label>
                    <Input
                      value={editPrimaryContact}
                      onChange={(e) => setEditPrimaryContact(e.target.value)}
                      className="h-9 text-xs bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Contact Email</Label>
                    <Input
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="h-9 text-xs bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Contact Phone</Label>
                    <Input
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="h-9 text-xs bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Onboarding Stage</Label>
                    <Select value={editStage} onValueChange={(v: any) => setEditStage(v)}>
                      <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ONBOARDING_STAGES.map((stg) => (
                          <SelectItem key={stg} value={stg}>
                            {stg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Physical / Billing Address</Label>
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Active Services / Retainer Package</Label>
                  <Input
                    value={editServices}
                    onChange={(e) => setEditServices(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Active Roadblock / Dependency Obstacle (Optional)</Label>
                  <Input
                    placeholder="Describe any blocker holding up onboarding..."
                    value={editBlocker}
                    onChange={(e) => setEditBlocker(e.target.value)}
                    className="h-9 text-xs bg-background border-border text-foreground text-amber-700 dark:text-amber-300 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Operational Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="text-xs bg-background border-border text-foreground min-h-[70px]"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    size="sm"
                    onClick={handleSaveEditClient}
                    disabled={isSavingEdit}
                    className="bg-primary text-white font-semibold text-xs"
                  >
                    {isSavingEdit ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: ONBOARDING STEPS */}
              <TabsContent value="steps" className="space-y-3 text-xs">
                <p className="text-muted-foreground font-medium">
                  Toggle step checkmarks to update completion in the database. Flag roadblocks to track missing credentials or external dependencies.
                </p>

                <div className="divide-y divide-border rounded-lg border border-border bg-card">
                  {activeClient.steps.map((step, idx) => (
                    <div key={step.id} className="p-3 flex items-start justify-between gap-3 hover:bg-muted/40 transition">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          size="sm"
                          variant={step.completed ? "default" : "outline"}
                          className={`h-7 w-7 p-0 shrink-0 ${
                            step.completed
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "border-border text-muted-foreground"
                          }`}
                          onClick={() => handleToggleStep(step)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                            <span>
                              {idx + 1}. {step.title}
                            </span>
                            {step.completed && (
                              <Badge className="text-[10px] bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold">
                                Verified {step.completedDate}
                              </Badge>
                            )}
                            {step.blocker && (
                              <Badge className="text-[10px] bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 font-semibold">
                                Blocker Flagged
                              </Badge>
                            )}
                          </div>
                          {step.blocker && (
                            <p className="text-rose-900 dark:text-rose-300 text-xs mt-1 font-medium">
                              <strong className="font-bold">Reason:</strong> {step.blocker}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2.5 cursor-pointer shrink-0"
                        onClick={() => {
                          setActiveStep(step);
                          setStepBlockerText(step.blocker || "");
                          setStepModalOpen(true);
                        }}
                      >
                        <AlertCircle className="mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />
                        {step.blocker ? "Edit Blocker" : "Flag Blocker"}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: COMMUNICATIONS */}
              <TabsContent value="comms" className="space-y-4 text-xs">
                {/* Form to log communication */}
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <MessageSquare className="h-4 w-4 text-primary" /> Log Client Interaction
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Channel</Label>
                      <Select value={commChannel} onValueChange={(v: any) => setCommChannel(v)}>
                        <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone Call</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Meeting">Meeting (In-Person)</SelectItem>
                          <SelectItem value="Video Conference">Video Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Promised Follow-up Action</Label>
                      <Input
                        placeholder="e.g. Send analytics report..."
                        value={commFollowUp}
                        onChange={(e) => setCommFollowUp(e.target.value)}
                        className="h-8 text-xs bg-background border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Next Follow-up Due Date</Label>
                      <Input
                        type="date"
                        value={commNextDate}
                        onChange={(e) => setCommNextDate(e.target.value)}
                        className="h-8 text-xs bg-background border-border text-foreground font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Summary & Discussion Points</Label>
                    <Textarea
                      placeholder="Record discussion summary, agreed milestones, or client feedback..."
                      value={commSummary}
                      onChange={(e) => setCommSummary(e.target.value)}
                      className="text-xs bg-background border-border text-foreground min-h-[60px]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleLogCommunication}
                      disabled={isLoggingComm}
                      className="bg-primary text-white font-semibold text-xs h-8"
                    >
                      {isLoggingComm ? "Logging..." : "Log Interaction"}
                    </Button>
                  </div>
                </div>

                {/* Communication History Timeline */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-xs">Interaction History</h4>
                  {(activeClient.communications || []).length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-xs">
                      No communication records logged yet for this account.
                    </div>
                  ) : (
                    activeClient.communications.map((comm) => (
                      <div key={comm.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px]">
                              {comm.channel}
                            </Badge>
                            <span>Logged by {comm.responsibleEmployee}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">{comm.interactionDate}</span>
                        </div>
                        <p className="text-xs text-foreground/90 mt-1">{comm.summary}</p>
                        {comm.promisedFollowUp && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            <strong>Follow-up:</strong> {comm.promisedFollowUp}{" "}
                            {comm.nextCommunicationDate && `(Due: ${comm.nextCommunicationDate})`}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL: FLAG STEP BLOCKER ────────────────────────────────────────── */}
      <Dialog open={stepModalOpen} onOpenChange={setStepModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Flag Onboarding Step Roadblock</DialogTitle>
            <DialogDescription className="text-xs">
              Document the blocker halting: {activeStep?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-2">
            <Label className="text-xs font-semibold">Roadblock Details / Required Access</Label>
            <Input
              value={stepBlockerText}
              onChange={(e) => setStepBlockerText(e.target.value)}
              placeholder="e.g. Awaiting client DNS token delegation..."
              className="text-xs bg-background border-border text-foreground h-9"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStepModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStepBlocker} className="bg-primary text-white font-semibold">
              Save Blocker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
