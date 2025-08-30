-- Create email_drafts table
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'delivered')),
  created_by TEXT NOT NULL,
  delivered_status TEXT DEFAULT 'pending' CHECK (delivered_status IN ('pending', 'delivered', 'failed')),
  replied BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_drafts_status ON email_drafts(status);
CREATE INDEX IF NOT EXISTS idx_email_drafts_created_at ON email_drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_drafts_recipient ON email_drafts(recipient);
CREATE INDEX IF NOT EXISTS idx_email_drafts_created_by ON email_drafts(created_by);

-- Enable Row Level Security
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own email drafts" ON email_drafts
  FOR SELECT USING (auth.uid()::text = created_by);

CREATE POLICY "Users can create their own email drafts" ON email_drafts
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their own email drafts" ON email_drafts
  FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete their own email drafts" ON email_drafts
  FOR DELETE USING (auth.uid()::text = created_by);

-- Create trigger to update created_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_drafts_created_at 
  BEFORE UPDATE ON email_drafts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO email_drafts (subject, body, recipient, created_by, status, delivered_status, replied) VALUES
(
  'Partnership Opportunity Discussion',
  'Hi there,\n\nI hope this email finds you well. I recently came across your company''s work in sustainable infrastructure and was impressed by your innovative approach.\n\nAt SES, we''ve been developing cutting-edge solutions that align perfectly with your company''s vision. I believe there''s a great opportunity for collaboration that could benefit both our organizations.\n\nWould you be interested in scheduling a brief call to discuss potential partnership opportunities?\n\nBest regards,\n[Your Name]\nSES Team',
  'john.doe@engineeringcorp.com',
  'user123',
  'draft',
  'pending',
  false
),
(
  'Follow-up: Innovation Collaboration',
  'Dear Team,\n\nThank you for your interest in our previous discussion about potential collaboration opportunities.\n\nI wanted to follow up and see if you''ve had a chance to review the materials I sent over. I''m particularly excited about the potential synergies between our companies.\n\nPlease let me know if you have any questions or if you''d like to schedule a follow-up meeting.\n\nBest regards,\n[Your Name]',
  'sarah.smith@techpartners.com',
  'user123',
  'draft',
  'pending',
  false
),
(
  'Sustainable Infrastructure Solutions',
  'Hello,\n\nI hope you''re having a productive day. I wanted to reach out because I believe there''s a significant opportunity for our companies to collaborate on some exciting sustainable infrastructure projects.\n\nYour company''s track record in engineering excellence is well-known, and we think there''s great potential for a strategic partnership in this area.\n\nLet me know if you''d be interested in exploring this further.\n\nBest regards,\n[Your Name]',
  'mike.johnson@greenbuild.com',
  'user456',
  'sent',
  'delivered',
  true
);

-- Grant necessary permissions
GRANT ALL ON email_drafts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
