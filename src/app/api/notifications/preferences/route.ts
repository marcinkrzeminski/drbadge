import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { createDefaultNotificationPreferences } from '@/lib/instant-schema';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

/**
 * GET /api/notifications/preferences?domainId=xxx
 * Get notification preferences for a specific domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');

    if (!domainId) {
      return NextResponse.json(
        { error: 'domainId parameter is required' },
        { status: 400 }
      );
    }

    // Get the domain to verify it exists and get user_id
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            id: domainId,
            deleted_at: { $isNull: true },
          },
        },
      },
    });

    if (!domains || domains.length === 0) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Get notification preferences
    const { email_notification_preferences } = await db.query({
      email_notification_preferences: {
        $: {
          where: {
            domain_id: domainId,
          },
        },
      },
    });

    // If no preferences exist, create defaults
    if (!email_notification_preferences || email_notification_preferences.length === 0) {
      const defaults = createDefaultNotificationPreferences(domainId);

      await db.transact([
        db.tx.email_notification_preferences[domainId].update(defaults),
      ]);

      return NextResponse.json({
        ...defaults,
        id: domainId,
      });
    }

    return NextResponse.json(email_notification_preferences[0]);
  } catch (error) {
    console.error('[Notification Preferences API] Error fetching preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch notification preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences for a domain
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, preferences } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: 'domainId is required' },
        { status: 400 }
      );
    }

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'preferences object is required' },
        { status: 400 }
      );
    }

    // Verify domain exists
    const { domains } = await db.query({
      domains: {
        $: {
          where: {
            id: domainId,
            deleted_at: { $isNull: true },
          },
        },
      },
    });

    if (!domains || domains.length === 0) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Validate preference fields
    const validFields = [
      'instant_alerts',
      'daily_batch',
      'weekly_recaps',
      'milestone_celebrations',
      'inactivity_warnings',
      'da_threshold',
    ];

    const updates: any = {
      updated_at: Date.now(),
    };

    for (const field of validFields) {
      if (field in preferences) {
        if (field === 'da_threshold') {
          const threshold = Number(preferences[field]);
          if (isNaN(threshold) || threshold < 1 || threshold > 100) {
            return NextResponse.json(
              { error: 'da_threshold must be a number between 1 and 100' },
              { status: 400 }
            );
          }
          updates[field] = threshold;
        } else {
          if (typeof preferences[field] !== 'boolean') {
            return NextResponse.json(
              { error: `${field} must be a boolean` },
              { status: 400 }
            );
          }
          updates[field] = preferences[field];
        }
      }
    }

    // Update preferences
    await db.transact([
      db.tx.email_notification_preferences[domainId].update(updates),
    ]);

    // Fetch updated preferences
    const { email_notification_preferences } = await db.query({
      email_notification_preferences: {
        $: {
          where: {
            domain_id: domainId,
          },
        },
      },
    });

    return NextResponse.json(email_notification_preferences?.[0] || updates);
  } catch (error) {
    console.error('[Notification Preferences API] Error updating preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to update notification preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
