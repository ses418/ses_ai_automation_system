import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MessageCircle, 
  User, 
  Send, 
  RefreshCw, 
  Save,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Bot,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmployeeChange {
  id: string;
  name: string;
  avatar: string;
  oldRole: string;
  newRole: string;
  oldCompany: string;
  newCompany: string;
  changeType: 'promotion' | 'job_change' | 'company_switch';
  status: 'new_change' | 'pending_request' | 'connected';
  detectedDate: string;
  linkedinUrl: string;
  isPastClient: boolean;
  canSendRequest: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'ai_draft' | 'user_edited' | 'sent' | 'received';
  timestamp: string;
  sender: 'user' | 'employee';
  isRead: boolean;
}

interface RoleChange {
  id: string;
  employeeName: string;
  avatar: string;
  oldRole: string;
  newRole: string;
  company: string;
  changeDate: string;
  linkedinUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approver?: string;
}

interface PostSuggestion {
  id: string;
  title: string;
  content: string;
  category: 'industry_insights' | 'company_update' | 'thought_leadership' | 'team_highlight' | 'client_success';
  suggestedDate: string;
  hashtags: string[];
  engagement: 'low' | 'medium' | 'high';
  targetAudience: string[];
  readyToPublish: boolean;
}

const mockEmployeeChanges: EmployeeChange[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    oldRole: 'Senior Engineer',
    newRole: 'Engineering Manager',
    oldCompany: 'TechCorp',
    newCompany: 'TechCorp',
    changeType: 'promotion',
    status: 'new_change',
    detectedDate: '2024-01-15',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    isPastClient: true,
    canSendRequest: true
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatar: '/avatars/michael.jpg',
    oldRole: 'Product Manager',
    newRole: 'Senior Product Manager',
    oldCompany: 'InnovateTech',
    newCompany: 'FutureFlow',
    changeType: 'company_switch',
    status: 'pending_request',
    detectedDate: '2024-01-14',
    linkedinUrl: 'https://linkedin.com/in/michaelrodriguez',
    isPastClient: true,
    canSendRequest: true
  },
  {
    id: '3',
    name: 'Emily Watson',
    avatar: '/avatars/emily.jpg',
    oldRole: 'Marketing Specialist',
    newRole: 'Marketing Manager',
    oldCompany: 'GrowthCo',
    newCompany: 'GrowthCo',
    changeType: 'promotion',
    status: 'connected',
    detectedDate: '2024-01-13',
    linkedinUrl: 'https://linkedin.com/in/emilywatson',
    isPastClient: false,
    canSendRequest: false
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: '/avatars/david.jpg',
    oldRole: 'Sales Director',
    newRole: 'VP of Sales',
    oldCompany: 'SalesForce',
    newCompany: 'SalesForce',
    changeType: 'promotion',
    status: 'new_change',
    detectedDate: '2024-01-12',
    linkedinUrl: 'https://linkedin.com/in/davidkim',
    isPastClient: true,
    canSendRequest: true
  }
];

const mockAIMessages = [
  "Congratulations on your promotion to Engineering Manager! 🎉 Your technical expertise and leadership skills have clearly been recognized. I'd love to connect and learn from your experience in scaling engineering teams.",
  "Exciting news about your new role as Senior Product Manager at FutureFlow! 🚀 Your product vision has always impressed me. Would love to stay connected and explore potential synergies between our companies.",
  "Amazing achievement on becoming Marketing Manager! 🎯 Your creative campaigns have been inspiring. Let's connect and share insights on modern marketing strategies."
];

const mockConversations: { [key: string]: Message[] } = {
  '3': [
    {
      id: '1',
      content: "Hi Emily! Congratulations on your promotion to Marketing Manager! 🎉",
      type: 'sent',
      timestamp: '2024-01-13 10:30',
      sender: 'user',
      isRead: true
    },
    {
      id: '2',
      content: "Thank you so much! I'm really excited about this new opportunity. How have you been?",
      type: 'received',
      timestamp: '2024-01-13 11:15',
      sender: 'employee',
      isRead: true
    }
  ]
};

const mockRoleChanges: RoleChange[] = [
  {
    id: '1',
    employeeName: 'Alex Thompson',
    avatar: '/avatars/alex.jpg',
    oldRole: 'Software Engineer',
    newRole: 'Senior Software Engineer',
    company: 'TechCorp',
    changeDate: '2024-01-20',
    linkedinUrl: 'https://linkedin.com/in/alext',
    status: 'pending',
    reason: 'Outstanding performance and technical leadership'
  },
  {
    id: '2',
    employeeName: 'Maria Garcia',
    avatar: '/avatars/maria.jpg',
    oldRole: 'Marketing Coordinator',
    newRole: 'Marketing Manager',
    company: 'GrowthCo',
    changeDate: '2024-01-18',
    linkedinUrl: 'https://linkedin.com/in/mariag',
    status: 'approved',
    reason: 'Exceptional campaign results and team management',
    approver: 'Sarah Johnson'
  },
  {
    id: '3',
    employeeName: 'James Wilson',
    avatar: '/avatars/james.jpg',
    oldRole: 'Sales Representative',
    newRole: 'Senior Sales Representative',
    company: 'SalesForce',
    changeDate: '2024-01-15',
    linkedinUrl: 'https://linkedin.com/in/jamesw',
    status: 'rejected',
    reason: 'Insufficient time in current role',
    approver: 'Mike Davis'
  }
];

const mockPostSuggestions: PostSuggestion[] = [
  {
    id: '1',
    title: 'The Future of Infrastructure Engineering',
    content: `🚀 Exciting times in infrastructure engineering! 

Our team has been working on some groundbreaking projects that are reshaping how we think about sustainable development.

Key highlights:
• AI-powered design optimization
• Green building materials integration  
• Smart city infrastructure solutions

What innovations are you most excited about in this field? Share your thoughts below! 👇

#InfrastructureEngineering #Sustainability #Innovation #SmartCities #EngineeringExcellence`,
    category: 'thought_leadership',
    suggestedDate: '2024-01-25',
    hashtags: ['InfrastructureEngineering', 'Sustainability', 'Innovation', 'SmartCities', 'EngineeringExcellence'],
    engagement: 'high',
    targetAudience: ['Engineers', 'Architects', 'Construction Managers', 'Urban Planners'],
    readyToPublish: true
  },
  {
    id: '2',
    title: 'Team Spotlight: Meet Our Engineering Leaders',
    content: `👥 Proud to introduce the brilliant minds behind our latest infrastructure projects!

Meet Sarah Chen, our new Engineering Manager, who brings 8+ years of experience in sustainable design. Her leadership has already resulted in 40% cost savings for our clients.

Also joining us is Michael Rodriguez, Senior Product Manager, whose innovative approach to project management has streamlined our delivery process.

Great teams build great projects! 🏗️

#TeamSpotlight #EngineeringLeadership #Infrastructure #Innovation #Teamwork`,
    category: 'team_highlight',
    suggestedDate: '2024-01-23',
    hashtags: ['TeamSpotlight', 'EngineeringLeadership', 'Infrastructure', 'Innovation', 'Teamwork'],
    engagement: 'medium',
    targetAudience: ['Engineering Professionals', 'HR Managers', 'Industry Partners'],
    readyToPublish: true
  },
  {
    id: '3',
    title: 'Client Success Story: Green Building Project',
    content: `🏢 Thrilled to share another successful project completion!

Our team recently delivered a LEED Platinum certified office building that achieved:
• 60% energy efficiency improvement
• 45% reduction in water consumption
• 100% renewable energy integration

The client, TechCorp Solutions, is now enjoying both environmental benefits and significant cost savings.

This is what happens when innovation meets sustainability! 🌱

#ClientSuccess #GreenBuilding #Sustainability #LEED #Infrastructure #Innovation`,
    category: 'client_success',
    suggestedDate: '2024-01-21',
    hashtags: ['ClientSuccess', 'GreenBuilding', 'Sustainability', 'LEED', 'Infrastructure', 'Innovation'],
    engagement: 'high',
    targetAudience: ['Business Owners', 'Facility Managers', 'Sustainability Officers'],
    readyToPublish: true
  },
  {
    id: '4',
    title: 'Industry Insights: 2024 Construction Trends',
    content: `📊 What's shaping the construction industry in 2024?

Based on our research and client feedback, here are the top trends:

1. **Modular Construction**: 30% faster project delivery
2. **AI & Automation**: 25% cost reduction in design phase
3. **Sustainable Materials**: 40% increase in green building demand
4. **Digital Twins**: Real-time project monitoring and optimization

Which trends are you implementing in your projects? Let's discuss! 💬

#ConstructionTrends #IndustryInsights #Innovation #Sustainability #DigitalTransformation`,
    category: 'industry_insights',
    suggestedDate: '2024-01-19',
    hashtags: ['ConstructionTrends', 'IndustryInsights', 'Innovation', 'Sustainability', 'DigitalTransformation'],
    engagement: 'medium',
    targetAudience: ['Construction Professionals', 'Project Managers', 'Industry Analysts'],
    readyToPublish: true
  }
];

export default function LinkedInClientReactivation() {
  const [activeTab, setActiveTab] = useState('connections');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeChange | null>(null);
  const [selectedRoleChange, setSelectedRoleChange] = useState<RoleChange | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostSuggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('all');
  const [roleStatusFilter, setRoleStatusFilter] = useState<string>('all');
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>('all');
  const [messageContent, setMessageContent] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedAIMessage, setSelectedAIMessage] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const filteredEmployees = mockEmployeeChanges.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.newCompany.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesType = changeTypeFilter === 'all' || employee.changeType === changeTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredRoleChanges = mockRoleChanges.filter(roleChange => {
    const matchesSearch = roleChange.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         roleChange.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = roleStatusFilter === 'all' || roleChange.status === roleStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredPostSuggestions = mockPostSuggestions.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = postCategoryFilter === 'all' || post.category === postCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleEmployeeSelect = (employee: EmployeeChange) => {
    setSelectedEmployee(employee);
    
    if (employee.status === 'connected' && mockConversations[employee.id]) {
      setMessages(mockConversations[employee.id]);
      setMessageContent('');
    } else {
      setMessages([]);
      // Auto-generate message based on change type
      let message = '';
      switch (employee.changeType) {
        case 'promotion':
          message = `Congratulations on your promotion to ${employee.newRole}! 🎉 Your hard work and dedication have clearly paid off. I'd love to connect and learn from your experience.`;
          break;
        case 'job_change':
          message = `Exciting news about your new role as ${employee.newRole} at ${employee.newCompany}! 🚀 Your expertise will be a great asset to their team. Let's stay connected!`;
          break;
        case 'company_switch':
          message = `Congratulations on your new position as ${employee.newRole} at ${employee.newCompany}! 🎯 This is a fantastic opportunity and I'm excited to see where this takes your career. Let's connect!`;
          break;
      }
      setMessageContent(message);
    }
  };

  const handleSendRequest = () => {
    if (selectedEmployee && messageContent.trim()) {
      // Update status to pending
      const updatedEmployee = { ...selectedEmployee, status: 'pending_request' as const };
      setSelectedEmployee(updatedEmployee);
      
      // Add message to conversation
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        type: 'sent',
        timestamp: new Date().toLocaleString(),
        sender: 'user',
        isRead: false
      };
      setMessages(prev => [...prev, newMessage]);
      
      // In real app, this would send the LinkedIn connection request
      console.log('Sending connection request:', { employee: selectedEmployee, message: messageContent });
    }
  };

  const handleSendMessage = () => {
    if (selectedEmployee && messageContent.trim() && selectedEmployee.status === 'connected') {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        type: 'sent',
        timestamp: new Date().toLocaleString(),
        sender: 'user',
        isRead: false
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageContent('');
      
      // Simulate reply after 2 seconds
      setTimeout(() => {
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thanks for reaching out! I'll get back to you soon.",
          type: 'received',
          timestamp: new Date().toLocaleString(),
          sender: 'employee',
          isRead: true
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  const handleRegenerateMessage = () => {
    if (selectedEmployee) {
      const randomIndex = Math.floor(Math.random() * mockAIMessages.length);
      setMessageContent(mockAIMessages[randomIndex]);
    }
  };

  const handleRoleChangeSelect = (roleChange: RoleChange) => {
    setSelectedRoleChange(roleChange);
    setSelectedEmployee(null);
    setSelectedPost(null);
  };

  const handlePostSelect = (post: PostSuggestion) => {
    setSelectedPost(post);
    setSelectedEmployee(null);
    setSelectedRoleChange(null);
  };

  const handleApproveRoleChange = (roleChange: RoleChange) => {
    // In real app, this would update the database and notify HR
    toast({
      title: "Role Change Approved",
      description: `${roleChange.employeeName}'s role change has been approved.`,
    });
  };

  const handleRejectRoleChange = (roleChange: RoleChange) => {
    // In real app, this would update the database and notify HR
    toast({
      title: "Role Change Rejected",
      description: `${roleChange.employeeName}'s role change has been rejected.`,
    });
  };

  const handlePublishPost = (post: PostSuggestion) => {
    // In real app, this would publish to LinkedIn
    toast({
      title: "Post Published",
      description: `"${post.title}" has been published to LinkedIn.`,
    });
  };

  const handleCopyPostContent = (post: PostSuggestion) => {
    navigator.clipboard.writeText(post.content);
    toast({
      title: "Content Copied",
      description: "Post content has been copied to clipboard.",
    });
  };

  const handleConnectionAccepted = () => {
    if (selectedEmployee) {
      const updatedEmployee = { ...selectedEmployee, status: 'connected' as const };
      setSelectedEmployee(updatedEmployee);
      
      // Add system message
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: "Connection request accepted! You can now send messages.",
        type: 'received',
        timestamp: new Date().toLocaleString(),
        sender: 'employee',
        isRead: true
      };
      setMessages([systemMessage]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_change': return 'bg-blue-500';
      case 'pending_request': return 'bg-yellow-500';
      case 'connected': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new_change': return 'New Change';
      case 'pending_request': return 'Pending Request';
      case 'connected': return 'Connected';
      default: return 'Unknown';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <Bot className="w-4 h-4 text-green-600" />;
      case 'job_change': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'company_switch': return <Trash2 className="w-4 h-4 text-purple-600" />;
      default: return <Bot className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleChangeStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPostCategoryIcon = (category: string) => {
    switch (category) {
      case 'industry_insights': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'company_update': return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'thought_leadership': return <Bot className="w-4 h-4 text-purple-600" />;
      case 'team_highlight': return <User className="w-4 h-4 text-orange-600" />;
      case 'client_success': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPostEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRequestEligibilityBadge = (employee: EmployeeChange) => {
    if (employee.status === 'connected') return null;
    
    if (employee.canSendRequest) {
      return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Can Send Request</Badge>;
    } else {
      return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Cannot Send Request</Badge>;
    }
  };

  const getRequestEligibilityReason = (employee: EmployeeChange) => {
    if (employee.status === 'connected') return null;
    
    if (employee.canSendRequest) {
      return employee.isPastClient 
        ? "Past client - eligible to send connection request"
        : "Same company - eligible to send connection request";
    } else {
      return "Not eligible - different company and not a past client";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="LinkedIn Automation"
          subtitle="Connect and congratulate clients on their professional updates"
          actions={[
            {
              type: 'add',
              label: 'New Connection',
              onClick: () => {
                toast({
                  title: "New Connection",
                  description: "Create a new LinkedIn connection request",
                });
              }
            }
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Tabs */}
        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="connections" className="text-sm px-6">Connection Requests</TabsTrigger>
                <TabsTrigger value="role-changes" className="text-sm px-6">Role Changes</TabsTrigger>
                <TabsTrigger value="post-suggestions" className="text-sm px-6">Post Suggestions</TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="connections" className="space-y-0">
                <div className="flex gap-6 h-[calc(100vh-300px)]">
                  {/* Left Sidebar - Client Change Feed */}
                  <div className="w-[30%] space-y-4">
                    {/* Search and Filters */}
                    <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search employees or companies..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 bg-white/50 border-white/30 focus:bg-white"
                            />
                          </div>
                          
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">All Status</option>
                            <option value="new_change">New Changes</option>
                            <option value="pending_request">Pending</option>
                            <option value="connected">Connected</option>
                          </select>
                          
                          <select
                            value={changeTypeFilter}
                            onChange={(e) => setChangeTypeFilter(e.target.value)}
                            className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">All Types</option>
                            <option value="promotion">Promotions</option>
                            <option value="job_change">Job Changes</option>
                            <option value="company_switch">Company Switch</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Employee Changes List */}
                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                      {filteredEmployees.map((employee) => (
                        <Card
                          key={employee.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                            selectedEmployee?.id === employee.id 
                              ? 'ring-2 ring-blue-500 bg-white/90' 
                              : 'bg-white/70 hover:bg-white/80'
                          } backdrop-blur-md border-white/20`}
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-12 h-12 border-2 border-white/50">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                                  <Badge className={`${getStatusColor(employee.status)} text-white text-xs`}>
                                    {getStatusText(employee.status)}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2 mb-2">
                                  {getChangeTypeIcon(employee.changeType)}
                                  <span className="text-sm text-gray-600">
                                    {employee.oldRole} → {employee.newRole}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-500 mb-2">
                                  {employee.oldCompany !== employee.newCompany 
                                    ? `${employee.oldCompany} → ${employee.newCompany}`
                                    : employee.newCompany
                                  }
                                </div>
                                
                                {getRequestEligibilityBadge(employee)}
                                
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                  <span>Detected {employee.detectedDate}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(employee.linkedinUrl, '_blank');
                                    }}
                                  >
                                    {/* <Linkedin className="w-3 h-3" /> */}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

        {/* Right Main Panel - Chat / Message Panel */}
        <div className="flex-1">
          {selectedEmployee ? (
            <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex flex-col">
              {/* Employee Profile Card */}
              <CardHeader className="border-b border-white/20">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-white/50">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">{selectedEmployee.name}</CardTitle>
                    <p className="text-gray-600">{selectedEmployee.newRole} at {selectedEmployee.newCompany}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {selectedEmployee.changeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge className={getStatusColor(selectedEmployee.status)}>
                        {getStatusText(selectedEmployee.status)}
                      </Badge>
                      {getRequestEligibilityBadge(selectedEmployee)}
                    </div>
                    {getRequestEligibilityReason(selectedEmployee) && (
                      <p className="text-xs text-gray-500 mt-2">{getRequestEligibilityReason(selectedEmployee)}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedEmployee.linkedinUrl, '_blank')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {/* <Linkedin className="w-4 h-4 mr-2" /> */}
                    View Profile
                  </Button>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    AI detected this change on {selectedEmployee.detectedDate}
                  </Badge>
                </div>

                {/* Connection Status Actions */}
                {selectedEmployee.status === 'pending_request' && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleConnectionAccepted}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Connection
                    </Button>
                  </div>
                )}

                {/* Warning for ineligible employees */}
                {!selectedEmployee.canSendRequest && selectedEmployee.status !== 'connected' && (
                  <div className="flex justify-center">
                    <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                      ⚠️ Cannot send connection request to this employee
                    </Badge>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`p-4 rounded-2xl shadow-lg ${
                        message.sender === 'user'
                          ? 'bg-[#1473B9] text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className={`text-xs ${
                              message.sender === 'user' 
                                ? 'bg-white/20 text-white' 
                                : 'bg-gray-400 text-white'
                            }`}>
                              {message.sender === 'user' ? 'You' : selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {message.sender === 'user' ? 'You' : selectedEmployee.name}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {message.timestamp}
                          </span>
                          {message.sender === 'user' && (
                            <span className={`text-xs ${message.isRead ? 'text-blue-300' : 'text-white/50'}`}>
                              {message.isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Draft Message for new changes */}
                {selectedEmployee.status === 'new_change' && selectedEmployee.canSendRequest && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="bg-gray-200 text-gray-800 p-4 rounded-2xl rounded-bl-md shadow-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gray-400 text-white text-xs">
                              {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700">{selectedEmployee.name}</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {messageContent || "AI is generating a personalized message..."}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">AI-generated congratulation message</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Suggestions Toggle */}
                {selectedEmployee.status === 'new_change' && selectedEmployee.canSendRequest && (
                  <>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAISuggestions(!showAISuggestions)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        {showAISuggestions ? 'Hide' : 'Show'} AI Suggestions
                      </Button>
                    </div>

                    {showAISuggestions && (
                      <div className="space-y-3">
                        {mockAIMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedAIMessage === index 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            } p-3 rounded-lg border`}
                            onClick={() => {
                              setMessageContent(message);
                              setSelectedAIMessage(index);
                            }}
                          >
                            <p className="text-sm text-gray-700">{message}</p>
                            {selectedAIMessage === index && (
                              <div className="flex justify-end mt-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Message Composer */}
              <div className="border-t border-white/20 p-4 bg-white/50">
                <div className="space-y-3">
                  <Textarea
                    placeholder={
                      selectedEmployee.status === 'connected' 
                        ? "Type your message here..."
                        : "Edit your message here..."
                    }
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[100px] resize-none bg-white/70 border-white/30 focus:bg-white"
                    disabled={!selectedEmployee.canSendRequest && selectedEmployee.status !== 'connected'}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {selectedEmployee.status === 'new_change' && selectedEmployee.canSendRequest && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerateMessage}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                      {selectedEmployee.status === 'new_change' && selectedEmployee.canSendRequest && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      onClick={selectedEmployee.status === 'connected' ? handleSendMessage : handleSendRequest}
                      disabled={
                        !messageContent.trim() || 
                        (selectedEmployee.status === 'connected' ? false : !selectedEmployee.canSendRequest)
                      }
                      className="bg-[#1473B9] hover:bg-[#0f5a8f] text-white shadow-lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {selectedEmployee.status === 'connected' ? 'Send Message' : 'Send Request'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* Empty State */
            <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Employee</h3>
                  <p className="text-gray-600 max-w-md">
                    Choose an employee from the left panel to start crafting personalized connection messages and maintain your professional relationships.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
        </TabsContent>

        {/* Role Changes Tab */}
        <TabsContent value="role-changes" className="space-y-0">
          <div className="flex gap-6 h-[calc(100vh-300px)]">
            {/* Left Sidebar - Role Changes List */}
            <div className="w-[30%] space-y-4">
              {/* Search and Filters */}
              <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search employees or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 border-white/30 focus:bg-white"
                      />
                    </div>
                    
                    <select
                      value={roleStatusFilter}
                      onChange={(e) => setRoleStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Role Changes List */}
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredRoleChanges.map((roleChange) => (
                  <Card
                    key={roleChange.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedRoleChange?.id === roleChange.id 
                        ? 'ring-2 ring-blue-500 bg-white/90' 
                        : 'bg-white/70 hover:bg-white/80'
                    } backdrop-blur-md border-white/20`}
                    onClick={() => handleRoleChangeSelect(roleChange)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-white/50">
                          <AvatarImage src={roleChange.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                            {roleChange.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{roleChange.employeeName}</h3>
                            <Badge className={`${getRoleChangeStatusColor(roleChange.status)} text-white text-xs`}>
                              {roleChange.status.charAt(0).toUpperCase() + roleChange.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">
                              {roleChange.oldRole} → {roleChange.newRole}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-2">
                            {roleChange.company}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                            <span>Change Date: {roleChange.changeDate}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(roleChange.linkedinUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel - Role Change Details */}
            <div className="flex-1">
              {selectedRoleChange ? (
                <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex flex-col">
                  {/* Role Change Details */}
                  <CardHeader className="border-b border-white/20">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16 border-2 border-white/50">
                        <AvatarImage src={selectedRoleChange.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold">
                          {selectedRoleChange.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900">{selectedRoleChange.employeeName}</CardTitle>
                        <p className="text-gray-600">{selectedRoleChange.oldRole} → {selectedRoleChange.newRole}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {selectedRoleChange.company}
                          </Badge>
                          <Badge className={getRoleChangeStatusColor(selectedRoleChange.status)}>
                            {selectedRoleChange.status.charAt(0).toUpperCase() + selectedRoleChange.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedRoleChange.linkedinUrl, '_blank')}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Role Change Content */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                        Role change requested on {selectedRoleChange.changeDate}
                      </Badge>
                    </div>

                    {/* Reason */}
                    {selectedRoleChange.reason && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Reason for Change</h4>
                          <p className="text-blue-800">{selectedRoleChange.reason}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Approval Actions */}
                    {selectedRoleChange.status === 'pending' && (
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={() => handleApproveRoleChange(selectedRoleChange)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectRoleChange(selectedRoleChange)}
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Status Info */}
                    {selectedRoleChange.status !== 'pending' && (
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
                          <p className="text-gray-700">
                            This role change was {selectedRoleChange.status} 
                            {selectedRoleChange.approver && ` by ${selectedRoleChange.approver}`}.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </Card>
              ) : (
                /* Empty State */
                <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Role Change</h3>
                      <p className="text-gray-600 max-w-md">
                        Choose a role change request from the left panel to review and approve or reject.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Post Suggestions Tab */}
        <TabsContent value="post-suggestions" className="space-y-0">
          <div className="flex gap-6 h-[calc(100vh-300px)]">
            {/* Left Sidebar - Post Suggestions List */}
            <div className="w-[30%] space-y-4">
              {/* Search and Filters */}
              <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 border-white/30 focus:bg-white"
                      />
                    </div>
                    
                    <select
                      value={postCategoryFilter}
                      onChange={(e) => setPostCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white/50 border border-white/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="industry_insights">Industry Insights</option>
                      <option value="company_update">Company Updates</option>
                      <option value="thought_leadership">Thought Leadership</option>
                      <option value="team_highlight">Team Highlights</option>
                      <option value="client_success">Client Success</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Post Suggestions List */}
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredPostSuggestions.map((post) => (
                  <Card
                    key={post.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedPost?.id === post.id 
                        ? 'ring-2 ring-blue-500 bg-white/90' 
                        : 'bg-white/70 hover:bg-white/80'
                    } backdrop-blur-md border-white/20`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getPostCategoryIcon(post.category)}
                            <Badge className={`${getPostEngagementColor(post.engagement)} text-white text-xs`}>
                              {post.engagement}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">{post.suggestedDate}</span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{post.title}</h3>
                        
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Target: {post.targetAudience.slice(0, 2).join(', ')}</span>
                          {post.readyToPublish && (
                            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                              Ready to Publish
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel - Post Details */}
            <div className="flex-1">
              {selectedPost ? (
                <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex flex-col">
                  {/* Post Header */}
                  <CardHeader className="border-b border-white/20">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPostCategoryIcon(selectedPost.category)}
                          <Badge className={`${getPostEngagementColor(selectedPost.engagement)} text-white`}>
                            {selectedPost.engagement} engagement
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">Suggested: {selectedPost.suggestedDate}</span>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-900">{selectedPost.title}</h2>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.hashtags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Target Audience:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedPost.targetAudience.map((audience, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Post Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {selectedPost.content}
                      </div>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="border-t border-white/20 p-4 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyPostContent(selectedPost)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Content
                        </Button>
                      </div>
                      
                      <Button
                        onClick={() => handlePublishPost(selectedPost)}
                        disabled={!selectedPost.readyToPublish}
                        className="bg-[#1473B9] hover:bg-[#0f5a8f] text-white shadow-lg"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Publish to LinkedIn
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Empty State */
                <Card className="h-full bg-white/70 backdrop-blur-md border-white/20 shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Post</h3>
                      <p className="text-gray-600 max-w-md">
                        Choose a post suggestion from the left panel to review and publish to LinkedIn.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
    </div>
  </div>
);
}
