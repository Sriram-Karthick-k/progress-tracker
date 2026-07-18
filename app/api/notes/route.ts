import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// CRUD for Notebook markdown files. Editing is ON by default; a public build
// sets NEXT_PUBLIC_NOTES_READONLY=1 → every write 403s (read-only).
const ROOT = path.join(process.cwd(), "content", "notes");
const EDITABLE = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";

function sanitize(slug: unknown): string[] {
  if (!Array.isArray(slug)) return [];
  return slug.map((s) => String(s).replace(/[^a-zA-Z0-9-_]/g, "")).filter(Boolean);
}

// Read a note's raw markdown (for the editor). {exists, content}.
export async function GET(req: NextRequest) {
  if (!EDITABLE) return NextResponse.json({ error: "disabled" }, { status: 403 });
  const slug = sanitize((req.nextUrl.searchParams.get("slug") || "").split("/"));
  if (!slug.length) return NextResponse.json({ error: "missing slug" }, { status: 400 });
  const file = path.join(ROOT, ...slug) + ".md";
  if (!fs.existsSync(file)) return NextResponse.json({ exists: false, content: "" });
  return NextResponse.json({ exists: true, content: fs.readFileSync(file, "utf8") });
}

export async function POST(req: NextRequest) {
  if (!EDITABLE) {
    return NextResponse.json({ error: "Editing is disabled on this build." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = sanitize(body.slug);
  if (!slug.length) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const action: string = body.action ?? "save";
  const file = path.join(ROOT, ...slug) + ".md";
  const dir = path.join(ROOT, ...slug);

  try {
    switch (action) {
      case "save": {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, typeof body.content === "string" ? body.content : "", "utf8");
        return NextResponse.json({ ok: true });
      }
      case "create": {
        if (fs.existsSync(file)) return NextResponse.json({ error: "A note with that path already exists." }, { status: 409 });
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, typeof body.content === "string" ? body.content : "", "utf8");
        return NextResponse.json({ ok: true });
      }
      case "mkdir": {
        if (fs.existsSync(dir)) return NextResponse.json({ error: "That folder already exists." }, { status: 409 });
        fs.mkdirSync(dir, { recursive: true });
        return NextResponse.json({ ok: true });
      }
      case "delete": {
        if (fs.existsSync(file)) fs.rmSync(file);
        return NextResponse.json({ ok: true });
      }
      case "deleteFolder": {
        // guard: never delete the notes root itself
        if (slug.length && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
