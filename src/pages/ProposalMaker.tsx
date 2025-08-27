import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Save, 
  Plus, 
  Download, 
  Send, 
  Clock, 
  DollarSign, 
  Building, 
  User, 
  Calendar, 
  CheckCircle,
  Trash2,
  Copy
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

// Mock data for clients
const clientsData = [
  { id: '1', name: 'TechCorp Inc.', industry: 'Technology', contact: 'John Smith', email: 'john@techcorp.com' },
  { id: '2', name: 'Global Solutions', industry: 'Consulting', contact: 'Sarah Johnson', email: 'sarah@globalsolutions.com' },
  { id: '3', name: 'Innovate Systems', industry: 'Software', contact: 'Michael Chen', email: 'michael@innovatesystems.com' },
  { id: '4', name: 'BuildRight Construction', industry: 'Construction', contact: 'Robert Lee', email: 'robert@buildright.com' },
  { id: '5', name: 'EcoEnergy Solutions', industry: 'Energy', contact: 'Emily Davis', email: 'emily@ecoenergy.com' },
];

// Mock data for services
const servicesData = [
  { id: '1', name: 'Engineering Consultation', rate: 150, unit: 'hour', description: 'Expert engineering consultation services' },
  { id: '2', name: 'System Design', rate: 5000, unit: 'project', description: 'Complete system design and architecture' },
  { id: '3', name: 'Implementation', rate: 8000, unit: 'project', description: 'Full implementation of designed systems' },
  { id: '4', name: 'Testing & Quality Assurance', rate: 120, unit: 'hour', description: 'Comprehensive testing and QA services' },
  { id: '5', name: 'Maintenance', rate: 1200, unit: 'month', description: 'Ongoing maintenance and support' },
];

// Interface for proposal items
interface ProposalItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  rate: number;
  unit: string;
  amount: number;
}

const ProposalMaker: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedClient, setSelectedClient] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDate, setProposalDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customDescription, setCustomDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  
  // Calculate total amount
  const totalAmount = proposalItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Handle adding a new service to the proposal
  const handleAddService = () => {
    if (!selectedService) {
      toast({
        title: "Service Required",
        description: "Please select a service to add",
        variant: "destructive"
      });
      return;
    }
    
    const service = servicesData.find(s => s.id === selectedService);
    if (!service) return;
    
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      service: service.name,
      description: customDescription || service.description,
      quantity,
      rate: service.rate,
      unit: service.unit,
      amount: service.rate * quantity
    };
    
    setProposalItems([...proposalItems, newItem]);
    setSelectedService('');
    setQuantity(1);
    setCustomDescription('');
    
    toast({
      title: "Service Added",
      description: `${service.name} has been added to the proposal`,
    });
  };
  
  // Handle removing a service from the proposal
  const handleRemoveService = (id: string) => {
    setProposalItems(proposalItems.filter(item => item.id !== id));
    
    toast({
      title: "Service Removed",
      description: "The service has been removed from the proposal",
    });
  };
  
  // Handle saving the proposal
  const handleSaveProposal = () => {
    if (!proposalTitle || !selectedClient || !proposalDate || !expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (proposalItems.length === 0) {
      toast({
        title: "No Services Added",
        description: "Please add at least one service to the proposal",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would save to a database
    toast({
      title: "Proposal Saved",
      description: "Your proposal has been saved successfully",
    });
  };
  
  // Handle sending the proposal
  const handleSendProposal = () => {
    if (!proposalTitle || !selectedClient || !proposalDate || !expiryDate || proposalItems.length === 0) {
      toast({
        title: "Incomplete Proposal",
        description: "Please complete all required fields before sending",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send the proposal to the client
    toast({
      title: "Proposal Sent",
      description: "Your proposal has been sent to the client",
    });
  };
  
  // Handle duplicating a service in the proposal
  const handleDuplicateService = (item: ProposalItem) => {
    const newItem = {
      ...item,
      id: Date.now().toString()
    };
    
    setProposalItems([...proposalItems, newItem]);
    
    toast({
      title: "Service Duplicated",
      description: `${item.service} has been duplicated`,
    });
  };
  
  return (
    <div className="min-h-screen page-bg-secondary p-6">
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Proposal Maker"
          subtitle="Create and manage professional client proposals"
          actions={[
            {
              type: 'save',
              label: 'Save Proposal',
              onClick: handleSaveProposal
            },
            {
              type: 'custom',
              label: 'Send Proposal',
              onClick: handleSendProposal,
              icon: <Send className="h-5 w-5 mr-2" />
            }
          ]}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Proposal Details</TabsTrigger>
          <TabsTrigger value="services">Services & Pricing</TabsTrigger>
          <TabsTrigger value="preview">Preview & Send</TabsTrigger>
        </TabsList>
        
        {/* Proposal Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="proposalTitle">Proposal Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="proposalTitle" 
                    placeholder="Enter proposal title" 
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Client <span className="text-red-500">*</span></Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="proposalDate">Proposal Date <span className="text-red-500">*</span></Label>
                  <Input 
                    id="proposalDate" 
                    type="date" 
                    value={proposalDate}
                    onChange={(e) => setProposalDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date <span className="text-red-500">*</span></Label>
                  <Input 
                    id="expiryDate" 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Enter any additional notes" 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea 
                  id="terms" 
                  placeholder="Enter terms and conditions" 
                  rows={6}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => setActiveTab('services')} className="btn-primary-gradient">
              Next: Services & Pricing
            </Button>
          </div>
        </TabsContent>
        
        {/* Services & Pricing Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="service">Service <span className="text-red-500">*</span></Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesData.map(service => (
                        <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button onClick={handleAddService} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Proposal
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customDescription">Custom Description (Optional)</Label>
                <Textarea 
                  id="customDescription" 
                  placeholder="Enter custom description for this service" 
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Proposal Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposalItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No services added yet.</p>
                  <p className="text-sm">Add services above to include them in your proposal.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Service</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-right py-3 px-4">Quantity</th>
                          <th className="text-right py-3 px-4">Rate</th>
                          <th className="text-right py-3 px-4">Amount</th>
                          <th className="text-center py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{item.service}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                            <td className="py-3 px-4 text-right">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">
                              ${item.rate.toLocaleString()} / {item.unit}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${item.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleDuplicateService(item)}>
                                  <Copy className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveService(item.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={4} className="py-3 px-4 text-right">Total:</td>
                          <td className="py-3 px-4 text-right">${totalAmount.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('details')}>
              Back: Proposal Details
            </Button>
            <Button onClick={() => setActiveTab('preview')} className="btn-primary-gradient">
              Next: Preview & Send
            </Button>
          </div>
        </TabsContent>
        
        {/* Preview & Send Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Proposal Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 border rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{proposalTitle || 'Untitled Proposal'}</h2>
                    <div className="mt-2 space-y-1 text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Proposal Date: {proposalDate || 'Not specified'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Valid Until: {expiryDate || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">Shiva Engineering Services</div>
                    <div className="text-gray-600 mt-1">Professional Engineering Solutions</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-800 flex items-center gap-1">
                      <Building className="h-4 w-4 text-blue-600" /> From
                    </h3>
                    <div className="text-gray-600">
                      <p>Shiva Engineering Services</p>
                      <p>123 Engineering Way</p>
                      <p>San Francisco, CA 94103</p>
                      <p>contact@shivaengineering.com</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-800 flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-600" /> For
                    </h3>
                    {selectedClient ? (
                      <div className="text-gray-600">
                        <p>{clientsData.find(c => c.id === selectedClient)?.name}</p>
                        <p>Contact: {clientsData.find(c => c.id === selectedClient)?.contact}</p>
                        <p>Email: {clientsData.find(c => c.id === selectedClient)?.email}</p>
                        <p>Industry: {clientsData.find(c => c.id === selectedClient)?.industry}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No client selected</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-medium text-gray-800 mb-4">Services & Pricing</h3>
                  {proposalItems.length === 0 ? (
                    <p className="text-gray-500">No services added to this proposal</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4">Service</th>
                            <th className="text-left py-3 px-4">Description</th>
                            <th className="text-right py-3 px-4">Quantity</th>
                            <th className="text-right py-3 px-4">Rate</th>
                            <th className="text-right py-3 px-4">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposalItems.map(item => (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-3 px-4">{item.service}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                              <td className="py-3 px-4 text-right">{item.quantity}</td>
                              <td className="py-3 px-4 text-right">
                                ${item.rate.toLocaleString()} / {item.unit}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                ${item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-bold">
                            <td colSpan={4} className="py-3 px-4 text-right">Total:</td>
                            <td className="py-3 px-4 text-right">${totalAmount.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {notes && (
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-800 mb-2">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded text-gray-600">
                      {notes}
                    </div>
                  </div>
                )}
                
                {terms && (
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-800 mb-2">Terms & Conditions</h3>
                    <div className="bg-gray-50 p-4 rounded text-gray-600 text-sm">
                      {terms}
                    </div>
                  </div>
                )}
                
                <div className="text-center mt-12 pt-8 border-t border-gray-200">
                  <p className="text-gray-600">Thank you for your business!</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('services')}>
              Back: Services & Pricing
            </Button>
            <div className="space-x-3">
              <Button variant="outline" onClick={handleSaveProposal}>
                <Save className="h-4 w-4 mr-2" />
                Save Proposal
              </Button>
              <Button onClick={handleSendProposal} className="btn-primary-gradient">
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProposalMaker;