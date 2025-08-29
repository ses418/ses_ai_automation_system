import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, User, Mail, Lock, Phone, Building2, MapPin, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TeamMembersService } from '@/services/teamMembersService';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: string;
  location: string;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('required');

  // Get department options from service
  const departments = TeamMembersService.getDepartmentOptions();
  
  // Get role options based on selected department
  const getRoleOptions = () => {
    if (!formData.department) return [];
    return TeamMembersService.getRoleOptionsByDepartment(formData.department);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset role when department changes
    if (field === 'department') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        role: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      console.log('Form submission blocked - already loading');
      return;
    }
    
    console.log('Form submission started with data:', formData);
    
    // Validate required fields
    const requiredFields: (keyof FormData)[] = ['full_name', 'email', 'password', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.log('Validation failed, missing fields:', missingFields);
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    console.log('Validation passed, setting loading state');
    setIsLoading(true);

    try {
      console.log('Calling TeamMembersService.addNewTeamMember...');
      
      // Add timeout protection to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 seconds
      });
      
      // Add the member using the service with timeout
      const result = await Promise.race([
        TeamMembersService.addNewTeamMember(formData),
        timeoutPromise
      ]);
      
      console.log('Service result:', result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        
        // Close modal and reset form
        onClose();
        resetForm();
        
        // Call the callback to refresh the parent component
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('Clearing loading state');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      role: '',
      location: ''
    });
    setActiveTab('required');
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Add New Team Member
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Fill in the required information to add a new team member to the system.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="destructive" className="text-xs font-medium">Required</Badge>
                  <span className="text-sm text-gray-600">These fields are mandatory</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="required" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Required Fields
              </TabsTrigger>
              <TabsTrigger 
                value="optional" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Additional Information
              </TabsTrigger>
            </TabsList>

            {/* Required Fields Tab */}
            <TabsContent value="required" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            {/* Optional Fields Tab */}
            <TabsContent value="optional" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Department
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept} className="text-base py-3">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Role
                  </Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleInputChange('role', value)}
                    disabled={!formData.department}
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base">
                      <SelectValue placeholder={formData.department ? "Select role" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getRoleOptions().map(role => (
                        <SelectItem key={role} value={role} className="text-base py-3">
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.department && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available roles for {formData.department}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Note:</span> Only Admin users can add team members
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding Member...</span>
                  </div>
                ) : (
                  <span>Add Member</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;


