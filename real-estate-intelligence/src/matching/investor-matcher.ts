/**
 * Investor Matching Engine
 *
 * Intelligently matches distressed properties with investors based on:
 * - Location preferences
 * - Property type preferences
 * - Budget constraints
 * - Investment strategy
 * - Deal criteria (equity, condition, timeline)
 *
 * Produces scored matches for automatic investor notifications
 */

import {
  DistressedProperty,
  Investor,
  PropertyInvestorMatch,
  BuyCriteria,
} from '../types';

export class InvestorMatchingEngine {
  /**
   * Find best investor matches for a property
   */
  findMatches(
    property: DistressedProperty,
    investors: Investor[],
    minScore: number = 50
  ): PropertyInvestorMatch[] {
    const matches: PropertyInvestorMatch[] = [];

    for (const investor of investors) {
      if (!investor.active) continue;

      const score = this.calculateMatchScore(property, investor);

      if (score >= minScore) {
        const match: PropertyInvestorMatch = {
          property_id: property.id,
          investor_id: investor.id,
          match_score: score,
          match_reasons: this.generateMatchReasons(property, investor, score),
          property,
          investor,
          created_at: new Date().toISOString(),
          status: 'pending',
        };

        matches.push(match);
      }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Calculate match score (0-100) between property and investor
   */
  private calculateMatchScore(
    property: DistressedProperty,
    investor: Investor
  ): number {
    let score = 0;

    // Location match (0-30 points)
    score += this.scoreLocationMatch(property, investor);

    // Property type match (0-20 points)
    score += this.scorePropertyTypeMatch(property, investor);

    // Price/budget match (0-25 points)
    score += this.scorePriceMatch(property, investor);

    // Buy criteria match (0-15 points)
    score += this.scoreCriteriaMatch(property, investor);

    // Strategy alignment (0-10 points)
    score += this.scoreStrategyMatch(property, investor);

    return Math.min(100, score);
  }

  /**
   * Score location match
   */
  private scoreLocationMatch(
    property: DistressedProperty,
    investor: Investor
  ): number {
    let score = 0;

    for (const prefLoc of investor.preferred_locations) {
      // Exact city match
      if (
        prefLoc.city &&
        property.city.toLowerCase() === prefLoc.city.toLowerCase()
      ) {
        score = Math.max(score, 30);
      }
      // State match
      else if (
        prefLoc.state &&
        property.state.toLowerCase() === prefLoc.state.toLowerCase()
      ) {
        score = Math.max(score, 20);
      }
      // Zip code match
      else if (prefLoc.zip_codes && prefLoc.zip_codes.includes(property.zip)) {
        score = Math.max(score, 30);
      }
      // County match
      else if (
        prefLoc.counties &&
        prefLoc.counties.some((c) =>
          property.address.toLowerCase().includes(c.toLowerCase())
        )
      ) {
        score = Math.max(score, 25);
      }
      // Radius match (if we had coordinates)
      else if (prefLoc.radius_miles && prefLoc.center_point) {
        // Would calculate distance here
        score = Math.max(score, 15);
      }
    }

    // Check avoid locations
    if (investor.avoid_locations) {
      for (const avoidLoc of investor.avoid_locations) {
        if (
          property.city.toLowerCase().includes(avoidLoc.toLowerCase()) ||
          property.address.toLowerCase().includes(avoidLoc.toLowerCase())
        ) {
          return 0; // Disqualify
        }
      }
    }

    return score;
  }

  /**
   * Score property type match
   */
  private scorePropertyTypeMatch(
    property: DistressedProperty,
    investor: Investor
  ): number {
    if (investor.preferred_property_types.includes(property.property_type)) {
      return 20;
    }

    // Partial match for similar types
    if (
      property.property_type === 'townhouse' &&
      investor.preferred_property_types.includes('condo')
    ) {
      return 10;
    }

    return 0;
  }

  /**
   * Score price/budget match
   */
  private scorePriceMatch(
    property: DistressedProperty,
    investor: Investor
  ): number {
    const price = property.listed_price || property.estimated_value || 0;

    if (price === 0) return 10; // Unknown price, give some points

    // Must be within investor's budget
    if (price > investor.max_purchase_price) return 0; // Disqualify

    if (investor.min_purchase_price && price < investor.min_purchase_price) {
      return 0; // Below minimum
    }

    // Perfect range (80-95% of max budget)
    const idealMin = investor.max_purchase_price * 0.8;
    const idealMax = investor.max_purchase_price * 0.95;

    if (price >= idealMin && price <= idealMax) {
      return 25; // Perfect
    }

    // Good range (60-80% of max budget)
    if (price >= investor.max_purchase_price * 0.6 && price < idealMin) {
      return 20;
    }

    // Acceptable range
    if (price < investor.max_purchase_price * 0.6) {
      return 15; // Lower price, good deal potential
    }

    return 10; // Within budget but not ideal
  }

  /**
   * Score buy criteria match
   */
  private scoreCriteriaMatch(
    property: DistressedProperty,
    investor: Investor
  ): number {
    const criteria = investor.buy_criteria;
    let score = 0;

    // Vacancy requirement
    if (criteria.must_be_vacant !== undefined) {
      const isVacant = property.distress_type.includes('vacant');
      if (criteria.must_be_vacant === isVacant) {
        score += 5;
      } else if (criteria.must_be_vacant && !isVacant) {
        return 0; // Disqualify
      }
    }

    // Liens acceptance
    if (criteria.accepts_liens !== undefined) {
      const hasLiens = property.tax_lien || false;
      if (criteria.accepts_liens || !hasLiens) {
        score += 5;
      } else if (!criteria.accepts_liens && hasLiens) {
        return 0; // Disqualify
      }
    }

    // Equity requirement
    if (
      criteria.min_equity_percentage &&
      property.estimated_value &&
      property.mortgage_balance
    ) {
      const equity = property.estimated_value - property.mortgage_balance;
      const equityPct = (equity / property.estimated_value) * 100;

      if (equityPct >= criteria.min_equity_percentage) {
        score += 5;
      }
    }

    return score;
  }

  /**
   * Score strategy alignment
   */
  private scoreStrategyMatch(
    property: DistressedProperty,
    investor: Investor
  ): number {
    let score = 0;

    switch (investor.investment_strategy) {
      case 'fix_and_flip':
        // Prefer properties needing work
        if (
          property.distress_type.includes('fire_damage') ||
          property.distress_type.includes('water_damage') ||
          property.distress_type.includes('hoarder')
        ) {
          score = 10;
        }
        break;

      case 'wholesale':
        // Prefer highly distressed, urgent deals
        if (property.urgency_level === 'critical') {
          score = 10;
        } else if (property.urgency_level === 'high') {
          score = 7;
        }
        break;

      case 'buy_and_hold':
        // Prefer stable properties
        if (
          !property.distress_type.includes('fire_damage') &&
          !property.distress_type.includes('water_damage')
        ) {
          score = 10;
        }
        break;

      case 'rental':
        // Prefer multi-family or stable properties
        if (property.property_type === 'multi_family') {
          score = 10;
        }
        break;

      case 'development':
        // Prefer land or teardowns
        if (property.property_type === 'land') {
          score = 10;
        }
        break;
    }

    return score;
  }

  /**
   * Generate human-readable match reasons
   */
  private generateMatchReasons(
    property: DistressedProperty,
    investor: Investor,
    score: number
  ): string[] {
    const reasons: string[] = [];

    // Location
    if (
      investor.preferred_locations.some(
        (loc) =>
          loc.city?.toLowerCase() === property.city.toLowerCase() ||
          loc.state?.toLowerCase() === property.state.toLowerCase()
      )
    ) {
      reasons.push('Preferred location match');
    }

    // Property type
    if (investor.preferred_property_types.includes(property.property_type)) {
      reasons.push(`Matches preferred type: ${property.property_type}`);
    }

    // Price
    const price = property.listed_price || property.estimated_value || 0;
    if (price > 0 && price <= investor.max_purchase_price) {
      const pctOfBudget = ((price / investor.max_purchase_price) * 100).toFixed(
        0
      );
      reasons.push(`Within budget (${pctOfBudget}% of max)`);
    }

    // Urgency
    if (property.urgency_level === 'critical') {
      reasons.push('Critical urgency - likely to accept discount');
    } else if (property.urgency_level === 'high') {
      reasons.push('High urgency seller');
    }

    // Distress type
    if (property.distress_type.includes('foreclosure')) {
      reasons.push('Foreclosure - motivated seller');
    }
    if (property.distress_type.includes('divorce')) {
      reasons.push('Divorce sale - needs quick close');
    }

    // Strategy alignment
    if (
      investor.investment_strategy === 'fix_and_flip' &&
      (property.distress_type.includes('fire_damage') ||
        property.distress_type.includes('water_damage'))
    ) {
      reasons.push('Perfect for fix-and-flip strategy');
    }

    // Score-based
    if (score >= 85) {
      reasons.push('Excellent match - highly recommended');
    } else if (score >= 70) {
      reasons.push('Strong match');
    }

    return reasons;
  }

  /**
   * Batch match properties to all investors
   */
  matchAll(
    properties: DistressedProperty[],
    investors: Investor[],
    minScore: number = 50
  ): PropertyInvestorMatch[] {
    const allMatches: PropertyInvestorMatch[] = [];

    for (const property of properties) {
      const matches = this.findMatches(property, investors, minScore);
      allMatches.push(...matches);
    }

    return allMatches;
  }

  /**
   * Get best match for a property
   */
  getBestMatch(
    property: DistressedProperty,
    investors: Investor[]
  ): PropertyInvestorMatch | null {
    const matches = this.findMatches(property, investors, 0);
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Get all matches for a specific investor
   */
  getMatchesForInvestor(
    investor: Investor,
    properties: DistressedProperty[],
    minScore: number = 50
  ): PropertyInvestorMatch[] {
    const matches: PropertyInvestorMatch[] = [];

    for (const property of properties) {
      const score = this.calculateMatchScore(property, investor);

      if (score >= minScore) {
        matches.push({
          property_id: property.id,
          investor_id: investor.id,
          match_score: score,
          match_reasons: this.generateMatchReasons(property, investor, score),
          property,
          investor,
          created_at: new Date().toISOString(),
          status: 'pending',
        });
      }
    }

    return matches.sort((a, b) => b.match_score - a.match_score);
  }
}
