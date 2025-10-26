import { NextRequest, NextResponse } from "next/server";
import { init, id } from "@instantdb/admin";
import { seoIntelligence } from "@/lib/seo-intelligence";
import { getUserByAuthId } from "@/lib/user-utils";
import { getDomainsLimitForUser } from "@/lib/stripe";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, url, normalizedUrl } = body;

    if (!userId || !url || !normalizedUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user data and check subscription limits
    const user = await getUserByAuthId(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get current domain count
    const { domains: userDomains } = await db.query({
      domains: {
        $: {
          where: {
            user_id: userId,
            deleted_at: { $isNull: true }, // Only count non-deleted domains
          },
        },
      },
    });

    const domainsLimit = getDomainsLimitForUser(user.subscription_status);
    if ((userDomains?.length || 0) >= domainsLimit) {
      return NextResponse.json(
        {
          error: `Domain limit exceeded. You can track up to ${domainsLimit} domains with your current plan.`,
        },
        { status: 403 }
      );
    }

    // Check for duplicate domains
    const duplicate = userDomains?.find((d: any) => d.normalized_url === normalizedUrl);
    if (duplicate) {
      return NextResponse.json(
        { error: "This domain is already being tracked" },
        { status: 409 }
      );
    }

    // Fetch DR immediately using SEO Intelligence API
    console.log(`Fetching DR for ${normalizedUrl}...`);
    const metrics = await seoIntelligence.getDomainMetrics(normalizedUrl);

    const now = Date.now();
    const domainId = id();

    // Track API usage
    await db.transact([
      db.tx.api_usage[id()].update({
        provider: "karmalabs",
        domain: normalizedUrl,
        cost: 0.01,
        created_at: now,
      }),
    ]);

    // Create domain with initial DR value and first snapshot
    await db.transact([
      db.tx.domains[domainId].update({
        user_id: userId,
        url: url,
        normalized_url: normalizedUrl,
        current_da: metrics.domainAuthority,
        previous_da: metrics.domainAuthority,
        da_change: 0,
        last_checked: now,
        created_at: now,
      }),
      // Create initial snapshot
      db.tx.dr_snapshots[id()].update({
        domain_id: domainId,
        da_value: metrics.domainAuthority,
        backlinks: metrics.backlinks,
        referring_domains: metrics.referringDomains,
        recorded_at: now,
        created_at: now,
      }),
    ]);

    return NextResponse.json({
      success: true,
      domain: {
        id: domainId,
        url,
        current_da: metrics.domainAuthority,
        backlinks: metrics.backlinks,
        referring_domains: metrics.referringDomains,
      },
    });
  } catch (error) {
    console.error("Error adding domain:", error);
    return NextResponse.json(
      {
        error: "Failed to add domain",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
