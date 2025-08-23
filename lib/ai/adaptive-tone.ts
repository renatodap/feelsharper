// Adaptive Tone System - Adjusts AI response tone based on confidence levels
export interface ToneProfile {
  confidence: number;
  tone: 'assertive' | 'suggestive' | 'exploratory' | 'cautious';
  markers: {
    intro: string[];
    connectors: string[];
    qualifiers: string[];
    closers: string[];
  };
}

const TONE_PROFILES: ToneProfile[] = [
  {
    confidence: 90, // 90-100% confidence
    tone: 'assertive',
    markers: {
      intro: [
        "Based on your data,",
        "Your performance shows",
        "The analysis indicates",
        "Looking at your progress,"
      ],
      connectors: [
        "which means",
        "therefore",
        "this demonstrates",
        "clearly showing"
      ],
      qualifiers: [
        "definitely",
        "consistently",
        "significantly",
        "clearly"
      ],
      closers: [
        "Keep up the excellent work!",
        "You're on the right track.",
        "Maintain this momentum.",
        "Your progress is impressive."
      ]
    }
  },
  {
    confidence: 70, // 70-89% confidence
    tone: 'suggestive',
    markers: {
      intro: [
        "It appears that",
        "Your data suggests",
        "Based on what I see,",
        "The trends indicate"
      ],
      connectors: [
        "which suggests",
        "likely meaning",
        "probably indicating",
        "potentially showing"
      ],
      qualifiers: [
        "likely",
        "probably",
        "generally",
        "typically"
      ],
      closers: [
        "Consider maintaining this approach.",
        "This seems to be working well.",
        "You might want to continue this pattern.",
        "These results look promising."
      ]
    }
  },
  {
    confidence: 50, // 50-69% confidence
    tone: 'exploratory',
    markers: {
      intro: [
        "It might be that",
        "One interpretation could be",
        "This could suggest",
        "Perhaps"
      ],
      connectors: [
        "which could mean",
        "possibly indicating",
        "may suggest",
        "might show"
      ],
      qualifiers: [
        "possibly",
        "might be",
        "could be",
        "perhaps"
      ],
      closers: [
        "Let's track this further.",
        "More data will help clarify this.",
        "Keep monitoring these patterns.",
        "We'll get clearer insights over time."
      ]
    }
  },
  {
    confidence: 0, // 0-49% confidence
    tone: 'cautious',
    markers: {
      intro: [
        "I need more information, but",
        "With limited data,",
        "It's hard to say definitively, but",
        "Based on what's available,"
      ],
      connectors: [
        "which might",
        "could potentially",
        "may or may not",
        "unclear whether"
      ],
      qualifiers: [
        "uncertain",
        "unclear",
        "needs verification",
        "preliminary"
      ],
      closers: [
        "Let me know if you can provide more details.",
        "More data will help improve accuracy.",
        "Feel free to clarify if I misunderstood.",
        "I'll learn more as we track your progress."
      ]
    }
  }
];

export class AdaptiveTone {
  private static instance: AdaptiveTone;

  private constructor() {}

  static getInstance(): AdaptiveTone {
    if (!AdaptiveTone.instance) {
      AdaptiveTone.instance = new AdaptiveTone();
    }
    return AdaptiveTone.instance;
  }

  // Get appropriate tone profile based on confidence
  getToneProfile(confidence: number): ToneProfile {
    for (const profile of TONE_PROFILES) {
      if (confidence >= profile.confidence) {
        return profile;
      }
    }
    return TONE_PROFILES[TONE_PROFILES.length - 1]; // Default to most cautious
  }

  // Apply adaptive tone to a response
  applyTone(
    response: string,
    confidence: number,
    includeConfidenceIndicator: boolean = false
  ): string {
    const profile = this.getToneProfile(confidence);
    
    // Add intro if response doesn't have one
    if (!this.hasIntro(response)) {
      const intro = this.getRandomElement(profile.markers.intro);
      response = `${intro} ${response}`;
    }
    
    // Add appropriate qualifiers
    response = this.injectQualifiers(response, profile.markers.qualifiers);
    
    // Add closer if appropriate
    if (!this.hasCloser(response)) {
      const closer = this.getRandomElement(profile.markers.closers);
      response = `${response} ${closer}`;
    }
    
    // Add confidence indicator if requested
    if (includeConfidenceIndicator) {
      response = this.addConfidenceIndicator(response, confidence);
    }
    
    return response;
  }

  // Check if response has an intro
  private hasIntro(response: string): boolean {
    const intros = TONE_PROFILES.flatMap(p => p.markers.intro);
    return intros.some(intro => 
      response.toLowerCase().startsWith(intro.toLowerCase())
    );
  }

  // Check if response has a closer
  private hasCloser(response: string): boolean {
    const closers = TONE_PROFILES.flatMap(p => p.markers.closers);
    return closers.some(closer => 
      response.toLowerCase().includes(closer.toLowerCase())
    );
  }

  // Inject qualifiers into response
  private injectQualifiers(response: string, qualifiers: string[]): string {
    // Replace absolute terms with qualified versions based on tone
    const replacements: Record<string, string> = {
      'will': qualifiers.includes('definitely') ? 'will definitely' : 'will likely',
      'is': qualifiers.includes('clearly') ? 'is clearly' : 'appears to be',
      'shows': qualifiers.includes('consistently') ? 'consistently shows' : 'generally shows',
      'indicates': qualifiers.includes('significantly') ? 'significantly indicates' : 'may indicate'
    };
    
    let modifiedResponse = response;
    for (const [original, replacement] of Object.entries(replacements)) {
      // Only replace if not already qualified
      const regex = new RegExp(`\\b${original}\\b(?!\\s+(${qualifiers.join('|')}))`, 'gi');
      modifiedResponse = modifiedResponse.replace(regex, replacement);
    }
    
    return modifiedResponse;
  }

  // Add confidence indicator
  private addConfidenceIndicator(response: string, confidence: number): string {
    const indicator = this.getConfidenceEmoji(confidence);
    return `${response}\n\n${indicator} Confidence: ${confidence}%`;
  }

  // Get confidence emoji
  private getConfidenceEmoji(confidence: number): string {
    if (confidence >= 90) return '🟢';
    if (confidence >= 70) return '🟡';
    if (confidence >= 50) return '🟠';
    return '🔴';
  }

  // Get random element from array
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate response with appropriate tone
  generateResponse(
    content: string,
    confidence: number,
    context?: {
      isPositiveFeedback?: boolean;
      isCorrection?: boolean;
      isEducational?: boolean;
    }
  ): string {
    const profile = this.getToneProfile(confidence);
    let response = content;
    
    // Adjust based on context
    if (context?.isPositiveFeedback) {
      response = this.addPositiveTone(response, profile);
    } else if (context?.isCorrection) {
      response = this.addCorrectiveTone(response, profile);
    } else if (context?.isEducational) {
      response = this.addEducationalTone(response, profile);
    }
    
    return this.applyTone(response, confidence);
  }

  // Add positive reinforcement tone
  private addPositiveTone(response: string, profile: ToneProfile): string {
    const positiveMarkers = {
      assertive: ['Excellent!', 'Outstanding!', 'Perfect!'],
      suggestive: ['Great job!', 'Well done!', 'Nice work!'],
      exploratory: ['Good effort!', 'Keep it up!', 'Looking good!'],
      cautious: ['That is a start!', 'Keep trying!', 'Progress!']
    };
    
    const marker = this.getRandomElement(positiveMarkers[profile.tone]);
    return `${marker} ${response}`;
  }

  // Add corrective tone
  private addCorrectiveTone(response: string, profile: ToneProfile): string {
    const correctiveMarkers = {
      assertive: ['Actually,', 'To clarify,', 'The correct approach is'],
      suggestive: ['You might want to', 'Consider', 'Perhaps try'],
      exploratory: ['One option could be', 'Maybe', 'You could explore'],
      cautious: ['If I understand correctly', 'It might help to', 'Perhaps consider']
    };
    
    const marker = this.getRandomElement(correctiveMarkers[profile.tone]);
    return `${marker} ${response}`;
  }

  // Add educational tone
  private addEducationalTone(response: string, profile: ToneProfile): string {
    const educationalMarkers = {
      assertive: ['Here is what the science says:', 'Research shows:', 'Studies confirm:'],
      suggestive: ['Evidence suggests:', 'Research indicates:', 'Studies point to:'],
      exploratory: ['Some research suggests:', 'There is evidence that:', 'Studies explore:'],
      cautious: ['Early research hints:', 'Some studies suggest:', 'Preliminary findings show:']
    };
    
    const marker = this.getRandomElement(educationalMarkers[profile.tone]);
    return `${marker} ${response}`;
  }

  // Adjust formality based on user preference
  adjustFormality(
    response: string,
    formalityLevel: 'casual' | 'balanced' | 'formal'
  ): string {
    if (formalityLevel === 'casual') {
      return this.makeCasual(response);
    } else if (formalityLevel === 'formal') {
      return this.makeFormal(response);
    }
    return response; // balanced is default
  }

  private makeCasual(response: string): string {
    const replacements: Record<string, string> = {
      'utilize': 'use',
      'commence': 'start',
      'terminate': 'end',
      'approximately': 'about',
      'demonstrate': 'show',
      'therefore': 'so',
      'however': 'but'
    };
    
    let casual = response;
    for (const [formal, informal] of Object.entries(replacements)) {
      casual = casual.replace(new RegExp(`\\b${formal}\\b`, 'gi'), informal);
    }
    
    return casual;
  }

  private makeFormal(response: string): string {
    const replacements: Record<string, string> = {
      'use': 'utilize',
      'start': 'commence',
      'end': 'terminate',
      'about': 'approximately',
      'show': 'demonstrate',
      'so': 'therefore',
      'but': 'however'
    };
    
    let formal = response;
    for (const [informal, formalWord] of Object.entries(replacements)) {
      formal = formal.replace(new RegExp(`\\b${informal}\\b`, 'gi'), formalWord);
    }
    
    return formal;
  }
}

export default AdaptiveTone;