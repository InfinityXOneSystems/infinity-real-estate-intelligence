/**
 * Google Wallet & Link Integration
 * Digital wallet for property documents, loyalty cards, payment methods
 */

import axios from 'axios';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

interface WalletPass {
  id: string;
  classId: string;
  type: 'LOYALTY' | 'OFFER' | 'GENERIC' | 'EVENT_TICKET';
  state: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  title: string;
  subtitle?: string;
  description?: string;
  barcode?: {
    type: 'QR_CODE' | 'CODE_128' | 'PDF_417';
    value: string;
  };
  metadata: Record<string, any>;
}

interface PropertyAccessPass {
  propertyId: string;
  propertyAddress: string;
  clientName: string;
  clientEmail: string;
  accessCode: string;
  validFrom: Date;
  validUntil: Date;
  appointmentId?: string;
}

interface LoyaltyProgram {
  programId: string;
  clientEmail: string;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rewards: Array<{
    id: string;
    name: string;
    pointsCost: number;
    description: string;
  }>;
}

export class GoogleWalletService {
  private jwtClient: JWT;
  private issuerId: string;

  constructor() {
    // Initialize Google Wallet API
    this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '';

    this.jwtClient = new JWT({
      email: process.env.GOOGLE_WALLET_SERVICE_EMAIL,
      key: process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    console.log('âœ“ Google Wallet service initialized');
  }

  /**
   * Create property access pass
   */
  async createPropertyAccessPass(params: PropertyAccessPass): Promise<string> {
    try {
      const classId = `${this.issuerId}.property_access`;
      const objectId = `${this.issuerId}.${params.propertyId}_${Date.now()}`;

      // Create class if not exists
      await this.createPassClass(classId, 'Property Access Pass');

      // Create pass object
      const passObject = {
        id: objectId,
        classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: process.env.PROPERTY_IMAGE_BASE_URL || '',
          },
        },
        textModulesData: [
          {
            header: 'Property Address',
            body: params.propertyAddress,
          },
          {
            header: 'Client Name',
            body: params.clientName,
          },
          {
            header: 'Valid Period',
            body: `${params.validFrom.toLocaleDateString()} - ${params.validUntil.toLocaleDateString()}`,
          },
        ],
        barcode: {
          type: 'QR_CODE',
          value: params.accessCode,
        },
        validTimeInterval: {
          start: {
            date: params.validFrom.toISOString(),
          },
          end: {
            date: params.validUntil.toISOString(),
          },
        },
      };

      await this.savePassObject(passObject);

      // Generate JWT for Add to Google Wallet button
      const saveUrl = await this.generateSaveUrl([passObject]);

      console.log(`âœ“ Created property access pass: ${objectId}`);
      return saveUrl;
    } catch (error) {
      console.error('Failed to create property access pass:', error);
      throw error;
    }
  }

  /**
   * Create loyalty program pass
   */
  async createLoyaltyPass(program: LoyaltyProgram): Promise<string> {
    try {
      const classId = `${this.issuerId}.loyalty_program`;
      const objectId = `${this.issuerId}.loyalty_${program.programId}`;

      // Create loyalty class
      await this.createLoyaltyClass(classId);

      // Create loyalty object
      const loyaltyObject = {
        id: objectId,
        classId,
        state: 'ACTIVE',
        accountId: program.clientEmail,
        accountName: program.clientEmail.split('@')[0],
        loyaltyPoints: {
          label: 'Points',
          balance: {
            int: program.points,
          },
        },
        textModulesData: [
          {
            header: 'Tier Status',
            body: program.tier,
          },
          {
            header: 'Available Rewards',
            body: `${program.rewards.length} rewards available`,
          },
        ],
        barcode: {
          type: 'QR_CODE',
          value: program.programId,
        },
      };

      await this.savePassObject(loyaltyObject);

      const saveUrl = await this.generateSaveUrl([loyaltyObject]);

      console.log(`âœ“ Created loyalty pass: ${objectId}`);
      return saveUrl;
    } catch (error) {
      console.error('Failed to create loyalty pass:', error);
      throw error;
    }
  }

  /**
   * Create offer/promotion pass
   */
  async createOfferPass(params: {
    offerId: string;
    title: string;
    description: string;
    validUntil: Date;
    clientEmail: string;
  }): Promise<string> {
    try {
      const classId = `${this.issuerId}.offers`;
      const objectId = `${this.issuerId}.offer_${params.offerId}`;

      await this.createPassClass(classId, 'Real Estate Offers');

      const offerObject = {
        id: objectId,
        classId,
        state: 'ACTIVE',
        title: params.title,
        textModulesData: [
          {
            header: 'Offer Details',
            body: params.description,
          },
        ],
        validTimeInterval: {
          end: {
            date: params.validUntil.toISOString(),
          },
        },
        barcode: {
          type: 'QR_CODE',
          value: params.offerId,
        },
      };

      await this.savePassObject(offerObject);

      const saveUrl = await this.generateSaveUrl([offerObject]);

      console.log(`âœ“ Created offer pass: ${objectId}`);
      return saveUrl;
    } catch (error) {
      console.error('Failed to create offer pass:', error);
      throw error;
    }
  }

  /**
   * Update loyalty points
   */
  async updateLoyaltyPoints(
    programId: string,
    newPoints: number
  ): Promise<void> {
    try {
      const objectId = `${this.issuerId}.loyalty_${programId}`;

      const updatePayload = {
        loyaltyPoints: {
          balance: {
            int: newPoints,
          },
        },
      };

      await this.patchPassObject(objectId, updatePayload);

      console.log(`âœ“ Updated loyalty points for ${programId}: ${newPoints}`);
    } catch (error) {
      console.error('Failed to update loyalty points:', error);
      throw error;
    }
  }

  /**
   * Expire/deactivate pass
   */
  async expirePass(objectId: string): Promise<void> {
    try {
      await this.patchPassObject(objectId, { state: 'EXPIRED' });
      console.log(`âœ“ Expired pass: ${objectId}`);
    } catch (error) {
      console.error('Failed to expire pass:', error);
      throw error;
    }
  }

  /**
   * Create pass class (if not exists)
   */
  private async createPassClass(classId: string, title: string): Promise<void> {
    try {
      const token = await this.jwtClient.authorize();

      const classPayload = {
        id: classId,
        issuerName: 'Infinity X One Real Estate',
        reviewStatus: 'UNDER_REVIEW',
        textModulesData: [
          {
            header: 'Instructions',
            body: 'Show this pass to access the property or claim your reward.',
          },
        ],
      };

      await axios.post(
        'https://walletobjects.googleapis.com/walletobjects/v1/genericClass',
        classPayload,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`âœ“ Created pass class: ${classId}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Class already exists
        console.log(`Pass class already exists: ${classId}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Create loyalty class
   */
  private async createLoyaltyClass(classId: string): Promise<void> {
    try {
      const token = await this.jwtClient.authorize();

      const classPayload = {
        id: classId,
        issuerName: 'Infinity X One Real Estate',
        programName: 'Real Estate Rewards',
        programLogo: {
          sourceUri: {
            uri: process.env.LOGO_URL || '',
          },
        },
        reviewStatus: 'UNDER_REVIEW',
      };

      await axios.post(
        'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
        classPayload,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`âœ“ Created loyalty class: ${classId}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`Loyalty class already exists: ${classId}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Save pass object
   */
  private async savePassObject(passObject: any): Promise<void> {
    const token = await this.jwtClient.authorize();

    await axios.post(
      'https://walletobjects.googleapis.com/walletobjects/v1/genericObject',
      passObject,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Patch/update pass object
   */
  private async patchPassObject(objectId: string, updates: any): Promise<void> {
    const token = await this.jwtClient.authorize();

    await axios.patch(
      `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Generate "Add to Google Wallet" URL
   */
  private async generateSaveUrl(objects: any[]): Promise<string> {
    const payload = {
      iss: this.jwtClient.email,
      aud: 'google',
      origins: [process.env.BASE_URL || 'https://infinityxai.com'],
      typ: 'savetowallet',
      payload: {
        genericObjects: objects,
      },
    };

    const token = await this.jwtClient.sign(payload);
    return `https://pay.google.com/gp/v/save/${token}`;
  }
}

export default new GoogleWalletService();
