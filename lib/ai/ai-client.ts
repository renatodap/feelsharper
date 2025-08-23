/**
 * Master AI Client - Smart routing between Gemini (free), OpenAI, and Claude
 * Prioritizes cost-effective Gemini for most operations, uses premium services only when needed
 */

import { parseNaturalLanguageWithGemini, getGeminiCoachingResponse, suggestFoodsWithGemini, testGeminiConnection } from './gemini-client';
import { parseNaturalLanguage as parseWithOpenAI, testOpenAIConnection } from './openai-client';
import { getCoachingResponse as getClaudeResponse, testClaudeConnection } from './claude-client';
import { getRateLimiter } from '../rate-limiter';

// Service selection strategy
export type AIService = 'gemini' | 'openai' | 'claude';
export type TaskType = 'parse' | 'coaching' | 'food_suggestions' | 'complex_analysis' | 'creative_writing';

export interface AIRequest {
  text: string;
  context?: string;
  userId?: string;
  taskType: TaskType;
  forceService?: AIService; // Override automatic selection
}

export interface AIResponse {
  success: boolean;
  data: any;
  serviceUsed: AIService;
  confidence: number;
  cached: boolean;
  error?: string;
}

/**
 * Determine which AI service to use based on task complexity and requirements
 */
function selectBestService(taskType: TaskType, forceService?: AIService): AIService {
  if (forceService) return forceService;

  const serviceStrategy: Record<TaskType, AIService> = {
    // Gemini handles most operations (free tier)
    'parse': 'gemini',              // Natural language parsing
    'food_suggestions': 'gemini',   // Food recommendations
    'coaching': 'gemini',           // Basic coaching advice
    
    // OpenAI for specialized parsing (when Gemini fails or complex data)
    'complex_analysis': 'openai',   // Complex workout analysis
    
    // Claude for advanced coaching (when deep personalization needed)
    'creative_writing': 'claude',   // Meal plans, workout programs
  };

  return serviceStrategy[taskType];
}

/**
 * Universal parse function - tries Gemini first, fallback to OpenAI if needed
 */
export async function parseNaturalLanguage(request: AIRequest): Promise<AIResponse> {
  const service = selectBestService('parse', request.forceService);
  const rateLimiter = getRateLimiter();
  const rateLimitKey = `${service}:parse:${request.userId || 'anonymous'}`;

  // Check rate limit
  const rateLimitResult = await rateLimiter.check(rateLimitKey);
  if (!rateLimitResult.success) {
    throw new Error(rateLimitResult.error || 'Rate limit exceeded');
  }

  try {
    if (service === 'gemini') {
      const result = await parseNaturalLanguageWithGemini({
        text: request.text,
        context: request.context as any,
        userId: request.userId
      });

      // If Gemini confidence is too low, try OpenAI
      if (result.confidence < 60 && !request.forceService) {
        console.log('Gemini confidence low, trying OpenAI...');
        return parseNaturalLanguage({ ...request, forceService: 'openai' });
      }

      return {
        success: true,
        data: result,
        serviceUsed: 'gemini',
        confidence: result.confidence,
        cached: false
      };
    } else {
      // Use OpenAI for complex parsing
      const result = await parseWithOpenAI({
        text: request.text,
        context: request.context as any,
        userId: request.userId
      });

      return {
        success: true,
        data: result,
        serviceUsed: 'openai',
        confidence: result.confidence,
        cached: false
      };
    }
  } catch (error) {
    console.error(`AI parsing error with ${service}:`, error);
    return {
      success: false,
      data: null,
      serviceUsed: service,
      confidence: 0,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Universal coaching function - Gemini for basic, Claude for advanced
 */
export async function getCoachingResponse(request: {
  message: string;
  context?: any;
  conversation_history?: any[];
  coaching_mode?: string;
  userId?: string;
  forceService?: AIService;
}): Promise<AIResponse> {
  const service = selectBestService('coaching', request.forceService);
  const rateLimiter = getRateLimiter();
  const rateLimitKey = `${service}:coaching:${request.userId || 'anonymous'}`;

  // Check rate limit
  const rateLimitResult = await rateLimiter.check(rateLimitKey);
  if (!rateLimitResult.success) {
    throw new Error(rateLimitResult.error || 'Rate limit exceeded');
  }

  try {
    if (service === 'gemini') {
      const result = await getGeminiCoachingResponse({
        message: request.message,
        context: request.context,
        conversation_history: request.conversation_history?.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: h.content
        })),
        coaching_mode: request.coaching_mode as any
      });

      return {
        success: true,
        data: result,
        serviceUsed: 'gemini',
        confidence: result.confidence,
        cached: false
      };
    } else {
      // Use Claude for advanced coaching
      const result = await getClaudeResponse({
        message: request.message,
        context: request.context,
        conversation_history: request.conversation_history,
        coaching_mode: request.coaching_mode as any
      });

      return {
        success: true,
        data: result,
        serviceUsed: 'claude',
        confidence: result.confidence,
        cached: false
      };
    }
  } catch (error) {
    console.error(`AI coaching error with ${service}:`, error);
    return {
      success: false,
      data: null,
      serviceUsed: service,
      confidence: 0,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Food suggestions using Gemini (free tier)
 */
export async function suggestFoods(query: string, userId?: string): Promise<AIResponse> {
  const rateLimiter = getRateLimiter();
  const rateLimitKey = `gemini:foods:${userId || 'anonymous'}`;

  // Check rate limit
  const rateLimitResult = await rateLimiter.check(rateLimitKey);
  if (!rateLimitResult.success) {
    throw new Error(rateLimitResult.error || 'Rate limit exceeded');
  }

  try {
    const result = await suggestFoodsWithGemini(query);

    return {
      success: true,
      data: result,
      serviceUsed: 'gemini',
      confidence: 85,
      cached: false
    };
  } catch (error) {
    console.error('Food suggestions error:', error);
    return {
      success: false,
      data: [],
      serviceUsed: 'gemini',
      confidence: 0,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test all AI service connections
 */
export async function testAllConnections(): Promise<{
  gemini: boolean;
  openai: boolean;
  claude: boolean;
  overall: boolean;
}> {
  try {
    const [geminiResult, openaiResult, claudeResult] = await Promise.all([
      testGeminiConnection().catch(() => false),
      testOpenAIConnection().catch(() => false),
      testClaudeConnection().catch(() => false)
    ]);

    return {
      gemini: geminiResult,
      openai: openaiResult,
      claude: claudeResult,
      overall: geminiResult // At minimum, Gemini should work
    };
  } catch (error) {
    console.error('Connection test error:', error);
    return {
      gemini: false,
      openai: false,
      claude: false,
      overall: false
    };
  }
}

/**
 * Get service usage statistics
 */
export function getServiceUsageStats() {
  return {
    primary_service: 'gemini',
    fallback_services: ['openai', 'claude'],
    cost_optimization: 'Free Gemini for 80%+ operations',
    rate_limits: {
      gemini: '60 req/min (free)',
      openai: '20 req/min (paid)',
      claude: '20 req/min (paid)'
    }
  };
}

/**
 * Smart service selection based on user context
 */
export function recommendService(taskComplexity: 'simple' | 'medium' | 'complex', userTier: 'free' | 'pro' = 'free'): AIService {
  if (userTier === 'free') {
    return 'gemini'; // Always use free tier for free users
  }

  // Pro users get smart routing
  switch (taskComplexity) {
    case 'simple': return 'gemini';
    case 'medium': return Math.random() > 0.7 ? 'openai' : 'gemini'; // 30% OpenAI
    case 'complex': return 'claude';
    default: return 'gemini';
  }
}