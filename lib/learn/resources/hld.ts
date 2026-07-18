import { ResourceDomain } from "../resource-types";

// HIGH-LEVEL / SYSTEM DESIGN — comprehensive curated FREE resources.
const PRIMER = "https://github.com/donnemartin/system-design-primer";

export const HLD: ResourceDomain = {
  key: "hld",
  name: "System Design (HLD)",
  tagline: "Foundations, scaling, databases, caching, queues, reliability, estimation, and full case studies — all free.",
  icon: "Network",
  accent: "from-cyan-500 to-blue-600",
  sections: [
    {
      id: "start",
      title: "Start here",
      topics: [
        {
          id: "primer",
          title: "The free system-design references",
          blurb: "The Primer is a complete free course; ByteByteGo & GfG add depth and diagrams.",
          resources: [
            { kind: "book", label: "System Design Primer (GitHub)", by: "Donne Martin", url: PRIMER },
            { kind: "article", label: "ByteByteGo blog — deep dives", by: "Alex Xu", url: "https://blog.bytebytego.com/" },
            { kind: "docs", label: "System Design tutorial", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design-tutorial/" },
            { kind: "video", label: "System design walkthroughs", by: "Gaurav Sen (YouTube)", url: "https://www.youtube.com/@gkcs" },
          ],
        },
        {
          id: "framework",
          title: "The interview framework & estimation",
          blurb: "Requirements → estimates (QPS/storage) → API → data → architecture → deep-dive → bottlenecks.",
          resources: [
            { kind: "article", label: "How to approach a system design interview", by: "System Design Primer", url: `${PRIMER}#how-to-approach-a-system-design-interview-question` },
            { kind: "article", label: "Back-of-envelope estimation & latency numbers", by: "System Design Primer", url: `${PRIMER}#appendix` },
          ],
        },
      ],
    },
    {
      id: "foundations",
      title: "Foundations",
      topics: [
        {
          id: "networking",
          title: "DNS, CDN, HTTP & the request path",
          blurb: "What happens end-to-end; DNS, CDNs, reverse proxies.",
          resources: [
            { kind: "article", label: "DNS, CDN, reverse proxy (Primer)", by: "System Design Primer", url: `${PRIMER}#domain-name-system` },
            { kind: "docs", label: "HTTP — MDN", by: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
          ],
        },
        {
          id: "apis",
          title: "API design — REST, RPC, GraphQL",
          blurb: "Resources, versioning, pagination, idempotency; REST vs gRPC vs GraphQL.",
          resources: [
            { kind: "article", label: "Communication: REST vs RPC (Primer)", by: "System Design Primer", url: `${PRIMER}#communication` },
            { kind: "article", label: "REST API design best practices", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/rest-api-introduction/" },
          ],
        },
        {
          id: "realtime",
          title: "Real-time: WebSocket vs SSE vs polling",
          blurb: "How servers push; when to use each; scaling persistent connections.",
          resources: [
            { kind: "docs", label: "WebSockets — MDN", by: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" },
            { kind: "article", label: "WebSocket vs SSE vs long polling", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/what-is-web-socket-and-how-it-is-different-from-the-http/" },
          ],
        },
      ],
    },
    {
      id: "scaling",
      title: "Scaling the service tier",
      topics: [
        {
          id: "load-balancing",
          title: "Load balancing & horizontal scaling",
          blurb: "L4/L7, algorithms, health checks; stateless services.",
          resources: [
            { kind: "article", label: "Load balancer & scaling (Primer)", by: "System Design Primer", url: `${PRIMER}#load-balancer` },
            { kind: "article", label: "Scalability lecture (Primer)", by: "System Design Primer", url: `${PRIMER}#step-1-review-the-scalability-video-lecture` },
          ],
        },
        {
          id: "cdn-stateless",
          title: "CDN & stateless design",
          blurb: "Edge caching, fingerprinted assets; sessions in a shared store / JWT.",
          resources: [
            { kind: "article", label: "Content delivery network (Primer)", by: "System Design Primer", url: `${PRIMER}#content-delivery-network` },
          ],
        },
      ],
    },
    {
      id: "data",
      title: "The data layer",
      topics: [
        {
          id: "sql-nosql",
          title: "SQL vs NoSQL & choosing a database",
          blurb: "The four NoSQL families and the honest decision procedure.",
          resources: [
            { kind: "article", label: "SQL or NoSQL (Primer)", by: "System Design Primer", url: `${PRIMER}#sql-or-nosql` },
            { kind: "article", label: "Database section (Primer)", by: "System Design Primer", url: `${PRIMER}#database` },
          ],
        },
        {
          id: "indexing",
          title: "Indexing & query performance",
          blurb: "B-tree indexes, composite/leftmost-prefix, EXPLAIN, covering indexes.",
          resources: [
            { kind: "book", label: "Use The Index, Luke — SQL indexing", by: "Markus Winand", url: "https://use-the-index-luke.com/" },
          ],
        },
        {
          id: "replication-sharding",
          title: "Replication, sharding & consistent hashing",
          blurb: "Leader/follower, replication lag, partitioning, the hash ring, hot keys.",
          resources: [
            { kind: "article", label: "Replication & sharding (Primer)", by: "System Design Primer", url: `${PRIMER}#database` },
            { kind: "article", label: "Consistent hashing", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/consistent-hashing/" },
          ],
        },
        {
          id: "cap-consistency",
          title: "CAP, consistency & transactions",
          blurb: "Strong vs eventual, quorums (R+W>N), ACID, isolation, sagas/2PC.",
          resources: [
            { kind: "article", label: "Consistency & availability patterns (Primer)", by: "System Design Primer", url: `${PRIMER}#consistency-patterns` },
            { kind: "article", label: "CAP theorem", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/the-cap-theorem-in-dbms/" },
          ],
        },
      ],
    },
    {
      id: "cache-async",
      title: "Caching & async processing",
      topics: [
        {
          id: "caching",
          title: "Caching strategies & stampedes",
          blurb: "Cache-aside/write-through/write-back, eviction, thundering herd.",
          resources: [
            { kind: "article", label: "Cache section (Primer)", by: "System Design Primer", url: `${PRIMER}#cache` },
          ],
        },
        {
          id: "queues",
          title: "Message queues & pub/sub",
          blurb: "Kafka model (partitions, consumer groups), backpressure, delivery semantics, idempotency.",
          resources: [
            { kind: "article", label: "Asynchronism & message queues (Primer)", by: "System Design Primer", url: `${PRIMER}#asynchronism` },
            { kind: "docs", label: "Apache Kafka — introduction", by: "Apache Kafka", url: "https://kafka.apache.org/intro" },
          ],
        },
      ],
    },
    {
      id: "reliability",
      title: "Reliability & coordination",
      topics: [
        {
          id: "resilience",
          title: "Rate limiting, retries & circuit breakers",
          blurb: "Timeouts, exponential backoff + jitter, bulkheads, load shedding.",
          resources: [
            { kind: "article", label: "Rate limiter design", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design-of-api-rate-limiter/" },
            { kind: "article", label: "Circuit breaker pattern", by: "Martin Fowler", url: "https://martinfowler.com/bliki/CircuitBreaker.html" },
          ],
        },
        {
          id: "coordination",
          title: "Leader election, consensus & WAL",
          blurb: "Leases, fencing tokens, Raft/Paxos, write-ahead logs, observability (p99).",
          resources: [
            { kind: "article", label: "The Raft consensus algorithm (visual)", by: "raft.github.io", url: "https://raft.github.io/" },
            { kind: "article", label: "Availability patterns (Primer)", by: "System Design Primer", url: `${PRIMER}#availability-patterns` },
          ],
        },
      ],
    },
    {
      id: "cases",
      title: "Case studies",
      topics: [
        {
          id: "case-studies",
          title: "Design X — worked examples",
          blurb: "URL shortener, chat, news feed, YouTube, Uber, web crawler, notifications, ID generator.",
          resources: [
            { kind: "article", label: "Case studies with solutions (Primer)", by: "System Design Primer", url: `${PRIMER}#system-design-interview-questions-with-solutions` },
            { kind: "article", label: "System design case studies", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design-tutorial/#system-design-interview-questions" },
          ],
        },
        {
          id: "collab",
          title: "Collaborative editing (OT / CRDT)",
          blurb: "Multiplayer cursors, offline-first, sync engines — your Vani edge.",
          resources: [
            { kind: "article", label: "How Figma's multiplayer works", by: "Figma Engineering", url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/" },
            { kind: "docs", label: "CRDTs — resource hub", by: "crdt.tech", url: "https://crdt.tech/" },
          ],
        },
      ],
    },
  ],
};
