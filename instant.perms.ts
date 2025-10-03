// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  // Users can read their own auth data
  $users: {
    allow: {
      view: "auth.id == data.id",
    },
  },
  // Users can read/update their own user record
  users: {
    allow: {
      view: "auth.id == data.auth_id",
      create: "auth.id == data.auth_id",
      update: "auth.id == data.auth_id",
    },
  },
  // Users can only access their own domains
  domains: {
    allow: {
      view: "auth.id == data.user_id",
      create: "auth.id == data.user_id",
      update: "auth.id == data.user_id",
      delete: "auth.id == data.user_id",
    },
  },
  // Users can only view snapshots for their own domains
  dr_snapshots: {
    allow: {
      view: "auth.id in data.ref('domain_id.user_id')",
    },
  },
  // API usage is view-only for users
  api_usage: {
    allow: {
      view: "false", // Only admin can view
    },
  },
} satisfies InstantRules;

export default rules;
