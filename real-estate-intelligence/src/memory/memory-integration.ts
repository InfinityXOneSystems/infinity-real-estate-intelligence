/**
 * Memory System Integration with Real Estate Intelligence Platform
 * Automatically captures, learns, and improves from all interactions
 */

import { getMemorySystem, type MemoryEntry } from './memory-system';
import type { GovernmentRecord } from '../crawlers/government-data-crawler';
import type { SocialLead } from '../crawlers/social-media-crawler';

/**
 * Memory Integration Service
 */
export class MemoryIntegration {
  private memory = getMemorySystem();

  /**
   * Record a successful property discovery
   */
  async recordPropertyDiscovery(
    record: GovernmentRecord,
    source: 'government' | 'social' | 'market'
  ): Promise<void> {
    // Store interaction
    await this.memory.recordInteraction({
      type: 'interaction',
      category: 'short_term',
      content: {
        propertyId: record.propertyId,
        agentId: 'system-crawler',
        actionType: 'contact',
        details: {
          source,
          address: record.address,
          city: record.city,
          zip: record.zipCode,
          amount: record.amount,
          type: record.type,
        },
        outcome: 'success',
      },
      tags: [source, record.type, record.city, 'property-discovery'],
      metadata: {
        source_system: source,
        property_type: record.type,
      },
    });

    // Record property insight
    await this.memory.recordPropertyInsight({
      type: 'property_insight',
      category: 'medium_term',
      content: {
        propertyId: record.propertyId,
        address: `${record.address}, ${record.city}, ${record.state}`,
        market_position: this.determineMarketPosition(record),
        days_available: 0,
        price_trend: 'stable',
        buyer_interest_level: 50 + Math.random() * 50,
        competitive_properties: [],
        unique_features: this.extractFeatures(record),
        issues: this.extractIssues(record),
        estimated_resolution_cost: record.amount * 0.1,
        estimated_true_market_value: record.amount * 1.2,
        investment_potential: this.calculateInvestmentPotential(record),
        likely_investors: [],
        success_probability: 0.7,
      },
      tags: [
        'property',
        record.city,
        record.zipCode,
        record.type,
        'investment-opportunity',
      ],
      metadata: {
        government_record_id: record.propertyId,
        original_amount: record.amount,
      },
    });
  }

  /**
   * Record a seller interaction
   */
  async recordSellerInteraction(
    lead: SocialLead,
    interactionType: 'contact' | 'negotiation' | 'offer'
  ): Promise<void> {
    // Check for existing seller profile
    const existingProfile = await this.memory.findSeller(lead.email);

    // Update or create seller profile
    await this.memory.recordSellerProfile({
      type: 'seller_profile',
      category: 'medium_term',
      content: {
        sellerId: lead.email,
        name: lead.contact_info?.name || 'Unknown',
        contact: {
          email: lead.email || 'unknown@example.com',
          phone: lead.contact_info?.phone || 'unknown',
        },
        desperation_level: lead.desperation_score || 50,
        motivation_drivers: lead.signal_types || [],
        communication_preference:
          lead.source === 'phone'
            ? 'phone'
            : lead.source === 'email'
              ? 'email'
              : 'sms',
        best_contact_time: this.determineBestContactTime(lead),
        negotiation_style: this.determineNegotiationStyle(lead),
        price_sensitivity: this.calculatePriceSensitivity(lead),
        responsiveness: existingProfile?.content.responsiveness || 0.5,
        conversion_likelihood: this.calculateConversionLikelihood(lead),
        previous_interactions:
          existingProfile?.content.previous_interactions || [],
        personal_circumstances: lead.content
          .split(/[,.]/)
          .filter((s) => s.length > 10),
        family_status: this.inferFamilyStatus(lead),
        timeline: this.inferTimeline(lead),
      },
      tags: [
        'seller',
        lead.source,
        `desperation_${Math.floor(lead.desperation_score / 10) * 10}`,
      ],
      metadata: {
        source: lead.source,
        signal_count: lead.signal_types?.length || 0,
        last_seen: new Date(),
      },
    });

    // Record interaction
    await this.memory.recordInteraction({
      type: 'interaction',
      category: 'short_term',
      content: {
        propertyId: 'unknown',
        seller: {
          name: lead.contact_info?.name || 'Unknown',
          email: lead.email,
          phone: lead.contact_info?.phone,
        },
        agentId: 'lead-processor',
        actionType: interactionType,
        details: {
          source: lead.source,
          desperation_score: lead.desperation_score,
          signals: lead.signal_types,
          content_snippet: lead.content.substring(0, 200),
        },
        outcome: lead.desperation_score > 70 ? 'success' : 'pending',
      },
      tags: ['seller-interaction', lead.source, interactionType],
      metadata: {
        source: lead.source,
        desperation_level: Math.floor(lead.desperation_score / 10),
      },
    });
  }

  /**
   * Record negotiation strategy effectiveness
   */
  async recordNegotiationOutcome(
    sellerId: string,
    strategy: string,
    success: boolean,
    details: Record<string, any>
  ): Promise<void> {
    // Find or create seller profile
    const seller = await this.memory.findSeller(sellerId);

    if (!seller) {
      console.warn(`Seller profile not found for ${sellerId}`);
      return;
    }

    // Record decision
    await this.memory.recordDecision({
      type: 'decision',
      category: 'medium_term',
      content: {
        decision: `Apply ${strategy} negotiation strategy to ${seller.content.name}`,
        context: {
          seller_desperation: seller.content.desperation_level,
          seller_type: seller.content.negotiation_style,
          market_position: details.market_position,
        },
        options_considered: [strategy, 'aggressive', 'conservative'],
        chosen_option: strategy,
        reasoning: `Selected based on seller desperation level (${seller.content.desperation_level}) and communication preference`,
        outcome: success ? 'successful' : 'unsuccessful',
        outcome_metrics: {
          initial_ask: details.initial_ask,
          final_price: details.final_price,
          discount_percent:
            ((details.initial_ask - details.final_price) /
              details.initial_ask) *
            100,
          days_to_agreement: details.days_to_agreement || 0,
          buyer_satisfaction: details.buyer_satisfaction || 0,
        },
        learnedFor: success
          ? `This strategy works well for ${seller.content.negotiation_style} sellers with desperation level ${seller.content.desperation_level}`
          : `Try different approach for ${seller.content.negotiation_style} sellers`,
      },
      tags: ['negotiation', strategy, sellerId],
      metadata: {
        success,
        strategy,
        seller_id: sellerId,
      },
    });

    // Update seller profile with improved metrics
    if (success) {
      seller.content.responsiveness = Math.min(
        1,
        seller.content.responsiveness + 0.1
      );
      seller.content.conversion_likelihood = Math.min(
        1,
        seller.content.conversion_likelihood + 0.15
      );
    }
  }

  /**
   * Record market trend observation
   */
  async recordMarketObservation(
    market: string,
    trend: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const existingTrends = await this.memory.getMarketInsights(market);

    await this.memory.recordPattern({
      type: 'pattern',
      category: 'long_term',
      content: {
        pattern: `Market trend in ${market}: ${trend}`,
        frequency: existingTrends.length + 1,
        reliability: 0.8,
        triggers: ['market-analysis'],
        outcomes: [trend],
        conditions: {
          market,
          metrics,
        },
      },
      tags: ['market-trend', market, trend],
      metadata: {
        market,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get smart recommendations based on memory
   */
  async getRecommendations(
    context: 'seller' | 'property' | 'negotiation' | 'market'
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (context === 'seller') {
      const strategies = await this.memory.getNegotiationStrategies('general');
      recommendations.push(
        ...strategies.slice(0, 3).map((s) => s.content.strategy_name)
      );
    }

    if (context === 'market') {
      const insights =
        await this.memory.getMarketInsights('Port St. Lucie, FL');
      recommendations.push(...insights.map((i) => i.content.trend).slice(0, 3));
    }

    if (context === 'negotiation') {
      const memories = await this.memory.recall('successful negotiation', {
        type: 'decision',
        limit: 5,
      });
      recommendations.push(
        ...memories.map((m) => (m as any).content.learnedFor).slice(0, 3)
      );
    }

    return recommendations;
  }

  /**
   * Get agent performance insights
   */
  async getAgentInsights(agentId: string): Promise<Record<string, any>> {
    const performance = await this.memory.getAgentPerformance(agentId);

    return {
      agent_id: agentId,
      metrics_tracked: performance.length,
      strengths: performance
        .flatMap((p) => p.content.strengths)
        .filter((v, i, a) => a.indexOf(v) === i),
      areas_for_improvement: performance
        .flatMap((p) => p.content.areas_for_improvement)
        .filter((v, i, a) => a.indexOf(v) === i),
      specialties: performance
        .flatMap((p) => p.content.specialties)
        .filter((v, i, a) => a.indexOf(v) === i),
      average_performance:
        performance.reduce((sum, p) => sum + p.content.value, 0) /
        performance.length,
    };
  }

  /**
   * Generate memory-based report
   */
  async generateMemoryReport(): Promise<Record<string, any>> {
    const report = await this.memory.generateReport();
    const topStrategies = await this.memory.getNegotiationStrategies('general');
    const recommendations = await this.getRecommendations('seller');

    return {
      ...report,
      top_negotiation_strategies: topStrategies
        .slice(0, 5)
        .map((s) => s.content.strategy_name),
      ai_recommendations: recommendations,
      generated_at: new Date(),
    };
  }

  /**
   * Helper: Determine market position
   */
  private determineMarketPosition(
    record: GovernmentRecord
  ): 'hot' | 'warm' | 'cold' {
    if (record.type === 'Foreclosure') return 'hot';
    if (record.type === 'Tax Lien') return 'warm';
    return 'cold';
  }

  /**
   * Helper: Extract features from record
   */
  private extractFeatures(record: GovernmentRecord): string[] {
    return [
      `Type: ${record.type}`,
      `County: ${record.county}`,
      `Amount: $${record.amount.toLocaleString()}`,
      `Status: ${record.status}`,
    ];
  }

  /**
   * Helper: Extract issues
   */
  private extractIssues(record: GovernmentRecord): string[] {
    const issues = [];
    if (record.type === 'Foreclosure') {
      issues.push('In foreclosure process');
    }
    if (record.type === 'Tax Lien') {
      issues.push('Tax lien on property');
    }
    if (record.type === 'Code Violation') {
      issues.push('Code violations present');
    }
    return issues;
  }

  /**
   * Helper: Calculate investment potential
   */
  private calculateInvestmentPotential(record: GovernmentRecord): number {
    let potential = 50;
    if (record.type === 'Foreclosure') potential += 30;
    if (record.type === 'Tax Lien') potential += 20;
    return Math.min(100, potential);
  }

  /**
   * Helper: Determine best contact time
   */
  private determineBestContactTime(lead: SocialLead): string {
    // Analyze post timing patterns in future
    return '9 AM - 12 PM';
  }

  /**
   * Helper: Determine negotiation style
   */
  private determineNegotiationStyle(
    lead: SocialLead
  ): 'aggressive' | 'moderate' | 'conservative' {
    if (lead.desperation_score > 80) return 'aggressive';
    if (lead.desperation_score > 50) return 'moderate';
    return 'conservative';
  }

  /**
   * Helper: Calculate price sensitivity
   */
  private calculatePriceSensitivity(lead: SocialLead): number {
    // Higher desperation = higher price sensitivity
    return lead.desperation_score / 100;
  }

  /**
   * Helper: Calculate conversion likelihood
   */
  private calculateConversionLikelihood(lead: SocialLead): number {
    let likelihood = 0.3;
    if (lead.desperation_score > 70) likelihood = 0.8;
    else if (lead.desperation_score > 50) likelihood = 0.6;
    else if (lead.desperation_score > 30) likelihood = 0.4;
    return likelihood;
  }

  /**
   * Helper: Infer family status
   */
  private inferFamilyStatus(lead: SocialLead): string {
    const content = lead.content.toLowerCase();
    if (content.includes('family')) return 'Has family';
    if (content.includes('divorce')) return 'Going through divorce';
    if (content.includes('inherited')) return 'Inherited property';
    return 'Unknown';
  }

  /**
   * Helper: Infer timeline
   */
  private inferTimeline(lead: SocialLead): string {
    const content = lead.content.toLowerCase();
    if (content.includes('asap') || content.includes('urgent'))
      return 'Within 2 weeks';
    if (content.includes('soon')) return 'Within 1 month';
    return 'Flexible';
  }
}

// Export singleton instance
let memoryIntegration: MemoryIntegration | null = null;

export function getMemoryIntegration(): MemoryIntegration {
  if (!memoryIntegration) {
    memoryIntegration = new MemoryIntegration();
  }
  return memoryIntegration;
}
