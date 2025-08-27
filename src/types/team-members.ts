export interface TeamMember {
  id: string;
  name: string;
  email: string;
  password_hash?: string; // Optional in frontend, required in database
  phone?: string;
  department?: string;
  role?: string;
  location?: string;
  status: 'active' | 'inactive' | 'pending';
  dashboard_access: 'visible' | 'hidden';
  profile_picture?: string;
  date_added: string;
  last_login?: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeamMemberData {
  name: string;
  email: string;
  password: string; // Frontend sends plain password, backend hashes it
  phone?: string;
  department?: string;
  role?: string;
  location?: string;
}

export interface UpdateTeamMemberData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'pending';
  dashboard_access?: 'visible' | 'hidden';
  profile_picture?: string;
  is_admin?: boolean;
}

export interface TeamMemberFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  dashboard_access?: string;
}

export const TEAM_MEMBER_DEPARTMENTS = [
  'Engineering',
  'Marketing', 
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Executive'
] as const;

export const TEAM_MEMBER_ROLES = [
  'Engineer',
  'Manager',
  'HOD',
  'Head of SES',
  'Staff',
  'Intern'
] as const;

export const TEAM_MEMBER_STATUSES = [
  'active',
  'inactive',
  'pending'
] as const;

export const DASHBOARD_ACCESS_OPTIONS = [
  'visible',
  'hidden'
] as const;
