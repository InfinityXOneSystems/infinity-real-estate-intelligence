/**
 * Stripe Payment Integration for Real Estate Intelligence
 * Handles escrow payments, webhooks, and blockchain synchronization
 */

import Stripe from 'stripe';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

interface EscrowPaymentIntent {
  propertyId: string;
  buyerEmail: string;
  sellerEmail: string;
  amount: number; // in cents
  currency: string;
  metadata: {
    propertyAddress: string;
    transactionType: 'deposit' | 'full-payment' | 'earnest-money';
  };
}

interface BlockchainTransaction {
  transactionId: string;
  contractAddress: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export class StripePaymentService {
  private stripe: Stripe;
  private provider: ethers.JsonRpcProvider | null = null;
  private escrowContract: ethers.Contract | null = null;

  constructor() {
    this.stripe = stripe;

    // Initialize blockchain connection for testnet
    if (process.env.INFURA_PROJECT_ID && process.env.BLOCKCHAIN_NETWORK) {
      const network = process.env.BLOCKCHAIN_NETWORK;
      const rpcUrl = `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Load escrow contract if deployed
      if (process.env.CONTRACT_ADDRESS_ESCROW && process.env.PRIVATE_KEY) {
        const wallet = new ethers.Wallet(
          process.env.PRIVATE_KEY,
          this.provider
        );
        // Contract ABI will be loaded from artifacts after compilation
        // this.escrowContract = new ethers.Contract(address, abi, wallet);
      }
    }
  }

  /**
   * Create a payment intent for escrow deposit
   */
  async createEscrowPaymentIntent(
    params: EscrowPaymentIntent
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        payment_method_types: ['card'],
        metadata: {
          propertyId: params.propertyId,
          buyerEmail: params.buyerEmail,
          sellerEmail: params.sellerEmail,
          propertyAddress: params.metadata.propertyAddress,
          transactionType: params.metadata.transactionType,
        },
        description: `Real Estate Escrow - ${params.propertyId}`,
        statement_descriptor: 'RE Escrow',
        capture_method: 'manual', // Hold funds until approved
      });

      console.log(`âœ“ Created payment intent: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Capture held payment after approval
   */
  async capturePayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.capture(paymentIntentId);
      console.log(`âœ“ Captured payment: ${paymentIntentId}`);

      // Trigger blockchain escrow deposit
      if (this.escrowContract && paymentIntent.status === 'succeeded') {
        await this.depositToBlockchain(paymentIntent);
      }

      return paymentIntent;
    } catch (error) {
      console.error('Failed to capture payment:', error);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentIntentId: string,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason:
          reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer',
      });

      console.log(`âœ“ Refunded payment: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      console.error('Failed to refund payment:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      console.log(`Received webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to blockchain escrow contract
   */
  private async depositToBlockchain(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<BlockchainTransaction> {
    if (!this.escrowContract || !this.provider) {
      throw new Error('Blockchain not configured');
    }

    try {
      const transactionId = ethers.id(paymentIntent.id);
      const amount = ethers.parseEther((paymentIntent.amount / 100).toString()); // Convert cents to ETH

      const tx = await this.escrowContract.depositFunds(
        transactionId,
        paymentIntent.id,
        { value: amount }
      );

      const receipt = await tx.wait();

      console.log(`âœ“ Blockchain deposit: ${receipt.hash}`);

      return {
        transactionId,
        contractAddress: await this.escrowContract.getAddress(),
        transactionHash: receipt.hash,
        status: 'confirmed',
      };
    } catch (error) {
      console.error('Blockchain deposit failed:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log(`âœ“ Payment succeeded: ${paymentIntent.id}`);
    // Trigger notifications, update database, etc.
  }

  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.error(`âœ— Payment failed: ${paymentIntent.id}`);
    // Send failure notifications
  }

  private async handlePaymentCanceled(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log(`Payment canceled: ${paymentIntent.id}`);
    // Clean up any pending blockchain transactions
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    console.log(`Refund processed: ${charge.id}`);
    // Trigger blockchain refund if applicable
  }

  /**
   * Create customer for recurring transactions
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'real-estate-intelligence',
        },
      });

      console.log(`âœ“ Created customer: ${customer.id}`);
      return customer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Create subscription for property management fees
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string>
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
      });

      console.log(`âœ“ Created subscription: ${subscription.id}`);
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a customer
   */
  async getPaymentHistory(customerId: string): Promise<Stripe.PaymentIntent[]> {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      return paymentIntents.data;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }
}

export default new StripePaymentService();
