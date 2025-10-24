import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/user-utils';
import { getDomainsLimitForUser } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const domainsLimit = getDomainsLimitForUser(user.subscription_status);

    return NextResponse.json({
      subscriptionStatus: user.subscription_status,
      domainsLimit,
      stripeCustomerId: user.stripe_customer_id,
      subscriptionEndsAt: user.subscription_ends_at,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}