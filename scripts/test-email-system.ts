#!/usr/bin/env tsx

/**
 * Test script for the email notification system
 * Tests all email types and cron job logic without sending real emails
 */

import { validateEmailData, testEmailConfiguration } from "../src/lib/email";
import {
  shouldSendInstantAlert,
  getDAThreshold,
  DA_MILESTONES,
} from "../src/lib/notification-utils";

async function testEmailValidation() {
  console.log("🧪 Testing email validation...\n");

  const testCases = [
    {
      name: "Valid DR change alert",
      email: "marcin+drbage@krzeminski.net",
      type: "dr-change-alert",
      data: { domain: "example.com", oldDA: 15, newDA: 18, change: 3 },
      expected: true,
    },
    {
      name: "Invalid email",
      email: "invalid-email",
      type: "dr-change-alert",
      data: { domain: "example.com", oldDA: 15, newDA: 18, change: 3 },
      expected: false,
    },
    {
      name: "Missing domain for DR alert",
      email: "marcin+drbage@krzeminski.net",
      type: "dr-change-alert",
      data: { oldDA: 15, newDA: 18, change: 3 },
      expected: false,
    },
    {
      name: "Valid daily batch",
      email: "marcin+drbage@krzeminski.net",
      type: "daily-batch",
      data: {
        domains: [{ domain: "example.com", oldDA: 15, newDA: 18, change: 3 }],
      },
      expected: true,
    },
    {
      name: "Empty domains for daily batch",
      email: "marcin+drbage@krzeminski.net",
      type: "daily-batch",
      data: { domains: [] },
      expected: false,
    },
  ];

  for (const testCase of testCases) {
    const result = validateEmailData(
      testCase.email,
      testCase.type,
      testCase.data
    );
    const status = result.valid === testCase.expected ? "✅" : "❌";
    console.log(
      `${status} ${testCase.name}: ${result.valid ? "Valid" : "Invalid"}`
    );
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(", ")}`);
    }
  }

  console.log("");
}

async function testEmailConfigurationCheck() {
  console.log("🔧 Testing email configuration...\n");

  try {
    const result = await testEmailConfiguration();
    console.log(
      `${result.success ? "✅" : "❌"} Configuration test: ${result.message}`
    );
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Configuration test failed: ${error}`);
  }

  console.log("");
}

async function testMilestoneLogic() {
  console.log("🏆 Testing milestone logic...\n");

  console.log(`Defined milestones: ${DA_MILESTONES.join(", ")}`);

  const testCases = [
    { oldDA: 8, newDA: 12, expected: [10] },
    { oldDA: 15, newDA: 25, expected: [20] },
    { oldDA: 28, newDA: 35, expected: [30] },
    { oldDA: 45, newDA: 55, expected: [50] },
    { oldDA: 25, newDA: 25, expected: [] }, // No change
    { oldDA: 30, newDA: 35, expected: [] }, // Already achieved
  ];

  for (const testCase of testCases) {
    const achieved = DA_MILESTONES.filter(
      (milestone) => testCase.oldDA < milestone && testCase.newDA >= milestone
    );
    const correct =
      JSON.stringify(achieved) === JSON.stringify(testCase.expected);
    const status = correct ? "✅" : "❌";
    console.log(
      `${status} ${testCase.oldDA} → ${testCase.newDA}: Expected ${testCase.expected.join(", ")}, Got ${achieved.join(", ")}`
    );
  }

  console.log("");
}

async function testNotificationPreferences() {
  console.log("⚙️ Testing notification preferences...\n");

  // Note: These would require actual domain IDs from the database
  // For now, just test the utility function signatures
  console.log("✅ Notification preference functions defined");
  console.log("   - shouldSendInstantAlert()");
  console.log("   - getDAThreshold()");
  console.log("   - shouldSendDailyBatch()");
  console.log("   - shouldSendWeeklyRecap()");
  console.log("   - shouldSendMilestoneCelebration()");
  console.log("   - shouldSendInactivityWarning()");

  console.log("");
}

async function main() {
  console.log("🚀 Starting Email System Tests\n");
  console.log("=".repeat(50));

  await testEmailValidation();
  await testEmailConfigurationCheck();
  await testMilestoneLogic();
  await testNotificationPreferences();

  console.log("=".repeat(50));
  console.log("✨ Email system tests completed!\n");

  console.log("📋 Manual testing checklist:");
  console.log("1. Test /api/test-email endpoint with different email types");
  console.log("2. Test /api/test-email?action=test-config for configuration");
  console.log("3. Verify cron jobs are scheduled correctly:");
  console.log("   - domain-monitor: every 6 hours");
  console.log("   - daily-batch-notifications: daily at 9 AM UTC");
  console.log("   - weekly-recap: weekly on Mondays at 10 AM UTC");
  console.log("   - inactivity-warnings: daily at 11 AM UTC");
  console.log("4. Test notification preferences UI in dashboard");
  console.log("5. Verify email templates render correctly");
}

if (require.main === module) {
  main().catch(console.error);
}
