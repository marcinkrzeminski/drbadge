/**
 * API Route: Manual Domain Refresh (Paid Users Only)
 * Allows paid users to manually refresh domain DA metrics
 * with rate limiting (max 10 refreshes per hour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { seoIntelligence } from '@/lib/seo-intelligence';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Rate limiting: max 10 refreshes per hour per user
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const RATE_LIMIT_MAX = 10;

// In-memory rate limit tracking (for simplicity in MVP)
// In production, use Redis or database
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, userId } = body;

    if (!domainId || !userId) {
      return NextResponse.json(
        { error: 'Domain ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get user to check subscription
    const { data: userData } = await db.query({
      users: {
        $: {
          where: {
            auth_id: userId,
          },
        },
      },
    });

    const user = userData?.users?.[0];

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
          error: 'Manual refresh is only available for paid users',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimitKey = `refresh:${userId}`;
    const rateLimitStatus = checkRateLimit(rateLimitKey);

    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: RATE_LIMIT_MAX,
          window: 'hour',
          resetAt: rateLimitStatus.resetAt,
        },
        { status: 429 }
      );
    }

    // Get domain from database
    const { data: domainData } = await db.query({
      domains: {
        $: {
          where: {
            id: domainId,
            user_id: user.id,
          },
        },
      },
    });

    const domain = domainData.domains[0];

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found or does not belong to user' },
        { status: 404 }
      );
    }

    const normalizedUrl = domain.normalized_url;

    const metrics = await seoIntelligence.getDomainMetrics(normalizedUrl);

    // Track API usage
    await trackAPIUsage(normalizedUrl);

    // Increment rate limit counter
    incrementRateLimit(rateLimitKey);

    // Calculate changes
    const previousDA = domain.current_da;
    const currentDA = metrics.domainAuthority;
    const daChange = currentDA - previousDA;

    // Update domain record
    const now = Date.now();
    await db.transact([
      db.tx.domains[domainId].update({
        previous_da: previousDA,
        current_da: currentDA,
        da_change: daChange,
        last_checked: now,
      }),
    ]);

    // Create snapshot
    await createSnapshot(
      domainId,
      currentDA,
      metrics.backlinks,
      metrics.referringDomains,
      now
    );

    return NextResponse.json({
      success: true,
      domain: {
        id: domainId,
        url: domain.url,
        normalized_url: normalizedUrl,
        previous_da: previousDA,
        current_da: currentDA,
        da_change: daChange,
        last_checked: now,
        backlinks: metrics.backlinks,
        referring_domains: metrics.referringDomains,
      },
      rateLimit: {
        remaining: RATE_LIMIT_MAX - rateLimitStatus.count - 1,
        resetAt: rateLimitStatus.resetAt,
      },
    });
  } catch (error) {
    console.error('[Manual Refresh] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to refresh domain',
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
      db.tx['api_usage'][db.id()].update({
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
 * Increment rate limit counter
 */
function incrementRateLimit(key: string): void {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
  } else {
    // Increment existing record
    record.count++;
    rateLimitStore.set(key, record);
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
      db.tx['dr_snapshots'][db.id()].update(snapshotData),
    ]);
  } catch (error) {
    console.error('[Snapshot] Failed to create snapshot:', error);
  }
}
