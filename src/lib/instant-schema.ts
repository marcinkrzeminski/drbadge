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
