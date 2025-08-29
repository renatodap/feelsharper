import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch all user data
    const [
      foodLogs,
      workoutLogs,
      userPreferences,
      insights,
      profiles,
      coachMessages
    ] = await Promise.all([
      // Food logs
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id),
      
      // Workout logs
      supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id),
      
      // User preferences
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      
      // Insights
      supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id),
      
      // Profile data
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      
      // Coach messages
      supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', user.id)
    ]);

    // Check for errors
    const errors = [
      foodLogs.error,
      workoutLogs.error,
      insights.error,
      profiles.error,
      coachMessages.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Data export errors:', errors);
    }

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      },
      profile: profiles.data || null,
      preferences: userPreferences.data || null,
      data: {
        foodLogs: foodLogs.data || [],
        workoutLogs: workoutLogs.data || [],
        insights: insights.data || [],
        coachMessages: coachMessages.data || []
      },
      metadata: {
        totalFoodLogs: foodLogs.data?.length || 0,
        totalWorkoutLogs: workoutLogs.data?.length || 0,
        totalInsights: insights.data?.length || 0,
        totalCoachMessages: coachMessages.data?.length || 0
      }
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="feelsharper-data-export-${user.id}-${Date.now()}.json"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}