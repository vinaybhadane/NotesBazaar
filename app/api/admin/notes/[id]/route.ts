import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const resolved = await params;
  const product = await db.getProductById(resolved.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const body = await req.json();

    const updated = await db.updateProduct(resolved.id, {
      ...body,
      is_available: !Boolean(body.is_coming_soon),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Log admin audit
    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'UPDATE_NOTE',
      entity_type: 'product',
      entity_id: resolved.id,
      details: `Updated note "${updated.title}"`,
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error('[API /api/admin/notes/[id] PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const deleted = await db.deleteProduct(resolved.id);

    // Log admin audit
    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'DELETE_NOTE',
      entity_type: 'product',
      entity_id: resolved.id,
    });

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('[API /api/admin/notes/[id] PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update note' }, { status: 500 });
  }
}

