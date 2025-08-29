-- Create newsletters table
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    newsletter_id VARCHAR(50) UNIQUE NOT NULL,
    newsletter_type VARCHAR(50) NOT NULL CHECK (newsletter_type IN ('general', 'industry_specific')),
    subject_line TEXT NOT NULL,
    full_content TEXT NOT NULL,
    target_industry VARCHAR(100),
    approvalstatus VARCHAR(20) DEFAULT 'pending' CHECK (approvalstatus IN ('approved', 'pending', 'rejected')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent')),
    approved_by VARCHAR(100),
    project_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletters_newsletter_id ON public.newsletters(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_type ON public.newsletters(newsletter_type);
CREATE INDEX IF NOT EXISTS idx_newsletters_approvalstatus ON public.newsletters(approvalstatus);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_target_industry ON public.newsletters(target_industry);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON public.newsletters(created_at);

-- Create campaigns table for storing campaign data
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    targeted_industry TEXT[] NOT NULL,
    email_group TEXT[] NOT NULL,
    email_ids TEXT[] NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    timeline JSONB,
    allowed_newsletter_types TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_name ON public.campaigns(campaign_name);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);

-- Create campaign_newsletters junction table
CREATE TABLE IF NOT EXISTS public.campaign_newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    newsletter_id UUID REFERENCES public.newsletters(id) ON DELETE CASCADE,
    scheduled_date DATE,
    sent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, newsletter_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_campaign_newsletters_campaign ON public.campaign_newsletters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_newsletters_newsletter ON public.campaign_newsletters(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_campaign_newsletters_scheduled ON public.campaign_newsletters(scheduled_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_newsletters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for newsletters table
CREATE POLICY "Users can view all newsletters" ON public.newsletters
    FOR SELECT USING (true);

CREATE POLICY "Users can insert newsletters" ON public.newsletters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update newsletters" ON public.newsletters
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete newsletters" ON public.newsletters
    FOR DELETE USING (true);

-- Create RLS policies for campaigns table
CREATE POLICY "Users can view all campaigns" ON public.campaigns
    FOR SELECT USING (true);

CREATE POLICY "Users can insert campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update campaigns" ON public.campaigns
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete campaigns" ON public.campaigns
    FOR DELETE USING (true);

-- Create RLS policies for campaign_newsletters table
CREATE POLICY "Users can view all campaign newsletters" ON public.campaign_newsletters
    FOR SELECT USING (true);

CREATE POLICY "Users can insert campaign newsletters" ON public.campaign_newsletters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update campaign newsletters" ON public.campaign_newsletters
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete campaign newsletters" ON public.campaign_newsletters
    FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_newsletters_updated_at 
    BEFORE UPDATE ON public.newsletters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON public.campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.newsletters (
    newsletter_id, 
    newsletter_type, 
    subject_line, 
    full_content, 
    target_industry, 
    approvalstatus, 
    status, 
    approved_by, 
    project_id
) VALUES 
(
    'NL-001',
    'general',
    'Monthly Engineering Insights - January 2025',
    '<h1>Monthly Engineering Insights</h1><p>Welcome to our January newsletter featuring the latest developments in infrastructure engineering. This month we focus on sustainable building practices and innovative construction technologies.</p><h2>Key Highlights</h2><ul><li>New sustainable materials in construction</li><li>AI-powered project management tools</li><li>Green building certification updates</li></ul>',
    'Construction',
    'approved',
    'ready',
    'John Doe',
    'PROJ-001'
),
(
    'NL-002',
    'industry_specific',
    'Tech Industry Focus: AI in Engineering',
    '<h1>AI in Engineering</h1><p>Discover how artificial intelligence is revolutionizing the engineering sector. From automated design processes to predictive maintenance, AI is transforming how we approach complex engineering challenges.</p><h2>AI Applications</h2><ul><li>Generative design algorithms</li><li>Predictive analytics for infrastructure</li><li>Automated quality control systems</li></ul>',
    'Technology',
    'pending',
    'draft',
    '',
    'PROJ-002'
),
(
    'NL-003',
    'general',
    'Q1 2025 Engineering Trends Report',
    '<h1>Q1 2025 Engineering Trends</h1><p>As we move through the first quarter of 2025, several key trends are shaping the engineering landscape. Our analysis covers emerging technologies, regulatory changes, and market dynamics.</p><h2>Trends to Watch</h2><ul><li>Digital twin technology adoption</li><li>Circular economy principles</li><li>Advanced robotics in construction</li></ul>',
    'Manufacturing',
    'pending',
    'draft',
    '',
    'PROJ-003'
);

-- Insert sample campaign data
INSERT INTO public.campaigns (
    campaign_name,
    start_date,
    end_date,
    targeted_industry,
    email_group,
    email_ids,
    frequency,
    timeline,
    allowed_newsletter_types
) VALUES 
(
    'Q1 2025 Engineering Newsletter Campaign',
    '2025-01-01',
    '2025-03-31',
    ARRAY['Technology', 'Construction', 'Manufacturing'],
    ARRAY['VIP Clients', 'Enterprise'],
    ARRAY['client1@example.com', 'client2@example.com', 'client3@example.com'],
    'After 1 week',
    '[
        {"date": "2025-01-15", "newsletter-type": "general"},
        {"date": "2025-02-15", "newsletter-type": "industry_specific"},
        {"date": "2025-03-15", "newsletter-type": "general"}
    ]'::jsonb,
    ARRAY['general', 'industry_specific']
);

-- Link newsletters to campaign
INSERT INTO public.campaign_newsletters (campaign_id, newsletter_id, scheduled_date)
SELECT 
    c.id as campaign_id,
    n.id as newsletter_id,
    CASE 
        WHEN n.newsletter_id = 'NL-001' THEN '2025-01-15'::date
        WHEN n.newsletter_id = 'NL-002' THEN '2025-02-15'::date
        WHEN n.newsletter_id = 'NL-003' THEN '2025-03-15'::date
    END as scheduled_date
FROM public.campaigns c, public.newsletters n
WHERE c.campaign_name = 'Q1 2025 Engineering Newsletter Campaign'
AND n.newsletter_id IN ('NL-001', 'NL-002', 'NL-003');
