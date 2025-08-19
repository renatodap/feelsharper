import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { 
    name, 
    exercises, 
    duration_minutes, 
    notes,
    logged_at 
  } = body;
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create workout session
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: name || 'Workout',
        duration_minutes: duration_minutes || 0,
        notes: notes || '',
        logged_at: logged_at || new Date().toISOString(),
        total_sets: exercises?.reduce((sum: number, ex: any) => sum + (ex.sets?.length || 0), 0) || 0,
        total_reps: exercises?.reduce((sum: number, ex: any) => 
          sum + ex.sets?.reduce((s: number, set: any) => s + (set.reps || 0), 0), 0) || 0,
        total_weight_kg: exercises?.reduce((sum: number, ex: any) => 
          sum + ex.sets?.reduce((s: number, set: any) => s + ((set.weight_kg || 0) * (set.reps || 0)), 0), 0) || 0
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Workout creation error:', workoutError);
      return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
    }

    // Add exercises if provided
    if (exercises && exercises.length > 0 && workout) {
      const exerciseData = exercises.flatMap((exercise: any, exerciseIndex: number) => 
        exercise.sets?.map((set: any, setIndex: number) => ({
          workout_id: workout.id,
          user_id: user.id,
          exercise_name: exercise.name,
          set_number: setIndex + 1,
          reps: set.reps || 0,
          weight_kg: set.weight_kg || 0,
          distance_km: set.distance_km || null,
          duration_seconds: set.duration_seconds || null,
          notes: set.notes || null,
          rest_seconds: set.rest_seconds || null
        })) || []
      );

      if (exerciseData.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(exerciseData);

        if (setsError) {
          console.error('Sets creation error:', setsError);
          // Don't fail the whole request if sets fail
        }
      }
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const days = parseInt(searchParams.get('days') || '30');
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = supabase
      .from('workouts')
      .select(`
        *,
        workout_sets (
          id,
          exercise_name,
          set_number,
          reps,
          weight_kg,
          distance_km,
          duration_seconds
        )
      `)
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false });

    if (date) {
      // Get workouts for specific date
      const startDate = `${date}T00:00:00`;
      const endDate = `${date}T23:59:59`;
      query = query.gte('logged_at', startDate).lte('logged_at', endDate);
    } else {
      // Get recent workouts
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('logged_at', startDate.toISOString());
    }

    const { data: workouts, error } = await query;

    if (error) {
      console.error('Workouts fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      totalWorkouts: workouts?.length || 0,
      totalDuration: workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0,
      totalSets: workouts?.reduce((sum, w) => sum + (w.total_sets || 0), 0) || 0,
      totalReps: workouts?.reduce((sum, w) => sum + (w.total_reps || 0), 0) || 0,
      totalWeight: workouts?.reduce((sum, w) => sum + (w.total_weight_kg || 0), 0) || 0,
      averagePerWeek: ((workouts?.length || 0) / (days / 7)).toFixed(1)
    };

    return NextResponse.json({ 
      workouts: workouts || [], 
      stats 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workoutId = searchParams.get('id');
  
  if (!workoutId) {
    return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
  }
  
  // Create Supabase server client
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete workout (cascade will delete sets)
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Workout delete error:', error);
      return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}