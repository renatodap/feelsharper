import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { weight, unit = 'kg', logged_at } = body;
  
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
    // Convert to kg if needed
    let weight_kg = parseFloat(weight);
    if (unit === 'lbs') {
      weight_kg = weight_kg * 0.453592;
    }

    // Check if entry exists for today
    const today = logged_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('body_weight')
      .select('id')
      .eq('user_id', user.id)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`)
      .single();

    let weightLog;
    
    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('body_weight')
        .update({
          weight_kg,
          logged_at: logged_at || new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      weightLog = data;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('body_weight')
        .insert({
          user_id: user.id,
          weight_kg,
          logged_at: logged_at || new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      weightLog = data;
    }

    return NextResponse.json({ weightLog });
  } catch (error) {
    console.error('Weight log error:', error);
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
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
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get weight logs
    const { data: weightLogs, error } = await supabase
      .from('body_weight')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Weight fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch weight logs' }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      current: null as number | null,
      starting: null as number | null,
      lowest: null as number | null,
      highest: null as number | null,
      change: null as number | null,
      changePercent: null as number | null,
      trend: 'stable' as 'up' | 'down' | 'stable'
    };

    if (weightLogs && weightLogs.length > 0) {
      const weights = weightLogs.map(log => log.weight_kg);
      stats.current = weights[weights.length - 1];
      stats.starting = weights[0];
      stats.lowest = Math.min(...weights);
      stats.highest = Math.max(...weights);
      
      if (stats.current && stats.starting) {
        stats.change = stats.current - stats.starting;
        stats.changePercent = (stats.change / stats.starting) * 100;
        stats.trend = stats.change > 0.5 ? 'up' : stats.change < -0.5 ? 'down' : 'stable';
      }
    }

    return NextResponse.json({ 
      weightLogs: weightLogs || [], 
      stats 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get('id');
  
  if (!logId) {
    return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
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
    // Delete the weight log (RLS will ensure user owns it)
    const { error } = await supabase
      .from('body_weight')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Weight log delete error:', error);
      return NextResponse.json({ error: 'Failed to delete weight log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}