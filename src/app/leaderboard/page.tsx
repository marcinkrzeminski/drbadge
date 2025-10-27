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

  // Get all domains with their snapshots from the last 30 days
  // Note: InstantDB doesn't support limit/where on nested queries, so we fetch and filter in memory
  const result = await db.query({
    domains: {
      $: {
        where: {
          deleted_at: { $isNull: true },
        },
        limit: 1000, // Limit the number of domains to prevent performance issues
      },
      dr_snapshots: {},
    },
  });

  const domains = result.domains || [];

  // Filter snapshots to last 30 days in memory
  const domainsWithFilteredSnapshots = domains.map(domain => ({
    ...domain,
    dr_snapshots: (domain.dr_snapshots || []).filter(
      snapshot => snapshot.recorded_at >= thirtyDaysAgo
    ),
  }));

  // Calculate growth for each domain
  const leaderboardData = domainsWithFilteredSnapshots
    .map((domain) => {
      const snapshots = domain.dr_snapshots || [];

      // Need at least one snapshot to calculate growth
      if (snapshots.length === 0) return null;

      // Sort snapshots by date (oldest first for proper calculation)
      const sortedSnapshots = snapshots.sort((a, b) => a.recorded_at - b.recorded_at);

      const currentDR = domain.current_da || 0;
      const oldestSnapshot = sortedSnapshots[0];
      const growth = currentDR - oldestSnapshot.da_value;

      return {
        url: domain.url,
        current_dr: currentDR,
        growth: growth,
        snapshots_count: snapshots.length,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null) // Remove null entries
    .sort((a, b) => b.growth - a.growth) // Sort by growth descending (positive to negative)
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
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {leaderboardData.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No leaderboard data yet
                </h3>
                <p className="text-gray-500">
                  Be the first to track your domain and appear on the leaderboard!
                </p>
              </div>
            ) : (
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          entry.growth > 0
                            ? 'bg-green-100 text-green-800'
                            : entry.growth < 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {entry.growth > 0 ? '+' : ''}{entry.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Leaderboard Metadata */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated every 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Ranking based on growth within last 30 days</span>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>* Ranking is not based on absolute DR but on how it grew within last 30 days.</p>
              <p>** Updated every 2 hours.</p>
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