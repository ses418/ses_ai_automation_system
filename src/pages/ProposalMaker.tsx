import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Mail, 
  Check, 
  X, 
  Eye, 
  Plus,
  Building,
  Calendar,
  Globe,
  MapPin,
  User,
  FileImage,
  Edit
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

// Interface for inquiries
interface Inquiry {
  inquiry_id: string;
  client_id: number | null;
  lead_id: string | null;
  article_id: number | null;
  title: string;
  classification: 'greenfield' | 'brownfield' | 'unknown';
  is_cold_email: boolean;
  inquiry_source: string;
  bd_id: number | null;
  approval_bd: boolean;
  email_subject: string | null;
  email_content_plain: string | null;
  email_content_html: string | null;
  status: string;
  priority: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  source_email_id: string | null;
  document_link: string | null;
  inquiry_approval: string | null;
}

// Interface for clients
interface Client {
  client_id: string;
  client_name: string;
  website: string | null;
  headquarters: string | null;
  client_overview: string | null;
  type_of_client: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for client form
interface ClientForm {
  client_name: string;
  website: string;
  headquarters: string;
  client_overview: string;
  type_of_client: string;
  location: string;
}

const ProposalMaker: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inquiry');
  
  // Inquiry Management State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Modal States
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState<'greenfield' | 'brownfield'>('greenfield');
  
  // Client Form State
  const [clientForm, setClientForm] = useState<ClientForm>({
    client_name: '',
    website: '',
    headquarters: '',
    client_overview: '',
    type_of_client: 'target',
    location: ''
  });

  // Fetch inquiries and clients on component mount
  useEffect(() => {
    fetchInquiries();
    fetchClients();
  }, []);

  // Fetch inquiries from Supabase
  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setInquiries(data as Inquiry[]);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      toast({
        title: "Error",
        description: "Failed to fetch inquiries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('ses_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setClients(data as Client[]);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast({
        title: "Error",
        description: "Failed to fetch clients.",
        variant: "destructive",
      });
    }
  };

  // Update inquiry classification
  const updateClassification = async () => {
    if (!selectedInquiry) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          classification: selectedClassification,
          updated_by: 1, // Assuming user ID 1 for now
          updated_at: new Date().toISOString(),
        })
        .eq('inquiry_id', selectedInquiry.inquiry_id);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Inquiry ${selectedInquiry.inquiry_id} classification updated to ${selectedClassification}`,
      });
      
      setShowClassificationModal(false);
      setSelectedInquiry(null);
      fetchInquiries(); // Refresh inquiries
    } catch (err) {
      console.error("Error updating classification:", err);
      toast({
        title: "Error",
        description: "Failed to update classification.",
        variant: "destructive",
      });
    }
  };

  // Handle approval confirmation
  const handleApprovalConfirm = async () => {
    if (!selectedInquiry) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          inquiry_approval: 'approved',
          classification: selectedClassification, // Save selected classification
          updated_by: 1, // Assuming user ID 1 for now
          updated_at: new Date().toISOString(),
        })
        .eq('inquiry_id', selectedInquiry.inquiry_id);

      if (error) {
        throw error;
      }

      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq.inquiry_id === selectedInquiry.inquiry_id 
          ? { ...inq, inquiry_approval: 'approved', classification: selectedClassification }
          : inq
      ));

      toast({
        title: "Success",
        description: "Inquiry approved successfully.",
      });

      setShowApprovalModal(false);
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Error approving inquiry:", err);
      toast({
        title: "Error",
        description: "Failed to approve inquiry.",
        variant: "destructive",
      });
    }
  };

  // Create new client
  const createClient = async () => {
    try {
      const { data, error } = await supabase
        .from('ses_clients')
        .insert([clientForm])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the inquiry with the new client_id
      if (selectedInquiry && data) {
        const { error: updateError } = await supabase
          .from('inquiries')
          .update({
            client_id: data.client_id,
            updated_by: 1,
            updated_at: new Date().toISOString(),
          })
          .eq('inquiry_id', selectedInquiry.inquiry_id);

        if (updateError) {
          throw updateError;
        }
      }

      toast({
        title: "Success",
        description: "Client created and linked to inquiry successfully!",
      });

      setShowClientForm(false);
      setSelectedInquiry(null);
      setClientForm({
        client_name: '',
        website: '',
        headquarters: '',
        client_overview: '',
        type_of_client: 'target',
        location: ''
      });

      fetchInquiries(); // Refresh inquiries
      fetchClients(); // Refresh clients
    } catch (err) {
      console.error("Error creating client:", err);
      toast({
        title: "Error",
        description: "Failed to create client.",
        variant: "destructive",
      });
    }
  };

  // Handle row click to show inquiry details
  const handleInquiryClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryDetails(true);
  };

  // Handle approval button click
  const handleApprovalClick = (e: React.MouseEvent, inquiry: Inquiry) => {
    e.stopPropagation();
    setSelectedInquiry(inquiry);
    setSelectedClassification(inquiry.classification as 'greenfield' | 'brownfield');
    setShowApprovalModal(true);
  };

  // Get classification color
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'greenfield':
        return 'text-green-600 font-semibold';
      case 'brownfield':
        return 'text-amber-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Proposal Maker
          </h1>
          <p className="text-gray-600 text-lg">
            Manage inquiries, generate documents, and draft proposals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
          <TabsTrigger 
            value="inquiry" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Inquiry
          </TabsTrigger>
          <TabsTrigger 
            value="generated" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generated Document
          </TabsTrigger>
          <TabsTrigger 
            value="document" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Document
          </TabsTrigger>
          <TabsTrigger 
            value="drafted" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <Mail className="h-4 w-4 mr-2" />
            Drafted Mails
          </TabsTrigger>
        </TabsList>

        {/* Inquiry Tab */}
        <TabsContent value="inquiry" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
              <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Inquiry Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Test Database Connection Button */}
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Testing database connection...');
                    console.log('Current inquiries:', inquiries);
                    console.log('Current clients:', clients);
                    fetchInquiries();
                    fetchClients();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                >
                  🧪 Test DB Connection
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    console.log('🧪 Manual test of inquiries table...');
                    try {
                      const { data, error } = await supabase
                        .from('inquiries')
                        .select('*')
                        .limit(5);
                      console.log('Manual test result:', { data, error });
                    } catch (err) {
                      console.error('Manual test error:', err);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 ml-2"
                >
                  🧪 Manual Test
                </Button>
                
                {/* Debug Info */}
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Debug Info:</span> 
                  Inquiries: {inquiries.length} | 
                  Clients: {clients.length} | 
                  Loading: {isLoading ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search inquiries by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                      <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                        <SelectValue placeholder="Filter by classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classifications</SelectItem>
                        <SelectItem value="greenfield">Greenfield</SelectItem>
                        <SelectItem value="brownfield">Brownfield</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Inquiry List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                                             <img 
           src="/ses-logo.png" 
           alt="SES Logo Loading" 
           className="w-24 h-24 mx-auto mb-4 animate-pulse animate-spin"
         />
                       <p className="text-gray-600 animate-pulse">Loading inquiries...</p>
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No Inquiries Found</h3>
                      <p className="text-gray-500">No inquiries match your current filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inquiries
                        .filter(inquiry => {
                          const matchesSearch = searchQuery === "" || 
                            inquiry.title.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
                          const matchesClassification = classificationFilter === "all" || inquiry.classification === classificationFilter;
                          const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter;
                          
                          return matchesSearch && matchesStatus && matchesClassification && matchesPriority;
                        })
                        .map((inquiry) => (
                          <Card 
                            key={inquiry.inquiry_id} 
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20 hover:border-blue-200"
                            onClick={() => handleInquiryClick(inquiry)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                                      {inquiry.inquiry_id}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={inquiry.classification === 'greenfield' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                                    >
                                      {inquiry.classification}
                                    </Badge>
                                    <Badge variant={getPriorityBadgeVariant(inquiry.priority)}>
                                      {inquiry.priority}
                                    </Badge>
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                      {inquiry.status}
                                    </Badge>
                                    {inquiry.is_cold_email && (
                                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        <Mail className="h-3 w-3 mr-1" />
                                        Cold Email
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <h3 className="font-semibold text-lg text-gray-800">{inquiry.title}</h3>
                                  
                                  <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                                    <span className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {format(new Date(inquiry.created_at), "PPP")}
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <Building className="h-4 w-4" />
                                      {inquiry.inquiry_source}
                                    </span>
                                    {inquiry.inquiry_approval && (
                                      <span className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        Approved: {inquiry.inquiry_approval}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  {inquiry.inquiry_approval === 'approved' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled
                                      className="bg-green-100 text-green-700 border-green-300 cursor-not-allowed opacity-60 transition-all duration-300"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approved
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => handleApprovalClick(e, inquiry)}
                                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Document Tab */}
        <TabsContent value="generated" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-lg">
              <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Generated Documents</h3>
                <p className="text-gray-500">Generated documents will appear here once created.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Tab */}
        <TabsContent value="document" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-lg">
              <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Documents</h3>
                <p className="text-gray-500">Documents will appear here once uploaded or created.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafted Mails Tab */}
        <TabsContent value="drafted" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-lg">
              <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Drafted Mails
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Drafted Mails</h3>
                <p className="text-gray-500">Drafted emails will appear here once created.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inquiry Details Modal */}
      <Dialog open={showInquiryDetails} onOpenChange={setShowInquiryDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inquiry Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Inquiry ID</Label>
                    <p className="text-lg font-mono bg-gray-100 p-2 rounded">{selectedInquiry.inquiry_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Title</Label>
                    <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Classification</Label>
                    <p className={`text-lg p-2 rounded ${getClassificationColor(selectedInquiry.classification)}`}>
                      {selectedInquiry.classification}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Priority</Label>
                    <Badge variant={getPriorityBadgeVariant(selectedInquiry.priority)}>
                      {selectedInquiry.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Source</Label>
                    <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.inquiry_source}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cold Email</Label>
                    <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.is_cold_email ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Created</Label>
                    <p className="text-lg p-2 bg-gray-100 rounded">{format(new Date(selectedInquiry.created_at), "PPP HH:mm")}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Client ID</Label>
                  {selectedInquiry.client_id ? (
                    <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.client_id}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-lg p-2 bg-red-50 text-red-700 rounded border border-red-200">No client assigned</p>
                      <Button
                        onClick={() => {
                          setShowInquiryDetails(false);
                          setShowClientForm(true);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Client
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Article ID</Label>
                  <p className="text-lg p-2 bg-gray-100 rounded">{selectedInquiry.article_id || 'N/A'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Document Link</Label>
                  {selectedInquiry.document_link ? (
                    <a 
                      href={selectedInquiry.document_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      View Document
                    </a>
                  ) : (
                    <p className="text-lg p-2 bg-gray-100 rounded text-gray-500">No document link</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowInquiryDetails(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowInquiryDetails(false);
                    setShowClassificationModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Inquiry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Classification Modal */}
      <Dialog open={showClassificationModal} onOpenChange={setShowClassificationModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Approve Inquiry
            </DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium">Inquiry ID:</span> {selectedInquiry.inquiry_id}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Title:</span> {selectedInquiry.title}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Current Classification:</span> 
                  <span className={`ml-2 ${getClassificationColor(selectedInquiry.classification)}`}>
                    {selectedInquiry.classification}
                  </span>
                </p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Select New Classification</Label>
                <RadioGroup value={selectedClassification} onValueChange={(value: 'greenfield' | 'brownfield') => setSelectedClassification(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="greenfield" id="greenfield" />
                    <Label htmlFor="greenfield" className="text-green-700 font-medium">Greenfield</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="brownfield" id="brownfield" />
                    <Label htmlFor="brownfield" className="text-amber-700 font-medium">Brownfield</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowClassificationModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={updateClassification}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Client Form Modal */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Client
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientForm.client_name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Enter client name"
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={clientForm.website}
                  onChange={(e) => setClientForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={clientForm.headquarters}
                  onChange={(e) => setClientForm(prev => ({ ...prev, headquarters: e.target.value }))}
                  placeholder="Enter headquarters"
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={clientForm.location}
                  onChange={(e) => setClientForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="typeOfClient">Type of Client *</Label>
              <Select value={clientForm.type_of_client} onValueChange={(value) => setClientForm(prev => ({ ...prev, type_of_client: value }))}>
                <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="target">Target</SelectItem>
                  <SelectItem value="existing">Existing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientOverview">Client Overview</Label>
              <Textarea
                id="clientOverview"
                value={clientForm.client_overview}
                onChange={(e) => setClientForm(prev => ({ ...prev, client_overview: e.target.value }))}
                placeholder="Enter client overview"
                rows={4}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowClientForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={createClient}
                disabled={!clientForm.client_name || !clientForm.type_of_client}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Confirm Approval
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Are you sure you want to approve this inquiry? This action will mark the inquiry as approved and cannot be undone.
              </p>
            </div>
            
            {selectedInquiry && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Inquiry Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">ID:</span> {selectedInquiry.inquiry_id}</p>
                  <p><span className="font-medium">Title:</span> {selectedInquiry.title}</p>
                  <p><span className="font-medium">Source:</span> {selectedInquiry.inquiry_source}</p>
                </div>
              </div>
            )}

            {/* Classification Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Select Classification:</h4>
              <RadioGroup 
                value={selectedClassification} 
                onValueChange={(value: 'greenfield' | 'brownfield') => setSelectedClassification(value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="greenfield" id="approval-greenfield" />
                  <Label htmlFor="approval-greenfield" className="text-green-700 font-medium cursor-pointer">
                    Greenfield
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="brownfield" id="approval-brownfield" />
                  <Label htmlFor="approval-brownfield" className="text-amber-700 font-medium cursor-pointer">
                    Brownfield
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprovalConfirm}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalMaker;
