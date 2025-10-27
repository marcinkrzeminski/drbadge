import Plunk from '@plunk/node';
import { render } from '@react-email/components';
import { DRChangeAlert } from '../emails/dr-change-alert';
import { DailyBatch } from '../emails/daily-batch';
import { WeeklyRecap } from '../emails/weekly-recap';
import { MilestoneCelebration } from '../emails/milestone-celebration';
import { InactivityWarning } from '../emails/inactivity-warning';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Lazy-load Plunk client to prevent app crashes when API key is missing
let plunkClient: Plunk | null = null;

function getPlunkClient(): Plunk {
  if (!plunkClient) {
    if (!process.env.PLUNK_SECRET_API_KEY) {
      throw new Error('PLUNK_SECRET_API_KEY environment variable is required');
    }
    plunkClient = new Plunk(process.env.PLUNK_SECRET_API_KEY);
  }
  return plunkClient;
}

// Deprecated: use getPlunkClient() instead
export const plunk = {
  get emails() {
    return getPlunkClient().emails;
  }
};

export interface EmailNotificationPreferences {
  domain_id: string;
  instant_alerts: boolean; // For paid users - immediate DR changes
  daily_batch: boolean; // For free users - daily summary
  weekly_recaps: boolean; // Monday recap emails
  milestone_celebrations: boolean; // Achievement emails
  inactivity_warnings: boolean; // Day 7 and 9 warnings
  da_threshold: number; // Minimum DA change to trigger alerts (default: 1)
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  type?: 'html' | 'markdown';
}

// Email template functions (will render React Email components to HTML)
export const EMAIL_TEMPLATES = {
  DR_CHANGE_ALERT: 'dr-change-alert',
  DAILY_BATCH: 'daily-batch',
  WEEKLY_RECAP: 'weekly-recap',
  MILESTONE_CELEBRATION: 'milestone-celebration',
  INACTIVITY_WARNING: 'inactivity-warning',
} as const;

export interface EmailResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface EmailLogContext {
  userId?: string;
  domainId?: string;
  emailType: string;
  metadata?: Record<string, any>;
}

/**
 * Log email send attempt to database for audit trail
 */
async function logEmail(
  to: string,
  context: EmailLogContext,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    await db.transact([
      db.tx.email_logs[id()].update({
        user_id: context.userId,
        domain_id: context.domainId,
        email_to: to,
        email_type: context.emailType,
        status: success ? 'sent' : 'failed',
        error_message: errorMessage,
        sent_at: Date.now(),
        metadata: context.metadata ? JSON.stringify(context.metadata) : undefined,
      }),
    ]);
  } catch (error) {
    // Don't fail email sending if logging fails
    console.error('[Email Log] Failed to log email:', error);
  }
}

export async function sendEmail(
  { to, subject, body, type = 'html' }: EmailData,
  logContext?: EmailLogContext
): Promise<EmailResult> {
  try {
    const client = getPlunkClient();
    const result = await client.emails.send({
      to,
      subject,
      body,
      type,
    });

    console.log(`Email sent successfully to ${to}:`, result);

    // Log successful send
    if (logContext) {
      await logEmail(to, logContext, true);
    }

    return { success: true, result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send email to ${to}:`, errorMessage);

    // Log failed send
    if (logContext) {
      await logEmail(to, logContext, false, errorMessage);
    }

    // Don't throw - return error info so cron jobs can continue
    return { success: false, error: errorMessage };
  }
}

export async function sendDRChangeAlert(
  email: string,
  domain: string,
  oldDA: number,
  newDA: number,
  change: number
) {
  const subject = `DR Change Alert: ${domain} ${change > 0 ? '+' : ''}${change}`;

  const html = await render(DRChangeAlert({
    domain,
    oldDA,
    newDA,
    change,
    changeDirection: change > 0 ? 'increased' : 'decreased',
    timestamp: new Date().toISOString(),
  }));

  return sendEmail({
    to: email,
    subject,
    body: html,
  });
}

export async function sendDailyBatch(
  email: string,
  domains: Array<{
    domain: string;
    oldDA: number;
    newDA: number;
    change: number;
  }>
) {
  const totalChanges = domains.length;
  const positiveChanges = domains.filter(d => d.change > 0).length;
  const negativeChanges = domains.filter(d => d.change < 0).length;

  const subject = `Daily DR Update: ${totalChanges} domain${totalChanges !== 1 ? 's' : ''} updated`;

  const html = await render(DailyBatch({
    domains,
    totalChanges,
    positiveChanges,
    negativeChanges,
    timestamp: new Date().toISOString(),
  }));

  return sendEmail({
    to: email,
    subject,
    body: html,
  });
}

export async function sendWeeklyRecap(
  email: string,
  stats: {
    totalDomains: number;
    averageDA: number;
    topPerformer: { domain: string; da: number; change: number };
    biggestLoser: { domain: string; da: number; change: number };
    weekStart: string;
    weekEnd: string;
  }
) {
  const subject = 'Weekly DR Recap - Your Domain Authority Summary';

  const html = await render(WeeklyRecap({
    ...stats,
    timestamp: new Date().toISOString(),
  }));

  return sendEmail({
    to: email,
    subject,
    body: html,
  });
}

export async function sendMilestoneCelebration(
  email: string,
  domain: string,
  milestone: string,
  achievement: string
) {
  const subject = `🎉 Milestone Achieved: ${domain} ${milestone}`;

  const html = await render(MilestoneCelebration({
    domain,
    milestone,
    achievement,
    timestamp: new Date().toISOString(),
  }));

  return sendEmail({
    to: email,
    subject,
    body: html,
  });
}

export async function sendInactivityWarning(
  email: string,
  daysInactive: number,
  domainsCount: number
) {
  const subject = `We miss you! Check your domain rankings`;

  const html = await render(InactivityWarning({
    daysInactive,
    domainsCount,
    timestamp: new Date().toISOString(),
  }));

  return sendEmail({
    to: email,
    subject,
    body: html,
  });
}

/**
 * Validate email data before sending
 */
export function validateEmailData(email: string, type: string, data?: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Invalid email address');
  }

  // Validate type-specific data
  switch (type) {
    case 'dr-change-alert':
      if (!data?.domain) errors.push('Domain is required for DR change alerts');
      if (typeof data?.oldDA !== 'number') errors.push('Old DA must be a number');
      if (typeof data?.newDA !== 'number') errors.push('New DA must be a number');
      if (typeof data?.change !== 'number') errors.push('Change must be a number');
      break;

    case 'daily-batch':
      if (!Array.isArray(data?.domains)) errors.push('Domains must be an array for daily batch');
      if (data?.domains?.length === 0) errors.push('At least one domain is required for daily batch');
      break;

    case 'weekly-recap':
      if (typeof data?.totalDomains !== 'number') errors.push('Total domains must be a number');
      if (typeof data?.averageDA !== 'number') errors.push('Average DA must be a number');
      if (!data?.topPerformer) errors.push('Top performer data is required');
      if (!data?.biggestLoser) errors.push('Biggest loser data is required');
      break;

    case 'milestone-celebration':
      if (!data?.domain) errors.push('Domain is required for milestone celebrations');
      if (!data?.milestone) errors.push('Milestone is required');
      if (!data?.achievement) errors.push('Achievement description is required');
      break;

    case 'inactivity-warning':
      if (typeof data?.daysInactive !== 'number') errors.push('Days inactive must be a number');
      if (typeof data?.domainsCount !== 'number') errors.push('Domains count must be a number');
      break;

    default:
      errors.push('Invalid email type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test email configuration and connectivity
 * Note: Provide a real email address for actual testing
 */
export async function testEmailConfiguration(testEmail?: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Check if Plunk client can be initialized
    const client = getPlunkClient();

    if (!testEmail) {
      // Just verify client initialization without sending
      return {
        success: true,
        message: 'Email client configured successfully (no test email sent)',
        details: { plunkConfigured: true },
      };
    }

    // Send actual test email if address provided
    const testResult = await sendEmail({
      to: testEmail,
      subject: 'DrBadge Email Configuration Test',
      body: '<p>This is a test email to verify your DrBadge email configuration is working correctly.</p>',
    });

    return {
      success: testResult.success,
      message: testResult.success
        ? 'Email configuration test successful - check inbox'
        : 'Email test failed',
      details: testResult,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Email configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}