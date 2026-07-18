import { Status } from "./status";
import { TOPICS, PROBLEMS } from "./seed-data";

export type Progress = {
  status: Status;
  confidence: number;
  revisit: boolean;
  notes: string;
  attempts: number;
  /** Epoch ms of the last update — drives spaced repetition. localStorage only. */
  touched?: number;
};

export type ProgressMap = Record<string, Partial<Progress>>;

export const DEFAULT_PROGRESS: Progress = {
  status: "TODO",
  confidence: 0,
  revisit: false,
  notes: "",
  attempts: 0,
};

// Storage: browser localStorage only — zero dependencies, works as a fully
// static site (surge / Vercel / anywhere). Snapshot to a file with the
// dashboard's Export/Import (JSON) if you want it versioned.
const LS_KEY = "interviewPrepProgress.v1";

function readLocal(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocal(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Load the whole progress map from localStorage. */
export async function loadAll(): Promise<ProgressMap> {
  return readLocal();
}

/** Persist a change to localStorage. */
export function persist(map: ProgressMap, _id: string, _patch: Partial<Progress>) {
  writeLocal(map);
}

/* ---- activity log (heatmap + streak) — localStorage only ---- */

const ACTIVITY_KEY = "interviewPrepActivity.v1";

export type ActivityMap = Record<string, number>; // "YYYY-MM-DD" -> update count

export function loadActivity(): ActivityMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ACTIVITY_KEY) || "{}");
  } catch {
    return {};
  }
}

export function recordActivity() {
  if (typeof window === "undefined") return;
  const key = new Date().toISOString().slice(0, 10);
  const map = loadActivity();
  map[key] = (map[key] ?? 0) + 1;
  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("prep-activity"));
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
