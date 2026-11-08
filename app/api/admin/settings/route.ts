import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const settings = await db.getSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.updateSiteSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

