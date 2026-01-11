/**
 * Integrated Intelligence Orchestrator
 *
 * Ties together:
 * - Predictive heatmap system
 * - Statistical analysis engine
 * - Social media crawler
 * - Government data crawler
 * - Keyword database
 * - Scraper targeting
 */

import { heatmapSystem, type HeatmapPoint } from './predictive-heatmap-system';
import {
  analysisEngine,
  type MarketStatistics,
} from './statistical-analysis-engine';
import {
  socialCrawler,
  type SocialLead,
} from '../crawlers/social-media-crawler';
import {
  govCrawler,
  type GovernmentRecord,
} from '../crawlers/government-data-crawler';
import {
  getAllDistressKeywords,
  getKeywordScore,
} from '../data/distress-keywords-expanded';

export interface IntelligenceReport {
  timestamp: string;
  city: string;
  zipCode: string;
  distressScore: number; // 0-100
  hotspotIntensity: number; // 0-100
  governmentRecords: {
    foreclosures: number;
    taxLiens: number;
    codeViolations: number;
    auctionItems: number;
  };
  socialLeads: {
    total: number;
    highUrgency: number;
    avgDesperationScore: number;
  };
  marketStats: {
    population: number;
    unemploymentRate: number;
    foreclosureRate: number;
    divorceRate: number;
  };
  recommendations: string[];
  targetingStrategy: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    scalingFactor: number; // multiplier for marketing spend
    recommendedChannels: string[];
    estimatedMonthlyLeads: number;
  };
}

export interface ComprehensiveIntelligence {
  treasureCoastSummary: {
    totalDistressedZipCodes: number;
    highPriorityMarkets: string[];
    estimatedOpportunities: number;
    totalPotentialValue: number;
  };
  marketReports: IntelligenceReport[];
  criticalOpportunities: {
    address: string;
    source: string;
    immediateAction: string;
    estimatedValue: number;
  }[];
  keywordMatchingResults: {
    keyword: string;
    occurrences: number;
    confidence: number;
  }[];
}

export class IntelligenceOrchestrator {
  /**
   * Generate comprehensive intelligence report for a market
   */
  async generateMarketReport(city: string): Promise<IntelligenceReport> {
    // Get heatmap data
    const hotspots = heatmapSystem.getHotspots(city, 1);
    const hotspotIntensity = hotspots.length > 0 ? hotspots[0].intensity : 0;

    // Get statistical data
    const marketStats = analysisEngine.getMarketStats(city);
    const distressScore = analysisEngine.calculateDistressScore(marketStats);

    // Get social leads
    const socialLeads = socialCrawler.getLeadsByCity(city);
    const highUrgencySocial = socialLeads.filter(
      (l) => l.desperation_score > 70
    ).length;
    const avgSocialScore =
      socialLeads.length > 0
        ? socialLeads.reduce((sum, l) => sum + l.desperation_score, 0) /
          socialLeads.length
        : 0;

    // Get government records
    const govRecords = govCrawler.getRecordsByCity(city);
    const govStats = {
      foreclosures: govRecords.filter((r) => r.type === 'foreclosure_filing')
        .length,
      taxLiens: govRecords.filter((r) => r.type === 'tax_lien').length,
      codeViolations: govRecords.filter((r) => r.type === 'code_violation')
        .length,
      auctionItems: govRecords.filter((r) => r.type === 'auction').length,
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      city,
      distressScore,
      hotspotIntensity,
      socialLeads.length,
      govRecords.length
    );

    // Determine targeting strategy
    const targetingStrategy = this.determineTargetingStrategy(
      distressScore,
      hotspotIntensity,
      socialLeads.length + govRecords.length
    );

    // Get hotspot zip code
    const zipCode = hotspots.length > 0 ? hotspots[0].zipCode : 'multiple';

    const report: IntelligenceReport = {
      timestamp: new Date().toISOString(),
      city,
      zipCode,
      distressScore,
      hotspotIntensity,
      governmentRecords: govStats,
      socialLeads: {
        total: socialLeads.length,
        highUrgency: highUrgencySocial,
        avgDesperationScore: avgSocialScore,
      },
      marketStats: {
        population: marketStats.population,
        unemploymentRate: marketStats.unemploymentRate,
        foreclosureRate: marketStats.foreclosureRate,
        divorceRate: marketStats.divorceRate,
      },
      recommendations,
      targetingStrategy,
    };

    return report;
  }

  /**
   * Generate Treasure Coast comprehensive intelligence
   */
  async generateTreasureCoastIntelligence(): Promise<ComprehensiveIntelligence> {
    const treasureCoastCities = [
      'Port St. Lucie',
      'Fort Pierce',
      'Stuart',
      'West Palm Beach',
      'Jupiter',
      'Okeechobee',
      'Miami',
      'Vero Beach',
      'Delray Beach',
      'Pompano Beach',
      'Tampa',
    ];

    // Generate reports for all markets
    const marketReports: IntelligenceReport[] = [];
    for (const city of treasureCoastCities) {
      try {
        const report = await this.generateMarketReport(city);
        marketReports.push(report);
      } catch (error) {
        console.error(`Error generating report for ${city}:`, error);
      }
    }

    // Get critical opportunities
    const criticalOpportunities =
      this.extractCriticalOpportunities(marketReports);

    // Get keyword matching results
    const keywordResults = this.analyzeKeywordMatches(marketReports);

    // Summarize Treasure Coast
    const summary = {
      totalDistressedZipCodes: marketReports.filter((r) => r.distressScore > 60)
        .length,
      highPriorityMarkets: marketReports
        .filter(
          (r) =>
            r.targetingStrategy.priority === 'critical' ||
            r.targetingStrategy.priority === 'high'
        )
        .map((r) => r.city),
      estimatedOpportunities: marketReports.reduce(
        (sum, r) =>
          sum +
          (r.socialLeads.total +
            Object.values(r.governmentRecords).reduce((a, b) => a + b, 0)),
        0
      ),
      totalPotentialValue: this.calculateTotalPotentialValue(marketReports),
    };

    return {
      treasureCoastSummary: summary,
      marketReports: marketReports.sort(
        (a, b) => b.distressScore - a.distressScore
      ),
      criticalOpportunities,
      keywordMatchingResults: keywordResults,
    };
  }

  /**
   * Generate recommendations based on market data
   */
  private generateRecommendations(
    city: string,
    distressScore: number,
    hotspotIntensity: number,
    socialLeadCount: number,
    govRecordCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (distressScore > 75) {
      recommendations.push(
        'ðŸ”´ CRITICAL: Highest priority market for acquisition efforts'
      );
    } else if (distressScore > 60) {
      recommendations.push(
        'ðŸŸ  HIGH: Strong market opportunity - significant distress indicators'
      );
    } else if (distressScore > 40) {
      recommendations.push(
        'ðŸŸ¡ MEDIUM: Moderate opportunity - strategic focus area'
      );
    }

    if (hotspotIntensity > 80) {
      recommendations.push(
        `Geographic hotspot identified in ${city} - concentrate marketing efforts here`
      );
    }

    if (socialLeadCount > 5) {
      recommendations.push(
        `Social media is generating consistent leads (${socialLeadCount} found) - increase social outreach`
      );
    }

    if (govRecordCount > 10) {
      recommendations.push(
        `Government records show ${govRecordCount} distressed situations - opportunity for bulk portfolio acquisition`
      );
    }

    if (socialLeadCount > 0 && govRecordCount > 0) {
      recommendations.push(
        'Multi-source validation: Both social and government data confirm high opportunity'
      );
    }

    return recommendations;
  }

  /**
   * Determine marketing targeting strategy
   */
  private determineTargetingStrategy(
    distressScore: number,
    hotspotIntensity: number,
    leadCount: number
  ): {
    priority: 'critical' | 'high' | 'medium' | 'low';
    scalingFactor: number;
    recommendedChannels: string[];
    estimatedMonthlyLeads: number;
  } {
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let scalingFactor = 1;
    const recommendedChannels: string[] = [];

    if (distressScore > 75 && hotspotIntensity > 75) {
      priority = 'critical';
      scalingFactor = 3;
      recommendedChannels.push(
        'Direct Mail',
        'Social Media',
        'Phone Outreach',
        'Google Ads',
        'Local TV'
      );
    } else if (distressScore > 60 || hotspotIntensity > 60) {
      priority = 'high';
      scalingFactor = 2.5;
      recommendedChannels.push(
        'Social Media',
        'Google Ads',
        'Direct Mail',
        'Facebook Ads'
      );
    } else if (distressScore > 40 || hotspotIntensity > 40) {
      priority = 'medium';
      scalingFactor = 1.5;
      recommendedChannels.push('Google Ads', 'Facebook Ads', 'Email Marketing');
    } else {
      priority = 'low';
      scalingFactor = 0.8;
      recommendedChannels.push('Email Marketing', 'Organic SEO');
    }

    // Estimate monthly leads based on data points
    const baseLeads = Math.max(1, Math.round(leadCount / 3)); // Conservative estimate
    const estimatedMonthlyLeads = Math.round(baseLeads * scalingFactor);

    return {
      priority,
      scalingFactor,
      recommendedChannels,
      estimatedMonthlyLeads,
    };
  }

  /**
   * Extract critical opportunities requiring immediate action
   */
  private extractCriticalOpportunities(reports: IntelligenceReport[]): {
    address: string;
    source: string;
    immediateAction: string;
    estimatedValue: number;
  }[] {
    const opportunities: {
      address: string;
      source: string;
      immediateAction: string;
      estimatedValue: number;
    }[] = [];

    // Get critical government records
    const criticalGov = govCrawler.getCriticalOpportunities();
    for (const record of criticalGov.slice(0, 5)) {
      opportunities.push({
        address: record.propertyAddress,
        source: `${record.type} (${record.source})`,
        immediateAction: `${record.urgency.toUpperCase()}: ${record.notes}`,
        estimatedValue: record.potentialValue || record.amount || 0,
      });
    }

    // Get high-urgency social leads
    const urgentSocial = socialCrawler.getHighUrgencyLeads(80);
    for (const lead of urgentSocial.slice(0, 5)) {
      opportunities.push({
        address: lead.propertyAddress || lead.location || 'TBD',
        source: `Social Media (${lead.source})`,
        immediateAction: `DIRECT OUTREACH: ${lead.action_required} - ${lead.signal_types.join(', ')}`,
        estimatedValue: 0, // Estimated after property research
      });
    }

    return opportunities.sort((a, b) => b.estimatedValue - a.estimatedValue);
  }

  /**
   * Analyze keyword matching in market data
   */
  private analyzeKeywordMatches(reports: IntelligenceReport[]): {
    keyword: string;
    occurrences: number;
    confidence: number;
  }[] {
    const keywordMatches = new Map<
      string,
      { occurrences: number; confidence: number }
    >();

    // Get all distress keywords
    const allKeywords = getAllDistressKeywords();

    // Check social leads for keyword matches
    for (const lead of socialCrawler.exportLeads()) {
      for (const keyword of allKeywords) {
        if (lead.content.toLowerCase().includes(keyword.toLowerCase())) {
          const existing = keywordMatches.get(keyword) || {
            occurrences: 0,
            confidence: 0,
          };
          existing.occurrences++;
          existing.confidence = Math.min(
            100,
            existing.confidence + getKeywordScore(keyword)
          );
          keywordMatches.set(keyword, existing);
        }
      }
    }

    return Array.from(keywordMatches.entries())
      .map(([keyword, data]) => ({
        keyword,
        occurrences: data.occurrences,
        confidence: Math.round(data.confidence),
      }))
      .filter((k) => k.occurrences > 0)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20);
  }

  /**
   * Calculate total potential acquisition value
   */
  private calculateTotalPotentialValue(reports: IntelligenceReport[]): number {
    let total = 0;

    // Add government record value
    const govRecords = govCrawler.exportRecords();
    for (const record of govRecords) {
      total += record.potentialValue || record.amount || 0;
    }

    // Add estimated social leads value (conservative estimate: $50K per qualified lead)
    const socialLeads = socialCrawler.getHighUrgencyLeads(70);
    total += socialLeads.length * 50000;

    return total;
  }

  /**
   * Export comprehensive report as JSON
   */
  async exportComprehensiveReport(): Promise<ComprehensiveIntelligence> {
    return await this.generateTreasureCoastIntelligence();
  }
}

export const orchestrator = new IntelligenceOrchestrator();
