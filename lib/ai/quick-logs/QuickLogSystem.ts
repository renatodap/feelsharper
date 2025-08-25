/**
 * QuickLogSystem - AI-powered common logs and predictive logging
 * Phase 10.4: One-tap repeat for frequent entries
 */

interface CommonLogEntry {
  id: string;
  text: string;
  parsedData: any;
  frequency: number;
  lastUsed: string;
  timeOfDay: number[]; // Hours when typically logged
  dayOfWeek: number[]; // Days when typically logged
  userType: string;
  category: 'meal' | 'workout' | 'weight' | 'mood' | 'sleep' | 'custom';
  confidence: number;
  variations: string[];
}

interface QuickSuggestion {
  entry: CommonLogEntry;
  reason: string;
  probability: number;
  adaptedText?: string;
}

interface HabitStack {
  trigger: string;
  stack: CommonLogEntry[];
  success_rate: number;
  last_triggered: string;
}

export class QuickLogSystem {
  private userCommonLogs: Map<string, CommonLogEntry[]> = new Map();
  private habitStacks: Map<string, HabitStack[]> = new Map();
  private timePatterns: Map<string, any> = new Map();

  /**
   * Phase 10.4.1: AI learning of frequent user patterns
   */
  async learnUserPatterns(userId: string, timeWindow: number = 30): Promise<CommonLogEntry[]> {
    // Fetch user's activity logs from the last 30 days
    const activities = await this.fetchUserActivities(userId, timeWindow);
    
    // Group by similarity and frequency
    const patterns = this.extractPatterns(activities);
    
    // Convert to common log entries
    const commonLogs = patterns.map(pattern => ({
      id: this.generateId(),
      text: pattern.text,
      parsedData: pattern.data,
      frequency: pattern.count,
      lastUsed: pattern.lastUsed,
      timeOfDay: pattern.timePattern,
      dayOfWeek: pattern.dayPattern,
      userType: pattern.userType,
      category: pattern.category,
      confidence: this.calculatePatternConfidence(pattern),
      variations: pattern.variations
    }));

    // Store for quick access
    this.userCommonLogs.set(userId, commonLogs);
    
    return commonLogs;
  }

  /**
   * Phase 10.4.2: One-tap repeat for common entries
   */
  getQuickAccessButtons(userId: string, limit: number = 10): CommonLogEntry[] {
    const commonLogs = this.userCommonLogs.get(userId) || [];
    
    // Sort by usage frequency and recency
    return commonLogs
      .sort((a, b) => {
        const aScore = this.calculateQuickAccessScore(a);
        const bScore = this.calculateQuickAccessScore(b);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * Phase 10.4.3: Smart suggestions based on time/day
   */
  getContextualSuggestions(userId: string, currentTime?: Date): QuickSuggestion[] {
    const now = currentTime || new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    const commonLogs = this.userCommonLogs.get(userId) || [];
    const suggestions: QuickSuggestion[] = [];
    
    commonLogs.forEach(log => {
      const probability = this.calculateTimeProbability(log, hour, dayOfWeek);
      
      if (probability > 0.3) { // 30% threshold
        suggestions.push({
          entry: log,
          reason: this.generateSuggestionReason(log, hour, dayOfWeek),
          probability,
          adaptedText: this.adaptTextForContext(log.text, now)
        });
      }
    });
    
    // Sort by probability
    return suggestions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  /**
   * Phase 10.4.4: Habit stacking recommendations
   */
  async generateHabitStacks(userId: string): Promise<HabitStack[]> {
    const activities = await this.fetchUserActivities(userId, 60); // 2 months
    
    // Find sequential patterns (habit stacks)
    const stacks = this.detectHabitStacks(activities);
    
    // Store for future suggestions
    this.habitStacks.set(userId, stacks);
    
    return stacks.filter(stack => stack.success_rate > 0.6); // 60% success rate
  }

  /**
   * Phase 10.4.5: Visual button grid for top 10 logs
   */
  generateButtonGrid(userId: string): {
    primary: CommonLogEntry[];
    secondary: CommonLogEntry[];
    contextual: QuickSuggestion[];
  } {
    const quickAccess = this.getQuickAccessButtons(userId, 6);
    const contextual = this.getContextualSuggestions(userId);
    const allCommon = this.userCommonLogs.get(userId) || [];
    
    return {
      primary: quickAccess.slice(0, 6), // Top 6 most frequent
      secondary: allCommon
        .filter(log => !quickAccess.includes(log))
        .slice(0, 4), // Next 4 common entries
      contextual: contextual.slice(0, 3) // Top 3 time-based suggestions
    };
  }

  /**
   * Phase 10.4.6: Swipe-to-log gestures
   */
  getSwipeGestures(userId: string): {
    swipeRight: CommonLogEntry[];
    swipeLeft: CommonLogEntry[];
    swipeUp: CommonLogEntry[];
  } {
    const common = this.userCommonLogs.get(userId) || [];
    
    // Assign most common logs to gestures
    return {
      swipeRight: common.filter(log => log.category === 'meal').slice(0, 3),
      swipeLeft: common.filter(log => log.category === 'workout').slice(0, 3),
      swipeUp: common.filter(log => log.category === 'weight' || log.category === 'mood').slice(0, 2)
    };
  }

  /**
   * Phase 10.4.7: Predictive text completion
   */
  getPredictiveCompletions(userId: string, partialText: string): string[] {
    const common = this.userCommonLogs.get(userId) || [];
    const completions: string[] = [];
    
    common.forEach(log => {
      // Check if any variations match the partial text
      [log.text, ...log.variations].forEach(variation => {
        if (variation.toLowerCase().startsWith(partialText.toLowerCase())) {
          completions.push(variation);
        }
      });
    });
    
    // Also check for partial word matches
    const words = partialText.split(' ');
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      
      common.forEach(log => {
        const logWords = log.text.split(' ');
        logWords.forEach(word => {
          if (word.toLowerCase().startsWith(lastWord.toLowerCase()) && word !== lastWord) {
            const completion = words.slice(0, -1).concat(word).join(' ');
            completions.push(completion);
          }
        });
      });
    }
    
    // Remove duplicates and sort by frequency
    return Array.from(new Set(completions))
      .sort((a, b) => {
        const aLog = common.find(log => log.text === a || log.variations.includes(a));
        const bLog = common.find(log => log.text === b || log.variations.includes(b));
        const aFreq = aLog?.frequency || 0;
        const bFreq = bLog?.frequency || 0;
        return bFreq - aFreq;
      })
      .slice(0, 5);
  }

  /**
   * Update common logs when user creates new entry
   */
  async updateCommonLogs(userId: string, newEntry: string, parsedData: any): Promise<void> {
    const common = this.userCommonLogs.get(userId) || [];
    
    // Check if similar entry exists
    const similar = this.findSimilarEntry(common, newEntry);
    
    if (similar) {
      // Update frequency and add as variation
      similar.frequency++;
      similar.lastUsed = new Date().toISOString();
      if (!similar.variations.includes(newEntry)) {
        similar.variations.push(newEntry);
      }
    } else {
      // Create new common log entry
      const newCommon: CommonLogEntry = {
        id: this.generateId(),
        text: newEntry,
        parsedData: parsedData,
        frequency: 1,
        lastUsed: new Date().toISOString(),
        timeOfDay: [new Date().getHours()],
        dayOfWeek: [new Date().getDay()],
        userType: await this.getUserType(userId),
        category: this.categorizeEntry(newEntry, parsedData),
        confidence: 0.5, // New entries start with medium confidence
        variations: []
      };
      
      common.push(newCommon);
    }
    
    // Update storage
    this.userCommonLogs.set(userId, common);
    
    // Store in database
    await this.storeCommonLogs(userId, common);
  }

  // Helper methods
  
  private async fetchUserActivities(userId: string, days: number): Promise<any[]> {
    // Mock implementation - fetch from database
    const mockActivities = [
      {
        text: 'had chicken and rice',
        parsed_data: { intent: 'nutrition', foods: ['chicken', 'rice'] },
        created_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        text: 'weight 175',
        parsed_data: { intent: 'measurement', weight: 175 },
        created_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        text: 'ran 5k',
        parsed_data: { intent: 'fitness', exercise: 'running', distance: '5k' },
        created_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return mockActivities;
  }

  private extractPatterns(activities: any[]): any[] {
    const patterns = new Map<string, any>();
    
    activities.forEach(activity => {
      const normalized = this.normalizeText(activity.text);
      
      if (patterns.has(normalized)) {
        const pattern = patterns.get(normalized);
        pattern.count++;
        pattern.variations.add(activity.text);
        pattern.lastUsed = activity.created_at;
        
        // Track time patterns
        const hour = new Date(activity.created_at).getHours();
        const day = new Date(activity.created_at).getDay();
        pattern.timePattern.push(hour);
        pattern.dayPattern.push(day);
      } else {
        patterns.set(normalized, {
          text: activity.text,
          data: activity.parsed_data,
          count: 1,
          variations: new Set([activity.text]),
          lastUsed: activity.created_at,
          timePattern: [new Date(activity.created_at).getHours()],
          dayPattern: [new Date(activity.created_at).getDay()],
          category: this.categorizeEntry(activity.text, activity.parsed_data),
          userType: 'general' // Would get from user profile
        });
      }
    });
    
    // Convert sets to arrays and filter by frequency
    return Array.from(patterns.values())
      .filter(pattern => pattern.count >= 2) // Minimum 2 occurrences
      .map(pattern => ({
        ...pattern,
        variations: Array.from(pattern.variations)
      }));
  }

  private calculatePatternConfidence(pattern: any): number {
    let confidence = 0;
    
    // Frequency contributes to confidence
    confidence += Math.min(pattern.count / 10, 0.4); // Max 40% from frequency
    
    // Time pattern consistency
    const timeConsistency = this.calculateTimeConsistency(pattern.timePattern);
    confidence += timeConsistency * 0.3; // Max 30% from time pattern
    
    // Variation consistency (similar texts)
    const textConsistency = this.calculateTextConsistency(pattern.variations);
    confidence += textConsistency * 0.3; // Max 30% from text similarity
    
    return Math.min(confidence, 1.0);
  }

  private calculateQuickAccessScore(log: CommonLogEntry): number {
    const now = new Date();
    const daysSinceUsed = (now.getTime() - new Date(log.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    
    // Base score from frequency
    let score = log.frequency * 10;
    
    // Recency bonus (decays over time)
    score += Math.max(0, 100 - daysSinceUsed * 5);
    
    // Confidence bonus
    score += log.confidence * 50;
    
    // Time relevance bonus
    const hour = now.getHours();
    if (log.timeOfDay.includes(hour)) {
      score += 25;
    }
    
    return score;
  }

  private calculateTimeProbability(log: CommonLogEntry, hour: number, dayOfWeek: number): number {
    let probability = 0;
    
    // Time of day match
    const timeMatches = log.timeOfDay.filter(h => Math.abs(h - hour) <= 1).length;
    probability += (timeMatches / log.timeOfDay.length) * 0.6;
    
    // Day of week match
    const dayMatches = log.dayOfWeek.includes(dayOfWeek) ? 1 : 0;
    probability += dayMatches * 0.4;
    
    // Base probability from frequency
    probability += Math.min(log.frequency / 20, 0.3);
    
    return Math.min(probability, 1.0);
  }

  private generateSuggestionReason(log: CommonLogEntry, hour: number, dayOfWeek: number): string {
    const reasons = [];
    
    if (log.timeOfDay.includes(hour)) {
      reasons.push('usually logged at this time');
    }
    
    if (log.dayOfWeek.includes(dayOfWeek)) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      reasons.push(`commonly done on ${dayName}s`);
    }
    
    if (log.frequency > 10) {
      reasons.push('frequently logged activity');
    }
    
    return reasons.join(' and ') || 'based on your patterns';
  }

  private adaptTextForContext(text: string, now: Date): string {
    // Add time-specific adaptations
    const hour = now.getHours();
    
    if (text.includes('meal') || text.includes('ate')) {
      if (hour >= 6 && hour <= 10) return text.replace(/meal/g, 'breakfast');
      if (hour >= 11 && hour <= 14) return text.replace(/meal/g, 'lunch');
      if (hour >= 17 && hour <= 21) return text.replace(/meal/g, 'dinner');
    }
    
    if (text.includes('workout') && hour >= 6 && hour <= 9) {
      return `morning ${text}`;
    }
    
    return text;
  }

  private detectHabitStacks(activities: any[]): HabitStack[] {
    const stacks: Map<string, any> = new Map();
    
    // Sort activities by time
    const sorted = activities.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Find sequences within 2 hours of each other
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      const timeDiff = new Date(next.created_at).getTime() - new Date(current.created_at).getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (timeDiff <= twoHours) {
        const stackKey = `${current.text} -> ${next.text}`;
        
        if (stacks.has(stackKey)) {
          stacks.get(stackKey).count++;
        } else {
          stacks.set(stackKey, {
            trigger: current.text,
            stack: [current, next],
            count: 1,
            total_opportunities: 0
          });
        }
      }
    }
    
    // Calculate success rates and convert to HabitStack format
    return Array.from(stacks.values())
      .filter(stack => stack.count >= 3) // Minimum 3 occurrences
      .map(stack => ({
        trigger: stack.trigger,
        stack: stack.stack,
        success_rate: stack.count / (stack.count + 5), // Rough success rate
        last_triggered: new Date().toISOString()
      }));
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/\d+/g, 'X') // Replace numbers with X
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim();
  }

  private categorizeEntry(text: string, parsedData: any): CommonLogEntry['category'] {
    if (parsedData?.intent) {
      switch (parsedData.intent) {
        case 'nutrition': return 'meal';
        case 'fitness': return 'workout';
        case 'measurement': return 'weight';
        case 'wellness': return 'mood';
        default: return 'custom';
      }
    }
    
    // Fallback text-based categorization
    if (text.includes('ate') || text.includes('meal') || text.includes('food')) return 'meal';
    if (text.includes('ran') || text.includes('workout') || text.includes('gym')) return 'workout';
    if (text.includes('weight') || text.includes('lbs') || text.includes('kg')) return 'weight';
    if (text.includes('sleep') || text.includes('slept')) return 'sleep';
    if (text.includes('feel') || text.includes('mood')) return 'mood';
    
    return 'custom';
  }

  private findSimilarEntry(commonLogs: CommonLogEntry[], text: string): CommonLogEntry | null {
    const normalized = this.normalizeText(text);
    
    return commonLogs.find(log => 
      this.normalizeText(log.text) === normalized ||
      log.variations.some(v => this.normalizeText(v) === normalized)
    ) || null;
  }

  private calculateTimeConsistency(timePattern: number[]): number {
    if (timePattern.length < 2) return 0.5;
    
    // Calculate variance in time patterns
    const avg = timePattern.reduce((sum, hour) => sum + hour, 0) / timePattern.length;
    const variance = timePattern.reduce((sum, hour) => sum + Math.pow(hour - avg, 2), 0) / timePattern.length;
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - variance / 144); // 144 = 12^2 (max variance for 12-hour difference)
  }

  private calculateTextConsistency(variations: string[]): number {
    if (variations.length < 2) return 1.0;
    
    // Simple consistency based on length similarity
    const lengths = variations.map(v => v.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    return Math.max(0, 1 - variance / 100); // Normalize by arbitrary factor
  }

  private async getUserType(userId: string): Promise<string> {
    // Fetch from user profile
    return 'general'; // Mock implementation
  }

  private async storeCommonLogs(userId: string, commonLogs: CommonLogEntry[]): Promise<void> {
    // Store in database - mock implementation
    console.log(`Storing ${commonLogs.length} common logs for user ${userId}`);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}