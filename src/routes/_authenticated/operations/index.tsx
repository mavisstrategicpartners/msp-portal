import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity, Users, ClipboardCheck, Clock, AlertTriangle, ShieldAlert,
  CheckCircle2, ArrowRight, Search, Filter, RefreshCw, FileText,
  Calendar, Building2, Eye, UserCheck, AlertCircle, ArrowUpRight,
} from "lucide-react";
import {
  fetchAuthoritativeOperationsData,
  RealClient,
  RealDeliverable,
  ClientWorkflowStage,
  ClientOnboardingRecord,
  ServiceDeadlineItem,
  ClientRecoveryPlan,
  VerificationItem,
  OperationalEscalation,
  ClientCommunicationRecord,
} from "@/lib/operations-manager.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/operations/")({
  head: () => ({ meta: [{ title: "Operations Dashboard — MSP Operations & Relationships" }] }),
  component: OperationsDashboardOverviewPage,
});

export function OperationsDashboardOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [clients, setClients] = useState<RealClient[]>([]);
  const [reports, setReports] = useState<RealDeliverable[]>([]);
  const [workflows, setWorkflows] = useState<ClientWorkflowStage[]>([]);
  const [onboarding, setOnboarding] = useState<ClientOnboardingRecord[]>([]);
  const [deadlines, setDeadlines] = useState<ServiceDeadlineItem[]>([]);
  const [communications, setCommunications] = useState<ClientCommunicationRecord[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<ClientRecoveryPlan[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [escalations, setEscalations] = useState<OperationalEscalation[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthoritativeOperationsData();
      setClients(data.realClients);
      setReports(data.realReports);
      setWorkflows(data.workflows);
      setOnboarding(data.onboarding);
      setDeadlines(data.deadlines);
      setCommunications(data.communications);
      setRecoveryPlans(data.recoveryPlans);
      setVerifications(data.verifications);
      setEscalations(data.escalations);
    } catch (err: any) {
      toast.error("Failed to load operations metrics", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute database-derived metrics
  const activeClientsCount = clients.length;
  const onboardingClientsCount = onboarding.filter((o) => o.stage !== "Completed Onboarding").length;
  const onboardingOverdueCount = onboarding.filter(
    (o) => o.escalationStatus === "Overdue Blocker" || new Date(o.targetCompletionDate) < new Date()
  ).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const approachingDeadlinesCount = deadlines.filter((d) => {
    if (d.status === "Accepted Completion") return false;
    const diffDays = Math.ceil((new Date(d.currentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const overdueDeliverablesCount = deadlines.filter(
    (d) => d.status !== "Accepted Completion" && d.currentDeadline < todayStr
  ).length;

  const communicationFollowUpsDueCount = communications.filter(
    (c) => c.nextCommunicationDate <= todayStr || c.hasUnresolvedComplaint
  ).length;

  const activeRecoveryPlansCount = recoveryPlans.filter(
    (r) => r.status === "Active" || r.status === "At Risk" || r.status === "Escalated"
  ).length;

  const awaitingVerificationCount = verifications.filter(
    (v) => v.currentStatus === "Pending Verification" || v.currentStatus === "Additional Evidence Requested"
  ).length;

  const unresolvedEscalationsCount = escalations.filter((e) => e.status !== "Resolved").length;

  // Build unified Priority Action Queue ordered by severity, impact, and due date
  const priorityQueue = useMemo(() => {
    const queue: {
      id: string;
      category: "Escalation" | "Verification" | "Recovery" | "Onboarding" | "Service Deadline";
      clientOrRecord: string;
      issue: string;
      owner: string;
      priority: "Urgent" | "High" | "Medium" | "Low";
      businessImpact: string;
      dateRaised: string;
      dueDate: string;
      status: string;
      nextRecommendedAction: string;
      linkTo: string;
    }[] = [];

    // 1. Unresolved Escalations
    escalations
      .filter((e) => e.status !== "Resolved")
      .forEach((e) => {
        queue.push({
          id: `q-esc-${e.id}`,
          category: "Escalation",
          clientOrRecord: e.clientOrRecord,
          issue: e.title,
          owner: e.currentOwner,
          priority: e.priority,
          businessImpact: e.businessImpact,
          dateRaised: e.dateRaised,
          dueDate: e.targetResolutionDate,
          status: e.status,
          nextRecommendedAction: e.nextAction,
          linkTo: "/operations/escalations",
        });
      });

    // 2. Pending Verifications
    verifications
      .filter((v) => v.currentStatus === "Pending Verification")
      .forEach((v) => {
        queue.push({
          id: `q-ver-${v.id}`,
          category: "Verification",
          clientOrRecord: v.clientName,
          issue: `Verification Pending: ${v.recordTitle}`,
          owner: v.assignedReviewer,
          priority: "High",
          businessImpact: "High (Delivery Milestone Handover)",
          dateRaised: v.submittedDate,
          dueDate: v.dueDate,
          status: v.currentStatus,
          nextRecommendedAction: "Conduct QA verification against specifications and record approval",
          linkTo: "/operations/verifications",
        });
      });

    // 3. Active Recovery Plans
    recoveryPlans
      .filter((r) => r.status === "Active" || r.status === "At Risk")
      .forEach((r) => {
        queue.push({
          id: `q-rec-${r.id}`,
          category: "Recovery",
          clientOrRecord: r.clientName,
          issue: `Account Intervention: ${r.reasonForConcern}`,
          owner: r.accountOwner,
          priority: r.status === "At Risk" ? "Urgent" : "High",
          businessImpact: "Critical (Client Retention & Trust)",
          dateRaised: r.createdAt.split("T")[0],
          dueDate: r.milestones[0]?.deadline || r.reviewDates[0] || todayStr,
          status: r.status,
          nextRecommendedAction: r.agreedCorrectiveActions[0] || "Review milestone progress with account team",
          linkTo: "/operations/recovery",
        });
      });

    // 4. Onboarding Blockers
    onboarding
      .filter((o) => o.blocker && o.stage !== "Completed Onboarding")
      .forEach((o) => {
        queue.push({
          id: `q-onb-${o.id}`,
          category: "Onboarding",
          clientOrRecord: o.clientName,
          issue: `Onboarding Blocker: ${o.blocker}`,
          owner: o.assignedOwner,
          priority: "High",
          businessImpact: "Moderate (Launch Delay)",
          dateRaised: o.startDate,
          dueDate: o.targetCompletionDate,
          status: o.escalationStatus,
          nextRecommendedAction: "Follow up directly with client technical contact to clear access roadblock",
          linkTo: "/operations/onboarding",
        });
      });

    // 5. Overdue / Upcoming Deadlines
    deadlines
      .filter((d) => d.status !== "Accepted Completion")
      .forEach((d) => {
        const isOverdue = d.currentDeadline < todayStr;
        queue.push({
          id: `q-dl-${d.id}`,
          category: "Service Deadline",
          clientOrRecord: d.clientName,
          issue: `${d.deliverableName} (${d.serviceName})`,
          owner: d.accountablePerson,
          priority: isOverdue ? "Urgent" : d.commitmentRisk === "High" ? "High" : "Medium",
          businessImpact: isOverdue ? "Critical (SLA Breach)" : "Moderate (Client Expectation)",
          dateRaised: d.originalDeadline,
          dueDate: d.currentDeadline,
          status: d.status,
          nextRecommendedAction: isOverdue
            ? "Escalate delay and agree on formal deadline adjustment"
            : "Review deliverable progress with department lead",
          linkTo: "/operations/deadlines",
        });
      });

    // Sort: Urgent -> High -> Medium -> Low, then by due date ascending
    const priorityWeight: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    return queue.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [escalations, verifications, recoveryPlans, onboarding, deadlines, todayStr]);

  const filteredQueue = useMemo(() => {
    return priorityQueue.filter((item) => {
      const matchSearch =
        search === "" ||
        item.clientOrRecord.toLowerCase().includes(search.toLowerCase()) ||
        item.issue.toLowerCase().includes(search.toLowerCase()) ||
        item.owner.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "all" || item.priority.toLowerCase() === priorityFilter.toLowerCase();
      return matchSearch && matchPriority;
    });
  }, [priorityQueue, search, priorityFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-[#3b1d4d]/90 via-[#2d123d] to-[#1e0a29] p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 uppercase tracking-wider text-[10px]">
                Operations & Relationship Command
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
                Authoritative Database Connected
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Operations & Relationship Manager Workspace
            </h1>
            <p className="mt-1 text-sm text-purple-200/80 max-w-3xl">
              Live operational telemetry covering client lifecycles, service deadlines, QA verification queues, retention recovery plans, and cross-department escalations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow"
              onClick={() => navigate({ to: "/operations/verifications" as any })}
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Verification Queue ({awaitingVerificationCount})
            </Button>
          </div>
        </div>
      </div>

      {/* My attendance (clock in / out) */}
      <StaffAttendanceWidget />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {/* Metric 1 */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/workflows" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Clients</CardDescription>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Authoritative database client records <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/onboarding" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Clients Onboarding</CardDescription>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{onboardingClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Active intake & setup stages <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card
          className="border-border hover:border-rose-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/onboarding" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Onboarding Steps Overdue</CardDescription>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${onboardingOverdueCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
              {onboardingOverdueCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {onboardingOverdueCount > 0 ? "Pending technical & access blockers" : "All steps within target window"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card
          className="border-border hover:border-amber-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/deadlines" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Approaching Deadlines</CardDescription>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{approachingDeadlinesCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Deliverables due within 7 days <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 5 */}
        <Card
          className="border-border hover:border-rose-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/deadlines" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Overdue Deliverables</CardDescription>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueDeliverablesCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
              {overdueDeliverablesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Requires immediate SLA review <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 6 */}
        <Card
          className="border-border hover:border-primary/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/communications" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Client Follow-Ups Due</CardDescription>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{communicationFollowUpsDueCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Promised touchpoints & complaints <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 7 */}
        <Card
          className="border-border hover:border-amber-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/recovery" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Recovery Plans</CardDescription>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeRecoveryPlansCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Retention interventions for at-risk accounts <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 8 */}
        <Card
          className="border-border hover:border-indigo-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/verifications" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Awaiting Verification</CardDescription>
            <ClipboardCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${awaitingVerificationCount > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-foreground"}`}>
              {awaitingVerificationCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Deliverables awaiting QA validation <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Metric 9 */}
        <Card
          className="border-border hover:border-rose-500/50 transition cursor-pointer bg-card shadow-sm"
          onClick={() => navigate({ to: "/operations/escalations" as any })}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Unresolved Escalations</CardDescription>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unresolvedEscalationsCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
              {unresolvedEscalationsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Active operational roadblocks <ArrowUpRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Action Queue Section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Priority Action Queue
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Urgent operational matters prioritized by severity, business impact, and due date.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter queue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs h-9 bg-background border-input text-foreground"
                />
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No operational action items matching the current filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-3">Client / Record</th>
                    <th className="py-3 px-3">Issue / Required Action</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Accountable Owner</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Business Impact</th>
                    <th className="py-3 px-3">Next Step</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQueue.map((item) => {
                    const isUrgent = item.priority === "Urgent";
                    const isHigh = item.priority === "High";
                    const isOverdue = item.dueDate < todayStr;

                    return (
                      <tr key={item.id} className="hover:bg-muted/40 transition">
                        <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                          {item.clientOrRecord}
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground max-w-xs truncate" title={item.issue}>
                          {item.issue}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[11px] whitespace-nowrap border-border bg-muted/60 text-foreground font-medium rounded-full px-2.5 py-0.5 shadow-none">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[11px] whitespace-nowrap font-medium rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-none ${
                              isUrgent
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                                : isHigh
                                ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              isUrgent ? "bg-rose-500" : isHigh ? "bg-amber-500" : "bg-blue-500"
                            }`} />
                            {item.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground whitespace-nowrap font-medium">
                          {item.owner}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={isOverdue ? "text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground font-medium"}>
                            {item.dueDate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground max-w-xs truncate font-medium" title={item.businessImpact}>
                          {item.businessImpact}
                        </td>
                        <td className="py-3 px-3 text-purple-950 dark:text-purple-200 font-semibold max-w-sm truncate" title={item.nextRecommendedAction}>
                          {item.nextRecommendedAction}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border bg-background hover:bg-muted text-foreground font-semibold shadow-xs px-2.5 cursor-pointer"
                            onClick={() => navigate({ to: item.linkTo as any })}
                          >
                            Open Record
                            <ArrowRight className="ml-1 h-3 w-3 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
