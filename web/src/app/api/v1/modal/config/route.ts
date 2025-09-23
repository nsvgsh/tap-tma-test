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
        { error: 'Database not configured. Please set SUPABASE environment variables.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');

    if (!level) {
      return NextResponse.json(
        { error: 'Level parameter is required' },
        { status: 400 }
      );
    }

    const levelNum = parseInt(level);
    if (isNaN(levelNum)) {
      return NextResponse.json(
        { error: 'Invalid level parameter' },
        { status: 400 }
      );
    }

    // Check if this level has integration enabled
    const { data: levelEvents, error: levelError } = await supabase
      .from('level_events')
      .select('integration, level, created_at, user_id')
      .eq('level', levelNum)
      .order('created_at', { ascending: false })
      .limit(10);

    if (levelError) {
      console.error('Error checking level integration:', levelError);
      return NextResponse.json(
        { error: 'Failed to check level integration' },
        { status: 500 }
      );
    }

    // Check if any recent level event has integration enabled
    const hasIntegration = levelEvents && levelEvents.some(event => event.integration === true);

    console.log(`Level ${levelNum} integration check:`, {
      levelEvents: levelEvents?.length || 0,
      hasIntegration,
      events: levelEvents?.map(e => ({ 
        level: e.level, 
        integration: e.integration, 
        user_id: e.user_id,
        created_at: e.created_at 
      }))
    });

    // If no events found for this level, log a warning
    if (!levelEvents || levelEvents.length === 0) {
      console.warn(`No level_events found for level ${levelNum}. Make sure the level exists in the database.`);
    } else {
      // Log all integration values for debugging
      const integrationValues = levelEvents.map(e => e.integration);
      console.log(`Integration values for level ${levelNum}:`, integrationValues);
    }

    // If integration is enabled for this level, return the custom config
    if (hasIntegration) {
      // For now, return the same config for all integrated levels
      // In the future, this could be stored in a separate table
      const customConfig = {
        rewardsLabel: "CONGRATS! YOU GOT ACCESS",
        rewardsLayout: "gift-center",
        actionsLayout: "wide-green",
        giftIcon: "/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png"
      };

      return NextResponse.json({
        success: true,
        hasCustomConfig: true,
        config: customConfig
      });
    }

    // No custom config for this level
    return NextResponse.json({
      success: true,
      hasCustomConfig: false,
      config: null
    });

  } catch (error) {
    console.error('Error in modal config API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
