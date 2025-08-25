import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FoodRecognition } from '@/lib/ai/vision/FoodRecognition';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { image, images, context, action, barcode } = body;

    const foodRecognition = new FoodRecognition();

    // Phase 10.3.1: Single image analysis
    if (action === 'analyze' && image) {
      const analysis = await foodRecognition.analyzeFood(image, context);
      
      // Store analysis for learning
      await storeAnalysis(session.user.id, analysis, image);
      
      return NextResponse.json({
        success: true,
        analysis: analysis,
        confidence: analysis.confidence,
        needsClarification: analysis.needsClarification
      });
    }

    // Phase 10.3.5: Multiple angles analysis
    if (action === 'analyze-multiple' && images) {
      const analysis = await foodRecognition.analyzeMultipleAngles(images, context);
      
      return NextResponse.json({
        success: true,
        analysis: analysis,
        confidence: analysis.confidence,
        imagesAnalyzed: images.length
      });
    }

    // Phase 10.3.6: Barcode scanning
    if (action === 'scan-barcode' && barcode) {
      const barcodeData = await foodRecognition.scanBarcode(barcode);
      
      if (barcodeData) {
        // Convert barcode data to food analysis format
        const analysis = {
          totalCalories: barcodeData.calories,
          totalMacros: barcodeData.macros,
          items: [{
            name: barcodeData.name,
            confidence: 1.0, // Barcode is always 100% confident
            quantity: barcodeData.servingSize,
            estimatedCalories: barcodeData.calories,
            macros: barcodeData.macros,
            portionSize: barcodeData.servingSize
          }],
          confidence: 1.0,
          suggestions: ['Barcode data is highly accurate'],
          needsClarification: false
        };
        
        return NextResponse.json({
          success: true,
          analysis: analysis,
          source: 'barcode'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Barcode not found or unreadable'
        });
      }
    }

    // Phase 10.3.7: User correction learning
    if (action === 'correct' && body.correction && body.originalAnalysis && body.imageSignature) {
      await foodRecognition.learnFromCorrection(
        body.originalAnalysis,
        body.correction,
        body.imageSignature
      );
      
      return NextResponse.json({
        success: true,
        message: 'Correction learned successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Food analysis failed' },
      { status: 500 }
    );
  }
}

async function storeAnalysis(userId: string, analysis: any, imageData: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { error } = await supabase
      .from('food_analysis_history')
      .insert({
        user_id: userId,
        analysis_result: analysis,
        image_signature: hashImage(imageData),
        confidence: analysis.confidence,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store analysis:', error);
    }
  } catch (error) {
    console.error('Storage error:', error);
  }
}

function hashImage(imageData: string): string {
  // Simple hash for image signature - in production use proper hashing
  return btoa(imageData.slice(0, 100)).slice(0, 20);
}