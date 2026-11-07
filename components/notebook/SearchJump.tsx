"use client";

import { useEffect } from "react";

// Global search (Ctrl+K) opens a note as `/notebook/<note>?q=<term>#<section>`. This scrolls the
// page to the first match inside that section and highlights every match there, so you land on the
// result and not just at the top of the note.
//
// Highlighting uses the CSS Custom Highlight API (`::highlight(search-hit)` in globals.css), which
// never touches the note's DOM, so live updates and diagrams keep working. It runs when the page
// mounts with ?q= in the URL, and again when the palette fires `note-search-jump` for the note you
// are already on. The highlight clears on your next click or Escape.

const NAME = "search-hit";

type Highlights = { set(name: string, value: unknown): void; delete(name: string): void };
const registry = (): Highlights | undefined =>
  typeof CSS !== "undefined" ? (CSS as unknown as { highlights?: Highlights }).highlights : undefined;

// the heading plus everything up to the next heading; no hash means the whole article
function sectionRoots(hash: string): Element[] {
  if (hash) {
    const h = document.getElementById(hash);
    if (!h) return []; // not rendered yet (page still loading): try again on the next tick
    const roots: Element[] = [h];
    for (let el = h.nextElementSibling; el && !/^H[1-6]$/.test(el.tagName); el = el.nextElementSibling) roots.push(el);
    return roots;
  }
  const a = document.querySelector("article");
  return a ? [a] : [];
}

function textNodes(roots: Element[]): Text[] {
  const out: Text[] = [];
  for (const r of roots) {
    const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement?.closest("svg, script, style, button, .md-anchor") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
  }
  return out;
}

// Whitespace-insensitive, case-insensitive search across text nodes: highlighted code is split into
// many <span>s and table cells have no spaces between them, so a per-node search would miss matches.
function findRanges(nodes: Text[], q: string, limit: number): Range[] {
  const chars: string[] = [];
  const where: { node: Text; offset: number }[] = [];
  for (const node of nodes) {
    const d = node.data;
    for (let i = 0; i < d.length; i++) {
      const c = d[i];
      if (/\s/.test(c)) continue;
      const lc = c.toLowerCase();
      chars.push(lc.length === 1 ? lc : c); // keep a 1:1 map between `chars` and `where`
      where.push({ node, offset: i });
    }
  }
  const hay = chars.join("");
  const needle = q.toLowerCase().replace(/\s+/g, "");
  const out: Range[] = [];
  if (!needle) return out;
  for (let at = hay.indexOf(needle); at !== -1 && out.length < limit; at = hay.indexOf(needle, at + needle.length)) {
    const a = where[at];
    const b = where[at + needle.length - 1];
    const r = document.createRange();
    r.setStart(a.node, a.offset);
    r.setEnd(b.node, b.offset + 1);
    out.push(r);
  }
  return out;
}

function jump(q: string, hash: string): () => void {
  let moved = false; // the reader scrolled or clicked: stop repositioning
  const timers: number[] = [];

  const clear = () => registry()?.delete(NAME);

  const apply = () => {
    const roots = sectionRoots(hash);
    if (!roots.length) return;
    const ranges = findRanges(textNodes(roots), q, 200);
    const Highlight = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
    if (Highlight && ranges.length) registry()?.set(NAME, new Highlight(...ranges));
    if (moved) return;
    const box = ranges[0]?.getBoundingClientRect() ?? roots[0].getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + box.top - window.innerHeight * 0.3 });
  };

  const onMove = () => {
    moved = true;
  };
  const onClear = (e: Event) => {
    if (e.type === "keydown" && (e as KeyboardEvent).key !== "Escape") return onMove();
    onMove();
    clear();
  };
  const listen = (on: boolean) => {
    const fn = on ? window.addEventListener.bind(window) : window.removeEventListener.bind(window);
    fn("wheel", onMove, { passive: true });
    fn("touchstart", onMove, { passive: true });
    fn("keydown", onClear);
    fn("pointerdown", onClear);
  };
  listen(true);

  // Diagrams and sketches draw after the text and push it down, so re-apply for a few seconds.
  [0, 150, 600, 1500, 3000].forEach((ms) => timers.push(window.setTimeout(apply, ms)));

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    listen(false);
    clear();
  };
}

// keep ?q= out of the address bar and out of the saved "resume where you left off" route
function stripQuery() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("q")) return;
  params.delete("q");
  const rest = params.toString();
  window.history.replaceState(window.history.state, "", window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash);
}

export function SearchJump() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    const run = (q: string, hash: string) => {
      stop?.();
      stop = jump(q, hash);
    };

    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      run(q, decodeURIComponent(window.location.hash.slice(1)));
      stripQuery();
    }

    // same note as the one open: the palette cannot remount the page, so it tells us to jump
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<{ q: string; hash: string; path: string }>).detail;
      if (d?.q && d.path === window.location.pathname) {
        run(d.q, d.hash);
        stripQuery();
      }
    };
    window.addEventListener("note-search-jump", onEvent);
    return () => {
      window.removeEventListener("note-search-jump", onEvent);
      stop?.();
    };
  }, []);

  return null;
}
