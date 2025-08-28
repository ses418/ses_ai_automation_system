import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  ChevronDown,
  ExternalLink,
  FileText,
  Target,
  UserCheck
} from 'lucide-react';
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
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Data interfaces
interface Article {
  article_id: string;
  type_of_article: string;
  pp_scope?: string;
  insights_summary?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  article_date?: string;
  client_id?: string;
}

interface SesPotentialProject {
  article_id: string;
  validation_score?: string;
  rd_focus_area?: string;
  deep_researchinfo?: string;
  resent_announcement?: string;
  pp_stage?: string;
  article_date?: string;
  deep_research_status?: string;
  newsletter_check?: boolean;
  news_mentioned?: string;
}

interface SesClient {
  client_id: string;
  client_name: string;
  website?: string;
  headquarters?: string;
  client_overview?: string;
  business_size?: string;
  annual_revenue?: string;
  products?: string;
  type_of_client?: string;
  engagement_advise_ses?: string;
  no_of_projects_done?: number;
  no_of_projects_in_pipeline?: number;
  role_of_client?: string;
}

interface SesLeadMaster {
  lead_id: string;
  full_name?: string;
  email?: string;
  mobile?: string;
  linkedin?: string;
  designation?: string;
  seniority?: string;
  lead_type?: string;
  lead_source?: string;
  client_id?: string;
}

interface ModalState {
  isOpen: boolean;
  type: 'project' | 'client' | 'leads' | 'text' | null;
  data: any;
  title?: string;
  content?: string;
}

export default function Articles() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    data: null
  });

  // Load articles data
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch articles from ses_potential_project table
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
      data: null,
      title,
      content
    });
  };

  // Open project details modal
  const openProjectModal = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('ses_potential_project')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive"
        });
        return;
      }

      setModalState({
        isOpen: true,
        type: 'project',
        data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive"
      });
    }
  };

  // Open client details modal
  const openClientModal = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('ses_clients')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load client details",
          variant: "destructive"
        });
        return;
      }

      setModalState({
        isOpen: true,
        type: 'client',
        data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive"
      });
    }
  };

  // Open leads modal
  const openLeadsModal = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('ses_lead_master')
        .select('*')
        .eq('client_id', clientId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load leads",
          variant: "destructive"
        });
        return;
      }

      setModalState({
        isOpen: true,
        type: 'leads',
        data: { leads: data || [], clientId }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive"
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: null
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
    const locationParts = [article.city, article.state, article.country].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(' → ') : 'null';
  };

  // Filter articles
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

      {/* Database Connection Test - Temporary for debugging */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Database Connection Test</CardTitle>
          <CardDescription className="text-blue-600">
            Testing connection to verify data access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={loadArticles} 
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Test Database Connection
              </Button>
              <div className="text-sm text-blue-700">
                <strong>Articles Loaded:</strong> {articles.length} | 
                <strong> Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
            </div>
            
            {articles.length > 0 && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ Database connection successful! Found {articles.length} articles.
                </p>
                <p className="text-green-700 text-xs mt-1">
                  First article ID: {articles[0]?.article_id}
                </p>
              </div>
            )}
            
            {articles.length === 0 && !loading && (
              <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No articles found. This might indicate a connection issue.
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Check browser console for error messages.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Search through articles and filter by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
          <CardTitle>Articles Overview</CardTitle>
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
                    <TableCell className="font-mono text-sm">
                      {article.article_id}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">
                        {article.type_of_article || 'null'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => openTextModal('Project Scope', article.pp_scope || 'null')}
                      >
                        {truncateText(article.pp_scope || 'null')}
                        <Eye className="inline h-3 w-3 ml-1 text-muted-foreground" />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => openTextModal('Insights Summary', article.insights_summary || 'null')}
                      >
                        {truncateText(article.insights_summary || 'null')}
                        <Eye className="inline h-3 w-3 ml-1 text-muted-foreground" />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{getLocationDisplay(article)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectModal(article.article_id)}
                        className="flex items-center space-x-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Project Details</span>
                      </Button>
                    </TableCell>
                    
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
                <Target className="h-5 w-5" />
                <span>Project Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information about the project from ses_potential_project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Article ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {modalState.data?.article_id || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Validation Score</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.validation_score || 'null'}
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
                    {modalState.data?.deep_researchinfo || 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recent Announcement</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.resent_announcement || 'null'}
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
                  <p className="text-sm text-blue-600 mt-2">
                    {modalState.data?.news_mentioned || 'No additional news details available'}
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
                Detailed information about the client from ses_clients
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {modalState.data?.client_id || 'null'}
                  </p>
                </div>
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
                <Button 
                  onClick={() => openLeadsModal(modalState.data?.client_id)}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>View Leads</span>
                </Button>
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
              {modalState.data?.leads?.length > 0 ? (
                <div className="space-y-4">
                  {modalState.data.leads.map((lead: SesLeadMaster) => (
                    <Card key={lead.lead_id}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.full_name || 'null'}
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
                              {lead.linkedin || 'null'}
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
                              {lead.lead_type || 'null'}
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
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads found for this client</p>
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