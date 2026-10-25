# 4. Plan: Core Patterns with Spring Boot and Maven (Module 2)

**Goal:** Make the module 1 pipeline safe on the consuming side, then add the remaining patterns: an idempotent Kafka consumer, retry with backoff and a circuit breaker, an orchestrated saga with compensation, and cache-aside with Redis.
**Budget:** 5 h (usable 225 min) · **Level on entry:** module 1 done (proxies, aspects, events, Maven, idempotency keys, outbox, Kafka producer and listener basics) · **Goal type:** both (interview and build) · **Coding mode:** hybrid

> [!NOTE]
> Start with a 10 min recall of cards 1 to 12 (day-1 review) before item 1. Module 1 never ran the explain-back checks for items 4 and 5, so they are asked first.

## Schedule

| # | Item | Tier | Planned min | Actual min | Done |
|---|---|---|---|---|---|
| 0 | Recall: cards 1-12 plus the missing item 4 and 5 explain-backs | review | 10 | ~20 (includes teaching the two-consumer split) | ✓ |
| 1 | Idempotent consumer: dedupe a redelivered Kafka record by `event-id` with a unique constraint, then redeliver on purpose (crash before the offset commit) | MUST | 25 | ~25 (17:30 to ~17:55) | ✓ |
| 2 | Retry, backoff and circuit breaker around a flaky payment call. First check whether Spring Framework 7 core resilience (`@Retryable`) is enough or Resilience4j supports Boot 4 (unverified) | MUST | 40 | ~40 (17:58 to ~18:35) | ✓ built and verified; explain-back skipped by choice |
| R1 | Mixed review | review | 10 | | |
| 3 | Saga, orchestrated: order, payment, inventory with compensation, driven by the outbox and Kafka | MUST | 40 | not tracked (the log viewer and project-structure detours took most of the day) | ✓ built and verified in `playground/saga-pattern`: one database, so no outbox or Kafka; a recovery job instead |
| 4 | Cache-aside with Redis: add the Redis service, `@Cacheable` as a proxy, eviction after commit, stampede | SHOULD | 55 | | |
| 5 | Auto-configuration deep dive: `@Conditional*`, the imports file, the `--debug` conditions report on the Kafka starter | COULD | 25 | | |
| F | Final review and wrap-up | review | 22 | | |

Total planned: 227 min against 225 usable, so item 5 is the first cut. MUST items total 105 min (47% of usable). Breaks (10 min) after every 50 min of work.

## Checklist

- [x] 1. Idempotent consumer: can explain why a redelivered record is processed once, and show the unique constraint doing the work
- [x] 2. Retry and circuit breaker: can explain backoff, jitter and the three breaker states, and show a flaky call being retried and then short-circuited *(shown and measured; the learner said the concept is clear and chose to skip the explain-back)*
- [x] 3. Saga: can explain choreography versus orchestration and show a compensation running after a failure *(shown: compensation after a declined payment, a crash healed by the recovery job, the last-book race; choreography was explained in the [saga note](/notebook/system-design/pattern/saga) but not built; the learner's own explain-back came as questions during the work, not as a separate check)*
- [ ] 4. Cache-aside: can explain stale reads and stampedes, and show an eviction that waits for the commit
- [ ] 5. Auto-configuration: can name the conditions that created the Kafka beans from the `--debug` report
- [ ] Final review passed (all cards answered without hints)

## Notes to write at wrap-up

Nothing from module 2 is in the topic notes yet. At the end, add: an idempotent consumer section (the `V5` table, `claim`, the three branches, poison records), a retry and circuit breaker note, a saga note, a cache-aside note, and update the module overviews and `progress.md`.

## Not now

- Kafka deep dive (rebalancing, dead-letter topics, ordering across partitions, exactly-once): belongs to Module 04 messaging.
- Rate limiting and distributed locks: the next scaling module.
- Persistence leftovers (propagation and isolation demos, lazy loading and N+1, a roll-forward revert migration): still on `progress.md`.
