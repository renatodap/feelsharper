import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Allow demo mode without auth for testing
    const body = await request.json();
    const { type, data, confidence, rawText, demo = false } = body;

    if (!demo && (!user || authError)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = user?.id || 'demo-user';

    // Validate input
    if (!type || !data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Log to unified activity table
    const activityLog = {
      user_id: userId,
      type,
      raw_input: rawText || JSON.stringify(data),
      parsed_data: data,
      confidence: confidence || 1.0,
      auto_logged: confidence > 0.8,
      timestamp: new Date().toISOString()
    };

    // Save to activity_logs table
    const { data: savedActivity, error: saveError } = await supabase
      .from('activity_logs')
      .insert([activityLog])
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save activity:', saveError);
      // Continue even if activity_logs fails (table might not exist yet)
    }

    // Also save to specific tables for backward compatibility
    let specificSaveResult = null;
    
    switch (type) {
      case 'weight':
        const weightEntry = {
          user_id: userId,
          weight: data.weight,
          unit: data.unit || 'lbs',
          recorded_at: new Date().toISOString()
        };
        
        const { data: weightData, error: weightError } = await supabase
          .from('body_weight')
          .insert([weightEntry])
          .select()
          .single();
          
        if (weightError) {
          console.error('Failed to save weight:', weightError);
        } else {
          specificSaveResult = weightData;
        }
        break;

      case 'food':
        // For food, we need to handle multiple items
        if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            const foodEntry = {
              user_id: userId,
              food_name: item.name || item,
              meal_type: data.meal || 'snack',
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbs: item.carbs || 0,
              fat: item.fat || 0,
              logged_at: new Date().toISOString()
            };
            
            const { error: foodError } = await supabase
              .from('food_logs')
              .insert([foodEntry]);
              
            if (foodError) {
              console.error('Failed to save food:', foodError);
            }
          }
        }
        break;

      case 'exercise':
        const exerciseEntry = {
          user_id: userId,
          activity: data.activity || rawText,
          duration: data.duration,
          distance: data.distance,
          distance_unit: data.distanceUnit,
          calories_burned: data.calories,
          notes: data.notes || rawText,
          logged_at: new Date().toISOString()
        };
        
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('workouts')
          .insert([exerciseEntry])
          .select()
          .single();
          
        if (exerciseError) {
          console.error('Failed to save exercise:', exerciseError);
        } else {
          specificSaveResult = exerciseData;
        }
        break;

      case 'mood':
        // Store mood in activity_logs only for now
        break;
    }

    // Calculate daily stats for response
    let dailyStats = null;
    if (!demo) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's activities
        const { data: todayActivities } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('timestamp', today + 'T00:00:00')
          .lte('timestamp', today + 'T23:59:59');

        if (todayActivities) {
          dailyStats = {
            totalActivities: todayActivities.length,
            foodLogs: todayActivities.filter(a => a.type === 'food').length,
            exerciseLogs: todayActivities.filter(a => a.type === 'exercise').length,
            weightLogs: todayActivities.filter(a => a.type === 'weight').length,
          };
        }
      } catch (statsError) {
        console.error('Failed to calculate stats:', statsError);
      }
    }

    return NextResponse.json({
      success: true,
      activity: savedActivity || { type, data },
      dailyStats,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} logged successfully`
    });

  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to log activity' 
    }, { status: 500 });
  }
}

// Get user's recent activities
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get last 20 activities
    const { data: activities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      activities: activities || []
    });

  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch activities' 
    }, { status: 500 });
  }
}