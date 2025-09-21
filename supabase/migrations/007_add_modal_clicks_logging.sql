-- Create modal_clicks table for logging all modal interactions
CREATE TABLE IF NOT EXISTS modal_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  session_id text NOT NULL,
  level int NOT NULL,
  click_type text NOT NULL, -- 'claim', 'bonus', 'try_for_free', 'close', 'overlay'
  modal_type text NOT NULL, -- 'level_up', 'task_claim', etc.
  click_timestamp timestamptz DEFAULT now(),
  user_agent text,
  ip_address inet,
  additional_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_modal_clicks_user_id ON modal_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_modal_clicks_session_id ON modal_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_modal_clicks_level ON modal_clicks(level);
CREATE INDEX IF NOT EXISTS idx_modal_clicks_click_type ON modal_clicks(click_type);
CREATE INDEX IF NOT EXISTS idx_modal_clicks_modal_type ON modal_clicks(modal_type);
CREATE INDEX IF NOT EXISTS idx_modal_clicks_created_at ON modal_clicks(created_at);

-- Note: Foreign key constraint removed as user_id is now text type
-- This allows for more flexible user identification

-- Add RLS (Row Level Security) policy
ALTER TABLE modal_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own clicks
CREATE POLICY "Users can view their own modal clicks" ON modal_clicks
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for service role to insert clicks
CREATE POLICY "Service role can insert modal clicks" ON modal_clicks
  FOR INSERT WITH CHECK (true);

-- Create policy for service role to update clicks
CREATE POLICY "Service role can update modal clicks" ON modal_clicks
  FOR UPDATE USING (true);

-- Create policy for service role to delete clicks
CREATE POLICY "Service role can delete modal clicks" ON modal_clicks
  FOR DELETE USING (true);
