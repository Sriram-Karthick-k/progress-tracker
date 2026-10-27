"use client";

import { useEffect, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import type { Excalidraw as ExcalidrawType } from "@excalidraw/excalidraw";
import { useTheme } from "@/components/ThemeProvider";
import { DiagramLightbox } from "@/components/notebook/DiagramLightbox";
import { isFollowing } from "@/components/notebook/liveClient";
import { patchBody, signBlocks } from "@/components/notebook/patchBody";
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
// `dkey` ties the full-screen viewer to one diagram in the page, so it can follow that diagram
// when the note is edited; `gone` = the note no longer has it (the viewer keeps the last drawing).
type LightboxState =
  | { type: "mermaid"; svg: string; dkey: string; gone?: boolean }
  | { type: "excalidraw"; scene: any; ekey: string; gone?: boolean };

// the few Excalidraw API calls we make; the viewer and the embeds each keep one to update their scene in place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SketchApi = { updateScene: (scene: { elements: any }) => void; scrollToContent: (target?: any, opts?: any) => void };

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
let mermaidSeq = 0; // unique id per mermaid.render() call
let diagramSeq = 0; // identity of a drawn diagram, kept while its source is edited

// Mermaid measures text in real layout, so it needs somewhere to draw. Without a container it
// appends its scratch element to <body>, which stretches the page for a moment on every update.
let scratch: HTMLDivElement | null = null;
function scratchBox(): HTMLDivElement {
  if (!scratch || !scratch.isConnected) {
    scratch = document.createElement("div");
    scratch.setAttribute("aria-hidden", "true");
    scratch.style.cssText = "position:fixed;left:-10000px;top:0;width:1200px;visibility:hidden;pointer-events:none";
    document.body.appendChild(scratch);
  }
  return scratch;
}
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
//
// React renders only the FIRST `html`. Every later value (the note changed on disk, or the
// editor preview re-rendered) is patched into the DOM block by block (see patchBody), so
// unchanged diagrams, open quiz cards and the scroll position survive; only edited blocks are
// replaced and redrawn. `live` = a note that updates itself: edits flash, and "follow" scrolls
// to them. `board` = a whiteboard note (follow is on by default there).
export function NotebookContent({ html, live = false, board = false }: { html: string; live?: boolean; board?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mode } = useTheme();
  const phone = usePhone();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [Excalidraw, setExcalidraw] = useState<typeof ExcalidrawType | null>(null);
  // one React root per .md-excalidraw container, reused across effect re-runs
  // (theme change) — calling createRoot twice on a container breaks the canvas
  const excalidrawRoots = useRef(new Map<HTMLElement, Root>());
  const resizers = useRef(new Map<HTMLElement, ResizeObserver>());
  const applied = useRef(html); // the html currently reflected in the DOM
  const followTarget = useRef<HTMLElement | null>(null);
  const lightboxOpen = useRef(false);
  lightboxOpen.current = lightbox !== null;
  // per embedded drawing: the scene currently drawn and its API, so a changed scene can be swapped in place
  const sketches = useRef(new Map<HTMLElement, { b64: string; mode: string; api?: SketchApi }>());
  const restoreElements = useRef<typeof import("@excalidraw/excalidraw").restoreElements | null>(null);
  // the full-screen Excalidraw viewer's API; it keeps its own zoom and pan while the scene changes under it
  const viewerApi = useRef<SketchApi | null>(null);
  const viewerFitted = useRef(false);
  const viewerScene = lightbox?.type === "excalidraw" ? lightbox.scene : null;
  const viewerShown = useRef<unknown>(null); // the scene the open viewer was last given
  useEffect(() => {
    if (!viewerScene) {
      viewerShown.current = null;
      return;
    }
    // the first scene is the viewer's initialData; only later ones are updates
    if (viewerShown.current === null || viewerShown.current === viewerScene) {
      viewerShown.current = viewerScene;
      return;
    }
    viewerShown.current = viewerScene;
    if (viewerApi.current && restoreElements.current) {
      viewerApi.current.updateScene({ elements: restoreElements.current(viewerScene.elements ?? [], null) });
    }
  }, [viewerScene]);

  // Must be referentially stable (and never change): React diffs this prop by object identity,
  // so a new object makes it rewrite innerHTML — silently swapping out the very nodes
  // Mermaid/Excalidraw have drawn into. Updates go through patchBody instead.
  const [inner] = useState(() => ({ __html: html }));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const roots = excalidrawRoots.current;
    const observers = resizers.current;
    const tasks: Promise<unknown>[] = [];
    // re-query AFTER the async chunk load, and only touch nodes still in the page
    const inDoc = (sel: string) => (Array.from(el.querySelectorAll(sel)) as HTMLElement[]).filter((n) => n.isConnected);

    // stamp the server-rendered blocks before anything decorates them, so later html can be diffed against them
    signBlocks(el);
    if (applied.current !== html) {
      applied.current = html;
      const fresh = patchBody(el, html, live);
      if (live && fresh.length) followTarget.current = fresh[0];
      // a diagram that is open full-screen but no longer in the note stays on screen, marked as removed
      setLightbox((cur) => {
        if (!cur) return cur;
        const present = !!el.querySelector(cur.type === "mermaid" ? `pre.mermaid[data-dkey="${cur.dkey}"]` : `.md-excalidraw[data-ekey="${cur.ekey}"]`);
        return present === !cur.gone ? cur : { ...cur, gone: !present };
      });
    }

    // copy button in each code block's header bar
    for (const fig of inDoc("figure.md-code")) {
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

    // size, zoom handler, wide-diagram hint and expand button for a drawn diagram
    const decorate = (b: HTMLElement) => {
      const fig = b.closest("figure.md-diagram");
      // natural (unscaled) width: on phones render at ~78% of it (≈12px text) and let the
      // frame scroll, unless that's within ~12% of the frame, where fitting is nicer
      const size = () => {
        const svg = b.querySelector("svg");
        const natural = svg?.viewBox.baseVal?.width;
        if (!svg || !natural) return;
        const frame = b.clientWidth;
        const readable = natural * 0.78;
        svg.style.setProperty("--svg-w", `${readable <= frame * 1.12 ? frame : readable}px`);
      };
      size();
      b.dataset.dkey ||= `d${++diagramSeq}`;
      const open = () => {
        const svg = b.querySelector("svg");
        if (svg) setLightbox({ type: "mermaid", svg: svg.outerHTML, dkey: b.dataset.dkey! });
      };
      b.classList.add("is-zoomable");
      b.title = "Tap to expand";
      b.onclick = open;
      if (!fig) return;
      // flag diagrams wider than their frame, so the "swipe / tap" hint shows only then
      const check = () => {
        size();
        fig.classList.toggle("is-wide", b.scrollWidth > b.clientWidth + 4);
      };
      check();
      if (!observers.has(b)) {
        const ro = new ResizeObserver(check);
        ro.observe(b);
        observers.set(b, ro);
      }
      if (!fig.querySelector(".md-expand")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "md-expand";
        btn.title = "Expand & zoom";
        btn.setAttribute("aria-label", "Expand diagram");
        btn.textContent = "⤢";
        btn.onclick = open;
        fig.appendChild(btn);
      }
    };

    // Diagrams that aren't drawn yet for this source + theme + screen size. An unchanged diagram
    // keeps its drawing across note updates; a theme/phone change invalidates every one.
    const configKey = `${mode}-${phone ? "phone" : "wide"}`;
    const toDraw = inDoc("pre.mermaid").filter((b) => {
      b.dataset.src ??= b.textContent ?? "";
      return b.dataset.rendered !== `${configKey}|${b.dataset.src}`;
    });
    if (toDraw.length) {
      tasks.push(
        loadMermaid()
          .then(async (m) => {
            if (cancelled) return;
            const mermaid = m.default;
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
                // a bad diagram is reported per block (below), not as a bomb graphic in <body>
                suppressErrorRendering: true,
              });
            }
            for (const b of toDraw) {
              if (cancelled) return;
              const src = b.dataset.src ?? "";
              const id = `mmd-${++mermaidSeq}`;
              try {
                const { svg, bindFunctions } = await mermaid.render(id, phone ? verticalOnPhone(src) : src, scratchBox());
                scratchBox().replaceChildren();
                if (cancelled || !b.isConnected) continue;
                b.innerHTML = svg;
                bindFunctions?.(b);
                b.dataset.rendered = `${configKey}|${src}`;
                b.dataset.processed = "true";
                b.classList.remove("is-failed", "is-stale");
                delete b.dataset.error;
                decorate(b);
                // a full-screen viewer showing this diagram switches to the new drawing, keeping its zoom and pan
                const drawn = b.querySelector("svg")?.outerHTML;
                const key = b.dataset.dkey;
                if (drawn) {
                  setLightbox((cur) => (cur?.type === "mermaid" && cur.dkey === key && (cur.svg !== drawn || cur.gone) ? { ...cur, svg: drawn, gone: false } : cur));
                }
              } catch (e) {
                scratchBox().replaceChildren();
                document.getElementById(id)?.remove();
                document.getElementById(`d${id}`)?.remove();
                if (cancelled || !b.isConnected) continue;
                // keep the last good drawing (with a warning) if there is one, else show the source
                b.classList.add(b.querySelector("svg") ? "is-stale" : "is-failed");
                // mermaid's message is several lines; the first says where, a later "Expecting ..." says what
                const [where, ...rest] = String((e as Error)?.message ?? e).split("\n");
                const msg = [where, rest.find((l) => /^(Expecting|Got)/.test(l))].filter(Boolean).join(" ");
                b.dataset.error = msg.length > 140 ? `${msg.slice(0, 139)}…` : msg;
                console.error("[notebook] mermaid render failed", e);
              }
            }
          })
          .catch((e) => {
            inDoc("pre.mermaid").forEach((b) => !b.querySelector("svg") && b.classList.add("is-failed"));
            mermaidLoad = null; // don't cache a failed chunk load forever — retry next time
            console.error("[notebook] mermaid failed to load", e);
          })
      );
    }

    const drawn = sketches.current;
    const toMount = inDoc(".md-excalidraw").filter((b) => {
      const s = drawn.get(b);
      return !s || s.mode !== mode || s.b64 !== b.dataset.scene;
    });
    if (toMount.length) {
      tasks.push(
        loadExcalidraw()
          .then(([mod, { createRoot }]) => {
            if (cancelled) return;
            const Excal = mod.Excalidraw;
            restoreElements.current = mod.restoreElements;
            setExcalidraw(() => Excal);
            for (const block of toMount) {
              const b64 = block.dataset.scene;
              if (!b64 || !block.isConnected) continue;
              let scene;
              try {
                scene = JSON.parse(decodeScene(b64));
              } catch {
                block.textContent = "Couldn't load this diagram (invalid Excalidraw scene JSON).";
                continue;
              }
              const elements = scene.elements ?? [];
              const fit = (api: SketchApi) => api.scrollToContent(elements, { fitToViewport: true, viewportZoomFactor: 0.85, animate: false });
              const ekey = (block.dataset.ekey ||= `e${++diagramSeq}`);
              const was = drawn.get(block);
              if (was?.api && was.mode === mode && roots.has(block)) {
                // same drawing surface, edited scene: swap the elements in place instead of tearing the embed down
                was.api.updateScene({ elements: mod.restoreElements(elements, null) });
                fit(was.api);
                drawn.set(block, { ...was, b64 });
                setLightbox((cur) => (cur?.type === "excalidraw" && cur.ekey === ekey ? { ...cur, scene, gone: false } : cur));
                continue;
              }
              let root = roots.get(block);
              if (!root) {
                root = createRoot(block);
                roots.set(block, root);
              }
              drawn.set(block, { b64, mode, api: was?.api });
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
                  // the API arrives during construction — keep it for in-place updates, and fit once it has mounted
                  excalidrawAPI={(api) => {
                    const s = drawn.get(block);
                    if (s) s.api = api;
                    setTimeout(() => fit(api));
                  }}
                />
              );
              // a click opens whatever scene the block holds now, not the one it had when this handler was made
              const open = () => {
                try {
                  setLightbox({ type: "excalidraw", scene: JSON.parse(decodeScene(block.dataset.scene!)), ekey });
                } catch {
                  /* the block shows its own parse error */
                }
              };
              const wrap = block.closest(".md-excalidraw-wrap");
              if (wrap && !wrap.querySelector(".md-expand")) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.title = "Expand & zoom";
                btn.setAttribute("aria-label", "Expand drawing");
                btn.className = "md-expand";
                btn.textContent = "⤢";
                btn.onclick = open;
                wrap.appendChild(btn);

                // touch only (CSS shows it on coarse pointers): the canvas itself goes inert so
                // it can't trap page scrolling; tapping anywhere on the drawing opens it full-screen
                const tap = document.createElement("button");
                tap.type = "button";
                tap.className = "md-excalidraw-tap";
                tap.setAttribute("aria-label", "Open drawing full screen");
                tap.textContent = "Tap to open";
                tap.onclick = open;
                wrap.appendChild(tap);
              }
            }
          })
          .catch((e) => {
            excalidrawLoad = null;
            console.error("[notebook] excalidraw failed to load", e);
          })
      );
    }

    // "Follow edits": once the changed block has its final height (diagrams drawn), bring it into view
    Promise.allSettled(tasks).then(() => {
      const target = followTarget.current;
      if (cancelled || !target) return;
      followTarget.current = null;
      // never scroll the page behind an open full-screen viewer: closing it must put you back where you were
      if (!live || lightboxOpen.current || !target.isConnected || !isFollowing(board)) return;
      const r = target.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top >= 64 && r.bottom <= vh - 24) return; // already on screen
      target.scrollIntoView({ behavior: "smooth", block: r.height < vh * 0.7 ? "center" : "start" });
    });

    // Drop observers/roots of blocks that left the page — deferred (cleanup can run mid-render,
    // where a sync unmount is unsafe). A theme change keeps its containers, so they're untouched.
    const sweep = () => {
      for (const [block, ro] of observers) {
        if (block.isConnected) continue;
        ro.disconnect();
        observers.delete(block);
      }
      for (const [block, root] of roots) {
        if (block.isConnected) continue;
        root.unmount();
        roots.delete(block);
      }
    };
    setTimeout(sweep);
    return () => {
      cancelled = true;
      setTimeout(sweep);
    };
  }, [html, mode, phone, live, board]);

  return (
    <>
      <div ref={ref} className="md-body" dangerouslySetInnerHTML={inner} />
      {lightbox?.type === "mermaid" && (
        <DiagramLightbox zoomable contentKey={lightbox.svg} title={lightbox.gone ? "Diagram (removed from the note)" : "Diagram"} onClose={() => setLightbox(null)}>
          <div dangerouslySetInnerHTML={{ __html: lightbox.svg }} />
        </DiagramLightbox>
      )}
      {lightbox?.type === "excalidraw" && Excalidraw && (
        <DiagramLightbox
          title={lightbox.gone ? "Diagram (removed from the note)" : "Diagram"}
          onClose={() => {
            viewerApi.current = null;
            viewerFitted.current = false;
            setLightbox(null);
          }}
        >
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
              // Open fitted to the screen, once. Later scene changes go through updateScene (see the
              // effect above), which leaves the viewer's own zoom and pan alone.
              excalidrawAPI={(api) => {
                viewerApi.current = api;
                if (viewerFitted.current) return;
                viewerFitted.current = true;
                setTimeout(() =>
                  api.scrollToContent(lightbox.scene.elements ?? [], { fitToViewport: true, viewportZoomFactor: 0.9, animate: false })
                );
              }}
            />
          </div>
        </DiagramLightbox>
      )}
    </>
  );
}
