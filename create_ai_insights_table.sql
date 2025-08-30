-- Create AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    inquiry_id TEXT NOT NULL,
    clarification_points TEXT[] DEFAULT '{}',
    conversation_points TEXT[] DEFAULT '{}',
    assumptions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on inquiry_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_insights_inquiry_id ON ai_insights(inquiry_id);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
CREATE POLICY "Users can view their own ai_insights" ON ai_insights
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own ai_insights" ON ai_insights
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own ai_insights" ON ai_insights
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own ai_insights" ON ai_insights
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_insights_updated_at
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_insights_updated_at();

-- Insert sample data (optional)
INSERT INTO ai_insights (inquiry_id, clarification_points, conversation_points, assumptions) VALUES
('INQ-001', 
 ARRAY['What is the expected timeline for project completion?', 'Are there any specific regulatory requirements?'], 
 ARRAY['Discuss previous project experience in similar industries', 'Explore potential collaboration opportunities'], 
 ARRAY['Client has budget allocated for this project', 'Project requires environmental compliance']
),
('INQ-002', 
 ARRAY['What is the scope of engineering services required?', 'Are there existing technical specifications?'], 
 ARRAY['Share case studies of similar projects', 'Discuss team expertise and qualifications'], 
 ARRAY['Client has basic project requirements defined', 'Project is in early planning phase']
);
