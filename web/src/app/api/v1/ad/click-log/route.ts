export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  console.log('Click log API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    const body = await req.json()
    console.log('Request body:', body);
    
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
      console.log('Missing required fields:', { clickid, originalUrl, queryParams });
      return NextResponse.json(
        { error: 'Missing required fields: clickid, originalUrl, queryParams' },
        { status: 400 }
      )
    }

    console.log('Logging click to database:', clickid);

    // Log the click to database
    const result = await withClient(async (c) => {
      console.log('Database client connected, executing query...');
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
      console.log('Database query executed successfully');

      return { success: true, clickid }
    })

    console.log('Click logged successfully:', result);
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Error logging PropellerAds click:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
