import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Building2, 
  Users, 
  Eye, 
  Filter,
  MapPin 
} from 'lucide-react';

// Data interfaces
interface Article {
  article_id: string;
  raw_article_id?: string;
  type_of_article?: string;
  pp_scope?: string;
  insights_summary?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  client_id?: string;
  validation_score?: number;
  rd_focus_area?: string;
  deep_research_info?: string;
  recent_announcement?: string;
  pp_stage?: string;
  article_date?: string;
  deep_research_status?: string;
  newsletter_check?: boolean;
  news_mentioned?: string[] | string;
}

interface Client {
  client_id: string;
  client_name?: string;
  website?: string;
  headquarters?: string;
  client_overview?: string;
  business_size?: string;
  annual_revenue?: string;
  products?: string[] | string;
  type_of_client?: string;
  engagement_advise_ses?: string;
  no_of_projects_done?: number;
  no_of_projects_in_pipeline?: number;
  role_of_client?: string;
}

interface Lead {
  lead_id: string;
  full_name?: string;
  email?: string;
  mobile?: string;
  linkedin?: string;
  designation?: string;
  seniority?: string;
  lead_type?: string;
  lead_source?: string;
}

type ModalType = 'text' | 'project' | 'client' | 'leads';

interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  title?: string;
  content?: string;
  data?: any;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null
  });
  
  const { toast } = useToast();

  // Load articles on component mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Load articles from database
  const loadArticles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ses_potential_project')
        .select('*')
        .order('article_date', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive"
        });
        return;
      }
      
      setArticles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open text modal for truncated content
  const openTextModal = (title: string, content: string) => {
    setModalState({
      isOpen: true,
      type: 'text',
      title,
      content
    });
  };

  // Open project details modal
  const openProjectModal = async (article: Article) => {
    setModalState({
      isOpen: true,
      type: 'project',
      data: article
    });
  };

  // Open client details modal
  const openClientModal = async (clientId: string) => {
    try {
      console.log('=== CLIENT MODAL DEBUG START ===');
      console.log('Loading client details for client_id:', clientId);
      console.log('Client ID type:', typeof clientId);
      console.log('Client ID length:', clientId?.length);
      
      if (!clientId) {
        console.error('No client_id provided!');
        toast({
          title: "Error",
          description: "No client ID provided",
          variant: "destructive"
        });
        return;
      }
      
      // First try without .single() to see what we get
      const { data, error } = await supabase
        .from('ses_clients')
        .select('*')
        .eq('client_id', clientId);

      console.log('Client data response:', { data, error, count: data?.length });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: `Failed to load client details: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log('No client data found for client_id:', clientId);
        toast({
          title: "Warning",
          description: "No client data found for this ID",
          variant: "destructive"
        });
        return;
      }

      // If multiple rows, take the first one
      const clientData = Array.isArray(data) ? data[0] : data;
      console.log('Selected client data:', clientData);
      console.log('Client fields summary:', {
        client_name: clientData.client_name,
        website: clientData.website,
        headquarters: clientData.headquarters,
        business_size: clientData.business_size,
        annual_revenue: clientData.annual_revenue,
        client_overview: clientData.client_overview ? clientData.client_overview.substring(0, 100) + '...' : null
      });

      // Show success message
      toast({
        title: "Success",
        description: `Loaded client: ${clientData.client_name || 'Unknown Client'}`,
      });

      setModalState({
        isOpen: true,
        type: 'client',
        data: clientData
      });
    } catch (error: any) {
      console.error('Error loading client details:', error);
      toast({
        title: "Error",
        description: `Failed to load client details: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Open leads modal
  const openLeadsModal = async (clientId: string) => {
    try {
      console.log('=== LEADS MODAL DEBUG START ===');
      console.log('Loading leads for client_id:', clientId);
      console.log('Client ID type:', typeof clientId);
      console.log('Client ID length:', clientId?.length);
      
      if (!clientId) {
        console.error('No client_id provided for leads!');
        toast({
          title: "Error",
          description: "No client ID provided for leads",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('ses_lead_master')
        .select('*')
        .eq('client_id', clientId);

      console.log('Leads data response:', { data, error, count: data?.length || 0 });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: `Failed to load leads: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Always show the modal, even if data is empty or has null fields
      console.log('Leads query completed. Records found:', data?.length || 0);

      if (data && data.length > 0) {
        console.log('All leads data:', data);
        console.log('Leads summary:', data.map(lead => ({
          lead_id: lead.lead_id,
          full_name: lead.full_name ? `"${lead.full_name}"` : 'null',
          email: lead.email || 'null',
          designation: lead.designation || 'null',
          lead_type: lead.lead_type || 'null',
          lead_source: lead.lead_source || 'null'
        })));
        
        // Show success message
        toast({
          title: "Success",
          description: `Found ${data.length} lead(s) for this client`,
        });
      } else {
        toast({
          title: "Info",
          description: "No leads found for this client",
        });
      }

      setModalState({
        isOpen: true,
        type: 'leads',
        data: { leads: data || [], clientId }
      });
    } catch (error: any) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error",
        description: `Failed to load leads: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null
    });
  };

  // Truncate text to 2-3 words
  const truncateText = (text: string, maxWords: number = 3) => {
    if (!text) return 'null';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Get location display
  const getLocationDisplay = (article: Article) => {
    const parts = [];
    if (article.country) parts.push(article.country);
    if (article.state) parts.push(article.state);
    if (article.city) parts.push(article.city);
    return parts.length > 0 ? parts.join(' → ') : 'null';
  };

  // Filter articles based on search
  const filteredArticles = articles.filter(article =>
    article.article_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.type_of_article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.pp_scope?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.insights_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Articles Management</h1>
        <p className="text-muted-foreground">
          Manage and analyze articles with project details, client information, and lead data
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Search through articles and apply filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            Total Articles: {filteredArticles.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>PP Scope</TableHead>
                  <TableHead>Insights Summary</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Project Details</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Leads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.article_id} className="hover:bg-muted/50">
                    {/* Column 1: Article ID */}
                    <TableCell className="font-mono text-sm">
                      {article.article_id}
                    </TableCell>
                    
                    {/* Column 2: Type of Article */}
                    <TableCell>
                      <Badge variant="secondary">
                        {article.type_of_article || 'null'}
                      </Badge>
                    </TableCell>
                    
                    {/* Column 3: PP Scope (Truncated) */}
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => openTextModal('Project Scope', article.pp_scope || 'null')}
                      >
                        {truncateText(article.pp_scope || 'null')}
                        <Eye className="inline h-3 w-3 ml-1 text-muted-foreground" />
                      </div>
                    </TableCell>
                    
                    {/* Column 4: Insights Summary (Truncated) */}
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => openTextModal('Insights Summary', article.insights_summary || 'null')}
                      >
                        {truncateText(article.insights_summary || 'null')}
                        <Eye className="inline h-3 w-3 ml-1 text-muted-foreground" />
                      </div>
                    </TableCell>
                    
                    {/* Column 5: Location (Dropdown) */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{getLocationDisplay(article)}</span>
                      </div>
                    </TableCell>
                    
                    {/* Column 6: Project Details Button */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectModal(article)}
                        className="flex items-center space-x-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Project Details</span>
                      </Button>
                    </TableCell>
                    
                    {/* Column 7: Client Details Button */}
                    <TableCell>
                      {article.client_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openClientModal(article.client_id!)}
                          className="flex items-center space-x-1"
                        >
                          <Building2 className="h-3 w-3" />
                          <span>Client Details</span>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">No client</span>
                      )}
                    </TableCell>
                    
                    {/* Column 8: Leads Button */}
                    <TableCell>
                      {article.client_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLeadsModal(article.client_id!)}
                          className="flex items-center space-x-1"
                        >
                          <Users className="h-3 w-3" />
                          <span>Leads</span>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">No leads</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Text Modal for truncated content */}
      {modalState.type === 'text' && (
        <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modalState.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {modalState.content}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Project Details Modal */}
      {modalState.type === 'project' && (
        <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information from ses_potential_project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Validation Score</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.validation_score !== null && modalState.data?.validation_score !== undefined ? modalState.data.validation_score : 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">RD Focus Area</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.rd_focus_area || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Deep Research Info</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.deep_research_info || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recent Announcement</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.recent_announcement || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">PP Stage</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.pp_stage || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Article Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.article_date ? 
                      new Date(modalState.data.article_date).toLocaleDateString() : 'null'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Deep Research Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.deep_research_status || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Newsletter Check</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.newsletter_check ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              {/* Show news_mentioned details if validation_score > 1 */}
              {modalState.data?.validation_score && Number(modalState.data.validation_score) > 1 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-700">News Mentioned Details</Label>
                  <div className="text-sm text-blue-600 mt-2">
                    {modalState.data?.news_mentioned ? (
                      Array.isArray(modalState.data.news_mentioned) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {modalState.data.news_mentioned.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{modalState.data.news_mentioned}</p>
                      )
                    ) : (
                      <p>null</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Details Modal */}
      {modalState.type === 'client' && (
        <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Client Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information from ses_clients
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.client_name || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.website || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Headquarters</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.headquarters || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Size</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.business_size || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Annual Revenue</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.annual_revenue || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Products</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.products || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.type_of_client || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Engagement Advice SES</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.engagement_advise_ses || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects Done</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.no_of_projects_done || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects in Pipeline</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.no_of_projects_in_pipeline || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.role_of_client || 'null'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Client Overview</Label>
                <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                  {modalState.data?.client_overview || 'null'}
                </p>
              </div>
              
              <div className="flex justify-center">
                {modalState.data?.client_id ? (
                  <Button 
                    onClick={() => openLeadsModal(modalState.data.client_id)}
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Leads</span>
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>No Client ID Available</span>
                  </Button>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Leads Modal */}
      {modalState.type === 'leads' && (
        <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Leads Information</span>
              </DialogTitle>
              <DialogDescription>
                Lead details from ses_lead_master for this client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {modalState.data?.leads && modalState.data.leads.length > 0 ? (
                <div className="space-y-4">
                  {modalState.data.leads.map((lead: Lead) => (
                    <Card key={lead.lead_id} className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Lead ID</Label>
                            <p className="text-sm text-muted-foreground font-mono">
                              {lead.lead_id || 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.full_name && lead.full_name.trim() ? lead.full_name : 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.email || 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Mobile</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.mobile || 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">LinkedIn</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.linkedin ? (
                                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              ) : 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Designation</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.designation || 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Seniority</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.seniority || 'null'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Type</Label>
                            <p className="text-sm text-muted-foreground">
                              <Badge variant={lead.lead_type === 'cold' ? 'secondary' : 'default'}>
                                {lead.lead_type || 'null'}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Source</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.lead_source || 'null'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads found for this client</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Client ID: {modalState.data?.clientId || 'Unknown'}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}