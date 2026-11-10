import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const blobParam = req.nextUrl.searchParams.get('blobName');
    const containerParam = req.nextUrl.searchParams.get('container') || undefined;

    let blobName = blobParam || '';
    let container = containerParam;
    let filename = blobParam || 'note.pdf';

    if (id) {
      const allFiles = await db.getAllUploadedFiles();
      const match = allFiles.find((f) => f.id === id);
      if (!match) {
        return NextResponse.json({ error: 'File record not found.' }, { status: 404 });
      }
      blobName = match.blob_name;
      container = match.blob_container;
      filename = match.original_filename;
    }

    if (!blobName) {
      return NextResponse.json({ error: 'Missing file identifier.' }, { status: 400 });
    }

    const buffer = await storage.getPrivateNoteBuffer(blobName, container);
    const safeAscii = filename.replace(/["\\\r\n]/g, '').replace(/[^\x20-\x7E]/g, '_');

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(buffer.length),
        'Content-Disposition': `inline; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load PDF file.' }, { status: 404 });
  }
}

