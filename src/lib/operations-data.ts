// MSP Operations Control Centre Data Models & Types
// Connects real company employees, live tasks, clients, deadlines, leads, approvals, and escalations.

export interface OperationEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  attendanceStatus: "Present" | "Late" | "Absent" | "Approved Leave" | "Early Departure" | "Unexplained Absence";
  clockInTime?: string;
  clockOutTime?: string;
  leaveBalanceDays: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  blockedTasksCount: number;
  adherenceRate: number; // percentage
  avatar?: string;
}

export interface OperationTask {
  id: string;
  title: string;
  description: string;
  clientOrTeam: string;
  ownerId: string;
  ownerName: string;
  priority: "High" | "Medium" | "Low" | "Urgent";
  assignedDate: string;
  deadline: string;
  status: "Not Started" | "In Progress" | "Awaiting Review" | "Completed" | "Blocked" | "Overdue";
  progress: number; // 0 - 100
  dependencies?: string;
  reviewer: string;
  completionDate?: string;
  commentsCount: number;
  blockReason?: string;
}

export interface ClientOperation {
  id: string;
  name: string;
  accountManager: string;
  package: string;
  startDate: string;
  contractStatus: "Active" | "Pending Renewal" | "Notice Given" | "Onboarding";
  health: "Green" | "Amber" | "Red";
  healthReason: string;
  nextAction: string;
  nextActionDue: string;
  openDeliverablesCount: number;
  overdueReportsCount: number;
  openEscalationsCount: number;
  renewalDate: string;
  onboardingStage?: string;
}

export interface OnboardingWorkflow {
  id: string;
  clientId: string;
  clientName: string;
  accountManager: string;
  currentStage:
    | "Lead Won"
    | "Contract Signed"
    | "Payment Confirmation"
    | "Onboarding Form"
    | "Account Manager Assigned"
    | "Access & Assets"
    | "Strategy Plan"
    | "Content Preparation"
    | "Campaign Launch"
    | "First Month Report"
    | "Active Retention";
  stageOwner: string;
  dueDate: string;
  completedStages: string[];
  blocker?: string;
  progress: number;
}

export interface EscalationIssue {
  id: string;
  title: string;
  issueType: "Missed Deadline" | "Client Complaint" | "Access Blocker" | "Technical Bug" | "Payment Dispute" | "Campaign Underperformance" | "Urgent Request";
  clientOrTeam: string;
  raisedBy: string;
  dateRaised: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  impact: "Critical" | "High" | "Moderate" | "Low";
  owner: string;
  targetResolutionDate: string;
  escalationLevel: "Level 1 (Team Lead)" | "Level 2 (Operations Head)" | "Level 3 (MD / Executive)";
  status: "Open" | "Investigating" | "Action Pending" | "Resolved" | "Closed";
  actionsTaken: string;
}

export interface SalesLead {
  id: string;
  businessName: string;
  contactPerson: string;
  leadSource: "Meta Ads" | "Google Search" | "Referral" | "Cold Outreach" | "LinkedIn" | "Partner";
  need: string;
  assignedSalesperson: string;
  followUpDate: string;
  stage: "New" | "Contacted" | "Qualified" | "Discovery" | "Proposal Sent" | "Follow-up" | "Won" | "Lost";
  leadQuality: "Hot" | "Warm" | "Cold";
  estimatedValue: number; // ZAR
  proposalStatus: "Draft" | "Sent" | "Awaiting Signature" | "Accepted" | "Declined";
  notes: string;
}

export interface ApprovalRequest {
  id: string;
  type: "Content Post" | "Ad Campaign" | "Client Report" | "Sales Proposal" | "Strategy Shift" | "Leave Application" | "Procurement" | "Client Scope Change";
  title: string;
  requester: string;
  approver: string;
  submissionDate: string;
  completionDeadline: string;
  status: "Pending Review" | "Approved" | "Returned for Changes" | "Rejected";
  comments?: string;
  clientOrProject?: string;
}

export interface OperationalReportItem {
  id: string;
  reportName: string;
  clientOrTeam: string;
  owner: string;
  reportingPeriod: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Submitted" | "Approved" | "Overdue";
  reviewerFeedback?: string;
  linkOrRef?: string;
}

export interface OperationCalendarEvent {
  id: string;
  title: string;
  eventType: "Staff Leave" | "Client Meeting" | "Onboarding Milestone" | "Internal Alignment" | "Content Deadline" | "Campaign Launch" | "Monthly Reporting";
  owner: string;
  clientOrTeam: string;
  dateTime: string;
  relatedTask?: string;
}

export interface OperationalAlert {
  id: string;
  category: "Attendance" | "Overdue Task" | "Blocked Work" | "Client Risk" | "Report Due" | "Sales Action" | "Pending Approval";
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  responsiblePerson: string;
  deadline: string;
  actionUrl?: string;
}

// Initial live data containers — no synthetic fake records
export const INITIAL_EMPLOYEES: OperationEmployee[] = [];
export const INITIAL_TASKS: OperationTask[] = [];
export const INITIAL_CLIENTS: ClientOperation[] = [];
export const INITIAL_ONBOARDING: OnboardingWorkflow[] = [];
export const INITIAL_ESCALATIONS: EscalationIssue[] = [];
export const INITIAL_LEADS: SalesLead[] = [];
export const INITIAL_APPROVALS: ApprovalRequest[] = [];
export const INITIAL_REPORTS: OperationalReportItem[] = [];
export const INITIAL_CALENDAR: OperationCalendarEvent[] = [];
export const INITIAL_SKILLS: { employee: string; skill: string; level: string; assessmentDate: string }[] = [];
export const INITIAL_REVIEWS: {
  id: string;
  employeeName: string;
  reviewer: string;
  reviewPeriod: string;
  productivityScore: string;
  strengths: string;
  concern: string;
  agreedAction: string;
  reviewDate: string;
  nextReviewDate: string;
}[] = [];
