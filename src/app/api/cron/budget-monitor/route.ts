/**
 * API Route: Budget Monitor Cron Job
 * Runs hourly to check API spending and send alerts
 * Triggers: Vercel Cron (every hour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkBudgetStatus } from '@/lib/budget-monitor';

const ALERT_EMAIL = process.env.ALERT_EMAIL || 'marcin@drbadge.com';
const ALERT_THRESHOLD = 0.7; // 70%

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = await checkBudgetStatus();

    // Send alert if threshold exceeded
    if (status.percentUsed >= ALERT_THRESHOLD * 100) {
      await sendBudgetAlert(status);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      budget: {
        total: status.budget,
        spent: status.totalSpent,
        remaining: status.remaining,
        percentUsed: status.percentUsed,
        isOverBudget: status.isOverBudget,
        isNearLimit: status.isNearLimit,
      },
      alertSent: status.percentUsed >= ALERT_THRESHOLD * 100,
    });
  } catch (error) {
    console.error('[Budget Monitor] Error:', error);

    return NextResponse.json(
      {
        error: 'Budget monitoring failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Send budget alert email via Plunk
 */
async function sendBudgetAlert(status: {
  totalSpent: number;
  budget: number;
  percentUsed: number;
  remaining: number;
  isOverBudget: boolean;
}): Promise<void> {
  const plunkApiKey = process.env.PLUNK_SECRET_API_KEY;

  if (!plunkApiKey) {
    console.error('[Budget Monitor] Plunk API key not configured');
    return;
  }

  try {
    const subject = status.isOverBudget
      ? '🚨 API Budget EXCEEDED - DrBadge'
      : '⚠️ API Budget Alert - DrBadge';

    const body = `
API Budget Alert - DrBadge

Current Status:
- Spent: $${status.totalSpent.toFixed(2)}
- Budget: $${status.budget.toFixed(2)}
- Remaining: $${status.remaining.toFixed(2)}
- Usage: ${status.percentUsed.toFixed(1)}%

${status.isOverBudget ? '🚨 BUDGET EXCEEDED! API calls may be blocked.' : '⚠️ Approaching budget limit.'}

Time: ${new Date().toISOString()}

---
DrBadge Budget Monitor
    `.trim();

    const response = await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${plunkApiKey}`,
      },
      body: JSON.stringify({
        to: ALERT_EMAIL,
        subject: subject,
        body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Budget Monitor] Failed to send email:', error);
      return;
    }
  } catch (error) {
    console.error('[Budget Monitor] Error sending alert:', error);
  }
}
