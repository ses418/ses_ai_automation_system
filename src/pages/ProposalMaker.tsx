import React, { useState, useEffect, useRef } from 'react';
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
import { useLoadingState } from '@/hooks/useLoadingState';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { Switch } from '@/components/ui/switch';
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
  Edit,
  Download,
  Brain,
  MessageSquare,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// Interface for questionnaire data
interface QuestionnaireData {
  id?: string;
  inquiry_id: string;
  client_name: string;
  project_detail_scope: string;
  project_location: string;
  contact_person: string;
  capex_estimate: string;
  project_status: string[];
  plant_capacities: string;
  total_equipment_count: string;
  shiva_engineering_scope: string[];
  brief_service_requirement: string;
  scope_doc_link: string;
  documents_availability: string[];
  client_remarks: string;
  clarification_points: string[];
  conversation_points: string[];
  assumptions: string[];
  created_at?: string;
  updated_at?: string;
}




const ProposalMaker: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inquiry');
  
  // Inquiry Management State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { isLoading, startLoading, stopLoading, setErrorState, error } = useLoadingState({ timeout: 8000 });
  const isPageVisible = usePageVisibility();
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
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);

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

  // Questionnaire Form State
  const [questionnaireForm, setQuestionnaireForm] = useState<QuestionnaireData>({
    inquiry_id: '',
    client_name: '',
    project_detail_scope: '',
    project_location: '',
    contact_person: '',
    capex_estimate: '',
    project_status: [],
    plant_capacities: '',
    total_equipment_count: '',
    shiva_engineering_scope: [],
    brief_service_requirement: '',
    scope_doc_link: '',
    documents_availability: [],
    client_remarks: '',
    clarification_points: [],
    conversation_points: [],
    assumptions: []
  });

  // AI Insights view state
  const [isAIInsightsView, setIsAIInsightsView] = useState(false);

  


  // Available options for checkboxes
  const projectStatusOptions = ['Under EC', 'EC/TOR received', 'Public Hearing', 'EC Granted'];
  const engineeringScopeOptions = [
    'Site Master Plan',
    'Basic Engineering',
    'Extended Basic Engineering (If basic engineering is done by client/ Technology Partner, vetting of BE is required from SES)',
    'Detail Engineering',
    'Procurement Assistance',
    'Construction Supervision',
    'Construction Services'
  ];
  const documentOptions = [
    'Preliminary Plot Plan',
    'Equipment List for Process & Utility',
    'Site Survey Report',
    'Environmental Impact Assessment',
    'Technical Specifications',
    'Cost Estimates',
    'Timeline Schedule',
    'Risk Assessment'
  ];

  // Fetch inquiries and clients on component mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (isMounted) {
        await fetchInquiries();
        await fetchClients();
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    if (isPageVisible && inquiries.length === 0 && !isLoading) {
      // Page became visible and we have no data, refresh
      console.log('Page became visible, refreshing data...');
      fetchInquiries();
      fetchClients();
    }
  }, [isPageVisible, inquiries.length, isLoading]);

  // Fetch inquiries from Supabase
  const fetchInquiries = async () => {
    startLoading();
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
      setErrorState("Failed to fetch inquiries.");
      toast({
        title: "Error",
        description: "Failed to fetch inquiries.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
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

  // Handle view questionnaires button click
  const handleViewQuestionnaires = async (inquiry: Inquiry) => {
    console.log('🔍 Opening questionnaires for inquiry:', inquiry.inquiry_id);
    setSelectedInquiry(inquiry);
    setShowQuestionnaireModal(true);

    
    // Fetch questionnaire data for this inquiry
    console.log('📋 Fetching questionnaire data...');
    await fetchQuestionnaireData(inquiry.inquiry_id);
    
    console.log('✅ Modal opened and data fetched');
  };



    // Fetch questionnaire data from Supabase
  const fetchQuestionnaireData = async (inquiryId: string) => {
    try {
      const { data, error } = await supabase
        .from('greenfield_prescope_questionnaires')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        // Data exists, populate the form
        setQuestionnaireForm({
          id: data.id,
          inquiry_id: data.inquiry_id,
          client_name: data.client_name || '',
          project_detail_scope: data.project_detail_scope || '',
          project_location: data.project_location || '',
          contact_person: data.contact_person || '',
          capex_estimate: data.capex_estimate || '',
          project_status: Array.isArray(data.project_status) ? data.project_status : [],
          plant_capacities: data.plant_capacities || '',
          total_equipment_count: data.total_equipment_count || '',
          shiva_engineering_scope: Array.isArray(data.shiva_engineering_scope) ? data.shiva_engineering_scope : [],
          brief_service_requirement: data.brief_service_requirement || '',
          scope_doc_link: data.scope_doc_link || '',
          documents_availability: Array.isArray(data.documents_availability) ? data.documents_availability : [],
          client_remarks: data.client_remarks || '',
          clarification_points: Array.isArray(data.clarification_points) ? data.clarification_points : [],
          conversation_points: Array.isArray(data.conversation_points) ? data.conversation_points : [],
          assumptions: Array.isArray(data.assumptions) ? data.assumptions : [],
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // No data exists, create empty form with inquiry_id
        setQuestionnaireForm({
          inquiry_id: inquiryId,
          client_name: '',
          project_detail_scope: '',
          project_location: '',
          contact_person: '',
          capex_estimate: '',
          project_status: [],
          plant_capacities: '',
          total_equipment_count: '',
          shiva_engineering_scope: [],
          brief_service_requirement: '',
          scope_doc_link: '',
          documents_availability: [],
          client_remarks: '',
          clarification_points: [],
          conversation_points: [],
          assumptions: []
        });
      }
    } catch (err) {
      console.error("Error fetching questionnaire data:", err);
      toast({
        title: "Error",
        description: "Failed to fetch questionnaire data",
        variant: "destructive",
      });
    }
  };






  // Save questionnaire data to Supabase
  const saveQuestionnaireData = async () => {
    try {
      if (questionnaireForm.id) {
        // Update existing record
        const { error } = await supabase
          .from('greenfield_prescope_questionnaires')
          .update({
            ...questionnaireForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', questionnaireForm.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Questionnaire updated successfully",
        });
      } else {
        // Create new record
        const { error } = await supabase
          .from('greenfield_prescope_questionnaires')
          .insert([{
            ...questionnaireForm,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Questionnaire created successfully",
        });
      }

      setShowQuestionnaireModal(false);
    } catch (err) {
      console.error("Error saving questionnaire data:", err);
      toast({
        title: "Error",
        description: "Failed to save questionnaire data",
        variant: "destructive",
      });
    }
  };



  // Handle checkbox changes for project status
  const handleProjectStatusChange = (status: string, checked: boolean) => {
    setQuestionnaireForm(prev => ({
      ...prev,
      project_status: checked 
        ? [...prev.project_status, status]
        : prev.project_status.filter(s => s !== status)
    }));
  };

  // Handle checkbox changes for engineering scope
  const handleEngineeringScopeChange = (scope: string, checked: boolean) => {
    setQuestionnaireForm(prev => ({
      ...prev,
      shiva_engineering_scope: checked 
        ? [...prev.shiva_engineering_scope, scope]
        : prev.shiva_engineering_scope.filter(s => s !== scope)
    }));
  };

  // Handle checkbox changes for document availability
  const handleDocumentAvailabilityChange = (document: string, checked: boolean) => {
    setQuestionnaireForm(prev => ({
      ...prev,
      documents_availability: checked 
        ? [...prev.documents_availability, document]
        : prev.documents_availability.filter(d => d !== document)
    }));
  };

  // Toggle between Questionnaire and AI Insights views
  const handleToggleView = () => {
    setIsAIInsightsView(!isAIInsightsView);
  };

  // Download questionnaire as PDF
  const downloadQuestionnairePDF = async () => {
    try {
      const modalContent = document.getElementById('questionnaire-modal-content');
      if (!modalContent) {
        toast({
          title: "Error",
          description: "Could not find modal content for PDF generation",
          variant: "destructive",
        });
        return;
      }

      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your document...",
      });

      // Use html2canvas to capture the modal content
      const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: modalContent.scrollWidth,
        height: modalContent.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with inquiry ID and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Questionnaire_${selectedInquiry?.inquiry_id || 'Unknown'}_${timestamp}.pdf`;

      // Download the PDF
      pdf.save(filename);

      toast({
        title: "Success",
        description: "Questionnaire downloaded as PDF successfully!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
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
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{error}</p>
                          <Button 
                            onClick={() => fetchInquiries()} 
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
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
                                      onClick={() => handleViewQuestionnaires(inquiry)}
                                      className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:border-green-400 transition-all duration-300"
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Questionnaires
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

      {/* Client Enquiry Questionnaire Modal */}
      <Dialog open={showQuestionnaireModal} onOpenChange={setShowQuestionnaireModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl">
          <DialogHeader>
            {/* Simple Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isAIInsightsView ? 'AI Insights' : 'Client Enquiry Questionnaire'}
              </h2>
              <p className="text-gray-600">
                {isAIInsightsView ? 'AI-generated insights for this inquiry' : 'Complete the questionnaire below for this inquiry'}
              </p>
            </div>

                        {/* Inquiry ID Display */}
            {selectedInquiry && (
              <div className="text-center mb-4">
                <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200 text-lg px-4 py-2">
                  Inquiry ID: {selectedInquiry.inquiry_id}
                </Badge>
              </div>
            )}

            {/* AI Insights Toggle */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Questionnaire</span>
              <Switch
                checked={isAIInsightsView}
                onCheckedChange={handleToggleView}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">AI Insights</span>
            </div>

            {/* Pro Tip */}
            {!isAIInsightsView && (
              <div className="text-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Pro Tip:</strong> Toggle to AI Insights to view clarification points, conversation points, and assumptions for this inquiry.
                </p>
              </div>
            )}

            {/* AI Insights Pro Tip */}
            {isAIInsightsView && (
              <div className="text-center mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">
                  🤖 <strong>AI Insights:</strong> View AI-generated insights to help with project planning and client discussions.
                </p>
              </div>
            )}
            
            {!isAIInsightsView && (
              <p className="text-center text-gray-600 mt-2">
                Please email OR return printed completed questionnaire to the contact person listed below.
              </p>
            )}
          </DialogHeader>
          
          <div id="questionnaire-modal-content" className="space-y-6 p-4">
            {!isAIInsightsView ? (
              <>
                {/* CLIENT INFORMATION Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-blue-500 pb-2">
                Client Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Client Name</Label>
                  <Input
                    value={questionnaireForm.client_name}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Detail/Scope</Label>
                  <Input
                    value={questionnaireForm.project_detail_scope}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, project_detail_scope: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Location</Label>
                  <Input
                    value={questionnaireForm.project_location}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, project_location: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Person (Name, Designation and Contact details)</Label>
                  <Input
                    value={questionnaireForm.contact_person}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* PROJECT DETAILS Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-blue-500 pb-2">
                Project Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project Capex/Approximate Capital Investment (exclude land)</Label>
                  <Input
                    value={questionnaireForm.capex_estimate}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, capex_estimate: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Current Project Status (Please select one or more as applicable)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {projectStatusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`status-${status.replace(/\s+/g, '-')}`}
                          checked={questionnaireForm.project_status.includes(status)}
                          onChange={(e) => handleProjectStatusChange(status, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <Label htmlFor={`status-${status.replace(/\s+/g, '-')}`} className="text-sm text-gray-700">{status}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Plant Capacities</Label>
                  <Textarea
                    value={questionnaireForm.plant_capacities}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, plant_capacities: e.target.value }))}
                    placeholder="Enter plant capacities details"
                    rows={4}
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total number of equipment in the project (Small & Large). Please attach equipment list if available</Label>
                  <Textarea
                    value={questionnaireForm.total_equipment_count}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, total_equipment_count: e.target.value }))}
                    placeholder="Enter equipment details"
                    rows={4}
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* PROJECT SCOPE Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-blue-500 pb-2">
                Project Scope
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Consultant Scope of work (Services required/requested from consultant)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {engineeringScopeOptions.map((scope) => (
                      <div key={scope} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`scope-${scope.replace(/\s+/g, '-')}`}
                          checked={questionnaireForm.shiva_engineering_scope.includes(scope)}
                          onChange={(e) => handleEngineeringScopeChange(scope, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <Label htmlFor={`scope-${scope.replace(/\s+/g, '-')}`} className="text-sm text-gray-700">{scope}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brief Services Requirements along with Scope of work</Label>
                  <Input
                    value={questionnaireForm.brief_service_requirement}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, brief_service_requirement: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">(Attach Scope of Work Document if available)</Label>
                  <Input
                    value={questionnaireForm.scope_doc_link}
                    onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, scope_doc_link: e.target.value }))}
                    placeholder="Click or tap here to enter text."
                    className="mt-1 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* PROJECT DOCUMENTS Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-blue-500 pb-2">
                Project Documents
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Documents/Drawings Availability (Please select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {documentOptions.map((document) => (
                    <div key={document} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`doc-${document.replace(/\s+/g, '-')}`}
                        checked={questionnaireForm.documents_availability.includes(document)}
                        onChange={(e) => handleDocumentAvailabilityChange(document, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <Label htmlFor={`doc-${document.replace(/\s+/g, '-')}`} className="text-sm text-gray-700">{document}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* REMARKS FROM CLIENT Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-blue-500 pb-2">
                Remarks from Client
              </h3>
              
              <div>
                <Textarea
                  value={questionnaireForm.client_remarks}
                  onChange={(e) => setQuestionnaireForm(prev => ({ ...prev, client_remarks: e.target.value }))}
                  placeholder="Enter client remarks"
                  rows={6}
                  className="mt-1 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

              </>
            ) : (
              <>
                {/* AI INSIGHTS VIEW */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                      <Brain className="h-8 w-8 mr-3 text-blue-600" />
                      AI Insights
                    </h3>
                    <p className="text-gray-600">AI-generated insights for this inquiry</p>
                  </div>

                  {/* Clarification Points */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                      Clarification Points
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      {questionnaireForm.clarification_points && questionnaireForm.clarification_points.length > 0 ? (
                        <ul className="space-y-2">
                          {questionnaireForm.clarification_points.map((point, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-600 mt-1">•</span>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No clarification points available</p>
                      )}
                    </div>
                  </div>

                  {/* Conversation Points */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                      Conversation Points
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      {questionnaireForm.conversation_points && questionnaireForm.conversation_points.length > 0 ? (
                        <ul className="space-y-2">
                          {questionnaireForm.conversation_points.map((point, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-600 mt-1">•</span>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No conversation points available</p>
                      )}
                    </div>
                  </div>

                  {/* Assumptions */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Assumptions
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      {questionnaireForm.assumptions && questionnaireForm.assumptions.length > 0 ? (
                        <ul className="space-y-2">
                          {questionnaireForm.assumptions.map((assumption, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span className="text-gray-700">{assumption}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No assumptions available</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              {!isAIInsightsView && (
                <Button
                  variant="outline"
                  onClick={downloadQuestionnairePDF}
                  className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400 transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionnaireModal(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={saveQuestionnaireData}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isAIInsightsView ? 'Save AI Insights' : 'Save Questionnaire'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalMaker;
