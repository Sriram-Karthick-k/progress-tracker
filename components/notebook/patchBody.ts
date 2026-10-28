// Block-level patching of rendered note HTML. A note's HTML is a flat list of top-level blocks
// (heading, paragraph, diagram figure, table, quiz card, ...). Instead of replacing the whole
// document when the note changes, diff the old and new block lists and touch only what differs,
// so the diagrams, open quiz cards and scroll position of everything else survive the update.
//
// Each block carries data-sig, a hash of the markup the server sent. Client-side decoration
// (drawn SVG, copy buttons, ...) changes the live DOM, so comparing hashes of the *original*
// markup is the only reliable way to tell "same block" from "edited block".

// cyrb53: a fast 53-bit string hash (collisions are not a practical concern at note scale)
function hash(s: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Stamp server-rendered blocks that have no signature yet. Call before any client-side decoration. */
export function signBlocks(container: HTMLElement) {
  for (const el of Array.from(container.children) as HTMLElement[]) {
    if (!el.dataset.sig) el.dataset.sig = hash(el.outerHTML);
  }
}

// next-index -> prev-index for blocks that survive unchanged (longest common subsequence,
// with the common head/tail peeled off first since most edits touch one spot). "" never matches.
function matchBlocks(a: string[], b: string[]): Map<number, number> {
  const out = new Map<number, number>();
  let head = 0;
  while (head < a.length && head < b.length && a[head] && a[head] === b[head]) {
    out.set(head, head);
    head++;
  }
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] && a[a.length - 1 - tail] === b[b.length - 1 - tail]) {
    out.set(b.length - 1 - tail, a.length - 1 - tail);
    tail++;
  }
  const n = a.length - head - tail;
  const m = b.length - head - tail;
  if (!n || !m) return out;

  const same = (i: number, j: number) => !!a[head + i] && a[head + i] === b[head + j];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) dp[i][j] = same(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (same(i, j)) out.set(head + j++, head + i++);
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return out;
}

// A drawing block (Mermaid diagram or Excalidraw scene) is edited in place rather than replaced
type Kind = "mermaid" | "excalidraw";
const kindOf = (el: Element): Kind | null =>
  el.matches("figure.md-diagram") && el.querySelector("pre.mermaid")
    ? "mermaid"
    : el.matches(".md-excalidraw-wrap") && el.querySelector(".md-excalidraw")
      ? "excalidraw"
      : null;

// hand the new source to an existing block; the caller redraws it
function copySource(from: Element, to: Element, kind: Kind) {
  if (kind === "mermaid") {
    to.querySelector<HTMLElement>("pre.mermaid")!.dataset.src = from.querySelector("pre.mermaid")?.textContent ?? "";
  } else {
    // the source is either a scene or Mermaid text, and an edit may switch from one to the other
    const src = from.querySelector<HTMLElement>(".md-excalidraw")!.dataset;
    const dst = to.querySelector<HTMLElement>(".md-excalidraw")!.dataset;
    for (const key of ["scene", "mermaid"] as const) {
      if (src[key] !== undefined) dst[key] = src[key];
      else delete dst[key];
    }
  }
}

/**
 * Brings `container` in line with `html`, replacing only the blocks that changed.
 * Returns the blocks that changed (in document order) so the caller can highlight or scroll to them.
 *
 * An edited drawing is updated IN PLACE: its existing block stays in the page (keeping its
 * picture, expand button and the full-screen viewer's link to it) and only its source changes;
 * the caller then redraws it and swaps the picture atomically.
 */
export function patchBody(container: HTMLElement, html: string, flash: boolean): HTMLElement[] {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const next = Array.from(tpl.content.children) as HTMLElement[];
  const nextSig = next.map((n) => hash(n.outerHTML));
  const prev = Array.from(container.children) as HTMLElement[];
  const kept = matchBlocks(
    prev.map((p) => p.dataset.sig ?? ""),
    nextSig
  );
  const keptPrev = new Set(kept.values());

  // "gap" = how many surviving blocks come before; removed and added blocks in the same gap sit
  // between the same two survivors, so that's where an edited block's old and new versions meet
  const keptPrevSorted = [...keptPrev].sort((x, y) => x - y);
  const keptNextSorted = [...kept.keys()].sort((x, y) => x - y);
  const gapOfPrev = (i: number) => keptPrevSorted.filter((k) => k < i).length;
  const gapOfNext = (j: number) => keptNextSorted.filter((k) => k < j).length;

  const removed = new Map<string, HTMLElement[]>(); // "kind:gap" -> removed drawing blocks
  const added = new Map<string, number[]>(); // "kind:gap" -> indices of new drawing blocks
  prev.forEach((p, i) => {
    const kind = kindOf(p);
    if (kind && !keptPrev.has(i)) {
      const key = `${kind}:${gapOfPrev(i)}`;
      removed.set(key, [...(removed.get(key) ?? []), p]);
    }
  });
  next.forEach((el, j) => {
    const kind = kindOf(el);
    if (kind && !kept.has(j)) {
      const key = `${kind}:${gapOfNext(j)}`;
      added.set(key, [...(added.get(key) ?? []), j]);
    }
  });
  // only when the gap lost exactly as many drawings as it gained can we tell which is which
  const adoptedBy = new Map<number, HTMLElement>(); // next index -> existing block that takes it over
  for (const [key, js] of added) {
    const olds = removed.get(key);
    if (olds && olds.length === js.length) js.forEach((j, n) => adoptedBy.set(j, olds[n]));
  }
  const adopted = new Set(adoptedBy.values());

  const openCards = new Map<string, boolean>(); // quiz card summary -> was open
  prev.forEach((p, i) => {
    if (keptPrev.has(i) || adopted.has(p)) return;
    if (p.tagName === "DETAILS") openCards.set(p.querySelector("summary")?.textContent ?? "", p.hasAttribute("open"));
    p.remove();
  });

  const fresh: HTMLElement[] = [];
  let before: Node | null = null;
  for (let j = next.length - 1; j >= 0; j--) {
    const survivor = kept.get(j);
    if (survivor !== undefined) {
      before = prev[survivor];
      continue;
    }
    let el = next[j];

    const existing = adoptedBy.get(j);
    if (existing) {
      copySource(el, existing, kindOf(el)!);
      el = existing; // the old block stays; its picture is replaced once the new source is drawn
    } else if (el.tagName === "DETAILS" && openCards.get(el.querySelector("summary")?.textContent ?? "")) {
      el.setAttribute("open", "");
    }
    el.dataset.sig = nextSig[j];

    // already in the right place? then moving it would only reset its scroll and animation state
    if (el.parentNode !== container || el.nextElementSibling !== before) container.insertBefore(el, before);
    before = el;
    fresh.unshift(el);
  }

  if (flash) {
    fresh.forEach((el) => el.classList.add("md-flash"));
    setTimeout(() => fresh.forEach((el) => el.classList.remove("md-flash")), 2400);
  }
  return fresh;
}