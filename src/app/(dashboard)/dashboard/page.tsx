"use client";

import { db } from "@/lib/instant-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DomainList } from "@/components/dashboard/DomainList";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AddDomainModal } from "@/components/domains/AddDomainModal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading, user } = db.useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkRefreshing, setBulkRefreshing] = useState(false);

  // Query user data to get database user ID
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  const handleBulkRefresh = async () => {
    if (!currentUser || !user) return;

    if (!isPaidUser) {
      toast.error("Bulk refresh is only available for paid users");
      return;
    }

    setBulkRefreshing(true);

    try {
      // Use auth_id (user.id from auth), not database user id
      const response = await fetch("/api/domains/bulk-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // auth_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(
            `Rate limit exceeded. ${data.remaining} refreshes remaining. Reset at ${new Date(data.resetAt).toLocaleTimeString()}`
          );
        } else if (response.status === 403) {
          toast.error("Bulk refresh is only available for paid users");
        } else {
          toast.error(data.error || "Failed to bulk refresh domains");
        }
        return;
      }

      toast.success(`Bulk refresh completed! ${data.summary.successful} domains updated, ${data.summary.failed} failed`);
    } catch (error) {
      console.error("Bulk refresh error:", error);
      toast.error("Failed to bulk refresh domains");
    } finally {
      setBulkRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="space-y-8 lg:pt-0 pt-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and monitor your domain authority
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleBulkRefresh}
              disabled={bulkRefreshing || !isPaidUser}
              title={!isPaidUser ? "Bulk refresh is only available for paid users" : undefined}
            >
              <RefreshCw className={`h-4 w-4 ${bulkRefreshing ? 'animate-spin' : ''}`} />
              {bulkRefreshing ? 'Refreshing...' : 'Refresh All'}
            </Button>
            <Button className="gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          </div>
        </div>

        <StatsCards />
        <DomainList />
      </div>

      <AddDomainModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}
