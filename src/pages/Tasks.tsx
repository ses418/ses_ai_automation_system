import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  FileText, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Brain,
  Target,
  Zap,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Wrench,
  Bell,
  Settings,
  BarChart3,
  Calendar,
  Mail,
  MessageSquare,
  ClipboardList,
  ArrowUpDown,
  Star,
  Activity
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'email_draft' | 'review' | 'send' | 'monitor' | 'analysis';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  createdAt: string;
  projectId: string;
  projectName: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'head_of_department' | 'head_manager' | 'engineer';
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  currentTasks: number;
  maxCapacity: number;
  skills: string[];
  lastActive: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  assignedTeam: string[];
  progress: number;
  tasks: string[];
}

const mockTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Draft Infrastructure Proposal Email",
    description: "Create a comprehensive email draft for the city infrastructure project proposal",
    type: "email_draft",
    priority: "high",
    status: "pending",
    assignedTo: "ENG-001",
    assignedBy: "ADMIN-001",
    dueDate: "2024-01-25",
    createdAt: "2024-01-20",
    projectId: "PROJ-001",
    projectName: "City Infrastructure Development",
    estimatedHours: 4,
    tags: ["proposal", "infrastructure", "client"]
  },
  {
    id: "TASK-002",
    title: "Review Engineering Calculations",
    description: "Review and validate all engineering calculations for the bridge project",
    type: "review",
    priority: "urgent",
    status: "in_progress",
    assignedTo: "ENG-002",
    assignedBy: "MGR-001",
    dueDate: "2024-01-22",
    createdAt: "2024-01-19",
    projectId: "PROJ-002",
    projectName: "Bridge Construction Project",
    estimatedHours: 8,
    actualHours: 3,
    tags: ["review", "calculations", "bridge"]
  },
  {
    id: "TASK-003",
    title: "Send Client Update Newsletter",
    description: "Send monthly newsletter to all active clients with project updates",
    type: "send",
    priority: "medium",
    status: "pending",
    assignedTo: "ENG-003",
    assignedBy: "ADMIN-001",
    dueDate: "2024-01-26",
    createdAt: "2024-01-20",
    projectId: "PROJ-003",
    projectName: "Client Communication",
    estimatedHours: 2,
    tags: ["newsletter", "client", "communication"]
  },
  {
    id: "TASK-004",
    title: "Monitor Project Progress",
    description: "Track and report on the progress of ongoing construction projects",
    type: "monitor",
    priority: "medium",
    status: "in_progress",
    assignedTo: "ENG-001",
    assignedBy: "MGR-001",
    dueDate: "2024-01-24",
    createdAt: "2024-01-18",
    projectId: "PROJ-001",
    projectName: "City Infrastructure Development",
    estimatedHours: 6,
    actualHours: 4,
    tags: ["monitoring", "progress", "reporting"]
  },
  {
    id: "TASK-005",
    title: "Analyze Cost Optimization",
    description: "Analyze project costs and identify optimization opportunities",
    type: "analysis",
    priority: "high",
    status: "pending",
    assignedTo: "ENG-002",
    assignedBy: "ADMIN-001",
    dueDate: "2024-01-28",
    createdAt: "2024-01-20",
    projectId: "PROJ-002",
    projectName: "Bridge Construction Project",
    estimatedHours: 10,
    tags: ["analysis", "cost", "optimization"]
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "ADMIN-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@ses.com",
    role: "head_of_department",
    department: "Engineering",
    status: "active",
    avatar: "/avatars/sarah.jpg",
    currentTasks: 2,
    maxCapacity: 8,
    skills: ["project_management", "structural_engineering", "team_leadership"],
    lastActive: "2024-01-20 10:30 AM"
  },
  {
    id: "MGR-001",
    name: "Michael Chen",
    email: "michael.chen@ses.com",
    role: "head_manager",
    department: "Engineering",
    status: "active",
    avatar: "/avatars/michael.jpg",
    currentTasks: 3,
    maxCapacity: 6,
    skills: ["civil_engineering", "project_planning", "quality_assurance"],
    lastActive: "2024-01-20 09:15 AM"
  },
  {
    id: "ENG-001",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@ses.com",
    role: "engineer",
    department: "Engineering",
    status: "active",
    avatar: "/avatars/emily.jpg",
    currentTasks: 4,
    maxCapacity: 5,
    skills: ["structural_engineering", "autocad", "project_coordination"],
    lastActive: "2024-01-20 11:45 AM"
  },
  {
    id: "ENG-002",
    name: "David Park",
    email: "david.park@ses.com",
    role: "engineer",
    department: "Engineering",
    status: "inactive",
    avatar: "/avatars/david.jpg",
    currentTasks: 0,
    maxCapacity: 5,
    skills: ["civil_engineering", "materials_science", "safety_analysis"],
    lastActive: "2024-01-15 02:30 PM"
  },
  {
    id: "ENG-003",
    name: "Lisa Thompson",
    email: "lisa.thompson@ses.com",
    role: "engineer",
    department: "Engineering",
    status: "active",
    avatar: "/avatars/lisa.jpg",
    currentTasks: 2,
    maxCapacity: 5,
    skills: ["environmental_engineering", "sustainability", "regulatory_compliance"],
    lastActive: "2024-01-20 08:20 AM"
  }
];

const mockProjects: Project[] = [
  {
    id: "PROJ-001",
    name: "City Infrastructure Development",
    description: "Comprehensive infrastructure development project for downtown area",
    status: "active",
    priority: "high",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    assignedTeam: ["ADMIN-001", "ENG-001", "ENG-003"],
    progress: 35,
    tasks: ["TASK-001", "TASK-004"]
  },
  {
    id: "PROJ-002",
    name: "Bridge Construction Project",
    description: "Design and construction of a major bridge connecting two districts",
    status: "active",
    priority: "urgent",
    startDate: "2023-11-01",
    endDate: "2024-08-31",
    assignedTeam: ["MGR-001", "ENG-002"],
    progress: 60,
    tasks: ["TASK-002", "TASK-005"]
  },
  {
    id: "PROJ-003",
    name: "Client Communication",
    description: "Ongoing client communication and relationship management",
    status: "active",
    priority: "medium",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    assignedTeam: ["ADMIN-001", "ENG-003"],
    progress: 25,
    tasks: ["TASK-003"]
  }
];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<Task | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesAssignee = assignedToFilter === "all" || task.assignedTo === assignedToFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [searchQuery, statusFilter, priorityFilter, assignedToFilter]);

  // Get active team members
  const activeMembers = useMemo(() => {
    return mockTeamMembers.filter(member => member.status === "active");
  }, []);

  // Get inactive team members
  const inactiveMembers = useMemo(() => {
    return mockTeamMembers.filter(member => member.status === "inactive");
  }, []);

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const total = mockTasks.length;
    const pending = mockTasks.filter(t => t.status === "pending").length;
    const inProgress = mockTasks.filter(t => t.status === "in_progress").length;
    const completed = mockTasks.filter(t => t.status === "completed").length;
    const overdue = mockTasks.filter(t => t.status === "overdue").length;
    
    return { total, pending, inProgress, completed, overdue };
  }, []);

  // Auto-assign tasks based on hierarchy and availability
  const bulkAssignTasks = () => {
    const unassignedTasks = mockTasks.filter(task => !task.assignedTo);
    let assignedCount = 0;

    unassignedTasks.forEach(task => {
      // Find the best available team member based on hierarchy and capacity
      const availableMember = findBestAvailableMember(task);
      if (availableMember) {
        // In a real app, this would update the database
        assignedCount++;
        toast({
          title: "Task Assigned",
          description: `Task "${task.title}" assigned to ${availableMember.name}`,
        });
      }
    });

    if (assignedCount > 0) {
      toast({
        title: "Auto-Assignment Complete",
        description: `${assignedCount} tasks have been automatically assigned`,
      });
    } else {
      toast({
        title: "No Tasks to Assign",
        description: "All tasks are already assigned or no suitable members available",
      });
    }
  };

  // Find the best available team member for a task
  const findBestAvailableMember = (task: Task) => {
    // Start with engineers, then managers, then department head
    const rolePriority = ['engineer', 'head_manager', 'head_of_department'];
    
    for (const role of rolePriority) {
      const availableMembers = activeMembers.filter(member => 
        member.role === role && 
        member.currentTasks < member.maxCapacity
      );
      
      if (availableMembers.length > 0) {
        // Return the member with the most relevant skills or least current tasks
        return availableMembers.sort((a, b) => 
          a.currentTasks - b.currentTasks
        )[0];
      }
    }
    
    return null;
  };

  // Handle task assignment
  const handleAssignTask = () => {
    if (!selectedTaskForAssignment || !selectedAssignee) return;
    
    // In a real app, this would update the database
    toast({
      title: "Task Assigned",
      description: `Task "${selectedTaskForAssignment.title}" assigned successfully`,
    });
    
    setIsAssignModalOpen(false);
    setSelectedTaskForAssignment(null);
    setSelectedAssignee("");
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'head_of_department':
        return <Crown className="w-4 h-4" />;
      case 'head_manager':
        return <Shield className="w-4 h-4" />;
      case 'engineer':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'head_of_department':
        return 'Head of Department';
      case 'head_manager':
        return 'Head Manager';
      case 'engineer':
        return 'Engineer';
      default:
        return 'Unknown';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-500';
      case 'medium':
        return 'bg-blue-500';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get member status color
  const getMemberStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  // Get task type icon
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'email_draft':
        return <Mail className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'send':
        return <Send className="w-4 h-4" />;
      case 'monitor':
        return <Activity className="w-4 h-4" />;
      case 'analysis':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen page-bg-secondary p-6">
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Tasks Management"
          subtitle="Automate task assignment and manage business development workflow"
          actions={[
            {
              type: 'add',
              label: 'New Task',
              onClick: () => setIsTaskModalOpen(true)
            },
            {
              type: 'save',
              label: 'Auto Assign',
              onClick: bulkAssignTasks
            }
          ]}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team-management">Team Management</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="card-glass-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.total}</div>
                <p className="text-xs text-muted-foreground">All active tasks</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting assignment</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                <p className="text-xs text-muted-foreground">Finished tasks</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="card-glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-brand" />
                Search & Filter Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search tasks, projects, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {activeMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card className="card-glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Tasks</span>
                <Badge variant="secondary">{filteredTasks.length} tasks</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-white/30 border border-white/40 hover:bg-white/40 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {getTaskTypeIcon(task.type)}
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {task.projectName}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>Assigned to: {activeMembers.find(m => m.id === task.assignedTo)?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Est: {task.estimatedHours}h</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </div>
                        <div className="flex gap-1">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
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



        {/* Team Management Tab */}
        <TabsContent value="team-management" className="space-y-6">
          {/* Team Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-glass-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  Active Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{activeMembers.length}</div>
                <p className="text-sm text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-600" />
                  Inactive Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{inactiveMembers.length}</div>
                <p className="text-sm text-muted-foreground">Not available</p>
              </CardContent>
            </Card>

            <Card className="card-glass-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Total Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {activeMembers.reduce((sum, member) => sum + member.maxCapacity, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Available task slots</p>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <Card className="card-glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-brand" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="p-4 rounded-lg bg-white/30 border border-white/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded border-2 border-background ${getMemberStatusColor(member.status)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{member.name}</h3>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              <span className="text-sm text-muted-foreground">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {member.currentTasks}/{member.maxCapacity} tasks
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Last active: {member.lastActive}
                        </div>
                        
                        <div className="flex gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
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

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card className="card-glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-brand" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-white/30 border border-white/40">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge variant="outline">{project.status}</Badge>
                          <Badge variant={project.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {project.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{project.startDate} - {project.endDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{project.assignedTeam.length} team members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-muted-foreground" />
                            <span>{project.tasks.length} tasks</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-brand" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTaskTypeIcon(selectedTask.type)}
                    <span className="text-sm capitalize">{selectedTask.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`} />
                    <span className="text-sm capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedTask.status)}`} />
                    <span className="text-sm capitalize">{selectedTask.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-muted-foreground">
                    {activeMembers.find(m => m.id === selectedTask.assignedTo)?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.dueDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Project</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.projectName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Hours</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.estimatedHours}h</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex gap-2 mt-1">
                  {selectedTask.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedTaskForAssignment(selectedTask);
                    setIsAssignModalOpen(true);
                    setIsTaskModalOpen(false);
                  }}
                >
                  Reassign Task
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-brand" />
              Assign Task
            </DialogTitle>
            <DialogDescription>
              Select a team member to assign this task to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTaskForAssignment && (
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium">{selectedTaskForAssignment.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedTaskForAssignment.description}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="assignee">Select Team Member</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers
                    .filter(member => member.currentTasks < member.maxCapacity)
                    .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.currentTasks}/{member.maxCapacity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTask} disabled={!selectedAssignee}>
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
