/**
 * RAG Memory Categories & Subcategories Configuration
 *
 * Defines how memory is organized and retrieved for different scenarios
 *
 * @package config
 * @author JARVIS
 * @version 1.0.0
 */

export interface RAGCategory {
  name: string;
  description: string;
  subcategories: string[];
  retrievalPrompts: string[];
  updateFrequency: string; // 'real-time', 'hourly', 'daily', 'weekly'
  minConfidence: number; // 0-1
  maxResults: number;
}

export interface RAGConfiguration {
  [category: string]: RAGCategory;
}

/**
 * Complete RAG Memory Categories
 */

export const RAG_MEMORY_CATEGORIES: RAGConfiguration = {
  // ============================================================================
  // SELLER PSYCHOLOGY & BEHAVIOR
  // ============================================================================
  sellerPsychology: {
    name: 'Seller Psychology & Behavioral Patterns',
    description:
      'Historical patterns of seller behavior, emotional responses, and decision-making patterns',
    subcategories: [
      'divorce-situations',
      'foreclosure-situations',
      'inheritance-situations',
      'relocation-situations',
      'financial-stress-situations',
      'time-sensitive-situations',
    ],
    retrievalPrompts: [
      'What emotional states did similar sellers exhibit?',
      'What negotiation tactics worked with this type of seller?',
      'What was the typical acceptance timeline?',
      'What price concessions were most effective?',
      'How did the seller respond to pressure?',
    ],
    updateFrequency: 'real-time',
    minConfidence: 0.7,
    maxResults: 10,
  },

  // ============================================================================
  // NEGOTIATION STRATEGIES & TACTICS
  // ============================================================================
  negotiationStrategies: {
    name: 'Negotiation Strategies & Tactics',
    description:
      'Successful negotiation approaches, price anchoring, and persuasion techniques',
    subcategories: [
      'opening-offers',
      'counter-offer-responses',
      'pressure-tactics',
      'incentive-structures',
      'deadline-strategies',
      'multi-party-negotiations',
      'price-anchoring-techniques',
    ],
    retrievalPrompts: [
      'What opening offer percentage worked best?',
      'How did successful agents handle counter-offers?',
      'What incentives motivated acceptances?',
      'What was the optimal negotiation timeline?',
      'How were resistant sellers persuaded?',
      'What creative solutions closed deals?',
    ],
    updateFrequency: 'hourly',
    minConfidence: 0.75,
    maxResults: 15,
  },

  // ============================================================================
  // MARKET CONDITIONS & TRENDS
  // ============================================================================
  marketConditions: {
    name: 'Market Conditions & Trends',
    description:
      'Historical market data, price trends, and economic indicators by geography',
    subcategories: [
      'zipcode-trends',
      'county-trends',
      'state-trends',
      'seasonal-patterns',
      'price-predictions',
      'absorption-rates',
      'foreclosure-clusters',
      'distress-property-density',
    ],
    retrievalPrompts: [
      'What are historical price trends in this ZIP code?',
      'What seasonal patterns affect this market?',
      'What are predicted price movements?',
      'What is the absorption rate?',
      'What distress property clusters are active?',
      'What comparable sales data is available?',
      'What is the market sentiment?',
    ],
    updateFrequency: 'daily',
    minConfidence: 0.8,
    maxResults: 20,
  },

  // ============================================================================
  // AGENT PERFORMANCE & SPECIALIZATIONS
  // ============================================================================
  agentPerformance: {
    name: 'Agent Performance & Specializations',
    description:
      'Agent success rates, specializations, strengths, and performance metrics',
    subcategories: [
      'top-performers',
      'divorce-specialists',
      'foreclosure-specialists',
      'investment-specialists',
      'negotiation-experts',
      'closing-experts',
      'cultural-specialists',
      'high-volume-operators',
    ],
    retrievalPrompts: [
      'Who are the top performing agents?',
      'Which agent specializes in this situation?',
      "What is this agent's success rate?",
      'What is their average negotiation time?',
      'What are their client satisfaction scores?',
      'What unique approaches do they use?',
      'How do they handle difficult sellers?',
    ],
    updateFrequency: 'hourly',
    minConfidence: 0.85,
    maxResults: 5,
  },

  // ============================================================================
  // SUCCESSFUL OUTCOMES & CASE STUDIES
  // ============================================================================
  successfulOutcomes: {
    name: 'Successful Outcomes & Case Studies',
    description:
      'Detailed documentation of successful deals, strategies used, and results achieved',
    subcategories: [
      'successful-negotiations',
      'difficult-seller-wins',
      'fast-closings',
      'high-price-achievements',
      'turnaround-situations',
      'creative-solutions',
      'agent-breakthroughs',
    ],
    retrievalPrompts: [
      'How were similar situations successfully closed?',
      'What was the winning strategy?',
      'How long did similar deals take?',
      'What price reductions were achieved?',
      'What made the difference?',
      'What creative solutions worked?',
      'What lessons were learned?',
    ],
    updateFrequency: 'hourly',
    minConfidence: 0.8,
    maxResults: 10,
  },

  // ============================================================================
  // FAILED OUTCOMES & LESSONS LEARNED
  // ============================================================================
  failedOutcomes: {
    name: 'Failed Outcomes & Lessons Learned',
    description:
      'Documented failures, mistakes, and lessons learned to avoid similar pitfalls',
    subcategories: [
      'failed-negotiations',
      'missed-opportunities',
      'strategy-failures',
      'timing-mistakes',
      'communication-breakdowns',
      'pricing-errors',
    ],
    retrievalPrompts: [
      'What mistakes were made in similar situations?',
      'What strategies failed?',
      'What timing issues occurred?',
      'What communication problems arose?',
      'What pricing errors happened?',
      'How can we avoid these failures?',
      'What early warning signs appeared?',
    ],
    updateFrequency: 'hourly',
    minConfidence: 0.7,
    maxResults: 8,
  },

  // ============================================================================
  // PROPERTY INVESTMENT ANALYSIS
  // ============================================================================
  propertyInvestment: {
    name: 'Property Investment Analysis',
    description:
      'Investment potential, return estimates, renovation costs, and market demand',
    subcategories: [
      'investment-potential',
      'renovation-estimates',
      'market-demand',
      'rental-comparables',
      'flipping-opportunities',
      'wholesale-potential',
      'value-add-opportunities',
    ],
    retrievalPrompts: [
      'What is the investment potential?',
      'What renovation costs are typical?',
      'What rental income is possible?',
      'What is the market demand?',
      'Is this a good flip opportunity?',
      'What value-add opportunities exist?',
      'What ROI can be expected?',
    ],
    updateFrequency: 'daily',
    minConfidence: 0.75,
    maxResults: 10,
  },

  // ============================================================================
  // DISTRESS PROPERTY PATTERNS
  // ============================================================================
  distressPatterns: {
    name: 'Distress Property Patterns',
    description:
      'Patterns in distressed properties, timelines, and buyer behavior',
    subcategories: [
      'foreclosure-timelines',
      'bankruptcy-patterns',
      'probate-timelines',
      'divorce-settlement-timelines',
      'pre-foreclosure-windows',
      'investor-buying-patterns',
    ],
    retrievalPrompts: [
      'What is the typical foreclosure timeline?',
      'How long does bankruptcy take?',
      'What is the probate timeline?',
      'When do investors typically buy?',
      'What is the optimal entry point?',
      'What windows of opportunity exist?',
      'What are the seasonal patterns?',
    ],
    updateFrequency: 'daily',
    minConfidence: 0.8,
    maxResults: 10,
  },

  // ============================================================================
  // COMMUNICATION PATTERNS
  // ============================================================================
  communicationPatterns: {
    name: 'Communication Patterns & Techniques',
    description:
      'Effective communication methods, language patterns, and messaging that resonates',
    subcategories: [
      'emotional-messaging',
      'urgency-messaging',
      'benefit-messaging',
      'objection-handling',
      'trust-building-language',
      'cultural-communication',
      'crisis-communication',
    ],
    retrievalPrompts: [
      'What messaging resonated with sellers?',
      'How were objections handled?',
      'What language built trust?',
      'How was urgency communicated?',
      'What cultural sensitivities matter?',
      'How were emotions managed?',
      'What follow-up cadences worked?',
    ],
    updateFrequency: 'daily',
    minConfidence: 0.7,
    maxResults: 8,
  },

  // ============================================================================
  // TEAM COORDINATION & COLLABORATION
  // ============================================================================
  teamCoordination: {
    name: 'Team Coordination & Collaboration',
    description:
      'Multi-agent collaboration patterns, hand-off procedures, and escalation paths',
    subcategories: [
      'multi-agent-deals',
      'agent-specialization-handoffs',
      'escalation-procedures',
      'support-patterns',
      'knowledge-sharing',
      'performance-synergies',
    ],
    retrievalPrompts: [
      'Which agents work well together?',
      'What specializations complement each other?',
      'How are handoffs managed?',
      'When should escalation occur?',
      'What support patterns are effective?',
      'How is knowledge shared?',
      'What team configurations succeeded?',
    ],
    updateFrequency: 'daily',
    minConfidence: 0.75,
    maxResults: 5,
  },

  // ============================================================================
  // RISK ASSESSMENT & MITIGATION
  // ============================================================================
  riskAssessment: {
    name: 'Risk Assessment & Mitigation',
    description: 'Risk factors, early warning signs, and mitigation strategies',
    subcategories: [
      'deal-risk-indicators',
      'seller-reliability-signals',
      'timeline-risks',
      'market-risks',
      'legal-risks',
      'financial-risks',
      'mitigation-strategies',
    ],
    retrievalPrompts: [
      'What are the risk indicators?',
      'What early warning signs appeared?',
      'How reliable is this seller?',
      'What timeline risks exist?',
      'What mitigation strategies worked?',
      'What contingencies should be in place?',
      'What deal-breaker factors exist?',
    ],
    updateFrequency: 'real-time',
    minConfidence: 0.85,
    maxResults: 10,
  },
};

/**
 * RAG Retrieval Queries - Pre-configured for common scenarios
 */

export const COMMON_RAG_QUERIES = {
  // Seller Assessment
  sellerAssessment: {
    category: 'sellerPsychology',
    query:
      'What behavioral patterns and emotional states characterized sellers in similar situations?',
    context: 'situation',
  },

  // Negotiation Planning
  negotiationPlanning: {
    category: 'negotiationStrategies',
    query:
      'What negotiation strategies and price anchoring techniques were most successful?',
    context: ['situation', 'location'],
  },

  // Market Analysis
  marketAnalysis: {
    category: 'marketConditions',
    query:
      'What are the current market conditions and historical trends for this area?',
    context: 'zipCode',
  },

  // Agent Assignment
  agentAssignment: {
    category: 'agentPerformance',
    query: 'Which agent is best suited for this type of situation?',
    context: 'situation',
  },

  // Strategy Selection
  strategySelection: {
    category: 'successfulOutcomes',
    query: 'What strategies have been most successful in similar situations?',
    context: 'situation',
  },

  // Risk Assessment
  riskAssessment: {
    category: 'riskAssessment',
    query:
      'What are the potential risks and how have they been mitigated in the past?',
    context: ['situation', 'properties'],
  },
};

/**
 * Category weights for multi-category queries
 */

export const CATEGORY_WEIGHTS = {
  sellerPsychology: 0.25,
  negotiationStrategies: 0.25,
  marketConditions: 0.15,
  agentPerformance: 0.15,
  successfulOutcomes: 0.15,
  failedOutcomes: 0.05,
} as const;

/**
 * Export all category names for validation
 */

export const VALID_CATEGORIES = Object.keys(RAG_MEMORY_CATEGORIES) as Array<
  keyof typeof RAG_MEMORY_CATEGORIES
>;

/**
 * Helper function to get category details
 */

export function getRAGCategory(categoryName: string): RAGCategory | null {
  return (
    RAG_MEMORY_CATEGORIES[categoryName as keyof typeof RAG_MEMORY_CATEGORIES] ||
    null
  );
}

/**
 * Helper function to validate category
 */

export function isValidRAGCategory(categoryName: string): boolean {
  return categoryName in RAG_MEMORY_CATEGORIES;
}
