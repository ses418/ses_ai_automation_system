export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry: string;
  status: ClientStatus;
  relationship_status: RelationshipStatus;
  priority: ClientPriority;
  tags: string[];
  contact_person?: string;
  website?: string;
  address?: string;
  notes?: string;
  last_contact_date?: string;
  next_follow_up?: string;
  total_revenue?: number;
  project_count: number;
  reactivation_attempts: number;
  last_reactivation_date?: string;
  created_at: string;
  updated_at: string;
}

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'lead' | 'customer' | 'churned';
export type RelationshipStatus = 'new' | 'developing' | 'established' | 'at_risk' | 'recovered';
export type ClientPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreateClientData {
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry: string;
  status: ClientStatus;
  relationship_status: RelationshipStatus;
  priority: ClientPriority;
  tags?: string[];
  contact_person?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  industry?: string;
  status?: ClientStatus;
  relationship_status?: RelationshipStatus;
  priority?: ClientPriority;
  tags?: string[];
  contact_person?: string;
  website?: string;
  address?: string;
  notes?: string;
  last_contact_date?: string;
  next_follow_up?: string;
  total_revenue?: number;
}

export interface ClientFilters {
  search?: string;
  industry?: string;
  status?: ClientStatus;
  relationship_status?: RelationshipStatus;
  priority?: ClientPriority;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  type: InteractionType;
  subject: string;
  description: string;
  outcome: InteractionOutcome;
  follow_up_required: boolean;
  follow_up_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export type InteractionType = 'email' | 'call' | 'meeting' | 'proposal' | 'follow_up' | 'reactivation';
export type InteractionOutcome = 'positive' | 'neutral' | 'negative' | 'no_response' | 'scheduled';

export interface ClientReactivation {
  id: string;
  client_id: string;
  strategy: ReactivationStrategy;
  status: ReactivationStatus;
  attempts: number;
  last_attempt_date: string;
  next_attempt_date?: string;
  success_date?: string;
  notes?: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export type ReactivationStrategy = 'email_campaign' | 'linkedin_outreach' | 'phone_call' | 'direct_mail' | 'referral_request';
export type ReactivationStatus = 'planned' | 'in_progress' | 'successful' | 'failed' | 'paused';

export const CLIENT_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Construction',
  'Retail',
  'Education',
  'Government',
  'Non-Profit',
  'Real Estate',
  'Transportation',
  'Energy',
  'Media',
  'Consulting',
  'Other'
] as const;

export const CLIENT_TAGS = [
  'VIP',
  'Enterprise',
  'Startup',
  'SMB',
  'Government',
  'International',
  'High-Potential',
  'At-Risk',
  'Referral Source',
  'Industry Leader'
] as const;
