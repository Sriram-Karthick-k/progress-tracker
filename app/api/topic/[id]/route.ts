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
  }
  if (typeof body.confidence === "number") {
    data.confidence = Math.max(0, Math.min(5, Math.round(body.confidence)));
  }
  if (typeof body.revisit === "boolean") data.revisit = body.revisit;
  if (typeof body.notes === "string") data.notes = body.notes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const topic = await prisma.topic.update({ where: { id }, data });
  return NextResponse.json(topic);
}
