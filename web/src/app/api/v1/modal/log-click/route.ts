import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured. Please set SUPABASE environment variables.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      level, 
      clickType, 
      modalType = 'level_up',
      userAgent,
      ipAddress,
      additionalData = {}
    } = body;

    // Validate required fields
    if (!userId || !sessionId || !level || !clickType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, level, clickType' },
        { status: 400 }
      );
    }

    // Get client IP if not provided
    const clientIP = ipAddress || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';

    // Get user agent if not provided
    const clientUserAgent = userAgent || 
      request.headers.get('user-agent') || 
      'unknown';

    // Insert the modal click log
    const { data, error } = await supabase
      .from('modal_clicks')
      .insert({
        user_id: userId,
        session_id: sessionId,
        level: parseInt(level),
        click_type: clickType,
        modal_type: modalType,
        user_agent: clientUserAgent,
        ip_address: clientIP,
        additional_data: additionalData
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging modal click:', error);
      return NextResponse.json(
        { error: 'Failed to log modal click' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      clickId: data.id 
    });

  } catch (error) {
    console.error('Error in modal click logging API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve modal clicks (for debugging/admin purposes)
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured. Please set SUPABASE environment variables.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('modal_clicks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (level) {
      query = query.eq('level', parseInt(level));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching modal clicks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch modal clicks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      clicks: data 
    });

  } catch (error) {
    console.error('Error in modal clicks GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
