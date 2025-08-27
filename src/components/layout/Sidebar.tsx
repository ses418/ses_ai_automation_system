import { NavLink } from "react-router-dom";
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

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Proposal Maker", path: "/proposal-maker" },
  { icon: Mail, label: "Conversation Hub", path: "/conversation-hub" },
  { icon: FileText, label: "Articles", path: "/articles" },
  { icon: Users, label: "Team Members", path: "/team" },
  { icon: ClipboardList, label: "Tasks", path: "/tasks" },
  { icon: Database, label: "Data Management", path: "/data" },
  { icon: Linkedin, label: "LinkedIn Automation", path: "/linkedin-client-reactivation" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onHover: (hovered: boolean) => void;
  isHovered?: boolean;
}

export const Sidebar = ({ collapsed, onToggle, onHover, isHovered = false }: SidebarProps) => {
  // Determine if sidebar should show expanded content (either manually expanded or hovered)
  const shouldShowExpanded = !collapsed || isHovered;

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