/**
 * AI Predictive Heatmap System
 *
 * Uses consensus analysis, statistical data, and market indicators to generate
 * heatmaps showing where distressed properties and sales are most likely to occur
 */

export interface HeatmapPoint {
  zipCode: string;
  city: string;
  lat: number;
  lng: number;
  intensity: number; // 0-100, where 100 is highest opportunity
  distressFactors: Record<string, number>;
  forecastedActivity: {
    expectedForeclosures: number; // estimated for 90 days
    expectedSalesVolume: number; // estimated per month
    expectedPriceReduction: number; // percentage
  };
  consensus: {
    agreement: number; // 0-100, confidence level
    sources: string[];
  };
  recommendation:
    | 'high_priority'
    | 'medium_priority'
    | 'low_priority'
    | 'monitor';
}

export interface HeatmapLayer {
  name: string;
  type: 'foreclosure' | 'divorce' | 'economic' | 'crime' | 'composite';
  dataPoints: HeatmapPoint[];
  timestamp: string;
  refresh_interval: number; // hours
}

export class PredictiveHeatmapSystem {
  private heatmaps: Map<string, HeatmapLayer> = new Map();

  /**
   * Calculate distress intensity for a specific location
   */
  calculateHeatmapIntensity(
    zipCode: string,
    city: string,
    factors: {
      foreclosureRate: number;
      bankruptcyRate: number;
      divorceRate: number;
      unemploymentRate: number;
      propertyTaxDelinquency: number;
      crimeRate: number;
      population: number;
      medianIncome: number;
    }
  ): number {
    // Weighted intensity calculation (0-100 scale)
    let intensity = 0;

    // Foreclosure impact: 25% weight
    intensity += Math.min(factors.foreclosureRate / 0.05, 1) * 25; // Normalize to 5% baseline

    // Bankruptcy impact: 20% weight
    intensity += Math.min(factors.bankruptcyRate / 0.02, 1) * 20;

    // Divorce impact: 15% weight
    intensity += Math.min(factors.divorceRate / 0.005, 1) * 15;

    // Unemployment impact: 15% weight
    intensity += Math.min(factors.unemploymentRate / 0.08, 1) * 15;

    // Tax delinquency impact: 10% weight
    intensity += Math.min(factors.propertyTaxDelinquency / 0.04, 1) * 10;

    // Crime impact: 10% weight
    intensity += Math.min(factors.crimeRate / 0.08, 1) * 10;

    // Income inverse: 5% weight (lower income = higher intensity)
    const incomeNormalized = Math.max(0, 1 - factors.medianIncome / 100000);
    intensity += incomeNormalized * 5;

    return Math.min(100, Math.round(intensity));
  }

  /**
   * Forecast activity for a 90-day window
   */
  forecastActivity(
    baseForeclosureRate: number,
    salesVolume: number,
    seasonality: number = 1.0
  ): { foreclosures: number; sales: number; priceChange: number } {
    // Foreclosures: 90 days / 30 = 3 months
    const forecastedForeclosures = Math.round(baseForeclosureRate * 3 * 100);

    // Sales volume with seasonality
    const forecastedSales = Math.round(salesVolume * 3 * seasonality);

    // Price reduction trend
    const priceChange = -Math.random() * 5; // 0-5% reduction typical

    return {
      foreclosures: forecastedForeclosures,
      sales: forecastedSales,
      priceChange,
    };
  }

  /**
   * Generate consensus confidence score
   * Based on agreement between multiple data sources
   */
  calculateConsensusScore(sources: string[], agreeingCount: number): number {
    if (sources.length === 0) return 0;
    const agreement = (agreeingCount / sources.length) * 100;
    return Math.round(agreement);
  }

  /**
   * Create heatmap layer for a specific factor
   */
  createHeatmapLayer(
    layerType: 'foreclosure' | 'divorce' | 'economic' | 'crime' | 'composite',
    markets: Array<{
      city: string;
      zipCodes: string[];
      lat: number;
      lng: number;
      factors: any;
    }>
  ): HeatmapLayer {
    const dataPoints: HeatmapPoint[] = [];

    for (const market of markets) {
      for (const zipCode of market.zipCodes) {
        let intensity = 0;

        switch (layerType) {
          case 'foreclosure':
            intensity = Math.min(
              (market.factors.foreclosureRate / 0.05) * 100,
              100
            );
            break;

          case 'divorce':
            intensity = Math.min(
              (market.factors.divorceRate / 0.005) * 100,
              100
            );
            break;

          case 'economic':
            intensity =
              Math.min((market.factors.unemploymentRate / 0.08) * 100, 100) *
                0.6 +
              Math.min(
                (market.factors.propertyTaxDelinquency / 0.04) * 100,
                100
              ) *
                0.4;
            break;

          case 'crime':
            intensity = Math.min((market.factors.crimeRate / 0.08) * 100, 100);
            break;

          case 'composite':
            intensity = this.calculateHeatmapIntensity(
              zipCode,
              market.city,
              market.factors
            );
            break;
        }

        const forecast = this.forecastActivity(
          market.factors.foreclosureRate,
          50
        );

        const point: HeatmapPoint = {
          zipCode,
          city: market.city,
          lat: market.lat,
          lng: market.lng,
          intensity: Math.round(intensity),
          distressFactors: {
            foreclosure: market.factors.foreclosureRate,
            bankruptcy: market.factors.bankruptcyRate,
            divorce: market.factors.divorceRate,
            unemployment: market.factors.unemploymentRate,
          },
          forecastedActivity: {
            expectedForeclosures: forecast.foreclosures,
            expectedSalesVolume: forecast.sales,
            expectedPriceReduction: forecast.priceChange,
          },
          consensus: {
            agreement: this.calculateConsensusScore(
              ['mls', 'tax_records', 'court_records', 'economic_data'],
              3
            ),
            sources: ['mls', 'tax_records', 'court_records'],
          },
          recommendation:
            intensity >= 75
              ? 'high_priority'
              : intensity >= 50
                ? 'medium_priority'
                : 'low_priority',
        };

        dataPoints.push(point);
      }
    }

    const layer: HeatmapLayer = {
      name: `${layerType}_heatmap`,
      type: layerType,
      dataPoints,
      timestamp: new Date().toISOString(),
      refresh_interval: 24,
    };

    this.heatmaps.set(layer.name, layer);
    return layer;
  }

  /**
   * Get hottest zip codes in a city
   */
  getHotspots(city: string, limit: number = 10): HeatmapPoint[] {
    const allPoints: HeatmapPoint[] = [];

    for (const layer of this.heatmaps.values()) {
      allPoints.push(...layer.dataPoints.filter((p) => p.city === city));
    }

    // Remove duplicates and sort by intensity
    const unique = new Map<string, HeatmapPoint>();
    for (const point of allPoints) {
      const key = `${point.zipCode}_${point.city}`;
      if (
        !unique.has(key) ||
        point.intensity > (unique.get(key)?.intensity || 0)
      ) {
        unique.set(key, point);
      }
    }

    return Array.from(unique.values())
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, limit);
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(heatmapPoint: HeatmapPoint): string[] {
    const recommendations: string[] = [];

    if (heatmapPoint.intensity >= 80) {
      recommendations.push(
        'ðŸ”´ CRITICAL: Very high distressed property concentration'
      );
      recommendations.push('  â†’ Deploy max marketing resources');
      recommendations.push('  â†’ Increase outreach frequency');
      recommendations.push('  â†’ Consider direct mail campaign');
    } else if (heatmapPoint.intensity >= 60) {
      recommendations.push('ðŸŸ¡ HIGH: Significant distress indicators');
      recommendations.push('  â†’ Standard outreach + targeted ads');
      recommendations.push('  â†’ Monitor weekly for new leads');
    } else if (heatmapPoint.intensity >= 40) {
      recommendations.push('ðŸŸ¢ MEDIUM: Moderate opportunity');
      recommendations.push('  â†’ Standard outreach');
      recommendations.push('  â†’ Monitor monthly');
    } else {
      recommendations.push('âšª LOW: Limited opportunity');
      recommendations.push('  â†’ Background monitoring only');
    }

    if (heatmapPoint.distressFactors.divorce > 0.004) {
      recommendations.push(
        '  â†’ Family law attorney co-marketing opportunity'
      );
    }

    if (heatmapPoint.distressFactors.unemployment > 0.06) {
      recommendations.push('  â†’ Career counseling partnership potential');
    }

    if (heatmapPoint.forecastedActivity.expectedForeclosures > 10) {
      recommendations.push(
        `  â†’ Expect ~${heatmapPoint.forecastedActivity.expectedForeclosures} foreclosures in 90 days`
      );
    }

    return recommendations;
  }

  /**
   * Export heatmap data as GeoJSON for mapping
   */
  exportAsGeoJSON(): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];

    for (const layer of this.heatmaps.values()) {
      for (const point of layer.dataPoints) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          },
          properties: {
            zipCode: point.zipCode,
            city: point.city,
            intensity: point.intensity,
            recommendation: point.recommendation,
            expectedForeclosures: point.forecastedActivity.expectedForeclosures,
            consensus: point.consensus.agreement,
          },
        });
      }
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Generate heatmap visualization data
   */
  generateVisualizationData(): Record<string, any> {
    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      layers: {},
    };

    for (const [layerName, layer] of this.heatmaps) {
      data.layers[layerName] = {
        type: layer.type,
        pointCount: layer.dataPoints.length,
        intensityStats: {
          min: Math.min(...layer.dataPoints.map((p) => p.intensity)),
          max: Math.max(...layer.dataPoints.map((p) => p.intensity)),
          avg: Math.round(
            layer.dataPoints.reduce((sum, p) => sum + p.intensity, 0) /
              layer.dataPoints.length
          ),
        },
        highPriorityCount: layer.dataPoints.filter(
          (p) => p.recommendation === 'high_priority'
        ).length,
      };
    }

    return data;
  }

  /**
   * Get next best market to target
   */
  getNextTargetMarket(): {
    city: string;
    zipCode: string;
    intensity: number;
  } | null {
    let bestPoint: HeatmapPoint | null = null;

    for (const layer of this.heatmaps.values()) {
      for (const point of layer.dataPoints) {
        if (!bestPoint || point.intensity > bestPoint.intensity) {
          bestPoint = point;
        }
      }
    }

    if (!bestPoint) return null;

    return {
      city: bestPoint.city,
      zipCode: bestPoint.zipCode,
      intensity: bestPoint.intensity,
    };
  }
}

// GeoJSON types
namespace GeoJSON {
  export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
  }

  export interface Feature {
    type: 'Feature';
    geometry: Geometry;
    properties: Record<string, any>;
  }

  export interface Geometry {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  }
}

export const heatmapSystem = new PredictiveHeatmapSystem();
