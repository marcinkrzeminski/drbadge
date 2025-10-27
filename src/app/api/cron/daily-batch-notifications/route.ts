/**
 * API Route: Daily Batch Notifications Cron Job
 * Sends daily summary emails to free users with domain changes
 * Triggers: Vercel Cron (daily at 9 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { sendDailyBatch } from '@/lib/email';
import { shouldSendDailyBatch } from '@/lib/notification-utils';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = Date.now();
    const yesterday = now - 24 * 60 * 60 * 1000; // 24 hours ago

    console.log(`[Daily Batch] Starting daily batch notifications for ${new Date().toISOString()}`);

    // Get all domains that were updated in the last 24 hours
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            last_checked: { $gte: yesterday },
            deleted_at: { $isNull: true },
          },
        },
        users: {},
      },
    });

    console.log(`[Daily Batch] Found ${domains.length} domains updated in the last 24 hours`);

    // Group domains by user (only free users)
    const userDomainsMap = new Map<string, Array<{
      domain: string;
      url: string;
      oldDA: number;
      newDA: number;
      change: number;
      user: any;
    }>>();

    for (const domain of domains) {
      const user = domain.users?.[0];
      if (!user || user.subscription_status === 'paid') {
        continue; // Skip paid users (they get instant alerts)
      }

      if (!userDomainsMap.has(user.auth_id)) {
        userDomainsMap.set(user.auth_id, []);
      }

      userDomainsMap.get(user.auth_id)!.push({
        domain: domain.id,
        url: domain.url,
        oldDA: domain.previous_da,
        newDA: domain.current_da,
        change: domain.da_change,
        user,
      });
    }

    console.log(`[Daily Batch] Processing ${userDomainsMap.size} free users`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    // Send batch emails to each user
    for (const [userId, userDomains] of userDomainsMap.entries()) {
      try {
        const user = userDomains[0].user;

        // Check if user has daily batch notifications enabled
        const shouldSend = await shouldSendDailyBatch(userDomains[0].domain);
        if (!shouldSend) {
          console.log(`[Daily Batch] Skipping user ${user.email} - daily batch disabled`);
          emailsSkipped++;
          continue;
        }

        // Filter out domains with no change (shouldn't happen but safety check)
        const changedDomains = userDomains.filter(d => d.change !== 0);
        if (changedDomains.length === 0) {
          console.log(`[Daily Batch] Skipping user ${user.email} - no domain changes`);
          emailsSkipped++;
          continue;
        }

        console.log(`[Daily Batch] Sending batch email to ${user.email} for ${changedDomains.length} domains`);

        await sendDailyBatch(
          user.email,
          changedDomains.map(d => ({
            domain: d.url,
            oldDA: d.oldDA,
            newDA: d.newDA,
            change: d.change,
          }))
        );

        emailsSent++;
        console.log(`[Daily Batch] Successfully sent batch email to ${user.email}`);

      } catch (error) {
        console.error(`[Daily Batch] Failed to send batch email to user ${userId}:`, error);
        // Continue processing other users
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        domains_updated: domains.length,
        users_processed: userDomainsMap.size,
        emails_sent: emailsSent,
        emails_skipped: emailsSkipped,
      },
    });

  } catch (error) {
    console.error('[Daily Batch] Error:', error);

    return NextResponse.json(
      {
        error: 'Daily batch notifications failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}