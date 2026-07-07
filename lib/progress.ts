import { Status } from "./status";
import { TOPICS, PROBLEMS } from "./seed-data";

export type Progress = {
  status: Status;
  confidence: number;
  revisit: boolean;
  notes: string;
  attempts: number;
};

export type ProgressMap = Record<string, Partial<Progress>>;

export const DEFAULT_PROGRESS: Progress = {
  status: "TODO",
  confidence: 0,
  revisit: false,
  notes: "",
  attempts: 0,
};

// Storage backend. "local" = browser localStorage (works ANYWHERE incl. Vercel/static).
// "db" = server API backed by Prisma/SQLite (local .exe / dev). Selected at build time.
export const STORAGE_MODE: "local" | "db" =
  process.env.NEXT_PUBLIC_STORAGE_MODE === "db" ? "db" : "local";

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

/** Load the whole progress map. In db mode, tries the API and falls back to localStorage. */
export async function loadAll(): Promise<ProgressMap> {
  if (STORAGE_MODE === "db") {
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (res.ok) return (await res.json()) as ProgressMap;
    } catch {
      /* API unavailable → fall through to local */
    }
  }
  return readLocal();
}

/** Persist a change. Always mirrors to localStorage; also PATCHes the API in db mode. */
export function persist(map: ProgressMap, id: string, patch: Partial<Progress>) {
  writeLocal(map); // offline-safe mirror in every mode
  if (STORAGE_MODE === "db") {
    fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => {
      /* best-effort; localStorage already has it */
    });
  }
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
