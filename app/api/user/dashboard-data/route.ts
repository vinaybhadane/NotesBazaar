import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyServerToken } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const queryEmail = req.nextUrl.searchParams.get('email');

    let userEmail = '';
    let firebaseUid = '';

    if (token) {
      const decoded = await verifyServerToken(token);
      if (decoded) {
        userEmail = decoded.email;
        firebaseUid = decoded.uid;
      }
    }

    if (!userEmail && queryEmail) {
      userEmail = queryEmail.trim();
    }

    if (!userEmail) {
      return NextResponse.json({ entitlements: [], orders: [], notifications: [] });
    }

    // Lookup or upsert user
    let dbUser = await db.getUserByEmail(userEmail);
    if (!dbUser && firebaseUid) {
      dbUser = await db.getUserByFirebaseUid(firebaseUid);
    }
    if (!dbUser) {
      dbUser = await db.upsertUser({
        firebase_uid: firebaseUid || `user_${Date.now()}`,
        email: userEmail,
      });
    }

    const entitlements = await db.getEntitlementsByUser(dbUser.id, dbUser.email);
    const orders = await db.getOrdersByUser(dbUser.id, dbUser.email);
    const notifications = await db.getNotificationsByUser(dbUser.id);

    return NextResponse.json({
      user: dbUser,
      entitlements,
      orders,
      notifications,
    });
  } catch (error: any) {
    console.error('[API /api/user/dashboard-data Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
