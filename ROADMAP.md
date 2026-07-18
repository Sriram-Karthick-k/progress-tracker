# ⚠️ DIRECTION CHANGED 2026-07-17 — Resource Hub, not in-app textbook

The plan below (visual learning engine, deep textbook lessons) was **abandoned** on 2026-07-17.
The user wants the app to work like **Striver's A2Z sheet**: an organized, checkable **tracker that
links to the best FREE external resources** (articles, videos, books, docs) — not to *be* the textbook,
because they'll reference Google/Striver/NeetCode/docs anyway.

**Current shape:**
- **DSA = the LeetCode Problems tracker only** (`/problems`). LeetCode is enough; no in-app DSA content.
- **Topics = resource hub** (`/topics`, `lib/learn/resources/`): java, concurrency, lld, hld, spring, react,
  lowlevel, cs-basics — each topic links to curated **free** resources + tracks progress.
- **Interview** = behavioral + company trackers. **Reference** = cheatsheets + SQL.
- Nav consolidated to kill the old Rounds/Learn duplication. All deep lessons + the visual-lesson
  engine were deleted (see [[content-inventory]], [[depth-standard]]).

**Next possible work:** expand resource domains (more topics/links per domain), add per-problem
resource links if wanted later, polish the /topics UX, light theme + mobile.

--- everything below is the OLD abandoned plan, kept for history only ---

# ROADMAP — From "Knowledge Dump" to a Visual Learning App

**Goal:** One website where I learn *everything* for interviews — explained **with drawings**,
step-by-step animations, and a guided path. Not walls of text and code. I'm learning from scratch:
every concept gets a picture first, code second.

**Focus areas:** basic concepts → DSA patterns → DSA problems → LLD → HLD → Java basics → Java concurrency
→ **Spring Boot** → **React**. This is a whole packaged application: all concepts and sub-concepts, with
proper UI/UX — nothing lives outside it.

**Guiding principles (apply to every phase):**
1. **Diagram-first.** No lesson ships without at least one drawing (flow, structure, timeline, or animation).
2. **Show, then tell.** Visual → plain-English → code → complexity → traps. In that order.
3. **Guided, not browsed.** The app should tell me *what to learn next*, not make me hunt through menus.
4. **Interactive where it pays.** Pointers moving, windows sliding, nodes highlighting — animation for
   algorithms; static diagrams for architecture.
5. **Defective vs good code, everywhere.** Every concept shows ❌ *what broken/naive code looks like*
   (and precisely why it fails) next to ✅ *what good code looks like* — as a first-class lesson block.

---

# ⚠ DEPTH PASS — the standing quality bar (agreed 2026-07-16, evening)

The Phase 3–7 content below shipped as **summaries** — too shallow for real learning ("one-liners").
The corrected standard, now enforced:

- **Textbook-exhaustive lessons**: full sub-concept development, worked problems end-to-end
  (statement → brute force → insight → optimal → dry-run trace → complexity → edge cases),
  multiple ❌/✅ mistake panels, interview Q&A with model answers, quizzes. 40+ min reads are fine.
- **One file per lesson**: deep lessons are TSX components (`Lesson.body`) under
  `lib/learn/<domain>/<lesson>.tsx`, composed from `components/learn/lesson-ui.tsx`
  (H2/H3/P/Code/Output/Diagram/Viz/Trace/QA/BadGood/Quiz/T) — no more giant single-file JSON blobs.
- **All Java code compiles and runs**: full programs with `main` + expected output live in
  `<lesson>.code.ts`, gated by `npm run verify:java` (javac). Outputs in lessons are real outputs.
- UI: lessons are badged **In-depth** (rebuilt) vs **Summary** (awaiting depth pass).

**Structure:** each deep lesson lives in `lib/learn/patterns/<id>/{lesson.tsx, code.ts}`; domain def is
`lib/learn/patterns/domain.ts`; Java gated by `npm run verify:java` (77/77 compile + run-verified).

**DONE — all 14 priority Patterns rebuilt deep** (2026-07-16→17): sliding-window, two-pointers, hashing,
binary-search, stack, heap, trees-dfs, trees-bfs, graphs-traversal, backtracking, dp-1d, dp-2d, greedy,
intervals. Each ~45-50 min: why → template → 2-4 fully-worked problems (statement→brute→insight→optimal→
dry-run trace) → BadGood mistake panels → recognition table → interview Q&A → quizzes. Domain page badges
lessons **In-depth** (14) vs **Summary** (19).

**Depth-pass order (user's choice):** 1) DSA Basics + Patterns → 2) Java + Concurrency →
3) LLD → 4) HLD. Ledger: **15 deep** (14 patterns + earlier sliding-window exemplar counted once) **/ ~110 summary.**
Next: the 19 lower-freq patterns, then dsa-basics (11 lessons), then Java/Concurrency/LLD/HLD.

---

**State of the repo today (audited 2026-07-16):**
- ✅ 470 LeetCode problems / 33 patterns with filters + progress (`/problems`); dashboard; cheat sheets; SQL handbook
- ✅ Java (~30 lessons) and LLD (SOLID + 22 GoF patterns) content in `lib/learn/` — **text/code only, no visuals**
- ❌ Learn system not rendered anywhere (no route, no sidebar link)
- ❌ No diagrams anywhere in the app; lesson Block model has no visual block types
- ❌ No HLD content; no DSA foundations; almost no concurrency problems; no worked LLD designs
- ❌ No guided path — every page is a flat list (the "knowledge dump" problem)

---

## Phase 1 — Visual Learning Engine (the foundation everything else uses)

Build the rendering machinery once, so every later lesson can draw.

### 1.1 New packages — ✅ all installed 2026-07-16
| Package | Why |
|---|---|
| `mermaid` | Text-defined diagrams: flowcharts, **sequence diagrams** (concurrency!), **class diagrams** (LLD/UML), state machines, ER diagrams. Covers 80% of needs with zero drawing effort. |
| `@xyflow/react` (React Flow) | Interactive node-graph diagrams — HLD architecture boxes (LB → services → DB → cache) that pan/zoom, and data-structure graphs. |
| `framer-motion` | Smooth animation primitives for the algorithm visualizers (pointers sliding, elements swapping, nodes lighting up). |
| `shiki` | Proper syntax highlighting for lesson code (current `CodeBlock` is plain `<pre>`). |
| `katex` + `react-katex` | Clean math for Big-O, recurrence relations, estimation arithmetic. |

### 1.2 Extend the lesson Block model (`lib/learn/types.ts`)
- [x] `{ t: "mermaid", code, caption }` — rendered mermaid diagram
- [x] `{ t: "viz", kind, data, steps }` — **step-through algorithm visualizer** with Prev/Next/Play:
      each step = array/tree/graph state + highlighted indices + a one-line explanation (array kind done)
- [ ] `{ t: "flow" }` — React Flow architecture diagram (build with the first HLD content)
- [x] `{ t: "quiz", q, options, answer, why }` — self-check question at the end of each lesson
- [x] `{ t: "compare", cols }` — side-by-side "approach A vs B" panels
- [x] `{ t: "badgood", bad: {code, why}, good: {code, why} }` — the ❌/✅ block: defective code with the
      failure explained (bug, leak, race, smell) beside the correct version — used in EVERY domain
- [x] Upgrade `code` blocks to shiki (JS regex engine, java/cpp/ts/js/sql grammars, copy button)

### 1.3 Reusable visualizer components (build once, feed with data)
- [x] **ArrayViz** — boxes with labeled pointers (i/j/left/right), window shading, swap animation
      → powers Two Pointers, Sliding Window, Binary Search, Sorting, Prefix Sum
- [ ] **LinkedListViz** — nodes + arrows that rewire step-by-step → Linked List, Fast & Slow
- [ ] **TreeViz** — auto-layout binary tree, traversal order animation, recursion call-stack panel
- [ ] **GraphViz** — grid + adjacency views, BFS wave / DFS path coloring, Union-Find forest
- [ ] **StackHeapViz** — stack frames & heap objects → recursion, JVM memory, Java pass-by-value
- [ ] **ThreadTimelineViz** — horizontal thread lanes with lock acquire/release/blocked markers
      → the entire concurrency curriculum, deadlock demos
- [ ] **BigOChart** — growth-curve comparison (n, log n, n², …)

### 1.4 Render the Learn system (currently invisible)
- [x] `/learn` overview + `/learn/[domain]` route rendering sections → lessons → blocks
- [x] Lesson page = focused reading view: **one lesson at a time**, Prev/Next, "Mark done · Next",
      status/confidence/revisit/notes controls (ids already exist: `l-<domain>-<lessonId>`)
- [x] Sidebar: Learn section with per-domain % complete (+ Reference section for sheets)
- [x] Dashboard: lessons count toward Overall %, Learn-track bars, revisit list includes lessons
- Note: `lib/learn/lld-problems.ts` was a missing import (lld.ts referenced it but it never existed) —
  created as an empty typed stub; Phase 5 fills it with the worked designs.

---

## Phase 2 — UX overhaul: guided learning, not a dump

- [x] **Learning Path (home experience):** ordered visual journey (Java → Patterns → Problems → LLD →
      Domain → HLD → Behavioral → Targets) with done/active/todo node states and a
      **"Continue where you left off"** button that deep-links to the next lesson (`lib/study.ts`)
- [x] **"Today" panel:** continue target + up to 4 due reviews (spaced repetition + revisit flags)
- [x] **Progressive disclosure:** code blocks > 24 lines collapse with a "Show all N lines" expander
- [x] **Lesson flow:** estimated read time in the breadcrumb, quiz blocks, "Mark done · Next" advances
- [x] **Spaced repetition:** every update stamps `touched`; items resurface by confidence
      (0-1★ → 1d, 2★ → 3d, 3★ → 7d, 4-5★ → 21d); revisit-flag = always due
- [x] **Per-pattern mastery view:** dashboard card, weakest 12 patterns first, deep-links to
      `/problems?pattern=…` (problems page now reads URL filter params)
- [x] **Global search** (Cmd+K or sidebar button): lessons, problems, patterns, rounds, cheat sheets, SQL
- [x] Activity heatmap (16 weeks, localStorage activity log) + day streak; JSON export/import (existed)
- [ ] Light theme + responsive layout (readable on phone during commute) — the one Phase 2 item left
- [x] Update stale README (says 65 problems; actual 470)

---

## Phase 3 — DSA foundations, visually (new domain `dsa-basics`) — ✅ shipped 2026-07-16

Live at `/learn/dsa-basics`, first stage of the learning path. Every lesson: drawing/animation first →
plain English → Java → complexity → traps → quiz (11 lessons, 4 sections).

- [x] Big-O with **BigOChart** (new `bigo` block) + derivation rules + amortized analysis
- [x] Arrays & memory: address-math diagram, ArrayList-doubling animation, op-cost table
- [x] Hash tables: hash→bucket→chain diagram, load factor, ❌ missing-hashCode data loss vs ✅ record
- [x] Linked lists: node/rewire mermaid diagrams, dummy-node idiom, O(1)-delete trick quiz
      (dedicated animated LinkedListViz still worth building when Phase 4 list patterns land)
- [x] Stacks & queues: LIFO-vs-FIFO animation on one buffer, ArrayDeque templates
- [x] Recursion: fib(4) recursion-tree diagram (flags overlapping subproblems for DP),
      ❌ missing-base-case vs ✅, induction mental model, stack-depth warning
- [x] Trees & BST: invariant diagram, four traversals + BFS level template, DFS-vs-BFS compare
      (animated TreeViz deferred to Phase 4 tree patterns)
- [x] Heaps: array↔tree dual view, **animated sift-up**, k-largest idiom, build-heap O(n)
- [x] Graphs: adjacency list-vs-matrix compare panels, BFS/DFS templates, visited-set rule
- [x] Sorting: **animated insertion sort**, algorithm table, stability, ❌ `y - x` overflow comparator
- [x] Bits: **animated `n & (n-1)`**, XOR facts, read/set/clear/toggle toolkit, `>>>` note

## Phase 4 — Per-pattern teaching pages — ✅ 14 priority patterns shipped 2026-07-16

New `patterns` learn domain at `/learn/patterns` (2nd stage of the learning path). Each lesson:
recognition cues → animated/diagrammed template → walked problems → pitfalls → quiz → **live
drill-list** (every problem for that pattern with full progress controls, via `Lesson.pattern`
+ `PatternProblems` — deep-links to the problem browser).

- [x] **Priority 14:** Two Pointers (animated pair-sum converge, 3Sum walked), Sliding Window
      (animated LC 3, fixed-vs-variable compare), Hashing (❌ O(n²) search vs ✅ complement map,
      3 idioms), Binary Search (animated halving, boundary template, Koko answer-space walk),
      Stack (animated monotonic stack / Daily Temperatures), Heap (k-largest idiom, two-heaps
      median), Trees DFS (diameter walk, ❌ parent-child-only BST check vs ✅ range-passing),
      Trees BFS (level-freeze template), Graphs Traversal (islands flood fill, multi-source BFS),
      Backtracking (decision-tree diagram, ❌ shared-reference bug vs ✅ snapshot), DP-1D (❌ 2ⁿ
      recursion vs ✅ rolling vars, animated House Robber, 4-step script, Coin Change), DP-2D
      (LCS table walk, offset trap), Greedy (Jump Game, sort-by-end + exchange arguments),
      Intervals (merge sweep, Meeting Rooms II heap)
- [x] **Remaining 19 patterns** (batch 2, shipped 2026-07-16): Fast & Slow (animated tortoise/hare,
      Floyd phase-2), Prefix Sum (animated build, LC 560 map trick), Linked List (❌ lost-next reversal
      vs ✅ save-flip-advance, dummy merges), Cyclic Sort (animated swap-home, First Missing Positive),
      Matrix (transpose+reverse, spiral bounds), Topological Sort (DAG diagram, Kahn's + free cycle
      check), Union-Find (forest diagram, compression+rank template), Shortest Path (lazy-deletion
      Dijkstra, Bellman-Ford decision table), Trie (prefix-tree diagram, LC 208), Strings & Parsing
      (atoi state machine with pre-multiply overflow guard), Math (sieve/gcd/fast-pow/reverse-guard),
      Geometry (rect overlap via negation — Skia hit-testing tie-in), Bit Manipulation (XOR families,
      bit-DP, mask-as-set), Design & OOD (LRU map+DLL diagram + skeleton), Sorting (Largest Number
      comparator, quickselect, counting), D&C (inversion count merge), Segment Tree & Fenwick (BIT
      template), Randomized (reservoir proof, Fisher-Yates bias trap), Concurrency (semaphore batons,
      LC 1114/1115) — **all 33 patterns now have teaching pages.**
- [ ] Dedicated LinkedListViz / TreeViz animated components (mermaid covers them meanwhile)

## Phase 5 — Java, visually upgraded + full concurrency — ✅ shipped 2026-07-16

New **Java Concurrency** domain at `/learn/concurrency` (17 lessons, 5 sections), a stage of the
learning path between Problems and LLD. Every lesson: diagram → ❌/✅ code → quiz.

- [x] Java retrofit: collections hierarchy (Phase 1), stack-vs-heap + GC-generations mermaid
      diagrams added to the JVM lesson; HashMap bucket internals covered in DSA Foundations
- [x] **Concurrency curriculum:**
  - [x] Thread lifecycle (state-machine diagram, start-vs-run trap), races & JMM (❌ count++ lost
        updates vs ✅ atomics, happens-before table, the infinite-stale-read quiz)
  - [x] `synchronized`/monitors (❌ instance-vs-static lock mixup + boxed-Integer lock vs ✅
        dedicated final locks), `volatile` & atomics (animated CAS retry, LongAdder)
  - [x] `wait`/`notify` (sequence diagram, ❌ if vs ✅ while guarded block), ReentrantLock/RW/Condition
        (❌ unlock outside finally), Semaphore/Latch/Barrier decision table
  - [x] Executors (pool-anatomy diagram, CPU-vs-IO sizing math, ❌ unbounded queue OOM vs ✅
        bounded + CallerRunsPolicy), CompletableFuture (thenApply-vs-thenCompose), ConcurrentHashMap
        (❌ check-then-act vs ✅ computeIfAbsent) + BlockingQueue family table
  - [x] Deadlock (circular-wait diagram, ❌ argument-order locks vs ✅ global ordering), livelock,
        starvation, jstack
- [x] **Classic problems, all worked:** Producer–Consumer (raw wait/notify AND BlockingQueue
      side-by-side), print-in-order family LC 1114/1115/1116/1195 (semaphore batons + live LC
      drill-list on the lesson), Dining Philosophers (3 fixes, pigeonhole quiz), Reader–Writer
      (production + from-scratch + starvation), thread pool from scratch (worker loop, poison
      handling), thread-safe singleton (❌ broken DCL vs ✅ volatile/holder/enum)
- [ ] ThreadTimelineViz interactive component (sequence diagrams cover it meanwhile)

## Phase 6 — LLD with real UML drawings — ✅ shipped 2026-07-16

- [x] Retrofit key GoF lessons with UML: Strategy + Factory Method + Decorator + Composite (class
      diagrams), Observer (sequence diagram), class-relationships (all-six diagram, Phase 1);
      remaining GoF lessons keep code-first with diagrams added opportunistically
- [ ] SOLID lessons: before/after class-diagram pairs (still open — small polish item)
- [x] **9 worked designs** live in the LLD track (`lld-problems.ts`, two sections), each:
      requirements → mermaid class/state diagram → Java skeleton → patterns used → quiz:
  - [x] **Parking Lot** (fee Strategy, allocation-strategy follow-up), **Vending Machine**
        (state diagram → one class per state), **Elevator** (SCAN with TreeSet ceiling/floor),
        **BookMyShow** (seat hold TTL state machine, CAS + DB optimistic-locking quiz),
        **Splitwise** (split Strategy + max-debtor/max-creditor settle-up, money-in-cents trap),
        **Tic-Tac-Toe → Chess** (O(1) win counters, polymorphic piece rules), **Logger**
        (Chain of Responsibility + COW appenders), **Notification service** (Strategy ×
        Observer × retry Decorator, idempotency talking points), **Rate limiter** (algorithm
        table + lazy-refill token bucket, bridges to HLD Phase 7)
  - LRU Cache lives in the Patterns track (Design & OOD lesson) — cross-covered

## Phase 7 — HLD from zero, diagram-native (new domain `hld`) — ✅ shipped 2026-07-16

**31 lessons, 8 sections** at `/learn/hld` (learning-path HLD stage now points here). Every lesson:
diagram → plain English → decision table/worked example → quiz.

- [x] Foundations: URL→page journey (DNS/TCP/TLS sequence diagram), API design (REST/gRPC/GraphQL,
      cursor pagination, idempotency keys), WebSocket vs SSE vs long-poll decision
- [x] Scaling: load balancing (L4/L7, 5 algorithms, health checks), statelessness (❌ local sessions
      vs ✅ JWT/Redis), CDN (pull/push, fingerprinted assets, design-out-invalidation)
- [x] Databases: SQL-vs-NoSQL decision table, B-tree indexing (leftmost-prefix quiz), replication
      (lag, read-your-writes, split-brain), **sharding + consistent-hash ring + hot keys**,
      CAP + quorums (R+W>N), distributed transactions (saga sequence diagram, outbox pattern)
- [x] Caching & async: cache-aside/through/back compare, **stampede diagram + 3 fixes**,
      queues vs pub-sub, **Kafka partitions/consumer-groups diagram**, delivery semantics +
      idempotent-consumer code
- [x] Reliability: timeouts/retries+jitter, **circuit-breaker state machine**, bulkheads/cascading
      failure, leader election with **fencing tokens (sequence diagram)**, WAL + B-tree-vs-LSM,
      observability (p99 fan-out math)
- [x] Estimation: latency-numbers table + fully worked 10M-DAU capacity plan
- [x] Interview framework as a timed flowchart + the ownership script
- [x] **8 case studies** (mermaid architecture diagrams): URL shortener (range-lease keygen),
      chat/WhatsApp (persist-before-ack, resume cursors), news feed (push/pull hybrid),
      YouTube (transcode pipeline, ABR segments), Uber proximity (geohash cells), web crawler
      (politeness frontier, Bloom filter), ID generator (Snowflake bits) + distributed rate
      limiter (Redis Lua); notification service HLD angles live in the LLD design
- [x] **"Your Sweet Spot" section:** collaborative whiteboard (board-sticky sequencer, op log +
      snapshots), sync engine (**OT transform sequence diagram**, OT-vs-CRDT, version vectors,
      collab undo), presence/cursors (throttle-coalesce-expire), offline-first (op queue,
      tombstones, reconcile) — each tied to Vani experience
- [ ] Upgrade case-study diagrams to interactive React Flow (click component → deep-dive) — polish

## Phase 8 — CS basics (supporting topics, same visual treatment)

- [ ] OS: process vs thread drawing, context switch timeline, virtual memory/paging diagram
- [ ] Networking: TCP handshake sequence diagram, TLS, "what happens when you type a URL" flow
- [ ] DBMS: ACID, isolation levels (anomaly timelines), normalization before/after tables

## Phase 9 — Spring Boot (new domain `spring`)

All concepts + sub-concepts, every lesson with a diagram and a ❌ defective / ✅ good code pair.

- [ ] **Core Spring:** IoC & Dependency Injection (bean-wiring diagram; ❌ `new`-everywhere coupling vs
      ✅ constructor injection), ApplicationContext, bean scopes & lifecycle (state diagram),
      `@Component/@Service/@Repository`, `@Configuration`+`@Bean`, profiles, `@Value`/config properties
- [ ] **Spring Boot itself:** auto-configuration (how `@SpringBootApplication` works — flow diagram),
      starters, embedded server, `application.yml`, DevTools, Actuator endpoints
- [ ] **Web layer:** `@RestController`, request lifecycle **sequence diagram** (filter → dispatcher →
      handler → advice), validation (❌ manual if-checks vs ✅ `@Valid` + Bean Validation),
      exception handling (❌ try/catch in every controller vs ✅ `@ControllerAdvice`), DTOs vs entities
      (❌ exposing JPA entities vs ✅ mapped DTOs), pagination, versioning
- [ ] **Data layer:** Spring Data JPA, entity mappings & relationships (ER diagrams), lazy vs eager
      (❌ N+1 query problem shown with actual SQL log vs ✅ fetch join / `@EntityGraph`),
      transactions & `@Transactional` (❌ self-invocation trap, wrong propagation vs ✅ correct usage),
      connection pools, Flyway migrations
- [ ] **Cross-cutting:** AOP (proxy diagram — explains both `@Transactional` and `@Async` traps),
      caching `@Cacheable`, async & scheduling, events
- [ ] **Security:** filter-chain diagram, authentication vs authorization, JWT flow (sequence diagram),
      ❌ common security mistakes (plain-text passwords, missing CSRF/CORS understanding) vs ✅ correct setup
- [ ] **Testing:** unit vs `@SpringBootTest` vs slice tests (`@WebMvcTest`, `@DataJpaTest`), MockMvc,
      Testcontainers (❌ testing against H2-only vs ✅ real DB in a container)
- [ ] **Production concerns:** REST client patterns, resilience (retry/circuit breaker), observability,
      Dockerizing a Boot app — ties into the HLD domain
- [ ] **Interview Q bank:** bean lifecycle, proxy pitfalls, `@Transactional` edge cases, auto-config internals

## Phase 10 — React (new domain `react`)

Same treatment: concept → render-flow diagram → ❌ broken component vs ✅ correct one.

- [ ] **Foundations:** JSX, components & props, one-way data flow (tree diagram), conditional & list
      rendering (❌ index-as-key bug demonstrated vs ✅ stable keys)
- [ ] **State & renders:** `useState` (❌ stale-closure counter vs ✅ functional updates), how re-rendering
      actually works (render-cycle diagram), lifting state, ❌ derived state stored in state vs ✅ computed
- [ ] **Effects:** `useEffect` mental model (timeline diagram of mount/update/cleanup),
      ❌ missing deps / infinite loop / fetch race condition vs ✅ correct deps + cleanup + AbortController
- [ ] **Hooks deep-dive:** `useRef`, `useMemo`/`useCallback` (❌ premature memo everywhere vs ✅ measuring
      first), `useReducer`, `useContext` (❌ one giant context re-rendering the world vs ✅ split contexts),
      custom hooks, rules of hooks (why — fiber/hook-list drawing)
- [ ] **Performance:** reconciliation & keys (diffing diagram), `React.memo`, code splitting/lazy,
      list virtualization, React DevTools profiling
- [ ] **Data & forms:** controlled vs uncontrolled (❌ mixed mode warning vs ✅), form libraries,
      data fetching patterns, TanStack Query mental model (cache diagram), optimistic updates
- [ ] **State management:** when context is enough vs Redux/Zustand (decision flowchart), store diagrams
- [ ] **Architecture:** component composition (❌ prop drilling / god components vs ✅ composition + children),
      container/presentational, error boundaries, portals
- [ ] **Modern React:** Suspense, transitions, server components vs client components (boundary diagram —
      this app is Next.js, point at our own code as the example!)
- [ ] **TypeScript + React:** typing props/hooks/events, generics in components
- [ ] **Testing:** React Testing Library philosophy (❌ testing implementation details vs ✅ testing behavior)
- [ ] **Interview Q bank:** virtual DOM, keys, closure traps, batching, controlled inputs

---

## Execution order

1. **Phase 1** — the visual engine + render Learn. Everything else depends on it.
2. **Phase 2** — guided path & Today panel (fixes the "dump" feel immediately).
3. **Phase 3 → 4** — foundations then patterns, in parallel with daily problem practice.
4. **Phase 5** — Java visual retrofit + concurrency (PayPal/systems focus).
5. **Phase 6 → 7** — LLD designs, then HLD (machine-round order at most companies).
6. **Phase 8** — ongoing alongside revision.
7. **Phase 9 → 10** — Spring Boot then React (full-stack development track; React lessons can
   point at this very app's code as living examples).
