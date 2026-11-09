import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

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
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
      if (formData.has('title')) body.title = formData.get('title') as string;
      if (formData.has('slug')) body.slug = formData.get('slug') as string;
      if (formData.has('branch_id')) body.branch_id = formData.get('branch_id') as string;
      if (formData.has('year_id')) body.year_id = formData.get('year_id') as string;
      if (formData.has('pattern_id')) body.pattern_id = formData.get('pattern_id') as string;
      if (formData.has('subject_id')) body.subject_id = formData.get('subject_id') as string;
      if (formData.has('subject_name')) body.subject_name = formData.get('subject_name') as string;
      if (formData.has('short_description')) body.short_description = formData.get('short_description') as string;
      if (formData.has('full_description')) body.full_description = formData.get('full_description') as string;
      if (formData.has('price_in_paise')) {
        body.price_in_paise = parseInt(formData.get('price_in_paise') as string, 10);
      }
      if (formData.has('compare_at_price_in_paise')) {
        const val = formData.get('compare_at_price_in_paise') as string;
        body.compare_at_price_in_paise = val ? parseInt(val, 10) : null;
      }
      if (formData.has('publication_status')) {
        body.publication_status = formData.get('publication_status') as any;
      }
      if (formData.has('is_coming_soon')) {
        body.is_coming_soon = formData.get('is_coming_soon') === 'true';
      }
      if (formData.has('page_count')) {
        body.page_count = parseInt(formData.get('page_count') as string, 10);
      }

      const topicsRaw = formData.get('topics_covered');
      if (topicsRaw && typeof topicsRaw === 'string') {
        try {
          body.topics_covered = JSON.parse(topicsRaw);
        } catch {
          body.topics_covered = topicsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
        }
      }

      file = formData.get('file') as File | null;
    } else {
      body = await req.json();
    }

    if (file && file.size > 0) {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const uploadResult = await storage.uploadPrivateNote(buffer, file.name, resolved.id);
      await db.recordProductFile({
        product_id: resolved.id,
        blob_container: uploadResult.container,
        blob_name: uploadResult.blobName,
        original_filename: file.name,
        file_size_bytes: uploadResult.size,
        mime_type: file.type || 'application/pdf',
      });
      body.file_size_bytes = uploadResult.size;
    }

    const updated = await db.updateProduct(resolved.id, {
      ...body,
      is_available: typeof body.is_coming_soon === 'boolean' ? !body.is_coming_soon : undefined,
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

    try {
      revalidatePath('/notes');
      revalidatePath('/admin/notes');
      revalidatePath('/');
      revalidatePath(`/notes/${updated.slug}`);
    } catch (e) {
      console.warn('[RevalidatePath error]:', e);
    }

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

    try {
      revalidatePath('/notes');
      revalidatePath('/admin/notes');
      revalidatePath('/');
    } catch (e) {
      console.warn('[RevalidatePath error]:', e);
    }

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('[API /api/admin/notes/[id] DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete note' }, { status: 500 });
  }
}
