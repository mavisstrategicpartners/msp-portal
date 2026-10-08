import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  OperationEmployee,
  OperationTask,
  ClientOperation,
  OnboardingWorkflow,
  EscalationIssue,
  SalesLead,
  ApprovalRequest,
  OperationCalendarEvent,
} from "./operations-data";

// ─── Row → Domain helpers ────────────────────────────────────────────────────

function rowToTask(r: any): OperationTask {
  return {
    id: r.id,
    title: r.title,
    description: r.description || "",
    clientOrTeam: r.client_or_team || "",
    ownerId: r.owner_id || "",
    ownerName: r.owner_name || "",
    priority: r.priority,
    assignedDate: r.assigned_date,
    deadline: r.deadline,
    status: r.status,
    progress: r.progress,
    reviewer: r.reviewer || "",
    blockReason: r.block_reason || undefined,
    completionDate: r.completion_date || undefined,
    commentsCount: 0,
  };
}

function rowToEscalation(r: any): EscalationIssue {
  return {
    id: r.id,
    title: r.title,
    issueType: r.issue_type,
    clientOrTeam: r.client_or_team || "",
    raisedBy: r.raised_by || "",
    dateRaised: r.date_raised,
    priority: r.priority,
    impact: r.impact,
    owner: r.owner || "",
    targetResolutionDate: r.target_resolution_date || "",
    escalationLevel: r.escalation_level,
    status: r.status,
    actionsTaken: r.actions_taken || "",
  };
}

function rowToLead(r: any): SalesLead {
  return {
    id: r.id,
    businessName: r.business_name,
    contactPerson: r.contact_person || "",
    leadSource: r.lead_source,
    need: r.need || "",
    assignedSalesperson: r.assigned_salesperson || "",
    followUpDate: r.follow_up_date || "",
    stage: r.stage,
    leadQuality: r.lead_quality,
    estimatedValue: Number(r.estimated_value) || 0,
    proposalStatus: r.proposal_status,
    notes: r.notes || "",
  };
}

function rowToOnboarding(r: any): OnboardingWorkflow {
  return {
    id: r.id,
    clientId: r.client_id || r.id,
    clientName: r.client_name,
    accountManager: r.account_manager || "",
    currentStage: r.current_stage,
    stageOwner: r.stage_owner || "",
    dueDate: r.due_date || "",
    completedStages: r.completed_stages || [],
    blocker: r.blocker || undefined,
    progress: r.progress,
  };
}

function rowToApproval(r: any): ApprovalRequest {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    requester: r.requester || "",
    approver: r.approver || "",
    submissionDate: r.submission_date,
    completionDeadline: r.completion_deadline || "",
    status: r.status,
    comments: r.comments || undefined,
    clientOrProject: r.client_or_project || undefined,
  };
}

// ─── Main hook ───────────────────────────────────────────────────────────────

export function useOperationsData() {
  // Existing Supabase tables (read-only derived)
  const [realProfiles, setRealProfiles] = useState<any[]>([]);
  const [realClients, setRealClients] = useState<any[]>([]);
  const [realReports, setRealReports] = useState<any[]>([]);
  const [realLeaves, setRealLeaves] = useState<any[]>([]);
  const [realAttendanceLogs, setRealAttendanceLogs] = useState<any[]>([]);

  // Ops tables — all from Supabase
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [escalations, setEscalations] = useState<EscalationIssue[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingWorkflow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [healthOverrides, setHealthOverrides] = useState<Record<string, { health: "Green" | "Amber" | "Red"; reason: string; nextAction: string; nextActionDue: string }>>({});
  const [calendarEvents] = useState<OperationCalendarEvent[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase — existing company tables + ops tables
  const refreshRealData = useCallback(async () => {
    setLoading(true);
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [
        profilesRes, clientsRes, reportsRes, leavesRes, logsRes,
        tasksRes, escalationsRes, leadsRes, onboardingRes, approvalsRes, healthRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
        supabase.from("clients").select("*, profiles:account_manager_id(full_name, email)").order("name"),
        supabase.from("monthly_reports").select("*").order("reporting_month", { ascending: false }),
        supabase.from("leave_requests").select("*, profiles:user_id(full_name)").order("created_at", { ascending: false }),
        supabase.from("audit_logs").select("actor_id, details, created_at").gte("created_at", startOfDay.toISOString()).like("action", "attendance_%").order("created_at", { ascending: true }),
        supabase.from("ops_tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_escalations").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_onboarding").select("*").order("created_at", { ascending: false }),
        supabase.from("ops_approvals").select("*").order("created_at", { ascending: false }),
        supabase.from("client_health_overrides").select("*"),
      ]);

      if (profilesRes.data) setRealProfiles(profilesRes.data);
      if (clientsRes.data) setRealClients(clientsRes.data);
      if (reportsRes.data) setRealReports(reportsRes.data);
      if (leavesRes.data) setRealLeaves(leavesRes.data);
      if (logsRes.data) setRealAttendanceLogs(logsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data.map(rowToTask));
      if (escalationsRes.data) setEscalations(escalationsRes.data.map(rowToEscalation));
      if (leadsRes.data) setLeads(leadsRes.data.map(rowToLead));
      if (onboardingRes.data) setOnboarding(onboardingRes.data.map(rowToOnboarding));
      if (approvalsRes.data) setApprovals(approvalsRes.data.map(rowToApproval));
      if (healthRes.data) {
        const map: Record<string, { health: "Green" | "Amber" | "Red"; reason: string; nextAction: string; nextActionDue: string }> = {};
        healthRes.data.forEach((h: any) => {
          map[h.client_id] = { health: h.health, reason: h.reason || "", nextAction: h.next_action || "", nextActionDue: h.next_action_due || "" };
        });
        setHealthOverrides(map);
      }
    } catch (e) {
      console.warn("Failed to load operations data from Supabase:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRealData();
  }, [refreshRealData]);

  // Compute live employees from real profiles & real today's attendance logs
  const employees: OperationEmployee[] = useMemo(() => {
    const statusMap = new Map<string, any>();
    realAttendanceLogs.forEach((log) => {
      if (log.actor_id) statusMap.set(log.actor_id, log.details);
    });

    const activeLeavesSet = new Set(
      realLeaves
        .filter((l) => l.status === "approved" || l.status === "pending")
        .map((l) => l.user_id)
    );

    return realProfiles.map((p) => {
      const live = statusMap.get(p.id);
      const isClockedIn = live?.state === "Clocked In";
      const isOnBreak = live?.state === "On Break";
      const isOnLeave = activeLeavesSet.has(p.id);

      let status: OperationEmployee["attendanceStatus"] = "Absent";
      if (isClockedIn || isOnBreak) {
        status = "Present";
      } else if (isOnLeave) {
        status = "Approved Leave";
      } else if (live?.state === "Clocked Out") {
        status = "Early Departure";
      }

      let clockInTime: string | undefined = undefined;
      if (live?.clock_in_time) {
        clockInTime = new Date(live.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      // Compute task stats for this real employee
      const empTasks = tasks.filter((t) => t.ownerId === p.id || t.ownerName === p.full_name || t.ownerName === p.email);
      const completed = empTasks.filter((t) => t.status === "Completed").length;
      const overdue = empTasks.filter((t) => t.status === "Overdue").length;
      const blocked = empTasks.filter((t) => t.status === "Blocked").length;
      const adherence = empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 100;

      return {
        id: p.id,
        name: p.full_name || p.email.split("@")[0].replace(".", " "),
        role: p.job_title || "Team Member",
        department: p.department || "General",
        email: p.email,
        attendanceStatus: status,
        clockInTime,
        leaveBalanceDays: 15,
        completedTasksCount: completed,
        overdueTasksCount: overdue,
        blockedTasksCount: blocked,
        adherenceRate: adherence,
        avatar: p.avatar_url,
      };
    });
  }, [realProfiles, realAttendanceLogs, realLeaves, tasks]);

  // Compute live client operations from real Supabase clients & reports
  const clients: ClientOperation[] = useMemo(() => {
    return realClients.map((c) => {
      const override = healthOverrides[c.id];
      const clientReports = realReports.filter((r) => r.client_id === c.id);
      const overdueReps = clientReports.filter((r) => r.status === "draft" || r.status === "internal_review").length;
      const openEscs = escalations.filter((e) => (e.clientOrTeam === c.name || e.clientOrTeam.toLowerCase().includes(c.name.toLowerCase())) && e.status !== "Resolved" && e.status !== "Closed").length;
      const clientTasks = tasks.filter((t) => t.clientOrTeam === c.name && t.status !== "Completed").length;

      let defaultHealth: "Green" | "Amber" | "Red" = "Green";
      let defaultReason = "Operational delivery progressing on schedule.";
      if (openEscs > 0) {
        defaultHealth = "Red";
        defaultReason = `${openEscs} open escalation flagged on this account.`;
      } else if (overdueReps > 0 || clientTasks > 3) {
        defaultHealth = "Amber";
        defaultReason = `${overdueReps} reports pending sign-off.`;
      }

      return {
        id: c.id,
        name: c.name,
        accountManager: c.profiles?.full_name || "Unassigned",
        package: c.active_package || "Standard Retainer",
        startDate: c.created_at ? c.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
        contractStatus: "Active",
        health: override?.health || defaultHealth,
        healthReason: override?.reason || defaultReason,
        nextAction: override?.nextAction || "Review monthly KPIs and deliverable timeline",
        nextActionDue: override?.nextActionDue || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        openDeliverablesCount: clientTasks,
        overdueReportsCount: overdueReps,
        openEscalationsCount: openEscs,
        renewalDate: "2026-12-31",
      };
    });
  }, [realClients, realReports, escalations, tasks, healthOverrides]);

  // Operational metrics computed from REAL data
  const metrics = useMemo(() => {
    const totalEmployees = employees.length;
    const present = employees.filter((e) => e.attendanceStatus === "Present").length;
    const late = employees.filter((e) => e.attendanceStatus === "Late").length;
    const absent = employees.filter((e) => e.attendanceStatus === "Absent" || e.attendanceStatus === "Unexplained Absence").length;
    const onLeave = employees.filter((e) => e.attendanceStatus === "Approved Leave").length;

    const todayStr = new Date().toISOString().split("T")[0];
    const tasksDueToday = tasks.filter((t) => t.deadline === todayStr && t.status !== "Completed").length;
    const overdueTasks = tasks.filter((t) => t.status === "Overdue" || (t.deadline < todayStr && t.status !== "Completed")).length;
    const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;
    const awaitingReviewTasks = tasks.filter((t) => t.status === "Awaiting Review").length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;

    const atRiskClients = clients.filter((c) => c.health === "Red" || c.health === "Amber").length;
    const openEscalations = escalations.filter((e) => e.status !== "Resolved" && e.status !== "Closed").length;
    const outstandingDeliverables = clients.reduce((acc, c) => acc + c.openDeliverablesCount, 0);

    const newLeadsCount = leads.filter((l) => l.stage === "New").length;
    const pendingProposals = leads.filter((l) => l.stage === "Proposal Sent" || l.proposalStatus === "Sent").length;
    const followUpsDue = leads.filter((l) => l.followUpDate <= todayStr && l.stage !== "Won" && l.stage !== "Lost").length;
    const pipelineValue = leads.reduce((acc, l) => (l.stage !== "Lost" ? acc + (l.estimatedValue || 0) : acc), 0);

    const pendingApprovals = approvals.filter((a) => a.status === "Pending Review").length;

    // Action Required list built from real items
    const actionRequired: {
      id: string;
      title: string;
      category: "Escalation" | "Overdue Task" | "Approval" | "Lead Follow-up" | "Report";
      priority: "Urgent" | "High" | "Medium";
      responsible: string;
      deadline: string;
      clientOrTarget: string;
    }[] = [];

    escalations
      .filter((e) => e.status !== "Resolved" && e.status !== "Closed")
      .forEach((e) => {
        actionRequired.push({
          id: `act-esc-${e.id}`,
          title: `[Escalation] ${e.title}`,
          category: "Escalation",
          priority: e.priority === "Urgent" ? "Urgent" : "High",
          responsible: e.owner,
          deadline: e.targetResolutionDate,
          clientOrTarget: e.clientOrTeam,
        });
      });

    tasks
      .filter((t) => t.status === "Blocked" || t.status === "Overdue")
      .forEach((t) => {
        actionRequired.push({
          id: `act-tsk-${t.id}`,
          title: `[${t.status}] ${t.title}`,
          category: "Overdue Task",
          priority: t.priority === "Urgent" ? "Urgent" : "High",
          responsible: t.ownerName,
          deadline: t.deadline,
          clientOrTarget: t.clientOrTeam,
        });
      });

    approvals
      .filter((a) => a.status === "Pending Review")
      .forEach((a) => {
        actionRequired.push({
          id: `act-app-${a.id}`,
          title: `[Approval Needed] ${a.title}`,
          category: "Approval",
          priority: "High",
          responsible: a.approver,
          deadline: a.completionDeadline,
          clientOrTarget: a.clientOrProject || "Internal",
        });
      });

    return {
      people: { total: totalEmployees, present, late, absent, onLeave },
      work: { dueToday: tasksDueToday, overdue: overdueTasks, blocked: blockedTasks, awaitingReview: awaitingReviewTasks, completed: completedTasks, total: tasks.length },
      clients: { atRisk: atRiskClients, openDeliverables: outstandingDeliverables, openEscalations, total: clients.length },
      sales: { newLeads: newLeadsCount, proposalsPending: pendingProposals, followUpsDue, pipelineValue, totalLeads: leads.length },
      approvals: { waiting: pendingApprovals },
      reports: { overdue: 0, submitted: 0, total: realReports.length },
      actionRequired: actionRequired.slice(0, 8),
    };
  }, [employees, tasks, clients, escalations, leads, approvals, realReports]);

  // ── Mutators — all write to Supabase then sync local state ──────────────────

  const addTask = async (newTask: Omit<OperationTask, "id" | "commentsCount">) => {
    await supabase.from("ops_tasks").insert({
      title: newTask.title,
      description: newTask.description || null,
      client_or_team: newTask.clientOrTeam,
      owner_id: newTask.ownerId || null,
      owner_name: newTask.ownerName,
      priority: newTask.priority,
      assigned_date: newTask.assignedDate,
      deadline: newTask.deadline,
      status: newTask.status,
      progress: newTask.progress,
      reviewer: newTask.reviewer || null,
      block_reason: newTask.blockReason || null,
    });
    const { data } = await supabase.from("ops_tasks").select("*").order("created_at", { ascending: false });
    if (data) setTasks(data.map(rowToTask));
  };

  const updateTask = async (id: string, patch: Partial<OperationTask>) => {
    await supabase.from("ops_tasks").update({
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.clientOrTeam !== undefined && { client_or_team: patch.clientOrTeam }),
      ...(patch.ownerName !== undefined && { owner_name: patch.ownerName }),
      ...(patch.priority !== undefined && { priority: patch.priority }),
      ...(patch.deadline !== undefined && { deadline: patch.deadline }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.progress !== undefined && { progress: patch.progress }),
      ...(patch.blockReason !== undefined && { block_reason: patch.blockReason }),
    }).eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addEscalation = async (newEsc: Omit<EscalationIssue, "id">) => {
    await supabase.from("ops_escalations").insert({
      title: newEsc.title,
      issue_type: newEsc.issueType,
      client_or_team: newEsc.clientOrTeam,
      raised_by: newEsc.raisedBy,
      date_raised: newEsc.dateRaised,
      priority: newEsc.priority,
      impact: newEsc.impact,
      owner: newEsc.owner,
      target_resolution_date: newEsc.targetResolutionDate || null,
      escalation_level: newEsc.escalationLevel,
      status: newEsc.status,
      actions_taken: newEsc.actionsTaken || null,
    });
    const { data } = await supabase.from("ops_escalations").select("*").order("created_at", { ascending: false });
    if (data) setEscalations(data.map(rowToEscalation));
  };

  const updateEscalation = async (id: string, patch: Partial<EscalationIssue>) => {
    await supabase.from("ops_escalations").update({
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.actionsTaken !== undefined && { actions_taken: patch.actionsTaken }),
      ...(patch.owner !== undefined && { owner: patch.owner }),
    }).eq("id", id);
    setEscalations((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const addLead = async (newLead: Omit<SalesLead, "id">) => {
    await supabase.from("ops_leads").insert({
      business_name: newLead.businessName,
      contact_person: newLead.contactPerson || null,
      lead_source: newLead.leadSource,
      need: newLead.need || null,
      assigned_salesperson: newLead.assignedSalesperson,
      follow_up_date: newLead.followUpDate || null,
      stage: newLead.stage,
      lead_quality: newLead.leadQuality,
      estimated_value: newLead.estimatedValue,
      proposal_status: newLead.proposalStatus,
      notes: newLead.notes || null,
    });
    const { data } = await supabase.from("ops_leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data.map(rowToLead));
  };

  const updateLead = async (id: string, patch: Partial<SalesLead>) => {
    await supabase.from("ops_leads").update({
      ...(patch.stage !== undefined && { stage: patch.stage }),
      ...(patch.proposalStatus !== undefined && { proposal_status: patch.proposalStatus }),
      ...(patch.followUpDate !== undefined && { follow_up_date: patch.followUpDate }),
      ...(patch.notes !== undefined && { notes: patch.notes }),
    }).eq("id", id);

    // If won, create onboarding pipeline in Supabase
    if (patch.stage === "Won") {
      const lead = leads.find((l) => l.id === id);
      if (lead) {
        const { data: existing } = await supabase.from("ops_onboarding").select("id").eq("client_name", lead.businessName);
        if (!existing || existing.length === 0) {
          await supabase.from("ops_onboarding").insert({
            client_name: lead.businessName,
            account_manager: lead.assignedSalesperson || "Account Manager",
            current_stage: "Payment Confirmation",
            stage_owner: "Operations & Finance",
            due_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
            completed_stages: ["Lead Won", "Contract Signed"],
            progress: 20,
          });
          const { data } = await supabase.from("ops_onboarding").select("*").order("created_at", { ascending: false });
          if (data) setOnboarding(data.map(rowToOnboarding));
        }
      }
    }

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const updateApproval = async (id: string, status: ApprovalRequest["status"]) => {
    await supabase.from("ops_approvals").update({ status }).eq("id", id);
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateClientHealth = async (id: string, health: ClientOperation["health"], reason: string, nextAction: string) => {
    const nextActionDue = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    await supabase.from("client_health_overrides").upsert(
      { client_id: id, health, reason, next_action: nextAction, next_action_due: nextActionDue },
      { onConflict: "client_id" }
    );
    setHealthOverrides((prev) => ({ ...prev, [id]: { health, reason, nextAction, nextActionDue } }));
  };

  const updateOnboardingStage = async (id: string, currentStage: OnboardingWorkflow["currentStage"], progress: number) => {
    const current = onboarding.find((o) => o.id === id);
    if (!current) return;
    const completedStages = Array.from(new Set([...current.completedStages, current.currentStage]));
    await supabase.from("ops_onboarding").update({
      current_stage: currentStage,
      completed_stages: completedStages,
      progress,
    }).eq("id", id);
    setOnboarding((prev) => prev.map((o) => (o.id === id ? { ...o, currentStage, completedStages, progress } : o)));
  };

  return {
    employees,
    tasks,
    clients,
    onboarding,
    escalations,
    leads,
    approvals,
    calendarEvents,
    metrics,
    loading,
    refreshRealData,
    addTask,
    updateTask,
    addEscalation,
    updateEscalation,
    addLead,
    updateLead,
    updateApproval,
    updateClientHealth,
    updateOnboardingStage,
  };
}
