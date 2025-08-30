import React, { useState, useMemo, useEffect } from "react";
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
import { EmailDraftsService, EmailDraft } from "@/services/emailDraftsService";

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
  }
];

const mockAIDrafts = [
  {
    subject: "Partnership Opportunity with {{company}}",
    content: "Hi {{clientName}},\n\nI hope this email finds you well. I recently came across your company's work in the engineering sector and was impressed by your innovative approach to sustainable infrastructure development.\n\nAt SES, we've been developing cutting-edge solutions that align perfectly with your company's vision. I believe there's a great opportunity for collaboration that could benefit both our organizations.\n\nWould you be interested in scheduling a brief call to discuss potential partnership opportunities?\n\nBest regards,\n[Your Name]\nSES Team"
  },
  {
    subject: "Innovation Collaboration Discussion",
    content: "Dear {{clientName}},\n\nI hope you're having a productive day. I wanted to reach out because I believe there's a significant opportunity for our companies to collaborate on some exciting innovation projects.\n\nYour company's track record in engineering excellence is well-known, and we think there's great potential for a strategic partnership.\n\nLet me know if you'd be interested in exploring this further.\n\nBest regards,\n[Your Name]"
  }
];

export default function ConversationHub() {
  const [activeTab, setActiveTab] = useState("article-draft");
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
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [selectedEmailDraft, setSelectedEmailDraft] = useState<EmailDraft | null>(null);
  const [showEmailDraftModal, setShowEmailDraftModal] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const { toast } = useToast();

  // Fetch email drafts from Supabase
  useEffect(() => {
    const fetchEmailDrafts = async () => {
      setIsLoadingDrafts(true);
      try {
        const drafts = await EmailDraftsService.getEmailDrafts();
        setEmailDrafts(drafts);
      } catch (error) {
        console.error('Error fetching email drafts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch email drafts",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDrafts(false);
      }
    };

    fetchEmailDrafts();
  }, [toast]);

  const handleEmailDraftClick = (draft: EmailDraft) => {
    setSelectedEmailDraft(draft);
    setShowEmailDraftModal(true);
  };

  const handleEmailDraftSendToOutlook = async (draft: EmailDraft) => {
    try {
      // Mark draft as sent
      await EmailDraftsService.markAsSent(draft.id);
      
      // Update local state
      setEmailDrafts(prev => prev.map(d => 
        d.id === draft.id ? { ...d, status: 'sent', delivered_status: 'delivered' } : d
      ));
      
      toast({
        title: "Success",
        description: "Email draft sent to Outlook successfully",
      });
      
      setShowEmailDraftModal(false);
      setSelectedEmailDraft(null);
    } catch (error) {
      console.error('Error sending draft to Outlook:', error);
      toast({
        title: "Error",
        description: "Failed to send draft to Outlook",
        variant: "destructive",
      });
    }
  };

  const getConversationsForTab = () => {
    switch (activeTab) {
      case "article-draft":
        return mockConversations.filter(c => c.type === "article" || c.type === "follow-up");
      default:
        return [];
    }
  };

  const getPastClientsForTab = () => {
    return [];
  };

  const getFilterOptions = () => {
    switch (activeTab) {
      case "article-draft":
        return ["all", "primary", "secondary", "tertiary", "conversation", "replied"];
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
    setMessages([
      {
        id: "1",
        type: "ai_draft",
        content: "Hi there! I wanted to reach out about a potential collaboration opportunity. Your company's work in sustainable infrastructure really caught our attention.",
        subject: conversation.subject,
        timestamp: "2 hours ago",
        status: "draft"
      },
      {
        id: "2",
        type: "sent",
        content: "Thank you for your interest. We'd be happy to discuss potential collaboration opportunities.",
        subject: "Re: " + conversation.subject,
        timestamp: "1 hour ago",
        status: "sent"
      }
    ]);
  };

  const handlePastClientSelect = (client: PastClient) => {
    setSelectedPastClient(client);
    setSelectedConversation(null);
    setMessages([
      {
        id: "1",
        type: "ai_draft",
        content: "Hi " + client.name.split(' ')[0] + "! I hope you're doing well. I wanted to follow up on our previous discussion about potential collaboration opportunities.",
        subject: "Follow-up: Collaboration Discussion",
        timestamp: "1 day ago",
        status: "draft"
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!draftContent.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "sent",
      content: draftContent,
      subject: draftSubject || "No Subject",
      timestamp: "Just now",
      status: "sent"
    };

    setMessages(prev => [...prev, newMessage]);
    setDraftContent("");
    setDraftSubject("");
    setIsComposing(false);
    setCurrentDraft(null);
  };

  const handleSelectAIDraft = (draft: any) => {
    setDraftSubject(draft.subject);
    setDraftContent(draft.content);
    setIsComposing(true);
    setShowAIDrafts(false);
  };

  const handleComposeNew = () => {
    setIsComposing(true);
    setDraftSubject("");
    setDraftContent("");
    setCurrentDraft({
      id: "new",
      type: "user_draft",
      content: "",
      subject: "",
      timestamp: "Just now",
      status: "draft"
    });
  };

  const renderComposeArea = () => {
    if (!isComposing) return null;

    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="space-y-4">
          <Input
            placeholder="Subject (optional)"
            value={draftSubject}
            onChange={(e) => setDraftSubject(e.target.value)}
            className="bg-background"
          />
          <Textarea
            placeholder="Type your message..."
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="min-h-[120px] bg-background resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsComposing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!draftContent.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-foreground">No conversation selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a conversation from the list to start messaging
            </p>
          </div>
          <Button onClick={handleComposeNew}>
            <Plus className="h-4 w-4 mr-2" />
            Compose New Message
          </Button>
        </div>
      </div>
    );
  };

  const renderConversationList = () => {
    if (activeTab === "article-draft") {
      return (
        <div className="overflow-y-auto h-full">
          {/* Email Drafts Section */}
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Email Drafts from Database</h3>
            {isLoadingDrafts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading email drafts...</p>
              </div>
            ) : emailDrafts.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No email drafts found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emailDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleEmailDraftClick(draft)}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-card hover:shadow-sm transition-all duration-200 bg-background"
                  >
                    <div className="space-y-3">
                      {/* Draft ID */}
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/15 px-3 py-1.5 rounded-lg">
                          <span className="text-sm font-mono font-bold text-primary">DRAFT-{draft.id.slice(0, 8)}</span>
                        </div>
                        <Badge 
                          variant={draft.status === 'draft' ? 'outline' : draft.status === 'sent' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Subject */}
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground">{draft.subject}</h3>
                        </div>
                      </div>
                      
                      {/* Recipient */}
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground font-medium">{draft.recipient}</span>
                      </div>
                      
                      {/* Meta Information */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {draft.created_by}
                          </Badge>
                          {draft.replied && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              Replied
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(draft.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Existing Conversations */}
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Mock Conversations</h3>
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
                    Total Value: {selectedPastClient.totalValue}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Company
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
              
              {/* Subject & Type */}
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold text-lg">{selectedConversation.subject}</h2>
                  <p className="text-sm text-muted-foreground">{getTypeLabel(selectedConversation.type)}</p>
                </div>
                
                <Badge variant="secondary" className="ml-auto font-semibold">
                  {selectedConversation.status.charAt(0).toUpperCase() + selectedConversation.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedConversation.recipientName && (
                  <Badge variant="outline" className="text-xs">
                    Recipient: {selectedConversation.recipientName}
                  </Badge>
                )}
                {selectedConversation.createdBy && (
                  <Badge variant="outline" className="text-xs">
                    Created by: {selectedConversation.createdBy}
                  </Badge>
                )}
                {selectedConversation.draftDate && (
                  <Badge variant="outline" className="text-xs">
                    Draft Date: {selectedConversation.draftDate}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Cold Mails"
        description="Manage cold email campaigns and track responses"
        icon={<Mail className="h-6 w-6" />}
      />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Conversation List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilterOptions().map(option => (
                      <SelectItem key={option} value={option}>
                        {getFilterLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* New Message Button */}
            <Button onClick={handleComposeNew} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>

            {/* Conversation List */}
            <div className="bg-card rounded-lg border h-[600px] overflow-hidden">
              {renderConversationList()}
            </div>
          </div>

          {/* Right Side - Conversation View */}
          <div className="lg:col-span-3 space-y-4">
            {/* Conversation Header */}
            {renderConversationHeader()}

            {/* Messages Area */}
            <div className="bg-card rounded-lg border h-[600px] overflow-hidden flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "sent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === "sent"
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

      {/* Email Draft Modal */}
      <Dialog open={showEmailDraftModal} onOpenChange={setShowEmailDraftModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Email Draft Review
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmailDraft && (
            <div className="space-y-6">
              {/* Draft Header */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                    <p className="text-lg font-semibold text-foreground">{selectedEmailDraft.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Recipient</Label>
                    <p className="text-lg font-medium text-foreground">{selectedEmailDraft.recipient}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge 
                      variant={selectedEmailDraft.status === 'draft' ? 'outline' : selectedEmailDraft.status === 'sent' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {selectedEmailDraft.status.charAt(0).toUpperCase() + selectedEmailDraft.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                    <p className="text-sm text-foreground">{selectedEmailDraft.created_by}</p>
                  </div>
                </div>
              </div>
              
              {/* Email Body */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2">Email Content</Label>
                <div className="bg-muted/30 p-4 rounded-lg border min-h-[300px]">
                  <div className="whitespace-pre-wrap text-foreground font-medium">
                    {selectedEmailDraft.body}
                  </div>
                </div>
              </div>
              
              {/* Meta Information */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <span className="ml-2 text-foreground">
                      {new Date(selectedEmailDraft.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Delivery Status:</span>
                    <span className="ml-2 text-foreground capitalize">
                      {selectedEmailDraft.delivered_status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Replied:</span>
                    <Badge 
                      variant={selectedEmailDraft.replied ? 'default' : 'outline'}
                      className="ml-2"
                    >
                      {selectedEmailDraft.replied ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailDraftModal(false)}
                >
                  Close
                </Button>
                {selectedEmailDraft.status === 'draft' && (
                  <Button 
                    onClick={() => handleEmailDraftSendToOutlook(selectedEmailDraft)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to Outlook
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}