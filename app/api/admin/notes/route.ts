import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { products } = await db.getProducts({ status: 'all' });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        branch_id: formData.get('branch_id') as string,
        year_id: formData.get('year_id') as string,
        pattern_id: formData.get('pattern_id') as string,
        subject_id: formData.get('subject_id') as string,
        subject_name: formData.get('subject_name') as string,
        short_description: formData.get('short_description') as string,
        full_description: formData.get('full_description') as string,
        price_in_paise: parseInt((formData.get('price_in_paise') as string) || '0', 10),
        compare_at_price_in_paise: formData.get('compare_at_price_in_paise')
          ? parseInt(formData.get('compare_at_price_in_paise') as string, 10)
          : null,
        publication_status: (formData.get('publication_status') as any) || 'published',
        is_coming_soon: formData.get('is_coming_soon') === 'true',
        page_count: formData.get('page_count') ? parseInt(formData.get('page_count') as string, 10) : 65,
      };

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

    if (!body.title || !body.slug || typeof body.price_in_paise !== 'number') {
      return NextResponse.json({ error: 'Title, slug, and price are required' }, { status: 400 });
    }

    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let fileSizeBytes = 0;

    // Upload file if provided
    if (file && file.size > 0) {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      fileSizeBytes = buffer.length;

      const uploadResult = await storage.uploadPrivateNote(buffer, file.name, productId);
      await db.recordProductFile({
        product_id: productId,
        blob_container: uploadResult.container,
        blob_name: uploadResult.blobName,
        original_filename: file.name,
        file_size_bytes: uploadResult.size,
        mime_type: file.type || 'application/pdf',
      });
    }

    const newProduct: Product & { subject_name?: string } = {
      id: productId,
      title: body.title.trim(),
      slug: body.slug.trim(),
      branch_id: body.branch_id || 'br_comp',
      year_id: body.year_id || 'yr_se',
      subject_id: body.subject_id || '',
      subject_name: body.subject_name || body.title,
      pattern_id: body.pattern_id || 'pat_2024',
      short_description: body.short_description || '',
      full_description: body.full_description || '',
      topics_covered: Array.isArray(body.topics_covered) ? body.topics_covered : [],
      price_in_paise: body.price_in_paise,
      compare_at_price_in_paise: body.compare_at_price_in_paise || null,
      publication_status: body.publication_status || 'published',
      is_coming_soon: Boolean(body.is_coming_soon),
      is_available: !Boolean(body.is_coming_soon),
      file_format: 'PDF',
      file_size_bytes: fileSizeBytes || undefined,
      page_count: body.page_count || 65,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await db.createProduct(newProduct);

    // Audit log
    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'CREATE_NOTE',
      entity_type: 'product',
      entity_id: saved.id,
      details: `Created note: "${saved.title}" (Coming Soon: ${saved.is_coming_soon})`,
    });

    // Revalidate public and admin pages
    try {
      revalidatePath('/notes');
      revalidatePath('/admin/notes');
      revalidatePath('/');
      revalidatePath('/branches');
    } catch (revalErr) {
      console.warn('[RevalidatePath error]:', revalErr);
    }

    return NextResponse.json({ product: saved }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/notes POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
