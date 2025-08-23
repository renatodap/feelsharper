// Scientific Citations for AI-generated insights
export interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  relevance: number; // 0-100 score
  summary?: string;
}

// Curated database of exercise science citations
export const EXERCISE_SCIENCE_CITATIONS: Citation[] = [
  // Strength Training
  {
    id: 'schoenfeld2017',
    title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass',
    authors: ['Schoenfeld, B.J.', 'Ogborn, D.', 'Krieger, J.W.'],
    journal: 'Journal of Sports Sciences',
    year: 2017,
    doi: '10.1080/02640414.2016.1210197',
    url: 'https://doi.org/10.1080/02640414.2016.1210197',
    relevance: 95,
    summary: 'Higher weekly training volumes correlate with greater muscle hypertrophy'
  },
  {
    id: 'grgic2018',
    title: 'Effects of rest interval duration in resistance training on measures of muscular strength',
    authors: ['Grgic, J.', 'Schoenfeld, B.J.', 'Skrepnik, M.', 'Davies, T.B.', 'Mikulic, P.'],
    journal: 'Sports Medicine',
    year: 2018,
    doi: '10.1007/s40279-017-0788-x',
    url: 'https://doi.org/10.1007/s40279-017-0788-x',
    relevance: 90,
    summary: 'Longer rest intervals (>2 min) optimize strength gains'
  },
  
  // Cardio & Endurance
  {
    id: 'milanovic2015',
    title: 'Effectiveness of High-Intensity Interval Training (HIT) and Continuous Endurance Training',
    authors: ['Milanović, Z.', 'Sporiš, G.', 'Weston, M.'],
    journal: 'Sports Medicine',
    year: 2015,
    doi: '10.1007/s40279-015-0365-0',
    url: 'https://doi.org/10.1007/s40279-015-0365-0',
    relevance: 92,
    summary: 'HIIT improves VO2max more effectively than moderate-intensity continuous training'
  },
  
  // Recovery
  {
    id: 'dupuy2018',
    title: 'An evidence-based approach for choosing post-exercise recovery techniques',
    authors: ['Dupuy, O.', 'Douzi, W.', 'Theurot, D.', 'Bosquet, L.', 'Dugué, B.'],
    journal: 'Frontiers in Physiology',
    year: 2018,
    doi: '10.3389/fphys.2018.00403',
    url: 'https://doi.org/10.3389/fphys.2018.00403',
    relevance: 88,
    summary: 'Active recovery, massage, and cold water immersion show best recovery effects'
  },
  
  // Sleep & Performance
  {
    id: 'watson2017',
    title: 'Sleep and athletic performance',
    authors: ['Watson, A.M.'],
    journal: 'Current Sports Medicine Reports',
    year: 2017,
    doi: '10.1249/JSR.0000000000000418',
    url: 'https://doi.org/10.1249/JSR.0000000000000418',
    relevance: 94,
    summary: 'Athletes need 7-9 hours of sleep for optimal performance and recovery'
  },
  
  // Nutrition Timing
  {
    id: 'aragon2013',
    title: 'Nutrient timing revisited: is there a post-exercise anabolic window?',
    authors: ['Aragon, A.A.', 'Schoenfeld, B.J.'],
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2013,
    doi: '10.1186/1550-2783-10-5',
    url: 'https://doi.org/10.1186/1550-2783-10-5',
    relevance: 87,
    summary: 'The post-workout "anabolic window" is wider than previously thought (4-6 hours)'
  },
  
  // Progressive Overload
  {
    id: 'plotkin2022',
    title: 'Progressive overload without progressing load? The effects of load or repetition progression',
    authors: ['Plotkin, D.', 'Coleman, M.', 'Van Every, D.', 'et al.'],
    journal: 'PeerJ',
    year: 2022,
    doi: '10.7717/peerj.14142',
    url: 'https://doi.org/10.7717/peerj.14142',
    relevance: 91,
    summary: 'Both load and repetition progression effectively stimulate muscle growth'
  }
];

export class CitationMatcher {
  private static instance: CitationMatcher;
  private citations: Citation[] = EXERCISE_SCIENCE_CITATIONS;

  private constructor() {}

  static getInstance(): CitationMatcher {
    if (!CitationMatcher.instance) {
      CitationMatcher.instance = new CitationMatcher();
    }
    return CitationMatcher.instance;
  }

  // Find relevant citations for a given insight
  findRelevantCitations(
    insight: string,
    topics: string[],
    maxCitations: number = 3
  ): Citation[] {
    const relevantCitations = this.citations
      .map(citation => {
        let score = citation.relevance;
        
        // Check if insight mentions key concepts from the citation
        const insightLower = insight.toLowerCase();
        const titleLower = citation.title.toLowerCase();
        const summaryLower = (citation.summary || '').toLowerCase();
        
        // Topic matching
        topics.forEach(topic => {
          const topicLower = topic.toLowerCase();
          if (titleLower.includes(topicLower) || summaryLower.includes(topicLower)) {
            score += 10;
          }
        });
        
        // Keyword matching
        const keywords = this.extractKeywords(insight);
        keywords.forEach(keyword => {
          if (titleLower.includes(keyword) || summaryLower.includes(keyword)) {
            score += 5;
          }
        });
        
        return { ...citation, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCitations);
    
    return relevantCitations;
  }

  // Extract keywords from insight text
  private extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 
      'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Return unique keywords
    return [...new Set(words)];
  }

  // Format citation for display
  formatCitation(citation: Citation, style: 'apa' | 'mla' | 'simple' = 'simple'): string {
    if (style === 'apa') {
      const authors = citation.authors.join(', ');
      return `${authors} (${citation.year}). ${citation.title}. ${citation.journal || 'Unknown Journal'}. ${citation.doi ? `https://doi.org/${citation.doi}` : ''}`;
    } else if (style === 'mla') {
      const firstAuthor = citation.authors[0];
      const otherAuthors = citation.authors.length > 1 ? ', et al.' : '';
      return `${firstAuthor}${otherAuthors} "${citation.title}." ${citation.journal || 'Unknown Journal'}, ${citation.year}.`;
    } else {
      // Simple format for UI display
      const firstAuthor = citation.authors[0].split(',')[0];
      return `${firstAuthor} et al. (${citation.year})`;
    }
  }

  // Get citation details for tooltip/modal
  getCitationDetails(citationId: string): Citation | undefined {
    return this.citations.find(c => c.id === citationId);
  }

  // Add custom citation (for user-provided sources)
  addCustomCitation(citation: Omit<Citation, 'id'>): Citation {
    const newCitation: Citation = {
      ...citation,
      id: `custom_${Date.now()}`
    };
    this.citations.push(newCitation);
    return newCitation;
  }
}

// Helper function to get citations for specific insight types
export function getCitationsForInsightType(insightType: string): Citation[] {
  const matcher = CitationMatcher.getInstance();
  
  const topicMap: Record<string, string[]> = {
    'strength': ['resistance training', 'muscle', 'strength', 'hypertrophy'],
    'cardio': ['cardio', 'endurance', 'HIIT', 'aerobic', 'VO2max'],
    'recovery': ['recovery', 'rest', 'sleep', 'fatigue'],
    'nutrition': ['nutrition', 'protein', 'nutrient timing', 'diet'],
    'progressive_overload': ['progressive overload', 'volume', 'intensity', 'progression']
  };
  
  const topics = topicMap[insightType] || [];
  return matcher.findRelevantCitations('', topics, 5);
}

export default CitationMatcher;