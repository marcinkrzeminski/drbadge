"use client";

import { db } from "@/lib/instant-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DomainList } from "@/components/dashboard/DomainList";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AddDomainModal } from "@/components/domains/AddDomainModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading, user } = db.useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

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
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        </div>

        <StatsCards />
        <DomainList />
      </div>

      <AddDomainModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}
