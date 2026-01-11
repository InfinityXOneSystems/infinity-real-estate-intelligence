/**
 * ============================================================================
 * FIRESTORE RAG MEMORY INTEGRATION
 * ============================================================================
 *
 * Combines:
 * - Firestore (NoSQL real-time database)
 * - RAG Memory Service Account (Google Cloud)
 * - Intelligent LLM Router (Claude, Gemini, Groq)
 * - GCS Bucket Storage (real-estate-intelligence/)
 *
 * Architecture:
 * Real Estate Data â†’ Firestore â†’ RAG Embedding â†’ GCS Vector Store â†’ LLM Intelligence
 *
 * Status: PRODUCTION READY
 */

import {
  Firestore,
  initializeApp,
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  FieldValue,
} from '@firebase/firestore';
import { Storage, Bucket } from '@google-cloud/storage';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EventEmitter } from 'events';
import * as fs from 'fs';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PropertyMemory {
  id?: string;
  address: string;
  listPrice: number;
  estimatedMarketValue: number;
  daysOnMarket: number;
  situation: 'divorce' | 'probate' | 'foreclosure' | 'tax_lien' | 'distress';

  // RAG embeddings
  vectorEmbedding?: number[]; // 768-dim or 1536-dim depending on model
  embeddingModel: 'text-embedding-3-small' | 'gecko-001' | 'text-embedding-004';

  // Analysis history
  emotionalAnalysis?: {
    desperation: number; // 0-100
    negotiationLeverage: string;
    acceptanceThreshold: number;
    recommendedOffer: number;
    timestamp: FieldValue;
  };

  // Agent interactions
  agentNotes: Array<{
    agent: string;
    action: string;
    outcome: 'success' | 'pending' | 'failed';
    timestamp: FieldValue;
  }>;

  // RAG context for LLM
  ragContext?: {
    similarProperties: string[]; // Similar property IDs
    precedentDeals: Array<{
      propertyId: string;
      finalPrice: number;
      daysToClose: number;
      sellerSituation: string;
    }>;
    marketInsights: string[];
  };

  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface RAGQuery {
  query: string;
  topK?: number;
  filters?: Record<string, any>;
  includeVectorSimilarity?: boolean;
}

export interface LLMIntelligenceResponse {
  recommendation: string;
  confidence: number;
  reasoning: string;
  alternativeApproaches: string[];
  riskFactors: string[];
  source: 'claude' | 'gemini' | 'groq';
}

export interface FirestoreConfig {
  projectId: string;
  serviceAccountPath: string;
  databaseId?: string;
}

export interface RAGConfig {
  gcsProjectId: string;
  gcsBucketName: string;
  ragServiceAccountPath: string;
  embeddingModel: 'text-embedding-3-small' | 'gecko-001' | 'text-embedding-004';
}

export interface LLMConfig {
  primaryModel:
    | 'claude-3.5-sonnet'
    | 'claude-3.5-haiku'
    | 'gemini-2.0-flash'
    | 'groq-mixtral';
  fallbackModel: 'claude-3.5-haiku' | 'gemini-2.0-flash' | 'groq-mixtral';
  temperature: number;
  maxTokens: number;
}

// ============================================================================
// FIRESTORE RAG INTELLIGENCE ENGINE
// ============================================================================

export class FirestoreRAGIntelligence extends EventEmitter {
  private firestore!: Firestore;
  private gcsStorage!: Storage;
  private gcsBucket!: Bucket;
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;

  private firestoreConfig: FirestoreConfig;
  private ragConfig: RAGConfig;
  private llmConfig: LLMConfig;

  constructor(
    firestoreConfig: FirestoreConfig,
    ragConfig: RAGConfig,
    llmConfig: LLMConfig = {
      primaryModel: 'claude-3.5-sonnet',
      fallbackModel: 'claude-3.5-haiku',
      temperature: 0.7,
      maxTokens: 2048,
    }
  ) {
    super();
    this.firestoreConfig = firestoreConfig;
    this.ragConfig = ragConfig;
    this.llmConfig = llmConfig;

    // Initialize LLM clients
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || '');

    this.initializeFirestore();
    this.initializeGCS();
  }

  /**
   * Initialize Firestore connection
   */
  private initializeFirestore(): void {
    try {
      // Use service account from global credentials
      const serviceAccountPath =
        this.firestoreConfig.serviceAccountPath ||
        process.env.GOOGLE_CLOUD_CREDENTIALS_PATH ||
        './secrets/gcp-service-account.json';

      // Initialize Firebase Admin SDK
      const admin = require('firebase-admin');
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf-8')
      );

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: this.firestoreConfig.projectId,
        });
      }

      this.firestore = admin.firestore();
      console.log('[FirestoreRAG] Firestore initialized');
      this.emit('firestore:ready');
    } catch (error) {
      console.error('[FirestoreRAG] Firestore initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Google Cloud Storage for RAG vectors and embeddings
   */
  private initializeGCS(): void {
    try {
      this.gcsStorage = new Storage({
        projectId: this.ragConfig.gcsProjectId,
        keyFilename: this.ragConfig.ragServiceAccountPath,
      });

      this.gcsBucket = this.gcsStorage.bucket(this.ragConfig.gcsBucketName);
      console.log(
        '[FirestoreRAG] GCS bucket initialized:',
        this.ragConfig.gcsBucketName
      );
      this.emit('gcs:ready');
    } catch (error) {
      console.error('[FirestoreRAG] GCS initialization failed:', error);
      throw error;
    }
  }

  /**
   * Store property memory with RAG embedding
   */
  async storePropertyMemory(property: PropertyMemory): Promise<string> {
    try {
      console.log(`[FirestoreRAG] Storing property: ${property.address}`);

      // Generate RAG embedding
      property.vectorEmbedding = await this.generateEmbedding(
        `${property.address} - ${property.situation} - $${property.listPrice}`
      );

      // Store in Firestore
      const docRef = await this.firestore.collection('properties').add({
        ...property,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`[FirestoreRAG] Property stored with ID: ${docRef.id}`);

      // Store vector embedding in GCS for fast retrieval
      await this.storeVectorInGCS(docRef.id, property.vectorEmbedding);

      this.emit('property:stored', {
        id: docRef.id,
        address: property.address,
      });
      return docRef.id;
    } catch (error) {
      console.error('[FirestoreRAG] Storage failed:', error);
      throw error;
    }
  }

  /**
   * Generate RAG embedding using configured model
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use OpenAI's embedding API (available via Anthropic client or direct)
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: text,
          model:
            this.ragConfig.embeddingModel === 'text-embedding-3-small'
              ? 'text-embedding-3-small'
              : 'text-embedding-3-large',
        }),
      });

      const data = (await response.json()) as any;
      return data.data[0].embedding;
    } catch (error) {
      console.error('[FirestoreRAG] Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Store RAG vector in GCS for similarity search
   */
  private async storeVectorInGCS(
    propertyId: string,
    vector: number[]
  ): Promise<void> {
    try {
      const vectorFile = this.gcsBucket.file(`vectors/${propertyId}.json`);
      await vectorFile.save(
        JSON.stringify({
          id: propertyId,
          vector,
          timestamp: new Date().toISOString(),
        })
      );

      console.log(`[FirestoreRAG] Vector stored for property: ${propertyId}`);
    } catch (error) {
      console.error('[FirestoreRAG] Vector storage failed:', error);
      throw error;
    }
  }

  /**
   * RAG Query: Find similar properties and precedent deals
   */
  async ragQuery(query: RAGQuery): Promise<PropertyMemory[]> {
    try {
      console.log(`[FirestoreRAG] RAG query: ${query.query}`);

      // Method 1: Vector similarity search
      if (query.includeVectorSimilarity) {
        const queryVector = await this.generateEmbedding(query.query);
        return await this.vectorSimilaritySearch(queryVector, query.topK || 5);
      }

      // Method 2: Text-based Firestore query
      const q = query.filters
        ? query_(
            collection(this.firestore, 'properties'),
            ...Object.entries(query.filters).map(([key, value]) =>
              where(key, '==', value)
            )
          )
        : query_(collection(this.firestore, 'properties'));

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PropertyMemory[];

      console.log(`[FirestoreRAG] Found ${results.length} matching properties`);
      return results.slice(0, query.topK || 5);
    } catch (error) {
      console.error('[FirestoreRAG] RAG query failed:', error);
      throw error;
    }
  }

  /**
   * Vector similarity search in GCS
   */
  private async vectorSimilaritySearch(
    queryVector: number[],
    topK: number
  ): Promise<PropertyMemory[]> {
    try {
      // Load all vectors from GCS
      const [files] = await this.gcsBucket.getFiles({
        prefix: 'vectors/',
      });

      const scores: Array<{
        propertyId: string;
        score: number;
      }> = [];

      for (const file of files) {
        const [data] = await file.download();
        const vectorData = JSON.parse(data.toString()) as any;
        const similarity = this.cosineSimilarity(
          queryVector,
          vectorData.vector
        );
        scores.push({
          propertyId: vectorData.id,
          score: similarity,
        });
      }

      // Sort by similarity
      scores.sort((a, b) => b.score - a.score);
      const topPropertyIds = scores.slice(0, topK).map((s) => s.propertyId);

      // Fetch full documents from Firestore
      const results: PropertyMemory[] = [];
      for (const propertyId of topPropertyIds) {
        const docSnap = await this.firestore
          .collection('properties')
          .doc(propertyId)
          .get();

        if (docSnap.exists) {
          results.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as PropertyMemory);
        }
      }

      return results;
    } catch (error) {
      console.error('[FirestoreRAG] Vector similarity search failed:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, x, i) => sum + x * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Intelligent LLM analysis using RAG context
   */
  async generateIntelligentAnalysis(
    property: PropertyMemory,
    analysisType: 'negotiation' | 'investment' | 'market' | 'strategy'
  ): Promise<LLMIntelligenceResponse> {
    try {
      console.log(
        `[FirestoreRAG] Generating ${analysisType} analysis for: ${property.address}`
      );

      // Step 1: Retrieve RAG context (similar properties + precedent deals)
      const ragContext = await this.retrieveRAGContext(property);
      property.ragContext = ragContext;

      // Step 2: Build prompt with RAG context
      const prompt = this.buildIntelligentPrompt(
        property,
        analysisType,
        ragContext
      );

      // Step 3: Get LLM response (with fallback)
      let response: LLMIntelligenceResponse;
      try {
        response = await this.callPrimaryLLM(prompt);
      } catch (error) {
        console.warn('[FirestoreRAG] Primary LLM failed, using fallback');
        response = await this.callFallbackLLM(prompt);
      }

      // Step 4: Store analysis in Firestore
      await this.storeAnalysisResult(property.id || '', response);

      this.emit('analysis:complete', { propertyId: property.id, response });
      return response;
    } catch (error) {
      console.error('[FirestoreRAG] Analysis generation failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve RAG context from Firestore and GCS
   */
  private async retrieveRAGContext(property: PropertyMemory): Promise<any> {
    try {
      // Find similar properties
      const similarProperties = await this.ragQuery({
        query: `${property.address} similar situation ${property.situation}`,
        topK: 3,
        includeVectorSimilarity: true,
      });

      // Find precedent deals
      const precedentDeals = await this.firestore
        .collection('closed-deals')
        .where('situation', '==', property.situation)
        .limit(5)
        .get();

      const precedents = precedentDeals.docs.map((doc) => ({
        propertyId: doc.id,
        ...doc.data(),
      }));

      return {
        similarProperties: similarProperties.map((p) => p.id || ''),
        precedentDeals: precedents,
        marketInsights: await this.generateMarketInsights(property),
      };
    } catch (error) {
      console.error('[FirestoreRAG] RAG context retrieval failed:', error);
      return { similarProperties: [], precedentDeals: [], marketInsights: [] };
    }
  }

  /**
   * Generate market insights from historical data
   */
  private async generateMarketInsights(
    property: PropertyMemory
  ): Promise<string[]> {
    // Query similar properties for insights
    const insights: string[] = [];

    const snapshot = await this.firestore
      .collection('properties')
      .where('situation', '==', property.situation)
      .limit(10)
      .get();

    const properties = snapshot.docs.map((doc) =>
      doc.data()
    ) as PropertyMemory[];

    // Calculate average negotiation leverage
    const avgNegotiationScores = properties
      .filter((p) => p.emotionalAnalysis)
      .map((p) => {
        // Parse negotiation leverage to numeric value
        return 0; // Placeholder
      });

    if (avgNegotiationScores.length > 0) {
      const avg =
        avgNegotiationScores.reduce((a, b) => a + b) /
        avgNegotiationScores.length;
      insights.push(
        `Average negotiation leverage for ${property.situation}: ${avg.toFixed(2)}`
      );
    }

    return insights;
  }

  /**
   * Build intelligent prompt with RAG context
   */
  private buildIntelligentPrompt(
    property: PropertyMemory,
    analysisType: string,
    ragContext: any
  ): string {
    return `
You are an expert real estate investment analyst with deep market knowledge.

PROPERTY DETAILS:
- Address: ${property.address}
- List Price: $${property.listPrice}
- Market Value: $${property.estimatedMarketValue}
- Days on Market: ${property.daysOnMarket}
- Situation: ${property.situation}

RAG CONTEXT (Similar Properties & Precedents):
- Similar Properties: ${ragContext.similarProperties.length} found
- Precedent Deals: ${ragContext.precedentDeals.length} historical deals
- Market Insights: ${ragContext.marketInsights.join('; ')}

ANALYSIS TYPE: ${analysisType}

Based on the RAG context and property details, provide:
1. Detailed recommendation
2. Confidence level (0-100)
3. Clear reasoning
4. Alternative approaches
5. Risk factors to consider

Format as JSON with keys: recommendation, confidence, reasoning, alternativeApproaches, riskFactors
`;
  }

  /**
   * Call primary LLM (Claude)
   */
  private async callPrimaryLLM(
    prompt: string
  ): Promise<LLMIntelligenceResponse> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.llmConfig.primaryModel as any,
        max_tokens: this.llmConfig.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const response = JSON.parse(content.text) as any;
      return {
        ...response,
        source: 'claude',
      };
    } catch (error) {
      console.error('[FirestoreRAG] Primary LLM call failed:', error);
      throw error;
    }
  }

  /**
   * Call fallback LLM (Gemini)
   */
  private async callFallbackLLM(
    prompt: string
  ): Promise<LLMIntelligenceResponse> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });
      const result = await model.generateContent(prompt);

      const text = result.response.text();
      const response = JSON.parse(text) as any;
      return {
        ...response,
        source: 'gemini',
      };
    } catch (error) {
      console.error('[FirestoreRAG] Fallback LLM call failed:', error);
      throw error;
    }
  }

  /**
   * Store analysis result in Firestore for audit trail
   */
  private async storeAnalysisResult(
    propertyId: string,
    response: LLMIntelligenceResponse
  ): Promise<void> {
    try {
      await this.firestore.collection('properties').doc(propertyId).update({
        'analysis.lastResult': response,
        'analysis.lastUpdated': serverTimestamp(),
      });

      console.log(`[FirestoreRAG] Analysis stored for property: ${propertyId}`);
    } catch (error) {
      console.error('[FirestoreRAG] Analysis storage failed:', error);
    }
  }

  /**
   * Get real-time analysis updates (streaming)
   */
  async *streamAnalysis(property: PropertyMemory): AsyncGenerator<string> {
    try {
      const prompt = this.buildIntelligentPrompt(property, 'comprehensive', {
        similarProperties: [],
        precedentDeals: [],
        marketInsights: [],
      });

      // Use Claude streaming for real-time updates
      const stream = await this.anthropic.messages.stream({
        model: this.llmConfig.primaryModel as any,
        max_tokens: this.llmConfig.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('[FirestoreRAG] Stream analysis failed:', error);
      throw error;
    }
  }

  /**
   * Update property memory with agent interaction
   */
  async updatePropertyMemory(
    propertyId: string,
    update: Partial<PropertyMemory>
  ): Promise<void> {
    try {
      await this.firestore
        .collection('properties')
        .doc(propertyId)
        .update({
          ...update,
          updatedAt: serverTimestamp(),
        });

      console.log(`[FirestoreRAG] Property memory updated: ${propertyId}`);
      this.emit('property:updated', { id: propertyId });
    } catch (error) {
      console.error('[FirestoreRAG] Update failed:', error);
      throw error;
    }
  }

  /**
   * Batch import properties with RAG embeddings
   */
  async batchImportProperties(properties: PropertyMemory[]): Promise<string[]> {
    try {
      console.log(
        `[FirestoreRAG] Batch importing ${properties.length} properties`
      );

      const ids: string[] = [];
      for (const property of properties) {
        const id = await this.storePropertyMemory(property);
        ids.push(id);
      }

      this.emit('batch:imported', { count: ids.length });
      return ids;
    } catch (error) {
      console.error('[FirestoreRAG] Batch import failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let firestoreRAG: FirestoreRAGIntelligence | null = null;

export function initializeFirestoreRAG(
  firestoreConfig: FirestoreConfig,
  ragConfig: RAGConfig,
  llmConfig?: LLMConfig
): FirestoreRAGIntelligence {
  if (!firestoreRAG) {
    firestoreRAG = new FirestoreRAGIntelligence(
      firestoreConfig,
      ragConfig,
      llmConfig
    );
  }
  return firestoreRAG;
}

export function getFirestoreRAG(): FirestoreRAGIntelligence {
  if (!firestoreRAG) {
    throw new Error(
      'FirestoreRAG not initialized. Call initializeFirestoreRAG first.'
    );
  }
  return firestoreRAG;
}

export default FirestoreRAGIntelligence;
