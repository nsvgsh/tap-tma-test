export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-dev-token') || ''
  if (!process.env.DEV_TOKEN || token !== process.env.DEV_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const body = (await req.json().catch(() => ({}))) as { 
    enabled?: boolean
    zoneId?: string
    sdkUrl?: string
  }

  const result = await withClient(async (c) => {
    const configs = [
      { key: 'monetag_enabled', value: Boolean(body.enabled ?? false) },
      { key: 'monetag_zone_id', value: body.zoneId || 'MAIN_ZONE_ID' },
      { key: 'monetag_sdk_url', value: body.sdkUrl || 'https://sdk.monetag.com/sdk.js' },
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
        results.push({ key: config.key, value: config.value, status: 'success' })
      } catch (error) {
        results.push({ key: config.key, status: 'error', error: String(error) })
      }
    }

    return results
  })

  return NextResponse.json({ monetag_config: result })
}
