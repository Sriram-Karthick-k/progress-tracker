import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUSES } from "@/lib/status";

export const dynamic = "force-dynamic";

// GET  /api/progress        -> { [key]: { status, confidence, revisit, notes, attempts } }
// PATCH /api/progress       -> body { id, ...fields } upserts one row.
// Only used when NEXT_PUBLIC_STORAGE_MODE=db (SQLite locally). On Vercel/static the
// client uses localStorage and never calls this.

export async function GET() {
  try {
    const rows = await prisma.progress.findMany();
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      map[r.key] = {
        status: r.status,
        confidence: r.confidence,
        revisit: r.revisit,
        attempts: r.attempts,
        notes: r.notes,
      };
    }
    return NextResponse.json(map);
  } catch {
    // No writable DB (e.g. serverless) — tell the client to use localStorage.
    return NextResponse.json({}, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.status === "string" && STATUSES.includes(body.status)) data.status = body.status;
  if (typeof body.confidence === "number") data.confidence = Math.max(0, Math.min(5, Math.round(body.confidence)));
  if (typeof body.attempts === "number") data.attempts = Math.max(0, Math.round(body.attempts));
  if (typeof body.revisit === "boolean") data.revisit = body.revisit;
  if (typeof body.notes === "string") data.notes = body.notes;

  try {
    const row = await prisma.progress.upsert({
      where: { key: id },
      create: { key: id, ...data },
      update: data,
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
