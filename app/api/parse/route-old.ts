import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseActivityPython, checkPythonBackendHealth } from '@/lib/api/python-client';

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
    
    // Parse request body - support both old and new format
    const body = await request.json();
    const { 
      text, 
      raw, 
      type: typeOverride, 
      occurred_at, 
      source = 'chat' 
    } = body;
    
    // Support both 'text' and 'raw' field names
    const inputText = raw || text;
    
    if (!inputText) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }
    
    // Try Python backend first, fallback to TypeScript parser
    const isPythonHealthy = await checkPythonBackendHealth();
    let parseResult;
    let backend = 'typescript'; // Default fallback
    
    if (isPythonHealthy) {
      try {
        // Parse using Python backend
        backend = 'python';
    try {
      const parseResult = await parseActivityPython(inputText, {
        type: typeOverride,
        occurred_at: occurred_at,
        source: source
      });
      
      // Store in database
      const timestamp = parseResult.timestamp ? new Date(parseResult.timestamp) : new Date();
      const { data: activityLog, error: dbError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          type: parseResult.type,
          raw_text: inputText,
          confidence: parseResult.confidence / 100,
          data: parseResult.fields,
          metadata: {
            source,
            type_override: typeOverride,
            occurred_at: occurred_at
          },
          timestamp: timestamp
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
      
      // Update user's common logs
      await updateCommonLogs(user.id, inputText, supabase);
      
      return NextResponse.json({
        success: true,
        type: parseResult.type,
        fields: parseResult.fields,
        confidence: parseResult.confidence,
        timestamp: timestamp.toISOString(),
        message: parseResult.message,
        activity: activityLog
      });
      
    } catch (parseError) {
      console.error('Python parsing failed:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse input' },
        { status: 500 }
      );
    }
    
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
    // Get user profile - using 'profiles' table (not user_profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      console.warn('No profile found for user:', userId);
      return;
    }
    
    // Get existing common logs
    const existingLogs = profile.common_logs || [];
    
    // Find if this text already exists
    const existingIndex = existingLogs.findIndex((log: any) => log.text === text);
    
    if (existingIndex >= 0) {
      // Update count and last_used
      existingLogs[existingIndex].count += 1;
      existingLogs[existingIndex].last_used = new Date().toISOString();
    } else {
      // Add new entry
      existingLogs.push({
        text,
        count: 1,
        last_used: new Date().toISOString()
      });
    }
    
    // Sort by count (descending) and keep top 20
    const sortedLogs = existingLogs
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20);
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ common_logs: sortedLogs })
      .eq('id', userId);
      
  } catch (error) {
    console.error('Error updating common logs:', error);
    // Don't fail the main request if this fails
  }
}