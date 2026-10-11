# Spring Boot & System Design: Progress

## Where we are
**Stage:** 1. Spring Boot basics · **Next step:** make `/hello` take a request parameter and a path variable, and return JSON from a Java object.

## Curriculum
| # | Stage | Status |
|---|-------|--------|
| 1 | Spring Boot basics | in progress |
| 2 | Persistence (Postgres, JPA, Flyway) | todo |
| 3 | Messaging (RabbitMQ vs Kafka) | todo |
| 4 | Distributed problems (idempotency, outbox, saga) | todo |
| 5 | Scaling (cache, rate limit, sharding, replication) | todo |
| 6 | Observability | todo |
| 7 | HLD and LLD practice | todo |

Capstone: Order & Payment Platform (order, inventory, payment, notification services). Infra planned: Postgres, Redis, Kafka (KRaft) + UI, RabbitMQ, Prometheus/Grafana/Zipkin.

## Lesson log
### 2026-10-11 · Environment setup and first endpoint
- **Did:** Generated `hello-boot` with the VS Code Spring Initializr extension (Boot 4.1.1, Java 17, Maven, Spring Web). Ran it in Docker (`compose.yaml`, `maven:3.9-eclipse-temurin-17-alpine`). Added `GET /hello` in a `@RestController`. Added Spring DevTools and a compile-watch loop for ~1 s restarts.
- **Learned:**
  - Boot chain: starter on the classpath -> auto-configuration -> beans -> your code injects them. The log line `Tomcat initialized with port 8080` came from auto-config, not from our code.
  - `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`. Component scan only covers the main class's package and below.
  - Boot 4 renamed starters (`spring-boot-starter-webmvc`).
  - DevTools = two classloaders (libraries vs our classes). On a changed `.class` it restarts only our context in the same JVM: 4.7 s cold start vs 0.95 s restart. It restarts Tomcat too, because Tomcat is a bean in that context.
  - DevTools watches compiled classes. Something else has to compile.
- **Broke / gotchas:**
  - Initializr's default parent was `4.2.0-SNAPSHOT`. Changed to released `4.1.1` and removed the snapshot repositories.
  - Edits were not picked up: host VS Code was not compiling into `target/classes`. Fixed by running `mvn -q compile` in a 1 s watch loop inside the container.
  - Dev Containers drop the Claude session, its memory and host extensions. Chose host editor + Docker for the build.
  - Alpine uses musl instead of glibc. Fine so far. Fallback is removing `-alpine` if a native library fails.
- **Verified by:** `/hello` returned `200` and the edited text; DevTools log lines on the `restartedMain` thread; restart timings in the log.

## Weak spots
- (none recorded yet)

## Concept notes
- (none yet. Candidates: Spring Boot auto-configuration, DevTools restart)
