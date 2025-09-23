-- Add integration column to level_reward_templates table
-- This column determines if a level template should use custom modal configuration
ALTER TABLE level_reward_templates 
ADD COLUMN IF NOT EXISTS integration boolean DEFAULT false;

-- Create index for efficient querying by integration status
CREATE INDEX IF NOT EXISTS idx_level_reward_templates_integration 
ON level_reward_templates(integration) 
WHERE integration = true;

-- Add comment to explain the column purpose
COMMENT ON COLUMN level_reward_templates.integration IS 'If true, this level template should use custom modal configuration from the database instead of hardcoded JSON';
