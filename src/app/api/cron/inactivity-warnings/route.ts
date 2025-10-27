/**
 * API Route: Inactivity Warning Notifications Cron Job
 * Sends warning emails to users who haven't been active for 7 or 9 days
 * Triggers: Vercel Cron (daily at 11 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { sendInactivityWarning } from '@/lib/email';
import { shouldSendInactivityWarning } from '@/lib/notification-utils';

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
    console.log(`[Inactivity] Starting inactivity warnings for ${new Date().toISOString()}`);

    // Get all users with domains
    const { users } = await db.query({
      users: {
        domains: {
          $: {
            where: {
              deleted_at: { $isNull: true },
            },
          },
        },
      },
    });

    console.log(`[Inactivity] Found ${users.length} users with domains`);

    let warningsSent7Days = 0;
    let warningsSent9Days = 0;
    let warningsSkipped = 0;

    // Process each user
    for (const user of users) {
      try {
        if (!user.domains || user.domains.length === 0) {
          continue;
        }

        // Find the most recent domain check time for this user
        const lastActivity = Math.max(
          ...user.domains.map((domain: any) => domain.last_checked || 0)
        );

        if (lastActivity === 0) {
          // No activity recorded, skip
          continue;
        }

        const daysSinceActivity = Math.floor((now - lastActivity) / (24 * 60 * 60 * 1000));

        // Check if we should send a warning (day 7 or day 9)
        let warningDays: number | null = null;
        if (daysSinceActivity === 7) {
          warningDays = 7;
        } else if (daysSinceActivity === 9) {
          warningDays = 9;
        }

        if (!warningDays) {
          continue; // Not a warning day
        }

        // Check if user has inactivity warnings enabled (use first domain as reference)
        const shouldSend = await shouldSendInactivityWarning(user.domains[0].id);
        if (!shouldSend) {
          console.log(`[Inactivity] Skipping user ${user.email} - inactivity warnings disabled`);
          warningsSkipped++;
          continue;
        }

        console.log(`[Inactivity] Sending ${warningDays}-day warning to ${user.email} (${daysSinceActivity} days inactive)`);

        await sendInactivityWarning(
          user.email,
          warningDays,
          user.domains.length
        );

        if (warningDays === 7) {
          warningsSent7Days++;
        } else {
          warningsSent9Days++;
        }

        console.log(`[Inactivity] Successfully sent ${warningDays}-day warning to ${user.email}`);

      } catch (error) {
        console.error(`[Inactivity] Failed to process user ${user.auth_id}:`, error);
        // Continue processing other users
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        users_processed: users.length,
        warnings_sent_7_days: warningsSent7Days,
        warnings_sent_9_days: warningsSent9Days,
        warnings_skipped: warningsSkipped,
      },
    });

  } catch (error) {
    console.error('[Inactivity] Error:', error);

    return NextResponse.json(
      {
        error: 'Inactivity warnings failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}