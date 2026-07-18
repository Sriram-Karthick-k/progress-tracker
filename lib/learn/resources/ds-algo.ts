import { ResourceDomain } from "../resource-types";

// DATA STRUCTURES & ALGORITHMS — the reference hub for every structure and core
// algorithm, each with the best FREE resources to actually learn it (not just
// LeetCode problems). Curated from long-lived canonical sources: VisuAlgo
// (interactive), CP-Algorithms, Princeton algs4, Programiz, William Fiset &
// Abdul Bari (video), MIT OCW, official Java docs, and free textbooks.

// Reusable video playlists (stable YouTube playlist ids).
const FISET_DS = "https://www.youtube.com/playlist?list=PLDV1Zeh2NRsB6SWUrDFW2RmDotAfPbeHu";
const FISET_GRAPH = "https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P";
const ABDUL_BARI = "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O";
const ERICKSON = "https://jeffe.cs.illinois.edu/teaching/algorithms/";
const MIT_6006 = "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/";

export const DS_ALGO: ResourceDomain = {
  key: "ds-algo",
  name: "Data Structures & Algorithms",
  tagline:
    "Every data structure and core algorithm — with the best free resources (visualizers, articles, videos, books) to learn each one, not just LeetCode problems.",
  icon: "Boxes",
  accent: "from-cyan-500 to-blue-600",
  sections: [
    {
      id: "foundations",
      title: "Foundations",
      desc: "The mental models everything else builds on.",
      topics: [
        {
          id: "complexity",
          title: "Time & space complexity (Big-O)",
          blurb: "Asymptotic analysis, common growth classes, amortized cost.",
          resources: [
            { kind: "article", label: "Big-O Cheat Sheet — complexity of every structure", by: "bigocheatsheet.com", url: "https://www.bigocheatsheet.com/" },
            { kind: "article", label: "Asymptotic (Big-O) notation explained", by: "Programiz", url: "https://www.programiz.com/dsa/asymptotic-notations" },
            { kind: "course", label: "MIT 6.006 Introduction to Algorithms (free lectures)", by: "MIT OpenCourseWare", url: MIT_6006 },
          ],
        },
        {
          id: "recursion",
          title: "Recursion",
          blurb: "Base/recursive cases, the call stack, recursion trees.",
          resources: [
            { kind: "practice", label: "Recursion visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/recursion" },
            { kind: "article", label: "Recursion (computer science)", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/Recursion_(computer_science)" },
            { kind: "video", label: "Algorithms course (recursion & analysis)", by: "Abdul Bari", url: ABDUL_BARI },
            { kind: "book", label: "Algorithms — Recursion (free book)", by: "Jeff Erickson", url: ERICKSON },
          ],
        },
        {
          id: "bit-manipulation",
          title: "Bit manipulation",
          blurb: "AND/OR/XOR/shifts, masks, and the classic bit tricks.",
          resources: [
            { kind: "article", label: "Bit Twiddling Hacks — the classic reference", by: "Sean Anderson · Stanford", url: "https://graphics.stanford.edu/~seander/bithacks.html" },
            { kind: "docs", label: "Bitwise operation", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/Bitwise_operation" },
            { kind: "practice", label: "Bitmask visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/bitmask" },
          ],
        },
      ],
    },
    {
      id: "linear",
      title: "Linear structures",
      desc: "Contiguous and linked sequences, and the containers built on them.",
      topics: [
        {
          id: "arrays",
          title: "Arrays & dynamic arrays",
          blurb: "Contiguous memory, O(1) index, amortized-O(1) append (doubling).",
          resources: [
            { kind: "docs", label: "Dynamic array", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/Dynamic_array" },
            { kind: "practice", label: "List visualizer (array & linked)", by: "VisuAlgo", url: "https://visualgo.net/en/list" },
            { kind: "book", label: "Open Data Structures — array-based lists (free)", by: "Pat Morin", url: "https://opendatastructures.org/" },
          ],
        },
        {
          id: "linked-list",
          title: "Linked lists (singly / doubly)",
          blurb: "Nodes & pointers, O(1) splice, the dummy-head idiom.",
          resources: [
            { kind: "article", label: "Linked list", by: "Programiz", url: "https://www.programiz.com/dsa/linked-list" },
            { kind: "practice", label: "Linked list visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/list" },
            { kind: "video", label: "Data Structures playlist (linked lists)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "stack",
          title: "Stack (LIFO)",
          blurb: "Push/pop/peek, call stacks, and expression evaluation.",
          resources: [
            { kind: "article", label: "Stack data structure", by: "Programiz", url: "https://www.programiz.com/dsa/stack" },
            { kind: "practice", label: "Stack / list visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/list" },
            { kind: "video", label: "Data Structures playlist (stack)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "queue-deque",
          title: "Queue & Deque",
          blurb: "FIFO queues, double-ended queues, and ring buffers.",
          resources: [
            { kind: "article", label: "Queue data structure", by: "Programiz", url: "https://www.programiz.com/dsa/queue" },
            { kind: "article", label: "Deque (double-ended queue)", by: "Programiz", url: "https://www.programiz.com/dsa/deque" },
            { kind: "docs", label: "java.util.Deque (ArrayDeque)", by: "Oracle Java 17", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Deque.html" },
          ],
        },
        {
          id: "hash-table",
          title: "Hash tables / hash maps",
          blurb: "Hash functions, collisions (chaining vs open addressing), load factor.",
          resources: [
            { kind: "article", label: "Hash table", by: "Programiz", url: "https://www.programiz.com/dsa/hash-table" },
            { kind: "practice", label: "Hash table visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/hashtable" },
            { kind: "article", label: "Hash tables (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/34hash/" },
            { kind: "video", label: "Data Structures playlist (hash tables)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "priority-queue",
          title: "Priority Queue & Binary Heap",
          blurb: "Heap-ordered array, sift-up/down, O(log n) push/pop, heapify.",
          resources: [
            { kind: "docs", label: "java.util.PriorityQueue", by: "Oracle Java 17", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/PriorityQueue.html" },
            { kind: "article", label: "Priority queue", by: "Programiz", url: "https://www.programiz.com/dsa/priority-queue" },
            { kind: "practice", label: "Binary heap visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/heap" },
            { kind: "article", label: "Priority queues & heapsort (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/24pq/" },
            { kind: "video", label: "Data Structures playlist (priority queue / heap)", by: "William Fiset", url: FISET_DS },
          ],
        },
      ],
    },
    {
      id: "trees",
      title: "Trees & heaps",
      desc: "Hierarchies, ordered trees, and range-query structures.",
      topics: [
        {
          id: "binary-tree",
          title: "Binary trees & traversals",
          blurb: "Pre/in/post-order, level-order, and recursion over children.",
          resources: [
            { kind: "article", label: "Binary tree", by: "Programiz", url: "https://www.programiz.com/dsa/binary-tree" },
            { kind: "practice", label: "BST / traversal visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/bst" },
            { kind: "video", label: "Data Structures playlist (trees)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "bst",
          title: "Binary Search Tree (BST)",
          blurb: "Ordering invariant, search/insert/delete, in-order = sorted.",
          resources: [
            { kind: "article", label: "Binary search tree", by: "Programiz", url: "https://www.programiz.com/dsa/binary-search-tree" },
            { kind: "practice", label: "BST visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/bst" },
            { kind: "article", label: "Binary search trees (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/32bst/" },
          ],
        },
        {
          id: "balanced-trees",
          title: "Balanced trees (AVL / Red-Black)",
          blurb: "Rotations and invariants that keep height O(log n).",
          resources: [
            { kind: "article", label: "AVL tree", by: "Programiz", url: "https://www.programiz.com/dsa/avl-tree" },
            { kind: "article", label: "Red-Black tree", by: "Programiz", url: "https://www.programiz.com/dsa/red-black-tree" },
            { kind: "article", label: "Balanced search trees (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/33balanced/" },
            { kind: "practice", label: "AVL tree visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/bst" },
          ],
        },
        {
          id: "trie",
          title: "Trie (prefix tree)",
          blurb: "Character-indexed tree for prefix search / autocomplete.",
          resources: [
            { kind: "article", label: "Tries (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/52trie/" },
            { kind: "docs", label: "Trie", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/Trie" },
            { kind: "video", label: "Data Structures playlist (trie)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "segment-tree",
          title: "Segment tree",
          blurb: "Range queries + point/range updates in O(log n).",
          resources: [
            { kind: "article", label: "Segment tree (in depth)", by: "CP-Algorithms", url: "https://cp-algorithms.com/data_structures/segment_tree.html" },
            { kind: "practice", label: "Segment tree visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/segmenttree" },
          ],
        },
        {
          id: "fenwick",
          title: "Fenwick / Binary Indexed Tree",
          blurb: "Prefix sums with point updates in O(log n) and tiny code.",
          resources: [
            { kind: "article", label: "Fenwick tree", by: "CP-Algorithms", url: "https://cp-algorithms.com/data_structures/fenwick.html" },
            { kind: "practice", label: "Fenwick tree visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/fenwicktree" },
            { kind: "video", label: "Data Structures playlist (Fenwick tree)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "b-tree",
          title: "B-tree / B+-tree",
          blurb: "High-fanout trees behind databases and filesystems.",
          resources: [
            { kind: "docs", label: "B-tree", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/B-tree" },
            { kind: "course", label: "MIT 6.006 (memory hierarchy & B-trees)", by: "MIT OpenCourseWare", url: MIT_6006 },
          ],
        },
      ],
    },
    {
      id: "graphs",
      title: "Graphs",
      desc: "Representations plus the traversal and shortest-path/MST toolkit.",
      topics: [
        {
          id: "graph-basics",
          title: "Graph representations",
          blurb: "Adjacency list vs matrix; directed/weighted variants.",
          resources: [
            { kind: "article", label: "Graph data structure", by: "Programiz", url: "https://www.programiz.com/dsa/graph" },
            { kind: "practice", label: "Graph structures visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/graphds" },
            { kind: "video", label: "Graph Theory playlist", by: "William Fiset", url: FISET_GRAPH },
          ],
        },
        {
          id: "bfs-dfs",
          title: "BFS & DFS",
          blurb: "The two core traversals; visited sets; components.",
          resources: [
            { kind: "article", label: "Breadth-first search", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/breadth-first-search.html" },
            { kind: "article", label: "Depth-first search", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/depth-first-search.html" },
            { kind: "practice", label: "DFS/BFS visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/dfsbfs" },
          ],
        },
        {
          id: "union-find",
          title: "Union-Find / DSU",
          blurb: "Dynamic connectivity with union-by-rank + path compression.",
          resources: [
            { kind: "article", label: "Disjoint set union", by: "CP-Algorithms", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html" },
            { kind: "practice", label: "Union-Find (UFDS) visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/ufds" },
            { kind: "video", label: "Data Structures playlist (union-find)", by: "William Fiset", url: FISET_DS },
          ],
        },
        {
          id: "topological-sort",
          title: "Topological sort",
          blurb: "Ordering a DAG; Kahn's algorithm and DFS finish times.",
          resources: [
            { kind: "article", label: "Topological sorting", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/topological-sort.html" },
            { kind: "video", label: "Graph Theory playlist (topological sort)", by: "William Fiset", url: FISET_GRAPH },
          ],
        },
        {
          id: "shortest-path",
          title: "Shortest paths",
          blurb: "Dijkstra, Bellman-Ford, and Floyd-Warshall — when to use which.",
          resources: [
            { kind: "article", label: "Dijkstra's algorithm", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/dijkstra.html" },
            { kind: "article", label: "Bellman-Ford", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/bellman_ford.html" },
            { kind: "article", label: "Floyd-Warshall (all pairs)", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html" },
            { kind: "practice", label: "Shortest path visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/sssp" },
          ],
        },
        {
          id: "mst",
          title: "Minimum spanning tree",
          blurb: "Kruskal (sort + union-find) and Prim (grow with a heap).",
          resources: [
            { kind: "article", label: "Kruskal's MST", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/mst_kruskal.html" },
            { kind: "article", label: "Prim's MST", by: "CP-Algorithms", url: "https://cp-algorithms.com/graph/mst_prim.html" },
            { kind: "practice", label: "MST visualizer", by: "VisuAlgo", url: "https://visualgo.net/en/mst" },
            { kind: "article", label: "Minimum spanning trees (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/43mst/" },
          ],
        },
      ],
    },
    {
      id: "searching-sorting",
      title: "Searching & sorting",
      desc: "The workhorse algorithms and their trade-offs.",
      topics: [
        {
          id: "binary-search",
          title: "Binary search",
          blurb: "Halving a sorted range; searching the answer space.",
          resources: [
            { kind: "article", label: "Binary search", by: "Programiz", url: "https://www.programiz.com/dsa/binary-search" },
            { kind: "video", label: "Algorithms course (binary search)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
        {
          id: "sorting",
          title: "Sorting algorithms",
          blurb: "Merge/quick/heap/counting/radix — stability & when each wins.",
          resources: [
            { kind: "practice", label: "Sorting visualizer (all algorithms)", by: "VisuAlgo", url: "https://visualgo.net/en/sorting" },
            { kind: "article", label: "Mergesort (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/22mergesort/" },
            { kind: "article", label: "Quicksort (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/23quicksort/" },
            { kind: "video", label: "Algorithms course (sorting)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
      ],
    },
    {
      id: "paradigms",
      title: "Algorithm paradigms",
      desc: "The four ways to structure a solution.",
      topics: [
        {
          id: "recursion-backtracking",
          title: "Recursion & backtracking",
          blurb: "Explore choices, prune, and undo — subsets/permutations.",
          resources: [
            { kind: "article", label: "Backtracking", by: "Programiz", url: "https://www.programiz.com/dsa/backtracking-algorithm" },
            { kind: "book", label: "Algorithms — Backtracking (free book)", by: "Jeff Erickson", url: ERICKSON },
            { kind: "video", label: "Algorithms course (backtracking)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
        {
          id: "divide-conquer",
          title: "Divide & conquer",
          blurb: "Split, solve halves, combine; the recurrence is the insight.",
          resources: [
            { kind: "article", label: "Divide and conquer", by: "Programiz", url: "https://www.programiz.com/dsa/divide-and-conquer" },
            { kind: "course", label: "MIT 6.006 (divide & conquer)", by: "MIT OpenCourseWare", url: MIT_6006 },
            { kind: "video", label: "Algorithms course (D&C)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
        {
          id: "greedy",
          title: "Greedy",
          blurb: "Locally-best choices that are provably globally optimal.",
          resources: [
            { kind: "article", label: "Greedy algorithms", by: "Programiz", url: "https://www.programiz.com/dsa/greedy-algorithm" },
            { kind: "book", label: "Algorithms — Greedy (free book)", by: "Jeff Erickson", url: ERICKSON },
            { kind: "video", label: "Algorithms course (greedy)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
        {
          id: "dynamic-programming",
          title: "Dynamic programming",
          blurb: "Overlapping subproblems, memoization vs tabulation.",
          resources: [
            { kind: "article", label: "Dynamic programming", by: "Programiz", url: "https://www.programiz.com/dsa/dynamic-programming" },
            { kind: "book", label: "Algorithms — Dynamic Programming (free book)", by: "Jeff Erickson", url: ERICKSON },
            { kind: "course", label: "MIT 6.006 (DP lectures)", by: "MIT OpenCourseWare", url: MIT_6006 },
            { kind: "video", label: "Algorithms course (DP)", by: "Abdul Bari", url: ABDUL_BARI },
          ],
        },
      ],
    },
    {
      id: "strings",
      title: "String algorithms",
      desc: "Efficient matching and hashing over text.",
      topics: [
        {
          id: "string-matching",
          title: "Pattern matching (KMP / Z)",
          blurb: "Linear-time substring search via prefix/Z functions.",
          resources: [
            { kind: "article", label: "Prefix function (KMP)", by: "CP-Algorithms", url: "https://cp-algorithms.com/string/prefix-function.html" },
            { kind: "article", label: "Z-function", by: "CP-Algorithms", url: "https://cp-algorithms.com/string/z-function.html" },
            { kind: "article", label: "Substring search (algs4)", by: "Sedgewick · Princeton", url: "https://algs4.cs.princeton.edu/53substring/" },
          ],
        },
        {
          id: "string-hashing",
          title: "String hashing (Rabin-Karp)",
          blurb: "Rolling hashes for fast equality and multi-pattern search.",
          resources: [
            { kind: "article", label: "String hashing", by: "CP-Algorithms", url: "https://cp-algorithms.com/string/string-hashing.html" },
            { kind: "docs", label: "Rabin-Karp algorithm", by: "Wikipedia", url: "https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm" },
          ],
        },
      ],
    },
  ],
};
