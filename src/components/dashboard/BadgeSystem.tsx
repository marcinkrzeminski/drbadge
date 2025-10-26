"use client";

import { db } from "@/lib/instant-client";
import { Trophy, Star, Target, TrendingUp, Award, Crown } from "lucide-react";

interface BadgeSystemProps {
  userId: string;
  isPaidUser?: boolean;
}

export function BadgeSystem({ userId, isPaidUser = false }: BadgeSystemProps) {
  // Query user achievements
  const { data: achievementsData } = db.useQuery({
    achievements: {
      $: {
        where: {
          user_id: userId,
        },
      },
    },
  });

  // Query user stats for badge calculations
  const { data: domainsData } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: userId,
        },
      },
    },
  });

  const achievements = achievementsData?.achievements || [];
  const domains = (domainsData?.domains || []).filter(d => !d.deleted_at);

  // Calculate available badges based on user stats
  const calculateBadges = () => {
    const badges = [];
    const totalDomains = domains.length;
    const highestDR = Math.max(...domains.map(d => d.current_da || 0), 0);
    const avgDR = totalDomains > 0 ? domains.reduce((sum, d) => sum + (d.current_da || 0), 0) / totalDomains : 0;

    // Domain count badges
    if (totalDomains >= 1) badges.push({ id: 'first-domain', name: 'First Steps', icon: Star, earned: true, description: 'Added your first domain' });
    if (totalDomains >= 5) badges.push({ id: 'domain-collector', name: 'Domain Collector', icon: Target, earned: true, description: 'Monitoring 5+ domains' });
    if (totalDomains >= 10) badges.push({ id: 'domain-master', name: 'Domain Master', icon: Crown, earned: true, description: 'Monitoring 10+ domains' });

    // DR achievement badges
    if (highestDR >= 10) badges.push({ id: 'dr-10', name: 'DR Rookie', icon: Trophy, earned: true, description: 'Reached DR 10' });
    if (highestDR >= 25) badges.push({ id: 'dr-25', name: 'DR Veteran', icon: Trophy, earned: true, description: 'Reached DR 25' });
    if (highestDR >= 50) badges.push({ id: 'dr-50', name: 'DR Expert', icon: Trophy, earned: true, description: 'Reached DR 50' });
    if (highestDR >= 75) badges.push({ id: 'dr-75', name: 'DR Legend', icon: Trophy, earned: true, description: 'Reached DR 75' });

    // Average DR badges
    if (avgDR >= 20) badges.push({ id: 'consistent-20', name: 'Consistent Performer', icon: TrendingUp, earned: true, description: 'Average DR of 20+' });
    if (avgDR >= 40) badges.push({ id: 'high-achiever', name: 'High Achiever', icon: Award, earned: true, description: 'Average DR of 40+' });

    // Paid user exclusive badges
    if (isPaidUser) {
      badges.push({ id: 'paid-member', name: 'Premium Member', icon: Crown, earned: true, description: 'Active paid subscriber' });

      // Check for goals and milestones usage
      // These would be calculated based on actual usage of gamification features
      badges.push({ id: 'goal-setter', name: 'Goal Setter', icon: Target, earned: false, description: 'Set your first DR goal' });
      badges.push({ id: 'milestone-master', name: 'Milestone Master', icon: Trophy, earned: false, description: 'Created custom milestones' });
    }

    return badges;
  };

  const availableBadges = calculateBadges();
  const earnedBadges = availableBadges.filter(badge => badge.earned);
  const totalBadges = availableBadges.length;
  const earnedCount = earnedBadges.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Achievement Badges</h3>
          <p className="text-sm text-gray-500">
            {earnedCount} of {totalBadges} badges earned
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{earnedCount}</div>
          <div className="text-xs text-gray-500">Earned</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableBadges.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center ${
                badge.earned
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                badge.earned ? "bg-yellow-100" : "bg-gray-100"
              }`}>
                <IconComponent className={`h-6 w-6 ${
                  badge.earned ? "text-yellow-600" : "text-gray-400"
                }`} />
              </div>
              <h4 className={`text-sm font-medium ${
                badge.earned ? "text-gray-900" : "text-gray-500"
              }`}>
                {badge.name}
              </h4>
              <p className={`text-xs mt-1 ${
                badge.earned ? "text-gray-600" : "text-gray-400"
              }`}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>

      {earnedCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No badges earned yet</p>
          <p className="text-xs">Start monitoring domains to earn your first badges!</p>
        </div>
      )}
    </div>
  );
}