/**
 * Comprehensive Memory System for Real Estate Intelligence
 * Enables persistent learning, pattern recognition, and contextual decision-making
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

/**
 * Memory Types
 */
export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: MemoryType;
  category: MemoryCategory;
  content: any;
  relevanceScore: number;
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export type MemoryType =
  | 'interaction'
  | 'learning'
  | 'pattern'
  | 'decision'
  | 'outcome'
  | 'seller_profile'
  | 'property_insight'
  | 'market_trend'
  | 'agent_performance'
  | 'negotiation_strategy';

export type MemoryCategory =
  | 'short_term'
  | 'medium_term'
  | 'long_term'
  | 'episodic'
  | 'semantic'
  | 'procedural';

/**
 * Interaction Memory - Records what happened
 */
export interface InteractionMemory extends MemoryEntry {
  type: 'interaction';
  content: {
    propertyId: string;
    seller?: {
      name: string;
      email: string;
      phone: string;
    };
    agentId: string;
    actionType:
      | 'contact'
      | 'negotiation'
      | 'viewing'
      | 'offer'
      | 'deal_closed'
      | 'rejected';
    details: Record<string, any>;
    outcome: 'success' | 'pending' | 'failed' | 'converted';
  };
}

/**
 * Learning Memory - Insights extracted from interactions
 */
export interface LearningMemory extends MemoryEntry {
  type: 'learning';
  content: {
    lesson: string;
    source: string; // Which interaction led to this learning
    applicability: 'universal' | 'seller_type' | 'market' | 'agent';
    confidence: number; // 0-1
    examples: string[];
  };
}

/**
 * Pattern Memory - Recurring patterns discovered
 */
export interface PatternMemory extends MemoryEntry {
  type: 'pattern';
  content: {
    pattern: string;
    frequency: number;
    reliability: number; // 0-1, how often it holds true
    triggers: string[];
    outcomes: string[];
    conditions: Record<string, any>;
  };
}

/**
 * Decision Memory - How decisions were made and their results
 */
export interface DecisionMemory extends MemoryEntry {
  type: 'decision';
  content: {
    decision: string;
    context: Record<string, any>;
    options_considered: string[];
    chosen_option: string;
    reasoning: string;
    outcome: 'successful' | 'partially_successful' | 'unsuccessful';
    outcome_metrics: Record<string, number>;
    learnedFor: string; // What to improve next time
  };
}

/**
 * Seller Profile Memory - Detailed understanding of seller psychology
 */
export interface SellerProfileMemory extends MemoryEntry {
  type: 'seller_profile';
  content: {
    sellerId: string;
    name: string;
    contact: { email: string; phone: string };
    desperation_level: number; // 0-100
    motivation_drivers: string[];
    communication_preference: 'email' | 'phone' | 'sms' | 'voice';
    best_contact_time: string; // e.g., "9 AM - 11 AM"
    negotiation_style: 'aggressive' | 'moderate' | 'conservative';
    price_sensitivity: number; // How likely to reduce price
    responsiveness: number; // 0-1
    conversion_likelihood: number; // 0-1
    previous_interactions: string[]; // Memory IDs
    personal_circumstances: string[];
    family_status: string;
    timeline: string; // How urgent
  };
}

/**
 * Property Insight Memory - Deep understanding of properties
 */
export interface PropertyInsightMemory extends MemoryEntry {
  type: 'property_insight';
  content: {
    propertyId: string;
    address: string;
    market_position: 'hot' | 'warm' | 'cold';
    days_available: number;
    price_trend: 'rising' | 'stable' | 'falling';
    buyer_interest_level: number; // 0-100
    competitive_properties: string[];
    unique_features: string[];
    issues: string[];
    estimated_resolution_cost: number;
    estimated_true_market_value: number;
    investment_potential: number; // 0-100
    likely_investors: string[];
    success_probability: number; // 0-1
  };
}

/**
 * Market Trend Memory - Understanding of market dynamics
 */
export interface MarketTrendMemory extends MemoryEntry {
  type: 'market_trend';
  content: {
    market: string; // e.g., "Port St. Lucie, FL"
    trend: string; // What's changing
    direction: 'positive' | 'negative' | 'stable';
    magnitude: number; // How much change
    duration: string; // How long trend has existed
    affected_property_types: string[];
    affected_price_ranges: { min: number; max: number };
    predictive_indicators: Record<string, any>;
    expected_duration: string;
    impact_on_strategy: string;
  };
}

/**
 * Agent Performance Memory - How agents perform
 */
export interface AgentPerformanceMemory extends MemoryEntry {
  type: 'agent_performance';
  content: {
    agentId: string;
    agentName: string;
    metric: string; // e.g., "deal_closure_rate", "negotiation_success"
    value: number;
    benchmark: number;
    trend: 'improving' | 'stable' | 'declining';
    strengths: string[];
    weaknesses: string[];
    specialties: string[];
    recent_successes: string[];
    areas_for_improvement: string[];
  };
}

/**
 * Negotiation Strategy Memory - What works in negotiations
 */
export interface NegotiationStrategyMemory extends MemoryEntry {
  type: 'negotiation_strategy';
  content: {
    strategy_name: string;
    situation: string; // When to use
    steps: string[];
    success_rate: number; // 0-1
    typical_outcome: Record<string, any>;
    seller_type_effectiveness: Record<string, number>;
    time_to_success: string; // e.g., "2-3 days"
    risk_level: 'low' | 'medium' | 'high';
    prerequisites: string[];
    common_obstacles: string[];
    recommended_follow_up: string;
  };
}

/**
 * Core Memory System Class
 */
export class MemorySystem {
  private shortTermMemory: Map<string, MemoryEntry> = new Map();
  private longTermMemory: MemoryEntry[] = [];
  private memoryPath: string;
  private maxShortTermSize: number = 1000;
  private accessLog: Array<{ id: string; timestamp: Date }> = [];

  constructor(basePath: string = './memory') {
    this.memoryPath = basePath;
    this.ensureMemoryDirectory();
    this.loadMemory();
  }

  /**
   * Ensure memory storage directories exist
   */
  private ensureMemoryDirectory(): void {
    const dirs = [
      this.memoryPath,
      path.join(this.memoryPath, 'short-term'),
      path.join(this.memoryPath, 'long-term'),
      path.join(this.memoryPath, 'patterns'),
      path.join(this.memoryPath, 'learnings'),
      path.join(this.memoryPath, 'access-logs'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Store an interaction
   */
  async recordInteraction(
    data: Omit<
      InteractionMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    const entry: InteractionMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as InteractionMemory;

    this.shortTermMemory.set(entry.id, entry);
    await this.saveToFile(entry, 'short-term');
    console.log(`âœ“ Interaction recorded: ${entry.id}`);

    // Trigger learning extraction
    await this.extractLearnings(entry);

    return entry.id;
  }

  /**
   * Record a learning from an interaction
   */
  async recordLearning(
    data: Omit<
      LearningMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    const entry: LearningMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as LearningMemory;

    this.longTermMemory.push(entry);
    await this.saveToFile(entry, 'learnings');
    console.log(`âœ“ Learning recorded: ${entry.id}`);

    return entry.id;
  }

  /**
   * Record a pattern discovery
   */
  async recordPattern(
    data: Omit<
      PatternMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    const entry: PatternMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as PatternMemory;

    this.longTermMemory.push(entry);
    await this.saveToFile(entry, 'patterns');
    console.log(`âœ“ Pattern recorded: ${entry.id}`);

    return entry.id;
  }

  /**
   * Record a decision and its outcome
   */
  async recordDecision(
    data: Omit<
      DecisionMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    const entry: DecisionMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as DecisionMemory;

    this.longTermMemory.push(entry);
    await this.saveToFile(entry, 'long-term');
    console.log(`âœ“ Decision recorded: ${entry.id}`);

    return entry.id;
  }

  /**
   * Record or update seller profile
   */
  async recordSellerProfile(
    data: Omit<
      SellerProfileMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    // Check if profile already exists
    const existing = await this.findBySellerId(data.content.sellerId);
    if (existing) {
      // Update existing
      const updated = { ...existing, ...data, timestamp: new Date() };
      this.longTermMemory = this.longTermMemory.map((m) =>
        m.id === existing.id ? updated : m
      );
      await this.saveToFile(updated, 'long-term');
      console.log(`âœ“ Seller profile updated: ${existing.id}`);
      return existing.id;
    }

    const entry: SellerProfileMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as SellerProfileMemory;

    this.longTermMemory.push(entry);
    await this.saveToFile(entry, 'long-term');
    console.log(`âœ“ Seller profile created: ${entry.id}`);

    return entry.id;
  }

  /**
   * Record property insight
   */
  async recordPropertyInsight(
    data: Omit<
      PropertyInsightMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >
  ): Promise<string> {
    const entry: PropertyInsightMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      relevanceScore: this.calculateRelevance(data),
      accessCount: 0,
      lastAccessed: new Date(),
      ...data,
    } as PropertyInsightMemory;

    this.longTermMemory.push(entry);
    await this.saveToFile(entry, 'long-term');
    console.log(`âœ“ Property insight recorded: ${entry.id}`);

    return entry.id;
  }

  /**
   * Recall memories by tag or relevance
   */
  async recall(
    query: string,
    filters?: {
      type?: MemoryType;
      category?: MemoryCategory;
      minRelevance?: number;
      limit?: number;
    }
  ): Promise<MemoryEntry[]> {
    const limit = filters?.limit || 10;
    const minRelevance = filters?.minRelevance || 0;

    // Search both short and long term
    let results: MemoryEntry[] = Array.from(
      this.shortTermMemory.values()
    ).concat(this.longTermMemory);

    // Apply filters
    if (filters?.type) {
      results = results.filter((m) => m.type === filters.type);
    }
    if (filters?.category) {
      results = results.filter((m) => m.category === filters.category);
    }

    results = results.filter((m) => m.relevanceScore >= minRelevance);

    // Score by relevance to query
    results = results.map((m) => ({
      ...m,
      relevanceScore: m.relevanceScore + this.scoreRelevance(m, query),
    }));

    // Sort by relevance and access frequency
    results.sort((a, b) => {
      const scoreA = a.relevanceScore * (1 + a.accessCount * 0.1);
      const scoreB = b.relevanceScore * (1 + b.accessCount * 0.1);
      return scoreB - scoreA;
    });

    // Update access count
    results.slice(0, limit).forEach((m) => {
      m.accessCount++;
      m.lastAccessed = new Date();
    });

    console.log(`âœ“ Recalled ${results.length} memories matching: "${query}"`);
    return results.slice(0, limit);
  }

  /**
   * Find seller profile by ID
   */
  async findSeller(sellerId: string): Promise<SellerProfileMemory | null> {
    const results = this.longTermMemory.filter(
      (m) =>
        m.type === 'seller_profile' &&
        (m as SellerProfileMemory).content.sellerId === sellerId
    );

    if (results.length > 0) {
      const memory = results[0] as SellerProfileMemory;
      memory.accessCount++;
      memory.lastAccessed = new Date();
      return memory;
    }

    return null;
  }

  /**
   * Find property insight by address
   */
  async findProperty(address: string): Promise<PropertyInsightMemory | null> {
    const results = this.longTermMemory.filter(
      (m) =>
        m.type === 'property_insight' &&
        (m as PropertyInsightMemory).content.address.toLowerCase() ===
          address.toLowerCase()
    );

    if (results.length > 0) {
      const memory = results[0] as PropertyInsightMemory;
      memory.accessCount++;
      memory.lastAccessed = new Date();
      return memory;
    }

    return null;
  }

  /**
   * Get negotiation strategies
   */
  async getNegotiationStrategies(
    situation: string
  ): Promise<NegotiationStrategyMemory[]> {
    const results = this.longTermMemory
      .filter(
        (m) =>
          m.type === 'negotiation_strategy' &&
          this.scoreRelevance(m, situation) > 0.5
      )
      .map((m) => ({
        ...m,
        relevanceScore: m.relevanceScore + this.scoreRelevance(m, situation),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results.slice(0, 5) as NegotiationStrategyMemory[];
  }

  /**
   * Get market insights
   */
  async getMarketInsights(market: string): Promise<MarketTrendMemory[]> {
    const results = this.longTermMemory.filter(
      (m) =>
        m.type === 'market_trend' &&
        (m as MarketTrendMemory).content.market.toLowerCase() ===
          market.toLowerCase()
    );

    return results.map((m) => ({
      ...m,
      accessCount: m.accessCount + 1,
      lastAccessed: new Date(),
    })) as MarketTrendMemory[];
  }

  /**
   * Get agent performance data
   */
  async getAgentPerformance(
    agentId: string
  ): Promise<AgentPerformanceMemory[]> {
    const results = this.longTermMemory.filter(
      (m) =>
        m.type === 'agent_performance' &&
        (m as AgentPerformanceMemory).content.agentId === agentId
    );

    return results.map((m) => ({
      ...m,
      accessCount: m.accessCount + 1,
      lastAccessed: new Date(),
    })) as AgentPerformanceMemory[];
  }

  /**
   * Extract learnings from an interaction
   */
  private async extractLearnings(
    interaction: InteractionMemory
  ): Promise<void> {
    // Pattern recognition logic
    const patterns = await this.detectPatterns(interaction);

    for (const pattern of patterns) {
      await this.recordPattern(pattern);
    }
  }

  /**
   * Detect patterns in data
   */
  private async detectPatterns(
    interaction: InteractionMemory
  ): Promise<
    Omit<
      PatternMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >[]
  > {
    const patterns: Omit<
      PatternMemory,
      'id' | 'timestamp' | 'relevanceScore' | 'accessCount' | 'lastAccessed'
    >[] = [];

    // Check for recurring patterns
    const similar =
      this.shortTermMemory.size > 10
        ? await this.recall(interaction.content.actionType)
        : [];

    if (similar.length > 3) {
      patterns.push({
        type: 'pattern',
        category: 'short_term',
        content: {
          pattern: `${interaction.content.actionType} success correlation`,
          frequency: similar.length,
          reliability: 0.7,
          triggers: [interaction.content.actionType],
          outcomes: similar
            .map((m) => (m as InteractionMemory).content.outcome)
            .filter((o) => o === 'success'),
          conditions: { action_type: interaction.content.actionType },
        },
        tags: ['behavior', 'pattern', interaction.content.actionType],
        metadata: {},
      });
    }

    return patterns;
  }

  /**
   * Calculate memory relevance score
   */
  private calculateRelevance(data: any): number {
    let score = 0.5; // Base score

    // More recent is more relevant
    if (data.timestamp) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      const days = age / (1000 * 60 * 60 * 24);
      score += Math.max(0.2, 0.5 - days * 0.05);
    }

    // Successful outcomes boost relevance
    if (data.outcome === 'success') score += 0.3;
    if (data.outcome === 'converted') score += 0.3;

    // High confidence learnings boost relevance
    if (data.confidence !== undefined && data.confidence > 0.8) score += 0.2;

    // High reliability patterns boost relevance
    if (data.reliability !== undefined && data.reliability > 0.8) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Score relevance to query
   */
  private scoreRelevance(memory: MemoryEntry, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Tag matching
    score +=
      memory.tags.filter((t) => queryLower.includes(t.toLowerCase())).length *
      0.2;

    // Content matching
    const contentStr = JSON.stringify(memory.content).toLowerCase();
    if (contentStr.includes(queryLower)) score += 0.5;

    return Math.min(1, score);
  }

  /**
   * Save memory to file
   */
  private async saveToFile(
    entry: MemoryEntry,
    category: string
  ): Promise<void> {
    const filepath = path.join(this.memoryPath, category, `${entry.id}.json`);
    await fs.writeJSON(filepath, entry, { spaces: 2 });
  }

  /**
   * Load memory from storage
   */
  private async loadMemory(): Promise<void> {
    try {
      const shortTermPath = path.join(this.memoryPath, 'short-term');
      const longTermPath = path.join(this.memoryPath, 'long-term');

      if (fs.existsSync(shortTermPath)) {
        const files = fs.readdirSync(shortTermPath);
        for (const file of files) {
          const data = await fs.readJSON(path.join(shortTermPath, file));
          this.shortTermMemory.set(data.id, data);
        }
      }

      if (fs.existsSync(longTermPath)) {
        const files = fs.readdirSync(longTermPath);
        for (const file of files) {
          const data = await fs.readJSON(path.join(longTermPath, file));
          this.longTermMemory.push(data);
        }
      }

      console.log(
        `âœ“ Memory loaded: ${this.shortTermMemory.size} short-term, ${this.longTermMemory.length} long-term`
      );
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
  }

  /**
   * Consolidate short-term to long-term when old
   */
  async consolidateMemory(): Promise<void> {
    const now = Date.now();
    const consolidationThreshold = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, memory] of this.shortTermMemory) {
      if (now - memory.timestamp.getTime() > consolidationThreshold) {
        this.longTermMemory.push(memory);
        this.shortTermMemory.delete(id);
        await this.saveToFile(memory, 'long-term');

        const shortPath = path.join(
          this.memoryPath,
          'short-term',
          `${id}.json`
        );
        if (fs.existsSync(shortPath)) {
          fs.removeSync(shortPath);
        }
      }
    }

    console.log('âœ“ Memory consolidated');
  }

  /**
   * Generate memory report
   */
  async generateReport(): Promise<Record<string, any>> {
    return {
      short_term_memories: this.shortTermMemory.size,
      long_term_memories: this.longTermMemory.length,
      total_memories: this.shortTermMemory.size + this.longTermMemory.length,
      memory_by_type: this.groupByType(),
      memory_by_category: this.groupByCategory(),
      most_accessed: this.getMostAccessed(10),
      least_used: this.getLeastUsed(10),
      timestamp: new Date(),
    };
  }

  /**
   * Group memories by type
   */
  private groupByType(): Record<string, number> {
    const groups: Record<string, number> = {};
    const all = Array.from(this.shortTermMemory.values()).concat(
      this.longTermMemory
    );

    all.forEach((m) => {
      groups[m.type] = (groups[m.type] || 0) + 1;
    });

    return groups;
  }

  /**
   * Group memories by category
   */
  private groupByCategory(): Record<string, number> {
    const groups: Record<string, number> = {};
    const all = Array.from(this.shortTermMemory.values()).concat(
      this.longTermMemory
    );

    all.forEach((m) => {
      groups[m.category] = (groups[m.category] || 0) + 1;
    });

    return groups;
  }

  /**
   * Get most accessed memories
   */
  private getMostAccessed(limit: number): MemoryEntry[] {
    const all = Array.from(this.shortTermMemory.values()).concat(
      this.longTermMemory
    );
    return all.sort((a, b) => b.accessCount - a.accessCount).slice(0, limit);
  }

  /**
   * Get least used memories
   */
  private getLeastUsed(limit: number): MemoryEntry[] {
    const all = Array.from(this.shortTermMemory.values()).concat(
      this.longTermMemory
    );
    return all.sort((a, b) => a.accessCount - b.accessCount).slice(0, limit);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mem_${crypto.randomBytes(6).toString('hex')}_${Date.now()}`;
  }

  /**
   * Find seller by ID (private method)
   */
  private async findBySellerId(
    sellerId: string
  ): Promise<SellerProfileMemory | null> {
    const results = this.longTermMemory.filter(
      (m) =>
        m.type === 'seller_profile' &&
        (m as SellerProfileMemory).content.sellerId === sellerId
    );

    return results.length > 0 ? (results[0] as SellerProfileMemory) : null;
  }
}

// Export singleton instance
let memorySystem: MemorySystem | null = null;

export function getMemorySystem(): MemorySystem {
  if (!memorySystem) {
    memorySystem = new MemorySystem('./memory');
  }
  return memorySystem;
}
