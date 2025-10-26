/**
 * API Route: Bulk Domain Refresh (Paid Users Only)
 * Allows paid users to refresh all their domains at once
 * with rate limiting (max 50 refreshes per 30 minutes total)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';
import { seoIntelligence } from '@/lib/seo-intelligence';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Rate limiting: configurable via environment variables
const RATE_LIMIT_WINDOW = (parseInt(process.env.REFRESH_RATE_LIMIT_WINDOW_MINUTES || '30') * 60 * 1000); // Default: 30 minutes in ms
const RATE_LIMIT_MAX = parseInt(process.env.REFRESH_RATE_LIMIT_MAX || '50'); // Default: 50 refreshes

// In-memory rate limit tracking (for simplicity in MVP)
// In production, use Redis or database
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user to check subscription (userId is auth_id)
    const { users } = await db.query({
      users: {
        $: {
          where: {
            auth_id: userId,
          },
        },
      },
    });

    const user = users?.[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has paid subscription
    if (user.subscription_status !== 'paid') {
      return NextResponse.json(
        {
          error: 'Bulk refresh is only available for paid users',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // Get all active domains for this user
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            user_id: userId,
            deleted_at: { $isNull: true },
          },
        },
      },
    });

    if (!domains || domains.length === 0) {
      return NextResponse.json(
        { error: 'No domains found to refresh' },
        { status: 404 }
      );
    }

    // Check rate limit for total refreshes
    const rateLimitKey = `refresh:${userId}`;
    const rateLimitStatus = checkRateLimit(rateLimitKey);

    if (rateLimitStatus.count + domains.length > RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: RATE_LIMIT_MAX,
          window: `${RATE_LIMIT_WINDOW / (60 * 1000)} minutes`,
          requested: domains.length,
          remaining: Math.max(0, RATE_LIMIT_MAX - rateLimitStatus.count),
          resetAt: rateLimitStatus.resetAt,
        },
        { status: 429 }
      );
    }

    const now = Date.now();
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each domain
    for (const domain of domains) {
      try {
        const normalizedUrl = domain.normalized_url;

        // Fetch fresh metrics from SEO Intelligence API
        const metrics = await seoIntelligence.getDomainMetrics(normalizedUrl);

        // Track API usage
        await trackAPIUsage(normalizedUrl);

        // Calculate changes
        const previousDA = typeof domain.current_da === 'number' ? domain.current_da : 0;
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

        // Create snapshot
        await createSnapshot(
          domain.id,
          currentDA,
          metrics.backlinks,
          metrics.referringDomains,
          now
        );

        results.push({
          id: domain.id,
          url: domain.url,
          success: true,
          previous_da: previousDA,
          current_da: currentDA,
          da_change: daChange,
          backlinks: metrics.backlinks,
          referring_domains: metrics.referringDomains,
        });

        successCount++;
      } catch (error) {
        console.error(`[Bulk Refresh] Error processing domain ${domain.id}:`, error);

        results.push({
          id: domain.id,
          url: domain.url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        errorCount++;
      }
    }

    // Update rate limit counter (add all successful refreshes)
    incrementRateLimit(rateLimitKey, successCount);

    const finalRateLimitStatus = checkRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      summary: {
        total: domains.length,
        successful: successCount,
        failed: errorCount,
      },
      results,
      rateLimit: {
        remaining: RATE_LIMIT_MAX - finalRateLimitStatus.count,
        resetAt: finalRateLimitStatus.resetAt,
      },
    });
  } catch (error) {
    console.error('[Bulk Refresh] Error:', error);

    return NextResponse.json(
      {
        error: 'Bulk refresh failed',
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

/**
 * Check rate limit for a user
 */
function checkRateLimit(key: string): {
  allowed: boolean;
  count: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // No record or expired - allow
    const resetAt = now + RATE_LIMIT_WINDOW;
    return {
      allowed: true,
      count: 0,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      count: record.count,
      resetAt: record.resetAt,
    };
  }

  return {
    allowed: true,
    count: record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Increment rate limit counter by a specific amount
 */
function incrementRateLimit(key: string, amount: number = 1): void {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new record
    rateLimitStore.set(key, {
      count: amount,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
  } else {
    // Increment existing record
    record.count += amount;
    rateLimitStore.set(key, record);
  }
}