import { db } from "./instant-server";
import { id } from "@instantdb/core";

/**
 * Initialize user with default subscription data
 * Called on first login via InstantDB
 */
export async function initializeUser(authId: string, email: string) {
  try {
    // Check if user already exists
    const { users } = await db.query({ users: { $: { where: { auth_id: authId } } } });

    if (users && users.length > 0) {
      console.log("User already initialized:", users[0]);
      return users[0];
    }

    // Create new user with default free plan data
    const userId = id();
    const txResult = await db.transact(
      db.tx.users[userId].update({
        auth_id: authId,
        email,
        subscription_status: "free",
        domains_limit: 3,
        created_at: Date.now(),
      })
    );

    console.log("User initialized:", { userId, authId, email, txResult });

    return {
      id: userId,
      auth_id: authId,
      email,
      subscription_status: "free",
      domains_limit: 3,
      created_at: Date.now(),
    };
  } catch (error) {
    console.error("Failed to initialize user:", error);
    throw error;
  }
}
