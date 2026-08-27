"use client";

import { useEffect } from "react";
import { NOTES_EDITABLE } from "./editable";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RECHECK_MS = 45 * 60 * 1000; // re-check periodically in case the app is left open

// Guards against running twice on the same load (React StrictMode double-effect
// in dev, or a remount) — a module-level flag survives across that, unlike a ref.
let ranThisLoad = false;

async function checkAndSync() {
  try {
    const statusRes = await fetch("/api/sync", { cache: "no-store" });
    const status = await statusRes.json();
    if (status.disabled) return;

    const stale = status.lastSyncTs == null || Date.now() - status.lastSyncTs > ONE_DAY_MS;
    if (!stale || !status.dirty) return; // synced recently, or nothing new to sync

    const res = await fetch("/api/sync", { method: "POST" });
    const result = await res.json();
    // let the sidebar's "last synced" caption refresh, same event the manual button uses
    window.dispatchEvent(new CustomEvent("prep-sync", { detail: { message: result.message, auto: true } }));
  } catch {
    /* best effort — offline/no remote is expected sometimes; next check retries */
  }
}

/**
 * Silently commits + pushes (via /api/sync) once you've gone more than a day
 * without syncing, so you're never stuck relying on remembering to click the
 * Sync button. Checks once per app load, then every ~45min for sessions left
 * open a long time. No-ops entirely on read-only/public builds.
 */
export function AutoSync() {
  useEffect(() => {
    if (!NOTES_EDITABLE) return;
    if (!ranThisLoad) {
      ranThisLoad = true;
      checkAndSync();
    }
    const id = setInterval(checkAndSync, RECHECK_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
