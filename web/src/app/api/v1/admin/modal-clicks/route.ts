import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const level = searchParams.get('level');
    const clickType = searchParams.get('clickType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('modal_clicks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (level) {
      query = query.eq('level', parseInt(level));
    }
    if (clickType) {
      query = query.eq('click_type', clickType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching modal clicks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch modal clicks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      clicks: data,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in modal clicks admin API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear old logs (for cleanup)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('olderThan'); // ISO date string
    const userId = searchParams.get('userId');

    if (!olderThan) {
      return NextResponse.json(
        { error: 'olderThan parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('modal_clicks')
      .delete()
      .lt('created_at', olderThan);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error, count } = await query;

    if (error) {
      console.error('Error deleting modal clicks:', error);
      return NextResponse.json(
        { error: 'Failed to delete modal clicks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: count 
    });

  } catch (error) {
    console.error('Error in modal clicks delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
