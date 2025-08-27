import React, { useState, useEffect } from "react";
import { 
  X, 
  Database, 
  Tag, 
  Building, 
  Link,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Entity types
interface BaseEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Category extends BaseEntity {
  description?: string;
  color?: string;
}

interface Keyword extends BaseEntity {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Company extends BaseEntity {
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large';
  website?: string;
}

interface URL extends BaseEntity {
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastChecked?: string;
}

type EntityType = 'category' | 'keyword' | 'company' | 'url';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entityData: any) => void;
  mode: 'add' | 'edit';
  entityType: EntityType;
  entity?: any;
}

const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  entityType,
  entity
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when entity changes
  useEffect(() => {
    if (entity && mode === 'edit') {
      setFormData(entity);
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        priority: 'medium',
        industry: '',
        size: 'medium',
        website: '',
        status: 'pending',
        color: '#3B82F6'
      });
    }
  }, [entity, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving entity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'category': return <Database className="w-5 h-5" />;
      case 'keyword': return <Tag className="w-5 h-5" />;
      case 'company': return <Building className="w-5 h-5" />;
      case 'url': return <Link className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  const getEntityTitle = () => {
    const action = mode === 'add' ? 'Add' : 'Edit';
    const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return `${action} ${entityName}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            {getEntityIcon()}
            {getEntityTitle()}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={`Enter ${entityType} name`}
                  required
                />
              </div>

              {/* Entity-specific fields */}
              {entityType === 'category' && (
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
              )}

              {entityType === 'keyword' && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
              )}

              {entityType === 'company' && (
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Enter industry"
                  />
                </div>
              )}

              {entityType === 'url' && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
              )}
            </div>

            {/* Additional fields row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entityType === 'keyword' && (
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority || 'medium'}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {entityType === 'company' && (
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={formData.size || 'medium'}
                    onValueChange={(value) => handleInputChange('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {entityType === 'url' && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'pending'}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {entityType === 'company' && (
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter website URL"
                    type="url"
                  />
                </div>
              )}
            </div>

            {/* Description field for categories */}
            {entityType === 'category' && (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'add' ? 'Add' : 'Update'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityModal;
