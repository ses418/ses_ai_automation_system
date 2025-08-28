import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create user object from auth data only
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'User',
          role: data.user.user_metadata?.role || 'user',
        };

        return { user, error: null };
      }

      return { user: null, error: 'No user data received' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return { user: null, error: error?.message || 'No user found' };
      }

      const currentUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
        role: user.user_metadata?.role || 'user',
      };

      return { user: currentUser, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          role: session.user.user_metadata?.role || 'user',
        };
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}
