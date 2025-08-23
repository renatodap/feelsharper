// Common Logs Tracker with ML-based frequency tracking
import { createClient } from '@/lib/supabase/client';

interface LogFrequency {
  text: string;
  count: number;
  lastUsed: Date;
  category?: string;
  confidence?: number;
}

interface LogPattern {
  pattern: RegExp;
  category: string;
  extractors?: {
    [key: string]: (match: RegExpMatchArray) => any;
  };
}

// ML-based patterns for common workout logs
const WORKOUT_PATTERNS: LogPattern[] = [
  {
    pattern: /(\d+)\s*(?:sets?|x)\s*(\d+)\s*(?:reps?)?(?:\s*@?\s*(\d+(?:\.\d+)?)\s*(?:kg|lbs?)?)?/i,
    category: 'strength',
    extractors: {
      sets: (match) => parseInt(match[1]),
      reps: (match) => parseInt(match[2]),
      weight: (match) => match[3] ? parseFloat(match[3]) : null
    }
  },
  {
    pattern: /(\d+(?:\.\d+)?)\s*(?:km|miles?|mi)\s*(?:in)?\s*(\d+:\d+|\d+\s*(?:min|minutes?))/i,
    category: 'cardio',
    extractors: {
      distance: (match) => parseFloat(match[1]),
      duration: (match) => match[2]
    }
  },
  {
    pattern: /(?:felt?|feeling|energy|mood)?\s*(great|good|okay|tired|exhausted|strong|weak)/i,
    category: 'feeling',
    extractors: {
      mood: (match) => match[1].toLowerCase()
    }
  },
  {
    pattern: /(?:pr|personal\s*record|pb|personal\s*best)/i,
    category: 'achievement',
    extractors: {}
  }
];

export class CommonLogsTracker {
  private static instance: CommonLogsTracker;
  private userLogs: Map<string, LogFrequency[]> = new Map();
  private globalPatterns: LogPattern[] = WORKOUT_PATTERNS;

  private constructor() {}

  static getInstance(): CommonLogsTracker {
    if (!CommonLogsTracker.instance) {
      CommonLogsTracker.instance = new CommonLogsTracker();
    }
    return CommonLogsTracker.instance;
  }

  // Load user's historical logs from database
  async loadUserLogs(userId: string): Promise<void> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('raw_input, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const frequencyMap = new Map<string, LogFrequency>();
        
        data.forEach(log => {
          const normalized = this.normalizeLog(log.raw_input);
          const existing = frequencyMap.get(normalized);
          
          if (existing) {
            existing.count++;
            existing.lastUsed = new Date(log.created_at);
          } else {
            frequencyMap.set(normalized, {
              text: log.raw_input,
              count: 1,
              lastUsed: new Date(log.created_at),
              category: this.categorizeLog(log.raw_input)
            });
          }
        });

        this.userLogs.set(userId, Array.from(frequencyMap.values()));
      }
    } catch (error) {
      console.error('Error loading user logs:', error);
    }
  }

  // Get common logs with ML-based ranking
  getCommonLogs(userId: string, query: string = ''): LogFrequency[] {
    const logs = this.userLogs.get(userId) || [];
    
    // Apply recency and frequency scoring
    const scoredLogs = logs.map(log => {
      const daysSinceUsed = (Date.now() - log.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.exp(-daysSinceUsed / 7); // Decay over 7 days
      const frequencyScore = Math.log10(log.count + 1);
      const matchScore = this.calculateMatchScore(log.text, query);
      
      return {
        ...log,
        score: (frequencyScore * 0.4) + (recencyScore * 0.3) + (matchScore * 0.3)
      };
    });

    // Sort by score and filter by query
    return scoredLogs
      .filter(log => !query || log.text.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  // Calculate how well a log matches a query
  private calculateMatchScore(text: string, query: string): number {
    if (!query) return 0;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match
    if (textLower === queryLower) return 1;
    
    // Starts with query
    if (textLower.startsWith(queryLower)) return 0.8;
    
    // Contains query
    if (textLower.includes(queryLower)) return 0.5;
    
    // Fuzzy match (simple Levenshtein-like)
    const words = queryLower.split(' ');
    const matchedWords = words.filter(word => textLower.includes(word));
    return matchedWords.length / words.length * 0.3;
  }

  // Normalize log text for comparison
  private normalizeLog(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  // Categorize log using ML patterns
  private categorizeLog(text: string): string {
    for (const pattern of this.globalPatterns) {
      if (pattern.pattern.test(text)) {
        return pattern.category;
      }
    }
    return 'general';
  }

  // Extract structured data from log text
  extractStructuredData(text: string): any {
    const results: any = {};
    
    for (const pattern of this.globalPatterns) {
      const match = text.match(pattern.pattern);
      if (match && pattern.extractors) {
        results[pattern.category] = {};
        for (const [key, extractor] of Object.entries(pattern.extractors)) {
          results[pattern.category][key] = extractor(match);
        }
      }
    }
    
    return results;
  }

  // Add new log and update frequencies
  async addLog(userId: string, text: string): Promise<void> {
    const userLogs = this.userLogs.get(userId) || [];
    const normalized = this.normalizeLog(text);
    
    const existingIndex = userLogs.findIndex(
      log => this.normalizeLog(log.text) === normalized
    );
    
    if (existingIndex >= 0) {
      userLogs[existingIndex].count++;
      userLogs[existingIndex].lastUsed = new Date();
    } else {
      userLogs.push({
        text,
        count: 1,
        lastUsed: new Date(),
        category: this.categorizeLog(text)
      });
    }
    
    this.userLogs.set(userId, userLogs);
    
    // Persist to database
    const supabase = createClient();
    await supabase.from('workout_logs').insert({
      user_id: userId,
      raw_input: text,
      structured_data: this.extractStructuredData(text),
      category: this.categorizeLog(text)
    });
  }

  // Get smart suggestions based on context
  getSmartSuggestions(userId: string, exerciseName?: string, previousSets?: any[]): string[] {
    const suggestions: string[] = [];
    const userLogs = this.userLogs.get(userId) || [];
    
    // Filter logs related to the exercise
    if (exerciseName) {
      const exerciseLogs = userLogs.filter(log => 
        log.text.toLowerCase().includes(exerciseName.toLowerCase())
      );
      
      // Get most common formats for this exercise
      suggestions.push(...exerciseLogs
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(log => log.text)
      );
    }
    
    // Add progressive overload suggestions if previous sets exist
    if (previousSets && previousSets.length > 0) {
      const lastSet = previousSets[previousSets.length - 1];
      if (lastSet.weight && lastSet.reps) {
        suggestions.push(`${lastSet.weight}kg x ${lastSet.reps + 1} reps`);
        suggestions.push(`${lastSet.weight + 2.5}kg x ${lastSet.reps} reps`);
      }
    }
    
    return suggestions.slice(0, 5);
  }
}

export default CommonLogsTracker;