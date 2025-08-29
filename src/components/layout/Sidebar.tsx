import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  Mail,
  Users,
  Database,
  RotateCcw,
  Linkedin,
  Settings,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { TeamMembersService } from "@/services/teamMembersService";

// Base sidebar items (always visible)
const baseSidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Proposal Maker", path: "/proposal-maker" },
  { icon: Mail, label: "Conversation Hub", path: "/conversation-hub" },
  { icon: Mail, label: "Newsletter", path: "/newsletter" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: ClipboardList, label: "Tasks", path: "/tasks" },
  { icon: Database, label: "Data Management", path: "/data" },
  { icon: Linkedin, label: "LinkedIn Automation", path: "/linkedin-client-reactivation" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Team Members item (conditionally visible)
const teamMembersItem = { icon: Users, label: "Team Members", path: "/team" };

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onHover: (hovered: boolean) => void;
  isHovered?: boolean;
}

export const Sidebar = ({ collapsed, onToggle, onHover, isHovered = false }: SidebarProps) => {
  const [hasTeamAccess, setHasTeamAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine if sidebar should show expanded content (either manually expanded or hovered)
  const shouldShowExpanded = !collapsed || isHovered;

  // Check if user has access to Team Members
  useEffect(() => {
    const checkTeamAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const isAdmin = await TeamMembersService.isAdminOrHeadOfSES();
          setHasTeamAccess(isAdmin);
        }
      } catch (error) {
        console.error('Error checking team access:', error);
        setHasTeamAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeamAccess();
  }, []);

  // Build sidebar items based on user access
  const sidebarItems = hasTeamAccess 
    ? [...baseSidebarItems.slice(0, 5), teamMembersItem, ...baseSidebarItems.slice(5)]
    : baseSidebarItems;

  if (isLoading) {
    return (
      <aside className="fixed left-0 top-16 bottom-0 glass-sidebar w-16 transition-all duration-500 z-40">
        <div className="p-4 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 glass-sidebar transition-all duration-500 z-40",
        shouldShowExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group animate-glass",
                "hover:bg-primary-brand-light hover:text-primary-brand",
                isActive
                  ? "glass-gradient-primary text-primary-brand border-primary-brand-light shadow-primary-brand"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {shouldShowExpanded && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};