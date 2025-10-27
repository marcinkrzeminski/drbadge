import { init, id } from "@instantdb/admin";
import { createDefaultNotificationPreferences } from './instant-schema';
import { sendMilestoneCelebration } from './email';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Domain Authority milestones to celebrate
export const DA_MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Type-safe interface for notification preference updates
export interface NotificationPreferencesUpdate {
  instant_alerts?: boolean;
  daily_batch?: boolean;
  weekly_recaps?: boolean;
  milestone_celebrations?: boolean;
  inactivity_warnings?: boolean;
  da_threshold?: number;
}

/**
 * Initialize notification preferences for a newly added domain
 */
export async function initializeDomainNotifications(domainId: string) {
  try {
    const preferences = createDefaultNotificationPreferences(domainId);
    await db.transact([db.tx.email_notification_preferences[domainId].update(preferences)]);
    console.log(`Initialized notification preferences for domain ${domainId}`);
  } catch (error) {
    console.error(`Failed to initialize notification preferences for domain ${domainId}:`, error);
    throw error;
  }
}

/**
 * Get notification preferences for a domain
 * Automatically initializes preferences if they don't exist (for old domains)
 */
export async function getDomainNotificationPreferences(domainId: string) {
  try {
    const { email_notification_preferences } = await db.query({
      email_notification_preferences: {
        $: { where: { domain_id: domainId } },
      },
    });

    const prefs = email_notification_preferences?.[0];

    // Lazy initialization: if no preferences exist, create defaults
    if (!prefs) {
      console.log(`[Notification Utils] Lazy-initializing preferences for domain ${domainId}`);
      await initializeDomainNotifications(domainId);

      // Fetch the newly created preferences
      const { email_notification_preferences: newPrefs } = await db.query({
        email_notification_preferences: {
          $: { where: { domain_id: domainId } },
        },
      });

      return newPrefs?.[0] || null;
    }

    return prefs;
  } catch (error) {
    console.error(`Failed to get notification preferences for domain ${domainId}:`, error);
    return null;
  }
}

/**
 * Ensure notification preferences exist for a domain
 * Returns existing preferences or creates new ones if missing
 */
export async function ensureDomainNotificationPreferences(domainId: string) {
  return getDomainNotificationPreferences(domainId);
}

/**
 * Update notification preferences for a domain
 */
export async function updateDomainNotificationPreferences(
  domainId: string,
  updates: NotificationPreferencesUpdate
) {
  try {
    await db.transact([
      db.tx.email_notification_preferences[domainId].update({
        ...updates,
        updated_at: Date.now(),
      }),
    ]);
    console.log(`Updated notification preferences for domain ${domainId}`);
  } catch (error) {
    console.error(`Failed to update notification preferences for domain ${domainId}:`, error);
    throw error;
  }
}

/**
 * Check if a user should receive instant alerts (paid users only)
 */
export async function shouldSendInstantAlert(domainId: string): Promise<boolean> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.instant_alerts ?? false;
}

/**
 * Check if a user should receive daily batch notifications
 */
export async function shouldSendDailyBatch(domainId: string): Promise<boolean> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.daily_batch ?? true; // Default to true
}

/**
 * Check if a user should receive weekly recap emails
 */
export async function shouldSendWeeklyRecap(domainId: string): Promise<boolean> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.weekly_recaps ?? true; // Default to true
}

/**
 * Check if a user should receive milestone celebration emails
 */
export async function shouldSendMilestoneCelebration(domainId: string): Promise<boolean> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.milestone_celebrations ?? true; // Default to true
}

/**
 * Check if a user should receive inactivity warning emails
 */
export async function shouldSendInactivityWarning(domainId: string): Promise<boolean> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.inactivity_warnings ?? true; // Default to true
}

/**
 * Get the DA threshold for alerts
 */
export async function getDAThreshold(domainId: string): Promise<number> {
  const preferences = await getDomainNotificationPreferences(domainId);
  return preferences?.da_threshold ?? 1; // Default to 1
}

/**
 * Check for and celebrate domain milestones
 */
export async function checkAndCelebrateMilestones(
  domainId: string,
  domainUrl: string,
  userEmail: string,
  newDA: number,
  oldDA: number
): Promise<void> {
  try {
    // Find milestones that were just achieved
    const achievedMilestones = DA_MILESTONES.filter(
      milestone => oldDA < milestone && newDA >= milestone
    );

    if (achievedMilestones.length === 0) {
      return; // No milestones achieved
    }

    // Check if user has milestone celebrations enabled
    const shouldCelebrate = await shouldSendMilestoneCelebration(domainId);
    if (!shouldCelebrate) {
      console.log(`[Milestone] Skipping celebrations for ${domainUrl} - disabled by user`);
      return;
    }

    // Check which milestones haven't been celebrated yet
    const { domain_milestones } = await db.query({
      domain_milestones: {
        $: {
          where: {
            domain_id: domainId,
          },
        },
      },
    });

    const celebratedMilestones = new Set(
      (domain_milestones || []).map(m => m.da_value)
    );

    const newMilestones = achievedMilestones.filter(
      milestone => !celebratedMilestones.has(milestone)
    );

    if (newMilestones.length === 0) {
      console.log(`[Milestone] All achieved milestones already celebrated for ${domainUrl}`);
      return;
    }

    // Celebrate each new milestone
    for (const milestone of newMilestones) {
      try {
        console.log(`[Milestone] Celebrating DA ${milestone} for ${domainUrl}`);

        // Record the milestone (unique constraint prevents duplicates at DB level)
        try {
          await db.transact([
            db.tx.domain_milestones[id()].update({
              domain_id: domainId,
              da_value: milestone,
              celebrated: true,
              celebrated_at: Date.now(),
              created_at: Date.now(),
            }),
          ]);
        } catch (dbError) {
          // If unique constraint violation, milestone was already recorded (race condition)
          // Check if it was already celebrated
          const existing = domain_milestones?.find(
            m => m.domain_id === domainId && m.da_value === milestone
          );
          if (existing?.celebrated) {
            console.log(`[Milestone] DA ${milestone} already celebrated for ${domainUrl} (race condition avoided)`);
            continue;
          }
          // If not celebrated yet, re-throw to handle below
          throw dbError;
        }

        // Send celebration email
        const milestoneText = `DA ${milestone}`;
        const achievementText = `Your domain has reached Domain Authority ${milestone}!`;

        const emailResult = await sendMilestoneCelebration(
          userEmail,
          domainUrl,
          milestoneText,
          achievementText
        );

        if (emailResult.success) {
          console.log(`[Milestone] Successfully celebrated DA ${milestone} for ${domainUrl}`);
        } else {
          console.error(`[Milestone] Email failed for DA ${milestone} ${domainUrl}:`, emailResult.error);
        }

      } catch (error) {
        console.error(`[Milestone] Failed to celebrate DA ${milestone} for ${domainUrl}:`, error);
        // Continue with other milestones
      }
    }

  } catch (error) {
    console.error(`[Milestone] Error checking milestones for ${domainUrl}:`, error);
  }
}