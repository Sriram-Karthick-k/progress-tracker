import { ResourceDomain, ResourceTopic } from "../resource-types";

// Helper: each GoF pattern → a trackable topic linking the illustrated
// Refactoring.Guru page + a Java implementation. Slugs are stable/real.
function pattern(id: string, title: string, blurb: string): ResourceTopic {
  return {
    id,
    title,
    blurb,
    resources: [
      { kind: "article", label: `${title} — illustrated`, by: "Refactoring.Guru", url: `https://refactoring.guru/design-patterns/${id}` },
      { kind: "docs", label: `${title} in Java (code)`, by: "java-design-patterns.com", url: "https://java-design-patterns.com/patterns/" },
    ],
  };
}

// LOW-LEVEL DESIGN / OOD — comprehensive curated FREE resources.
export const LLD: ResourceDomain = {
  key: "lld",
  name: "Low-Level Design",
  tagline: "OOP design, SOLID, UML, all 22 GoF patterns individually, and worked machine-coding designs.",
  icon: "Component",
  accent: "from-sky-500 to-blue-600",
  sections: [
    {
      id: "foundations",
      title: "Foundations",
      topics: [
        {
          id: "oop-pillars",
          title: "OOP pillars & relationships",
          blurb: "Encapsulation, abstraction, inheritance, polymorphism; association/aggregation/composition.",
          resources: [
            { kind: "article", label: "OOP concepts", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
            { kind: "article", label: "Design principles overview", by: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns/what-is-pattern" },
          ],
        },
        {
          id: "solid",
          title: "SOLID principles",
          blurb: "SRP, OCP, LSP, ISP, DIP — the rules interviewers listen for.",
          resources: [
            { kind: "article", label: "SOLID principles (with Java)", by: "Baeldung", url: "https://www.baeldung.com/solid-principles" },
            { kind: "article", label: "Design principles (DRY/KISS/YAGNI + more)", by: "Refactoring.Guru", url: "https://refactoring.guru/refactoring/smells" },
          ],
        },
        {
          id: "uml",
          title: "UML — class & sequence diagrams",
          blurb: "The notation you'll draw in every LLD round.",
          resources: [
            { kind: "article", label: "UML class diagrams", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/unified-modeling-language-uml-class-diagrams/" },
            { kind: "article", label: "UML sequence diagrams", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/unified-modeling-language-uml-sequence-diagrams/" },
          ],
        },
      ],
    },
    {
      id: "creational",
      title: "Creational patterns",
      desc: "How objects get created.",
      topics: [
        pattern("singleton", "Singleton", "One shared instance — and how to make it thread-safe (holder/enum)."),
        pattern("factory-method", "Factory Method", "Subclasses decide which concrete class to instantiate."),
        pattern("abstract-factory", "Abstract Factory", "Families of related objects behind one interface."),
        pattern("builder", "Builder", "Construct complex objects step by step; fluent APIs."),
        pattern("prototype", "Prototype", "Clone existing objects instead of building anew."),
      ],
    },
    {
      id: "structural",
      title: "Structural patterns",
      desc: "How objects compose into larger structures.",
      topics: [
        pattern("adapter", "Adapter", "Make an incompatible interface usable — translate calls."),
        pattern("bridge", "Bridge", "Split abstraction from implementation to avoid a class explosion."),
        pattern("composite", "Composite", "Treat single items and groups uniformly — trees of parts."),
        pattern("decorator", "Decorator", "Stack behavior onto an object at runtime, same interface."),
        pattern("facade", "Facade", "One simple interface over a complex subsystem."),
        pattern("flyweight", "Flyweight", "Share intrinsic state across many objects to save memory."),
        pattern("proxy", "Proxy", "A stand-in that controls access (lazy, remote, protection)."),
      ],
    },
    {
      id: "behavioral",
      title: "Behavioral patterns",
      desc: "How objects communicate and share responsibility.",
      topics: [
        pattern("chain-of-responsibility", "Chain of Responsibility", "Pass a request along a chain until one handles it."),
        pattern("command", "Command", "Encapsulate a request as an object — undo/redo, queues."),
        pattern("iterator", "Iterator", "Traverse a collection without exposing its structure."),
        pattern("mediator", "Mediator", "Centralize complex communication between objects."),
        pattern("memento", "Memento", "Capture & restore an object's state (undo)."),
        pattern("observer", "Observer", "Publish/subscribe: dependents notified on change."),
        pattern("state", "State", "Behavior changes with state — one class per state."),
        pattern("strategy", "Strategy", "Swap an algorithm at runtime — the most-used pattern in LLD."),
        pattern("template-method", "Template Method", "Fix the skeleton, let subclasses fill steps."),
        pattern("visitor", "Visitor", "Add operations to a class hierarchy without changing it."),
      ],
    },
    {
      id: "practice",
      title: "Worked designs & the interview method",
      topics: [
        {
          id: "method",
          title: "The LLD interview method",
          blurb: "Requirements → entities → relationships → patterns → code core → walk a flow.",
          resources: [
            { kind: "docs", label: "Low Level Design (LLD) tutorial", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design/low-level-design-lld-tutorial/" },
          ],
        },
        {
          id: "lld-problems",
          title: "Worked designs (parking lot, elevator, BookMyShow, …)",
          blurb: "Parking lot, elevator, vending machine, Splitwise, LRU cache, rate limiter, chess.",
          resources: [
            { kind: "docs", label: "Awesome LLD — curated problems (GitHub)", by: "prasadgujar", url: "https://github.com/prasadgujar/low-level-design-primer" },
            { kind: "docs", label: "LLD problems & solutions", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design/low-level-design-lld-tutorial/" },
          ],
        },
      ],
    },
  ],
};
