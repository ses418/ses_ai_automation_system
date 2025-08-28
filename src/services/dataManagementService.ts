import { supabase } from '@/lib/supabase';

// Data types based on actual Supabase tables
export interface Segment {
  segment_id: string;
  segment_name: string;
  base_url_gen?: string;
  created_at: string;
}

export interface Keyword {
  keyword_id: string;
  segment_id: string;
  keyword: string;
  created_at: string;
  segment_name?: string; // Joined from segments table
}

export interface BaseUrl {
  base_url_id: string;
  base_url: string;
  segment_id: string;
  source_name?: string;
  location?: string;
  valid_status?: boolean;
  drop_reason?: string;
  search_url_status: string;
  created_at: string;
  segment_name?: string; // Joined from segments table
}

export interface TargetCompany {
  company_id: number;
  company_name: string;
}

export interface CreateSegmentData {
  segment_name: string;
  base_url_gen?: string;
}

export interface CreateKeywordData {
  keyword: string;
  segment_id: string;
}

export interface CreateBaseUrlData {
  base_url: string;
  segment_id: string;
  source_name?: string;
  location?: string;
  valid_status?: boolean;
  search_url_status?: string;
}

export interface CreateTargetCompanyData {
  company_name: string;
}

export interface UpdateSegmentData {
  segment_name?: string;
  base_url_gen?: string;
}

export interface UpdateKeywordData {
  keyword?: string;
  segment_id?: string;
}

export interface UpdateBaseUrlData {
  base_url?: string;
  segment_id?: string;
  source_name?: string;
  location?: string;
  valid_status?: boolean;
  drop_reason?: string;
  search_url_status?: string;
}

export interface UpdateTargetCompanyData {
  company_name?: string;
}

export class DataManagementService {
  // ==================== SEGMENTS ====================
  
  /**
   * Get all segments with counts
   */
  static async getSegments(): Promise<Segment[]> {
    try {
      const { data, error } = await supabase
        .from('ses_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching segments:', error);
        throw new Error(`Failed to fetch segments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSegments:', error);
      throw error;
    }
  }

  /**
   * Get segment by ID
   */
  static async getSegmentById(id: string): Promise<Segment | null> {
    try {
      const { data, error } = await supabase
        .from('ses_segments')
        .select('*')
        .eq('segment_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching segment:', error);
        throw new Error(`Failed to fetch segment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getSegmentById:', error);
      throw error;
    }
  }

  /**
   * Create new segment
   */
  static async createSegment(segmentData: CreateSegmentData): Promise<Segment> {
    try {
      const { data, error } = await supabase
        .from('ses_segments')
        .insert(segmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating segment:', error);
        throw new Error(`Failed to create segment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createSegment:', error);
      throw error;
    }
  }

  /**
   * Update segment
   */
  static async updateSegment(id: string, updateData: UpdateSegmentData): Promise<Segment> {
    try {
      const { data, error } = await supabase
        .from('ses_segments')
        .update(updateData)
        .eq('segment_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating segment:', error);
        throw new Error(`Failed to update segment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateSegment:', error);
      throw error;
    }
  }

  /**
   * Delete segment
   */
  static async deleteSegment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ses_segments')
        .delete()
        .eq('segment_id', id);

      if (error) {
        console.error('Error deleting segment:', error);
        throw new Error(`Failed to delete segment: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteSegment:', error);
      throw error;
    }
  }

  // ==================== KEYWORDS ====================
  
  /**
   * Get all keywords with segment names
   */
  static async getKeywords(): Promise<Keyword[]> {
    try {
      const { data, error } = await supabase
        .from('ses_keywords')
        .select(`
          *,
          ses_segments!inner(segment_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw new Error(`Failed to fetch keywords: ${error.message}`);
      }

      // Transform the data to flatten the nested structure
      return (data || []).map(item => ({
        keyword_id: item.keyword_id,
        segment_id: item.segment_id,
        keyword: item.keyword,
        created_at: item.created_at,
        segment_name: item.ses_segments?.segment_name
      }));
    } catch (error) {
      console.error('Error in getKeywords:', error);
      throw error;
    }
  }

  /**
   * Get keywords by segment
   */
  static async getKeywordsBySegment(segmentId: string): Promise<Keyword[]> {
    try {
      const { data, error } = await supabase
        .from('ses_keywords')
        .select(`
          *,
          ses_segments!inner(segment_name)
        `)
        .eq('segment_id', segmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching keywords by segment:', error);
        throw new Error(`Failed to fetch keywords: ${error.message}`);
      }

      return (data || []).map(item => ({
        keyword_id: item.keyword_id,
        segment_id: item.segment_id,
        keyword: item.keyword,
        created_at: item.created_at,
        segment_name: item.ses_segments?.segment_name
      }));
    } catch (error) {
      console.error('Error in getKeywordsBySegment:', error);
      throw error;
    }
  }

  /**
   * Create new keyword
   */
  static async createKeyword(keywordData: CreateKeywordData): Promise<Keyword> {
    try {
      const { data, error } = await supabase
        .from('ses_keywords')
        .insert(keywordData)
        .select()
        .single();

      if (error) {
        console.error('Error creating keyword:', error);
        throw new Error(`Failed to create keyword: ${error.message}`);
      }

      // Get the segment name for the response
      const segment = await this.getSegmentById(keywordData.segment_id);
      return {
        ...data,
        segment_name: segment?.segment_name
      };
    } catch (error) {
      console.error('Error in createKeyword:', error);
      throw error;
    }
  }

  /**
   * Update keyword
   */
  static async updateKeyword(id: string, updateData: UpdateKeywordData): Promise<Keyword> {
    try {
      const { data, error } = await supabase
        .from('ses_keywords')
        .update(updateData)
        .eq('keyword_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating keyword:', error);
        throw new Error(`Failed to update keyword: ${error.message}`);
      }

      // Get the segment name for the response
      const segment = await this.getSegmentById(data.segment_id);
      return {
        ...data,
        segment_name: segment?.segment_name
      };
    } catch (error) {
      console.error('Error in updateKeyword:', error);
      throw error;
    }
  }

  /**
   * Delete keyword
   */
  static async deleteKeyword(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ses_keywords')
        .delete()
        .eq('keyword_id', id);

      if (error) {
        console.error('Error deleting keyword:', error);
        throw new Error(`Failed to delete keyword: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteKeyword:', error);
      throw error;
    }
  }

  // ==================== BASE URLS ====================
  
  /**
   * Get all base URLs with segment names
   */
  static async getBaseUrls(): Promise<BaseUrl[]> {
    try {
      const { data, error } = await supabase
        .from('ses_base_url')
        .select(`
          *,
          ses_segments!inner(segment_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching base URLs:', error);
        throw new Error(`Failed to fetch base URLs: ${error.message}`);
      }

      return (data || []).map(item => ({
        base_url_id: item.base_url_id,
        base_url: item.base_url,
        segment_id: item.segment_id,
        source_name: item.source_name,
        location: item.location,
        valid_status: item.valid_status,
        drop_reason: item.drop_reason,
        search_url_status: item.search_url_status,
        created_at: item.created_at,
        segment_name: item.ses_segments?.segment_name
      }));
    } catch (error) {
      console.error('Error in getBaseUrls:', error);
      throw error;
    }
  }

  /**
   * Get base URLs by segment
   */
  static async getBaseUrlsBySegment(segmentId: string): Promise<BaseUrl[]> {
    try {
      const { data, error } = await supabase
        .from('ses_base_url')
        .select(`
          *,
          ses_segments!inner(segment_name)
        `)
        .eq('segment_id', segmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching base URLs by segment:', error);
        throw new Error(`Failed to fetch base URLs: ${error.message}`);
      }

      return (data || []).map(item => ({
        base_url_id: item.base_url_id,
        base_url: item.base_url,
        segment_id: item.segment_id,
        source_name: item.source_name,
        location: item.location,
        valid_status: item.valid_status,
        drop_reason: item.drop_reason,
        search_url_status: item.search_url_status,
        created_at: item.created_at,
        segment_name: item.ses_segments?.segment_name
      }));
    } catch (error) {
      console.error('Error in getBaseUrlsBySegment:', error);
      throw error;
    }
  }

  /**
   * Create new base URL
   */
  static async createBaseUrl(baseUrlData: CreateBaseUrlData): Promise<BaseUrl> {
    try {
      const { data, error } = await supabase
        .from('ses_base_url')
        .insert(baseUrlData)
        .select()
        .single();

      if (error) {
        console.error('Error creating base URL:', error);
        throw new Error(`Failed to create base URL: ${error.message}`);
      }

      // Get the segment name for the response
      const segment = await this.getSegmentById(baseUrlData.segment_id);
      return {
        ...data,
        segment_name: segment?.segment_name
      };
    } catch (error) {
      console.error('Error in createBaseUrl:', error);
      throw error;
    }
  }

  /**
   * Update base URL
   */
  static async updateBaseUrl(id: string, updateData: UpdateBaseUrlData): Promise<BaseUrl> {
    try {
      const { data, error } = await supabase
        .from('ses_base_url')
        .update(updateData)
        .eq('base_url_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating base URL:', error);
        throw new Error(`Failed to update base URL: ${error.message}`);
      }

      // Get the segment name for the response
      const segment = await this.getSegmentById(data.segment_id);
      return {
        ...data,
        segment_name: segment?.segment_name
      };
    } catch (error) {
      console.error('Error in updateBaseUrl:', error);
      throw error;
    }
  }

  /**
   * Delete base URL
   */
  static async deleteBaseUrl(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ses_base_url')
        .delete()
        .eq('base_url_id', id);

      if (error) {
        console.error('Error deleting base URL:', error);
        throw new Error(`Failed to delete base URL: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteBaseUrl:', error);
      throw error;
    }
  }

  // ==================== TARGET COMPANIES ====================
  
  /**
   * Get all target companies
   */
  static async getTargetCompanies(): Promise<TargetCompany[]> {
    try {
      const { data, error } = await supabase
        .from('target_companies_ses')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) {
        console.error('Error fetching target companies:', error);
        throw new Error(`Failed to fetch target companies: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTargetCompanies:', error);
      throw error;
    }
  }

  /**
   * Create new target company
   */
  static async createTargetCompany(companyData: CreateTargetCompanyData): Promise<TargetCompany> {
    try {
      const { data, error } = await supabase
        .from('target_companies_ses')
        .insert(companyData)
        .select()
        .single();

      if (error) {
        console.error('Error creating target company:', error);
        throw new Error(`Failed to create target company: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createTargetCompany:', error);
      throw error;
    }
  }

  /**
   * Update target company
   */
  static async updateTargetCompany(id: number, updateData: UpdateTargetCompanyData): Promise<TargetCompany> {
    try {
      const { data, error } = await supabase
        .from('target_companies_ses')
        .update(updateData)
        .eq('company_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating target company:', error);
        throw new Error(`Failed to update target company: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateTargetCompany:', error);
      throw error;
    }
  }

  /**
   * Delete target company
   */
  static async deleteTargetCompany(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('target_companies_ses')
        .delete()
        .eq('company_id', id);

      if (error) {
        console.error('Error deleting target company:', error);
        throw new Error(`Failed to delete target company: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteTargetCompany:', error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================
  
  /**
   * Get data statistics
   */
  static async getDataStatistics() {
    try {
      const [segmentsCount, keywordsCount, baseUrlsCount, companiesCount] = await Promise.all([
        this.getSegments().then(data => data.length),
        this.getKeywords().then(data => data.length),
        this.getBaseUrls().then(data => data.length),
        this.getTargetCompanies().then(data => data.length)
      ]);

      return {
        segments: segmentsCount,
        keywords: keywordsCount,
        baseUrls: baseUrlsCount,
        targetCompanies: companiesCount
      };
    } catch (error) {
      console.error('Error getting data statistics:', error);
      return {
        segments: 0,
        keywords: 0,
        baseUrls: 0,
        targetCompanies: 0
      };
    }
  }

  /**
   * Get segments with counts
   */
  static async getSegmentsWithCounts(): Promise<(Segment & { keywords_count: number; base_urls_count: number })[]> {
    try {
      const segments = await this.getSegments();
      const segmentsWithCounts = await Promise.all(
        segments.map(async (segment) => {
          const [keywordsCount, baseUrlsCount] = await Promise.all([
            this.getKeywordsBySegment(segment.segment_id).then(data => data.length),
            this.getBaseUrlsBySegment(segment.segment_id).then(data => data.length)
          ]);

          return {
            ...segment,
            keywords_count: keywordsCount,
            base_urls_count: baseUrlsCount
          };
        })
      );

      return segmentsWithCounts;
    } catch (error) {
      console.error('Error getting segments with counts:', error);
      throw error;
    }
  }
}
