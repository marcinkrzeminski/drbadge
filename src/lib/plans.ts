export const PRICE_IDS = {
  FREE: '',
  PAID: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PAID || '',
} as const;

export const PLANS = {
  FREE: {
    name: 'Free',
    domainsLimit: 3,
    priceId: PRICE_IDS.FREE,
    price: 0,
  },
  PAID: {
    name: 'Pro',
    domainsLimit: 12,
    priceId: PRICE_IDS.PAID,
    price: 5,
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string | null) {
  if (!priceId) return null;
  return Object.values(PLANS).find(plan => plan.priceId === priceId);
}

export function getPlanByType(type: PlanType) {
  return PLANS[type];
}

export function getDomainsLimitForUser(subscriptionStatus: string): number {
  if (subscriptionStatus === 'paid') {
    return PLANS.PAID.domainsLimit;
  }
  return PLANS.FREE.domainsLimit;
}
