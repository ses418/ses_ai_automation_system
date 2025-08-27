import React, { useState, useMemo } from "react";
import { Search, Bot, User, Send, Edit3, Check, X, Mail, FileText, MessageCircle, RotateCcw, Plus, Sparkles, Filter, Phone, Building2, Calendar, Clock, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";

interface Conversation {
  id: string;
  mailId: string;
  type: "article" | "follow-up" | "newsletter" | "inquiry";
  status: "primary" | "secondary" | "tertiary" | "conversation" | "replied" | "open" | "closed";
  clientName?: string;
  clientEmail?: string;
  subject: string;
  lastUpdated: string;
  hasReply?: boolean;
  draftCount?: number;
  outlookDraftId?: string;
  createdBy?: string;
  recipientName?: string;
  draftDate?: string;
}

interface PastClient {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  lastInteraction: string;
  avatar?: string;
  status: "active" | "inactive" | "potential";
  totalValue: string;
}

interface Message {
  id: string;
  type: "ai_draft" | "sent" | "received" | "user_draft";
  content: string;
  subject?: string;
  timestamp: string;
  status?: "draft" | "sent" | "pending";
}

const mockConversations: Conversation[] = [
  // Article Drafts
  {
    id: "1",
    mailId: "ART-2024-001",
    type: "article",
    status: "primary",
    subject: "Infrastructure Engineering Solutions Article",
    lastUpdated: "2024-01-20 10:30 AM",
    draftCount: 3,
    outlookDraftId: "OUT-001",
    createdBy: "Marketing",
    recipientName: "Engineering Weekly",
    draftDate: "2024-01-20"
  },
  {
    id: "2", 
    mailId: "ART-2024-002",
    type: "article",
    status: "secondary",
    subject: "R&D Partnership Discussion Article",
    lastUpdated: "2024-01-19 2:45 PM",
    draftCount: 2,
    outlookDraftId: "OUT-002",
    createdBy: "Marketing",
    recipientName: "Tech Partnership Magazine",
    draftDate: "2024-01-19"
  },
  {
    id: "3",
    mailId: "MAIL-2024-003",
    type: "article",
    status: "tertiary",
    subject: "Innovation in Civil Engineering",
    lastUpdated: "2024-01-18 4:15 PM",
    draftCount: 1,
    outlookDraftId: "OUT-003",
    createdBy: "Marketing",
    recipientName: "Civil Engineering Today",
    draftDate: "2024-01-18"
  },
  {
    id: "4",
    mailId: "MAIL-2024-004",
    type: "article",
    status: "conversation",
    subject: "Sustainable Infrastructure Development",
    lastUpdated: "2024-01-17 11:20 AM",
    draftCount: 2,
    outlookDraftId: "OUT-004",
    createdBy: "Marketing",
    recipientName: "Green Building Journal",
    draftDate: "2024-01-17"
  },
  {
    id: "5",
    mailId: "MAIL-2024-005",
    type: "article",
    status: "replied",
    subject: "AI in Construction Management",
    lastUpdated: "2024-01-16 9:30 AM",
    draftCount: 1,
    outlookDraftId: "OUT-005",
    createdBy: "Marketing",
    recipientName: "Construction Tech Review",
    draftDate: "2024-01-16"
  },
  
  // Follow-up Drafts
  {
    id: "6",
    mailId: "FLW-2024-001",
    type: "follow-up",
    status: "primary",
    subject: "Follow-up on Infrastructure Proposal",
    lastUpdated: "2024-01-15 3:30 PM",
    draftCount: 2,
    outlookDraftId: "OUT-006",
    createdBy: "Sales",
    recipientName: "City Planning Department",
    draftDate: "2024-01-15"
  },
  {
    id: "7",
    mailId: "FLW-2024-002",
    type: "follow-up",
    status: "secondary",
    subject: "Follow-up on Engineering Consultation",
    lastUpdated: "2024-01-14 1:45 PM",
    draftCount: 1,
    outlookDraftId: "OUT-007",
    createdBy: "Sales",
    recipientName: "Industrial Corp",
    draftDate: "2024-01-14"
  },
  
  // Past Client Reactivation
  {
    id: "8",
    mailId: "PCR-2024-001",
    type: "newsletter",
    status: "replied",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.j@techcorp.com",
    subject: "Monthly Engineering Insights Newsletter",
    lastUpdated: "2024-01-13 4:15 PM",
    hasReply: true,
    draftCount: 2
  },
  {
    id: "9",
    mailId: "PCR-2024-002",
    type: "newsletter", 
    status: "primary",
    clientName: "Michael Chen",
    clientEmail: "m.chen@innovate.io",
    subject: "Q1 Innovation Newsletter",
    lastUpdated: "2024-01-12 11:20 AM",
    draftCount: 2
  },
  

];

const mockPastClients: PastClient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@techcorp.com",
    company: "TechCorp Solutions",
    phone: "+1 (555) 123-4567",
    lastInteraction: "2024-01-15",
    status: "inactive",
    totalValue: "$45,000"
  },
  {
    id: "2", 
    name: "Michael Chen",
    email: "m.chen@innovate.io",
    company: "Innovate Industries",
    phone: "+1 (555) 987-6543",
    lastInteraction: "2023-12-20",
    status: "potential",
    totalValue: "$78,000"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily@startup.com",
    company: "Growth Startup",
    phone: "+1 (555) 456-7890",
    lastInteraction: "2024-01-08",
    status: "active",
    totalValue: "$32,000"
  },
  {
    id: "4",
    name: "David Park",
    email: "d.park@enterprise.com",
    company: "Enterprise Corp",
    phone: "+1 (555) 234-5678",
    lastInteraction: "2023-11-30",
    status: "inactive",
    totalValue: "$125,000"
  }
];

const mockAIDrafts = [
  {
    subject: "Exciting Updates from Shiva Engineering Services",
    content: "Hi {{clientName}}, hope you're doing well! We've been working on some exciting new projects that I thought might interest you. Our recent infrastructure developments have helped clients achieve 40% cost savings. Would love to catch up and share how these innovations could benefit {{company}}."
  },
  {
    subject: "New Partnership Opportunities & Industry Insights", 
    content: "Hello {{clientName}}, I've been thinking about our previous discussions regarding {{company}}'s growth plans. We've recently expanded our capabilities and I believe there are some fantastic synergies we could explore together. Let's schedule a coffee to discuss!"
  },
  {
    subject: "Quarter Update: Innovation in Engineering Solutions",
    content: "Dear {{clientName}}, As we wrap up this quarter, I wanted to share some breakthrough solutions we've developed that align perfectly with {{company}}'s objectives. Our latest case study shows 60% efficiency improvements for similar businesses."
  }
];

export default function ConversationHub() {
  const [activeTab, setActiveTab] = useState("reactivation");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedPastClient, setSelectedPastClient] = useState<PastClient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [showAIDrafts, setShowAIDrafts] = useState(false);
  const { toast } = useToast();

  const getConversationsForTab = () => {
    switch (activeTab) {
      case "article-draft":
        return mockConversations.filter(c => c.type === "article" || c.type === "follow-up");
      case "reactivation":
        return mockConversations.filter(c => c.type === "newsletter");
      default:
        return [];
    }
  };

  const getPastClientsForTab = () => {
    if (activeTab === "reactivation") {
      return mockPastClients;
    }
    return [];
  };

  const getFilterOptions = () => {
    switch (activeTab) {
      case "article-draft":
        return ["all", "primary", "secondary", "tertiary", "conversation", "replied"];
      case "reactivation":
        return ["all", "active", "inactive", "potential"];
      default:
        return ["all"];
    }
  };

  const getFilterLabel = (value: string) => {
    const labels: Record<string, string> = {
      all: "All",
      primary: "Primary Draft",
      secondary: "Secondary Draft", 
      tertiary: "Tertiary Draft",
      conversation: "Conversation",
      replied: "Replied",
      active: "Active Clients",
      inactive: "Inactive Clients",
      potential: "Potential Clients"
    };
    return labels[value] || value;
  };

  const filteredConversations = getConversationsForTab().filter(conv => {
    const matchesSearch = conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.mailId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.outlookDraftId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === "all" || conv.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredPastClients = getPastClientsForTab().filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
      case "follow-up":
        return <FileText className="h-4 w-4" />;
      case "newsletter":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "article": return "📄 Cold Mail";
      case "follow-up": return "📄 Follow-up Draft";
      case "newsletter": return "🔄 Newsletter";
      default: return "💬 Conversation";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "primary": return "bg-blue-500";
      case "secondary": return "bg-yellow-500";
      case "tertiary": return "bg-orange-500";
      case "conversation": return "bg-purple-500";
      case "replied": return "bg-green-500";
      case "active": return "bg-green-500";
      case "inactive": return "bg-red-500";
      case "potential": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusDivColor = (status: string) => {
    switch (status) {
      case "primary": return "bg-blue-500";
      case "secondary": return "bg-yellow-500";
      case "tertiary": return "bg-orange-500";
      case "conversation": return "bg-purple-500";
      case "replied": return "bg-green-500";
      case "active": return "bg-green-500";
      case "inactive": return "bg-red-500";
      case "potential": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "primary": return "default";
      case "secondary": return "secondary";
      case "tertiary": return "outline";
      case "conversation": return "secondary";
      case "replied": return "default";
      default: return "outline";
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedPastClient(null);
    
    // Mock messages based on conversation type
    const mockMessages: Message[] = [
      {
        id: "1",
        type: "ai_draft",
        content: `AI-generated ${conversation.type} content for ${conversation.subject}...`,
        subject: conversation.subject,
        timestamp: conversation.lastUpdated,
        status: "draft"
      }
    ];
    
    if (conversation.hasReply) {
      mockMessages.push({
        id: "2",
        type: "received",
        content: "Thank you for the information. I have a few questions about the pricing structure...",
        timestamp: "2024-01-18 5:30 PM"
      });
    }
    
    setMessages(mockMessages);
    setCurrentDraft(null);
    setIsComposing(false);
  };

  const handlePastClientSelect = (client: PastClient) => {
    setSelectedPastClient(client);
    setSelectedConversation(null);
    
    // Mock email history for the selected client
    const mockHistory: Message[] = [
      {
        id: "1",
        type: "sent",
        content: `Hi ${client.name.split(' ')[0]}! Hope you're doing well. Wanted to reach out about our new infrastructure solutions...`,
        subject: "Infrastructure Solutions Update",
        timestamp: "2024-01-15 10:30 AM",
        status: "sent"
      },
      {
        id: "2",
        type: "received",
        content: "Hi! Thanks for reaching out. I'd love to hear more about the new solutions. Can we schedule a call next week?",
        timestamp: "2024-01-15 2:45 PM"
      }
    ];
    
    setMessages(mockHistory);
    setCurrentDraft(null);
    setIsComposing(false);
  };

  const handleGenerateAIDraft = () => {
    setShowAIDrafts(true);
  };

  const handleSelectAIDraft = (draft: typeof mockAIDrafts[0]) => {
    const selectedEntity = selectedConversation || selectedPastClient;
    if (!selectedEntity) return;
    
    let personalizedContent = draft.content;
    if (selectedConversation?.clientName) {
      personalizedContent = draft.content
        .replace(/\{\{clientName\}\}/g, selectedConversation.clientName.split(' ')[0])
        .replace(/\{\{company\}\}/g, "their company");
    } else if (selectedPastClient) {
      personalizedContent = draft.content
        .replace(/\{\{clientName\}\}/g, selectedPastClient.name.split(' ')[0])
        .replace(/\{\{company\}\}/g, selectedPastClient.company);
    }
    
    setDraftSubject(draft.subject);
    setDraftContent(personalizedContent);
    setIsComposing(true);
    setShowAIDrafts(false);
    
    const newDraft: Message = {
      id: Date.now().toString(),
      type: "user_draft",
      content: personalizedContent,
      subject: draft.subject,
      timestamp: new Date().toLocaleString(),
      status: "draft"
    };
    setCurrentDraft(newDraft);
  };

  const handleSendToOutlook = () => {
    const selectedEntity = selectedConversation || selectedPastClient;
    if (!selectedEntity || !currentDraft) return;
    
    const sentMessage: Message = {
      ...currentDraft,
      type: "sent",
      status: "sent",
      content: draftContent,
      subject: draftSubject
    };
    
    setMessages([...messages, sentMessage]);
    setCurrentDraft(null);
    setIsComposing(false);
    setDraftSubject("");
    setDraftContent("");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderConversationList = () => {
    if (activeTab === "reactivation") {
      return (
        <div className="overflow-y-auto h-full">
          {filteredPastClients.map((client) => (
            <div
              key={client.id}
              onClick={() => handlePastClientSelect(client)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedPastClient?.id === client.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded border-2 border-background ${getStatusDivColor(client.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate">{client.name}</h3>
                    <span className="text-xs text-muted-foreground">{formatTime(client.lastInteraction)}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate mb-1">{client.company}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {client.totalValue}
                    </Badge>
                    <Badge 
                      variant={client.status === "active" ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {client.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "article-draft") {
      return (
        <div className="overflow-y-auto h-full">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id ? "bg-muted" : ""
              }`}
            >
              <div className="space-y-3">
                                 {/* Mail ID - Highlighted */}
                 <div className="flex items-center justify-between">
                   <div className="bg-primary/15 px-3 py-1.5 rounded-lg">
                     <span className="text-sm font-mono font-bold text-primary">{conversation.mailId}</span>
                   </div>
                 </div>
                
                {/* Outlook Draft ID */}
                {conversation.outlookDraftId && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">
                      Outlook: {conversation.outlookDraftId}
                    </span>
                  </div>
                )}
                
                {/* Subject and Type */}
                <div className="flex items-start gap-2">
                  {getTypeIcon(conversation.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">
                      {getTypeLabel(conversation.type)}
                    </div>
                    <h3 className="font-medium text-sm truncate">{conversation.subject}</h3>
                  </div>
                </div>
                
                {/* Recipient Name */}
                {conversation.recipientName && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">{conversation.recipientName}</span>
                  </div>
                )}
                
                {/* Status, Created By, and Meta */}
                <div className="space-y-2">
                                     <div className="flex items-center gap-2">
                     <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusDivColor(conversation.status)}`}>
                       {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                     </div>
                    {conversation.createdBy && (
                      <Badge variant="outline" className="text-xs">
                        {conversation.createdBy}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {conversation.draftCount && (
                        <Badge variant="outline" className="text-xs">
                          {conversation.draftCount} drafts
                        </Badge>
                      )}
                      {conversation.draftDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{conversation.draftDate}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{conversation.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default conversation view for other tabs
    return (
      <div className="overflow-y-auto h-full">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => handleConversationSelect(conversation)}
            className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedConversation?.id === conversation.id ? "bg-muted" : ""
            }`}
          >
            <div className="space-y-3">
                             {/* Mail ID - Highlighted */}
               <div className="flex items-center justify-between">
                 <div className="bg-primary/10 px-2 py-1 rounded text-xs font-mono font-semibold text-primary">
                   {conversation.mailId}
                 </div>
               </div>
              
              {/* Contact Name (if applicable) */}
              {conversation.clientName && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {conversation.clientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm text-foreground">{conversation.clientName}</span>
                </div>
              )}
              
              {/* Type and Subject */}
              <div className="flex items-start gap-2">
                {getTypeIcon(conversation.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {getTypeLabel(conversation.type)}
                  </div>
                  <h3 className="font-medium text-sm truncate">{conversation.subject}</h3>
                </div>
              </div>
              
              {/* Status and Meta */}
              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                   <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusDivColor(conversation.status)}`}>
                     {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                   </div>
                  {conversation.draftCount && (
                    <Badge variant="outline" className="text-xs">
                      {conversation.draftCount} drafts
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{conversation.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConversationHeader = () => {
         if (selectedPastClient) {
       return (
         <div className="p-4 border-b border-border bg-card">
           <div className="flex items-center justify-between">
             <div className="space-y-2">
               {/* Mail ID - Highlighted at Top */}
               <div className="bg-primary/15 px-3 py-1.5 rounded-lg inline-block">
                 <span className="text-sm font-mono font-bold text-primary">CLIENT-{selectedPastClient.id}</span>
               </div>
               
               {/* Contact Name & Status */}
               <div className="flex items-center gap-3">
                 <Avatar className="h-8 w-8">
                   <AvatarImage src={selectedPastClient.avatar} />
                   <AvatarFallback className="bg-primary/10 text-primary">
                     {selectedPastClient.name.split(' ').map(n => n[0]).join('')}
                   </AvatarFallback>
                 </Avatar>
                 
                 <div>
                   <h2 className="font-semibold text-lg">{selectedPastClient.name}</h2>
                   <p className="text-sm text-muted-foreground">{selectedPastClient.company}</p>
                 </div>
                 
                 <Badge variant="secondary" className="ml-auto font-semibold">
                   {selectedPastClient.status.charAt(0).toUpperCase() + selectedPastClient.status.slice(1)}
                 </Badge>
               </div>
               
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-xs">
                   Newsletter Mails
                 </Badge>
                 <span className="text-sm text-muted-foreground">Last interaction: {formatTime(selectedPastClient.lastInteraction)}</span>
                 {selectedPastClient.totalValue && (
                   <Badge variant="outline" className="text-xs">
                     Value: {selectedPastClient.totalValue}
                   </Badge>
                 )}
               </div>
             </div>
             
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={handleGenerateAIDraft}
                 className="flex items-center gap-2"
               >
                 <Sparkles className="h-4 w-4" />
                 AI Drafts
               </Button>
               
               <Button variant="outline" size="sm">
                 <Mail className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </div>
       );
     }

    if (selectedConversation) {
      return (
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {/* Mail ID - Highlighted at Top */}
              <div className="bg-primary/15 px-3 py-1.5 rounded-lg inline-block">
                <span className="text-sm font-mono font-bold text-primary">{selectedConversation.mailId}</span>
              </div>
              
              {/* Outlook Draft ID */}
              {selectedConversation.outlookDraftId && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-muted-foreground">
                    Outlook Draft: {selectedConversation.outlookDraftId}
                  </span>
                </div>
              )}
              
              {/* Contact Name & Status */}
              <div className="flex items-center gap-3">
                {(selectedConversation.clientName || selectedConversation.recipientName) && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(selectedConversation.clientName || selectedConversation.recipientName)?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-lg">
                        {selectedConversation.clientName || selectedConversation.recipientName}
                      </h2>
                      {selectedConversation.clientEmail && (
                        <p className="text-sm text-muted-foreground">{selectedConversation.clientEmail}</p>
                      )}
                    </div>
                  </>
                )}
                
                <Badge variant="secondary" className="ml-auto font-semibold">
                  {selectedConversation.status.charAt(0).toUpperCase() + selectedConversation.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(selectedConversation.type)}
                </Badge>
                <h3 className="font-medium text-foreground">{selectedConversation.subject}</h3>
                {selectedConversation.createdBy && (
                  <Badge variant="outline" className="text-xs">
                    Created by: {selectedConversation.createdBy}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateAIDraft}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Drafts
              </Button>
              
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderComposeArea = () => {
    const selectedEntity = selectedConversation || selectedPastClient;
    if (!selectedEntity) return null;

    if (isComposing) {
      return (
        <div className="flex-shrink-0 border-t border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Label htmlFor="subject" className="text-sm font-medium">Subject:</Label>
            <Input
              id="subject"
              value={draftSubject}
              onChange={(e) => setDraftSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1"
            />
          </div>
          
          <Textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Type your message..."
            className="min-h-24 resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                To: {selectedPastClient?.email || selectedConversation?.clientEmail || "recipients"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsComposing(false);
                  setCurrentDraft(null);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button 
                size="sm"
                onClick={handleSendToOutlook}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Send to Outlook
              </Button>
            </div>
          </div>
        </div>
      );
    }

         return (
               <div className="flex-shrink-0 border-t border-border bg-card p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Generate AI Draft Button */}
            <Button 
              variant="outline"
              onClick={handleGenerateAIDraft}
              size="lg"
              className="flex items-center gap-3 hover:bg-muted/50 transition-all duration-200 px-6 py-3 text-base font-medium"
            >
              <Bot className="h-5 w-5" />
              Generate AI Draft
            </Button>
            
            {/* Primary Compose Button - Enhanced */}
            <Button 
              onClick={() => setIsComposing(true)}
              size="lg"
              className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-8 py-3 text-base font-semibold"
            >
              <Edit3 className="h-5 w-5" />
              {activeTab === "reactivation" ? "Compose New" : "Compose"}
            </Button>
          </div>
        </div>
     );
  };

  const renderEmptyState = () => {
    if (activeTab === "reactivation") {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-muted-foreground">Select a client to start</h2>
              <p className="text-muted-foreground">Choose a past client to begin newsletter outreach</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "article-draft") {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-muted-foreground">Select a draft to review</h2>
              <p className="text-muted-foreground">Choose a cold mail or follow-up draft to view and manage</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-muted-foreground">Select a conversation</h2>
            <p className="text-muted-foreground">Choose a conversation to view and manage</p>
          </div>
        </div>
      </div>
    );
  };

    return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Page Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Conversation Hub"
          subtitle="Manage all your communications in one place"
          actions={[
            {
              type: 'add',
              label: 'New Message',
              onClick: () => setIsComposing(true)
            }
          ]}
        />
      </div>
      
      {/* Top Header with Centered Toggles */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-card">
        <div className="flex justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reactivation" className="text-sm px-6">Newsletter Mails</TabsTrigger>
              <TabsTrigger value="article-draft" className="text-sm px-6">Cold Mails</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Conversation/Client List */}
        <div className="w-1/3 border-r border-border bg-card flex flex-col min-h-0">
          {/* Search */}
          <div className="flex-shrink-0 p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "reactivation" ? "Search clients..." : 
                             activeTab === "article-draft" ? "Search drafts..." : 
                             "Search newsletters..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilterOptions().map((option) => (
                      <SelectItem key={option} value={option}>
                        {getFilterLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Conversation/Client List */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {renderConversationList()}
          </div>
        </div>

        {/* Right Panel - Conversation Thread */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderConversationHeader()}

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "sent" || message.type === "user_draft" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg space-y-2 ${
                  message.type === "sent" || message.type === "user_draft"
                    ? "bg-primary text-primary-foreground"
                    : message.type === "ai_draft"
                    ? "bg-blue-500 text-white"
                    : "bg-card border"
                }`}>
                  {message.subject && (
                    <div className="font-medium text-sm border-b border-current/20 pb-1">
                      {message.subject}
                    </div>
                  )}
                   
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                   
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                    {message.type === "sent" && <Check className="h-3 w-3" />}
                    {message.type === "ai_draft" && <Bot className="h-3 w-3" />}
                    {message.type === "received" && <User className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current Draft */}
            {currentDraft && (
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="h-4 w-4" />
                    <span className="font-medium text-sm">Draft in Progress</span>
                  </div>
                  {draftSubject && (
                    <div className="font-medium text-sm border-b border-yellow-300 pb-1 mb-2">
                      {draftSubject}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{draftContent}</p>
                </div>
              </div>
            )}
          </div>

          {/* Compose Area */}
          {renderComposeArea()}

          {/* Empty State */}
          {!selectedConversation && !selectedPastClient && renderEmptyState()}
        </div>
      </div>

      {/* AI Drafts Modal */}
      <Dialog open={showAIDrafts} onOpenChange={setShowAIDrafts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI-Generated Drafts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {mockAIDrafts.map((draft, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">{draft.subject}</h3>
                      <Bot className="h-4 w-4 text-blue-500 mt-1" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {(() => {
                        if (selectedConversation?.clientName) {
                          return draft.content
                            .replace(/\{\{clientName\}\}/g, selectedConversation.clientName.split(' ')[0])
                            .replace(/\{\{company\}\}/g, "their company");
                        } else if (selectedPastClient) {
                          return draft.content
                            .replace(/\{\{clientName\}\}/g, selectedPastClient.name.split(' ')[0])
                            .replace(/\{\{company\}\}/g, selectedPastClient.company);
                        }
                        return draft.content;
                      })()}
                    </p>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleSelectAIDraft(draft)}
                      className="w-full"
                    >
                      Use This Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}