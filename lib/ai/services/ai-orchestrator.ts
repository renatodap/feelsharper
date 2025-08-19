import { OpenAIParser, ParsedActivity } from './openai-parser';
import { ClaudeCoach, CoachResponse, UserContext } from './claude-coach';

interface ProcessedInput {
  parsedActivity: ParsedActivity;
  coachResponse: CoachResponse;
  shouldSave: boolean;
  error?: string;
}

interface OrchestratorConfig {
  openAIKey: string;
  claudeKey: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export class AIOrchestrator {
  private parser: OpenAIParser;
  private coach: ClaudeCoach;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(config: OrchestratorConfig) {
    this.parser = new OpenAIParser(config.openAIKey);
    this.coach = new ClaudeCoach(config.claudeKey);
    this.maxRetries = config.maxRetries || 3;
    this.timeoutMs = config.timeoutMs || 5000;
  }

  async processInput(
    text: string,
    context: UserContext = {}
  ): Promise<ProcessedInput> {
    try {
      // Step 1: Parse the input with OpenAI
      const parsedActivity = await this.parseWithTimeout(text);

      // Step 2: Generate coach response with Claude
      const coachResponse = await this.coachWithTimeout(
        text,
        parsedActivity,
        context
      );

      // Step 3: Determine if we should save (confidence threshold)
      const shouldSave = parsedActivity.confidence > 0.6 && 
                        parsedActivity.type !== 'unknown';

      return {
        parsedActivity,
        coachResponse,
        shouldSave
      };
    } catch (error) {
      console.error('Orchestrator error:', error);
      return this.handleError(text, error);
    }
  }

  private async parseWithTimeout(text: string): Promise<ParsedActivity> {
    return this.withTimeout(
      this.parser.parse(text),
      this.timeoutMs,
      'Parsing timeout'
    );
  }

  private async coachWithTimeout(
    text: string,
    parsedActivity: ParsedActivity,
    context: UserContext
  ): Promise<CoachResponse> {
    return this.withTimeout(
      this.coach.generateResponse(text, parsedActivity, context),
      this.timeoutMs,
      'Coach response timeout'
    );
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  }

  private handleError(text: string, error: any): ProcessedInput {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      parsedActivity: {
        type: 'unknown',
        data: { text, error: errorMessage },
        confidence: 0,
        rawText: text
      },
      coachResponse: {
        message: "I couldn't process that completely, but I've noted it for you.",
        nextSteps: ["Try rephrasing or being more specific"]
      },
      shouldSave: false,
      error: errorMessage
    };
  }

  async processBatch(
    inputs: string[],
    context: UserContext = {}
  ): Promise<ProcessedInput[]> {
    // Process in parallel with concurrency limit
    const batchSize = 5;
    const results: ProcessedInput[] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(input => this.processInput(input, context))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async generateDailyMission(context: UserContext): Promise<string> {
    try {
      return await this.withTimeout(
        this.coach.generateDailyMission(context),
        this.timeoutMs,
        'Mission generation timeout'
      );
    } catch (error) {
      console.error('Mission generation error:', error);
      return "Track 3 activities today - you choose!";
    }
  }

  async analyzeUserPatterns(activities: any[]): Promise<{
    trends: string[];
    recommendations: string[];
    achievements: string[];
  }> {
    try {
      return await this.withTimeout(
        this.coach.analyzePatterns(activities),
        this.timeoutMs * 2, // Give more time for analysis
        'Pattern analysis timeout'
      );
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return {
        trends: ["Keep tracking to discover patterns"],
        recommendations: ["Consistency is key"],
        achievements: ["Started your journey!"]
      };
    }
  }

  // Utility method to validate API keys
  async validateConnections(): Promise<{
    openAI: boolean;
    claude: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let openAI = false;
    let claude = false;

    // Test OpenAI connection
    try {
      await this.parser.parse('test');
      openAI = true;
    } catch (error) {
      errors.push(`OpenAI connection failed: ${error}`);
    }

    // Test Claude connection
    try {
      await this.coach.generateResponse('test', {
        type: 'unknown',
        data: {},
        confidence: 0,
        rawText: 'test'
      });
      claude = true;
    } catch (error) {
      errors.push(`Claude connection failed: ${error}`);
    }

    return { openAI, claude, errors };
  }

  // Method to get suggestions for ambiguous input
  async getSuggestions(text: string): Promise<string[]> {
    const suggestions: string[] = [];
    const normalizedText = text.toLowerCase();

    // Suggest based on keywords
    if (normalizedText.includes('eat') || normalizedText.includes('ate')) {
      suggestions.push('Try: "Had eggs and toast for breakfast"');
      suggestions.push('Try: "Ate a chicken salad for lunch"');
    } else if (normalizedText.includes('exercise') || normalizedText.includes('workout')) {
      suggestions.push('Try: "Ran 5k in 30 minutes"');
      suggestions.push('Try: "Did 3 sets of 10 pushups"');
    } else if (normalizedText.includes('weigh')) {
      suggestions.push('Try: "Weight 175 lbs"');
      suggestions.push('Try: "Weighed 80 kg this morning"');
    } else if (normalizedText.includes('feel')) {
      suggestions.push('Try: "Feeling great today"');
      suggestions.push('Try: "Energy level 8/10"');
    } else if (normalizedText.includes('sleep') || normalizedText.includes('slept')) {
      suggestions.push('Try: "Slept 8 hours"');
      suggestions.push('Try: "Got 7.5 hours of good sleep"');
    } else {
      // General suggestions
      suggestions.push('Try: "Weight 175"');
      suggestions.push('Try: "Had eggs for breakfast"');
      suggestions.push('Try: "Ran 5k"');
      suggestions.push('Try: "Feeling great"');
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }
}

export type { ProcessedInput, OrchestratorConfig };