import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ blobName: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const blobName = decodeURIComponent(resolved.blobName || '').trim();
    if (!blobName || blobName.includes('..') || blobName.includes('/') || blobName.includes('\\')) {
      return NextResponse.json({ error: 'Invalid thumbnail identifier.' }, { status: 400 });
    }

    const { buffer, contentType } = await storage.getThumbnailBuffer(blobName);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Thumbnail not found.' }, { status: 404 });
  }
}

