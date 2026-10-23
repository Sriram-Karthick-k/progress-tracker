"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const MIN = 0.25;
const MAX = 6;
const clamp = (s: number) => Math.min(MAX, Math.max(MIN, s));

// Full-screen panel for a clicked diagram. `zoomable` = our own pan/zoom over a
// static SVG (Mermaid), which starts fitted to the panel. Excalidraw has native
// pan/zoom, so it's rendered unwrapped and just gets the space.
export function DiagramLightbox({
  onClose,
  zoomable,
  title = "Diagram",
  children,
}: {
  onClose: () => void;
  zoomable?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const scale = clamp(v.scale * factor);
      const r = stage.current?.getBoundingClientRect();
      if (!r || cx === undefined || cy === undefined) return { ...v, scale };
      // keep the point under the cursor fixed while zooming
      const px = cx - r.left - r.width / 2;
      const py = cy - r.top - r.height / 2;
      const k = scale / v.scale;
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);
  const reset = useCallback(() => setView({ scale: 1, x: 0, y: 0 }), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (!zoomable) return;
      if (e.key === "+" || e.key === "=") zoomBy(1.25);
      if (e.key === "-") zoomBy(0.8);
      if (e.key === "0") reset();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, zoomable, zoomBy, reset]);

  // wheel must be a non-passive native listener to be able to preventDefault
  useEffect(() => {
    const el = stage.current;
    if (!el || !zoomable) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomable, zoomBy]);

  const btn =
    "grid h-8 w-8 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white";

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-1 border-b border-white/10 px-4 py-2">
          <span className="mr-auto text-sm font-semibold text-white">{title}</span>
          {zoomable && (
            <>
              <span className="mr-2 hidden text-xs text-slate-400 sm:inline">Scroll to zoom · drag to pan</span>
              <button className={btn} title="Zoom out (−)" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>
                <ZoomOut size={16} />
              </button>
              <button
                className="min-w-[3.5rem] rounded-md px-2 py-1 text-xs font-medium tabular-nums text-slate-300 hover:bg-white/10"
                title="Fit to screen (0)"
                onClick={reset}
              >
                {Math.round(view.scale * 100)}%
              </button>
              <button className={btn} title="Zoom in (+)" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
                <ZoomIn size={16} />
              </button>
              <button className={btn} title="Fit to screen (0)" aria-label="Fit to screen" onClick={reset}>
                <Maximize2 size={15} />
              </button>
              <span className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}
          <button className={btn} title="Close (Esc)" aria-label="Close" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        {zoomable ? (
          <div
            ref={stage}
            className={`relative min-h-0 flex-1 overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
              setDragging(true);
              (e.target as Element).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d) setView((v) => ({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }));
            }}
            onPointerUp={() => {
              drag.current = null;
              setDragging(false);
            }}
            onDoubleClick={(e) => zoomBy(1.6, e.clientX, e.clientY)}
          >
            <div
              className="lightbox-fit absolute inset-0 p-8"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: "center" }}
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
