-- Create user_click_tracking table to link user_id with clickid from PropellerAds
CREATE TABLE user_click_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  clickid VARCHAR(255) NOT NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE user_click_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage user_click_tracking" ON user_click_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own records
CREATE POLICY "Users can read their own click tracking" ON user_click_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_user_click_tracking_user_id ON user_click_tracking(user_id);
CREATE INDEX idx_user_click_tracking_clickid ON user_click_tracking(clickid);
CREATE UNIQUE INDEX idx_user_click_tracking_user_clickid ON user_click_tracking(user_id, clickid);

-- Add comment for documentation
COMMENT ON TABLE user_click_tracking IS 'Tracks which PropellerAds clickid each user came from';
COMMENT ON COLUMN user_click_tracking.clickid IS 'PropellerAds click identifier from startapp parameter';
COMMENT ON COLUMN user_click_tracking.first_seen_at IS 'When the user was first associated with this clickid';
