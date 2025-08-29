import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_CONFIG } from '@/config';
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
    
    // Check authentication status
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('=== AUTHENTICATION STATUS ===');
      console.log('User:', user);
      console.log('Error:', error);
      console.log('=============================');
    };
    
    checkAuth();
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

      // Fetch client data from ses_clients table
      console.log('Fetching client data from ses_clients...');
      console.log('Query: SELECT * FROM ses_clients WHERE client_id =', clientId);
      
      const { data, error } = await supabase
        .from('ses_clients')
        .select('*')
        .eq('client_id', clientId);

      console.log('Client data response:', { data, error, count: data?.length });
      console.log('Raw data object:', JSON.stringify(data, null, 2));
      console.log('Error details:', JSON.stringify(error, null, 2));
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length);
      console.log('Data keys:', data ? Object.keys(data) : 'No data');

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: `Failed to load client details: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Always show modal, even if no record exists - create empty data structure
      let clientData;
      
      if (!data || data.length === 0) {
        console.log('No client record found for client_id:', clientId, '- showing empty modal');
        // Create empty client data structure with client_id
        clientData = {
          client_id: clientId,
          client_name: 'null',
          website: 'null',
          headquarters: 'null',
          business_size: 'null',
          annual_revenue: 'null',
          products: 'null',
          type_of_client: 'null',
          engagement_advise_ses: 'null', // User's expected field name
          no_of_projects_done: 'null',
          no_of_projects_in_pipeline: 'null',
          role_of_client: 'null',
          client_overview: 'null'
        };
      } else {
        // If multiple rows, take the first one
        const rawData = Array.isArray(data) ? data[0] : data;
        
        console.log('Raw database data:', rawData);
        console.log('Raw engagement_advice_ses:', rawData.engagement_advice_ses);
        console.log('Raw client_name:', rawData.client_name);
        console.log('Raw business_size:', rawData.business_size);
        console.log('Raw type_of_client:', rawData.type_of_client);
        console.log('Raw client_overview:', rawData.client_overview);
        
        // Map database fields to user's expected field names
        clientData = {
          client_id: rawData.client_id,
          client_name: rawData.client_name || 'null',
          website: rawData.website || 'null',
          headquarters: rawData.headquarters || 'null',
          business_size: rawData.business_size || 'null',
          annual_revenue: rawData.annual_revenue || 'null',
          products: rawData.products || 'null',
          type_of_client: rawData.type_of_client || 'null',
          engagement_advise_ses: rawData.engagement_advice_ses || 'null', // Map from database field to user's expected field
          no_of_projects_done: rawData.no_of_projects_done || 'null',
          no_of_projects_in_pipeline: rawData.no_of_projects_in_pipeline || 'null',
          role_of_client: rawData.role_of_client || 'null',
          client_overview: rawData.client_overview || 'null'
        };
        
        console.log('Mapped client data:', clientData);
        console.log('Mapped engagement_advise_ses:', clientData.engagement_advise_ses);
        console.log('Final client_name:', clientData.client_name);
        console.log('Final business_size:', clientData.business_size);
        console.log('Final type_of_client:', clientData.type_of_client);
        console.log('Final client_overview:', clientData.client_overview);
      }

      console.log('Client fields summary:', {
        client_name: clientData.client_name,
        website: clientData.website,
        headquarters: clientData.headquarters,
        business_size: clientData.business_size,
        annual_revenue: clientData.annual_revenue,
        client_overview: clientData.client_overview,
        type_of_client: clientData.type_of_client,
        engagement_advise_ses: clientData.engagement_advise_ses,
        no_of_projects_done: clientData.no_of_projects_done,
        no_of_projects_in_pipeline: clientData.no_of_projects_in_pipeline
      });

      // Always open the modal
      console.log('Opening client modal with data:', clientData);
      console.log('Final modal state data:', {
        client_name: clientData.client_name,
        client_overview: clientData.client_overview,
        business_size: clientData.business_size,
        type_of_client: clientData.type_of_client,
        no_of_projects_done: clientData.no_of_projects_done,
        no_of_projects_in_pipeline: clientData.no_of_projects_in_pipeline
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
      
      // Fetch leads data from ses_lead_master table
      console.log('Fetching leads data from ses_lead_master...');
      console.log('Query: SELECT * FROM ses_lead_master WHERE client_id =', clientId);
      
      const { data, error } = await supabase
        .from('ses_lead_master')
        .select('*')
        .eq('client_id', clientId);

      console.log('Leads data response:', { data, error, count: data?.length || 0 });
      console.log('Raw leads data object:', JSON.stringify(data, null, 2));
      console.log('Leads error details:', JSON.stringify(error, null, 2));
      console.log('Leads data type:', typeof data);
      console.log('Leads is array:', Array.isArray(data));
      console.log('Leads data length:', data?.length);
      console.log('Leads data keys:', data ? Object.keys(data) : 'No data');

        if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: `Failed to load leads: ${error.message}`,
          variant: "destructive"
        });
            return;
          }
          
      // Always show the modal, regardless of data found
      console.log('Leads query completed. Records found:', data?.length || 0);

      if (data && data.length > 0) {
        console.log('All leads data:', data);
        console.log('Leads summary:', data.map(lead => ({
          lead_id: lead.lead_id,
          full_name: lead.full_name,
          email: lead.email,
          designation: lead.designation,
          lead_type: lead.lead_type,
          lead_source: lead.lead_source,
          mobile: lead.mobile,
          linkedin: lead.linkedin,
          seniority: lead.seniority
        })));
        
        console.log(`Found ${data.length} lead(s) for client_id: ${clientId}`);
        
        // Log individual lead details for debugging
        data.forEach((lead, index) => {
          console.log(`Lead ${index + 1}:`, {
            lead_id: lead.lead_id,
            full_name: lead.full_name,
            email: lead.email,
            designation: lead.designation,
            lead_type: lead.lead_type,
            lead_source: lead.lead_source,
            mobile: lead.mobile,
            linkedin: lead.linkedin,
            seniority: lead.seniority
          });
        });
      } else {
        console.log(`No leads found for client_id: ${clientId} - showing empty leads modal`);
      }

      // Always open the modal to show leads (or empty state)
      console.log('Opening leads modal with data:', { leads: data || [], clientId });
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
  // Helper function to display null values properly
  const displayValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    // Handle empty strings and whitespace-only strings
    if (typeof value === 'string' && value.trim() === '') {
      return 'null';
    }
    // Don't treat string "null" as null - display it as is
    return String(value);
  };

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
                          <Button 
                variant="outline"
                onClick={async () => {
                  console.log('=== MANUAL DATABASE TEST ===');
                  try {
                    // Test 1: Simple count query for ses_clients
                    console.log('Testing ses_clients count query...');
                    const clientsCountResult = await supabase
                      .from('ses_clients')
                      .select('*', { count: 'exact', head: true });
                    console.log('ses_clients count test result:', clientsCountResult);

                    // Test 2: Select specific client from ses_clients
                    console.log('Testing specific client query from ses_clients...');
                    const clientResult = await supabase
                      .from('ses_clients')
                      .select('*')
                      .eq('client_id', '6a7c85c4-820c-4cf1-8b3e-bd0e22ea1218');
                    console.log('Specific client test result:', clientResult);

                    // Test 3: Select leads from ses_lead_master
                    console.log('Testing leads query from ses_lead_master...');
                    const leadsResult = await supabase
                      .from('ses_lead_master')
                      .select('*')
                      .eq('client_id', '6a7c85c4-820c-4cf1-8b3e-bd0e22ea1218');
                    console.log('Leads test result:', leadsResult);

                    // Test 4: Test article with client_id
                    console.log('Testing article with client_id...');
                    const articleResult = await supabase
                      .from('ses_potential_project')
                      .select('article_id, client_id, type_of_article')
                      .not('client_id', 'is', null)
                      .limit(1);
                    console.log('Article with client_id test result:', articleResult);

                    // Test 5: Test the specific problematic client ID
                    console.log('Testing problematic client ID: 4108a2ff-912c-472f-a005-0f7f1061ad41');
                    const problemClientResult = await supabase
                      .from('ses_clients')
                      .select('*')
                      .eq('client_id', '4108a2ff-912c-472f-a005-0f7f1061ad41');
                    console.log('Problem client test result:', problemClientResult);

                    // Test 6: Test leads for the problematic client ID
                    console.log('Testing leads for problematic client ID...');
                    const problemLeadsResult = await supabase
                      .from('ses_lead_master')
                      .select('*')
                      .eq('client_id', '4108a2ff-912c-472f-a005-0f7f1061ad41');
                    console.log('Problem leads test result:', problemLeadsResult);

                    // Test 7: Test basic table access
                    console.log('Testing basic table access...');
                    const basicClientResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .limit(1);
                    console.log('Basic client access test result:', basicClientResult);

                    // Test 8: Test with different client ID
                    console.log('Testing with different client ID...');
                    const differentClientResult = await supabase
                      .from('ses_clients')
                      .select('*')
                      .eq('client_id', 'a76bc5c6-5e73-48df-9795-503a7a6582da');
                    console.log('Different client test result:', differentClientResult);

                    // Test 9: Test without WHERE clause
                    console.log('Testing without WHERE clause...');
                    const allClientsResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .limit(5);
                    console.log('All clients test result:', allClientsResult);

                    // Test 10: Test UUID format and case sensitivity
                    console.log('Testing UUID format...');
                    const uuidTestResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .ilike('client_id', '%4108a2ff-912c-472f-a005-0f7f1061ad41%');
                    console.log('UUID format test result:', uuidTestResult);

                    // Test 11: Test with text search instead of exact match
                    console.log('Testing with text search...');
                    const textSearchResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .textSearch('client_id', '4108a2ff-912c-472f-a005-0f7f1061ad41');
                    console.log('Text search test result:', textSearchResult);

                    // Test 12: Test simple count query
                    console.log('Testing simple count query...');
                    const simpleCountResult = await supabase
                      .from('ses_clients')
                      .select('*', { count: 'exact', head: true });
                    console.log('Simple count result:', simpleCountResult);

                    // Test 13: Test with different table
                    console.log('Testing different table...');
                    const differentTableResult = await supabase
                      .from('ses_lead_master')
                      .select('lead_id, full_name')
                      .limit(1);
                    console.log('Different table test result:', differentTableResult);

                    // Test 14: Test table existence and structure
                    console.log('Testing table structure...');
                    try {
                      const structureResult = await supabase
                        .rpc('get_table_info', { table_name: 'ses_clients' });
                      console.log('Table structure result:', structureResult);
                    } catch (structureError) {
                      console.log('Table structure error (expected):', structureError);
                    }

                    // Test 15: Test with raw SQL (if possible)
                    console.log('Testing raw SQL approach...');
                    try {
                      const rawSqlResult = await supabase
                        .rpc('exec_sql', { sql: 'SELECT client_id, client_name FROM ses_clients LIMIT 1' });
                      console.log('Raw SQL result:', rawSqlResult);
                    } catch (rawSqlError) {
                      console.log('Raw SQL error (expected):', rawSqlError);
                    }

                    // Test 16: Test client ID format variations
                    console.log('Testing client ID format variations...');
                    const clientIdVariations = [
                      '4108a2ff-912c-472f-a005-0f7f1061ad41',
                      '4108A2FF-912C-472F-A005-0F7F1061AD41',
                      '4108a2ff912c472fa0050f7f1061ad41',
                      '4108a2ff-912c-472f-a005-0f7f1061ad41'
                    ];

                    for (let i = 0; i < clientIdVariations.length; i++) {
                      const variation = clientIdVariations[i];
                      console.log(`Testing variation ${i + 1}: ${variation}`);
                      const variationResult = await supabase
                        .from('ses_clients')
                        .select('client_id, client_name')
                        .eq('client_id', variation);
                      console.log(`Variation ${i + 1} result:`, variationResult);
                    }

                    // Test 17: Test Supabase client configuration
                    console.log('=== SUPABASE CLIENT CONFIGURATION TEST ===');
                    console.log('Supabase client type:', typeof supabase);
                    console.log('Supabase client methods:', Object.getOwnPropertyNames(supabase));
                    console.log('Current auth user:', await supabase.auth.getUser());
                    console.log('===========================================');

                    // Test 18: Test with different approach - no filters
                    console.log('Testing with no filters...');
                    const noFilterResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .limit(1);
                    console.log('No filter result:', noFilterResult);

                    // Test 19: Test with simple text search
                    console.log('Testing with text search...');
                    const textSearchResult2 = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .ilike('client_name', '%India%');
                    console.log('Text search result:', textSearchResult2);

                    // Test 20: Test with completely different table
                    console.log('Testing with different table...');
                    const differentTableResult2 = await supabase
                      .from('ses_potential_project')
                      .select('article_id, type_of_article')
                      .limit(1);
                    console.log('Different table result:', differentTableResult2);

                    // Test 21: Test with simple count
                    console.log('Testing simple count...');
                    const countResult2 = await supabase
                      .from('ses_clients')
                      .select('*', { count: 'exact', head: true });
                    console.log('Count result:', countResult2);

                    // Test 22: Verify Supabase project connection
                    console.log('=== VERIFYING SUPABASE PROJECT ===');
                    console.log('Config URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
                    console.log('Config Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
                    console.log('Fallback URL:', SUPABASE_CONFIG.url);
                    console.log('Fallback Key exists:', !!SUPABASE_CONFIG.anonKey);
                    console.log('=====================================');

                    // Test 23: Test with a known working client ID
                    console.log('Testing with known working client ID...');
                    const workingClientResult = await supabase
                      .from('ses_clients')
                      .select('client_id, client_name')
                      .eq('client_id', 'a76bc5c6-5e73-48df-9795-503a7a6582da');
                    console.log('Working client result:', workingClientResult);

                    toast({
                      title: "Database Test Complete",
                      description: "Check console for detailed results",
                    });
                  } catch (error) {
                    console.error('Database test error:', error);
                    toast({
                      title: "Database Test Failed",
                      description: "Check console for error details",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Filter className="h-4 w-2 mr-2" />
                Test DB
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  // Test opening client modal manually
                  openClientModal('6a7c85c4-820c-4cf1-8b3e-bd0e22ea1218');
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Test Client Modal
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  // Test opening leads modal manually
                  openLeadsModal('6a7c85c4-820c-4cf1-8b3e-bd0e22ea1218');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Test Leads Modal
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  // Test the problematic client ID from the screenshot
                  openClientModal('4108a2ff-912c-472f-a005-0f7f1061ad41');
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Test Problem Client
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  // Test the problematic client ID from the screenshot
                  openLeadsModal('4108a2ff-912c-472f-a005-0f7f1061ad41');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Test Problem Leads
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
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-yellow-100 text-xs">
                Debug: Modal data = {JSON.stringify(modalState.data, null, 2)}
              </div>
            )}
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.client_name)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data?.website ? (
                      <a href={modalState.data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {modalState.data.website}
                      </a>
                    ) : 'null'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Headquarters</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.headquarters)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Size</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.business_size)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Annual Revenue</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.annual_revenue)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Products</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.products)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.type_of_client)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Engagement Advise SES</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.engagement_advise_ses)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects Done</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.no_of_projects_done)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Projects in Pipeline</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.no_of_projects_in_pipeline)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role of Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(modalState.data?.role_of_client)}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Client Overview</Label>
                <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                  {displayValue(modalState.data?.client_overview)}
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
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-yellow-100 text-xs">
                Debug: Leads data = {JSON.stringify(modalState.data, null, 2)}
              </div>
            )}
            
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
                              {displayValue(lead.full_name)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-muted-foreground">
                              {displayValue(lead.email)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Mobile</Label>
                            <p className="text-sm text-muted-foreground">
                              {displayValue(lead.mobile)}
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
                              {displayValue(lead.designation)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Seniority</Label>
                            <p className="text-sm text-muted-foreground">
                              {displayValue(lead.seniority)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Type</Label>
                            <p className="text-sm text-muted-foreground">
                              <Badge variant={lead.lead_type === 'cold' ? 'secondary' : 'default'}>
                                {displayValue(lead.lead_type)}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lead Source</Label>
                            <p className="text-sm text-muted-foreground">
                              {displayValue(lead.lead_source)}
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