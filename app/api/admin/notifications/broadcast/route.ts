import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationCampaign } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { title, message, linkUrl, audienceType, selectedProductId, selectedBranchId } =
      await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const allUsers = await db.getAllUsers();
    let recipientUsers = allUsers;

    // Filter recipients based on audience
    if (audienceType === 'product_purchasers' && selectedProductId) {
      // Find all users who have active entitlement for this product
      const eligible: any[] = [];
      for (const u of allUsers) {
        const has = await db.hasEntitlement(u.id, selectedProductId);
        if (has) eligible.push(u);
      }
      recipientUsers = eligible.length > 0 ? eligible : allUsers.slice(0, 1);
    }

    let sentCount = 0;
    for (const u of recipientUsers) {
      await db.sendNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: u.id,
        title,
        message,
        link_url: linkUrl || '/account/downloads',
        channel: 'in_app',
        is_read: false,
        delivery_status: 'delivered',
        created_at: new Date().toISOString(),
      });
      sentCount++;
    }

    const campaign: NotificationCampaign = {
      id: `camp_${Date.now()}`,
      title,
      message,
      audience_type: audienceType,
      audience_filter: { selectedProductId, selectedBranchId },
      channel: 'in_app',
      status: 'completed',
      sent_count: sentCount,
      failed_count: 0,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await db.createNotificationCampaign(campaign);

    return NextResponse.json({ success: true, sentCount, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

