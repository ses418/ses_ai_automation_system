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
  ses_clients?: {
    client_id: string;
    client_name: string;
    website: string | null;
    headquarters: string | null;
    client_overview: string | null;
    business_size: string | null;
    annual_revenue: string | null;
    products: string[] | null;
    type_of_client: string | null;
    engagement_advise_ses: string | null;
    no_of_projects_done: number | null;
    no_of_projects_in_pipeline: number | null;
    role_of_client: string | null;
  };
  ses_lead_master?: {
    lead_id: string;
    full_name: string;
    email: string | null;
    mobile: string | null;
    linkedin: string | null;
    designation: string | null;
    seniority: string | null;
    lead_type: string | null;
    lead_source: string | null;
  };
}

interface SesPotentialProject {
  article_id: string;
  raw_article_id: string;
  article_link: string;
  article_date: string | null;
  type_of_article: 'CP' | 'PP' | 'RD' | null;
  segment_id: string | null;
  validation_score: number | null;
  insights_summary: string | null;
  pp_scope: string | null;
  pp_stage: string | null;
  rd_focus_area: string | null;
  rd_type: string | null;
  rd_keywords: string[] | null;
  location: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  client_id: string | null;
  additional_info: string | null;
  tech_stack: string[] | null;
  pain_point_tag: string | null;
  news_mentioned: string[] | null;
  recent_announcement: string | null;
  mail_snippet: string | null;
  deep_research_info: string | null;
  deep_research_status: 'done' | 'pending' | null;
  newsletter_check: boolean | null;
  newsletter_id: string | null;
  drop_reason: string | null;
  drop_check: boolean | null;
  processed_deep_lead: boolean | null;
  created_at: string | null;
  ses_clients?: {
    client_id: string;
    client_name: string;
    website: string | null;
    headquarters: string | null;
    client_overview: string | null;
    business_size: string | null;
    annual_revenue: string | null;
    products: string[] | null;
    type_of_client: string | null;
    engagement_advise_ses: string | null;
    no_of_projects_done: number | null;
    no_of_projects_in_pipeline: number | null;
    role_of_client: string | null;
  };
  ses_lead_master?: {
    lead_id: string;
    full_name: string;
    email: string | null;
    mobile: string | null;
    linkedin: string | null;
    designation: string | null;
    seniority: string | null;
    lead_type: string | null;
    lead_source: string | null;
  };
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
      
      // First fetch all articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('ses_potential_project')
        .select('*')
        .order('article_date', { ascending: false });

      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive"
        });
        return;
      }

      // Then fetch client and lead data for articles that have client_id
      const articlesWithClientId = articlesData?.filter(article => article.client_id) || [];
      
      if (articlesWithClientId.length > 0) {
        const clientIds = [...new Set(articlesWithClientId.map(article => article.client_id))];
        
        // Fetch client data
        const { data: clientsData, error: clientsError } = await supabase
          .from('ses_clients')
          .select('*')
          .in('client_id', clientIds);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        }

        // Fetch lead data
        const { data: leadsData, error: leadsError } = await supabase
          .from('ses_lead_master')
          .select('*')
          .in('client_id', clientIds);

        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        }

        // Combine the data
        const enrichedArticles = articlesData?.map(article => {
          const client = clientsData?.find(c => c.client_id === article.client_id);
          const leads = leadsData?.filter(l => l.client_id === article.client_id);
          
          return {
            ...article,
            ses_clients: client || null,
            ses_lead_master: leads && leads.length > 0 ? leads[0] : null // Take first lead for now
          };
        }) || [];

        console.log('Articles loaded with enriched data:', enrichedArticles);
        console.log('Sample article with client data:', enrichedArticles.find(a => a.client_id));
        console.log('Sample article with lead data:', enrichedArticles.find(a => a.ses_lead_master));
        setArticles(enrichedArticles);
      } else {
        console.log('No articles with client_id found');
        setArticles(articlesData || []);
      }
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
      // Find the article with this client_id to get the joined client data
      const article = articles.find(art => art.client_id === clientId);
      
      if (!article || !article.ses_clients) {
        toast({
          title: "Warning",
          description: "No client data found for this article",
          variant: "destructive"
        });
        return;
      }

      setModalState({
        isOpen: true,
        type: 'client',
        data: article.ses_clients
      });
    } catch (error) {
      console.error('Error opening client modal:', error);
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
      // Find all articles with this client_id to get all related leads
      const articlesWithClient = articles.filter(art => art.client_id === clientId);
      const allLeads = articlesWithClient
        .map(article => article.ses_lead_master)
        .filter(lead => lead !== null && lead !== undefined);
      
      if (allLeads.length === 0) {
        toast({
          title: "Info",
          description: "No leads found for this client",
        });
        return;
      }

      setModalState({
        isOpen: true,
        type: 'leads',
        data: { leads: allLeads, clientId }
      });
    } catch (error) {
      console.error('Error opening leads modal:', error);
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
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            Manage and analyze articles with project details, client information, and lead data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Article ID</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[200px]">Project Scope</TableHead>
                  <TableHead className="w-[200px]">Insights Summary</TableHead>
                  <TableHead className="w-[150px]">Location</TableHead>
                  <TableHead className="w-[120px]">Project Details</TableHead>
                  <TableHead className="w-[120px]">Client Details</TableHead>
                  <TableHead className="w-[100px]">Leads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.article_id}>
                    {/* Column 1: Article ID */}
                    <TableCell className="font-mono text-sm">
                      {article.article_id}
                    </TableCell>
                    
                    {/* Column 2: Type of Article */}
                    <TableCell>
                      <Badge variant={article.type_of_article === 'PP' ? 'default' : article.type_of_article === 'CP' ? 'secondary' : 'outline'}>
                        {article.type_of_article || 'N/A'}
                      </Badge>
                    </TableCell>
                    
                    {/* Column 3: Project Scope (Truncated) */}
                    <TableCell>
                      <div className="max-w-[180px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {article.pp_scope ? 
                            article.pp_scope.split(' ').slice(0, 3).join(' ') + (article.pp_scope.split(' ').length > 3 ? '...' : '')
                            : 'No scope available'
                          }
                        </p>
                        {article.pp_scope && article.pp_scope.split(' ').length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => openTextModal('Project Scope', article.pp_scope || '')}
                          >
                            Click to expand
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Column 4: Insights Summary (Truncated) */}
                    <TableCell>
                      <div className="max-w-[180px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {article.insights_summary ? 
                            article.insights_summary.split(' ').slice(0, 3).join(' ') + (article.insights_summary.split(' ').length > 3 ? '...' : '')
                            : 'No insights available'
                          }
                        </p>
                        {article.insights_summary && article.insights_summary.split(' ').length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => openTextModal('Insights Summary', article.insights_summary || '')}
                          >
                            Click to expand
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Column 5: Location (Dropdown) */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">
                          {article.country || 'N/A'}
                        </span>
                        {article.state && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-sm">{article.state}</span>
                          </>
                        )}
                        {article.city && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-sm">{article.city}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Column 6: Project Details Button */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectModal(article.article_id)}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Project Details
                      </Button>
                    </TableCell>
                    
                    {/* Column 7: Client Details Button */}
                    <TableCell>
                      {article.client_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openClientModal(article.client_id || '')}
                          className="w-full"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Client Details
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No client</span>
                      )}
                    </TableCell>
                    
                    {/* Column 8: Leads Button */}
                    <TableCell>
                      {article.client_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLeadsModal(article.client_id || '')}
                          className="w-full"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Leads
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No client</span>
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
                Detailed information about the potential project from ses_potential_project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Article ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {modalState.data?.article_id || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type of Article</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.type_of_article || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Article Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.article_date ? new Date(modalState.data.article_date).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.location || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">City</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.city || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">State</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.state || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.country || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {modalState.data?.client_id || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Validation Score</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.validation_score !== null ? modalState.data.validation_score : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">PP Stage</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.pp_stage || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">RD Focus Area</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.rd_focus_area || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Deep Research Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.deep_research_status || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Newsletter Check</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.newsletter_check !== null ? (modalState.data.newsletter_check ? 'Yes' : 'No') : 'Not available'}
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

              {/* Show PP Scope if available */}
              {modalState.data?.pp_scope && (
                <div>
                  <Label className="text-sm font-medium">Project Scope</Label>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-gray-50 rounded-lg">
                    {modalState.data.pp_scope}
                  </p>
                </div>
              )}

              {/* Show Insights Summary if available */}
              {modalState.data?.insights_summary && (
                <div>
                  <Label className="text-sm font-medium">Insights Summary</Label>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-gray-50 rounded-lg">
                    {modalState.data.insights_summary}
                  </p>
                </div>
              )}

              {/* Show Recent Announcement if available */}
              {modalState.data?.recent_announcement && (
                <div>
                  <Label className="text-sm font-medium">Recent Announcement</Label>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-gray-50 rounded-lg">
                    {modalState.data.recent_announcement}
                  </p>
                </div>
              )}

              {/* Show Deep Research Info if available */}
              {modalState.data?.deep_research_info && (
                <div>
                  <Label className="text-sm font-medium">Deep Research Info</Label>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-gray-50 rounded-lg">
                    {modalState.data.deep_research_info}
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
                    {modalState.data?.client_id || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.client_name || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.website ? (
                      <a href={modalState.data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {modalState.data.website}
                      </a>
                    ) : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Headquarters</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.headquarters || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Size</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.business_size || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Annual Revenue</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.annual_revenue || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.type_of_client || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Engagement Advice SES</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.engagement_advise_ses || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects Done</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.no_of_projects_done !== null ? modalState.data.no_of_projects_done : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects in Pipeline</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.no_of_projects_in_pipeline !== null ? modalState.data.no_of_projects_in_pipeline : 'Not available'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.role_of_client || 'Not available'}
                  </p>
                </div>
              </div>

              {/* Show Client Overview if available */}
              {modalState.data?.client_overview && (
                <div>
                  <Label className="text-sm font-medium">Client Overview</Label>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-gray-50 rounded-lg">
                    {modalState.data.client_overview}
                  </p>
                </div>
              )}

              {/* Show Products if available */}
              {modalState.data?.products && (
                <div>
                  <Label className="text-sm font-medium">Products</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {Array.isArray(modalState.data.products) ? (
                      <div className="flex flex-wrap gap-2">
                        {modalState.data.products.map((product, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{modalState.data.products}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Leads Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => openLeadsModal(modalState.data?.client_id || '')}
                  className="w-full"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Leads ({modalState.data?.client_id ? 'Available' : 'No Client ID'})
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
                              {lead.full_name && lead.full_name.trim() ? lead.full_name : 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.email || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Mobile</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.mobile || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">LinkedIn</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.linkedin ? (
                                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              ) : 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Designation</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.designation || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Seniority</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.seniority || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Type</Label>
                            <p className="text-sm text-muted-foreground">
                              <Badge variant={lead.lead_type === 'cold' ? 'secondary' : 'default'}>
                                {lead.lead_type || 'Not available'}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Source</Label>
                            <p className="text-sm text-muted-foreground">
                              {lead.lead_source || 'Not available'}
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