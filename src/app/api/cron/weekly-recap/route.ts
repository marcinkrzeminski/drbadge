/**
 * API Route: Weekly Recap Notifications Cron Job
 * Sends weekly summary emails to users every Monday
 * Triggers: Vercel Cron (weekly on Mondays at 10 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { sendWeeklyRecap } from '@/lib/email';
import { shouldSendWeeklyRecap } from '@/lib/notification-utils';
import { processBatched } from '@/lib/rate-limiter';

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

    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday

    // Only run on Mondays (UTC)
    if (currentDay !== 1) {
      return NextResponse.json({
        success: true,
        message: 'Not Monday, skipping weekly recap',
        current_day: currentDay,
      });
    }

    console.log(`[Weekly Recap] Starting weekly recap for ${now.toISOString()}`);

    // Calculate week range (last Monday to this Monday)
    const thisMonday = new Date(now);
    thisMonday.setUTCDate(now.getUTCDate() - currentDay + 1);
    thisMonday.setUTCHours(0, 0, 0, 0);

    const lastMonday = new Date(thisMonday);
    lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);

    const weekStart = lastMonday.toISOString().split('T')[0];
    const weekEnd = thisMonday.toISOString().split('T')[0];

    console.log(`[Weekly Recap] Processing week: ${weekStart} to ${weekEnd}`);

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

    console.log(`[Weekly Recap] Found ${users.length} users with domains`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    // Process users in batches with rate limiting to avoid API limits
    interface ProcessUserResult {
      success: boolean;
      skipped: boolean;
      email: string;
    }

    const processUser = async (user: typeof users[0]): Promise<ProcessUserResult> => {
      try {
        if (!user.domains || user.domains.length === 0) {
          return { success: false, skipped: true, email: user.email };
        }

        // Check if user has weekly recaps enabled (use first domain as reference)
        const shouldSend = await shouldSendWeeklyRecap(user.domains[0].id);
        if (!shouldSend) {
          console.log(`[Weekly Recap] Skipping user ${user.email} - weekly recaps disabled`);
          return { success: false, skipped: true, email: user.email };
        }

        // Get domain IDs for this user to avoid N+1 queries
        const domainIds = user.domains.map(d => d.id);
        const domainIdSet = new Set(domainIds);

        // Get snapshots from the past week
        // Note: InstantDB doesn't support $in on nested queries, so we filter in memory
        const { dr_snapshots: allSnapshots } = await db.query({
          dr_snapshots: {
            $: {
              where: {
                recorded_at: {
                  $gte: lastMonday.getTime(),
                  $lt: thisMonday.getTime(),
                },
              },
            },
          },
        });

        // Filter to only this user's domains
        const dr_snapshots = allSnapshots?.filter(s => domainIdSet.has(s.domain_id)) || [];

        if (dr_snapshots.length === 0) {
          console.log(`[Weekly Recap] No snapshots found for user ${user.email} this week`);
          return { success: false, skipped: true, email: user.email };
        }

        // Calculate weekly statistics
        const domainStats = new Map<string, {
          domain: string;
          url: string;
          startDA?: number;
          endDA?: number;
          change: number;
        }>();

        // Initialize with current domain data
        for (const domain of user.domains) {
          domainStats.set(domain.id, {
            domain: domain.id,
            url: domain.url,
            startDA: undefined,
            endDA: domain.current_da,
            change: domain.da_change,
          });
        }

        // Process snapshots to find start of week values
        // Group snapshots by domain_id and find earliest for each
        const snapshotsByDomain = new Map<string, typeof dr_snapshots>();
        for (const snapshot of dr_snapshots) {
          const domainId = snapshot.domain_id;
          if (!snapshotsByDomain.has(domainId)) {
            snapshotsByDomain.set(domainId, []);
          }
          snapshotsByDomain.get(domainId)!.push(snapshot);
        }

        // Find earliest snapshot for each domain
        for (const [domainId, snapshots] of snapshotsByDomain.entries()) {
          const stats = domainStats.get(domainId);
          if (!stats) continue;

          // Sort by recorded_at to find earliest
          const sortedSnapshots = snapshots.sort((a, b) => a.recorded_at - b.recorded_at);
          if (sortedSnapshots.length > 0) {
            stats.startDA = sortedSnapshots[0].da_value;
          }
        }

        // Calculate changes and find top performers
        const validDomains = Array.from(domainStats.values()).filter(d => d.startDA !== undefined);

        if (validDomains.length === 0) {
          console.log(`[Weekly Recap] No valid domain data for user ${user.email}`);
          return { success: false, skipped: true, email: user.email };
        }

        // Calculate average DA
        const averageDA = validDomains.reduce((sum, d) => sum + (d.endDA || 0), 0) / validDomains.length;

        // Find top performer and biggest loser
        const sortedByChange = validDomains.sort((a, b) => b.change - a.change);
        const topPerformer = sortedByChange[0];
        const biggestLoser = sortedByChange[sortedByChange.length - 1];

        const weeklyStats = {
          totalDomains: validDomains.length,
          averageDA,
          topPerformer: {
            domain: topPerformer.url,
            da: topPerformer.endDA || 0,
            change: topPerformer.change,
          },
          biggestLoser: {
            domain: biggestLoser.url,
            da: biggestLoser.endDA || 0,
            change: biggestLoser.change,
          },
          weekStart,
          weekEnd,
        };

        console.log(`[Weekly Recap] Sending recap to ${user.email}: ${validDomains.length} domains, avg DA: ${averageDA.toFixed(1)}`);

        const emailResult = await sendWeeklyRecap(user.email, weeklyStats);

        if (emailResult.success) {
          console.log(`[Weekly Recap] Successfully sent weekly recap to ${user.email}`);
          return { success: true, skipped: false, email: user.email };
        } else {
          console.error(`[Weekly Recap] Failed to send email to ${user.email}:`, emailResult.error);
          return { success: false, skipped: false, email: user.email };
        }

      } catch (error) {
        console.error(`[Weekly Recap] Failed to process user ${user.auth_id}:`, error);
        return { success: false, skipped: false, email: user.email };
      }
    };

    // Process users in batches with rate limiting (10 users per batch, 1 second delay)
    const results = await processBatched(
      users,
      processUser,
      { batchSize: 10, delayMs: 1000 }
    );

    // Count results
    for (const result of results) {
      if (result.success) {
        emailsSent++;
      } else if (result.skipped) {
        emailsSkipped++;
      } else {
        emailsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      week_start: weekStart,
      week_end: weekEnd,
      stats: {
        users_processed: users.length,
        emails_sent: emailsSent,
        emails_skipped: emailsSkipped,
        emails_failed: emailsFailed,
      },
    });

  } catch (error) {
    console.error('[Weekly Recap] Error:', error);

    return NextResponse.json(
      {
        error: 'Weekly recap failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}