"use client";

import { db } from "@/lib/instant-client";
import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Filter, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaderboardEntry {
  user_id: string;
  rank: number;
  highest_dr: number;
  total_domains: number;
  last_updated: number;
  category?: string;
}

export function Leaderboard() {
  const { user } = db.useAuth();
  const [anonymized, setAnonymized] = useState(false);
  const [category, setCategory] = useState("global");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query user data to check if paid user
  const { data: userData } = db.useQuery({
    users: {
      $: {
        where: {
          auth_id: user?.id,
        },
      },
    },
  });

  const currentUser = userData?.users?.[0];
  const isPaidUser = currentUser?.subscription_status === 'paid';

  // For now, we'll simulate leaderboard data since we don't have real data yet
  // In production, this would query the leaderboard_cache table
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);

      // Simulate API call - replace with real InstantDB query
      setTimeout(() => {
        let mockData: LeaderboardEntry[] = [
          { user_id: "user1", rank: 1, highest_dr: 85, total_domains: 12, last_updated: Date.now(), category: "paid" },
          { user_id: "user2", rank: 2, highest_dr: 78, total_domains: 8, last_updated: Date.now(), category: "paid" },
          { user_id: "user3", rank: 3, highest_dr: 72, total_domains: 15, last_updated: Date.now(), category: "paid" },
          { user_id: "user4", rank: 4, highest_dr: 68, total_domains: 6, last_updated: Date.now(), category: "free" },
          { user_id: "user5", rank: 5, highest_dr: 65, total_domains: 10, last_updated: Date.now(), category: "paid" },
          { user_id: "user6", rank: 6, highest_dr: 58, total_domains: 4, last_updated: Date.now(), category: "free" },
          { user_id: "user7", rank: 7, highest_dr: 52, total_domains: 7, last_updated: Date.now(), category: "paid" },
          { user_id: "user8", rank: 8, highest_dr: 45, total_domains: 3, last_updated: Date.now(), category: "free" },
        ];

        // Filter based on category
        switch (category) {
          case "paid":
            mockData = mockData.filter(entry => entry.category === "paid");
            break;
          case "top-performers":
            mockData = mockData.filter(entry => entry.highest_dr > 50);
            break;
          case "monthly":
          case "weekly":
            // For time-based filters, we'd filter by last_updated timestamp
            // For now, just show all data
            break;
          default: // global
            break;
        }

        // Re-rank after filtering
        mockData = mockData
          .sort((a, b) => b.highest_dr - a.highest_dr)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));

        // Add current user if not in the filtered results
        if (user?.id && !mockData.find(entry => entry.user_id === user.id)) {
          const userRank = mockData.length + 1;
          mockData.push({
            user_id: user.id,
            rank: userRank,
            highest_dr: 45,
            total_domains: currentUser?.domains_limit === 12 ? 5 : 2,
            last_updated: Date.now(),
            category: currentUser?.subscription_status === 'paid' ? 'paid' : 'free'
          });
        }

        setLeaderboardData(mockData);
        setIsLoading(false);
      }, 1000);
    };

    if (isPaidUser) {
      fetchLeaderboard();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, category, isPaidUser, currentUser]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank <= 10) return "bg-gradient-to-r from-blue-400 to-blue-600";
    return "bg-gray-100";
  };

  if (!isPaidUser) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leaderboard</h3>
          <p className="text-sm text-gray-500">
            Upgrade to a paid plan to see competitive rankings and track your progress against other users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Leaderboard</h3>
          <p className="text-sm text-gray-500">See how you rank against other users</p>
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="paid">Paid Users</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="top-performers">Top Performers (DR &gt; 50)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnonymized(!anonymized)}
            className="gap-2"
          >
            {anonymized ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {anonymized ? "Show Names" : "Anonymize"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboardData.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCurrentUser
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getRankBadgeColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <p className={`font-medium ${isCurrentUser ? "text-blue-900" : "text-gray-900"}`}>
                      {anonymized
                        ? `User ${entry.rank}`
                        : isCurrentUser
                          ? "You"
                          : `User ${entry.user_id.slice(-4)}`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.total_domains} domains
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isCurrentUser ? "text-blue-900" : "text-gray-900"}`}>
                    {entry.highest_dr}
                  </p>
                  <p className="text-xs text-gray-500">DR Score</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Rankings update every 24 hours. Higher DR scores and more domains improve your position.
        </p>
      </div>
    </div>
  );
}