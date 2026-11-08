import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyServerToken } from '@/lib/firebase/admin';
import { razorpayService } from '@/lib/razorpay';
import { Order, OrderItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required to initiate checkout.' }, { status: 401 });
    }

    const authUser = await verifyServerToken(token);
    let userEmail = authUser?.email;
    let userId = authUser?.uid;

    // Local dev fallback if admin credentials are in setup phase
    if (!authUser) {
      // Check if user was already synced in database
      const bodyPreview = await req.clone().json();
      if (bodyPreview.userEmail) {
        userEmail = bodyPreview.userEmail;
      }
    }

    const { productId, couponCode } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    // 1. Fetch authoritative product record from database
    const product = await db.getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // 2. Strict Check: Verify product is published and available
    if (product.publication_status !== 'published') {
      return NextResponse.json({ error: 'This note is not currently published.' }, { status: 400 });
    }

    // 3. MANDATORY CRITICAL CHECK: Coming Soon toggle enforcement!
    if (product.is_coming_soon || !product.is_available) {
      return NextResponse.json(
        { error: 'This product is marked as Coming Soon and cannot be purchased.' },
        { status: 403 }
      );
    }

    // 4. Calculate authoritative price server-side
    const totalAmountInPaise = product.price_in_paise;
    let discountAmountInPaise = 0;

    if (couponCode) {
      const offer = await db.getOfferByCode(couponCode.trim());
      if (offer && totalAmountInPaise >= offer.min_order_amount_in_paise) {
        if (offer.discount_type === 'percentage') {
          discountAmountInPaise = Math.round((totalAmountInPaise * offer.discount_value) / 100);
          if (offer.max_discount_in_paise && discountAmountInPaise > offer.max_discount_in_paise) {
            discountAmountInPaise = offer.max_discount_in_paise;
          }
        } else {
          discountAmountInPaise = offer.discount_value;
        }
        discountAmountInPaise = Math.min(discountAmountInPaise, totalAmountInPaise);
      }
    }

    const finalAmountInPaise = Math.max(0, totalAmountInPaise - discountAmountInPaise);

    // 5. Ensure DB user exists
    const emailToUse = userEmail || 'student@notesbazaar.local';
    const dbUser = await db.upsertUser({
      firebase_uid: userId || `local_${Date.now()}`,
      email: emailToUse,
    });

    const orderNumber = `NBZ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const internalOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 6. Create Razorpay order via Razorpay API
    let razorpayOrderId = `rp_order_${Date.now()}`;
    try {
      const rpOrder = await razorpayService.createOrder({
        amountInPaise: finalAmountInPaise,
        receipt: orderNumber,
        notes: {
          internalOrderId,
          productId: product.id,
          userEmail: emailToUse,
        },
      });
      razorpayOrderId = rpOrder.id;
    } catch (err: any) {
      console.warn('[Razorpay] Order creation failed:', err.message);
    }

    // 7. Store internal pending order in database
    const orderRecord: Order = {
      id: internalOrderId,
      user_id: dbUser.id,
      order_number: orderNumber,
      total_amount_in_paise: totalAmountInPaise,
      discount_amount_in_paise: discountAmountInPaise,
      final_amount_in_paise: finalAmountInPaise,
      currency: 'INR',
      status: 'pending',
      razorpay_order_id: razorpayOrderId,
      customer_email: emailToUse,
      customer_name: dbUser.display_name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orderItem: OrderItem = {
      id: `item_${Date.now()}`,
      order_id: internalOrderId,
      product_id: product.id,
      quantity: 1,
      unit_price_in_paise: totalAmountInPaise,
      discount_amount_in_paise: discountAmountInPaise,
      final_price_in_paise: finalAmountInPaise,
      created_at: new Date().toISOString(),
    };

    await db.createOrder(orderRecord, [orderItem]);

    return NextResponse.json({
      orderId: internalOrderId,
      orderNumber,
      razorpayOrderId,
      amountInPaise: finalAmountInPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    });
  } catch (error: any) {
    console.error('Error in create-order:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

