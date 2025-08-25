/**
 * FoodRecognition - Photo-based calorie estimation using AI vision
 * Phase 10.3: GPT-4 Vision or Claude Vision integration
 */

interface FoodItem {
  name: string;
  confidence: number;
  quantity: string;
  estimatedCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  portionSize: string;
  alternatives?: FoodItem[];
}

interface FoodAnalysis {
  totalCalories: number;
  totalMacros: FoodItem['macros'];
  items: FoodItem[];
  confidence: number;
  suggestions: string[];
  needsClarification: boolean;
  clarifyingQuestions?: string[];
}

interface BarcodeData {
  upc: string;
  name: string;
  calories: number;
  servingSize: string;
  macros: FoodItem['macros'];
}

export class FoodRecognition {
  private openaiApiKey: string;
  private claudeApiKey: string;
  private foodDatabase: Map<string, any> = new Map();
  private correctionLearning: Map<string, FoodAnalysis> = new Map();

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.claudeApiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  /**
   * Phase 10.3.1: GPT-4 Vision or Claude Vision integration
   */
  async analyzeFood(imageBase64: string, context?: string): Promise<FoodAnalysis> {
    try {
      // Try GPT-4 Vision first (better for food recognition)
      const gptResult = await this.analyzeWithGPTVision(imageBase64, context);
      
      if (gptResult.confidence > 0.7) {
        return gptResult;
      }
      
      // Fallback to Claude Vision
      const claudeResult = await this.analyzeWithClaudeVision(imageBase64, context);
      
      // Return the more confident result
      return gptResult.confidence > claudeResult.confidence ? gptResult : claudeResult;
    } catch (error) {
      console.error('Food analysis failed:', error);
      throw new Error('Unable to analyze food photo');
    }
  }

  /**
   * Phase 10.3.2: Food item detection and portion estimation
   */
  private async analyzeWithGPTVision(imageBase64: string, context?: string): Promise<FoodAnalysis> {
    const prompt = this.buildVisionPrompt(context);
    
    // Mock GPT-4 Vision call - in production would use OpenAI API
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.openaiApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4-vision-preview',
    //     messages: [
    //       {
    //         role: 'user',
    //         content: [
    //           { type: 'text', text: prompt },
    //           { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
    //         ]
    //       }
    //     ],
    //     max_tokens: 1000
    //   })
    // });
    
    // Mock response for development
    const mockAnalysis = this.generateMockAnalysis();
    return this.enhanceWithDatabase(mockAnalysis);
  }

  /**
   * Phase 10.3.3: Confidence-based macro estimates
   */
  private async analyzeWithClaudeVision(imageBase64: string, context?: string): Promise<FoodAnalysis> {
    const prompt = this.buildVisionPrompt(context);
    
    // Mock Claude Vision call
    const mockAnalysis = this.generateMockAnalysis();
    mockAnalysis.confidence = 0.75; // Claude typically more conservative
    
    return this.enhanceWithDatabase(mockAnalysis);
  }

  /**
   * Phase 10.3.4: "Plate of rice with chicken" → 400-500 cal estimate
   */
  private buildVisionPrompt(context?: string): string {
    return `
Analyze this food image and provide detailed nutritional information:

1. IDENTIFY each food item visible
2. ESTIMATE portion sizes (use common objects for scale if visible)
3. CALCULATE calories and macros per item
4. PROVIDE confidence level (0-100%) for each estimate
5. SUGGEST clarifying questions if uncertain

${context ? `Context: ${context}` : ''}

Return structured data:
{
  "items": [
    {
      "name": "grilled chicken breast",
      "quantity": "6 oz portion",
      "calories": 280,
      "protein": 52,
      "carbs": 0,
      "fat": 6,
      "confidence": 85,
      "portionSize": "palm-sized piece"
    }
  ],
  "totalCalories": 280,
  "overallConfidence": 85,
  "needsClarification": false,
  "clarifyingQuestions": []
}

Guidelines:
- Be conservative with estimates (better to underestimate)
- Use ranges when uncertain (e.g., "200-250 calories")
- Consider cooking methods (fried vs grilled affects calories)
- Note any visible oils, sauces, or dressings
- Ask for clarification if portions are unclear
    `.trim();
  }

  /**
   * Phase 10.3.5: Multiple angle support for better accuracy
   */
  async analyzeMultipleAngles(images: string[], context?: string): Promise<FoodAnalysis> {
    const analyses: FoodAnalysis[] = [];
    
    // Analyze each image
    for (const image of images) {
      const analysis = await this.analyzeFood(image, context);
      analyses.push(analysis);
    }
    
    // Combine results for better accuracy
    return this.combineAnalyses(analyses);
  }

  /**
   * Phase 10.3.6: Barcode scanning fallback
   */
  async scanBarcode(imageBase64: string): Promise<BarcodeData | null> {
    try {
      // In production, use barcode scanning library
      // const barcodeResult = await this.extractBarcode(imageBase64);
      // const productData = await this.lookupProduct(barcodeResult.upc);
      
      // Mock implementation
      return {
        upc: '123456789012',
        name: 'Mock Product',
        calories: 150,
        servingSize: '1 container (150g)',
        macros: {
          protein: 20,
          carbs: 5,
          fat: 7
        }
      };
    } catch (error) {
      console.error('Barcode scanning failed:', error);
      return null;
    }
  }

  /**
   * Phase 10.3.7: User correction learning loop
   */
  async learnFromCorrection(
    originalAnalysis: FoodAnalysis,
    userCorrection: Partial<FoodAnalysis>,
    imageSignature: string
  ): Promise<void> {
    // Store the correction for learning
    const correctedAnalysis: FoodAnalysis = {
      ...originalAnalysis,
      ...userCorrection,
      totalCalories: userCorrection.totalCalories || originalAnalysis.totalCalories,
      confidence: 100 // User correction is always 100% confident
    };
    
    this.correctionLearning.set(imageSignature, correctedAnalysis);
    
    // Update patterns for similar foods
    await this.updateLearningPatterns(originalAnalysis, correctedAnalysis);
    
    // Store in database for future reference
    await this.storeCorrectionInDatabase(imageSignature, originalAnalysis, correctedAnalysis);
  }

  // Helper methods
  
  private generateMockAnalysis(): FoodAnalysis {
    return {
      totalCalories: 450,
      totalMacros: {
        protein: 35,
        carbs: 45,
        fat: 12,
        fiber: 3
      },
      items: [
        {
          name: 'grilled chicken breast',
          confidence: 0.9,
          quantity: '5 oz',
          estimatedCalories: 230,
          macros: { protein: 35, carbs: 0, fat: 5 },
          portionSize: 'palm-sized'
        },
        {
          name: 'white rice',
          confidence: 0.8,
          quantity: '1 cup cooked',
          estimatedCalories: 200,
          macros: { protein: 0, carbs: 45, fat: 0 },
          portionSize: 'cupped handful'
        },
        {
          name: 'mixed vegetables',
          confidence: 0.7,
          quantity: '1/2 cup',
          estimatedCalories: 20,
          macros: { protein: 0, carbs: 5, fat: 0, fiber: 3 },
          portionSize: 'half cupped hand'
        }
      ],
      confidence: 0.82,
      suggestions: [
        'Consider adding more vegetables for micronutrients',
        'This meal provides good protein for muscle recovery'
      ],
      needsClarification: false
    };
  }

  private async enhanceWithDatabase(analysis: FoodAnalysis): Promise<FoodAnalysis> {
    // Enhance with food database information
    for (const item of analysis.items) {
      const dbInfo = this.foodDatabase.get(item.name.toLowerCase());
      if (dbInfo) {
        // Improve accuracy with database values
        item.estimatedCalories = this.adjustWithDatabase(item.estimatedCalories, dbInfo.calories);
        item.confidence = Math.min(item.confidence + 0.1, 1.0);
      }
    }
    
    return analysis;
  }

  private combineAnalyses(analyses: FoodAnalysis[]): FoodAnalysis {
    if (analyses.length === 1) return analyses[0];
    
    // Weight by confidence and combine
    const weights = analyses.map(a => a.confidence);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    // Weighted average of calories
    const totalCalories = analyses.reduce((sum, analysis, i) => 
      sum + (analysis.totalCalories * weights[i]), 0) / totalWeight;
    
    // Combine items (deduplicate by name)
    const combinedItems = new Map<string, FoodItem>();
    
    analyses.forEach((analysis, i) => {
      analysis.items.forEach(item => {
        if (combinedItems.has(item.name)) {
          // Average the values
          const existing = combinedItems.get(item.name)!;
          const weight = weights[i] / totalWeight;
          
          combinedItems.set(item.name, {
            ...existing,
            estimatedCalories: (existing.estimatedCalories + item.estimatedCalories * weight) / 2,
            confidence: Math.max(existing.confidence, item.confidence)
          });
        } else {
          combinedItems.set(item.name, item);
        }
      });
    });
    
    return {
      totalCalories: Math.round(totalCalories),
      totalMacros: this.calculateTotalMacros(Array.from(combinedItems.values())),
      items: Array.from(combinedItems.values()),
      confidence: totalWeight / analyses.length,
      suggestions: this.combineSuggestions(analyses),
      needsClarification: analyses.some(a => a.needsClarification)
    };
  }

  private calculateTotalMacros(items: FoodItem[]): FoodItem['macros'] {
    return items.reduce((total, item) => ({
      protein: total.protein + item.macros.protein,
      carbs: total.carbs + item.macros.carbs,
      fat: total.fat + item.macros.fat,
      fiber: (total.fiber || 0) + (item.macros.fiber || 0)
    }), { protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }

  private combineSuggestions(analyses: FoodAnalysis[]): string[] {
    const allSuggestions = analyses.flatMap(a => a.suggestions);
    return Array.from(new Set(allSuggestions)); // Remove duplicates
  }

  private adjustWithDatabase(estimated: number, dbValue: number): number {
    // Use database value if within reasonable range, otherwise average
    const ratio = estimated / dbValue;
    if (ratio >= 0.7 && ratio <= 1.3) {
      return Math.round((estimated + dbValue) / 2);
    }
    return estimated;
  }

  private async updateLearningPatterns(
    original: FoodAnalysis,
    corrected: FoodAnalysis
  ): Promise<void> {
    // Analyze the correction to improve future predictions
    original.items.forEach((originalItem, index) => {
      const correctedItem = corrected.items[index];
      if (correctedItem) {
        const calorieRatio = correctedItem.estimatedCalories / originalItem.estimatedCalories;
        
        // Store pattern: food + portion → calorie adjustment
        const pattern = `${originalItem.name}_${originalItem.quantity}`;
        console.log(`Learning pattern: ${pattern} ratio: ${calorieRatio}`);
      }
    });
  }

  private async storeCorrectionInDatabase(
    imageSignature: string,
    original: FoodAnalysis,
    corrected: FoodAnalysis
  ): Promise<void> {
    // Store in food_recognition_corrections table
    const correction = {
      image_signature: imageSignature,
      original_analysis: original,
      corrected_analysis: corrected,
      created_at: new Date().toISOString()
    };
    
    console.log('Storing correction:', correction);
  }
}