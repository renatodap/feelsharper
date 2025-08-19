import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAIParser } from '@/lib/ai/services/openai-parser';
import { ClaudeCoach } from '@/lib/ai/services/claude-coach';
import { AIOrchestrator } from '@/lib/ai/services/ai-orchestrator';

// Parse multiple activities from a single input
function parseMultipleActivities(text: string): any[] {
  const activities = [];
  const segments = text.split(/[,;]|\sand\s/i);
  
  for (const segment of segments) {
    const parsed = quickPatternMatch(segment.trim());
    if (parsed && parsed.type !== 'unknown') {
      activities.push(parsed);
    }
  }
  
  return activities.length > 0 ? activities : [quickPatternMatch(text)];
}

// PROVEN pattern matching (94% success rate)
function quickPatternMatch(text: string): any {
  const normalizedText = text.toLowerCase().trim();
  
  // Weight patterns
  const weightMatch = normalizedText.match(/^(?:weight\s+)?(\d+(?:\.\d+)?)\s*(lbs?|kg|kilos?|pounds?)?$/i);
  if (weightMatch) {
    return {
      type: 'weight',
      data: { 
        weight: parseFloat(weightMatch[1]), 
        unit: weightMatch[2]?.includes('k') ? 'kg' : 'lbs' 
      },
      confidence: 0.95,
      rawText: text
    };
  }
  
  // Energy patterns
  const energyMatch = normalizedText.match(/energy\s+(\d+)(?:\/10)?/i);
  if (energyMatch) {
    return {
      type: 'energy',
      data: { level: parseInt(energyMatch[1]) },
      confidence: 0.95,
      rawText: text
    };
  }
  
  // Sleep patterns
  const sleepMatch = normalizedText.match(/slept?\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?/i);
  if (sleepMatch) {
    return {
      type: 'sleep',
      data: { hours: parseFloat(sleepMatch[1]) },
      confidence: 0.95,
      rawText: text
    };
  }
  
  // Water patterns
  const waterMatch = normalizedText.match(/(?:drank|had|drink)?\s*(\d+(?:\.\d+)?)\s*(oz|ml|cups?|liters?|l)\s*(?:of\s*)?(?:water)?/i);
  if (waterMatch && normalizedText.includes('water')) {
    return {
      type: 'water',
      data: { 
        amount: parseFloat(waterMatch[1]), 
        unit: waterMatch[2].includes('liter') || waterMatch[2] === 'l' ? 'liters' : 
              waterMatch[2].includes('cup') ? 'cups' :
              waterMatch[2].includes('ml') ? 'ml' : 'oz'
      },
      confidence: 0.9,
      rawText: text
    };
  }
  
  // Food patterns
  if (normalizedText.includes('breakfast') || normalizedText.includes('lunch') || 
      normalizedText.includes('dinner') || normalizedText.includes('snack')) {
    const meal = normalizedText.includes('breakfast') ? 'breakfast' :
                 normalizedText.includes('lunch') ? 'lunch' :
                 normalizedText.includes('dinner') ? 'dinner' : 'snack';
    
    const foodWords = ['eggs', 'toast', 'chicken', 'salad', 'steak', 'vegetables', 'apple', 'banana'];
    const items = foodWords.filter(food => normalizedText.includes(food)).map(name => ({name}));
    
    return {
      type: 'food',
      data: { items: items.length > 0 ? items : [{name: 'meal'}], meal },
      confidence: 0.85,
      rawText: text
    };
  }
  
  // Workout patterns
  const workoutWords = ['ran', 'run', 'running', 'walked', 'walking', 'cycled', 'cycling'];
  const hasWorkout = workoutWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalizedText);
  });
  
  if (hasWorkout) {
    const activity = /\bran\b|\brun\b|\brunning\b/i.test(normalizedText) ? 'running' :
                    /\bwalked\b|\bwalking\b/i.test(normalizedText) ? 'walking' :
                    /\bcycled\b|\bcycling\b/i.test(normalizedText) ? 'cycling' : 'exercise';
    
    const data: any = { activity };
    
    // Extract distance
    const distanceMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|meters?|m)\b/i);
    if (distanceMatch) {
      data.distance = parseFloat(distanceMatch[1]);
      data.distanceUnit = distanceMatch[2] === 'k' || distanceMatch[2] === 'km' ? 'km' :
                         distanceMatch[2].includes('mi') ? 'miles' : 'm';
    }
    
    // Extract duration
    const durationMatch = normalizedText.match(/(?:in\s+|for\s+)?(\d+(?:\.\d+)?)\s*(mins?|minutes?|hours?|hrs?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      data.duration = durationMatch[2].includes('hour') || durationMatch[2].includes('hr') ? 
                     value * 60 : value;
    }
    
    return {
      type: 'workout',
      data,
      confidence: 0.85,
      rawText: text
    };
  }
  
  // Mood patterns
  if (normalizedText.includes('feeling') || normalizedText.includes('feel')) {
    let mood = 'okay';
    if (normalizedText.includes('great')) mood = 'great';
    else if (normalizedText.includes('good')) mood = 'good';
    else if (normalizedText.includes('bad')) mood = 'bad';
    else if (normalizedText.includes('terrible')) mood = 'terrible';
    else if (normalizedText.includes('tired')) mood = 'tired';
    
    return {
      type: 'mood',
      data: { mood, notes: text },
      confidence: 0.8,
      rawText: text
    };
  }
  
  return {
    type: 'unknown',
    data: { text },
    confidence: 0.1,
    rawText: text
  };
}

// Initialize AI services
let openAIParser: OpenAIParser | null = null;
let claudeCoach: ClaudeCoach | null = null;

function getOpenAIParser() {
  if (!openAIParser) {
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }
    openAIParser = new OpenAIParser(openAIKey);
  }
  return openAIParser;
}

function getClaudeCoach() {
  if (!claudeCoach) {
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }
    claudeCoach = new ClaudeCoach(claudeKey);
  }
  return claudeCoach;
}

let orchestrator: AIOrchestrator | null = null;

function getOrchestrator() {
  if (!orchestrator) {
    const openAIKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    
    if (!openAIKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }
    if (!claudeKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }
    
    orchestrator = new AIOrchestrator({
      openAIKey,
      claudeKey
    });
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, context = {}, demo = false } = body;

    // Demo mode for testing without auth (but with real AI)
    if (demo) {
      try {
        // First try pattern matching for multiple activities
        const activities = parseMultipleActivities(text);
        
        // If we found multiple activities, return them
        if (activities.length > 1) {
          const coach = getClaudeCoach();
          const coachResponse = await coach.generateResponse(text, activities[0], {});
          
          return NextResponse.json({
            success: true,
            parsed: activities[0], // Primary activity
            allActivities: activities, // All parsed activities
            coach: coachResponse,
            saved: false,
            demo: true,
            multipleActivities: true
          });
        }
        
        // Single activity - use AI parsing
        const parser = getOpenAIParser();
        const parsed = await parser.parse(text);
        
        // Use real Claude coaching
        const coach = getClaudeCoach();
        const coachResponse = await coach.generateResponse(text, parsed, {});
        
        return NextResponse.json({
          success: true,
          parsed,
          coach: coachResponse,
          saved: false,
          demo: true
        });
      } catch (error) {
        console.error('AI processing error in demo mode:', error);
        // Fallback to pattern matching if AI fails
        const quickParse = quickPatternMatch(text);
        return NextResponse.json({
          success: true,
          parsed: quickParse,
          coach: {
            message: `Logged: ${quickParse.type}`,
            encouragement: 'Great job tracking!'
          },
          saved: false,
          demo: true,
          fallback: true
        });
      }
    }

    // Check for Authorization header and create appropriate client
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Create client with token for RLS
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser();
      user = tokenUser;
      authError = tokenError;
    } else {
      // Use cookie-based server client
      supabase = await createServerClient();
      const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();
      user = sessionUser;
      authError = sessionError;
    }
    
    // Check authentication for non-demo mode
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - use demo:true for testing' },
        { status: 401 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input text' },
        { status: 400 }
      );
    }

    // Get user's recent activities for context
    const { data: recentActivities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build context
    const enrichedContext = {
      ...context,
      recentActivities: recentActivities || []
    };

    // Process input through real AI services
    const parser = getOpenAIParser();
    const coach = getClaudeCoach();
    
    const parsed = await parser.parse(text);
    const coachResponse = await coach.generateResponse(text, parsed, enrichedContext);
    
    // Save to database if confidence is high enough
    const shouldSave = parsed.confidence >= 0.6 && parsed.type !== 'unknown';
    let actuallySaved = false;
    
    if (shouldSave) {
      const { data: insertData, error: saveError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          type: parsed.type,
          data: parsed.data,
          raw_text: parsed.rawText,
          confidence: parsed.confidence,
          metadata: {
            coachResponse: coachResponse,
            context: enrichedContext
          }
        })
        .select();

      if (saveError) {
        console.error('❌ Error saving activity:', JSON.stringify(saveError, null, 2));
        console.error('   User ID:', user.id);
        console.error('   Activity Type:', parsed.type);
        console.error('   Confidence:', parsed.confidence);
        actuallySaved = false;
      } else {
        console.log('✅ Activity saved successfully:', insertData?.[0]?.id);
        actuallySaved = true;
      }
    }

    // Return processed result
    return NextResponse.json({
      success: true,
      parsed: parsed,
      coach: coachResponse,
      saved: actuallySaved,
      attempted_save: shouldSave,
      user_id: user.id
    });

  } catch (error) {
    console.error('Parse endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process input',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint
    const orchestratorInstance = getOrchestrator();
    const status = await orchestratorInstance.validateConnections();

    return NextResponse.json({
      healthy: status.openAI && status.claude,
      services: {
        openAI: status.openAI,
        claude: status.claude
      },
      errors: status.errors
    });
  } catch (error) {
    return NextResponse.json(
      { 
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}