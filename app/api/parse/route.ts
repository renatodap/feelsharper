import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/ai/natural-language-parser';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { text, source = 'chat' } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }
    
    // Parse the natural language input
    const parsed = await parseNaturalLanguage(text);
    
    // Store in database
    const { data: activityLog, error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        activity_type: parsed.type,
        original_text: text,
        confidence_level: parsed.confidence,
        subjective_notes: parsed.subjectiveNotes,
        source,
        structured_data: parsed.structuredData,
        activity_timestamp: parsed.timestamp || new Date()
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save activity' },
        { status: 500 }
      );
    }
    
    // Update user's common logs if this is a frequent pattern
    await updateCommonLogs(user.id, text, supabase);
    
    return NextResponse.json({
      success: true,
      activity: activityLog,
      parsed,
      message: generateConfirmationMessage(parsed)
    });
    
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to parse input' },
      { status: 500 }
    );
  }
}

/**
 * Update user's common logs for quick actions
 */
async function updateCommonLogs(userId: string, text: string, supabase: any) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('common_logs')
      .eq('user_id', userId)
      .single();
    
    const commonLogs = profile?.common_logs || [];
    
    // Find if this log already exists
    const existingIndex = commonLogs.findIndex((log: any) => 
      log.text.toLowerCase() === text.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Increment count
      commonLogs[existingIndex].count += 1;
      commonLogs[existingIndex].lastUsed = new Date();
    } else if (commonLogs.length < 10) {
      // Add new common log
      commonLogs.push({
        text,
        count: 1,
        lastUsed: new Date()
      });
    }
    
    // Sort by count and recency
    commonLogs.sort((a: any, b: any) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
    
    // Keep only top 10
    const topLogs = commonLogs.slice(0, 10);
    
    // Update profile
    await supabase
      .from('user_profiles')
      .update({ common_logs: topLogs })
      .eq('user_id', userId);
      
  } catch (error) {
    console.error('Failed to update common logs:', error);
    // Non-critical, don't throw
  }
}

/**
 * Generate a user-friendly confirmation message
 */
function generateConfirmationMessage(parsed: any): string {
  const confidenceText = parsed.confidence >= 90 ? 'Got it!' : 
                         parsed.confidence >= 70 ? 'Logged!' : 
                         'Recorded (let me know if I misunderstood)';
  
  switch (parsed.type) {
    case 'cardio':
      return `${confidenceText} ${parsed.structuredData.activity || 'Cardio'} logged.`;
    case 'nutrition':
      return `${confidenceText} ${parsed.structuredData.meal || 'Meal'} recorded.`;
    case 'weight':
      return `${confidenceText} Weight updated to ${parsed.structuredData.weight} ${parsed.structuredData.unit}.`;
    case 'sleep':
      return `${confidenceText} ${parsed.structuredData.hours} hours of sleep logged.`;
    case 'mood':
      return `${confidenceText} Mood noted.`;
    default:
      return `${confidenceText} Activity logged.`;
  }
}