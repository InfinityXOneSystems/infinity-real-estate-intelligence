/**
 * Statistics Scraper - Human Behavior Patterns & Heatmap Generation
 * Scrapes human behavior data for predictive analytics and geographic opportunity mapping
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';

dotenv.config();

interface BehaviorData {
  timestamp: Date;
  location: {
    zip: string;
    city: string;
    county: string;
    coordinates?: { lat: number; lng: number };
  };
  metrics: {
    populationGrowth?: number;
    medianIncome?: number;
    unemploymentRate?: number;
    crimeRate?: number;
    schoolRating?: number;
    walkScore?: number;
    transitScore?: number;
  };
  trends: {
    searchVolume?: number;
    propertyViews?: number;
    inquiryRate?: number;
    timeOnMarket?: number;
  };
  demographics: {
    ageDistribution?: Record<string, number>;
    householdSize?: number;
    educationLevel?: string;
  };
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number; // 0-100, investment opportunity score
  factors: {
    demand: number;
    affordability: number;
    growth: number;
    quality: number;
  };
}

export class StatisticsScraperEngine {
  private browser: Browser | null = null;
  private readonly treasureCoastZips = [
    '34945',
    '34946',
    '34947',
    '34948',
    '34949', // Port St. Lucie
    '34950',
    '34951',
    '34952',
    '34953',
    '34954',
    '34957',
    '34983',
    '34984',
    '34986',
    '34987',
    '34990',
    '34991',
    '34997', // Fort Pierce area
  ];

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('âœ“ Statistics scraper initialized');
  }

  /**
   * Scrape Census Bureau data
   */
  async scrapeCensusData(zipCode: string): Promise<Partial<BehaviorData>> {
    try {
      const response = await axios.get(
        `https://api.census.gov/data/2021/acs/acs5?get=NAME,B01003_001E,B19013_001E,B23025_005E&for=zip%20code%20tabulation%20area:${zipCode}`,
        {
          params: {
            key: process.env.CENSUS_API_KEY || '',
          },
        }
      );

      const [headers, ...data] = response.data;
      const row = data[0];

      return {
        location: {
          zip: zipCode,
          city: row[0].split(',')[0],
          county: '',
        },
        metrics: {
          populationGrowth: parseFloat(row[1]) || 0,
          medianIncome: parseFloat(row[2]) || 0,
          unemploymentRate: parseFloat(row[3]) || 0,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to scrape census data for ${zipCode}:`, error);
      return { timestamp: new Date() };
    }
  }

  /**
   * Scrape Zillow search volume and market trends
   */
  async scrapeZillowTrends(zipCode: string): Promise<Partial<BehaviorData>> {
    if (!this.browser) await this.initialize();

    const page = await this.browser!.newPage();

    try {
      await page.goto(`https://www.zillow.com/homes/${zipCode}_rb/`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Extract market data from page
      const data = await page.evaluate(() => {
        const searchResults = document.querySelectorAll(
          '[data-test="property-card"]'
        ).length;
        const medianPriceEl = document.querySelector(
          '[data-test="median-price"]'
        );
        const timeOnMarketEl = document.querySelector(
          '[data-test="time-on-market"]'
        );

        return {
          searchResults,
          medianPrice: medianPriceEl?.textContent || '0',
          timeOnMarket: timeOnMarketEl?.textContent || '0',
        };
      });

      return {
        trends: {
          propertyViews: data.searchResults,
          timeOnMarket: parseInt(data.timeOnMarket) || 0,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to scrape Zillow for ${zipCode}:`, error);
      return { timestamp: new Date() };
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape Walk Score, Transit Score, and Bike Score
   */
  async scrapeWalkScore(
    address: string
  ): Promise<{ walkScore: number; transitScore: number; bikeScore: number }> {
    try {
      const response = await axios.get('https://api.walkscore.com/score', {
        params: {
          format: 'json',
          address,
          lat: 0, // Will be geocoded
          lon: 0,
          transit: 1,
          bike: 1,
          wsapikey: process.env.WALKSCORE_API_KEY || '',
        },
      });

      return {
        walkScore: response.data.walkscore || 0,
        transitScore: response.data.transit?.score || 0,
        bikeScore: response.data.bike?.score || 0,
      };
    } catch (error) {
      console.error('Failed to get Walk Score:', error);
      return { walkScore: 0, transitScore: 0, bikeScore: 0 };
    }
  }

  /**
   * Scrape crime statistics
   */
  async scrapeCrimeData(city: string, state: string): Promise<number> {
    try {
      // FBI Crime Data API (requires API key)
      const response = await axios.get(
        'https://api.usa.gov/crime/fbi/cde/arrest/state/offense-count',
        {
          params: {
            state_abbr: state,
            api_key: process.env.FBI_CRIME_API_KEY || '',
          },
        }
      );

      // Calculate crime rate per 100,000 people
      const crimeRate =
        response.data.results?.reduce(
          (sum: number, item: any) => sum + (item.actual || 0),
          0
        ) || 0;

      return crimeRate;
    } catch (error) {
      console.error('Failed to scrape crime data:', error);
      return 0;
    }
  }

  /**
   * Scrape school ratings from GreatSchools
   */
  async scrapeSchoolRatings(zipCode: string): Promise<number> {
    if (!this.browser) await this.initialize();

    const page = await this.browser!.newPage();

    try {
      await page.goto(
        `https://www.greatschools.org/search/search.page?zip=${zipCode}`,
        {
          waitUntil: 'networkidle2',
        }
      );

      const avgRating = await page.evaluate(() => {
        const ratings = Array.from(document.querySelectorAll('.rating')).map(
          (el) => parseFloat(el.textContent || '0')
        );
        return ratings.length > 0
          ? ratings.reduce((a, b) => a + b) / ratings.length
          : 0;
      });

      return avgRating;
    } catch (error) {
      console.error('Failed to scrape school ratings:', error);
      return 0;
    } finally {
      await page.close();
    }
  }

  /**
   * Aggregate all statistics for a location
   */
  async aggregateLocationStats(zipCode: string): Promise<BehaviorData> {
    console.log(`Scraping statistics for ZIP ${zipCode}...`);

    const [censusData, zillowData] = await Promise.all([
      this.scrapeCensusData(zipCode),
      this.scrapeZillowTrends(zipCode),
    ]);

    const city = censusData.location?.city || '';

    const [walkScoreData, crimeRate, schoolRating] = await Promise.all([
      this.scrapeWalkScore(`${zipCode}, FL`),
      city ? this.scrapeCrimeData(city, 'FL') : Promise.resolve(0),
      this.scrapeSchoolRatings(zipCode),
    ]);

    const aggregated: BehaviorData = {
      timestamp: new Date(),
      location: {
        zip: zipCode,
        city: censusData.location?.city || '',
        county: censusData.location?.county || 'St. Lucie',
      },
      metrics: {
        ...censusData.metrics,
        ...walkScoreData,
        crimeRate,
        schoolRating,
      },
      trends: {
        ...zillowData.trends,
      },
      demographics: {},
    };

    console.log(`âœ“ Aggregated statistics for ${zipCode}`);
    return aggregated;
  }

  /**
   * Generate heatmap data for Treasure Coast
   */
  async generateHeatmapData(): Promise<HeatmapPoint[]> {
    console.log('Generating heatmap for Treasure Coast...');

    const heatmapPoints: HeatmapPoint[] = [];

    for (const zip of this.treasureCoastZips) {
      try {
        const stats = await this.aggregateLocationStats(zip);

        // Calculate investment opportunity score
        const demandScore = this.calculateDemandScore(stats);
        const affordabilityScore = this.calculateAffordabilityScore(stats);
        const growthScore = this.calculateGrowthScore(stats);
        const qualityScore = this.calculateQualityScore(stats);

        const overallScore =
          demandScore * 0.3 +
          affordabilityScore * 0.2 +
          growthScore * 0.3 +
          qualityScore * 0.2;

        // Get approximate coordinates for ZIP code
        const coords = await this.geocodeZip(zip);

        heatmapPoints.push({
          lat: coords.lat,
          lng: coords.lng,
          weight: Math.round(overallScore),
          factors: {
            demand: Math.round(demandScore),
            affordability: Math.round(affordabilityScore),
            growth: Math.round(growthScore),
            quality: Math.round(qualityScore),
          },
        });

        console.log(
          `âœ“ Generated heatmap point for ${zip}: score ${Math.round(overallScore)}`
        );

        // Rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`Failed to generate heatmap for ${zip}:`, error);
      }
    }

    console.log(`âœ“ Generated ${heatmapPoints.length} heatmap points`);
    return heatmapPoints;
  }

  /**
   * Calculate demand score (0-100)
   */
  private calculateDemandScore(stats: BehaviorData): number {
    const viewsWeight = (stats.trends.propertyViews || 0) / 100;
    const inquiryWeight = (stats.trends.inquiryRate || 50) / 100;
    const marketTimeWeight = Math.max(
      0,
      100 - (stats.trends.timeOnMarket || 60)
    );

    return Math.min(100, (viewsWeight + inquiryWeight + marketTimeWeight) / 3);
  }

  /**
   * Calculate affordability score (0-100)
   */
  private calculateAffordabilityScore(stats: BehaviorData): number {
    const medianIncome = stats.metrics.medianIncome || 50000;
    // Higher score for more affordable (higher income, lower price ratio)
    const affordabilityRatio = medianIncome / 1000; // Simplified
    return Math.min(100, affordabilityRatio);
  }

  /**
   * Calculate growth score (0-100)
   */
  private calculateGrowthScore(stats: BehaviorData): number {
    const popGrowth = stats.metrics.populationGrowth || 0;
    const unemployment = stats.metrics.unemploymentRate || 5;

    // Higher population growth = higher score
    // Lower unemployment = higher score
    const growthWeight = Math.min(100, popGrowth * 10);
    const employmentWeight = Math.max(0, 100 - unemployment * 10);

    return (growthWeight + employmentWeight) / 2;
  }

  /**
   * Calculate quality of life score (0-100)
   */
  private calculateQualityScore(stats: BehaviorData): number {
    const walkScore = stats.metrics.walkScore || 50;
    const schoolRating = (stats.metrics.schoolRating || 5) * 10;
    const crimeWeight = Math.max(
      0,
      100 - (stats.metrics.crimeRate || 500) / 10
    );

    return (walkScore + schoolRating + crimeWeight) / 3;
  }

  /**
   * Geocode ZIP code to coordinates
   */
  private async geocodeZip(zip: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: zip,
            key: process.env.GOOGLE_MAPS_API_KEY || '',
          },
        }
      );

      const location = response.data.results?.[0]?.geometry?.location;
      return location || { lat: 27.2931, lng: -80.3253 }; // Default to Port St. Lucie
    } catch (error) {
      return { lat: 27.2931, lng: -80.3253 };
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('âœ“ Statistics scraper closed');
    }
  }
}

export default new StatisticsScraperEngine();
