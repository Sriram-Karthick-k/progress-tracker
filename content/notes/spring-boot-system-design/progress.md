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
| [05 Distributed problems](/notebook/spring-boot-system-design/05-distributed-problems/overview) | Overview, [Idempotency keys](/notebook/spring-boot-system-design/05-distributed-problems/idempotency-keys), [Transactional outbox](/notebook/spring-boot-system-design/05-distributed-problems/transactional-outbox); saga, CAP, retries planned | In progress: idempotency keys and outbox done in the [sprint](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/cheatsheet); the [saga](/notebook/system-design/pattern/saga) is built and verified in `playground/saga-pattern`; retries, CAP next |
| 06 Scaling | Redis caching, rate limiting, sharding, replication | Not started |
| 07 HLD and LLD | Design interviews, patterns, SOLID | Not started |

Capstone: an Order and Payment Platform (order, inventory, payment and notification services). Today there are two learning sandboxes under `playground/`: `hello-boot` (basics, persistence, outbox, Kafka, idempotency, retry) and `saga-pattern` (the order saga). One `.env` file picks which one runs.

## Next

1. Spring internals for interviews: the aspect exercise and transactional events are written and verified (note 7; the explain-back check is still pending in the sprint). Still open: the `--debug` conditions report and the auto-configuration deep dive.
2. Finish persistence: propagation, isolation levels, pessimistic locking, lazy loading and N+1, a `V3` roll-forward revert.
3. Testcontainers and `@DataJpaTest` (planned, needs the Docker socket decision).
4. Metrics: Actuator, Prometheus and Grafana dashboards.
5. Sprint [module 2](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/plan-module-2) (idempotent consumer, retry and circuit breaker and the saga are done; the Redis cache is next), then module 04: Kafka deep dive and RabbitMQ.

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

## Temporary code to delete later (ask first)

The unused JdbcTemplate `MessageRepository`, `JdbcDemoRepository` with `/db/version`, and the transaction demos behind `/demo/tx/*`.
