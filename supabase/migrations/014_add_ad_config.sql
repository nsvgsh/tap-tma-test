-- Create ad_config table for PropellerAds postback configuration
CREATE TABLE ad_config (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  url_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE ad_config ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage ad_config" ON ad_config
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read ad_config" ON ad_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default PropellerAds configurations
INSERT INTO ad_config (goal_id, name, url_template, is_active) VALUES
(1, 'App Open', 'http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}', true),
(2, 'Try for Trial', 'http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}&goal=2', true),
(3, 'Monetag Ad View', 'http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}&goal=3', true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ad_config_updated_at 
  BEFORE UPDATE ON ad_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_ad_config_goal_id ON ad_config(goal_id);
CREATE INDEX idx_ad_config_active ON ad_config(is_active) WHERE is_active = true;
