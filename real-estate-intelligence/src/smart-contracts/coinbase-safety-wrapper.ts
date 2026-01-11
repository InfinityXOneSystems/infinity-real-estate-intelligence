/**
 * Coinbase Transaction Safety Wrapper
 * Implements transaction limits and monitoring for personal/business account safety
 */

import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

interface TransactionLimit {
  maxTransactionAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  requireApprovalAbove: number;
}

interface TransactionRecord {
  timestamp: Date;
  amount: number;
  type: 'buy' | 'sell' | 'send' | 'receive';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transactionId?: string;
}

/**
 * Safety wrapper for Coinbase API calls with transaction limits
 */
export class CoinbaseSafetyWrapper {
  private keyId: string;
  private secret: string;
  private baseUrl = 'https://api.coinbase.com';

  // Transaction tracking
  private transactionHistory: TransactionRecord[] = [];

  // Safety limits (configurable)
  private limits: TransactionLimit = {
    maxTransactionAmount: 1000, // $1,000 max per transaction
    dailyLimit: 5000, // $5,000 per day
    monthlyLimit: 50000, // $50,000 per month
    requireApprovalAbove: 500, // Manual approval required above $500
  };

  constructor(keyId?: string, secret?: string) {
    this.keyId = keyId || process.env.COINBASE_API_KEY_ID || '';
    this.secret = secret || process.env.COINBASE_SECRET || '';

    if (!this.keyId || !this.secret) {
      throw new Error('Coinbase API credentials not found');
    }
  }

  /**
   * Generate HMAC signature for Coinbase API authentication
   */
  private generateSignature(
    timestamp: number,
    method: string,
    path: string,
    body: string = ''
  ): string {
    const message = `${timestamp}${method}${path}${body}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Check if transaction is within safety limits
   */
  private checkTransactionLimits(amount: number): {
    allowed: boolean;
    reason?: string;
    requiresApproval: boolean;
  } {
    // Check single transaction limit
    if (amount > this.limits.maxTransactionAmount) {
      return {
        allowed: false,
        reason: `Transaction amount $${amount} exceeds max transaction limit $${this.limits.maxTransactionAmount}`,
        requiresApproval: false,
      };
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTotal = this.transactionHistory
      .filter(
        (tx) =>
          tx.timestamp >= today && ['completed', 'pending'].includes(tx.status)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (dailyTotal + amount > this.limits.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily limit exceeded. Current: $${dailyTotal}, Limit: $${this.limits.dailyLimit}`,
        requiresApproval: false,
      };
    }

    // Check monthly limit
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthlyTotal = this.transactionHistory
      .filter(
        (tx) =>
          tx.timestamp >= thisMonth &&
          ['completed', 'pending'].includes(tx.status)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (monthlyTotal + amount > this.limits.monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly limit exceeded. Current: $${monthlyTotal}, Limit: $${this.limits.monthlyLimit}`,
        requiresApproval: false,
      };
    }

    // Check if manual approval required
    const requiresApproval = amount > this.limits.requireApprovalAbove;

    return {
      allowed: true,
      requiresApproval,
    };
  }

  /**
   * Get account balance (read-only, safe operation)
   */
  async getAccountBalance(accountId: string): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const method = 'GET';
    const path = `/v2/accounts/${accountId}`;
    const signature = this.generateSignature(timestamp, method, path);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'CB-ACCESS-KEY': this.keyId,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp.toString(),
        'CB-VERSION': '2025-12-09',
      },
    });

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all accounts (read-only, safe operation)
   */
  async getAllAccounts(): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const method = 'GET';
    const path = '/v2/accounts';
    const signature = this.generateSignature(timestamp, method, path);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'CB-ACCESS-KEY': this.keyId,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp.toString(),
        'CB-VERSION': '2025-12-09',
      },
    });

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Buy cryptocurrency with safety checks
   */
  async buyCrypto(
    accountId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<any> {
    console.log(`\nðŸ”’ Safety Check: Buy $${amount} worth of crypto`);

    // Check limits
    const limitCheck = this.checkTransactionLimits(amount);

    if (!limitCheck.allowed) {
      console.error(`âŒ Transaction blocked: ${limitCheck.reason}`);
      throw new Error(`Transaction blocked: ${limitCheck.reason}`);
    }

    if (limitCheck.requiresApproval) {
      console.warn(
        `âš ï¸ Manual approval required for transaction over $${this.limits.requireApprovalAbove}`
      );
      console.warn(
        '   Set COINBASE_AUTO_APPROVE=true in .env to override (not recommended)'
      );

      if (process.env.COINBASE_AUTO_APPROVE !== 'true') {
        throw new Error(
          'Manual approval required. Transaction blocked for safety.'
        );
      }
    }

    // Record transaction attempt
    const record: TransactionRecord = {
      timestamp: new Date(),
      amount,
      type: 'buy',
      status: 'pending',
    };
    this.transactionHistory.push(record);

    console.log('âœ… Safety checks passed. Executing transaction...');

    // Execute transaction
    const timestamp = Math.floor(Date.now() / 1000);
    const method = 'POST';
    const path = `/v2/accounts/${accountId}/buys`;
    const body = JSON.stringify({
      amount,
      currency,
      commit: true,
    });
    const signature = this.generateSignature(timestamp, method, path, body);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'CB-ACCESS-KEY': this.keyId,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp.toString(),
          'CB-VERSION': '2025-12-09',
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        record.status = 'rejected';
        throw new Error(`Coinbase buy failed: ${response.statusText}`);
      }

      const result = await response.json();
      record.status = 'completed';
      record.transactionId = result.data?.id;

      console.log(`âœ… Transaction completed: ${record.transactionId}`);

      return result;
    } catch (error) {
      record.status = 'rejected';
      throw error;
    }
  }

  /**
   * Get transaction history summary
   */
  getTransactionSummary(): {
    totalTransactions: number;
    dailySpent: number;
    monthlySpent: number;
    remainingDaily: number;
    remainingMonthly: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const dailySpent = this.transactionHistory
      .filter(
        (tx) =>
          tx.timestamp >= today && ['completed', 'pending'].includes(tx.status)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const monthlySpent = this.transactionHistory
      .filter(
        (tx) =>
          tx.timestamp >= thisMonth &&
          ['completed', 'pending'].includes(tx.status)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalTransactions: this.transactionHistory.length,
      dailySpent,
      monthlySpent,
      remainingDaily: this.limits.dailyLimit - dailySpent,
      remainingMonthly: this.limits.monthlyLimit - monthlySpent,
    };
  }

  /**
   * Update safety limits (use carefully)
   */
  updateLimits(newLimits: Partial<TransactionLimit>): void {
    console.warn(
      'âš ï¸ Updating transaction limits. Ensure this is authorized.'
    );
    this.limits = { ...this.limits, ...newLimits };
    console.log('Updated limits:', this.limits);
  }

  /**
   * Get exchange rates (read-only, safe)
   */
  async getExchangeRates(currency: string = 'USD'): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v2/exchange-rates?currency=${currency}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get spot price for currency pair (read-only, safe)
   */
  async getSpotPrice(currencyPair: string = 'BTC-USD'): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v2/prices/${currencyPair}/spot`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch spot price: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export default new CoinbaseSafetyWrapper();
