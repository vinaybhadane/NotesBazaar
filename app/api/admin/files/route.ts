import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [files, allBlobs] = await Promise.all([
      db.getAllUploadedFiles(),
      storage.listAllPrivateBlobs(),
    ]);

    const referencedBlobs = new Set(files.map((f) => f.blob_name));
    const orphanBlobs = allBlobs.filter((b) => !referencedBlobs.has(b.blobName));

    return NextResponse.json({
      files,
      orphanBlobs,
      totalBlobsCount: allBlobs.length,
    });
  } catch (error: any) {
    console.error('[API /api/admin/files GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to list files' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let id = req.nextUrl.searchParams.get('id');
    let blobName = req.nextUrl.searchParams.get('blobName');
    let blobContainer = req.nextUrl.searchParams.get('container') || undefined;

    if (!id && !blobName) {
      try {
        const body = await req.json();
        id = body?.id || null;
        blobName = body?.blobName || null;
        blobContainer = body?.container || undefined;
      } catch {
        // ignore empty JSON
      }
    }

    if (id) {
      const deleted = await db.deleteProductFile(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Uploaded file record not found.' }, { status: 404 });
      }

      await db.logAdminAudit({
        admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
        action: 'DELETE_UPLOADED_FILE',
        entity_type: 'product_file',
        entity_id: id,
        details: `Deleted uploaded file record ${id} from database`,
      });
    } else if (blobName) {
      const allFiles = await db.getAllUploadedFiles();
      const stillReferenced = allFiles.some((f) => f.blob_name === blobName);
      if (stillReferenced) {
        return NextResponse.json(
          { error: 'This file is still linked to a product in the database. Delete the database record instead.' },
          { status: 400 }
        );
      }

      const deleted = await storage.deletePrivateBlob(blobName, blobContainer);
      if (!deleted) {
        return NextResponse.json({ error: 'Storage blob not found.' }, { status: 404 });
      }

      await db.logAdminAudit({
        admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
        action: 'DELETE_ORPHAN_BLOB',
        entity_type: 'storage_blob',
        entity_id: blobName,
        details: `Deleted orphaned storage blob ${blobName}`,
      });
    } else {
      return NextResponse.json({ error: 'File ID or blobName is required.' }, { status: 400 });
    }

    try {
      revalidatePath('/admin/uploaded-notes');
      revalidatePath('/admin/notes');
      revalidatePath('/notes');
      revalidatePath('/account/downloads');
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/admin/files DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete uploaded file' }, { status: 500 });
  }
}
