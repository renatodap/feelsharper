import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }
    
    // Simple keyword-based routing (same as main parse endpoint)
    const lowerText = text.toLowerCase();
    const foodKeywords = ['ate', 'breakfast', 'lunch', 'dinner', 'eggs', 'toast', 'chicken', 'protein', 'salad', 'pizza', 'coffee', 'meal', 'snack', 'rice'];
    const workoutKeywords = ['ran', 'run', 'walk', 'gym', 'workout', 'bench', 'yoga', 'squat', 'deadlift', 'cardio', 'bike', 'swim', 'exercise', 'played', 'tennis', 'sets', 'reps'];
    const weightKeywords = ['weight', 'weigh', 'kg', 'lbs', 'pounds', 'kilos'];
    
    const hasFood = foodKeywords.some(k => lowerText.includes(k));
    const hasWorkout = workoutKeywords.some(k => lowerText.includes(k));
    const hasWeight = weightKeywords.some(k => lowerText.includes(k));
    
    let parsed;
    
    if (hasWeight && !hasWorkout) {
      const match = text.match(/(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?|kilos?)?/i);
      if (match) {
        parsed = {
          type: 'weight',
          confidence: 95,
          structuredData: {
            weight: parseFloat(match[1]),
            unit: (match[2]?.includes('k') || match[2]?.includes('kg')) ? 'kg' : 'lbs'
          },
          timestamp: new Date()
        };
      } else {
        parsed = {
          type: 'weight',
          confidence: 70,
          structuredData: { raw: text },
          timestamp: new Date()
        };
      }
    } else if (hasFood && !hasWorkout) {
      parsed = {
        type: 'nutrition',
        confidence: 85,
        structuredData: { 
          meal: text,
          foods: [{ name: text, quantity: 1, unit: 'serving' }]
        },
        timestamp: new Date()
      };
    } else if (hasWorkout && !hasFood) {
      // Differentiate between strength and cardio
      const strengthKeywords = ['bench', 'squat', 'deadlift', 'press', 'sets', 'reps', 'lift'];
      const isStrength = strengthKeywords.some(k => lowerText.includes(k));
      
      parsed = {
        type: isStrength ? 'strength' : 'cardio',
        confidence: 80,
        structuredData: { 
          activity: text,
          duration_minutes: 30 // default estimate
        },
        timestamp: new Date()
      };
    } else if (hasFood && hasWorkout) {
      // Complex input with both
      parsed = {
        type: 'mixed',
        confidence: 75,
        structuredData: { 
          raw: text,
          categories: ['nutrition', 'workout']
        },
        timestamp: new Date()
      };
    } else {
      // Try to make a best guess
      parsed = {
        type: 'unknown',
        confidence: 50,
        structuredData: { raw: text },
        timestamp: new Date()
      };
    }
    
    return NextResponse.json({
      success: true,
      parsed,
      message: 'Test parse successful (no auth)'
    });
    
  } catch (error) {
    console.error('Test parse error:', error);
    return NextResponse.json({ 
      error: 'Parse failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}