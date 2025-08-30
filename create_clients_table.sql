-- Create clients table for comprehensive client management
-- Run this in your Supabase SQL editor

-- Create the clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    industry VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect', 'lead', 'customer', 'churned')),
    relationship_status VARCHAR(20) DEFAULT 'new' CHECK (relationship_status IN ('new', 'developing', 'established', 'at_risk', 'recovered')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    tags TEXT[] DEFAULT '{}',
    contact_person VARCHAR(255),
    website VARCHAR(500),
    address TEXT,
    notes TEXT,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    reactivation_attempts INTEGER DEFAULT 0,
    last_reactivation_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_interactions table for tracking all client communications
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'proposal', 'follow_up', 'reactivation')),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('positive', 'neutral', 'negative', 'no_response', 'scheduled')),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_reactivations table for tracking reactivation strategies
CREATE TABLE IF NOT EXISTS public.client_reactivations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    strategy VARCHAR(50) NOT NULL CHECK (strategy IN ('email_campaign', 'linkedin_outreach', 'phone_call', 'direct_mail', 'referral_request')),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'successful', 'failed', 'paused')),
    attempts INTEGER DEFAULT 0,
    last_attempt_date TIMESTAMP WITH TIME ZONE NOT NULL,
    next_attempt_date TIMESTAMP WITH TIME ZONE,
    success_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_to UUID REFERENCES public.team_members(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table for project management
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_hours INTEGER NOT NULL,
    actual_hours INTEGER DEFAULT 0,
    budget DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    team_members UUID[] DEFAULT '{}',
    project_manager UUID REFERENCES public.team_members(id) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('consulting', 'implementation', 'maintenance', 'training', 'audit', 'research')),
    tags TEXT[] DEFAULT '{}',
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    deliverables TEXT[] DEFAULT '{}',
    assigned_to UUID REFERENCES public.team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_deliverables table
CREATE TABLE IF NOT EXISTS public.project_deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('document', 'presentation', 'report', 'code', 'design', 'training_material')),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'under_review', 'completed', 'approved')),
    due_date DATE NOT NULL,
    completed_date DATE,
    assigned_to UUID REFERENCES public.team_members(id),
    file_urls TEXT[] DEFAULT '{}',
    review_required BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES public.team_members(id),
    review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_resources table for resource allocation
CREATE TABLE IF NOT EXISTS public.project_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('project_manager', 'team_lead', 'developer', 'designer', 'analyst', 'tester', 'consultant')),
    allocation_percentage INTEGER NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    start_date DATE NOT NULL,
    end_date DATE,
    hourly_rate DECIMAL(10,2),
    total_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON public.clients(industry);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_priority ON public.clients(priority);
CREATE INDEX IF NOT EXISTS idx_clients_last_contact ON public.clients(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_clients_next_follow_up ON public.clients(next_follow_up);

CREATE INDEX IF NOT EXISTS idx_client_interactions_client_id ON public.client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON public.client_interactions(type);
CREATE INDEX IF NOT EXISTS idx_client_interactions_date ON public.client_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_client_interactions_assigned_to ON public.client_interactions(assigned_to);

CREATE INDEX IF NOT EXISTS idx_client_reactivations_client_id ON public.client_reactivations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_reactivations_status ON public.client_reactivations(status);
CREATE INDEX IF NOT EXISTS idx_client_reactivations_strategy ON public.client_reactivations(strategy);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager ON public.projects(project_manager);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON public.projects(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON public.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON public.project_milestones(due_date);

CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_id ON public.project_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_status ON public.project_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_assigned_to ON public.project_deliverables(assigned_to);

CREATE INDEX IF NOT EXISTS idx_project_resources_project_id ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_team_member ON public.project_resources(team_member_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reactivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "Users can view all clients" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "Users can insert clients" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update clients" ON public.clients
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete clients" ON public.clients
    FOR DELETE USING (true);

-- Create RLS policies for client_interactions table
CREATE POLICY "Users can view all client interactions" ON public.client_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert client interactions" ON public.client_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update client interactions" ON public.client_interactions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete client interactions" ON public.client_interactions
    FOR DELETE USING (true);

-- Create RLS policies for client_reactivations table
CREATE POLICY "Users can view all client reactivations" ON public.client_reactivations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert client reactivations" ON public.client_reactivations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update client reactivations" ON public.client_reactivations
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete client reactivations" ON public.client_reactivations
    FOR DELETE USING (true);

-- Create RLS policies for projects table
CREATE POLICY "Users can view all projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Users can insert projects" ON public.projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update projects" ON public.projects
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete projects" ON public.projects
    FOR DELETE USING (true);

-- Create RLS policies for project_milestones table
CREATE POLICY "Users can view all project milestones" ON public.project_milestones
    FOR SELECT USING (true);

CREATE POLICY "Users can insert project milestones" ON public.project_milestones
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update project milestones" ON public.project_milestones
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete project milestones" ON public.project_milestones
    FOR DELETE USING (true);

-- Create RLS policies for project_deliverables table
CREATE POLICY "Users can view all project deliverables" ON public.project_deliverables
    FOR SELECT USING (true);

CREATE POLICY "Users can insert project deliverables" ON public.project_deliverables
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update project deliverables" ON public.project_deliverables
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete project deliverables" ON public.project_deliverables
    FOR DELETE USING (true);

-- Create RLS policies for project_resources table
CREATE POLICY "Users can view all project resources" ON public.project_resources
    FOR SELECT USING (true);

CREATE POLICY "Users can insert project resources" ON public.project_resources
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update project resources" ON public.project_resources
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete project resources" ON public.project_resources
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
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_interactions_updated_at 
    BEFORE UPDATE ON public.client_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_reactivations_updated_at 
    BEFORE UPDATE ON public.client_reactivations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at 
    BEFORE UPDATE ON public.project_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at 
    BEFORE UPDATE ON public.project_deliverables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_resources_updated_at 
    BEFORE UPDATE ON public.project_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.clients (
    name, 
    company, 
    email, 
    phone, 
    industry, 
    status, 
    relationship_status, 
    priority, 
    tags, 
    contact_person, 
    website, 
    notes
) VALUES 
(
    'John Smith',
    'TechCorp Solutions',
    'john.smith@techcorp.com',
    '+1 (555) 123-4567',
    'Technology',
    'customer',
    'established',
    'high',
    ARRAY['VIP', 'Enterprise'],
    'John Smith',
    'https://techcorp.com',
    'Key client with multiple ongoing projects. Very satisfied with our services.'
),
(
    'Sarah Johnson',
    'Global Manufacturing Inc',
    'sarah.johnson@globalmfg.com',
    '+1 (555) 234-5678',
    'Manufacturing',
    'customer',
    'established',
    'medium',
    ARRAY['Enterprise', 'High-Potential'],
    'Sarah Johnson',
    'https://globalmfg.com',
    'Long-term client. Interested in expanding our partnership.'
),
(
    'Mike Chen',
    'StartupXYZ',
    'mike.chen@startupxyz.com',
    '+1 (555) 345-6789',
    'Technology',
    'prospect',
    'new',
    'high',
    ARRAY['Startup', 'High-Potential'],
    'Mike Chen',
    'https://startupxyz.com',
    'New startup looking for strategic consulting services.'
)
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.clients TO public;
GRANT ALL ON public.client_interactions TO public;
GRANT ALL ON public.client_reactivations TO public;
GRANT ALL ON public.projects TO public;
GRANT ALL ON public.project_milestones TO public;
GRANT ALL ON public.project_deliverables TO public;
GRANT ALL ON public.project_resources TO public;
GRANT USAGE ON SCHEMA public TO public;
