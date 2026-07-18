"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

// git add -A && commit (dated) && push, via /api/sync (local/editable builds only).
export function SyncButton({ compact = false }: { compact?: boolean }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");

  async function sync() {
    setSyncing(true);
    setStatus("Syncing…");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const j = await res.json();
      setStatus(j.message || j.error || "done");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className={compact ? "" : "inline-flex items-center gap-2"}>
      <button
        onClick={sync}
        disabled={syncing}
        title="git commit (dated) + push"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> Sync
      </button>
      {status && <span className="mt-1 block text-[11px] text-slate-500">{status}</span>}
    </div>
  );
}
