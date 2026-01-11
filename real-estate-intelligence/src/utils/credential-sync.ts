/**
 * Credential Synchronization Utility
 *
 * Syncs credentials from foundation repo to Real Estate Intelligence
 * Supports both GitHub Secrets and local .env synchronization
 *
 * @author JARVIS
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
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
  defaultMeta: { service: 'credential-sync' },
  transports: [
    new winston.transports.File({
      filename: 'logs/credential-sync.log',
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

export interface CredentialSource {
  type: 'local-env' | 'github-secrets' | 'gcp-secret-manager';
  location: string;
  isAvailable: boolean;
}

export interface CredentialMap {
  [key: string]: string | undefined;
}

export interface SyncResult {
  source: string;
  destination: string;
  successCount: number;
  failureCount: number;
  warnings: string[];
  errors: string[];
  timestamp: Date;
}

// ============================================================================
// CREDENTIAL SYNC MANAGER
// ============================================================================

export class CredentialSyncManager {
  private foundationRepoPath: string;
  private realEstateIntelligencePath: string;
  private credentialSources: CredentialSource[] = [];
  private syncedCredentials: CredentialMap = {};

  constructor(
    foundationPath: string = path.resolve(process.cwd(), '../foundation'),
    realEstatePath: string = process.cwd()
  ) {
    this.foundationRepoPath = foundationPath;
    this.realEstateIntelligencePath = realEstatePath;
    this.discoverCredentialSources();
  }

  /**
   * Discover all available credential sources
   */
  private discoverCredentialSources(): void {
    const sources: CredentialSource[] = [];

    // Check Foundation .env
    const foundationEnvPath = path.join(this.foundationRepoPath, '.env');
    sources.push({
      type: 'local-env',
      location: foundationEnvPath,
      isAvailable: fs.existsSync(foundationEnvPath),
    });

    // Check Foundation .env.local
    const foundationEnvLocalPath = path.join(
      this.foundationRepoPath,
      '.env.local'
    );
    sources.push({
      type: 'local-env',
      location: foundationEnvLocalPath,
      isAvailable: fs.existsSync(foundationEnvLocalPath),
    });

    // Check GCP config files
    const gcpConfigPath = path.join(this.foundationRepoPath, 'gcp');
    sources.push({
      type: 'gcp-secret-manager',
      location: gcpConfigPath,
      isAvailable: fs.existsSync(gcpConfigPath),
    });

    this.credentialSources = sources.filter((s) => s.isAvailable);

    logger.info('Credential sources discovered', {
      count: this.credentialSources.length,
      sources: this.credentialSources.map((s) => s.location),
    });
  }

  /**
   * Load credentials from local .env file
   */
  private loadFromEnvFile(envPath: string): CredentialMap {
    if (!fs.existsSync(envPath)) {
      logger.warn('Env file not found', { path: envPath });
      return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envConfig = dotenv.parse(envContent);

    logger.info('Credentials loaded from env file', {
      path: envPath,
      count: Object.keys(envConfig).length,
    });

    return envConfig;
  }

  /**
   * Load credentials from GCP Secret Manager
   */
  private async loadFromGCPSecretManager(): Promise<CredentialMap> {
    try {
      // Check for service account key
      const keyPath = path.join(
        this.foundationRepoPath,
        'secrets/gcp-service-account.json'
      );

      if (fs.existsSync(keyPath)) {
        const keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
        const credentials: CredentialMap = {
          GCP_PROJECT_ID: keyContent.project_id,
          GCP_SERVICE_ACCOUNT_EMAIL: keyContent.client_email,
          GCP_PRIVATE_KEY: keyContent.private_key,
        };

        logger.info('GCP credentials loaded', {
          email: keyContent.client_email,
        });

        return credentials;
      }
    } catch (error) {
      logger.warn('Failed to load GCP credentials', { error });
    }

    return {};
  }

  /**
   * Sync credentials from foundation to Real Estate Intelligence
   */
  async syncCredentials(
    destinationType: 'local-env' | 'github-secrets' = 'local-env'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      source: this.foundationRepoPath,
      destination:
        destinationType === 'local-env'
          ? path.join(this.realEstateIntelligencePath, '.env')
          : 'GitHub Secrets',
      successCount: 0,
      failureCount: 0,
      warnings: [],
      errors: [],
      timestamp: new Date(),
    };

    try {
      // Load credentials from all sources
      const allCredentials: CredentialMap = {};

      // Load from .env
      const envPath = path.join(this.foundationRepoPath, '.env');
      const envCreds = this.loadFromEnvFile(envPath);
      Object.assign(allCredentials, envCreds);

      // Load from .env.local
      const envLocalPath = path.join(this.foundationRepoPath, '.env.local');
      const envLocalCreds = this.loadFromEnvFile(envLocalPath);
      Object.assign(allCredentials, envLocalCreds);

      // Load from GCP
      const gcpCreds = await this.loadFromGCPSecretManager();
      Object.assign(allCredentials, gcpCreds);

      // Sync to destination
      if (destinationType === 'local-env') {
        await this.syncToLocalEnv(allCredentials, result);
      } else if (destinationType === 'github-secrets') {
        await this.syncToGitHubSecrets(allCredentials, result);
      }

      this.syncedCredentials = allCredentials;
    } catch (error) {
      result.errors.push(`Sync failed: ${(error as Error).message}`);
      logger.error('Credential sync failed', { error });
    }

    logger.info('Credential sync completed', {
      successCount: result.successCount,
      failureCount: result.failureCount,
      warnings: result.warnings.length,
    });

    return result;
  }

  /**
   * Sync to local .env file
   */
  private async syncToLocalEnv(
    credentials: CredentialMap,
    result: SyncResult
  ): Promise<void> {
    const envPath = path.join(this.realEstateIntelligencePath, '.env');

    // Load existing .env if it exists
    let existingEnv: CredentialMap = {};
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      existingEnv = dotenv.parse(content);
    }

    // Merge (new credentials override old ones)
    const mergedEnv = { ...existingEnv, ...credentials };

    // Filter sensitive keys that should not be synced
    const excludedKeys = ['STRIPE_SECRET_KEY', 'JWT_SECRET', 'SESSION_SECRET'];
    const filteredEnv = { ...mergedEnv };

    excludedKeys.forEach((key) => {
      if (
        mergedEnv[key] === undefined ||
        mergedEnv[key]?.includes('placeholder')
      ) {
        delete filteredEnv[key];
      }
    });

    // Write to .env
    const envLines = Object.entries(filteredEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envPath, envLines + '\n', 'utf-8');

    result.successCount = Object.keys(credentials).length;
    logger.info('Credentials synced to local .env', {
      path: envPath,
      count: Object.keys(credentials).length,
    });
  }

  /**
   * Sync to GitHub Secrets
   */
  private async syncToGitHubSecrets(
    credentials: CredentialMap,
    result: SyncResult
  ): Promise<void> {
    try {
      const owner = 'InfinityXOneSystems';
      const repo = 'real_estate_intelligence';

      // Check GitHub CLI availability
      const ghAvailable = this.isGitHubCLIAvailable();

      if (!ghAvailable) {
        result.warnings.push(
          'GitHub CLI not available. Cannot sync to GitHub Secrets.'
        );
        logger.warn('GitHub CLI not available');
        return;
      }

      // Sync each credential
      for (const [key, value] of Object.entries(credentials)) {
        if (
          !value ||
          value.includes('YOUR_') ||
          value.includes('placeholder')
        ) {
          continue;
        }

        try {
          // Use GitHub CLI to set secret
          execSync(
            `gh secret set ${key} --body "${value}" --repo ${owner}/${repo}`,
            { stdio: 'pipe' }
          );

          result.successCount++;
          logger.info('GitHub Secret synced', { key });
        } catch (error) {
          result.failureCount++;
          result.errors.push(
            `Failed to sync ${key}: ${(error as Error).message}`
          );
          logger.warn('Failed to sync GitHub Secret', { key, error });
        }
      }
    } catch (error) {
      result.errors.push(`GitHub sync failed: ${(error as Error).message}`);
      logger.error('GitHub Secrets sync failed', { error });
    }
  }

  /**
   * Check if GitHub CLI is available
   */
  private isGitHubCLIAvailable(): boolean {
    try {
      execSync('gh --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate credentials
   */
  async validateCredentials(): Promise<Record<string, boolean>> {
    const validation: Record<string, boolean> = {};

    // Validate GCP credentials
    const gcpEmail = this.syncedCredentials['GCP_SERVICE_ACCOUNT_EMAIL'];
    const gcpKey = this.syncedCredentials['GCP_PRIVATE_KEY'];
    validation['GCP'] = !!(gcpEmail && gcpKey && !gcpKey.includes('YOUR_'));

    // Validate API keys
    const apiKeys = [
      'ANTHROPIC_API_KEY',
      'GOOGLE_GEMINI_KEY',
      'STRIPE_SECRET_KEY',
    ];

    apiKeys.forEach((key) => {
      const value = this.syncedCredentials[key];
      validation[key] = !!(value && !value.includes('YOUR_'));
    });

    logger.info('Credentials validated', { validation });
    return validation;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    credentialsLoaded: number;
    sourceCount: number;
    lastSyncTime: string;
  } {
    return {
      credentialsLoaded: Object.keys(this.syncedCredentials).length,
      sourceCount: this.credentialSources.length,
      lastSyncTime: new Date().toISOString(),
    };
  }
}

// ============================================================================
// CLI USAGE
// ============================================================================

if (require.main === module) {
  const manager = new CredentialSyncManager();

  manager
    .syncCredentials('local-env')
    .then(async (result) => {
      console.log('Sync completed:', result);

      const validation = await manager.validateCredentials();
      console.log('Validation results:', validation);

      const status = manager.getSyncStatus();
      console.log('Sync status:', status);
    })
    .catch((error) => {
      console.error('Sync failed:', error);
      process.exit(1);
    });
}

export default CredentialSyncManager;
