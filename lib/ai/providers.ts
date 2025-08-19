// AI Provider Configuration and Cost Calculation

export interface AIProvider {
  name: string;
  model: string;
  inputCostPer1K: number;  // Cost per 1000 input tokens in USD
  outputCostPer1K: number; // Cost per 1000 output tokens in USD
  maxTokens: number;
  endpoint: string;
}

export const AI_PROVIDERS = {
  groq: {
    name: 'groq',
    model: 'mixtral-8x7b-32768',
    inputCostPer1K: 0,      // Free tier
    outputCostPer1K: 0,     // Free tier
    maxTokens: 32768,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  openai: {
    name: 'openai',
    model: 'gpt-3.5-turbo',
    inputCostPer1K: 0.0005,
    outputCostPer1K: 0.0015,
    maxTokens: 4096,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  anthropic: {
    name: 'anthropic',
    model: 'claude-3-haiku-20240307',
    inputCostPer1K: 0.00025,
    outputCostPer1K: 0.00125,
    maxTokens: 4096,
    endpoint: 'https://api.anthropic.com/v1/messages'
  }
} as const;

export const TIER_CONFIG = {
  free: {
    provider: AI_PROVIDERS.groq,
    maxCostPerMonth: 0.50,
    maxQueriesPerMonth: 100,
    features: ['basic_chat', 'daily_insights'],
    resetDayOfMonth: 1
  },
  starter: {
    provider: AI_PROVIDERS.openai,
    maxCostPerMonth: 5.00,
    maxQueriesPerMonth: 1000,
    features: ['unlimited_chat', 'meal_suggestions', 'workout_plans', 'weekly_reports'],
    resetDayOfMonth: 1
  },
  pro: {
    provider: AI_PROVIDERS.anthropic,
    maxCostPerMonth: 15.00,
    maxQueriesPerMonth: null, // Unlimited queries
    features: ['coach_mode', 'voice_input', 'custom_programs', 'priority_support', 'advanced_analytics'],
    resetDayOfMonth: 1
  }
} as const;

export function calculateCost(provider: AIProvider, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * provider.inputCostPer1K;
  const outputCost = (outputTokens / 1000) * provider.outputCostPer1K;
  return inputCost + outputCost;
}

export function getTierProvider(tier: 'free' | 'starter' | 'pro'): AIProvider {
  return TIER_CONFIG[tier].provider;
}

// Token estimation (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ~= 4 characters
  return Math.ceil(text.length / 4);
}