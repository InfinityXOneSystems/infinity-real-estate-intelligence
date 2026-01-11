/**
 * DOCUMENT INDEX ENGINE
 * 
 * Core system for maintaining document catalog, version control,
 * metadata indexing, and full-text search capability.
 * 
 * Functions:
 * - Unique document ID generation and management
 * - Metadata indexing and retrieval
 * - Full-text search across document catalog
 * - Version history tracking
 * - Taxonomy classification
 */

import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';
import * as crypto from 'crypto';

// Document Types
interface DocumentMetadata {
  documentId: string;
  classification: string;
  categoryName: string;
  documentName: string;
  version: string;
  state: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'OBSOLETE' | 'PENDING' | 'EXECUTED';
  created: string;
  modified: string;
  creator: string;
  owner: string;
  format: string;
  fileSize: number;
  pages: number;
  relatedDocuments: string[];
  tags: string[];
  retentionDays: number;
  archived: boolean;
  encrypted: boolean;
  confidential: boolean;
  contentHash: string;
  searchIndex: string[];
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details: any;
}

interface DocumentIndex {
  [documentId: string]: DocumentMetadata;
}

interface SearchQuery {
  text?: string;
  classification?: string;
  state?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  owner?: string;
}

interface SearchResult {
  documentId: string;
  documentName: string;
  relevanceScore: number;
  matchedFields: string[];
}

class DocumentIndexEngine {
  private db: FirebaseFirestore.Firestore;
  private bigquery: BigQuery;
  private indexCollection = 'document-index';
  private auditCollection = 'document-audit';

  constructor() {
    this.db = admin.firestore();
    this.bigquery = new BigQuery();
  }

  /**
   * Generate unique document ID based on taxonomy classification
   * Format: [CATEGORY]-[SUBCATEGORY]-[ITEM]-[VERSION]-[STATE]
   */
  generateDocumentId(
    classification: string,
    version: string = '1.0',
    state: string = 'S.0'
  ): string {
    const timestamp = Date.now().toString(36);
    const randomHash = crypto.randomBytes(4).toString('hex').substring(0, 4);
    return `${classification}-v${version}-${state}-${timestamp}-${randomHash}`;
  }

  /**
   * Index new document with full metadata
   */
  async indexDocument(metadata: DocumentMetadata): Promise<string> {
    try {
      // Generate search index from content
      metadata.searchIndex = this.generateSearchIndex(metadata);

      // Add document to Firestore
      const docRef = await this.db
        .collection(this.indexCollection)
        .add(metadata);

      // Add to BigQuery for analytics
      await this.addToBigQuery(metadata);

      // Log to audit trail
      await this.logAuditEntry(metadata.documentId, 'INDEX_CREATED', 'system', {
        classification: metadata.classification,
        owner: metadata.owner,
      });

      console.log(`âœ“ Document indexed: ${metadata.documentId}`);
      return docRef.id;
    } catch (error) {
      console.error(`âœ— Failed to index document: ${error}`);
      throw error;
    }
  }

  /**
   * Generate full-text search index from metadata
   */
  private generateSearchIndex(metadata: DocumentMetadata): string[] {
    const searchableFields = [
      metadata.documentName.toLowerCase(),
      metadata.categoryName.toLowerCase(),
      metadata.classification.toLowerCase(),
      ...metadata.tags.map(t => t.toLowerCase()),
      metadata.owner.toLowerCase(),
    ];

    // Split into individual words
    return searchableFields
      .flatMap(field => field.split(/[\s\-_]+/))
      .filter(word => word.length > 2)
      .filter((word, index, array) => array.indexOf(word) === index); // Deduplicate
  }

  /**
   * Full-text search across document catalog
   */
  async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      let q = this.db.collection(this.indexCollection);

      // Apply filters
      if (query.classification) {
        q = q.where('classification', '==', query.classification);
      }

      if (query.state) {
        q = q.where('state', '==', query.state);
      }

      if (query.owner) {
        q = q.where('owner', '==', query.owner);
      }

      if (query.dateRange) {
        q = q
          .where('created', '>=', query.dateRange.start)
          .where('created', '<=', query.dateRange.end);
      }

      const snapshot = await q.get();
      const results: SearchResult[] = [];

      snapshot.forEach(doc => {
        const metadata = doc.data() as DocumentMetadata;

        // Calculate relevance score
        let relevanceScore = 0;
        const matchedFields: string[] = [];

        if (query.text) {
          const searchText = query.text.toLowerCase();
          const words = searchText.split(/[\s\-_]+/);

          words.forEach(word => {
            if (metadata.searchIndex.includes(word)) {
              relevanceScore += 10;
              matchedFields.push('searchIndex');
            }
            if (metadata.documentName.toLowerCase().includes(word)) {
              relevanceScore += 20;
              if (!matchedFields.includes('documentName')) {
                matchedFields.push('documentName');
              }
            }
            if (metadata.categoryName.toLowerCase().includes(word)) {
              relevanceScore += 15;
              if (!matchedFields.includes('categoryName')) {
                matchedFields.push('categoryName');
              }
            }
          });
        }

        // Check tag matches
        if (query.tags && query.tags.length > 0) {
          const tagMatches = query.tags.filter(tag =>
            metadata.tags.includes(tag)
          ).length;
          relevanceScore += tagMatches * 5;
          if (tagMatches > 0) {
            matchedFields.push('tags');
          }
        }

        if (relevanceScore > 0 || !query.text) {
          results.push({
            documentId: metadata.documentId,
            documentName: metadata.documentName,
            relevanceScore,
            matchedFields,
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      console.log(`âœ“ Found ${results.length} documents matching query`);
      return results;
    } catch (error) {
      console.error(`âœ— Search failed: ${error}`);
      throw error;
    }
  }

  /**
   * Retrieve full metadata for a document
   */
  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    try {
      const query = this.db
        .collection(this.indexCollection)
        .where('documentId', '==', documentId);

      const snapshot = await query.get();

      if (snapshot.empty) {
        console.warn(`âš  Document not found: ${documentId}`);
        return null;
      }

      return snapshot.docs[0].data() as DocumentMetadata;
    } catch (error) {
      console.error(`âœ— Failed to retrieve metadata: ${error}`);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateMetadata(
    documentId: string,
    updates: Partial<DocumentMetadata>
  ): Promise<void> {
    try {
      const query = this.db
        .collection(this.indexCollection)
        .where('documentId', '==', documentId);

      const snapshot = await query.get();

      if (snapshot.empty) {
        throw new Error(`Document not found: ${documentId}`);
      }

      const docRef = snapshot.docs[0].ref;

      // Update metadata
      await docRef.update({
        ...updates,
        modified: new Date().toISOString(),
        searchIndex: this.generateSearchIndex({ ...snapshot.docs[0].data() as DocumentMetadata, ...updates }),
      });

      // Log audit entry
      await this.logAuditEntry(documentId, 'METADATA_UPDATED', 'system', updates);

      console.log(`âœ“ Metadata updated: ${documentId}`);
    } catch (error) {
      console.error(`âœ— Failed to update metadata: ${error}`);
      throw error;
    }
  }

  /**
   * List all document versions
   */
  async getDocumentVersions(classification: string): Promise<DocumentMetadata[]> {
    try {
      const query = this.db
        .collection(this.indexCollection)
        .where('classification', '==', classification)
        .orderBy('version', 'desc');

      const snapshot = await query.get();

      const versions = snapshot.docs.map(doc => doc.data() as DocumentMetadata);

      console.log(`âœ“ Retrieved ${versions.length} versions for ${classification}`);
      return versions;
    } catch (error) {
      console.error(`âœ— Failed to retrieve versions: ${error}`);
      throw error;
    }
  }

  /**
   * Add document metadata to BigQuery for analytics
   */
  private async addToBigQuery(metadata: DocumentMetadata): Promise<void> {
    try {
      const dataset = this.bigquery.dataset('document_analytics');
      const table = dataset.table('document_index');

      const row = {
        documentId: metadata.documentId,
        classification: metadata.classification,
        categoryName: metadata.categoryName,
        documentName: metadata.documentName,
        state: metadata.state,
        created: metadata.created,
        owner: metadata.owner,
        format: metadata.format,
        fileSize: metadata.fileSize,
        confidential: metadata.confidential,
        timestamp: new Date().toISOString(),
      };

      await table.insert(row);
    } catch (error) {
      console.error(`âš  Failed to add to BigQuery: ${error}`);
    }
  }

  /**
   * Log audit entry for document operations
   */
  private async logAuditEntry(
    documentId: string,
    action: string,
    user: string,
    details: any
  ): Promise<void> {
    try {
      await this.db.collection(this.auditCollection).add({
        documentId,
        action,
        user,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`âš  Failed to log audit entry: ${error}`);
    }
  }

  /**
   * Get audit trail for document
   */
  async getAuditTrail(documentId: string): Promise<AuditEntry[]> {
    try {
      const snapshot = await this.db
        .collection(this.auditCollection)
        .where('documentId', '==', documentId)
        .orderBy('timestamp', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        timestamp: doc.data().timestamp,
        action: doc.data().action,
        user: doc.data().user,
        details: doc.data().details,
      }));
    } catch (error) {
      console.error(`âœ— Failed to retrieve audit trail: ${error}`);
      throw error;
    }
  }

  /**
   * Archive document and versions
   */
  async archiveDocument(documentId: string): Promise<void> {
    try {
      await this.updateMetadata(documentId, {
        state: 'ARCHIVED',
        archived: true,
      });

      await this.logAuditEntry(documentId, 'ARCHIVED', 'system', {});

      console.log(`âœ“ Document archived: ${documentId}`);
    } catch (error) {
      console.error(`âœ— Failed to archive document: ${error}`);
      throw error;
    }
  }

  /**
   * Generate index report
   */
  async generateIndexReport(): Promise<any> {
    try {
      const query = `
        SELECT 
          classification,
          COUNT(*) as total_documents,
          COUNT(CASE WHEN state = 'ACTIVE' THEN 1 END) as active_documents,
          COUNT(CASE WHEN confidential = true THEN 1 END) as confidential_count,
          SUM(fileSize) as total_size,
          MIN(created) as oldest_document,
          MAX(created) as newest_document
        FROM document_analytics.document_index
        GROUP BY classification
        ORDER BY total_documents DESC
      `;

      const [rows] = await this.bigquery.query(query);

      return {
        generatedAt: new Date().toISOString(),
        summary: rows,
        totalDocuments: rows.reduce((sum: number, row: any) => sum + row.total_documents, 0),
        totalSize: rows.reduce((sum: number, row: any) => sum + row.total_size, 0),
      };
    } catch (error) {
      console.error(`âœ— Failed to generate report: ${error}`);
      throw error;
    }
  }
}

// Export for use in other modules
export { DocumentIndexEngine, DocumentMetadata, SearchQuery, SearchResult };
