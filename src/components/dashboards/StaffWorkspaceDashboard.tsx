import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { StaffAttendanceWidget } from "@/components/StaffAttendanceWidget";
import { useProfile } from "@/lib/use-profile";

interface StaffTask {
  id: string;
  client: string;
  title: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Ready" | "In progress" | "Blocked" | "Submitted for review" | "Rework" | "Accepted complete";
  deadline: string;
  hoursSpent: number;
  estimatedHours: number;
  evidenceRequirement: string;
  blockReason?: string;
  reworkNotes?: string;
}

const INITIAL_STAFF_TASKS: StaffTask[] = [
  {
    id: "st-1",
    client: "Apex Solar SA",
    title: "Build Meta Performance Ads Audiences & Retargeting Sets",
    priority: "Urgent",
    status: "In progress",
    deadline: "2026-10-13 17:00",
    hoursSpent: 3.5,
    estimatedHours: 5.0,
    evidenceRequirement: "Ad Set IDs, audience sizes & UTM parameters confirmed",
  },
  {
    id: "st-2",
    client: "Client Alpha",
    title: "Submit Weekly Ad Copy Variations for Creative Review",
    priority: "High",
    status: "Rework",
    deadline: "2026-10-14 12:00",
    hoursSpent: 4.0,
    estimatedHours: 4.0,
    evidenceRequirement: "Google Doc link with 3 hook variations & copy approvals",
    reworkNotes: "Headlines need stronger value proposition around solar ROI. Please adjust angles 1 and 3.",
  },
  {
    id: "st-3",
    client: "Vanguard Mining Supplies",
    title: "Configure Contact Form Webhook & Zapier Automation",
    priority: "Medium",
    status: "Ready",
    deadline: "2026-10-15 17:00",
    hoursSpent: 0,
    estimatedHours: 2.5,
    evidenceRequirement: "Live test payload screenshot & GHL lead creation confirmation",
  },
];

export function StaffWorkspaceDashboard() {
  const { data: profileData } = useProfile();
  const userName = profileData?.profile?.full_name || "Team Member";
  const userRole = profileData?.profile?.job_title || "Specialist";
  const department = profileData?.profile?.department || "Operations";

  const [tasks, setTasks] = useState<StaffTask[]>(INITIAL_STAFF_TASKS);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Evidence submission modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  // Blocker report modal state
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerReason, setBlockerReason] = useState("");

  // Active timer ticker
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
      // Stop timer and log hours
      const loggedHours = Math.round((timerSeconds / 3600) * 10) / 10;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, hoursSpent: t.hoursSpent + loggedHours } : t))
      );
      toast.success(`Logged ${loggedHours}h on task.`);
      setActiveTimerTaskId(null);
      setTimerSeconds(0);
    } else {
      setActiveTimerTaskId(taskId);
      setTimerSeconds(0);
      toast.info("Timer started for task tracking.");
    }
  };

  const handleOpenSubmit = (task: StaffTask) => {
    setSelectedTask(task);
    setEvidenceUrl("");
    setSubmissionNotes("");
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) {
      toast.error("Evidence URL or asset reference is required before submitting for review.");
      return;
    }

    if (selectedTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: "Submitted for review" }
            : t
        )
      );
      toast.success("Task submitted for manager review!", {
        description: "Your manager will inspect the submitted evidence.",
      });
      setSubmitModalOpen(false);
    }
  };

  const handleOpenBlocker = (task: StaffTask) => {
    setSelectedTask(task);
    setBlockerReason("");
    setBlockerModalOpen(true);
  };

  const handleConfirmBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim()) {
      toast.error("Please explain the blocker clearly.");
      return;
    }

    if (selectedTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: "Blocked", blockReason: blockerReason.trim() }
            : t
        )
      );
      toast.warning("Task marked as Blocked.", {
        description: "An operational alert has been escalated to your manager.",
      });
      setBlockerModalOpen(false);
    }
  };

  const completedCount = tasks.filter((t) => t.status === "Accepted complete").length;
  const inReviewCount = tasks.filter((t) => t.status === "Submitted for review").length;
  const inProgressCount = tasks.filter((t) => t.status === "In progress").length;

  return (
    <div className="space-y-6">
      {/* ─── Employee Welcome & Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back, {userName}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {userRole} &bull; <span className="font-semibold">{department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Today's Presence</span>
            <p className="text-xs font-bold text-emerald-500">Active Work Shift</p>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-secondary/40 border-border">
            Workspace &bull; Staff
          </Badge>
        </div>
      </div>

      {/* ─── Top Metrics & Clock-in Row ──────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">My Active Tasks</span>
          <p className="text-2xl font-bold text-foreground mt-1">{tasks.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {inProgressCount} in progress &bull; {inReviewCount} in review
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Personal Scorecard</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">94%</p>
          <Progress value={94} className="mt-2 h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1">On-time delivery & quality adherence</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Tracked Hours Today</span>
          <p className="text-2xl font-bold text-primary mt-1">
            {tasks.reduce((acc, t) => acc + t.hoursSpent, 0).toFixed(1)} hrs
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Target: 8.0 billable hours</p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-xs font-semibold text-muted-foreground">Annual Leave Balance</span>
          <p className="text-2xl font-bold text-foreground mt-1">15 Days</p>
          <p className="text-[11px] text-muted-foreground mt-1">Next review: Dec 2026</p>
        </Card>
      </div>

      {/* ─── Main Content Grid: Tasks + Live Attendance ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: My Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-primary" /> My Task Assignments & Milestones
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update progress, record live timers, and submit deliverables for QA approval.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {tasks.length} Assigned
              </Badge>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const isTimerRunning = activeTimerTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 transition hover:border-primary/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-primary uppercase">{task.client}</span>
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
                              task.status === "Blocked"
                                ? "destructive"
                                : task.status === "Rework"
                                ? "outline"
                                : task.status === "Submitted for review"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{task.title}</h4>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <p className="flex items-center gap-1 sm:justify-end">
                          <Clock className="h-3 w-3" /> Due {task.deadline}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {task.hoursSpent}h logged / {task.estimatedHours}h est.
                        </p>
                      </div>
                    </div>

                    {/* Required evidence banner */}
                    <div className="rounded-lg bg-secondary/30 border border-border/70 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
                      <Upload className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Required Evidence:</strong> {task.evidenceRequirement}
                      </span>
                    </div>

                    {/* Rework instructions warning if task returned */}
                    {task.status === "Rework" && task.reworkNotes && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Manager Rework Instruction:</strong> {task.reworkNotes}
                        </div>
                      </div>
                    )}

                    {/* Blocker reason if blocked */}
                    {task.status === "Blocked" && task.blockReason && (
                      <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                        <div>
                          <strong>Current Blocker:</strong> {task.blockReason}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
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
                              <Square className="h-3 w-3 fill-current" /> Stop Timer (
                              {Math.floor(timerSeconds / 60)}:
                              {String(timerSeconds % 60).padStart(2, "0")})
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current" /> Start Timer
                            </>
                          )}
                        </Button>

                        {task.status !== "Blocked" && task.status !== "Accepted complete" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenBlocker(task)}
                            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          >
                            Report Blocker
                          </Button>
                        )}
                      </div>

                      {task.status !== "Accepted complete" && task.status !== "Submitted for review" && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenSubmit(task)}
                          className="h-8 bg-primary text-xs font-semibold text-primary-foreground gap-1.5 hover:bg-primary/90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Submit for Review
                        </Button>
                      )}

                      {task.status === "Submitted for review" && (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-500" /> Awaiting Manager QA Inspection
                        </span>
                      )}

                      {task.status === "Accepted complete" && (
                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accepted & Verified Complete
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Attendance Widget & SOP Quicklinks */}
        <div className="space-y-6">
          <StaffAttendanceWidget />

          <Card className="p-4 border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Delivery Principles
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                &bull; <strong>Evidence is required:</strong> Submitting a task requires verifiable proof (URLs, screenshots, or campaign IDs).
              </p>
              <p>
                &bull; <strong>Flag blockers early:</strong> Never wait until deadline day to report a dependency delay.
              </p>
              <p>
                &bull; <strong>Clock in daily:</strong> Shift logs determine adherence scores and availability for task handoffs.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Evidence Submission Dialog ─────────────────────────────────────── */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Submit Deliverable for QA Review</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide verifiable proof that this deliverable meets the scope requirement before your manager accepts it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="evidence-url" className="text-xs font-medium">
                Proof / Evidence URL or Asset Link *
              </Label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="evidence-url"
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or Campaign ID"
                  required
                  className="pl-9 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Required for {selectedTask?.client}: {selectedTask?.evidenceRequirement}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="submission-notes" className="text-xs font-medium">
                Notes for Reviewer (Optional)
              </Label>
              <Textarea
                id="submission-notes"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Key aspects implemented, test credentials, or notes..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit Deliverable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Report Blocker Dialog ─────────────────────────────────────────── */}
      <Dialog open={blockerModalOpen} onOpenChange={setBlockerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-500">Report Task Blocker</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Notify Operations and your manager that work cannot proceed until this external dependency is resolved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmBlocker} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="blocker-reason" className="text-xs font-medium">
                Reason for Delay & Blocker Details *
              </Label>
              <Textarea
                id="blocker-reason"
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                placeholder="e.g. Waiting on client Meta delegate access link sent on Monday..."
                required
                className="text-xs min-h-[90px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setBlockerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" className="font-semibold">
                Confirm Blocker Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
