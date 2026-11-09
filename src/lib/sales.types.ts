export const MSP_INDUSTRIES = [
  "Financial Services",
  "Insurance",
  "Healthcare",
  "Education",
  "Retail",
  "Real Estate",
  "Technology / IT",
  "Construction",
  "Manufacturing",
  "Hospitality",
  "Professional Services",
  "Other",
] as const;

export type Industry = (typeof MSP_INDUSTRIES)[number];

export type LeadSource =
  | "Inbound Meta Ads"
  | "Website Referral"
  | "Cold Outreach"
  | "LinkedIn"
  | "Google Ads"
  | "GoHighLevel"
  | "Referral"
  | "Other";

export type LeadStage =
  | "New"
  | "Contacted"
  | "Discovery"
  | "Proposal Sent"
  | "Won"
  | "Lost";

export type LeadQuality = "Hot" | "Warm" | "Cold";

export type ProposalStatus =
  | "Draft"
  | "Sent"
  | "Awaiting Signature"
  | "Accepted"
  | "Declined";

export interface LeadItem {
  id: string;
  businessName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  industry: Industry;
  source: LeadSource;
  stage: LeadStage;
  leadQuality: LeadQuality;
  estimatedValue: number; // Monthly ZAR
  assignedConsultantId: string;
  assignedConsultantEmail: string;
  assignedSalesperson: string;
  followUpDate: string;
  proposalStatus: ProposalStatus;
  packageInterest: string;
  notes: string;
  lastActivityDate?: string;
  handoverCompleted?: boolean;
  ghlContactId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesActivityItem {
  id: string;
  leadId: string;
  businessName: string;
  type: "Call" | "Meeting" | "Email" | "WhatsApp" | "Proposal Sent";
  notes: string;
  activityDate: string;
  performedBy: string;
  consultantId?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field?: "email" | "phone" | "businessName";
  value?: string;
  matchingLead?: LeadItem;
  reason?: string;
}

export interface SalesTarget {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  month: string; // Format: "YYYY-MM" e.g. "2026-11"
  targetAmount: number; // In ZAR
  assignedById: string;
  assignedByName: string;
  assignedAt: string;
  updatedAt: string;
}

export interface ConsultantPerformanceRanking {
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  month: string;
  targetAmount: number;
  actualWonAmount: number;
  remainingAmount: number;
  percentageAchieved: number;
  dealsCount: number;
  wonDealsCount: number;
  leadsCount: number;
  status: "exceeded" | "reached" | "missed";
  rank: number;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface GHLAppointment {
  id: string;
  ghlEventId?: string;
  clientName: string;
  contactEmail?: string;
  contactPhone?: string;
  consultantId: string;
  consultantName: string;
  appointmentDate: string; // ISO date-time
  durationMinutes?: number;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  followUpInfo?: string;
  leadId?: string;
  createdAt: string;
}

export interface IndustryPerformanceSummary {
  industry: Industry;
  totalLeads: number;
  wonDeals: number;
  conversionRate: number;
  totalRevenue: number;
}

