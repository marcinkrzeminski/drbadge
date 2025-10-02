"use client";

import { init } from "@instantdb/react";

const APP_ID = "00786ac8-3707-4954-ac0d-70effb85707a";

// Initialize InstantDB
const db = init({ appId: APP_ID });

export { db };
