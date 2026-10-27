"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLiveNotes } from "@/components/notebook/liveClient";

const SETTLE_MS = 250; // an LLM often rewrites several files back to back; refresh once

/**
 * Re-runs the notebook's server components whenever a note changes on disk, so the page
 * shows the new content without a reload. router.refresh() keeps client state (scroll,
 * sidebar, open diagram viewer); NotebookContent then patches only the blocks that changed.
 */
export function LiveNotes() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const stale = useRef(false); // an edit landed while a refresh was running or the tab was hidden

  const schedule = useCallback(() => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = undefined;
      if (document.hidden || pendingRef.current) {
        stale.current = true;
        return;
      }
      startTransition(() => router.refresh());
    }, SETTLE_MS);
  }, [router]);

  useLiveNotes(schedule);

  useEffect(() => {
    pendingRef.current = pending;
    if (!pending && stale.current && !document.hidden) {
      stale.current = false;
      schedule();
    }
  }, [pending, schedule]);

  useEffect(() => {
    const onVisible = () => {
      if (document.hidden || !stale.current) return;
      stale.current = false;
      schedule();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(timer.current);
    };
  }, [schedule]);

  return null;
}