import { ResourceDomain } from "../resource-types";

// CS FUNDAMENTALS — OS, networking, DBMS. Comprehensive curated FREE resources.
export const CS_BASICS: ResourceDomain = {
  key: "cs-basics",
  name: "CS Fundamentals",
  tagline: "Operating systems, computer networks, and databases — the theory interviews assume you know.",
  icon: "GraduationCap",
  accent: "from-emerald-500 to-teal-600",
  sections: [
    {
      id: "os",
      title: "Operating Systems",
      desc: "The free OSTEP textbook is the gold standard; GfG for quick revision.",
      topics: [
        {
          id: "os-book",
          title: "Start here — the free OS book",
          resources: [
            { kind: "book", label: "Operating Systems: Three Easy Pieces (OSTEP)", by: "Arpaci-Dusseau · free", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" },
            { kind: "docs", label: "Operating Systems tutorial", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/operating-systems/" },
          ],
        },
        {
          id: "processes-threads",
          title: "Processes, threads & scheduling",
          blurb: "Process vs thread, context switching, CPU scheduling algorithms.",
          resources: [
            { kind: "article", label: "Process vs thread", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/difference-between-process-and-thread/" },
            { kind: "article", label: "CPU scheduling", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/" },
          ],
        },
        {
          id: "memory",
          title: "Memory: virtual memory & paging",
          blurb: "Address spaces, paging, page faults, TLB, segmentation.",
          resources: [
            { kind: "article", label: "Virtual memory & paging", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/virtual-memory-in-operating-system/" },
          ],
        },
        {
          id: "concurrency-os",
          title: "Concurrency & deadlock",
          blurb: "Mutexes/semaphores, race conditions, the four deadlock conditions.",
          resources: [
            { kind: "article", label: "Deadlock: conditions & handling", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/introduction-of-deadlock-in-operating-system/" },
          ],
        },
      ],
    },
    {
      id: "networking",
      title: "Computer Networks",
      topics: [
        {
          id: "net-overview",
          title: "Start here — models & the stack",
          resources: [
            { kind: "docs", label: "Computer Network tutorials", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/computer-network-tutorials/" },
            { kind: "book", label: "Beej's Guide to Network Programming", by: "Beej · free", url: "https://beej.us/guide/bgnet/" },
          ],
        },
        {
          id: "tcp-udp",
          title: "TCP vs UDP & the transport layer",
          blurb: "Reliability, the 3-way handshake, flow/congestion control, when UDP wins.",
          resources: [
            { kind: "article", label: "TCP vs UDP", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/differences-between-tcp-and-udp/" },
          ],
        },
        {
          id: "http-tls",
          title: "HTTP, HTTPS & TLS",
          blurb: "HTTP methods/status, HTTP/2 & 3, the TLS handshake.",
          resources: [
            { kind: "docs", label: "HTTP — MDN", by: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
            { kind: "article", label: "How HTTPS/TLS works", by: "Cloudflare Learning", url: "https://www.cloudflare.com/learning/ssl/what-is-https/" },
          ],
        },
        {
          id: "dns-url",
          title: "DNS & 'what happens when you type a URL'",
          blurb: "Name resolution, caching/TTL; the full end-to-end request path.",
          resources: [
            { kind: "article", label: "What happens when you type a URL (GitHub)", by: "alex", url: "https://github.com/alex/what-happens-when" },
            { kind: "article", label: "How DNS works", by: "Cloudflare Learning", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" },
          ],
        },
      ],
    },
    {
      id: "dbms",
      title: "Databases",
      topics: [
        {
          id: "db-overview",
          title: "Start here — DBMS & a free course",
          resources: [
            { kind: "course", label: "CMU Intro to Database Systems (free lectures)", by: "CMU 15-445", url: "https://15445.courses.cs.cmu.edu/" },
            { kind: "docs", label: "DBMS tutorial", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/dbms/" },
          ],
        },
        {
          id: "normalization",
          title: "Relational model & normalization",
          blurb: "Keys, 1NF–BCNF, when to denormalize.",
          resources: [
            { kind: "article", label: "Normalization (1NF–BCNF)", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/normal-forms-in-dbms/" },
          ],
        },
        {
          id: "indexing-db",
          title: "Indexing & query performance",
          blurb: "B-tree/B+-tree indexes, composite indexes, EXPLAIN.",
          resources: [
            { kind: "book", label: "Use The Index, Luke — SQL indexing", by: "Markus Winand · free", url: "https://use-the-index-luke.com/" },
          ],
        },
        {
          id: "transactions",
          title: "Transactions, ACID & isolation",
          blurb: "ACID, isolation levels, the anomalies each prevents, concurrency control.",
          resources: [
            { kind: "article", label: "ACID properties", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/acid-properties-in-dbms/" },
            { kind: "article", label: "Transaction isolation levels", by: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/transaction-isolation-levels-dbms/" },
          ],
        },
      ],
    },
  ],
};
