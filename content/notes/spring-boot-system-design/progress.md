# Progress tracker

> [!NOTE]
> Notes are organised **by module**. Each module folder starts with an overview, then one note per topic. Every note ends with interview questions and answers. The old day-by-day log is kept in `99 Archive`.

## Modules

| Module | Notes | Status |
|--------|-------|--------|
| [00 Workspace](/notebook/spring-boot-system-design/00-workspace/dev-environment) | Dev environment | Reference |
| [01 Spring Boot basics](/notebook/spring-boot-system-design/01-spring-boot-basics/overview) | Overview, DI and layers, request input and JSON, validation and errors, configuration, testing, [AOP aspects and events](/notebook/spring-boot-system-design/01-spring-boot-basics/aop-aspects-and-transactional-events), [Maven in depth](/notebook/spring-boot-system-design/01-spring-boot-basics/maven-effective-pom-lifecycle-and-fat-jar) | Done, except the auto-configuration deep dive |
| [02 Persistence](/notebook/spring-boot-system-design/02-persistence/overview) | Postgres and JDBC, Flyway, JPA and Hibernate, transactions, Testcontainers (planned) | In progress |
| [03 Observability](/notebook/spring-boot-system-design/03-observability/overview) | Request logging and traceId, Loki and Grafana pipeline | Logs done; metrics and trace export planned |
| [04 Messaging](/notebook/spring-boot-system-design/04-messaging/overview) | Overview, [Kafka with Spring Boot](/notebook/spring-boot-system-design/04-messaging/kafka-with-spring-boot); RabbitMQ vs Kafka, DLQ planned | Started: Kafka in compose, producer and listener basics (sprint); RabbitMQ, DLQ, rebalancing not done |
| [05 Distributed problems](/notebook/spring-boot-system-design/05-distributed-problems/overview) | Overview, [Idempotency keys](/notebook/spring-boot-system-design/05-distributed-problems/idempotency-keys), [Transactional outbox](/notebook/spring-boot-system-design/05-distributed-problems/transactional-outbox); saga, CAP, retries planned | In progress: idempotency keys and outbox done in the [sprint](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/cheatsheet); the [saga](/notebook/system-design/pattern/hld/saga) is built and verified in `playground/hld/saga-pattern`; retries, CAP next |
| 06 Scaling | Redis caching, rate limiting, sharding, replication | Not started |
| 07 HLD and LLD | [Train ticket booking board](/notebook/whiteboard/train-ticket-booking) (one canvas: scope, numbers, architecture, flows, API, data model, 16 decisions; long text in the [written version](/notebook/whiteboard/train-ticket-booking-written)); more designs and LLD planned | Started: one full HLD interview done (2026-11-07) |

Capstone: an Order and Payment Platform (order, inventory, payment and notification services). Today there are six learning sandboxes under `playground/`: `hello-boot` (basics, persistence, outbox, Kafka, idempotency, retry), `hld/saga-pattern` (the order saga), `lld/strategy-pattern` (the Strategy lesson, done), `lld/observer-pattern` (the Observer lesson, done), `lld/state-pattern` (the State lesson, done) and `lld/factory-pattern` (the Factory Method lesson, done). One `.env` file picks which one runs.

## Next

1. Spring internals for interviews: the aspect exercise and transactional events are written and verified (note 7; the explain-back check is still pending in the sprint). Still open: the `--debug` conditions report and the auto-configuration deep dive.
2. Finish persistence: propagation, isolation levels, pessimistic locking, lazy loading and N+1, a `V3` roll-forward revert.
3. Testcontainers and `@DataJpaTest` (planned, needs the Docker socket decision).
4. Metrics: Actuator, Prometheus and Grafana dashboards.
5. Sprint [module 2](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/plan-module-2) is **closed** (idempotent consumer, retry and circuit breaker and the saga are done; cache-aside skipped by choice, auto-configuration not started). Next pattern: to be chosen from the distributed-systems list (candidates: CQRS on the existing outbox and Kafka, a distributed lock for the scheduled jobs, event sourcing), then module 04: Kafka deep dive and RabbitMQ. Two topic notes are still unwritten: the idempotent consumer and the retry and circuit breaker.

## Weak spots to re-test

- A framework checks input **before** your code runs (missing `@RequestParam` gives 400, not null).
- Content negotiation: `Accept: application/xml` without a converter gives 406.
- A declared constraint is not enforced without `@Valid`.
- Which exceptions an advice class covers; unhandled ones keep Spring's default shape (415, 405).
- Hibernate maps `String` to `varchar(255)`, not `text`.
- Flyway on a non-empty database with no history table **fails**, even with no migration files.
- Test JVMs inherit the container's environment (`SPRING_PROFILES_ACTIVE`).
- A passing check can be invalid: prove it can fail first.
- An aspect (or a `catch` in a `@Transactional` method) that swallows an exception makes the transaction commit: HTTP 200 with half-saved data.
- A retried request with the same idempotency key is replayed (201, same id), not rejected. The outbox and Kafka explain-backs were never asked.
- A failed compensation cannot be retried through a queue when the database itself is down: the saved status is the retry queue, and a recovery job reads it. The job's age threshold must exceed the slowest normal saga, and it must check the payment before cancelling an order that may have been charged.
- A guarded `UPDATE ... WHERE available >= n` decides a race, not `@Transactional` by itself: the second writer waits on the row lock and then matches zero rows.
- A Redis seat claim is `SET key value NX EX 300` (one atomic command), not `XAUTOCLAIM` (that is for Streams). Redis replicas copy asynchronously, so a failover can lose the last claims: the database unique rule must stay the final guard.
- A rate limiter caps request speed, not how many seats one user holds at once: that needs its own cap (one active hold per user), enforced in the database.
- In the train-ticket flow, money is taken only after the hold exists, so the loser of a seat race sees "seat taken" before paying and needs no refund. Refunds exist only for late or PENDING payments.

## Temporary code to delete later (ask first)

The unused JdbcTemplate `MessageRepository`, `JdbcDemoRepository` with `/db/version`, and the transaction demos behind `/demo/tx/*`.
