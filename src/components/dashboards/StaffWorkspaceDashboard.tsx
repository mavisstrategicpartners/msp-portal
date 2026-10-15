import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  Square,
  Upload,
  CalendarDays,
  Award,
  Link as LinkIcon,
  HelpCircle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  User,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Bell,
  Check,
  XCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  GitBranch,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Send,
  MessageSquare,
  FileCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  BarChart3,
  Flame,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { useProfile } from "@/lib/use-profile";
import {
  useStaffTasks,
  useUpdateStaffTask,
  useStaffDependencies,
  useCreateDependencyRequest,
  useUpdateDependencyRequest,
  useStaffEvidence,
  useSubmitEvidence,
  useReviewEvidence,
  useStaffScorecard,
  useStaffNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  uploadEvidenceFile,
} from "@/lib/staff-tasks.service";
import {
  StaffTask,
  DependencyRequest,
  EvidenceSubmission,
  TaskPriority,
  TaskStatus,
  DependencyStatus,
  EvidenceReviewStatus,
} from "@/lib/staff-tasks.types";

export function StaffWorkspaceDashboard() {
  const { data: profileData } = useProfile();
  const userName = profileData?.profile?.full_name || "Team Member";
  const userRole = profileData?.profile?.job_title || "Specialist";
  const department = profileData?.profile?.department || "Operations";
  const isManagerOrAbove = profileData?.isManagerOrAbove || false;

  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "deadlines" | "dependencies" | "evidence" | "scorecard" | "notifications"
  >("overview");

  // Queries
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useStaffTasks();
  const { data: dependencies = [], isLoading: depsLoading, refetch: refetchDeps } = useStaffDependencies();
  const { data: evidenceList = [], isLoading: evidenceLoading, refetch: refetchEvidence } = useStaffEvidence();
  const { data: scorecard, isLoading: scorecardLoading, refetch: refetchScorecard } = useStaffScorecard();
  const { data: notifData, refetch: refetchNotifs } = useStaffNotifications();

  const notifications = notifData?.notifications || [];
  const unreadNotifCount = notifData?.unreadCount || 0;

  // Mutations
  const updateTaskMutation = useUpdateStaffTask();
  const createDependencyMutation = useCreateDependencyRequest();
  const updateDependencyMutation = useUpdateDependencyRequest();
  const submitEvidenceMutation = useSubmitEvidence();
  const reviewEvidenceMutation = useReviewEvidence();
  const markNotifReadMutation = useMarkNotificationRead();
  const markAllNotifsReadMutation = useMarkAllNotificationsRead();

  // Task Filters
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  // Task Details Modal State
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Blocker / Dependency Request Modal State
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [depTaskId, setDepTaskId] = useState("");
  const [depBlockerDesc, setDepBlockerDesc] = useState("");
  const [depNeededResource, setDepNeededResource] = useState("");
  const [depDepartment, setDepDepartment] = useState("Operations");
  const [depUrgency, setDepUrgency] = useState<TaskPriority>("High");
  const [depDueDate, setDepDueDate] = useState("");
  const [isSubmittingDep, setIsSubmittingDep] = useState(false);

  // Evidence Submission Modal State
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceTaskId, setEvidenceTaskId] = useState("");
  const [evidenceLinkTitle, setEvidenceLinkTitle] = useState("");
  const [evidenceLinkUrl, setEvidenceLinkUrl] = useState("");
  const [evidenceExplanation, setEvidenceExplanation] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; url: string; size: number; mimeType: string }[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Review Evidence Modal State (Managers)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSubmission | null>(null);
  const [reviewDecision, setReviewDecision] = useState<EvidenceReviewStatus>("Approved");
  const [reviewerFeedback, setReviewerFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Live Timer Tracker
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (activeTimerTaskId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerTaskId]);

  const toggleTimer = (taskId: string) => {
    if (activeTimerTaskId === taskId) {
      const loggedMinutes = Math.round(timerSeconds / 60);
      toast.success(`Logged ${loggedMinutes} minutes on task.`);
      setActiveTimerTaskId(null);
      setTimerSeconds(0);
    } else {
      setActiveTimerTaskId(taskId);
      setTimerSeconds(0);
      toast.info("Timer active: live work tracking initiated.");
    }
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.clientName || "").toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.assignedByName.toLowerCase().includes(taskSearch.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesDept = deptFilter === "all" || t.department === deptFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });
  }, [tasks, taskSearch, statusFilter, priorityFilter, deptFilter]);

  // Deadline Categories
  const deadlineCategories = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const overdue: StaffTask[] = [];
    const dueToday: StaffTask[] = [];
    const dueThisWeek: StaffTask[] = [];
    const upcoming: StaffTask[] = [];
    const completed: StaffTask[] = [];
    const noDueDate: StaffTask[] = [];

    const weekFromNow = new Date(Date.now() + 7 * 86400000);

    tasks.forEach((t) => {
      if (t.status === "Completed") {
        completed.push(t);
        return;
      }

      if (!t.dueDate) {
        noDueDate.push(t);
        return;
      }

      const due = new Date(t.dueDate);
      const dueDateStr = t.dueDate.split("T")[0];

      if (dueDateStr === todayStr) {
        dueToday.push(t);
      } else if (due < now) {
        overdue.push(t);
      } else if (due <= weekFromNow) {
        dueThisWeek.push(t);
      } else {
        upcoming.push(t);
      }
    });

    return { overdue, dueToday, dueThisWeek, upcoming, completed, noDueDate };
  }, [tasks]);

  // Handlers: Task Status & Notes
  const handleOpenTask = (task: StaffTask) => {
    setSelectedTask(task);
    setNewProgressNote("");
    setTaskDetailsOpen(true);
  };

  const handleUpdateStatus = async (newStatus: TaskStatus) => {
    if (!selectedTask) return;
    setIsUpdatingProgress(true);
    try {
      await updateTaskMutation.mutateAsync({
        taskId: selectedTask.id,
        status: newStatus,
      });
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(`Task status updated to "${newStatus}".`);
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleAddProgressNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newProgressNote.trim()) return;
    setIsUpdatingProgress(true);
    try {
      await updateTaskMutation.mutateAsync({
        taskId: selectedTask.id,
        note: newProgressNote.trim(),
      });
      const addedNote = {
        id: `note-${Date.now()}`,
        authorId: profileData?.user?.id || "user",
        authorName: userName,
        authorRole: userRole,
        note: newProgressNote.trim(),
        createdAt: new Date().toISOString(),
      };
      setSelectedTask((prev) => (prev ? { ...prev, progressNotes: [...(prev.progressNotes || []), addedNote] } : null));
      setNewProgressNote("");
      toast.success("Progress note logged.");
    } catch (err: any) {
      toast.error("Failed to log note", { description: err.message });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Handlers: Dependencies
  const handleOpenNewDependency = (task?: StaffTask) => {
    setDepTaskId(task?.id || (tasks[0]?.id ?? ""));
    setDepBlockerDesc(task?.blockReason || "");
    setDepNeededResource("");
    setDepDepartment(task?.department || "Operations");
    setDepUrgency(task?.priority || "High");
    setDepDueDate(task?.dueDate || "");
    setDepModalOpen(true);
  };

  const handleSubmitDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depTaskId || !depBlockerDesc.trim() || !depNeededResource.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmittingDep(true);
    try {
      await createDependencyMutation.mutateAsync({
        taskId: depTaskId,
        recipientDepartment: depDepartment,
        blockerDescription: depBlockerDesc.trim(),
        neededResource: depNeededResource.trim(),
        urgency: depUrgency,
        requestedByDate: depDueDate || null,
      });
      toast.success("Dependency request submitted.", {
        description: `Escalated to ${depDepartment}. Linked task marked as Blocked.`,
      });
      setDepModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to submit request", { description: err.message });
    } finally {
      setIsSubmittingDep(false);
    }
  };

  // Handlers: Evidence
  const handleOpenEvidenceModal = (task?: StaffTask) => {
    setEvidenceTaskId(task?.id || (tasks[0]?.id ?? ""));
    setEvidenceLinkTitle("");
    setEvidenceLinkUrl("");
    setEvidenceExplanation("");
    setEvidenceFiles([]);
    setEvidenceModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !evidenceTaskId) return;

    setIsUploadingFile(true);
    try {
      const uploaded = await uploadEvidenceFile(file, evidenceTaskId);
      setEvidenceFiles((prev) => [...prev, uploaded]);
      toast.success(`Uploaded ${file.name} successfully.`);
    } catch (err: any) {
      toast.error("File upload failed", { description: err.message });
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTaskId) {
      toast.error("Please choose a task.");
      return;
    }

    const links = evidenceLinkUrl.trim()
      ? [{ title: evidenceLinkTitle.trim() || "Deliverable Asset Link", url: evidenceLinkUrl.trim() }]
      : [];

    if (!evidenceExplanation.trim() && links.length === 0 && evidenceFiles.length === 0) {
      toast.error("Please provide written explanation, links, or uploaded files.");
      return;
    }

    setIsSubmittingEvidence(true);
    try {
      await submitEvidenceMutation.mutateAsync({
        taskId: evidenceTaskId,
        deliverableLinks: links,
        uploadedFiles: evidenceFiles,
        writtenExplanation: evidenceExplanation.trim(),
        status: "Submitted for Review",
      });
      toast.success("Evidence submitted for manager QA inspection.", {
        description: "Your manager has been notified to review your submission.",
      });
      setEvidenceModalOpen(false);
    } catch (err: any) {
      toast.error("Submission failed", { description: err.message });
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleOpenReview = (ev: EvidenceSubmission) => {
    setSelectedEvidence(ev);
    setReviewDecision("Approved");
    setReviewerFeedback("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedEvidence) return;
    if (reviewDecision === "Changes Requested" && !reviewerFeedback.trim()) {
      toast.error("Please provide clear feedback explaining requested changes.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewEvidenceMutation.mutateAsync({
        evidenceId: selectedEvidence.id,
        status: reviewDecision,
        reviewerFeedback: reviewerFeedback.trim(),
      });
      toast.success(
        reviewDecision === "Approved"
          ? "Deliverable approved and marked Complete."
          : "Changes requested. Returned to staff member for rework."
      );
      setReviewModalOpen(false);
    } catch (err: any) {
      toast.error("Review action failed", { description: err.message });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Eyebrow / Presence Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-xs">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{userName}</h1>
              <Badge variant="outline" className="text-[10px] bg-secondary/50 font-semibold border-border">
                {userRole}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Department: <strong className="text-foreground">{department}</strong> &bull; Assigned Deliverables & Performance Hub
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("notifications")}
            className="h-9 relative text-xs font-semibold gap-1.5 border-border"
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadNotifCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unreadNotifCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenEvidenceModal()}
            className="h-9 bg-primary text-xs font-semibold text-primary-foreground gap-1.5 hover:bg-primary/90 shadow-xs"
          >
            <FileUp className="h-4 w-4" /> Submit Evidence
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenNewDependency()}
            className="h-9 text-xs font-semibold text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5"
          >
            <ShieldAlert className="h-4 w-4" /> Request Dependency
          </Button>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/50 p-1 border border-border h-11 w-full justify-start rounded-xl">
            <TabsTrigger value="overview" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <Layers className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <CheckSquare className="h-3.5 w-3.5" /> Assigned Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <Clock className="h-3.5 w-3.5" /> Deadlines & Tracking
              {deadlineCategories.overdue.length > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.2 font-bold">
                  {deadlineCategories.overdue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <GitBranch className="h-3.5 w-3.5" /> Dependency Requests ({dependencies.length})
            </TabsTrigger>
            <TabsTrigger value="evidence" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <FileCheck className="h-3.5 w-3.5" /> Evidence Submissions ({evidenceList.length})
            </TabsTrigger>
            <TabsTrigger value="scorecard" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <Award className="h-3.5 w-3.5" /> Personal Scorecard
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs font-semibold px-4 gap-1.5 data-[state=active]:bg-card">
              <Bell className="h-3.5 w-3.5" /> Notifications
              {unreadNotifCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.2 font-bold">
                  {unreadNotifCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">My Assigned Tasks</span>
                <CheckSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{tasks.length}</p>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">{tasks.filter((t) => t.status === "Completed").length} done</span>
                &bull;
                <span>{tasks.filter((t) => t.status === "In Progress").length} active</span>
              </div>
            </Card>

            <Card className="p-4 border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Overdue Items</span>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <p className={`text-2xl font-bold mt-2 ${deadlineCategories.overdue.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                {deadlineCategories.overdue.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {deadlineCategories.overdue.length > 0 ? "Requires immediate delivery update" : "All deliverables on schedule"}
              </p>
            </Card>

            <Card className="p-4 border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Awaiting Manager Review</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {tasks.filter((t) => t.status === "Submitted for Review").length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Pending QA sign-off</p>
            </Card>

            <Card className="p-4 border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">On-Time Completion Rate</span>
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {typeof scorecard?.onTimeCompletionRate === "number"
                  ? `${scorecard.onTimeCompletionRate}%`
                  : "Insufficient data"}
              </p>
              {typeof scorecard?.onTimeCompletionRate === "number" && (
                <Progress value={scorecard.onTimeCompletionRate} className="mt-2 h-1.5" />
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Calculated from verified task records</p>
            </Card>
          </div>

          {/* Active Blocker Alert Banner */}
          {tasks.some((t) => t.status === "Blocked") && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Active Roadblock Detected:</strong> You have {tasks.filter((t) => t.status === "Blocked").length} task(s) currently marked as blocked.
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    Dependency requests have been filed with corresponding departments.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("dependencies")}
                className="h-8 text-xs font-semibold border-rose-300 bg-background hover:bg-rose-50 text-rose-700"
              >
                Inspect Blockers
              </Button>
            </div>
          )}

          {/* Main Grid: Work & Live Attendance */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* High Priority Tasks Preview */}
              <Card className="border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" /> Active Urgent & High Priority Deliverables
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Tasks assigned directly to you across all authorized departments.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("tasks")}
                    className="text-xs text-primary font-semibold gap-1"
                  >
                    View All <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status !== "Completed")
                    .slice(0, 3)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-border bg-card space-y-3 transition hover:border-primary/40 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              {task.clientName && (
                                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800">
                                  {task.clientName}
                                </Badge>
                              )}
                              <Badge
                                variant={task.priority === "Urgent" ? "destructive" : task.priority === "High" ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {task.priority}
                              </Badge>
                              <Badge
                                variant={
                                  task.status === "Blocked"
                                    ? "destructive"
                                    : task.status === "Submitted for Review"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[10px]"
                              >
                                {task.status}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-foreground mt-1">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                          </div>

                          <div className="text-right text-xs text-muted-foreground">
                            <p className="font-semibold text-foreground flex items-center gap-1 sm:justify-end">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {task.dueDate ? `Due ${task.dueDate.split("T")[0]}` : "No due date set"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Assigned by: <strong>{task.assignedByName}</strong> ({task.assignedByRole})
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Actions */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <span className="text-[10px] text-muted-foreground">Progress:</span>
                            <Progress value={task.progress} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-bold text-foreground">{task.progress}%</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenTask(task)}
                              className="h-7 text-xs font-semibold px-2.5"
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenEvidenceModal(task)}
                              className="h-7 text-xs bg-primary text-primary-foreground font-semibold px-2.5"
                            >
                              Submit Evidence
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Attendance Widget & Principles */}
            <div className="space-y-6">
              <StaffAttendanceWidget />

              <Card className="p-4 border-border space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" /> Delivery Standards
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    &bull; <strong>Evidence is required:</strong> A deliverable cannot be verified without verifiable URLs, screenshots, or logs.
                  </p>
                  <p>
                    &bull; <strong>Log blockers immediately:</strong> Escalate dependencies early so management can unblock external delays.
                  </p>
                  <p>
                    &bull; <strong>Deadlines count:</strong> Scorecards calculate on-time compliance strictly from agreed completion dates.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: ASSIGNED TASKS
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Filters Bar */}
          <Card className="p-4 border-border shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, assigners, clients..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Submitted for Review">Submitted for Review</SelectItem>
                  <SelectItem value="Changes Requested">Changes Requested</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Priority: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Department: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Media Buying">Media Buying</SelectItem>
                  <SelectItem value="IT Department">IT Department</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Websites & Software">Websites & Software</SelectItem>
                  <SelectItem value="CRM & AI Automation">CRM & AI Automation</SelectItem>
                  <SelectItem value="Creative Content">Creative Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Task Cards List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center border-border shadow-xs">
                <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No assigned tasks found</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You currently have no tasks matching the selected filters.
                </p>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const isTimerRunning = activeTimerTaskId === task.id;
                return (
                  <Card
                    key={task.id}
                    className="p-5 border-border bg-card space-y-4 hover:border-primary/40 transition shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {task.clientName && (
                            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800">
                              {task.clientName}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              task.priority === "Urgent"
                                ? "destructive"
                                : task.priority === "High"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {task.priority}
                          </Badge>
                          <Badge
                            variant={
                              task.status === "Completed"
                                ? "outline"
                                : task.status === "Blocked"
                                ? "destructive"
                                : task.status === "Submitted for Review"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-[10px] ${task.status === "Completed" ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" : ""}`}
                          >
                            {task.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Dept: <strong className="text-foreground">{task.department}</strong>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground">{task.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                      </div>

                      <div className="text-left md:text-right text-xs space-y-1 shrink-0">
                        <div className="font-semibold text-foreground flex items-center gap-1.5 md:justify-end">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {task.dueDate ? `Due ${task.dueDate.split("T")[0]}` : "No due date set"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Assigned by: <strong className="text-foreground">{task.assignedByName}</strong> ({task.assignedByRole})
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Assigned on {new Date(task.assignmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Blocker alert if blocked */}
                    {task.status === "Blocked" && task.blockReason && (
                      <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                        <div>
                          <strong>Active Blocker:</strong> {task.blockReason}
                        </div>
                      </div>
                    )}

                    {/* Changes Requested banner */}
                    {task.status === "Changes Requested" && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Rework Requested:</strong> Reviewer requested changes on your submitted evidence. Please check feedback and resubmit.
                        </div>
                      </div>
                    )}

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Delivery Progress</span>
                        <span className="font-bold text-foreground">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={isTimerRunning ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleTimer(task.id)}
                          className="h-8 text-xs font-semibold gap-1.5"
                        >
                          {isTimerRunning ? (
                            <>
                              <Square className="h-3 w-3 fill-current" /> Stop (
                              {Math.floor(timerSeconds / 60)}:
                              {String(timerSeconds % 60).padStart(2, "0")})
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current" /> Time Tracker
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenTask(task)}
                          className="h-8 text-xs font-semibold"
                        >
                          View Full Details & Notes
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status !== "Blocked" && task.status !== "Completed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenNewDependency(task)}
                            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-semibold"
                          >
                            Report Blocker
                          </Button>
                        )}

                        {task.status !== "Completed" && task.status !== "Submitted for Review" && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenEvidenceModal(task)}
                            className="h-8 bg-primary text-xs font-semibold text-primary-foreground gap-1.5 hover:bg-primary/90"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Submit for Review
                          </Button>
                        )}

                        {task.status === "Submitted for Review" && (
                          <span className="text-xs text-muted-foreground italic flex items-center gap-1 font-medium">
                            <Clock className="h-3.5 w-3.5 text-amber-500" /> Awaiting QA Inspection
                          </span>
                        )}

                        {task.status === "Completed" && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: DEADLINES & TRACKING
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="deadlines" className="space-y-6">
          <div className="space-y-6">
            {/* 1. OVERDUE TASKS */}
            {deadlineCategories.overdue.length > 0 && (
              <Card className="border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                    Overdue Deliverables ({deadlineCategories.overdue.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {deadlineCategories.overdue.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{t.title}</span>
                          <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Assigned by: {t.assignedByName} &bull; Due: <strong className="text-rose-600">{t.dueDate?.split("T")[0]}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleOpenNewDependency(t)} className="h-7 text-xs text-rose-600">
                          Report Blocker
                        </Button>
                        <Button size="sm" onClick={() => handleOpenEvidenceModal(t)} className="h-7 text-xs bg-primary text-white">
                          Submit Evidence
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 2. DUE TODAY */}
            <Card className="border-border p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Due Today ({deadlineCategories.dueToday.length})
                </h3>
              </div>
              {deadlineCategories.dueToday.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No deliverables due today.</p>
              ) : (
                <div className="space-y-2">
                  {deadlineCategories.dueToday.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs">{t.title}</div>
                        <p className="text-[11px] text-muted-foreground">Client: {t.clientName || "Internal"} &bull; Priority: {t.priority}</p>
                      </div>
                      <Button size="sm" onClick={() => handleOpenEvidenceModal(t)} className="h-7 text-xs bg-primary text-white">
                        Submit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 3. DUE THIS WEEK */}
            <Card className="border-border p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Due This Week ({deadlineCategories.dueThisWeek.length})
                </h3>
              </div>
              {deadlineCategories.dueThisWeek.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No additional tasks due this week.</p>
              ) : (
                <div className="space-y-2">
                  {deadlineCategories.dueThisWeek.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs">{t.title}</div>
                        <p className="text-[11px] text-muted-foreground">Due: {t.dueDate?.split("T")[0]} &bull; Assigner: {t.assignedByName}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 4. UPCOMING DEADLINES */}
            <Card className="border-border p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Upcoming Deadlines ({deadlineCategories.upcoming.length})
                </h3>
              </div>
              {deadlineCategories.upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No upcoming tasks scheduled past this week.</p>
              ) : (
                <div className="space-y-2">
                  {deadlineCategories.upcoming.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs">{t.title}</div>
                        <p className="text-[11px] text-muted-foreground">Scheduled Due: {t.dueDate?.split("T")[0]}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 5. TASKS WITHOUT DUE DATE SET */}
            {deadlineCategories.noDueDate.length > 0 && (
              <Card className="border-border p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                    No Due Date Set ({deadlineCategories.noDueDate.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {deadlineCategories.noDueDate.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs">{t.title}</div>
                        <p className="text-[11px] text-muted-foreground">Awaiting authorized date scheduling by {t.assignedByName}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">No due date set</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 6. COMPLETED TASKS */}
            <Card className="border-border p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Completed Deliverables ({deadlineCategories.completed.length})
                </h3>
              </div>
              {deadlineCategories.completed.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No completed tasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {deadlineCategories.completed.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2 opacity-80">
                      <div>
                        <div className="font-bold text-foreground text-xs line-through">{t.title}</div>
                        <p className="text-[11px] text-muted-foreground">Completed on {t.completionDate?.split("T")[0] || "verified date"}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                        Accepted Complete
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: DEPENDENCY REQUESTS
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="dependencies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Dependency Requests & Roadblock Handlers</h3>
              <p className="text-xs text-muted-foreground">
                Request resources, access, or approvals from other teams when work is halted.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenNewDependency()}
              className="bg-primary text-xs font-semibold text-primary-foreground gap-1.5"
            >
              <Plus className="h-4 w-4" /> New Dependency Request
            </Button>
          </div>

          <div className="space-y-3">
            {dependencies.length === 0 ? (
              <Card className="p-12 text-center border-border shadow-xs">
                <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No active dependency requests</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  When a task is blocked on external resources or approvals, create a dependency request here.
                </p>
              </Card>
            ) : (
              dependencies.map((dep) => (
                <Card key={dep.id} className="p-5 border-border bg-card space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            dep.status === "Fulfilled"
                              ? "outline"
                              : dep.status === "Declined"
                              ? "destructive"
                              : "secondary"
                          }
                          className={`text-[10px] ${dep.status === "Fulfilled" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : ""}`}
                        >
                          {dep.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Target: {dep.recipientDepartment}
                        </Badge>
                        <Badge
                          variant={dep.urgency === "Urgent" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {dep.urgency}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mt-1">
                        Task: {dep.taskTitle}
                      </h4>
                      <p className="text-xs text-foreground font-medium mt-1">
                        <strong>Blocker:</strong> {dep.blockerDescription}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <strong>Requested Resource:</strong> {dep.neededResource}
                      </p>
                    </div>

                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <p>Created by {dep.requesterName}</p>
                      <p className="text-[11px] mt-0.5">
                        Requested by: {dep.requestedByDate ? dep.requestedByDate.split("T")[0] : "ASAP"}
                      </p>
                    </div>
                  </div>

                  {/* Response notes if responded */}
                  {dep.responseNotes && (
                    <div className="rounded-lg bg-secondary/50 p-3 text-xs space-y-1">
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span>Response from {dep.responderName || dep.recipientDepartment}:</span>
                        <span className="text-[10px] text-muted-foreground">{dep.respondedAt?.split("T")[0]}</span>
                      </div>
                      <p className="text-muted-foreground">{dep.responseNotes}</p>
                    </div>
                  )}

                  {/* Actions for recipient or requester */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {dep.comments?.length || 0} discussion comment(s)
                    </span>

                    <div className="flex items-center gap-2">
                      {dep.status === "Pending" && dep.requesterId === profileData?.user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateDependencyMutation.mutate({ dependencyId: dep.id, status: "Cancelled" })}
                          className="h-7 text-xs text-rose-500"
                        >
                          Withdraw Request
                        </Button>
                      )}

                      {(isManagerOrAbove || dep.recipientDepartment === department) && dep.status !== "Fulfilled" && dep.status !== "Declined" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const note = prompt("Enter fulfillment / resolution notes:");
                              if (note) {
                                updateDependencyMutation.mutate({ dependencyId: dep.id, status: "Fulfilled", responseNotes: note });
                              }
                            }}
                            className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Mark Fulfilled
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: EVIDENCE SUBMISSIONS
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="evidence" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Deliverable Evidence Submissions</h3>
              <p className="text-xs text-muted-foreground">
                Documented proof, upload files, URLs, and manager QA sign-offs.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenEvidenceModal()}
              className="bg-primary text-xs font-semibold text-primary-foreground gap-1.5"
            >
              <FileUp className="h-4 w-4" /> New Evidence Submission
            </Button>
          </div>

          <div className="space-y-3">
            {evidenceList.length === 0 ? (
              <Card className="p-12 text-center border-border shadow-xs">
                <FileCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No evidence submissions recorded</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit proof URLs or upload files for completed work to initiate manager QA review.
                </p>
              </Card>
            ) : (
              evidenceList.map((ev) => (
                <Card key={ev.id} className="p-5 border-border bg-card space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ev.status === "Approved"
                              ? "outline"
                              : ev.status === "Changes Requested"
                              ? "destructive"
                              : "secondary"
                          }
                          className={`text-[10px] ${ev.status === "Approved" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : ""}`}
                        >
                          {ev.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Submission #{ev.submissionNumber}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mt-1">Task: {ev.taskTitle}</h4>
                      <p className="text-xs text-muted-foreground">Submitted by {ev.submittingStaffName}</p>
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      <p>{new Date(ev.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Deliverable links */}
                  {ev.deliverableLinks && ev.deliverableLinks.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-foreground">Asset / Work Links:</span>
                      <div className="flex flex-wrap gap-2">
                        {ev.deliverableLinks.map((l, i) => (
                          <a
                            key={i}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline bg-secondary/40 px-2 py-1 rounded"
                          >
                            <ExternalLink className="h-3 w-3" /> {l.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded files */}
                  {ev.uploadedFiles && ev.uploadedFiles.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-foreground">Uploaded Documents:</span>
                      <div className="flex flex-wrap gap-2">
                        {ev.uploadedFiles.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded border border-border"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">({Math.round(f.size / 1024)} KB)</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Written explanation */}
                  <div className="rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Completion Note:</strong> {ev.writtenExplanation}
                  </div>

                  {/* Reviewer feedback if reviewed */}
                  {ev.reviewerFeedback && (
                    <div className={`rounded-lg p-3 text-xs space-y-1 ${ev.status === "Approved" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300"}`}>
                      <div className="font-bold flex items-center justify-between">
                        <span>Reviewer Feedback from {ev.reviewedByName}:</span>
                        <span className="text-[10px] opacity-75">{ev.reviewedAt?.split("T")[0]}</span>
                      </div>
                      <p>{ev.reviewerFeedback}</p>
                    </div>
                  )}

                  {/* Reviewer action button if manager */}
                  {isManagerOrAbove && ev.status === "Submitted for Review" && (
                    <div className="flex justify-end pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleOpenReview(ev)}
                        className="bg-primary text-xs text-white"
                      >
                        Inspect & Review Evidence
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: PERSONAL SCORECARD
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="scorecard" className="space-y-6">
          <Card className="p-6 border-border shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Personal Performance Scorecard
              </h3>
              <p className="text-xs text-muted-foreground">
                Authoritative metrics computed strictly from your task assignments, completion timestamps, and QA verification decisions.
              </p>
            </div>

            {/* Scorecard Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs text-muted-foreground font-semibold">Total Assigned Work</span>
                <p className="text-2xl font-bold text-foreground mt-1">{scorecard?.totalAssigned ?? 0}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">All tracked task assignments</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs text-muted-foreground font-semibold">Overall Completion Rate</span>
                <p className="text-2xl font-bold text-primary mt-1">
                  {typeof scorecard?.completionRate === "number"
                    ? `${scorecard.completionRate}%`
                    : "Insufficient data"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Completed / Total Assigned</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs text-muted-foreground font-semibold">On-Time SLA Delivery</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {typeof scorecard?.onTimeCompletionRate === "number"
                    ? `${scorecard.onTimeCompletionRate}%`
                    : "Insufficient data"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Delivered on or before target date</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs text-muted-foreground font-semibold">QA First-Pass Approvals</span>
                <p className="text-2xl font-bold text-foreground mt-1">{scorecard?.evidenceApprovedCount ?? 0}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Evidence verified without rework</p>
              </div>
            </div>

            {/* Performance Breakdown Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Evaluation Period</th>
                    <th className="py-2.5 px-3">Assigned Tasks</th>
                    <th className="py-2.5 px-3">Completed</th>
                    <th className="py-2.5 px-3">Delivered On-Time</th>
                    <th className="py-2.5 px-4 text-right">Compliance Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(scorecard?.trends ?? []).map((tr, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-bold text-foreground">{tr.period}</td>
                      <td className="py-3 px-3">{tr.assigned}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">{tr.completed}</td>
                      <td className="py-3 px-3 font-semibold text-primary">{tr.onTime}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                          Meets Standard
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 7: NOTIFICATIONS
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notifications & Operational Alerts
                </h3>
                <p className="text-xs text-muted-foreground">
                  Task updates, deadline reminders, dependency responses, and QA decisions.
                </p>
              </div>

              {unreadNotifCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAllNotifsReadMutation.mutate()}
                  className="h-8 text-xs font-semibold"
                >
                  Mark All Read
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      !n.read
                        ? "bg-primary/[0.04] border-primary/30"
                        : "bg-card border-border opacity-85"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          !n.read ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()} SAST
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {n.relatedTaskId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const found = tasks.find((t) => t.id === n.relatedTaskId);
                            if (found) handleOpenTask(found);
                          }}
                          className="h-7 text-xs text-primary font-semibold"
                        >
                          Jump to Task
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotifReadMutation.mutate({ id: n.id, read: !n.read })}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {n.read ? "Mark Unread" : "Mark Read"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL: TASK FULL DETAILS & PROGRESS NOTES ─────────────────────── */}
      <Dialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{selectedTask?.priority}</Badge>
              <Badge variant="outline" className="text-[10px]">{selectedTask?.status}</Badge>
              <span className="text-xs text-muted-foreground">{selectedTask?.department}</span>
            </div>
            <DialogTitle className="text-lg font-bold">{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Assigned by {selectedTask?.assignedByName} ({selectedTask?.assignedByRole}) &bull; Due: {selectedTask?.dueDate?.split("T")[0] || "No due date set"}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-2 text-xs">
              {/* Description */}
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Task Scope & Description:</span>
                <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border">
                  {selectedTask.description}
                </p>
              </div>

              {/* Instructions */}
              {selectedTask.instructions && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Specific Instructions:</span>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border">
                    {selectedTask.instructions}
                  </p>
                </div>
              )}

              {/* Required Evidence */}
              {selectedTask.evidenceRequirement && (
                <div className="rounded-lg bg-secondary/40 p-3 border border-border space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-primary" /> Required Evidence for QA:
                  </span>
                  <p className="text-muted-foreground">{selectedTask.evidenceRequirement}</p>
                </div>
              )}

              {/* Status Change Selector */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">Update Task Status</Label>
                <div className="flex flex-wrap gap-2">
                  {(["Not Started", "In Progress", "Blocked", "Submitted for Review", "Completed"] as TaskStatus[]).map((st) => (
                    <Button
                      key={st}
                      type="button"
                      size="sm"
                      variant={selectedTask.status === st ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(st)}
                      disabled={isUpdatingProgress}
                      className="h-7 text-xs font-semibold"
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between font-semibold">
                  <span>Current Progress:</span>
                  <span>{selectedTask.progress}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={selectedTask.progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSelectedTask((prev) => (prev ? { ...prev, progress: val } : null));
                    }}
                    onMouseUp={() => {
                      updateTaskMutation.mutate({
                        taskId: selectedTask.id,
                        progress: selectedTask.progress,
                      });
                    }}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              {/* Progress Notes Timeline */}
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Progress Notes & Activity Trail</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTask.progressNotes && selectedTask.progressNotes.length > 0 ? (
                    selectedTask.progressNotes.map((pn) => (
                      <div key={pn.id} className="p-2.5 rounded-lg bg-secondary/30 border border-border text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-foreground">
                          <span>{pn.authorName} ({pn.authorRole || "Staff"}):</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(pn.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground">{pn.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs italic">No progress notes logged yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddProgressNote} className="flex gap-2">
                  <Input
                    placeholder="Add a progress update or note..."
                    value={newProgressNote}
                    onChange={(e) => setNewProgressNote(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newProgressNote.trim() || isUpdatingProgress} className="h-8 text-xs">
                    Post Note
                  </Button>
                </form>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setTaskDetailsOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setTaskDetailsOpen(false);
                if (selectedTask) handleOpenEvidenceModal(selectedTask);
              }}
              className="bg-primary text-white"
            >
              Submit Deliverable Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: CREATE DEPENDENCY REQUEST ──────────────────────────────── */}
      <Dialog open={depModalOpen} onOpenChange={setDepModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Request Task Dependency
            </DialogTitle>
            <DialogDescription className="text-xs">
              Request access, information, resources, or work from another department or colleague.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDependency} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Linked Blocked Task *</Label>
              <Select value={depTaskId} onValueChange={setDepTaskId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose task..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.title} ({t.clientName || t.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Department *</Label>
              <Select value={depDepartment} onValueChange={setDepDepartment}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Operations", "Media Buying", "Websites & Software", "CRM & AI Automation", "Strategy & Growth", "SEO", "Creative Content", "IT Department"].map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description of Roadblock *</Label>
              <Textarea
                placeholder="Explain what is currently blocked..."
                value={depBlockerDesc}
                onChange={(e) => setDepBlockerDesc(e.target.value)}
                required
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Specific Needed Resource / Action *</Label>
              <Textarea
                placeholder="e.g. CAPI delegate link from client, Google Tag Manager access..."
                value={depNeededResource}
                onChange={(e) => setDepNeededResource(e.target.value)}
                required
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Urgency Level</Label>
                <Select value={depUrgency} onValueChange={(v: any) => setDepUrgency(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Requested By Date</Label>
                <Input
                  type="date"
                  value={depDueDate}
                  onChange={(e) => setDepDueDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDepModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmittingDep} className="bg-rose-600 text-white font-semibold">
                {isSubmittingDep ? "Submitting..." : "Submit Dependency Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: SUBMIT EVIDENCE ────────────────────────────────────────── */}
      <Dialog open={evidenceModalOpen} onOpenChange={setEvidenceModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" /> Submit Deliverable Evidence
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide verifiable proof (files, links, screenshots) for manager QA review.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEvidence} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Task *</Label>
              <Select value={evidenceTaskId} onValueChange={setEvidenceTaskId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose task..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.title} ({t.clientName || t.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deliverable Asset URL / Repository Link</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Link Title (e.g. Campaign Dashboard)"
                  value={evidenceLinkTitle}
                  onChange={(e) => setEvidenceLinkTitle(e.target.value)}
                  className="col-span-1 h-9 text-xs"
                />
                <Input
                  placeholder="https://..."
                  value={evidenceLinkUrl}
                  onChange={(e) => setEvidenceLinkUrl(e.target.value)}
                  className="col-span-2 h-9 text-xs"
                />
              </div>
            </div>

            {/* File Upload to Supabase Storage */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Upload Document or Screenshot (PDF, DOCX, PNG, ZIP &lt; 25MB)</Label>
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploadingFile}
                className="h-9 text-xs file:text-xs file:font-semibold"
              />
              {isUploadingFile && <p className="text-[11px] text-primary animate-pulse">Uploading file to secure storage...</p>}

              {evidenceFiles.length > 0 && (
                <div className="space-y-1 pt-1">
                  {evidenceFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-secondary/50 p-2 rounded">
                      <span className="font-semibold truncate max-w-xs">{f.name}</span>
                      <span className="text-muted-foreground">{Math.round(f.size / 1024)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Written Explanation */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Written Explanation & Completion Note *</Label>
              <Textarea
                placeholder="Explain what was implemented, how it meets acceptance criteria, test credentials..."
                value={evidenceExplanation}
                onChange={(e) => setEvidenceExplanation(e.target.value)}
                required
                className="text-xs min-h-[85px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEvidenceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmittingEvidence || isUploadingFile} className="bg-primary text-white font-semibold">
                {isSubmittingEvidence ? "Submitting..." : "Submit for QA Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: MANAGER REVIEW EVIDENCE ─────────────────────────────────── */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">QA Deliverable Inspection</DialogTitle>
            <DialogDescription className="text-xs">
              Review submitted evidence for {selectedEvidence?.taskTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-lg bg-secondary/30 p-3 space-y-1">
              <span className="font-semibold text-foreground">Staff Note:</span>
              <p className="text-muted-foreground">{selectedEvidence?.writtenExplanation}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">QA Decision</Label>
              <Select value={reviewDecision} onValueChange={(v: any) => setReviewDecision(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approve Deliverable (Accepted Complete)</SelectItem>
                  <SelectItem value="Changes Requested">Request Changes (Rework Required)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Feedback / Correction Notes</Label>
              <Textarea
                placeholder="Details of approval or specific adjustments needed..."
                value={reviewerFeedback}
                onChange={(e) => setReviewerFeedback(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitReview} disabled={isSubmittingReview} className="bg-primary text-white font-semibold">
              {isSubmittingReview ? "Saving..." : "Save QA Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
