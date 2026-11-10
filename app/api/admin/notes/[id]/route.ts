import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

interface PreUploadedBlob {
  blob_name: string;
  blob_container: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type?: string;
}

export async function GET(req: NextRequest, { params }: Params) {
  const resolved = await params;
  const product = await db.getProductById(resolved.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const files = await db.getProductFilesByProductId(resolved.id);
  return NextResponse.json({ product, files });
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const existing = await db.getProductById(resolved.id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    const uploadedFiles: File[] = [];
    let selectedFileIds: string[] = [];
    let uploadedBlobs: PreUploadedBlob[] = [];
    let keptFileIds: string[] = [];
    let hasKeptFilesField = false;

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

      // Collect multiple files
      const multiple = formData.getAll('files') as File[];
      for (const f of multiple) {
        if (f && typeof f === 'object' && 'size' in f && f.size > 0) uploadedFiles.push(f);
      }
      const single = formData.get('file') as File | null;
      if (
        single &&
        typeof single === 'object' &&
        'size' in single &&
        single.size > 0 &&
        !uploadedFiles.some((f) => f.name === single.name && f.size === single.size)
      ) {
        uploadedFiles.push(single);
      }

      const selIdsRaw = formData.get('selected_file_ids');
      if (selIdsRaw && typeof selIdsRaw === 'string') {
        try {
          selectedFileIds = JSON.parse(selIdsRaw);
        } catch {}
      }

      const blobsRaw = formData.get('uploaded_blobs');
      if (blobsRaw && typeof blobsRaw === 'string') {
        try {
          uploadedBlobs = JSON.parse(blobsRaw);
        } catch {}
      }

      if (formData.has('kept_file_ids')) {
        hasKeptFilesField = true;
        const keptIdsRaw = formData.get('kept_file_ids');
        if (keptIdsRaw && typeof keptIdsRaw === 'string') {
          try {
            keptFileIds = JSON.parse(keptIdsRaw);
          } catch {}
        }
      }
    } else {
      body = await req.json();
      if (Array.isArray(body.selected_file_ids)) {
        selectedFileIds = body.selected_file_ids;
      }
      if (Array.isArray(body.uploaded_blobs)) {
        uploadedBlobs = body.uploaded_blobs;
      }
      if (Array.isArray(body.kept_file_ids)) {
        hasKeptFilesField = true;
        keptFileIds = body.kept_file_ids;
      }
      // Clean non-product fields from body before updateProduct
      delete body.selected_file_ids;
      delete body.uploaded_blobs;
      delete body.kept_file_ids;
    }

    // Pre-verify any directly uploaded SAS blobs before applying changes
    for (const blob of uploadedBlobs) {
      const check = await storage.verifyBlob(blob.blob_name, blob.blob_container);
      if (!check.exists) {
        return NextResponse.json(
          { error: `Uploaded document "${blob.original_filename}" was not found in Azure storage. Please retry.` },
          { status: 400 }
        );
      }
      if (!check.isPdf) {
        return NextResponse.json(
          { error: `Invalid file format for "${blob.original_filename}". Only valid PDF files are allowed.` },
          { status: 400 }
        );
      }
      blob.file_size_bytes = check.size || blob.file_size_bytes;
    }

    // Process removals whenever kept_file_ids field is submitted
    if (hasKeptFilesField) {
      const currentFiles = await db.getProductFilesByProductId(resolved.id);
      for (const cur of currentFiles) {
        if (!keptFileIds.includes(cur.id)) {
          await db.deleteProductFile(cur.id);
        }
      }
    }

    // Attach selected existing DB files
    for (const fileId of selectedFileIds) {
      await db.attachExistingFileToProduct(resolved.id, fileId);
    }

    // Record pre-uploaded SAS blobs
    for (const blob of uploadedBlobs) {
      await db.recordProductFile({
        product_id: resolved.id,
        blob_container: blob.blob_container,
        blob_name: blob.blob_name,
        original_filename: blob.original_filename,
        file_size_bytes: blob.file_size_bytes,
        mime_type: blob.mime_type || 'application/pdf',
      });
    }

    // Upload newly attached multipart files
    for (const f of uploadedFiles) {
      const arrayBuf = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const uploadResult = await storage.uploadPrivateNote(buffer, f.name, resolved.id);
      await db.recordProductFile({
        product_id: resolved.id,
        blob_container: uploadResult.container,
        blob_name: uploadResult.blobName,
        original_filename: f.name,
        file_size_bytes: uploadResult.size,
        mime_type: f.type || 'application/pdf',
      });
    }

    // Compute updated total file size across all files now attached to product
    const finalFiles = await db.getProductFilesByProductId(resolved.id);
    const totalBytes = finalFiles.reduce((s, f) => s + (f.file_size_bytes || 0), 0);

    const updated = await db.updateProduct(resolved.id, {
      ...body,
      file_size_bytes: totalBytes,
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
      details: `Updated note "${updated.title}" (${finalFiles.length} file(s) attached)`,
    });

    try {
      revalidatePath('/notes');
      revalidatePath('/admin/notes');
      revalidatePath('/');
      revalidatePath(`/notes/${updated.slug}`);
      revalidatePath('/account/downloads');
    } catch (e) {
      console.warn('[RevalidatePath error]:', e);
    }

    return NextResponse.json({ product: updated, files: finalFiles });
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
