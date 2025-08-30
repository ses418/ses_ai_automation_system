import { supabase } from '@/lib/supabase';

export interface EmailDraft {
  id: string;
  subject: string;
  body: string;
  recipient: string;
  created_at: string;
  status: 'draft' | 'sent' | 'pending' | 'delivered';
  created_by: string;
  delivered_status: 'pending' | 'delivered' | 'failed';
  replied: boolean;
}

export interface CreateEmailDraftData {
  subject: string;
  body: string;
  recipient: string;
  status?: 'draft' | 'sent' | 'pending' | 'delivered';
  delivered_status?: 'pending' | 'delivered' | 'failed';
  replied?: boolean;
}

export interface UpdateEmailDraftData {
  subject?: string;
  body?: string;
  recipient?: string;
  status?: 'draft' | 'sent' | 'pending' | 'delivered';
  delivered_status?: 'pending' | 'delivered' | 'failed';
  replied?: boolean;
}

export class EmailDraftsService {
  /**
   * Fetch all email drafts
   */
  static async getEmailDrafts(): Promise<EmailDraft[]> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching email drafts:', error);
      throw error;
    }
  }

  /**
   * Fetch email draft by ID
   */
  static async getEmailDraftById(id: string): Promise<EmailDraft | null> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching email draft:', error);
      throw error;
    }
  }

  /**
   * Create new email draft
   */
  static async createEmailDraft(draftData: CreateEmailDraftData): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .insert([draftData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating email draft:', error);
      throw error;
    }
  }

  /**
   * Update email draft
   */
  static async updateEmailDraft(id: string, updateData: UpdateEmailDraftData): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating email draft:', error);
      throw error;
    }
  }

  /**
   * Delete email draft
   */
  static async deleteEmailDraft(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_drafts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting email draft:', error);
      throw error;
    }
  }

  /**
   * Mark email draft as sent
   */
  static async markAsSent(id: string): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .update({
          status: 'sent',
          delivered_status: 'delivered'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error marking email draft as sent:', error);
      throw error;
    }
  }

  /**
   * Mark email draft as replied
   */
  static async markAsReplied(id: string): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .update({
          replied: true
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error marking email draft as replied:', error);
      throw error;
    }
  }

  /**
   * Get email drafts by status
   */
  static async getEmailDraftsByStatus(status: EmailDraft['status']): Promise<EmailDraft[]> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching email drafts by status:', error);
      throw error;
    }
  }

  /**
   * Get email drafts by recipient
   */
  static async getEmailDraftsByRecipient(recipient: string): Promise<EmailDraft[]> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .ilike('recipient', `%${recipient}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching email drafts by recipient:', error);
      throw error;
    }
  }
}
