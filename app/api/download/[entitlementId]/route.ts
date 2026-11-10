import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ entitlementId: string }>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const entitlementId = resolved.entitlementId;

    if (!entitlementId) {
      return NextResponse.json({ error: 'Entitlement ID is required' }, { status: 400 });
    }

    // 1. Verify entitlement in database
    const entitlement = await db.getEntitlementById(entitlementId);
    if (!entitlement || entitlement.status !== 'active') {
      return NextResponse.json(
        { error: 'Unauthorized: No active verified purchase found for this document.' },
        { status: 403 }
      );
    }

    // Check expiration if applicable
    if (entitlement.expires_at && new Date(entitlement.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This download link has expired. Please contact support.' },
        { status: 410 }
      );
    }

    // 2. Fetch associated product
    const product = entitlement.product || (await db.getProductById(entitlement.product_id));
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 3. Retrieve original attached PDF file record(s) from database
    const queryFileId = req.nextUrl.searchParams.get('fileId');
    const allFiles = await db.getProductFilesByProductId(product.id);
    let targetFile = queryFileId ? allFiles.find((f) => f.id === queryFileId) : null;
    if (!targetFile && allFiles.length > 0) {
      targetFile = allFiles[0];
    }
    if (!targetFile) {
      targetFile = await db.getProductFileByProductId(product.id);
    }

    let fileBuffer: Buffer | null = null;
    let downloadFilename = targetFile?.original_filename || `${product.slug}_SPPU_2024_NotesBazaar.pdf`;
    let mimeType = targetFile?.mime_type || 'application/pdf';

    if (targetFile?.blob_name) {
      try {
        fileBuffer = await storage.getPrivateNoteBuffer(targetFile.blob_name, targetFile.blob_container);
      } catch (err: any) {
        console.warn('[Download] Failed to retrieve blob from product_files record:', err.message);
      }
    }

    // 4. Recovery lookup: if product_files record was missing, scan storage for blobs belonging to product.id
    if (!fileBuffer && !queryFileId) {
      try {
        const recovered = await storage.findBlobForProduct(product.id);
        if (recovered) {
          fileBuffer = await storage.getPrivateNoteBuffer(recovered.blobName, recovered.container);
          const inferredName = recovered.blobName.replace(new RegExp(`^${product.id}_\\d+_`), '') || downloadFilename;
          downloadFilename = inferredName;
          // Auto-heal record into product_files if empty
          if (allFiles.length === 0) {
            await db.recordProductFile({
              product_id: product.id,
              blob_container: recovered.container,
              blob_name: recovered.blobName,
              original_filename: inferredName,
              file_size_bytes: recovered.size || fileBuffer.length,
              mime_type: 'application/pdf',
            }).catch(() => {});
          }
        }
      } catch (recErr: any) {
        console.warn('[Download] Recovery blob scan failed:', recErr.message);
      }
    }

    // 5. Never fabricate a fake placeholder PDF when the original uploaded file is missing
    if (!fileBuffer) {
      await db.logDownloadAudit({
        entitlement_id: entitlement.id,
        user_id: entitlement.user_id,
        product_id: entitlement.product_id,
        ip_address: clientIp,
        user_agent: userAgent,
        status: 'denied',
      });

      const accept = req.headers.get('accept') || '';
      if (accept.includes('application/json')) {
        return NextResponse.json(
          {
            error:
              'The original PDF file for this note has not been uploaded to storage yet. Your purchase is verified; once the PDF is attached, it will be downloadable automatically.',
          },
          { status: 404 }
        );
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document Pending Attachment | NotesBazaar</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 480px; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); text-align: center; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
    h1 { font-size: 20px; margin: 0 0 10px; font-weight: 800; }
    p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px; }
    .meta { background: #f1f5f9; border-radius: 12px; padding: 12px; font-size: 12px; color: #334155; text-align: left; margin-bottom: 24px; word-break: break-all; }
    .btn { display: inline-block; background: #0f172a; color: #fff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 999px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Purchase Verified · File Pending</span>
    <h1>Original PDF Not Attached Yet</h1>
    <p>Your purchase of <strong>${escapeHtml(product.title)}</strong> is verified and active. However, the original document file is not yet attached to this product in storage. Once our team uploads the PDF, refresh <strong>My Downloads</strong> to download it at zero extra cost.</p>
    <div class="meta">
      <strong>Order Reference:</strong> ${escapeHtml(entitlement.order_id)}<br/>
      <strong>Product ID:</strong> ${escapeHtml(product.id)}
    </div>
    <a class="btn" href="/account/downloads">Back to My Downloads</a>
  </div>
</body>
</html>`;

      return new Response(html, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 6. Log successful download grant and stream authentic binary bytes
    await db.logDownloadAudit({
      entitlement_id: entitlement.id,
      user_id: entitlement.user_id,
      product_id: entitlement.product_id,
      ip_address: clientIp,
      user_agent: userAgent,
      status: 'granted',
    });

    const safeAsciiName = downloadFilename
      .replace(/["\\\r\n]/g, '')
      .replace(/[^\x20-\x7E]/g, '_');
    const encodedName = encodeURIComponent(downloadFilename);

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileBuffer.length),
        'Content-Disposition': `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodedName}`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'File access error' }, { status: 500 });
  }
}
