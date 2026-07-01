# Java Collections & C++ STL — Interview Handbook

A compact, exhaustive reference for the methods you actually reach for in interviews.
Complexities are average/amortized unless noted. `n` = size, `k` = number affected.

**How to read it:** find the container, scan the method, note the complexity column.
Methods are grouped so you memorize *by container*, not by alphabet.

- [PART 1 — Java Collections](#part-1--java-collections)
- [PART 2 — C++ STL](#part-2--c-stl)
- [PART 3 — Side-by-side quick map](#part-3--side-by-side-quick-map)

---

# PART 1 — Java Collections

> Import `java.util.*`. Generics omitted in signatures for brevity.
> Most-used concrete types: `ArrayList`, `ArrayDeque`, `HashMap`, `HashSet`, `TreeMap`, `PriorityQueue`.

## 1.1 `Collection` (root interface — every collection has these)

| Method | Returns | Complexity | Note |
|---|---|---|---|
| `add(e)` | boolean | varies | append/insert |
| `addAll(c)` | boolean | O(c) | bulk add |
| `remove(o)` | boolean | varies | removes one matching element |
| `removeAll(c)` | boolean | O(n·cost) | set difference |
| `retainAll(c)` | boolean | O(n·cost) | intersection |
| `removeIf(pred)` | boolean | O(n) | predicate delete |
| `contains(o)` | boolean | varies | |
| `containsAll(c)` | boolean | O(c·cost) | |
| `clear()` | void | O(n) | |
| `size()` | int | O(1) | |
| `isEmpty()` | boolean | O(1) | |
| `iterator()` | Iterator | O(1) | |
| `stream()` / `parallelStream()` | Stream | O(1) | |
| `toArray()` / `toArray(T[])` | Object[]/T[] | O(n) | |
| `forEach(action)` | void | O(n) | from `Iterable` |

`Iterator`: `hasNext()`, `next()`, `remove()` (safe in-loop delete). `ListIterator` adds `hasPrevious()`, `previous()`, `nextIndex()`, `previousIndex()`, `set(e)`, `add(e)`.

## 1.2 `List` — `ArrayList`, `LinkedList`

Ordered, index-addressable, allows duplicates.

| Method | Complexity (ArrayList) | Complexity (LinkedList) | Note |
|---|---|---|---|
| `add(e)` | O(1) amortized | O(1) | append |
| `add(i, e)` | O(n) | O(n) (O(1) at ends) | insert at index |
| `get(i)` | O(1) | O(n) | random access |
| `set(i, e)` | O(1) | O(n) | replace, returns old |
| `remove(i)` | O(n) | O(n) | by index |
| `remove(Object)` | O(n) | O(n) | by value |
| `indexOf(o)` / `lastIndexOf(o)` | O(n) | O(n) | -1 if absent |
| `contains(o)` | O(n) | O(n) | |
| `subList(from, to)` | O(1) view | O(1) | **view**, not copy |
| `replaceAll(op)` | O(n) | O(n) | in-place map |
| `sort(cmp)` | O(n log n) | O(n log n) | stable (TimSort) |
| `listIterator()` | O(1) | O(1) | bidirectional |
| `of(...)` (static) | — | — | immutable list |
| `copyOf(c)` (static) | O(n) | — | immutable copy |

`LinkedList` also implements `Deque`, so it has `addFirst/addLast/getFirst/getLast/removeFirst/removeLast/peekFirst/peekLast/offerFirst/offerLast/pollFirst/pollLast`.

**Java 21 `SequencedCollection`** (List, Deque, LinkedHashSet implement it): `addFirst(e)`, `addLast(e)`, `getFirst()`, `getLast()`, `removeFirst()`, `removeLast()`, `reversed()` (returns a reverse-ordered *view*).

> Interview note: use `ArrayList` by default. `LinkedList` only wins when you mutate at both ends *and* never random-access — and even then `ArrayDeque` is usually better.

## 1.3 `Deque` / `Queue` — `ArrayDeque`, `LinkedList`, `PriorityQueue`

`ArrayDeque` is your go-to stack **and** queue (faster than `Stack` and `LinkedList`). No `null` allowed.

| Need | Method (throws) | Method (returns special) | Complexity |
|---|---|---|---|
| Add front | `addFirst(e)` | `offerFirst(e)` | O(1) |
| Add back | `addLast(e)` | `offerLast(e)` | O(1) |
| Remove front | `removeFirst()` | `pollFirst()` → null | O(1) |
| Remove back | `removeLast()` | `pollLast()` → null | O(1) |
| Peek front | `getFirst()` | `peekFirst()` → null | O(1) |
| Peek back | `getLast()` | `peekLast()` → null | O(1) |

**As a queue (FIFO):** `offer(e)` / `add(e)`, `poll()` / `remove()`, `peek()` / `element()`.
**As a stack (LIFO):** `push(e)` (= addFirst), `pop()` (= removeFirst), `peek()` (= peekFirst).

> Mnemonic: the **throwing** variants (`add/remove/element/getFirst…`) raise exceptions on empty/full; the **special-value** variants (`offer/poll/peek/…First`) return `false`/`null`. Prefer `offer/poll/peek` in algorithms.

### `PriorityQueue` (binary heap, **min-heap** by default)

| Method | Complexity | Note |
|---|---|---|
| `add(e)` / `offer(e)` | O(log n) | sift up |
| `poll()` | O(log n) | remove min |
| `peek()` | O(1) | view min |
| `remove(o)` | O(n) | arbitrary element |
| `contains(o)` | O(n) | |
| `new PriorityQueue<>(cmp)` | — | custom order; max-heap: `Comparator.reverseOrder()` |

> Not sorted on iteration — only the head is ordered. For max-heap of ints: `new PriorityQueue<>(Collections.reverseOrder())`.

## 1.4 `Set` — `HashSet`, `LinkedHashSet`, `TreeSet`

| Method | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| `add(e)` | O(1) | O(1) | O(log n) |
| `remove(o)` | O(1) | O(1) | O(log n) |
| `contains(o)` | O(1) | O(1) | O(log n) |
| iteration order | none | insertion | sorted |

`TreeSet` (navigable, sorted) extra methods — **all O(log n)**:

| Method | Returns |
|---|---|
| `first()` / `last()` | min / max |
| `pollFirst()` / `pollLast()` | remove+return min / max |
| `floor(e)` | greatest ≤ e (or null) |
| `ceiling(e)` | smallest ≥ e (or null) |
| `lower(e)` | greatest < e (strict) |
| `higher(e)` | smallest > e (strict) |
| `headSet(e[,incl])` | view < e |
| `tailSet(e[,incl])` | view ≥ e |
| `subSet(a,b)` | view [a, b) |
| `descendingSet()` / `descendingIterator()` | reverse view |

> `floor/ceiling/lower/higher` are the reason `TreeSet`/`TreeMap` win "find nearest value" problems.

## 1.5 `Map` — `HashMap`, `LinkedHashMap`, `TreeMap`

Not a `Collection`. Core methods:

| Method | HashMap | TreeMap | Note |
|---|---|---|---|
| `put(k, v)` | O(1) | O(log n) | returns old value |
| `get(k)` | O(1) | O(log n) | null if absent |
| `getOrDefault(k, def)` | O(1) | O(log n) | avoids null checks |
| `containsKey(k)` | O(1) | O(log n) | |
| `containsValue(v)` | O(n) | O(n) | linear scan |
| `remove(k)` | O(1) | O(log n) | |
| `putIfAbsent(k, v)` | O(1) | O(log n) | |
| `merge(k, v, fn)` | O(1) | O(log n) | **counting idiom** |
| `compute(k, fn)` | O(1) | O(log n) | (key, oldVal)→newVal |
| `computeIfAbsent(k, fn)` | O(1) | O(log n) | **build map-of-list** |
| `computeIfPresent(k, fn)` | O(1) | O(log n) | |
| `keySet()` / `values()` / `entrySet()` | O(1) view | O(1) view | iterate entries |
| `forEach((k,v)->…)` | O(n) | O(n) | |
| `replace(k, v)` | O(1) | O(log n) | only if present |
| `Map.of(...)` / `Map.entry(k,v)` | — | — | immutable |

**Two idioms worth memorizing:**

```java
// Frequency count
map.merge(key, 1, Integer::sum);
// Group into buckets
map.computeIfAbsent(key, k -> new ArrayList<>()).add(val);
```

`TreeMap` navigable methods (O(log n)): `firstKey()`, `lastKey()`, `floorKey(k)`, `ceilingKey(k)`, `lowerKey(k)`, `higherKey(k)`, and the `*Entry` variants (`firstEntry`, `floorEntry`, …), `pollFirstEntry()`, `pollLastEntry()`, `headMap`, `tailMap`, `subMap`, `descendingMap()`.

`LinkedHashMap`: insertion-order (or access-order with the 3-arg constructor → **LRU cache**: override `removeEldestEntry`).

## 1.6 `Collections` utility (static helpers)

| Method | Complexity | Note |
|---|---|---|
| `sort(list[, cmp])` | O(n log n) | in-place, stable |
| `binarySearch(list, key)` | O(log n) | list must be sorted |
| `reverse(list)` | O(n) | |
| `shuffle(list)` | O(n) | |
| `swap(list, i, j)` | O(1) | |
| `rotate(list, d)` | O(n) | |
| `fill(list, e)` | O(n) | |
| `nCopies(n, e)` | O(n) | immutable |
| `max(c[, cmp])` / `min(c[, cmp])` | O(n) | |
| `frequency(c, o)` | O(n) | count occurrences |
| `disjoint(a, b)` | O(n) | no common element? |
| `emptyList/Set/Map()` | O(1) | immutable singletons |
| `singletonList(e)` | O(1) | immutable 1-element |
| `unmodifiableList(l)` | O(1) | read-only view |
| `synchronizedList(l)` | O(1) | thread-safe wrapper |

## 1.7 `Arrays` utility (static helpers)

| Method | Complexity | Note |
|---|---|---|
| `sort(a)` | O(n log n) | dual-pivot quicksort (primitives) |
| `sort(a, cmp)` | O(n log n) | objects, stable TimSort |
| `sort(a, from, to)` | O(k log k) | range sort |
| `binarySearch(a, key)` | O(log n) | sorted array |
| `fill(a, val)` | O(n) | |
| `copyOf(a, len)` | O(n) | pad/truncate |
| `copyOfRange(a, i, j)` | O(k) | slice [i, j) |
| `equals(a, b)` | O(n) | element-wise |
| `asList(a...)` | O(1) | **fixed-size** view |
| `stream(a)` | O(1) | IntStream/Stream |
| `toString(a)` / `deepToString(a)` | O(n) | print |

> Gotcha: `Arrays.asList(arr)` on an `int[]` gives a `List<int[]>` of size 1. Use `int[]` streams or `Integer[]`.

## 1.8 Stream essentials (the ones that show up)

`filter`, `map`, `mapToInt`, `flatMap`, `distinct`, `sorted`, `limit`, `skip`, `peek` (intermediate) →
`collect`, `toList`, `count`, `sum`, `min`, `max`, `reduce`, `anyMatch`, `allMatch`, `noneMatch`, `findFirst`, `forEach` (terminal).
Collectors: `toList()`, `toSet()`, `toMap(k,v)`, `groupingBy(fn)`, `partitioningBy(pred)`, `joining(", ")`, `counting()`.

## 1.9 String / char helpers (constant companions)

`s.charAt(i)`, `s.length()`, `s.substring(i[,j])`, `s.indexOf`, `s.split(regex)`, `s.toCharArray()`, `s.chars()`, `s.compareTo`, `s.equals`, `s.replace`, `s.trim()`/`strip()`, `s.repeat(n)`, `s.isBlank()`.
**Mutable:** `StringBuilder` — `append`, `insert(i,…)`, `deleteCharAt(i)`, `delete(i,j)`, `reverse()`, `setCharAt(i,c)`, `charAt(i)`, `length()`, `toString()`. All O(1) amortized except `insert/delete` in middle (O(n)).
`Character.isDigit/isLetter/isLetterOrDigit/isWhitespace/isUpperCase/toLowerCase/getNumericValue`.
`Integer.parseInt`, `Integer.toBinaryString`, `Integer.bitCount`, `Integer.MAX_VALUE/MIN_VALUE`, `Long.parseLong`, `Math.abs/max/min/pow/sqrt/floorDiv/floorMod`.

---

# PART 2 — C++ STL

> Headers noted per section. `it` = iterator. Most containers share the iterator protocol:
> `begin() end() rbegin() rend() cbegin() cend()`, plus `size() empty() clear() swap()`.

## 2.1 `std::vector` — `<vector>`

Dynamic array; contiguous; the default container.

| Method | Complexity | Note |
|---|---|---|
| `push_back(x)` / `emplace_back(args…)` | O(1) amortized | emplace constructs in place |
| `pop_back()` | O(1) | no return value |
| `operator[](i)` / `at(i)` | O(1) | `at` bounds-checks (throws) |
| `front()` / `back()` | O(1) | refs to ends |
| `insert(pos, x)` | O(n) | shift right |
| `erase(pos)` / `erase(first,last)` | O(n) | returns next iterator |
| `clear()` | O(n) | size→0, capacity kept |
| `resize(n[, val])` | O(n) | grow/shrink |
| `reserve(n)` | O(n) | pre-allocate capacity |
| `capacity()` / `shrink_to_fit()` | O(1) / O(n) | |
| `size()` / `empty()` | O(1) | |
| `data()` | O(1) | raw pointer |
| `assign(n, val)` | O(n) | replace contents |

> `erase` invalidates iterators at/after the point. **erase–remove idiom:** `v.erase(remove(v.begin(),v.end(),val), v.end());`

## 2.2 `std::deque` — `<deque>`

Double-ended; O(1) push/pop at both ends; random access O(1) (not contiguous).
Adds to vector's API: `push_front(x)`, `emplace_front(args…)`, `pop_front()`. No `reserve`/`capacity`.

## 2.3 `std::list` / `std::forward_list` — `<list>` / `<forward_list>`

Doubly / singly linked. O(1) splice/insert/erase *given an iterator*; no random access.

| Method | Complexity | Note |
|---|---|---|
| `push_back/push_front` | O(1) | (`forward_list`: front only) |
| `insert(pos, x)` | O(1) | at iterator |
| `erase(pos)` | O(1) | at iterator |
| `splice(pos, other)` | O(1) | move nodes, no copy |
| `remove(val)` / `remove_if(pred)` | O(n) | |
| `unique()` | O(n) | dedupe consecutive |
| `sort([cmp])` | O(n log n) | member sort (no `std::sort`) |
| `merge(other)` | O(n) | merge sorted lists |
| `reverse()` | O(n) | |

## 2.4 `std::array` / C-array helpers — `<array>`

Fixed-size, stack-allocated: `arr.size()`, `arr.fill(v)`, `arr[i]`, `arr.at(i)`, `front()`, `back()`, `data()`. Works with all `<algorithm>`.

## 2.5 `std::string` — `<string>`

| Method | Complexity | Note |
|---|---|---|
| `s[i]` / `at(i)` | O(1) | |
| `size()`/`length()` | O(1) | |
| `substr(pos, len)` | O(len) | copy |
| `find(str[, pos])` | O(n·m) | returns index or `string::npos` |
| `rfind` / `find_first_of` / `find_last_of` | O(n) | |
| `append(str)` / `+=` / `push_back(c)` | O(1) amort. | |
| `insert(pos, str)` | O(n) | |
| `erase(pos, len)` | O(n) | |
| `replace(pos, len, str)` | O(n) | |
| `compare(str)` | O(n) | <0/0/>0 |
| `c_str()` / `data()` | O(1) | |
| `stoi/stol/stoll/stod` (free) | O(n) | parse number |
| `to_string(x)` (free) | O(n) | number→string |

## 2.6 Container adaptors — `<stack>`, `<queue>`

**`std::stack`** (LIFO): `push(x)`, `emplace(args…)`, `pop()` (void), `top()`, `size()`, `empty()`. All O(1).
**`std::queue`** (FIFO): `push(x)`, `emplace`, `pop()` (void), `front()`, `back()`, `size()`, `empty()`. All O(1).
**`std::priority_queue`** (**max-heap** by default): `push(x)`, `emplace`, `pop()` (void), `top()`, `size()`, `empty()`. push/pop O(log n), top O(1).

```cpp
// min-heap of int:
priority_queue<int, vector<int>, greater<int>> pq;
```

> Note vs Java: STL `pop()` returns **void** — read `top()`/`front()` first, then `pop()`. And `priority_queue` defaults to **max**-heap (Java's `PriorityQueue` defaults to **min**-heap).

## 2.7 Ordered associative — `<map>`, `<set>` (red-black tree, sorted)

`map`, `multimap`, `set`, `multiset`. All ops **O(log n)**; iteration is sorted.

| Method | Note |
|---|---|
| `insert({k,v})` / `emplace(...)` | returns `{iterator, bool}` (map/set) |
| `operator[](k)` (map only) | inserts default if absent — beware! |
| `at(k)` (map only) | throws if absent |
| `find(k)` | iterator or `end()` |
| `count(k)` | 0/1 for unique; n for multi |
| `contains(k)` (C++20) | bool — cleaner than `count` |
| `erase(k)` / `erase(it)` | by key or iterator |
| `lower_bound(k)` | first key ≥ k |
| `upper_bound(k)` | first key > k |
| `equal_range(k)` | `{lower, upper}` pair |
| `begin()/rbegin()` | smallest / largest key |

> `lower_bound`/`upper_bound` on `set`/`map` are the C++ analog of Java's `ceiling`/`higher`. Use the **member** versions (O(log n)) — `std::lower_bound` on these is O(n) because the iterators aren't random-access.

## 2.8 Unordered associative — `<unordered_map>`, `<unordered_set>` (hash)

`unordered_map/multimap/set/multiset`. Average **O(1)**, worst **O(n)** (bad hashing).
Same API as ordered minus the ordering methods. Adds bucket/load-factor controls:
`bucket_count()`, `load_factor()`, `max_load_factor()`, `rehash(n)`, `reserve(n)`.
Has `find`, `count`, `contains` (C++20), `insert`, `emplace`, `erase`, `operator[]`, `at`. **No** `lower_bound`/`upper_bound`/ordered iteration.

> Default to `unordered_map` for frequency/lookup; switch to `map` only when you need sorted order or `lower_bound`.

## 2.9 `<algorithm>` — the workhorse header

> Most take an iterator range `[first, last)`. Many take an optional comparator/predicate.

### Sorting & order
| Function | Complexity | Note |
|---|---|---|
| `sort(b, e[, cmp])` | O(n log n) | not stable |
| `stable_sort(b, e[, cmp])` | O(n log n) | preserves equal order |
| `partial_sort(b, mid, e)` | O(n log k) | top-k sorted |
| `nth_element(b, nth, e)` | O(n) avg | k-th element in place (quickselect) |
| `is_sorted(b, e)` | O(n) | |
| `sort_heap` / `make_heap` / `push_heap` / `pop_heap` | O(n)/O(log n) | manual heap |

### Searching (sorted ranges)
| Function | Complexity | Note |
|---|---|---|
| `binary_search(b, e, x)` | O(log n) | bool |
| `lower_bound(b, e, x)` | O(log n) | first ≥ x |
| `upper_bound(b, e, x)` | O(log n) | first > x |
| `equal_range(b, e, x)` | O(log n) | `{lower, upper}` |

### Searching / counting (any range)
`find`, `find_if`, `find_if_not`, `count`, `count_if`, `search` (subsequence), `adjacent_find`, `min_element`, `max_element`, `minmax_element`, `all_of`, `any_of`, `none_of`. All O(n).

### Modifying
| Function | Note |
|---|---|
| `copy` / `copy_if` / `copy_n` | into output iterator |
| `move` | move-copy range |
| `fill` / `fill_n` / `generate` | write values |
| `transform(b, e, out, fn)` | map (also binary form) |
| `replace` / `replace_if` | |
| `remove` / `remove_if` | **logical** remove → pair with `erase` |
| `unique` | drop consecutive dups → pair with `erase` |
| `reverse` / `rotate` | |
| `swap` / `iter_swap` / `swap_ranges` | |
| `next_permutation` / `prev_permutation` | O(n) per step — permutation loops |
| `shuffle(b, e, rng)` | |

### Numeric — `<numeric>`
`accumulate(b, e, init[, op])` (sum/reduce), `reduce` (C++17, parallelizable), `partial_sum` (prefix sums), `inner_product`, `adjacent_difference`, `iota(b, e, start)` (fill 0,1,2,…), `gcd`/`lcm` (C++17).

### Set ops (on sorted ranges) — O(n)
`merge`, `set_union`, `set_intersection`, `set_difference`, `set_symmetric_difference`, `includes`.

### `<cmath>` companions
`abs`, `pow`, `sqrt`, `cbrt`, `floor`, `ceil`, `round`, `log`, `log2`, `min`, `max`, `clamp` (C++17), `__builtin_popcount`, `__builtin_clz` (GCC/Clang bit tricks).

## 2.10 `pair` / `tuple` — `<utility>`, `<tuple>`

`make_pair(a,b)`, `.first`, `.second`; `make_tuple(...)`, `get<i>(t)`, `tie(a,b) = ...`, structured bindings `auto [a, b] = p;` (C++17). Pairs/tuples compare lexicographically — handy as heap/map keys.

## 2.11 C++23 flat containers — `<flat_map>`, `<flat_set>`

`flat_map/flat_multimap/flat_set/flat_multiset`: drop-in replacements backed by **sorted vectors** (cache-friendly). Lookup O(log n), but insert/erase O(n). Use when you build once and mostly read/iterate. Same API surface as the ordered associative containers (`find`, `contains`, `lower_bound`, …).

---

# PART 3 — Side-by-side quick map

| Need | Java | C++ |
|---|---|---|
| Dynamic array | `ArrayList` | `vector` |
| Stack | `ArrayDeque` (`push/pop/peek`) | `stack` |
| Queue | `ArrayDeque` (`offer/poll/peek`) | `queue` |
| Double-ended queue | `ArrayDeque` | `deque` |
| Min-heap | `PriorityQueue` (default) | `priority_queue<T,vector<T>,greater<>>` |
| Max-heap | `PriorityQueue<>(reverseOrder())` | `priority_queue` (default) |
| Hash map | `HashMap` | `unordered_map` |
| Hash set | `HashSet` | `unordered_set` |
| Sorted map | `TreeMap` | `map` |
| Sorted set | `TreeSet` | `set` |
| Find ≥ key | `ceilingKey` / `ceiling` | `lower_bound` |
| Find > key | `higherKey` / `higher` | `upper_bound` |
| Find ≤ / < key | `floorKey` / `lowerKey` | `--upper_bound` / `--lower_bound` |
| Frequency count | `map.merge(k,1,Integer::sum)` | `++m[k]` |
| Map-of-lists | `computeIfAbsent(k, x->new ArrayList<>())` | `m[k].push_back(v)` |
| Sort | `Collections.sort` / `Arrays.sort` | `sort(b,e)` |
| Binary search | `Collections.binarySearch` | `binary_search` / `lower_bound` |
| k-th smallest | `PriorityQueue` of size k | `nth_element` (O(n)) |
| Mutable string | `StringBuilder` | `std::string` (already mutable) |

## Gotchas that cost points

1. **Heap default flips between languages.** Java `PriorityQueue` = min-heap; C++ `priority_queue` = max-heap.
2. **C++ `pop()` returns void.** Read `top()`/`front()` *before* popping.
3. **`map[k]` in C++ inserts** a default-constructed value if `k` is absent — use `find`/`contains` for pure lookups, or `count`.
4. **`Arrays.asList(intArray)`** gives a 1-element list. Use `Integer[]` or streams.
5. **Iterator invalidation (C++):** modifying a `vector` can invalidate all iterators; `erase`/`insert` return the next valid iterator — use it.
6. **`ConcurrentModificationException` (Java):** don't mutate a collection in a for-each loop; use `Iterator.remove()` or `removeIf`.
7. **`substring`/`subList` are views or copies?** Java `subList` is a *view*; `substring` is a *copy*. C++ `substr` is a *copy*; `string_view` is a view.
8. **Use member `lower_bound` on `set`/`map`**, not `std::lower_bound` — the free function is O(n) on tree iterators.

---

*Built for Sriram's interview prep. Sources: Oracle JDK 21 docs, cppreference. Update as you hit new methods in drills.*