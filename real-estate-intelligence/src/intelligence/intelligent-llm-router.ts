/**
 * Intelligent LLM Router - Multi-Model Orchestration
 *
 * Routes requests to optimal AI model:
 * - Claude 3.5 Sonnet (primary - best reasoning)
 * - Google Gemini 2.0 (multimodal - documents, images)
 * - Vertex AI (GCP-native, lowest latency)
 * - Fallback chain for resilience
 *
 * @package intelligence
 * @author JARVIS
 * @version 1.0.0
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { EventEmitter } from 'events';
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
  defaultMeta: { service: 'llm-router' },
  transports: [
    new winston.transports.File({
      filename: 'logs/llm-router.log',
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

export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  type: 'analysis' | 'reasoning' | 'multimodal' | 'fast' | 'creative';
  imageData?: string; // Base64 encoded image
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latency: number;
  confidence: number;
}

export interface ModelConfig {
  name: string;
  provider: string;
  priority: number;
  costPerMTok: number;
  latencyMs: number;
  capabilities: string[];
  isAvailable: boolean;
}

// ============================================================================
// INTELLIGENT LLM ROUTER
// ============================================================================

export class IntelligentLLMRouter extends EventEmitter {
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;
  private vertexAI: VertexAI;
  private modelStats: Map<
    string,
    { successes: number; failures: number; avgLatency: number }
  > = new Map();

  private models: ModelConfig[] = [
    {
      name: 'claude-3-5-sonnet',
      provider: 'anthropic',
      priority: 1,
      costPerMTok: 3.0,
      latencyMs: 2000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing'],
      isAvailable: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      name: 'gemini-2-0-pro',
      provider: 'google',
      priority: 2,
      costPerMTok: 1.5,
      latencyMs: 1500,
      capabilities: ['multimodal', 'vision', 'fast', 'analysis'],
      isAvailable: !!process.env.GOOGLE_GEMINI_KEY,
    },
    {
      name: 'claude-3-opus',
      provider: 'anthropic',
      priority: 3,
      costPerMTok: 15.0,
      latencyMs: 3000,
      capabilities: ['reasoning', 'complex-analysis'],
      isAvailable: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      name: 'gemini-pro',
      provider: 'google',
      priority: 4,
      costPerMTok: 0.5,
      latencyMs: 1200,
      capabilities: ['fast', 'analysis'],
      isAvailable: !!process.env.GOOGLE_GEMINI_KEY,
    },
  ];

  constructor() {
    super();
    this.initializeClients();
    this.initializeModelStats();
  }

  /**
   * Initialize all LLM clients
   */
  private initializeClients(): void {
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        logger.info('Anthropic client initialized');
      }

      if (process.env.GOOGLE_GEMINI_KEY) {
        this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
        logger.info('Google Gemini client initialized');
      }

      if (process.env.VERTEX_AI_API_KEY || process.env.GCP_PROJECT_ID) {
        this.vertexAI = new VertexAI({
          project: process.env.GCP_PROJECT_ID || 'infinity-x-one-systems',
          location: process.env.GCP_REGION || 'us-east1',
        });
        logger.info('Vertex AI client initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize LLM clients', { error });
    }
  }

  /**
   * Initialize model statistics
   */
  private initializeModelStats(): void {
    this.models.forEach((model) => {
      this.modelStats.set(model.name, {
        successes: 0,
        failures: 0,
        avgLatency: model.latencyMs,
      });
    });
  }

  /**
   * Select best model for request
   */
  private selectModel(request: LLMRequest): ModelConfig | null {
    const available = this.models.filter((m) => m.isAvailable);

    if (available.length === 0) {
      logger.warn('No LLM models available');
      return null;
    }

    // Route based on request type
    switch (request.type) {
      case 'multimodal':
        return (
          available.find((m) => m.capabilities.includes('multimodal')) ||
          available[0]
        );
      case 'fast':
        return available.sort((a, b) => a.latencyMs - b.latencyMs)[0];
      case 'reasoning':
        return (
          available.find((m) => m.capabilities.includes('reasoning')) ||
          available[0]
        );
      case 'analysis':
        return (
          available.find((m) => m.capabilities.includes('analysis')) ||
          available[0]
        );
      case 'creative':
        return (
          available.find((m) => m.capabilities.includes('writing')) ||
          available[0]
        );
      default:
        return available[0];
    }
  }

  /**
   * Route request to Claude
   */
  private async routeToClaude(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        system: this.buildSystemPrompt(request.context),
      });

      const latency = Date.now() - startTime;
      const tokensUsed =
        (response.usage?.input_tokens || 0) +
        (response.usage?.output_tokens || 0);

      this.recordSuccess('claude-3-5-sonnet', latency);

      return {
        content:
          response.content[0].type === 'text' ? response.content[0].text : '',
        model: 'claude-3-5-sonnet',
        tokensUsed,
        latency,
        confidence: 0.95,
      };
    } catch (error) {
      logger.error('Claude request failed', { error });
      this.recordFailure('claude-3-5-sonnet');
      throw error;
    }
  }

  /**
   * Route request to Gemini
   */
  private async routeToGemini(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-pro' });

      let content: any;

      if (request.imageData) {
        content = [
          { text: request.prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: request.imageData,
            },
          },
        ];
      } else {
        content = request.prompt;
      }

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: Array.isArray(content) ? content : [{ text: content }],
          },
        ],
      });

      const latency = Date.now() - startTime;
      const text = response.response.text();

      this.recordSuccess('gemini-2-0-pro', latency);

      return {
        content: text,
        model: 'gemini-2-0-pro',
        tokensUsed: (text.length / 4) * 1.3, // Approximate token count
        latency,
        confidence: 0.9,
      };
    } catch (error) {
      logger.error('Gemini request failed', { error });
      this.recordFailure('gemini-2-0-pro');
      throw error;
    }
  }

  /**
   * Route request to Vertex AI
   */
  private async routeToVertexAI(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.0-pro',
      });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: request.prompt }],
          },
        ],
      });

      const latency = Date.now() - startTime;
      const text =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      this.recordSuccess('vertex-ai', latency);

      return {
        content: text,
        model: 'vertex-ai-gemini-2.0',
        tokensUsed: (text.length / 4) * 1.3,
        latency,
        confidence: 0.92,
      };
    } catch (error) {
      logger.error('Vertex AI request failed', { error });
      this.recordFailure('vertex-ai');
      throw error;
    }
  }

  /**
   * Execute LLM request with fallback chain
   */
  async executeRequest(request: LLMRequest): Promise<LLMResponse> {
    this.emit('request:start', request);

    const selectedModel = this.selectModel(request);

    if (!selectedModel) {
      throw new Error('No LLM models available');
    }

    const fallbackChain = this.models
      .filter((m) => m.isAvailable)
      .sort((a, b) => a.priority - b.priority);

    for (const model of fallbackChain) {
      try {
        let response: LLMResponse;

        switch (model.provider) {
          case 'anthropic':
            response = await this.routeToClaude(request);
            break;
          case 'google':
            if (model.name.includes('vertex')) {
              response = await this.routeToVertexAI(request);
            } else {
              response = await this.routeToGemini(request);
            }
            break;
          default:
            continue;
        }

        logger.info('LLM request successful', {
          model: model.name,
          latency: response.latency,
          tokensUsed: response.tokensUsed,
        });

        this.emit('request:complete', response);
        return response;
      } catch (error) {
        logger.warn(`Model ${model.name} failed, trying next`, {
          error: (error as Error).message,
        });
        continue;
      }
    }

    throw new Error('All LLM models failed');
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context?: Record<string, any>): string {
    let systemPrompt = `You are an intelligent real estate analysis agent for Infinity X One Systems.
You have expertise in:
- Seller psychology and negotiation
- Real estate market analysis
- Investment property evaluation
- Distressed property identification
- Multi-agent coordination

Provide analysis that is:
- Data-driven
- Actionable
- Supported by historical patterns
- Aligned with agent specializations
`;

    if (context) {
      systemPrompt += `\n\nCurrent Context:\n${JSON.stringify(context, null, 2)}`;
    }

    return systemPrompt;
  }

  /**
   * Record successful execution
   */
  private recordSuccess(modelName: string, latency: number): void {
    const stats = this.modelStats.get(modelName);
    if (stats) {
      stats.successes++;
      stats.avgLatency = (stats.avgLatency + latency) / 2;
    }
  }

  /**
   * Record failed execution
   */
  private recordFailure(modelName: string): void {
    const stats = this.modelStats.get(modelName);
    if (stats) {
      stats.failures++;
    }
  }

  /**
   * Get model statistics
   */
  getModelStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    this.modelStats.forEach((value, key) => {
      const total = value.successes + value.failures;
      stats[key] = {
        successRate:
          total > 0 ? ((value.successes / total) * 100).toFixed(1) : 'N/A',
        totalRequests: total,
        avgLatency: value.avgLatency.toFixed(0) + 'ms',
      };
    });
    return stats;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const intelligentLLMRouter = new IntelligentLLMRouter();
