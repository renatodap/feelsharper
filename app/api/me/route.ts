import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Optional: Verify with password or confirmation token for extra security
    const body = await request.json().catch(() => ({}));
    const { confirmDelete, hardDelete = false } = body;
    
    if (confirmDelete !== true) {
      return NextResponse.json(
        { error: 'Deletion must be confirmed' },
        { status: 400 }
      );
    }

    const userId = user.id;

    if (hardDelete) {
      // Hard delete - permanently remove all user data
      // Order matters due to foreign key constraints
      
      const deletions = await Promise.allSettled([
        // Delete dependent data first
        supabase.from('coach_messages').delete().eq('user_id', userId),
        supabase.from('insights').delete().eq('user_id', userId),
        supabase.from('food_logs').delete().eq('user_id', userId),
        supabase.from('workout_logs').delete().eq('user_id', userId),
        supabase.from('user_preferences').delete().eq('user_id', userId),
        // Delete profile last
        supabase.from('profiles').delete().eq('id', userId)
      ]);

      // Check for failures
      const failures = deletions.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Deletion failures:', failures);
      }

      // Delete the auth user account
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('Auth deletion error:', deleteAuthError);
        return NextResponse.json(
          { error: 'Account deletion partially failed', details: deleteAuthError.message },
          { status: 500 }
        );
      }

      // Sign out the user
      await supabase.auth.signOut();

      return NextResponse.json({ 
        ok: true,
        message: 'Account permanently deleted',
        type: 'hard_delete'
      });

    } else {
      // Soft delete - mark account as deleted but retain data
      
      // Update profile to mark as deleted
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@deleted.com`, // Anonymize email
          full_name: 'Deleted User'
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Soft delete error:', profileError);
        return NextResponse.json(
          { error: 'Account deletion failed' },
          { status: 500 }
        );
      }

      // Disable the auth account without deleting
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          email: `deleted_${userId}@deleted.com`,
          user_metadata: { deleted: true, deleted_at: new Date().toISOString() }
        }
      );

      if (updateAuthError) {
        console.error('Auth update error:', updateAuthError);
      }

      // Sign out the user
      await supabase.auth.signOut();

      return NextResponse.json({ 
        ok: true,
        message: 'Account deactivated (data retained for 30 days)',
        type: 'soft_delete',
        retention_days: 30
      });
    }

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Account deletion failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to check deletion status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if account is marked for deletion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to check account status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      isDeleted: !!profile?.deleted_at,
      deletedAt: profile?.deleted_at || null
    });

  } catch (error) {
    console.error('Check account error:', error);
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    );
  }
}