-- Create ad_log table for tracking PropellerAds clicks
CREATE TABLE ad_log (
  id SERIAL PRIMARY KEY,
  clickid VARCHAR(255) NOT NULL,
  original_url TEXT NOT NULL,
  query_params JSONB NOT NULL,
  user_agent TEXT,
  ip_address INET,
  redirect_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE ad_log ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage ad_log" ON ad_log
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read ad_log" ON ad_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_ad_log_clickid ON ad_log(clickid);
CREATE INDEX idx_ad_log_created_at ON ad_log(created_at);
CREATE INDEX idx_ad_log_query_params ON ad_log USING GIN(query_params);

-- Add comment for documentation
COMMENT ON TABLE ad_log IS 'Logs PropellerAds clicks and redirects for conversion tracking';
COMMENT ON COLUMN ad_log.clickid IS 'Unique click identifier from PropellerAds';
COMMENT ON COLUMN ad_log.query_params IS 'All query parameters from the original click URL';
COMMENT ON COLUMN ad_log.redirect_url IS 'Final redirect URL to Telegram bot';
