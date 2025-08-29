import { NextRequest, NextResponse } from "next/server";
import { getUserOr401 } from "@/lib/auth/getUserOr401";

export async function GET(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    // Get user profile to fetch common logs
    const { data: profile, error: profileError } = await auth.supabase
      .from("profiles")
      .select("secondary_goals")
      .eq("id", auth.user.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
    
    // Get common logs from secondary_goals JSONB field
    const commonLogs = profile?.secondary_goals?.common_logs || [];
    
    // If no common logs in profile, fetch most frequent activities from activity_logs
    if (commonLogs.length === 0) {
      const { data: recentLogs, error: logsError } = await auth.supabase
        .from("activity_logs")
        .select("raw_text, type, data")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (!logsError && recentLogs) {
        // Count frequency of each unique activity
        const frequencyMap = new Map<string, { count: number; type: string; data: any }>();
        
        recentLogs.forEach(log => {
          const key = log.raw_text.toLowerCase().trim();
          const existing = frequencyMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            frequencyMap.set(key, {
              count: 1,
              type: log.type,
              data: log.data
            });
          }
        });
        
        // Convert to array and sort by frequency
        const frequentActivities = Array.from(frequencyMap.entries())
          .filter(([_, info]) => info.count >= 2) // Only activities logged 2+ times
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10)
          .map(([text, info], index) => ({
            id: `common-${index}`,
            text,
            type: info.type,
            count: info.count,
            data: info.data,
            lastUsed: new Date().toISOString()
          }));
        
        return NextResponse.json(frequentActivities);
      }
    }
    
    // Format common logs for response
    const formattedLogs = commonLogs.map((log: any, index: number) => ({
      id: `common-${index}`,
      text: log.text,
      type: log.type || detectTypeFromText(log.text),
      count: log.count,
      lastUsed: log.lastUsed,
      data: log.data || {}
    }));
    
    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error in GET /api/common-logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to detect activity type from text
function detectTypeFromText(text: string): string {
  const lower = text.toLowerCase();
  
  const patterns = [
    { type: 'nutrition', keywords: ['ate', 'eaten', 'breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'meal', 'food'] },
    { type: 'cardio', keywords: ['ran', 'run', 'walked', 'walk', 'cardio', 'bike', 'swim', 'jog'] },
    { type: 'strength', keywords: ['lifted', 'gym', 'squat', 'bench', 'deadlift', 'sets', 'reps', 'workout'] },
    { type: 'weight', keywords: ['weight', 'weigh', 'kg', 'lbs', 'pounds', 'kilos'] },
    { type: 'sleep', keywords: ['sleep', 'slept', 'nap', 'rest'] },
    { type: 'water', keywords: ['water', 'hydration', 'drank', 'oz', 'ml', 'liters'] },
    { type: 'mood', keywords: ['mood', 'feeling', 'felt', 'happy', 'sad', 'stressed', 'anxious'] }
  ];
  
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => lower.includes(keyword))) {
      return pattern.type;
    }
  }
  
  return 'unknown';
}