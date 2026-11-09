import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const files = await db.getAllUploadedFiles();
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('[API /api/admin/files GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to list files' }, { status: 500 });
  }
}

