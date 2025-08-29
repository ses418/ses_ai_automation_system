import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/Articles";
import ConversationHub from "./pages/ConversationHub";
import Newsletter from "./pages/Newsletter";
import LinkedInClientReactivation from "./pages/LinkedInClientReactivation";
import TeamMembers from "./pages/TeamMembers";
import Tasks from "./pages/Tasks";
import DataManagement from "./pages/DataManagement";
import Settings from "./pages/Settings";
import ProposalMaker from "./pages/ProposalMaker";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthService } from "@/services/authService";
import { TeamMembersService } from "@/services/teamMembersService";

const queryClient = new QueryClient();

// Production-ready authentication check using Supabase sessions
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication state
    const initAuth = async () => {
      try {
        const user = await AuthService.initialize();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, isLoading };
};

// Protected Route Component
const ProtectedRoute = ({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
                      <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <img 
                      src="/ses-logo.png" 
                      alt="SES Logo Loading" 
                      className="w-24 h-24 mx-auto mb-4 animate-pulse animate-spin"
                    />
                    <p className="text-primary-brand text-lg font-medium animate-pulse">Loading...</p>
                  </div>
                </div>
    );
  }

  if (reverse) {
    // For reverse protection (like SignIn page), redirect to dashboard if already authenticated
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  } else {
    // For normal protection, redirect to signin if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/signin" replace />;
    }
    return <>{children}</>;
  }
};

// Admin Route Component - Only accessible by Admin or Head of SES
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isAuthenticated) {
        try {
          console.log('AdminRoute: Checking admin access for authenticated user');
          const isAdmin = await TeamMembersService.isAdminOrHeadOfSES();
          console.log('AdminRoute: Admin check result:', isAdmin);
          setHasAdminAccess(isAdmin);
        } catch (error) {
          console.error('AdminRoute: Error checking admin access:', error);
          setHasAdminAccess(false);
        }
      } else {
        console.log('AdminRoute: User not authenticated');
        setHasAdminAccess(false);
      }
    };

    // Only check admin access when authentication is fully established
    if (isAuthenticated && !isLoading) {
      checkAdminAccess();
    }
  }, [isAuthenticated, isLoading]);

  // Show loading while checking authentication or admin status
  if (isLoading || (isAuthenticated && hasAdminAccess === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/ses-logo.png" 
            alt="SES Logo Loading" 
            className="w-24 h-24 mx-auto mb-4 animate-pulse animate-spin"
          />
          <p className="text-primary-brand text-lg font-medium animate-pulse">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has admin access
  if (!hasAdminAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute: Access granted, rendering Team Members page');
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/signin" element={
              <ProtectedRoute reverse={true}>
                <SignIn />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Wrapped in Layout and ProtectedRoute */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/articles" element={
              <ProtectedRoute>
                <Layout><Articles /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/conversation-hub" element={
              <ProtectedRoute>
                <Layout><ConversationHub /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/newsletter" element={
              <ProtectedRoute>
                <Layout><Newsletter /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/linkedin-client-reactivation" element={
              <ProtectedRoute>
                <Layout><LinkedInClientReactivation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <AdminRoute>
                <Layout><TeamMembers /></Layout>
              </AdminRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout><Tasks /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/data" element={
              <ProtectedRoute>
                <Layout><DataManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/proposal-maker" element={
              <ProtectedRoute>
                <Layout><ProposalMaker /></Layout>
              </ProtectedRoute>
            } />

            {/* Default redirect - if authenticated go to dashboard, otherwise to signin */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;