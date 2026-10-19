# Progress tracker

> [!NOTE]
> Notes are organised **by module**. Each module folder starts with an overview, then one note per topic. Every note ends with interview questions and answers. The old day-by-day log is kept in `99 Archive`.

## Modules

| Module | Notes | Status |
|--------|-------|--------|
| [00 Workspace](/notebook/spring-boot-system-design/00-workspace/dev-environment) | Dev environment | Reference |
| [01 Spring Boot basics](/notebook/spring-boot-system-design/01-spring-boot-basics/overview) | Overview, DI and layers, request input and JSON, validation and errors, configuration, testing | Done, except the auto-configuration deep dive |
| [02 Persistence](/notebook/spring-boot-system-design/02-persistence/overview) | Postgres and JDBC, Flyway, JPA and Hibernate, transactions, Testcontainers (planned) | In progress |
| [03 Observability](/notebook/spring-boot-system-design/03-observability/overview) | Request logging and traceId, Loki and Grafana pipeline | Logs done; metrics and trace export planned |
| 04 Messaging | RabbitMQ vs Kafka, partitions, consumer groups, delivery guarantees, DLQ | Not started |
| 05 Distributed problems | Idempotency, outbox, saga, CAP, retries | Not started |
| 06 Scaling | Redis caching, rate limiting, sharding, replication | Not started |
| 07 HLD and LLD | Design interviews, patterns, SOLID | Not started |

Capstone: an Order and Payment Platform (order, inventory, payment and notification services). Today there is only the learning sandbox `playground/hello-boot`.

## Next

1. Spring internals for interviews: write the aspect exercise (`@LogExecutionTime` with Spring AOP, proxies, `--debug` conditions report), then the auto-configuration deep dive.
2. Finish persistence: propagation, isolation levels, pessimistic locking, lazy loading and N+1, a `V3` roll-forward revert.
3. Testcontainers and `@DataJpaTest` (planned, needs the Docker socket decision).
4. Metrics: Actuator, Prometheus and Grafana dashboards.
5. Module 04: Kafka and RabbitMQ with Spring.

## Weak spots to re-test

- A framework checks input **before** your code runs (missing `@RequestParam` gives 400, not null).
- Content negotiation: `Accept: application/xml` without a converter gives 406.
- A declared constraint is not enforced without `@Valid`.
- Which exceptions an advice class covers; unhandled ones keep Spring's default shape (415, 405).
- Hibernate maps `String` to `varchar(255)`, not `text`.
- Flyway on a non-empty database with no history table **fails**, even with no migration files.
- Test JVMs inherit the container's environment (`SPRING_PROFILES_ACTIVE`).
- A passing check can be invalid: prove it can fail first.

## Temporary code to delete later (ask first)

The unused JdbcTemplate `MessageRepository`, `JdbcDemoRepository` with `/db/version`, and the transaction demos behind `/demo/tx/*`.
