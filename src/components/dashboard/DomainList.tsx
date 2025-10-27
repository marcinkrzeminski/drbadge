"use client";

import posthog from 'posthog-js';
import { db } from "@/lib/instant-client";
import { PLANS } from "@/lib/plans";
import { Plus, MoreVertical, Trash2, RefreshCw, BadgeCheck, ExternalLink, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { BadgeModal } from "@/components/domains/BadgeModal";
import { Sparkline } from "@/components/charts/Sparkline";
import { MilestoneSettings } from "@/components/dashboard/MilestoneSettings";
import { GoalSetting } from "@/components/dashboard/GoalSetting";
import Link from "next/link";

type ViewMode = "grid" | "table";
type SortField = "name" | "dr" | "change";
type SortDirection = "asc" | "desc";

export function DomainList() {
  const { user } = db.useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [badgeModalDomain, setBadgeModalDomain] = useState<{
    url: string;
    da: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("domainViewMode") as ViewMode;
    const savedSortField = localStorage.getItem("domainSortField") as SortField;
    const savedSortDirection = localStorage.getItem("domainSortDirection") as SortDirection;

    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
    if (savedSortField) {
      setSortField(savedSortField);
    }
    if (savedSortDirection) {
      setSortDirection(savedSortDirection);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    posthog.capture('domain_view_mode_changed', { view_mode: mode });
    setViewMode(mode);
    localStorage.setItem("domainViewMode", mode);
  };

  // Handle sort change
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    localStorage.setItem("domainSortField", field);
    localStorage.setItem("domainSortDirection", direction);
  };

  // Query domains for the current user
  const { data, isLoading } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
        },
      },
    },
    dr_snapshots: {},
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

  const currentUser = userData?.users?.[0] || null;
  const isPaidUser = currentUser?.subscription_status === 'paid';

  // Filter out deleted domains (where deleted_at exists and is > 0)
  const filteredDomains = (data?.domains || []).filter(d => !d.deleted_at || d.deleted_at === 0);

  // Sort domains based on selected field and direction
  const domains = useMemo(() => {
    const sorted = [...filteredDomains];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "name":
          compareValue = a.url.localeCompare(b.url);
          break;
        case "dr":
          compareValue = (a.current_da || 0) - (b.current_da || 0);
          break;
        case "change":
          compareValue = (a.da_change || 0) - (b.da_change || 0);
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [filteredDomains, sortField, sortDirection]);

  const handleDelete = async (domainId: string, domainUrl: string) => {
    if (!confirm(`Are you sure you want to remove ${domainUrl}?`)) {
      return;
    }

    posthog.capture('domain_deleted', { domain_id: domainId, domain_url: domainUrl });
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
    if (!user?.id) {
      toast.error("You must be logged in to refresh domains");
      return;
    }

    if (!currentUser) {
      toast.error("User data not loaded yet. Please wait and try again.");
      return;
    }

    if (!isPaidUser) {
      toast.error("Manual refresh is only available for paid users");
      return;
    }

    setRefreshingId(domainId);

    const payload = {
      domainId,
      userId: currentUser.id,
    };
    
    console.log('[Frontend] Refresh request:', payload);

    try {
      const response = await fetch("/api/domains/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Domains</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleSortChange("name", "asc")}
                className={sortField === "name" && sortDirection === "asc" ? "bg-gray-100" : ""}
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("name", "desc")}
                className={sortField === "name" && sortDirection === "desc" ? "bg-gray-100" : ""}
              >
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("dr", "desc")}
                className={sortField === "dr" && sortDirection === "desc" ? "bg-gray-100" : ""}
              >
                DR (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("dr", "asc")}
                className={sortField === "dr" && sortDirection === "asc" ? "bg-gray-100" : ""}
              >
                DR (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("change", "desc")}
                className={sortField === "change" && sortDirection === "desc" ? "bg-gray-100" : ""}
              >
                Change (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("change", "asc")}
                className={sortField === "change" && sortDirection === "asc" ? "bg-gray-100" : ""}
              >
                Change (Low to High)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewModeChange("grid")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewModeChange("table")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {domains.map((domain) => {
          // Get snapshots for this domain
          const domainSnapshots = (data?.dr_snapshots || []).filter(
            (s: any) => s.domain_id === domain.id
          );

          return (
            <Link
              key={domain.id}
              href={`/dashboard/domain/${domain.id}`}
              className="group"
            >
              <div className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {domain.url}
                      </h3>
                      <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                          {Math.abs(domain.da_change).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="mt-3">
                      <Sparkline snapshots={domainSnapshots} />
                    </div>
                     <p className="mt-2 text-xs text-gray-500">
                       Last updated:{" "}
                       {domain.last_checked
                         ? new Date(domain.last_checked).toLocaleDateString()
                         : "Never"}
                     </p>
                     <p className="mt-1 text-xs text-gray-500">
                       {isPaidUser ? PLANS.PAID.refreshFrequency : PLANS.FREE.refreshFrequency}
                     </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBadgeModalDomain({ url: domain.url, da: domain.current_da || 0 });
                        }}
                        className="gap-2"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        Get Badge
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handleRefresh(domain.id, domain.url);
                        }}
                        className="gap-2"
                        disabled={refreshingId === domain.id || !isPaidUser}
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingId === domain.id ? 'animate-spin' : ''}`} />
                        Refresh {!isPaidUser && "(Paid only)"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(domain.id, domain.url);
                        }}
                        className="gap-2 text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DR
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refresh Frequency
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.map((domain) => {
                const domainSnapshots = (data?.dr_snapshots || []).filter(
                  (s: any) => s.domain_id === domain.id
                );

                return (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link
                        href={`/dashboard/domain/${domain.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {domain.url}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xl font-bold text-gray-900">
                        {domain.current_da || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {domain.da_change !== undefined && domain.da_change !== 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            domain.da_change > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {domain.da_change > 0 ? "↑" : "↓"}
                          {Math.abs(domain.da_change).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-32">
                        <Sparkline snapshots={domainSnapshots} />
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {domain.last_checked
                        ? new Date(domain.last_checked).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {isPaidUser ? PLANS.PAID.refreshFrequency : PLANS.FREE.refreshFrequency}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
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
                             onClick={() =>
                               setBadgeModalDomain({
                                 url: domain.url,
                                 da: domain.current_da || 0,
                               })
                             }
                             className="gap-2"
                           >
                             <BadgeCheck className="h-4 w-4" />
                             Get Badge
                           </DropdownMenuItem>
                           {isPaidUser && (
                             <>
                               <div className="px-2 py-1">
                                 <MilestoneSettings
                                   domainId={domain.id}
                                   domainUrl={domain.url}
                                   currentDR={domain.current_da || 0}
                                 />
                               </div>
                               <div className="px-2 py-1">
                                 <GoalSetting
                                   domainId={domain.id}
                                   domainUrl={domain.url}
                                   currentDR={domain.current_da || 0}
                                 />
                               </div>
                             </>
                           )}
                          <DropdownMenuItem
                            onClick={() => handleRefresh(domain.id, domain.url)}
                            className="gap-2"
                            disabled={refreshingId === domain.id || !isPaidUser}
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                refreshingId === domain.id ? "animate-spin" : ""
                              }`}
                            />
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
