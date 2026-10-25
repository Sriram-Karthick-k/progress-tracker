"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import type { Excalidraw as ExcalidrawType } from "@excalidraw/excalidraw";
import { useTheme } from "@/components/ThemeProvider";
import { DiagramLightbox } from "@/components/notebook/DiagramLightbox";
import type { IconifyJSON } from "@iconify/types";
import "katex/dist/katex.min.css";
import "@excalidraw/excalidraw/index.css";

function decodeScene(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const excalidrawCanvasActions = {
  changeViewBackgroundColor: false,
  clearCanvas: false,
  export: false as const,
  loadScene: false,
  saveToActiveFile: false,
  saveAsImage: false,
  toggleTheme: false,
};

// scene is parsed JSON (an .excalidraw export) — same implicit `any` the
// inline mount below already works with, no schema is enforced on it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LightboxState = { type: "mermaid"; svg: string } | { type: "excalidraw"; scene: any };

// Module-level + memoized: mermaid.initialize() must only ever run once per
// theme. Calling it again while a previous mermaid.run() is still in flight
// (e.g. clicking through notes fast) resets mermaid's shared internal state
// and makes that in-flight run silently fail — the ```mermaid fence is then
// left as unrendered raw text. One shared import + a "did we already
// initialize for this theme" guard removes the race entirely.
// on-brand diagram palette (indigo accent, app font) instead of mermaid's stock themes
const MERMAID_FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MERMAID_THEME = {
  light: {
    fontFamily: MERMAID_FONT,
    fontSize: "15px",
    background: "transparent",
    primaryColor: "#eef2ff",
    primaryTextColor: "#1e1b4b",
    nodeTextColor: "#1e1b4b",
    primaryBorderColor: "#6366f1",
    secondaryColor: "#ecfdf5",
    secondaryBorderColor: "#10b981",
    tertiaryColor: "#fff7ed",
    tertiaryBorderColor: "#f59e0b",
    lineColor: "#64748b",
    textColor: "#1e293b",
    noteBkgColor: "#fef9c3",
    noteBorderColor: "#ca8a04",
    noteTextColor: "#422006",
    actorBkg: "#eef2ff",
    actorBorder: "#6366f1",
    actorTextColor: "#1e1b4b",
    signalColor: "#334155",
    signalTextColor: "#1e293b",
    clusterBkg: "#f8fafc",
    clusterBorder: "#cbd5e1",
    // mindmap / timeline branch colours
    cScale0: "#c7d2fe", cScale1: "#bbf7d0", cScale2: "#fed7aa", cScale3: "#fbcfe8",
    cScale4: "#bae6fd", cScale5: "#fef08a", cScale6: "#ddd6fe", cScale7: "#99f6e4",
    cScaleLabel0: "#1e1b4b", cScaleLabel1: "#14532d", cScaleLabel2: "#7c2d12", cScaleLabel3: "#831843",
    cScaleLabel4: "#0c4a6e", cScaleLabel5: "#713f12", cScaleLabel6: "#3b0764", cScaleLabel7: "#134e4a",
    git0: "#4f46e5", gitBranchLabel0: "#ffffff", // mindmap root node
  },
  dark: {
    fontFamily: MERMAID_FONT,
    fontSize: "15px",
    darkMode: true,
    background: "transparent",
    primaryColor: "#1e1b4b",
    primaryTextColor: "#e0e7ff",
    nodeTextColor: "#e0e7ff",
    primaryBorderColor: "#818cf8",
    secondaryColor: "#052e2b",
    secondaryBorderColor: "#34d399",
    tertiaryColor: "#2a1a05",
    tertiaryBorderColor: "#fbbf24",
    lineColor: "#94a3b8",
    textColor: "#e2e8f0",
    noteBkgColor: "#3f3a12",
    noteBorderColor: "#facc15",
    noteTextColor: "#fef9c3",
    actorBkg: "#1e1b4b",
    actorBorder: "#818cf8",
    actorTextColor: "#e0e7ff",
    signalColor: "#cbd5e1",
    signalTextColor: "#e2e8f0",
    clusterBkg: "#0f172a",
    clusterBorder: "#334155",
    cScale0: "#4338ca", cScale1: "#047857", cScale2: "#c2410c", cScale3: "#be185d",
    cScale4: "#0369a1", cScale5: "#a16207", cScale6: "#6d28d9", cScale7: "#0f766e",
    cScaleLabel0: "#ffffff", cScaleLabel1: "#ffffff", cScaleLabel2: "#ffffff", cScaleLabel3: "#ffffff",
    cScaleLabel4: "#ffffff", cScaleLabel5: "#ffffff", cScaleLabel6: "#ffffff", cScaleLabel7: "#ffffff",
    git0: "#4f46e5", gitBranchLabel0: "#ffffff", // mindmap root node
  },
};

// Phones get a tighter layout: less spacing and wrapped labels give a much narrower
// natural width, so the diagram nearly fits the screen at a readable text size
// instead of being half off-screen. Same breakpoint as the CSS in globals.css.
const MERMAID_COMPACT = {
  flowchart: { nodeSpacing: 22, rankSpacing: 34, padding: 8, wrappingWidth: 140 },
  sequence: { actorMargin: 20, width: 112, height: 44, boxMargin: 6, messageMargin: 28, noteMargin: 6, wrap: true },
  mindmap: { padding: 10, maxNodeWidth: 120 },
};
// A left-to-right pipeline is wider than a portrait phone however compact it is; top-to-bottom
// uses the screen's natural direction. Only the header line is touched (phones only).
const verticalOnPhone = (src: string) => src.replace(/^(\s*(?:flowchart|graph)\s+)(?:LR|RL)\b/m, "$1TD");
const PHONE_MQ = "(max-width: 639px)";
function usePhone() {
  // only the diagram config depends on this, never the markup, so there's no hydration mismatch
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(PHONE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_MQ);
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}

let mermaidLoad: Promise<typeof import("mermaid")> | null = null;
let mermaidInitializedFor: string | null = null;
function loadMermaid() {
  if (!mermaidLoad) {
    mermaidLoad = import("mermaid").then((m) => {
      const loadIconJson = (mod: { default: IconifyJSON }) => mod.default;
      m.default.registerIconPacks([
        { name: "logos", loader: () => import("@iconify-json/logos/icons.json").then(loadIconJson) },
        { name: "mdi", loader: () => import("@iconify-json/mdi/icons.json").then(loadIconJson) },
      ]);
      return m;
    });
  }
  return mermaidLoad;
}

let excalidrawLoad: Promise<[typeof import("@excalidraw/excalidraw"), typeof import("react-dom/client")]> | null = null;
function loadExcalidraw() {
  if (!excalidrawLoad) excalidrawLoad = Promise.all([import("@excalidraw/excalidraw"), import("react-dom/client")]);
  return excalidrawLoad;
}

// Renders pre-built markdown HTML, draws any ```mermaid diagrams, and mounts
// any ```excalidraw scenes (hand-drawn illustrations authored at
// excalidraw.com, pasted in as scene JSON) — all client-side. Both are
// click-to-expand into a full-screen, zoomable lightbox.
export function NotebookContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mode } = useTheme();
  const phone = usePhone();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [Excalidraw, setExcalidraw] = useState<typeof ExcalidrawType | null>(null);
  // one React root per .md-excalidraw container, reused across effect re-runs
  // (theme change) — calling createRoot twice on a container breaks the canvas
  const excalidrawRoots = useRef(new Map<HTMLElement, Root>());

  // Must be referentially stable: React diffs this prop by object identity, so
  // an inline `{{ __html: html }}` makes EVERY re-render (e.g. ThemeProvider
  // hydrating its state) rewrite innerHTML — silently swapping out the very
  // nodes Mermaid/Excalidraw are mid-way through drawing into.
  const inner = useMemo(() => ({ __html: html }), [html]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const roots = excalidrawRoots.current;
    const observers: ResizeObserver[] = [];
    // re-query AFTER the async chunk load, and only touch nodes still in the page
    const live = (sel: string) => (Array.from(el.querySelectorAll(sel)) as HTMLElement[]).filter((n) => n.isConnected);

    // copy button in each code block's header bar
    for (const fig of live("figure.md-code")) {
      const cap = fig.querySelector("figcaption");
      if (!cap || cap.querySelector("button")) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "md-copy";
      btn.textContent = "Copy";
      btn.onclick = async () => {
        await navigator.clipboard.writeText(fig.querySelector("pre")?.textContent ?? "");
        btn.textContent = "Copied ✓";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      };
      cap.appendChild(btn);
    }

    if (el.querySelector("pre.mermaid")) {
      loadMermaid()
        .then(async (m) => {
          if (cancelled) return;
          const mermaid = m.default;
          const configKey = `${mode}-${phone ? "phone" : "wide"}`;
          if (mermaidInitializedFor !== configKey) {
            mermaidInitializedFor = configKey;
            mermaid.initialize({
              startOnLoad: false,
              theme: "base",
              themeVariables: MERMAID_THEME[mode],
              ...(phone ? MERMAID_COMPACT : {}),
              // "neo": rounded, shadowed, solid fills. handDrawn's rough.js hatching
              // made text on coloured nodes hard to read.
              look: "neo",
              securityLevel: "loose",
            });
          }
          const blocks = live("pre.mermaid");
          for (const b of blocks) {
            // keep the source so a theme switch can re-render from scratch
            b.dataset.src ??= b.textContent ?? "";
            b.textContent = phone ? verticalOnPhone(b.dataset.src) : b.dataset.src;
            b.removeAttribute("data-processed");
          }
          try {
            await mermaid.run({ nodes: blocks });
          } catch (e) {
            blocks.forEach((b) => !b.querySelector("svg") && b.classList.add("is-failed"));
            console.error("[notebook] mermaid render failed", (e as { error?: Error })?.error ?? e);
          }
          if (cancelled) return;
          for (const b of blocks) {
            const svg = b.querySelector("svg");
            if (!svg) continue;
            // natural (unscaled) width: on phones render at ~78% of it (≈12px text) and let the
            // frame scroll, unless that's within ~12% of the frame, where fitting is nicer
            const natural = svg.viewBox.baseVal?.width;
            const size = () => {
              if (!natural) return;
              const frame = b.clientWidth;
              const readable = natural * 0.78;
              svg.style.setProperty("--svg-w", `${readable <= frame * 1.12 ? frame : readable}px`);
            };
            size();
            const open = () => setLightbox({ type: "mermaid", svg: b.querySelector("svg")!.outerHTML });
            b.classList.add("is-zoomable");
            b.title = "Tap to expand";
            b.onclick = open;
            const fig = b.closest("figure.md-diagram");
            if (fig) {
              // flag diagrams wider than their frame, so the "swipe / tap" hint shows only then
              const check = () => {
                size();
                fig.classList.toggle("is-wide", b.scrollWidth > b.clientWidth + 4);
              };
              check();
              const ro = new ResizeObserver(check);
              ro.observe(b);
              observers.push(ro);
            }
            if (fig && !fig.querySelector(".md-expand")) {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "md-expand";
              btn.title = "Expand & zoom";
              btn.setAttribute("aria-label", "Expand diagram");
              btn.textContent = "⤢";
              btn.onclick = open;
              fig.appendChild(btn);
            }
          }
        })
        .catch((e) => {
          live("pre.mermaid").forEach((b) => b.classList.add("is-failed"));
          mermaidLoad = null; // don't cache a failed chunk load forever — retry next time
          console.error("[notebook] mermaid failed to load", e);
        });
    }

    if (el.querySelector(".md-excalidraw")) {
      loadExcalidraw()
        .then(([{ Excalidraw: Excal }, { createRoot }]) => {
          if (cancelled) return;
          setExcalidraw(() => Excal);
          for (const block of live(".md-excalidraw")) {
            const b64 = block.dataset.scene;
            if (!b64) continue;
            let scene;
            try {
              scene = JSON.parse(decodeScene(b64));
            } catch {
              block.textContent = "Couldn't load this diagram (invalid Excalidraw scene JSON).";
              continue;
            }
            const elements = scene.elements ?? [];
            let root = roots.get(block);
            if (!root) {
              root = createRoot(block);
              roots.set(block, root);
            }
            root.render(
              <Excal
                initialData={{
                  elements,
                  appState: { ...scene.appState, viewBackgroundColor: "transparent" },
                  files: scene.files ?? null,
                }}
                viewModeEnabled
                theme={mode === "dark" ? "dark" : "light"}
                UIOptions={{ canvasActions: excalidrawCanvasActions }}
                // the API arrives during construction — fit once it has mounted
                excalidrawAPI={(api) =>
                  setTimeout(() => api.scrollToContent(elements, { fitToViewport: true, viewportZoomFactor: 0.85, animate: false }))
                }
              />
            );
            const wrap = block.closest(".md-excalidraw-wrap");
            if (wrap && !wrap.querySelector(".md-expand")) {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.title = "Expand & zoom";
              btn.setAttribute("aria-label", "Expand drawing");
              btn.className = "md-expand";
              btn.textContent = "⤢";
              btn.onclick = () => setLightbox({ type: "excalidraw", scene });
              wrap.appendChild(btn);

              // touch only (CSS shows it on coarse pointers): the canvas itself goes inert so
              // it can't trap page scrolling; tapping anywhere on the drawing opens it full-screen
              const tap = document.createElement("button");
              tap.type = "button";
              tap.className = "md-excalidraw-tap";
              tap.setAttribute("aria-label", "Open drawing full screen");
              tap.textContent = "Tap to open";
              tap.onclick = () => setLightbox({ type: "excalidraw", scene });
              wrap.appendChild(tap);
            }
          }
        })
        .catch((e) => {
          excalidrawLoad = null;
          console.error("[notebook] excalidraw failed to load", e);
        });
    }

    return () => {
      cancelled = true;
      observers.forEach((o) => o.disconnect());
      // deferred (cleanup can run mid-render, where a sync unmount is unsafe), and
      // only for containers that actually left the page — a theme change keeps them
      setTimeout(() => {
        for (const [block, root] of roots) {
          if (block.isConnected) continue;
          root.unmount();
          roots.delete(block);
        }
      });
    };
  }, [html, mode, phone]);

  return (
    <>
      <div ref={ref} className="md-body" dangerouslySetInnerHTML={inner} />
      {lightbox?.type === "mermaid" && (
        <DiagramLightbox zoomable onClose={() => setLightbox(null)}>
          <div dangerouslySetInnerHTML={{ __html: lightbox.svg }} />
        </DiagramLightbox>
      )}
      {lightbox?.type === "excalidraw" && Excalidraw && (
        <DiagramLightbox onClose={() => setLightbox(null)}>
          <div className="md-lightbox-excalidraw h-full w-full">
            <Excalidraw
              initialData={{
                elements: lightbox.scene.elements ?? [],
                appState: { ...lightbox.scene.appState, viewBackgroundColor: "transparent" },
                files: lightbox.scene.files ?? null,
              }}
              viewModeEnabled
              theme={mode === "dark" ? "dark" : "light"}
              UIOptions={{ canvasActions: excalidrawCanvasActions }}
              // open fitted to the screen instead of at 100% from the scene's top-left corner
              excalidrawAPI={(api) =>
                setTimeout(() =>
                  api.scrollToContent(lightbox.scene.elements ?? [], { fitToViewport: true, viewportZoomFactor: 0.9, animate: false })
                )
              }
            />
          </div>
        </DiagramLightbox>
      )}
    </>
  );
}
