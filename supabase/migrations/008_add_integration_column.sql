-- Add integration column to level_events table
-- This column determines if a level should use custom modal configuration
ALTER TABLE level_events 
ADD COLUMN IF NOT EXISTS integration boolean DEFAULT false;

-- Create index for efficient querying by integration status
CREATE INDEX IF NOT EXISTS idx_level_events_integration 
ON level_events(integration) 
WHERE integration = true;

-- Add comment to explain the column purpose
COMMENT ON COLUMN level_events.integration IS 'If true, this level should use custom modal configuration from the database instead of hardcoded JSON';
