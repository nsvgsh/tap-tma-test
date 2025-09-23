-- Update ingest_taps_v2 to respect integration column
-- If integration = true, award zero rewards instead of template rewards
CREATE OR REPLACE FUNCTION ingest_taps_v2(
  p_batch_id uuid,
  p_user_id uuid,
  p_session_id uuid,
  p_client_seq bigint,
  p_taps int,
  p_coins_delta bigint,
  p_checksum text
) RETURNS TABLE(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint,
  leveled_up jsonb,
  next_threshold jsonb
) LANGUAGE plpgsql AS $$
DECLARE
  v_counters user_counters%rowtype;
  v_new_coins bigint;
  v_new_total_taps bigint;
  v_level int;
  v_threshold int;
  v_base int;
  v_any_leveled boolean := false;
  v_tpl_payload jsonb;
  v_tpl_id uuid;
  v_reward_coins_total bigint := 0;
  v_reward_tickets_total int := 0;
  v_reward_coin_mult_delta numeric := 0;
  v_integration_enabled boolean := false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO user_counters(user_id, coins, tickets, coin_multiplier, level, total_taps, session_epoch, current_session_id, last_applied_seq)
    VALUES (p_user_id, 0, 0, 1.0, 0, 0, gen_random_uuid(), p_session_id, p_client_seq);
    SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;
  END IF;

  v_new_coins := coalesce(v_counters.coins,0) + greatest(0, p_coins_delta);
  v_new_total_taps := coalesce(v_counters.total_taps,0) + greatest(0, p_taps);
  v_level := coalesce(v_counters.level,0);

  -- level-up loop based on base threshold
  SELECT (value->>'base')::int INTO v_base FROM game_config WHERE key='thresholds';
  IF v_base IS NULL THEN v_base := 10; END IF;
  v_threshold := v_base * (v_level + 1);
  WHILE v_new_coins >= v_threshold LOOP
    v_new_coins := v_new_coins - v_threshold;
    v_level := v_level + 1;
    v_any_leveled := true;
    
    -- resolve per-level template with fallback to global default (level=0)
    SELECT payload, template_id, integration INTO v_tpl_payload, v_tpl_id, v_integration_enabled
      FROM (
        SELECT payload, template_id, integration FROM level_reward_templates
        WHERE active IS true AND level_reward_templates.level = v_level
        ORDER BY updated_at DESC
        LIMIT 1
      ) x;
    IF v_tpl_payload IS NULL THEN
      SELECT payload, template_id, integration INTO v_tpl_payload, v_tpl_id, v_integration_enabled
        FROM (
          SELECT payload, template_id, integration FROM level_reward_templates
          WHERE active IS true AND level_reward_templates.level = 0
          ORDER BY updated_at DESC
          LIMIT 1
        ) y;
    END IF;
    IF v_tpl_payload IS NULL THEN
      v_tpl_payload := '{"tickets":3}'::jsonb; -- minimal safe fallback
      v_integration_enabled := false;
    END IF;
    
    -- compute base reward from template and apply immediately
    -- If integration is enabled, award zero rewards
    DECLARE
      v_base_coins bigint;
      v_base_tickets int;
      v_base_coin_mult numeric;
    BEGIN
      IF v_integration_enabled THEN
        -- Integration levels get zero rewards
        v_base_coins := 0;
        v_base_tickets := 0;
        v_base_coin_mult := 0;
        -- Override payload to show zero rewards
        v_tpl_payload := '{"coins":0,"tickets":0}'::jsonb;
      ELSE
        -- Normal levels get template rewards
        v_base_coins := coalesce((v_tpl_payload->>'coins')::bigint, 0);
        v_base_tickets := coalesce((v_tpl_payload->>'tickets')::int, 0);
        v_base_coin_mult := coalesce((v_tpl_payload->>'coin_multiplier')::numeric, 0);
      END IF;
      
      v_reward_coins_total := v_reward_coins_total + v_base_coins;
      v_reward_tickets_total := v_reward_tickets_total + v_base_tickets;
      v_reward_coin_mult_delta := v_reward_coin_mult_delta + v_base_coin_mult;
      INSERT INTO level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        VALUES (p_user_id, v_level, v_base_coins, v_tpl_payload, true, v_tpl_id);
    END;
    v_threshold := v_base * (v_level + 1);
  END LOOP;

  UPDATE user_counters SET coins = v_new_coins + v_reward_coins_total,
                           tickets = coalesce(user_counters.tickets,0) + v_reward_tickets_total,
                           coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta,
                           total_taps = v_new_total_taps,
                           level = v_level,
                           last_applied_seq = p_client_seq,
                           updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO tap_batches(batch_id, user_id, session_id, client_seq, taps, coins_delta, checksum, status)
  VALUES(p_batch_id, p_user_id, p_session_id, p_client_seq, p_taps, p_coins_delta, p_checksum, 'applied');

  coins := v_new_coins + v_reward_coins_total;
  tickets := coalesce(v_counters.tickets,0) + v_reward_tickets_total;
  coin_multiplier := coalesce(v_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta;
  level := v_level;
  total_taps := v_new_total_taps;
  leveled_up := case when v_any_leveled then jsonb_build_object('level', v_level) else null end;
  -- update leaderboard projection
  INSERT INTO leaderboard_global(user_id, level, updated_at) VALUES (p_user_id, v_level, now())
    ON CONFLICT(user_id) DO UPDATE SET level=excluded.level, updated_at=now();
  next_threshold := _next_threshold(level);
  RETURN NEXT;
END;$$;
