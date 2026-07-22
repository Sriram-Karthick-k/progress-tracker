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

const EMPTY = { progress: {}, activity: {}, goal: null, customCards: [], lastRoute: null, scroll: {} };

export async function GET() {
  try {
    if (!fs.existsSync(FILE)) return NextResponse.json(EMPTY);
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return NextResponse.json({ ...EMPTY, ...parsed });
  } catch {
    return NextResponse.json(EMPTY);
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
  };
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
