import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filename = (body?.filename || 'notes.pdf').toString();
    const productId = (body?.productId || 'note').toString();

    if (!storage.canGenerateUploadSas()) {
      return NextResponse.json({ supported: false });
    }

    const sas = await storage.createUploadSasUrl(filename, productId);
    return NextResponse.json({
      supported: true,
      uploadUrl: sas.uploadUrl,
      blobName: sas.blobName,
      container: sas.container,
    });
  } catch (error: any) {
    console.error('[API /api/admin/upload-sas Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Could not initialize direct upload URL.' },
      { status: 500 }
    );
  }
}

