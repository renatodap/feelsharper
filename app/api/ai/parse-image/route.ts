import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image provided' 
      }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    try {
      // Use GPT-4 Vision to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are a fitness and nutrition assistant. Analyze this image and describe what you see in natural language that can be logged.
            
            If it's food: List the items you see (e.g., "chicken salad, apple, water")
            If it's an exercise screenshot/photo: Describe the activity (e.g., "treadmill run 5k in 25 minutes")
            If it's a scale/weight: Report the weight shown (e.g., "weight 175 lbs")
            If it's a nutrition label: Summarize key info (e.g., "protein bar, 20g protein, 200 calories")
            
            Be concise and specific. Output only the description, no extra explanation.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const description = response.choices[0]?.message?.content || '';
      
      if (!description) {
        throw new Error('No description generated');
      }

      return NextResponse.json({
        success: true,
        text: description,
        type: 'image'
      });

    } catch (apiError: any) {
      // Fallback to simpler OCR or pattern matching if Vision API fails
      console.error('Vision API error:', apiError);
      
      // For now, return a generic response
      return NextResponse.json({
        success: true,
        text: "food from photo", // Generic fallback
        type: 'image',
        fallback: true
      });
    }

  } catch (error) {
    console.error('Image parsing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process image' 
    }, { status: 500 });
  }
}

// Handle preflight for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}