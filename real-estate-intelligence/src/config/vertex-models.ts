/**
 * Vertex AI Model Definitions & Configuration
 *
 * Defines available Google Cloud Vertex AI models and their configurations
 *
 * @package config
 * @author JARVIS
 * @version 1.0.0
 */

export interface VertexModel {
  name: string;
  displayName: string;
  description: string;
  capabilities: string[];
  modelType: 'text' | 'multimodal' | 'embedding' | 'code';
  maxInputTokens: number;
  maxOutputTokens: number;
  costPerMTok: {
    input: number;
    output: number;
  };
  latency: {
    p50: number; // median latency in ms
    p95: number; // 95th percentile
  };
  specializations: string[];
  recommended_for: string[];
}

/**
 * Available Vertex AI Models
 */

export const VERTEX_AI_MODELS: Record<string, VertexModel> = {
  // ============================================================================
  // GEMINI MODELS - Google's Advanced Models
  // ============================================================================
  'gemini-2-0-pro': {
    name: 'gemini-2-0-pro',
    displayName: 'Gemini 2.0 Pro',
    description:
      'Advanced reasoning and multimodal understanding with code execution',
    capabilities: [
      'text-generation',
      'vision',
      'code',
      'reasoning',
      'multimodal',
    ],
    modelType: 'multimodal',
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    costPerMTok: {
      input: 1.25,
      output: 5.0,
    },
    latency: {
      p50: 2000,
      p95: 4000,
    },
    specializations: [
      'complex-reasoning',
      'code-analysis',
      'document-understanding',
      'vision-analysis',
    ],
    recommended_for: [
      'seller-psychology-analysis',
      'contract-analysis',
      'document-processing',
      'image-analysis-of-properties',
      'complex-negotiation-scenarios',
    ],
  },

  'gemini-2-0-flash': {
    name: 'gemini-2-0-flash',
    displayName: 'Gemini 2.0 Flash',
    description:
      'Fast, efficient model for real-time applications and streaming',
    capabilities: ['text-generation', 'streaming', 'code', 'fast-inference'],
    modelType: 'text',
    maxInputTokens: 1000000,
    maxOutputTokens: 4096,
    costPerMTok: {
      input: 0.075,
      output: 0.3,
    },
    latency: {
      p50: 500,
      p95: 1000,
    },
    specializations: ['fast-responses', 'streaming', 'real-time-analysis'],
    recommended_for: [
      'quick-seller-assessment',
      'rapid-market-analysis',
      'real-time-chat',
      'fast-recommendation-generation',
      'streaming-responses',
    ],
  },

  'gemini-1-5-pro': {
    name: 'gemini-1-5-pro',
    displayName: 'Gemini 1.5 Pro',
    description:
      'Long-context understanding with excellent reasoning capabilities',
    capabilities: ['text-generation', 'long-context', 'reasoning'],
    modelType: 'text',
    maxInputTokens: 2000000,
    maxOutputTokens: 8192,
    costPerMTok: {
      input: 1.25,
      output: 5.0,
    },
    latency: {
      p50: 3000,
      p95: 5000,
    },
    specializations: ['long-document-analysis', 'complex-reasoning'],
    recommended_for: [
      'full-property-history-analysis',
      'comprehensive-market-reports',
      'multi-transaction-history-analysis',
      'document-comparison',
    ],
  },

  // ============================================================================
  // EMBEDDING MODELS
  // ============================================================================
  'text-embedding-004': {
    name: 'text-embedding-004',
    displayName: 'Text Embedding 004',
    description: 'High-quality embeddings for semantic search and RAG',
    capabilities: ['embedding', 'semantic-search'],
    modelType: 'embedding',
    maxInputTokens: 2048,
    maxOutputTokens: 768,
    costPerMTok: {
      input: 0.025,
      output: 0,
    },
    latency: {
      p50: 200,
      p95: 500,
    },
    specializations: [
      'rag-retrieval',
      'semantic-search',
      'similarity-matching',
    ],
    recommended_for: [
      'rag-context-embedding',
      'seller-similarity-search',
      'property-similarity-search',
      'agent-specialization-matching',
    ],
  },

  // ============================================================================
  // CODE MODELS
  // ============================================================================
  'code-gemma-7b': {
    name: 'code-gemma-7b',
    displayName: 'Code Gemma 7B',
    description: 'Specialized model for code generation and analysis',
    capabilities: ['code-generation', 'code-analysis', 'debugging'],
    modelType: 'code',
    maxInputTokens: 6144,
    maxOutputTokens: 8192,
    costPerMTok: {
      input: 0.075,
      output: 0.3,
    },
    latency: {
      p50: 1000,
      p95: 2000,
    },
    specializations: ['code-generation', 'smart-contract-analysis'],
    recommended_for: [
      'smart-contract-verification',
      'escrow-logic-analysis',
      'workflow-code-generation',
    ],
  },

  // ============================================================================
  // SPECIALIZED MODELS
  // ============================================================================
  'claude-3-5-sonnet': {
    name: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet (via Vertex)',
    description: "Anthropic's Claude 3.5 Sonnet accessible through Vertex AI",
    capabilities: ['text-generation', 'reasoning', 'analysis'],
    modelType: 'text',
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    costPerMTok: {
      input: 3.0,
      output: 15.0,
    },
    latency: {
      p50: 2000,
      p95: 3500,
    },
    specializations: ['complex-reasoning', 'nuanced-analysis'],
    recommended_for: [
      'psychological-analysis',
      'complex-negotiation-strategy',
      'seller-motivation-assessment',
    ],
  },
};

/**
 * Model Selection Strategy
 */

export const MODEL_SELECTION_STRATEGY = {
  // Quick responses - use Flash
  fast: {
    primary: 'gemini-2-0-flash',
    fallback: ['gemini-1-5-pro', 'claude-3-5-sonnet'],
  },

  // Complex reasoning - use Pro
  reasoning: {
    primary: 'gemini-2-0-pro',
    fallback: ['claude-3-5-sonnet', 'gemini-1-5-pro'],
  },

  // Very long context - use 1.5 Pro
  longContext: {
    primary: 'gemini-1-5-pro',
    fallback: ['gemini-2-0-pro', 'claude-3-5-sonnet'],
  },

  // Code generation - use Code Gemma
  codeGeneration: {
    primary: 'code-gemma-7b',
    fallback: ['gemini-2-0-pro', 'claude-3-5-sonnet'],
  },

  // Embeddings - use Text Embedding 004
  embedding: {
    primary: 'text-embedding-004',
    fallback: [],
  },

  // Seller psychology - use Claude for nuance
  sellerPsychology: {
    primary: 'claude-3-5-sonnet',
    fallback: ['gemini-2-0-pro', 'gemini-1-5-pro'],
  },

  // Market analysis - use Flash for speed
  marketAnalysis: {
    primary: 'gemini-2-0-flash',
    fallback: ['gemini-2-0-pro', 'gemini-1-5-pro'],
  },

  // Negotiation strategy - use Pro for reasoning
  negotiationStrategy: {
    primary: 'gemini-2-0-pro',
    fallback: ['claude-3-5-sonnet', 'gemini-1-5-pro'],
  },

  // Default - balanced
  default: {
    primary: 'gemini-2-0-pro',
    fallback: ['gemini-2-0-flash', 'claude-3-5-sonnet', 'gemini-1-5-pro'],
  },
};

/**
 * Batch Processing Configuration
 */

export const BATCH_PROCESSING = {
  embedding: {
    model: 'text-embedding-004',
    batchSize: 100,
    maxTimeoutMs: 30000,
    retryAttempts: 3,
  },

  analysis: {
    model: 'gemini-2-0-pro',
    batchSize: 10,
    maxTimeoutMs: 60000,
    retryAttempts: 2,
  },

  fastProcessing: {
    model: 'gemini-2-0-flash',
    batchSize: 50,
    maxTimeoutMs: 15000,
    retryAttempts: 3,
  },
};

/**
 * Cost Optimization Settings
 */

export const COST_OPTIMIZATION = {
  enableCaching: true,
  cacheTTLMinutes: 60,
  preferCheaperModels: true,
  budgetAlertThresholdDaily: 100, // dollars
  preferredModelForCost: 'gemini-2-0-flash',
};

/**
 * Helper function to get model by name
 */

export function getVertexModel(modelName: string): VertexModel | null {
  return VERTEX_AI_MODELS[modelName] || null;
}

/**
 * Helper function to get recommended model for use case
 */

export function getRecommendedModel(useCase: string): string {
  const strategy =
    MODEL_SELECTION_STRATEGY[useCase as keyof typeof MODEL_SELECTION_STRATEGY];
  return strategy?.primary || MODEL_SELECTION_STRATEGY.default.primary;
}

/**
 * Helper function to get fallback chain
 */

export function getModelFallbackChain(useCase: string): string[] {
  const strategy =
    MODEL_SELECTION_STRATEGY[useCase as keyof typeof MODEL_SELECTION_STRATEGY];
  const primary = strategy?.primary || MODEL_SELECTION_STRATEGY.default.primary;
  const fallbacks =
    strategy?.fallback || MODEL_SELECTION_STRATEGY.default.fallback;
  return [primary, ...fallbacks];
}

/**
 * Helper function to calculate estimated cost
 */

export function estimateCost(
  modelName: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = getVertexModel(modelName);
  if (!model) return 0;

  const inputCost = (inputTokens / 1000000) * model.costPerMTok.input;
  const outputCost = (outputTokens / 1000000) * model.costPerMTok.output;
  return inputCost + outputCost;
}

/**
 * Helper function to validate model name
 */

export function isValidVertexModel(modelName: string): boolean {
  return modelName in VERTEX_AI_MODELS;
}

/**
 * List all available models
 */

export function listAvailableModels(): VertexModel[] {
  return Object.values(VERTEX_AI_MODELS);
}

/**
 * Filter models by capability
 */

export function filterModelsByCapability(capability: string): VertexModel[] {
  return Object.values(VERTEX_AI_MODELS).filter((model) =>
    model.capabilities.includes(capability)
  );
}
