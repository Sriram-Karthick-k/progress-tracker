"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/notes";

// Sticky "On this page" rail: highlights the section you're reading and shows
// how far through the note you are.
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.slug ?? null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (headings.length < 2) return;
    function onScroll() {
      // active = last heading whose top has scrolled past ~a quarter of the viewport
      const line = window.innerHeight * 0.25;
      let current = headings[0].slug;
      for (const h of headings) {
        const el = document.getElementById(h.slug);
        if (el && el.getBoundingClientRect().top <= line) current = h.slug;
      }
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 1);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <aside className="hidden w-60 shrink-0 xl:block">
      <nav aria-label="On this page" className="sticky top-8">
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          On this page
          <span className="tabular-nums normal-case tracking-normal">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mb-3 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-indigo-400 transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
        </div>
        <ul className="space-y-0.5 border-l border-white/10 text-[13px]">
          {headings.map((h) => {
            const on = h.slug === active;
            return (
              <li key={h.slug}>
                <a
                  href={`#${h.slug}`}
                  aria-current={on ? "location" : undefined}
                  className={`-ml-px block truncate border-l py-1 transition ${h.depth === 3 ? "pl-6" : "pl-3"} ${
                    on ? "border-indigo-400 font-medium text-white" : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
