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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { TeamMembersService } from "@/services/teamMembersService";

// Base sidebar items (always visible)
const baseSidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: FileText, label: "Proposal Maker", path: "/proposal-maker" },
  { icon: Mail, label: "Cold Mails", path: "/conversation-hub" },
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
  const [isVisible, setIsVisible] = useState(false);
  
  // Determine if sidebar should show expanded content (either manually expanded or hovered)
  const shouldShowExpanded = !collapsed || isHovered;

  // Check if user has access to Team Members
  useEffect(() => {
    let isMounted = true;
    
    const checkTeamAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const isAdmin = await TeamMembersService.isAdminOrHeadOfSES();
          if (isMounted) {
            setHasTeamAccess(isAdmin);
          }
        }
      } catch (error) {
        console.error('Error checking team access:', error);
        if (isMounted) {
          setHasTeamAccess(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        console.warn('Team access check timed out, defaulting to no access');
      }
    }, 3000); // 3 second timeout

    checkTeamAccess();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Add entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Reduced from 100ms for faster appearance
    return () => clearTimeout(timer);
  }, []);

  // Build sidebar items based on user access
  const sidebarItems = hasTeamAccess 
    ? [...baseSidebarItems.slice(0, 5), teamMembersItem, ...baseSidebarItems.slice(5)]
    : baseSidebarItems;

  // Fallback: if loading takes too long, show sidebar anyway
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('Sidebar loading fallback: showing sidebar without admin check');
        setIsLoading(false);
      }
    }, 2000); // 2 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  // Show loading state only briefly, then fallback to normal sidebar
  if (isLoading) {
    return (
      <aside className="fixed left-0 top-16 bottom-0 sidebar-glass w-16 sidebar-transition z-40 opacity-0 translate-x-[-100%] animate-fade-in-slide">
        <div className="p-4 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 sidebar-glass sidebar-transition z-40",
        "transform-gpu", // Enable hardware acceleration
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-100%]",
        shouldShowExpanded ? "w-64 shadow-2xl" : "w-16 shadow-xl",
        // Enhanced glassmorphism effects
        "backdrop-blur-2xl bg-white/15 border-r border-white/40",
        // Subtle gradient overlay
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        // Custom CSS properties for enhanced animations
        '--sidebar-width': shouldShowExpanded ? '16rem' : '4rem',
        '--sidebar-bg': shouldShowExpanded ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.12)',
      } as React.CSSProperties}
    >
      {/* Enhanced background glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-r-2xl sidebar-transition",
        "bg-gradient-to-br from-white/20 via-white/10 to-transparent",
        shouldShowExpanded ? "opacity-100" : "opacity-60"
      )} />
      
      {/* Hover mode indicator */}
      {isHovered && !collapsed && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs text-white/80 font-medium sidebar-transition-fast animate-scale-in">
          Hover Mode
        </div>
      )}
      
      {/* Navigation */}
      <nav className="relative p-4 space-y-3">
        {sidebarItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl sidebar-item-hover group",
                "animate-fade-in-delay",
                isActive
                  ? "glass-gradient-primary text-primary-brand border-primary-brand-light shadow-primary-brand shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <div className="icon-container">
              <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            {shouldShowExpanded && (
              <span className="font-medium truncate sidebar-transition-fast opacity-100">
                {item.label}
              </span>
            )}
            {shouldShowExpanded && (
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 sidebar-transition-fast transform translate-x-[-10px] group-hover:translate-x-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section with toggle button */}
      <div className={cn(
        "absolute bottom-4 left-0 right-0 px-4 sidebar-transition",
        shouldShowExpanded ? "opacity-100" : "opacity-0"
      )}>
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
            "glass-button hover:bg-white/30 sidebar-transition-fast",
            "border border-white/30 hover:border-white/50",
            "text-sm font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "w-4 h-4 sidebar-transition-fast",
            collapsed ? "rotate-180" : "rotate-0"
          )}>
            <ChevronRight className="w-4 h-4" />
          </div>
          {shouldShowExpanded && (
            <span className="sidebar-transition-fast">
              {collapsed ? "Expand" : "Collapse"}
            </span>
          )}
        </button>
      </div>

      {/* Hover indicator for collapsed state */}
      {!shouldShowExpanded && (
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 sidebar-transition-fast" />
      )}
    </aside>
  );
};