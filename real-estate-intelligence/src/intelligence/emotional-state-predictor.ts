/**
 * EMOTIONAL STATE PREDICTOR
 *
 * Tier 1 Intelligence: Predict seller's psychological state and negotiation leverage
 *
 * This is the difference between:
 * - "Offer $400K" (generic)
 * - "Offer $410K because seller's ego is involved in divorce, she'll accept $10K more to 'win' over ex" (intelligent)
 *
 * Competitive Advantage: You know what seller ACTUALLY wants, not just what market says
 */

import { EventEmitter } from 'events';

export interface SellerPsychologicalProfile {
  situation_type:
    | 'divorce'
    | 'probate'
    | 'distress'
    | 'job_loss'
    | 'relocation'
    | 'lifestyle';
  emotional_state:
    | 'desperate'
    | 'motivated'
    | 'realistic'
    | 'confident'
    | 'distracted';
  confidence_score: number; // 0-100, higher = more confident in prediction
  negotiation_leverage: 'high' | 'medium' | 'low';

  // Specific insights
  primary_motivation: string; // What seller REALLY wants
  secondary_motivation: string; // What seller also wants
  fear_factor: string; // What scares them most
  ego_factor: string; // What feeds their ego/pride

  // Negotiation strategy
  acceptance_threshold: number; // Price they'll likely accept
  rejection_threshold: number; // Price they'll reject
  timeline_pressure: 'extreme' | 'high' | 'medium' | 'low';

  // Psychological vulnerabilities (use ethically)
  vulnerability: string;
  opportunity: string;

  recommendation: {
    offer_price: number;
    offer_rationale: string;
    negotiation_approach: string;
    timeline_strategy: string;
  };
}

export interface PsychologicalDataPoint {
  source: string; // "listing_price" | "days_on_market" | "price_reductions" | "agent_assignment" | "property_condition" | "social_signals"
  value: any;
  weight: number; // 0-100, importance to final score
  inference: string; // What this tells us
}

export class EmotionalStatePredictor extends EventEmitter {
  /**
   * Analyze psychological state of seller from listing data
   */
  async predictSellerPsychology(property: {
    address: string;
    situation:
      | 'divorce'
      | 'probate'
      | 'foreclosure'
      | 'tax_lien'
      | 'job_loss'
      | 'relocation'
      | 'downsizing'
      | 'repair_costly'
      | 'inherited';
    list_price: number;
    estimated_market_value: number;
    days_on_market: number;
    price_reduction_history: Array<{
      date: string;
      old_price: number;
      new_price: number;
    }>;
    listing_agent: {
      name: string;
      years_experience: number;
      avg_commission: number;
    };
    seller: {
      name: string;
      age_range: '20-30' | '30-40' | '40-50' | '50-60' | '60-70' | '70+';
      occupation?: string;
      linked_in_info?: {
        job_title: string;
        company: string;
        recent_changes: boolean;
      };
    };
    property: {
      condition: 'excellent' | 'good' | 'fair' | 'poor';
      major_issues: string[];
      years_since_renovation: number;
      property_type: string;
    };
    market: {
      avg_days_on_market: number;
      inventory_level: 'low' | 'medium' | 'high';
      market_trend: 'up' | 'down' | 'flat';
    };
  }): Promise<SellerPsychologicalProfile> {
    console.log(
      `[PSYCHOLOGY] Analyzing seller psychology: ${property.address}`
    );

    const dataPoints: PsychologicalDataPoint[] = [];

    // =======================
    // DIVORCE DETECTION
    // =======================
    if (property.situation === 'divorce') {
      // Signal 1: Listed price vs market (divorce = distressed pricing)
      const price_discount =
        ((property.estimated_market_value - property.list_price) /
          property.estimated_market_value) *
        100;
      if (price_discount > 10) {
        dataPoints.push({
          source: 'listing_price',
          value: price_discount,
          weight: 25,
          inference:
            'Listed 10%+ below market = desperate to sell (typical divorce)',
        });
      }

      // Signal 2: Days on market (divorce sellers often under-price first)
      if (property.days_on_market < 7) {
        dataPoints.push({
          source: 'days_on_market',
          value: property.days_on_market,
          weight: 15,
          inference:
            'Listed recently - may be reactionary (fighting with spouse)',
        });
      }

      // Signal 3: Agent experience (divorce sellers often pick cheap agent or ex's friend)
      if (
        property.listing_agent.years_experience < 3 ||
        property.listing_agent.avg_commission < 4
      ) {
        dataPoints.push({
          source: 'agent_assignment',
          value: property.listing_agent.years_experience,
          weight: 20,
          inference:
            'Inexperienced or low-commission agent = one spouse controlling process',
        });
      }

      // Signal 4: No price reductions (yet) = just listed (fighting phase)
      if (
        property.price_reduction_history.length === 0 &&
        property.days_on_market < 14
      ) {
        dataPoints.push({
          source: 'price_reductions',
          value: 0,
          weight: 10,
          inference:
            'No price drops yet = angry/stubborn phase, not realistic phase',
        });
      }

      // Signal 5: Multiple price reductions = now fighting over money (desperation increasing)
      if (property.price_reduction_history.length > 2) {
        const latest_reduction =
          property.price_reduction_history[
            property.price_reduction_history.length - 1
          ];
        const avg_reduction =
          ((latest_reduction.old_price - latest_reduction.new_price) /
            latest_reduction.old_price) *
          100;
        if (avg_reduction > 5) {
          dataPoints.push({
            source: 'price_reductions',
            value: property.price_reduction_history.length,
            weight: 30,
            inference:
              'Multiple large reductions = desperation increasing (court date approaching)',
          });
        }
      }

      return this.synthesizeDivorceProfile(property, dataPoints);
    }

    // =======================
    // PROBATE DETECTION
    // =======================
    if (property.situation === 'probate') {
      // Signal 1: Executor is bleeding money monthly
      dataPoints.push({
        source: 'situation_type',
        value: 'probate',
        weight: 40,
        inference:
          'Executor paying property taxes, insurance, maintenance = wants OUT quickly',
      });

      // Signal 2: Probate delays = executor desperation increases with time
      if (property.days_on_market > 60) {
        dataPoints.push({
          source: 'days_on_market',
          value: property.days_on_market,
          weight: 25,
          inference:
            '60+ days = executor has paid $3K+ in carrying costs, very motivated',
        });
      }

      return this.synthesizeProbateProfile(property, dataPoints);
    }

    // =======================
    // FORECLOSURE/TAX LIEN DETECTION
    // =======================
    if (
      property.situation === 'foreclosure' ||
      property.situation === 'tax_lien'
    ) {
      // Signal 1: Extreme discount = desperation
      const discount =
        ((property.estimated_market_value - property.list_price) /
          property.estimated_market_value) *
        100;
      if (discount > 20) {
        dataPoints.push({
          source: 'listing_price',
          value: discount,
          weight: 40,
          inference: '20%+ discount = financial crisis, not choice',
        });
      }

      return this.synthesizeDistressProfile(property, dataPoints);
    }

    // =======================
    // JOB LOSS DETECTION
    // =======================
    if (property.situation === 'job_loss') {
      // Signal 1: LinkedIn shows recent job change
      if (property.seller.linked_in_info?.recent_changes) {
        dataPoints.push({
          source: 'social_signals',
          value: 'job_change',
          weight: 30,
          inference: 'Recent job loss = immediate cash need',
        });
      }

      return this.synthesizeJobLossProfile(property, dataPoints);
    }

    // Default synthesis
    return this.synthesizeGenericProfile(property, dataPoints);
  }

  private synthesizeDivorceProfile(
    property: any,
    dataPoints: PsychologicalDataPoint[]
  ): SellerPsychologicalProfile {
    const confidence = Math.min(
      100,
      dataPoints.reduce((sum, dp) => sum + dp.weight, 0)
    );

    // Estimate acceptance threshold
    // Typical: seller wants more than they list, will accept 2-5% above listing
    const acceptance_threshold = property.list_price * 1.03; // 3% above asking
    const rejection_threshold = property.list_price * 0.97; // 3% below asking

    // Emotional state: Divorce sellers are usually MOTIVATED (tired of fighting)
    const emotional_state =
      property.price_reduction_history.length > 2 ? 'desperate' : 'motivated';

    return {
      situation_type: 'divorce',
      emotional_state,
      confidence_score: confidence,
      negotiation_leverage: confidence > 70 ? 'high' : 'medium',

      primary_motivation: 'End the fighting and move forward',
      secondary_motivation: 'Maximize net proceeds',
      fear_factor: 'Ex-spouse controls the sale timeline',
      ego_factor: "Want to 'win' the division (get fair share)",

      acceptance_threshold,
      rejection_threshold,
      timeline_pressure:
        property.price_reduction_history.length > 2 ? 'high' : 'medium',

      vulnerability:
        "Control conflict with ex - they're fighting over money, not protecting house value",
      opportunity:
        "Offer fair price + fast close = they'll accept because it ENDS THE FIGHTING",

      recommendation: {
        offer_price: Math.round(property.list_price * 1.01), // 1% above asking (they expect this)
        offer_rationale:
          'Fair market price with no contingencies = fastest path to settlement',
        negotiation_approach:
          "Appeal to ending conflict: 'This offer closes in 7 days. Both sides get their share immediately.'",
        timeline_strategy:
          "Emphasize speed: 'Court delays = more money spent on lawyers. We close before next court date.'",
      },
    };
  }

  private synthesizeProbateProfile(
    property: any,
    dataPoints: PsychologicalDataPoint[]
  ): SellerPsychologicalProfile {
    const confidence = 85; // Probate psychology is predictable

    // Executor math:
    // Taxes $150-300/month
    // Insurance $75-150/month
    // Maintenance $200-500/month
    // Total bleed: $425-950/month average $687
    const monthly_carrying_cost = 687;
    const months_elapsed = Math.min(property.days_on_market / 30, 6); // Probate typically 6-12 months total
    const total_cost_to_date = monthly_carrying_cost * months_elapsed;

    // Executor will accept: market_value - carrying_costs_to_date
    const acceptance_threshold =
      property.estimated_market_value - total_cost_to_date;
    const rejection_threshold = property.estimated_market_value * 0.9; // Won't accept >10% below market

    return {
      situation_type: 'probate',
      emotional_state: 'desperate',
      confidence_score: confidence,
      negotiation_leverage: 'high',

      primary_motivation: 'Stop bleeding money monthly',
      secondary_motivation: 'Settle estate and distribute to heirs',
      fear_factor: 'Probate court delays = more carrying costs',
      ego_factor: 'Executor wants to complete duty efficiently',

      acceptance_threshold,
      rejection_threshold,
      timeline_pressure: months_elapsed > 3 ? 'extreme' : 'high',

      vulnerability:
        "Carrying costs are destroying their cash flow - they'll accept break-even to stop the bleed",
      opportunity:
        "Show them the carrying cost math: 'At $687/month, you lose $6,870 every 10 months. Let's close in 14 days.'",

      recommendation: {
        offer_price: Math.round(acceptance_threshold),
        offer_rationale: `Market value ($${property.estimated_market_value}) minus carrying costs ($${Math.round(total_cost_to_date)}) = their break-even`,
        negotiation_approach:
          "Show the monthly bleed: 'We save you $687/month in carrying costs. Every week we delay costs $160 out of pocket.'",
        timeline_strategy:
          "Fast close is the only negotiation point: 'We close in 14 days. Other buyers take 45 days.'",
      },
    };
  }

  private synthesizeDistressProfile(
    property: any,
    dataPoints: PsychologicalDataPoint[]
  ): SellerPsychologicalProfile {
    return {
      situation_type: 'distress',
      emotional_state: 'desperate',
      confidence_score: 90,
      negotiation_leverage: 'high',

      primary_motivation: 'Avoid foreclosure/tax sale at any cost',
      secondary_motivation: 'Preserve any equity left',
      fear_factor: 'Lose house completely',
      ego_factor: 'Maintain dignity in financial crisis',

      acceptance_threshold: property.list_price * 0.95,
      rejection_threshold: property.list_price * 0.85,
      timeline_pressure: 'extreme',

      vulnerability: 'Any offer better than foreclosure is acceptable',
      opportunity:
        "Position yourself as the lifeline: 'We prevent foreclosure. Other buyers are flippers.'",

      recommendation: {
        offer_price: Math.round(property.list_price * 0.92),
        offer_rationale: 'Below asking but above foreclosure outcome',
        negotiation_approach:
          "Compare to alternatives: 'Foreclosure = $0. Short sale = years of credit damage. We = cash today.'",
        timeline_strategy:
          "Emphasize speed and certainty: 'We close guaranteed. Foreclosure auction is uncertain.'",
      },
    };
  }

  private synthesizeJobLossProfile(
    property: any,
    dataPoints: PsychologicalDataPoint[]
  ): SellerPsychologicalProfile {
    return {
      situation_type: 'distress',
      emotional_state: 'motivated',
      confidence_score: 75,
      negotiation_leverage: 'medium',

      primary_motivation: 'Generate immediate cash to bridge income gap',
      secondary_motivation: 'Reduce monthly carrying costs',
      fear_factor: 'Unable to make mortgage payments',
      ego_factor: 'Regain financial control quickly',

      acceptance_threshold: property.estimated_market_value * 0.96,
      rejection_threshold: property.estimated_market_value * 0.9,
      timeline_pressure: 'high',

      vulnerability: 'Employment gap = cash need immediate',
      opportunity:
        "Position yourself as cash generation: 'Close in 7 days. You have cash before first mortgage payment is due.'",

      recommendation: {
        offer_price: Math.round(property.estimated_market_value * 0.94),
        offer_rationale: 'Slightly below market but above other options',
        negotiation_approach:
          "Emphasize cash flow: 'Start your new job without mortgage stress. We provide the bridge.'",
        timeline_strategy:
          "Speed is selling point: 'Close in 7 days. You have cash for moving, relocation, new home deposit.'",
      },
    };
  }

  private synthesizeGenericProfile(
    property: any,
    dataPoints: PsychologicalDataPoint[]
  ): SellerPsychologicalProfile {
    return {
      situation_type: property.situation as any,
      emotional_state: 'realistic',
      confidence_score: 50,
      negotiation_leverage: 'low',

      primary_motivation: 'Sell at fair market price',
      secondary_motivation: 'Quick, smooth transaction',
      fear_factor: 'Long holding period',
      ego_factor: 'Get maximum value',

      acceptance_threshold: property.estimated_market_value * 0.98,
      rejection_threshold: property.estimated_market_value * 0.9,
      timeline_pressure: 'low',

      vulnerability: 'None identified',
      opportunity: 'Standard market transaction',

      recommendation: {
        offer_price: Math.round(property.estimated_market_value * 0.96),
        offer_rationale: 'Fair market offer with quick close',
        negotiation_approach: 'Standard market transaction approach',
        timeline_strategy: '30-45 day close is standard',
      },
    };
  }

  /**
   * Generate human-readable psychological brief for sales team
   */
  generateSellerBrief(profile: SellerPsychologicalProfile): string {
    return `
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘              SELLER PSYCHOLOGICAL PROFILE                       â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

SITUATION: ${profile.situation_type.toUpperCase()}
EMOTIONAL STATE: ${profile.emotional_state}
CONFIDENCE IN ANALYSIS: ${profile.confidence_score}%

PRIMARY MOTIVATION
  "${profile.primary_motivation}"

SECONDARY MOTIVATION
  "${profile.secondary_motivation}"

THEIR BIGGEST FEAR
  "${profile.fear_factor}"

HOW TO APPEAL TO THEIR EGO
  "${profile.ego_factor}"

NEGOTIATION LEVERAGE: ${profile.negotiation_leverage.toUpperCase()}
TIMELINE PRESSURE: ${profile.timeline_pressure.toUpperCase()}

VULNERABILITY (Use Ethically)
  ${profile.vulnerability}

YOUR OPPORTUNITY
  ${profile.opportunity}

RECOMMENDED OFFER
  Price: $${profile.recommendation.offer_price}
  Rationale: ${profile.recommendation.offer_rationale}

NEGOTIATION APPROACH
  ${profile.recommendation.negotiation_approach}

TIMELINE STRATEGY
  ${profile.recommendation.timeline_strategy}

ACCEPTANCE LIKELY IF: $${profile.acceptance_threshold}+ with fast close
REJECTION LIKELY IF: $${profile.rejection_threshold}- or slow timeline
    `;
  }
}

export default EmotionalStatePredictor;
