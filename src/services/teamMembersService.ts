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
      
      // Use the secure view that respects RLS policies
      let query = supabase
        .from('secure_team_members_view')
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
        .from('secure_team_members_view')
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
        .from('secure_team_members_view')
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
}
