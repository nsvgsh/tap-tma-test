export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const {
      clickid,
      originalUrl,
      queryParams,
      userAgent,
      ipAddress,
      redirectUrl
    } = body

    // Validate required fields
    if (!clickid || !originalUrl || !queryParams) {
      return NextResponse.json(
        { error: 'Missing required fields: clickid, originalUrl, queryParams' },
        { status: 400 }
      )
    }

    // Log the click to database
    const result = await withClient(async (c) => {
      await c.query(
        `INSERT INTO ad_log (clickid, original_url, query_params, user_agent, ip_address, redirect_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          clickid,
          originalUrl,
          JSON.stringify(queryParams),
          userAgent || null,
          ipAddress || null,
          redirectUrl || null
        ]
      )

      return { success: true, clickid }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error logging PropellerAds click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
