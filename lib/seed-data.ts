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

export type ProblemDef = {
  id: string;
  lcNumber: number;
  title: string;
  url: string;
  difficulty: string;
  pattern: string;
  companies: string;
  order: number;
};

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

const CATS: Cat[] = [
  // ---- DSA ----
  { round: "dsa", cat: "Arrays & Hashing", cue: '"have you seen this value / count of X"', items: [
    { n: "Hash map / frequency counting", d: "anagrams, top-K, first unique." },
    { n: "Prefix sum", d: "range-sum queries, subarray sum = k." },
    { n: "Encode/decode & in-place array tricks", d: "product except self, set matrix zeroes." },
  ]},
  { round: "dsa", cat: "Two Pointers", cue: '"pair/triplet that sums to", "is palindrome"', items: [
    { n: "Opposite-ends two pointers", d: "3Sum, container with most water, valid palindrome." },
    { n: "Fast & slow pointers", d: "cycle detection, middle of list, happy number." },
  ]},
  { round: "dsa", cat: "Sliding Window", cue: '"longest/shortest substring such that", "max sum of size k"', items: [
    { n: "Fixed window / variable window", d: "longest substring no-repeat, min window substring." },
  ]},
  { round: "dsa", cat: "Binary Search", cue: '"minimize the max", "find threshold"', items: [
    { n: "Classic + on rotated array", d: "sorted data or monotonic answer space." },
    { n: "Binary search on the answer", d: "Koko eating bananas, ship capacity (very common at Amazon)." },
  ]},
  { round: "dsa", cat: "Stack", cue: '"matching", "next greater/warmer"', items: [
    { n: "Valid parentheses / monotonic stack", d: "daily temperatures, largest rectangle." },
  ]},
  { round: "dsa", cat: "Linked List", cue: '"reverse in place", "reorder"', items: [
    { n: "Reverse / merge / cycle / copy-with-random", d: "pointer surgery, O(1) space." },
  ]},
  { round: "dsa", cat: "Trees", cue: '"path", "level", "ancestor"', items: [
    { n: "DFS (pre/in/post)", d: "recursion fundamentals." },
    { n: "BFS level-order", d: "queue-based traversal." },
    { n: "LCA, validate BST, serialize/deserialize", d: "classic tree manipulations." },
  ]},
  { round: "dsa", cat: "Tries", cue: '"starts with", "dictionary of words"', items: [
    { n: "Implement trie, word search II", d: "prefix queries on words." },
  ]},
  { round: "dsa", cat: "Heap / Top-K / Two-Heaps", cue: '"k largest/closest", "median so far"', items: [
    { n: "Heaps for running min/max, k-th element, median stream", d: "priority queue patterns." },
  ]},
  { round: "dsa", cat: "Backtracking", cue: '"all possible", "every combination"', items: [
    { n: "Subsets, permutations, combination sum, N-Queens, word search", d: "generate all combinations/permutations/subsets." },
  ]},
  { round: "dsa", cat: "Graphs", cue: '"islands", "prerequisites", "shortest path"', items: [
    { n: "BFS/DFS on grid", d: "number of islands, flood fill." },
    { n: "Topological sort", d: "course schedule, dependency ordering." },
    { n: "Union-Find", d: "connectivity, cycle detection." },
    { n: "Dijkstra / word ladder", d: "network delay, weighted shortest path." },
  ]},
  { round: "dsa", cat: "Dynamic Programming", cue: '"max/min ways", "can you reach"', items: [
    { n: "1-D DP", d: "climbing stairs, house robber, coin change, LIS." },
    { n: "2-D DP", d: "edit distance, LCS, unique paths, knapsack." },
  ]},
  { round: "dsa", cat: "Greedy", cue: '"minimum number of", "can you finish"', items: [
    { n: "Jump game, gas station, interval scheduling", d: "local optimum → global." },
  ]},
  { round: "dsa", cat: "Intervals", cue: '"merge", "meeting rooms", "overlap"', items: [
    { n: "Sort by start, merge/overlap", d: "merge intervals, meeting rooms." },
  ]},
  { round: "dsa", cat: "Math & Geometry", cue: '"rotate", "spiral", "overlapping rectangles"', items: [
    { n: "Matrix rotation, coordinate math, bit tricks", d: "rotate image, spiral matrix." },
  ]},
  { round: "dsa", cat: "Bit Manipulation", cue: '"single number", "count bits"', items: [
    { n: "XOR tricks, masks", d: "single number, count bits." },
  ]},
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
  for (const c of CATS) {
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

// [lcNumber, title, difficulty, pattern, companies]
const RAW_PROBLEMS: [number, string, string, string, string][] = [
  [1, "Two Sum", "Easy", "Arrays & Hashing", "Amazon,PayPal,Adobe"],
  [49, "Group Anagrams", "Medium", "Arrays & Hashing", "Amazon,Adobe"],
  [347, "Top K Frequent Elements", "Medium", "Arrays & Hashing", "Amazon"],
  [238, "Product of Array Except Self", "Medium", "Arrays & Hashing", "Amazon,Figma"],
  [560, "Subarray Sum Equals K", "Medium", "Arrays & Hashing", "PayPal"],
  [73, "Set Matrix Zeroes", "Medium", "Arrays & Hashing", "Adobe"],
  [125, "Valid Palindrome", "Easy", "Two Pointers", "Amazon"],
  [15, "3Sum", "Medium", "Two Pointers", "Amazon,Adobe"],
  [11, "Container With Most Water", "Medium", "Two Pointers", "Amazon"],
  [141, "Linked List Cycle", "Easy", "Two Pointers", "Amazon"],
  [202, "Happy Number", "Easy", "Two Pointers", ""],
  [876, "Middle of the Linked List", "Easy", "Two Pointers", ""],
  [3, "Longest Substring Without Repeating Characters", "Medium", "Sliding Window", "Amazon,Adobe"],
  [76, "Minimum Window Substring", "Hard", "Sliding Window", "Amazon"],
  [121, "Best Time to Buy and Sell Stock", "Easy", "Sliding Window", "Amazon,PayPal"],
  [704, "Binary Search", "Easy", "Binary Search", ""],
  [33, "Search in Rotated Sorted Array", "Medium", "Binary Search", "Amazon,Adobe"],
  [875, "Koko Eating Bananas", "Medium", "Binary Search", "Amazon"],
  [153, "Find Minimum in Rotated Sorted Array", "Medium", "Binary Search", ""],
  [20, "Valid Parentheses", "Easy", "Stack", "Amazon,PayPal"],
  [739, "Daily Temperatures", "Medium", "Stack", "Amazon"],
  [84, "Largest Rectangle in Histogram", "Hard", "Stack", ""],
  [206, "Reverse Linked List", "Easy", "Linked List", "Amazon,Adobe"],
  [21, "Merge Two Sorted Lists", "Easy", "Linked List", "Amazon"],
  [138, "Copy List with Random Pointer", "Medium", "Linked List", "Amazon,Figma"],
  [143, "Reorder List", "Medium", "Linked List", "Amazon"],
  [226, "Invert Binary Tree", "Easy", "Trees", "Amazon"],
  [104, "Maximum Depth of Binary Tree", "Easy", "Trees", ""],
  [102, "Binary Tree Level Order Traversal", "Medium", "Trees", "Amazon,Adobe"],
  [98, "Validate Binary Search Tree", "Medium", "Trees", "Amazon"],
  [235, "Lowest Common Ancestor of a BST", "Medium", "Trees", "Amazon"],
  [297, "Serialize and Deserialize Binary Tree", "Hard", "Trees", "Amazon,Figma"],
  [208, "Implement Trie (Prefix Tree)", "Medium", "Tries", "Amazon"],
  [212, "Word Search II", "Hard", "Tries", "Amazon"],
  [215, "Kth Largest Element in an Array", "Medium", "Heap / Top-K / Two-Heaps", "Amazon,PayPal"],
  [295, "Find Median from Data Stream", "Hard", "Heap / Top-K / Two-Heaps", "Amazon"],
  [973, "K Closest Points to Origin", "Medium", "Heap / Top-K / Two-Heaps", "Amazon"],
  [78, "Subsets", "Medium", "Backtracking", "Amazon,Adobe"],
  [46, "Permutations", "Medium", "Backtracking", "Adobe"],
  [39, "Combination Sum", "Medium", "Backtracking", "Amazon"],
  [79, "Word Search", "Medium", "Backtracking", "Amazon"],
  [51, "N-Queens", "Hard", "Backtracking", ""],
  [200, "Number of Islands", "Medium", "Graphs", "Amazon,Adobe,Figma"],
  [207, "Course Schedule", "Medium", "Graphs", "Amazon"],
  [133, "Clone Graph", "Medium", "Graphs", "Amazon"],
  [417, "Pacific Atlantic Water Flow", "Medium", "Graphs", ""],
  [127, "Word Ladder", "Hard", "Graphs", "Amazon"],
  [743, "Network Delay Time", "Medium", "Graphs", ""],
  [70, "Climbing Stairs", "Easy", "Dynamic Programming", "Adobe"],
  [198, "House Robber", "Medium", "Dynamic Programming", "Amazon"],
  [322, "Coin Change", "Medium", "Dynamic Programming", "Amazon,PayPal"],
  [300, "Longest Increasing Subsequence", "Medium", "Dynamic Programming", "Amazon"],
  [72, "Edit Distance", "Hard", "Dynamic Programming", "Amazon"],
  [1143, "Longest Common Subsequence", "Medium", "Dynamic Programming", "Adobe"],
  [62, "Unique Paths", "Medium", "Dynamic Programming", "Amazon"],
  [55, "Jump Game", "Medium", "Greedy", "Amazon,Adobe"],
  [134, "Gas Station", "Medium", "Greedy", "Amazon"],
  [56, "Merge Intervals", "Medium", "Intervals", "Amazon,Figma,Adobe"],
  [253, "Meeting Rooms II", "Medium", "Intervals", "Amazon"],
  [57, "Insert Interval", "Medium", "Intervals", "Amazon"],
  [48, "Rotate Image", "Medium", "Math & Geometry", "Amazon,Adobe"],
  [54, "Spiral Matrix", "Medium", "Math & Geometry", "Amazon"],
  [136, "Single Number", "Easy", "Bit Manipulation", ""],
  [191, "Number of 1 Bits", "Easy", "Bit Manipulation", ""],
  [338, "Counting Bits", "Easy", "Bit Manipulation", ""],
];

export const PROBLEMS: ProblemDef[] = RAW_PROBLEMS.map(
  ([lcNumber, title, difficulty, pattern, companies], i) => ({
    id: `p-lc${lcNumber}`,
    lcNumber,
    title,
    difficulty,
    pattern,
    companies,
    url: `https://leetcode.com/problems/${slug(title)}/`,
    order: i,
  })
);

export function topicsForRound(roundKey: string): TopicDef[] {
  return TOPICS.filter((t) => t.roundKey === roundKey);
}
