/**
 * Quick Log Templates API
 * Provides predefined templates for quick logging actions from insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Predefined quick-log templates for common actions
const QUICK_LOG_TEMPLATES = {
  // Workout templates
  'strength_training': {
    type: 'exercise',
    category: 'strength',
    prefill: {
      text: 'Strength training: ',
      duration_minutes: 45,
      exercises: ['Bench Press', 'Squats', 'Deadlifts', 'Rows']
    },
    prompt: 'Log your strength workout (e.g., "3x10 bench press at 135lbs")'
  },
  'cardio_session': {
    type: 'exercise',
    category: 'cardio',
    prefill: {
      text: 'Cardio: ',
      duration_minutes: 30,
      exercises: ['Running', 'Cycling', 'Rowing']
    },
    prompt: 'Log your cardio session (e.g., "5k run in 25 minutes")'
  },
  'hiit_workout': {
    type: 'exercise',
    category: 'hiit',
    prefill: {
      text: 'HIIT workout: ',
      duration_minutes: 20,
      exercises: ['Burpees', 'Jump Squats', 'Mountain Climbers']
    },
    prompt: 'Log your HIIT session (e.g., "4 rounds of 30s work/30s rest")'
  },
  
  // Nutrition templates
  'protein_meal': {
    type: 'food',
    category: 'high_protein',
    prefill: {
      text: 'High protein meal: ',
      protein_target: 30,
      suggestions: ['Chicken breast', 'Greek yogurt', 'Protein shake']
    },
    prompt: 'Log your protein-rich meal (e.g., "Grilled chicken with quinoa")'
  },
  'post_workout_nutrition': {
    type: 'food',
    category: 'recovery',
    prefill: {
      text: 'Post-workout meal: ',
      protein_target: 25,
      carb_target: 40,
      suggestions: ['Protein shake + banana', 'Rice + chicken', 'Oatmeal + whey']
    },
    prompt: 'Log your post-workout nutrition'
  },
  'hydration': {
    type: 'hydration',
    category: 'water',
    prefill: {
      text: 'Water intake: ',
      amount_ml: 500,
      suggestions: ['500ml bottle', '2 glasses', 'Large water bottle']
    },
    prompt: 'Log your water intake'
  },
  
  // Recovery templates
  'sleep_log': {
    type: 'recovery',
    category: 'sleep',
    prefill: {
      text: 'Sleep: ',
      hours: 8,
      quality: ['Good', 'Fair', 'Poor']
    },
    prompt: 'Log your sleep (e.g., "8 hours, good quality")'
  },
  'stretching': {
    type: 'recovery',
    category: 'mobility',
    prefill: {
      text: 'Stretching session: ',
      duration_minutes: 15,
      areas: ['Lower body', 'Upper body', 'Full body']
    },
    prompt: 'Log your stretching/mobility work'
  },
  
  // Progress tracking
  'weight_check': {
    type: 'measurement',
    category: 'weight',
    prefill: {
      text: 'Morning weight: ',
      unit: 'kg',
      time: 'morning'
    },
    prompt: 'Log your weight (e.g., "75.5 kg")'
  },
  'body_measurements': {
    type: 'measurement',
    category: 'body',
    prefill: {
      text: 'Measurements: ',
      areas: ['Waist', 'Chest', 'Arms', 'Thighs']
    },
    prompt: 'Log your body measurements'
  }
};

// GET /api/quick-log/templates - Get available templates or specific template
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const templateId = url.searchParams.get('id');
    const category = url.searchParams.get('category');

    // Return specific template if ID provided
    if (templateId) {
      const template = QUICK_LOG_TEMPLATES[templateId as keyof typeof QUICK_LOG_TEMPLATES];
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      // Add deep-link URL for this template
      const deepLink = `/log?template=${templateId}&prefill=${encodeURIComponent(JSON.stringify(template.prefill))}`;

      return NextResponse.json({
        template: {
          id: templateId,
          ...template,
          deepLink
        }
      });
    }

    // Filter by category if provided
    let templates = Object.entries(QUICK_LOG_TEMPLATES);
    if (category) {
      templates = templates.filter(([_, template]) => template.category === category);
    }

    // Return all templates with deep-links
    const templatesWithLinks = templates.map(([id, template]) => ({
      id,
      ...template,
      deepLink: `/log?template=${id}&prefill=${encodeURIComponent(JSON.stringify(template.prefill))}`
    }));

    return NextResponse.json({
      templates: templatesWithLinks,
      categories: [...new Set(Object.values(QUICK_LOG_TEMPLATES).map(t => t.category))]
    });
  } catch (error) {
    console.error('Error fetching quick-log templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/quick-log/templates - Create a log from a template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, customData } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = QUICK_LOG_TEMPLATES[templateId as keyof typeof QUICK_LOG_TEMPLATES];
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Merge template with custom data
    const logData = {
      user_id: user.id,
      type: template.type,
      raw_text: customData?.text || template.prefill.text,
      timestamp: new Date().toISOString(),
      parsed_data: {
        ...template.prefill,
        ...customData,
        template_used: templateId
      },
      source: 'quick_log_template'
    };

    // Create the activity log
    const { data: log, error: logError } = await supabase
      .from('activity_logs')
      .insert(logData)
      .select()
      .single();

    if (logError) {
      console.error('Error creating log from template:', logError);
      return NextResponse.json(
        { error: 'Failed to create log' },
        { status: 500 }
      );
    }

    // If this was triggered by an insight, update the insight
    if (customData?.insightId) {
      await supabase
        .from('user_insights')
        .update({
          action_taken: true,
          action_taken_at: new Date().toISOString(),
          related_log_id: log.id
        })
        .eq('id', customData.insightId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      log,
      message: `${template.type} logged successfully`
    });
  } catch (error) {
    console.error('Error creating log from template:', error);
    return NextResponse.json(
      { error: 'Failed to create log from template' },
      { status: 500 }
    );
  }
}