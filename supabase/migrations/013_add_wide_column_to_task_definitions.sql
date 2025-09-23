-- Add wide column to task_definitions table
ALTER TABLE task_definitions 
ADD COLUMN IF NOT EXISTS wide boolean DEFAULT false;

-- Create index for efficient querying by wide status
CREATE INDEX IF NOT EXISTS idx_task_definitions_wide 
ON task_definitions(wide) 
WHERE wide = true;

-- Add comment to explain the column purpose
COMMENT ON COLUMN task_definitions.wide IS 'If true, this task should be displayed as a wide tile in the EARN section';

-- Insert wide task for "SIGN UP FOR FREE TRIAL"
INSERT INTO task_definitions (
  task_id,
  unlock_level,
  kind,
  reward_payload,
  verification,
  active,
  wide
) VALUES (
  gen_random_uuid(),
  1,
  'wide_trial',
  '{"coins": 0, "tickets": 0}'::jsonb,
  'none',
  true,
  true
) ON CONFLICT DO NOTHING;
