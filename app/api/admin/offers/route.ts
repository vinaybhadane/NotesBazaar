import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const offers = await db.getAllOffers();
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
      details: `Created coupon code ${created.code} with limit ${created.max_uses || 'unlimited'}`,
    });

    return NextResponse.json({ offer: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/offers POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const updated = await db.updateOffer(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'UPDATE_OFFER',
      entity_type: 'offer',
      entity_id: id,
      details: `Updated coupon ${updated.code} limits or settings`,
    });

    return NextResponse.json({ offer: updated });
  } catch (error: any) {
    console.error('[API /api/admin/offers PUT Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const success = await db.deleteOffer(id);
    if (!success) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'DELETE_OFFER',
      entity_type: 'offer',
      entity_id: id,
      details: `Deleted coupon ID ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/admin/offers DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

