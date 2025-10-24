import { useEffect, useState } from 'react';
import { db } from './instant-client';
import { getDomainsLimitForUser } from './stripe';

interface SubscriptionStatus {
  subscriptionStatus: string;
  domainsLimit: number;
  domainsUsed: number;
  canAddDomain: boolean;
  isPaid: boolean;
}

export function useSubscription(): SubscriptionStatus | null {
  const { user } = db.useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Query user data
  const { data: userData } = db.useQuery({
    users: {
      $: {
        where: {
          auth_id: user?.id,
        },
      },
    },
  });

  // Query domains
  const { data: domainsData } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
        },
      },
    },
  });

  useEffect(() => {
    if (!userData?.users?.[0]) return;

    const currentUser = userData.users[0];
    const domains = (domainsData?.domains || []).filter(d => !d.deleted_at || d.deleted_at === 0);
    const domainsLimit = getDomainsLimitForUser(currentUser.subscription_status);
    const domainsUsed = domains.length;
    const canAddDomain = domainsUsed < domainsLimit;
    const isPaid = currentUser.subscription_status === 'paid';

    setSubscriptionStatus({
      subscriptionStatus: currentUser.subscription_status,
      domainsLimit,
      domainsUsed,
      canAddDomain,
      isPaid,
    });
  }, [userData, domainsData]);

  return subscriptionStatus;
}