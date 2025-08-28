import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/types/team-members';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  status: string;
  department?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  role?: string;
  location?: string;
}

export class AuthService {
  private static currentUser: AuthUser | null = null;

  /**
   * Initialize authentication state
   */
  static async initialize(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get team member profile
        const profile = await this.getTeamMemberProfile(user.id);
        if (profile) {
          this.currentUser = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            is_admin: profile.is_admin,
            status: profile.status,
            department: profile.department,
            role: profile.role
          };
        }
      }
      
      return this.currentUser;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return null;
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(): boolean {
    return this.currentUser?.is_admin === true;
  }

  /**
   * Check if user has active status
   */
  static isActive(): boolean {
    return this.currentUser?.status === 'active';
  }

  /**
   * Sign up with Supabase Auth and create team member profile
   */
  static async signUp(data: RegisterData): Promise<{ user: AuthUser; error?: string }> {
    try {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            department: data.department,
            role: data.role,
            location: data.location
          }
        }
      });

      if (authError) {
        return { user: null as any, error: authError.message };
      }

      if (!authData.user) {
        return { user: null as any, error: 'Failed to create user' };
      }

      // Create team member profile using the secure function
      const { data: profile, error: profileError } = await supabase
        .rpc('create_team_member_with_auth', {
          p_name: data.name,
          p_email: data.email,
          p_password_hash: 'supabase_auth', // We're using Supabase Auth, so this is just a placeholder
          p_phone: data.phone,
          p_department: data.department,
          p_role: data.role,
          p_location: data.location,
          p_status: 'pending', // New users start as pending
          p_is_admin: false
        });

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null as any, error: profileError.message };
      }

      // Set current user
      this.currentUser = {
        id: profile,
        email: data.email,
        name: data.name,
        is_admin: false,
        status: 'pending',
        department: data.department,
        role: data.role
      };

      return { user: this.currentUser };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { user: null as any, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { user: null as any, error: error.message };
      }

      if (!data.user) {
        return { user: null as any, error: 'No user returned from authentication' };
      }

      // Get team member profile
      const profile = await this.getTeamMemberProfile(data.user.id);
      if (!profile) {
        console.error('No team member profile found for email:', data.user.email);
        return { user: null as any, error: `Team member profile not found for email: ${data.user.email}. Please contact an administrator.` };
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        return { user: null as any, error: 'Account is not active. Please contact an administrator.' };
      }

      // Set current user
      this.currentUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        is_admin: profile.is_admin,
        status: profile.status,
        department: profile.department,
        role: profile.role
      };

      // Update last login
      await this.updateLastLogin(profile.id);

      return { user: this.currentUser };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { user: null as any, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  }

  /**
   * Get team member profile by auth user email
   */
  private static async getTeamMemberProfile(authUserId: string): Promise<TeamMember | null> {
    try {
      // Get current user from session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching current user:', userError);
        return null;
      }

      if (!user || !user.email) {
        console.error('No email found for current user');
        return null;
      }

      console.log('Looking for team member with email:', user.email);

      // Find team member by email
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching team member profile by email:', error);
        return null;
      }

      console.log('Found team member profile:', data);
      return data;
    } catch (error) {
      console.error('Error in getTeamMemberProfile:', error);
      return null;
    }
  }

  /**
   * Update last login time
   */
  private static async updateLastLogin(teamMemberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', teamMemberId);

      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUserProfile(): Promise<TeamMember | null> {
    try {
      if (!this.currentUser) {
        return null;
      }

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
   * Update current user profile
   */
  static async updateCurrentUserProfile(updateData: Partial<TeamMember>): Promise<TeamMember | null> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      // Update current user object
      this.currentUser = {
        ...this.currentUser,
        ...updateData
      };

      return data;
    } catch (error) {
      console.error('Error in updateCurrentUserProfile:', error);
      return null;
    }
  }

  /**
   * Change password
   */
  static async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in changePassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await this.getTeamMemberProfile(session.user.id);
        if (profile) {
          this.currentUser = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            is_admin: profile.is_admin,
            status: profile.status,
            department: profile.department,
            role: profile.role
          };
          callback(this.currentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }
}
