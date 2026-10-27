import { subscribeNotes } from "@/lib/noteWatcher";

// Server-Sent Events stream of Notebook file changes (see lib/noteWatcher.ts). One-way
// disk -> browser, so SSE instead of a WebSocket: no custom server needed, and
// EventSource reconnects on its own. Off on read-only builds (nothing changes on disk there).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EDITABLE = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";
const HEARTBEAT_MS = 25_000; // keeps proxies and the browser from timing the idle stream out

export async function GET(req: Request) {
  if (!EDITABLE) return new Response("Live updates are disabled on this build.", { status: 404 });

  const enc = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(chunk));
        } catch {
          cleanup(); // the client went away without us noticing
        }
      };
      const unsubscribe = subscribeNotes((e) => send(`event: note\ndata: ${JSON.stringify(e)}\n\n`));
      const heartbeat = setInterval(() => send(": keep-alive\n\n"), HEARTBEAT_MS);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener("abort", cleanup);
      send("retry: 2000\n\n"); // browser reconnect delay
      send(": connected\n\n"); // flushes headers so EventSource fires `open` right away
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform: stops compression middleware from buffering the stream
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}