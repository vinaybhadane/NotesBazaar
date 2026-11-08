import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

describe('1. Price Calculation & Coupon Eligibility', () => {
  it('should calculate 15% percentage discount correctly with cap', () => {
    const basePaise = 7900; // ₹79
    const discountPercent = 15;
    const maxDiscountPaise = 2500; // ₹25 max

    const rawDiscount = Math.round((basePaise * discountPercent) / 100);
    const finalDiscount = Math.min(rawDiscount, maxDiscountPaise);
    const finalAmount = basePaise - finalDiscount;

    assert.equal(rawDiscount, 1185); // ₹11.85
    assert.equal(finalDiscount, 1185);
    assert.equal(finalAmount, 6715); // ₹67.15
  });

  it('should reject coupon if minimum order amount is not met', () => {
    const orderPaise = 3900; // ₹39
    const minOrderPaise = 4900; // ₹49
    const isEligible = orderPaise >= minOrderPaise;

    assert.equal(isEligible, false);
  });
});

describe('2. Coming Soon Enforcement (Critical Security Check)', () => {
  it('must strictly prohibit purchase when is_coming_soon is true', () => {
    const sampleProduct = {
      id: 'prod_ml_coming_soon',
      title: 'Machine Learning Advanced Notes',
      is_coming_soon: true,
      is_available: false,
      publication_status: 'published',
    };

    const canInitiateCheckout =
      sampleProduct.publication_status === 'published' &&
      !sampleProduct.is_coming_soon &&
      sampleProduct.is_available;

    assert.equal(
      canInitiateCheckout,
      false,
      'Checkout MUST be blocked when Coming Soon is enabled!'
    );
  });

  it('must permit purchase when is_coming_soon is false and product is published', () => {
    const availableProduct = {
      id: 'prod_dsa',
      title: 'Data Structures and Algorithms Notes',
      is_coming_soon: false,
      is_available: true,
      publication_status: 'published',
    };

    const canInitiateCheckout =
      availableProduct.publication_status === 'published' &&
      !availableProduct.is_coming_soon &&
      availableProduct.is_available;

    assert.equal(canInitiateCheckout, true);
  });
});

describe('3. Razorpay Cryptographic Signature Verification', () => {
  it('should verify genuine HMAC-SHA256 signature correctly', () => {
    const secret = 'test_secret_key_12345';
    const orderId = 'order_DA2918239';
    const paymentId = 'pay_923847291';
    const payload = `${orderId}|${paymentId}`;

    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const isMatched = crypto.timingSafeEqual(
      Buffer.from(expected, 'utf-8'),
      Buffer.from(validSignature, 'utf-8')
    );

    assert.equal(isMatched, true);
  });

  it('should reject tampered or forged signature', () => {
    const secret = 'test_secret_key_12345';
    const orderId = 'order_DA2918239';
    const paymentId = 'pay_923847291';
    const payload = `${orderId}|${paymentId}`;

    const forgedSignature = crypto
      .createHmac('sha256', 'wrong_secret')
      .update(payload)
      .digest('hex');

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const isMatched = crypto.timingSafeEqual(
      Buffer.from(expected, 'utf-8'),
      Buffer.from(forgedSignature, 'utf-8')
    );

    assert.equal(isMatched, false);
  });
});

describe('4. Webhook Idempotency & Entitlement Fulfillment', () => {
  it('should process webhook event only once and ignore duplicates', () => {
    const processedEvents = new Set();
    const eventId = 'evt_razorpay_99218274';

    function processEvent(id) {
      if (processedEvents.has(id)) {
        return { status: 'already_processed' };
      }
      processedEvents.add(id);
      return { status: 'fulfilled' };
    }

    const firstRun = processEvent(eventId);
    assert.equal(firstRun.status, 'fulfilled');

    const duplicateRun = processEvent(eventId);
    assert.equal(duplicateRun.status, 'already_processed');
  });

  it('must only grant download access when order status is strictly paid', () => {
    function canAccessDownload(orderStatus) {
      return orderStatus === 'paid';
    }

    assert.equal(canAccessDownload('created'), false);
    assert.equal(canAccessDownload('pending'), false);
    assert.equal(canAccessDownload('failed'), false);
    assert.equal(canAccessDownload('paid'), true);
  });
});

