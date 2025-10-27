import { stripe, getDomainsLimitForUser } from './stripe';
import { getUser, updateUser } from './user-utils';

export interface SubscriptionData {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
      };
    }>;
  };
}

export async function createSubscription(userId: string, priceId: string) {
  try {
    const user = await getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.stripe_customer_id) {
      throw new Error('User has no Stripe customer ID');
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user subscription status
    // For now, we'll use a default limit - in the future we'll extract this from the subscription
    const domainsLimit = getDomainsLimitForUser('paid');
    await updateUser(userId, {
      subscription_status: 'paid',
      domains_limit: domainsLimit,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(userId: string, cancelAtPeriodEnd = true) {
  try {
    const user = await getUser(userId);
    if (!user || !user.stripe_customer_id) {
      throw new Error('User not found or has no Stripe customer ID');
    }

    // Get user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found');
    }

    const subscription = subscriptions.data[0];

    if (cancelAtPeriodEnd) {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Update user status
    await updateUser(userId, {
      subscription_status: 'cancelled',
      subscription_ends_at: cancelAtPeriodEnd ? (subscription as any).current_period_end * 1000 : Date.now(),
    });

    return { success: true, cancelAtPeriodEnd };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}

export async function updateSubscription(userId: string, newPriceId: string) {
  try {
    const user = await getUser(userId);
    if (!user || !user.stripe_customer_id) {
      throw new Error('User not found or has no Stripe customer ID');
    }

    // Get user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found');
    }

    const subscription = subscriptions.data[0];

    // Update subscription item with new price
    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
}

export async function getSubscriptionStatus(userId: string) {
  try {
    const user = await getUser(userId);
    if (!user || !user.stripe_customer_id) {
      return {
        status: 'free',
        domainsLimit: getDomainsLimitForUser('free'),
        subscription: null,
      };
    }

    // Get subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return {
        status: 'free',
        domainsLimit: getDomainsLimitForUser('free'),
        subscription: null,
      };
    }

    const status = subscription.status === 'active' ? 'paid' : 'cancelled';
    const domainsLimit = getDomainsLimitForUser(status);

    return {
      status,
      domainsLimit,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: (subscription as any).current_period_start,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        price: subscription.items.data[0]?.price.unit_amount || 0,
      },
    };
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    throw error;
  }
}

export async function reactivateSubscription(userId: string) {
  try {
    const user = await getUser(userId);
    if (!user || !user.stripe_customer_id) {
      throw new Error('User not found or has no Stripe customer ID');
    }

    // Get user's canceled subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'canceled',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No canceled subscription found');
    }

    const subscription = subscriptions.data[0];

    // Reactivate subscription
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    // Update user status
    await updateUser(userId, {
      subscription_status: 'paid',
      subscription_ends_at: null,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    throw error;
  }
}