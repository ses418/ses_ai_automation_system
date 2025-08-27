import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Download, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Database,
  Tag,
  Building,
  Link,
  Filter,
  X,
  Calendar,
  Clock,
  Globe,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EntityModal from "@/components/EntityModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import PageHeader from "@/components/ui/PageHeader";

// Debug log to check if component is loading
console.log("DataManagement component is loading...");

// Entity types
interface BaseEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Category extends BaseEntity {
  description?: string;
  color?: string;
}

interface Keyword extends BaseEntity {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Company extends BaseEntity {
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large';
  website?: string;
}

interface URL extends BaseEntity {
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastChecked?: string;
}

type EntityType = 'category' | 'keyword' | 'company' | 'url';

// Enhanced mock data
const mockCategories: Category[] = [
  { id: "1", name: "Technology", description: "Tech-related categories and innovations", color: "#3B82F6", createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "2", name: "Marketing", description: "Marketing and advertising strategies", color: "#10B981", createdAt: "2024-02-01", updatedAt: "2024-03-18" },
  { id: "3", name: "Finance", description: "Financial services and investments", color: "#F59E0B", createdAt: "2024-01-20", updatedAt: "2024-03-10" },
  { id: "4", name: "Healthcare", description: "Healthcare and medical services", color: "#EF4444", createdAt: "2024-02-15", updatedAt: "2024-03-25" },
  { id: "5", name: "Education", description: "Educational resources and training", color: "#8B5CF6", createdAt: "2024-01-10", updatedAt: "2024-03-15" },
];

const mockKeywords: Keyword[] = [
  { id: "1", name: "Artificial Intelligence", category: "Technology", priority: "high", createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "2", name: "Digital Marketing", category: "Marketing", priority: "medium", createdAt: "2024-02-01", updatedAt: "2024-03-18" },
  { id: "3", name: "Blockchain", category: "Technology", priority: "high", createdAt: "2024-01-20", updatedAt: "2024-03-10" },
  { id: "4", name: "Content Strategy", category: "Marketing", priority: "medium", createdAt: "2024-02-10", updatedAt: "2024-03-22" },
  { id: "5", name: "Machine Learning", category: "Technology", priority: "high", createdAt: "2024-01-25", updatedAt: "2024-03-12" },
];

const mockCompanies: Company[] = [
  { id: "1", name: "TechCorp Solutions", industry: "Technology", size: "large", website: "techcorp.com", createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "2", name: "MarketingPro Agency", industry: "Marketing", size: "medium", website: "marketingpro.com", createdAt: "2024-02-01", updatedAt: "2024-03-18" },
  { id: "3", name: "StartupXYZ", industry: "Technology", size: "startup", website: "startupxyz.com", createdAt: "2024-01-20", updatedAt: "2024-03-10" },
  { id: "4", name: "Global Finance Ltd", industry: "Finance", size: "large", website: "globalfinance.com", createdAt: "2024-02-05", updatedAt: "2024-03-16" },
  { id: "5", name: "Creative Studios", industry: "Marketing", size: "small", website: "creativestudios.com", createdAt: "2024-01-30", updatedAt: "2024-03-14" },
];

const mockURLs: URL[] = [
  { id: "1", name: "https://techcorp.com", category: "Technology", status: "active", lastChecked: "2024-03-20", createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "2", name: "https://marketingpro.com", category: "Marketing", status: "active", lastChecked: "2024-03-18", createdAt: "2024-02-01", updatedAt: "2024-03-18" },
  { id: "3", name: "https://startupxyz.com", category: "Technology", status: "pending", lastChecked: "2024-03-10", createdAt: "2024-01-20", updatedAt: "2024-03-10" },
  { id: "4", name: "https://globalfinance.com", category: "Finance", status: "active", lastChecked: "2024-03-16", createdAt: "2024-02-05", updatedAt: "2024-03-16" },
  { id: "5", name: "https://creativestudios.com", category: "Marketing", status: "inactive", lastChecked: "2024-03-14", createdAt: "2024-01-30", updatedAt: "2024-03-14" },
];

const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EntityType>('category');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [deletingEntity, setDeletingEntity] = useState<any>(null);
  const { toast } = useToast();

  // State for each entity
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [urls, setURLs] = useState<URL[]>(mockURLs);

  // Get current entity data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'category': return categories;
      case 'keyword': return keywords;
      case 'company': return companies;
      case 'url': return urls;
      default: return categories;
    }
  };

  const setCurrentData = (data: any[]) => {
    switch (activeTab) {
      case 'category': setCategories(data); break;
      case 'keyword': setKeywords(data); break;
      case 'company': setCompanies(data); break;
      case 'url': setURLs(data); break;
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const data = getCurrentData();
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.industry && item.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, searchTerm, categories, keywords, companies, urls]);

  // Handle row selection
  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // CRUD operations
  const handleAddEntity = (entityData: any) => {
    const newEntity = {
      ...entityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const currentData = getCurrentData();
    setCurrentData([...currentData, newEntity]);
    
    toast({
      title: "Success! 🎉",
      description: `${entityData.name} has been added to the system successfully.`,
    });
  };

  const handleEditEntity = (entityData: any) => {
    if (!editingEntity) return;
    
    const currentData = getCurrentData();
    const updatedData = currentData.map(item => 
      item.id === editingEntity.id 
        ? { ...item, ...entityData, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    );
    
    setCurrentData(updatedData);
    setEditingEntity(null);
    
    toast({
      title: "Updated! ✨",
      description: `${entityData.name} has been updated successfully.`,
    });
  };

  const handleDeleteEntity = (id: string) => {
    const currentData = getCurrentData();
    const entityName = currentData.find(item => item.id === id)?.name || 'Entity';
    const updatedData = currentData.filter(item => item.id !== id);
    setCurrentData(updatedData);
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    toast({
      title: "Deleted! 🗑️",
      description: `${entityName} has been removed from the system.`,
    });
  };

  const handleBulkDelete = () => {
    const currentData = getCurrentData();
    const updatedData = currentData.filter(item => !selectedRows.has(item.id));
    setCurrentData(updatedData);
    setSelectedRows(new Set());
    
    toast({
      title: "Bulk Delete Complete! 🚀",
      description: `${selectedRows.size} entities have been deleted successfully.`,
    });
  };

  const handleExportCSV = () => {
    const data = getCurrentData();
    const headers = ['ID', 'Name', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.id,
        item.name,
        item.createdAt,
        item.updatedAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete! 📊",
      description: `${activeTab} data has been exported to CSV successfully.`,
    });
  };

  // Get entity icon and color
  const getEntityInfo = (type: EntityType) => {
    switch (type) {
      case 'category':
        return { icon: Database, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Categories' };
      case 'keyword':
        return { icon: Tag, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Keywords' };
      case 'company':
        return { icon: Building, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Companies' };
      case 'url':
        return { icon: Link, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'URLs' };
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get company size badge styling
  const getCompanySizeBadge = (size: string) => {
    switch (size) {
      case 'startup':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Startup</Badge>;
      case 'small':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Small</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge>;
      case 'large':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Large</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get URL status badge styling
  const getURLStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const entityInfo = getEntityInfo(activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Data Management"
          subtitle="Organize and manage your data categories, keywords, companies, and URLs"
          actions={[
            {
              type: 'add',
              label: 'Add',
              onClick: () => setIsAddModalOpen(true)
            },
            {
              type: 'export',
              label: 'Export CSV',
              onClick: handleExportCSV
            }
                 ]}
       />
     </div>

     {/* Main Content with Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value as EntityType);
          setSelectedRows(new Set());
          setSearchTerm("");
        }}
        className="space-y-6"
      >
        {/* Entity Tabs */}
        <TabsList className="grid w-full grid-cols-4 h-14 bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
          <TabsTrigger value="category" className="flex items-center gap-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-all duration-300">
            <Database className="h-5 w-5" />
            <span className="font-medium">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="keyword" className="flex items-center gap-3 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 transition-all duration-300">
            <Tag className="h-5 w-5" />
            <span className="font-medium">Keywords</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 transition-all duration-300">
            <Building className="h-5 w-5" />
            <span className="font-medium">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 transition-all duration-300">
            <Link className="h-5 w-5" />
            <span className="font-medium">URLs</span>
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="mb-6">
          <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={`Search ${entityInfo.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-white/30 focus:bg-white focus:ring-2 focus:ring-blue-300 transition-all duration-300 text-lg"
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredData.length} {entityInfo.label.toLowerCase()} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table for each entity */}
        {(['category', 'keyword', 'company', 'url'] as EntityType[]).map((entityType) => (
          <TabsContent key={entityType} value={entityType} className="mt-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/70 hover:bg-gray-100/70 transition-colors duration-200">
                        <TableHead className="w-12 p-4">
                          <Checkbox
                            checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </TableHead>
                        <TableHead className="p-4 font-semibold text-gray-700">ID</TableHead>
                        <TableHead className="p-4 font-semibold text-gray-700">Name/Value</TableHead>
                        {entityType === 'category' && <TableHead className="p-4 font-semibold text-gray-700">Description</TableHead>}
                        {entityType === 'keyword' && <TableHead className="p-4 font-semibold text-gray-700">Category</TableHead>}
                        {entityType === 'company' && <TableHead className="p-4 font-semibold text-gray-700">Industry</TableHead>}
                        {entityType === 'url' && <TableHead className="p-4 font-semibold text-gray-700">Status</TableHead>}
                        <TableHead className="p-4 font-semibold text-gray-700">Created At</TableHead>
                        <TableHead className="p-4 font-semibold text-gray-700">Updated At</TableHead>
                        <TableHead className="w-24 p-4 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/70 transition-all duration-200 cursor-pointer group">
                          <TableCell className="p-4">
                            <Checkbox
                              checked={selectedRows.has(item.id)}
                              onCheckedChange={(checked) => handleRowSelect(item.id, checked as boolean)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </TableCell>
                          <TableCell className="p-4 font-mono text-sm text-gray-600 bg-gray-50/50 rounded-lg">
                            {item.id}
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {item.name}
                            </div>
                          </TableCell>
                          
                          {/* Entity-specific columns */}
                          {entityType === 'category' && (
                            <TableCell className="p-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate" title={item.description}>
                                {item.description || '-'}
                              </div>
                            </TableCell>
                          )}
                          {entityType === 'keyword' && (
                            <TableCell className="p-4">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {item.category || 'Uncategorized'}
                              </Badge>
                            </TableCell>
                          )}
                          {entityType === 'company' && (
                            <TableCell className="p-4">
                              <div className="text-sm text-gray-600">
                                {item.industry || '-'}
                              </div>
                            </TableCell>
                          )}
                          {entityType === 'url' && (
                            <TableCell className="p-4">
                              {getURLStatusBadge(item.status || 'pending')}
                            </TableCell>
                          )}
                          
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => toast({ title: "View Entity", description: `Viewing ${item.name}` })} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setEditingEntity(item);
                                  setIsEditModalOpen(true);
                                }} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeletingEntity(item);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-red-600 cursor-pointer hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Modals */}
      <EntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEntity}
        mode="add"
        entityType={activeTab}
      />

      <EntityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEntity(null);
        }}
        entity={editingEntity}
        onSave={handleEditEntity}
        mode="edit"
        entityType={activeTab}
      />

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEntity(null);
        }}
        onConfirm={() => {
          if (deletingEntity) {
            handleDeleteEntity(deletingEntity.id);
          }
        }}
        title={`Delete ${entityInfo.label.slice(0, -1)}`}
        message={`Are you sure you want to delete this ${entityInfo.label.toLowerCase()}?`}
        itemName={deletingEntity?.name}
        entityType={entityInfo.label.toLowerCase()}
      />

      <DeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Bulk Delete ${entityInfo.label}`}
        message={`Are you sure you want to delete the selected ${entityInfo.label.toLowerCase()}?`}
        isBulkDelete={true}
        count={selectedRows.size}
        entityType={entityInfo.label.toLowerCase()}
      />
    </div>
  );
};

export default DataManagement;
