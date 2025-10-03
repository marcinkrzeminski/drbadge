"use client";

import { db } from "@/lib/instant-client";
import { Plus, MoreVertical, Trash2, RefreshCw, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { BadgeModal } from "@/components/domains/BadgeModal";

export function DomainList() {
  const { user } = db.useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [badgeModalDomain, setBadgeModalDomain] = useState<{
    url: string;
    da: number;
  } | null>(null);

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

  // Query user data to check subscription status
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

  // Filter out deleted domains (where deleted_at exists and is > 0)
  const domains = (data?.domains || []).filter(d => !d.deleted_at || d.deleted_at === 0);

  const handleDelete = async (domainId: string, domainUrl: string) => {
    if (!confirm(`Are you sure you want to remove ${domainUrl}?`)) {
      return;
    }

    setDeletingId(domainId);

    try {
      // Soft delete: set deleted_at timestamp
      await db.transact(
        db.tx.domains[domainId].update({
          deleted_at: Date.now(),
        })
      );

      toast.success("Domain removed successfully");
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Failed to remove domain. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async (domainId: string, domainUrl: string) => {
    if (!isPaidUser) {
      toast.error("Manual refresh is only available for paid users");
      return;
    }

    setRefreshingId(domainId);

    try {
      const response = await fetch("/api/domains/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domainId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(
            `Rate limit exceeded. Reset at ${new Date(data.resetAt).toLocaleTimeString()}`
          );
        } else if (response.status === 403) {
          toast.error("Upgrade to paid plan for manual refresh");
        } else {
          toast.error(data.error || data.details || "Failed to refresh domain");
        }
        return;
      }

      toast.success(
        `${domainUrl} refreshed! DA: ${data.domain.previous_da} → ${data.domain.current_da}`
      );
    } catch (error) {
      console.error("Error refreshing domain:", error);
      toast.error("Failed to refresh domain. Please try again.");
    } finally {
      setRefreshingId(null);
    }
  };

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={deletingId === domain.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setBadgeModalDomain({ url: domain.url, da: domain.current_da || 0 })}
                    className="gap-2"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Get Badge
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRefresh(domain.id, domain.url)}
                    className="gap-2"
                    disabled={refreshingId === domain.id || !isPaidUser}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshingId === domain.id ? 'animate-spin' : ''}`} />
                    Refresh {!isPaidUser && "(Paid only)"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(domain.id, domain.url)}
                    className="gap-2 text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {badgeModalDomain && (
        <BadgeModal
          open={!!badgeModalDomain}
          onOpenChange={(open) => !open && setBadgeModalDomain(null)}
          domain={badgeModalDomain.url}
          drValue={badgeModalDomain.da}
        />
      )}
    </div>
  );
}
