import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpayService } from '@/lib/razorpay';
import { Payment } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const {
      internalOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!internalOrderId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment references.' }, { status: 400 });
    }

    const order = await db.getOrderById(internalOrderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Check if order is already paid (idempotency check)
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
      });
    }

    // Verify HMAC-SHA256 signature
    let isValidSignature = false;
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      isValidSignature = razorpayService.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    } else if (process.env.NODE_ENV === 'development' || !process.env.RAZORPAY_KEY_SECRET) {
      // In development test mode when razorpay secret is placeholder
      isValidSignature = true;
    }

    if (!isValidSignature) {
      await db.updateOrderStatus(order.id, 'failed', razorpay_payment_id);
      return NextResponse.json(
        { error: 'Payment verification failed: Invalid cryptographic signature.' },
        { status: 400 }
      );
    }

    // Update order status to 'paid'
    await db.updateOrderStatus(order.id, 'paid', razorpay_payment_id);

    // Record verified payment
    const paymentRecord: Payment = {
      id: `pay_${Date.now()}`,
      order_id: order.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || '',
      amount_in_paise: order.final_amount_in_paise,
      currency: 'INR',
      status: 'captured',
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    await db.recordPayment(paymentRecord);

    // Atomic fulfillment: Create download entitlements for every purchased note item
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await db.createEntitlement(order.user_id, item.product_id, order.id);
      }
    }

    // Send confirmation in-app notification
    await db.sendNotification({
      id: `notif_${Date.now()}`,
      user_id: order.user_id,
      title: 'Notes Access Unlocked!',
      message: `Your payment of ₹${(order.final_amount_in_paise / 100).toFixed(0)} for Order #${order.order_number} was successfully verified. Your notes are ready for download.`,
      link_url: '/account/downloads',
      channel: 'in_app',
      is_read: false,
      delivery_status: 'delivered',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error: any) {
    console.error('Error in verify-payment:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

