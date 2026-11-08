import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId, isComingSoon } = await req.json();

    if (!productId || typeof isComingSoon !== 'boolean') {
      return NextResponse.json({ error: 'Product ID and isComingSoon boolean are required' }, { status: 400 });
    }

    const updated = await db.updateProduct(productId, {
      is_coming_soon: isComingSoon,
      // If coming soon is ON, is_available should be false
      is_available: !isComingSoon,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Log admin audit
    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: isComingSoon ? 'ENABLE_COMING_SOON' : 'DISABLE_COMING_SOON',
      entity_type: 'product',
      entity_id: productId,
      details: `Coming soon toggle changed to ${isComingSoon} for product "${updated.title}"`,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

