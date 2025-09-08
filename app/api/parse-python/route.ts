/**
 * Parse endpoint that uses Python backend
 * For testing Python integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseActivityPython, checkPythonBackendHealth } from '@/lib/api/python-client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Python backend is available
    const isHealthy = await checkPythonBackendHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Python backend is not available' },
        { status: 503 }
      );
    }

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
    const body = await request.json();
    const { text, type, occurred_at } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }
    
    // Call Python backend
    const result = await parseActivityPython(text, {
      type,
      occurred_at,
      source: 'web'
    });
    
    // Save to database (optional)
    const { error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        type: result.type,
        raw_text: text,
        parsed_data: result.fields,
        confidence: result.confidence,
        timestamp: result.timestamp || new Date().toISOString(),
        source: 'python-parser'
      });
    
    if (dbError) {
      console.error('Error saving to database:', dbError);
      // Don't fail the request if DB save fails
    }
    
    // Update common logs
    const { error: commonError } = await supabase
      .from('common_logs')
      .upsert({
        user_id: user.id,
        text: text.toLowerCase().trim(),
        count: 1,
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id,text',
        count: 'ignored'
      });
    
    if (commonError) {
      console.error('Error updating common logs:', commonError);
    }
    
    return NextResponse.json({
      success: true,
      ...result,
      backend: 'python'
    });
    
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse input' },
      { status: 500 }
    );
  }
}