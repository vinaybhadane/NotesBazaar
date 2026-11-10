import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { razorpayService } from '@/lib/razorpay';
import { Payment } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Signature Verification using raw body
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
      }

      const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // 2. Idempotency Check: Don't process the same webhook event twice!
    const alreadyProcessed = await db.isWebhookProcessed(eventId);
    if (alreadyProcessed) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // 3. Process Events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const rpOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
      const rpPaymentId = paymentEntity?.id;

      if (rpOrderId) {
        const order = await db.getOrderByRazorpayOrderId(rpOrderId);
        if (order && order.status !== 'paid') {
          // Fulfill order
          await db.updateOrderStatus(order.id, 'paid', rpPaymentId);

          if (rpPaymentId) {
            const paymentRecord: Payment = {
              id: `pay_${Date.now()}`,
              order_id: order.id,
              razorpay_order_id: rpOrderId,
              razorpay_payment_id: rpPaymentId,
              amount_in_paise: order.final_amount_in_paise,
              currency: 'INR',
              status: 'captured',
              verified_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            };
            await db.recordPayment(paymentRecord);
          }

          // Grant download entitlements
          if (order.items) {
            for (const item of order.items) {
              await db.createEntitlement(order.user_id, item.product_id, order.id);
            }
          }
        }
      }
    }

    // 4. Record event as processed
    await db.recordWebhookProcessed(eventId);

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/orders');
      revalidatePath('/admin/payments');
      revalidatePath('/account/downloads');
      revalidatePath('/account/purchases');
      revalidatePath('/account');
    } catch {}

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing error' }, { status: 500 });
  }
}

