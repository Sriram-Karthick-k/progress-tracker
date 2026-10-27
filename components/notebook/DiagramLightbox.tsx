"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const MIN = 0.5;
const MAX = 8;
const clamp = (s: number) => Math.min(MAX, Math.max(MIN, s));

type View = { scale: number; x: number; y: number };
type Pt = { x: number; y: number };

// Full-screen viewer for a clicked diagram.
//  - `zoomable` (Mermaid's static SVG): our own pan/zoom. Mouse wheel, trackpad pinch,
//    two-finger pinch, one-finger drag, double-tap. Starts fitted to the screen.
//  - otherwise (Excalidraw): it has native pan/zoom, so it just gets the space.
// On phones it is full-bleed, and the Back button / swipe-back closes it instead of
// leaving the note.
//
// `contentKey` identifies what is being shown. When the diagram is redrawn (the note was edited
// while the viewer is open) the new drawing replaces it and the zoom/pan are carried over, so the
// board stays where you put it instead of snapping back to "fit".
export function DiagramLightbox({
  onClose,
  zoomable,
  title = "Diagram",
  contentKey,
  children,
}: {
  onClose: () => void;
  zoomable?: boolean;
  title?: string;
  contentKey?: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [touch, setTouch] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const pointers = useRef(new Map<number, Pt>());
  const pan = useRef<{ p: Pt; v: View } | null>(null);
  const pinch = useRef<{ dist: number; mid: Pt; v: View } | null>(null);
  const tap = useRef<{ t: number; p: Pt } | null>(null);
  const moved = useRef(0);

  const centre = useCallback((): Pt => {
    const r = stage.current!.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  // zoom by `factor`, keeping the point under `at` (default: the centre) fixed
  const zoomAt = useCallback(
    (factor: number, at?: Pt) => {
      setView((v) => {
        const scale = clamp(v.scale * factor);
        if (!stage.current) return { ...v, scale };
        const c = centre();
        const px = (at ?? c).x - c.x;
        const py = (at ?? c).y - c.y;
        const k = scale / v.scale;
        return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    },
    [centre]
  );
  const reset = useCallback(() => setView({ scale: 1, x: 0, y: 0 }), []);

  // Back button / swipe-back closes the viewer. Next patches history.pushState to
  // carry its own router state across, so our extra entry is safe.
  // A ref, not history.state: a router refresh (live note updates) replaces history.state and
  // would forget our entry, leaving a dead one behind after closing.
  const entry = useRef(false);
  const requestClose = useCallback(() => {
    if (entry.current) window.history.back();
    else onCloseRef.current();
  }, []);
  useEffect(() => {
    if (!entry.current) {
      window.history.pushState({ ...window.history.state, __lightbox: true }, "");
      entry.current = true;
    }
    const onPop = () => {
      entry.current = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // New drawing, same view. Keep the diagram's top-left corner and its on-screen size where they
  // were, so a diagram that grows downwards or sideways just extends the board. A diagram that is
  // still fitted to the screen stays fitted.
  const metrics = useRef<{ unit: number; w: number; h: number } | null>(null); // px per viewBox unit
  const shownKey = useRef(contentKey);
  useLayoutEffect(() => {
    const svg = stage.current?.querySelector("svg") ?? null;
    const ctm = svg?.getScreenCTM();
    const now = svg && ctm ? { unit: ctm.a, w: svg.viewBox.baseVal.width, h: svg.viewBox.baseVal.height } : null;
    if (shownKey.current !== contentKey) {
      shownKey.current = contentKey;
      const v = viewRef.current;
      const before = metrics.current;
      const fitted = v.scale === 1 && v.x === 0 && v.y === 0;
      if (before && now && !fitted && before.unit > 0 && now.unit > 0) {
        metrics.current = null; // measured again once this view change has been applied
        setView({
          scale: clamp((v.scale * before.unit) / now.unit),
          x: v.x + (before.unit * (now.w - before.w)) / 2,
          y: v.y + (before.unit * (now.h - before.h)) / 2,
        });
        return;
      }
    }
    metrics.current = now;
  }, [contentKey, view]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const coarse = window.matchMedia("(pointer: coarse)");
    const portraitMq = window.matchMedia("(orientation: portrait)");
    const sync = () => {
      setTouch(coarse.matches);
      setPortrait(portraitMq.matches);
    };
    sync();
    portraitMq.addEventListener("change", sync);
    return () => {
      portraitMq.removeEventListener("change", sync);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
      if (!zoomable) return;
      if (e.key === "+" || e.key === "=") zoomAt(1.25);
      if (e.key === "-") zoomAt(0.8);
      if (e.key === "0") reset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, zoomable, zoomAt, reset]);

  // wheel needs a non-passive native listener to be able to preventDefault
  useEffect(() => {
    const el = stage.current;
    if (!el || !zoomable) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), { x: e.clientX, y: e.clientY });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomable, zoomAt]);

  function startPinch() {
    const [a, b] = [...pointers.current.values()];
    pinch.current = {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      v: viewRef.current,
    };
    pan.current = null;
    moved.current = 99; // a pinch is never a tap
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      moved.current = 0;
      pan.current = { p: { x: e.clientX, y: e.clientY }, v: viewRef.current };
      setDragging(true);
    } else if (pointers.current.size === 2) {
      startPinch();
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const { dist: d0, mid: m0, v: v0 } = pinch.current;
      const scale = clamp((v0.scale * dist) / d0);
      const c = centre();
      // the content point that sat under the initial midpoint stays under the moving one
      const cx = (m0.x - c.x - v0.x) / v0.scale;
      const cy = (m0.y - c.y - v0.y) / v0.scale;
      setView({ scale, x: mid.x - c.x - cx * scale, y: mid.y - c.y - cy * scale });
    } else if (pan.current) {
      const dx = e.clientX - pan.current.p.x;
      const dy = e.clientY - pan.current.p.y;
      moved.current = Math.max(moved.current, Math.hypot(dx, dy));
      setView({ ...pan.current.v, x: pan.current.v.x + dx, y: pan.current.v.y + dy });
    }
  }

  function onPointerEnd(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    const isTap = e.type === "pointerup" && pointers.current.size === 1 && moved.current < 8;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      // one finger left after a pinch: keep panning from where it is
      const [p] = [...pointers.current.values()];
      pan.current = { p, v: viewRef.current };
    } else if (pointers.current.size === 0) {
      pan.current = null;
      setDragging(false);
    }
    if (isTap) onTap(e.clientX, e.clientY);
  }

  // double-tap / double-click: zoom in on the point, or back to fit
  function onTap(x: number, y: number) {
    const now = performance.now();
    const last = tap.current;
    if (last && now - last.t < 300 && Math.hypot(x - last.p.x, y - last.p.y) < 30) {
      tap.current = null;
      if (viewRef.current.scale > 1.25) reset();
      else zoomAt(2.5 / viewRef.current.scale, { x, y });
    } else {
      tap.current = { t: now, p: { x, y } };
    }
  }

  const btn =
    "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white active:bg-white/15 sm:h-8 sm:w-8";
  const hint = !zoomable
    ? null
    : touch
      ? portrait
        ? "Pinch to zoom · or rotate"
        : "Pinch to zoom · drag to pan"
      : "Scroll to zoom · drag to pan";

  return (
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-x-0 top-0 z-[80] flex h-screen flex-col bg-slate-950 outline-none sm:bg-black/70 sm:p-6 sm:backdrop-blur-sm"
      style={{ height: "100dvh" }}
      onClick={requestClose}
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950 sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-1 border-b border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="mr-auto min-w-0">
            <div className="truncate text-sm font-semibold text-white">{title}</div>
            {hint && <div className="truncate text-[11px] text-slate-400">{hint}</div>}
          </div>
          {zoomable && (
            <>
              <button className={btn} title="Zoom out (−)" aria-label="Zoom out" onClick={() => zoomAt(0.8)}>
                <ZoomOut size={18} />
              </button>
              <button
                className="min-w-[3.25rem] rounded-md px-1.5 py-2 text-xs font-medium tabular-nums text-slate-300 hover:bg-white/10"
                title="Fit to screen (0)"
                onClick={reset}
              >
                {Math.round(view.scale * 100)}%
              </button>
              <button className={btn} title="Zoom in (+)" aria-label="Zoom in" onClick={() => zoomAt(1.25)}>
                <ZoomIn size={18} />
              </button>
              <button className={`${btn} hidden sm:grid`} title="Fit to screen (0)" aria-label="Fit to screen" onClick={reset}>
                <Maximize2 size={16} />
              </button>
              <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
            </>
          )}
          <button className={btn} title="Close (Esc)" aria-label="Close" onClick={requestClose}>
            <X size={20} />
          </button>
        </header>

        {zoomable ? (
          <div
            ref={stage}
            className={`relative min-h-0 flex-1 select-none overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ touchAction: "none", overscrollBehavior: "contain" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            <div
              className="lightbox-fit absolute inset-0 p-3 sm:p-8"
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "center",
                willChange: "transform",
              }}
            >
              {children}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1">{children}</div>
        )}
      </div>
    </div>
  );
}