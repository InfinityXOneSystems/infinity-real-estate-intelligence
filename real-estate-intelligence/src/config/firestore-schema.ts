/**
 * Firestore Schema Configuration
 *
 * Defines all Firestore collections, documents, and index patterns
 * for the memory system
 *
 * @package config
 * @author JARVIS
 * @version 1.0.0
 */

/**
 * Firestore Collections and Document Structure
 */

export interface FirestoreSchema {
  sellers: {
    document: {
      id: string;
      name: string;
      address: string;
      city: string;
      zipCode: string;
      situation: string; // 'divorce', 'foreclosure', 'inheritance', 'relocation', 'financial-stress'
      psychologicalProfile: {
        urgency: number; // 0-10
        emotionalState: string;
        decisionSpeed: 'fast' | 'moderate' | 'slow';
        negotiationStyle: string;
        riskTolerance: number; // 0-10
      };
      negotiationHistory: Array<{
        date: string;
        initialAsk: number;
        offer: number;
        counterOffer: number;
        acceptanceThreshold: number;
        agentId: string;
        reasoning: string;
        outcome: 'accepted' | 'rejected' | 'pending';
      }>;
      outcomes: Array<{
        dealId: string;
        listPrice: number;
        finalPrice: number;
        priceReduction: number;
        timeToClose: number;
        agentId: string;
        agentPerformanceScore: number;
        satisfaction: number; // 0-10
        feedback: string;
      }>;
      timestamp: any; // Firestore Timestamp
      updatedAt: any;
      tags: string[];
    };
    indexes: ['situation', 'address', 'timestamp'];
  };

  properties: {
    document: {
      id: string;
      address: string;
      city: string;
      zipCode: string;
      county: string;
      state: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
      listPrice: number;
      estimatedValue: number;
      pricePerSqft: number;
      squareFeet: number;
      bedrooms: number;
      bathrooms: number;
      yearBuilt: number;
      propertyType: string; // 'single-family', 'multi-family', 'commercial', etc.
      distressFactors: {
        foreclosure: boolean;
        bankruptcy: boolean;
        probate: boolean;
        divorce: boolean;
        delinquent: boolean;
        investorOwned: boolean;
        timeOnMarket: number; // days
        priceReductions: number;
      };
      heatmapIntensity: number; // 0-100
      predictions: {
        likelyPrice: number;
        confidenceScore: number;
        recommendedStrategy: string;
        estimatedClosingTime: number; // days
        investmentPotential: number; // 0-100
      };
      crawlResults: Array<{
        source: string;
        data: Record<string, any>;
        timestamp: any;
      }>;
      priceHistory: Array<{
        date: string;
        price: number;
        source: string;
      }>;
      agents: Array<{
        agentId: string;
        name: string;
        interactions: number;
        successRate: number;
      }>;
      timestamp: any;
      updatedAt: any;
      tags: string[];
    };
    indexes: [
      'zipCode',
      'distressFactors.foreclosure',
      'heatmapIntensity',
      'timestamp',
    ];
  };

  agents: {
    document: {
      id: string;
      agentName: string;
      agentType: string; // 'human', 'ai', 'hybrid'
      specializations: string[]; // ['divorce', 'foreclosure', 'investment', etc.]
      successRate: number; // percentage 0-100
      totalDeals: number;
      closedDeals: number;
      failedDeals: number;
      averageTimeToClose: number; // days
      averageNegotiationTime: number; // hours
      negotiationWinRate: number; // percentage, how often they get better prices
      performanceMetrics: {
        avgPriceDifference: number; // actual vs initial ask
        avgCustomerSatisfaction: number; // 0-10
        repeatClientRate: number; // percentage
        referralRate: number; // percentage
      };
      strengths: string[];
      weaknesses: string[];
      recentActions: Array<{
        timestamp: string;
        action: string;
        dealId: string;
        result: string;
        impact: number;
      }>;
      learnings: Array<{
        date: string;
        lesson: string;
        situationType: string;
        impact: string;
      }>;
      timestamp: any;
      updatedAt: any;
      tags: string[];
    };
    indexes: ['specializations', 'successRate', 'timestamp'];
  };

  outcomes: {
    document: {
      id: string;
      scenarioId: string;
      situation: string; // 'divorce-high-stress', 'foreclosure-fast-cash', etc.
      strategy: string;
      initialApproach: string;
      adjustments: string[];
      result: 'success' | 'failure' | 'partial';
      successMetrics: {
        priceAchieved: number;
        timeToClose: number;
        clientSatisfaction: number;
        agentPerformance: number;
      };
      details: Record<string, any>;
      lessons: string[];
      applicableScenarios: string[];
      feedback: string;
      validationDate: string;
      timestamp: any;
      updatedAt: any;
      tags: string[];
    };
    indexes: ['situation', 'result', 'timestamp'];
  };

  conversations: {
    document: {
      id: string;
      participantId: string;
      agentId: string;
      topic: string;
      conversationType: string; // 'negotiation', 'consultation', 'followup', etc.
      startTime: any;
      endTime: any;
      duration: number; // seconds
      messages: Array<{
        timestamp: string;
        role: 'user' | 'assistant' | 'agent' | 'seller';
        content: string;
        sentiment: 'positive' | 'neutral' | 'negative';
        emotionalIntensity: number; // 0-10
        keyPoints: string[];
      }>;
      sentiment: 'positive' | 'neutral' | 'negative';
      overallEmotionalTone: string;
      keyDecisions: string[];
      negotiationProgress: Array<{
        stage: string;
        position: number;
        progress: number;
      }>;
      nextSteps: string[];
      followUpDate: string;
      timestamp: any;
      updatedAt: any;
      tags: string[];
    };
    indexes: ['participantId', 'agentId', 'topic', 'timestamp'];
  };

  marketAnalysis: {
    document: {
      id: string;
      zipCode: string;
      city: string;
      analysisDate: string;
      distressPropertyCount: number;
      averageListPrice: number;
      averageSalePrice: number;
      averageDaysOnMarket: number;
      priceReductionPercentage: number;
      marketTrend: 'increasing' | 'stable' | 'decreasing';
      investmentOpportunity: number; // 0-100
      dataQuality: number; // 0-100
      sources: string[];
      predictions: Record<string, any>;
      timestamp: any;
      updatedAt: any;
    };
    indexes: ['zipCode', 'analysisDate', 'timestamp'];
  };

  ragIndex: {
    document: {
      id: string;
      sourceCollection: string;
      sourceDocId: string;
      content: string;
      embedding: number[];
      category: string; // 'seller-psychology', 'negotiation-strategy', 'market-data', 'agent-performance'
      embeddingModel: string; // 'embedding-001', etc.
      relevantKeywords: string[];
      embeddingTimestamp: any;
      lastRetrievalDate: any;
      retrievalCount: number;
      avgRelevance: number;
    };
    indexes: ['sourceCollection', 'category', 'embeddingTimestamp'];
  };
}

/**
 * Collection Initialization Script
 */

export const initializeCollections = async (db: any) => {
  // Create indexes for sellers collection
  await db.collection('sellers').listDocuments(); // Ensure collection exists

  // Create indexes for properties collection
  await db.collection('properties').listDocuments();

  // Create indexes for agents collection
  await db.collection('agents').listDocuments();

  // Create indexes for outcomes collection
  await db.collection('outcomes').listDocuments();

  // Create indexes for conversations collection
  await db.collection('conversations').listDocuments();

  // Create indexes for market analysis collection
  await db.collection('marketAnalysis').listDocuments();

  // Create indexes for RAG index collection
  await db.collection('ragIndex').listDocuments();

  console.log('All Firestore collections initialized');
};

/**
 * Export schema for reference
 */
export const COLLECTIONS = {
  SELLERS: 'sellers',
  PROPERTIES: 'properties',
  AGENTS: 'agents',
  OUTCOMES: 'outcomes',
  CONVERSATIONS: 'conversations',
  MARKET_ANALYSIS: 'marketAnalysis',
  RAG_INDEX: 'ragIndex',
} as const;

export const SUBCOLLECTIONS = {
  INTERACTIONS: 'interactions',
  NEGOTIATIONS: 'negotiations',
  FEEDBACK: 'feedback',
  METRICS: 'metrics',
} as const;

export const DOCUMENT_TYPES = {
  SELLER: 'seller',
  PROPERTY: 'property',
  AGENT: 'agent',
  OUTCOME: 'outcome',
  CONVERSATION: 'conversation',
  MARKET: 'market',
} as const;
