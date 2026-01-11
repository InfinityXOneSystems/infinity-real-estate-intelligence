/**
 * Firestore Memory Layer - Distributed Context Storage
 *
 * Replaces PostgreSQL with Firestore for:
 * - Real-time conversation context
 * - Seller psychology profiles
 * - Agent decision history
 * - Property analysis results
 * - RAG-indexed embeddings
 *
 * @package memory
 * @author JARVIS
 * @version 1.0.0
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import {
  getFirestore,
  Firestore,
  DocumentData,
  QueryConstraint,
  query,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase-admin/firestore';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs';
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
  defaultMeta: { service: 'firestore-memory' },
  transports: [
    new winston.transports.File({
      filename: 'logs/firestore-memory.log',
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

export interface MemoryDocument {
  id?: string;
  type: string; // 'seller', 'property', 'agent', 'outcome', 'conversation'
  timestamp: Timestamp;
  data: DocumentData;
  embedding?: number[]; // For RAG retrieval
  tags?: string[];
}

export interface SellerMemory extends MemoryDocument {
  type: 'seller';
  data: {
    name: string;
    address: string;
    situation: string;
    psychologicalProfile: DocumentData;
    negotiationHistory: Array<{
      date: string;
      offer: number;
      response: string;
      reasoning: string;
    }>;
    outcomes: Array<{
      dealClosed: boolean;
      finalPrice: number;
      timeToClose: number;
      agentPerformance: number;
    }>;
  };
}

export interface PropertyMemory extends MemoryDocument {
  type: 'property';
  data: {
    address: string;
    zipCode: string;
    listPrice: number;
    estimatedValue: number;
    distressFactors: DocumentData;
    heatmapIntensity: number;
    predictions: DocumentData;
    crawlResults: DocumentData[];
  };
}

export interface AgentMemory extends MemoryDocument {
  type: 'agent';
  data: {
    agentName: string;
    successRate: number;
    totalDeals: number;
    closedDeals: number;
    avgNegotiationTime: number;
    specializations: string[];
    performanceMetrics: DocumentData;
    recentActions: Array<{
      timestamp: string;
      action: string;
      result: string;
    }>;
  };
}

export interface OutcomeMemory extends MemoryDocument {
  type: 'outcome';
  data: {
    scenarioId: string;
    situation: string;
    strategy: string;
    result: 'success' | 'failure' | 'partial';
    details: DocumentData;
    feedback: string;
    learnings: string[];
  };
}

export interface ConversationMemory extends MemoryDocument {
  type: 'conversation';
  data: {
    participantId: string;
    topic: string;
    messages: Array<{
      role: 'user' | 'assistant' | 'agent';
      content: string;
      timestamp: string;
    }>;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyDecisions: string[];
    nextSteps: string[];
  };
}

// ============================================================================
// FIRESTORE MEMORY MANAGER
// ============================================================================

export class FirestoreMemory extends EventEmitter {
  private db: Firestore;
  private isInitialized: boolean = false;
  private cacheMap: Map<string, MemoryDocument> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor() {
    super();
    this.initialize();
  }

  /**
   * Initialize Firestore with service account
   */
  private initialize(): void {
    try {
      const credentialPath =
        process.env.GCP_SERVICE_ACCOUNT_KEY_PATH ||
        './secrets/gcp-service-account.json';
      const projectId = process.env.GCP_PROJECT_ID || 'infinity-x-one-systems';

      let serviceAccount: ServiceAccount;

      // Try to load from file first
      if (fs.existsSync(credentialPath)) {
        const credentialFile = fs.readFileSync(credentialPath, 'utf-8');
        serviceAccount = JSON.parse(credentialFile) as ServiceAccount;
      } else {
        // Fallback: construct from environment variables
        serviceAccount = {
          projectId: projectId,
          clientEmail:
            process.env.GCP_SERVICE_ACCOUNT_EMAIL ||
            'real-estate-intelligence@infinity-x-one-systems.iam.gserviceaccount.com',
          privateKey: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as ServiceAccount;
      }

      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
      });

      this.db = getFirestore(app);
      this.isInitialized = true;

      logger.info('Firestore initialized successfully', {
        projectId,
        email: serviceAccount.clientEmail,
      });

      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize Firestore', { error });
      throw error;
    }
  }

  /**
   * Store seller context
   */
  async storeSeller(sellerData: SellerMemory['data']): Promise<string> {
    const collectionRef = collection(this.db, 'sellers');
    const docRef = await addDoc(collectionRef, {
      ...sellerData,
      timestamp: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    this.cacheMap.set(docRef.id, {
      id: docRef.id,
      type: 'seller',
      data: sellerData,
      timestamp: Timestamp.now(),
    });
    logger.info('Seller stored', { id: docRef.id, name: sellerData.name });
    return docRef.id;
  }

  /**
   * Store property with predictions
   */
  async storeProperty(propertyData: PropertyMemory['data']): Promise<string> {
    const collectionRef = collection(this.db, 'properties');
    const docRef = await addDoc(collectionRef, {
      ...propertyData,
      timestamp: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    this.cacheMap.set(docRef.id, {
      id: docRef.id,
      type: 'property',
      data: propertyData,
      timestamp: Timestamp.now(),
    });
    logger.info('Property stored', {
      id: docRef.id,
      address: propertyData.address,
    });
    return docRef.id;
  }

  /**
   * Store agent performance data
   */
  async storeAgentMetrics(agentData: AgentMemory['data']): Promise<string> {
    const collectionRef = collection(this.db, 'agents');
    const docRef = await addDoc(collectionRef, {
      ...agentData,
      timestamp: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    logger.info('Agent metrics stored', {
      id: docRef.id,
      agent: agentData.agentName,
    });
    return docRef.id;
  }

  /**
   * Store outcome for learning
   */
  async storeOutcome(outcomeData: OutcomeMemory['data']): Promise<string> {
    const collectionRef = collection(this.db, 'outcomes');
    const docRef = await addDoc(collectionRef, {
      ...outcomeData,
      timestamp: Timestamp.now(),
    });
    logger.info('Outcome stored', {
      id: docRef.id,
      scenario: outcomeData.scenarioId,
    });
    return docRef.id;
  }

  /**
   * Store conversation with sentiment
   */
  async storeConversation(
    conversationData: ConversationMemory['data']
  ): Promise<string> {
    const collectionRef = collection(this.db, 'conversations');
    const docRef = await addDoc(collectionRef, {
      ...conversationData,
      timestamp: Timestamp.now(),
    });
    logger.info('Conversation stored', {
      id: docRef.id,
      topic: conversationData.topic,
    });
    return docRef.id;
  }

  /**
   * Retrieve seller by ID
   */
  async getSeller(sellerId: string): Promise<SellerMemory['data'] | null> {
    if (this.cacheMap.has(sellerId)) {
      return this.cacheMap.get(sellerId)?.data as SellerMemory['data'];
    }

    const docRef = doc(this.db, 'sellers', sellerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SellerMemory['data'];
      this.cacheMap.set(sellerId, {
        id: sellerId,
        type: 'seller',
        data,
        timestamp: Timestamp.now(),
      });
      return data;
    }
    return null;
  }

  /**
   * Query sellers by situation
   */
  async querySellersBySituation(
    situation: string,
    limitTo: number = 10
  ): Promise<SellerMemory[]> {
    const q = query(
      collection(this.db, 'sellers'),
      where('situation', '==', situation),
      orderBy('timestamp', 'desc'),
      limit(limitTo)
    );

    const querySnapshot = await getDocs(q);
    const results: SellerMemory[] = [];

    querySnapshot.forEach((docSnapshot) => {
      results.push({
        id: docSnapshot.id,
        type: 'seller',
        data: docSnapshot.data() as SellerMemory['data'],
        timestamp: docSnapshot.data().timestamp,
      });
    });

    return results;
  }

  /**
   * Query properties by ZIP code
   */
  async getPropertiesByZipCode(
    zipCode: string,
    limitTo: number = 20
  ): Promise<PropertyMemory[]> {
    const q = query(
      collection(this.db, 'properties'),
      where('zipCode', '==', zipCode),
      orderBy('heatmapIntensity', 'desc'),
      limit(limitTo)
    );

    const querySnapshot = await getDocs(q);
    const results: PropertyMemory[] = [];

    querySnapshot.forEach((docSnapshot) => {
      results.push({
        id: docSnapshot.id,
        type: 'property',
        data: docSnapshot.data() as PropertyMemory['data'],
        timestamp: docSnapshot.data().timestamp,
      });
    });

    return results;
  }

  /**
   * Get top performing agents
   */
  async getTopAgents(limitTo: number = 5): Promise<AgentMemory[]> {
    const q = query(
      collection(this.db, 'agents'),
      orderBy('successRate', 'desc'),
      limit(limitTo)
    );

    const querySnapshot = await getDocs(q);
    const results: AgentMemory[] = [];

    querySnapshot.forEach((docSnapshot) => {
      results.push({
        id: docSnapshot.id,
        type: 'agent',
        data: docSnapshot.data() as AgentMemory['data'],
        timestamp: docSnapshot.data().timestamp,
      });
    });

    return results;
  }

  /**
   * Query successful outcomes
   */
  async getSuccessfulOutcomes(
    situation: string,
    limitTo: number = 10
  ): Promise<OutcomeMemory[]> {
    const q = query(
      collection(this.db, 'outcomes'),
      where('situation', '==', situation),
      where('result', '==', 'success'),
      orderBy('timestamp', 'desc'),
      limit(limitTo)
    );

    const querySnapshot = await getDocs(q);
    const results: OutcomeMemory[] = [];

    querySnapshot.forEach((docSnapshot) => {
      results.push({
        id: docSnapshot.id,
        type: 'outcome',
        data: docSnapshot.data() as OutcomeMemory['data'],
        timestamp: docSnapshot.data().timestamp,
      });
    });

    return results;
  }

  /**
   * Update seller psychology
   */
  async updateSellerPsychology(
    sellerId: string,
    psychologyData: DocumentData
  ): Promise<void> {
    const docRef = doc(this.db, 'sellers', sellerId);
    await updateDoc(docRef, {
      psychologicalProfile: psychologyData,
      updatedAt: Timestamp.now(),
    });
    this.cacheMap.delete(sellerId);
    logger.info('Seller psychology updated', { id: sellerId });
  }

  /**
   * Store RAG embedding for retrieval
   */
  async storeEmbedding(
    collectionName: string,
    docId: string,
    embedding: number[],
    metadata: DocumentData
  ): Promise<void> {
    const docRef = doc(this.db, collectionName, docId);
    await updateDoc(docRef, {
      embedding,
      embeddingMetadata: metadata,
      embeddingTimestamp: Timestamp.now(),
    });
    logger.info('Embedding stored', { collection: collectionName, id: docId });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testRef = doc(this.db, 'health', 'status');
      await updateDoc(testRef, { lastCheck: Timestamp.now() });
      return true;
    } catch (error) {
      logger.error('Health check failed', { error });
      return false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const firestoreMemory = new FirestoreMemory();
