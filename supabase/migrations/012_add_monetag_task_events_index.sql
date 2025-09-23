-- Add index for Monetag task events queries
-- This optimizes the query in /api/v1/tasks/route.ts that checks for Monetag events
CREATE INDEX IF NOT EXISTS idx_ad_events_monetag_task_claim 
ON ad_events(user_id, provider, placement, status) 
WHERE provider = 'monetag' AND placement = 'task_claim' AND status = 'closed';

-- Add index for postback endpoint queries
CREATE INDEX IF NOT EXISTS idx_ad_events_monetag_postback 
ON ad_events(user_id, provider, placement, status, created_at) 
WHERE provider = 'monetag' AND placement = 'task_claim';

