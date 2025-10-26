"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/instant-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { PLANS } from "@/lib/plans";

interface SubscriptionStatus {
  subscriptionStatus: string;
  domainsLimit: number;
  stripeCustomerId?: string;
  subscriptionEndsAt?: number;
}

export default function BillingPage() {
  const router = useRouter();
  const { isLoading, user } = db.useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  const fetchSubscriptionStatusCallback = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/billing/subscription-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscriptionStatusCallback();
  }, [fetchSubscriptionStatusCallback]);

  // Refresh after successful checkout (webhook handles the update)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('success') === 'true') {
      // Give webhook time to process, then refresh
      setTimeout(() => {
        fetchSubscriptionStatusCallback();
      }, 2000);

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/billing');
    }
  }, [fetchSubscriptionStatusCallback]);

  const handleUpgrade = async () => {
    if (!user?.id) return;


    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PLANS.PAID.priceId,
          userId: user.id,
        }),
      });


      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error('DEBUG error response:', errorData);
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPaid = subscriptionStatus?.subscriptionStatus === 'paid';
  const currentPlan = isPaid ? PLANS.PAID : PLANS.FREE;

  return (
    <div className="space-y-8 lg:pt-0 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-sm text-gray-500">
                  Up to {currentPlan.domainsLimit} domains
                </p>
              </div>
            </div>
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {isPaid ? 'Active' : 'Free'}
            </Badge>
          </div>

          {subscriptionStatus?.subscriptionEndsAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionStatus.subscriptionStatus === 'cancelled'
                  ? `Expires on ${new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}`
                  : `Renews on ${new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}`
                }
              </span>
            </div>
          )}

          <div className="flex gap-3">
            {!isPaid ? (
              <Button onClick={handleUpgrade}>
                Upgrade to Pro (${PLANS.PAID.price}/month)
              </Button>
            ) : (
              <Button variant="outline" onClick={handleManageBilling}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={!isPaid ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {PLANS.FREE.name} Plan
              {!isPaid && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">${PLANS.FREE.price}</div>
            <p className="text-sm text-gray-500 mb-4">per month</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Up to {PLANS.FREE.domainsLimit} domains
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Domain authority tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Basic analytics
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Paid Plan */}
        <Card className={isPaid ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {PLANS.PAID.name} Plan
              {isPaid && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>For serious domain monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">${PLANS.PAID.price}</div>
            <p className="text-sm text-gray-500 mb-4">per month</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Up to {PLANS.PAID.domainsLimit} domains
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Export data
              </li>
            </ul>
            {!isPaid && (
              <Button className="w-full mt-4" onClick={handleUpgrade}>
                Upgrade Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}