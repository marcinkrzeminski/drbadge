import { init, tx, id } from "@instantdb/admin";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN!;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("Missing required environment variables!");
  console.error("NEXT_PUBLIC_INSTANTDB_APP_ID:", !!APP_ID);
  console.error("INSTANTDB_ADMIN_TOKEN:", !!ADMIN_TOKEN);
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Generate random DA value with trend
function generateDAValue(baseValue: number, dayOffset: number, trend: "up" | "down" | "stable"): number {
  const randomVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2

  let trendValue = 0;
  if (trend === "up") {
    trendValue = Math.floor(dayOffset / 7); // Increase by 1 every 7 days
  } else if (trend === "down") {
    trendValue = -Math.floor(dayOffset / 7); // Decrease by 1 every 7 days
  }

  return Math.max(0, Math.min(100, baseValue + trendValue + randomVariation));
}

async function generateHistoricalData() {
  console.log("🔍 Fetching domains...");

  // Query all domains
  const { domains } = await db.query({ domains: {} });

  if (!domains || domains.length === 0) {
    console.log("❌ No domains found. Add some domains first!");
    return;
  }

  console.log(`✅ Found ${domains.length} domain(s)`);

  for (const domain of domains) {
    console.log(`\n📊 Generating data for: ${domain.url}`);

    // Determine trend randomly
    const trends: ("up" | "down" | "stable")[] = ["up", "down", "stable"];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    console.log(`   Trend: ${trend}`);

    const snapshots = [];
    const now = Date.now();
    const currentDA = domain.current_da || 50;

    // Generate 90 days of historical data (one snapshot every 3 days)
    for (let i = 90; i >= 0; i -= 3) {
      const daysAgo = i;
      const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000);
      const daValue = generateDAValue(currentDA, 90 - daysAgo, trend);

      snapshots.push(
        tx.dr_snapshots[id()].update({
          domain_id: domain.id,
          da_value: daValue,
          recorded_at: timestamp,
          created_at: timestamp,
        })
      );
    }

    console.log(`   Creating ${snapshots.length} snapshots...`);

    // Batch insert all snapshots
    try {
      await db.transact(snapshots);
      console.log(`   ✅ Created ${snapshots.length} snapshots`);
    } catch (error) {
      console.error(`   ❌ Error creating snapshots:`, error);
    }
  }

  console.log("\n🎉 Historical data generation complete!");
}

generateHistoricalData()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
