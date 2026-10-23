"use client";

import { useEffect, useRef } from "react";
import type { Root } from "react-dom/client";
import { useTheme } from "@/components/ThemeProvider";
import type { IconifyJSON } from "@iconify/types";
import "katex/dist/katex.min.css";
import "@excalidraw/excalidraw/index.css";

function decodeScene(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Renders pre-built markdown HTML, draws any ```mermaid diagrams, and mounts
// any ```excalidraw scenes (hand-drawn illustrations authored at
// excalidraw.com, pasted in as scene JSON) — all client-side.
export function NotebookContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const roots: Root[] = [];

    const mermaidBlocks = Array.from(el.querySelectorAll("pre.mermaid")) as HTMLElement[];
    if (mermaidBlocks.length > 0) {
      import("mermaid").then((m) => {
        if (cancelled) return;
        const mermaid = m.default;
        // icon packs for `architecture-beta` diagrams (cloud/service boxes, à la
        // Eraser's cloud-architecture diagrams) — loaded lazily, only when used.
        const loadIconJson = (m: { default: IconifyJSON }) => m.default;
        mermaid.registerIconPacks([
          { name: "logos", loader: () => import("@iconify-json/logos/icons.json").then(loadIconJson) },
          { name: "mdi", loader: () => import("@iconify-json/mdi/icons.json").then(loadIconJson) },
        ]);
        mermaid.initialize({
          startOnLoad: false,
          theme: resolved === "dark" ? "dark" : "default",
          look: "handDrawn", // sketch-style rendering (rough.js) instead of flat boxes
          securityLevel: "loose",
        });
        mermaidBlocks.forEach((b) => b.removeAttribute("data-processed"));
        mermaid.run({ nodes: mermaidBlocks }).catch(() => {});
      });
    }

    const excalidrawBlocks = Array.from(el.querySelectorAll(".md-excalidraw")) as HTMLElement[];
    if (excalidrawBlocks.length > 0) {
      Promise.all([import("@excalidraw/excalidraw"), import("react-dom/client")]).then(
        ([{ Excalidraw }, { createRoot }]) => {
          if (cancelled) return;
          for (const block of excalidrawBlocks) {
            const b64 = block.dataset.scene;
            if (!b64) continue;
            try {
              const scene = JSON.parse(decodeScene(b64));
              const root = createRoot(block);
              roots.push(root);
              root.render(
                <Excalidraw
                  initialData={{
                    elements: scene.elements ?? [],
                    appState: { ...scene.appState, viewBackgroundColor: "transparent" },
                    files: scene.files ?? null,
                  }}
                  viewModeEnabled
                  theme={resolved === "dark" ? "dark" : "light"}
                />
              );
            } catch {
              block.textContent = "Couldn't load this diagram (invalid Excalidraw scene JSON).";
            }
          }
        }
      );
    }

    return () => {
      cancelled = true;
      roots.forEach((r) => r.unmount());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return <div ref={ref} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
