/**
 * AI Voice System - Sol Quality Voice for Real Estate Intelligence
 * Handles inbound/outbound calls, appointment setting, Q&A orchestration
 * Using ElevenLabs for voice synthesis and Google Speech-to-Text for recognition
 */

import { ElevenLabsClient } from 'elevenlabs-node';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as twilio from 'twilio';
import * as dotenv from 'dotenv';

dotenv.config();

interface VoiceConfig {
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

interface CallSession {
  callSid: string;
  phoneNumber: string;
  propertyId?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  intent?: 'inquiry' | 'appointment' | 'information' | 'complaint';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface AppointmentRequest {
  phoneNumber: string;
  propertyId: string;
  preferredDate: Date;
  preferredTime: string;
  visitorName: string;
  visitorEmail?: string;
}

export class AIVoiceSystem {
  private elevenLabs: ElevenLabsClient;
  private speechClient: SpeechClient;
  private ttsClient: TextToSpeechClient;
  private twilioClient: twilio.Twilio;
  private activeSessions: Map<string, CallSession>;
  private solVoiceConfig: VoiceConfig;

  constructor() {
    // Initialize ElevenLabs with Sol-quality voice
    this.elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY || '',
    });

    // Initialize Google Cloud Speech services
    this.speechClient = new SpeechClient({
      keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
    });

    this.ttsClient = new TextToSpeechClient({
      keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
    });

    // Initialize Twilio for phone calls
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID || '',
      process.env.TWILIO_AUTH_TOKEN || ''
    );

    this.activeSessions = new Map();

    // Sol-quality voice configuration
    this.solVoiceConfig = {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah (professional female voice)
      model: 'eleven_turbo_v2_5', // Fastest, lowest latency
      stability: 0.71,
      similarityBoost: 0.5,
      style: 0.3,
      useSpeakerBoost: true,
    };
  }

  /**
   * Make outbound call to potential buyer/seller
   */
  async makeOutboundCall(
    phoneNumber: string,
    propertyId: string,
    script: string
  ): Promise<string> {
    try {
      const call = await this.twilioClient.calls.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER || '',
        url: `${process.env.BASE_URL}/api/voice/outbound-script?propertyId=${propertyId}`,
        statusCallback: `${process.env.BASE_URL}/api/voice/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
      });

      console.log(`âœ“ Outbound call initiated: ${call.sid}`);

      this.activeSessions.set(call.sid, {
        callSid: call.sid,
        phoneNumber,
        propertyId,
        conversationHistory: [
          {
            role: 'assistant',
            content: script,
            timestamp: new Date(),
          },
        ],
      });

      return call.sid;
    } catch (error) {
      console.error('Failed to make outbound call:', error);
      throw error;
    }
  }

  /**
   * Handle inbound call
   */
  async handleInboundCall(callSid: string, from: string): Promise<CallSession> {
    const session: CallSession = {
      callSid,
      phoneNumber: from,
      conversationHistory: [],
    };

    this.activeSessions.set(callSid, session);

    // Initial greeting
    const greeting = await this.generateResponse(
      'Hello! This is the Real Estate Intelligence system. How can I help you today?',
      session
    );

    return session;
  }

  /**
   * Process voice input and generate response
   */
  async processVoiceInput(
    callSid: string,
    audioBuffer: Buffer
  ): Promise<{ text: string; audio: Buffer; intent: string }> {
    const session = this.activeSessions.get(callSid);
    if (!session) {
      throw new Error('Session not found');
    }

    // Speech-to-Text
    const transcription = await this.transcribeAudio(audioBuffer);

    // Add to conversation history
    session.conversationHistory.push({
      role: 'user',
      content: transcription,
      timestamp: new Date(),
    });

    // Detect intent and sentiment
    const { intent, sentiment } = await this.analyzeIntent(transcription);
    session.intent = intent;
    session.sentiment = sentiment;

    // Generate intelligent response
    const responseText = await this.generateIntelligentResponse(
      transcription,
      session
    );

    // Text-to-Speech with Sol-quality voice
    const responseAudio = await this.synthesizeVoice(responseText);

    session.conversationHistory.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    });

    return {
      text: responseText,
      audio: responseAudio,
      intent,
    };
  }

  /**
   * Transcribe audio to text using Google Speech-to-Text
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const [response] = await this.speechClient.recognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'phone_call',
          useEnhanced: true,
        },
        audio: {
          content: audioBuffer.toString('base64'),
        },
      });

      const transcription =
        response.results
          ?.map((result) => result.alternatives?.[0]?.transcript)
          .join(' ') || '';

      return transcription;
    } catch (error) {
      console.error('Transcription failed:', error);
      return '';
    }
  }

  /**
   * Synthesize speech using ElevenLabs (Sol quality)
   */
  private async synthesizeVoice(text: string): Promise<Buffer> {
    try {
      const audio = await this.elevenLabs.textToSpeech({
        voiceId: this.solVoiceConfig.voiceId,
        text,
        modelId: this.solVoiceConfig.model,
        voiceSettings: {
          stability: this.solVoiceConfig.stability,
          similarity_boost: this.solVoiceConfig.similarityBoost,
          style: this.solVoiceConfig.style,
          use_speaker_boost: this.solVoiceConfig.useSpeakerBoost,
        },
      });

      return Buffer.from(audio);
    } catch (error) {
      console.error('Voice synthesis failed:', error);
      // Fallback to Google TTS
      return this.fallbackTTS(text);
    }
  }

  /**
   * Fallback to Google Text-to-Speech
   */
  private async fallbackTTS(text: string): Promise<Buffer> {
    const [response] = await this.ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F', // High-quality female voice
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        pitch: 0,
        speakingRate: 1.0,
      },
    });

    return Buffer.from(response.audioContent as Uint8Array);
  }

  /**
   * Analyze user intent and sentiment
   */
  private async analyzeIntent(text: string): Promise<{
    intent: 'inquiry' | 'appointment' | 'information' | 'complaint';
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    // Simple keyword-based intent detection (can be enhanced with AI)
    const lowerText = text.toLowerCase();

    let intent: 'inquiry' | 'appointment' | 'information' | 'complaint' =
      'inquiry';

    if (lowerText.match(/schedule|appointment|visit|see|tour/)) {
      intent = 'appointment';
    } else if (lowerText.match(/complaint|problem|issue|unhappy/)) {
      intent = 'complaint';
    } else if (lowerText.match(/information|details|tell me|know about/)) {
      intent = 'information';
    }

    // Sentiment analysis (simple)
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

    if (lowerText.match(/great|excellent|love|perfect|wonderful/)) {
      sentiment = 'positive';
    } else if (lowerText.match(/bad|terrible|awful|hate|disappointed/)) {
      sentiment = 'negative';
    }

    return { intent, sentiment };
  }

  /**
   * Generate intelligent response using context and AI
   */
  private async generateIntelligentResponse(
    userInput: string,
    session: CallSession
  ): Promise<string> {
    // This would integrate with UnifiedAIClient for intelligent responses
    // For now, using rule-based responses

    const { intent } = await this.analyzeIntent(userInput);

    switch (intent) {
      case 'appointment':
        return "I'd be happy to schedule a property tour for you. What date and time works best?";

      case 'information':
        if (session.propertyId) {
          return `Let me pull up the details for property ${session.propertyId}. It's a beautiful property in an excellent location.`;
        }
        return 'What property are you interested in learning more about?';

      case 'complaint':
        return "I'm sorry to hear you're experiencing an issue. Let me connect you with our support team who can help resolve this.";

      default:
        return 'How can I assist you with your real estate needs today?';
    }
  }

  /**
   * Schedule appointment from voice interaction
   */
  async scheduleAppointment(request: AppointmentRequest): Promise<boolean> {
    try {
      // This will integrate with Google Calendar API
      console.log(`âœ“ Scheduling appointment for ${request.propertyId}`);
      console.log(`  Visitor: ${request.visitorName}`);
      console.log(`  Phone: ${request.phoneNumber}`);
      console.log(`  Date: ${request.preferredDate}`);
      console.log(`  Time: ${request.preferredTime}`);

      // Send confirmation SMS
      await this.twilioClient.messages.create({
        to: request.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER || '',
        body: `Appointment confirmed! Property tour scheduled for ${request.preferredDate.toDateString()} at ${request.preferredTime}. Reply CANCEL to cancel.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      return false;
    }
  }

  /**
   * Generate response for assistant
   */
  private async generateResponse(
    text: string,
    session: CallSession
  ): Promise<string> {
    session.conversationHistory.push({
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    });
    return text;
  }

  /**
   * End call session
   */
  async endSession(callSid: string): Promise<void> {
    const session = this.activeSessions.get(callSid);
    if (session) {
      console.log(`Call ended: ${callSid}`);
      console.log(`Total exchanges: ${session.conversationHistory.length}`);
      // Save conversation to database for analytics
      this.activeSessions.delete(callSid);
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get session details
   */
  getSession(callSid: string): CallSession | undefined {
    return this.activeSessions.get(callSid);
  }
}

export default new AIVoiceSystem();
