/**
 * API Route: Domain Monitoring Cron Job
 * Automatically refreshes domain DA metrics based on subscription tier
 * Paid users: 4x daily (every 6 hours)
 * Free users: 1x daily (every 24 hours)
 * Triggers: Vercel Cron (every 6 hours)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';
import { seoIntelligence } from '@/lib/seo-intelligence';
import { sendDRChangeAlert } from '@/lib/email';
import { shouldSendInstantAlert, getDAThreshold, checkAndCelebrateMilestones } from '@/lib/notification-utils';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Refresh intervals in milliseconds
const REFRESH_INTERVALS = {
  paid: 6 * 60 * 60 * 1000, // 6 hours (4x daily)
  free: 24 * 60 * 60 * 1000, // 24 hours (1x daily)
} as const;

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
    let processed = 0;
    let refreshed = 0;
    let errors = 0;

    // Get all active domains (not soft deleted)
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            deleted_at: { $isNull: true },
          },
        },
        users: {},
      },
    });

    console.log(`[Domain Monitor] Processing ${domains.length} domains`);

    // Process each domain
    for (const domain of domains) {
      try {
        processed++;

        const user = domain.users?.[0];
        if (!user) {
          console.warn(`[Domain Monitor] No user found for domain ${domain.id}`);
          continue;
        }

        // Determine subscription tier
        const subscriptionTier = user.subscription_status === 'paid' ? 'paid' : 'free';
        const refreshInterval = REFRESH_INTERVALS[subscriptionTier];

        // Check if domain needs refresh
        const timeSinceLastCheck = now - (domain.last_checked || 0);
        if (timeSinceLastCheck < refreshInterval) {
          console.log(`[Domain Monitor] Skipping ${domain.normalized_url} (${subscriptionTier}) - last checked ${Math.round(timeSinceLastCheck / (60 * 60 * 1000))} hours ago`);
          continue;
        }

        console.log(`[Domain Monitor] Refreshing ${domain.normalized_url} (${subscriptionTier})`);

        // Refresh domain metrics
        const metrics = await seoIntelligence.getDomainMetrics(domain.normalized_url);

        // Track API usage
        await trackAPIUsage(domain.normalized_url);

        // Calculate changes
        const previousDA = domain.current_da;
        const currentDA = metrics.domainAuthority;
        const daChange = currentDA - previousDA;

        // Update domain record
        await db.transact([
          db.tx.domains[domain.id].update({
            previous_da: previousDA,
            current_da: currentDA,
            da_change: daChange,
            last_checked: now,
          }),
        ]);

        // Send instant alert for significant DA changes (paid users only)
        if (Math.abs(daChange) > 0) {
          try {
            const shouldSendAlert = await shouldSendInstantAlert(domain.id);
            const daThreshold = await getDAThreshold(domain.id);

            if (shouldSendAlert && Math.abs(daChange) >= daThreshold) {
              console.log(`[Domain Monitor] Sending instant alert for ${domain.normalized_url}: DA ${previousDA} → ${currentDA} (${daChange >= 0 ? '+' : ''}${daChange})`);

              await sendDRChangeAlert(
                user.email,
                domain.url,
                previousDA,
                currentDA,
                daChange
              );

              console.log(`[Domain Monitor] Instant alert sent to ${user.email} for ${domain.normalized_url}`);
            }
          } catch (error) {
            console.error(`[Domain Monitor] Failed to send instant alert for ${domain.normalized_url}:`, error);
            // Don't fail the entire process for email errors
          }
        }

        // Check for and celebrate milestones
        await checkAndCelebrateMilestones(
          domain.id,
          domain.url,
          user.email,
          currentDA,
          previousDA
        );

        // Create snapshot
        await createSnapshot(
          domain.id,
          currentDA,
          metrics.backlinks,
          metrics.referringDomains,
          now
        );

        refreshed++;
        console.log(`[Domain Monitor] Refreshed ${domain.normalized_url}: DA ${previousDA} → ${currentDA} (${daChange >= 0 ? '+' : ''}${daChange})`);

      } catch (error) {
        errors++;
        console.error(`[Domain Monitor] Error processing domain ${domain.id}:`, error);
        // Continue processing other domains
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        total_domains: domains.length,
        processed,
        refreshed,
        errors,
        skipped: processed - refreshed - errors,
      },
    });
  } catch (error) {
    console.error('[Domain Monitor] Error:', error);

    return NextResponse.json(
      {
        error: 'Domain monitoring failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Track API usage for cost monitoring
 */
async function trackAPIUsage(domain: string): Promise<void> {
  try {
    await db.transact([
      db.tx['api_usage'][id()].update({
        provider: 'karmalabs',
        domain: domain,
        cost: 0.01,
        created_at: Date.now(),
      }),
    ]);
  } catch (error) {
    console.error('[API Usage] Failed to track:', error);
  }
}

/**
 * Create DR snapshot for historical tracking
 */
async function createSnapshot(
  domainId: string,
  daValue: number,
  backlinks?: number,
  referringDomains?: number,
  timestamp?: number
): Promise<void> {
  try {
    const snapshotData: Record<string, unknown> = {
      domain_id: domainId,
      da_value: daValue,
      recorded_at: timestamp || Date.now(),
    };

    if (backlinks !== undefined) {
      snapshotData.backlinks = backlinks;
    }

    if (referringDomains !== undefined) {
      snapshotData.referring_domains = referringDomains;
    }

    await db.transact([
      db.tx['dr_snapshots'][id()].update(snapshotData),
    ]);
  } catch (error) {
    console.error('[Snapshot] Failed to create snapshot:', error);
  }
}