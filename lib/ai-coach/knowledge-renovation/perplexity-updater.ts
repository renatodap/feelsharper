/**
 * Knowledge Renovation System using Perplexity API
 * Automatically updates coaching knowledge with latest research
 */

interface PerplexityConfig {
  apiKey: string;
  model: 'pplx-7b-online' | 'pplx-70b-online' | 'pplx-7b-chat' | 'pplx-70b-chat';
  maxTokens?: number;
  temperature?: number;
}

interface KnowledgeUpdateQuery {
  category: 'fitness' | 'nutrition' | 'recovery' | 'behavior_change' | 'safety';
  topic: string;
  lastUpdated: Date;
  priorityLevel: 'high' | 'medium' | 'low';
}

export class PerplexityKnowledgeUpdater {
  private config: PerplexityConfig;
  private updateSchedule: Map<string, Date>;
  
  constructor() {
    this.config = {
      apiKey: process.env.PERPLEXITY_API_KEY || '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',
      model: 'pplx-70b-online', // Use online model for latest information
      maxTokens: 1000,
      temperature: 0.2 // Lower temperature for factual accuracy
    };
    this.updateSchedule = new Map();
  }

  /**
   * Weekly knowledge renovation queries
   */
  private getWeeklyUpdateQueries(): KnowledgeUpdateQuery[] {
    return [
      {
        category: 'fitness',
        topic: 'Latest research on high-intensity interval training (HIIT) effectiveness and safety guidelines 2024-2025',
        lastUpdated: new Date(),
        priorityLevel: 'high'
      },
      {
        category: 'nutrition',
        topic: 'Current evidence-based recommendations for protein intake timing and muscle protein synthesis',
        lastUpdated: new Date(),
        priorityLevel: 'high'
      },
      {
        category: 'recovery',
        topic: 'New research on sleep optimization for athletic performance and recovery protocols',
        lastUpdated: new Date(),
        priorityLevel: 'medium'
      },
      {
        category: 'behavior_change',
        topic: 'Latest behavioral psychology research on habit formation and exercise adherence strategies',
        lastUpdated: new Date(),
        priorityLevel: 'high'
      },
      {
        category: 'safety',
        topic: 'Updated exercise contraindications and medical red flags for fitness professionals 2024',
        lastUpdated: new Date(),
        priorityLevel: 'high'
      }
    ];
  }

  /**
   * Query Perplexity for latest research and guidelines
   */
  async queryLatestResearch(query: KnowledgeUpdateQuery): Promise<any> {
    try {
      const prompt = this.constructResearchPrompt(query);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a scientific research assistant providing evidence-based fitness and health information. Always cite sources and include publication dates.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          return_citations: true, // Important for credibility
          return_related_questions: true // Useful for expanding knowledge
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        citations: data.citations || [],
        relatedQuestions: data.related_questions || [],
        timestamp: new Date(),
        query: query
      };

    } catch (error) {
      console.error('Error querying Perplexity:', error);
      return null;
    }
  }

  /**
   * Construct research prompt for specific knowledge update
   */
  private constructResearchPrompt(query: KnowledgeUpdateQuery): string {
    const basePrompt = `Provide the latest evidence-based information on: ${query.topic}

Please include:
1. Most recent research findings (2023-2025 preferred)
2. Updated clinical guidelines or professional recommendations
3. Any changes from previous consensus
4. Practical applications for fitness coaching
5. Safety considerations or contraindications
6. Specific numbers, thresholds, or protocols when available

Focus on peer-reviewed research and authoritative sources. Highlight any controversial or conflicting evidence.`;

    // Add category-specific requirements
    switch (query.category) {
      case 'safety':
        return basePrompt + '\n\nEmphasize medical red flags, contraindications, and when to refer to healthcare providers.';
      
      case 'nutrition':
        return basePrompt + '\n\nInclude specific macro/micronutrient recommendations, timing protocols, and supplement evidence.';
      
      case 'behavior_change':
        return basePrompt + '\n\nFocus on practical behavioral interventions with proven effectiveness rates.';
      
      default:
        return basePrompt;
    }
  }

  /**
   * Update coaching knowledge base with new research
   */
  async updateKnowledgeBase(): Promise<void> {
    const queries = this.getWeeklyUpdateQueries();
    const updates = [];

    for (const query of queries) {
      // Check if update is needed (not updated in last 7 days)
      const lastUpdate = this.updateSchedule.get(query.topic);
      if (lastUpdate && (Date.now() - lastUpdate.getTime()) < 7 * 24 * 60 * 60 * 1000) {
        continue; // Skip if recently updated
      }

      const research = await this.queryLatestResearch(query);
      if (research) {
        updates.push(research);
        this.updateSchedule.set(query.topic, new Date());
        
        // Process and integrate the new knowledge
        await this.integrateNewKnowledge(research);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Knowledge base updated with ${updates.length} new research findings`);
  }

  /**
   * Integrate new research into coaching system
   */
  private async integrateNewKnowledge(research: any): Promise<void> {
    // Store in database for AI coach to reference
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    await supabase.from('knowledge_updates').insert({
      category: research.query.category,
      topic: research.query.topic,
      content: research.content,
      citations: research.citations,
      related_questions: research.relatedQuestions,
      updated_at: research.timestamp,
      priority_level: research.query.priorityLevel
    });

    // Update relevant coaching playbooks if significant changes detected
    if (this.detectSignificantChanges(research)) {
      await this.updateCoachingPlaybooks(research);
    }
  }

  /**
   * Detect if research contains significant updates
   */
  private detectSignificantChanges(research: any): boolean {
    const significantKeywords = [
      'new guidelines',
      'updated recommendations',
      'no longer recommended',
      'contraindicated',
      'recent meta-analysis',
      'paradigm shift',
      'supersedes previous'
    ];

    const content = research.content.toLowerCase();
    return significantKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Update coaching playbooks with new information
   */
  private async updateCoachingPlaybooks(research: any): Promise<void> {
    console.log(`Significant update detected for ${research.query.topic}`);
    // This would trigger a review process for updating coaching responses
    // Could notify admin or queue for review
  }

  /**
   * Query Perplexity for specific user question
   */
  async queryForUser(question: string, context?: any): Promise<string> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable fitness coach providing evidence-based advice. Be specific and practical.'
            },
            {
              role: 'user',
              content: `Given this user context: ${JSON.stringify(context || {})}, answer: ${question}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error querying Perplexity for user:', error);
      return 'I need to look into that for you. Please try asking again.';
    }
  }

  /**
   * Schedule automatic knowledge updates
   */
  scheduleAutomaticUpdates(): void {
    // Run weekly updates every Sunday at 2 AM
    const scheduleWeeklyUpdate = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(2, 0, 0, 0);

      const timeUntilUpdate = nextSunday.getTime() - now.getTime();

      setTimeout(async () => {
        await this.updateKnowledgeBase();
        scheduleWeeklyUpdate(); // Schedule next update
      }, timeUntilUpdate);
    };

    scheduleWeeklyUpdate();
    console.log('Automatic knowledge renovation scheduled');
  }
}

// Export singleton instance
export const knowledgeUpdater = new PerplexityKnowledgeUpdater();

// Usage in AI coach
export async function getLatestKnowledge(topic: string): Promise<any> {
  // Check if we have recent knowledge in database
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  
  const { data: recentKnowledge } = await supabase
    .from('knowledge_updates')
    .select('*')
    .ilike('topic', `%${topic}%`)
    .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('updated_at', { ascending: false })
    .limit(1);

  if (recentKnowledge && recentKnowledge.length > 0) {
    return recentKnowledge[0];
  }

  // If no recent knowledge, query Perplexity
  const query: KnowledgeUpdateQuery = {
    category: 'fitness',
    topic,
    lastUpdated: new Date(),
    priorityLevel: 'medium'
  };

  return await knowledgeUpdater.queryLatestResearch(query);
}