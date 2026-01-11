/**
 * Google Cloud Storage Persistence Layer
 *
 * Manages all file operations in GCS bucket:
 * - Transaction history archival
 * - Crawled data backup
 * - Report generation storage
 * - Training data management
 * - Audit trail logging
 *
 * @package integrations
 * @author JARVIS
 * @version 1.0.0
 */

import { Storage, Bucket, File } from '@google-cloud/storage';
import { EventEmitter } from 'events';
import * as path from 'path';
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
  defaultMeta: { service: 'gcs-persistence' },
  transports: [
    new winston.transports.File({
      filename: 'logs/gcs-persistence.log',
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

export interface GCSUploadOptions {
  metadata?: Record<string, string>;
  contentType?: string;
  gzip?: boolean;
  resumable?: boolean;
}

export interface GCSFile {
  name: string;
  bucket: string;
  size: number;
  updated: Date;
  contentType: string;
  url: string;
}

export interface GCSUploadResult {
  fileName: string;
  path: string;
  size: number;
  contentType: string;
  url: string;
  uploadedAt: Date;
}

// ============================================================================
// GCS PERSISTENCE MANAGER
// ============================================================================

export class GCSPersistence extends EventEmitter {
  private storage: Storage;
  private bucket: Bucket;
  private projectId: string;
  private bucketName: string;

  constructor() {
    super();
    this.initialize();
  }

  /**
   * Initialize GCS connection
   */
  private initialize(): void {
    try {
      this.projectId = process.env.GCP_PROJECT_ID || 'infinity-x-one-systems';
      this.bucketName = process.env.GCS_BUCKET || 'infinity-x-one-systems';

      this.storage = new Storage({
        projectId: this.projectId,
        keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
      });

      this.bucket = this.storage.bucket(this.bucketName);

      logger.info('GCS Persistence initialized', {
        projectId: this.projectId,
        bucket: this.bucketName,
      });

      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize GCS Persistence', { error });
      throw error;
    }
  }

  /**
   * Upload transaction to archive
   */
  async uploadTransaction(
    transactionId: string,
    data: Record<string, any>
  ): Promise<GCSUploadResult> {
    const fileName = `transactions/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${transactionId}.json`;
    return this.uploadToGCS(fileName, JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      metadata: {
        type: 'transaction',
        transactionId,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload crawled data
   */
  async uploadCrawledData(
    dataType: string,
    data: Record<string, any>
  ): Promise<GCSUploadResult> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `crawled-data/${dataType}/${timestamp}/${Date.now()}.json`;
    return this.uploadToGCS(fileName, JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      metadata: {
        type: 'crawled-data',
        dataType,
        crawledAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload report
   */
  async uploadReport(
    reportType: string,
    reportName: string,
    content: string
  ): Promise<GCSUploadResult> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `reports/${reportType}/${timestamp}/${reportName}`;
    const contentType = reportName.endsWith('.pdf')
      ? 'application/pdf'
      : 'text/plain';

    return this.uploadToGCS(fileName, content, {
      contentType,
      metadata: {
        type: 'report',
        reportType,
        reportName,
        generatedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload training data
   */
  async uploadTrainingData(
    datasetName: string,
    data: any[]
  ): Promise<GCSUploadResult> {
    const fileName = `training-data/${datasetName}/${Date.now()}.jsonl`;
    const content = data.map((d) => JSON.stringify(d)).join('\n');

    return this.uploadToGCS(fileName, content, {
      contentType: 'application/x-ndjson',
      metadata: {
        type: 'training-data',
        datasetName,
        recordCount: data.length.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload audit log
   */
  async uploadAuditLog(
    logType: string,
    logData: Record<string, any>
  ): Promise<GCSUploadResult> {
    const fileName = `audit-logs/${logType}/${new Date().toISOString().split('T')[0]}/${Date.now()}.json`;
    return this.uploadToGCS(fileName, JSON.stringify(logData, null, 2), {
      contentType: 'application/json',
      metadata: {
        type: 'audit-log',
        logType,
        loggedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Generic upload to GCS
   */
  private async uploadToGCS(
    fileName: string,
    content: string | Buffer,
    options?: GCSUploadOptions
  ): Promise<GCSUploadResult> {
    const file = this.bucket.file(fileName);

    const uploadOptions: any = {
      metadata: {
        ...options?.metadata,
        uploadedAt: new Date().toISOString(),
      },
      contentType: options?.contentType || 'application/octet-stream',
      gzip: options?.gzip !== false,
      resumable: options?.resumable !== false,
    };

    try {
      const buffer =
        typeof content === 'string' ? Buffer.from(content) : content;
      await file.save(buffer, uploadOptions);

      const [metadata] = await file.getMetadata();

      const result: GCSUploadResult = {
        fileName: path.basename(fileName),
        path: fileName,
        size: buffer.length,
        contentType: uploadOptions.contentType,
        url: `gs://${this.bucketName}/${fileName}`,
        uploadedAt: new Date(),
      };

      logger.info('File uploaded to GCS', {
        fileName,
        size: buffer.length,
        url: result.url,
      });

      this.emit('upload:complete', result);
      return result;
    } catch (error) {
      logger.error('Failed to upload file to GCS', { error, fileName });
      throw error;
    }
  }

  /**
   * Download file from GCS
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const file = this.bucket.file(filePath);

    try {
      const [content] = await file.download();
      logger.info('File downloaded from GCS', { filePath });
      return content as Buffer;
    } catch (error) {
      logger.error('Failed to download file from GCS', { error, filePath });
      throw error;
    }
  }

  /**
   * List files in directory
   */
  async listFiles(prefix: string, maxResults?: number): Promise<GCSFile[]> {
    try {
      const [files] = await this.bucket.getFiles({
        prefix,
        maxResults,
      });

      const results: GCSFile[] = [];

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        results.push({
          name: file.name,
          bucket: this.bucketName,
          size: parseInt(metadata.size, 10),
          updated: new Date(metadata.updated),
          contentType: metadata.contentType || 'unknown',
          url: `gs://${this.bucketName}/${file.name}`,
        });
      }

      logger.info('Files listed from GCS', { prefix, count: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to list files from GCS', { error, prefix });
      throw error;
    }
  }

  /**
   * Delete file from GCS
   */
  async deleteFile(filePath: string): Promise<void> {
    const file = this.bucket.file(filePath);

    try {
      await file.delete();
      logger.info('File deleted from GCS', { filePath });
      this.emit('delete:complete', filePath);
    } catch (error) {
      logger.error('Failed to delete file from GCS', { error, filePath });
      throw error;
    }
  }

  /**
   * Archive old files (move to archive folder)
   */
  async archiveOldFiles(prefix: string, daysOld: number = 90): Promise<number> {
    try {
      const [files] = await this.bucket.getFiles({ prefix });
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;
      let archivedCount = 0;

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const fileAge = (now - new Date(metadata.updated).getTime()) / msPerDay;

        if (fileAge > daysOld) {
          const archivePath = `archive/${prefix}/${file.name.split('/').pop()}`;
          await this.bucket.file(archivePath).save(await file.download());
          await file.delete();
          archivedCount++;
        }
      }

      logger.info('Old files archived', { prefix, count: archivedCount });
      return archivedCount;
    } catch (error) {
      logger.error('Failed to archive old files', { error, prefix });
      throw error;
    }
  }

  /**
   * Get bucket statistics
   */
  async getBucketStats(): Promise<Record<string, any>> {
    try {
      const [files] = await this.bucket.getFiles({ autoPaginate: true });

      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        filesByType: {} as Record<string, number>,
        oldestFile: null as Date | null,
        newestFile: null as Date | null,
      };

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        stats.totalSize += parseInt(metadata.size, 10);

        const contentType = metadata.contentType || 'unknown';
        stats.filesByType[contentType] =
          (stats.filesByType[contentType] || 0) + 1;

        const updated = new Date(metadata.updated);
        if (!stats.oldestFile || updated < stats.oldestFile) {
          stats.oldestFile = updated;
        }
        if (!stats.newestFile || updated > stats.newestFile) {
          stats.newestFile = updated;
        }
      }

      logger.info('Bucket stats retrieved', {
        totalFiles: stats.totalFiles,
        totalSize: (stats.totalSize / 1024 / 1024).toFixed(2) + ' MB',
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get bucket statistics', { error });
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testFile = this.bucket.file('health-check.txt');
      await testFile.save('OK', { metadata: { type: 'health-check' } });
      await testFile.delete();
      logger.info('GCS health check passed');
      return true;
    } catch (error) {
      logger.error('GCS health check failed', { error });
      return false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const gcsPersistence = new GCSPersistence();
