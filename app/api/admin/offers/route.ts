import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const offers = await db.getActiveOffers();
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.createOffer(body);

    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'CREATE_OFFER',
      entity_type: 'offer',
      entity_id: created.id,
      details: `Created coupon code ${created.code}`,
    });

    return NextResponse.json({ offer: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

