import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit,
  Trash2,
  Search, 
  Filter,
  Download, 
  RefreshCw,
  Database,
  Hash,
  Globe,
  Building2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  DataManagementService, 
  Segment, 
  Keyword, 
  BaseUrl, 
  TargetCompany,
  CreateSegmentData,
  CreateKeywordData,
  CreateBaseUrlData,
  CreateTargetCompanyData
} from '@/services/dataManagementService';
import DatabaseTest from '@/components/DatabaseTest';

interface DataStatistics {
  segments: number;
  keywords: number;
  baseUrls: number;
  targetCompanies: number;
}

interface SegmentWithCounts extends Segment {
  keywords_count: number;
  base_urls_count: number;
}

export default function DataManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('segments');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  // Data states
  const [segments, setSegments] = useState<SegmentWithCounts[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [baseUrls, setBaseUrls] = useState<BaseUrl[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<TargetCompany[]>([]);
  const [statistics, setStatistics] = useState<DataStatistics>({
    segments: 0,
    keywords: 0,
    baseUrls: 0,
    targetCompanies: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'segment' | 'keyword' | 'baseUrl' | 'company'>('segment');

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [segmentsData, keywordsData, baseUrlsData, companiesData, statsData] = await Promise.all([
        DataManagementService.getSegmentsWithCounts(),
        DataManagementService.getKeywords(),
        DataManagementService.getBaseUrls(),
        DataManagementService.getTargetCompanies(),
        DataManagementService.getDataStatistics()
      ]);

      setSegments(segmentsData);
      setKeywords(keywordsData);
      setBaseUrls(baseUrlsData);
      setTargetCompanies(companiesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      let newItem;
      
      switch (modalType) {
        case 'segment':
          newItem = await DataManagementService.createSegment(formData);
          setSegments(prev => [newItem, ...prev]);
          break;
        case 'keyword':
          newItem = await DataManagementService.createKeyword(formData);
          setKeywords(prev => [newItem, ...prev]);
          break;
        case 'baseUrl':
          newItem = await DataManagementService.createBaseUrl(formData);
          setBaseUrls(prev => [newItem, ...prev]);
          break;
        case 'company':
          newItem = await DataManagementService.createTargetCompany(formData);
          setTargetCompanies(prev => [newItem, ...prev]);
          break;
      }

      toast({
        title: "Success",
        description: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} created successfully!`
      });

      setShowCreateModal(false);
      setFormData({});
      loadData(); // Refresh data to get updated counts
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    try {
      let updatedItem;
      
      switch (modalType) {
        case 'segment':
          updatedItem = await DataManagementService.updateSegment(editingItem.segment_id, formData);
          setSegments(prev => prev.map(item => item.segment_id === editingItem.segment_id ? updatedItem : item));
          break;
        case 'keyword':
          updatedItem = await DataManagementService.updateKeyword(editingItem.keyword_id, formData);
          setKeywords(prev => prev.map(item => item.keyword_id === editingItem.keyword_id ? updatedItem : item));
          break;
        case 'baseUrl':
          updatedItem = await DataManagementService.updateBaseUrl(editingItem.base_url_id, formData);
          setBaseUrls(prev => prev.map(item => item.base_url_id === editingItem.base_url_id ? updatedItem : item));
          break;
        case 'company':
          updatedItem = await DataManagementService.updateTargetCompany(editingItem.company_id, formData);
          setTargetCompanies(prev => prev.map(item => item.company_id === editingItem.company_id ? updatedItem : item));
          break;
      }
    
    toast({
        title: "Success",
        description: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} updated successfully!`
      });

      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
      loadData(); // Refresh data to get updated counts
    } catch (error: any) {
    toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      switch (modalType) {
        case 'segment':
          await DataManagementService.deleteSegment(editingItem.segment_id);
          setSegments(prev => prev.filter(item => item.segment_id !== editingItem.segment_id));
          break;
        case 'keyword':
          await DataManagementService.deleteKeyword(editingItem.keyword_id);
          setKeywords(prev => prev.filter(item => item.keyword_id !== editingItem.keyword_id));
          break;
        case 'baseUrl':
          await DataManagementService.deleteBaseUrl(editingItem.base_url_id);
          setBaseUrls(prev => prev.filter(item => item.base_url_id !== editingItem.base_url_id));
          break;
        case 'company':
          await DataManagementService.deleteTargetCompany(editingItem.company_id);
          setTargetCompanies(prev => prev.filter(item => item.company_id !== editingItem.company_id));
          break;
      }

      toast({
        title: "Success",
        description: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} deleted successfully!`
      });

      setShowDeleteModal(false);
      setEditingItem(null);
      loadData(); // Refresh data to get updated counts
    } catch (error: any) {
    toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const openCreateModal = (type: 'segment' | 'keyword' | 'baseUrl' | 'company') => {
    setModalType(type);
    setFormData({});
    setShowCreateModal(true);
  };

  const openEditModal = (type: 'segment' | 'keyword' | 'baseUrl' | 'company', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({
      segment_name: item.segment_name,
      base_url_gen: item.base_url_gen,
      keyword: item.keyword,
      segment_id: item.segment_id,
      base_url: item.base_url,
      source_name: item.source_name,
      location: item.location,
      valid_status: item.valid_status,
      search_url_status: item.search_url_status,
      company_name: item.company_name
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (type: 'segment' | 'keyword' | 'baseUrl' | 'company', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setShowDeleteModal(true);
  };

  const toggleSegmentExpansion = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId);
    } else {
      newExpanded.add(segmentId);
    }
    setExpandedSegments(newExpanded);
  };

  const getFilteredData = () => {
    let filtered = [];
    
    switch (activeTab) {
      case 'segments':
        filtered = segments.filter(segment => 
          segment.segment_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'keywords':
        filtered = keywords.filter(keyword => 
          keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
          keyword.segment_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'baseUrls':
        filtered = baseUrls.filter(baseUrl => 
          baseUrl.base_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          baseUrl.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          baseUrl.segment_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'companies':
        filtered = targetCompanies.filter(company => 
          company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
    }
    
    return filtered;
  };

  const renderCreateModal = () => (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</DialogTitle>
          <DialogDescription>
            Add a new {modalType} to your data collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {modalType === 'segment' && (
            <>
              <div>
                <Label htmlFor="segment_name">Segment Name</Label>
                <Input
                  id="segment_name"
                  value={formData.segment_name || ''}
                  onChange={(e) => setFormData({ ...formData, segment_name: e.target.value })}
                  placeholder="Enter segment name"
       />
     </div>
              <div>
                <Label htmlFor="base_url_gen">Base URL Generator</Label>
                <Input
                  id="base_url_gen"
                  value={formData.base_url_gen || ''}
                  onChange={(e) => setFormData({ ...formData, base_url_gen: e.target.value })}
                  placeholder="Enter base URL generator"
                />
              </div>
            </>
          )}

          {modalType === 'keyword' && (
            <>
              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  value={formData.keyword || ''}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="Enter keyword"
                />
              </div>
              <div>
                <Label htmlFor="segment_id">Segment</Label>
                <Select
                  value={formData.segment_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map(segment => (
                      <SelectItem key={segment.segment_id} value={segment.segment_id}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {modalType === 'baseUrl' && (
            <>
              <div>
                <Label htmlFor="base_url">Base URL</Label>
                <Input
                  id="base_url"
                  value={formData.base_url || ''}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="Enter base URL"
                />
              </div>
              <div>
                <Label htmlFor="segment_id">Segment</Label>
                <Select
                  value={formData.segment_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map(segment => (
                      <SelectItem key={segment.segment_id} value={segment.segment_id}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source_name">Source Name</Label>
                <Input
                  id="source_name"
                  value={formData.source_name || ''}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  placeholder="Enter source name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="valid_status"
                  checked={formData.valid_status || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, valid_status: checked })}
                />
                <Label htmlFor="valid_status">Valid Status</Label>
              </div>
              <div>
                <Label htmlFor="search_url_status">Search URL Status</Label>
                <Select
                  value={formData.search_url_status || 'pending'}
                  onValueChange={(value) => setFormData({ ...formData, search_url_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {modalType === 'company' && (
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderEditModal = () => (
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</DialogTitle>
          <DialogDescription>
            Update the {modalType} information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {modalType === 'segment' && (
            <>
              <div>
                <Label htmlFor="edit_segment_name">Segment Name</Label>
                <Input
                  id="edit_segment_name"
                  value={formData.segment_name || ''}
                  onChange={(e) => setFormData({ ...formData, segment_name: e.target.value })}
                  placeholder="Enter segment name"
                />
              </div>
              <div>
                <Label htmlFor="edit_base_url_gen">Base URL Generator</Label>
                <Input
                  id="edit_base_url_gen"
                  value={formData.base_url_gen || ''}
                  onChange={(e) => setFormData({ ...formData, base_url_gen: e.target.value })}
                  placeholder="Enter base URL generator"
                />
              </div>
            </>
          )}

          {modalType === 'keyword' && (
            <>
              <div>
                <Label htmlFor="edit_keyword">Keyword</Label>
                <Input
                  id="edit_keyword"
                  value={formData.keyword || ''}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="Enter keyword"
                />
              </div>
              <div>
                <Label htmlFor="edit_segment_id">Segment</Label>
                <Select
                  value={formData.segment_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map(segment => (
                      <SelectItem key={segment.segment_id} value={segment.segment_id}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {modalType === 'baseUrl' && (
            <>
              <div>
                <Label htmlFor="edit_base_url">Base URL</Label>
                <Input
                  id="edit_base_url"
                  value={formData.base_url || ''}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="Enter base URL"
                />
              </div>
              <div>
                <Label htmlFor="edit_segment_id">Segment</Label>
                <Select
                  value={formData.segment_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map(segment => (
                      <SelectItem key={segment.segment_id} value={segment.segment_id}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_source_name">Source Name</Label>
                <Input
                  id="edit_source_name"
                  value={formData.source_name || ''}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  placeholder="Enter source name"
                />
              </div>
              <div>
                <Label htmlFor="edit_location">Location</Label>
                <Input
                  id="edit_location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_valid_status"
                  checked={formData.valid_status || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, valid_status: checked })}
                />
                <Label htmlFor="edit_valid_status">Valid Status</Label>
              </div>
              <div>
                <Label htmlFor="edit_search_url_status">Search URL Status</Label>
                <Select
                  value={formData.search_url_status || 'pending'}
                  onValueChange={(value) => setFormData({ ...formData, search_url_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {modalType === 'company' && (
            <div>
              <Label htmlFor="edit_company_name">Company Name</Label>
              <Input
                id="edit_company_name"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {modalType}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {modalType === 'segment' && editingItem?.segment_name}
            {modalType === 'keyword' && editingItem?.keyword}
            {modalType === 'baseUrl' && editingItem?.base_url}
            {modalType === 'company' && editingItem?.company_name}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Manage your segments, keywords, base URLs, and target companies
        </p>
      </div>

      {/* Database Test Component - Temporary for debugging */}
      <DatabaseTest />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.segments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.keywords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Base URLs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.baseUrls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.targetCompanies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Data Overview</CardTitle>
              <CardDescription>
                Segment-wise organization of your data
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="baseUrls">Base URLs</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

            {/* Segments Tab */}
            <TabsContent value="segments" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button onClick={() => openCreateModal('segment')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
              </div>

              <div className="space-y-4">
                {getFilteredData().map((segment: any) => (
                  <Card key={segment.segment_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSegmentExpansion(segment.segment_id)}
                          >
                            {expandedSegments.has(segment.segment_id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <h3 className="font-semibold">{segment.segment_name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{segment.keywords_count} keywords</span>
                              <span>{segment.base_urls_count} base URLs</span>
                              <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal('segment', segment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal('segment', segment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedSegments.has(segment.segment_id) && (
                      <CardContent className="pt-0">
                        {segment.base_url_gen && (
                          <div className="mb-3">
                            <Label className="text-sm font-medium">Base URL Generator:</Label>
                            <p className="text-sm text-muted-foreground">{segment.base_url_gen}</p>
                          </div>
                        )}
                        
                        {/* Keywords in this segment */}
                        <div className="mb-3">
                          <Label className="text-sm font-medium">Keywords:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {keywords
                              .filter(k => k.segment_id === segment.segment_id)
                              .slice(0, 5)
                              .map(keyword => (
                                <Badge key={keyword.keyword_id} variant="secondary">
                                  {keyword.keyword}
                                </Badge>
                              ))}
                            {keywords.filter(k => k.segment_id === segment.segment_id).length > 5 && (
                              <Badge variant="outline">
                                +{keywords.filter(k => k.segment_id === segment.segment_id).length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Base URLs in this segment */}
                        <div>
                          <Label className="text-sm font-medium">Base URLs:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {baseUrls
                              .filter(b => b.segment_id === segment.segment_id)
                              .slice(0, 3)
                              .map(baseUrl => (
                                <Badge key={baseUrl.base_url_id} variant="outline">
                                  {baseUrl.source_name || baseUrl.base_url}
                                </Badge>
                              ))}
                            {baseUrls.filter(b => b.segment_id === segment.segment_id).length > 3 && (
                              <Badge variant="outline">
                                +{baseUrls.filter(b => b.segment_id === segment.segment_id).length - 3} more
                              </Badge>
                            )}
                </div>
              </div>
            </CardContent>
                    )}
          </Card>
                ))}
        </div>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button onClick={() => openCreateModal('keyword')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </div>

                  <Table>
                    <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                  {getFilteredData().map((keyword: any) => (
                    <TableRow key={keyword.keyword_id}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{keyword.segment_name}</Badge>
                          </TableCell>
                      <TableCell>{new Date(keyword.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal('keyword', keyword)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal('keyword', keyword)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                            </div>
                          </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Base URLs Tab */}
            <TabsContent value="baseUrls" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search base URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                              </div>
                <Button onClick={() => openCreateModal('baseUrl')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Base URL
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Base URL</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((baseUrl: any) => (
                    <TableRow key={baseUrl.base_url_id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        <a href={baseUrl.base_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {baseUrl.base_url}
                        </a>
                            </TableCell>
                      <TableCell>{baseUrl.source_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{baseUrl.segment_name}</Badge>
                      </TableCell>
                      <TableCell>{baseUrl.location || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={baseUrl.valid_status ? "default" : "destructive"}>
                            {baseUrl.valid_status ? "Valid" : "Invalid"}
                              </Badge>
                          <Badge variant="outline">{baseUrl.search_url_status}</Badge>
                        </div>
                            </TableCell>
                      <TableCell>{new Date(baseUrl.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal('baseUrl', baseUrl)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal('baseUrl', baseUrl)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                              </div>
                            </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                            </div>
                <Button onClick={() => openCreateModal('company')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
                            </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((company: any) => (
                    <TableRow key={company.company_id}>
                      <TableCell className="font-medium">{company.company_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal('company', company)}
                          >
                            <Edit className="h-4 w-4" />
                                </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal('company', company)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
          </TabsContent>
      </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      {renderCreateModal()}
      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
}
