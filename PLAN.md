# Interview Prep Tracker — Build & Curriculum Plan

**Owner:** Sriram Karthick K
**Goal:** A local Next.js + SQLite web app to track learning across all 5 interview rounds — patterns, topics, problems, confidence, and progress — replacing the spreadsheet.
**Target companies:** Amazon, PayPal, Adobe, Dell, Cisco/Webex, Comcast, FULL Creative, Figma, Canva, Rive, tldraw.

This doc is the single source of truth. Part 1 is **what to build**. Part 2 is the **content to seed** (the patterns/topics themselves). Build the shell first, then paste Part 2 into the seed script.

---

# PART 1 — THE APP

## 1.1 Stack

- **Next.js 14+ (App Router)** — your side-project stack.
- **TypeScript**.
- **Prisma + SQLite** — single `dev.db` file, zero external DB.
- **Tailwind CSS** — styling.
- **Recharts** — progress charts.
- **lucide-react** — icons.

Single user, local-only. No auth. Data lives in `prisma/dev.db` — back it up by copying that file (or `git commit` it).

## 1.2 Data model (Prisma schema)

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite"; url = "file:./dev.db" }

enum Status { TODO ATTEMPTED LEARNING DONE }

model Round {
  id        Int     @id @default(autoincrement())
  key       String  @unique          // "dsa","lowlevel","sysdesign","behavioral","company"
  name      String
  description String?
  order     Int
  topics    Topic[]
}

model Topic {
  id          Int     @id @default(autoincrement())
  round       Round   @relation(fields: [roundId], references: [id])
  roundId     Int
  category    String                   // grouping within a round, e.g. "Two Pointers" / "C++"
  name        String                   // the pattern/topic/skill itself
  description String?                  // "when to recognize it" / what to learn
  cue         String?                  // trigger phrase that signals this pattern
  order       Int     @default(0)
  // progress (single user → inline)
  status      Status  @default(TODO)
  confidence  Int     @default(0)      // 0-5
  revisit     Boolean @default(false)
  notes       String?
  updatedAt   DateTime @updatedAt
}

model Problem {
  id         Int     @id @default(autoincrement())
  lcNumber   Int?
  title      String
  url        String?
  difficulty String                    // Easy/Medium/Hard
  pattern    String                    // ties to a Topic.category in DSA round
  companies  String                    // comma-separated tags
  // progress
  status     Status  @default(TODO)
  confidence Int     @default(0)
  attempts   Int     @default(0)
  revisit    Boolean @default(false)
  dateSolved DateTime?
  notes      String?
  updatedAt  DateTime @updatedAt
}
```

> You already have the 102-problem dataset in `LeetCode_Interview_Tracker.xlsx` — export it to CSV and load it into the `Problem` table in the seed (mapping: title, lcNumber, difficulty, pattern=Topic/Pattern column, companies=joined tags, url).

## 1.3 Pages / routes

| Route | Purpose |
|---|---|
| `/` | **Dashboard** — overall %, per-round progress bars, charts (by status, by difficulty, by company readiness), "needs revisit" list. |
| `/rounds/[key]` | **Round detail** — topics grouped by `category`; inline status toggle, 0–5 confidence, revisit flag, notes. |
| `/problems` | **LeetCode list** — table with filters (company, pattern, difficulty, status), search, inline status/confidence. |
| `/api/topic/[id]` | PATCH — update topic progress. |
| `/api/problem/[id]` | PATCH — update problem progress. |

## 1.4 Key components

- `ProgressBar` — % done with count label.
- `StatusToggle` — cycles Todo → Attempted → Learning → Done (color-coded).
- `ConfidenceStars` — 0–5 clickable.
- `TopicCard` / `ProblemRow` — one item with all controls; optimistic update then PATCH.
- `RoundProgress` — donut/bar per round (Recharts).
- `CompanyReadiness` — horizontal bar of % solved per company (from Problem.companies).

## 1.5 Build milestones

1. `npx create-next-app@latest --ts --tailwind --app` → clean shell.
2. `npm i prisma @prisma/client recharts lucide-react` → `npx prisma init --datasource-provider sqlite`.
3. Paste schema → `npx prisma migrate dev --name init`.
4. **Seed** (`prisma/seed.ts`) using Part 2 below + CSV import of the 102 problems. Wire `prisma db seed`.
5. API PATCH routes (server actions are fine too).
6. Dashboard + round pages + problems page.
7. Charts + revisit list.
8. Polish: dark mode, keyboard nav, JSON export/import button (dump all tables → download; re-import to restore).

Run: `npx prisma migrate dev` → `npm run seed` → `npm run dev` → http://localhost:3000.

---

# PART 2 — THE CURRICULUM (seed content)

Each bullet = one `Topic` row. `category` is the bold group; `name` is the item; the text after `—` is the `description`/`cue`.

## Round A — DSA Patterns (`dsa`)

Tie each to a recognition cue, not just a name. Group = `category`.

**Arrays & Hashing** — frequency counts, dedupe, complement lookups. Cue: "have you seen this value / count of X".
- Hash map / frequency counting — anagrams, top-K, first unique.
- Prefix sum — range-sum queries, subarray sum = k.
- Encode/decode & in-place array tricks — product except self, set matrix zeroes.

**Two Pointers** — sorted array or palindrome; converge from ends. Cue: "pair/triplet that sums to", "is palindrome".
- Opposite-ends two pointers — 3Sum, container with most water, valid palindrome.
- Fast & slow pointers — cycle detection, middle of list, happy number.

**Sliding Window** — contiguous subarray/substring with a constraint. Cue: "longest/shortest substring such that", "max sum of size k".
- Fixed window / variable window — longest substring no-repeat, min window substring.

**Binary Search** — sorted data OR monotonic answer space. Cue: "minimize the max", "find threshold".
- Classic + on rotated array.
- **Binary search on the answer** — Koko eating bananas, ship capacity (very common at Amazon).

**Stack** — nesting, "next greater", expression eval. Cue: "matching", "next greater/warmer".
- Valid parentheses / monotonic stack — daily temperatures, largest rectangle.

**Linked List** — pointer surgery, O(1) space. Cue: "reverse in place", "reorder".
- Reverse / merge / cycle / copy-with-random.

**Trees** — recursion + DFS/BFS. Cue: "path", "level", "ancestor".
- DFS (pre/in/post), BFS level-order, LCA, validate BST, serialize/deserialize.

**Tries** — prefix queries on words. Cue: "starts with", "dictionary of words".
- Implement trie, word search II.

**Heap / Top-K / Two-Heaps** — running min/max, k-th element, median stream. Cue: "k largest/closest", "median so far".

**Backtracking** — generate all combinations/permutations/subsets. Cue: "all possible", "every combination".
- Subsets, permutations, combination sum, N-Queens, word search.

**Graphs** — grids, dependencies, connectivity. Cue: "islands", "prerequisites", "shortest path".
- BFS/DFS on grid, topological sort (course schedule), Union-Find, Dijkstra (network delay), word ladder.

**Dynamic Programming** — overlapping subproblems + optimal substructure. Cue: "max/min ways", "can you reach".
- 1-D: climbing stairs, house robber, coin change, LIS.
- 2-D: edit distance, LCS, unique paths, knapsack.

**Greedy** — local optimum → global. Cue: "minimum number of", "can you finish".
- Jump game, gas station, interval scheduling.

**Intervals** — sort by start, merge/overlap. Cue: "merge", "meeting rooms", "overlap".

**Math & Geometry** — matrix rotation, coordinate math, bit tricks. Cue: "rotate", "spiral", "overlapping rectangles".

**Bit Manipulation** — XOR tricks, masks. Cue: "single number", "count bits".

**Domain tie-ins (your edge — mention these in interviews)**:
- Coordinate/geometry problems → maps to Skia hit-testing & bounding boxes.
- Diff / merge / LCS → maps to Operational Transform in Vani.
- Interval merge / dirty regions → maps to dirty-region redraw.

*Process to drill every problem:* state brute force → state optimal complexity BEFORE coding → code → edge cases → test.

## Round B — Low-level / Domain Deep Dive (`lowlevel`) — your strongest differentiator

**C++**
- Memory model: stack vs heap, object lifetime, alignment.
- RAII — resource ownership tied to scope.
- Move semantics & rvalue references — `std::move`, when copies are elided.
- Smart pointers — `unique_ptr`, `shared_ptr`, `weak_ptr`; ownership graphs; cycles.
- Rule of 0 / 3 / 5.
- Virtual dispatch & vtables — how polymorphism is implemented; vptr cost.
- Undefined behavior — dangling refs, data races, signed overflow, UB-driven optimizations.
- Templates & perfect forwarding (awareness level).
- const-correctness, cache locality, why data layout matters for rendering.

**WebAssembly & Emscripten**
- Linear memory model — single growable `ArrayBuffer`; no GC.
- JS ↔ WASM interop — copying across the boundary, why it's the bottleneck; embind / ccall / cwrap.
- Performance — minimizing boundary crossings, passing pointers, SharedArrayBuffer + threads, SIMD.
- Build pipeline — Emscripten + CMake toolchain, `-O` flags, `-s` linker settings, growing memory, exported functions.
- Be ready for: "how does Vani run C++ in the browser, and what's slow about it".

**Rendering (Skia + WebGPU)**
- Skia — what it gives you (paths, paints, text), CPU vs GPU backends.
- WebGPU vs WebGL — explicit pipelines, command buffers, bind groups, why WebGPU is lower-overhead.
- Render pipeline — vertex → rasterize → fragment; command encoding.
- Batching & draw calls — why fewer draw calls = faster; instancing.
- Dirty-region redraw — only repaint what changed.
- Frame budget — 16.6 ms @ 60fps; what blows it.
- Retained vs immediate mode; layering/compositing; text & tessellation.
- Be ready for: "design the rendering layer of a whiteboard" and "how do you keep 60fps with 10k shapes".

**Cross-platform architecture**
- Shared C++ core + thin platform shells (web/macOS/Windows/Android).
- FFI bridges per platform; threading model; how one codebase ships everywhere.

**Real-time collaboration**
- Operational Transform — transform functions, intention preservation, causality.
- OT vs CRDT — tradeoffs, when each wins.
- Conflict resolution, version vectors, undo in a collaborative setting.
- WebSocket scaling — fan-out, rooms, presence, reconnection/resync.
- Be ready for: "how does Vani sync edits between users" and "OT vs CRDT for a whiteboard".

## Round C — System Design Patterns (`sysdesign`)

**The framework (always follow this order)**
- Clarify requirements (functional + non-functional) → scale estimates (QPS, storage, bandwidth) → API design → data model → high-level architecture → deep-dive on 1–2 components → bottlenecks → trade-offs.

**Building blocks to know cold**
- Load balancing; horizontal vs vertical scaling.
- Caching (cache-aside, write-through, TTL, eviction) + CDN.
- Database: SQL vs NoSQL, indexing, sharding, replication, read replicas.
- Consistency models — strong vs eventual; CAP; idempotency.
- Message queues / pub-sub; async processing.
- Real-time transport — WebSocket vs SSE vs long-poll.
- Rate limiting; consistent hashing; leader election; write-ahead log.

**Collab / rendering-specific patterns (your sweet spot)**
- Sync engine — OT/CRDT server, op log, delta sync, version vectors.
- Presence & multiplayer cursors — fan-out, ephemeral state, heartbeat/expiry.
- Offline-first editor — local-first writes, queue + reconcile on reconnect.
- Asset/image pipeline — upload → process → CDN; thumbnails; dedupe.
- LLM context-extraction service — embeddings, vector store, chunking, retrieval.

**Practice prompts:** design a collaborative whiteboard; multiplayer cursor presence; a sync engine; an offline-first editor; an image/asset pipeline; an LLM context-extraction service.

## Round D — Behavioral / HR (`behavioral`)

**Method:** STAR (Situation, Task, Action, Result) — quantify results.

**Story bank to write (6–8 stories from Vani/Zoho):**
- Shipped under a hard deadline.
- Debugged a nasty rendering/performance bug (Skia/WebGPU/frame budget).
- Cross-platform conflict (web vs macOS vs Android behavior).
- A hard real-time-collab/OT bug.
- Mentoring / helping a teammate.
- Disagreement with a senior / pushed back with data.
- Took ownership beyond your role.
- A failure + what you learned.

**Standard questions to script:** why leave Zoho; why this company; strengths; weaknesses; biggest impact; conflict; failure.

**Salary negotiation:** anchor to 20–25 LPA target (current ~15 LPA). Don't anchor low, don't disclose current first, justify with the specialized C++/WASM/rendering/collab skill set.

## Round E — Company-specific (`company`)

One topic per target — fill the "what they test" + "my angle" before each interview:
- **Amazon** — DSA + Leadership Principles (write 2 stories per LP). High bar on optimal + edge cases.
- **PayPal** — DSA + payments/scale, idempotency, concurrency.
- **Dell / Cisco/Webex / Comcast** — DSA + real-time media/networking; Cisco/Webex value your WebSocket/real-time background.
- **Adobe** — algorithmic + some rendering; lean on Skia/WebGPU.
- **Figma / Canva / Rive / tldraw** — rendering, canvas perf, WASM, OT/CRDT. Practical/take-home style — your background is the headline, not LeetCode grind.
- **FULL Creative** — practical builds, not hard DSA.

For each: their process/rounds, recent asked questions, and 3–4 talking points mapping Vani/Skia/WebGPU/WASM/OT onto what they value.

---

# Appendix — seed shape

```ts
// prisma/seed.ts (sketch)
const rounds = [
  { key:"dsa", name:"DSA Patterns", order:1 },
  { key:"lowlevel", name:"Low-level / Domain", order:2 },
  { key:"sysdesign", name:"System Design", order:3 },
  { key:"behavioral", name:"Behavioral", order:4 },
  { key:"company", name:"Company-specific", order:5 },
];
// for each round, insert Topic rows from Part 2 (category, name, description/cue)
// then read leetcode CSV → insert Problem rows
```

Start small: scaffold + schema + seed the DSA round only, get the dashboard rendering, then paste the rest. Good luck.