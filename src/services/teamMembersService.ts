import { supabase } from '@/lib/supabase';
import { 
  TeamMember, 
  CreateTeamMemberData, 
  UpdateTeamMemberData, 
  TeamMemberFilters 
} from '@/types/team-members';

export class TeamMembersService {
  /**
   * Get all team members with optional filtering (admin only)
   */
  static async getTeamMembers(filters?: TeamMemberFilters): Promise<TeamMember[]> {
    try {
      console.log('TeamMembersService.getTeamMembers called with filters:', filters);
      
      // Use the team_members table directly
      let query = supabase
        .from('team_members')
        .select('*')
        .order('date_added', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dashboard_access) {
        query = query.eq('dashboard_access', filters.dashboard_access);
      }

      console.log('Executing Supabase query...');
      const { data, error } = await query;
      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching team members:', error);
        throw new Error(`Failed to fetch team members: ${error.message}`);
      }

      console.log('Team members fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      throw error;
    }
  }

  /**
   * Get a single team member by ID (admin or own profile)
   */
  static async getTeamMemberById(id: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        console.error('Error fetching team member:', error);
        throw new Error(`Failed to fetch team member: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getTeamMemberById:', error);
      throw error;
    }
  }

  /**
   * Get a team member by email (admin only)
   */
  static async getTeamMemberByEmail(email: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        console.error('Error fetching team member by email:', error);
        throw new Error(`Failed to fetch team member: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getTeamMemberByEmail:', error);
      throw error;
    }
  }

  /**
   * Create a new team member (admin only)
   */
  static async createTeamMember(memberData: CreateTeamMemberData): Promise<TeamMember> {
    try {
      console.log('TeamMembersService.createTeamMember called with data:', memberData);
      
      // Check if email already exists
      const existingMember = await this.getTeamMemberByEmail(memberData.email);
      if (existingMember) {
        throw new Error('A team member with this email already exists');
      }

      // Use the secure function that respects RLS policies
      const { data, error } = await supabase
        .rpc('create_team_member_with_auth', {
          p_name: memberData.name,
          p_email: memberData.email,
          p_password_hash: 'supabase_auth', // Placeholder since we're using Supabase Auth
          p_phone: memberData.phone,
          p_department: memberData.department,
          p_role: memberData.role,
          p_location: memberData.location,
          p_status: 'active',
          p_dashboard_access: 'visible',
          p_is_admin: memberData.role === 'Head of SES'
        });

      console.log('Supabase RPC response:', { data, error });

      if (error) {
        console.error('Error creating team member:', error);
        throw new Error(`Failed to create team member: ${error.message}`);
      }

      // Get the created team member
      const createdMember = await this.getTeamMemberById(data);
      if (!createdMember) {
        throw new Error('Failed to retrieve created team member');
      }

      console.log('Team member created successfully:', createdMember);
      return createdMember;
    } catch (error) {
      console.error('Error in createTeamMember:', error);
      throw error;
    }
  }

  /**
   * Update an existing team member (admin or own profile)
   */
  static async updateTeamMember(id: string, updateData: UpdateTeamMemberData): Promise<TeamMember> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        throw new Error(`Failed to update team member: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateTeamMember:', error);
      throw error;
    }
  }

  /**
   * Delete a team member (admin only)
   */
  static async deleteTeamMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting team member:', error);
        throw new Error(`Failed to delete team member: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteTeamMember:', error);
      throw error;
    }
  }

  /**
   * Update team member status (admin only)
   */
  static async updateTeamMemberStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<TeamMember> {
    return this.updateTeamMember(id, { status });
  }

  /**
   * Update dashboard access (admin only)
   */
  static async updateDashboardAccess(id: string, access: 'visible' | 'hidden'): Promise<TeamMember> {
    return this.updateTeamMember(id, { dashboard_access: access });
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating last login:', error);
        throw new Error(`Failed to update last login: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
      throw error;
    }
  }

  /**
   * Get team members by department (admin only)
   */
  static async getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
    return this.getTeamMembers({ department });
  }

  /**
   * Get team members by role (admin only)
   */
  static async getTeamMembersByRole(role: string): Promise<TeamMember[]> {
    return this.getTeamMembers({ role });
  }

  /**
   * Get active team members (admin only)
   */
  static async getActiveTeamMembers(): Promise<TeamMember[]> {
    return this.getTeamMembers({ status: 'active' });
  }

  /**
   * Get admin team members (admin only)
   */
  static async getAdminTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_admin', true)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching admin team members:', error);
        throw new Error(`Failed to fetch admin team members: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAdminTeamMembers:', error);
      throw error;
    }
  }

  /**
   * Get team member count by department (admin only)
   */
  static async getTeamMemberCountByDepartment(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('department')
        .not('department', 'is', null);

      if (error) {
        console.error('Error fetching team member count by department:', error);
        throw new Error(`Failed to fetch team member count by department: ${error.message}`);
      }

      const countByDepartment: Record<string, number> = {};
      data?.forEach(member => {
        const dept = member.department || 'Unassigned';
        countByDepartment[dept] = (countByDepartment[dept] || 0) + 1;
      });

      return countByDepartment;
    } catch (error) {
      console.error('Error in getTeamMemberCountByDepartment:', error);
      throw error;
    }
  }

  /**
   * Get current user's own profile
   */
  static async getCurrentUserProfile(): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_current_user_profile');

      if (error) {
        console.error('Error fetching current user profile:', error);
        return null;
      }

      return data[0] || null;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  }

  /**
   * Update current user's own profile
   */
  static async updateCurrentUserProfile(updateData: Partial<TeamMember>): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', (await this.getCurrentUserProfile())?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating current user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCurrentUserProfile:', error);
      return null;
    }
  }

  /**
   * Get department options for dropdown
   */
  static getDepartmentOptions(): string[] {
    return [
      'Head of SES',
      'Business and Development',
      'Project',
      'Process Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Instrumental Engineering',
      'Civil & Structural Engineering',
      'Piping Engineering',
      'Procurement',
      'Construction'
    ];
  }

  /**
   * Get role options based on department
   */
  static getRoleOptionsByDepartment(department: string): string[] {
    if (department === 'Head of SES') {
      return ['Head of SES'];
    } else if (department === 'Business and Development') {
      return ['Head of Department', 'Manager', 'Engineer'];
    } else {
      return ['Head of Department', 'Manager', 'Engineer', 'Designer'];
    }
  }

  /**
   * Add new team member with authentication
   */
  static async addNewTeamMember(memberData: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    role: string;
    location?: string;
  }): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      console.log('Adding team member:', memberData);

      // Step 1: Store in add_members_form_details table
      console.log('Step 1: Inserting into add_members_form_details table...');
      const { data: formData, error: formError } = await supabase
        .from('add_members_form_details')
        .insert({
          full_name: memberData.full_name,
          email: memberData.email,
          department: memberData.department,
          role: memberData.role
        })
        .select();

      if (formError) {
        console.error('Error storing form details:', formError);
        return { success: false, message: `Failed to store form details: ${formError.message}` };
      }
      console.log('Step 1 completed successfully:', formData);

      // Step 2: Store in team_members table
      console.log('Step 2: Inserting into team_members table...');
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .insert({
          name: memberData.full_name,
          email: memberData.email,
          password_hash: memberData.password,
          phone: memberData.phone,
          department: memberData.department,
          role: memberData.role,
          location: memberData.location,
          status: 'active',
          dashboard_access: 'visible',
          is_admin: memberData.role === 'Head of SES'
        })
        .select();

      if (teamError) {
        console.error('Error storing team member:', teamError);
        return { success: false, message: `Failed to store team member: ${teamError.message}` };
      }
      console.log('Step 2 completed successfully:', teamData);

      return { 
        success: true, 
        message: 'Team member added successfully!',
        userId: undefined
      };
    } catch (error) {
      console.error('Error in addNewTeamMember:', error);
      return { success: false, message: 'Failed to add team member. Please try again.' };
    }
  }

  /**
   * Check if current user is admin or head of SES
   */
  static async isAdminOrHeadOfSES(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in auth');
        return false;
      }

      console.log('Checking admin access for user:', user.email);
      console.log('User metadata:', user.user_metadata);

      // Check if user is admin (more flexible check)
      if (user.email && user.email.includes('marketing@shiva-engineering')) {
        console.log('User is admin (email match)');
        return true;
      }

      // Check if user has head_of_ses role
      if (user.user_metadata?.role === 'head_of_ses') {
        console.log('User is head of SES (role match)');
        return true;
      }

      // Check if user exists in team_members with admin role
      try {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('is_admin, role')
          .eq('email', user.email)
          .maybeSingle();

        if (teamMember && (teamMember.is_admin || teamMember.role === 'Head of SES')) {
          console.log('User is admin or head of SES (from team_members)');
          return true;
        }
      } catch (teamError) {
        console.log('Could not check team_members table:', teamError);
      }

      // Check if user exists in profiles with admin role
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('email', user.email)
          .maybeSingle();

        if (profile && (profile.is_admin || profile.role === 'Head of SES')) {
          console.log('User is admin or head of SES (from profiles)');
          return true;
        }
      } catch (profileError) {
        console.log('Could not check profiles table:', profileError);
      }

      console.log('User is not admin or head of SES');
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}
