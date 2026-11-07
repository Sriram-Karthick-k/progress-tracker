# 1. Java Cheat Sheet — Input, Text, Collections, Sorting & Interview Idioms

One page, in the order you reach for things: input and numbers, text, arrays, collections, sorting, streams, then ready-made patterns. Examples assume `import java.util.*;`.

## Pick the right structure

| You need | Use | Why |
|---|---|---|
| Indexed list (the default) | `ArrayList` | O(1) `get`/`set`, amortised O(1) append |
| Stack (LIFO) | `ArrayDeque` with `push` / `pop` / `peek` | faster than `Stack`, no synchronisation |
| Queue (FIFO) or sliding window | `ArrayDeque` with `offer` / `poll` / `peek` | O(1) at both ends |
| Always the smallest (or largest) next | `PriorityQueue` | O(log n) `offer`/`poll`, O(1) `peek` |
| Key to value lookup, counting | `HashMap` | O(1) average |
| Unique items, membership test | `HashSet` | O(1) average; `add` returns `false` if already there |
| Keep insertion order | `LinkedHashMap` / `LinkedHashSet` | hash speed plus predictable iteration |
| Sorted keys, floor and ceiling queries | `TreeMap` / `TreeSet` | O(log n), nearest-key search |
| LRU cache | `LinkedHashMap` in access order | `removeEldestEntry` evicts for you |
| Fixed size, fastest, no boxing | `int[]` and friends | primitives, contiguous memory |

## Cost at a glance

| Structure | `get` / `contains` | Add | Remove | Order |
|---|---|---|---|---|
| `ArrayList` | `get` O(1), `contains` O(n) | end O(1) amortised, middle O(n) | O(n) | insertion index |
| `ArrayDeque` | `contains` O(n) | both ends O(1) | both ends O(1) | insertion |
| `PriorityQueue` | `peek` O(1), `contains` O(n) | O(log n) | `poll` O(log n), `remove(x)` O(n) | head only |
| `HashMap` / `HashSet` | O(1) average | O(1) average | O(1) average | none |
| `LinkedHashMap` / `LinkedHashSet` | O(1) average | O(1) average | O(1) average | insertion or access |
| `TreeMap` / `TreeSet` | O(log n) | O(log n) | O(log n) | sorted |

## 1. Input and output

### Fast I/O

BufferedReader is far faster than Scanner for large input. Batch output into a StringBuilder and print once.

| Call | What it does | Example | Result |
|---|---|---|---|
| `new BufferedReader(new InputStreamReader(System.in))` | Fast line reader. `throws IOException` on main. | `String line = br.readLine();` |  |
| `br.readLine()` | Reads one whole line (no newline). null at EOF. | `int n = Integer.parseInt(br.readLine().trim());` |  |
| `line.split(" ")` | Split a line into tokens. | `int[] a = Arrays.stream(br.readLine().split(" "))`<br>`.mapToInt(Integer::parseInt).toArray();` |  |
| `new Scanner(System.in)` | Convenient but slow — fine for tiny input. | `Scanner sc = new Scanner(System.in);` |  |
| `sc.nextInt() / next() / nextLine()` | Read an int / one token / rest of line. | `int n = sc.nextInt();`<br>`String w = sc.next();` |  |
| `System.out.print(sb)` | One flush of a StringBuilder = fast output. | `StringBuilder sb = new StringBuilder();`<br>`sb.append(x).append("\n");`<br>`System.out.print(sb);` |  |
| `System.out.printf(fmt, ...)` | C-style format. %d int, %s str, %.2f float, %n newline. | `System.out.printf("%.2f%n", 3.14159);` | `3.14` |

> [!WARNING]
> **sc.nextInt() / next() / nextLine().** nextInt() leaves the newline unread — call nextLine() once to consume it before reading a full line.



## 2. Numbers

### Primitives, Wrappers & Parsing

int/long/double are values on the stack; Integer/Long/Double are objects (needed in collections). Watch overflow and == on wrappers.

| Call | What it does | Example | Result |
|---|---|---|---|
| `(int) 3.99` | Cast truncates toward zero, never rounds. | `(int) 3.99` | `3` |
| `(byte) 130` | Narrowing cast WRAPS around, doesn't clamp. | `(byte) 130` | `-126` |
| `7 / 2` | Integer division truncates. | `7 / 2  vs  7 / 2.0` | `3  vs  3.5` |
| `a + b (int overflow)` | Overflow is SILENT — no exception. | `Integer.MAX_VALUE + 1` | `-2147483648` |
| `Integer.parseInt(s)` | String -&gt; int. Throws NumberFormatException on bad input. | `Integer.parseInt("42")` | `42` |
| `Integer.parseInt(s, radix)` | Parse in a given base. | `Integer.parseInt("ff", 16)` | `255` |
| `Long.parseLong / Double.parseDouble` | Same for long / double. | `Double.parseDouble("3.14")` | `3.14` |
| `Integer.valueOf(s)` | Returns a boxed Integer (cached for -128..127). | `Integer.valueOf(42)` | `42` |
| `a == b  (Integer)` | Reference compare — only 'works' in the -128..127 cache! | `Integer a=128, b=128; a==b` | `false` |
| `String.valueOf(x)` | Any primitive -&gt; String. | `String.valueOf(42)` | `"42"` |
| `Integer.MAX_VALUE / MIN_VALUE` | Int bounds. Long.MAX_VALUE for overflow safety. | `Integer.MAX_VALUE` | `2147483647` |

> [!WARNING]
> **a + b (int overflow).** Cast to long BEFORE the op if a sum/product can exceed ~2.1e9: (long) a + b.

> [!WARNING]
> **a == b  (Integer).** NEVER use == on wrappers. Use a.equals(b), or unbox to int first.



### Math & Bit Manipulation

Numeric helpers and bit tricks. floorMod gives a TRUE (non-negative) modulo.

| Call | What it does | Example | Result |
|---|---|---|---|
| `Math.max / min / abs` | Basic numeric ops. | `Math.max(3, 7)` | `7` |
| `Math.pow(a, b)` | Returns a DOUBLE — cast for an int result. | `(int) Math.pow(2, 10)` | `1024` |
| `Math.sqrt / cbrt` | Roots. | `Math.sqrt(16)` | `4.0` |
| `Math.floorDiv(a, b)` | Floored division (differs from / for negatives). | `Math.floorDiv(-7, 2)` | `-4` |
| `Math.floorMod(a, b)` | TRUE modulo — always non-negative. | `Math.floorMod(-1, 5)` | `4` |
| `1 << k` | 2^k. | `1 << 4` | `16` |
| `x & (x - 1)` | Clear the lowest set bit. | `12 & 11` | `8` |
| `(x & (x - 1)) == 0` | Is x a power of two? (x != 0). | `(8 & 7) == 0` | `true` |
| `x & -x` | Isolate the lowest set bit. | `12 & -12` | `4` |
| `x >> 1  vs  x >>> 1` | Arithmetic (keeps sign) vs logical (fills 0) shift. | `-8 >> 1  vs  -8 >>> 1` | `-4  vs  2147483644` |
| `a ^ b ^ a` | XOR self-cancels -&gt; b. Basis of 'single number'. | `5 ^ 3 ^ 5` | `3` |

> [!WARNING]
> **Math.floorMod(a, b).** -1 % 5 is -1 in Java. Use floorMod for circular indexing.



## 3. Text

### String (immutable)

Assume String s = "hello world". Every method returns a NEW string — s is never modified.

| Call | What it does | Example | Result |
|---|---|---|---|
| `s.length()` | Number of chars (a method, not a field). | `s.length()` | `11` |
| `s.charAt(i)` | Char at index i. | `s.charAt(1)` | `'e'` |
| `s.substring(i)` | From index i to the end (copy). | `s.substring(6)` | `"world"` |
| `s.substring(i, j)` | Range [i, j), end EXCLUSIVE. | `s.substring(0, 5)` | `"hello"` |
| `s.indexOf(str)` | First index of substring, -1 if absent. | `s.indexOf("o")` | `4` |
| `s.indexOf(str, from)` | First index at/after `from`. | `s.indexOf("o", 5)` | `7` |
| `s.lastIndexOf(str)` | Last index of substring. | `s.lastIndexOf("o")` | `7` |
| `s.contains(cs)` | Substring present? | `s.contains("wor")` | `true` |
| `s.startsWith / s.endsWith` | Prefix / suffix test. | `s.startsWith("he")` | `true` |
| `s.isEmpty()` | Length == 0? | `"".isEmpty()` | `true` |
| `s.isBlank()` | Empty or all whitespace? (Java 11+) | `"  ".isBlank()` | `true` |
| `s.equals(o)` | Content equality — ALWAYS use this, not ==. | `s.equals("hello world")` | `true` |
| `s.equalsIgnoreCase(o)` | Case-insensitive content equality. | `"HI".equalsIgnoreCase("hi")` | `true` |
| `s.compareTo(o)` | Lexicographic: &lt;0 / 0 / &gt;0. | `"a".compareTo("b")` | `-1` |
| `s.toUpperCase / toLowerCase` | Case conversion (new string). | `"Hi".toUpperCase()` | `"HI"` |
| `s.trim()` | Remove leading/trailing ASCII whitespace. | `"  hi  ".trim()` | `"hi"` |
| `s.strip()` | Unicode-aware trim (Java 11+, prefer this). | `"  hi  ".strip()` | `"hi"` |
| `s.replace(a, b)` | Replace ALL occurrences (literal, not regex). | `"aaa".replace("a", "b")` | `"bbb"` |
| `s.replaceAll(regex, r)` | Regex replace all. | `"a1b2".replaceAll("\\d", "#")` | `"a#b#"` |
| `s.split(regex)` | Split by REGEX into a String[]. | `s.split(" ")` | `["hello", "world"]` |
| `s.split(regex, limit)` | At most `limit` pieces. | `"a,b,c".split(",", 2)` | `["a", "b,c"]` |
| `s.toCharArray()` | String -&gt; char[] for index work. | `"abc".toCharArray()` | `['a','b','c']` |
| `s.repeat(n)` | Concatenate s n times (Java 11+). | `"ab".repeat(3)` | `"ababab"` |
| `String.join(sep, parts)` | Static — glue items with a separator. | `String.join("-", "a", "b", "c")` | `"a-b-c"` |
| `String.format(fmt, ...)` | Static — build via format specifiers. | `String.format("%03d", 7)` | `"007"` |

> [!WARNING]
> **s.split(regex).** s.split(".") splits on EVERY char (. = any char in regex). Use split("\\.") for a literal dot.



### StringBuilder (mutable)

Assume StringBuilder sb = new StringBuilder("abc"). Mutates in place — use this to build strings, never += in a loop (that's O(n²)).

| Call | What it does | Example | Result |
|---|---|---|---|
| `sb.append(x)` | Append any type; chainable; amortized O(1). | `sb.append("d").append(1)` | `"abcd1"` |
| `sb.insert(i, x)` | Insert at index i (O(n), shifts right). | `sb.insert(0, "X")` | `"Xabc"` |
| `sb.deleteCharAt(i)` | Remove the char at index i. | `sb.deleteCharAt(0)` | `"bc"` |
| `sb.delete(i, j)` | Remove range [i, j). | `sb.delete(1, 3)` | `"a"` |
| `sb.setCharAt(i, c)` | Overwrite one char in place. | `sb.setCharAt(0, 'Z')` | `"Zbc"` |
| `sb.charAt(i)` | Read a char. | `sb.charAt(1)` | `'b'` |
| `sb.reverse()` | Reverse in place — palindrome/digit tricks. | `new StringBuilder("abc").reverse()` | `"cba"` |
| `sb.length()` | Current length. | `sb.length()` | `3` |
| `sb.setLength(n)` | Truncate/extend. setLength(len-1) = drop last char, O(1). | `sb.setLength(2)` | `"ab"` |
| `sb.toString()` | Convert to an immutable String at the end. | `sb.toString()` | `"abc"` |



### Character & Integer statics

Classify/convert chars without regex. `c - 'a'` maps 'a'..'z' to 0..25 — the key to frequency arrays.

| Call | What it does | Example | Result |
|---|---|---|---|
| `Character.isDigit(c)` | Is '0'-'9'? | `Character.isDigit('7')` | `true` |
| `Character.isLetter(c)` | Is a letter? | `Character.isLetter('a')` | `true` |
| `Character.isLetterOrDigit(c)` | Alphanumeric? | `Character.isLetterOrDigit('#')` | `false` |
| `Character.isUpperCase / isLowerCase` | Case test. | `Character.isUpperCase('A')` | `true` |
| `Character.toLowerCase / toUpperCase` | Convert one char. | `Character.toUpperCase('a')` | `'A'` |
| `Character.getNumericValue(c)` | Digit char -&gt; its int value. | `Character.getNumericValue('7')` | `7` |
| `(int) c` | Char -&gt; code point. | `(int) 'a'` | `97` |
| `c - 'a'` | Map lowercase letter to 0..25 (freq-array index). | `'c' - 'a'` | `2` |
| `Integer.bitCount(x)` | Number of set (1) bits. | `Integer.bitCount(7)` | `3` |
| `Integer.toBinaryString(x)` | Binary text. | `Integer.toBinaryString(5)` | `"101"` |
| `Integer.compare(a, b)` | Overflow-safe comparison for comparators. | `Integer.compare(2, 5)` | `-1` |



## 4. Arrays

### Arrays

Assume int[] a = {3, 1, 2}. Fixed length, default 0/false/null. `java.util.Arrays` holds the algorithms.

| Call | What it does | Example | Result |
|---|---|---|---|
| `new int[n]` | Length n, all zeros. | `new int[3]` | `{0, 0, 0}` |
| `a.length` | Length — a FIELD (no parens), unlike String.length(). | `a.length` | `3` |
| `Arrays.sort(a)` | Ascending, in place. No comparator for primitives! | `Arrays.sort(a)` | `{1, 2, 3}` |
| `Arrays.sort(a, from, to)` | Sort only range [from, to). | `Arrays.sort(a, 0, 2)` | `{1, 3, 2}` |
| `Arrays.fill(a, v)` | Set every slot to v. | `Arrays.fill(a, -1)` | `{-1, -1, -1}` |
| `Arrays.copyOf(a, len)` | Copy, padding with 0 or truncating. | `Arrays.copyOf(a, 4)` | `{3, 1, 2, 0}` |
| `Arrays.copyOfRange(a, i, j)` | Slice [i, j). | `Arrays.copyOfRange(a, 0, 2)` | `{3, 1}` |
| `Arrays.binarySearch(a, key)` | O(log n) — array must be SORTED first. | `Arrays.binarySearch(new int[]{1,2,3}, 2)` | `1` |
| `Arrays.equals(a, b)` | Element-wise equality (== compares refs!). | `Arrays.equals(a, new int[]{3,1,2})` | `true` |
| `Arrays.toString(a)` | Printable form for 1D. | `Arrays.toString(a)` | `"[3, 1, 2]"` |
| `Arrays.deepToString(grid)` | Printable form for 2D/nested. | `Arrays.deepToString(new int[][]{{1,2}})` | `"[[1, 2]]"` |
| `Arrays.stream(a).sum() / max()` | Reduce a primitive array. | `Arrays.stream(a).sum()` | `6` |
| `a.clone()` | Shallow copy of the array. | `a.clone()` | `{3, 1, 2}` |
| `Arrays.asList(boxed)` | FIXED-SIZE List view of an Integer[]. | `Arrays.asList(1, 2, 3)` | `[1, 2, 3]` |
| `int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}}` | Grid neighbor offsets — loop these instead of 4 if-blocks. | `for (int[] d : dirs) { nr=r+d[0]; nc=c+d[1]; }` |  |

> [!WARNING]
> **Arrays.asList(boxed).** On a primitive int[] this returns a List&lt;int[]&gt; of size 1! Only use with Integer[] / objects.



### Pair (Java has none built in!)

Unlike C++'s std::pair, java.util has NO Pair class. Four idiomatic stand-ins, weakest to strongest — pick based on whether you need it as a map/heap key, and whether you need field NAMES.

| Call | What it does | Example | Result |
|---|---|---|---|
| `int[] / Object[] of size 2` | Zero ceremony — the #1 choice for coordinates or (value, index). | `int[] p = {row, col};`<br>`int r = p[0], c = p[1];` |  |
| `List.of(a, b) — for HashMap/HashSet keys` | Immutable, and List already has real equals()/hashCode() (element-wise) — safe to put in a Set/Map, unlike int[]. | `Set<List<Integer>> seen = new HashSet<>();`<br>`seen.add(List.of(r, c));`<br>`seen.contains(List.of(r, c));` | `true — int[] would fail this (reference equality)` |
| `AbstractMap.SimpleEntry<K,V>` | The closest thing to a REAL Pair — mutable, in java.util. Same type Map.Entry uses. | `var p = new AbstractMap.SimpleEntry<>(1, "a");`<br>`p.getKey();  p.getValue();`<br>`p.setValue("b");   // mutable!` | `1,  then "b" after setValue` |
| `AbstractMap.SimpleImmutableEntry<K,V>` | Same shape, but locked — setValue() throws. Prefer this when you don't need to mutate. | `var p = new AbstractMap.SimpleImmutableEntry<>(1, "a");`<br>`p.getKey();  p.getValue();` | `1, "a"` |
| `record Pair(int a, int b) {}  — Java 16+` | The BEST option when allowed: named fields, free equals/hashCode/toString, and you write it yourself in one line. | `record Pair(int a, int b) {}`<br>`Pair p = new Pair(1, 2);`<br>`p.a();  p.b();          // accessors are a()/b(), not getA()` | `1, 2` |
| `PriorityQueue<int[]> — heap 'pair' by first element` | The array-of-2 idiom extends straight into heaps — no wrapper type needed. | `PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[0] - y[0]);`<br>`pq.offer(new int[]{dist, node});` |  |
| `Map.Entry<K,V> — what entrySet() already gives you` | You don't need to build one to READ a map's pairs — just iterate entrySet(). | `for (Map.Entry<String,Integer> e : m.entrySet())`<br>`use(e.getKey(), e.getValue());` |  |

> [!WARNING]
> **int[] / Object[] of size 2.** No .equals()/hashCode() beyond reference identity for Object[] — fine for a local var, risky as a HashSet/HashMap key (use a List&lt;Integer&gt; or record instead — see below).



## 5. Lists, stacks and queues

### List — ArrayList

Assume List&lt;Integer&gt; l = [3, 1, 2]. Backed by a resizable array: O(1) get/set, O(n) middle insert/remove. Default container.

| Call | What it does | Example | Result |
|---|---|---|---|
| `l.add(e)` | Append to end, O(1) amortized. | `l.add(5)` | `[3, 1, 2, 5]` |
| `l.add(i, e)` | Insert at index i, O(n). | `l.add(1, 9)` | `[3, 9, 1, 2]` |
| `l.get(i)` | Read at index, O(1). | `l.get(0)` | `3` |
| `l.set(i, e)` | Replace at index; returns OLD value. | `l.set(0, 7)` | `3  (l = [7, 1, 2])` |
| `l.remove(int i)` | Remove by INDEX. | `l.remove(0)` | `3  (l = [1, 2])` |
| `l.remove(Object o)` | Remove by VALUE — must box! | `l.remove(Integer.valueOf(1))` | `true  (l = [3, 2])` |
| `l.indexOf(o)` | First index of value, -1 if absent. O(n). | `l.indexOf(1)` | `1` |
| `l.contains(o)` | Value present? O(n). | `l.contains(2)` | `true` |
| `l.size() / l.isEmpty()` | Count / emptiness. | `l.size()` | `3` |
| `l.clear()` | Remove everything. | `l.clear()` | `[]` |
| `Collections.sort(l)` | Ascending, stable. | `Collections.sort(l)` | `[1, 2, 3]` |
| `l.sort(cmp)` | Custom order. | `l.sort((a, b) -> b - a)` | `[3, 2, 1]` |
| `l.removeIf(pred)` | Delete all matching — safe during iteration. | `l.removeIf(x -> x < 2)` | `[3, 2]` |
| `l.replaceAll(op)` | In-place map over every element. | `l.replaceAll(x -> x * 10)` | `[30, 10, 20]` |
| `l.subList(i, j)` | LIVE VIEW of [i, j) — mutations write through! | `l.subList(0, 2)` | `[3, 1]` |
| `l.toArray(new Integer[0])` | List -&gt; array. | `l.toArray(new Integer[0])` | `Integer[]{3, 1, 2}` |
| `List.of(...)` | IMMUTABLE list — add/set throw. | `List.of(1, 2, 3)` | `[1, 2, 3]` |
| `new ArrayList<>(List.of(...))` | Mutable copy of an immutable list. | `new ArrayList<>(List.of(1, 2))` | `[1, 2]  (resizable)` |
| `Iterator + it.remove()` | Only safe way to delete mid-loop besides removeIf. | `var it = l.iterator();`<br>`while (it.hasNext()) if (it.next()<0) it.remove();` |  |

> [!WARNING]
> **l.remove(Object o).** l.remove(1) calls remove(index)! Box the value: remove(Integer.valueOf(1)).

> [!WARNING]
> **l.subList(i, j).** Not a copy. Wrap in new ArrayList&lt;&gt;(l.subList(i,j)) if you need an independent list.

> [!WARNING]
> **Iterator + it.remove().** Removing in a for-each throws ConcurrentModificationException.



### Deque — Stack & Queue (ArrayDeque)

Deque&lt;Integer&gt; dq = new ArrayDeque&lt;&gt;(). Faster than Stack/LinkedList. No nulls. Use for stack, queue, and sliding-window deque.

| Call | What it does | Example | Result |
|---|---|---|---|
| `dq.push(e)` | STACK: add to front (= addFirst). | `dq.push(1); dq.push(2)` | `front -> [2, 1]` |
| `dq.pop()` | STACK: remove from front. Throws if empty. | `dq.pop()` | `2` |
| `dq.peek()` | Look at front without removing. null if empty. | `dq.peek()` | `2` |
| `dq.offer(e)` | QUEUE: add to back (= offerLast). | `dq.offer(1); dq.offer(2)` | `[1, 2]` |
| `dq.poll()` | QUEUE: remove from front. null if empty. | `dq.poll()` | `1` |
| `dq.offerFirst / offerLast` | Add to a specific end (both O(1)). | `dq.offerLast(9)` |  |
| `dq.pollFirst / pollLast` | Remove from a specific end; null if empty. | `dq.pollLast()` |  |
| `dq.peekFirst / peekLast` | Look at a specific end; null if empty. | `dq.peekLast()` |  |
| `dq.isEmpty() / dq.size()` | Emptiness / count. | `dq.size()` | `2` |
| `throwing vs null family` | add/remove/getFirst THROW on empty; offer/poll/peek return false/null. |  |  |

> [!WARNING]
> **throwing vs null family.** Prefer offer/poll/peek in algorithms so empty is a value, not an exception.



### PriorityQueue (heap)

MIN-heap by default (opposite of C++). offer/poll O(log n), peek O(1). Iteration is NOT sorted — only the head is ordered.

| Call | What it does | Example | Result |
|---|---|---|---|
| `new PriorityQueue<>()` | Min-heap (smallest on top). | `pq.offer(5); pq.offer(1); pq.peek()` | `1` |
| `new PriorityQueue<>(Collections.reverseOrder())` | Max-heap (largest on top). | `max.offer(5); max.offer(1); max.peek()` | `5` |
| `pq.offer(e) / add(e)` | Insert, O(log n). | `pq.offer(3)` |  |
| `pq.poll()` | Remove and return the head, O(log n). | `// heap {1,3,5}`<br>`pq.poll()` | `1` |
| `pq.peek()` | View the head, O(1). null if empty. | `pq.peek()` | `1` |
| `pq.size() / isEmpty()` | Count / emptiness. | `pq.size()` | `3` |
| `new PriorityQueue<>((a, b) -> ...)` | Custom order (objects, arrays, multi-key). | `// min-heap of int[] by a[0]:`<br>`new PriorityQueue<>((a, b) -> a[0] - b[0])` |  |
| `Comparator chain` | Order by field, with tie-breakers. | `new PriorityQueue<>(`<br>`(a,b) -> a[1]!=b[1] ? b[1]-a[1] : a[0]-b[0])` |  |
| `pq.remove(o) / contains(o)` | Arbitrary element — O(n)! |  |  |
| `k-largest idiom` | Keep a MIN-heap capped at size k. | `for (int v : nums) {`<br>`pq.offer(v);`<br>`if (pq.size() > k) pq.poll();`<br>`}`<br>`// pq.peek() = k-th largest` |  |

> [!WARNING]
> **pq.remove(o) / contains(o).** The heap only accelerates the ROOT. Don't rely on remove(x)/contains(x) in a hot loop.



## 6. Maps and sets

### HashMap

Assume Map&lt;String,Integer&gt; m = {a=1, b=2}. O(1) average get/put/remove. containsValue is O(n).

| Call | What it does | Example | Result |
|---|---|---|---|
| `m.put(k, v)` | Insert/overwrite; returns PREVIOUS value or null. | `m.put("a", 9)` | `1  (m = {a=9, b=2})` |
| `m.get(k)` | Value, or null if absent (no exception). | `m.get("a")` | `1` |
| `m.getOrDefault(k, def)` | Value, or a default — skips the null check. | `m.getOrDefault("z", 0)` | `0` |
| `m.containsKey(k)` | Key present? O(1). | `m.containsKey("a")` | `true` |
| `m.containsValue(v)` | Value present? O(n). | `m.containsValue(2)` | `true` |
| `m.remove(k)` | Delete a key; returns its value or null. | `m.remove("a")` | `1` |
| `m.putIfAbsent(k, v)` | Set only if the key is missing. | `m.putIfAbsent("a", 99)` | `1  (unchanged)` |
| `m.merge(k, v, fn)` | FREQUENCY COUNT: insert v, or combine with the old value. | `m.merge("a", 1, Integer::sum)` | `2  (m = {a=2, ...})` |
| `m.computeIfAbsent(k, fn)` | MAP-OF-LISTS: create+cache on first access, return it. | `g.computeIfAbsent(1, x -> new ArrayList<>()).add(2)` | `{1=[2]}` |
| `m.compute(k, (k,v) -> ...)` | Transform present-or-absent value uniformly. | `m.compute("a", (k,v) -> v==null?1:v+1)` | `2` |
| `m.computeIfPresent(k, fn)` | Update only if the key exists. | `m.computeIfPresent("a", (k,v) -> v*10)` | `10` |
| `m.entrySet()` | Iterate key+value pairs. | `for (var e : m.entrySet())`<br>`use(e.getKey(), e.getValue());` |  |
| `m.keySet() / m.values()` | Live views of keys / values. | `m.keySet()` | `[a, b]` |
| `m.forEach((k, v) -> ...)` | Lambda iteration. | `m.forEach((k, v) -> print(k, v));` |  |
| `m.getOrDefault + array/list` | Common: build adjacency or counts without null checks. | `freq.merge(c, 1, Integer::sum);  // count chars` |  |



### HashSet & LinkedHashSet

Assume Set&lt;Integer&gt; s = {1, 2}. O(1) add/contains/remove, no order. LinkedHashSet keeps insertion order.

| Call | What it does | Example | Result |
|---|---|---|---|
| `s.add(e)` | Insert; returns FALSE if already present (doubles as a check). | `s.add(1)` | `false  (already there)` |
| `s.contains(e)` | Membership, O(1). | `s.contains(2)` | `true` |
| `s.remove(e)` | Delete; returns whether it was present. | `s.remove(2)` | `true  (s = {1})` |
| `s.size() / isEmpty()` | Count / emptiness. | `s.size()` | `2` |
| `new HashSet<>(list)` | Dedupe a list (order NOT preserved). | `new HashSet<>(List.of(1,1,2))` | `{1, 2}` |
| `new LinkedHashSet<>(list)` | Dedupe AND preserve first-seen order. | `new LinkedHashSet<>(List.of(4,1,4,2))` | `[4, 1, 2]` |
| `s.addAll(b)` | UNION into s. | `s.addAll(Set.of(2, 3))` | `{1, 2, 3}` |
| `s.retainAll(b)` | INTERSECTION (keep only common). | `s.retainAll(Set.of(2, 3))` | `{2}` |
| `s.removeAll(b)` | DIFFERENCE (remove b's elements). | `s.removeAll(Set.of(2))` | `{1}` |



### TreeMap & TreeSet (sorted)

Assume TreeMap tm with keys {10, 20, 30}. Red-black tree: O(log n), sorted iteration, and nearest-key search a HashMap can't do.

| Call | What it does | Example | Result |
|---|---|---|---|
| `tm.firstKey() / lastKey()` | Min / max key. | `tm.firstKey()` | `10` |
| `tm.floorKey(x)` | Greatest key &lt;= x, else null. | `tm.floorKey(25)` | `20` |
| `tm.ceilingKey(x)` | Smallest key &gt;= x, else null. | `tm.ceilingKey(25)` | `30` |
| `tm.lowerKey(x)` | Greatest key &lt; x (strict). | `tm.lowerKey(20)` | `10` |
| `tm.higherKey(x)` | Smallest key &gt; x (strict). | `tm.higherKey(20)` | `30` |
| `tm.floorEntry / ceilingEntry` | Same, but returns the whole Entry (key+value). | `tm.floorEntry(25).getValue()` |  |
| `tm.pollFirstEntry / pollLastEntry` | Remove-and-return the extreme entry. | `tm.pollFirstEntry()` |  |
| `tm.headMap / tailMap / subMap` | Live range VIEWS by key. | `tm.subMap(10, 30)` | `{10=.., 20=..}` |
| `tm.descendingMap()` | Reverse-order view. | `tm.descendingMap()` | `{30.., 20.., 10..}` |
| `ts.floor/ceiling/lower/higher(x)` | TreeSet nearest-value queries. | `ts.ceiling(12)  // {5,10,15}` | `15` |
| `ts.first / last / pollFirst / pollLast` | Ends of a TreeSet. | `ts.first()` | `5` |
| `new TreeMap<>(cmp)` | Custom order (e.g. reverse). | `new TreeMap<>(Collections.reverseOrder())` |  |

> [!WARNING]
> **tm.higherKey(x).** All four return null if none exists — check before unboxing to int.



### LinkedHashMap & the LRU hack

A HashMap that also remembers order — insertion order by default, or access order (for LRU) with the 3-arg constructor.

#### new LinkedHashMap&lt;&gt;()

Predictable INSERTION-order iteration.

```java
put("b",1); put("a",2)
```

**Result:** `iterates b, a`

#### new LinkedHashMap&lt;&gt;(16, .75f, true)

ACCESS order — get() moves a key to the end.

```java
get("a") refreshes a's recency
```

#### override removeEldestEntry

Return true to auto-evict the oldest — a full LRU cache.

```java
protected boolean removeEldestEntry(e) {
  return size() > capacity;
}
```

#### LRU cache (complete)

accessOrder + removeEldestEntry = LeetCode 146 in ~10 lines.

```java
class LRU extends LinkedHashMap<Integer,Integer> {
  int cap;
  LRU(int c){ super(16,.75f,true); cap=c; }
  int get(int k){ return getOrDefault(k,-1); }
  protected boolean removeEldestEntry(var e){
    return size() > cap;
  }
}
```



## 7. Sorting and utilities

### Comparator & Sorting

Build sort orders declaratively. compare(a,b) &lt; 0 means 'a comes before b'.

| Call | What it does | Example |
|---|---|---|
| `Comparator.naturalOrder() / reverseOrder()` | Ascending / descending default. | `l.sort(Comparator.reverseOrder())` |
| `Comparator.comparingInt(keyFn)` | Order by an int field. | `people.sort(Comparator.comparingInt(p -> p.age))` |
| `Comparator.comparing(keyFn)` | Order by any Comparable field. | `people.sort(Comparator.comparing(p -> p.name))` |
| `.thenComparing(keyFn)` | Tie-breaker chain. | `comparing(p -> p.name).thenComparingInt(p -> p.age)` |
| `.reversed()` | Flip any comparator. | `comparingInt((P p) -> p.age).reversed()` |
| `Comparator.nullsFirst(cmp)` | Sort nulls first instead of NPE. | `l.sort(nullsFirst(naturalOrder()))` |
| `sort 2D int[][]` | int[][] IS objects, so Comparator works here. | `Arrays.sort(intervals, (a, b) -> a[0] - b[0])` |
| `sort int[] descending` | No Comparator for primitives — box first. | `Integer[] b = Arrays.stream(a).boxed().toArray(Integer[]::new);`<br>`Arrays.sort(b, Collections.reverseOrder());` |

> [!WARNING]
> **sort int[] descending.** Arrays.sort(int[], cmp) does NOT exist. Box to Integer[], or sort an index array.



### Collections utility

Static algorithms over any Collection. Assume List&lt;Integer&gt; l = [3, 1, 2].

| Call | What it does | Example | Result |
|---|---|---|---|
| `Collections.sort(l) / sort(l, cmp)` | Stable sort (Timsort). | `Collections.sort(l)` | `[1, 2, 3]` |
| `Collections.reverse(l)` | Reverse in place. | `Collections.reverse(l)` | `[2, 1, 3]` |
| `Collections.max(c) / min(c)` | Extreme element (optional Comparator). | `Collections.max(l)` | `3` |
| `Collections.frequency(c, x)` | Count occurrences. | `Collections.frequency(List.of(1,1,2), 1)` | `2` |
| `Collections.binarySearch(l, key)` | O(log n) — list must be sorted. | `Collections.binarySearch(List.of(1,2,3), 2)` | `1` |
| `Collections.swap(l, i, j)` | Swap two indices. | `Collections.swap(l, 0, 2)` |  |
| `Collections.nCopies(n, e)` | Immutable list of n copies. | `Collections.nCopies(3, 0)` | `[0, 0, 0]` |
| `Collections.shuffle(l)` | Random permutation in place. | `Collections.shuffle(l)` |  |
| `Collections.disjoint(a, b)` | True if no shared element. | `Collections.disjoint([1], [2])` | `true` |
| `Collections.reverseOrder()` | A descending Comparator. | `l.sort(Collections.reverseOrder())` |  |



## 8. Streams

### Streams

Lazy pipelines: intermediate ops (filter/map/sorted) then a terminal op (collect/sum/count). Assume List&lt;Integer&gt; l = [1, 2, 3, 4].

| Call | What it does | Example | Result |
|---|---|---|---|
| `.filter(pred)` | Keep matching elements. | `l.stream().filter(x -> x%2==0).toList()` | `[2, 4]` |
| `.map(fn)` | Transform each element. | `l.stream().map(x -> x*x).toList()` | `[1, 4, 9, 16]` |
| `.mapToInt(fn).sum()` | Reduce to a primitive sum. | `l.stream().mapToInt(x -> x).sum()` | `10` |
| `Arrays.stream(a).max()` | Max — returns an OptionalInt. | `Arrays.stream(a).max().getAsInt()` | `4` |
| `.anyMatch / allMatch / noneMatch` | Boolean tests. | `l.stream().anyMatch(x -> x > 3)` | `true` |
| `.count()` | Number of elements (after filtering). | `l.stream().filter(x -> x>2).count()` | `2` |
| `.sorted() / .distinct()` | Sort / dedupe the stream. | `Stream.of(3,1,3).distinct().sorted().toList()` | `[1, 3]` |
| `.collect(Collectors.toList()) / .toList()` | Materialize into a List. | `l.stream().map(x -> x+1).toList()` | `[2, 3, 4, 5]` |
| `Collectors.joining(sep)` | Concatenate strings. | `l.stream().map(String::valueOf)`<br>`.collect(Collectors.joining(","))` | `"1,2,3,4"` |
| `Collectors.groupingBy(keyFn)` | Bucket by key -&gt; Map&lt;K, List&lt;V&gt;&gt;. | `words.stream().collect(groupingBy(String::length))` |  |
| `Collectors.groupingBy(k, counting())` | Count per group. | `s.chars().boxed()`<br>`.collect(groupingBy(c->c, counting()))` |  |
| `Collectors.partitioningBy(pred)` | Split into true/false buckets. | `l.stream().collect(partitioningBy(x -> x>2))` | `{false=[1,2], true=[3,4]}` |



## 9. Interview idioms

### Interview idioms & hacks

Full working patterns you'll reuse constantly.

#### Frequency count (array)

Fastest when the alphabet is small & known.

```java
int[] f = new int[26];
for (char c : s.toCharArray()) f[c - 'a']++;
```

#### Frequency count (map)

Any key type.

```java
Map<Character,Integer> f = new HashMap<>();
for (char c : s.toCharArray())
  f.merge(c, 1, Integer::sum);
```

#### Adjacency list (graph)

Build with computeIfAbsent.

```java
Map<Integer,List<Integer>> g = new HashMap<>();
for (int[] e : edges) {
  g.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
  g.computeIfAbsent(e[1], k -> new ArrayList<>()).add(e[0]);
}
```

#### Dedupe, keep order

LinkedHashSet round-trip.

```java
new ArrayList<>(new LinkedHashSet<>(nums))
```

**Result:** `[4, 1, 2, 3] from [4,1,4,2,1,3]`

#### Monotonic stack (next greater)

Stack of indices, decreasing by value.

```java
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  while (!st.isEmpty() && nums[st.peek()] < nums[i])
    res[st.pop()] = nums[i];
  st.push(i);
}
```

**Result:** `nextGreater([2,1,3]) = [3, 3, -1]`

#### Prefix sums (O(1) range sum)

Precompute once, subtract to query.

```java
int[] pre = new int[n + 1];
for (int i = 0; i < n; i++) pre[i+1] = pre[i] + a[i];
int rangeSum = pre[j] - pre[i];  // sum of a[i..j)
```

#### Fast power (mod)

O(log n) exponent, needed with a modulus.

```java
long p = 1; base %= mod;
while (exp > 0) {
  if ((exp & 1) == 1) p = p*base % mod;
  base = base*base % mod;
  exp >>= 1;
}
```

#### GCD / LCM

Euclid; divide before multiply for LCM.

```java
long gcd(long a, long b){ return b==0 ? a : gcd(b, a%b); }
long lcm = a / gcd(a, b) * b;
```



## 10. Collections class tree

Everything iterable descends from `Iterable` and `Collection`. `List`, `Set` and `Queue` are its three branches; `Map` is a separate root and is **not** a `Collection`.

Colours: indigo is an **interface**, green is a **class**, red is **legacy** (avoid). A solid arrow means *extends*, a dashed arrow means *implements*. Tap or click the sketch to open it full screen and zoom.

```excalidraw
flowchart LR
    Iterable["Iterable"]:::iface --> Collection["Collection"]:::iface
    Collection --> Set["Set"]:::iface
    Collection --> List["List"]:::iface
    Collection --> Queue["Queue"]:::iface
    Set -.-> HashSet["HashSet"]:::cls
    HashSet --> LinkedHashSet["LinkedHashSet"]:::cls
    Set --> SortedSet["SortedSet"]:::iface
    SortedSet --> NavigableSet["NavigableSet"]:::iface
    NavigableSet -.-> TreeSet["TreeSet"]:::cls
    List -.-> ArrayList["ArrayList"]:::cls
    List -.-> Vector["Vector"]:::legacy
    Vector --> Stack["Stack"]:::legacy
    List -.-> LinkedList["LinkedList"]:::cls
    Queue --> Deque["Deque"]:::iface
    Deque -.-> LinkedList
    Deque -.-> ArrayDeque["ArrayDeque"]:::cls
    Queue -.-> PriorityQueue["PriorityQueue"]:::cls
    Map["Map (not a Collection)"]:::iface -.-> HashMap["HashMap"]:::cls
    HashMap --> LinkedHashMap["LinkedHashMap"]:::cls
    Map -.-> Hashtable["Hashtable"]:::legacy
    Map --> SortedMap["SortedMap"]:::iface
    SortedMap --> NavigableMap["NavigableMap"]:::iface
    NavigableMap -.-> TreeMap["TreeMap"]:::cls
    classDef iface  fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef cls    fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef legacy fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

`Iterable` and `Collection` are the root: `List`, `Set` and `Queue` are its three branches, and `Deque` extends `Queue`. `Map` is a **separate root** and does not extend `Collection`. `LinkedList` implements both `List` and `Deque`, so two arrows reach it.

| Type | Kind | What to know |
|---|---|---|
| `Iterable` | interface | Root — enables the for-each loop. |
| `Collection` | interface | add / remove / size / contains / iterator. |
| `List` | interface | Ordered, index-addressable, allows duplicates. |
| `Set` | interface | No duplicate elements. |
| `SortedSet` | interface | A Set kept in sorted order. |
| `NavigableSet` | interface | SortedSet + floor / ceiling / lower / higher. |
| `Queue` | interface | FIFO — offer / poll / peek. |
| `Deque` | interface | Double-ended — works as stack AND queue. |
| `Map` | interface | Key → value. NOT a Collection. |
| `SortedMap` | interface | A Map kept sorted by key. |
| `NavigableMap` | interface | SortedMap + floorKey / ceilingKey. |
| `ArrayList` | class | Resizable array. O(1) get. The default list. |
| `LinkedList` | class | Doubly-linked; is ALSO a Deque. |
| `Vector` | legacy | Synchronized ArrayList — legacy, avoid. |
| `Stack` | legacy | Extends Vector — use ArrayDeque instead. |
| `HashSet` | class | O(1), no order. Backed by a HashMap. |
| `LinkedHashSet` | class | HashSet + insertion order. |
| `TreeSet` | class | Sorted, red-black tree, O(log n). |
| `ArrayDeque` | class | Fast stack & queue. No nulls. |
| `PriorityQueue` | class | Binary heap; min-heap by default. |
| `HashMap` | class | O(1) average. The default map. |
| `LinkedHashMap` | class | HashMap + order; the LRU-cache base. |
| `TreeMap` | class | Sorted keys, red-black tree, O(log n). |
| `Hashtable` | legacy | Synchronized legacy map — avoid. |



## 11. Common exceptions

| Exception | Typical trigger | Avoid it by |
|---|---|---|
| `NullPointerException` | `int x = map.get(k)` when `k` is absent (unboxing `null`) | `getOrDefault`, or a `null` check |
| `IndexOutOfBoundsException` | `list.get(i)` or `s.charAt(i)` with a bad index | check `0 <= i < size` |
| `NumberFormatException` | `Integer.parseInt("5 ")` or an empty string | `trim()` first, validate input |
| `ArithmeticException` | integer division or modulo by zero (doubles give `Infinity`) | check the divisor |
| `ConcurrentModificationException` | changing a collection inside a for-each over it | `removeIf`, or `Iterator.remove()` |
| `UnsupportedOperationException` | `add` on `List.of(...)` or `Arrays.asList(...)` | copy into `new ArrayList<>(...)` |
| `NoSuchElementException` | `pop()`, `removeFirst()` or `next()` on empty | `isEmpty()` first, or use `poll()` / `peek()` |
| `StackOverflowError` | recursion too deep (long lists, deep trees) | iterate, or use an explicit stack |
