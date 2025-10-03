/**
 * Budget monitoring utilities for API usage
 * Tracks monthly spend and enforces limits
 */

import { init } from "@instantdb/admin";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

const MONTHLY_BUDGET = 50; // $50 monthly budget
const WARNING_THRESHOLD = 0.8; // 80% of budget

export interface BudgetStatus {
  totalSpent: number;
  budget: number;
  percentUsed: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

/**
 * Get current month's API spending
 */
export async function getMonthlySpending(): Promise<number> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const { data } = await db.query({
      api_usage: {
        $: {
          where: {
            created_at: {
              $gte: monthStart,
            },
          },
        },
      },
    });

    const totalCost = data.api_usage.reduce(
      (sum: number, usage: { cost: number }) => sum + usage.cost,
      0
    );

    return totalCost;
  } catch (error) {
    console.error("[Budget Monitor] Error calculating spending:", error);
    return 0;
  }
}

/**
 * Check budget status
 */
export async function checkBudgetStatus(): Promise<BudgetStatus> {
  const totalSpent = await getMonthlySpending();
  const percentUsed = (totalSpent / MONTHLY_BUDGET) * 100;
  const remaining = MONTHLY_BUDGET - totalSpent;

  return {
    totalSpent,
    budget: MONTHLY_BUDGET,
    percentUsed,
    remaining: Math.max(0, remaining),
    isOverBudget: totalSpent >= MONTHLY_BUDGET,
    isNearLimit: percentUsed >= WARNING_THRESHOLD * 100,
  };
}

/**
 * Check if API calls should be allowed
 */
export async function canMakeAPICall(): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const status = await checkBudgetStatus();

  if (status.isOverBudget) {
    return {
      allowed: false,
      reason: "Monthly budget exceeded",
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Get usage statistics for a time period
 */
export async function getUsageStats(days: number = 30): Promise<{
  totalCalls: number;
  totalCost: number;
  avgCostPerCall: number;
  callsByDay: Record<string, number>;
}> {
  try {
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const { data } = await db.query({
      api_usage: {
        $: {
          where: {
            created_at: {
              $gte: startTime,
            },
          },
        },
      },
    });

    const totalCalls = data.api_usage.length;
    const totalCost = data.api_usage.reduce(
      (sum: number, usage: { cost: number }) => sum + usage.cost,
      0
    );

    // Group by day
    const callsByDay: Record<string, number> = {};
    data.api_usage.forEach((usage: { created_at: number }) => {
      const date = new Date(usage.created_at).toISOString().split("T")[0];
      callsByDay[date] = (callsByDay[date] || 0) + 1;
    });

    return {
      totalCalls,
      totalCost,
      avgCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      callsByDay,
    };
  } catch (error) {
    console.error("[Budget Monitor] Error getting usage stats:", error);
    return {
      totalCalls: 0,
      totalCost: 0,
      avgCostPerCall: 0,
      callsByDay: {},
    };
  }
}
