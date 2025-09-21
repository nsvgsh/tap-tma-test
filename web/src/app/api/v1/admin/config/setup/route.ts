export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-dev-token') || ''
  if (!process.env.DEV_TOKEN || token !== process.env.DEV_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const result = await withClient(async (c) => {
    // Setup basic game configuration for local development
    const configs = [
      { key: 'thresholds', value: { base: 10, growth: 'linear', batch_min_interval_ms: 100 } },
      { key: 'level_bonus_policy', value: { coins: 'multiply', tickets: 'add', coin_multiplier: 'multiply' } },
      { key: 'claim_ttl_seconds', value: 10 },
      { key: 'coins_per_tap', value: 1 },
      { key: 'ad_ttl_seconds', value: 180 },
      { key: 'ingest', value: { clamp_soft: true, max_taps_per_batch: 50 } },
      
      // Monetag configuration for development
      { key: 'monetag_enabled', value: false }, // Disabled by default for local dev
      { key: 'monetag_zone_id', value: 'MAIN_ZONE_ID' }, // Placeholder
      { key: 'monetag_sdk_url', value: 'https://sdk.monetag.com/sdk.js' }, // Default SDK URL
      { key: 'unlock_policy', value: 'any' },
      { key: 'log_failed_ad_events', value: true }
    ]

    const results = []
    for (const config of configs) {
      try {
        await c.query(
          'INSERT INTO game_config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          [config.key, JSON.stringify(config.value)]
        )
        results.push({ key: config.key, status: 'success' })
      } catch (error) {
        results.push({ key: config.key, status: 'error', error: String(error) })
      }
    }

    return results
  })

  return NextResponse.json({ setup: result })
}
