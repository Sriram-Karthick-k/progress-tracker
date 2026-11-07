import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// All user data (progress map, activity log, daily goal, custom flashcards)
// lives in ONE file: content/progress.json — versioned in git next to
// content/notes/, committed by the same Sync button. Same gating as notes:
// writes are ON by default; a public build sets NEXT_PUBLIC_NOTES_READONLY=1
// and every write 403s (reads still serve the committed snapshot).
const FILE = path.join(process.cwd(), "content", "progress.json");
const EDITABLE = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";

// GET must not be prerendered at build time — it reads the live file.
export const dynamic = "force-dynamic";

const EMPTY = { progress: {}, activity: {}, goal: null, customCards: [], lastRoute: null, scroll: {}, events: [] };

type Saved = { progress?: object; activity?: object; events?: unknown[]; customCards?: unknown[] };

// "Has the user actually saved anything?" — ignores lastRoute/scroll/goal, which
// a blank page load writes on its own.
const hasData = (s: Saved) =>
  Object.keys(s.progress ?? {}).length > 0 ||
  Object.keys(s.activity ?? {}).length > 0 ||
  (s.events ?? []).length > 0 ||
  (s.customCards ?? []).length > 0;

export async function GET() {
  if (!fs.existsSync(FILE)) return NextResponse.json(EMPTY); // first run: nothing saved yet
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return NextResponse.json({ ...EMPTY, ...parsed });
  } catch {
    // Never answer "empty" for a file that exists but can't be read: the client
    // would treat it as real data and write it back over your progress.
    return NextResponse.json({ error: "progress.json is unreadable" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!EDITABLE) {
    return NextResponse.json({ error: "Saving is disabled on this build." }, { status: 403 });
  }
  // sendBeacon posts arrive as text/plain — Request.json() parses them fine.
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.progress !== "object" || body.progress === null) {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const store = {
    progress: body.progress,
    activity: typeof body.activity === "object" && body.activity !== null ? body.activity : {},
    goal: typeof body.goal === "number" ? body.goal : null,
    customCards: Array.isArray(body.customCards) ? body.customCards : [],
    lastRoute: typeof body.lastRoute === "string" ? body.lastRoute : null,
    scroll: typeof body.scroll === "object" && body.scroll !== null ? body.scroll : {},
    events: Array.isArray(body.events) ? body.events : [],
  };
  // A page that failed to load your data (or a stale tab) holds a blank store.
  // Refuse to let it replace a file that has real progress in it.
  if (!hasData(store) && fs.existsSync(FILE)) {
    try {
      if (hasData(JSON.parse(fs.readFileSync(FILE, "utf8")))) {
        return NextResponse.json({ error: "refusing to replace saved progress with an empty store" }, { status: 409 });
      }
    } catch {
      /* unreadable current file: nothing to protect */
    }
  }
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const text = JSON.stringify(store, null, 2) + "\n";
    const tmp = FILE + ".tmp";
    try {
      // write-then-rename, so a concurrent GET never sees a half-written file
      fs.writeFileSync(tmp, text, "utf8");
      fs.renameSync(tmp, FILE);
    } catch {
      fs.rmSync(tmp, { force: true });
      fs.writeFileSync(FILE, text, "utf8"); // rename can fail if something holds the file open
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
