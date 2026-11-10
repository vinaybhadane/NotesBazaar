import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
      return NextResponse.json({ error: 'Thumbnail image file is required.' }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Thumbnail image exceeds 4 MB size limit. Please upload a compressed image.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, or WebP images are allowed for thumbnails.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await storage.uploadThumbnailImage(
      buffer,
      file.name || 'thumbnail.jpg',
      file.type || 'image/jpeg'
    );

    return NextResponse.json({
      url: uploaded.url,
      blobName: uploaded.blobName,
      size: uploaded.size,
    });
  } catch (error: any) {
    console.error('[API /api/admin/upload-thumbnail POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload thumbnail image.' },
      { status: 500 }
    );
  }
}

