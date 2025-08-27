import React, { useState } from "react";
import { 
  Edit, 
  Shield, 
  Eye, 
  Plus, 
  Save, 
  Trash2, 
  GripVertical,
  X,
  Check,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";

// Types
interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'date' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
  mandatory: boolean;
  options?: string[];
  order: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: {
    manageMembers: boolean;
    viewAllDepartments: boolean;
    viewAllProjects: boolean;
  };
}

interface VisibilityRule {
  roleId: string;
  roleName: string;
  memberManagement: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  departmentAccess: string[];
  projectAccess: string[];
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("form-builder");
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      id: "1",
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      mandatory: true,
      order: 1
    },
    {
      id: "2",
      name: "email",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
      mandatory: true,
      order: 2
    },
    {
      id: "3",
      name: "department",
      type: "select",
      label: "Department",
      placeholder: "Select department",
      required: false,
      mandatory: false,
      options: ["Engineering", "Sales", "Marketing", "Finance"],
      order: 3
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Head of SES",
      description: "Top-level administrator with full system access",
      level: 1,
      permissions: {
        manageMembers: true,
        viewAllDepartments: true,
        viewAllProjects: true
      }
    },
    {
      id: "2",
      name: "Department Manager",
      description: "Manages department-specific operations and team members",
      level: 2,
      permissions: {
        manageMembers: true,
        viewAllDepartments: false,
        viewAllProjects: false
      }
    },
    {
      id: "3",
      name: "Team Lead",
      description: "Leads small teams within departments",
      level: 3,
      permissions: {
        manageMembers: false,
        viewAllDepartments: false,
        viewAllProjects: false
      }
    }
  ]);

  const [visibilityRules, setVisibilityRules] = useState<VisibilityRule[]>([
    {
      roleId: "1",
      roleName: "Head of SES",
      memberManagement: { view: true, edit: true, delete: true },
      departmentAccess: ["Engineering", "Sales", "Marketing", "Finance"],
      projectAccess: ["All Projects"]
    },
    {
      roleId: "2",
      roleName: "Department Manager",
      memberManagement: { view: true, edit: true, delete: false },
      departmentAccess: ["Engineering"],
      projectAccess: ["Engineering Projects"]
    },
    {
      roleId: "3",
      roleName: "Team Lead",
      memberManagement: { view: true, edit: false, delete: false },
      departmentAccess: ["Engineering"],
      projectAccess: ["Team Projects"]
    }
  ]);

  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newField, setNewField] = useState<Partial<FormField>>({});
  const [newRole, setNewRole] = useState<Partial<Role>>({});

  const { toast } = useToast();

  // Form Builder Functions
  const handleAddField = () => {
    if (!newField.name || !newField.type || !newField.label) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const field: FormField = {
      id: Date.now().toString(),
      name: newField.name,
      type: newField.type as FormField['type'],
      label: newField.label,
      placeholder: newField.placeholder || "",
      required: newField.required || false,
      mandatory: newField.mandatory || false,
      options: newField.options || [],
      order: formFields.length + 1
    };

    setFormFields([...formFields, field]);
    setNewField({});
    setIsAddFieldModalOpen(false);
    
    toast({
      title: "Field Added! ✨",
      description: "New form field has been created successfully.",
    });
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setIsAddFieldModalOpen(true);
  };

  const handleUpdateField = () => {
    if (!editingField) return;

    const updatedFields = formFields.map(field => 
      field.id === editingField.id ? editingField : field
    );
    setFormFields(updatedFields);
    setEditingField(null);
    setIsAddFieldModalOpen(false);

    toast({
      title: "Field Updated! ✨",
      description: "Form field has been updated successfully.",
    });
  };

  const handleDeleteField = (id: string) => {
    const field = formFields.find(f => f.id === id);
    if (field?.mandatory) {
      toast({
        title: "Cannot Delete",
        description: "Mandatory fields cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    setFormFields(formFields.filter(f => f.id !== id));
    toast({
      title: "Field Deleted! 🗑️",
      description: "Form field has been removed successfully.",
    });
  };

  const handleReorderField = (id: string, direction: 'up' | 'down') => {
    const currentIndex = formFields.findIndex(f => f.id === id);
    if (currentIndex === -1) return;

    const newFields = [...formFields];
    if (direction === 'up' && currentIndex > 0) {
      [newFields[currentIndex], newFields[currentIndex - 1]] = [newFields[currentIndex - 1], newFields[currentIndex]];
    } else if (direction === 'down' && currentIndex < newFields.length - 1) {
      [newFields[currentIndex], newFields[currentIndex + 1]] = [newFields[currentIndex + 1], newFields[currentIndex]];
    }

    // Update order numbers
    newFields.forEach((field, index) => {
      field.order = index + 1;
    });

    setFormFields(newFields);
  };

  // Role Management Functions
  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      level: roles.length + 1,
      permissions: {
        manageMembers: newRole.permissions?.manageMembers || false,
        viewAllDepartments: newRole.permissions?.viewAllDepartments || false,
        viewAllProjects: newRole.permissions?.viewAllProjects || false
      }
    };

    setRoles([...roles, role]);
    setNewRole({});
    setIsAddRoleModalOpen(false);

    toast({
      title: "Role Added! ✨",
      description: "New role has been created successfully.",
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsAddRoleModalOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    const updatedRoles = roles.map(role => 
      role.id === editingRole.id ? editingRole : role
    );
    setRoles(updatedRoles);
    setEditingRole(null);
    setIsAddRoleModalOpen(false);

    toast({
      title: "Role Updated! ✨",
      description: "Role has been updated successfully.",
    });
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.name === "Head of SES") {
      toast({
        title: "Cannot Delete",
        description: "Head of SES role cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    setRoles(roles.filter(r => r.id !== id));
    toast({
      title: "Role Deleted! 🗑️",
      description: "Role has been removed successfully.",
    });
  };

  // Visibility Rules Functions
  const handleVisibilityChange = (roleId: string, field: string, value: any) => {
    const updatedRules = visibilityRules.map(rule => {
      if (rule.roleId === roleId) {
        if (field === 'memberManagement') {
          return { ...rule, memberManagement: value };
        } else if (field === 'departmentAccess') {
          return { ...rule, departmentAccess: value as string[] };
        } else if (field === 'projectAccess') {
          return { ...rule, projectAccess: value as string[] };
        }
      }
      return rule;
    });
    setVisibilityRules(updatedRules);
  };

  const getFieldTypeBadge = (type: string) => {
    const colors = {
      text: "bg-blue-100 text-blue-800",
      email: "bg-green-100 text-green-800",
      select: "bg-purple-100 text-purple-800",
      textarea: "bg-orange-100 text-orange-800",
      date: "bg-red-100 text-red-800",
      number: "bg-indigo-100 text-indigo-800"
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Settings"
          subtitle="Manage system configuration, roles, and permissions"
          actions={[
            {
              type: 'save',
              label: 'Save All Changes',
              onClick: () => {
                toast({
                  title: "Settings Saved! ✨",
                  description: "All configuration changes have been saved successfully.",
                });
              }
            }
          ]}
        />
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-3 h-14 bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <TabsTrigger value="form-builder" className="flex items-center gap-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-all duration-300">
            <Edit className="h-5 w-5" />
            <span className="font-medium">Form Builder</span>
          </TabsTrigger>
          <TabsTrigger value="role-hierarchy" className="flex items-center gap-3 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 transition-all duration-300">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Role Hierarchy</span>
          </TabsTrigger>
          <TabsTrigger value="visibility-rules" className="flex items-center gap-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 transition-all duration-300">
            <Eye className="h-5 w-5" />
            <span className="font-medium">Visibility Rules</span>
          </TabsTrigger>
        </TabsList>

        {/* Form Builder Tab */}
        <TabsContent value="form-builder" className="space-y-6">
          {/* Split Layout: Left Panel for New Field, Right Panel for Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Add New Field */}
            <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Add New Field
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input
                      id="fieldName"
                      placeholder="e.g., fullName"
                      value={newField.name || ""}
                      onChange={(e) => setNewField({...newField, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select
                      value={newField.type || ""}
                      onValueChange={(value) => setNewField({...newField, type: value as FormField['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fieldLabel">Display Label</Label>
                    <Input
                      id="fieldLabel"
                      placeholder="e.g., Full Name"
                      value={newField.label || ""}
                      onChange={(e) => setNewField({...newField, label: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                    <Input
                      id="fieldPlaceholder"
                      placeholder="e.g., Enter your name"
                      value={newField.placeholder || ""}
                      onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="required"
                        checked={newField.required || false}
                        onCheckedChange={(checked) => setNewField({...newField, required: checked as boolean})}
                      />
                      <Label htmlFor="required">Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mandatory"
                        checked={newField.mandatory || false}
                        onCheckedChange={(checked) => setNewField({...newField, mandatory: checked as boolean})}
                      />
                      <Label htmlFor="mandatory">Mandatory</Label>
                    </div>
                  </div>

                  {newField.type === 'select' && (
                    <div className="space-y-2">
                      <Label>Options (one per line)</Label>
                      <Textarea
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        value={newField.options?.join('\n') || ""}
                        onChange={(e) => setNewField({...newField, options: e.target.value.split('\n').filter(opt => opt.trim())})}
                        rows={3}
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleAddField}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Live Preview */}
            <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg min-h-[400px]">
                  {formFields.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No fields added yet.</p>
                      <p className="text-sm">Add fields on the left to see them here.</p>
                    </div>
                  ) : (
                    formFields.sort((a, b) => a.order - b.order).map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                          {field.mandatory && <Badge className="bg-red-100 text-red-800 text-xs">Mandatory</Badge>}
                        </Label>
                        {field.type === 'text' && (
                          <Input placeholder={field.placeholder} disabled />
                        )}
                        {field.type === 'email' && (
                          <Input type="email" placeholder={field.placeholder} disabled />
                        )}
                        {field.type === 'select' && (
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option, index) => (
                                <SelectItem key={index} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === 'textarea' && (
                          <Textarea placeholder={field.placeholder} disabled rows={3} />
                        )}
                        {field.type === 'date' && (
                          <Input type="date" disabled />
                        )}
                        {field.type === 'number' && (
                          <Input type="number" placeholder={field.placeholder} disabled />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Fields */}
          <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Existing Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formFields.sort((a, b) => a.order - b.order).map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className="flex items-center gap-3">
                        {getFieldTypeBadge(field.type)}
                        <div>
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-gray-500">{field.name}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {field.required && <Badge className="bg-green-100 text-green-800">Required</Badge>}
                      {field.mandatory && <Badge className="bg-red-100 text-red-800">Mandatory</Badge>}
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderField(field.id, 'up')}
                          disabled={field.order === 1}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderField(field.id, 'down')}
                          disabled={field.order === formFields.length}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {!field.mandatory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Hierarchy Tab */}
        <TabsContent value="role-hierarchy" className="space-y-6">
          {/* Add New Role */}
          <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add New Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., Project Manager"
                    value={newRole.name || ""}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description</Label>
                  <Input
                    id="roleDescription"
                    placeholder="Brief description of the role"
                    value={newRole.description || ""}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="manageMembers"
                      checked={newRole.permissions?.manageMembers || false}
                      onCheckedChange={(checked) => setNewRole({
                        ...newRole, 
                        permissions: {...newRole.permissions, manageMembers: checked as boolean}
                      })}
                    />
                    <Label htmlFor="manageMembers">Manage Members</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="viewAllDepartments"
                      checked={newRole.permissions?.viewAllDepartments || false}
                      onCheckedChange={(checked) => setNewRole({
                        ...newRole, 
                        permissions: {...newRole.permissions, viewAllDepartments: checked as boolean}
                      })}
                    />
                    <Label htmlFor="viewAllDepartments">View All Departments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="viewAllProjects"
                      checked={newRole.permissions?.viewAllProjects || false}
                      onCheckedChange={(checked) => setNewRole({
                        ...newRole, 
                        permissions: {...newRole.permissions, viewAllProjects: checked as boolean}
                      })}
                    />
                    <Label htmlFor="viewAllProjects">View All Projects</Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAddRole}
                className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </CardContent>
          </Card>

          {/* Role List */}
          <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Role Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.sort((a, b) => a.level - b.level).map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-100 text-blue-800">Level {role.level}</Badge>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {role.name !== "Head of SES" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Rules Tab */}
        <TabsContent value="visibility-rules" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Configure Visibility Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {visibilityRules.map((rule) => (
                  <div key={rule.roleId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{rule.roleName}</h3>
                      <Badge className="bg-purple-100 text-purple-800">Level {roles.find(r => r.id === rule.roleId)?.level}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Member Management */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Member Management</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={rule.memberManagement.view}
                              onCheckedChange={(checked) => handleVisibilityChange(rule.roleId, 'memberManagement', {
                                ...rule.memberManagement,
                                view: checked as boolean
                              })}
                            />
                            <Label className="text-sm">View Members</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={rule.memberManagement.edit}
                              onCheckedChange={(checked) => handleVisibilityChange(rule.roleId, 'memberManagement', {
                                ...rule.memberManagement,
                                edit: checked as boolean
                              })}
                            />
                            <Label className="text-sm">Edit Members</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={rule.memberManagement.delete}
                              onCheckedChange={(checked) => handleVisibilityChange(rule.roleId, 'memberManagement', {
                                ...rule.memberManagement,
                                delete: checked as boolean
                              })}
                            />
                            <Label className="text-sm">Delete Members</Label>
                          </div>
                        </div>
                      </div>

                      {/* Department Access */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Department Access</Label>
                        <div className="space-y-2">
                          {["Engineering", "Sales", "Marketing", "Finance"].map((dept) => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox
                                checked={rule.departmentAccess.includes(dept)}
                                onCheckedChange={(checked) => {
                                  const newAccess = checked 
                                    ? [...rule.departmentAccess, dept]
                                    : rule.departmentAccess.filter(d => d !== dept);
                                  handleVisibilityChange(rule.roleId, 'departmentAccess', newAccess);
                                }}
                              />
                              <Label className="text-sm">{dept}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Access */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Project Access</Label>
                        <div className="space-y-2">
                          {["All Projects", "Engineering Projects", "Sales Projects", "Team Projects"].map((project) => (
                            <div key={project} className="flex items-center space-x-2">
                              <Checkbox
                                checked={rule.projectAccess.includes(project)}
                                onCheckedChange={(checked) => {
                                  const newAccess = checked 
                                    ? [...rule.projectAccess, project]
                                    : rule.projectAccess.filter(p => p !== project);
                                  handleVisibilityChange(rule.roleId, 'projectAccess', newAccess);
                                }}
                              />
                              <Label className="text-sm">{project}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
