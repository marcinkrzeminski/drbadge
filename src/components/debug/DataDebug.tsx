"use client";

import { db } from "@/lib/instant-client";

export function DataDebug() {
  const { user } = db.useAuth();

  const { data: domainsData } = db.useQuery({
    domains: {},
  });

  const { data: usersData } = db.useQuery({
    users: {},
  });

  console.log("=== DEBUG INFO ===");
  console.log("Current user from auth:", user);
  console.log("All domains:", domainsData?.domains);
  console.log("All users:", usersData?.users);
  console.log("==================");

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-auto">
      <div className="font-bold mb-2">Debug Info:</div>
      <div className="space-y-2">
        <div>
          <div className="text-yellow-300">Auth user.id:</div>
          <div className="font-mono">{user?.id || "Not logged in"}</div>
        </div>
        <div>
          <div className="text-yellow-300">Domains count:</div>
          <div>{domainsData?.domains?.length || 0}</div>
        </div>
        <div>
          <div className="text-yellow-300">Users count:</div>
          <div>{usersData?.users?.length || 0}</div>
        </div>
        <div>
          <div className="text-yellow-300">Sample domain:</div>
          <pre className="text-[10px] overflow-auto">
            {JSON.stringify(domainsData?.domains?.[0], null, 2)}
          </pre>
        </div>
        <div>
          <div className="text-yellow-300">Sample user:</div>
          <pre className="text-[10px] overflow-auto">
            {JSON.stringify(usersData?.users?.[0], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
