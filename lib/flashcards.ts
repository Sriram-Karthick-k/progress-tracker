// Retrieval-practice layer: flip-and-grade flashcards wired into the SAME
// spaced-repetition engine as the rest of the app (reviewIntervalDays off
// Progress.confidence + touched). Grading a card records activity (streak) and
// reschedules it. Seeded decks below + a file-backed "My Cards" deck.

import { Progress, getCustomCardsRaw, setCustomCardsRaw } from "./progress";
import { reviewIntervalDays } from "./study";
import { PATTERN_ORDER, PATTERN_CUE } from "./problems";

export type DeckMeta = { key: string; title: string; desc: string };
export type Flashcard = { id: string; deckKey: string; deckTitle: string; front: string; back: string };

const DAY = 86_400_000;

/* ------------------------------- seed decks ------------------------------- */

type SeedDeck = { meta: DeckMeta; cards: { front: string; back: string }[] };

const CONCEPTS: { front: string; back: string }[] = [
  { front: "Average and worst-case lookup of a hash table — and what causes the worst case?", back: "O(1) average, O(n) worst. Worst case when many keys collide into one bucket (poor hash or adversarial input), degrading to a linear scan of that chain." },
  { front: "Why is building a heap O(n), not O(n log n)?", back: "Sift-down bottom-up: most nodes sit near the leaves with tiny height, and the sum of node heights is O(n)." },
  { front: "When choose a BST over a hash map?", back: "When you need ORDER: sorted iteration, range queries, floor/ceiling, or min/max — a hash map gives none of those." },
  { front: "BFS vs DFS — which gives the shortest path in an UNWEIGHTED graph, and why?", back: "BFS. It expands in layers of increasing distance, so the first time it reaches a node is via a shortest path." },
  { front: "When does Dijkstra's algorithm fail?", back: "With negative edge weights — its greedy 'finalize the closest node' assumption breaks. Use Bellman-Ford instead." },
  { front: "Stable vs unstable sort?", back: "A stable sort preserves the relative order of equal keys — matters when sorting by a secondary key or sorting objects." },
  { front: "'Amortized O(1)' append on a dynamic array — what does amortized mean here?", back: "Each append is O(1) except occasional O(n) resizes (doubling); averaged over many appends the cost per op is O(1)." },
  { front: "Two pointers vs sliding window — when each?", back: "Two pointers: sorted-array pair/partition problems. Sliding window: contiguous subarray/substring optimization with a running condition." },
  { front: "What does a prefix-sum array solve, and its build/query cost?", back: "Range-sum queries: O(n) to build, O(1) per query via P[r] − P[l−1]." },
  { front: "Why can DP replace exponential recursion?", back: "Overlapping subproblems are computed once and cached (memoization/tabulation), turning exponential repeated work into polynomial." },
  { front: "Union-Find's two optimizations and their combined effect?", back: "Union by rank/size + path compression → near-O(1) (inverse Ackermann) per operation." },
  { front: "What is a topological sort and when does it exist?", back: "A linear ordering of a DAG where every edge u→v puts u before v. Exists iff the graph has no cycle." },
  { front: "Trie vs hash set for strings — the trade-off?", back: "Trie: prefix queries + shared prefixes, O(L) ops. Hash set: O(L) average exact membership only, no prefix search." },
  { front: "Binary search: complexity and precondition?", back: "O(log n); the array (or answer space) must be sorted/monotonic in the predicate." },
  { front: "Difference between O, Θ, and Ω?", back: "O = upper bound, Ω = lower bound, Θ = tight bound (both hold)." },
  { front: "Why does quicksort degrade to O(n²), and how do you avoid it?", back: "Bad pivots on sorted/adversarial input. Randomize the pivot or use median-of-three." },
  { front: "In-order traversal of a BST gives you what?", back: "The keys in sorted ascending order." },
  { front: "Space complexity of recursion?", back: "O(depth) for the call stack — O(n) for a skewed tree, O(log n) balanced." },
  { front: "How does a size-k min-heap find the k largest elements efficiently?", back: "Push each element; when size > k pop the smallest. The heap ends holding the k largest in O(n log k)." },
  { front: "Greedy vs DP — how do you know greedy is correct?", back: "Greedy works only when a locally-optimal choice is provably globally optimal (exchange argument / matroid). Otherwise you need DP." },
];

const JAVA: { front: string; back: string }[] = [
  { front: "== vs .equals() for objects in Java?", back: "== compares references (identity); .equals() compares logical value (when overridden). Always override hashCode() with equals()." },
  { front: "Why must you override hashCode() whenever you override equals()?", back: "Hash collections locate objects by hashCode first; equal objects with different hashCodes will never be found." },
  { front: "Checked vs unchecked exceptions?", back: "Checked (extends Exception) must be declared/caught — recoverable conditions. Unchecked (RuntimeException) — programming bugs, not forced." },
  { front: "What does `volatile` guarantee — and what does it NOT?", back: "Guarantees visibility + ordering (happens-before) for that variable. Does NOT make compound actions like count++ atomic." },
  { front: "synchronized vs volatile?", back: "synchronized = mutual exclusion + visibility (a lock). volatile = visibility/ordering only, no locking. Use locks/atomics for compound updates." },
  { front: "What is the happens-before relationship?", back: "A visibility guarantee: if A happens-before B, A's writes are visible to B. Established by locks, volatile, thread start/join." },
  { front: "ArrayList vs LinkedList — which and why?", back: "Almost always ArrayList: O(1) index, cache-friendly. LinkedList's O(1) end-insert rarely beats its O(n) index + poor locality." },
  { front: "How does HashMap handle collisions since Java 8?", back: "Buckets are linked lists that convert to red-black trees past ~8 entries, improving the worst case from O(n) to O(log n)." },
  { front: "Runnable vs Callable?", back: "Runnable.run() returns void and can't throw checked exceptions; Callable.call() returns a value and can throw — used with Future/ExecutorService." },
  { front: "Why prefer ExecutorService over `new Thread()`?", back: "Thread pooling/reuse, bounded resources, task queueing, and lifecycle management. Raw threads are unbounded and don't scale." },
  { front: "What is a deadlock and the classic prevention?", back: "Threads each holding a lock the other needs (circular wait). Prevent by acquiring locks in a single global order." },
  { front: "Autoboxing — what is it and a common pitfall?", back: "Automatic int↔Integer conversion. Pitfalls: == on boxed Integers compares references (only cached −128..127 match), and NPE unboxing null." },
  { front: "Why is String immutable, and one benefit?", back: "Immutability enables safe sharing, cached hashCode, string-pool interning, and thread safety." },
  { front: "String `+` in a loop vs StringBuilder?", back: "`+` in a loop builds O(n) throwaway strings → O(n²). StringBuilder mutates in place → O(n)." },
  { front: "ConcurrentHashMap advantage over a synchronized map?", back: "Lock-striping/CAS: concurrent reads + segment-level writes for far higher throughput. Use computeIfAbsent for atomic check-then-act." },
  { front: "Stack vs heap memory in the JVM?", back: "Stack = per-thread frames: locals, primitives, references (fast, auto-freed). Heap = shared objects, GC-managed." },
  { front: "wait() vs sleep()?", back: "wait() releases the monitor lock and awaits notify (must hold the lock). sleep() just pauses the thread and keeps its locks." },
  { front: "Interface vs abstract class?", back: "Interface = capability contract, multiple inheritance, default methods. Abstract class = shared state + partial implementation, single inheritance." },
  { front: "What is a race condition?", back: "Correctness depends on unsynchronized thread interleaving over shared mutable state (e.g., lost updates in count++). Fix with atomics/locks." },
  { front: "final on a field vs method vs class?", back: "Field = assign once. Method = can't be overridden. Class = can't be subclassed." },
];

const HLD: { front: string; back: string }[] = [
  { front: "During a network partition, CAP forces which choice?", back: "Consistency vs Availability. Partitioned, you can't have both: CP (reject/wait for consistency) or AP (serve possibly-stale data)." },
  { front: "Horizontal vs vertical scaling?", back: "Vertical = bigger machine (simple, capped, SPOF). Horizontal = more machines (needs statelessness + LB, scales much further)." },
  { front: "Why must app servers be stateless behind a load balancer?", back: "So any server can serve any request. Session state moves to a shared store (Redis) or a token (JWT), enabling scaling + failover." },
  { front: "Cache-aside pattern in one line, and its risk?", back: "App reads cache; on miss loads DB and populates cache. Risk: stale data and a stampede of misses when a hot key expires." },
  { front: "What is a cache stampede and one fix?", back: "Many concurrent misses hammer the DB when a hot key expires. Fix: single-flight/locking, request coalescing, or staggered TTLs." },
  { front: "SQL vs NoSQL — the core trade-off?", back: "SQL: strong consistency, joins, transactions, fixed schema. NoSQL: horizontal scale, flexible schema, high write throughput, weaker consistency/joins." },
  { front: "What does sharding solve and introduce?", back: "Solves single-node capacity by partitioning data across nodes. Introduces cross-shard queries, rebalancing, and hot-shard risk (use consistent hashing)." },
  { front: "At-least-once vs exactly-once delivery?", back: "At-least-once can duplicate → make consumers idempotent. Exactly-once is costly/rare — usually emulated as at-least-once + dedup/idempotency." },
  { front: "Why put a message queue between services?", back: "Decoupling, load-leveling spikes, async processing, retries, and absorbing producer/consumer speed mismatches." },
  { front: "Read replication — what it scales and its caveat?", back: "Copies serve reads to scale read load. Caveat: replication lag → stale reads and read-your-writes problems." },
  { front: "Idempotency key — what and why?", back: "A client-supplied unique id so a retried request is processed once — prevents duplicate charges/orders under retries." },
  { front: "Rough latency: memory vs SSD vs same-DC vs cross-continent?", back: "Memory ~100ns, SSD read ~100µs (~1000×), same-DC RTT ~0.5ms, cross-continent RTT ~100ms." },
  { front: "How do you do a back-of-envelope capacity estimate?", back: "DAU → QPS (÷86400 × peak factor); storage = items × size × retention; bandwidth = QPS × payload. State your assumptions." },
  { front: "Load balancer L4 vs L7?", back: "L4 routes by IP/port (fast, protocol-agnostic). L7 routes by HTTP content (path/header), does TLS termination — smarter but heavier." },
  { front: "Strong vs eventual consistency — one-line each?", back: "Strong: every read sees the latest write (costlier, coordinated). Eventual: replicas converge over time; reads may be briefly stale (higher availability)." },
];

const SEED: SeedDeck[] = [
  {
    meta: { key: "dsa-patterns", title: "DSA Pattern Recognition", desc: "Given a problem, which of the 33 patterns fits? Recall the trigger for each." },
    cards: PATTERN_ORDER.map((p) => ({ front: `When do you reach for "${p}"?`, back: PATTERN_CUE[p] })),
  },
  { meta: { key: "cs-foundations", title: "DSA & CS Foundations", desc: "The core facts patterns assume you already know." }, cards: CONCEPTS },
  { meta: { key: "java-core", title: "Java & Concurrency", desc: "The Java internals and threading questions that actually get asked." }, cards: JAVA },
  { meta: { key: "system-design", title: "System Design (HLD)", desc: "Building blocks and trade-offs you must recall on demand." }, cards: HLD },
];

export const SEED_DECK_METAS: DeckMeta[] = SEED.map((s) => s.meta);

export function seedCards(): Flashcard[] {
  return SEED.flatMap((s) =>
    s.cards.map((c, i) => ({ id: `fc-${s.meta.key}-${i}`, deckKey: s.meta.key, deckTitle: s.meta.title, ...c }))
  );
}

/* ------------------------------ custom deck ------------------------------ */

// Custom cards live in content/progress.json alongside progress (see lib/progress.ts).
export const CUSTOM_META: DeckMeta = { key: "custom", title: "My Cards", desc: "Cards you've written yourself." };

export function getCustomCards(): Flashcard[] {
  return getCustomCardsRaw().map((c) => ({ ...c, deckKey: "custom", deckTitle: CUSTOM_META.title }));
}

export function addCustomCard(front: string, back: string) {
  const id = `fc-custom-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  setCustomCardsRaw([...getCustomCardsRaw(), { id, front: front.trim(), back: back.trim() }]);
  window.dispatchEvent(new Event("prep-flashcards"));
}

export function deleteCustomCard(id: string) {
  setCustomCardsRaw(getCustomCardsRaw().filter((c) => c.id !== id));
  window.dispatchEvent(new Event("prep-flashcards"));
}

/* -------------------------- scheduling + grading -------------------------- */

/** A card is due if flagged, never reviewed (new), or its interval has elapsed. */
export function cardDue(pr: Progress, now = Date.now()): boolean {
  if (pr.revisit) return true;
  if (!pr.touched) return true;
  return (now - pr.touched) / DAY >= reviewIntervalDays(pr.confidence);
}

export function isNew(pr: Progress): boolean {
  return !pr.touched;
}

export type Grade = "again" | "hard" | "good" | "easy";

export function nextConfidence(cur: number, g: Grade): number {
  const c = cur ?? 0;
  const next =
    g === "again" ? 0 : g === "hard" ? c - 1 : g === "good" ? c + 1 : c + 2;
  return Math.max(0, Math.min(5, next));
}

/** Days until next review for each grade, given current confidence — for button labels. */
export function gradeIntervals(cur: number): Record<Grade, number> {
  return {
    again: reviewIntervalDays(nextConfidence(cur, "again")),
    hard: reviewIntervalDays(nextConfidence(cur, "hard")),
    good: reviewIntervalDays(nextConfidence(cur, "good")),
    easy: reviewIntervalDays(nextConfidence(cur, "easy")),
  };
}
