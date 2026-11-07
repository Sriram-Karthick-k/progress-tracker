# 3. JavaScript Cheat Sheet — Numbers, Strings, Arrays, Map/Set & Interview Idioms

One page, in the order you reach for things: input and numbers, text, arrays (with sorting), objects, `Map` and `Set`, syntax, then ready-made patterns. Examples assume the Node.js runtime; built-ins need no imports.

## Pick the right structure

| You need | Use | Notes |
|---|---|---|
| Ordered list | `Array` | `push` / `pop` O(1); `shift` / `unshift` O(n) |
| String-keyed record, JSON-shaped data | `Object` | keys become strings; `Object.keys` / `entries` to iterate |
| Key to value with any key type, a real `.size`, insertion order | `Map` | O(1); the counting and cache structure |
| Unique values, fast membership | `Set` | `.has` is O(1); `[...new Set(arr)]` dedupes |
| Queue with cheap dequeue | array plus a head index, or a linked list | `shift()` is O(n) on large arrays |
| Priority queue | none built in | write a binary heap (about 25 lines) |

## 1. Input and output

### I/O & logging (Node)

For stdin judges, read everything at once. LeetCode-style just implements a function.

| Call | What it does | Example | Result |
|---|---|---|---|
| `readFileSync(0, "utf8")` | Read ALL stdin (0 = stdin fd). | `const data = require("fs").readFileSync(0, "utf8");`<br>`const lines = data.trim().split("\n");` |  |
| `.split(" ").map(Number)` | Line of numbers -&gt; number array. | `lines[1].split(" ").map(Number)` | `[1, 2, 3]` |
| `console.log(...)` | Print; multiple args auto-spaced. | `console.log("x", 42)` | `x 42` |
| <code>&#96;&#36;{expr}&#96; template literal</code> | Embed expressions in a backtick string. | <code>console.log(&#96;sum = &#36;{a + b}&#96;)</code> | `sum = 5` |
| `out.join("\n")` | Batch output, one print. | `console.log(out.join("\n"))` |  |



## 2. Numbers

### Numbers & Math

One numeric type (double). Integers stay exact up to 2^53-1; beyond that use BigInt.

| Call | What it does | Example | Result |
|---|---|---|---|
| `Number(s)` | Strict string -&gt; number (whole string or NaN). | `Number("42px")` | `NaN` |
| `parseInt(s, 10)` | Parse leading int; ALWAYS pass radix. | `parseInt("42px", 10)` | `42` |
| `parseFloat(s)` | Parse leading float. | `parseFloat("3.14abc")` | `3.14` |
| `(255).toString(2)` | Number -&gt; binary/other-base string. | `(255).toString(2)` | `"11111111"` |
| `parseInt("ff", 16)` | Hex string -&gt; number. | `parseInt("ff", 16)` | `255` |
| `Number.isInteger(x)` | Whole number? | `Number.isInteger(4.0)` | `true` |
| `Number.isNaN(x)` | Safe NaN check (global isNaN coerces!). | `Number.isNaN(NaN)` | `true` |
| `x.toFixed(2)` | Round to n decimals — returns a STRING. | `(3.14159).toFixed(2)` | `"3.14"` |
| `Number.MAX_SAFE_INTEGER` | 2^53 - 1. Beyond it, integer math loses precision. | `Number.MAX_SAFE_INTEGER` | `9007199254740991` |
| `Math.max(...arr) / Math.min(...arr)` | SPREAD required — they take args, not an array. | `Math.max(...[1, 5, 3])` | `5` |
| `Math.floor / ceil / round / trunc` | trunc cuts the decimal (no rounding). | `Math.trunc(2.9)` | `2` |
| `2 ** 10  /  Math.pow(2, 10)` | Exponent. | `2 ** 10` | `1024` |
| `Math.floor(Math.random() * n)` | Random integer in [0, n). | `Math.floor(Math.random() * 6)` | `0..5` |

> [!WARNING]
> **Number.MAX_SAFE_INTEGER.** For bigger integers use BigInt: 123n or BigInt(123).



## 3. Text

### Strings (immutable)

Assume s = "hello world". Immutable — every method returns a new string.

| Call | What it does | Example | Result |
|---|---|---|---|
| `s.length` | Char count — a PROPERTY (no parens). | `s.length` | `11` |
| `s[i] / s.charAt(i)` | Char at index. | `s[1]` | `"e"` |
| `s.charCodeAt(i)` | UTF-16 code unit. | `s.charCodeAt(0)` | `104` |
| `s.slice(i, j)` | [i, j); supports NEGATIVE indices. | `s.slice(-5)` | `"world"` |
| `s.substring(i, j)` | Like slice but clamps negatives to 0. | `s.substring(0, 5)` | `"hello"` |
| `s.indexOf(x) / lastIndexOf(x)` | First / last index, -1 if absent. | `s.indexOf("o")` | `4` |
| `s.includes(x)` | Substring present? | `s.includes("wor")` | `true` |
| `s.startsWith / endsWith` | Prefix / suffix test. | `s.startsWith("he")` | `true` |
| `s.toUpperCase / toLowerCase` | Case conversion. | `"Hi".toUpperCase()` | `"HI"` |
| `s.trim / trimStart / trimEnd` | Strip whitespace. | `"  hi ".trim()` | `"hi"` |
| `s.replace(a, b)` | Replaces the FIRST match only. | `"aa".replace("a", "b")` | `"ba"` |
| `s.replaceAll(a, b)` | Replace all (ES2021+). | `"aa".replaceAll("a", "b")` | `"bb"` |
| `s.repeat(n)` | Repeat n times. | `"ab".repeat(3)` | `"ababab"` |
| `s.padStart / padEnd(len, pad)` | Pad to a length. | `"5".padStart(3, "0")` | `"005"` |
| `s.split(sep)` | String -&gt; array (literal or regex). | `s.split(" ")` | `["hello", "world"]` |
| `[...s]` | Spread into a char array (Unicode-safe). | `[..."hi"]` | `["h", "i"]` |

> [!WARNING]
> **s.replace(a, b).** For all matches use replaceAll or a /g regex: s.replace(/a/g, "b").



## 4. Arrays

### Arrays — core

Assume a = [3, 1, 2]. Dynamic, mixed-type. push/pop O(1); unshift/shift O(n).

| Call | What it does | Example | Result |
|---|---|---|---|
| `a.push(x)` | Append; returns new length. | `a.push(5)` | `4  (a = [3,1,2,5])` |
| `a.pop()` | Remove & return last. | `a.pop()` | `2  (a = [3,1])` |
| `a.unshift(x) / a.shift()` | Add/remove at FRONT — O(n). | `a.shift()` | `3  (a = [1,2])` |
| `a.length` | Property — SETTABLE: a.length=1 truncates! | `a.length` | `3` |
| `a.at(-1)` | Negative indexing — last element. | `a.at(-1)` | `2` |
| `a.slice(i, j)` | COPY of [i, j); does not mutate. | `a.slice(0, 2)` | `[3, 1]` |
| `a.splice(i, count)` | Remove `count` at i, RETURNS them (mutates). | `a.splice(1, 1)` | `[1]  (a = [3, 2])` |
| `a.splice(i, 0, x)` | Insert x at i without removing. | `a.splice(1, 0, 9)` | `a = [3, 9, 1, 2]` |
| `a.includes(x) / a.indexOf(x)` | Membership / index. | `a.includes(2)` | `true` |
| `a.reverse()` | Reverse IN PLACE. | `[1,2,3].reverse()` | `[3, 2, 1]` |
| `a.concat(b)` | New joined array (no mutation). | `[1].concat([2, 3])` | `[1, 2, 3]` |
| `a.flat(depth)` | Flatten nested arrays. | `[1, [2, [3]]].flat(Infinity)` | `[1, 2, 3]` |
| `new Array(n).fill(0)` | n copies of a value. | `new Array(3).fill(0)` | `[0, 0, 0]` |
| `Array.from({length: r}, () => new Array(c).fill(0))` | 2D grid — factory runs per row. | `Array.from({length: 2}, () => new Array(3).fill(0))` |  |

> [!WARNING]
> **Array.from({length: r}, () =&gt; new Array(c).fill(0)).** new Array(r).fill(new Array(c)) shares ONE inner array across all rows! Use Array.from with a factory.



### Sorting (read this first)

sort() defaults to STRING comparison, mutates in place, and is stable (ES2019+).

| Call | What it does | Example | Result |
|---|---|---|---|
| `[10, 2, 1].sort()` | Default = sort as STRINGS. Wrong for numbers! | `[10, 2, 1].sort()` | `[1, 10, 2]` |
| `sort((a, b) => a - b)` | Ascending numeric. | `[10, 2, 1].sort((a, b) => a - b)` | `[1, 2, 10]` |
| `sort((a, b) => b - a)` | Descending numeric. | `[1, 2, 3].sort((a, b) => b - a)` | `[3, 2, 1]` |
| `sort((a, b) => a.localeCompare(b))` | Proper alphabetical (locale-aware). | `["b", "A"].sort((a,b)=>a.localeCompare(b))` | `["A", "b"]` |
| `multi-key sort` | Fallback with \|\| when the first key ties. | `people.sort((p, q) => p.age - q.age \|\| p.name.localeCompare(q.name))` |  |
| `[...a].sort(...)` | Sort a COPY (sort mutates). | `const sorted = [...a].sort((x, y) => x - y);` |  |

> [!WARNING]
> **[10, 2, 1].sort().** Always pass a comparator for numbers: (a, b) =&gt; a - b.



### Arrays — map / filter / reduce

Assume a = [1, 2, 3, 4]. None mutate — each returns a new array/value.

| Call | What it does | Example | Result |
|---|---|---|---|
| `a.map(fn)` | Transform each -&gt; new array. | `a.map(x => x * 2)` | `[2, 4, 6, 8]` |
| `a.filter(pred)` | Keep matching -&gt; new array. | `a.filter(x => x % 2 === 0)` | `[2, 4]` |
| `a.reduce((acc, x) => ..., init)` | Fold to one value. | `a.reduce((s, x) => s + x, 0)` | `10` |
| `a.forEach((x, i) => ...)` | Side effects; returns undefined. | `a.forEach(x => console.log(x))` |  |
| `a.find(pred)` | First matching ELEMENT, else undefined. | `a.find(x => x > 2)` | `3` |
| `a.findIndex(pred)` | First matching INDEX, else -1. | `a.findIndex(x => x > 2)` | `2` |
| `a.some(pred) / a.every(pred)` | Any / all match? | `a.some(x => x > 3)` | `true` |
| `a.flatMap(fn)` | map then flatten one level. | `a.flatMap(x => [x, -x])` | `[1,-1,2,-2,...]` |
| `a.sort((x,y) => x - y)` | Numeric sort (see the sort section!). | `[10, 2].sort((x, y) => x - y)` | `[2, 10]` |
| `reduce group-by` | JS has no groupingBy — build with reduce. | `words.reduce((acc, w) => {`<br>`(acc[w[0]] ??= []).push(w);`<br>`return acc;`<br>`}, {})` | `{ c: [...], d: [...] }` |



### Which array methods mutate

| Method | Mutates the array? | Returns |
|---|---|---|
| `push`, `unshift` | yes | the new length |
| `pop`, `shift` | yes | the removed element |
| `splice` | yes | the removed elements |
| `sort`, `reverse`, `fill` | yes | the same array |
| `slice`, `concat` | no | a new array |
| `map`, `filter`, `flat`, `flatMap` | no | a new array |
| `toSorted`, `toReversed`, `toSpliced`, `with` | no | a new array (ES2023, Node 20 and later) |

## 5. Objects, Map and Set

### Objects

Assume o = { a: 1, b: 2 }. Works as a string-keyed map; prefer Map for other keys.

| Call | What it does | Example | Result |
|---|---|---|---|
| `o.a / o["a"]` | Access (bracket for dynamic keys). | `o.a` | `1` |
| `o.c = 3 / delete o.b` | Add / remove a property. | `delete o.b` | `{ a: 1 }` |
| `"a" in o` | Key present (own OR inherited)? | `"a" in o` | `true` |
| `o.hasOwnProperty(k)` | OWN property only — safer for arbitrary keys. | `o.hasOwnProperty("a")` | `true` |
| `Object.keys(o)` | Array of keys. | `Object.keys(o)` | `["a", "b"]` |
| `Object.values(o)` | Array of values. | `Object.values(o)` | `[1, 2]` |
| `Object.entries(o)` | Array of [k, v] pairs. | `Object.entries(o)` | `[['a',1], ['b',2]]` |
| `for (const [k, v] of Object.entries(o))` | Iterate key+value. | `for (const [k, v] of Object.entries(o)) use(k, v);` |  |
| `{ ...o }` | Shallow clone. | `{ ...o }` | `{ a: 1, b: 2 }` |
| `{ ...o, ...other }` | Shallow merge (other wins on clashes). | `{ ...{a:1}, ...{a:9} }` | `{ a: 9 }` |
| `user?.address?.city` | Optional chaining — undefined instead of crashing. | `null?.city` | `undefined` |
| `x ?? default` | Fallback ONLY for null/undefined (not 0/''). | `0 ?? 10  vs  0 \|\| 10` | `0  vs  10` |

> [!WARNING]
> **x ?? default.** Use ?? for numeric defaults — || also replaces 0, '', false.



### Map & Set

Map: any key type, real .size, insertion order. Set: unique values, O(1) has.

| Call | What it does | Example | Result |
|---|---|---|---|
| `new Map()` | Key/value store, any key type. | `const m = new Map(); m.set("a", 1);` |  |
| `m.set(k, v) / m.get(k)` | Insert / read (undefined if absent). | `m.get("a")` | `1` |
| `m.has(k) / m.delete(k)` | Membership / remove. | `m.has("a")` | `true` |
| `m.size` | Count (a property, unlike an object). | `m.size` | `1` |
| `for (const [k, v] of m)` | Iterate in INSERTION order. | `for (const [k, v] of m) use(k, v);` |  |
| `freq count` | The Map counting idiom. | `for (const c of s) m.set(c, (m.get(c) \|\| 0) + 1);` |  |
| `new Set(arr)` | Dedupe. | `new Set([1, 1, 2])` | `Set {1, 2}` |
| `[...new Set(arr)]` | Dedupe -&gt; array in one line. | `[...new Set([1, 1, 2])]` | `[1, 2]` |
| `s.add / s.has / s.delete / s.size` | Set operations, O(1). | `s.add(1); s.has(1)` | `true` |
| `union / intersection / difference` | No built-ins — spread + filter. | `const inter = new Set([...a].filter(x => b.has(x)));` |  |
| `LRU via Map order` | delete+set moves a key to the newest end. | `get(k){ const v=map.get(k); map.delete(k); map.set(k,v); return v; }`<br>`// evict oldest: map.delete(map.keys().next().value)` |  |



## 6. Destructuring, classes and JSON

### Destructuring, classes & JSON

Everyday syntax for unpacking, defining data structures, and serializing.

| Call | What it does | Example | Result |
|---|---|---|---|
| `const [x, y, ...rest] = arr` | Array destructuring + rest. | `const [a, b, ...rest] = [1, 2, 3, 4]` | `a=1, b=2, rest=[3,4]` |
| `const { a, b } = obj` | Object destructuring. | `const { a } = { a: 1 }` | `a = 1` |
| `[a, b] = [b, a]` | Swap without a temp. | `[a, b] = [b, a]` |  |
| `f(...args) / [...a, ...b]` | Spread into args / concat arrays. | `Math.max(...[1, 5, 3])` | `5` |
| `class + constructor` | Define a data structure. | `class Node {`<br>`constructor(val, next = null) {`<br>`this.val = val; this.next = next;`<br>`}`<br>`}` |  |
| `extends / static` | Inheritance / class-level method. | `class Dog extends Animal { speak(){ return 'woof'; } }` |  |
| `JSON.stringify(o)` | Object -&gt; string. | `JSON.stringify({ a: 1 })` | `'{"a":1}'` |
| `JSON.parse(s)` | String -&gt; object. | `JSON.parse('{"a":1}')` | `{ a: 1 }` |
| `structuredClone(o)` | Proper deep clone (handles Map/Set/Date). | `structuredClone(obj)` |  |

> [!WARNING]
> **structuredClone(o).** JSON.parse(JSON.stringify(o)) also deep-clones but DROPS functions, undefined, Map/Set.



## 7. Interview idioms

### Interview idioms & hacks

Full working patterns.

#### Frequency count

Map for any key.

```javascript
const f = new Map();
for (const c of s) f.set(c, (f.get(c) || 0) + 1);
```

#### Grid direction array

Loop offsets.

```javascript
const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
for (const [dr, dc] of dirs) { const nr=r+dr, nc=c+dc; }
```

#### Monotonic stack

Indices, increasing top-to-bottom.

```javascript
const st = [];
for (let i = 0; i < n; i++) {
  while (st.length && nums[st.at(-1)] < nums[i])
    res[st.pop()] = nums[i];
  st.push(i);
}
```

#### Prefix sums

O(1) range sum.

```javascript
const pre = new Array(n + 1).fill(0);
for (let i = 0; i < n; i++) pre[i+1] = pre[i] + a[i];
const sum = pre[j] - pre[i];  // a[i..j)
```

#### Memoized recursion

Cache by args -&gt; exponential becomes linear.

```javascript
function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const r = fib(n-1, memo) + fib(n-2, memo);
  memo.set(n, r); return r;
}
```



## 8. Equality and truthiness traps

Falsy values are exactly `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`; everything else (including `[]` and `{}`) is truthy.

| Expression | Result | Why |
|---|---|---|
| `0.1 + 0.2 === 0.3` | `false` | binary floating point; compare with a tolerance |
| `NaN === NaN` | `false` | use `Number.isNaN(x)` |
| `typeof null` | `"object"` | a historical quirk |
| `[] == false` | `true` | loose `==` coerces both sides; prefer `===` |
| `"5" + 1` and `"5" - 1` | `"51"` and `4` | `+` concatenates when either side is a string |
| `[10, 9, 1].sort()` | `[1, 10, 9]` | the default sort compares strings |
| `Number("")` | `0` | the empty string converts to zero, not `NaN` |
