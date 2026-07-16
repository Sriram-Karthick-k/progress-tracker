import { LearnDomain } from "./types";

export const JAVA: LearnDomain = {
  key: "java",
  name: "Java",
  tagline: "Language basics → collections deep-dive → streams, concurrency, JVM. Everything you need for a Java-first interview.",
  icon: "Coffee",
  accent: "from-orange-500 to-amber-600",
  sections: [
    /* ================= 1. LANGUAGE BASICS ================= */
    {
      id: "basics",
      title: "Language Basics",
      desc: "Types, control flow, arrays, methods — the ground floor.",
      lessons: [
        {
          id: "types",
          title: "Primitives, wrappers & casting",
          summary: "8 primitives, their wrapper classes, autoboxing, and where casting bites.",
          blocks: [
            {
              t: "table",
              head: ["Primitive", "Size", "Range / note", "Wrapper"],
              rows: [
                ["byte", "8-bit", "-128..127", "Byte"],
                ["short", "16-bit", "±32k", "Short"],
                ["int", "32-bit", "±2.1e9 (default for ints)", "Integer"],
                ["long", "64-bit", "±9.2e18 — literal needs L: `10L`", "Long"],
                ["float", "32-bit", "needs f: `1.5f`", "Float"],
                ["double", "64-bit", "default for decimals", "Double"],
                ["char", "16-bit", "UTF-16 code unit: `'a'`", "Character"],
                ["boolean", "—", "true/false only (no 0/1)", "Boolean"],
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `int i = 130;
byte b = (byte) i;        // -126 — narrowing cast wraps around!
long big = i;             // widening is implicit
double d = 7 / 2;         // 3.0 (int division happens FIRST)
double ok = 7 / 2.0;      // 3.5
int back = (int) 3.99;    // 3 — cast truncates, never rounds

Integer boxed = 127, boxed2 = 127;
System.out.println(boxed == boxed2);      // true  (Integer cache -128..127)
Integer big1 = 128, big2 = 128;
System.out.println(big1 == big2);         // false (!) — use .equals()`,
            },
            {
              t: "note",
              md: "Interview trap: `Integer == Integer` only works inside the -128..127 cache. Always compare wrappers with `.equals()`. Also watch `int` overflow — use `long` for sums/products of array values.",
            },
          ],
        },
        {
          id: "control-flow",
          title: "Control flow & switch",
          summary: "Loops, labeled break, and the modern switch expression.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `for (int i = 0; i < n; i++) { ... }
for (int x : arr) { ... }                 // enhanced for (read-only view)
while (cond) { ... }   do { ... } while (cond);

outer:                                     // labeled break for nested loops
for (int i = 0; i < n; i++)
  for (int j = 0; j < m; j++)
    if (grid[i][j] == target) break outer;

// Modern switch (Java 14+): expression, no fall-through
String size = switch (n) {
  case 0, 1 -> "small";
  case 2 -> "medium";
  default -> "large";
};`,
            },
            {
              t: "note",
              md: "Classic `switch` falls through without `break` — a favorite bug question. The arrow form (`->`) never falls through.",
            },
          ],
        },
        {
          id: "arrays",
          title: "Arrays & 2D arrays",
          summary: "Creation, defaults, jagged arrays, and the utility methods you'll actually use.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `int[] a = new int[5];                 // all 0 (booleans false, objects null)
int[] b = {3, 1, 2};
int[][] grid = new int[rows][cols];   // 2D, all 0
int[][] jagged = new int[3][];        // rows of different lengths
jagged[0] = new int[]{1, 2};

a.length                              // field, NOT a method (vs s.length())
Arrays.sort(b);                       // in place
Arrays.fill(a, -1);
int[] copy = Arrays.copyOfRange(b, 0, 2);
Arrays.toString(a);                   // "[...]" — for printing
Arrays.deepToString(grid);            // 2D printing
Arrays.equals(a, b);                  // element-wise (== compares references!)`,
            },
            {
              t: "note",
              md: "`array.length` (field), `string.length()` (method), `list.size()` (method) — mixing these up is the most common Java syntax slip in interviews.",
            },
          ],
        },
        {
          id: "methods-static",
          title: "Methods, varargs, static vs instance",
          summary: "Pass-by-value semantics, varargs, and what static really means.",
          blocks: [
            {
              t: "p",
              md: "Java is **always pass-by-value**. For objects, the *reference* is copied — so you can mutate the object the caller sees, but reassigning the parameter does nothing to the caller.",
            },
            {
              t: "code",
              lang: "java",
              code: `void mutate(List<Integer> list) { list.add(1); }   // caller SEES this
void reassign(List<Integer> list) { list = new ArrayList<>(); } // caller does NOT

static int max(int... nums) {            // varargs = int[] under the hood
  int best = Integer.MIN_VALUE;
  for (int n : nums) best = Math.max(best, n);
  return best;
}

class Counter {
  static int total;      // one per CLASS — shared by all instances
  int count;             // one per INSTANCE
  static void reset() { total = 0; }   // static methods can't touch 'this'
}`,
            },
          ],
        },
      ],
    },

    /* ================= 2. STRINGS ================= */
    {
      id: "strings",
      title: "Strings",
      desc: "Immutability, the pool, StringBuilder, and the helper methods.",
      lessons: [
        {
          id: "string-immutability",
          title: "Immutability & the string pool",
          summary: "Why == on strings is a bug and why += in a loop is O(n²).",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `String a = "hi";              // goes to the string pool
String b = "hi";              // SAME pooled object
String c = new String("hi");  // forced new object on the heap
a == b        // true (pool) — but NEVER rely on it
a == c        // false
a.equals(c)   // true — ALWAYS compare with equals
a.compareTo(b) // 0; lexicographic <0 / 0 / >0`,
            },
            {
              t: "p",
              md: "Every 'modifying' method (`replace`, `toUpperCase`, `substring`, `concat`) returns a **new** String — the original never changes. `s += x` in a loop copies the whole string each time: **O(n²)**. Use `StringBuilder`.",
            },
          ],
        },
        {
          id: "string-methods",
          title: "The String method toolkit",
          summary: "The ~15 methods that cover 95% of interview needs.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `s.length();  s.charAt(i);  s.isEmpty();  s.isBlank();
s.substring(2);        // from index 2 to end (copy)
s.substring(1, 4);     // [1, 4) — end exclusive
s.indexOf("ab");  s.lastIndexOf('x');   // -1 if absent
s.contains("ab");  s.startsWith("pre");  s.endsWith("suf");
s.replace('a', 'b');          // all occurrences (char or CharSequence)
s.toUpperCase();  s.toLowerCase();  s.trim();  s.strip();
s.split(",");                 // REGEX! split("\\\\.") for a dot
s.split(",", -1);             // keep trailing empty strings
String.join("-", "a", "b");   // "a-b"
s.toCharArray();              // for char-level work
s.chars()                     // IntStream of chars
String.valueOf(42);  Integer.parseInt("42");
s.repeat(3);  s.strip();      // Java 11+`,
            },
            {
              t: "note",
              md: "`split` takes a **regex**: `split(\".\")` splits on every character (dot = any char). Escape it: `split(\"\\\\.\")`. Same for `|`, `*`, `+`, `?`.",
            },
          ],
        },
        {
          id: "stringbuilder",
          title: "StringBuilder",
          summary: "The mutable string — building, inserting, reversing in O(1) amortized appends.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `StringBuilder sb = new StringBuilder();
sb.append("ab").append(42).append('c');   // chainable, any type
sb.insert(0, "X");        // O(n) — shifts everything
sb.deleteCharAt(0);  sb.delete(1, 3);     // [1,3)
sb.setCharAt(0, 'z');
sb.reverse();             // in place — palindrome tricks
sb.charAt(i);  sb.length();
sb.setLength(sb.length() - 1);            // fast "remove last char"
String result = sb.toString();`,
            },
            {
              t: "p",
              md: "`StringBuffer` is the synchronized twin — never needed in interviews. For char counting prefer `int[] freq = new int[26]; freq[c - 'a']++`.",
            },
          ],
        },
      ],
    },

    /* ================= 3. OOP ================= */
    {
      id: "oop",
      title: "OOP in Java",
      desc: "Classes, inheritance, interfaces, records, enums — Java's object model.",
      lessons: [
        {
          id: "classes-constructors",
          title: "Classes, constructors & this",
          summary: "Construction order, overloaded constructors, and initialization.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Point {
  final int x, y;                 // final fields must be set by construction end

  Point(int x, int y) { this.x = x; this.y = y; }
  Point() { this(0, 0); }         // constructor chaining via this(...)

  @Override public String toString() { return "(" + x + "," + y + ")"; }
  @Override public boolean equals(Object o) {
    if (!(o instanceof Point p)) return false;   // pattern matching (16+)
    return x == p.x && y == p.y;
  }
  @Override public int hashCode() { return Objects.hash(x, y); }
}`,
            },
            {
              t: "note",
              md: "If you override `equals`, you **must** override `hashCode` — equal objects must have equal hash codes, or HashMap/HashSet silently break. This is a top-5 Java interview question.",
            },
          ],
        },
        {
          id: "inheritance-polymorphism",
          title: "Inheritance & polymorphism",
          summary: "extends, super, overriding vs overloading, dynamic dispatch.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Shape {
  double area() { return 0; }
  void describe() { System.out.println("area=" + area()); } // calls the OVERRIDE
}
class Circle extends Shape {
  double r;
  Circle(double r) { this.r = r; }
  @Override double area() { return Math.PI * r * r; }       // overriding: runtime
  double area(int precision) { return 0; }                  // overloading: compile time
}

Shape s = new Circle(2);       // upcast: always safe
s.area();                      // 12.57 — dynamic dispatch picks Circle's method
if (s instanceof Circle c) c.r = 3;   // safe downcast with pattern matching`,
            },
            {
              t: "ul",
              items: [
                "**Overriding** = same signature in subclass → resolved at **runtime** (dynamic dispatch).",
                "**Overloading** = same name, different parameters → resolved at **compile time**.",
                "Fields are NOT polymorphic — only methods dispatch dynamically.",
                "`super.method()` calls the parent version; `super(...)` must be the first constructor statement.",
                "`final` class = no subclassing; `final` method = no overriding; `private`/`static` methods don't dispatch.",
              ],
            },
          ],
        },
        {
          id: "interface-abstract",
          title: "Interface vs abstract class",
          summary: "When to use which — a guaranteed interview question.",
          blocks: [
            {
              t: "table",
              head: ["", "Interface", "Abstract class"],
              rows: [
                ["State", "constants only (+ no instance fields)", "full instance fields"],
                ["Constructors", "no", "yes (called via super)"],
                ["Methods", "abstract + default + static", "any mix, any visibility"],
                ["Inheritance", "a class implements MANY", "extends exactly ONE"],
                ["Use when", "capability/contract: `Comparable`, `Runnable`", "shared base with common state/logic"],
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `interface Payable {
  double pay();                              // abstract by default
  default String currency() { return "USD"; }  // default method: shared impl
}
abstract class Employee implements Payable {
  protected String name;                     // shared state
  Employee(String name) { this.name = name; }
  abstract double base();                    // subclass must provide
  public double pay() { return base() * 1.1; }
}`,
            },
            {
              t: "note",
              md: "Rule of thumb: interface = **what it can do**, abstract class = **what it is**. Prefer interfaces; reach for an abstract class only when you need shared *state*.",
            },
          ],
        },
        {
          id: "enums-records",
          title: "Enums & records",
          summary: "Type-safe constants with behavior; records as free data classes.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `enum Status {
  TODO, ATTEMPTED, LEARNING, DONE;
  Status next() { return values()[(ordinal() + 1) % values().length]; }
}
enum Coin {
  PENNY(1), NICKEL(5), DIME(10);       // enums can carry data + methods
  final int cents;
  Coin(int cents) { this.cents = cents; }
}
Status.valueOf("DONE");  s.name();  s.ordinal();
// EnumMap / EnumSet: fastest possible map/set for enum keys

record Point(int x, int y) {}          // Java 16+: final class with
// constructor, accessors x() y(), equals, hashCode, toString — all generated
record Range(int lo, int hi) {
  Range { if (lo > hi) throw new IllegalArgumentException(); } // compact validator
}`,
            },
            {
              t: "p",
              md: "Enums are the correct Singleton in Java (serialization-safe, reflection-safe). Records are perfect for value objects, map keys, and returning multiple values.",
            },
          ],
        },
        {
          id: "nested-classes",
          title: "Nested & inner classes",
          summary: "static nested vs inner vs anonymous vs lambda.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Graph {
  static class Edge { int to, w; }     // static nested: no outer reference — DEFAULT choice
  class Path { }                       // inner: holds hidden Graph.this reference
}
// In interviews you'll mostly write:
class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }
// or a static nested helper inside your Solution class.

Runnable r = () -> System.out.println("hi");      // lambda replaces most anonymous classes
Comparator<int[]> byFirst = (a, b) -> a[0] - b[0];`,
            },
          ],
        },
      ],
    },

    /* ================= 4. COLLECTIONS ================= */
    {
      id: "collections",
      title: "Collections Framework",
      desc: "The deep-dive: every container, its methods, complexities, and idioms.",
      lessons: [
        {
          id: "hierarchy",
          title: "The hierarchy & how to choose",
          summary: "One mental map: Collection → List/Set/Queue; Map stands apart.",
          blocks: [
            {
              t: "code",
              lang: "text",
              code: `Iterable
 └─ Collection
     ├─ List  ──  ArrayList, LinkedList          (ordered, index, dups)
     ├─ Set   ──  HashSet, LinkedHashSet, TreeSet (unique)
     └─ Queue ──  ArrayDeque, PriorityQueue, LinkedList
Map (separate!) ── HashMap, LinkedHashMap, TreeMap`,
            },
            {
              t: "table",
              head: ["Need", "Use", "Why"],
              rows: [
                ["Dynamic array", "ArrayList", "O(1) get, O(1)* append"],
                ["Stack or queue", "ArrayDeque", "faster than Stack & LinkedList"],
                ["Min/max on the fly", "PriorityQueue", "O(log n) push/pop"],
                ["Key → value", "HashMap", "O(1) average"],
                ["Uniqueness", "HashSet", "O(1) contains"],
                ["Sorted + nearest key", "TreeMap / TreeSet", "O(log n) + floor/ceiling"],
                ["Insertion-order map / LRU", "LinkedHashMap", "predictable iteration, access-order mode"],
              ],
            },
            {
              t: "note",
              md: "Never use legacy `Vector`, `Stack`, or `Hashtable` — say \"ArrayDeque and HashMap replaced them\" if asked.",
            },
          ],
        },
        {
          id: "arraylist",
          title: "List — ArrayList (& LinkedList)",
          summary: "The default container: full method surface + the remove(index vs object) trap.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `List<Integer> list = new ArrayList<>();
list.add(5);                 // append O(1) amortized
list.add(0, 9);              // insert at index O(n)
list.get(i);  list.set(i, v);        // O(1)
list.remove(2);                      // by INDEX
list.remove(Integer.valueOf(2));     // by VALUE — the classic trap
list.indexOf(v);  list.contains(v);  // O(n)
list.size();  list.isEmpty();  list.clear();
list.subList(1, 4);          // VIEW [1,4) — mutations write through!
list.sort(null);             // natural order
list.sort((a, b) -> b - a);  // custom
list.removeIf(x -> x < 0);   // safe filtered delete
Collections.reverse(list);  Collections.swap(list, i, j);
List.of(1, 2, 3);            // immutable! .add() throws
new ArrayList<>(List.of(1, 2, 3));   // mutable copy`,
            },
            {
              t: "note",
              md: "`Arrays.asList(arr)` is a fixed-size **view** (set ok, add/remove throw). `List.of()` is fully immutable. Wrap either in `new ArrayList<>(...)` to get a real list. LinkedList: only when you delete via a ListIterator mid-iteration — otherwise ArrayList wins on cache locality.",
            },
          ],
        },
        {
          id: "arraydeque",
          title: "Deque — stack AND queue",
          summary: "One class, both roles; throwing vs null-returning methods.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);  stack.pop();  stack.peek();       // LIFO (front)

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1);  queue.poll();  queue.peek();     // FIFO (back->front)

// Both ends (sliding-window max / monotonic deque):
dq.offerFirst(x);  dq.offerLast(x);
dq.pollFirst();    dq.pollLast();
dq.peekFirst();    dq.peekLast();`,
            },
            {
              t: "table",
              head: ["Operation", "Throws on empty", "Returns null on empty"],
              rows: [
                ["remove front", "removeFirst() / remove() / pop()", "pollFirst() / poll()"],
                ["peek front", "getFirst() / element()", "peekFirst() / peek()"],
                ["add", "addFirst/addLast (throws if full)", "offerFirst/offerLast (false)"],
              ],
            },
            { t: "note", md: "ArrayDeque rejects `null` — that's why `poll()` can use null as its 'empty' signal. Prefer offer/poll/peek in algorithms." },
          ],
        },
        {
          id: "priorityqueue",
          title: "PriorityQueue — heaps",
          summary: "Min-heap by default; comparators for max-heap and custom keys.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `PriorityQueue<Integer> min = new PriorityQueue<>();               // MIN-heap
PriorityQueue<Integer> max = new PriorityQueue<>(Collections.reverseOrder());

min.offer(5);          // O(log n)
min.peek();            // O(1) smallest
min.poll();            // O(log n) remove smallest
min.remove(x);         // O(n)! avoid — use lazy deletion instead

// custom keys:
PriorityQueue<int[]> byDist = new PriorityQueue<>((a, b) -> a[0] - b[0]);
PriorityQueue<String> byLen = new PriorityQueue<>(Comparator.comparingInt(String::length));

// k-largest idiom: keep a MIN-heap of size k
for (int v : nums) { pq.offer(v); if (pq.size() > k) pq.poll(); }`,
            },
            {
              t: "note",
              md: "Iterating a PriorityQueue is **not** sorted order — only the head is guaranteed. `(a, b) -> a - b` can overflow with huge values; `Integer.compare(a, b)` is safe.",
            },
          ],
        },
        {
          id: "hashmap",
          title: "HashMap — the workhorse",
          summary: "Full method surface + merge/computeIfAbsent, the two golden idioms.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Map<String, Integer> m = new HashMap<>();
m.put(k, v);                 // returns previous value or null
m.get(k);                    // null if absent
m.getOrDefault(k, 0);        // no null check needed
m.containsKey(k);            // O(1);  containsValue is O(n)!
m.remove(k);  m.size();  m.isEmpty();
m.putIfAbsent(k, v);

// THE two idioms:
m.merge(word, 1, Integer::sum);                       // frequency count
graph.computeIfAbsent(u, x -> new ArrayList<>()).add(v);  // map of lists

for (Map.Entry<String, Integer> e : m.entrySet())
  use(e.getKey(), e.getValue());
m.keySet();  m.values();     // live views
m.forEach((k, v) -> ...);`,
            },
            {
              t: "p",
              md: "**Internals (asked constantly):** array of buckets; index = `hash(key) & (capacity-1)`. Collisions chain in a linked list; a bucket converts to a red-black **tree** past 8 entries (Java 8+), so worst case is O(log n) not O(n). Resizes (doubles) past load factor 0.75. This is exactly why `equals`+`hashCode` must agree.",
            },
          ],
        },
        {
          id: "sets",
          title: "Sets — Hash, Linked, Tree",
          summary: "Uniqueness in three flavors: unordered, insertion-ordered, sorted.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Set<Integer> seen = new HashSet<>();        // O(1), no order
seen.add(x);        // false if already present — doubles as a check!
seen.contains(x);  seen.remove(x);

Set<Integer> ordered = new LinkedHashSet<>();  // keeps insertion order
Set<Integer> sorted = new TreeSet<>();         // sorted, O(log n)

new HashSet<>(list)            // dedupe a list
setA.retainAll(setB);          // intersection (mutates A)
setA.removeAll(setB);          // difference
setA.addAll(setB);             // union`,
            },
          ],
        },
        {
          id: "treemap",
          title: "TreeMap / TreeSet — sorted + navigation",
          summary: "floor/ceiling/higher/lower — the 'nearest value' weapons.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `TreeMap<Integer, String> tm = new TreeMap<>();
tm.firstKey();  tm.lastKey();            // min / max key
tm.floorKey(x);     // greatest key <= x   (null if none)
tm.ceilingKey(x);   // smallest key >= x
tm.lowerKey(x);     // greatest key <  x  (strict)
tm.higherKey(x);    // smallest key >  x
tm.firstEntry();  tm.pollFirstEntry();   // entry versions
tm.headMap(x);  tm.tailMap(x);  tm.subMap(a, b);  // range views
tm.descendingMap();

TreeSet<Integer> ts = new TreeSet<>();
ts.floor(x);  ts.ceiling(x);  ts.first();  ts.last();  ts.pollFirst();`,
            },
            {
              t: "note",
              md: "Any problem saying \"closest / nearest / smallest ≥ x\" on a *changing* collection = TreeMap/TreeSet. (C++ equivalent: `map::lower_bound`.) All ops O(log n).",
            },
          ],
        },
        {
          id: "comparators",
          title: "Comparable vs Comparator",
          summary: "Natural order vs external order, and comparator composition.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Job implements Comparable<Job> {         // NATURAL order (one, built-in)
  int priority;
  public int compareTo(Job o) { return Integer.compare(priority, o.priority); }
}

// Comparator: any number of EXTERNAL orders
Comparator<Job> byPriority = Comparator.comparingInt(j -> j.priority);
jobs.sort(byPriority.reversed());
people.sort(Comparator.comparing(Person::lastName)
                      .thenComparing(Person::firstName));   // tie-break chain
Comparator.nullsFirst(Comparator.naturalOrder());

// contract: compare(a,b) < 0 means "a before b"
Arrays.sort(strs, (a, b) -> (b + a).compareTo(a + b));  // Largest Number trick`,
            },
            {
              t: "note",
              md: "`Arrays.sort` on **primitives** = quicksort (not stable); on **objects** = TimSort (stable). Comparator must be consistent — `(a, b) -> a - b` overflows on extreme ints; prefer `Integer.compare`.",
            },
          ],
        },
        {
          id: "iteration-failfast",
          title: "Iteration & ConcurrentModificationException",
          summary: "Why removing in a for-each blows up, and the three safe patterns.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `for (Integer x : list)
  if (x < 0) list.remove(x);        // ConcurrentModificationException!

// Safe pattern 1: removeIf
list.removeIf(x -> x < 0);
// Safe pattern 2: explicit iterator
for (Iterator<Integer> it = list.iterator(); it.hasNext(); )
  if (it.next() < 0) it.remove();
// Safe pattern 3: index loop backwards
for (int i = list.size() - 1; i >= 0; i--)
  if (list.get(i) < 0) list.remove(i);`,
            },
            {
              t: "p",
              md: "Collections are **fail-fast**: a modCount changes under the iterator and the next operation throws. Same rule for maps — use `entrySet().iterator().remove()` or collect keys first.",
            },
          ],
        },
        {
          id: "collections-utils",
          title: "Collections & Arrays utilities",
          summary: "The static helpers: sort, binarySearch, min/max, frequency, immutables.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Collections.sort(list);                    // stable TimSort
Collections.binarySearch(list, key);       // must be sorted; -(insertion+1) if absent
Collections.max(c);  Collections.min(c);
Collections.reverse(list);  Collections.shuffle(list);
Collections.frequency(c, x);
Collections.nCopies(n, 0);                 // immutable n zeros
Collections.unmodifiableList(list);        // read-only VIEW
Collections.emptyList();

Arrays.sort(a);  Arrays.sort(a, from, to);
Arrays.binarySearch(a, key);
Arrays.fill(a, v);  Arrays.copyOf(a, n);  Arrays.copyOfRange(a, i, j);
Arrays.stream(a).sum();  Arrays.stream(a).max().getAsInt();`,
            },
          ],
        },
        {
          id: "complexity-table",
          title: "Complexity reference",
          summary: "One table to memorize.",
          blocks: [
            {
              t: "table",
              head: ["Structure", "add", "remove", "get/contains", "notes"],
              rows: [
                ["ArrayList", "O(1)*", "O(n)", "get O(1) / contains O(n)", "* amortized append"],
                ["LinkedList", "O(1) ends", "O(1) at iterator", "O(n)", "also a Deque"],
                ["ArrayDeque", "O(1)", "O(1) both ends", "peek O(1)", "no nulls"],
                ["PriorityQueue", "O(log n)", "poll O(log n), remove(x) O(n)", "peek O(1)", "min-heap default"],
                ["HashMap/HashSet", "O(1) avg", "O(1) avg", "O(1) avg", "O(log n) worst (treeified)"],
                ["LinkedHashMap/Set", "O(1)", "O(1)", "O(1)", "+ predictable order"],
                ["TreeMap/TreeSet", "O(log n)", "O(log n)", "O(log n)", "+ floor/ceiling, sorted iteration"],
              ],
            },
          ],
        },
      ],
    },

    /* ================= 5. GENERICS ================= */
    {
      id: "generics",
      title: "Generics",
      desc: "Type parameters, bounds, wildcards, erasure.",
      lessons: [
        {
          id: "generics-basics",
          title: "Type parameters & bounds",
          summary: "Generic classes/methods and bounded types.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Box<T> {
  private T value;
  T get() { return value; }
  void set(T v) { value = v; }
}
static <T extends Comparable<T>> T max(List<T> list) {   // bounded type param
  T best = list.get(0);
  for (T x : list) if (x.compareTo(best) > 0) best = x;
  return best;
}
Box<Integer> b = new Box<>();     // diamond infers the type
// No primitives: Box<int> is illegal -> Box<Integer> (autoboxing)`,
            },
          ],
        },
        {
          id: "wildcards",
          title: "Wildcards & PECS",
          summary: "? extends vs ? super — Producer Extends, Consumer Super.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `double sum(List<? extends Number> src) {   // PRODUCER: read as Number
  double s = 0;
  for (Number n : src) s += n.doubleValue();
  return s;                       // can't ADD to src (except null)
}
void fill(List<? super Integer> dst) {     // CONSUMER: safe to add Integers
  dst.add(1);                     // reads come out as Object
}
// PECS: Producer Extends, Consumer Super.
// List<Dog> is NOT a List<Animal> (generics are invariant) — wildcards fix that.`,
            },
            {
              t: "note",
              md: "**Erasure:** generics exist only at compile time — at runtime a `List<String>` is just `List`. Consequences: no `new T()`, no `T[]`, no `instanceof List<String>`, and overloads can't differ only by type parameter.",
            },
          ],
        },
      ],
    },

    /* ================= 6. EXCEPTIONS ================= */
    {
      id: "exceptions",
      title: "Exceptions",
      desc: "The hierarchy, checked vs unchecked, try-with-resources.",
      lessons: [
        {
          id: "exception-hierarchy",
          title: "Hierarchy & checked vs unchecked",
          summary: "Throwable → Error / Exception → RuntimeException.",
          blocks: [
            {
              t: "code",
              lang: "text",
              code: `Throwable
├─ Error                      // JVM problems: OutOfMemoryError, StackOverflowError — don't catch
└─ Exception
   ├─ (checked)               // must declare or catch: IOException, SQLException
   └─ RuntimeException        // unchecked: NullPointerException, IndexOutOfBounds,
                              // IllegalArgumentException, ClassCastException, ArithmeticException`,
            },
            {
              t: "ul",
              items: [
                "**Checked** = recoverable external failures (I/O, network) — compiler forces handling.",
                "**Unchecked** = programming bugs — fix the code, don't catch them.",
                "Catch order: subclasses **before** superclasses or it won't compile.",
                "`finally` always runs (even after return) — but don't `return` from finally; it swallows exceptions.",
              ],
            },
          ],
        },
        {
          id: "exception-usage",
          title: "try-with-resources & custom exceptions",
          summary: "Automatic close, multi-catch, and writing your own.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `try (BufferedReader br = new BufferedReader(new FileReader(path))) {
  return br.readLine();
} catch (FileNotFoundException e) {        // specific first
  ...
} catch (IOException | RuntimeException e) {  // multi-catch
  throw new IllegalStateException("load failed", e);  // ALWAYS chain the cause
}
// try-with-resources auto-closes ANY AutoCloseable, in reverse order

class InsufficientFundsException extends Exception {   // checked custom
  final double shortfall;
  InsufficientFundsException(double s) { super("short by " + s); shortfall = s; }
}`,
            },
            {
              t: "note",
              md: "Best practices to say out loud: catch the most specific type, never swallow (`catch (Exception e) {}`), chain causes, throw `IllegalArgumentException` for bad params, and use exceptions for exceptional flow — not control flow.",
            },
          ],
        },
      ],
    },

    /* ================= 7. LAMBDAS & STREAMS ================= */
    {
      id: "streams",
      title: "Lambdas & Streams",
      desc: "Functional interfaces, method refs, the stream pipeline, collectors, Optional.",
      lessons: [
        {
          id: "functional-interfaces",
          title: "Lambdas & functional interfaces",
          summary: "The core interfaces and method references.",
          blocks: [
            {
              t: "table",
              head: ["Interface", "Signature", "Use"],
              rows: [
                ["Predicate<T>", "T → boolean", "filter"],
                ["Function<T,R>", "T → R", "map"],
                ["Consumer<T>", "T → void", "forEach"],
                ["Supplier<T>", "() → T", "lazy creation"],
                ["BiFunction<T,U,R>", "(T,U) → R", "merge, reduce"],
                ["UnaryOperator<T>", "T → T", "replaceAll"],
                ["Comparator<T>", "(T,T) → int", "sorting"],
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `Predicate<String> empty = s -> s.isEmpty();
Function<String, Integer> len = String::length;      // method reference
Supplier<List<Integer>> mk = ArrayList::new;         // constructor ref
BiFunction<Integer, Integer, Integer> add = Integer::sum;
// Lambdas capture only effectively-final locals.`,
            },
          ],
        },
        {
          id: "stream-pipeline",
          title: "The stream pipeline",
          summary: "source → intermediate ops (lazy) → terminal op.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `List<String> top = people.stream()
    .filter(p -> p.age() >= 18)          // intermediate: lazy
    .map(Person::name)
    .distinct()
    .sorted()
    .limit(3)
    .collect(Collectors.toList());       // terminal: triggers execution

int total = IntStream.rangeClosed(1, 100).sum();
int[] squares = Arrays.stream(a).map(x -> x * x).toArray();
boolean anyNeg = list.stream().anyMatch(x -> x < 0);
Optional<Integer> mx = list.stream().max(Integer::compare);
String csv = names.stream().collect(Collectors.joining(", "));
List<Integer> flat = lists.stream().flatMap(List::stream).toList();`,
            },
            {
              t: "note",
              md: "Streams are single-use — a consumed stream throws on reuse. `mapToInt`/`boxed()` cross between object and primitive streams. Don't mutate external state inside a stream (that's what collectors are for).",
            },
          ],
        },
        {
          id: "collectors",
          title: "Collectors & Optional",
          summary: "groupingBy is the SQL GROUP BY of Java.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Map<String, List<Person>> byCity =
    people.stream().collect(Collectors.groupingBy(Person::city));
Map<String, Long> countByCity =
    people.stream().collect(Collectors.groupingBy(Person::city, Collectors.counting()));
Map<Boolean, List<Integer>> parts =
    nums.stream().collect(Collectors.partitioningBy(x -> x > 0));
Map<Integer, String> byId =
    people.stream().collect(Collectors.toMap(Person::id, Person::name));

Optional<Person> first = people.stream().filter(p -> p.age() > 30).findFirst();
first.map(Person::name).orElse("nobody");
first.ifPresent(p -> notify(p));
first.orElseThrow();     // don't call .get() without checking`,
            },
          ],
        },
      ],
    },

    /* ================= 8. CONCURRENCY ================= */
    {
      id: "concurrency",
      title: "Concurrency",
      desc: "Threads, synchronization, executors, atomics — what interviews actually ask.",
      lessons: [
        {
          id: "threads-sync",
          title: "Threads, synchronized & volatile",
          summary: "Creating threads and the two visibility/atomicity tools.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `Thread t = new Thread(() -> work());   // Runnable lambda
t.start();                              // start() forks; run() would just call it!
t.join();                               // wait for completion

class Counter {
  private int count;
  synchronized void inc() { count++; }          // one thread at a time (monitor = this)
  void inc2() { synchronized (this) { count++; } }  // same thing, block form
}
volatile boolean running = true;        // VISIBILITY only — not atomicity
// count++ is 3 operations (read/add/write): volatile does NOT make it safe.`,
            },
            {
              t: "ul",
              items: [
                "`synchronized` = mutual exclusion + visibility. `volatile` = visibility only (flags, not counters).",
                "Deadlock recipe: two locks taken in different orders. Fix: global lock ordering.",
                "`wait()/notifyAll()` must be called inside `synchronized` on the same monitor; always `wait()` in a loop re-checking the condition.",
              ],
            },
          ],
        },
        {
          id: "executors-atomics",
          title: "Executors, atomics & concurrent collections",
          summary: "The java.util.concurrent layer you should reach for first.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> f = pool.submit(() -> compute());   // Callable returns a value
f.get();                                            // blocks
pool.shutdown();

AtomicInteger hits = new AtomicInteger();
hits.incrementAndGet();                 // lock-free CAS — safe counter

Map<String, Integer> safe = new ConcurrentHashMap<>();
safe.merge("k", 1, Integer::sum);       // atomic per-key update
BlockingQueue<Task> q = new ArrayBlockingQueue<>(100);
q.put(t);   q.take();                   // producer-consumer, blocks when full/empty

Semaphore sem = new Semaphore(0);       // LeetCode 1114-1195 family
sem.acquire();  sem.release();
CountDownLatch latch = new CountDownLatch(3);
latch.countDown();  latch.await();

CompletableFuture.supplyAsync(() -> fetch())
    .thenApply(this::parse)
    .thenAccept(this::render);           // async pipeline`,
            },
            {
              t: "note",
              md: "Interview soundbite: \"I'd use the `java.util.concurrent` primitives before raw `synchronized` — `ConcurrentHashMap` for shared maps, `AtomicInteger` for counters, `BlockingQueue` for producer/consumer, `ExecutorService` instead of raw threads.\"",
            },
          ],
        },
      ],
    },

    /* ================= 9. JVM & MEMORY ================= */
    {
      id: "jvm",
      title: "JVM & Memory",
      desc: "Stack vs heap, GC, class loading — the 'how Java runs' questions.",
      lessons: [
        {
          id: "memory-model",
          title: "Stack vs heap & GC basics",
          summary: "Where things live and how they die.",
          blocks: [
            {
              t: "ul",
              items: [
                "**Stack** (per thread): frames with locals + references. StackOverflowError = runaway recursion.",
                "**Heap** (shared): all objects and arrays. OutOfMemoryError when full.",
                "**Metaspace**: class metadata, static fields' owners.",
                "GC is **generational**: most objects die young → cheap frequent young-gen (minor) collections; survivors promote to old gen (major collections). Modern collectors: G1 (default), ZGC (low pause).",
                "GC roots: stack references, static fields, JNI refs — anything unreachable from roots is collectable. Java leaks = *reachable-but-unused* (e.g. a static Map cache that only grows, listeners never unregistered).",
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `String s = "hi";          // "hi" in string pool (heap), s on the stack
int x = 42;               // primitive: value directly in the stack frame
int[] a = new int[10];    // array object on the heap; a is a stack reference
// == compares stack values: primitives by value, objects by REFERENCE.`,
            },
          ],
        },
        {
          id: "jvm-pipeline",
          title: "Compilation & class loading",
          summary: "javac → bytecode → class loader → interpreter + JIT.",
          blocks: [
            {
              t: "ul",
              items: [
                "`javac` compiles to **bytecode** (.class); the JVM interprets it and the **JIT** compiles hot paths to native code at runtime — 'write once, run anywhere' + near-native speed after warmup.",
                "Class loading: Bootstrap → Platform → Application loaders, parent-delegation (parent gets first chance — prevents spoofing `java.lang.String`).",
                "Static initializers run once at class load; instance initializers + constructor run per `new`, parent first.",
                "`final` fields + immutability = free thread-safety; prefer immutable value objects (records).",
              ],
            },
          ],
        },
      ],
    },
  ],
};
