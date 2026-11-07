# 2. C++ Cheat Sheet — I/O, STL Containers, Algorithms & Interview Idioms

One page, in the order you reach for things: fast input, text, containers, algorithms, numbers, then ready-made patterns. Examples assume `#include <bits/stdc++.h>` (GCC/Clang, pulls in the whole standard library) and `using namespace std;`.

## Pick the right container

| You need | Use | Why |
|---|---|---|
| Dynamic array (the default) | `vector` | contiguous and cache friendly, `push_back` amortised O(1) |
| Fixed size known at compile time | `array<T, N>` | no heap allocation |
| Stack (LIFO) | `stack` | adaptor with `push` / `top` / `pop` |
| Queue (FIFO) | `queue` | adaptor with `push` / `front` / `pop` |
| Largest (or smallest) next | `priority_queue` | max-heap by default, `greater<>` for a min-heap |
| Sorted unique keys, floor and ceiling | `set` / `map` | O(log n), member `lower_bound` |
| Sorted, duplicates allowed | `multiset` / `multimap` | same tree, repeated keys |
| Counting or lookup, order irrelevant | `unordered_map` / `unordered_set` | average O(1) |
| Add or remove at both ends with indexing | `deque` | O(1) at both ends |
| Cheap splice in the middle | `list` | O(1) with an iterator, no random access |

## Cost at a glance

| Container | Index | Add or remove at the end | In the middle | Lookup by value |
|---|---|---|---|---|
| `vector` | O(1) | `push_back` amortised O(1), `pop_back` O(1) | O(n) | O(n) |
| `deque` | O(1) | O(1) at both ends | O(n) | O(n) |
| `list` | none | O(1) | O(1) given an iterator | O(n) |
| `set` / `map` | none | O(log n) | O(log n) | O(log n) |
| `unordered_set` / `unordered_map` | none | average O(1) | average O(1) | average O(1), worst O(n) |
| `priority_queue` | `top` O(1) | `push` / `pop` O(log n) | not supported | not supported |

## 1. Input and output

### Fast I/O

The two sync lines make cin/cout fast. Prefer "\n" over endl (endl also flushes).

| Call | What it does | Example |
|---|---|---|
| `ios::sync_with_stdio(false); cin.tie(nullptr);` | Unsync from C stdio — big speedup. | `int main(){ ios::sync_with_stdio(false); cin.tie(nullptr); }` |
| `cin >> x` | Read whitespace-delimited value(s). | `int n; cin >> n;`<br>`vector<int> a(n);`<br>`for (auto& x : a) cin >> x;` |
| `getline(cin, s)` | Read a whole line incl. spaces. | `cin >> n; cin.ignore();`<br>`getline(cin, s);` |
| `cout << x << "\n"` | Print; avoid endl in loops. | `cout << ans << "\n";` |
| `istringstream split` | No built-in split — stream a string. | `istringstream iss(s); string w;`<br>`while (iss >> w) words.push_back(w);` |
| `getline with delimiter` | Split on a custom char. | `while (getline(iss, tok, ',')) parts.push_back(tok);` |

> [!WARNING]
> **getline(cin, s).** After cin &gt;&gt; x, call cin.ignore() to drop the leftover newline before getline.



## 2. Text

### string (mutable)

Assume string s = "hello". Mutable in place — no StringBuilder needed, += is amortized O(1).

| Call | What it does | Example | Result |
|---|---|---|---|
| `s.size() / s.length()` | Length (identical). | `s.size()` | `5` |
| `s[i]` | Char access (no bounds check). | `s[1]` | `'e'` |
| `s.at(i)` | Bounds-checked access (throws). | `s.at(1)` | `'e'` |
| `s.substr(pos, len)` | Copy of len chars from pos. | `s.substr(1, 3)` | `"ell"` |
| `s.find(str)` | Index, or string::npos if absent. | `s.find("ll")` | `2` |
| `s.find(str) == string::npos` | The correct 'not found' check. | `s.find("z") == string::npos` | `true` |
| `s += / s.push_back(c)` | Append, amortized O(1). | `s += " world"` | `"hello world"` |
| `s.insert(pos, str)` | Insert (O(n)). | `s.insert(0, "X")` | `"Xhello"` |
| `s.erase(pos, len)` | Remove len chars from pos. | `s.erase(0, 1)` | `"ello"` |
| `s.replace(pos, len, str)` | Replace a range. | `s.replace(0, 1, "H")` | `"Hello"` |
| `reverse(s.begin(), s.end())` | Reverse in place (&lt;algorithm&gt;). | `reverse(s.begin(), s.end())` | `"olleh"` |
| `sort(s.begin(), s.end())` | Sort chars — anagram signatures. | `sort(s.begin(), s.end())` | `"ehllo"` |
| `stoi / stoll / stod(str)` | String -&gt; number. | `stoi("42")` | `42` |
| `to_string(x)` | Number -&gt; string. | `to_string(42)` | `"42"` |
| `"abc" < "abd"` | Operators do lexicographic compare directly. | `"abc" < "abd"` | `true` |



## 3. Sequences and pairs

### vector

Assume vector&lt;int&gt; v = {3, 1, 2}. Contiguous, cache-friendly. push_back/pop_back O(1) amortized; middle insert/erase O(n).

| Call | What it does | Example | Result |
|---|---|---|---|
| `v.push_back(x)` | Append. | `v.push_back(5)` | `{3, 1, 2, 5}` |
| `v.emplace_back(args)` | Construct in place (avoids a copy). | `v.emplace_back(5)` |  |
| `v.pop_back()` | Remove last — returns VOID. | `v.pop_back()` | `{3, 1}` |
| `v[i] / v.at(i)` | Access; at() bounds-checks. | `v[0]` | `3` |
| `v.front() / v.back()` | First / last element. | `v.back()` | `2` |
| `v.size() / v.empty()` | Count / emptiness. | `v.size()` | `3` |
| `v.insert(v.begin()+i, x)` | Insert at index (O(n)). | `v.insert(v.begin()+1, 9)` | `{3, 9, 1, 2}` |
| `v.erase(v.begin()+i)` | Remove at index (O(n)). | `v.erase(v.begin())` | `{1, 2}` |
| `v.clear()` | Remove all elements. | `v.clear()` | `{}` |
| `v.resize(n) / v.resize(n, val)` | Grow/shrink; new slots default 0 or val. | `v.resize(5, -1)` | `{3,1,2,-1,-1}` |
| `v.reserve(n)` | Pre-allocate capacity (size unchanged) — avoids reallocs. | `v.reserve(1000)` |  |
| `v.assign(n, val)` | Replace contents with n copies of val. | `v.assign(3, 7)` | `{7, 7, 7}` |
| `sort(v.begin(), v.end())` | Ascending, NOT stable. | `sort(v.begin(), v.end())` | `{1, 2, 3}` |
| `vector<vector<int>> g(r, vector<int>(c, 0))` | 2D grid, r×c, all 0. | `vector<vector<int>> g(2, vector<int>(3, 0))` |  |
| `erase-remove idiom` | remove() reorders; erase() shrinks. Both needed! | `v.erase(remove(v.begin(), v.end(), 2), v.end());` | `removes all 2s` |

> [!WARNING]
> **v.pop_back().** Returns nothing — read v.back() first if you need the value.

> [!WARNING]
> **erase-remove idiom.** remove() alone does NOT change v.size() — pair it with erase().



### pair & tuple

Bundle values. Both compare lexicographically -&gt; great as map/heap keys with no custom comparator.

| Call | What it does | Example | Result |
|---|---|---|---|
| `pair<int,string> p = {1, "a"}` | Two-value bundle. | `p.first` | `1` |
| `auto [a, b] = p` | Structured binding (C++17) unpack. | `auto [num, str] = p;` |  |
| `make_pair(a, b)` | Build a pair (type inferred). | `make_pair(1, 2)` |  |
| `tuple + get<i>(t)` | N values; access by index. | `tuple<int,int,int> t={1,2,3}; get<0>(t)` | `1` |
| `sort by .first then .second` | Automatic for vector&lt;pair&gt;. | `sort(v.begin(), v.end());  // v is vector<pair<int,int>>` |  |



## 4. Stacks, queues and heaps

### stack / queue / priority_queue

Adaptors over deque. priority_queue is a MAX-heap by default (opposite of Java). pop() returns void everywhere.

| Call | What it does | Example | Result |
|---|---|---|---|
| `stack<int> st` | LIFO. | `st.push(1); st.top(); st.pop();` | `top() = 1` |
| `st.top() / st.pop() / st.empty()` | Peek / remove (void) / test. | `st.top()` |  |
| `queue<int> q` | FIFO. | `q.push(1); q.front(); q.pop();` | `front() = 1` |
| `q.front() / q.back() / q.pop()` | Peek ends / remove front (void). | `q.front()` |  |
| `priority_queue<int> maxh` | MAX-heap (largest on top). | `maxh.push(1); maxh.push(5); maxh.top()` | `5` |
| `priority_queue<int, vector<int>, greater<int>> minh` | MIN-heap — note 3 template args. | `minh.push(5); minh.push(1); minh.top()` | `1` |
| `pq.push / top / pop` | O(log n) push/pop, O(1) top. | `pq.top()` |  |
| `custom comparator (lambda)` | Needs decltype (a lambda's type is unnamed). | `auto cmp = [](auto&a, auto&b){ return a.first > b.first; };`<br>`priority_queue<P, vector<P>, decltype(cmp)> pq(cmp);` |  |

> [!WARNING]
> **pq.push / top / pop.** pop() returns void — read top() BEFORE pop().



## 5. Ordered and hashed containers

### map / set (red-black tree)

Assume map&lt;int,string&gt; m with keys {10,20,30}. O(log n), always sorted. Use member lower_bound, NOT std::lower_bound.

| Call | What it does | Example | Result |
|---|---|---|---|
| `m[k] = v` | Insert/update — but INSERTS a default on mere access! | `m[10] = "a"` |  |
| `m.count(k) / m.contains(k)` | Key present? (contains is C++20.) | `m.count(10)` | `1` |
| `m.find(k)` | Iterator to key, or m.end(). | `m.find(10) != m.end()` | `true` |
| `m.at(k)` | Like [], but THROWS instead of inserting. | `m.at(10)` |  |
| `m.erase(k)` | Remove by key. | `m.erase(10)` |  |
| `for (auto& [k, v] : m)` | Iterates in SORTED key order. | `for (auto& [k, v] : m) use(k, v);` |  |
| `s.insert(x) / count / erase` | set basics. | `s.insert(5); s.count(5)` | `1` |
| `*s.begin() / *s.rbegin()` | Smallest / largest element. | `*s.begin()  // {10,20,30}` | `10` |
| `s.lower_bound(x)` | First element &gt;= x (== ceiling). MEMBER version! | `*s.lower_bound(15)` | `20` |
| `s.upper_bound(x)` | First element &gt; x (== higher). | `*s.upper_bound(20)` | `30` |
| `floor via lower_bound` | No direct method — step back. | `auto it = s.lower_bound(25);`<br>`if (it != s.begin()) --it;  // floor(25) = 20` |  |
| `multiset erase` | erase(key) removes ALL copies; erase(iterator) removes one. | `ms.erase(ms.find(3));  // just one` |  |

> [!WARNING]
> **m[k] = v.** Even reading `if (m[k] > 0)` inserts k with value 0. Use .find()/.count()/.at() for pure lookups.

> [!WARNING]
> **s.lower_bound(x).** Use s.lower_bound(x), NOT std::lower_bound(...) — the free function is O(n) on trees.

> [!WARNING]
> **multiset erase.** ms.erase(3) deletes EVERY 3. Use erase(find(3)) for a single occurrence.



### unordered_map / unordered_set (hash)

Average O(1), no ordering. Your default for counting & lookup unless you need sorted order.

| Call | What it does | Example |
|---|---|---|
| `freq[x]++` | Frequency count — inserts 0 first if absent. | `for (int x : v) freq[x]++;` |
| `m.count(k) / m.contains(k)` | Membership (contains is C++20). | `m.count(k)` |
| `m.find(k) / m.erase(k)` | Locate / remove. | `m.erase(k)` |
| `seen.insert(x) / seen.count(x)` | unordered_set basics. | `seen.insert(x)` |
| `m.reserve(n)` | Pre-size buckets to avoid rehashing mid-loop. | `m.reserve(1000)` |
| `no lower_bound / order` | Iteration order is unspecified — never rely on it. |  |

> [!WARNING]
> **no lower_bound / order.** Need sorted order or nearest-key? Use map/set instead.



## 6. Algorithms

### <algorithm>

Assume vector&lt;int&gt; v. Most take iterator ranges [begin, end) and an optional predicate/comparator.

| Call | What it does | Example | Result |
|---|---|---|---|
| `sort(b, e)` | Ascending, NOT stable (introsort). | `sort(v.begin(), v.end())` |  |
| `sort(b, e, greater<int>())` | Descending. | `sort(v.begin(), v.end(), greater<int>())` |  |
| `sort(b, e, lambda)` | Custom comparator. | `sort(v.begin(), v.end(), [](int a, int b){ return a > b; })` |  |
| `stable_sort(b, e)` | Preserves order of equal elements. | `stable_sort(v.begin(), v.end())` |  |
| `nth_element(b, b+k, e)` | O(n) avg — v[k] as if sorted, nothing else. | `nth_element(v.begin(), v.begin()+k, v.end())` |  |
| `partial_sort(b, b+k, e)` | First k sorted, O(n log k) — top-k. | `partial_sort(v.begin(), v.begin()+3, v.end())` |  |
| `binary_search(b, e, x)` | bool — range must be sorted. | `binary_search(v.begin(), v.end(), 5)` | `true/false` |
| `lower_bound(b, e, x)` | First &gt;= x (iterator). | `lower_bound(v.begin(), v.end(), x) - v.begin()` | `index` |
| `upper_bound(b, e, x)` | First &gt; x. | `upper_bound(v.begin(), v.end(), x)` |  |
| `count of x` | upper - lower on a sorted range. | `upper_bound(b,e,x) - lower_bound(b,e,x)` |  |
| `max_element / min_element(b, e)` | Iterator to extreme. | `*max_element(v.begin(), v.end())` |  |
| `count / count_if(b, e, ...)` | How many equal x / match pred. | `count_if(v.begin(), v.end(), [](int x){return x>0;})` |  |
| `find / find_if(b, e, ...)` | Iterator to first match, else end(). | `find(v.begin(), v.end(), 5)` |  |
| `all_of / any_of / none_of` | Boolean over a predicate. | `all_of(v.begin(), v.end(), [](int x){return x>0;})` |  |
| `reverse / rotate(b, [m,] e)` | Reverse / rotate left so m is new front. | `reverse(v.begin(), v.end())` |  |
| `unique(b, e)` | Drop CONSECUTIVE dupes — sort first, pair with erase. | `v.erase(unique(v.begin(),v.end()), v.end())` |  |
| `next_permutation(b, e)` | Advance to next lexicographic permutation. | `sort(v.begin(), v.end());`<br>`do { use(v); } while (next_permutation(v.begin(), v.end()));` |  |
| `set_union / set_intersection / set_difference` | On two SORTED ranges, one pass. | `set_intersection(a.begin(),a.end(), b.begin(),b.end(), out.begin())` |  |



## 7. Numbers, math and bits

### <numeric>, math & bits

Reductions, prefix sums, and single-instruction bit counts.

| Call | What it does | Example | Result |
|---|---|---|---|
| `accumulate(b, e, 0)` | Sum (int accumulator). | `accumulate(v.begin(), v.end(), 0)` | `6` |
| `accumulate(b, e, 0LL)` | Sum as long long — avoids overflow. | `accumulate(v.begin(), v.end(), 0LL)` |  |
| `accumulate(b, e, 1, multiplies<int>())` | Product. | `accumulate(v.begin(), v.end(), 1, multiplies<int>())` |  |
| `partial_sum(b, e, out)` | Prefix sums in one call. | `partial_sum(v.begin(), v.end(), pre.begin())` |  |
| `iota(b, e, start)` | Fill 0,1,2,... — index arrays. | `iota(v.begin(), v.end(), 0)` | `{0, 1, 2}` |
| `gcd(a, b) / lcm(a, b)` | C++17, in &lt;numeric&gt;. | `gcd(12, 18)` | `6` |
| `min / max / abs / clamp` | clamp(x, lo, hi) is C++17. | `clamp(15, 0, 10)` | `10` |
| `__builtin_popcount(x)` | Set bits (one CPU instr). | `__builtin_popcount(7)` | `3` |
| `__builtin_ctz(x) / __builtin_clz(x)` | Trailing / leading zero count. | `__builtin_ctz(8)` | `3` |
| `x & (x-1), x & -x` | Clear / isolate the lowest set bit. | `12 & 11` | `8` |

> [!WARNING]
> **accumulate(b, e, 0LL).** Seed with 0LL when the sum can exceed ~2.1e9.

> [!WARNING]
> **__builtin_ctz(x) / __builtin_clz(x).** Undefined for x == 0 — guard it.



## 8. Interview idioms

### Interview idioms & hacks

Full working patterns.

#### Frequency count

Array for small alphabet, map otherwise.

```cpp
int f[26] = {0};
for (char c : s) f[c - 'a']++;
```

#### Grid direction array

Loop offsets instead of 4 branches.

```cpp
vector<pair<int,int>> dirs = {{-1,0},{1,0},{0,-1},{0,1}};
for (auto& [dr, dc] : dirs) { nr=r+dr; nc=c+dc; }
```

#### Monotonic stack

Indices, decreasing by value.

```cpp
stack<int> st;
for (int i = 0; i < n; i++) {
  while (!st.empty() && nums[st.top()] < nums[i]) {
    res[st.top()] = nums[i]; st.pop();
  }
  st.push(i);
}
```

#### Prefix sums

O(1) range sum after O(n) build.

```cpp
vector<int> pre(n+1, 0);
for (int i = 0; i < n; i++) pre[i+1] = pre[i] + a[i];
int sum = pre[j] - pre[i];  // a[i..j)
```

#### Union-Find (DSU)

Path compression + union by rank ~ O(1).

```cpp
int find(int x){ return p[x]==x ? x : p[x]=find(p[x]); }
bool unite(int a,int b){
  a=find(a); b=find(b);
  if(a==b) return false;
  if(rnk[a]<rnk[b]) swap(a,b);
  p[b]=a; if(rnk[a]==rnk[b]) rnk[a]++;
  return true;
}
```

#### Fast power (mod)

O(log n).

```cpp
long long p = 1; base %= mod;
while (exp) {
  if (exp & 1) p = p*base % mod;
  base = base*base % mod; exp >>= 1;
}
```



## 9. STL container taxonomy

C++ containers are **not** related by inheritance; they are independent templates. This is a grouping by access pattern, with what each adaptor is built on.

Tap or click the sketch to open it full screen and zoom.

```excalidraw
flowchart LR
    Root["STL containers"]:::cat --> Seq["Sequence"]:::cat
    Root --> Ord["Associative (ordered)"]:::cat
    Root --> Hash["Unordered (hash)"]:::cat
    Root --> Ad["Adaptors"]:::cat
    Seq --> vector["vector"]:::box
    Seq --> deque["deque"]:::box
    Seq --> list["list"]:::box
    Seq --> array["array"]:::box
    Ord --> set["set / multiset"]:::box
    Ord --> map["map / multimap"]:::box
    Hash --> uset["unordered_set"]:::box
    Hash --> umap["unordered_map"]:::box
    Ad --> stack["stack"]:::box
    Ad --> queue["queue"]:::box
    Ad --> pq["priority_queue"]:::box
    classDef cat fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef box fill:#dcfce7,stroke:#16a34a,color:#14532d
```

The four families, by access pattern. Ordered containers are red-black trees (sorted, O(log n)); unordered ones are hash tables (average O(1)); adaptors restrict another container's interface: `stack` and `queue` sit on `deque`, `priority_queue` sits on `vector`.

| Type | Kind | What to know |
|---|---|---|
| `STL Containers` | family | std:: — chosen by access pattern, not a class tree. |
| `Sequence` | family | Order you insert; index or linked access. |
| `Associative (ordered)` | family | Red-black tree: sorted, O(log n). |
| `Unordered (hash)` | family | Hash table: average O(1), no order. |
| `Adaptors` | family | Restricted interface over another container. |
| `vector` | container | Dynamic array, contiguous. The default. |
| `deque` | container | Double-ended; O(1) push/pop both ends. |
| `list` | container | Doubly-linked list; O(1) splice. |
| `array` | container | Fixed-size stack array (std::array). |
| `set / multiset` | container | Sorted unique / multi keys. |
| `map / multimap` | container | Sorted key→value. |
| `unordered_set` | container | Hash set, average O(1). |
| `unordered_map` | container | Hash map, average O(1). |
| `stack` | container | LIFO — backed by deque. |
| `queue` | container | FIFO — backed by deque. |
| `priority_queue` | container | Max-heap — backed by vector. |



## 10. Iterator invalidation

After these operations, iterators you held before may no longer be valid. Re-acquire them instead of reusing them.

| Container | Operation | What is invalidated |
|---|---|---|
| `vector` | `push_back` / `insert` that reallocates | all iterators, pointers and references |
| `vector` | `insert` / `erase` without reallocation | from the change position to the end |
| `deque` | `insert` / `erase` in the middle | all iterators and references |
| `deque` | `push_back` / `push_front` | all iterators (references stay valid) |
| `list`, `set`, `map` | `erase` | only the erased element; `insert` invalidates nothing |
| `unordered_set`, `unordered_map` | `insert` that causes a rehash | all iterators (references stay valid) |

## 11. Undefined behaviour traps

| Situation | Why it bites | Safe version |
|---|---|---|
| `v[i]` with `i >= v.size()` | `operator[]` does no bounds check | `v.at(i)`, or check the size |
| `pop_back()`, `top()`, `front()` on an empty container | undefined behaviour, not an exception | test `empty()` first |
| `*it` when `it == end()` | dereferences past the last element | compare with `end()` first |
| Signed `int` overflow | undefined, does not wrap around | use `long long` |
| `__builtin_ctz(0)` / `__builtin_clz(0)` | result is undefined for zero | guard with `if (x)` |
| Reusing an invalidated iterator | see the table above | re-acquire after modifying |
| Reading with `m[k]` | inserts a default value for a missing key | `count`, `find` or `at` |
