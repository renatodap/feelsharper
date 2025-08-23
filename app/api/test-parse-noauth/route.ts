import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/ai/natural-language-parser';
import { createClient } from '@supabase/supabase-js';

// Test endpoint that bypasses auth for local testing
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }
    
    // Parse the input
    const parsed = await parseNaturalLanguage(text, 'test-user');
    
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Try to save to database
    const { data: activityLog, error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        type: parsed.type,
        raw_text: text,
        confidence: parsed.confidence / 100,
        data: parsed.structuredData,
        metadata: {
          source: 'test',
          subjective_notes: parsed.subjectiveNotes
        },
        timestamp: parsed.timestamp || new Date()
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        parsed,
        error: 'Database save failed',
        dbError: dbError.message
      });
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ Phase 3 Working! Parser → Database flow complete',
      parsed,
      saved: activityLog
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}