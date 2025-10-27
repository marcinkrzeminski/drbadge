/**
 * API Route: Test Email Functionality
 * Allows testing email templates and sending without affecting real users
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendDRChangeAlert, sendDailyBatch, sendWeeklyRecap, sendMilestoneCelebration, sendInactivityWarning, validateEmailData, testEmailConfiguration } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, testData } = body;

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: email and type' },
        { status: 400 }
      );
    }

    // Validate email data
    const validation = validateEmailData(email, type, testData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    console.log(`[Test Email] Sending ${type} test email to ${email}`);

    let result;

    switch (type) {
      case 'dr-change-alert':
        result = await sendDRChangeAlert(
          email,
          testData?.domain || 'example.com',
          testData?.oldDA || 15,
          testData?.newDA || 18,
          testData?.change || 3
        );
        break;

      case 'daily-batch':
        result = await sendDailyBatch(
          email,
          testData?.domains || [
            { domain: 'example.com', oldDA: 15, newDA: 18, change: 3 },
            { domain: 'testsite.org', oldDA: 22, newDA: 20, change: -2 },
          ]
        );
        break;

      case 'weekly-recap':
        result = await sendWeeklyRecap(
          email,
          testData || {
            totalDomains: 3,
            averageDA: 25.5,
            topPerformer: { domain: 'example.com', da: 30, change: 5 },
            biggestLoser: { domain: 'testsite.org', da: 20, change: -3 },
            weekStart: '2024-01-01',
            weekEnd: '2024-01-08',
          }
        );
        break;

      case 'milestone-celebration':
        result = await sendMilestoneCelebration(
          email,
          testData?.domain || 'example.com',
          testData?.milestone || 'DA 20',
          testData?.achievement || 'Your domain has reached Domain Authority 20!'
        );
        break;

      case 'inactivity-warning':
        result = await sendInactivityWarning(
          email,
          testData?.daysInactive || 7,
          testData?.domainsCount || 3
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Supported types: dr-change-alert, daily-batch, weekly-recap, milestone-celebration, inactivity-warning' },
          { status: 400 }
        );
    }

    console.log(`[Test Email] Successfully sent ${type} test email to ${email}`);

    return NextResponse.json({
      success: true,
      type,
      email,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Test Email] Error:', error);

    return NextResponse.json(
      {
        error: 'Test email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'test-config') {
    const result = await testEmailConfiguration();
    return NextResponse.json(result);
  }

  return NextResponse.json({
    message: 'Test Email API',
    supported_types: [
      'dr-change-alert',
      'daily-batch',
      'weekly-recap',
      'milestone-celebration',
      'inactivity-warning',
    ],
    endpoints: {
      'POST /api/test-email': {
        description: 'Send a test email of specified type',
        body: {
          type: 'string (required)',
          email: 'string (required)',
          testData: 'object (optional, type-specific test data)',
        },
      },
      'GET /api/test-email?action=test-config': {
        description: 'Test email configuration and connectivity',
      },
    },
  });
}