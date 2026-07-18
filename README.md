# Interview Prep Tracker

A personal interview-prep app: DSA/SQL problem trackers, curated resource hubs,
visual roadmaps, spaced-repetition flashcards, and a file-based **Notebook**
knowledge base. No database, no SQLite — progress lives in `localStorage`, notes
live as markdown files.

## Run it

```bash
npm install
npm run dev            # http://localhost:7373  — one server, one URL
```

That's it. In local dev the in-app Notebook editor is enabled and writes real
`.md` files (via the same-origin `/api/notes` route).

## Editing notes

Editing is controlled by one env flag, `NEXT_PUBLIC_NOTES_EDITABLE`:

- **Local** — `.env.local` sets `NEXT_PUBLIC_NOTES_EDITABLE=1`, so the ✎ Edit /
  New-note UI is on and saves write to `content/notes/**.md`.
- **Remote** — deploy without that flag → the editor is hidden and `/api/notes`
  returns 403. The published site is **read-only**.

You can always just edit the markdown files in `content/notes/` directly.

## Build & deploy

```bash
npm run build
npm run start          # serve the production build on :7373
```

Deploy to **Vercel** (or any Node host) — no SQLite, nothing to provision.
Leave `NEXT_PUBLIC_NOTES_EDITABLE` unset on the remote so it stays read-only.

## How data works

- **Content** (problems, resources, cheatsheets, flashcards) — typed modules in `lib/`.
- **Notes** — markdown under `content/notes/**.md`; folders become the Notebook tree.
- **Progress** (status / confidence / notes / flags) — browser `localStorage`;
  snapshot it to a file anytime with **Export / Import** on the dashboard.

## Scripts

| Script | What |
|--------|------|
| `npm run dev` | dev server (:7373), notes editor enabled |
| `npm run build` | production build |
| `npm run start` | serve the build (:7373) |
| `npm run verify` | data-integrity check on the problem set |
