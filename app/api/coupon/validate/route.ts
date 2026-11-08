import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, amountInPaise } = await req.json();
    if (!code || typeof amountInPaise !== 'number') {
      return NextResponse.json({ error: 'Code and order amount are required.' }, { status: 400 });
    }

    const offer = await db.getOfferByCode(code.trim());
    if (!offer) {
      return NextResponse.json({ error: 'Invalid, expired, or inactive coupon code.' }, { status: 404 });
    }

    if (amountInPaise < offer.min_order_amount_in_paise) {
      const minRupees = offer.min_order_amount_in_paise / 100;
      return NextResponse.json(
        { error: `This coupon requires a minimum order value of ₹${minRupees}.` },
        { status: 400 }
      );
    }

    let discountInPaise = 0;
    if (offer.discount_type === 'percentage') {
      discountInPaise = Math.round((amountInPaise * offer.discount_value) / 100);
      if (offer.max_discount_in_paise && discountInPaise > offer.max_discount_in_paise) {
        discountInPaise = offer.max_discount_in_paise;
      }
    } else {
      // Fixed discount
      discountInPaise = offer.discount_value;
    }

    discountInPaise = Math.min(discountInPaise, amountInPaise);

    return NextResponse.json({
      valid: true,
      code: offer.code,
      title: offer.title,
      discountInPaise,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

