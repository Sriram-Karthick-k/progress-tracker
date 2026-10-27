"use client";

import { LocateFixed } from "lucide-react";
import { setFollowing, useFollowing, useLiveStatus } from "@/components/notebook/liveClient";

const LABEL = { off: "", connecting: "Connecting…", live: "Live", offline: "Reconnecting…" } as const;

/** Connection indicator + "follow edits" toggle for the note being viewed. Hidden on read-only builds. */
export function LivePill({ board = false }: { board?: boolean }) {
  const status = useLiveStatus();
  const follow = useFollowing(board);
  if (status === "off") return null;

  const dot = status === "live" ? "bg-emerald-400" : status === "offline" ? "bg-amber-400" : "bg-slate-500";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span
        title={status === "live" ? "Edits made on disk (by you or an AI) appear here automatically" : "Live updates paused — retrying"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"
      >
        <span className={`h-2 w-2 rounded-full ${dot} ${status === "live" ? "animate-pulse" : ""}`} />
        {LABEL[status]}
      </span>
      <button
        type="button"
        onClick={() => setFollowing(board, !follow)}
        aria-pressed={follow}
        title={follow ? "Following edits — click to stop scrolling to them" : "Scroll to each edit as it happens"}
        className={`inline-flex h-[30px] items-center gap-1.5 rounded-lg border px-2.5 text-xs transition ${
          follow ? "border-indigo-400/50 bg-indigo-500/15 text-white" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
        }`}
      >
        <LocateFixed size={13} /> <span className="hidden sm:inline">Follow</span>
      </button>
    </div>
  );
}