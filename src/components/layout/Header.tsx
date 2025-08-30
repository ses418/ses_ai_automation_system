import { useState, useEffect } from "react";
import { Bell, Search, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PersonalSettingsModal from "@/components/PersonalSettingsModal";
import { AuthService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const Header = () => {
  const [isPersonalSettingsOpen, setIsPersonalSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state immediately
    const initAuth = async () => {
      try {
        const user = await AuthService.initialize();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get user profile when signed in
        const profile = await AuthService.getTeamMemberProfileByEmail(session.user.email!);
        if (profile && profile.status === 'active') {
          setCurrentUser(AuthService.mapTeamMemberToAuthUser(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setCurrentUser(null);
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't render header if still loading or no user
  if (isLoading || !currentUser) {
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-header">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-4">
            <img 
              src="/Logo.png" 
              alt="SES Logo" 
              className="w-20 h-20 object-contain"
            />
            
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-brand/60 h-4 w-4" />
              <Input
                placeholder="Search articles, employees, projects..."
                className="pl-10 input-glass-primary"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="glass-button hover-primary-brand-light">
              <Bell className="h-5 w-5 text-primary-brand" />
            </Button>

            <Button variant="ghost" size="icon" className="glass-button hover-primary-brand-light">
              <MessageCircle className="h-5 w-5 text-primary-brand" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="relative h-8 w-8 rounded-full glass-button hover-primary-brand-light">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar_url || "/api/placeholder/32/32"} alt="Profile" />
                      <AvatarFallback className="gradient-primary text-white">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 modal-glass" align="end">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  {currentUser?.name || 'User'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm text-muted-foreground">{currentUser?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsPersonalSettingsOpen(true)}>
                  Personal Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Personal Settings Modal */}
      <PersonalSettingsModal
        isOpen={isPersonalSettingsOpen}
        onClose={() => setIsPersonalSettingsOpen(false)}
      />
    </>
  );
};