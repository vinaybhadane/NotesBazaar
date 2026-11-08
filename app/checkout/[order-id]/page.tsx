import React from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout | NotesBazaar by AbhyasMitra',
  robots: {
    index: false,
    follow: false,
  },
};

interface CheckoutPageProps {
  params: Promise<{ 'order-id': string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const resolved = await params;
  const orderId = resolved['order-id'];
  const order = await db.getOrderById(orderId);

  if (!order) {
    notFound();
  }

  if (order.status === 'paid') {
    redirect(`/payment/success?order_id=${order.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Complete Your Order
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Order Reference: {order.order_number}
        </p>
      </div>

      <CheckoutClient order={order} />
    </div>
  );
}

