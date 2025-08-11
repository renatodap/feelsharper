import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // weight, measurements, etc.
  const days = parseInt(searchParams.get('days') || '30');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: metrics, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', user.id)
    .gte('measured_at', startDate.toISOString())
    .order('measured_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get the latest metric for display
  const { data: latest } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ metrics, latest });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    weight,
    body_fat_percentage,
    muscle_mass,
    waist,
    chest,
    arms,
    thighs,
    calves,
    notes
  } = body;

  const { data: metric, error } = await supabase
    .from('body_metrics')
    .insert({
      user_id: user.id,
      weight,
      body_fat_percentage,
      muscle_mass,
      waist,
      chest,
      arms,
      thighs,
      calves,
      notes,
      measured_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ metric }, { status: 201 });
}