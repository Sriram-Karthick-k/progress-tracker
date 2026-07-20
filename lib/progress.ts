import { Status } from "./status";
import { TOPICS, PROBLEMS } from "./seed-data";

export type Progress = {
  status: Status;
  confidence: number;
  revisit: boolean;
  notes: string;
  attempts: number;
  /** Epoch ms of the last update — drives spaced repetition. */
  touched?: number;
};

export type ProgressMap = Record<string, Partial<Progress>>;
export type ActivityMap = Record<string, number>; // "YYYY-MM-DD" -> update count
export type StoredCustomCard = { id: string; front: string; back: string };

type Store = {
  progress: ProgressMap;
  activity: ActivityMap;
  goal: number | null;
  customCards: StoredCustomCard[];
};

export const DEFAULT_PROGRESS: Progress = {
  status: "TODO",
  confidence: 0,
  revisit: false,
  notes: "",
  attempts: 0,
};

// ---------------------------------------------------------------------------
// Storage: the FILESYSTEM, not localStorage. Everything lives in
// content/progress.json (written via /api/progress, exactly like notes are
// written via /api/notes) so it is versioned in git and synced across
// machines by the Sync button. This module keeps one in-memory copy, hydrated
// once per page load, and debounce-saves the whole store after every change.
// ---------------------------------------------------------------------------

const EMPTY: Store = { progress: {}, activity: {}, goal: null, customCards: [] };

let store: Store = { ...EMPTY };
let hydrating: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;

function serialize(): string {
  return JSON.stringify(store);
}

async function saveNow(): Promise<void> {
  dirty = false;
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialize(),
    });
  } catch {
    dirty = true; // keep it marked; the unload beacon is the safety net
  }
}

function scheduleSave() {
  dirty = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void saveNow(), 600);
}

/** Flush pending changes when the tab is hidden/closed (beacon survives unload). */
function flushOnHide() {
  if (!dirty) return;
  if (saveTimer) clearTimeout(saveTimer);
  dirty = false;
  try {
    navigator.sendBeacon("/api/progress", new Blob([serialize()], { type: "application/json" }));
  } catch {
    /* best effort */
  }
}

/* ---- one-time migration of pre-fs localStorage data ---- */

const LEGACY_KEYS = {
  progress: "interviewPrepProgress.v1",
  activity: "interviewPrepActivity.v1",
  goal: "dailyGoal.v1",
  cards: "flashcards.custom.v1",
};

function readLegacy(): Partial<Store> | null {
  try {
    const progress = JSON.parse(localStorage.getItem(LEGACY_KEYS.progress) || "null");
    const activity = JSON.parse(localStorage.getItem(LEGACY_KEYS.activity) || "null");
    const goalRaw = Number(localStorage.getItem(LEGACY_KEYS.goal));
    const customCards = JSON.parse(localStorage.getItem(LEGACY_KEYS.cards) || "null");
    if (!progress && !activity && !goalRaw && !customCards) return null;
    return {
      progress: progress ?? {},
      activity: activity ?? {},
      goal: goalRaw > 0 ? goalRaw : null,
      customCards: Array.isArray(customCards) ? customCards : [],
    };
  } catch {
    return null;
  }
}

/** Merge legacy localStorage into the server store without losing either side. */
function mergeLegacy(server: Store, legacy: Partial<Store>): Store {
  const progress: ProgressMap = { ...server.progress };
  for (const [id, entry] of Object.entries(legacy.progress ?? {})) {
    const existing = progress[id];
    // per-item: newer `touched` wins; untouched server entries lose to legacy data
    if (!existing || (entry.touched ?? 0) > (existing.touched ?? 0)) progress[id] = entry;
  }
  const activity: ActivityMap = { ...server.activity };
  for (const [day, n] of Object.entries(legacy.activity ?? {})) {
    activity[day] = Math.max(activity[day] ?? 0, n);
  }
  const ids = new Set(server.customCards.map((c) => c.id));
  const customCards = [
    ...server.customCards,
    ...(legacy.customCards ?? []).filter((c) => !ids.has(c.id)),
  ];
  return { progress, activity, goal: server.goal ?? legacy.goal ?? null, customCards };
}

function clearLegacy() {
  Object.values(LEGACY_KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

/* ---- hydration ---- */

async function hydrate(): Promise<void> {
  if (typeof window === "undefined") return;
  if (hydrating) return hydrating;
  hydrating = (async () => {
    let server: Store = { ...EMPTY };
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (res.ok) server = { ...EMPTY, ...(await res.json()) };
    } catch {
      /* API unreachable — session-only until it comes back */
    }
    const legacy = readLegacy();
    if (legacy) {
      store = mergeLegacy(server, legacy);
      clearLegacy();
      scheduleSave(); // persist the migrated data to the file immediately
    } else {
      store = server;
    }
    window.addEventListener("pagehide", flushOnHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushOnHide();
    });
    // wake anything that mounted before hydration finished
    window.dispatchEvent(new Event("prep-activity"));
    window.dispatchEvent(new Event("prep-flashcards"));
  })();
  return hydrating;
}

/** Load the whole progress map (hydrates the file-backed store on first call). */
export async function loadAll(): Promise<ProgressMap> {
  await hydrate();
  return store.progress;
}

/** Persist a change — updates the in-memory store and debounce-saves the file. */
export function persist(map: ProgressMap, _id: string, _patch: Partial<Progress>) {
  store.progress = map;
  scheduleSave();
}

/* ---- activity log (heatmap + streak) ---- */

export function loadActivity(): ActivityMap {
  return store.activity;
}

export function recordActivity() {
  if (typeof window === "undefined") return;
  const key = new Date().toISOString().slice(0, 10);
  store.activity = { ...store.activity, [key]: (store.activity[key] ?? 0) + 1 };
  scheduleSave();
  window.dispatchEvent(new Event("prep-activity"));
}

/* ---- daily goal (streak card) ---- */

export function getGoalStored(): number | null {
  return store.goal;
}

export function setGoalStored(n: number) {
  store.goal = n;
  scheduleSave();
}

/* ---- custom flashcards ---- */

export function getCustomCardsRaw(): StoredCustomCard[] {
  return store.customCards;
}

export function setCustomCardsRaw(cards: StoredCustomCard[]) {
  store.customCards = cards;
  scheduleSave();
}

export function exportJson(map: ProgressMap): string {
  return JSON.stringify(map, null, 2);
}

/* ---- progress-aware aggregation helpers (used by dashboard / sidebar) ---- */

export function roundStatuses(
  roundKey: string,
  get: (id: string) => Progress
): string[] {
  const list = TOPICS.filter((t) => t.roundKey === roundKey).map((t) => get(t.id).status);
  if (roundKey === "dsa") list.push(...PROBLEMS.map((p) => get(p.id).status));
  return list;
}
