import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/notes";

// Read live from content/notes/**.md on every request — the command palette
// needs titles AND content, so it can't ride on the static build output.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSearchIndex());
}
