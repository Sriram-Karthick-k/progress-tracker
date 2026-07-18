import { ResourceDomain } from "../resource-types";

// JAVA — comprehensive curated FREE resources (incl. concurrency & JVM).
// All URLs are real, stable, freely accessible.

export const JAVA: ResourceDomain = {
  key: "java",
  name: "Java",
  tagline: "The full language: fundamentals, OOP, generics, collections, streams, exceptions, concurrency, and the JVM.",
  icon: "Coffee",
  accent: "from-orange-500 to-amber-600",
  sections: [
    {
      id: "start",
      title: "Start here",
      desc: "Full free courses, books, and the reference sites you'll live in.",
      topics: [
        {
          id: "courses",
          title: "Full beginner courses",
          resources: [
            { kind: "video", label: "Learn Java Programming (v17) — full course", by: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-java-programming/" },
            { kind: "course", label: "Free Java courses hub", by: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-java-free-java-courses-for-beginners/" },
            { kind: "course", label: "dev.java — official learning paths", by: "Oracle", url: "https://dev.java/learn/" },
            { kind: "docs", label: "The Java™ Tutorials (official trails)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/" },
          ],
        },
        {
          id: "free-books",
          title: "Free books",
          resources: [
            { kind: "book", label: "Think Java", by: "Allen Downey · Green Tea Press", url: "https://greenteapress.com/wp/think-java/" },
            { kind: "book", label: "Javanotes 9 — Intro to Programming Using Java", by: "David Eck", url: "https://math.hws.edu/javanotes/" },
          ],
        },
        {
          id: "reference",
          title: "Go-to reference sites",
          resources: [
            { kind: "article", label: "Baeldung — Java guides", by: "Baeldung", url: "https://www.baeldung.com/java-tutorial" },
            { kind: "article", label: "Jenkov — Java tutorials", by: "Jakob Jenkov", url: "https://jenkov.com/tutorials/java/index.html" },
            { kind: "article", label: "GeeksforGeeks — Java", by: "GfG", url: "https://www.geeksforgeeks.org/java/" },
            { kind: "docs", label: "Java API (Javadoc, JDK 17)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/index.html" },
          ],
        },
      ],
    },
    {
      id: "fundamentals",
      title: "Language fundamentals",
      topics: [
        {
          id: "types",
          title: "Primitives, wrappers & casting",
          blurb: "8 primitives, autoboxing, the Integer cache trap, widening vs narrowing.",
          resources: [
            { kind: "docs", label: "Language Basics (variables, types, operators)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/" },
            { kind: "article", label: "Autoboxing & the Integer cache", by: "Baeldung", url: "https://www.baeldung.com/java-integer-cache" },
          ],
        },
        {
          id: "control-flow",
          title: "Operators & control flow",
          blurb: "if/switch, loops, labeled break, the modern switch expression.",
          resources: [
            { kind: "docs", label: "Control flow statements", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html" },
            { kind: "article", label: "Switch statements & expressions", by: "Baeldung", url: "https://www.baeldung.com/java-switch" },
          ],
        },
        {
          id: "arrays-strings",
          title: "Arrays & Strings",
          blurb: "Array utilities, String immutability & pool, StringBuilder, char math.",
          resources: [
            { kind: "docs", label: "Arrays", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html" },
            { kind: "article", label: "String vs StringBuilder vs StringBuffer", by: "Baeldung", url: "https://www.baeldung.com/java-string-builder-string-buffer" },
            { kind: "article", label: "Guide to Java String", by: "Baeldung", url: "https://www.baeldung.com/java-string" },
          ],
        },
        {
          id: "methods",
          title: "Methods, varargs & pass-by-value",
          blurb: "Overloading, varargs, static vs instance, why Java is always pass-by-value.",
          resources: [
            { kind: "article", label: "Java is pass-by-value", by: "Baeldung", url: "https://www.baeldung.com/java-pass-by-value-or-pass-by-reference" },
          ],
        },
      ],
    },
    {
      id: "oop",
      title: "Object-oriented programming",
      topics: [
        {
          id: "classes",
          title: "Classes, objects & constructors",
          blurb: "Construction order, this/super, initialization, immutability.",
          resources: [
            { kind: "docs", label: "Classes and Objects", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/" },
          ],
        },
        {
          id: "inheritance",
          title: "Inheritance & polymorphism",
          blurb: "extends, overriding vs overloading, dynamic dispatch, final.",
          resources: [
            { kind: "docs", label: "Inheritance & polymorphism", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html" },
            { kind: "article", label: "Inheritance & composition", by: "Baeldung", url: "https://www.baeldung.com/java-inheritance-composition" },
          ],
        },
        {
          id: "interface-abstract",
          title: "Interfaces vs abstract classes",
          blurb: "default/static methods, when to use which — a guaranteed interview question.",
          resources: [
            { kind: "article", label: "Interface vs abstract class", by: "Baeldung", url: "https://www.baeldung.com/java-interface-vs-abstract-class" },
            { kind: "docs", label: "Interfaces", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html" },
          ],
        },
        {
          id: "equals-hashcode",
          title: "equals() & hashCode()",
          blurb: "The contract — get it wrong and HashMap/HashSet silently break.",
          resources: [
            { kind: "article", label: "equals() & hashCode() contract", by: "Baeldung", url: "https://www.baeldung.com/java-equals-hashcode-contracts" },
          ],
        },
        {
          id: "records-enums",
          title: "Records, enums & sealed classes",
          blurb: "Value objects for free, type-safe constants, restricted hierarchies.",
          resources: [
            { kind: "article", label: "Java records", by: "Baeldung", url: "https://www.baeldung.com/java-record-keyword" },
            { kind: "article", label: "Enums in Java", by: "Baeldung", url: "https://www.baeldung.com/a-guide-to-java-enums" },
            { kind: "article", label: "Sealed classes & interfaces", by: "Baeldung", url: "https://www.baeldung.com/java-sealed-classes-interfaces" },
          ],
        },
        {
          id: "nested",
          title: "Nested, inner & anonymous classes",
          blurb: "static nested vs inner vs anonymous vs lambda.",
          resources: [
            { kind: "docs", label: "Nested classes", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/nested.html" },
          ],
        },
      ],
    },
    {
      id: "generics",
      title: "Generics",
      topics: [
        {
          id: "generics-core",
          title: "Type parameters, bounds & wildcards (PECS)",
          blurb: "Generic classes/methods, ? extends / ? super, type erasure.",
          resources: [
            { kind: "docs", label: "Generics trail", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/generics/" },
            { kind: "article", label: "Java generics", by: "Baeldung", url: "https://www.baeldung.com/java-generics" },
            { kind: "article", label: "Wildcards & PECS", by: "Baeldung", url: "https://www.baeldung.com/java-generics-interview-questions" },
          ],
        },
      ],
    },
    {
      id: "collections",
      title: "Collections framework",
      topics: [
        {
          id: "overview",
          title: "Overview & choosing a collection",
          blurb: "The hierarchy, complexities, and which container to reach for.",
          resources: [
            { kind: "docs", label: "Collections trail", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/collections/" },
            { kind: "article", label: "Java Collections guide", by: "Baeldung", url: "https://www.baeldung.com/java-collections" },
          ],
        },
        {
          id: "list-deque",
          title: "List, ArrayList, LinkedList & Deque",
          blurb: "Dynamic arrays, the remove(index vs object) trap, ArrayDeque as stack+queue.",
          resources: [
            { kind: "article", label: "ArrayList guide", by: "Baeldung", url: "https://www.baeldung.com/java-arraylist" },
            { kind: "article", label: "ArrayDeque guide", by: "Baeldung", url: "https://www.baeldung.com/java-array-deque" },
          ],
        },
        {
          id: "map",
          title: "Map & HashMap internals",
          blurb: "Buckets, collisions, load factor, treeification; merge/computeIfAbsent idioms.",
          resources: [
            { kind: "article", label: "HashMap guide", by: "Baeldung", url: "https://www.baeldung.com/java-hashmap" },
            { kind: "article", label: "HashMap internals (advanced)", by: "Baeldung", url: "https://www.baeldung.com/java-hashmap-advanced" },
          ],
        },
        {
          id: "set-tree",
          title: "Sets, TreeMap & TreeSet",
          blurb: "Uniqueness; sorted maps/sets with floor/ceiling navigation.",
          resources: [
            { kind: "article", label: "Set guide", by: "Baeldung", url: "https://www.baeldung.com/java-set-operations" },
            { kind: "article", label: "TreeMap guide", by: "Baeldung", url: "https://www.baeldung.com/java-treemap" },
          ],
        },
        {
          id: "comparator",
          title: "Comparable, Comparator & sorting",
          blurb: "Natural vs external order, comparator chains, the overflow trap.",
          resources: [
            { kind: "article", label: "Comparable & Comparator", by: "Baeldung", url: "https://www.baeldung.com/java-comparator-comparable" },
          ],
        },
      ],
    },
    {
      id: "functional",
      title: "Lambdas, Streams & functional",
      topics: [
        {
          id: "lambdas",
          title: "Lambdas & functional interfaces",
          blurb: "Predicate/Function/Consumer/Supplier, method references, closures.",
          resources: [
            { kind: "article", label: "Functional interfaces", by: "Baeldung", url: "https://www.baeldung.com/java-8-functional-interfaces" },
            { kind: "article", label: "Lambda expressions", by: "Baeldung", url: "https://www.baeldung.com/java-8-lambda-expressions-tips" },
          ],
        },
        {
          id: "streams",
          title: "The Stream API",
          blurb: "source → intermediate (lazy) → terminal; map/filter/reduce/flatMap.",
          resources: [
            { kind: "article", label: "Java Streams", by: "Baeldung", url: "https://www.baeldung.com/java-8-streams" },
            { kind: "article", label: "Collectors in depth", by: "Baeldung", url: "https://www.baeldung.com/java-8-collectors" },
          ],
        },
        {
          id: "optional",
          title: "Optional",
          blurb: "Modeling absence without null; map/orElse/ifPresent.",
          resources: [
            { kind: "article", label: "Guide to Optional", by: "Baeldung", url: "https://www.baeldung.com/java-optional" },
          ],
        },
      ],
    },
    {
      id: "exceptions-io",
      title: "Exceptions & I/O",
      topics: [
        {
          id: "exceptions",
          title: "Exceptions",
          blurb: "Checked vs unchecked, try-with-resources, custom exceptions, best practices.",
          resources: [
            { kind: "docs", label: "Exceptions trail", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/" },
            { kind: "article", label: "Exception handling", by: "Baeldung", url: "https://www.baeldung.com/java-exceptions" },
          ],
        },
        {
          id: "io",
          title: "I/O, files & NIO",
          blurb: "Streams/readers, try-with-resources, java.nio.file.Path/Files.",
          resources: [
            { kind: "docs", label: "Basic I/O trail", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/io/" },
            { kind: "article", label: "Reading & writing files", by: "Baeldung", url: "https://www.baeldung.com/java-write-to-file" },
          ],
        },
      ],
    },
    {
      id: "concurrency",
      title: "Concurrency & multithreading",
      desc: "Threads, the memory model, locks, executors, and the classic problems.",
      topics: [
        {
          id: "concurrency-course",
          title: "The free concurrency course",
          blurb: "Jenkov's tutorial is effectively a free book — the standard reference.",
          resources: [
            { kind: "course", label: "Java Concurrency & Multithreading (full)", by: "Jakob Jenkov", url: "https://jenkov.com/tutorials/java-concurrency/index.html" },
            { kind: "docs", label: "Concurrency trail", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/" },
            { kind: "article", label: "Java concurrency guides", by: "Baeldung", url: "https://www.baeldung.com/java-concurrency" },
          ],
        },
        {
          id: "threads-jmm",
          title: "Threads, race conditions & the memory model",
          blurb: "Thread lifecycle, visibility vs atomicity, happens-before, volatile.",
          resources: [
            { kind: "article", label: "Thread lifecycle", by: "Baeldung", url: "https://www.baeldung.com/java-thread-lifecycle" },
            { kind: "article", label: "Java Memory Model", by: "Jenkov", url: "https://jenkov.com/tutorials/java-concurrency/java-memory-model.html" },
            { kind: "article", label: "volatile keyword", by: "Baeldung", url: "https://www.baeldung.com/java-volatile" },
          ],
        },
        {
          id: "sync-locks",
          title: "synchronized, locks & atomics",
          blurb: "Monitors, ReentrantLock/ReadWriteLock/Condition, CAS & atomic variables.",
          resources: [
            { kind: "article", label: "synchronized keyword", by: "Baeldung", url: "https://www.baeldung.com/java-synchronized" },
            { kind: "article", label: "java.util.concurrent.locks", by: "Baeldung", url: "https://www.baeldung.com/java-concurrent-locks" },
            { kind: "article", label: "Atomic variables & CAS", by: "Baeldung", url: "https://www.baeldung.com/java-atomic-variables" },
          ],
        },
        {
          id: "coordination",
          title: "Semaphore, latches & barriers",
          blurb: "Semaphore, CountDownLatch, CyclicBarrier, Phaser — plus wait/notify.",
          resources: [
            { kind: "article", label: "CountDownLatch", by: "Baeldung", url: "https://www.baeldung.com/java-countdown-latch" },
            { kind: "article", label: "Semaphore", by: "Baeldung", url: "https://www.baeldung.com/java-semaphore" },
            { kind: "article", label: "wait() and notify()", by: "Baeldung", url: "https://www.baeldung.com/java-wait-notify" },
          ],
        },
        {
          id: "executors",
          title: "Executors, thread pools & CompletableFuture",
          blurb: "Stop creating raw threads: pools, sizing, async pipelines.",
          resources: [
            { kind: "article", label: "ExecutorService guide", by: "Baeldung", url: "https://www.baeldung.com/java-executor-service-tutorial" },
            { kind: "article", label: "CompletableFuture guide", by: "Baeldung", url: "https://www.baeldung.com/java-completablefuture" },
          ],
        },
        {
          id: "concurrent-collections",
          title: "Concurrent collections",
          blurb: "ConcurrentHashMap, BlockingQueue, CopyOnWriteArrayList.",
          resources: [
            { kind: "article", label: "ConcurrentMap", by: "Baeldung", url: "https://www.baeldung.com/java-concurrent-map" },
            { kind: "article", label: "BlockingQueue", by: "Baeldung", url: "https://www.baeldung.com/java-blocking-queue" },
          ],
        },
        {
          id: "hazards",
          title: "Deadlock, livelock & starvation",
          blurb: "How they happen and how to prevent them (lock ordering, tryLock).",
          resources: [
            { kind: "article", label: "Deadlock, livelock & starvation", by: "Baeldung", url: "https://www.baeldung.com/cs/deadlock-livelock-starvation" },
          ],
        },
      ],
    },
    {
      id: "jvm",
      title: "JVM, memory & modern Java",
      topics: [
        {
          id: "memory-gc",
          title: "Memory model & garbage collection",
          blurb: "Stack vs heap, runtime data areas, GC generations & collectors.",
          resources: [
            { kind: "article", label: "JVM runtime data areas", by: "Baeldung", url: "https://www.baeldung.com/java-jvm-run-time-data-areas" },
            { kind: "article", label: "JVM garbage collectors", by: "Baeldung", url: "https://www.baeldung.com/jvm-garbage-collectors" },
          ],
        },
        {
          id: "classloading-jit",
          title: "Class loading & JIT",
          blurb: "javac → bytecode → class loaders → interpreter + JIT.",
          resources: [
            { kind: "article", label: "Class loaders", by: "Baeldung", url: "https://www.baeldung.com/java-classloaders" },
            { kind: "article", label: "JIT compilation & JVM internals", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/just-in-time-compiler/" },
          ],
        },
        {
          id: "modern",
          title: "Modern Java (var, pattern matching, virtual threads)",
          blurb: "var, text blocks, pattern matching, sealed types, Loom virtual threads.",
          resources: [
            { kind: "article", label: "New features by version", by: "Baeldung", url: "https://www.baeldung.com/java-8-new-features" },
            { kind: "article", label: "Virtual threads (Project Loom)", by: "Baeldung", url: "https://www.baeldung.com/java-virtual-thread-vs-thread" },
            { kind: "docs", label: "What's new in the JDK", by: "dev.java", url: "https://dev.java/learn/" },
          ],
        },
      ],
    },
  ],
};
