import Anthropic from '@anthropic-ai/sdk';

interface CoachResponse {
  message: string;
  motivation?: string;
  insights?: string[];
  challenge?: string;
  encouragement?: string;
  nextSteps?: string[];
}

interface UserContext {
  recentActivities?: any[];
  goals?: string[];
  patterns?: any;
  currentMood?: string;
  energyLevel?: number;
}

export class ClaudeCoach {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateResponse(
    userInput: string,
    parsedActivity: any,
    context: UserContext = {}
  ): Promise<CoachResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(userInput, parsedActivity, context);

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseCoachResponse(content.text);
      }

      return this.getDefaultResponse(parsedActivity.type);
    } catch (error) {
      console.error('Claude coach error:', error);
      return this.getDefaultResponse(parsedActivity.type);
    }
  }

  private buildSystemPrompt(): string {
    return `You are an encouraging, knowledgeable fitness coach helping users track their health naturally through conversation.

    Your personality:
    - Supportive and motivating, never judgmental
    - Concise but warm (2-3 sentences max per response)
    - Focus on progress over perfection
    - Use the philosophy "Iron sharpens iron" - small consistent actions lead to transformation

    Your responses should:
    1. Acknowledge what the user just logged
    2. Provide brief encouragement or insight
    3. Optionally suggest a small next action or challenge

    Format your response as JSON with these fields:
    - message: Main response (required)
    - motivation: Motivational quote or thought (optional)
    - insights: Array of 1-2 brief insights (optional)
    - challenge: Small actionable challenge (optional)
    - encouragement: Specific praise (optional)
    - nextSteps: Array of 1-2 suggested actions (optional)`;
  }

  private buildUserPrompt(
    userInput: string,
    parsedActivity: any,
    context: UserContext
  ): string {
    let prompt = `User said: "${userInput}"\n`;
    prompt += `Activity type: ${parsedActivity.type}\n`;
    prompt += `Parsed data: ${JSON.stringify(parsedActivity.data)}\n`;

    if (context.currentMood) {
      prompt += `Current mood: ${context.currentMood}\n`;
    }
    if (context.energyLevel) {
      prompt += `Energy level: ${context.energyLevel}/10\n`;
    }
    if (context.recentActivities && context.recentActivities.length > 0) {
      prompt += `Recent activities: ${context.recentActivities.slice(0, 3).map(a => a.type).join(', ')}\n`;
    }

    prompt += '\nGenerate an appropriate coaching response in JSON format.';
    return prompt;
  }

  private parseCoachResponse(text: string): CoachResponse {
    try {
      // Try to parse as JSON first
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || 'Great job logging that!',
          motivation: parsed.motivation,
          insights: parsed.insights,
          challenge: parsed.challenge,
          encouragement: parsed.encouragement,
          nextSteps: parsed.nextSteps
        };
      }
    } catch (error) {
      // If JSON parsing fails, use the text as the message
    }

    // Fallback to using the entire response as the message
    return {
      message: text.slice(0, 200) // Limit length
    };
  }

  private getDefaultResponse(activityType: string): CoachResponse {
    const responses: Record<string, CoachResponse> = {
      weight: {
        message: "Weight tracked! Consistency in tracking helps you see the bigger picture.",
        encouragement: "Every data point helps build your success story."
      },
      food: {
        message: "Meal logged! Being mindful of what you eat is a powerful habit.",
        motivation: "Fuel your body, fuel your goals.",
        nextSteps: ["Consider adding a glass of water before your next meal"]
      },
      workout: {
        message: "Workout complete! You're building strength with every session.",
        encouragement: "You showed up and that's what matters!",
        challenge: "Try to beat today's performance next time by just 1%"
      },
      mood: {
        message: "Thanks for sharing how you're feeling. Your mental state is just as important as physical health.",
        insights: ["Mood tracking helps identify patterns and triggers"]
      },
      energy: {
        message: "Energy level noted. Tracking this helps optimize your daily routine.",
        nextSteps: ["Notice what activities or foods affect your energy most"]
      },
      sleep: {
        message: "Sleep logged! Quality rest is when your body recovers and grows stronger.",
        motivation: "Prioritize sleep, prioritize success."
      },
      water: {
        message: "Hydration tracked! Water is the foundation of peak performance.",
        challenge: "Try to drink a glass of water right when you wake up tomorrow"
      },
      unknown: {
        message: "Got it! I've noted that for you.",
        nextSteps: ["Try being more specific so I can provide better insights"]
      }
    };

    return responses[activityType] || responses.unknown;
  }

  async generateDailyMission(context: UserContext): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        temperature: 0.8,
        system: 'Generate a simple, achievable daily fitness mission in 10 words or less. Make it specific and motivating.',
        messages: [
          {
            role: 'user',
            content: `Generate a mission based on this context: ${JSON.stringify(context)}`
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      return this.getDefaultMission();
    } catch (error) {
      console.error('Mission generation error:', error);
      return this.getDefaultMission();
    }
  }

  private getDefaultMission(): string {
    const missions = [
      "Drink 8 glasses of water today",
      "Take 10,000 steps",
      "Log every meal honestly",
      "Get 7+ hours of sleep tonight",
      "Do 20 pushups",
      "Stretch for 10 minutes",
      "Eat a vegetable with every meal",
      "No screens 30 minutes before bed",
      "Take a 15-minute walk outside",
      "Practice 5 minutes of deep breathing"
    ];

    return missions[Math.floor(Math.random() * missions.length)];
  }

  async analyzePatterns(activities: any[]): Promise<{
    trends: string[];
    recommendations: string[];
    achievements: string[];
  }> {
    if (activities.length < 5) {
      return {
        trends: ["Keep logging to see patterns emerge"],
        recommendations: ["Consistency is key - keep tracking daily"],
        achievements: ["Started your tracking journey!"]
      };
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        temperature: 0.5,
        system: 'Analyze user fitness patterns and provide insights. Return JSON with: trends (array of observations), recommendations (array of suggestions), achievements (array of accomplishments).',
        messages: [
          {
            role: 'user',
            content: `Analyze these activities: ${JSON.stringify(activities.slice(-20))}`
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (error) {
          // Fall through to default
        }
      }
    } catch (error) {
      console.error('Pattern analysis error:', error);
    }

    // Default patterns based on simple analysis
    return this.simplePatternAnalysis(activities);
  }

  private simplePatternAnalysis(activities: any[]): {
    trends: string[];
    recommendations: string[];
    achievements: string[];
  } {
    const trends: string[] = [];
    const recommendations: string[] = [];
    const achievements: string[] = [];

    // Count activity types
    const typeCounts: Record<string, number> = {};
    activities.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });

    // Generate insights based on counts
    if (typeCounts.workout > 5) {
      trends.push("You're maintaining a consistent workout routine");
      achievements.push("5+ workouts logged!");
    }

    if (typeCounts.food > 10) {
      trends.push("Great job tracking your nutrition regularly");
      achievements.push("Food tracking champion!");
    }

    if (typeCounts.weight > 3) {
      trends.push("Regular weight tracking helps see progress");
    }

    // Add recommendations
    if (!typeCounts.water || typeCounts.water < 3) {
      recommendations.push("Try logging your water intake daily");
    }

    if (!typeCounts.sleep || typeCounts.sleep < 3) {
      recommendations.push("Track your sleep to optimize recovery");
    }

    if (trends.length === 0) {
      trends.push("You're building good tracking habits");
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work!");
    }

    return { trends, recommendations, achievements };
  }
}

export type { CoachResponse, UserContext };