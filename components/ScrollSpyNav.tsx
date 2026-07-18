"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

// A sticky right-hand table of contents that highlights the section currently in
// view (scrollspy) and smooth-scrolls on click. Rebuilds itself when `items`
// changes (e.g. switching cheat-sheet tabs), keyed on the joined id list.
export function ScrollSpyNav({
  items,
  heading = "On this page",
}: {
  items: TocItem[];
  heading?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    if (!items.length) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        // highlight the first item (in document order) that is currently on screen
        const first = items.find((i) => visible.get(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!items.length) return null;

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-52 shrink-0 self-start overflow-y-auto pb-6 xl:block">
      <div className="mb-2 pl-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">{heading}</div>
      <nav className="border-l border-white/10">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <a
              key={i.id}
              href={`#${i.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActive(i.id);
                history.replaceState(null, "", `#${i.id}`);
              }}
              className={`-ml-px block border-l-2 py-1.5 pl-3 pr-2 text-[13px] leading-snug transition ${
                on
                  ? "border-indigo-400 font-medium text-white"
                  : "border-transparent text-slate-500 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              {i.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
