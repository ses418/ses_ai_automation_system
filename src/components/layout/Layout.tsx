import { useState, useRef, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { DynamicQuickActions } from "./DynamicQuickActions";
import { Chatbot } from "./Chatbot";
import { cn } from "@/lib/utils";

import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  // Start with sidebar collapsed by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle sidebar hover with improved timing
  const handleSidebarHover = (hovered: boolean) => {
    if (hovered) {
      // Clear any existing timeout when hovering
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setSidebarHovered(true);
    } else {
      // Add delay before closing to prevent accidental closing
      // Reduced delay for more responsive experience
      hoverTimeoutRef.current = setTimeout(() => {
        setSidebarHovered(false);
      }, 200); // 200ms delay for more responsive experience
    }
  };

  // Add entrance animation for content
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Determine if sidebar should be expanded (either manually expanded or hovered)
  const isSidebarExpanded = !sidebarCollapsed || sidebarHovered;

  return (
    <div className="min-h-screen page-bg-primary w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#277CBF]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#277CBF]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#277CBF]/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onHover={handleSidebarHover}
        isHovered={sidebarHovered}
      />
      <DynamicQuickActions />
      <Chatbot />

      <main
        className={cn(
          "pt-16 sidebar-transition relative z-10",
          "transform-gpu", // Enable hardware acceleration
          isSidebarExpanded ? "ml-64" : "ml-16",
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};