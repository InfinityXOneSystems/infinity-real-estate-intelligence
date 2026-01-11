/**
 * Statistical Analysis Engine for Real Estate Market Intelligence
 *
 * Provides market analysis based on:
 * - Foreclosure statistics
 * - Divorce statistics
 * - Economic indicators
 * - Crime rates
 * - Population density
 * - Income levels
 * - Property values
 */

export interface MarketStatistics {
  cityName: string;
  county: string;
  population: number;
  medianIncome: number;
  medianHomePrice: number;
  crimeRate: number; // crimes per 1000 residents
  unemploymentRate: number; // percentage
  foreclosureRate: number; // percentage of properties
  divorceRate: number; // per 1000 population
  litigationRate: number; // civil cases per 1000 residents
  delinquencyRate: number; // mortgage delinquency percentage
  bankruptcyRate: number; // filings per 1000 population
  propertyTaxDelinquency: number; // percentage delinquent
  poverytyRate: number; // percentage below poverty line
  rentalVacancy: number; // percentage vacant
  marketTrend: 'declining' | 'stable' | 'appreciating'; // market direction
  distressIndicator: number; // 0-100 composite score
  investmentPotential: number; // 0-100 score
}

export const TREASURE_COAST_STATISTICS: Record<string, MarketStatistics> = {
  'Port St. Lucie': {
    cityName: 'Port St. Lucie',
    county: 'St. Lucie',
    population: 200000,
    medianIncome: 58000,
    medianHomePrice: 350000,
    crimeRate: 4.2,
    unemploymentRate: 4.8,
    foreclosureRate: 2.1,
    divorceRate: 4.5,
    litigationRate: 3.2,
    delinquencyRate: 3.8,
    bankruptcyRate: 1.2,
    propertyTaxDelinquency: 2.9,
    poverytyRate: 14.2,
    rentalVacancy: 6.5,
    marketTrend: 'appreciating',
    distressIndicator: 62,
    investmentPotential: 78,
  },
  'Fort Pierce': {
    cityName: 'Fort Pierce',
    county: 'St. Lucie',
    population: 45000,
    medianIncome: 42000,
    medianHomePrice: 280000,
    crimeRate: 6.8,
    unemploymentRate: 6.2,
    foreclosureRate: 3.4,
    divorceRate: 5.2,
    litigationRate: 4.5,
    delinquencyRate: 5.2,
    bankruptcyRate: 1.8,
    propertyTaxDelinquency: 4.2,
    poverytyRate: 19.8,
    rentalVacancy: 8.2,
    marketTrend: 'stable',
    distressIndicator: 75,
    investmentPotential: 85,
  },
  Stuart: {
    cityName: 'Stuart',
    county: 'Martin',
    population: 15000,
    medianIncome: 78000,
    medianHomePrice: 650000,
    crimeRate: 3.1,
    unemploymentRate: 3.2,
    foreclosureRate: 0.8,
    divorceRate: 3.2,
    litigationRate: 2.8,
    delinquencyRate: 1.5,
    bankruptcyRate: 0.5,
    propertyTaxDelinquency: 1.2,
    poverytyRate: 8.5,
    rentalVacancy: 4.2,
    marketTrend: 'appreciating',
    distressIndicator: 35,
    investmentPotential: 45,
  },
  'West Palm Beach': {
    cityName: 'West Palm Beach',
    county: 'Palm Beach',
    population: 111000,
    medianIncome: 51000,
    medianHomePrice: 420000,
    crimeRate: 5.9,
    unemploymentRate: 5.4,
    foreclosureRate: 2.8,
    divorceRate: 4.8,
    litigationRate: 3.9,
    delinquencyRate: 4.1,
    bankruptcyRate: 1.5,
    propertyTaxDelinquency: 3.5,
    poverytyRate: 16.2,
    rentalVacancy: 7.1,
    marketTrend: 'stable',
    distressIndicator: 68,
    investmentPotential: 80,
  },
  Jupiter: {
    cityName: 'Jupiter',
    county: 'Palm Beach',
    population: 62000,
    medianIncome: 95000,
    medianHomePrice: 850000,
    crimeRate: 2.5,
    unemploymentRate: 2.8,
    foreclosureRate: 0.6,
    divorceRate: 3.1,
    litigationRate: 2.5,
    delinquencyRate: 0.9,
    bankruptcyRate: 0.3,
    propertyTaxDelinquency: 0.8,
    poverytyRate: 5.2,
    rentalVacancy: 3.5,
    marketTrend: 'appreciating',
    distressIndicator: 28,
    investmentPotential: 38,
  },
  Okeechobee: {
    cityName: 'Okeechobee',
    county: 'Okeechobee',
    population: 6000,
    medianIncome: 38000,
    medianHomePrice: 200000,
    crimeRate: 5.5,
    unemploymentRate: 7.2,
    foreclosureRate: 3.9,
    divorceRate: 5.5,
    litigationRate: 4.2,
    delinquencyRate: 5.8,
    bankruptcyRate: 2.1,
    propertyTaxDelinquency: 5.5,
    poverytyRate: 21.5,
    rentalVacancy: 9.8,
    marketTrend: 'declining',
    distressIndicator: 82,
    investmentPotential: 88,
  },
  Miami: {
    cityName: 'Miami',
    county: 'Miami-Dade',
    population: 467000,
    medianIncome: 48000,
    medianHomePrice: 380000,
    crimeRate: 7.2,
    unemploymentRate: 5.8,
    foreclosureRate: 3.2,
    divorceRate: 5.0,
    litigationRate: 4.8,
    delinquencyRate: 4.5,
    bankruptcyRate: 1.6,
    propertyTaxDelinquency: 4.0,
    poverytyRate: 17.8,
    rentalVacancy: 7.8,
    marketTrend: 'appreciating',
    distressIndicator: 70,
    investmentPotential: 82,
  },
  'Vero Beach': {
    cityName: 'Vero Beach',
    county: 'Indian River',
    population: 17000,
    medianIncome: 65000,
    medianHomePrice: 520000,
    crimeRate: 3.8,
    unemploymentRate: 4.1,
    foreclosureRate: 1.5,
    divorceRate: 3.8,
    litigationRate: 3.1,
    delinquencyRate: 2.5,
    bankruptcyRate: 0.8,
    propertyTaxDelinquency: 1.8,
    poverytyRate: 10.2,
    rentalVacancy: 5.2,
    marketTrend: 'appreciating',
    distressIndicator: 45,
    investmentPotential: 58,
  },
  'Delray Beach': {
    cityName: 'Delray Beach',
    county: 'Palm Beach',
    population: 68000,
    medianIncome: 62000,
    medianHomePrice: 520000,
    crimeRate: 4.5,
    unemploymentRate: 4.2,
    foreclosureRate: 1.8,
    divorceRate: 4.2,
    litigationRate: 3.5,
    delinquencyRate: 2.8,
    bankruptcyRate: 0.9,
    propertyTaxDelinquency: 2.2,
    poverytyRate: 11.5,
    rentalVacancy: 5.8,
    marketTrend: 'appreciating',
    distressIndicator: 50,
    investmentPotential: 62,
  },
  'Pompano Beach': {
    cityName: 'Pompano Beach',
    county: 'Broward',
    population: 104000,
    medianIncome: 54000,
    medianHomePrice: 430000,
    crimeRate: 5.2,
    unemploymentRate: 4.9,
    foreclosureRate: 2.4,
    divorceRate: 4.6,
    litigationRate: 3.7,
    delinquencyRate: 3.9,
    bankruptcyRate: 1.3,
    propertyTaxDelinquency: 3.1,
    poverytyRate: 13.8,
    rentalVacancy: 6.9,
    marketTrend: 'stable',
    distressIndicator: 65,
    investmentPotential: 76,
  },
  Tampa: {
    cityName: 'Tampa',
    county: 'Hillsborough',
    population: 399000,
    medianIncome: 52000,
    medianHomePrice: 380000,
    crimeRate: 6.1,
    unemploymentRate: 5.2,
    foreclosureRate: 2.9,
    divorceRate: 4.7,
    litigationRate: 4.0,
    delinquencyRate: 4.2,
    bankruptcyRate: 1.4,
    propertyTaxDelinquency: 3.6,
    poverytyRate: 15.5,
    rentalVacancy: 7.4,
    marketTrend: 'appreciating',
    distressIndicator: 66,
    investmentPotential: 79,
  },
};

export interface MarketRankings {
  byDistressIndicator: Array<{ city: string; score: number }>;
  byInvestmentPotential: Array<{ city: string; score: number }>;
  byForeclosureRate: Array<{ city: string; rate: number }>;
  byDivorceRate: Array<{ city: string; rate: number }>;
  byUnemployment: Array<{ city: string; rate: number }>;
  byPropertyTaxDelinquency: Array<{ city: string; rate: number }>;
}

export class StatisticalAnalysisEngine {
  private stats: Record<string, MarketStatistics>;

  constructor(
    stats: Record<string, MarketStatistics> = TREASURE_COAST_STATISTICS
  ) {
    this.stats = stats;
  }

  /**
   * Calculate rankings across all markets
   */
  generateRankings(): MarketRankings {
    const entries = Object.entries(this.stats);

    return {
      byDistressIndicator: entries
        .map(([city, stat]) => ({ city, score: stat.distressIndicator }))
        .sort((a, b) => b.score - a.score),

      byInvestmentPotential: entries
        .map(([city, stat]) => ({ city, score: stat.investmentPotential }))
        .sort((a, b) => b.score - a.score),

      byForeclosureRate: entries
        .map(([city, stat]) => ({ city, rate: stat.foreclosureRate }))
        .sort((a, b) => b.rate - a.rate),

      byDivorceRate: entries
        .map(([city, stat]) => ({ city, rate: stat.divorceRate }))
        .sort((a, b) => b.rate - a.rate),

      byUnemployment: entries
        .map(([city, stat]) => ({ city, rate: stat.unemploymentRate }))
        .sort((a, b) => b.rate - a.rate),

      byPropertyTaxDelinquency: entries
        .map(([city, stat]) => ({ city, rate: stat.propertyTaxDelinquency }))
        .sort((a, b) => b.rate - a.rate),
    };
  }

  /**
   * Calculate composite distress score for a market
   */
  calculateDistressScore(cityName: string): number {
    const stat = this.stats[cityName];
    if (!stat) return 0;

    // Weighted composite score
    const score =
      stat.foreclosureRate * 20 + // Foreclosures: 20% weight
      stat.bankruptcyRate * 15 + // Bankruptcies: 15% weight
      stat.divorceRate * 12 + // Divorces: 12% weight
      (stat.unemploymentRate / 100) * 200 + // Unemployment: relative weight
      stat.propertyTaxDelinquency * 10 + // Tax delinquency: 10% weight
      stat.poverytyRate * 5 + // Poverty: 5% weight
      stat.litigationRate * 8; // Litigation: 8% weight

    return Math.min(100, Math.round(score));
  }

  /**
   * Identify highest opportunity markets
   */
  getTopOpportunityMarkets(limit: number = 5): Array<{
    city: string;
    distress: number;
    potential: number;
    rank: number;
  }> {
    const rankings = this.generateRankings();

    return rankings.byDistressIndicator.slice(0, limit).map((item, idx) => {
      const stat = this.stats[item.city];
      return {
        city: item.city,
        distress: item.score,
        potential: stat.investmentPotential,
        rank: idx + 1,
      };
    });
  }

  /**
   * Get market comparison data
   */
  compareMarkets(city1: string, city2: string): Record<string, any> {
    const stat1 = this.stats[city1];
    const stat2 = this.stats[city2];

    if (!stat1 || !stat2) {
      return { error: 'One or both markets not found' };
    }

    return {
      city1: {
        name: city1,
        distress: stat1.distressIndicator,
        potential: stat1.investmentPotential,
        foreclosure: stat1.foreclosureRate,
        unemployment: stat1.unemploymentRate,
        medianIncome: stat1.medianIncome,
        medianPrice: stat1.medianHomePrice,
      },
      city2: {
        name: city2,
        distress: stat2.distressIndicator,
        potential: stat2.investmentPotential,
        foreclosure: stat2.foreclosureRate,
        unemployment: stat2.unemploymentRate,
        medianIncome: stat2.medianIncome,
        medianPrice: stat2.medianHomePrice,
      },
      comparison: {
        distressDiff: Math.abs(
          stat1.distressIndicator - stat2.distressIndicator
        ),
        opportunityDiff: Math.abs(
          stat1.investmentPotential - stat2.investmentPotential
        ),
        betterForDistressed:
          stat1.distressIndicator > stat2.distressIndicator ? city1 : city2,
        betterForInvestment:
          stat1.investmentPotential > stat2.investmentPotential ? city1 : city2,
      },
    };
  }

  /**
   * Identify high-risk neighborhoods within a city
   */
  getHighRiskIndicators(cityName: string): Record<string, any> | null {
    const stat = this.stats[cityName];
    if (!stat) return null;

    const riskFactors: Record<string, number> = {};

    if (stat.crimeRate > 5) riskFactors.highCrime = stat.crimeRate;
    if (stat.unemploymentRate > 6)
      riskFactors.highUnemployment = stat.unemploymentRate;
    if (stat.foreclosureRate > 2.5)
      riskFactors.highForeclosure = stat.foreclosureRate;
    if (stat.propertyTaxDelinquency > 3.5)
      riskFactors.taxDelinquency = stat.propertyTaxDelinquency;
    if (stat.delinquencyRate > 4)
      riskFactors.mortgageDelinquency = stat.delinquencyRate;
    if (stat.poverytyRate > 15) riskFactors.highPoverty = stat.poverytyRate;
    if (stat.rentalVacancy > 7) riskFactors.highVacancy = stat.rentalVacancy;

    return riskFactors;
  }

  /**
   * Get market statistics for a specific city
   */
  getMarketStats(cityName: string): MarketStatistics | null {
    return this.stats[cityName] || null;
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(): string {
    const rankings = this.generateRankings();
    const topOpportunities = this.getTopOpportunityMarkets(3);

    let report = 'TREASURE COAST MARKET ANALYSIS REPORT\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += 'TOP OPPORTUNITY MARKETS (by Distress + Investment Potential):\n';
    topOpportunities.forEach((market) => {
      report += `  ${market.rank}. ${market.city}\n`;
      report += `     Distress Score: ${market.distress}/100\n`;
      report += `     Investment Potential: ${market.potential}/100\n\n`;
    });

    report += 'HIGHEST FORECLOSURE RATES:\n';
    rankings.byForeclosureRate.slice(0, 5).forEach((item, idx) => {
      report += `  ${idx + 1}. ${item.city}: ${item.rate.toFixed(1)}%\n`;
    });

    report += '\nHIGHEST UNEMPLOYMENT RATES:\n';
    rankings.byUnemployment.slice(0, 5).forEach((item, idx) => {
      report += `  ${idx + 1}. ${item.city}: ${item.rate.toFixed(1)}%\n`;
    });

    report += '\nHIGHEST DIVORCE RATES:\n';
    rankings.byDivorceRate.slice(0, 5).forEach((item, idx) => {
      report += `  ${idx + 1}. ${item.city}: ${item.rate.toFixed(1)}/1000 residents\n`;
    });

    return report;
  }
}

// Export singleton instance
export const analysisEngine = new StatisticalAnalysisEngine();
