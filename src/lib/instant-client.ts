"use client";

import { init, id } from "@instantdb/react";

const APP_ID = "00786ac8-3707-4954-ac0d-70effb85707a";

// Initialize InstantDB (schema-less mode for now)
// Schema will be added later via instant-cli push
const db = init({ appId: APP_ID });

// Export useAuth hook for easy access
export const useAuth = () => db.useAuth();

// Export auth methods
export const auth = {
  signOut: () => db.auth.signOut(),
  createAuthorizationURL: (params: { clientName: string; redirectURL: string }) =>
    db.auth.createAuthorizationURL(params),
};

export { db, id };
