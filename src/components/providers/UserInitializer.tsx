"use client";

import { useEffect } from "react";
import { db, id } from "@/lib/instant-client";

export function UserInitializer() {
  const { user, isLoading } = db.useAuth();

  useEffect(() => {
    const initializeUser = async () => {
      if (!user || isLoading) return;

      // Check if user exists in our users table
      const { data } = await db.queryOnce({
        users: {
          $: {
            where: {
              auth_id: user.id,
            },
          },
        },
      });

      // If user doesn't exist, create them
      if (!data?.users || data.users.length === 0) {
        console.log("Creating new user record for:", user.email);

        await db.transact(
          db.tx.users[id()].update({
            auth_id: user.id,
            email: user.email || "",
            subscription_status: "free",
            domains_limit: 3,
            created_at: Date.now(),
          })
        );
      }
    };

    initializeUser();
  }, [user, isLoading]);

  return null;
}
