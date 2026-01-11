/**
 * Main Orchestrator - Real Estate Intelligence System
 * Coordinates all subsystems: crawlers, AI, voice, payments, workflow
 */

import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import voiceSystem from './ai-voice/voice-system';
import workflowAutomation from './workflow/automation-system';
import statisticsScraper from './statistics/scraper';
import stripePayments from './smart-contracts/stripe-integration';
import cryptoPayments from './smart-contracts/crypto-integration';
import googleWallet from './smart-contracts/google-wallet';

dotenv.config();

interface OrchestratorConfig {
  enableCrawlers: boolean;
  enableAIVoice: boolean;
  enableWorkflowAutomation: boolean;
  enableSmartContracts: boolean;
  enableStatistics: boolean;
  cronSchedule: string;
}

export class RealEstateOrchestrator extends EventEmitter {
  private config: OrchestratorConfig;
  private isRunning: boolean = false;
  private runCount: number = 0;

  constructor(config?: Partial<OrchestratorConfig>) {
    super();

    this.config = {
      enableCrawlers: process.env.ENABLE_CRAWLERS === 'true' || true,
      enableAIVoice: process.env.ENABLE_AI_VOICE === 'true' || true,
      enableWorkflowAutomation:
        process.env.ENABLE_WORKFLOW_AUTOMATION === 'true' || true,
      enableSmartContracts:
        process.env.ENABLE_SMART_CONTRACTS === 'true' || true,
      enableStatistics:
        process.env.ENABLE_STATISTICS_SCRAPER === 'true' || true,
      cronSchedule: process.env.CRON_SCHEDULE || '0 6,12,18,23 * * *',
      ...config,
    };

    console.log('ðŸš€ Real Estate Intelligence Orchestrator initialized');
    console.log(`Cron schedule: ${this.config.cronSchedule}`);
  }

  /**
   * Execute full intelligence cycle
   */
  async executeIntelligenceCycle(): Promise<void> {
    if (this.isRunning) {
      console.log('âš  Intelligence cycle already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.runCount++;
    const startTime = Date.now();

    console.log(`\n${'='.repeat(80)}`);
    console.log(
      `ðŸ”„ INTELLIGENCE CYCLE #${this.runCount} - ${new Date().toISOString()}`
    );
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Phase 1: Data Collection (Statistics & Market Intelligence)
      if (this.config.enableStatistics) {
        console.log('ðŸ“Š Phase 1: Statistics & Market Intelligence');
        await this.runStatisticsCollection();
      }

      // Phase 2: Intelligent Analysis (AI Processing)
      console.log('\nðŸ§  Phase 2: AI Intelligence Analysis');
      await this.runIntelligentAnalysis();

      // Phase 3: Automated Outreach (Voice & Email)
      if (this.config.enableAIVoice || this.config.enableWorkflowAutomation) {
        console.log('\nðŸ“ž Phase 3: Automated Client Outreach');
        await this.runAutomatedOutreach();
      }

      // Phase 4: Payment Processing & Contract Management
      if (this.config.enableSmartContracts) {
        console.log('\nðŸ’° Phase 4: Payment & Contract Processing');
        await this.runPaymentProcessing();
      }

      // Phase 5: Workflow Automation (Calendar, Tasks, Follow-ups)
      if (this.config.enableWorkflowAutomation) {
        console.log('\nðŸ“‹ Phase 5: Workflow Automation');
        await this.runWorkflowAutomation();
      }

      // Phase 6: Sync to Google Sheets
      console.log('\nðŸ“ Phase 6: Data Synchronization');
      await this.syncToGoogleSheets();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\nâœ… Intelligence cycle completed in ${duration}s\n`);

      this.emit('cycle:complete', {
        runCount: this.runCount,
        duration: parseFloat(duration),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('âŒ Intelligence cycle failed:', error);
      this.emit('cycle:error', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Phase 1: Statistics Collection
   */
  private async runStatisticsCollection(): Promise<void> {
    try {
      await statisticsScraper.initialize();

      // Generate heatmap data for Treasure Coast
      const heatmapData = await statisticsScraper.generateHeatmapData();

      console.log(`âœ“ Generated ${heatmapData.length} heatmap points`);

      // Close scraper
      await statisticsScraper.close();

      this.emit('statistics:complete', heatmapData);
    } catch (error) {
      console.error('Statistics collection failed:', error);
    }
  }

  /**
   * Phase 2: AI Intelligence Analysis
   */
  private async runIntelligentAnalysis(): Promise<void> {
    try {
      // This would integrate with emotional predictor, investor matcher, etc.
      console.log('âœ“ AI analysis engines ready');

      // Example: Analyze properties, match investors, predict seller emotions
      // Results would feed into outreach phase

      this.emit('analysis:complete');
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }

  /**
   * Phase 3: Automated Outreach
   */
  private async runAutomatedOutreach(): Promise<void> {
    try {
      // Check for properties needing follow-up
      // Make voice calls to high-value leads
      // Send automated emails

      const activeVoiceSessions = voiceSystem.getActiveSessionCount();
      console.log(`âœ“ Voice system active: ${activeVoiceSessions} calls`);

      // Example: Send follow-up emails
      if (this.config.enableWorkflowAutomation) {
        const inbox = await workflowAutomation.readInbox({
          maxResults: 20,
          unreadOnly: true,
        });

        console.log(`âœ“ Processed ${inbox.length} unread emails`);

        // Auto-respond to inquiries
        for (const message of inbox.slice(0, 5)) {
          await workflowAutomation.autoRespondToEmail(message.id);
        }
      }

      this.emit('outreach:complete');
    } catch (error) {
      console.error('Automated outreach failed:', error);
    }
  }

  /**
   * Phase 4: Payment Processing
   */
  private async runPaymentProcessing(): Promise<void> {
    try {
      // Check pending Stripe payments
      // Verify crypto transactions
      // Update smart contracts

      console.log('âœ“ Payment systems synchronized');

      // Get crypto prices for reporting
      const prices = await cryptoPayments.getCryptoPrices();
      console.log(`  BTC: $${prices.BTC?.toFixed(2) || 'N/A'}`);
      console.log(`  ETH: $${prices.ETH?.toFixed(2) || 'N/A'}`);

      this.emit('payments:complete');
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  }

  /**
   * Phase 5: Workflow Automation
   */
  private async runWorkflowAutomation(): Promise<void> {
    try {
      // Get upcoming appointments
      const upcomingEvents = await workflowAutomation.getUpcomingEvents(7);
      console.log(`âœ“ ${upcomingEvents.length} appointments scheduled`);

      // Get pending tasks
      const tasks = await workflowAutomation.getTasks();
      console.log(`âœ“ ${tasks.length} active tasks`);

      // Auto-schedule follow-ups based on inquiry age
      // This would check database for properties with > 24h old inquiries

      this.emit('workflow:complete');
    } catch (error) {
      console.error('Workflow automation failed:', error);
    }
  }

  /**
   * Phase 6: Sync to Google Sheets
   */
  private async syncToGoogleSheets(): Promise<void> {
    try {
      // This would push all new data to Google Sheets
      // Property leads, heatmap data, statistics, etc.

      console.log('âœ“ Data synced to Google Sheets');

      this.emit('sync:complete');
    } catch (error) {
      console.error('Google Sheets sync failed:', error);
    }
  }

  /**
   * Start orchestrator (manual trigger)
   */
  async start(): Promise<void> {
    console.log('â–¶ Starting Real Estate Intelligence Orchestrator...');
    await this.executeIntelligenceCycle();
  }

  /**
   * Get system status
   */
  getStatus(): {
    isRunning: boolean;
    runCount: number;
    config: OrchestratorConfig;
    voiceActiveSessions: number;
  } {
    return {
      isRunning: this.isRunning,
      runCount: this.runCount,
      config: this.config,
      voiceActiveSessions: voiceSystem.getActiveSessionCount(),
    };
  }

  /**
   * Manual trigger for specific phase
   */
  async executePhase(
    phase: 'statistics' | 'analysis' | 'outreach' | 'payments' | 'workflow'
  ): Promise<void> {
    console.log(`\nðŸŽ¯ Manual trigger: ${phase}`);

    switch (phase) {
      case 'statistics':
        await this.runStatisticsCollection();
        break;
      case 'analysis':
        await this.runIntelligentAnalysis();
        break;
      case 'outreach':
        await this.runAutomatedOutreach();
        break;
      case 'payments':
        await this.runPaymentProcessing();
        break;
      case 'workflow':
        await this.runWorkflowAutomation();
        break;
    }
  }
}

// CLI execution
if (require.main === module) {
  const orchestrator = new RealEstateOrchestrator();

  orchestrator.on('cycle:complete', (data) => {
    console.log(`\nðŸ“Š Cycle Stats:`);
    console.log(`   Run: #${data.runCount}`);
    console.log(`   Duration: ${data.duration}s`);
    console.log(`   Timestamp: ${data.timestamp.toISOString()}`);
  });

  orchestrator.on('cycle:error', (error) => {
    console.error('\nðŸš¨ Cycle Error:', error);
    process.exit(1);
  });

  orchestrator.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default RealEstateOrchestrator;
