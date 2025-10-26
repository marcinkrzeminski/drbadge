"use client";

import { db } from "@/lib/instant-client";
import { Trophy, Star, Target, TrendingUp, Award, Crown } from "lucide-react";

interface SidebarAchievementsProps {
  userId: string;
  isPaidUser?: boolean;
}

export function SidebarAchievements({ userId, isPaidUser = false }: SidebarAchievementsProps) {
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

  const domains = (domainsData?.domains || []).filter(d => !d.deleted_at);

  // Calculate all available badges based on user stats
  const calculateBadges = () => {
    const badges = [];
    const totalDomains = domains.length;
    const highestDR = Math.max(...domains.map(d => d.current_da || 0), 0);
    const avgDR = totalDomains > 0 ? domains.reduce((sum, d) => sum + (d.current_da || 0), 0) / totalDomains : 0;

    // Domain count badges
    badges.push({ id: 'first-domain', name: 'First Steps', icon: Star, earned: totalDomains >= 1, description: 'Add your first domain' });
    badges.push({ id: 'domain-collector', name: 'Domain Collector', icon: Target, earned: totalDomains >= 5, description: 'Monitor 5+ domains' });
    badges.push({ id: 'domain-master', name: 'Domain Master', icon: Crown, earned: totalDomains >= 10, description: 'Monitor 10+ domains' });

    // DR achievement badges
    badges.push({ id: 'dr-10', name: 'DR Rookie', icon: Trophy, earned: highestDR >= 10, description: 'Reach DR 10' });
    badges.push({ id: 'dr-25', name: 'DR Veteran', icon: Trophy, earned: highestDR >= 25, description: 'Reach DR 25' });
    badges.push({ id: 'dr-50', name: 'DR Expert', icon: Trophy, earned: highestDR >= 50, description: 'Reach DR 50' });
    badges.push({ id: 'dr-75', name: 'DR Legend', icon: Trophy, earned: highestDR >= 75, description: 'Reach DR 75' });

    // Average DR badges
    badges.push({ id: 'consistent-20', name: 'Consistent Performer', icon: TrendingUp, earned: avgDR >= 20, description: 'Average DR of 20+' });
    badges.push({ id: 'high-achiever', name: 'High Achiever', icon: Award, earned: avgDR >= 40, description: 'Average DR of 40+' });

    // Paid user exclusive badges
    badges.push({ id: 'paid-member', name: 'Premium Member', icon: Crown, earned: isPaidUser, description: 'Active paid subscriber' });

    return badges;
  };

  const allBadges = calculateBadges();

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="px-4 mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Achievements
        </h3>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          {allBadges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="group relative"
                title={`${badge.name}: ${badge.description}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                    : 'bg-gray-200'
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    badge.earned ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                  {badge.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}