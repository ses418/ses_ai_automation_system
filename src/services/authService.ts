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
  avatar_url?: string;
  last_sign_in_at?: string;
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

export interface AuthResponse {
  user: AuthUser | null;
  error?: string;
  session?: any;
}

export class AuthService {
  private static currentUser: AuthUser | null = null;
  private static authListener: (() => void) | null = null;

  /**
   * Initialize authentication state from session
   */
  static async initialize(): Promise<AuthUser | null> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      if (session?.user) {
        // Get team member profile
        const profile = await this.getTeamMemberProfileByEmail(session.user.email!);
        if (profile && profile.status === 'active') {
          this.currentUser = this.mapTeamMemberToAuthUser(profile);
          return this.currentUser;
        }
      }
      
      return null;
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
   * Check if user has a valid session
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      // Verify user profile exists and is active
      const profile = await this.getTeamMemberProfileByEmail(session.user.email!);
      return profile !== null && profile.status === 'active';
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
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
   * Sign up with proper Supabase Auth
   */
  static async signUp(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate password strength
      if (!this.isPasswordStrong(data.password)) {
        return { 
          user: null, 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' 
        };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            department: data.department,
            role: data.role,
            location: data.location
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // Create team member profile
      const { data: profile, error: profileError } = await supabase
        .from('team_members')
        .insert([{
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          role: data.role,
          location: data.location,
          status: 'pending',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: profileError.message };
      }

      // Send verification email
      await supabase.auth.resend({
        type: 'signup',
        email: data.email
      });

      return { 
        user: null, 
        error: 'Account created successfully. Please check your email to verify your account before signing in.' 
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { user: null, error: 'An unexpected error occurred during account creation' };
    }
  }

  /**
   * Sign in with proper Supabase Auth
   */
  static async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return { user: null, error: 'Email and password are required' };
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { user: null, error: this.getUserFriendlyError(error.message) };
      }

      if (!data.user) {
        return { user: null, error: 'Authentication failed' };
      }

      // Get team member profile
      const profile = await this.getTeamMemberProfileByEmail(data.user.email!);
      if (!profile) {
        await supabase.auth.signOut();
        return { user: null, error: 'User profile not found. Please contact an administrator.' };
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        return { user: null, error: 'Account is not active. Please contact an administrator.' };
      }

      // Map to auth user
      this.currentUser = this.mapTeamMemberToAuthUser(profile);

      // Update last login
      await this.updateLastLogin(profile.id);

      // Set up auth state listener
      this.setupAuthStateListener();

      return { user: this.currentUser, session: data.session };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { user: null, error: 'An unexpected error occurred during authentication' };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      
      if (this.authListener) {
        this.authListener();
        this.authListener = null;
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  }

  /**
   * Get team member profile by email
   */
  static async getTeamMemberProfileByEmail(email: string): Promise<TeamMember | null> {
    try {
      // First try to get from team_members table
      let { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team member profile from team_members:', error);
        return null;
      }

      // If found in team_members, return it
      if (data) {
        return data;
      }

      // If not found in team_members, try profiles table as fallback
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile from profiles table:', profileError);
        return null;
      }

      // If found in profiles, convert to TeamMember format
      if (profileData) {
        return {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          password_hash: '',
          phone: profileData.phone || '',
          department: profileData.department || '',
          role: profileData.role || '',
          location: profileData.location || '',
          status: profileData.status || 'active',
          dashboard_access: profileData.dashboard_access || 'visible',
          profile_picture: profileData.profile_picture || '',
          date_added: profileData.created_at,
          last_login: profileData.updated_at,
          is_admin: profileData.is_admin || false,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getTeamMemberProfileByEmail:', error);
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
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamMemberId);

      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
    }
  }

  /**
   * Map team member to auth user
   */
  static mapTeamMemberToAuthUser(profile: TeamMember): AuthUser {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      is_admin: profile.is_admin,
      status: profile.status,
      department: profile.department,
      role: profile.role,
      avatar_url: profile.profile_picture,
      last_sign_in_at: profile.last_login
    };
  }

  /**
   * Setup authentication state listener
   */
  private static setupAuthStateListener(): void {
    if (this.authListener) {
      this.authListener();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await this.getTeamMemberProfileByEmail(session.user.email!);
        if (profile && profile.status === 'active') {
          this.currentUser = this.mapTeamMemberToAuthUser(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      } else if (event === 'TOKEN_REFRESHED') {
        // Handle token refresh
        console.log('Token refreshed');
      }
    });

    this.authListener = () => subscription.unsubscribe();
  }

  /**
   * Validate password strength
   */
  private static isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Get user-friendly error messages
   */
  private static getUserFriendlyError(error: string): string {
    if (error.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (error.includes('Too many requests')) {
      return 'Too many login attempts. Please try again later.';
    }
    return error;
  }

  /**
   * Change password
   */
  static async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isPasswordStrong(newPassword)) {
        return { 
          success: false, 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' 
        };
      }

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
        redirectTo: `${window.location.origin}/auth/reset-password`
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
   * Get current user profile
   */
  static async getCurrentUserProfile(): Promise<TeamMember | null> {
    try {
      if (!this.currentUser) {
        return null;
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching current user profile:', error);
        return null;
      }

      return data;
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
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
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
   * Refresh session
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error('Error in refreshSession:', error);
      return false;
    }
  }

  /**
   * Get session
   */
  static async getSession(): Promise<any> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }
}
