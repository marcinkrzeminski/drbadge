import { init } from "@instantdb/admin";

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN!;

if (!APP_ID) {
  throw new Error("NEXT_PUBLIC_INSTANTDB_APP_ID is not set");
}

if (!ADMIN_TOKEN) {
  throw new Error("INSTANTDB_ADMIN_TOKEN is not set");
}

// Initialize InstantDB admin for server-side operations
// Schema-less mode - attributes will be created dynamically
const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

export { db };
