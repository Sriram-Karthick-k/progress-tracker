// Canonical CONTENT for the tracker — static, read-only, needs no database.
// Progress (status/confidence/revisit/notes) is stored separately (see lib/progress.ts),
// keyed by the stable string IDs generated here. This lets the app run against SQLite
// locally OR pure localStorage on Vercel/static hosting with the same content.

export type RoundDef = {
  key: string;
  name: string;
  icon: string;
  description: string;
  order: number;
};

export type TopicDef = {
  id: string;
  roundKey: string;
  category: string;
  cue: string | null;
  name: string;
  description: string | null;
  order: number;
};

// Problems (and the 23 DSA patterns) are generated from DSA_Mastery_Tracker.xlsx.
import { PROBLEMS, PATTERN_ORDER, PATTERN_CUE } from "./problems";
export type { ProblemDef } from "./problems";
export { PROBLEMS, PATTERN_ORDER, PATTERN_CUE } from "./problems";

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ROUNDS: RoundDef[] = [
  { key: "dsa", name: "DSA Patterns", icon: "Boxes", order: 1, description: "Recognition cues, not just names. State brute force → optimal complexity BEFORE coding → code → edge cases → test." },
  { key: "lowlevel", name: "Low-level / Domain", icon: "Cpu", order: 2, description: "Your strongest differentiator — C++, WASM, rendering, cross-platform, real-time collab." },
  { key: "sysdesign", name: "System Design", icon: "Network", order: 3, description: "Always follow the framework. Building blocks cold + your collab/rendering sweet spot." },
  { key: "behavioral", name: "Behavioral / HR", icon: "MessagesSquare", order: 4, description: "STAR method, quantify results. Build a story bank from Vani / Zoho." },
  { key: "company", name: "Company-specific", icon: "Building2", order: 5, description: "What they test + my angle. Fill before each interview." },
];

type Cat = { round: string; cat: string; cue?: string; items: { n: string; d?: string }[] };

// The DSA round mirrors the 23 patterns in DSA_Mastery_Tracker.xlsx: one category per
// pattern (with its "when to reach for it" cue), one topic per sub-group. Derived from
// PROBLEMS so adding a problem automatically keeps this in sync.
const DSA_CATS: Cat[] = PATTERN_ORDER.map((pattern) => {
  const list = PROBLEMS.filter((p) => p.pattern === pattern);
  const groups: string[] = [];
  list.forEach((p) => {
    if (!groups.includes(p.group)) groups.push(p.group);
  });
  return {
    round: "dsa",
    cat: pattern,
    cue: PATTERN_CUE[pattern],
    items: groups.map((g) => {
      const ex = list.filter((p) => p.group === g);
      return {
        n: g,
        d: `${ex.length} problem${ex.length === 1 ? "" : "s"} — e.g. ${ex
          .slice(0, 3)
          .map((p) => p.title)
          .join(", ")}`,
      };
    }),
  };
});

const CATS: Cat[] = [
  // ---- DSA (your personal edge — kept alongside the generated patterns) ----
  { round: "dsa", cat: "Domain tie-ins (your edge)", cue: "mention these in interviews", items: [
    { n: "Coordinate/geometry problems", d: "maps to Skia hit-testing & bounding boxes." },
    { n: "Diff / merge / LCS", d: "maps to Operational Transform in Vani." },
    { n: "Interval merge / dirty regions", d: "maps to dirty-region redraw." },
  ]},

  // ---- LOW-LEVEL ----
  { round: "lowlevel", cat: "C++", cue: "the headline of your profile", items: [
    { n: "Memory model", d: "stack vs heap, object lifetime, alignment." },
    { n: "RAII", d: "resource ownership tied to scope." },
    { n: "Move semantics & rvalue references", d: "std::move, when copies are elided." },
    { n: "Smart pointers", d: "unique_ptr, shared_ptr, weak_ptr; ownership graphs; cycles." },
    { n: "Rule of 0 / 3 / 5", d: "special member functions." },
    { n: "Virtual dispatch & vtables", d: "how polymorphism is implemented; vptr cost." },
    { n: "Undefined behavior", d: "dangling refs, data races, signed overflow, UB-driven optimizations." },
    { n: "Templates & perfect forwarding", d: "awareness level." },
    { n: "const-correctness & cache locality", d: "why data layout matters for rendering." },
  ]},
  { round: "lowlevel", cat: "WebAssembly & Emscripten", cue: '"how does Vani run C++ in the browser, what is slow"', items: [
    { n: "Linear memory model", d: "single growable ArrayBuffer; no GC." },
    { n: "JS ↔ WASM interop", d: "copying across the boundary; embind / ccall / cwrap." },
    { n: "Performance", d: "minimizing boundary crossings, passing pointers, SharedArrayBuffer + threads, SIMD." },
    { n: "Build pipeline", d: "Emscripten + CMake toolchain, -O flags, -s linker settings, growing memory, exported functions." },
  ]},
  { round: "lowlevel", cat: "Rendering (Skia + WebGPU)", cue: '"design the rendering layer", "60fps with 10k shapes"', items: [
    { n: "Skia", d: "paths, paints, text; CPU vs GPU backends." },
    { n: "WebGPU vs WebGL", d: "explicit pipelines, command buffers, bind groups, lower overhead." },
    { n: "Render pipeline", d: "vertex → rasterize → fragment; command encoding." },
    { n: "Batching & draw calls", d: "fewer draw calls = faster; instancing." },
    { n: "Dirty-region redraw", d: "only repaint what changed." },
    { n: "Frame budget", d: "16.6 ms @ 60fps; what blows it." },
    { n: "Retained vs immediate mode", d: "layering/compositing; text & tessellation." },
  ]},
  { round: "lowlevel", cat: "Cross-platform architecture", cue: "one codebase ships everywhere", items: [
    { n: "Shared C++ core + thin platform shells", d: "web/macOS/Windows/Android." },
    { n: "FFI bridges per platform", d: "threading model; how one codebase ships everywhere." },
  ]},
  { round: "lowlevel", cat: "Real-time collaboration", cue: '"how does Vani sync edits", "OT vs CRDT"', items: [
    { n: "Operational Transform", d: "transform functions, intention preservation, causality." },
    { n: "OT vs CRDT", d: "tradeoffs, when each wins." },
    { n: "Conflict resolution", d: "version vectors, undo in a collaborative setting." },
    { n: "WebSocket scaling", d: "fan-out, rooms, presence, reconnection/resync." },
  ]},

  // ---- SYSTEM DESIGN ----
  { round: "sysdesign", cat: "The framework (always this order)", cue: "never skip a step", items: [
    { n: "Clarify requirements", d: "functional + non-functional." },
    { n: "Scale estimates", d: "QPS, storage, bandwidth." },
    { n: "API design → data model", d: "contracts before architecture." },
    { n: "High-level architecture", d: "then deep-dive on 1–2 components." },
    { n: "Bottlenecks → trade-offs", d: "close strong." },
  ]},
  { round: "sysdesign", cat: "Building blocks (know cold)", cue: "the standard toolkit", items: [
    { n: "Load balancing; horizontal vs vertical scaling" },
    { n: "Caching + CDN", d: "cache-aside, write-through, TTL, eviction." },
    { n: "Database", d: "SQL vs NoSQL, indexing, sharding, replication, read replicas." },
    { n: "Consistency models", d: "strong vs eventual; CAP; idempotency." },
    { n: "Message queues / pub-sub", d: "async processing." },
    { n: "Real-time transport", d: "WebSocket vs SSE vs long-poll." },
    { n: "Rate limiting; consistent hashing; leader election; WAL" },
  ]},
  { round: "sysdesign", cat: "Collab / rendering patterns (your sweet spot)", cue: "lead with these", items: [
    { n: "Sync engine", d: "OT/CRDT server, op log, delta sync, version vectors." },
    { n: "Presence & multiplayer cursors", d: "fan-out, ephemeral state, heartbeat/expiry." },
    { n: "Offline-first editor", d: "local-first writes, queue + reconcile on reconnect." },
    { n: "Asset/image pipeline", d: "upload → process → CDN; thumbnails; dedupe." },
    { n: "LLM context-extraction service", d: "embeddings, vector store, chunking, retrieval." },
  ]},
  { round: "sysdesign", cat: "Practice prompts", cue: "drill these end-to-end", items: [
    { n: "Design a collaborative whiteboard" },
    { n: "Multiplayer cursor presence" },
    { n: "A sync engine" },
    { n: "An offline-first editor" },
    { n: "An image/asset pipeline" },
    { n: "An LLM context-extraction service" },
  ]},

  // ---- BEHAVIORAL ----
  { round: "behavioral", cat: "Story bank (STAR - quantify results)", cue: "6-8 stories from Vani / Zoho", items: [
    { n: "Shipped under a hard deadline" },
    { n: "Debugged a nasty rendering/performance bug", d: "Skia/WebGPU/frame budget." },
    { n: "Cross-platform conflict", d: "web vs macOS vs Android behavior." },
    { n: "A hard real-time-collab/OT bug" },
    { n: "Mentoring / helping a teammate" },
    { n: "Disagreement with a senior / pushed back with data" },
    { n: "Took ownership beyond your role" },
    { n: "A failure + what you learned" },
  ]},
  { round: "behavioral", cat: "Standard questions to script", cue: "have answers ready", items: [
    { n: "Why leave Zoho" },
    { n: "Why this company" },
    { n: "Strengths" },
    { n: "Weaknesses" },
    { n: "Biggest impact" },
    { n: "Conflict" },
    { n: "Failure" },
  ]},
  { round: "behavioral", cat: "Salary negotiation", cue: "anchor high, justify with the skill set", items: [
    { n: "Anchor to 20-25 LPA target (current ~15 LPA)", d: "Don't anchor low, don't disclose current first; justify with C++/WASM/rendering/collab." },
  ]},

  // ---- COMPANY ----
  { round: "company", cat: "Targets - what they test + my angle", cue: "fill before each interview", items: [
    { n: "Amazon", d: "DSA + Leadership Principles (write 2 stories per LP). High bar on optimal + edge cases." },
    { n: "PayPal", d: "DSA + payments/scale, idempotency, concurrency." },
    { n: "Dell", d: "DSA + real-time media/networking." },
    { n: "Cisco / Webex", d: "DSA + real-time; values your WebSocket/real-time background." },
    { n: "Comcast", d: "DSA + real-time media/networking." },
    { n: "Adobe", d: "algorithmic + some rendering; lean on Skia/WebGPU." },
    { n: "Figma", d: "rendering, canvas perf, WASM, OT/CRDT. Practical/take-home style." },
    { n: "Canva", d: "rendering, canvas perf, WASM. Your background is the headline." },
    { n: "Rive", d: "rendering, animation, WASM." },
    { n: "tldraw", d: "rendering, canvas, OT/CRDT." },
    { n: "FULL Creative", d: "practical builds, not hard DSA." },
  ]},
];

export const TOPICS: TopicDef[] = (() => {
  const out: TopicDef[] = [];
  let order = 0;
  for (const c of [...DSA_CATS, ...CATS]) {
    for (const item of c.items) {
      out.push({
        id: `t-${slug(c.round)}-${slug(c.cat)}-${slug(item.n)}`,
        roundKey: c.round,
        category: c.cat,
        cue: c.cue ?? null,
        name: item.n,
        description: item.d ?? null,
        order: order++,
      });
    }
  }
  return out;
})();

export function topicsForRound(roundKey: string): TopicDef[] {
  return TOPICS.filter((t) => t.roundKey === roundKey);
}
