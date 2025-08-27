import React from "react";
import PageHeader from "./PageHeader";

// Example component showing different PageHeader usage patterns
const PageHeaderExample: React.FC = () => {
  const handleSave = () => console.log("Save clicked");
  const handleAdd = () => console.log("Add clicked");
  const handleExport = () => console.log("Export clicked");
  const handleFilter = () => console.log("Filter clicked");

  return (
    <div className="space-y-8 p-6">
      {/* Basic Header */}
      <PageHeader
        title="Basic Page"
        subtitle="A simple page with just title and subtitle"
      />

      {/* Header with Actions */}
      <PageHeader
        title="Page with Actions"
        subtitle="Multiple action buttons on the right"
        actions={[
          {
            type: 'save',
            label: 'Save Changes',
            onClick: handleSave
          },
          {
            type: 'add',
            label: 'Add New',
            onClick: handleAdd
          }
        ]}
      />

      {/* Header without Gradient */}
      <PageHeader
        title="No Gradient Title"
        subtitle="Title without gradient effect"
        gradient={false}
      />

      {/* Header with Custom Actions */}
      <PageHeader
        title="Custom Actions"
        subtitle="Different action types and custom icons"
        actions={[
          {
            type: 'export',
            label: 'Export Data',
            onClick: handleExport
          },
          {
            type: 'filter',
            label: 'Advanced Filter',
            onClick: handleFilter
          },
          {
            type: 'custom',
            label: 'Custom Action',
            onClick: () => console.log("Custom clicked"),
            variant: 'outline'
          }
        ]}
      />

      {/* Header with Children */}
      <PageHeader
        title="With Children"
        subtitle="Additional content below the title"
        children={
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-500">Status: Active</span>
            <span className="text-sm text-gray-500">Last updated: 2 hours ago</span>
          </div>
        }
      />
    </div>
  );
};

export default PageHeaderExample;
