import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface StreakData {
  currentStreak: number;
  timeToLog: number; // median seconds
  lastLogTime?: Date;
}

export interface WeightData {
  current?: number;
  delta: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
}

export interface VolumeData {
  total: number;
  unit: string;
  weeklyAverage: number;
}

export interface SleepData {
  debt: number;
  average: number;
  goal: number;
}

// Fetch streak and time-to-log metrics
export async function getStreakMetrics(userId: string, scope: string): Promise<StreakData> {
  const supabase = createClient();
  
  // Get activity logs for streak calculation
  const endDate = new Date();
  const startDate = new Date();
  
  if (scope === 'week') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (scope === 'month') {
    startDate.setDate(endDate.getDate() - 30);
  } else if (scope === 'year') {
    startDate.setDate(endDate.getDate() - 365);
  } else {
    // Today
    startDate.setHours(0, 0, 0, 0);
  }

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('created_at, timestamp')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (!logs || logs.length === 0) {
    return { currentStreak: 0, timeToLog: 0 };
  }

  // Calculate streak (consecutive days with at least 1 log)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const logDates = new Set(
    logs.map(log => {
      const date = new Date(log.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);
    
    if (logDates.has(checkDate.getTime())) {
      streak++;
    } else if (i > 0) {
      // Break on first missing day (except today)
      break;
    }
  }

  // Calculate median time-to-log (occurred_at to created_at)
  const timeDiffs = logs
    .filter(log => log.timestamp)
    .map(log => {
      const created = new Date(log.created_at).getTime();
      const occurred = new Date(log.timestamp).getTime();
      return Math.abs(created - occurred) / 1000; // Convert to seconds
    })
    .filter(diff => diff >= 0 && diff < 86400); // Remove outliers (>1 day)

  const timeToLog = timeDiffs.length > 0 
    ? timeDiffs.sort((a, b) => a - b)[Math.floor(timeDiffs.length / 2)]
    : 0;

  return {
    currentStreak: streak,
    timeToLog: Math.round(timeToLog),
    lastLogTime: logs[0] ? new Date(logs[0].created_at) : undefined
  };
}

// Fetch weight trend metrics
export async function getWeightMetrics(userId: string, scope: string): Promise<WeightData> {
  const supabase = createClient();
  
  const endDate = new Date();
  const startDate = new Date();
  
  if (scope === 'week') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (scope === 'month') {
    startDate.setDate(endDate.getDate() - 30);
  } else if (scope === 'year') {
    startDate.setDate(endDate.getDate() - 365);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  // Get weight measurements
  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('weight_kg, measurement_date')
    .eq('user_id', userId)
    .gte('measurement_date', startDate.toISOString())
    .order('measurement_date', { ascending: false });

  if (!measurements || measurements.length === 0) {
    return { delta: 0, trend: 'stable' };
  }

  const current = measurements[0].weight_kg;
  const oldest = measurements[measurements.length - 1].weight_kg;
  const delta = current - oldest;

  // Calculate trend based on linear regression or simple comparison
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(delta) < 0.5) {
    trend = 'stable';
  } else if (delta > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return {
    current,
    delta: Math.round(delta * 10) / 10,
    trend,
    lastUpdated: new Date(measurements[0].measurement_date)
  };
}

// Fetch training volume metrics
export async function getVolumeMetrics(userId: string, scope: string): Promise<VolumeData> {
  const supabase = createClient();
  
  const endDate = new Date();
  const startDate = new Date();
  
  if (scope === 'week') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (scope === 'month') {
    startDate.setDate(endDate.getDate() - 30);
  } else if (scope === 'year') {
    startDate.setDate(endDate.getDate() - 365);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  // Get workouts
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, duration_minutes, workout_date')
    .eq('user_id', userId)
    .gte('workout_date', startDate.toISOString())
    .order('workout_date', { ascending: false });

  if (!workouts || workouts.length === 0) {
    return { total: 0, unit: 'workouts', weeklyAverage: 0 };
  }

  // Calculate total volume (fallback to count if duration sparse)
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  
  if (totalMinutes > 0) {
    const weeks = Math.max(1, (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return {
      total: Math.round(totalMinutes),
      unit: 'minutes',
      weeklyAverage: Math.round(totalMinutes / weeks)
    };
  }

  // Fallback to workout count
  const weeks = Math.max(1, (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return {
    total: workouts.length,
    unit: 'workouts',
    weeklyAverage: Math.round(workouts.length / weeks * 10) / 10
  };
}

// Fetch sleep debt metrics
export async function getSleepMetrics(userId: string, scope: string): Promise<SleepData> {
  const supabase = createClient();
  
  const endDate = new Date();
  const startDate = new Date();
  
  if (scope === 'week') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (scope === 'month') {
    startDate.setDate(endDate.getDate() - 30);
  } else if (scope === 'year') {
    startDate.setDate(endDate.getDate() - 365);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  // Get sleep logs from activity_logs
  const { data: sleepLogs } = await supabase
    .from('activity_logs')
    .select('data, created_at')
    .eq('user_id', userId)
    .eq('type', 'sleep')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  // Get user's sleep goal from preferences (default to 8 hours)
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('goals_json')
    .eq('user_id', userId)
    .single();

  const goalHours = preferences?.goals_json?.sleep_hours || 8;
  
  if (!sleepLogs || sleepLogs.length === 0) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return { 
      debt: days * goalHours, 
      average: 0, 
      goal: goalHours 
    };
  }

  // Extract sleep hours from data JSON
  const totalSleep = sleepLogs.reduce((sum, log) => {
    const hours = log.data?.hours || log.data?.duration_hours || 0;
    return sum + hours;
  }, 0);
  
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const targetSleep = days * goalHours;
  const debt = targetSleep - totalSleep;
  const average = totalSleep / Math.max(1, sleepLogs.length);

  return {
    debt: Math.round(debt * 10) / 10,
    average: Math.round(average * 10) / 10,
    goal: goalHours
  };
}