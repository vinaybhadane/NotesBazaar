import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance: Razorpay | null = null;

if (key_id && key_secret) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  } catch (err) {
    console.warn('[Razorpay] Client initialization failed:', (err as Error).message);
  }
}

export const razorpayService = {
  isConfigured(): boolean {
    return Boolean(key_id && key_secret);
  },

  async createOrder(params: {
    amountInPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    if (!razorpayInstance) {
      // In test mode if keys are missing
      const mockId = `order_test_${Date.now()}`;
      return { id: mockId, amount: params.amountInPaise, currency: 'INR' };
    }

    const order = await razorpayInstance.orders.create({
      amount: params.amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  },

  verifyPaymentSignature(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): boolean {
    if (!key_secret) {
      console.warn('[Razorpay] Signature verification skipped: RAZORPAY_KEY_SECRET is not set.');
      return false;
    }

    const text = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const generatedSignature = crypto.createHmac('sha256', key_secret).update(text).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(params.razorpay_signature, 'utf-8')
    );
  },

  verifyWebhookSignature(rawBody: string, webhookSignature: string, customSecret?: string): boolean {
    const secret = customSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret || !webhookSignature) {
      return false;
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(webhookSignature, 'utf-8')
      );
    } catch {
      return false;
    }
  },
};

