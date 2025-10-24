import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { updateUser } from '@/lib/user-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  try {
    // Update user subscription status
    await updateUser(userId, {
      subscription_status: 'paid',
      stripe_customer_id: customerId,
    });

    console.log(`User ${userId} subscription activated`);
  } catch (error) {
    console.error('Failed to update user after checkout:', error);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await getUserByStripeCustomerId(customerId);
    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const status = subscription.status;
    const currentPeriodEnd = (subscription as any).current_period_end;

    let subscriptionStatus = 'free';
    if (status === 'active') {
      subscriptionStatus = 'paid';
    } else if (status === 'canceled' || status === 'incomplete_expired') {
      subscriptionStatus = 'cancelled';
    }

    await updateUser(user.id, {
      subscription_status: subscriptionStatus,
      subscription_ends_at: (subscription as any).current_period_end * 1000, // Convert to milliseconds
    });

    console.log(`User ${user.id} subscription updated to ${subscriptionStatus}`);
  } catch (error) {
    console.error('Failed to handle subscription change:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const user = await getUserByStripeCustomerId(customerId);
    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    await updateUser(user.id, {
      subscription_status: 'cancelled',
      subscription_ends_at: (subscription as any).current_period_end * 1000,
    });

    console.log(`User ${user.id} subscription cancelled`);
  } catch (error) {
    console.error('Failed to handle subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment - could send confirmation email, etc.
  console.log('Invoice payment succeeded:', invoice.id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment - could send warning email, etc.
  console.log('Invoice payment failed:', invoice.id);
}

// Helper function to find user by Stripe customer ID
async function getUserByStripeCustomerId(customerId: string) {
  // This is a simplified version - in a real app you'd want to index this field
  // For now, we'll query all users and find the match
  const { users } = await import('@/lib/instant-server').then(({ db }) =>
    db.query({ users: {} })
  );

  return users?.find((user: any) => user.stripe_customer_id === customerId) || null;
}