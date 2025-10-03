"use client";

import { useParams, useRouter } from "next/navigation";
import { init } from "@instantdb/react";
import { DomainChart } from "@/components/charts/DomainChart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
});

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const { data, isLoading } = db.useQuery({
    domains: {
      $: {
        where: {
          id: domainId,
        },
      },
    },
    dr_snapshots: {
      $: {
        where: {
          domain_id: domainId,
        },
      },
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const domain = data?.domains?.[0];
  const snapshots = data?.dr_snapshots || [];

  if (!domain) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Domain not found</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (domain.da_change > 0) {
      return <TrendingUp className="h-6 w-6 text-green-500" />;
    } else if (domain.da_change < 0) {
      return <TrendingDown className="h-6 w-6 text-red-500" />;
    }
    return <Minus className="h-6 w-6 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (domain.da_change > 0) return "text-green-500";
    if (domain.da_change < 0) return "text-red-500";
    return "text-gray-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {domain.url}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated:{" "}
              {format(new Date(domain.last_checked), "PPP 'at' p")}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Current DR
              </p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {domain.current_da}
                </span>
                {getTrendIcon()}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Change
              </p>
              <p className={`text-2xl font-semibold ${getTrendColor()}`}>
                {domain.da_change > 0 ? "+" : ""}
                {domain.da_change}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Previous DR
              </p>
              <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                {domain.previous_da}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Historical Data
        </h2>
        {snapshots.length > 0 ? (
          <DomainChart snapshots={snapshots} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No historical data available yet. Check back after the first
              update.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Snapshots
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {snapshots.length}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Highest DR
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {snapshots.length > 0
                ? Math.max(...snapshots.map((s) => s.da_value))
                : domain.current_da}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lowest DR
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {snapshots.length > 0
                ? Math.min(...snapshots.map((s) => s.da_value))
                : domain.current_da}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
