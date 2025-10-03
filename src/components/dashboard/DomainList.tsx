"use client";

import { db } from "@/lib/instant-client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DomainList() {
  const { user } = db.useAuth();

  // Query domains for the current user
  const { data, isLoading } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
          deleted_at: null,
        },
      },
    },
  });

  const domains = data?.domains || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Domains</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Domains</h2>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No domains yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first domain to track
          </p>
          <Button className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Domain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Domains</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {domain.url}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {domain.current_da || 0}
                  </span>
                  <span className="text-sm text-gray-500">DR</span>
                </div>
                {domain.da_change !== undefined && domain.da_change !== 0 && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        domain.da_change > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {domain.da_change > 0 ? "↑" : "↓"}
                      {Math.abs(domain.da_change)}
                    </span>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Last updated:{" "}
                  {domain.last_checked
                    ? new Date(domain.last_checked).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
