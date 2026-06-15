import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUSES } from "@/lib/status";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.status === "string" && STATUSES.includes(body.status)) {
    data.status = body.status;
    // Auto-stamp the solved date when a problem is marked Done.
    data.dateSolved = body.status === "DONE" ? new Date() : null;
  }
  if (typeof body.confidence === "number") {
    data.confidence = Math.max(0, Math.min(5, Math.round(body.confidence)));
  }
  if (typeof body.attempts === "number") {
    data.attempts = Math.max(0, Math.round(body.attempts));
  }
  if (typeof body.revisit === "boolean") data.revisit = body.revisit;
  if (typeof body.notes === "string") data.notes = body.notes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const problem = await prisma.problem.update({ where: { id }, data });
  return NextResponse.json(problem);
}
