import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, FileText, Users, BarChart3, Settings, X, Mail, Edit, Send, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getQuickActionsByRoute = (pathname: string, navigate: (path: string) => void) => {
  switch (pathname) {
    case "/articles":
      return [
        { icon: FileText, label: "New Article", action: () => console.log("New Article") },
        { icon: Mail, label: "Conversation Hub", action: () => navigate("/conversation-hub") },
        { icon: Users, label: "Client Reactivation", action: () => navigate("/past-client-reactivation") },
        { icon: Archive, label: "Archive Selected", action: () => console.log("Archive Selected") },
      ];
    case "/conversation-hub":
      return [
        { icon: Plus, label: "New Draft", action: () => console.log("New Draft") },
        { icon: Send, label: "AI Suggestions", action: () => console.log("AI Suggestions") },
        { icon: Users, label: "Client Reactivation", action: () => navigate("/past-client-reactivation") },
        { icon: Archive, label: "Archive Selected", action: () => console.log("Archive Selected") },
      ];
    case "/past-client-reactivation":
      return [
        { icon: Users, label: "Add Client", action: () => console.log("Add Client") },
        { icon: Mail, label: "Generate AI Draft", action: () => console.log("Generate AI Draft") },
        { icon: Send, label: "Bulk Reactivation", action: () => console.log("Bulk Reactivation") },
        { icon: BarChart3, label: "Analytics", action: () => console.log("Analytics") },
      ];
    case "/":
    default:
      return [
        { icon: Users, label: "Manage Team", action: () => console.log("Manage Team") },
        { icon: BarChart3, label: "Performance", action: () => console.log("Performance") },
        { icon: Settings, label: "Quick Settings", action: () => console.log("Settings") },
      ];
  }
};

export const DynamicQuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const quickActions = getQuickActionsByRoute(location.pathname, navigate);

  return (
    <div className="fixed right-6 top-20 z-50">
      {/* Expanded Actions */}
      <div
        className={cn(
          "flex flex-col items-end gap-3 mb-4 transition-all duration-300",
          isExpanded
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-8 pointer-events-none"
        )}
      >
        {quickActions.map((action, index) => (
          <div
            key={action.label}
            className="flex items-center gap-3 group"
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : "0ms",
            }}
          >
            {/* Label */}
            <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border">
              <span className="text-sm font-medium whitespace-nowrap text-foreground">
                {action.label}
              </span>
            </div>

            {/* Action Button */}
            <Button
              onClick={action.action}
              size="sm"
              className="w-12 h-12 rounded-full transition-all hover:scale-110 shadow-lg"
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full transition-all duration-300 shadow-xl",
          "hover:scale-110 hover:shadow-2xl",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};