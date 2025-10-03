/**
 * API Route: Update Domain DA
 * Fetches fresh Domain Authority from SEO Intelligence API
 * Updates domain record and creates snapshot
 * Note: Always fetches fresh data - InstantDB is the source of truth
 */

import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { seoIntelligence } from '@/lib/seo-intelligence';
import { invalidatePublicDomain } from '@/lib/redis-public';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      );
    }

    // Get domain from database
    const result = await db.query({
      domains: {},
    });

    const domain = result.domains?.find((d: any) => d.id === domainId);

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    const normalizedUrl = domain.normalized_url;

    // Fetch fresh metrics from SEO Intelligence API
    const metrics = await seoIntelligence.getDomainMetrics(normalizedUrl);

    // Track API usage
    await trackAPIUsage(normalizedUrl);

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

    // Invalidate Redis cache for public endpoints
    await invalidatePublicDomain(normalizedUrl);

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
    });
  } catch (error) {
    console.error('[Update Domain] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update domain',
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

