import { supabase } from "@/lib/supabase";

export interface Newsletter {
  newsletter_id: number;
  newsletter_type: string;
  issue_number?: number;
  publication_date?: string;
  subject_line: string;
  full_content: string;
  target_industry: string;
  approval_status: "draft" | "review" | "approved" | "published";
  status: "scheduled" | "generating" | "generated" | "regenerate" | "sent" | "cancelled";
  approved_by: string;
  project_id: number;
  campaign_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignData {
  campaignName: string;
  startDate: string;
  endDate: string;
  targetedIndustry: string[];
  emailGroup: string[];
  emailIds: string[];
  frequency: string;
}

export interface TimelineItem {
  date: string;
  "newsletter-type": string;
}

export interface WebhookResponse {
  output: {
    timeline: TimelineItem[];
    "allowed-newsletter-type": string[];
  };
}

// Webhook URLs
const WEBHOOK_URLS = {
  CAMPAIGN_CREATE: "https://n8n.sesai.in/webhook/e38ac54e-1dd9-4cd6-8681-0d9cce6ee36d",
  NEWSLETTER_APPROVE: "https://n8n.sesai.in/webhook/newsletter/approve",
  NEWSLETTER_REGENERATE: "https://n8n.sesai.in/webhook/newsletter/regenerate"
};

// Campaign Management
export const createCampaign = async (campaignData: CampaignData): Promise<WebhookResponse> => {
  try {
    const response = await fetch(WEBHOOK_URLS.CAMPAIGN_CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WebhookResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

export const updateTimeline = async (timeline: TimelineItem[], allowedTypes: string[]): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URLS.CAMPAIGN_CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeline,
        "allowed-newsletter-type": allowedTypes
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating timeline:", error);
    throw error;
  }
};

// Newsletter Management
export const fetchNewsletters = async (): Promise<Newsletter[]> => {
  try {
    const { data, error } = await supabase
      .from("newsletters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    throw error;
  }
};

export const fetchNewsletterById = async (newsletterId: string): Promise<Newsletter | null> => {
  try {
    const { data, error } = await supabase
      .from("newsletters")
      .select("*")
      .eq("newsletter_id", newsletterId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching newsletter:", error);
    throw error;
  }
};

export const updateNewsletterSubject = async (newsletterId: string, subjectLine: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("newsletters")
      .update({ 
        subject_line: subjectLine,
        updated_at: new Date().toISOString()
      })
      .eq("newsletter_id", newsletterId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating newsletter subject:", error);
    throw error;
  }
};

export const updateNewsletterStatus = async (newsletterId: string, status: string, approvalStatus?: string): Promise<void> => {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (approvalStatus) {
      updateData.approvalstatus = approvalStatus;
    }

    const { error } = await supabase
      .from("newsletters")
      .update(updateData)
      .eq("newsletter_id", newsletterId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating newsletter status:", error);
    throw error;
  }
};

// Newsletter Actions via Webhooks
export const approveNewsletter = async (newsletterId: string): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URLS.NEWSLETTER_APPROVE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newsletter_id: newsletterId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Update local status after successful webhook call
    await updateNewsletterStatus(newsletterId, "sent", "approved");
  } catch (error) {
    console.error("Error approving newsletter:", error);
    throw error;
  }
};

export const regenerateNewsletter = async (newsletterId: string): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URLS.NEWSLETTER_REGENERATE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newsletter_id: newsletterId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // In a real implementation, you might want to fetch the updated content
    // and update the local newsletter record
  } catch (error) {
    console.error("Error regenerating newsletter:", error);
    throw error;
  }
};

// Campaign Analytics
export const getCampaignStats = async (): Promise<{
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  sent: number;
  draft: number;
}> => {
  try {
    const { data, error } = await supabase
      .from("newsletters")
      .select("approvalstatus, status");

    if (error) {
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      approved: data?.filter(n => n.approvalstatus === "approved").length || 0,
      pending: data?.filter(n => n.approvalstatus === "pending").length || 0,
      rejected: data?.filter(n => n.approvalstatus === "rejected").length || 0,
      sent: data?.filter(n => n.status === "sent").length || 0,
      draft: data?.filter(n => n.status === "draft").length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    throw error;
  }
};

// Search and Filter
export const searchNewsletters = async (query: string, filters?: {
  newsletter_type?: string;
  target_industry?: string;
  approvalstatus?: string;
  status?: string;
}): Promise<Newsletter[]> => {
  try {
    let supabaseQuery = supabase
      .from("newsletters")
      .select("*");

    // Apply text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`subject_line.ilike.%${query}%,full_content.ilike.%${query}%`);
    }

    // Apply filters
    if (filters?.newsletter_type) {
      supabaseQuery = supabaseQuery.eq("newsletter_type", filters.newsletter_type);
    }
    if (filters?.target_industry) {
      supabaseQuery = supabaseQuery.eq("target_industry", filters.target_industry);
    }
    if (filters?.approvalstatus) {
      supabaseQuery = supabaseQuery.eq("approvalstatus", filters.approvalstatus);
    }
    if (filters?.status) {
      supabaseQuery = supabaseQuery.eq("status", filters.status);
    }

    const { data, error } = await supabaseQuery.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error searching newsletters:", error);
    throw error;
  }
};
