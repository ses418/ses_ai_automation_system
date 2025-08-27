-- Create team_members table if it doesn't exist
-- Run this in your Supabase SQL editor

-- Create the team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    role VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    dashboard_access VARCHAR(20) DEFAULT 'visible' CHECK (dashboard_access IN ('visible', 'hidden')),
    profile_picture VARCHAR(500),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON public.team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_date_added ON public.team_members(date_added);

-- Enable Row Level Security (RLS)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to delete team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow anonymous users to read team_members" ON public.team_members;

-- Create RLS policies
-- Policy 1: Allow ALL users (authenticated and anonymous) to read team members
CREATE POLICY "Allow all users to read team_members" 
ON public.team_members FOR SELECT 
TO public
USING (true);

-- Policy 2: Allow ALL users (authenticated and anonymous) to insert team members
CREATE POLICY "Allow all users to insert team_members" 
ON public.team_members FOR INSERT 
TO public
WITH CHECK (true);

-- Policy 3: Allow ALL users (authenticated and anonymous) to update team members
CREATE POLICY "Allow all users to update team_members" 
ON public.team_members FOR UPDATE 
TO public
USING (true);

-- Policy 4: Allow ALL users (authenticated and anonymous) to delete team members
CREATE POLICY "Allow all users to delete team_members" 
ON public.team_members FOR DELETE 
TO public
USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER IF NOT EXISTS update_team_members_updated_at 
    BEFORE UPDATE ON public.team_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO public.team_members (name, email, password_hash, phone, department, role, status, dashboard_access, is_admin) 
VALUES 
    ('Sarah Johnson', 'sarah.johnson@ses.com', '$2a$10$dummy.hash.sample1', '+1 (555) 123-4567', 'Executive', 'Head of SES', 'active', 'visible', true),
    ('Michael Chen', 'michael.chen@ses.com', '$2a$10$dummy.hash.sample2', '+1 (555) 234-5678', 'Engineering', 'Manager', 'active', 'visible', false),
    ('Emily Rodriguez', 'emily.rodriguez@ses.com', '$2a$10$dummy.hash.sample3', '+1 (555) 345-6789', 'Marketing', 'HOD', 'active', 'visible', false),
    ('David Kim', 'david.kim@ses.com', '$2a$10$dummy.hash.sample4', '+1 (555) 456-7890', 'Engineering', 'Engineer', 'active', 'visible', false),
    ('Lisa Wang', 'lisa.wang@ses.com', '$2a$10$dummy.hash.sample5', '+1 (555) 567-8901', 'HR', 'Staff', 'active', 'visible', false)
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.team_members TO public;
GRANT USAGE ON SCHEMA public TO public;
