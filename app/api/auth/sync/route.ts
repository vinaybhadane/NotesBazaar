import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyServerToken } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const body = await req.json();
    let email = body.email;
    let uid = body.uid || 'anon';
    let displayName = body.displayName;

    if (token) {
      const verified = await verifyServerToken(token);
      if (verified) {
        email = verified.email;
        uid = verified.uid;
        if (verified.name) displayName = verified.name;
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.upsertUser({
      firebase_uid: uid,
      email,
      display_name: displayName,
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[API /api/auth/sync Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

