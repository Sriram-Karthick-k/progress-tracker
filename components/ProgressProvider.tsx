"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Progress,
  ProgressMap,
  DEFAULT_PROGRESS,
  loadAll,
  persist,
  recordActivity,
  recordEvent,
  type ActivityEvent,
} from "@/lib/progress";

type Ctx = {
  ready: boolean;
  map: ProgressMap;
  get: (id: string) => Progress;
  update: (id: string, patch: Partial<Progress>) => void;
  replaceAll: (map: ProgressMap) => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);
  const mapRef = useRef<ProgressMap>({});
  mapRef.current = map;

  // Load once on mount (client only) — avoids hydration mismatch (server renders empty).
  useEffect(() => {
    let alive = true;
    loadAll().then((m) => {
      if (!alive) return;
      setMap(m);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const get = useCallback(
    (id: string): Progress => ({ ...DEFAULT_PROGRESS, ...(mapRef.current[id] || {}) }),
    []
  );

  const update = useCallback((id: string, patch: Partial<Progress>) => {
    setMap((prev) => {
      const before: Progress = { ...DEFAULT_PROGRESS, ...(prev[id] || {}) };
      const stamped = { ...patch, touched: Date.now() };
      const merged: Progress = { ...before, ...stamped };
      const next = { ...prev, [id]: merged };
      persist(next, id, stamped);

      // Activity Log: record only real changes to the fields that matter —
      // status/confidence/revisit. (notes/attempts/touched are noise here.)
      const changes: ActivityEvent["changes"] = {};
      if (patch.status !== undefined && patch.status !== before.status) {
        changes.status = { from: before.status, to: patch.status };
      }
      if (patch.confidence !== undefined && patch.confidence !== before.confidence) {
        changes.confidence = { from: before.confidence, to: patch.confidence };
      }
      if (patch.revisit !== undefined && patch.revisit !== before.revisit) {
        changes.revisit = { from: before.revisit, to: patch.revisit };
      }
      if (Object.keys(changes).length) recordEvent(id, changes);

      return next;
    });
    recordActivity();
  }, []);

  const replaceAll = useCallback((incoming: ProgressMap) => {
    setMap(() => {
      persist(incoming, "*", {}); // mirror to storage
      return incoming;
    });
  }, []);

  return (
    <ProgressContext.Provider value={{ ready, map, get, update, replaceAll }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within <ProgressProvider>");
  return ctx;
}
