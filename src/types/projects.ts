export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date?: string;
  estimated_hours: number;
  actual_hours?: number;
  budget: number;
  spent_amount?: number;
  progress_percentage: number;
  team_members: string[];
  project_manager: string;
  category: ProjectCategory;
  tags: string[];
  risk_level: RiskLevel;
  risk_notes?: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectCategory = 'consulting' | 'implementation' | 'maintenance' | 'training' | 'audit' | 'research';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CreateProjectData {
  name: string;
  description: string;
  client_id: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date?: string;
  estimated_hours: number;
  budget: number;
  team_members: string[];
  project_manager: string;
  category: ProjectCategory;
  tags?: string[];
  risk_level: RiskLevel;
  risk_notes?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  budget?: number;
  spent_amount?: number;
  progress_percentage?: number;
  team_members?: string[];
  project_manager?: string;
  category?: ProjectCategory;
  tags?: string[];
  risk_level?: RiskLevel;
  risk_notes?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  category?: ProjectCategory;
  client_id?: string;
  project_manager?: string;
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  due_date: string;
  completed_date?: string;
  status: MilestoneStatus;
  deliverables: string[];
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: DeliverableType;
  status: DeliverableStatus;
  due_date: string;
  completed_date?: string;
  assigned_to?: string;
  file_urls?: string[];
  review_required: boolean;
  reviewed_by?: string;
  review_date?: string;
  created_at: string;
  updated_at: string;
}

export type DeliverableType = 'document' | 'presentation' | 'report' | 'code' | 'design' | 'training_material';
export type DeliverableStatus = 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'approved';

export interface ProjectResource {
  id: string;
  project_id: string;
  team_member_id: string;
  role: ProjectRole;
  allocation_percentage: number;
  start_date: string;
  end_date?: string;
  hourly_rate?: number;
  total_hours?: number;
  created_at: string;
  updated_at: string;
}

export type ProjectRole = 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'tester' | 'consultant';

export interface ProjectTimeline {
  id: string;
  project_id: string;
  phase: string;
  start_date: string;
  end_date: string;
  dependencies: string[];
  critical_path: boolean;
  slack_days: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  category: BudgetCategory;
  budgeted_amount: number;
  spent_amount: number;
  committed_amount: number;
  remaining_amount: number;
  variance_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BudgetCategory = 'labor' | 'materials' | 'equipment' | 'travel' | 'software' | 'other';

export const PROJECT_CATEGORIES = [
  'Consulting',
  'Implementation',
  'Maintenance',
  'Training',
  'Audit',
  'Research',
  'Strategy',
  'Optimization'
] as const;

export const PROJECT_TAGS = [
  'Strategic',
  'Tactical',
  'Innovation',
  'Compliance',
  'Digital Transformation',
  'Process Improvement',
  'Technology Upgrade',
  'Emergency Response'
] as const;
