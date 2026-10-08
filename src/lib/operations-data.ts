// MSP Operations Control Centre Data Models & Types
// Aligned with CEO Mavis Muchena's Operations & Performance Dashboard Specification (5 October 2026)

export interface OperationEmployee {
  id: string;
  name: string;
  role: string;
  department: "Sales" | "Client Onboarding" | "Strategy" | "Creative" | "Media Buying" | "SEO" | "Websites & Software" | "CRM & AI Automation" | "Reporting & Analytics" | "Client Success" | "Finance" | "HR & Admin" | "MSP Academy";
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

export type DelayAttributionCategory =
  | "Employee execution"
  | "Manager assignment"
  | "Manager approval"
  | "Internal dependency"
  | "Client input or approval"
  | "Finance dependency"
  | "Platform restriction"
  | "Scope change"
  | "Unconfirmed";

export type TaskLifecycleStatus =
  | "Not ready"
  | "Ready"
  | "In progress"
  | "Blocked"
  | "Submitted for review"
  | "Rework"
  | "Accepted complete"
  | "Cancelled";

export interface TaskEvidenceSubmission {
  deliverableType: "Paid Ads" | "Website" | "CRM/AI" | "Sales" | "SEO & Reporting";
  campaignOrAccountIds?: string;
  stagingOrLiveUrl?: string;
  workflowRef?: string;
  proposalOrContractRef?: string;
  qaChecklistVerified: boolean;
  platformLiveVerified: boolean;
  testLeadVerified: boolean;
  evidenceLinkOrRef: string;
  submittedAt: string;
  submitterName: string;
}

export interface OperationTask {
  id: string;
  clientOrTeam: string;
  title: string;
  serviceType: "Paid Ads" | "Website" | "CRM & AI" | "SEO" | "Creative" | "Sales" | "Strategy" | "Finance" | "HR" | "Academy";
  description: string;
  ownerId: string;
  ownerName: string;
  managerName: string;
  reviewerName: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: TaskLifecycleStatus;
  progress: number; // 0 - 100
  
  // Business Clocks & Dates
  plannedStart: string;
  actualStart?: string;
  originalDueDate: string;
  revisedDueDate: string;
  promisedClientDate: string;
  dueDeadline: string;
  workingHoursLate: number;
  clientElapsedTimeHrs: number;
  internalServiceTimeHrs: number;
  stageTimeHrs: number;

  // Delay & Blocker Tracking
  blockerCategory?: "Waiting for client" | "Waiting for manager" | "Internal dependency" | "Technical restriction";
  blockReason?: string;
  delayCategory?: DelayAttributionCategory;
  escalationRecipient?: string;
  nextAction: string;
  
  // Verification & Evidence
  evidenceRequirement: string;
  evidenceSubmitted?: TaskEvidenceSubmission;
  verifierName?: string;
  submittedAt?: string;
  acceptedAt?: string;
  reworkReason?: string;
  commentsCount: number;
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
  
  // Client Cooperation & Financial boundary tracking
  clientMediaSpendZar: number;
  serviceFeeZar: number;
  paymentStatus: "Paid" | "Invoice Pending" | "Overdue Debt";
  missingAssets: string[];
}

export interface AccessChecklist {
  metaAds: "Verified" | "Missing" | "N/A";
  googleAds: "Verified" | "Missing" | "N/A";
  tikTokAds: "Verified" | "Missing" | "N/A";
  ga4Analytics: "Verified" | "Missing" | "N/A";
  metaPixel: "Verified" | "Missing" | "N/A";
  capiServer: "Verified" | "Missing" | "N/A";
  ghlCrm: "Verified" | "Missing" | "N/A";
  websiteHosting: "Verified" | "Missing" | "N/A";
}

export interface OnboardingWorkflow {
  id: string;
  clientId: string;
  clientName: string;
  accountManager: string;
  currentStage:
    | "Won & Intake"
    | "Client Setup"
    | "Access & Assets"
    | "Strategy & Budget"
    | "Creative & Tracking"
    | "Readiness Accepted"
    | "Build & QA"
    | "Publish & Verify"
    | "Initial Monitoring"
    | "Active Client";
  stageOwner: string;
  dueDate: string;
  workingHoursAge: number; // 2 business days target = 18 working hours
  totalClientElapsedDays: number;
  accessChecklist: AccessChecklist;
  readinessAcceptedBy?: string;
  readinessAcceptedAt?: string;
  blocker?: string;
  progress: number;
  isBreached: boolean;
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
  escalationLevel: "Level 1 (Team Lead)" | "Level 2 (Operations Head)" | "Level 3 (CEO / MD)";
  status: "Open" | "Investigating" | "Action Pending" | "Resolved" | "Closed";
  actionsTaken: string;
  workingHoursLate: number;
  originalPromiseRetained: boolean;
}

export interface SalesLead {
  id: string;
  businessName: string;
  contactPerson: string;
  leadSource: "Meta Ads" | "Google Search" | "Referral" | "Cold Outreach" | "LinkedIn" | "Partner";
  need: string;
  assignedSalesperson: string;
  followUpDate: string;
  stage: "New" | "Contact attempted" | "Contacted" | "Qualified" | "Consultation booked" | "Consultation held" | "Proposal sent" | "Negotiation" | "Won" | "Lost";
  leadQuality: "Hot" | "Warm" | "Cold";
  estimatedValue: number; // ZAR
  proposalStatus: "Draft" | "Sent" | "Awaiting Signature" | "Accepted" | "Declined";
  inboundResponseMins: number; // SLA <= 15 mins
  firstHumanActionHrs: number; // SLA <= 1 working hr
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
  reviewTimeHrs: number;
}

export interface AcceptanceScenarioTest {
  id: string;
  testNumber: number;
  title: string;
  specSection: string;
  expectedBehavior: string;
  status: "Passed" | "Testing" | "Failed";
  evidenceSummary: string;
}

export interface ExecutiveHealthViewData {
  sales: {
    newLeads: number;
    unansweredLeads: number;
    overdueFollowUps: number;
    consultationsHeld: number;
    proposalsSent: number;
    closedDeals: number;
    verifiedNewRevenueZar: number;
  };
  revenue: {
    bookedZar: number;
    invoicedZar: number;
    cashCollectedZar: number;
    overdueDebtZar: number;
    recurringZar: number;
    costMarginPct: number;
  };
  client: {
    onboardingLate: number;
    awaitingLaunch: number;
    unresolvedComplaints: number;
    missedCheckIns: number;
    renewalRisks: number;
    greenCount: number;
    amberCount: number;
    redCount: number;
  };
  delivery: {
    dueToday: number;
    overdueMilestones: number;
    blockedWork: number;
    approvalBacklog: number;
    campaignsAwaitingLaunch: number;
    overdueWebsites: number;
  };
  team: {
    assignedWorkload: number;
    acceptedDeliveryRatePct: number;
    staleUpdates: number;
    pendingVerification: number;
    managerOverdueApprovals: number;
    unresolvedBlockers: number;
  };
}

// Default Seed Data for Development & Testing
export const SAMPLE_ACCEPTANCE_TESTS: AcceptanceScenarioTest[] = [
  {
    id: "test-1",
    testNumber: 1,
    title: "Won deal arrives twice",
    specSection: "Section 14 — Test 1",
    expectedBehavior: "Single client/service workflow created; no duplicated onboarding tasks or alerts. Sales handover and payment verification remain distinct.",
    status: "Passed",
    evidenceSummary: "Verified in GHL Webhook Idempotency Layer & Client Deduplication Guard.",
  },
  {
    id: "test-2",
    testNumber: 2,
    title: "Onboarding exceeds 2 business days",
    specSection: "Section 14 — Test 2",
    expectedBehavior: "Visible overdue record and escalation triggered; missing client access shown with approved pause while total elapsed age continues.",
    status: "Passed",
    evidenceSummary: "Tested with Apex Solar Onboarding (Age: 21 working hrs, 3 hrs overdue, paused on Google Ads access).",
  },
  {
    id: "test-3",
    testNumber: 3,
    title: "Launch exceeds readiness maximum",
    specSection: "Section 14 — Test 3",
    expectedBehavior: "3-business-day breach triggers CEO & Operations alert. Publishing pending platform review is not verified live.",
    status: "Passed",
    evidenceSummary: "Tested on Meta Campaign Launch for Horizon Energy. Status remains 'Pending Verification' until live API check.",
  },
  {
    id: "test-4",
    testNumber: 4,
    title: "Manager holds approval delay",
    specSection: "Section 14 — Test 4",
    expectedBehavior: "Task owner's timely submission remains visible; manager review overdue is attributed to Manager Approval stage delay.",
    status: "Passed",
    evidenceSummary: "Creative submitted Tuesday 10:00. Manager approved Wednesday 14:00. 13 working hrs attributed to Manager Approval.",
  },
  {
    id: "test-5",
    testNumber: 5,
    title: "Client input missing & pause rules",
    specSection: "Section 14 — Test 5",
    expectedBehavior: "Evidence required for external pause; follow-up remains due; gross client elapsed age continues to grow.",
    status: "Passed",
    evidenceSummary: "Pause approved on evidenced Meta Pixel access request. Gross age: 8 days, Internal clock: 2 days.",
  },
  {
    id: "test-6",
    testNumber: 6,
    title: "False completion attempted",
    specSection: "Section 14 — Test 6",
    expectedBehavior: "No accepted completion without required evidence and independent reviewer. Rejected version produces rework history.",
    status: "Passed",
    evidenceSummary: "Task rejected without live URL & QA checklist; returned as 'Rework' with correction task attached.",
  },
  {
    id: "test-7",
    testNumber: 7,
    title: "Weekend & SA Holiday clock calculation",
    specSection: "Section 14 — Test 7",
    expectedBehavior: "Business clock excludes non-working hours. Friday 16:00 plus 18 working hours equals Tuesday 16:00 SAST (no holidays).",
    status: "Passed",
    evidenceSummary: "Clock engine verified against SA Mon-Fri 08:00-17:00 calendar.",
  },
  {
    id: "test-8",
    testNumber: 8,
    title: "Inactive manager or vacant role fallback",
    specSection: "Section 14 — Test 8",
    expectedBehavior: "Backup recipient receives escalation; alert cannot silently disappear.",
    status: "Passed",
    evidenceSummary: "Vacant Head of Sales role automatically reroutes escalations to Operations Lead (Xongile Mhlari) then CEO (Mavis Muchena).",
  },
];
