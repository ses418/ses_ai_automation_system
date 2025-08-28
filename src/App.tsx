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
import LinkedInClientReactivation from "./pages/LinkedInClientReactivation";
import TeamMembers from "./pages/TeamMembers";
import Tasks from "./pages/Tasks";
import DataManagement from "./pages/DataManagement";
import Settings from "./pages/Settings";
import ProposalMaker from "./pages/ProposalMaker";

import { useAuth } from "./hooks/useAuth";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple authentication check (in a real app, this would use proper auth context)
const isAuthenticated = () => {
  // For demo purposes, check if user has signed in
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex items-center justify-center">Loading...</div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/signin" element={<SignIn />} />

            
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
            <Route path="/linkedin-client-reactivation" element={
              <ProtectedRoute>
                <Layout><LinkedInClientReactivation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Layout><TeamMembers /></Layout>
              </ProtectedRoute>
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
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;