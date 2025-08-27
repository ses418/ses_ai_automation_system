import { useState } from "react";
import { Bell, Search, MessageCircle, User } from "lucide-react";
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

export const Header = () => {
  const [isPersonalSettingsOpen, setIsPersonalSettingsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-header">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-4">
            <img 
              src="/src/components/layout/asserts/download-removebg-preview.png" 
              alt="SES Logo" 
              className="w-10 h-10"
            />
            <h1 className="text-xl font-semibold text-primary-brand">Shiva Engineering Services</h1>
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
                    <AvatarImage src="/api/placeholder/32/32" alt="Profile" />
                    <AvatarFallback className="gradient-primary text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 modal-glass" align="end">
                <DropdownMenuItem>My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPersonalSettingsOpen(true)}>
                  Personal Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
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