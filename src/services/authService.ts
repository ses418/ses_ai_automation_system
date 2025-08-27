import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/types/team-members';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  teamMember?: TeamMember;
  isAdmin?: boolean;
}

export interface SessionData {
  teamMember: TeamMember;
  isAdmin: boolean;
  sessionToken: string;
  expiresAt: string;
}

export class AuthService {
  private static readonly SESSION_KEY = 'ses_auth_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Call the database function to validate credentials
      const { data, error } = await supabase
        .rpc('validate_login_credentials', {
          p_email: credentials.email,
          p_password: credentials.password
        });

      if (error) {
        console.error('Login validation error:', error);
        return {
          success: false,
          message: 'Authentication service error. Please try again.'
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Invalid credentials. Please check your email and password.'
        };
      }

      const result = data[0];
      
      if (!result.is_valid) {
        return {
          success: false,
          message: result.message || 'Invalid credentials'
        };
      }

      // Get full team member details
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', result.team_member_id)
        .single();

      if (memberError || !memberData) {
        return {
          success: false,
          message: 'Failed to retrieve user profile. Please try again.'
        };
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();

      // Store session in database
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          team_member_id: result.team_member_id,
          session_token: sessionToken,
          expires_at: expiresAt,
          ip_address: '127.0.0.1', // In real app, get from request
          user_agent: navigator.userAgent
        });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return {
          success: false,
          message: 'Failed to create session. Please try again.'
        };
      }

      // Store session locally
      const sessionData: SessionData = {
        teamMember: memberData,
        isAdmin: result.is_admin,
        sessionToken,
        expiresAt
      };

      this.storeSession(sessionData);

      return {
        success: true,
        message: 'Login successful!',
        teamMember: memberData,
        isAdmin: result.is_admin
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Logout user and clear session
   */
  static async logout(): Promise<void> {
    try {
      const session = this.getCurrentSession();
      
      if (session) {
        // Remove session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', session.sessionToken);
      }

      // Clear local session
      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local session even if database cleanup fails
      this.clearSession();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): TeamMember | null {
    const session = this.getCurrentSession();
    if (!session || !this.isAuthenticated()) return null;
    return session.teamMember;
  }

  /**
   * Check if current user is admin
   */
  static isAdmin(): boolean {
    const session = this.getCurrentSession();
    if (!session || !this.isAuthenticated()) return false;
    return session.isAdmin;
  }

  /**
   * Refresh session if needed
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const session = this.getCurrentSession();
      if (!session) return false;

      // Check if session expires in next hour
      const expiresIn = new Date(session.expiresAt).getTime() - Date.now();
      if (expiresIn > 60 * 60 * 1000) return true; // More than 1 hour left

      // Extend session
      const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: newExpiresAt })
        .eq('session_token', session.sessionToken);

      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      // Update local session
      session.expiresAt = newExpiresAt;
      this.storeSession(session);

      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  /**
   * Validate session token with server
   */
  static async validateSession(): Promise<boolean> {
    try {
      const session = this.getCurrentSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', session.sessionToken)
        .eq('expires_at', 'gt', new Date().toISOString())
        .single();

      if (error || !data) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const session = this.getCurrentSession();
      if (!session) {
        return {
          success: false,
          message: 'No active session found'
        };
      }

      // Validate current password
      const { data, error } = await supabase
        .rpc('validate_login_credentials', {
          p_email: session.teamMember.email,
          p_password: currentPassword
        });

      if (error || !data || data.length === 0 || !data[0].is_valid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Update password (in real app, hash the new password)
      const { error: updateError } = await supabase
        .from('auth_credentials')
        .update({ 
          password_hash: `$2a$10$new.hash.${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('team_member_id', session.teamMember.id);

      if (updateError) {
        return {
          success: false,
          message: 'Failed to update password. Please try again.'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      };

    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Get user permissions and access levels
   */
  static getUserPermissions(): {
    canViewDashboard: boolean;
    canManageTeam: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
  } {
    const isAdmin = this.isAdmin();
    const user = this.getCurrentUser();

    return {
      canViewDashboard: true, // All authenticated users can view dashboard
      canManageTeam: isAdmin || user?.role === 'Manager' || user?.role === 'HOD',
      canViewAnalytics: isAdmin || user?.role === 'Manager',
      canExportData: isAdmin || user?.role === 'Manager'
    };
  }

  // Private helper methods

  private static generateSessionToken(): string {
    return 'ses_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private static storeSession(session: SessionData): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  private static getCurrentSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData) as SessionData;
      
      // Validate session structure
      if (!session.teamMember || !session.sessionToken || !session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  private static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
}
