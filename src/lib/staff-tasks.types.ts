export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Submitted for Review"
  | "Changes Requested"
  | "Completed";

export interface ProgressNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  note: string;
  createdAt: string;
}

export interface TaskAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface SupportingLink {
  title: string;
  url: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedToEmail?: string;
  assignedToRole?: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: string;
  assignedByDepartment?: string;
  department: string;
  clientId?: string;
  clientName?: string;
  projectName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assignmentDate: string;
  dueDate: string | null; // null represents "No due date set"
  completionDate?: string | null;
  instructions?: string;
  attachments: TaskAttachment[];
  supportingLinks: SupportingLink[];
  progressNotes: ProgressNote[];
  dependenciesSummary?: string;
  linkedDependencyId?: string;
  blockReason?: string;
  evidenceRequirement?: string;
  taskType?: string;
  evidenceRequired?: string;
  evidenceSubmitted?: string;
  qaReviewer?: string;
  qaDecisionNotes?: string;
  approvedDeadlineChangesCount?: number;
  estimatedHours?: number;
  workingHoursLate?: number;
  lastUpdatedAt: string;
  createdAt: string;
}

export type DependencyStatus =
  | "Pending"
  | "Acknowledged"
  | "In Progress"
  | "Fulfilled"
  | "Declined"
  | "Cancelled";

export interface DependencyComment {
  id: string;
  authorId: string;
  authorName: string;
  comment: string;
  createdAt: string;
}

export interface DependencyRequest {
  id: string;
  taskId: string;
  taskTitle: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  recipientId?: string;
  recipientName?: string;
  recipientDepartment: string;
  blockerDescription: string;
  neededResource: string;
  urgency: TaskPriority;
  requestedByDate: string | null;
  status: DependencyStatus;
  responseNotes?: string;
  responderName?: string;
  respondedAt?: string;
  comments: DependencyComment[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type EvidenceReviewStatus =
  | "Draft"
  | "Submitted for Review"
  | "Approved"
  | "Changes Requested"
  | "Rejected";

/** A file attached to an evidence submission. `path` is its location in the
 *  private "evidence" storage bucket; viewing links are issued on demand. */
export interface EvidenceFile {
  name: string;
  /** Storage path (set for every upload since the evidence fix). */
  path?: string;
  /** Legacy field / short-lived signed link returned by the server for viewing. */
  url: string;
  size: number;
  mimeType: string;
  downloadUrl?: string;
  available?: boolean;
  unavailableReason?: string;
}

/** Full submission as returned to an authorised viewer (GET /api/staff/evidence/:id). */
export interface EvidenceDetail extends EvidenceSubmission {
  submittingStaffDepartment: string | null;
  taskDepartment: string | null;
  taskStatus: string | null;
  canReview: boolean;
  history: EvidenceSubmission[];
}

export interface EvidenceSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  submittingStaffId: string;
  submittingStaffName: string;
  submissionNumber: number;
  deliverableLinks: SupportingLink[];
  uploadedFiles: EvidenceFile[];
  writtenExplanation: string;
  status: EvidenceReviewStatus;
  submittedAt: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewerFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "task_assigned"
  | "task_reassigned"
  | "due_date_changed"
  | "deadline_approaching"
  | "task_overdue"
  | "dependency_response"
  | "dependency_fulfilled"
  | "evidence_reviewed"
  | "comment_added"
  | "status_changed"
  | "executive_follow_up"
  | "executive_alert";

export interface StaffNotification {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedTaskId?: string;
  relatedDependencyId?: string;
  relatedEvidenceId?: string;
  read: boolean;
  /** When it was last marked read (absent while unread). */
  readAt?: string | null;
  createdAt: string;
  /** Where clicking the notification should take the user (an in-app path). */
  link?: string;
  /** Executive alerts only. */
  severity?: "critical" | "warning" | "info";
  category?: string;
  eventGroup?: string;
  eventMembers?: string[];
}

export interface PersonalScorecard {
  totalAssigned: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  awaitingReviewCount: number;
  blockedCount: number;
  completionRate: number | null; // null if 0 assigned
  onTimeCompletionRate: number | null; // null if 0 completed with due date
  evidenceApprovedCount: number;
  evidenceAwaitingReviewCount: number;
  trackedHoursToday: number;
  complianceRate: number | null;
  trends: {
    period: string;
    assigned: number;
    completed: number;
    onTime: number;
  }[];
}
