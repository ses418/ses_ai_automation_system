import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar, Mail, Send, RotateCcw, Edit3, Check, X, Building2, Users, Clock, FileText, Search, Filter, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { 
  Newsletter as NewsletterType, 
  CampaignData, 
  TimelineItem, 
  WebhookResponse,
  createCampaign,
  updateTimeline,
  fetchNewsletters,
  updateNewsletterSubject,
  approveNewsletter,
  regenerateNewsletter,
  searchNewsletters
} from "@/services/newsletterService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const industries = [
  "Technology", "Healthcare", "Finance", "Manufacturing", "Retail", 
  "Education", "Real Estate", "Transportation", "Energy", "Construction"
];

const emailGroups = [
  "VIP Clients", "Enterprise", "SMB", "Startups", "Partners", "Prospects"
];

const frequencies = [
  "Now", "After 1 week", "After 2 weeks", "After 1 month", "Custom"
];

export default function Newsletter() {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    campaignName: "",
    startDate: "",
    endDate: "",
    targetedIndustry: [],
    emailGroup: [],
    emailIds: [],
    frequency: ""
  });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [allowedNewsletterTypes, setAllowedNewsletterTypes] = useState<string[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewNewsletter, setPreviewNewsletter] = useState<NewsletterType | null>(null);
  const { toast } = useToast();

  // Fetch newsletters on component mount
  useEffect(() => {
    const loadNewsletters = async () => {
      try {
        const data = await fetchNewsletters();
        setNewsletters(data);
      } catch (error) {
        console.error("Failed to load newsletters:", error);
        // Fallback to mock data for demonstration
        const mockNewsletters: NewsletterType[] = [
          {
            newsletter_id: 1,
            newsletter_type: "general",
            subject_line: "Monthly Engineering Insights - January 2025",
            full_content: "<h1>Monthly Engineering Insights</h1><p>Welcome to our January newsletter featuring the latest developments in infrastructure engineering...</p>",
            target_industry: "Construction",
            approval_status: "approved",
            status: "generated",
            approved_by: "John Doe",
            project_id: 1
          },
          {
            newsletter_id: 2,
            newsletter_type: "industry_specific",
            subject_line: "Tech Industry Focus: AI in Engineering",
            full_content: "<h1>AI in Engineering</h1><p>Discover how artificial intelligence is revolutionizing the engineering sector...</p>",
            target_industry: "Technology",
            approval_status: "review",
            status: "generated",
            approved_by: "",
            project_id: 2
          }
        ];
        setNewsletters(mockNewsletters);
      }
    };
    
    loadNewsletters();
  }, []);

  const handleCampaignSubmit = async () => {
    setIsLoading(true);
    try {
      const data = await createCampaign(campaignData);
      setTimeline(data.output.timeline);
      setAllowedNewsletterTypes(data.output["allowed-newsletter-type"]);
      setShowCampaignModal(false);
      setShowTimelineModal(true);
      toast({
        title: "Campaign Created Successfully",
        description: "Your campaign has been created and timeline generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimelineSave = async () => {
    setIsLoading(true);
    try {
      await updateTimeline(timeline, allowedNewsletterTypes);
      toast({
        title: "Timeline Updated",
        description: "Your campaign timeline has been saved successfully.",
      });
      setShowTimelineModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timeline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsletterAction = async (action: string, newsletterId: string) => {
    setIsLoading(true);
    try {
      if (action === "approve") {
        await approveNewsletter(newsletterId);
        // Update local state
        setNewsletters(prev => prev.map(n => 
          n.newsletter_id.toString() === newsletterId 
            ? { ...n, status: "sent", approval_status: "approved" }
            : n
        ));
        toast({
          title: "Newsletter Approved",
          description: "The newsletter has been sent to Outlook.",
        });
      } else if (action === "regenerate") {
        await regenerateNewsletter(newsletterId);
        toast({
          title: "Newsletter Regenerated",
          description: "The newsletter content has been regenerated successfully.",
        });
        // In a real app, you'd refresh the newsletter content here
      } else {
        throw new Error("Invalid action");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} newsletter. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveNewsletter = async (newsletterId: number) => {
    setIsLoading(true);
    try {
      await approveNewsletter(newsletterId.toString());
      setNewsletters(prev => prev.map(n => 
        n.newsletter_id === newsletterId 
          ? { ...n, status: "sent", approval_status: "approved" }
          : n
      ));
      toast({
        title: "Newsletter Approved",
        description: "The newsletter has been sent to Outlook.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to approve newsletter. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectEdit = (newsletterId: string, currentSubject: string) => {
    setEditingSubject(newsletterId);
    setEditingSubjectValue(currentSubject);
  };

  const handleSubjectSave = async (newsletterId: string) => {
    try {
      // Update local state immediately for better UX
      setNewsletters(prev => prev.map(n => 
        n.newsletter_id.toString() === newsletterId 
          ? { ...n, subject_line: editingSubjectValue }
          : n
      ));
      
      // Update in Supabase via service
      await updateNewsletterSubject(newsletterId, editingSubjectValue);
      
      toast({
        title: "Subject Updated",
        description: "The newsletter subject has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditingSubject(null);
      setEditingSubjectValue("");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "ready": return "bg-blue-500";
      case "sent": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Old Page Header Style */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Newsletter Management"
          subtitle="Create campaigns, manage timelines, and review newsletters"
          actions={[
            {
              type: 'add',
              label: 'New Campaign',
              onClick: () => setShowCampaignModal(true)
            }
          ]}
        />
      </div>

      {/* Main Content Area */}
      <div className="px-8 pb-8 relative z-10">
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 mb-6 hover:bg-white/80 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01]">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              </div>
              <Input
                placeholder="Search newsletters by subject or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg border-0 bg-white/80 backdrop-blur-sm rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 group-hover:bg-white/90 group-hover:shadow-lg"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filters:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-0 shadow-inner rounded-xl hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-0 shadow-inner rounded-xl hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="industry_specific">Industry Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Newsletter Cards Grid - Reduced Height */}
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/70 backdrop-blur-md rounded-full shadow-xl animate-bounce">
                <img 
          src="/ses-logo.png" 
          alt="SES Logo Loading" 
          className="w-24 h-24 mx-auto animate-pulse animate-spin"
        />
              </div>
              <p className="text-gray-600 text-lg mt-6 font-medium animate-pulse">Loading newsletters...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && newsletters.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12 max-w-md mx-auto hover:bg-white/80 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Mail className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Newsletters Found</h3>
                <p className="text-gray-600 mb-6">Create your first campaign to get started with newsletter management.</p>
                <Button 
                  onClick={() => setShowCampaignModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </div>
          )}

          {/* Newsletter Cards */}
          {!isLoading && newsletters.length > 0 && (
            <div className="grid gap-4">
              {newsletters
                .filter(newsletter => {
                  const matchesSearch = searchQuery === "" || 
                    newsletter.subject_line.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    newsletter.full_content.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const matchesStatus = statusFilter === "all" || newsletter.approval_status === statusFilter;
                  const matchesType = typeFilter === "all" || newsletter.newsletter_type === typeFilter;
                  
                  return matchesSearch && matchesStatus && matchesType;
                })
                .map((newsletter, index) => (
                <div 
                  key={newsletter.newsletter_id}
                  className="group bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl hover:bg-white/80 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-white/30">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        {/* Badges Row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-300">
                            #{newsletter.newsletter_id}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(newsletter.approval_status)} className="shadow-sm hover:shadow-md transition-all duration-300">
                            {newsletter.approval_status}
                          </Badge>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 ${getStatusColor(newsletter.status)}`}>
                            {newsletter.status}
                          </div>
                        </div>
                        
                        {/* Metadata Row */}
                        <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            {newsletter.target_industry}
                          </span>
                          <span className="flex items-center gap-2 hover:text-purple-600 transition-colors duration-300">
                            <FileText className="h-4 w-4 text-purple-500" />
                            {newsletter.newsletter_type.replace("_", " ")}
                          </span>
                          {newsletter.approved_by && (
                            <span className="flex items-center gap-2 hover:text-green-600 transition-colors duration-300">
                              <Users className="h-4 w-4 text-green-500" />
                              Approved by: {newsletter.approved_by}
                            </span>
                          )}
                          <span className="flex items-center gap-2 hover:text-orange-600 transition-colors duration-300">
                            <FileText className="h-4 w-4 text-orange-500" />
                            Project: {newsletter.project_id}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPreviewNewsletter(newsletter);
                            setShowPreviewModal(true);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewsletterAction("approve", newsletter.newsletter_id.toString())}
                          disabled={isLoading || newsletter.status === "sent"}
                          className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewsletterAction("regenerate", newsletter.newsletter_id.toString())}
                          disabled={isLoading}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Subject Line Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Subject Line</Label>
                      {editingSubject === newsletter.newsletter_id.toString() ? (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editingSubjectValue}
                            onChange={(e) => setEditingSubjectValue(e.target.value)}
                            className="flex-1 bg-white/80 backdrop-blur-sm border-0 shadow-inner rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubjectSave(newsletter.newsletter_id.toString())}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSubject(null)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-lg text-gray-800 font-medium">{newsletter.subject_line}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubjectEdit(newsletter.newsletter_id.toString(), newsletter.subject_line)}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Creation Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Newsletter Campaign
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  value={campaignData.campaignName}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={campaignData.frequency} onValueChange={(value) => setCampaignData(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Targeted Industry *</Label>
              <div className="grid grid-cols-3 gap-2">
                {industries.map((industry) => (
                  <label key={industry} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={campaignData.targetedIndustry.includes(industry)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaignData(prev => ({
                            ...prev,
                            targetedIndustry: [...prev.targetedIndustry, industry]
                          }));
                        } else {
                          setCampaignData(prev => ({
                            ...prev,
                            targetedIndustry: prev.targetedIndustry.filter(i => i !== industry)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{industry}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Group *</Label>
              <div className="grid grid-cols-3 gap-2">
                {emailGroups.map((group) => (
                  <label key={group} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={campaignData.emailGroup.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaignData(prev => ({
                            ...prev,
                            emailGroup: [...prev.emailGroup, group]
                          }));
                        } else {
                          setCampaignData(prev => ({
                            ...prev,
                            emailGroup: prev.emailGroup.filter(g => g !== group)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailIds">Email IDs (comma-separated)</Label>
              <Textarea
                id="emailIds"
                value={campaignData.emailIds.join(", ")}
                onChange={(e) => setCampaignData(prev => ({ 
                  ...prev, 
                  emailIds: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                }))}
                placeholder="Enter email addresses separated by commas"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleCampaignSubmit} 
              disabled={isLoading || !campaignData.campaignName || !campaignData.startDate || !campaignData.endDate || campaignData.targetedIndustry.length === 0 || campaignData.emailGroup.length === 0}
              className="w-full"
            >
              {isLoading ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeline Editing Modal */}
      <Dialog open={showTimelineModal} onOpenChange={setShowTimelineModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Campaign Timeline
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {timeline.length > 0 ? (
              <>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Date</Label>
                        <div className="text-sm text-muted-foreground">{format(new Date(item.date), "PPP")}</div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Newsletter Type</Label>
                        <Select
                          value={item["newsletter-type"]}
                          onValueChange={(value) => {
                            const newTimeline = [...timeline];
                            newTimeline[index]["newsletter-type"] = value;
                            setTimeline(newTimeline);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedNewsletterTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleTimelineSave} disabled={isLoading} className="w-full">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No timeline available. Please create a campaign first.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white border-0 shadow-2xl">
          {/* Professional Compact Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-gray-900 truncate">
                    {previewNewsletter?.subject_line}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Newsletter Preview
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {previewNewsletter && (
            <div className="grid grid-rows-[1fr_auto] h-full">
              {/* Main Content Area - Professional and Clean */}
              <div className="overflow-y-auto bg-gray-50 p-8" style={{ height: 'calc(90vh - 120px)' }}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div 
                    className="prose prose-lg max-w-none mx-auto
                      prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-8
                      prose-h1:text-4xl prose-h1:text-gray-900 prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-8
                      prose-h2:text-3xl prose-h2:text-gray-800 prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-2xl prose-h3:text-gray-700 prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                      prose-a:text-blue-600 prose-a:font-medium prose-a:underline hover:prose-a:text-blue-800
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:text-gray-700 prose-ul:mb-6 prose-li:mb-2 prose-li:text-lg
                      prose-ol:text-gray-700 prose-ol:mb-6 prose-li:mb-2 prose-li:text-lg
                      prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                      prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:my-8
                      prose-table:border-collapse prose-table:w-full prose-table:mb-6 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-gray-200
                      prose-th:bg-gray-50 prose-th:text-gray-800 prose-th:font-semibold prose-th:p-4 prose-th:border prose-th:border-gray-200
                      prose-td:p-4 prose-td:border prose-td:border-gray-200
                      prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: previewNewsletter.full_content }}
                  />
                </div>
              </div>
              
              {/* Professional Action Footer */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Created:</span> {previewNewsletter.created_at ? format(new Date(previewNewsletter.created_at), 'PPP') : 'N/A'}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreviewModal(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                    >
                      Close Preview
                    </Button>
                    <Button
                      onClick={() => {
                        handleNewsletterAction("approve", previewNewsletter.newsletter_id.toString());
                        setShowPreviewModal(false);
                      }}
                      disabled={isLoading || previewNewsletter.status === "sent"}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Outlook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
