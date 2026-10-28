// Sketch boards: one Excalidraw canvas assembled from several parts. The body of an ```excalidraw
// fence can hold nested fences, each one a part:
//
//   ````excalidraw
//   layout: grid 2
//
//   ```mermaid title="Create path"      Mermaid, converted to hand-drawn shapes
//   ```skeleton title="Key space"       a JSON list of plain shapes and arrows
//   ```scene title="My drawing"         an exported .excalidraw scene
//
//   link: Create path -> Key space "code"
//   ````
//
// Every part is converted on its own (and cached by source, so an edit reconverts only the part
// that changed), placed on a titled card by a simple layout, and merged into ONE scene. After that
// it is an ordinary scene, so in-place updates and the full-screen viewer work unchanged.

type Mod = typeof import("@excalidraw/excalidraw");
// Excalidraw elements and skeletons are deeply structural; this module only moves, renames and groups them
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = any;
type Files = Record<string, unknown> | null;

export type PartKind = "mermaid" | "skeleton" | "scene" | "unknown";
export type Part = { kind: PartKind; body: string; title: string; id: string; at?: [number, number]; rawKind: string };
export type Board = {
  layout: "row" | "column" | "grid";
  cols: number;
  gap: number;
  parts: Part[];
  links: { from: string; to: string; label?: string }[];
};
export type Built = { elements: El[]; files: Files; appState: object; aspect: number };
export type BoardIo = {
  /** Mermaid source -> Excalidraw elements (the caller owns the shared mermaid instance) */
  mermaid: (source: string) => Promise<{ elements: El[]; files: Files }>;
  /** identifies this board, so a part that stops converting can fall back to its last good drawing */
  memo: string;
};

const KINDS: Record<string, PartKind> = { mermaid: "mermaid", skeleton: "skeleton", shapes: "skeleton", scene: "scene", excalidraw: "scene" };
const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A board has nested fences; anything else is a single Mermaid diagram. */
export function parseBoard(source: string): Board | null {
  if (!/^\s*(`{3,}|~{3,})/m.test(source)) return null;
  const board: Board = { layout: "grid", cols: 2, gap: 70, parts: [], links: [] };
  let open: { fence: string; kind: string; attrs: string; body: string[] } | null = null;

  const finish = (o: NonNullable<typeof open>) => {
    const attrs: Record<string, string> = {};
    for (const m of o.attrs.matchAll(/([A-Za-z]+)=(?:"([^"]*)"|(\S+))/g)) attrs[m[1].toLowerCase()] = m[2] ?? m[3];
    const n = board.parts.length + 1;
    const title = attrs.title ?? "";
    const at = attrs.at?.split(",").map(Number);
    board.parts.push({
      kind: KINDS[o.kind] ?? "unknown",
      rawKind: o.kind,
      body: o.body.join("\n"),
      title,
      id: attrs.id ?? (slug(title) || `part-${n}`),
      at: at && at.length === 2 && at.every(Number.isFinite) ? [at[0], at[1]] : undefined,
    });
  };

  for (const line of source.split(/\r?\n/)) {
    const t = line.trim();
    if (open) {
      const closes = t.length >= open.fence.length && t[0] === open.fence[0] && t === t[0].repeat(t.length);
      if (closes) {
        finish(open);
        open = null;
      } else open.body.push(line);
      continue;
    }
    const f = /^(`{3,}|~{3,})\s*([A-Za-z]*)\s*(.*)$/.exec(t);
    if (f) {
      open = { fence: f[1], kind: f[2].toLowerCase(), attrs: f[3], body: [] };
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^layout:\s*(row|column|grid)(?:\s+(\d+))?/i.exec(t))) {
      board.layout = m[1].toLowerCase() as Board["layout"];
      if (m[2]) board.cols = Math.max(1, Number(m[2]));
    } else if ((m = /^columns?:\s*(\d+)/i.exec(t))) board.cols = Math.max(1, Number(m[1]));
    else if ((m = /^gap:\s*(\d+)/i.exec(t))) board.gap = Number(m[1]);
    else if ((m = /^link:\s*(.+?)\s*->\s*(.+?)(?:\s+"([^"]*)")?\s*$/i.exec(t))) board.links.push({ from: m[1], to: m[2], label: m[3] });
  }
  if (open) finish(open); // an unclosed last fence still counts
  return board.parts.length ? board : null;
}

type Drawn = { elements: El[]; files: Files; w: number; h: number };
const converted = new Map<string, Drawn>(); // part source -> its drawing, in local coordinates
const lastGood = new Map<string, Drawn>(); // board + part slot -> the last drawing that converted
const remember = (m: Map<string, Drawn>, k: string, v: Drawn) => {
  m.delete(k);
  m.set(k, v);
  if (m.size > 200) m.delete(m.keys().next().value as string);
};

async function drawPart(mod: Mod, part: Part, io: BoardIo): Promise<Drawn> {
  const key = `${part.kind}\0${part.body}`;
  const hit = converted.get(key);
  if (hit) return hit;
  if (part.kind === "unknown") throw new Error(`unknown part type "${part.rawKind || "(none)"}" (use mermaid, skeleton or scene)`);

  let elements: El[];
  let files: Files = null;
  if (part.kind === "mermaid") ({ elements, files } = await io.mermaid(part.body));
  else {
    const data = JSON.parse(part.body);
    if (part.kind === "skeleton") elements = mod.convertToExcalidrawElements(Array.isArray(data) ? data : (data.elements ?? []), { regenerateIds: false });
    else {
      elements = mod.restoreElements(data.elements ?? [], null);
      files = data.files ?? null;
    }
  }
  elements = elements.filter((e) => !e.isDeleted);
  if (!elements.length) throw new Error("nothing to draw");
  const [x1, y1, x2, y2] = mod.getCommonBounds(elements);
  const drawn: Drawn = { elements: elements.map((e) => ({ ...e, x: e.x - x1, y: e.y - y1 })), files, w: x2 - x1, h: y2 - y1 };
  remember(converted, key, drawn);
  return drawn;
}

// a copy of a part's elements, moved to (dx, dy) and with ids made unique to this slot (so one
// source can appear twice, and ids stay stable from one edit to the next)
function place(d: Drawn, dx: number, dy: number, prefix: string): El[] {
  const p = (id: string | null | undefined) => (id == null ? id : prefix + id);
  return d.elements.map((e) => ({
    ...e,
    id: p(e.id),
    x: e.x + dx,
    y: e.y + dy,
    containerId: p(e.containerId),
    frameId: p(e.frameId),
    groupIds: (e.groupIds ?? []).map((g: string) => prefix + g),
    boundElements: e.boundElements ? e.boundElements.map((b: El) => ({ ...b, id: prefix + b.id })) : e.boundElements,
    startBinding: e.startBinding ? { ...e.startBinding, elementId: prefix + e.startBinding.elementId } : e.startBinding,
    endBinding: e.endBinding ? { ...e.endBinding, elementId: prefix + e.endBinding.elementId } : e.endBinding,
  }));
}

const PAD = 28;
const TITLE_H = 36;
const WARN_H = 30;
const COLORS = { ok: "#868e96", stale: "#f08c00", failed: "#e03131" };

type Card = { part: Part; drawn: Drawn; w: number; h: number; title: number; warn?: string; state: keyof typeof COLORS };

function flow(cards: Card[], board: Board): { x: number; y: number }[] {
  const pos = cards.map(() => ({ x: 0, y: 0 }));
  const auto = cards.map((c, i) => i).filter((i) => !cards[i].part.at);
  if (board.layout === "row") {
    let x = 0;
    for (const i of auto) (pos[i] = { x, y: 0 }), (x += cards[i].w + board.gap);
  } else if (board.layout === "column") {
    let y = 0;
    for (const i of auto) (pos[i] = { x: 0, y }), (y += cards[i].h + board.gap);
  } else {
    // N cards per row, packed left to right; each row is as tall as its tallest card. (Aligned columns
    // would let one wide card push everything below it far apart.)
    let x = 0;
    let y = 0;
    let rowH = 0;
    let inRow = 0;
    for (const i of auto) {
      if (inRow === board.cols) {
        x = 0;
        y += rowH + board.gap;
        rowH = 0;
        inRow = 0;
      }
      pos[i] = { x, y };
      x += cards[i].w + board.gap;
      rowH = Math.max(rowH, cards[i].h);
      inRow++;
    }
  }  cards.forEach((c, i) => c.part.at && (pos[i] = { x: c.part.at[0], y: c.part.at[1] }));
  return pos;
}

export async function buildBoard(mod: Mod, board: Board, io: BoardIo): Promise<Built> {
  const cards: Card[] = [];
  for (const [i, part] of board.parts.entries()) {
    const slot = `${io.memo}|${part.id}|${i}`;
    let drawn: Drawn;
    let state: Card["state"] = "ok";
    let warn: string | undefined;
    try {
      drawn = await drawPart(mod, part, io);
      remember(lastGood, slot, drawn);
    } catch (e) {
      // mermaid's message is several lines: the first says where, a later "Expecting ..." says what
      const [where, ...rest] = String((e as Error)?.message ?? e).split("\n");
      const said = [where, rest.find((l) => /^(Expecting|Got)/.test(l))].filter(Boolean).join(" ");
      const msg = said.length > 110 ? `${said.slice(0, 109)}…` : said;
      const prev = lastGood.get(slot);
      // a broken part keeps its last good drawing, or a placeholder; the rest of the board is unaffected
      drawn = prev ?? { elements: [], files: null, w: 420, h: 40 };
      state = prev ? "stale" : "failed";
      warn = `${prev ? "showing the last working version" : "can't draw this part"}: ${msg}`;
      console.error(`[notebook] sketch part "${part.title || part.id}" failed`, e);
    }
    const title = part.title ? TITLE_H : 0;
    cards.push({ part, drawn, state, warn, title, w: Math.max(drawn.w, 260) + PAD * 2, h: drawn.h + PAD * 2 + title + (warn ? WARN_H : 0) });
  }

  const pos = flow(cards, board);
  const shells: El[] = [];
  const content: El[] = [];
  let files: Record<string, unknown> | null = null;
  cards.forEach((c, i) => {
    const { x, y } = pos[i];
    const color = COLORS[c.state];
    shells.push(
      { type: "rectangle", id: `card-${i}`, x, y, width: c.w, height: c.h, strokeColor: color, strokeStyle: "dashed", strokeWidth: 1, backgroundColor: "transparent", roundness: { type: 3 } },
      ...(c.part.title ? [{ type: "text", id: `title-${i}`, x: x + PAD, y: y + 14, text: c.part.title, fontSize: 22, strokeColor: "#495057" }] : []),
      ...(c.warn ? [{ type: "text", id: `warn-${i}`, x: x + PAD, y: y + c.h - WARN_H - 4, text: `⚠ ${c.warn}`, fontSize: 14, strokeColor: color }] : [])
    );
    content.push(...place(c.drawn, x + PAD + (c.w - PAD * 2 - c.drawn.w) / 2, y + PAD + c.title, `b${i}:`));
    if (c.drawn.files) files = { ...(files ?? {}), ...c.drawn.files };
  });

  // arrows between whole cards, from the sides that face each other
  const find = (name: string) => {
    const n = name.trim().toLowerCase();
    return cards.findIndex((c) => c.part.id.toLowerCase() === n || c.part.title.trim().toLowerCase() === n);
  };
  const arrows: El[] = [];
  board.links.forEach((l, k) => {
    const [ia, ib] = [find(l.from), find(l.to)];
    if (ia < 0 || ib < 0) return;
    const a = { ...pos[ia], w: cards[ia].w, h: cards[ia].h };
    const b = { ...pos[ib], w: cards[ib].w, h: cards[ib].h };
    const [ax, ay, bx, by] = [a.x + a.w / 2, a.y + a.h / 2, b.x + b.w / 2, b.y + b.h / 2];
    const horizontal = Math.abs(bx - ax) / (a.w + b.w) > Math.abs(by - ay) / (a.h + b.h);
    const start = horizontal ? { x: bx > ax ? a.x + a.w : a.x, y: ay } : { x: ax, y: by > ay ? a.y + a.h : a.y };
    const end = horizontal ? { x: bx > ax ? b.x : b.x + b.w, y: by } : { x: bx, y: by > ay ? b.y : b.y + b.h };
    arrows.push({
      type: "arrow", id: `link-${k}`, x: start.x, y: start.y, points: [[0, 0], [end.x - start.x, end.y - start.y]],
      strokeWidth: 2, strokeColor: "#1971c2", endArrowhead: "arrow",
      ...(l.label ? { label: { text: l.label, fontSize: 18, strokeColor: "#1971c2" } } : {}),
    });
  });

  const elements = [...mod.convertToExcalidrawElements([...shells, ...arrows], { regenerateIds: false }), ...content];
  // cards sit behind everything, arrows above the cards but below nothing that matters
  elements.sort((p, q) => Number(q.id.startsWith("card-")) - Number(p.id.startsWith("card-")));
  const [x1, y1, x2, y2] = mod.getCommonBounds(elements);
  return { elements, files, appState: {}, aspect: (y2 - y1) / Math.max(1, x2 - x1) };
}