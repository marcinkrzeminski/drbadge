"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/instant-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLANS, DOMAIN_OPTIONS } from "@/lib/plans";
import posthog from 'posthog-js';

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
  const [selectedDomainCount, setSelectedDomainCount] = useState<number>(15);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

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

  const handleUpgrade = async (domainCount: number = 15, isAnnual: boolean = false) => {
    if (!user?.id) return;

    // Get the appropriate plan based on domain count and billing period
    let plan;
    let priceId;
    switch (domainCount) {
      case 15:
        plan = isAnnual ? PLANS.PAID_15_ANNUAL : PLANS.PAID_15_MONTHLY;
        priceId = plan.priceId;
        break;
      case 25:
        plan = isAnnual ? PLANS.PAID_25_ANNUAL : PLANS.PAID_25_MONTHLY;
        priceId = plan.priceId;
        break;
      case 50:
        plan = isAnnual ? PLANS.PAID_50_ANNUAL : PLANS.PAID_50_MONTHLY;
        priceId = plan.priceId;
        break;
      case 100:
        plan = isAnnual ? PLANS.PAID_100_ANNUAL : PLANS.PAID_100_MONTHLY;
        priceId = plan.priceId;
        break;
      default:
        plan = PLANS.PAID_15_MONTHLY;
        priceId = plan.priceId;
    }

    posthog.capture('upgrade-to-pro-clicked', {
      price: plan.price,
      priceId: priceId,
      domainCount: domainCount,
      isAnnual: isAnnual
    });

    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
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

  const getPlanByDomainCount = (domainCount: number, isAnnual: boolean = false): typeof PLANS.FREE | typeof PLANS.PAID_15_MONTHLY | typeof PLANS.PAID_25_MONTHLY | typeof PLANS.PAID_50_MONTHLY | typeof PLANS.PAID_100_MONTHLY | typeof PLANS.PAID_15_ANNUAL | typeof PLANS.PAID_25_ANNUAL | typeof PLANS.PAID_50_ANNUAL | typeof PLANS.PAID_100_ANNUAL => {
    switch (domainCount) {
      case 15: return isAnnual ? PLANS.PAID_15_ANNUAL : PLANS.PAID_15_MONTHLY;
      case 25: return isAnnual ? PLANS.PAID_25_ANNUAL : PLANS.PAID_25_MONTHLY;
      case 50: return isAnnual ? PLANS.PAID_50_ANNUAL : PLANS.PAID_50_MONTHLY;
      case 100: return isAnnual ? PLANS.PAID_100_ANNUAL : PLANS.PAID_100_MONTHLY;
      default: 
        // Find the closest plan
        const availablePlans = [15, 25, 50, 100];
        const closestPlan = availablePlans.find(plan => plan >= domainCount) || 15;
        switch (closestPlan) {
          case 25: return isAnnual ? PLANS.PAID_25_ANNUAL : PLANS.PAID_25_MONTHLY;
          case 50: return isAnnual ? PLANS.PAID_50_ANNUAL : PLANS.PAID_50_MONTHLY;
          case 100: return isAnnual ? PLANS.PAID_100_ANNUAL : PLANS.PAID_100_MONTHLY;
          default: return isAnnual ? PLANS.PAID_15_ANNUAL : PLANS.PAID_15_MONTHLY;
        }
    }
  };

  const getPlanPrice = (domainCount: number, isAnnual: boolean = false): number => {
    switch (domainCount) {
      case 15: return isAnnual ? PLANS.PAID_15_ANNUAL.price : PLANS.PAID_15_MONTHLY.price;
      case 25: return isAnnual ? PLANS.PAID_25_ANNUAL.price : PLANS.PAID_25_MONTHLY.price;
      case 50: return isAnnual ? PLANS.PAID_50_ANNUAL.price : PLANS.PAID_50_MONTHLY.price;
      case 100: return isAnnual ? PLANS.PAID_100_ANNUAL.price : PLANS.PAID_100_MONTHLY.price;
      default: return PLANS.PAID_15_MONTHLY.price;
    }
  };

  const handleManageBilling = async () => {
    if (!user?.id) return;

    posthog.capture('manage-billing-clicked');

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
  let currentPlan: typeof PLANS.FREE | typeof PLANS.PAID_15_MONTHLY | typeof PLANS.PAID_25_MONTHLY | typeof PLANS.PAID_50_MONTHLY | typeof PLANS.PAID_100_MONTHLY | typeof PLANS.PAID_15_ANNUAL | typeof PLANS.PAID_25_ANNUAL | typeof PLANS.PAID_50_ANNUAL | typeof PLANS.PAID_100_ANNUAL = PLANS.FREE;
  
  if (isPaid && subscriptionStatus?.domainsLimit) {
    const planKeys = Object.keys(PLANS).filter(key => 
      key.startsWith('PAID_') && 
      !key.includes('ANNUAL') &&
      PLANS[key as keyof typeof PLANS].domainsLimit === subscriptionStatus.domainsLimit
    );
    
    if (planKeys.length > 0) {
      currentPlan = PLANS[planKeys[0] as keyof typeof PLANS] as typeof PLANS.PAID_15_MONTHLY;
    } else {
      currentPlan = PLANS.PAID_15_MONTHLY; // fallback
    }
  }

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
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Select number of domains:</span>
                  <Select 
                    value={selectedDomainCount.toString()} 
                    onValueChange={(value) => setSelectedDomainCount(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Billing period:</span>
                  <Button 
                    variant={isAnnual ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setIsAnnual(true)}
                  >
                    Annual
                  </Button>
                  <Button 
                    variant={!isAnnual ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setIsAnnual(false)}
                  >
                    Monthly
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {isAnnual ? "15% discount with annual billing" : "Pay month-to-month"}
                </div>
                <Button onClick={() => handleUpgrade(selectedDomainCount, isAnnual)}>
                  Upgrade to Pro (${getPlanPrice(selectedDomainCount, isAnnual)}/{isAnnual ? 'year' : 'month'})
                </Button>
              </div>
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
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                Domain Rating tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {PLANS.FREE.refreshFrequency}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Basic analytics
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Paid Plans */}
        {DOMAIN_OPTIONS.map((domainCount) => {
          const monthlyPlan = getPlanByDomainCount(domainCount, false);
          const annualPlan = getPlanByDomainCount(domainCount, true);
          return (
            <Card key={domainCount} className={isPaid && subscriptionStatus?.domainsLimit === domainCount ? "ring-2 ring-blue-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {monthlyPlan.name} Plan ({domainCount} domains)
                  {isPaid && subscriptionStatus?.domainsLimit === domainCount && <Badge>Current</Badge>}
                </CardTitle>
                <CardDescription>For serious domain monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold">${monthlyPlan.price}/mo</div>
                    <div className="text-sm text-gray-500">Monthly billing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${annualPlan.price}/yr</div>
                    <div className="text-sm text-gray-500">
                      ${Math.round(annualPlan.price / 12)}/mo billed yearly
                      <div className="text-green-600 font-medium">Save 15%</div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm mt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Up to {domainCount} domains
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span title={monthlyPlan.refreshDescription}>
                      {monthlyPlan.refreshFrequency}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited on-demand updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics & charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
                {!isPaid && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={() => handleUpgrade(domainCount, false)}>
                      Monthly Plan
                    </Button>
                    <Button variant="secondary" onClick={() => handleUpgrade(domainCount, true)}>
                      Annual Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
