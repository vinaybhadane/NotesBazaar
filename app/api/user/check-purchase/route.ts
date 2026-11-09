import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyServerToken } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const queryEmail = req.nextUrl.searchParams.get('email');
    const productId = req.nextUrl.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

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

    if (!userEmail && !firebaseUid) {
      return NextResponse.json({ purchased: false });
    }

    let dbUser = await db.getUserByEmail(userEmail);
    if (!dbUser && firebaseUid) {
      dbUser = await db.getUserByFirebaseUid(firebaseUid);
    }

    const userId = dbUser?.id || firebaseUid;
    const alreadyOwned = await db.hasEntitlement(userId, productId, userEmail);

    if (alreadyOwned) {
      // Find entitlement id if available
      const entitlements = await db.getEntitlementsByUser(userId, userEmail);
      const ent = entitlements.find((e) => e.product_id === productId && e.status === 'active');
      return NextResponse.json({
        purchased: true,
        entitlementId: ent?.id || null,
      });
    }

    return NextResponse.json({ purchased: false });
  } catch (error: any) {
    console.warn('[API /api/user/check-purchase]:', error.message);
    return NextResponse.json({ purchased: false });
  }
}

