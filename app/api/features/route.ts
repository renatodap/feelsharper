import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/features - Get user's feature flags and access levels
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enabled feature flags
    const { data: featureFlags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('feature_name, is_enabled, rollout_percentage, config')
      .eq('is_enabled', true);

    if (flagsError) {
      return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 });
    }

    // Get user's beta access level
    const { data: betaAccess } = await supabase
      .from('beta_access')
      .select('access_level, features, expires_at')
      .eq('user_id', user.id)
      .single();

    // Get user's feature assignments (A/B testing)
    const { data: featureAssignments } = await supabase
      .from('user_feature_assignments')
      .select('feature_name, variant')
      .eq('user_id', user.id);

    // Get user's reputation for feature gating
    const { data: reputation } = await supabase
      .from('user_reputation')
      .select('trust_score, reputation')
      .eq('user_id', user.id)
      .single();

    // Determine which features user has access to
    const userFeatures: Record<string, any> = {};
    const userHash = parseInt(user.id.slice(-8), 16); // Simple hash for rollout

    featureFlags?.forEach(flag => {
      let hasAccess = false;

      // Check rollout percentage
      if (flag.rollout_percentage >= 100) {
        hasAccess = true;
      } else if (flag.rollout_percentage > 0) {
        const rolloutThreshold = (userHash % 100) < flag.rollout_percentage;
        hasAccess = rolloutThreshold;
      }

      // Check beta access
      if (betaAccess && flag.feature_name === 'beta_features') {
        hasAccess = true;
      }

      // Check reputation requirements
      if (flag.config?.min_trust_score && reputation) {
        hasAccess = hasAccess && reputation.trust_score >= flag.config.min_trust_score;
      }

      // Apply A/B testing variant
      const assignment = featureAssignments?.find(a => a.feature_name === flag.feature_name);
      
      userFeatures[flag.feature_name] = {
        enabled: hasAccess,
        variant: assignment?.variant || 'control',
        config: flag.config
      };
    });

    return NextResponse.json({
      features: userFeatures,
      betaAccess: betaAccess?.access_level || null,
      trustScore: reputation?.trust_score || 50,
      reputation: reputation?.reputation || 0
    });

  } catch (error) {
    console.error('Features GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
