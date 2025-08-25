/**
 * KnowledgeUpdater - Automatic knowledge base updates using Perplexity
 * Phase 10.2: Weekly automated searches for latest research
 */

interface ResearchUpdate {
  topic: string;
  source: string;
  credibility: number;
  summary: string;
  fullContent: string;
  publishedDate: string;
  controversy?: string;
  userRelevance: string[];
}

interface KnowledgeConflict {
  existing: string;
  new: string;
  topic: string;
  resolution: 'keep_existing' | 'use_new' | 'merge' | 'flag_controversy';
}

export class KnowledgeUpdater {
  private perplexityApiKey: string;
  private knowledgeBase: Map<string, any> = new Map();
  private controversialTopics = new Set([
    'vegan vs carnivore',
    'cardio vs weights',
    'keto effectiveness',
    'intermittent fasting',
    'supplement necessity',
    'stretching before exercise'
  ]);

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  /**
   * Phase 10.2.1: Perplexity integration for latest research
   */
  async searchLatestResearch(topics: string[]): Promise<ResearchUpdate[]> {
    const updates: ResearchUpdate[] = [];
    
    for (const topic of topics) {
      try {
        // In production, this would call Perplexity API
        // Mock implementation for now
        const research = await this.fetchPerplexityResearch(topic);
        
        // Phase 10.2.5: Source credibility scoring
        const credibility = this.scoreCredibility(research.source);
        
        // Phase 10.2.4: Controversy handling
        const controversy = this.detectControversy(topic, research.content);
        
        updates.push({
          topic,
          source: research.source,
          credibility,
          summary: research.summary,
          fullContent: research.content,
          publishedDate: research.date,
          controversy,
          userRelevance: this.determineRelevance(topic)
        });
      } catch (error) {
        console.error(`Failed to fetch research for ${topic}:`, error);
      }
    }
    
    return updates.filter(u => u.credibility > 0.6); // Only high-quality sources
  }

  /**
   * Phase 10.2.2: Weekly automated searches for nutrition/fitness updates
   */
  async performWeeklyUpdate(): Promise<{
    newKnowledge: ResearchUpdate[];
    conflicts: KnowledgeConflict[];
    applied: number;
  }> {
    // Define search topics based on user activity
    const topics = await this.generateSearchTopics();
    
    // Search for latest research
    const newKnowledge = await this.searchLatestResearch(topics);
    
    // Check for conflicts with existing knowledge
    const conflicts = this.detectConflicts(newKnowledge);
    
    // Phase 10.2.3: Vector store updates with new information
    const applied = await this.updateVectorStore(newKnowledge, conflicts);
    
    // Phase 10.2.7: Automatic prompt retraining with new knowledge
    await this.retrainPrompts(newKnowledge);
    
    return { newKnowledge, conflicts, applied };
  }

  /**
   * Phase 10.2.3: Update vector store with new information
   */
  private async updateVectorStore(
    updates: ResearchUpdate[], 
    conflicts: KnowledgeConflict[]
  ): Promise<number> {
    let applied = 0;
    
    for (const update of updates) {
      // Check if this update has conflicts
      const hasConflict = conflicts.some(c => c.topic === update.topic);
      
      if (!hasConflict || this.shouldApplyUpdate(update)) {
        // Generate embeddings for the new knowledge
        const embedding = await this.generateEmbedding(update.fullContent);
        
        // Store in vector database
        await this.storeInVectorDB({
          content: update.fullContent,
          embedding,
          metadata: {
            topic: update.topic,
            source: update.source,
            credibility: update.credibility,
            date: update.publishedDate,
            userTypes: update.userRelevance
          }
        });
        
        applied++;
      }
    }
    
    return applied;
  }

  /**
   * Phase 10.2.4: Controversy handling (vegan vs carnivore, etc.)
   */
  private detectControversy(topic: string, content: string): string | undefined {
    const topicLower = topic.toLowerCase();
    
    // Check if topic is inherently controversial
    for (const controversial of this.controversialTopics) {
      if (topicLower.includes(controversial)) {
        return `This topic has multiple valid perspectives. Presenting balanced view.`;
      }
    }
    
    // Detect conflicting claims in content
    const conflictPhrases = [
      'studies show mixed results',
      'controversial',
      'debate continues',
      'conflicting evidence',
      'no consensus'
    ];
    
    const hasConflict = conflictPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    );
    
    if (hasConflict) {
      return 'Recent research shows varying results. Individual response may differ.';
    }
    
    return undefined;
  }

  /**
   * Phase 10.2.5: Source credibility scoring
   */
  private scoreCredibility(source: string): number {
    const credibleSources = {
      'pubmed': 0.95,
      'nature': 0.95,
      'science': 0.95,
      'nejm': 0.9, // New England Journal of Medicine
      'jama': 0.9, // Journal of American Medical Association
      'harvard': 0.85,
      'stanford': 0.85,
      'nih': 0.9,
      'who': 0.85,
      'mayo clinic': 0.85,
      'cochrane': 0.95, // Systematic reviews
    };
    
    const lowCredibility = {
      'blog': 0.3,
      'forum': 0.2,
      'social media': 0.1,
      'anecdotal': 0.2
    };
    
    const sourceLower = source.toLowerCase();
    
    // Check for credible sources
    for (const [key, score] of Object.entries(credibleSources)) {
      if (sourceLower.includes(key)) {
        return score;
      }
    }
    
    // Check for low credibility indicators
    for (const [key, score] of Object.entries(lowCredibility)) {
      if (sourceLower.includes(key)) {
        return score;
      }
    }
    
    // Default moderate credibility
    return 0.5;
  }

  /**
   * Phase 10.2.6: User preference-aware filtering
   */
  async filterByUserPreferences(
    updates: ResearchUpdate[],
    userId: string
  ): Promise<ResearchUpdate[]> {
    // Get user preferences
    const preferences = await this.getUserPreferences(userId);
    
    return updates.filter(update => {
      // Check dietary preferences
      if (preferences.dietary) {
        if (preferences.dietary === 'vegan' && update.topic.includes('meat')) {
          return false;
        }
        if (preferences.dietary === 'carnivore' && update.topic.includes('plant-based')) {
          return false;
        }
      }
      
      // Check fitness goals
      if (preferences.goals) {
        const relevant = preferences.goals.some((goal: string) => 
          update.topic.toLowerCase().includes(goal.toLowerCase())
        );
        if (!relevant && update.userRelevance.length === 0) {
          return false;
        }
      }
      
      // Check for explicitly blocked topics
      if (preferences.blockedTopics?.includes(update.topic)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Phase 10.2.7: Automatic prompt retraining with new knowledge
   */
  private async retrainPrompts(updates: ResearchUpdate[]): Promise<void> {
    // Group updates by topic
    const byTopic = updates.reduce((acc, update) => {
      if (!acc[update.topic]) acc[update.topic] = [];
      acc[update.topic].push(update);
      return acc;
    }, {} as Record<string, ResearchUpdate[]>);
    
    // Update prompts for each topic
    for (const [topic, topicUpdates] of Object.entries(byTopic)) {
      const promptUpdate = this.generatePromptUpdate(topic, topicUpdates);
      await this.updateSystemPrompt(topic, promptUpdate);
    }
    
    // Update controversy handling prompts
    const controversies = updates.filter(u => u.controversy);
    if (controversies.length > 0) {
      await this.updateControversyPrompts(controversies);
    }
  }

  // Helper methods
  
  private async fetchPerplexityResearch(topic: string): Promise<any> {
    // Mock implementation - in production would call Perplexity API
    // const response = await fetch('https://api.perplexity.ai/search', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.perplexityApiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     query: `latest research ${topic} fitness nutrition 2024`,
    //     search_domain: 'scientific',
    //     return_citations: true
    //   })
    // });
    
    return {
      source: 'PubMed',
      summary: `Latest research on ${topic}`,
      content: `Detailed findings about ${topic}...`,
      date: new Date().toISOString()
    };
  }

  private async generateSearchTopics(): Promise<string[]> {
    // Analyze user activity to determine relevant topics
    const baseTopics = [
      'protein synthesis muscle growth',
      'optimal recovery sleep',
      'hiit vs steady state cardio',
      'micronutrient absorption',
      'pre workout nutrition timing',
      'post workout recovery window',
      'strength training frequency',
      'hydration performance',
      'supplement efficacy creatine',
      'injury prevention strategies'
    ];
    
    // Add trending topics
    const trendingTopics = await this.getTrendingTopics();
    
    return [...baseTopics, ...trendingTopics];
  }

  private async getTrendingTopics(): Promise<string[]> {
    // In production, analyze user queries and activity
    return [
      'zone 2 cardio benefits',
      'cold exposure recovery',
      'gut microbiome athletic performance',
      'continuous glucose monitoring athletes'
    ];
  }

  private detectConflicts(updates: ResearchUpdate[]): KnowledgeConflict[] {
    const conflicts: KnowledgeConflict[] = [];
    
    updates.forEach(update => {
      const existing = this.knowledgeBase.get(update.topic);
      if (existing && this.hasConflict(existing, update)) {
        conflicts.push({
          existing: existing.summary,
          new: update.summary,
          topic: update.topic,
          resolution: this.resolveConflict(existing, update)
        });
      }
    });
    
    return conflicts;
  }

  private hasConflict(existing: any, update: ResearchUpdate): boolean {
    // Simple conflict detection - in production would use NLP
    return existing.summary !== update.summary && 
           existing.credibility < update.credibility;
  }

  private resolveConflict(existing: any, update: ResearchUpdate): KnowledgeConflict['resolution'] {
    // Higher credibility wins
    if (update.credibility > existing.credibility + 0.2) {
      return 'use_new';
    }
    
    // If controversial topic, flag it
    if (update.controversy || existing.controversy) {
      return 'flag_controversy';
    }
    
    // Similar credibility - merge both viewpoints
    if (Math.abs(update.credibility - existing.credibility) < 0.1) {
      return 'merge';
    }
    
    return 'keep_existing';
  }

  private shouldApplyUpdate(update: ResearchUpdate): boolean {
    return update.credibility > 0.7 && !update.controversy;
  }

  private async generateEmbedding(content: string): Promise<number[]> {
    // In production, use OpenAI or similar for embeddings
    // Mock implementation
    return Array(1536).fill(0).map(() => Math.random());
  }

  private async storeInVectorDB(data: any): Promise<void> {
    // Store in Supabase with pgvector or similar
    console.log('Storing in vector DB:', data.metadata.topic);
  }

  private determineRelevance(topic: string): string[] {
    const relevanceMap: Record<string, string[]> = {
      'cardio': ['endurance', 'sport', 'weight_mgmt'],
      'strength': ['strength', 'bodybuilder'],
      'nutrition': ['all'],
      'recovery': ['all'],
      'injury': ['sport', 'endurance'],
      'supplements': ['bodybuilder', 'strength']
    };
    
    for (const [key, types] of Object.entries(relevanceMap)) {
      if (topic.toLowerCase().includes(key)) {
        return types;
      }
    }
    
    return ['all'];
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // Fetch from database
    return {
      dietary: 'balanced',
      goals: ['muscle gain', 'endurance'],
      blockedTopics: []
    };
  }

  private generatePromptUpdate(topic: string, updates: ResearchUpdate[]): string {
    const latest = updates[0]; // Most recent
    return `
Updated knowledge for ${topic}:
${latest.summary}

Source: ${latest.source} (Credibility: ${latest.credibility})
Date: ${latest.publishedDate}

Key points:
${updates.map(u => `- ${u.summary}`).join('\n')}
    `.trim();
  }

  private async updateSystemPrompt(topic: string, promptUpdate: string): Promise<void> {
    // Update the AI system prompts with new knowledge
    console.log(`Updating prompts for topic: ${topic}`);
  }

  private async updateControversyPrompts(controversies: ResearchUpdate[]): Promise<void> {
    // Update prompts to handle controversial topics better
    console.log(`Updating controversy handling for ${controversies.length} topics`);
  }
}