/**
 * API Route: Manual Domain Refresh (Paid Users Only)
 * Allows paid users to manually refresh domain DA metrics
 * with configurable rate limiting (default: max 50 refreshes per 30 minutes)
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
    const { domainId, userId } = body;

    console.log('[Refresh API] Request:', { domainId, userId });

    if (!domainId || !userId) {
      return NextResponse.json(
        { error: 'Domain ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get user to check subscription
    const { users } = await db.query({
      users: {
        $: {
          where: {
            id: userId,
          },
        },
      },
    });

    const user = users?.[0];

    console.log('[Refresh API] User lookup result:', { found: !!user, userId });

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
          window: `${RATE_LIMIT_WINDOW / (60 * 1000)} minutes`,
          resetAt: rateLimitStatus.resetAt,
        },
        { status: 429 }
      );
    }

    // Get domain from database
    // Note: domains.user_id stores auth_id, not the users table id
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            id: domainId,
            user_id: user.auth_id,
          },
        },
      },
    });

    const domain = domains[0];

    console.log('[Refresh API] Domain lookup result:', { 
      found: !!domain, 
      domainId, 
      userId: user.id,
      domainsCount: domains.length 
    });

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
    const previousDA = typeof domain.current_da === 'number' ? domain.current_da : 0;
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
      db.tx['dr_snapshots'][id()].update(snapshotData),
    ]);
  } catch (error) {
    console.error('[Snapshot] Failed to create snapshot:', error);
  }
}
