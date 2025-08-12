import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { IntegrationAccountManager } from '@/lib/integrations/core/oauth';

// POST /api/integrations/[provider]/disconnect
// Revokes integration and cleans up tokens
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;

    // Find the integration account
    const account = await IntegrationAccountManager.findByUserAndProvider(user.id, provider);
    
    if (!account) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Revoke the integration
    await IntegrationAccountManager.revoke(account.id);

    // TODO: Call provider's token revocation endpoint if available
    // This should be implemented per provider to properly revoke tokens

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'integration.disconnected',
      properties: {
        provider,
        external_user_id: account.externalUserId
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Integration disconnect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
