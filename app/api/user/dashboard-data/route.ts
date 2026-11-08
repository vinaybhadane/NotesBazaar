import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyServerToken } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let userEmail = '';
    let firebaseUid = '';

    if (token) {
      const decoded = await verifyServerToken(token);
      if (decoded) {
        userEmail = decoded.email;
        firebaseUid = decoded.uid;
      }
    }

    if (!userEmail) {
      // Find default or recent user for testing
      const allUsers = await db.getAllUsers();
      if (allUsers.length > 0) {
        userEmail = allUsers[0].email;
        firebaseUid = allUsers[0].firebase_uid;
      }
    }

    const dbUser = await db.getUserByEmail(userEmail);
    if (!dbUser) {
      return NextResponse.json({ entitlements: [], orders: [], notifications: [] });
    }

    const entitlements = await db.getEntitlementsByUser(dbUser.id);
    const orders = await db.getOrdersByUser(dbUser.id);
    const notifications = await db.getNotificationsByUser(dbUser.id);

    return NextResponse.json({
      user: dbUser,
      entitlements,
      orders,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

