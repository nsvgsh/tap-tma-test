-- Add Monetag configuration for local development
INSERT INTO game_config (key, value) VALUES 
  ('monetag_enabled', 'false'::jsonb),
  ('monetag_zone_id', '"MAIN_ZONE_ID"'::jsonb),
  ('monetag_sdk_url', '"https://sdk.monetag.com/sdk.js"'::jsonb),
  ('unlock_policy', '"any"'::jsonb),
  ('log_failed_ad_events', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
