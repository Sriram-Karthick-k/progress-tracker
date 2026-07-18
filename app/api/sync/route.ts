import { NextResponse } from "next/server";
import { execFileSync } from "node:child_process";

// Git sync: stage everything, commit with the current date, and push. On by
// default; a public build sets NEXT_PUBLIC_NOTES_READONLY=1 to disable. Requires
// a configured git remote + push credentials on the machine running it.
const EDITABLE = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8" }).trim();
}

export async function POST() {
  if (!EDITABLE) {
    return NextResponse.json({ error: "Sync is disabled on this build." }, { status: 403 });
  }
  try {
    const status = git(["status", "--porcelain"]);
    let committed = false;
    if (status) {
      git(["add", "-A"]);
      const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
      git(["commit", "-m", `notes sync: ${stamp}`]);
      committed = true;
    }
    let pushed = false;
    let pushNote = "";
    try {
      git(["push"]);
      pushed = true;
    } catch (e) {
      pushNote = String((e as Error).message || e).split("\n").slice(-4).join(" ").slice(0, 300);
    }
    const message = committed
      ? pushed
        ? "Committed & pushed ✓"
        : `Committed locally, but push failed: ${pushNote}`
      : pushed
        ? "Nothing to commit; pushed (already up to date) ✓"
        : `Nothing to commit${pushNote ? `; push failed: ${pushNote}` : ""}`;
    return NextResponse.json({ ok: pushed || committed, committed, pushed, message });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e).slice(0, 400) }, { status: 500 });
  }
}
