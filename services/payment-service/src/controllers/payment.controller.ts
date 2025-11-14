import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';

export class PaymentController {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
  }

  createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { creatorId, priceId, paymentMethodId } = req.body;

      const subscription = await this.stripeService.createSubscription(
        userId,
        creatorId,
        priceId,
        paymentMethodId
      );

      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;
      const subscription = await this.stripeService.cancelSubscription(subscriptionId);
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const subscriptions = await this.stripeService.getUserSubscriptions(userId);
      res.json({ subscriptions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getCreatorRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { creatorId } = req.params;
      const revenue = await this.stripeService.getCreatorRevenue(creatorId);
      res.json({ revenue });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await this.stripeService.handleWebhook(req.body, signature);
      res.status(200).json({ received: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
