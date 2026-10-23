// Build-time notes loader — reads content/notes/**.md from disk (Node fs) and
// renders markdown to HTML. SERVER-ONLY: import this only from server components
// (the /notebook pages). Never from a "use client" file.
//
// Rendering pipeline per note (see renderMarkdown):
//   1. KaTeX math ($inline$ / $$block$$) extracted + rendered synchronously,
//      swapped for plain placeholders so marked doesn't mangle the LaTeX.
//   2. marked.parse() with GFM, with custom renderers for:
//        - ```mermaid fences -> <pre class="mermaid"> (drawn client-side)
//        - ```excalidraw fences -> <div class="md-excalidraw"> (scene JSON,
//          mounted read-only client-side)
//        - other fenced code -> placeholder, highlighted via Shiki after parse
//        - > [!NOTE]/[!TIP]/[!WARNING]/[!IMPORTANT]/[!CAUTION] -> alert callouts
//   3. Shiki placeholders resolved (async, dual light/dark theme).
//   4. Math placeholders substituted back in.

import fs from "node:fs";
import path from "node:path";
import { Marked, TextRenderer, type Tokens } from "marked";
import katex from "katex";
import { codeToHtml } from "shiki";

const ROOT = path.join(process.cwd(), "content", "notes");

const ALERT_TYPES = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const;
const ALERT_ICON: Record<(typeof ALERT_TYPES)[number], string> = {
  NOTE: "ℹ️",
  TIP: "💡",
  IMPORTANT: "📌",
  WARNING: "⚠️",
  CAUTION: "🛑",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/* ------------------------------- math (KaTeX) ------------------------------ */
// Extracted BEFORE marked sees the text (LaTeX's _, *, { } would otherwise be
// read as markdown syntax), substituted back in AFTER marked + Shiki run.

// Fenced blocks (``` or ~~~, closing fence at least as long as the opening, so a
// ````markdown block can contain ``` lines) and inline `code` spans. Math must never be
// extracted from these: Spring's `${key:default}` would otherwise open a "$…$" span that
// runs to the next `$` and swallows the rest of the fence.
const CODE_RE = /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2[`~]*(?=\n|$)|``[^`]+``|`[^`\n]+`/g;

function outsideCode(raw: string, fn: (segment: string) => string): string {
  let out = "";
  let last = 0;
  for (const m of raw.matchAll(CODE_RE)) {
    out += fn(raw.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + fn(raw.slice(last));
}

function extractMath(raw: string): { text: string; restore: (html: string) => string } {
  const nonce = Math.random().toString(36).slice(2, 8);
  const slots: string[] = [];
  const stash = (expr: string, displayMode: boolean) => {
    const i = slots.length;
    slots.push(
      katex.renderToString(expr, { throwOnError: false, displayMode, output: "html" })
    );
    return `@@MATH${nonce}${i}@@`;
  };

  const text = outsideCode(raw, (s) =>
    s
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => stash(expr, true))
      // inline: $...$ with non-space immediately inside both delimiters, so
      // "$5 and $10" (plain currency) is never mistaken for math.
      .replace(/\$([^\s$](?:[^$]*[^\s$])?)\$/g, (_, expr) => stash(expr, false))
  );

  return {
    text,
    restore: (html) => html.replace(new RegExp(`@@MATH${nonce}(\\d+)@@`, "g"), (_, i) => slots[Number(i)]),
  };
}

/* ----------------------------- markdown -> HTML ----------------------------- */

export type Heading = { depth: number; text: string; slug: string };

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "section"
  );
}

function buildRenderer() {
  const pending: { lang: string; code: string }[] = [];
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();

  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      heading(token: Tokens.Heading) {
        // plain text (no `code`/**bold** markers) for the slug and the TOC label
        const plain = unescapeHtml(this.parser.parseInline(token.tokens, new TextRenderer())).trim();
        let slug = slugify(plain);
        const n = slugCounts.get(slug) ?? 0;
        slugCounts.set(slug, n + 1);
        if (n > 0) slug = `${slug}-${n}`;
        // only section-level headings are worth a table-of-contents entry
        if (token.depth === 2 || token.depth === 3) headings.push({ depth: token.depth, text: plain, slug });
        const body = this.parser.parseInline(token.tokens);
        const anchor = token.depth > 1 ? `<a class="md-anchor" href="#${slug}" aria-label="Link to this section">#</a>` : "";
        return `<h${token.depth} id="${slug}">${body}${anchor}</h${token.depth}>\n`;
      },
      code(token: { lang?: string; text: string }) {
        const lang = (token.lang || "").trim().toLowerCase();
        if (lang === "mermaid") {
          // escaped: mermaid reads textContent, and raw `<` (List<String>) would otherwise become markup
          return `<figure class="md-diagram"><pre class="mermaid">${escapeHtml(token.text)}</pre></figure>`;
        }
        if (lang === "excalidraw") {
          // token.text is a raw .excalidraw scene (JSON exported from
          // excalidraw.com) — base64 so it survives as an HTML attribute
          // untouched, decoded + mounted client-side in NotebookContent.
          const scene = Buffer.from(token.text, "utf8").toString("base64");
          // the wrap is a plain sibling container NotebookContent can safely
          // append an "expand" button to — Excalidraw's own React root owns
          // every child of .md-excalidraw once mounted, so nothing else can
          // live inside it without risking being wiped on re-render.
          return `<div class="md-excalidraw-wrap"><div class="md-excalidraw" data-scene="${scene}"></div></div>`;
        }
        const i = pending.length;
        pending.push({ lang, code: token.text });
        return `<!--SHIKI${i}-->`;
      },
      blockquote(token: { text: string; tokens: unknown[] }) {
        const m = token.text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
        if (m) {
          const kind = m[1].toUpperCase() as (typeof ALERT_TYPES)[number];
          const rest = token.text.slice(m[0].length);
          const body = marked.parse(rest) as string;
          return `<div class="md-alert md-alert-${kind.toLowerCase()}"><p class="md-alert-title">${ALERT_ICON[kind]} ${kind}</p>${body}</div>`;
        }
        return false; // fall back to the default blockquote renderer
      },
    },
  });

  return { marked, pending, headings };
}

async function highlightPending(html: string, pending: { lang: string; code: string }[]): Promise<string> {
  if (pending.length === 0) return html;
  const rendered = await Promise.all(
    pending.map(async ({ lang, code }) => {
      // single dark theme always — code blocks stay dark in both site themes
      // (matches the pre-existing design, see globals.css)
      try {
        return await codeToHtml(code, { lang: lang || "text", theme: "github-dark" });
      } catch {
        // unknown language, or a lang shiki doesn't ship a grammar for
        try {
          return await codeToHtml(code, { lang: "text", theme: "github-dark" });
        } catch {
          return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }
      }
    })
  );
  let i = 0;
  return html.replace(/<!--SHIKI(\d+)-->/g, () => {
    const { lang } = pending[i];
    const label = escapeHtml(LANG_LABEL[lang] ?? lang ?? "");
    // header bar gets a copy button client-side (NotebookContent)
    return `<figure class="md-code"><figcaption><span>${label || "text"}</span></figcaption>${rendered[i++]}</figure>`;
  });
}

const LANG_LABEL: Record<string, string> = {
  ts: "TypeScript", typescript: "TypeScript", js: "JavaScript", javascript: "JavaScript",
  java: "Java", kotlin: "Kotlin", py: "Python", python: "Python", sql: "SQL",
  bash: "Shell", sh: "Shell", shell: "Shell", yaml: "YAML", yml: "YAML", json: "JSON",
  xml: "XML", html: "HTML", css: "CSS", go: "Go", rust: "Rust", properties: "Properties",
  dockerfile: "Dockerfile", http: "HTTP", text: "Text",
};

export async function renderMarkdown(raw: string): Promise<{ html: string; headings: Heading[] }> {
  const math = extractMath(raw);
  const { marked, pending, headings } = buildRenderer();
  let html = marked.parse(math.text) as string;
  // scroll wrapper, so the table itself can stay display:table (full-width rows)
  html = html.replace(/<table>/g, '<div class="md-table"><table>').replace(/<\/table>/g, "</table></div>");
  html = await highlightPending(html, pending);
  html = math.restore(html);
  return { html, headings };
}

/* ------------------------------- notes tree ------------------------------- */

export type NoteNode =
  | { type: "note"; name: string; title: string; slug: string[] }
  | { type: "folder"; name: string; title: string; slug: string[]; children: NoteNode[] };

function humanize(name: string) {
  return name
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromFile(file: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^\s*#\s+(.+?)\s*$/m);
    if (m) return m[1].trim();
  } catch {
    /* ignore */
  }
  return fallback;
}

function readDir(dir: string, base: string[]): NoteNode[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders: NoteNode[] = [];
  const notes: NoteNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) {
      const slug = [...base, e.name];
      const children = readDir(path.join(dir, e.name), slug);
      folders.push({ type: "folder", name: e.name, title: humanize(e.name), slug, children });
    } else if (e.name.toLowerCase().endsWith(".md")) {
      const nameNoExt = e.name.replace(/\.md$/i, "");
      const slug = [...base, nameNoExt];
      notes.push({ type: "note", name: nameNoExt, title: titleFromFile(path.join(dir, e.name), humanize(e.name)), slug });
    }
  }
  const byTitle = (a: NoteNode, b: NoteNode) => a.title.localeCompare(b.title);
  return [...folders.sort(byTitle), ...notes.sort(byTitle)];
}

export function getNotesTree(): NoteNode[] {
  return readDir(ROOT, []);
}

export function getAllNoteSlugs(): string[][] {
  const out: string[][] = [];
  const walk = (nodes: NoteNode[]) => {
    for (const n of nodes) {
      if (n.type === "note") out.push(n.slug);
      else walk(n.children);
    }
  };
  walk(getNotesTree());
  return out;
}

export type NoteLink = { title: string; slug: string[] };

export type LoadedNote = {
  title: string;
  html: string; // body only — the leading `# Title` is rendered by the page header instead
  headings: Heading[];
  raw: string;
  slug: string[];
  readingMinutes: number;
  updatedAt: number; // file mtime, ms
  breadcrumb: string[]; // folder titles from the root down
  prev: NoteLink | null;
  next: NoteLink | null;
};

// notes in sidebar order, plus folder titles keyed by slug path
function flatten(nodes: NoteNode[], notes: NoteLink[] = [], folders = new Map<string, string>()) {
  for (const n of nodes) {
    if (n.type === "note") notes.push({ title: n.title, slug: n.slug });
    else {
      folders.set(n.slug.join("/"), n.title);
      flatten(n.children, notes, folders);
    }
  }
  return { notes, folders };
}

export async function getNote(slug: string[]): Promise<LoadedNote | null> {
  const safe = slug.map((s) => s.replace(/[^a-zA-Z0-9-_]/g, ""));
  const file = path.join(ROOT, ...safe) + ".md";
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const rendered = await renderMarkdown(raw);
  const title = titleFromFile(file, humanize(safe[safe.length - 1] || "Note"));
  const html = rendered.html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, "");

  const words = stripMarkdown(raw, Infinity).split(" ").filter(Boolean).length;
  const { notes, folders } = flatten(getNotesTree());
  const idx = notes.findIndex((n) => n.slug.join("/") === safe.join("/"));
  const breadcrumb = safe.slice(0, -1).map((_, i) => folders.get(safe.slice(0, i + 1).join("/")) ?? humanize(safe[i]));

  return {
    title,
    html,
    headings: rendered.headings,
    raw,
    slug,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    updatedAt: fs.statSync(file).mtimeMs,
    breadcrumb,
    prev: idx > 0 ? notes[idx - 1] : null,
    next: idx >= 0 && idx < notes.length - 1 ? notes[idx + 1] : null,
  };
}

export function countNotes(): number {
  return getAllNoteSlugs().length;
}

export type NoteSearchEntry = { title: string; slug: string[]; text: string };

// Plain-text body for the command palette's content search — strips markdown
// syntax so the client can substring-match without pulling in a parser.
function stripMarkdown(raw: string, max = 4000): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function getSearchIndex(): Promise<NoteSearchEntry[]> {
  return Promise.all(
    getAllNoteSlugs().map(async (slug) => {
      const file = path.join(ROOT, ...slug) + ".md";
      const raw = fs.readFileSync(file, "utf8");
      const title = titleFromFile(file, humanize(slug[slug.length - 1] || "Note"));
      return { title, slug, text: stripMarkdown(raw) };
    })
  );
}
