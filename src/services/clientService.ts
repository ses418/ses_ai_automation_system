import { supabase } from '@/lib/supabase';
import { 
  Client, 
  CreateClientData, 
  UpdateClientData, 
  ClientFilters,
  ClientInteraction,
  ClientReactivation,
  CLIENT_INDUSTRIES,
  CLIENT_TAGS
} from '@/types/clients';

export class ClientService {
  // Get all clients with optional filtering
  static async getClients(filters?: ClientFilters): Promise<Client[]> {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.relationship_status) {
        query = query.eq('relationship_status', filters.relationship_status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.date_range) {
        query = query.gte('created_at', filters.date_range.start)
                    .lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching clients:', error);
        throw new Error(`Failed to fetch clients: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClients:', error);
      throw error;
    }
  }

  // Get a single client by ID
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        throw new Error(`Failed to fetch client: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getClientById:', error);
      throw error;
    }
  }

  // Create a new client
  static async createClient(clientData: CreateClientData): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw new Error(`Failed to create client: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createClient:', error);
      throw error;
    }
  }

  // Update an existing client
  static async updateClient(id: string, clientData: UpdateClientData): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw new Error(`Failed to update client: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateClient:', error);
      throw error;
    }
  }

  // Delete a client
  static async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        throw new Error(`Failed to delete client: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  }

  // Get client interactions
  static async getClientInteractions(clientId: string): Promise<ClientInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client interactions:', error);
        throw new Error(`Failed to fetch client interactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClientInteractions:', error);
      throw error;
    }
  }

  // Create a new client interaction
  static async createClientInteraction(interactionData: Omit<ClientInteraction, 'id' | 'created_at' | 'updated_at'>): Promise<ClientInteraction> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .insert([interactionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client interaction:', error);
        throw new Error(`Failed to create client interaction: ${error.message}`);
      }

      // Update client's last_contact_date
      await this.updateClient(interactionData.client_id, {
        last_contact_date: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error in createClientInteraction:', error);
      throw error;
    }
  }

  // Get client reactivations
  static async getClientReactivations(clientId: string): Promise<ClientReactivation[]> {
    try {
      const { data, error } = await supabase
        .from('client_reactivations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client reactivations:', error);
        throw new Error(`Failed to fetch client reactivations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClientReactivations:', error);
      throw error;
    }
  }

  // Create a new client reactivation
  static async createClientReactivation(reactivationData: Omit<ClientReactivation, 'id' | 'created_at' | 'updated_at'>): Promise<ClientReactivation> {
    try {
      const { data, error } = await supabase
        .from('client_reactivations')
        .insert([reactivationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client reactivation:', error);
        throw new Error(`Failed to create client reactivation: ${error.message}`);
      }

      // Update client's reactivation tracking
      await this.updateClient(reactivationData.client_id, {
        reactivation_attempts: (await this.getClientById(reactivationData.client_id))?.reactivation_attempts + 1 || 1,
        last_reactivation_date: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error in createClientReactivation:', error);
      throw error;
    }
  }

  // Update client reactivation status
  static async updateClientReactivation(id: string, status: ClientReactivation['status'], notes?: string): Promise<ClientReactivation> {
    try {
      const updateData: Partial<ClientReactivation> = { status };
      if (notes) updateData.notes = notes;
      if (status === 'successful') updateData.success_date = new Date().toISOString();

      const { data, error } = await supabase
        .from('client_reactivations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client reactivation:', error);
        throw new Error(`Failed to update client reactivation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateClientReactivation:', error);
      throw error;
    }
  }

  // Get client analytics and metrics
  static async getClientAnalytics(): Promise<{
    totalClients: number;
    activeClients: number;
    prospects: number;
    churnedClients: number;
    totalRevenue: number;
    averageRevenue: number;
    industryBreakdown: { industry: string; count: number }[];
    statusBreakdown: { status: string; count: number }[];
    priorityBreakdown: { priority: string; count: number }[];
    reactivationSuccessRate: number;
  }> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*');

      if (error) {
        console.error('Error fetching clients for analytics:', error);
        throw new Error(`Failed to fetch client analytics: ${error.message}`);
      }

      if (!clients) return {
        totalClients: 0,
        activeClients: 0,
        prospects: 0,
        churnedClients: 0,
        totalRevenue: 0,
        averageRevenue: 0,
        industryBreakdown: [],
        statusBreakdown: [],
        priorityBreakdown: [],
        reactivationSuccessRate: 0
      };

      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'customer').length;
      const prospects = clients.filter(c => c.status === 'prospect').length;
      const churnedClients = clients.filter(c => c.status === 'churned').length;
      const totalRevenue = clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
      const averageRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

      // Industry breakdown
      const industryMap = new Map<string, number>();
      clients.forEach(client => {
        const count = industryMap.get(client.industry) || 0;
        industryMap.set(client.industry, count + 1);
      });
      const industryBreakdown = Array.from(industryMap.entries()).map(([industry, count]) => ({ industry, count }));

      // Status breakdown
      const statusMap = new Map<string, number>();
      clients.forEach(client => {
        const count = statusMap.get(client.status) || 0;
        statusMap.set(client.status, count + 1);
      });
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      // Priority breakdown
      const priorityMap = new Map<string, number>();
      clients.forEach(client => {
        const count = priorityMap.get(client.priority) || 0;
        priorityMap.set(client.priority, count + 1);
      });
      const priorityBreakdown = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

      // Reactivation success rate
      const { data: reactivations } = await supabase
        .from('client_reactivations')
        .select('status');
      
      const totalReactivations = reactivations?.length || 0;
      const successfulReactivations = reactivations?.filter(r => r.status === 'successful').length || 0;
      const reactivationSuccessRate = totalReactivations > 0 ? (successfulReactivations / totalReactivations) * 100 : 0;

      return {
        totalClients,
        activeClients,
        prospects,
        churnedClients,
        totalRevenue,
        averageRevenue,
        industryBreakdown,
        statusBreakdown,
        priorityBreakdown,
        reactivationSuccessRate
      };
    } catch (error) {
      console.error('Error in getClientAnalytics:', error);
      throw error;
    }
  }

  // Get clients requiring follow-up
  static async getClientsRequiringFollowUp(): Promise<Client[]> {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .not('next_follow_up', 'is', null)
        .lte('next_follow_up', today.toISOString())
        .order('next_follow_up', { ascending: true });

      if (error) {
        console.error('Error fetching clients requiring follow-up:', error);
        throw new Error(`Failed to fetch clients requiring follow-up: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClientsRequiringFollowUp:', error);
      throw error;
    }
  }

  // Get clients at risk
  static async getClientsAtRisk(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('relationship_status', 'at_risk')
        .order('last_contact_date', { ascending: true });

      if (error) {
        console.error('Error fetching clients at risk:', error);
        throw new Error(`Failed to fetch clients at risk: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClientsAtRisk:', error);
      throw error;
    }
  }

  // Get available industries and tags
  static getAvailableIndustries(): string[] {
    return CLIENT_INDUSTRIES;
  }

  static getAvailableTags(): string[] {
    return CLIENT_TAGS;
  }
}
