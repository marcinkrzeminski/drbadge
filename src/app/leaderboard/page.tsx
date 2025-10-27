import { init } from "@instantdb/admin";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

interface LeaderboardEntry {
  url: string;
  current_dr: number;
  growth: number;
  rank: number;
}

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  // Get all domains with their snapshots from the last 30 days, with pagination
  const result = await db.query({
    domains: {
      $: {
        where: {
          deleted_at: { $isNull: true },
        },
        limit: 1000, // Limit the number of domains to prevent performance issues
      },
      dr_snapshots: {
        $: {
          where: {
            recorded_at: { $gte: thirtyDaysAgo },
          },
          limit: 30, // Limit snapshots to 30 days max
        },
      },
    },
  });

  const domains = result.domains || [];

  // Calculate growth for each domain
  const leaderboardData = domains
    .map((domain) => {
      const snapshots = domain.dr_snapshots || [];
      if (snapshots.length < 2) return null;

      // Sort snapshots by date (newest first)
      const sortedSnapshots = snapshots.sort((a, b) => b.recorded_at - a.recorded_at);

      const currentDR = domain.current_da || 0;
      const oldestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
      const growth = currentDR - oldestSnapshot.da_value;

      return {
        url: domain.url,
        current_dr: currentDR,
        growth: growth,
        snapshots_count: snapshots.length,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.growth > 0) // Only show domains with positive growth
    .sort((a, b) => b.growth - a.growth) // Sort by growth descending
    .slice(0, 20) // Top 20
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboardData;
}

export const metadata: Metadata = {
  title: "Domain Rating Leaderboard - Top DR Growth",
  description: "Monitor your DR and increase it to climb the leaderboard! See top websites based on their DR growth within last 30 days.",
  openGraph: {
    title: "Domain Rating Leaderboard",
    description: "Top websites based on their DR growth within last 30 days",
    type: "website",
  },
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return rank.toString();
  }
}

function getRankBadgeColor(rank: number) {
  if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
  if (rank <= 10) return "bg-gradient-to-r from-blue-400 to-blue-600";
  return "bg-gray-100";
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">DR</span>
                </div>
                <span className="text-xl font-bold">DrBadge</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button asChild variant="default">
                <Link href="/">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              Live Leaderboard
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Monitor your DR and increase it to climb the leaderboard!
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Top websites based on their DR growth
            </h2>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated every 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Ranking based on growth within last 30 days</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p>* Ranking is not based on absolute DR but on how it grew within last 30 days.</p>
              <p>** Updated every 2 hours.</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DR
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.map((entry) => (
                    <tr key={entry.url} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${getRankBadgeColor(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              href={`/domain/${encodeURIComponent(entry.url)}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {entry.url}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {entry.current_dr}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +{entry.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Want to track your own domains and enter the leaderboard?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Sign up, it&apos;s free! Start monitoring your domain rating today.
              </p>
              <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
                <Link href="/">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">DR</span>
              </div>
              <span className="text-xl font-bold">DrBadge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DrBadge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}