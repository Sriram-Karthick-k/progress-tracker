# Interview Prep Tracker

The app from `PLAN.md`, built on the planned stack: **Next.js 14 (App Router) + TypeScript +
Prisma + SQLite + Tailwind + Recharts + lucide-react**. Single user, local-only, no auth.

## Just run it
Double-click **`InterviewPrep.exe`**. It starts the local server and opens your browser at
<http://localhost:7373>. Keep the console window open while you work; closing it stops the
app (the server is tied to the window, so nothing is left running).

> Requires Node.js installed (already on this machine). The exe runs the production build
> in this folder — keep `InterviewPrep.exe` inside the project folder.

## What's inside
- **Dashboard** (`/`) — overall %, per-round progress bars, status donut, LeetCode by
  difficulty, company readiness, and a "needs revisit" list (Recharts).
- **Round pages** (`/rounds/[key]`) — all topics from `PLAN.md` Part 2 grouped by category
  with their recognition cues; collapsible. Each topic has a status toggle
  (To do → Attempted → Learning → Done), 0–5 confidence stars, a revisit flag, and notes.
- **LeetCode** (`/problems`) — 470 problems across 33 patterns mapped to companies, with
  search and filters (company / pattern / difficulty / status). Titles link to leetcode.com.
- **Learn** (`/learn/[domain]`) — guided lessons (Java, LLD; more coming per `ROADMAP.md`)
  with diagrams (mermaid), step-through visualizers, ❌ defective vs ✅ good code panels,
  quizzes, and per-lesson progress. One lesson at a time with Prev / "Mark done · Next".
- **API**: `PATCH /api/progress` persists progress (localStorage fallback everywhere).

## Your data
All progress lives in **`prisma/dev.db`** (SQLite). Back it up by copying that file (or
committing it to git). This is your single source of truth — exactly as the plan specified.

## Development
```bash
npm run dev        # dev server (hot reload) on http://localhost:7373
npm run seed       # reset + reseed the database from prisma/seed.ts
npm run build      # prisma generate + next build (production)
npm run start      # run the production build (what the .exe launches)
```

### Rebuilding the launcher
After changing `launcher.cs`, run `./build-exe.ps1` to recompile `InterviewPrep.exe`.

## Extending the LeetCode list
The plan references a 102-problem spreadsheet. To load it, export it to rows of
`[lcNumber, title, difficulty, pattern, companies]`, paste them into the `problems` array in
`prisma/seed.ts`, then run `npm run seed`. (Patterns should match the DSA categories so the
problems line up with the right round.)
