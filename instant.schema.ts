// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    "$files": i.entity({
      "path": i.string().unique().indexed(),
      "url": i.string().optional(),
    }),
    "$users": i.entity({
      "email": i.string().unique().indexed().optional(),
      "type": i.string().optional(),
    }),
    "users": i.entity({
      "auth_id": i.string().unique().indexed(), // Reference to $users.id
      "email": i.string().indexed(),
      "subscription_status": i.string(), // 'free' | 'paid' | 'cancelled'
      "stripe_customer_id": i.string().optional(),
      "subscription_ends_at": i.number().optional(), // Unix timestamp
      "domains_limit": i.number(), // 15 or more based on plan
      "created_at": i.number(), // Unix timestamp
    }),
    "domains": i.entity({
      "user_id": i.string().indexed(),
      "url": i.string(),
      "normalized_url": i.string().indexed(),
      "current_da": i.number(),
      "previous_da": i.number(),
      "da_change": i.number(),
      "last_checked": i.number(), // Unix timestamp
      "created_at": i.number(), // Unix timestamp
      "deleted_at": i.number().optional(), // Soft delete
    }),
    "dr_snapshots": i.entity({
      "domain_id": i.string().indexed(),
      "da_value": i.number(),
      "backlinks": i.number().optional(),
      "referring_domains": i.number().optional(),
      "recorded_at": i.number().indexed(), // Unix timestamp
    }),
    "api_usage": i.entity({
      "provider": i.string(), // 'karmalabs'
      "domain": i.string(),
      "cost": i.number(), // e.g., 0.001
      "created_at": i.number().indexed(), // Unix timestamp
    }),
    "achievements": i.entity({
      "user_id": i.string().indexed(), // auth_id
      "type": i.string(), // 'dr_milestone', 'domain_count', 'consistency', etc.
      "value": i.number(), // DR value, domain count, etc.
      "unlocked_at": i.number(), // Unix timestamp
      "metadata": i.json().optional(), // Additional data like domain info
    }),
    "user_goals": i.entity({
      "user_id": i.string().indexed(), // auth_id
      "domain_id": i.string().indexed(), // Reference to domains.id
      "target_dr": i.number(),
      "current_dr": i.number(),
      "deadline": i.number().optional(), // Unix timestamp
      "created_at": i.number(), // Unix timestamp
      "completed_at": i.number().optional(), // Unix timestamp
      "status": i.string(), // 'active', 'completed', 'expired'
    }),
    "milestones": i.entity({
      "user_id": i.string().indexed(), // auth_id
      "domain_id": i.string().indexed(), // Reference to domains.id
      "dr_value": i.number(),
      "celebrated": i.boolean(),
      "celebrated_at": i.number().optional(), // Unix timestamp
    }),
    "leaderboard_cache": i.entity({
      "user_id": i.string().indexed(), // auth_id
      "rank": i.number(),
      "highest_dr": i.number(),
      "total_domains": i.number(),
      "last_updated": i.number(), // Unix timestamp
      "category": i.string().optional(), // 'global', 'paid', etc.
    }),
    "email_notification_preferences": i.entity({
      "domain_id": i.string().indexed(), // Reference to domains.id
      "instant_alerts": i.boolean(), // For paid users - immediate DR changes
      "daily_batch": i.boolean(), // For free users - daily summary
      "weekly_recaps": i.boolean(), // Monday recap emails
      "milestone_celebrations": i.boolean(), // Achievement emails
      "inactivity_warnings": i.boolean(), // Day 7 and 9 warnings
      "da_threshold": i.number(), // Minimum DA change to trigger alerts
      "created_at": i.number(), // Unix timestamp
      "updated_at": i.number(), // Unix timestamp
    }),
    "domain_milestones": i.entity({
      "domain_id": i.string().indexed(), // Reference to domains.id
      "da_value": i.number(), // The DA milestone achieved
      "celebrated": i.boolean(), // Whether celebration email was sent
      "celebrated_at": i.number().optional(), // Unix timestamp when celebrated
      "created_at": i.number(), // Unix timestamp
      // Note: Unique constraint on (domain_id, da_value) enforced at application level
    }),
    "email_logs": i.entity({
      "user_id": i.string().optional().indexed(), // Reference to users.auth_id
      "domain_id": i.string().optional().indexed(), // Reference to domains.id
      "email_to": i.string().indexed(), // Recipient email
      "email_type": i.string(), // Type of email sent
      "status": i.string(), // 'sent' or 'failed'
      "error_message": i.string().optional(), // Error details if failed
      "sent_at": i.number().indexed(), // Unix timestamp
      "metadata": i.string().optional(), // JSON string with additional context
    }),
  },
  links: {},
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
