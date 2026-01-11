/**
 * RAG Memory Retriever - Intelligent Context Lookup
 *
 * Uses embeddings to retrieve relevant historical context:
 * - Similar seller situations
 * - Successful negotiation strategies
 * - Agent performance patterns
 * - Market condition parallels
 *
 * @package intelligence
 * @author JARVIS
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { GoogleGenerativeAI, EmbedContent } from '@google/generative-ai';
import { firestoreMemory } from '../memory/firestore-memory';
import winston from 'winston';

// ============================================================================
// LOGGER SETUP
// ============================================================================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rag-retriever' },
  transports: [
    new winston.transports.File({
      filename: 'logs/rag-retriever.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RAGContext {
  type: 'seller' | 'property' | 'strategy' | 'outcome';
  relevance: number; // 0-1
  source: string;
  content: any;
  similarity: number;
}

export interface RAGQuery {
  query: string;
  context: Record<string, any>;
  topK?: number;
  minRelevance?: number;
}

export interface RAGResponse {
  query: string;
  contexts: RAGContext[];
  summary: string;
  recommendation: string;
}

// ============================================================================
// RAG RETRIEVER ENGINE
// ============================================================================

export class RAGRetriever extends EventEmitter {
  private genAI: GoogleGenerativeAI;
  private embeddingModel = 'models/embedding-001';
  private contextCache: Map<string, RAGContext[]> = new Map();

  constructor() {
    super();
    this.genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GEMINI_KEY || process.env.VERTEX_AI_API_KEY || ''
    );
    logger.info('RAG Retriever initialized');
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.genAI.embedContent({
        content: { parts: [{ text }] },
      } as EmbedContent);

      return result.embedding.values;
    } catch (error) {
      logger.error('Embedding generation failed', {
        error,
        text: text.substring(0, 100),
      });
      return [];
    }
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Retrieve similar seller situations
   */
  async retrieveSimilarSellers(query: RAGQuery): Promise<RAGContext[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query.query);
      const topK = query.topK || 5;
      const minRelevance = query.minRelevance || 0.6;

      // Get all sellers from Firestore
      const sellers = await firestoreMemory.querySellersBySituation(
        query.context.situation || 'divorce',
        20
      );

      const scoredResults: Array<{ context: RAGContext; score: number }> = [];

      for (const seller of sellers) {
        // Generate embedding for seller context
        const sellerText = `${seller.data.situation} - ${seller.data.address} - ${JSON.stringify(
          seller.data.psychologicalProfile
        )}`;

        const sellerEmbedding =
          seller.embedding || (await this.generateEmbedding(sellerText));

        if (sellerEmbedding.length === 0) continue;

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          sellerEmbedding
        );

        if (similarity >= minRelevance) {
          scoredResults.push({
            context: {
              type: 'seller',
              relevance: similarity,
              source: seller.id || 'unknown',
              content: seller.data,
              similarity,
            },
            score: similarity,
          });
        }
      }

      // Sort by similarity and take top K
      const results = scoredResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((r) => r.context);

      logger.info('Similar sellers retrieved', {
        count: results.length,
        query: query.query,
      });
      return results;
    } catch (error) {
      logger.error('Seller retrieval failed', { error, query: query.query });
      return [];
    }
  }

  /**
   * Retrieve successful strategies for situation
   */
  async retrieveSuccessfulStrategies(
    situation: string,
    topK: number = 5
  ): Promise<RAGContext[]> {
    try {
      const outcomes = await firestoreMemory.getSuccessfulOutcomes(
        situation,
        topK * 2
      );

      const contexts: RAGContext[] = outcomes.slice(0, topK).map((outcome) => ({
        type: 'strategy',
        relevance: 0.9,
        source: outcome.id || 'unknown',
        content: {
          strategy: outcome.data.strategy,
          result: outcome.data.result,
          details: outcome.data.details,
          learnings: outcome.data.learnings,
        },
        similarity: 0.9,
      }));

      logger.info('Successful strategies retrieved', {
        count: contexts.length,
        situation,
      });
      return contexts;
    } catch (error) {
      logger.error('Strategy retrieval failed', { error, situation });
      return [];
    }
  }

  /**
   * Retrieve top performing agents for task
   */
  async retrieveTopAgents(
    specialization: string,
    topK: number = 3
  ): Promise<RAGContext[]> {
    try {
      const agents = await firestoreMemory.getTopAgents(topK);

      const contexts: RAGContext[] = agents
        .filter(
          (agent) =>
            agent.data.specializations.includes(specialization) ||
            specialization === 'any'
        )
        .map((agent) => ({
          type: 'outcome',
          relevance: agent.data.successRate / 100,
          source: agent.id || 'unknown',
          content: {
            agent: agent.data.agentName,
            successRate: agent.data.successRate,
            closedDeals: agent.data.closedDeals,
            specializations: agent.data.specializations,
            metrics: agent.data.performanceMetrics,
          },
          similarity: agent.data.successRate / 100,
        }));

      logger.info('Top agents retrieved', {
        count: contexts.length,
        specialization,
      });
      return contexts;
    } catch (error) {
      logger.error('Agent retrieval failed', { error, specialization });
      return [];
    }
  }

  /**
   * Retrieve properties in similar market conditions
   */
  async retrieveSimilarProperties(
    zipCode: string,
    topK: number = 10
  ): Promise<RAGContext[]> {
    try {
      const properties = await firestoreMemory.getPropertiesByZipCode(
        zipCode,
        topK
      );

      const contexts: RAGContext[] = properties.map((property) => ({
        type: 'property',
        relevance: property.data.heatmapIntensity / 100,
        source: property.id || 'unknown',
        content: {
          address: property.data.address,
          listPrice: property.data.listPrice,
          estimatedValue: property.data.estimatedValue,
          distressFactors: property.data.distressFactors,
          predictions: property.data.predictions,
        },
        similarity: property.data.heatmapIntensity / 100,
      }));

      logger.info('Similar properties retrieved', {
        count: contexts.length,
        zipCode,
      });
      return contexts;
    } catch (error) {
      logger.error('Property retrieval failed', { error, zipCode });
      return [];
    }
  }

  /**
   * Comprehensive RAG query - retrieve all relevant contexts
   */
  async comprehensiveQuery(ragQuery: RAGQuery): Promise<RAGResponse> {
    this.emit('query:start', ragQuery);

    const [sellers, strategies, agents, properties] = await Promise.all([
      this.retrieveSimilarSellers(ragQuery),
      this.retrieveSuccessfulStrategies(
        ragQuery.context.situation || 'general',
        ragQuery.topK || 5
      ),
      this.retrieveTopAgents(ragQuery.context.specialization || 'any', 3),
      ragQuery.context.zipCode
        ? this.retrieveSimilarProperties(
            ragQuery.context.zipCode,
            ragQuery.topK || 10
          )
        : Promise.resolve([]),
    ]);

    const allContexts = [...sellers, ...strategies, ...agents, ...properties];

    // Generate summary from contexts
    const summary = this.generateContextSummary(allContexts);
    const recommendation = this.generateRecommendation(
      allContexts,
      ragQuery.context
    );

    const response: RAGResponse = {
      query: ragQuery.query,
      contexts: allContexts.sort((a, b) => b.relevance - a.relevance),
      summary,
      recommendation,
    };

    logger.info('RAG query completed', {
      queryLength: ragQuery.query.length,
      contextCount: allContexts.length,
    });

    this.emit('query:complete', response);
    return response;
  }

  /**
   * Generate summary from context
   */
  private generateContextSummary(contexts: RAGContext[]): string {
    const relevantContexts = contexts.filter((c) => c.relevance > 0.7);

    if (relevantContexts.length === 0) {
      return 'No highly relevant historical data found.';
    }

    const summary = relevantContexts
      .slice(0, 3)
      .map(
        (c) => `${c.type}: ${JSON.stringify(c.content).substring(0, 100)}...`
      )
      .join('\n');

    return summary;
  }

  /**
   * Generate recommendation from contexts
   */
  private generateRecommendation(
    contexts: RAGContext[],
    contextData: Record<string, any>
  ): string {
    const relevantContexts = contexts.filter((c) => c.relevance > 0.75);

    if (relevantContexts.length === 0) {
      return 'Insufficient historical data for recommendation.';
    }

    const successfulStrategies = relevantContexts.filter(
      (c) => c.type === 'strategy'
    );
    const topAgents = relevantContexts.filter((c) => c.type === 'outcome');

    let recommendation = 'Based on historical data: ';

    if (successfulStrategies.length > 0) {
      recommendation += `Apply strategy from successful outcomes. `;
    }

    if (topAgents.length > 0) {
      recommendation += `Leverage top performer approach. `;
    }

    recommendation += `Historical success rate suggests this approach has ${(
      (relevantContexts.reduce((sum, c) => sum + c.relevance, 0) /
        relevantContexts.length) *
      100
    ).toFixed(1)}% confidence.`;

    return recommendation;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.contextCache.clear();
    logger.info('RAG cache cleared');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const ragRetriever = new RAGRetriever();
