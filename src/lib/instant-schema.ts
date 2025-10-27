/**
 * InstantDB Schema Definitions
 *
 * This file documents the schema structure for InstantDB collections.
 * InstantDB is schema-less, but we define types for TypeScript safety.
 */

export interface User {
  id: string; // Auto-created by InstantDB
  email: string; // From OAuth
  subscription_status: 'free' | 'paid' | 'cancelled';
  stripe_customer_id?: string;
  subscription_ends_at?: number; // Unix timestamp
  domains_limit: number; // 3 for free, 12 for paid
  created_at: number; // Unix timestamp
}

export interface Domain {
  id: string;
  user_id: string;
  url: string; // Original URL
  normalized_url: string; // Cleaned URL (no https://, www)
  current_da: number;
  previous_da: number;
  da_change: number;
  last_checked: number; // Unix timestamp
  created_at: number; // Unix timestamp
  deleted_at?: number; // Soft delete timestamp
}

export interface DrSnapshot {
  id: string;
  domain_id: string;
  da_value: number;
  backlinks?: number;
  referring_domains?: number;
  recorded_at: number; // Unix timestamp
}

export interface ApiUsage {
  id: string;
  provider: 'karmalabs'; // SEO Intelligence by KarmaLabs
  domain: string;
  cost: number; // Cost per call (e.g., 0.001)
  created_at: number; // Unix timestamp
}

export interface EmailNotificationPreferences {
  id: string;
  domain_id: string; // References Domain.id
  instant_alerts: boolean; // For paid users - immediate DR changes
  daily_batch: boolean; // For free users - daily summary
  weekly_recaps: boolean; // Monday recap emails
  milestone_celebrations: boolean; // Achievement emails
  inactivity_warnings: boolean; // Day 7 and 9 warnings
  da_threshold: number; // Minimum DA change to trigger alerts (default: 1)
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface DomainMilestone {
  id: string;
  domain_id: string; // References Domain.id
  da_value: number; // The DA milestone achieved (e.g., 20, 30, 50)
  celebrated: boolean; // Whether celebration email was sent
  celebrated_at?: number; // Unix timestamp when celebrated
  created_at: number; // Unix timestamp
}

export interface EmailLog {
  id: string;
  user_id?: string; // References User.auth_id (optional for system emails)
  domain_id?: string; // References Domain.id (optional)
  email_to: string; // Recipient email address
  email_type: 'dr-change-alert' | 'daily-batch' | 'weekly-recap' | 'milestone-celebration' | 'inactivity-warning';
  status: 'sent' | 'failed';
  error_message?: string; // Error details if failed
  sent_at: number; // Unix timestamp
  metadata?: string; // JSON string with additional context (e.g., DA values, domain count)
}

/**
 * Helper function to create initial user data
 */
export function createUserData(email: string): Omit<User, 'id'> {
  return {
    email,
    subscription_status: 'free',
    domains_limit: 3,
    created_at: Date.now(),
  };
}

/**
 * Helper function to create domain data
 */
export function createDomainData(
  userId: string,
  url: string,
  normalizedUrl: string
): Omit<Domain, 'id'> {
  return {
    user_id: userId,
    url,
    normalized_url: normalizedUrl,
    current_da: 0,
    previous_da: 0,
    da_change: 0,
    last_checked: 0,
    created_at: Date.now(),
  };
}

/**
 * Helper function to create default email notification preferences for a domain
 */
export function createDefaultNotificationPreferences(
  domainId: string
): Omit<EmailNotificationPreferences, 'id'> {
  return {
    domain_id: domainId,
    instant_alerts: false, // Default off, user can enable
    daily_batch: true, // Default on for all users
    weekly_recaps: true, // Default on for all users
    milestone_celebrations: true, // Default on for all users
    inactivity_warnings: true, // Default on for all users
    da_threshold: 1, // Alert on any DA change >= 1
    created_at: Date.now(),
    updated_at: Date.now(),
  };
}
