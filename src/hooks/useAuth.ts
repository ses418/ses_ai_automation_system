import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await AuthService.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, loading };
};
