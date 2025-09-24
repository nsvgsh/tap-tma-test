export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'

interface PostbackRequest {
  goalId: number
  clickid: string
  payout?: number
}

interface AdConfig {
  id: number
  goal_id: number
  name: string
  url_template: string
  is_active: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: PostbackRequest = await req.json()
    
    const { goalId, clickid, payout } = body

    // Validate required fields
    if (!goalId || !clickid) {
      return NextResponse.json(
        { error: 'Missing required fields: goalId, clickid' },
        { status: 400 }
      )
    }

    // Get postback configuration from database
    const config = await withClient(async (c) => {
      const result = await c.query(
        'SELECT * FROM ad_config WHERE goal_id = $1 AND is_active = true',
        [goalId]
      )
      return result.rows[0] as AdConfig | undefined
    })

    if (!config) {
      return NextResponse.json(
        { error: `No active configuration found for goal ${goalId}` },
        { status: 404 }
      )
    }

    // Build postback URL
    const postbackUrl = buildPostbackUrl(config.url_template, clickid, payout)

    // Send postback
    const postbackResult = await sendPostback(postbackUrl)

    // Log the postback attempt
    await logPostbackAttempt(goalId, clickid, postbackUrl, postbackResult.success, postbackResult.error)

    return NextResponse.json({
      success: postbackResult.success,
      goalId,
      clickid,
      url: postbackUrl,
      error: postbackResult.error
    })

  } catch (error) {
    console.error('Error sending postback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function buildPostbackUrl(template: string, clickid: string, payout?: number): string {
  let url = template.replace('${SUBID}', encodeURIComponent(clickid))
  
  if (payout !== undefined) {
    url = url.replace('${PAYOUT}', payout.toString())
  } else {
    // Remove payout parameter if not provided
    url = url.replace(/[?&]payout=\$\{PAYOUT\}/g, '')
  }
  
  return url
}

async function sendPostback(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TMA-PropellerAds-Postback/1.0'
      },
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return { success: true }
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

async function logPostbackAttempt(
  goalId: number, 
  clickid: string, 
  url: string, 
  success: boolean, 
  error?: string
) {
  try {
    await withClient(async (c) => {
      await c.query(
        `INSERT INTO ad_log (clickid, original_url, query_params, user_agent, ip_address, redirect_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `postback_${goalId}_${Date.now()}`,
          url,
          JSON.stringify({ goalId, clickid, success, error }),
          'PostbackService/1.0',
          'internal',
          null
        ]
      )
    })
  } catch (logError) {
    console.error('Failed to log postback attempt:', logError)
    // Don't throw - logging failure shouldn't break postback flow
  }
}
