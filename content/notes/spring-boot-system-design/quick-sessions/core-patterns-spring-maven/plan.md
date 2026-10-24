# 1. Plan: Core patterns with Spring Boot and Maven (module 1)

**Goal:** Explain how Spring AOP proxies are created and used (aspects, `@TransactionalEventListener`). Read an effective POM and dependency tree and explain mediation, scopes, BOM and the fat jar. Build and break idempotency keys and a transactional outbox, then move the outbox relay onto Kafka and state the delivery guarantee (at-least-once) and why consumers must be idempotent.
**Budget:** 6 h (usable 270 min) · **Level on entry:** persistence basics done per notes (Postgres/JDBC, Hikari, Flyway, JPA/Hibernate, `@Transactional` proxy rules); Maven core, AOP internals, auto-configuration and pattern basics not claimed · **Goal type:** both (interview and build) · **Coding mode:** hybrid (Claude writes the plumbing, the learner writes the core 10-20 lines of each pattern) · **Broker:** Kafka (KRaft)

> [!NOTE]
> The full request (5 patterns, Maven, proxies, Kafka) needs about 295 min of MUST items alone against 270 usable, so it is split into two modules. This is module 1. Code lives in `playground/hello-boot`; promoting it to `services/order-service` is a separate decision because it triggers the compose split.

## Schedule

| # | Item | Tier | Planned min | Actual min | Done |
|---|---|---|---|---|---|
| 1 | Spring AOP proxies in depth: write the `@LogExecutionTime` aspect, see the CGLIB class and where the proxy is created, then `@TransactionalEventListener` phases (self-invocation and rollback rules are already in your notes: one verify question only) | MUST | 25 | ~85 (10:56 to ~12:20, includes the notes rewrite) | ✓ |
| 2 | Maven in depth: lifecycle and plugin bindings, effective POM, dependency mediation and scopes, BOM, Boot repackage (fat jar) | MUST | 40 | ~37 (from file times) | ✓ |
| R1 | Mixed review (cards 1-2) | review | 10 | ~65 (includes waiting) | ✓ |
| 3 | Idempotency keys: header, unique constraint, request fingerprint, replay vs 409, concurrent duplicates | MUST | 40 | ~42 (14:04 to 14:46) | ✓ |
| 4 | Transactional outbox: dual-write problem, outbox table, relay poller, at-least-once, crash between publish and mark (built against a `Publisher` interface, log implementation first) | MUST | 40 | ~62 (14:50 to ~15:52) | built and verified, check not run |
| R2 | Mixed review (cards 1-4) | review | 10 | skipped | |
| 5 | Kafka (KRaft) and Spring Kafka: topic, partition, offset, consumer group, `KafkaTemplate`, listener container; swap the outbox relay onto Kafka and watch duplicates | SHOULD | 40 | ~15 (15:52 to ~16:05) | partly: producer, topic, listener and group verified; idempotent consumer moved to module 2 |
| 6 | Auto-configuration, read through Kafka: `@Conditional*`, imports file, `--debug` conditions report | COULD | 15 | cut | |
| F | Final review and wrap-up (cheat sheet, weak spots) | review | 27 | wrap-up only; the final review was skipped by choice | |

Total planned: 247 min of 270 usable (the 15 min freed on item 1 stay unallocated as buffer for MUST items). Order follows dependency. Breaks (10 min) after every 50 min of work; mixed reviews after items 2 and 4; final review in the last 10%.

## Checklist

- [x] 1. AOP proxies: can show with `getClass()` output and a stack trace where the proxy sits between caller and bean, explain what `AFTER_COMMIT` guarantees for an event listener, and answer the self-invocation question from your notes without hints
- [x] 2. Maven: can explain, with `help:effective-pom`, `dependency:tree` and `jar tf` output, where a dependency version comes from, which scope ends up in the fat jar, and what `repackage` changes
- [x] 3. Idempotency keys: can explain what happens when two identical requests arrive at the same instant, and show the unique constraint doing the work
- [x] 4. Transactional outbox: can explain the dual-write failure it removes, and show a duplicate publish caused by a crash between publish and mark *(explain-back passed on the second attempt in the module 2 recall)*
- [ ] 5. Kafka and Spring Kafka: can explain partition, offset and consumer group in own words, and show a redelivered message handled idempotently *(partition, offset and group shown, and the two-consumer split demonstrated in the module 2 recall; idempotent consumer is module 2 item 1)*
- [ ] 6. Auto-configuration: can name the conditions that created the Kafka beans from the `--debug` report *(cut)*
- [ ] Final review passed (all cards answered without hints) *(skipped by choice)*

## Cut rules

- If we slip, cut item 6 first, then shrink item 5 to the listener container plus duplicate redelivery. MUST items (1-4) are never shortened.
- If the Docker daemon or Kafka misbehaves for more than 10 min, item 5 moves to module 2 and the outbox stays on the log `Publisher`.

## Not now

- Auto-configuration read-through of the Kafka starter (item 6, COULD, 15): cut because item 1 ran about 50 min over its estimate. It joins the module 2 auto-configuration deep dive.
- Persistence leftovers (propagation and isolation demos, lazy loading and N+1, `V3` revert): not in this sprint, still listed under Next in `progress.md`.
- Retry, backoff and circuit breaker (MUST, 40): module 2. Check at start whether Spring Framework 7 core resilience (`@Retryable`) is enough or Resilience4j supports Boot 4 (unverified).
- Saga, orchestrated (MUST, 40): module 2. It reuses the outbox and Kafka from this module.
- Cache-aside with Redis (MUST, 40 plus 15 for the Redis service): module 2.
- Full auto-configuration deep dive and a custom starter (SHOULD, 25): module 2. Today only the Kafka read-through (item 6).

## Weak spots

- A retried request with the same idempotency key is **replayed** (201, same id), not rejected. The first explain-back said "rejected"; the second answer was right.
- Code order in `createIdempotent`: claim the key only after the message exists (the first draft inserted a placeholder id 0 and inverted the hash check).
- Precedence in Maven is a ranking, not "my pom always wins": version on the dependency, then your `dependencyManagement`, then the parent BOM, then a transitive request.
- Not yet explained back: the outbox (item 4) and Kafka (item 5).

## Next module

- [Module 2 plan](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/plan-module-2) (5 h): idempotent consumer, retry and circuit breaker, saga, cache-aside with Redis, auto-configuration deep dive.
