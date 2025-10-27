export const PRICE_IDS = {
  FREE: '',
  PAID_15_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_15_MONTHLY || '',
  PAID_15_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_15_ANNUAL || '',
  PAID_25_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_25_MONTHLY || '',
  PAID_25_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_25_ANNUAL || '',
  PAID_50_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_50_MONTHLY || '',
  PAID_50_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_50_ANNUAL || '',
  PAID_100_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_100_MONTHLY || '',
  PAID_100_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID_100_ANNUAL || '',
} as const;

export const PLANS = {
  FREE: {
    name: 'Free',
    domainsLimit: 15,
    priceId: PRICE_IDS.FREE,
    price: 0,
    refreshFrequency: '1x daily',
    refreshDescription: 'Domain metrics updated once per day',
  },
  PAID_15_MONTHLY: {
    name: 'Pro',
    domainsLimit: 15,
    priceId: PRICE_IDS.PAID_15_MONTHLY,
    price: 5.00, // Competitive pricing matching FrogDR. 15 domains × 4 checks/day × 30 days = 1,800 requests + on-demand (~75) = $3.75 API cost. Profitability: ~16% (growth strategy)
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_15_ANNUAL: {
    name: 'Pro',
    domainsLimit: 15,
    priceId: PRICE_IDS.PAID_15_ANNUAL,
    price: 51.00, // Annual price with 15% discount: $5.00 × 12 × 0.85
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_25_MONTHLY: {
    name: 'Pro',
    domainsLimit: 25,
    priceId: PRICE_IDS.PAID_25_MONTHLY,
    price: 9.00, // Competitive pricing matching FrogDR. 25 domains × 4 checks/day × 30 days = 3,000 requests + on-demand (~125) = $6.25 API cost. Profitability: ~24% (growth strategy)
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_25_ANNUAL: {
    name: 'Pro',
    domainsLimit: 25,
    priceId: PRICE_IDS.PAID_25_ANNUAL,
    price: 91.80, // Annual price with 15% discount: $9.00 × 12 × 0.85
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_50_MONTHLY: {
    name: 'Pro',
    domainsLimit: 50,
    priceId: PRICE_IDS.PAID_50_MONTHLY,
    price: 16.00, // Competitive pricing matching FrogDR. 50 domains × 4 checks/day × 30 days = 6,000 requests + on-demand (~250) = $12.50 API cost. Profitability: ~17% (growth strategy)
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_50_ANNUAL: {
    name: 'Pro',
    domainsLimit: 50,
    priceId: PRICE_IDS.PAID_50_ANNUAL,
    price: 163.20, // Annual price with 15% discount: $16.00 × 12 × 0.85
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_100_MONTHLY: {
    name: 'Pro',
    domainsLimit: 100,
    priceId: PRICE_IDS.PAID_100_MONTHLY,
    price: 29.00, // Competitive pricing matching FrogDR. 100 domains × 4 checks/day × 30 days = 12,000 requests + on-demand (~500) = $25.00 API cost. Profitability: ~10% (growth strategy)
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
  PAID_100_ANNUAL: {
    name: 'Pro',
    domainsLimit: 100,
    priceId: PRICE_IDS.PAID_100_ANNUAL,
    price: 295.80, // Annual price with 15% discount: $29.00 × 12 × 0.85
    refreshFrequency: '4x daily + on-demand',
    refreshDescription: 'Automatic updates every 6 hours plus unlimited manual refresh',
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Export the domain options for use in the UI
export const DOMAIN_OPTIONS = [15, 25, 50, 100] as const;
export type DomainOption = typeof DOMAIN_OPTIONS[number];

// Helper function to get plan by domain count and billing period
export function getPlanByDomainCount(domainCount: number, isAnnual: boolean = false) {
  switch (domainCount) {
    case 15: return isAnnual ? PLANS.PAID_15_ANNUAL : PLANS.PAID_15_MONTHLY;
    case 25: return isAnnual ? PLANS.PAID_25_ANNUAL : PLANS.PAID_25_MONTHLY;
    case 50: return isAnnual ? PLANS.PAID_50_ANNUAL : PLANS.PAID_50_MONTHLY;
    case 100: return isAnnual ? PLANS.PAID_100_ANNUAL : PLANS.PAID_100_MONTHLY;
    default: return PLANS.PAID_15_MONTHLY;
  }
}

export function getPlanByPriceId(priceId: string | null) {
  if (!priceId) return null;
  return Object.values(PLANS).find(plan => plan.priceId === priceId);
}

export function getPlanByType(type: PlanType) {
  return PLANS[type];
}

export function getDomainsLimitForUser(subscriptionStatus: string, domainsLimit?: number): number {
  if (subscriptionStatus === 'paid' && domainsLimit) {
    return domainsLimit;
  }
  if (subscriptionStatus === 'paid') {
    // For backward compatibility, return the smallest paid plan limit
    return PLANS.PAID_15_MONTHLY.domainsLimit;
  }
  return PLANS.FREE.domainsLimit;
}
