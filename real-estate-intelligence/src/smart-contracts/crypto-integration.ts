/**
 * Crypto Payment Integration
 * Coinbase Commerce + Multi-Exchange Support for Real Estate Transactions
 */

import axios from 'axios';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

interface CryptoPaymentRequest {
  propertyId: string;
  amount: number;
  currency: 'USD' | 'EUR';
  buyerEmail: string;
  sellerEmail: string;
  description: string;
}

interface CoinbaseCharge {
  id: string;
  code: string;
  hostedUrl: string;
  pricing: {
    local: { amount: string; currency: string };
    bitcoin: { amount: string; currency: string };
    ethereum: { amount: string; currency: string };
  };
  addresses: {
    bitcoin?: string;
    ethereum?: string;
    usdc?: string;
  };
  expiresAt: string;
  status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'UNRESOLVED';
}

interface ExchangeBalance {
  exchange: string;
  balances: Record<string, number>;
  timestamp: Date;
}

interface CryptoTransaction {
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: Date;
}

export class CryptoPaymentService {
  private coinbaseApiKey: string;
  private provider: ethers.JsonRpcProvider;

  // Exchange API configurations
  private exchanges: {
    coinbase: { key: string; secret: string };
    binance?: { key: string; secret: string };
    kraken?: { key: string; secret: string };
    gemini?: { key: string; secret: string };
  };

  constructor() {
    this.coinbaseApiKey = process.env.COINBASE_COMMERCE_API_KEY || '';

    // Initialize Ethereum provider
    const infuraUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
    this.provider = new ethers.JsonRpcProvider(infuraUrl);

    // Load exchange API keys
    this.exchanges = {
      coinbase: {
        key: process.env.COINBASE_API_KEY || '',
        secret: process.env.COINBASE_API_SECRET || '',
      },
      binance: process.env.BINANCE_API_KEY
        ? {
            key: process.env.BINANCE_API_KEY,
            secret: process.env.BINANCE_API_SECRET || '',
          }
        : undefined,
      kraken: process.env.KRAKEN_API_KEY
        ? {
            key: process.env.KRAKEN_API_KEY,
            secret: process.env.KRAKEN_API_SECRET || '',
          }
        : undefined,
      gemini: process.env.GEMINI_API_KEY
        ? {
            key: process.env.GEMINI_API_KEY,
            secret: process.env.GEMINI_API_SECRET || '',
          }
        : undefined,
    };

    console.log('âœ“ Crypto payment service initialized');
  }

  /**
   * Create Coinbase Commerce charge
   */
  async createCoinbaseCharge(
    request: CryptoPaymentRequest
  ): Promise<CoinbaseCharge> {
    try {
      const response = await axios.post(
        'https://api.commerce.coinbase.com/charges',
        {
          name: `Real Estate - ${request.propertyId}`,
          description: request.description,
          pricing_type: 'fixed_price',
          local_price: {
            amount: request.amount.toString(),
            currency: request.currency,
          },
          metadata: {
            propertyId: request.propertyId,
            buyerEmail: request.buyerEmail,
            sellerEmail: request.sellerEmail,
          },
          redirect_url: `${process.env.BASE_URL}/payment/success`,
          cancel_url: `${process.env.BASE_URL}/payment/cancel`,
        },
        {
          headers: {
            'X-CC-Api-Key': this.coinbaseApiKey,
            'X-CC-Version': '2018-03-22',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`âœ“ Created Coinbase charge: ${response.data.data.id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create Coinbase charge:', error);
      throw error;
    }
  }

  /**
   * Get charge status
   */
  async getChargeStatus(chargeId: string): Promise<CoinbaseCharge> {
    try {
      const response = await axios.get(
        `https://api.commerce.coinbase.com/charges/${chargeId}`,
        {
          headers: {
            'X-CC-Api-Key': this.coinbaseApiKey,
            'X-CC-Version': '2018-03-22',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to get charge status:', error);
      throw error;
    }
  }

  /**
   * Verify Ethereum transaction
   */
  async verifyEthereumTransaction(txHash: string): Promise<CryptoTransaction> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = receipt ? currentBlock - receipt.blockNumber : 0;

      return {
        transactionHash: txHash,
        from: tx.from,
        to: tx.to || '',
        amount: ethers.formatEther(tx.value),
        currency: 'ETH',
        status: receipt
          ? receipt.status === 1
            ? 'confirmed'
            : 'failed'
          : 'pending',
        confirmations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to verify Ethereum transaction:', error);
      throw error;
    }
  }

  /**
   * Get exchange balances (Coinbase)
   */
  async getCoinbaseBalance(): Promise<ExchangeBalance> {
    try {
      const response = await axios.get('https://api.coinbase.com/v2/accounts', {
        headers: {
          Authorization: `Bearer ${this.exchanges.coinbase.key}`,
        },
      });

      const balances: Record<string, number> = {};

      response.data.data.forEach((account: any) => {
        balances[account.currency] = parseFloat(account.balance.amount);
      });

      return {
        exchange: 'coinbase',
        balances,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get Coinbase balance:', error);
      throw error;
    }
  }

  /**
   * Get exchange balances (Binance)
   */
  async getBinanceBalance(): Promise<ExchangeBalance> {
    if (!this.exchanges.binance) {
      throw new Error('Binance API not configured');
    }

    try {
      const timestamp = Date.now();
      const signature = this.generateBinanceSignature(
        `timestamp=${timestamp}`,
        this.exchanges.binance.secret
      );

      const response = await axios.get(
        'https://api.binance.com/api/v3/account',
        {
          params: { timestamp, signature },
          headers: {
            'X-MBX-APIKEY': this.exchanges.binance.key,
          },
        }
      );

      const balances: Record<string, number> = {};

      response.data.balances
        .filter((b: any) => parseFloat(b.free) > 0)
        .forEach((b: any) => {
          balances[b.asset] = parseFloat(b.free) + parseFloat(b.locked);
        });

      return {
        exchange: 'binance',
        balances,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get Binance balance:', error);
      throw error;
    }
  }

  /**
   * Get current crypto prices
   */
  async getCryptoPrices(
    currencies: string[] = ['BTC', 'ETH', 'USDC', 'USDT']
  ): Promise<Record<string, number>> {
    try {
      const symbols = currencies.map((c) => `${c}USDT`).join(',');

      const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/price',
        {
          params: { symbols: `["${symbols.split(',').join('","')}"]` },
        }
      );

      const prices: Record<string, number> = {};

      response.data.forEach((ticker: any) => {
        const currency = ticker.symbol.replace('USDT', '');
        prices[currency] = parseFloat(ticker.price);
      });

      return prices;
    } catch (error) {
      console.error('Failed to get crypto prices:', error);
      return {};
    }
  }

  /**
   * Convert USD to crypto amount
   */
  async convertUsdToCrypto(
    usdAmount: number,
    cryptoCurrency: string
  ): Promise<number> {
    const prices = await this.getCryptoPrices([cryptoCurrency]);
    const price = prices[cryptoCurrency];

    if (!price) {
      throw new Error(`Price not found for ${cryptoCurrency}`);
    }

    return usdAmount / price;
  }

  /**
   * Handle Coinbase webhook
   */
  async handleCoinbaseWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    const expectedSignature = this.generateCoinbaseSignature(
      JSON.stringify(payload),
      process.env.COINBASE_WEBHOOK_SECRET || ''
    );

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    const event = payload.event;
    const charge = payload.data;

    console.log(`Coinbase webhook: ${event.type}`);

    switch (event.type) {
      case 'charge:created':
        console.log(`Charge created: ${charge.id}`);
        break;

      case 'charge:confirmed':
        console.log(`Charge confirmed: ${charge.id}`);
        // Trigger smart contract escrow deposit
        break;

      case 'charge:failed':
        console.log(`Charge failed: ${charge.id}`);
        // Send failure notification
        break;

      case 'charge:delayed':
        console.log(`Charge delayed (pending confirmations): ${charge.id}`);
        break;
    }
  }

  /**
   * Generate Binance signature
   */
  private generateBinanceSignature(query: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(query).digest('hex');
  }

  /**
   * Generate Coinbase webhook signature
   */
  private generateCoinbaseSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Get all exchange balances
   */
  async getAllExchangeBalances(): Promise<ExchangeBalance[]> {
    const balances: ExchangeBalance[] = [];

    try {
      balances.push(await this.getCoinbaseBalance());
    } catch (error) {
      console.error('Coinbase balance fetch failed');
    }

    if (this.exchanges.binance) {
      try {
        balances.push(await this.getBinanceBalance());
      } catch (error) {
        console.error('Binance balance fetch failed');
      }
    }

    return balances;
  }

  /**
   * Create payment QR code data
   */
  generatePaymentQR(
    charge: CoinbaseCharge,
    currency: 'bitcoin' | 'ethereum' | 'usdc'
  ): string {
    const address = charge.addresses[currency];
    const amount = charge.pricing[currency]?.amount || '';

    // Standard crypto payment URI
    return `${currency}:${address}?amount=${amount}`;
  }
}

export default new CryptoPaymentService();
