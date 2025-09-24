export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('dev_session')?.value
    
    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { clickid } = body

    if (!clickid || typeof clickid !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid clickid' },
        { status: 400 }
      )
    }

    // Check if user already has a clickid associated
    const existing = await withClient(async (c) => {
      const { rows } = await c.query(
        'SELECT clickid FROM user_click_tracking WHERE user_id = $1 LIMIT 1',
        [userId]
      )
      return rows[0]?.clickid
    })

    // If user already has a clickid, return it
    if (existing) {
      return NextResponse.json({
        success: true,
        clickid: existing,
        isNew: false
      })
    }

    // Associate user with clickid (insert with ON CONFLICT DO NOTHING)
    const result = await withClient(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO user_click_tracking (user_id, clickid) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, clickid) DO NOTHING
         RETURNING clickid, first_seen_at`,
        [userId, clickid]
      )
      return rows[0]
    })

    if (result) {
      return NextResponse.json({
        success: true,
        clickid: result.clickid,
        firstSeenAt: result.first_seen_at,
        isNew: true
      })
    } else {
      // Record already exists (race condition)
      const existingClickid = await withClient(async (c) => {
        const { rows } = await c.query(
          'SELECT clickid FROM user_click_tracking WHERE user_id = $1 LIMIT 1',
          [userId]
        )
        return rows[0]?.clickid
      })

      return NextResponse.json({
        success: true,
        clickid: existingClickid,
        isNew: false
      })
    }

  } catch (error) {
    console.error('Error tracking user click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('dev_session')?.value
    
    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      )
    }

    // Get user's clickid
    const result = await withClient(async (c) => {
      const { rows } = await c.query(
        'SELECT clickid, first_seen_at FROM user_click_tracking WHERE user_id = $1 LIMIT 1',
        [userId]
      )
      return rows[0]
    })

    if (result) {
      return NextResponse.json({
        success: true,
        clickid: result.clickid,
        firstSeenAt: result.first_seen_at
      })
    } else {
      return NextResponse.json({
        success: false,
        clickid: null
      })
    }

  } catch (error) {
    console.error('Error getting user click tracking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
