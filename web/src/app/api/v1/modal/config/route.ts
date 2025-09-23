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

    // Test database connection first
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('level_reward_templates')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('Database connection successful');

    // Check if this level has integration enabled in templates
    console.log(`Querying level_reward_templates for level ${levelNum}...`);
    const { data: templates, error: templateError } = await supabase
      .from('level_reward_templates')
      .select('integration, level, active, template_id, updated_at')
      .eq('level', levelNum)
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (templateError) {
      console.error('Error checking level templates:', templateError);
      return NextResponse.json(
        { 
          error: 'Failed to check level templates',
          details: templateError.message,
          code: templateError.code
        },
        { status: 500 }
      );
    }

    // Check if any active template has integration enabled
    const hasIntegration = templates && templates.some(template => template.integration === true);

    console.log(`Level ${levelNum} template integration check:`, {
      templates: templates?.length || 0,
      hasIntegration,
      templateData: templates?.map(t => ({ 
        level: t.level, 
        integration: t.integration, 
        active: t.active,
        template_id: t.template_id,
        updated_at: t.updated_at 
      }))
    });

    // If no templates found for this level, try to find any templates (including inactive)
    if (!templates || templates.length === 0) {
      console.warn(`No active level_reward_templates found for level ${levelNum}. Checking all templates...`);
      
      const { data: allTemplates, error: allTemplatesError } = await supabase
        .from('level_reward_templates')
        .select('integration, level, active, template_id, updated_at')
        .eq('level', levelNum)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (allTemplatesError) {
        console.error('Error checking all templates:', allTemplatesError);
        return NextResponse.json(
          { 
            error: 'Failed to check level templates',
            details: allTemplatesError.message,
            code: allTemplatesError.code
          },
          { status: 500 }
        );
      }
      
      console.log(`All templates for level ${levelNum}:`, allTemplates);
      
      if (!allTemplates || allTemplates.length === 0) {
        console.warn(`No level_reward_templates found for level ${levelNum}. Make sure the level template exists in the database.`);
      }
    } else {
      // Log all integration values for debugging
      const integrationValues = templates.map(t => t.integration);
      console.log(`Integration values for level ${levelNum}:`, integrationValues);
      
      // Check if any integration value is truthy (not just true)
      const hasAnyIntegration = templates.some(template => template.integration);
      console.log(`Has any truthy integration for level ${levelNum}:`, hasAnyIntegration);
      
      // Log raw data for debugging
      console.log(`Raw template data for level ${levelNum}:`, JSON.stringify(templates, null, 2));
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
        config: customConfig,
        // Important: if integration is true, rewards should be zero
        zeroRewards: true,
        zeroRewardsPayload: {
          coins: 0,
          tickets: 0
        }
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
