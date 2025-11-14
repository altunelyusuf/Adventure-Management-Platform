import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

router.post('/subscriptions', paymentController.createSubscription);
router.delete('/subscriptions/:subscriptionId', paymentController.cancelSubscription);
router.get('/subscriptions', paymentController.getUserSubscriptions);
router.get('/revenue/:creatorId', paymentController.getCreatorRevenue);
router.post('/webhooks/stripe', paymentController.handleWebhook);

export default router;
