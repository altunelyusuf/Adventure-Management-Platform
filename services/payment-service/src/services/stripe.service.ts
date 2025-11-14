import Stripe from 'stripe';
import { AppDataSource } from '../config/database';
import { Subscription, SubscriptionStatus } from '../models/Subscription.entity';
import { Payment, PaymentStatus } from '../models/Payment.entity';
import { Repository } from 'typeorm';
import config from '../config';

export class StripeService {
  private stripe: Stripe;
  private subscriptionRepository: Repository<Subscription>;
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: config.stripe.apiVersion,
    });
    this.subscriptionRepository = AppDataSource.getRepository(Subscription);
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  async createSubscription(
    userId: string,
    creatorId: string,
    priceId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    // Create or retrieve Stripe customer
    const customer = await this.stripe.customers.create({
      metadata: { userId },
    });

    // Attach payment method
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await this.stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: { userId, creatorId },
    });

    // Save to database
    const subscription = this.subscriptionRepository.create({
      userId,
      creatorId,
      stripeSubscriptionId: stripeSubscription.id,
      amount: (stripeSubscription.items.data[0].price.unit_amount || 0) / 100,
      currency: stripeSubscription.currency.toUpperCase(),
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe
    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Update database
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();

    return this.subscriptionRepository.save(subscription);
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCreatorSubscribers(creatorId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { creatorId, status: SubscriptionStatus.ACTIVE },
    });
  }

  async getCreatorRevenue(creatorId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.creator_amount)', 'total')
      .where('payment.creator_id = :creatorId', { creatorId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCEEDED });

    if (startDate) {
      query.andWhere('payment.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('payment.created_at <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) return;

    const amount = (invoice.amount_paid || 0) / 100;
    const platformFee = amount * (config.payment.platformFeePercentage / 100);
    const creatorAmount = amount - platformFee;

    const payment = this.paymentRepository.create({
      subscriptionId: subscription.subscriptionId,
      userId: subscription.userId,
      creatorId: subscription.creatorId,
      stripePaymentIntentId: invoice.payment_intent as string,
      amount,
      platformFee,
      creatorAmount,
      currency: subscription.currency,
      status: PaymentStatus.SUCCEEDED,
      succeededAt: new Date(),
    });

    await this.paymentRepository.save(payment);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.PAST_DUE;
    await this.subscriptionRepository.save(subscription);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    await this.subscriptionRepository.save(subscription);
  }
}
