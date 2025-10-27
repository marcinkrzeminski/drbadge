import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { DRChangeAlert } from '@/emails/dr-change-alert';
import { DailyBatch } from '@/emails/daily-batch';
import { WeeklyRecap } from '@/emails/weekly-recap';
import { MilestoneCelebration } from '@/emails/milestone-celebration';
import { InactivityWarning } from '@/emails/inactivity-warning';

/**
 * Preview email templates in the browser
 * Usage: GET /api/email-preview/dr-change-alert
 * Usage: GET /api/email-preview/daily-batch
 * etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { template: string } }
) {
  try {
    const { template } = params;

    let html: string;

    switch (template) {
      case 'dr-change-alert':
        html = await render(DRChangeAlert({
          domain: 'example.com',
          oldDA: 25,
          newDA: 28,
          change: 3,
          changeDirection: 'increased',
          timestamp: new Date().toISOString(),
        }));
        break;

      case 'daily-batch':
        html = await render(DailyBatch({
          domains: [
            { domain: 'example.com', oldDA: 25, newDA: 28, change: 3 },
            { domain: 'another-site.com', oldDA: 40, newDA: 38, change: -2 },
            { domain: 'third-domain.net', oldDA: 15, newDA: 20, change: 5 },
          ],
          totalChanges: 3,
          positiveChanges: 2,
          negativeChanges: 1,
          timestamp: new Date().toISOString(),
        }));
        break;

      case 'weekly-recap':
        html = await render(WeeklyRecap({
          totalDomains: 5,
          averageDA: 32.5,
          topPerformer: { domain: 'best-site.com', da: 45, change: 8 },
          biggestLoser: { domain: 'down-site.com', da: 20, change: -5 },
          weekStart: '2025-10-20',
          weekEnd: '2025-10-27',
          timestamp: new Date().toISOString(),
        }));
        break;

      case 'milestone-celebration':
        html = await render(MilestoneCelebration({
          domain: 'example.com',
          milestone: 'DA 30',
          achievement: 'Your domain has reached Domain Authority 30!',
          timestamp: new Date().toISOString(),
        }));
        break;

      case 'inactivity-warning':
        html = await render(InactivityWarning({
          daysInactive: 7,
          domainsCount: 3,
          timestamp: new Date().toISOString(),
        }));
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid template',
            available: [
              'dr-change-alert',
              'daily-batch',
              'weekly-recap',
              'milestone-celebration',
              'inactivity-warning'
            ]
          },
          { status: 400 }
        );
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[Email Preview] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
