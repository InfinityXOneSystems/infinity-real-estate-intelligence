/**
 * Google Sheets Integration for Real Estate Intelligence
 * Writes property data to shared spreadsheet with editor access
 */

import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

interface PropertyRecord {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: string;
  listingDate: string;
  listingUrl: string;
  distressScore?: number;
  foreclosureRisk?: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  daysOnMarket?: number;
  priceReduction?: number;
  mlsNumber?: string;
  agentName?: string;
  agentPhone?: string;
  description?: string;
  features?: string[];
  lastUpdated: string;
}

interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  serviceAccountEmail: string;
  credentialsPath?: string;
}

export class GoogleSheetsClient {
  private sheets: any;
  private auth: OAuth2Client | null = null;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Initialize Google Sheets API client with service account
   */
  async initialize(): Promise<void> {
    try {
      // Use service account authentication
      const auth = new google.auth.GoogleAuth({
        keyFile:
          this.config.credentialsPath ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.auth = (await auth.getClient()) as OAuth2Client;
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      console.log('âœ“ Google Sheets client initialized');
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      throw error;
    }
  }

  /**
   * Ensure sheet exists and has proper headers
   */
  async ensureSheetStructure(): Promise<void> {
    try {
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      const sheet = spreadsheet.data.sheets?.find(
        (s: any) => s.properties.title === this.config.sheetName
      );

      if (!sheet) {
        // Create sheet if it doesn't exist
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.config.spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: this.config.sheetName,
                    gridProperties: {
                      frozenRowCount: 1,
                    },
                  },
                },
              },
            ],
          },
        });

        console.log(`âœ“ Created new sheet: ${this.config.sheetName}`);
      }

      // Check if headers exist
      const range = `${this.config.sheetName}!A1:Z1`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range,
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers
        await this.addHeaders();
      }
    } catch (error) {
      console.error('Failed to ensure sheet structure:', error);
      throw error;
    }
  }

  /**
   * Add column headers to the sheet
   */
  private async addHeaders(): Promise<void> {
    const headers = [
      'Address',
      'City',
      'State',
      'ZIP Code',
      'Price',
      'Bedrooms',
      'Bathrooms',
      'Square Feet',
      'Lot Size',
      'Year Built',
      'Property Type',
      'Listing Date',
      'Listing URL',
      'Distress Score',
      'Foreclosure Risk',
      'Estimated Value',
      'Days on Market',
      'Price Reduction',
      'MLS Number',
      'Agent Name',
      'Agent Phone',
      'Description',
      'Features',
      'Last Updated',
      'Data Source',
      'Crawl Timestamp',
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range: `${this.config.sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values: [headers],
      },
    });

    // Format header row
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(),
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    console.log('âœ“ Added headers to sheet');
  }

  /**
   * Get sheet ID by name
   */
  private async getSheetId(): Promise<number> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s: any) => s.properties.title === this.config.sheetName
    );

    return sheet?.properties.sheetId || 0;
  }

  /**
   * Append property records to the sheet
   */
  async appendProperties(properties: PropertyRecord[]): Promise<number> {
    if (!this.auth) {
      throw new Error('Google Sheets client not initialized');
    }

    try {
      const rows = properties.map((prop) => [
        prop.address,
        prop.city,
        prop.state,
        prop.zipCode,
        prop.price,
        prop.bedrooms,
        prop.bathrooms,
        prop.squareFeet,
        prop.lotSize || '',
        prop.yearBuilt || '',
        prop.propertyType,
        prop.listingDate,
        prop.listingUrl,
        prop.distressScore || '',
        prop.foreclosureRisk || '',
        prop.estimatedValue || '',
        prop.daysOnMarket || '',
        prop.priceReduction || '',
        prop.mlsNumber || '',
        prop.agentName || '',
        prop.agentPhone || '',
        prop.description || '',
        prop.features?.join(', ') || '',
        prop.lastUpdated,
        'Intelligence System',
        new Date().toISOString(),
      ]);

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });

      const updatedRows = response.data.updates?.updatedRows || 0;
      console.log(`âœ“ Appended ${updatedRows} properties to Google Sheets`);

      return updatedRows;
    } catch (error) {
      console.error('Failed to append properties to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate properties before inserting
   */
  async findDuplicates(addresses: string[]): Promise<Set<string>> {
    try {
      const range = `${this.config.sheetName}!A:A`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range,
      });

      const existingAddresses = new Set(
        response.data.values?.flat().map((v: string) => v.toLowerCase()) || []
      );

      return new Set(
        addresses.filter((addr) => existingAddresses.has(addr.toLowerCase()))
      );
    } catch (error) {
      console.error('Failed to check for duplicates:', error);
      return new Set();
    }
  }

  /**
   * Batch write with duplicate checking
   */
  async batchWriteProperties(properties: PropertyRecord[]): Promise<number> {
    // Check for duplicates
    const addresses = properties.map((p) => p.address);
    const duplicates = await this.findDuplicates(addresses);

    // Filter out duplicates
    const newProperties = properties.filter(
      (p) => !duplicates.has(p.address.toLowerCase())
    );

    if (newProperties.length === 0) {
      console.log('No new properties to add (all duplicates)');
      return 0;
    }

    console.log(
      `Found ${duplicates.size} duplicates, adding ${newProperties.length} new properties`
    );

    return await this.appendProperties(newProperties);
  }

  /**
   * Get row count
   */
  async getRowCount(): Promise<number> {
    try {
      const range = `${this.config.sheetName}!A:A`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range,
      });

      return response.data.values?.length || 0;
    } catch (error) {
      console.error('Failed to get row count:', error);
      return 0;
    }
  }

  /**
   * Clear all data except headers
   */
  async clearData(): Promise<void> {
    try {
      const rowCount = await this.getRowCount();
      if (rowCount <= 1) {
        console.log('No data to clear');
        return;
      }

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.sheetName}!A2:Z`,
      });

      console.log('âœ“ Cleared all data from sheet');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
}

// Export singleton instance
let sheetsClient: GoogleSheetsClient | null = null;

export function getGoogleSheetsClient(): GoogleSheetsClient {
  if (!sheetsClient) {
    const config: GoogleSheetsConfig = {
      spreadsheetId:
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
        '1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU',
      sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'New Properties',
      serviceAccountEmail:
        process.env.SERVICE_ACCOUNT_EMAIL ||
        'real-estate-intelligence@infinity-x-one-systems.iam.gserviceaccount.com',
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    };

    sheetsClient = new GoogleSheetsClient(config);
  }

  return sheetsClient;
}
