import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { data: sets, error } = await supabase
    .from('workout_sets')
    .select(`
      *,
      exercises(*)
    `)
    .eq('workout_id', id)
    .order('set_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sets });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workoutId } = await params;
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    exercise_id,
    exercise_name,
    reps,
    weight,
    duration_seconds,
    distance_meters,
    notes,
    rest_seconds = 90,
    is_warmup = false,
    is_dropset = false,
    is_failure = false
  } = body;

  // First, ensure the exercise exists or create it
  let exerciseId = exercise_id;
  
  if (!exerciseId && exercise_name) {
    // Check if exercise exists
    const { data: existingExercise } = await supabase
      .from('exercises')
      .select('id')
      .eq('name', exercise_name)
      .single();

    if (existingExercise) {
      exerciseId = existingExercise.id;
    } else {
      // Create new exercise
      const { data: newExercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          name: exercise_name,
          category: 'custom',
          muscle_groups: [],
          equipment: 'other',
          is_custom: true
        })
        .select()
        .single();

      if (exerciseError) {
        return NextResponse.json({ error: exerciseError.message }, { status: 500 });
      }
      
      exerciseId = newExercise.id;
    }
  }

  // Get the current max set_order for this workout
  const { data: maxOrderSet } = await supabase
    .from('workout_sets')
    .select('set_order')
    .eq('workout_id', workoutId)
    .order('set_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = maxOrderSet ? maxOrderSet.set_order + 1 : 1;

  // Create the workout set
  const { data: set, error } = await supabase
    .from('workout_sets')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      set_order: nextOrder,
      reps,
      weight,
      duration_seconds,
      distance_meters,
      notes,
      rest_seconds,
      is_warmup,
      is_dropset,
      is_failure
    })
    .select(`
      *,
      exercises(*)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update workout stats
  const { data: allSets } = await supabase
    .from('workout_sets')
    .select('weight, reps')
    .eq('workout_id', workoutId)
    .eq('is_warmup', false);

  if (allSets) {
    const totalVolume = allSets.reduce((sum: number, s: any) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
    const totalSets = allSets.length;

    await supabase
      .from('workouts')
      .update({ 
        total_volume: totalVolume,
        total_sets: totalSets 
      })
      .eq('id', workoutId);
  }

  return NextResponse.json({ set }, { status: 201 });
}