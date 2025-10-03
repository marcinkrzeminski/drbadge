"use client";

import { db } from "@/lib/instant-client";
import { Globe, TrendingUp } from "lucide-react";

export function StatsCards() {
  const { user } = db.useAuth();

  // Query domains for the current user
  const { data, isLoading } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
        },
      },
    },
  });

  // Filter out deleted domains
  const domains = (data?.domains || []).filter(d => !d.deleted_at || d.deleted_at === 0);
  const totalDomains = domains.length;

  // Calculate average DR
  const avgDR = totalDomains > 0
    ? Math.round(
        domains.reduce((sum, d) => sum + (d.current_da || 0), 0) / totalDomains
      )
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Domains</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-9 w-16 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                totalDomains
              )}
            </p>
          </div>
          <div className="rounded-full bg-blue-50 p-3">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Average DR</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-9 w-16 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                avgDR
              )}
            </p>
          </div>
          <div className="rounded-full bg-green-50 p-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
