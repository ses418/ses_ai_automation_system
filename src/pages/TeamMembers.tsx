import React, { useState, useEffect } from 'react';
import AddMemberModal from '@/components/AddMemberModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Download, 
  Filter,
  MoreHorizontal,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  LogIn
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { TeamMembersService } from '@/services/teamMembersService';
import { TeamMember, TeamMemberFilters } from '@/types/team-members';

export default function TeamMembers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentUser] = useState({ isAdmin: true }); // Mock current user
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  // Load team members from Supabase
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsInitialLoading(true);
        console.log('Loading team members from Supabase...');
        const members = await TeamMembersService.getTeamMembers();
        console.log('Team members loaded:', members);
        setTeamMembers(members);
        setFilteredTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
        toast({
          title: "Error",
          description: `Failed to load team members: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadTeamMembers();
  }, [toast]);

  // Apply sorting to filtered members
  const sortedMembers = [...filteredTeamMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'dateAdded':
        return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
      case 'role':
        return (a.role || '').localeCompare(b.role || '');
      case 'department':
        return (a.department || '').localeCompare(b.department || '');
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending Invite';
      default: return 'Unknown';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Head of SES': return 'bg-purple-500';
      case 'Manager': return 'bg-blue-500';
      case 'HOD': return 'bg-indigo-500';
      case 'Engineer': return 'bg-green-500';
      case 'Staff': return 'bg-gray-500';
      case 'Intern': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'Head of SES': return 'Admin';
      case 'Manager': return 'Manager';
      case 'HOD': return 'HOD';
      case 'Engineer': return 'Engineer';
      case 'Staff': return 'Staff';
      case 'Intern': return 'Intern';
      default: return role || 'Unknown';
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedMembers.length === 0) return;
    
    switch (action) {
      case 'activate':
        console.log('Activating members:', selectedMembers);
        break;
      case 'deactivate':
        console.log('Deactivating members:', selectedMembers);
        break;
      case 'delete':
        console.log('Deleting members:', selectedMembers);
        break;
    }
    setSelectedMembers([]);
  };

  const handleMemberAction = (memberId: string, action: string) => {
    console.log(`Action ${action} on member ${memberId}`);
  };



  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMember = async (memberData: any) => {
    try {
      setIsLoading(true);
      console.log('Adding new team member:', memberData);
      
      // Create the new team member using the service
      const newMember = await TeamMembersService.createTeamMember({
        name: memberData.name,
        email: memberData.email,
        password: memberData.password,
        phone: memberData.phone,
        department: memberData.department,
        role: memberData.role,
        location: memberData.location
      });
      
      console.log('New member created:', newMember);
      
      // Refresh the team members list
      const updatedMembers = await TeamMembersService.getTeamMembers();
      console.log('Updated members list:', updatedMembers);
      setTeamMembers(updatedMembers);
      setFilteredTeamMembers(updatedMembers);
      
      toast({
        title: "Success",
        description: "Team member added successfully!"
      });
      
      setIsAddMemberModalOpen(false);
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: `Failed to add team member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectAllMembers = () => {
    if (selectedMembers.length === filteredTeamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredTeamMembers.map(m => m.id));
    }
  };

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    inactive: teamMembers.filter(m => m.status === 'inactive').length,
    pending: teamMembers.filter(m => m.status === 'pending').length,
    admins: teamMembers.filter(m => m.is_admin).length
  };

  const handleExportList = () => {
    toast({
      title: 'Exporting list...',
      description: 'Your team members list is being exported.',
    });
    // In a real app, you would implement the export logic here
    console.log('Exporting list...');
  };

  return (
    <div className="min-h-screen page-bg-primary p-6">
      {/* Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Team Members"
          subtitle="Manage and monitor all team members with comprehensive controls"
          actions={[
            {
              type: 'add',
              label: 'Add Member',
              onClick: () => setIsAddMemberModalOpen(true)
            },
            {
              type: 'export',
              label: 'Export List',
              onClick: handleExportList
            }
          ]}
        />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="card-glass-primary animate-glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 border-white/30 focus:bg-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="Head of SES">Head of SES</option>
                <option value="Manager">Manager</option>
                <option value="HOD">HOD</option>
                <option value="Engineer">Engineer</option>
                <option value="Staff">Staff</option>
                <option value="Intern">Intern</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Access</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="dateAdded">Sort by Date Added</option>
                <option value="role">Sort by Role</option>
                <option value="department">Sort by Department</option>
              </select>

              <div className="flex border border-white/30 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none border-0"
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-none border-0"
                >
                  Cards
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-blue-700">
                  {selectedMembers.length} member(s) selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllMembers}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  {selectedMembers.length === filteredTeamMembers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isInitialLoading && (
        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading team members...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Display */}
      {!isInitialLoading && (
        <>
          {viewMode === 'table' ? (
        /* Table View */
        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredTeamMembers.length && filteredTeamMembers.length > 0}
                        onChange={selectAllMembers}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">Member</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Role</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Department</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Contact</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Access</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Last Login</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.profile_picture} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getRoleColor(member.role || '')} text-white`}>
                          {getRoleText(member.role || '')}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-700">{member.department || 'Unassigned'}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{member.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(member.status)} text-white`}>
                          {getStatusText(member.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {member.dashboard_access === 'visible' ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700 capitalize">
                            {member.dashboard_access}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          <div>
                            {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
                          </div>
                          {member.last_login && (
                            <div className="text-xs text-gray-400">
                              {new Date(member.last_login).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {currentUser.isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMemberAction(member.id, 'edit')}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMemberAction(member.id, 'toggle-status')}
                                className="h-8 w-8 p-0 hover:bg-green-50"
                              >
                                {member.status === 'active' ? (
                                  <UserX className="w-4 h-4 text-red-600" />
                                ) : (
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMemberAction(member.id, 'reset-password')}
                                className="h-8 w-8 p-0 hover:bg-yellow-50"
                              >
                                <Key className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMemberAction(member.id, 'delete')}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {!currentUser.isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMemberAction(member.id, 'view')}
                              className="h-8 w-8 p-0 hover:bg-gray-50"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member) => (
            <Card key={member.id} className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.profile_picture} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(member.status)} text-white text-xs`}>
                      {getStatusText(member.status)}
                    </Badge>
                    <Badge className={`${getRoleColor(member.role || '')} text-white text-xs`}>
                      {getRoleText(member.role || '')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>{member.department || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <LogIn className="w-4 h-4" />
                    <span>Added: {new Date(member.date_added).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {member.dashboard_access === 'visible' ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Dashboard: {member.dashboard_access}</span>
                  </div>
                </div>

                {currentUser.isAdmin && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMemberAction(member.id, 'edit')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMemberAction(member.id, 'toggle-status')}
                        className={member.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                      >
                        {member.status === 'active' ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMemberAction(member.id, 'delete')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </>
      )}

      {/* Empty State */}
      {!isInitialLoading && sortedMembers.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="bg-[#1473B9] hover:bg-[#0f5a8f] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onMemberAdded={handleAddMember}
      />
    </div>
  );
}
