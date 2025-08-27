-- Quick fix for RLS policies on existing team_members table
-- Run this in your Supabase SQL editor to fix the current error

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to delete team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow anonymous users to read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all users to read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all users to insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all users to update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all users to delete team_members" ON public.team_members;

-- Create new policies that allow ALL users (including anonymous) to perform all operations
CREATE POLICY "Allow all users to read team_members" 
ON public.team_members FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow all users to insert team_members" 
ON public.team_members FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Allow all users to update team_members" 
ON public.team_members FOR UPDATE 
TO public
USING (true);

CREATE POLICY "Allow all users to delete team_members" 
ON public.team_members FOR DELETE 
TO public
USING (true);

-- Grant permissions to public (all users)
GRANT ALL ON public.team_members TO public;
GRANT USAGE ON SCHEMA public TO public;
