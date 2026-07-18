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
      const stamped = { ...patch, touched: Date.now() };
      const merged: Progress = { ...DEFAULT_PROGRESS, ...(prev[id] || {}), ...stamped };
      const next = { ...prev, [id]: merged };
      persist(next, id, stamped);
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
