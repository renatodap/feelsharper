import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseActivityPython, checkPythonBackendHealth } from '@/lib/api/python-client';
import { parseHealthLog } from '@/lib/utils/logParser';

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
    
    let parseResult;
    let backend = 'typescript'; // Default fallback
    
    // Try Python backend first
    const isPythonHealthy = await checkPythonBackendHealth();
    
    if (isPythonHealthy) {
      try {
        parseResult = await parseActivityPython(inputText, {
          type: typeOverride,
          occurred_at: occurred_at,
          source: source
        });
        backend = 'python';
        console.log('Using Python backend for parsing');
      } catch (pythonError) {
        console.error('Python parsing failed, falling back to TypeScript:', pythonError);
        // Continue to fallback
      }
    } else {
      console.log('Python backend unavailable, using TypeScript fallback');
    }
    
    // Fallback to TypeScript parsers if Python failed or unavailable
    if (!parseResult) {
      parseResult = await parseWithTypescript(inputText, typeOverride);
      backend = 'typescript';
    }
    
    // Store in database
    const timestamp = parseResult.timestamp ? new Date(parseResult.timestamp) : new Date();
    const { data: activityLog, error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        type: parseResult.type,
        raw_text: inputText,
        confidence: typeof parseResult.confidence === 'number' ? 
          parseResult.confidence / 100 : parseResult.confidence,
        data: parseResult.fields || parseResult.data,
        metadata: {
          source,
          type_override: typeOverride,
          occurred_at: occurred_at,
          backend: backend
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
      fields: parseResult.fields || parseResult.data,
      confidence: parseResult.confidence,
      timestamp: timestamp.toISOString(),
      message: parseResult.message || 'Activity logged successfully',
      activity: activityLog,
      backend: backend
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
 * TypeScript fallback parsing using the new OpenAI-based parser.
 */
async function parseWithTypescript(text: string, typeOverride?: string) {
  try {
    // The new parser is powerful enough to not need the typeOverride.
    // We can pass it in the future if we want to add context.
    const parsedLog = await parseHealthLog(text);

    // The new parser returns a confidence score if available, otherwise we can set a default.
    const confidence = parsedLog.confidence || 0.85;

    return {
      type: parsedLog.type,
      confidence: confidence,
      fields: parsedLog, // The entire parsed log is stored in the 'fields'
      timestamp: new Date().toISOString(),
      message: `Parsed as ${parsedLog.type} with ${Math.round(confidence * 100)}% confidence`
    };
  } catch (parserError) {
    console.error('TypeScript parser error:', parserError);
    // Fallback to a generic error response
    return {
      type: 'general',
      confidence: 0.3,
      fields: {
        raw_text: text,
        parsed: false,
        error: 'Parsing failed'
      },
      timestamp: new Date().toISOString(),
      message: 'Failed to parse with TypeScript fallback'
    };
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
        text: text,
        count: 1,
        last_used: new Date().toISOString(),
        first_used: new Date().toISOString()
      });
    }
    
    // Keep only top 20 most recent/frequent logs
    existingLogs.sort((a: any, b: any) => {
      // Sort by frequency first, then by recency
      const countDiff = b.count - a.count;
      if (countDiff !== 0) return countDiff;
      return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
    });
    
    const topLogs = existingLogs.slice(0, 20);
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ common_logs: topLogs })
      .eq('id', userId);
      
  } catch (error) {
    console.error('Error updating common logs:', error);
  }
}