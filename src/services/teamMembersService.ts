import { supabase } from '@/lib/supabase';
import { 
  TeamMember, 
  CreateTeamMemberData, 
  UpdateTeamMemberData, 
  TeamMemberFilters 
} from '@/types/team-members';

export class TeamMembersService {
  /**
   * Get all team members with optional filtering
   */
  static async getTeamMembers(filters?: TeamMemberFilters): Promise<TeamMember[]> {
    try {
      console.log('TeamMembersService.getTeamMembers called with filters:', filters);
      
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
   * Get a single team member by ID
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
   * Get a team member by email
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
   * Create a new team member
   */
  static async createTeamMember(memberData: CreateTeamMemberData): Promise<TeamMember> {
    try {
      console.log('TeamMembersService.createTeamMember called with data:', memberData);
      
      // Check if email already exists
      const existingMember = await this.getTeamMemberByEmail(memberData.email);
      if (existingMember) {
        throw new Error('A team member with this email already exists');
      }

      // Hash the password (in a real app, this should be done on the backend)
      // For now, we'll store a placeholder hash
      const passwordHash = `$2a$10$dummy.hash.${Date.now()}`;

      const insertData = {
        name: memberData.name,
        email: memberData.email,
        password_hash: passwordHash,
        phone: memberData.phone,
        department: memberData.department,
        role: memberData.role,
        location: memberData.location,
        status: 'active',
        dashboard_access: 'visible',
        is_admin: memberData.role === 'Head of SES'
      };

      console.log('Inserting data into Supabase:', insertData);
      
      const { data, error } = await supabase
        .from('team_members')
        .insert(insertData)
        .select()
        .single();

      console.log('Supabase insert response:', { data, error });

      if (error) {
        console.error('Error creating team member:', error);
        throw new Error(`Failed to create team member: ${error.message}`);
      }

      console.log('Team member created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createTeamMember:', error);
      throw error;
    }
  }

  /**
   * Update an existing team member
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
   * Delete a team member
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
   * Update team member status
   */
  static async updateTeamMemberStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<TeamMember> {
    return this.updateTeamMember(id, { status });
  }

  /**
   * Update dashboard access
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
   * Get team members by department
   */
  static async getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
    return this.getTeamMembers({ department });
  }

  /**
   * Get team members by role
   */
  static async getTeamMembersByRole(role: string): Promise<TeamMember[]> {
    return this.getTeamMembers({ role });
  }

  /**
   * Get active team members
   */
  static async getActiveTeamMembers(): Promise<TeamMember[]> {
    return this.getTeamMembers({ status: 'active' });
  }

  /**
   * Get admin team members
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
   * Get team member count by department
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
   * Check if team_members table exists and create it if it doesn't
   */
  static async ensureTableExists(): Promise<boolean> {
    try {
      console.log('Checking if team_members table exists...');
      
      // Try to select from the table to see if it exists
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('relation "team_members" does not exist')) {
          console.log('Table does not exist, attempting to create it...');
          return await this.createTable();
        } else {
          console.error('Error checking table existence:', error);
          return false;
        }
      }

      console.log('Table exists and is accessible');
      return true;
    } catch (error) {
      console.error('Error in ensureTableExists:', error);
      return false;
    }
  }

  /**
   * Create the team_members table
   */
  private static async createTable(): Promise<boolean> {
    try {
      console.log('Creating team_members table...');
      
      // Create table using SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.team_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            department VARCHAR(100),
            role VARCHAR(100),
            location VARCHAR(255),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
            dashboard_access VARCHAR(20) DEFAULT 'visible' CHECK (dashboard_access IN ('visible', 'hidden')),
            profile_picture VARCHAR(500),
            date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
          CREATE INDEX IF NOT EXISTS idx_team_members_department ON public.team_members(department);
          CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
          CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
          CREATE INDEX IF NOT EXISTS idx_team_members_date_added ON public.team_members(date_added);
          
          -- IMPORTANT: Do NOT enable RLS for now
          -- ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
          
          -- Grant permissions
          GRANT ALL ON public.team_members TO public;
          GRANT USAGE ON SCHEMA public TO public;
        `
      });

      if (error) {
        console.error('Error creating table:', error);
        return false;
      }

      console.log('Table created successfully');
      return true;
    } catch (error) {
      console.error('Error in createTable:', error);
      return false;
    }
  }

  /**
   * Disable RLS temporarily (for development/testing)
   */
  static async disableRLS(): Promise<boolean> {
    try {
      console.log('Attempting to disable RLS on team_members table...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;'
      });

      if (error) {
        console.error('Error disabling RLS:', error);
        return false;
      }

      console.log('RLS disabled successfully');
      return true;
    } catch (error) {
      console.error('Error in disableRLS:', error);
      return false;
    }
  }
}
