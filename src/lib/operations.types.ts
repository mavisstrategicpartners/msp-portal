export type ClientType = "Business" | "Individual";

export type OnboardingStage =
  | "New Client"
  | "Initial Contact"
  | "Information Required"
  | "Verification in Progress"
  | "Documentation Pending"
  | "Ready for Approval"
  | "Onboarding Completed"
  | "On Hold"
  | "Declined"
  | "Draft";

export interface OnboardingStep {
  id: string;
  stepKey: string;
  title: string;
  required: boolean;
  completed: boolean;
  completedDate?: string | null;
  completedBy?: string | null;
  evidenceRef?: string | null;
  blocker?: string | null;
}

export interface ClientCommunicationLog {
  id: string;
  clientId: string;
  interactionDate: string;
  channel: "Email" | "Phone" | "WhatsApp" | "Meeting" | "Video Conference" | "Written Correspondence";
  responsibleEmployee: string;
  summary: string;
  outstandingQuestions?: string;
  promisedFollowUp?: string;
  nextCommunicationDate?: string;
  recordedAt: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  clientType: ClientType;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  businessRegistrationNumber?: string | null;
  address: string;
  servicesRequired: string;
  accountManagerId: string | null;
  accountManagerName: string;
  onboardingStartDate: string;
  targetCompletionDate: string;
  stage: OnboardingStage;
  blocker: string | null;
  escalationStatus: "Normal" | "Escalated" | "Overdue Blocker";
  steps: OnboardingStep[];
  notes: string;
  specialRequirements?: string;
  communications: ClientCommunicationLog[];
  businessDaysAge: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  createdByName?: string;
}

export interface CreateClientInput {
  name: string;
  clientType: ClientType;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  businessRegistrationNumber?: string;
  address: string;
  servicesRequired: string;
  accountManagerId?: string | null;
  onboardingStartDate?: string;
  targetCompletionDate?: string;
  notes?: string;
  specialRequirements?: string;
  isDraft?: boolean;
}

export interface UpdateClientInput {
  name?: string;
  clientType?: ClientType;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  businessRegistrationNumber?: string;
  address?: string;
  servicesRequired?: string;
  accountManagerId?: string | null;
  stage?: OnboardingStage;
  notes?: string;
  specialRequirements?: string;
  blocker?: string | null;
  targetCompletionDate?: string;
}
