import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: envCheck.hasSupabaseUrl && envCheck.hasServiceKey 
        ? 'All required environment variables are set' 
        : 'Some environment variables are missing'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
