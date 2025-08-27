import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Plus, Download, Filter, Search, Settings as SettingsIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
  actions?: {
    type: 'save' | 'add' | 'export' | 'filter' | 'search' | 'settings' | 'custom';
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: boolean;
    icon?: React.ReactNode;
  }[];
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  gradient = true,
  actions = [],
  children
}) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'save':
        return <Save className="h-5 w-5 mr-2" />;
      case 'add':
        return <Plus className="h-5 w-5 mr-2" />;
      case 'export':
        return <Download className="h-5 w-5 mr-2" />;
      case 'filter':
        return <Filter className="h-5 w-5 mr-2" />;
      case 'search':
        return <Search className="h-5 w-5 mr-2" />;
      case 'settings':
        return <SettingsIcon className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  const getActionVariant = (type: string, variant?: string) => {
    if (variant) return variant;
    
    switch (type) {
      case 'save':
        return 'default';
      case 'add':
        return 'default';
      case 'export':
        return 'outline';
      case 'filter':
        return 'ghost';
      case 'search':
        return 'ghost';
      case 'settings':
        return 'ghost';
      default:
        return 'default';
    }
  };

  const getActionStyles = (type: string) => {
    switch (type) {
      case 'save':
        return "btn-primary-gradient";
      case 'add':
        return "btn-primary-gradient";
      case 'export':
        return "btn-primary-glass";
      case 'filter':
        return "btn-primary-glass";
      case 'search':
        return "btn-primary-glass";
      case 'settings':
        return "btn-primary-glass";
      default:
        return "btn-primary-glass";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 p-4 glass-gradient-primary rounded-2xl animate-glass">
      {/* Left Side - Title and Subtitle */}
      <div className="flex-1">
        <h1 className={`text-3xl font-bold ${
          gradient 
            ? 'bg-gradient-to-r from-[#277CBF] to-[#1e5a8a] bg-clip-text text-transparent' 
            : 'text-primary-brand'
        }`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-primary-brand/80 mt-1 text-base">{subtitle}</p>
        )}
        {children}
      </div>

      {/* Right Side - Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={getActionVariant(action.type, action.variant) as any}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`transition-all duration-500 transform hover:-translate-y-1 animate-glass-hover ${getActionStyles(action.type)}`}
            >
              {action.icon || getActionIcon(action.type)}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
