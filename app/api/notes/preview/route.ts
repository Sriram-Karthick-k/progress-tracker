import { NextRequest, NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/notes";

// Renders arbitrary (unsaved) markdown through the real pipeline, for the
// editor's live preview — it used to run its own bare marked.parse() with
// none of lib/notes.ts's custom renderers, so mermaid/excalidraw/katex/shiki
// never showed up while editing.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.content !== "string") {
    return NextResponse.json({ error: "missing content" }, { status: 400 });
  }
  const { html } = await renderMarkdown(body.content);
  return NextResponse.json({ html });
}
