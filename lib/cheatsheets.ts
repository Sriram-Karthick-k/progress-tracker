export type Snippet = { title: string; note?: string; code: string };
export type Section = { id: string; title: string; snippets: Snippet[] };
export type Sheet = { lang: string; key: string; hint: string; sections: Section[] };

/* =========================================================================
   JAVA
   ========================================================================= */
const JAVA: Sheet = {
  lang: "Java",
  key: "java",
  hint: "import java.util.*;",
  sections: [
    {
      id: "java-io",
      title: "Boilerplate & I/O",
      snippets: [
        {
          title: "Main + fast input",
          note: "BufferedReader is much faster than Scanner for big inputs.",
          code: `import java.util.*;
import java.io.*;

public class Main {
  public static void main(String[] args) throws IOException {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    int n = Integer.parseInt(br.readLine().trim());
    String[] parts = br.readLine().split(" ");
    int[] a = new int[n];
    for (int i = 0; i < n; i++) a[i] = Integer.parseInt(parts[i]);

    StringBuilder sb = new StringBuilder();       // batch output = fast
    sb.append("answer: ").append(n).append('\\n');
    System.out.print(sb);
  }
}`,
        },
        {
          title: "Quick Scanner (small input)",
          code: `Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String word = sc.next();          // one token
String line = sc.nextLine();      // rest of line
double d = sc.nextDouble();`,
        },
        {
          title: "Print",
          code: `System.out.println("hi");
System.out.printf("%d + %d = %d%n", a, b, a + b);
System.out.println(Arrays.toString(arr));        // [1, 2, 3]`,
        },
      ],
    },
    {
      id: "java-string",
      title: "String & StringBuilder",
      snippets: [
        {
          title: "String basics (immutable!)",
          code: `String s = "hello";
s.length();              // 5
s.charAt(1);             // 'e'
s.substring(1, 3);       // "el"  (copy, [from, to))
s.indexOf("l");          // 2     (-1 if absent)
s.contains("ell");       // true
s.toCharArray();         // char[]
s.split(",");            // String[] (regex!)
s.replace("l", "L");     // "heLLo"
s.toUpperCase();         // "HELLO"
s.trim();                // remove ends whitespace
s.equals("hello");       // ALWAYS use equals, not ==
s.compareTo("abc");      // <0 / 0 / >0`,
        },
        {
          title: "StringBuilder (mutable — build strings here)",
          note: "Never += in a loop. O(n^2). Use StringBuilder.",
          code: `StringBuilder sb = new StringBuilder();
sb.append("ab").append(1).append('c');
sb.insert(0, "X");        // "Xab1c"
sb.deleteCharAt(0);       // "ab1c"
sb.reverse();             // "c1ba"
sb.setCharAt(0, 'Z');
sb.charAt(2);
sb.length();
String out = sb.toString();`,
        },
        {
          title: "char helpers & parsing",
          code: `Character.isDigit(c);  Character.isLetter(c);
Character.isLetterOrDigit(c);  Character.isWhitespace(c);
Character.toLowerCase(c);  Character.getNumericValue('7'); // 7

Integer.parseInt("42");          // 42
Integer.toBinaryString(5);       // "101"
Integer.bitCount(7);             // 3 (set bits)
String.valueOf(42);              // "42"`,
        },
      ],
    },
    {
      id: "java-array",
      title: "Arrays",
      snippets: [
        {
          title: "Create & init",
          code: `int[] a = new int[n];               // all 0
int[] b = {1, 2, 3};
int[][] grid = new int[r][c];       // all 0
Arrays.fill(a, -1);                 // fill with value
int[][] g = new int[3][];           // jagged`,
        },
        {
          title: "Arrays utility",
          code: `Arrays.sort(a);                     // ascending (primitives)
Arrays.sort(arr, Collections.reverseOrder());  // needs Integer[]
Arrays.sort(a, 0, k);               // sort range [0, k)
Arrays.binarySearch(a, key);        // sorted only
int[] c = Arrays.copyOf(a, len);    // pad/truncate
int[] d = Arrays.copyOfRange(a, i, j);          // slice [i, j)
Arrays.equals(a, b);
Arrays.toString(a);                 // print 1D
Arrays.deepToString(grid);          // print 2D`,
        },
      ],
    },
    {
      id: "java-list",
      title: "ArrayList (List)",
      snippets: [
        {
          title: "Everyday list",
          note: "Default container. O(1) get, O(1) amortized add at end.",
          code: `List<Integer> list = new ArrayList<>();
list.add(5);            // append
list.add(0, 9);         // insert at index
list.get(0);            // read
list.set(0, 7);         // replace
list.remove(0);         // by INDEX
list.remove(Integer.valueOf(7)); // by VALUE (careful!)
list.size();
list.contains(5);
list.indexOf(5);
Collections.sort(list);
list.sort((x, y) -> y - x);       // custom (desc)
for (int x : list) { ... }`,
        },
        {
          title: "List <-> array",
          code: `List<Integer> l = new ArrayList<>(Arrays.asList(1, 2, 3));
Integer[] arr = l.toArray(new Integer[0]);
List<int[]> pairs = new ArrayList<>();
pairs.add(new int[]{1, 2});`,
        },
      ],
    },
    {
      id: "java-deque",
      title: "Stack / Queue / Deque",
      snippets: [
        {
          title: "ArrayDeque — use for BOTH stack and queue",
          note: "Faster than Stack/LinkedList. No nulls allowed.",
          code: `Deque<Integer> dq = new ArrayDeque<>();

// as STACK (LIFO):
dq.push(1);     // add front
dq.pop();       // remove front
dq.peek();      // look front

// as QUEUE (FIFO):
dq.offer(1);    // add back
dq.poll();      // remove front -> null if empty
dq.peek();      // look front

// both ends:
dq.offerFirst(x); dq.offerLast(x);
dq.pollFirst();   dq.pollLast();
dq.peekFirst();   dq.peekLast();`,
        },
      ],
    },
    {
      id: "java-heap",
      title: "PriorityQueue (heap)",
      snippets: [
        {
          title: "Min-heap (DEFAULT) & max-heap",
          note: "Java default is MIN-heap (smallest on top). C++ is the opposite!",
          code: `PriorityQueue<Integer> min = new PriorityQueue<>();   // min-heap
PriorityQueue<Integer> max =
    new PriorityQueue<>(Collections.reverseOrder());  // max-heap

min.offer(5); min.offer(1);
min.peek();    // 1  (smallest)
min.poll();    // 1  (remove smallest)
min.size();`,
        },
        {
          title: "Heap of custom objects / by a key",
          code: `// min-heap of int[] by first element:
PriorityQueue<int[]> pq =
    new PriorityQueue<>((x, y) -> x[0] - y[0]);

// k largest -> keep a min-heap of size k:
PriorityQueue<Integer> kh = new PriorityQueue<>();
for (int v : nums) { kh.offer(v); if (kh.size() > k) kh.poll(); }`,
        },
      ],
    },
    {
      id: "java-map",
      title: "HashMap & HashSet",
      snippets: [
        {
          title: "HashMap",
          code: `Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
m.get("a");                 // 1   (null if absent)
m.getOrDefault("z", 0);     // 0   (no null check)
m.containsKey("a");
m.remove("a");
m.putIfAbsent("a", 9);
for (Map.Entry<String,Integer> e : m.entrySet())
    System.out.println(e.getKey() + "=" + e.getValue());
m.forEach((k, v) -> { ... });`,
        },
        {
          title: "The two idioms to memorize",
          note: "merge = frequency count. computeIfAbsent = group into buckets.",
          code: `// frequency count:
for (int x : nums) m.merge(x, 1, Integer::sum);

// group into lists (map of lists):
Map<Integer, List<String>> g = new HashMap<>();
g.computeIfAbsent(key, k -> new ArrayList<>()).add(value);`,
        },
        {
          title: "HashSet",
          code: `Set<Integer> set = new HashSet<>();
set.add(1);
set.contains(1);
set.remove(1);
set.size();
Set<Integer> b = new HashSet<>(listA);   // dedupe a list`,
        },
      ],
    },
    {
      id: "java-tree",
      title: "TreeMap & TreeSet (sorted)",
      snippets: [
        {
          title: "Sorted, with nearest-key search",
          note: "Use these when you need order or 'find nearest value'. All O(log n).",
          code: `TreeMap<Integer, String> tm = new TreeMap<>();
tm.firstKey(); tm.lastKey();
tm.floorKey(x);    // greatest key <= x  (null if none)
tm.ceilingKey(x);  // smallest key >= x
tm.lowerKey(x);    // greatest key <  x  (strict)
tm.higherKey(x);   // smallest key >  x  (strict)

TreeSet<Integer> ts = new TreeSet<>();
ts.add(5);
ts.first(); ts.last();
ts.floor(x); ts.ceiling(x); ts.lower(x); ts.higher(x);
ts.pollFirst(); ts.pollLast();`,
        },
      ],
    },
    {
      id: "java-sort",
      title: "Sorting & Comparators",
      snippets: [
        {
          title: "Comparators",
          code: `list.sort(Comparator.naturalOrder());
list.sort(Comparator.reverseOrder());
people.sort(Comparator.comparingInt(p -> p.age));
people.sort(Comparator.comparing((Person p) -> p.name)
                      .thenComparingInt(p -> p.age));   // tie-break
people.sort(Comparator.comparingInt((Person p) -> p.age).reversed());`,
        },
      ],
    },
    {
      id: "java-math",
      title: "Math & numbers",
      snippets: [
        {
          title: "Math",
          code: `Math.max(a, b); Math.min(a, b); Math.abs(x);
Math.pow(2, 10);   // double 1024.0
Math.sqrt(x);
Math.floorDiv(7, 2);  // 3
Math.floorMod(-1, 5); // 4  (true modulo)
Integer.MAX_VALUE; Integer.MIN_VALUE;
Long.MAX_VALUE;       // for overflow safety`,
        },
      ],
    },
    {
      id: "java-stream",
      title: "Streams (one-liners)",
      snippets: [
        {
          title: "Common pipelines",
          code: `int sum = Arrays.stream(a).sum();
int max = Arrays.stream(a).max().getAsInt();
List<Integer> evens = list.stream()
    .filter(x -> x % 2 == 0).collect(Collectors.toList());
Map<Boolean, List<Integer>> parts = list.stream()
    .collect(Collectors.partitioningBy(x -> x > 0));
String joined = list.stream().map(String::valueOf)
    .collect(Collectors.joining(", "));`,
        },
      ],
    },
  ],
};

/* =========================================================================
   C++
   ========================================================================= */
const CPP: Sheet = {
  lang: "C++",
  key: "cpp",
  hint: "#include <bits/stdc++.h>  // everything",
  sections: [
    {
      id: "cpp-io",
      title: "Boilerplate & fast I/O",
      snippets: [
        {
          title: "Template",
          note: "The two sync lines make cin/cout fast. Use them for big inputs.",
          code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n; cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    cout << n << "\\n";
    return 0;
}`,
        },
        {
          title: "Read a whole line",
          code: `string line;
getline(cin, line);          // reads rest of current line
// after cin >> x, do cin.ignore() before getline`,
        },
      ],
    },
    {
      id: "cpp-string",
      title: "string",
      snippets: [
        {
          title: "string (mutable already)",
          code: `string s = "hello";
s.size();  s.length();
s[1];                      // 'e'
s.substr(1, 3);            // "ell"  (pos, len) -> copy
s.find("ll");              // index, or string::npos
s += " world";             // append
s.push_back('!');
s.insert(0, "X");
s.erase(0, 1);             // erase(pos, len)
s.replace(0, 2, "YY");
reverse(s.begin(), s.end());
sort(s.begin(), s.end());
stoi("42"); stoll("9e9"); stod("3.14");
to_string(42);`,
        },
      ],
    },
    {
      id: "cpp-vector",
      title: "vector",
      snippets: [
        {
          title: "Dynamic array (default container)",
          code: `vector<int> v;
v.push_back(5);
v.emplace_back(6);         // construct in place
v.pop_back();              // void!
v[0];  v.at(0);            // at() bounds-checks
v.front(); v.back();
v.size(); v.empty();
v.insert(v.begin()+1, 9);  // O(n)
v.erase(v.begin());        // O(n)
v.clear();
sort(v.begin(), v.end());
reverse(v.begin(), v.end());`,
        },
        {
          title: "Init patterns",
          code: `vector<int> a(n, 0);              // n zeros
vector<vector<int>> grid(r, vector<int>(c, 0));  // 2D
vector<int> b = {1, 2, 3};
// loop:
for (int x : v) cout << x;
for (auto& x : v) x *= 2;         // by ref to modify`,
        },
        {
          title: "erase-remove idiom",
          note: "remove() only shuffles; erase() actually shrinks.",
          code: `v.erase(remove(v.begin(), v.end(), val), v.end());`,
        },
      ],
    },
    {
      id: "cpp-pair",
      title: "pair / tuple",
      snippets: [
        {
          title: "pair & structured bindings",
          code: `pair<int,string> p = {1, "a"};
p.first; p.second;
auto [num, str] = p;             // C++17 unpack

tuple<int,int,int> t = {1, 2, 3};
auto [x, y, z] = t;
get<0>(t);
// pairs compare lexicographically -> great heap/map keys`,
        },
      ],
    },
    {
      id: "cpp-adaptor",
      title: "stack / queue / priority_queue",
      snippets: [
        {
          title: "stack & queue",
          note: "pop() returns VOID — read top()/front() first.",
          code: `stack<int> st;
st.push(1); st.top(); st.pop(); st.empty();

queue<int> q;
q.push(1); q.front(); q.back(); q.pop(); q.empty();`,
        },
        {
          title: "priority_queue (heap)",
          note: "DEFAULT is MAX-heap (largest on top). Opposite of Java!",
          code: `priority_queue<int> maxh;          // max-heap (default)
maxh.push(5); maxh.top(); maxh.pop();

// min-heap:
priority_queue<int, vector<int>, greater<int>> minh;

// by custom key (min-heap of pair by first):
priority_queue<pair<int,int>,
   vector<pair<int,int>>, greater<>> pq;`,
        },
      ],
    },
    {
      id: "cpp-ordered",
      title: "map / set (ordered, sorted)",
      snippets: [
        {
          title: "map & set — O(log n), sorted iteration",
          code: `map<string,int> m;
m["a"] = 1;                 // inserts default if absent!
m.count("a");               // 0 or 1
m.contains("a");            // C++20
m.find("a");                // iterator or m.end()
m.erase("a");
for (auto& [k, v] : m) ...  // iterates in sorted key order

set<int> s;
s.insert(5); s.count(5); s.erase(5);
*s.begin();                 // smallest
*s.rbegin();                // largest`,
        },
        {
          title: "nearest-key search (member versions!)",
          note: "C++ analog of Java floor/ceiling. Use the .member, not std::lower_bound.",
          code: `auto it = s.lower_bound(x);  // first key >= x  (== ceiling)
auto it2 = s.upper_bound(x);  // first key >  x  (== higher)
// floor (<= x):  if it!=begin, --it after lower_bound
if (it != s.begin()) { auto f = prev(it); /* greatest < x */ }`,
        },
      ],
    },
    {
      id: "cpp-unordered",
      title: "unordered_map / unordered_set (hash)",
      snippets: [
        {
          title: "Average O(1) lookup — your default for counting",
          code: `unordered_map<int,int> freq;
for (int x : v) freq[x]++;        // frequency count
freq.count(k); freq.contains(k);  // C++20
freq.erase(k);

unordered_set<int> seen;
seen.insert(x); seen.count(x);
// NO lower_bound / ordered iteration here.`,
        },
      ],
    },
    {
      id: "cpp-algorithm",
      title: "<algorithm>",
      snippets: [
        {
          title: "Sort & order",
          code: `sort(v.begin(), v.end());                 // ascending
sort(v.begin(), v.end(), greater<int>());  // descending
sort(v.begin(), v.end(), [](int a, int b){ return a > b; });
stable_sort(b, e);                          // keep equal order
nth_element(v.begin(), v.begin()+k, v.end());  // k-th in O(n)
partial_sort(b, b+k, e);                    // top-k sorted`,
        },
        {
          title: "Search (sorted ranges)",
          code: `binary_search(b, e, x);            // bool
auto lo = lower_bound(b, e, x);    // first >= x
auto hi = upper_bound(b, e, x);    // first > x
int idx = lower_bound(b, e, x) - b;`,
        },
        {
          title: "Scan any range",
          code: `*max_element(b, e);  *min_element(b, e);
count(b, e, x);  count_if(b, e, pred);
find(b, e, x);   find_if(b, e, pred);
all_of(b,e,p);  any_of(b,e,p);  none_of(b,e,p);
reverse(b, e);
next_permutation(b, e);   // loop over permutations`,
        },
      ],
    },
    {
      id: "cpp-numeric",
      title: "<numeric>, math & bit tricks",
      snippets: [
        {
          title: "numeric",
          code: `accumulate(b, e, 0);            // sum
accumulate(b, e, 0LL);          // sum as long long (overflow!)
partial_sum(b, e, out.begin()); // prefix sums
iota(b, e, 0);                  // fill 0,1,2,3...
gcd(a, b); lcm(a, b);           // C++17`,
        },
        {
          title: "math & bits",
          code: `max(a, b); min(a, b); abs(x);
pow(2, 10); sqrt(x); floor(x); ceil(x); round(x);
clamp(x, lo, hi);                  // C++17
__builtin_popcount(x);             // set bits (int)
__builtin_popcountll(x);           // long long
__builtin_clz(x);                  // leading zeros
1 << k;   x & (x-1);   x & -x;     // bit idioms`,
        },
      ],
    },
  ],
};

/* =========================================================================
   JAVASCRIPT
   ========================================================================= */
const JS: Sheet = {
  lang: "JavaScript",
  key: "javascript",
  hint: "Node.js runtime — no imports needed for built-ins.",
  sections: [
    {
      id: "js-io",
      title: "Boilerplate & I/O (Node)",
      snippets: [
        {
          title: "Read all stdin (competitive style)",
          code: `const data = require("fs").readFileSync(0, "utf8");
const lines = data.trim().split("\\n");
const n = Number(lines[0]);
const a = lines[1].split(" ").map(Number);

const out = [];
out.push("answer");
console.log(out.join("\\n"));`,
        },
        {
          title: "Logging",
          code: `console.log("hi", 42, [1,2]);
console.log(\`x = \${x}\`);          // template string`,
        },
      ],
    },
    {
      id: "js-number",
      title: "Numbers & Math",
      snippets: [
        {
          title: "Parsing & numbers",
          code: `Number("42");      // 42
parseInt("42px");  // 42  (stops at non-digit)
parseFloat("3.14");
(255).toString(2); // "11111111" (binary)
parseInt("ff", 16);// 255
Number.isInteger(x);
x.toFixed(2);      // "3.14" (string)
Number.MAX_SAFE_INTEGER;  // 2^53-1`,
        },
        {
          title: "Math",
          code: `Math.max(1, 2, 3);  Math.min(...arr);   // spread for arrays!
Math.abs(-5);  Math.floor(2.9);  Math.ceil(2.1);
Math.round(2.5);  Math.trunc(2.9);     // 2
Math.pow(2, 10);  2 ** 10;             // 1024
Math.sqrt(16);  Math.sign(-3);         // -1
Math.floor(Math.random() * n);         // 0..n-1`,
        },
      ],
    },
    {
      id: "js-string",
      title: "Strings (immutable)",
      snippets: [
        {
          title: "String methods",
          code: `const s = "hello";
s.length;                 // 5 (property, no parens)
s[1]; s.charAt(1);        // 'e'
s.charCodeAt(0);          // 104
s.slice(1, 3);            // "el"  ([from, to), allows negatives)
s.substring(1, 3);        // "el"
s.indexOf("l");           // 2  (-1 if absent)
s.includes("ell");        // true
s.startsWith("he"); s.endsWith("lo");
s.toUpperCase(); s.toLowerCase();
s.trim();
s.replace("l", "L");      // first only
s.replaceAll("l", "L");   // all
s.repeat(3);
s.split("");              // ['h','e','l','l','o']
s.split(",");`,
        },
        {
          title: "Build strings",
          note: "Strings are immutable — build with an array, then join.",
          code: `const parts = [];
parts.push("a"); parts.push("b");
const result = parts.join("");      // "ab"

[...s].reverse().join("");          // reverse a string`,
        },
      ],
    },
    {
      id: "js-array",
      title: "Arrays — core",
      snippets: [
        {
          title: "Create & mutate",
          code: `const a = [1, 2, 3];
const b = new Array(n).fill(0);          // n zeros
const grid = Array.from({length: r}, () => new Array(c).fill(0)); // 2D
a.push(4);    // add end       a.pop();   // remove end
a.unshift(0); // add front     a.shift(); // remove front
a.length;
a.splice(1, 2);          // remove 2 items at index 1
a.splice(1, 0, "x");     // insert without removing
a.slice(1, 3);           // COPY [from, to)
a.includes(2);  a.indexOf(2);
a.reverse();  a.flat();  a.concat(b);`,
        },
        {
          title: "Stack & queue with arrays",
          code: `// stack: push/pop (fast)
st.push(x); st.pop();
// queue: push/shift  (shift is O(n) — fine for small n)
q.push(x); q.shift();`,
        },
      ],
    },
    {
      id: "js-functional",
      title: "Arrays — map / filter / reduce",
      snippets: [
        {
          title: "The functional toolkit",
          code: `a.map(x => x * 2);                 // transform -> new array
a.filter(x => x > 0);             // keep matching
a.reduce((acc, x) => acc + x, 0); // fold to one value (sum)
a.forEach((x, i) => { ... });
a.find(x => x > 2);               // first match (or undefined)
a.findIndex(x => x > 2);
a.some(x => x > 2);               // any?
a.every(x => x > 0);              // all?
a.flatMap(x => [x, x]);`,
        },
      ],
    },
    {
      id: "js-sort",
      title: "Sorting (READ THE GOTCHA)",
      snippets: [
        {
          title: "Always pass a comparator for numbers",
          note: "Default sort() converts to STRINGS: [10,2,1].sort() -> [1,10,2]. Wrong!",
          code: `nums.sort((a, b) => a - b);        // ascending numbers
nums.sort((a, b) => b - a);        // descending
strs.sort();                       // strings are fine alphabetically
strs.sort((a, b) => a.localeCompare(b));

// sort objects by field, with tie-break:
people.sort((p, q) => p.age - q.age || p.name.localeCompare(q.name));`,
        },
      ],
    },
    {
      id: "js-object",
      title: "Objects",
      snippets: [
        {
          title: "Plain object (string keys)",
          code: `const o = { a: 1, b: 2 };
o.a; o["a"];
o.c = 3;  delete o.b;
"a" in o;  o.hasOwnProperty("a");
Object.keys(o);     // ['a','c']
Object.values(o);   // [1, 3]
Object.entries(o);  // [['a',1],['c',3]]
for (const [k, v] of Object.entries(o)) { ... }
const copy = { ...o };             // shallow clone`,
        },
      ],
    },
    {
      id: "js-mapset",
      title: "Map & Set",
      snippets: [
        {
          title: "Map (any key type, keeps insertion order)",
          note: "Prefer Map over plain object for counting / non-string keys.",
          code: `const m = new Map();
m.set("a", 1);
m.get("a");         // 1 (undefined if absent)
m.has("a");
m.delete("a");
m.size;
for (const [k, v] of m) { ... }

// frequency count idiom:
for (const x of arr) m.set(x, (m.get(x) || 0) + 1);`,
        },
        {
          title: "Set (unique values)",
          code: `const s = new Set();
s.add(1); s.has(1); s.delete(1); s.size;
const uniq = [...new Set(arr)];    // dedupe an array
for (const x of s) { ... }`,
        },
      ],
    },
    {
      id: "js-json",
      title: "JSON & misc",
      snippets: [
        {
          title: "JSON",
          code: `JSON.stringify(obj);          // object -> string
JSON.stringify(obj, null, 2); // pretty
JSON.parse(str);              // string -> object
const deepCopy = JSON.parse(JSON.stringify(obj)); // (simple values)`,
        },
        {
          title: "Destructuring & spread",
          code: `const [x, y, ...rest] = arr;
const { a, b } = obj;
const merged = [...arr1, ...arr2];
const max = Math.max(...nums);
fn(...args);`,
        },
      ],
    },
  ],
};

export const CHEATSHEETS: Sheet[] = [JAVA, CPP, JS];
