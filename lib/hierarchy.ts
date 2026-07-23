// Class-hierarchy diagrams for the Cheat Sheets "Class Tree" tab.
//   Java  → the real Collections inheritance graph (interface -> implementation).
//   C++   → a taxonomy (STL containers aren't related by inheritance), grouped
//           by category, with what each is "backed by" noted on the node.
// Rendered as a top-down React-Flow tree (see components/ClassHierarchy.tsx).

export type ClassKind =
  | "interface"
  | "abstract"
  | "class"
  | "legacy"
  | "category"
  | "container";

export type ClassNode = {
  id: string;
  name: string;
  kind: ClassKind;
  note: string;
  /** deep-link to a Cheat Sheets tab + section, opened on click */
  link?: { tab: string; section: string };
};

export type ClassEdge = {
  parent: string; // the more general type (drawn on top)
  child: string; // the more specific type (drawn below)
  rel: "extends" | "implements" | "groups";
};

export type Hierarchy = {
  key: string;
  name: string;
  intro: string;
  /** which edge relationships actually appear — drives the legend */
  rels: ("extends" | "implements" | "groups")[];
  nodes: ClassNode[];
  edges: ClassEdge[];
};

/* ============================ JAVA COLLECTIONS ============================ */
const JAVA_HIERARCHY: Hierarchy = {
  key: "java",
  name: "Java Collections",
  intro:
    "Everything iterable descends from Iterable → Collection. List/Set/Queue are its three branches; Map is a SEPARATE root (not a Collection). Solid = extends, dashed = implements.",
  rels: ["extends", "implements"],
  nodes: [
    // ---- interfaces: the Collection side ----
    { id: "iterable", name: "Iterable", kind: "interface", note: "Root — enables the for-each loop." },
    { id: "collection", name: "Collection", kind: "interface", note: "add / remove / size / contains / iterator." },
    { id: "list", name: "List", kind: "interface", note: "Ordered, index-addressable, allows duplicates.", link: { tab: "java", section: "java-list" } },
    { id: "set", name: "Set", kind: "interface", note: "No duplicate elements.", link: { tab: "java", section: "java-set" } },
    { id: "sortedset", name: "SortedSet", kind: "interface", note: "A Set kept in sorted order." },
    { id: "navigableset", name: "NavigableSet", kind: "interface", note: "SortedSet + floor / ceiling / lower / higher.", link: { tab: "java", section: "java-tree" } },
    { id: "queue", name: "Queue", kind: "interface", note: "FIFO — offer / poll / peek." },
    { id: "deque", name: "Deque", kind: "interface", note: "Double-ended — works as stack AND queue.", link: { tab: "java", section: "java-deque" } },
    // ---- interfaces: the Map side (separate root) ----
    { id: "map", name: "Map", kind: "interface", note: "Key → value. NOT a Collection.", link: { tab: "java", section: "java-map" } },
    { id: "sortedmap", name: "SortedMap", kind: "interface", note: "A Map kept sorted by key." },
    { id: "navigablemap", name: "NavigableMap", kind: "interface", note: "SortedMap + floorKey / ceilingKey.", link: { tab: "java", section: "java-tree" } },

    // ---- concrete List implementations ----
    { id: "arraylist", name: "ArrayList", kind: "class", note: "Resizable array. O(1) get. The default list.", link: { tab: "java", section: "java-list" } },
    { id: "linkedlist", name: "LinkedList", kind: "class", note: "Doubly-linked; is ALSO a Deque.", link: { tab: "java", section: "java-list" } },
    { id: "vector", name: "Vector", kind: "legacy", note: "Synchronized ArrayList — legacy, avoid." },
    { id: "stack", name: "Stack", kind: "legacy", note: "Extends Vector — use ArrayDeque instead.", link: { tab: "java", section: "java-deque" } },
    // ---- concrete Set implementations ----
    { id: "hashset", name: "HashSet", kind: "class", note: "O(1), no order. Backed by a HashMap.", link: { tab: "java", section: "java-set" } },
    { id: "linkedhashset", name: "LinkedHashSet", kind: "class", note: "HashSet + insertion order.", link: { tab: "java", section: "java-set" } },
    { id: "treeset", name: "TreeSet", kind: "class", note: "Sorted, red-black tree, O(log n).", link: { tab: "java", section: "java-tree" } },
    // ---- concrete Queue/Deque implementations ----
    { id: "arraydeque", name: "ArrayDeque", kind: "class", note: "Fast stack & queue. No nulls.", link: { tab: "java", section: "java-deque" } },
    { id: "priorityqueue", name: "PriorityQueue", kind: "class", note: "Binary heap; min-heap by default.", link: { tab: "java", section: "java-heap" } },
    // ---- concrete Map implementations ----
    { id: "hashmap", name: "HashMap", kind: "class", note: "O(1) average. The default map.", link: { tab: "java", section: "java-map" } },
    { id: "linkedhashmap", name: "LinkedHashMap", kind: "class", note: "HashMap + order; the LRU-cache base.", link: { tab: "java", section: "java-linkedhashmap" } },
    { id: "treemap", name: "TreeMap", kind: "class", note: "Sorted keys, red-black tree, O(log n).", link: { tab: "java", section: "java-tree" } },
    { id: "hashtable", name: "Hashtable", kind: "legacy", note: "Synchronized legacy map — avoid." },
  ],
  edges: [
    // interface extends interface
    { parent: "iterable", child: "collection", rel: "extends" },
    { parent: "collection", child: "list", rel: "extends" },
    { parent: "collection", child: "set", rel: "extends" },
    { parent: "collection", child: "queue", rel: "extends" },
    { parent: "set", child: "sortedset", rel: "extends" },
    { parent: "sortedset", child: "navigableset", rel: "extends" },
    { parent: "queue", child: "deque", rel: "extends" },
    { parent: "map", child: "sortedmap", rel: "extends" },
    { parent: "sortedmap", child: "navigablemap", rel: "extends" },
    // class implements interface
    { parent: "list", child: "arraylist", rel: "implements" },
    { parent: "list", child: "linkedlist", rel: "implements" },
    { parent: "deque", child: "linkedlist", rel: "implements" }, // LinkedList is both!
    { parent: "list", child: "vector", rel: "implements" },
    { parent: "set", child: "hashset", rel: "implements" },
    { parent: "navigableset", child: "treeset", rel: "implements" },
    { parent: "deque", child: "arraydeque", rel: "implements" },
    { parent: "queue", child: "priorityqueue", rel: "implements" },
    { parent: "map", child: "hashmap", rel: "implements" },
    { parent: "map", child: "hashtable", rel: "implements" },
    { parent: "navigablemap", child: "treemap", rel: "implements" },
    // class extends class
    { parent: "vector", child: "stack", rel: "extends" },
    { parent: "hashset", child: "linkedhashset", rel: "extends" },
    { parent: "hashmap", child: "linkedhashmap", rel: "extends" },
  ],
};

/* ============================ C++ STL CONTAINERS ============================ */
const CPP_HIERARCHY: Hierarchy = {
  key: "cpp",
  name: "C++ STL Containers",
  intro:
    "C++ containers are NOT related by inheritance — they're independent templates. This is a taxonomy: four families, plus what each adaptor is backed by.",
  rels: ["groups"],
  nodes: [
    { id: "root", name: "STL Containers", kind: "category", note: "std:: — chosen by access pattern, not a class tree." },
    { id: "seq", name: "Sequence", kind: "category", note: "Order you insert; index or linked access." },
    { id: "ordered", name: "Associative (ordered)", kind: "category", note: "Red-black tree: sorted, O(log n)." },
    { id: "unordered", name: "Unordered (hash)", kind: "category", note: "Hash table: average O(1), no order." },
    { id: "adaptors", name: "Adaptors", kind: "category", note: "Restricted interface over another container." },

    { id: "vector", name: "vector", kind: "container", note: "Dynamic array, contiguous. The default.", link: { tab: "cpp", section: "cpp-vector" } },
    { id: "deque", name: "deque", kind: "container", note: "Double-ended; O(1) push/pop both ends.", link: { tab: "cpp", section: "cpp-vector" } },
    { id: "list", name: "list", kind: "container", note: "Doubly-linked list; O(1) splice.", link: { tab: "cpp", section: "cpp-vector" } },
    { id: "array", name: "array", kind: "container", note: "Fixed-size stack array (std::array).", link: { tab: "cpp", section: "cpp-vector" } },

    { id: "set", name: "set / multiset", kind: "container", note: "Sorted unique / multi keys.", link: { tab: "cpp", section: "cpp-ordered" } },
    { id: "map", name: "map / multimap", kind: "container", note: "Sorted key→value.", link: { tab: "cpp", section: "cpp-ordered" } },

    { id: "uset", name: "unordered_set", kind: "container", note: "Hash set, average O(1).", link: { tab: "cpp", section: "cpp-unordered" } },
    { id: "umap", name: "unordered_map", kind: "container", note: "Hash map, average O(1).", link: { tab: "cpp", section: "cpp-unordered" } },

    { id: "stack", name: "stack", kind: "container", note: "LIFO — backed by deque.", link: { tab: "cpp", section: "cpp-adaptor" } },
    { id: "queue", name: "queue", kind: "container", note: "FIFO — backed by deque.", link: { tab: "cpp", section: "cpp-adaptor" } },
    { id: "pq", name: "priority_queue", kind: "container", note: "Max-heap — backed by vector.", link: { tab: "cpp", section: "cpp-adaptor" } },
  ],
  edges: [
    { parent: "root", child: "seq", rel: "groups" },
    { parent: "root", child: "ordered", rel: "groups" },
    { parent: "root", child: "unordered", rel: "groups" },
    { parent: "root", child: "adaptors", rel: "groups" },
    { parent: "seq", child: "vector", rel: "groups" },
    { parent: "seq", child: "deque", rel: "groups" },
    { parent: "seq", child: "list", rel: "groups" },
    { parent: "seq", child: "array", rel: "groups" },
    { parent: "ordered", child: "set", rel: "groups" },
    { parent: "ordered", child: "map", rel: "groups" },
    { parent: "unordered", child: "uset", rel: "groups" },
    { parent: "unordered", child: "umap", rel: "groups" },
    { parent: "adaptors", child: "stack", rel: "groups" },
    { parent: "adaptors", child: "queue", rel: "groups" },
    { parent: "adaptors", child: "pq", rel: "groups" },
  ],
};

export const HIERARCHIES: Hierarchy[] = [JAVA_HIERARCHY, CPP_HIERARCHY];

export function hierarchyByKey(key: string): Hierarchy | undefined {
  return HIERARCHIES.find((h) => h.key === key);
}

export const KIND_STYLE: Record<ClassKind, { label: string; box: string; badge: string }> = {
  interface: { label: "interface", box: "border-indigo-400/50 bg-indigo-500/10", badge: "bg-indigo-500/20 text-indigo-200" },
  abstract: { label: "abstract", box: "border-amber-400/50 bg-amber-500/10", badge: "bg-amber-500/20 text-amber-200" },
  class: { label: "class", box: "border-emerald-400/50 bg-emerald-500/10", badge: "bg-emerald-500/20 text-emerald-200" },
  legacy: { label: "legacy", box: "border-rose-400/40 bg-rose-500/[0.07]", badge: "bg-rose-500/20 text-rose-200" },
  category: { label: "category", box: "border-violet-400/50 bg-violet-500/10", badge: "bg-violet-500/20 text-violet-200" },
  container: { label: "container", box: "border-sky-400/50 bg-sky-500/10", badge: "bg-sky-500/20 text-sky-200" },
};
