# Lesson log (archive)

> [!NOTE]
> This is the original day-by-day log, kept unchanged apart from this heading. The same material is now organised by module (`01-spring-boot-basics`, `02-persistence`, `03-observability`); use those notes for studying. The checklists and "Where we are" below are out of date: see `progress.md` for the current status.

## Where we are (outdated)
**Stage:** 2. Persistence (Postgres, JDBC, Flyway, JPA) · **Next step:** tests for the JPA layer against a throwaway Postgres (Testcontainers), then retire the demo/JdbcTemplate leftovers (ask first). Not yet covered in Stage 2: propagation (`REQUIRES_NEW`), isolation levels in practice, pessimistic locking (`FOR UPDATE`). Stage 1 leftover: auto-configuration in depth.

**Stage 2 checklist:**
- [x] Postgres container (`add-infra`), reachable at `postgres:5432` in-network and `localhost:5433` from the host
- [x] Raw JDBC: `DataSource` -> `Connection` -> `PreparedStatement` -> `ResultSet`
- [x] `JdbcTemplate` repository + service layer + `/messages` endpoints (201 / 400 / 404)
- [x] Flyway `V1`, `flyway_schema_history`, checksum validation
- [x] Tests for the new layers (service unit tests with a Mockito mock, controller slice tests)
- [x] JPA: `@Entity`, Hibernate-generated Postgres DDL compared with `V1`, `ddl-auto=validate`, Spring Data repository, SQL logging
- [x] Dirty checking and why it needs `@Transactional` (silent lost update without it)
- [x] `V2` migration (add `version` column; expand step before the code change); viewed with the Flyway CLI `info`
- [x] Transactions: atomicity and rollback, checked vs unchecked exceptions, self-invocation trap, lost update, optimistic locking (`@Version`) mapped to HTTP 409
- [ ] Transactions, remaining: propagation (`REQUIRES_NEW`), isolation levels in practice, pessimistic locking
- [ ] A roll-forward revert of a migration (a `V3` that undoes `V2`)
- [ ] Retire the temporary leftovers, ask before deleting: `MessageRepository` (JdbcTemplate), `JdbcDemoRepository` + `DbController` (`/db/version`), `TransactionDemoService` + `TransactionDemoController` (`/demo/tx/*`)
- [ ] Tests for the JPA layer (`@DataJpaTest` with a real throwaway Postgres)
- [ ] Throwaway test database (Testcontainers) so `@SpringBootTest` stops using the dev DB

**Stage 1 checklist** (agreed order: DI + layers, validation + errors, config/profiles, testing):
- [x] Controllers and routing
- [x] Request params, path variables, JSON responses, content negotiation
- [x] Dependency injection (beans, constructor injection) and the controller -> service layer
- [x] Repository layer (delivered in Stage 2: JdbcTemplate, then Spring Data JPA)
- [x] `@RequestBody`, validation (`@Valid`), error handling (`@RestControllerAdvice` + `ResponseEntityExceptionHandler`)
- [x] Config and profiles (`@Value`, `@ConfigurationProperties`, `dev` profile, env-var precedence)
- [x] Testing (unit, `@WebMvcTest` slice, `@SpringBootTest`, `@MockitoBean`, `@ActiveProfiles`)
- [ ] Auto-configuration in depth (`--debug` conditions report)

**Resolved (2026-10-14):** VS Code reported `playground/hello-boot` as a "non-project file" in the multi-root workspace window. Cause: that window's Java server still had `hello-boot` registered at the **old pre-move path** with no Java nature. "Java: Clean Java Language Server Workspace" only affects the window it is run in; it had been run in a different window first. After cleaning the workspace window, `hello-boot` registered at `playground/hello-boot` with `javanature`, and the Spring Boot panels worked.

## Curriculum
| # | Stage | Status |
|---|-------|--------|
| 1 | Spring Boot basics | in progress |
| 2 | Persistence (Postgres, JPA, Flyway) | in progress |
| 3 | Messaging (RabbitMQ vs Kafka) | todo |
| 4 | Distributed problems (idempotency, outbox, saga) | todo |
| 5 | Scaling (cache, rate limit, sharding, replication) | todo |
| 6 | Observability | todo |
| 7 | HLD and LLD practice | todo |

Capstone: Order & Payment Platform (order, inventory, payment, notification services). Infra planned: Postgres, Redis, Kafka (KRaft) + UI, RabbitMQ, Prometheus/Grafana/Zipkin.

## Lesson log
### 2026-10-14 · Transactions, locking and the V2 migration
- **Did:** Temporary demo classes `TransactionDemoService` / `TransactionDemoController` (`/demo/tx/*`) to reproduce each failure. Added `V2__add_version_to_messages.sql` (`ALTER TABLE messages ADD COLUMN version BIGINT NOT NULL DEFAULT 0`), then `@Version` on `MessageEntity`, a `409 Conflict` handler for `ObjectOptimisticLockingFailureException` in `GlobalExceptionHandler`, and a controller slice test for the 409. Viewed migrations with the Flyway CLI (`flyway/flyway:12.4.0` in a throwaway container, `info`). Suite: 20 green.
- **Learned:**
  - **Atomicity:** `@Transactional` + a runtime exception after the first `save` leaves nothing (the INSERT was sent, then rolled back). Without it, the first row stays committed while the client sees a 500: partial data.
  - **Sequences are not transactional:** a rolled-back INSERT still consumed its id (ids 5, 9 skipped). Never assume gap-free ids.
  - **Default rollback rule:** rollback on `RuntimeException`/`Error`, **commit on checked exceptions**. Fix: `@Transactional(rollbackFor = Exception.class)`.
  - **Self-invocation:** `outer()` calling `this.inner()` (`@Transactional`) bypasses the proxy, so no transaction (row stayed). Annotate the entry method that outside callers use (or call through another bean).
  - **Lost update:** two overlapping transactions both read, last commit silently wins; both returned 200. `UPDATE ... where id=?` cannot notice a concurrent change.
  - **Optimistic locking:** `@Version` makes it `UPDATE ... set version=? where id=? and version=?`; 0 rows -> `ObjectOptimisticLockingFailureException`. Winner 200 (version 0 -> 1), loser conflict. Unhandled it is a 500; map it to **409**.
  - **Expand then contract:** the column was added by `V2` first; the old entity code kept working (`validate` allows extra DB columns). Only then did the entity gain `@Version`.
  - Flyway CLI `info` shows each migration with state `Success`/`Pending`/..., plus an `Undoable` column.
- **Broke / gotchas:**
  - An unhandled exception inside a controller gives a 500 in Spring's default shape (no generic `Exception` handler by design; see the error-handling lesson).
  - Predicted every outcome correctly this lesson (see "Solid so far").
  - Editor "cannot be resolved" errors appear between two-step edits (import added by a later edit); the compile result is the real check.
- **Verified by:** `psql` after every scenario; Hibernate SQL log (`update ... where id=? and version=?`); a real two-request race with `curl` in parallel (A slow, B fast) before and after `@Version`; Flyway log and CLI `info` for `V2`; `mvn test`: 20 tests, BUILD SUCCESS.

### 2026-10-14 · Persistence part 2: JPA, Hibernate and Spring Data
- **Did:** Added `spring-boot-starter-data-jpa`. Wrote `model/MessageEntity` mapped to the Flyway-built `messages` table. Had Hibernate write its Postgres DDL to a file and compared it with `V1`. Set `spring.jpa.hibernate.ddl-auto=validate`. Added `repository/MessageJpaRepository extends JpaRepository<MessageEntity, Long>` and switched `MessageService` to it (controller/DTOs untouched). Turned on `spring.jpa.show-sql` in the dev profile. Added `PUT /messages/{id}` with `@Transactional` `MessageService.rename` to show dirty checking. Updated `MessageServiceTest`. Suite: 19 green.
- **Learned:**
  - JPA = spec, Hibernate = implementation (7.4.5 here, dialect `PostgreSQLDialect` detected from the connection), Spring Data JPA = generated repository proxies. Everything under Hibernate is the JDBC we already used.
  - A Java `record` cannot be an entity (final); the entity is a separate mutable class with a no-arg constructor.
  - Hibernate-generated DDL differs from our hand-written `V1`: `String` -> **`varchar(255)`** (our `TEXT` was right; an API allowing 500 chars would fail on insert), `BIGSERIAL` -> `bigint generated by default as identity`, and the DB `DEFAULT now()` is not known to Hibernate. Generated output = starting point to review, not a migration.
  - `ddl-auto=validate` checks column existence/types, not lengths: a `TEXT` column is accepted for a `String` field. A wrong column name fails startup: `Schema validation: missing column [created_on] in table [messages]`.
  - Hibernate SQL: `insert (created_at,text)` (timestamp now set by Java), `select ... from messages me1_0` with **no `ORDER BY`** (our JdbcTemplate version sorted by id), `where id=?`. Java `Instant` has nanoseconds, Postgres `timestamp(6)` stores microseconds, so the POST response and a later GET differ in the last digits.
  - **Dirty checking:** a managed entity changed inside `@Transactional` is written as an UPDATE at commit with no `save()` call. The UPDATE sets all columns, not just the changed one (default; `@DynamicUpdate` changes it).
  - **Without `@Transactional` the change is silently lost:** the PUT returned `200` and the new text, Postgres kept the old text, no UPDATE ran.
- **Broke / gotchas:**
  - **The JPA script-generation settings (`jakarta.persistence.schema-generation.scripts.*`) in the dev profile suppressed `validate`.** A wrong column name started fine until those lines were removed (mechanism unconfirmed; effect confirmed). My first "validate passes" observation was therefore invalid and had to be redone.
  - Changing the `MessageService` constructor broke `MessageServiceTest` at test time with `Unresolved compilation problem` (an Eclipse-compiler message, not Maven's). The test `.class` had been written by something other than Maven's `javac`. Likely VS Code's Java builder, which now compiles into `target/` since the workspace window was fixed (inference). Two compilers sharing `target/` is a new risk to watch.
  - Entities have no id setter, so unit tests set the id with `ReflectionTestUtils.setField`.
  - A new Hibernate/JPA dependency needs a container restart, as before.
- **Verified by:** generated `target/generated-ddl.sql`; `validate` failing then passing; `curl` on all `/messages` endpoints; `Hibernate:` SQL lines in the log; `psql` showing the stored text after each PUT (with and without `@Transactional`); `mvn test`: 19 tests, BUILD SUCCESS.

### 2026-10-14 · Persistence part 1: Postgres, JDBC, Flyway, service layer, tests
- **Did:**
  - Added Postgres to `compose.yaml` via `add-infra` (`postgres:16-alpine`, user/db `app`/`hello_db`, healthcheck, named volume `pgdata`, host port **5433** because the host runs its own Postgres on 5432). `dev` now `depends_on` Postgres `service_healthy` and gets `SPRING_DATASOURCE_*` from env vars.
  - Raw JDBC in `repository/JdbcDemoRepository` (try-with-resources over `Connection`/`PreparedStatement`/`ResultSet`), exposed at `/db/version`.
  - `JdbcTemplate` repository `MessageRepository` (`insert ... returning`, `RowMapper`), `MessageService`, `MessageController` (`POST/GET /messages`, 201 / 400 / 404), DTOs `CreateMessageRequest` / `MessageResponse`, `MessageNotFoundException` handled in `GlobalExceptionHandler`.
  - Flyway: `V1__create_messages.sql`, replacing the table first created by hand with `psql`.
  - Tests: `MessageServiceTest` (Mockito mock repository), `MessageControllerTest` (`@WebMvcTest`, mocked service). Suite: 19 tests green.
- **Learned:**
  - App in the `dev` container reaches Postgres at `postgres:5432` (service-name DNS), **not** `localhost`. From the host it is `localhost:5433`.
  - Hikari's pool starts **lazily** on the first query (log shows `HikariPool-1 - Starting...` on `nio-8080-exec-1`), so a plain JDBC app should be able to start with a wrong password (inferred from the lazy start; not tested). Adding Flyway forces a connection **at startup**, so bad credentials or a down DB then fail the boot.
  - `JdbcTemplate` always closes connections; the leak risk is in hand-written JDBC without try-with-resources.
  - `insert ... returning` is Postgres-specific SQL.
  - Flyway: migrations are `V<version>__<description>.sql` in `db/migration`; applied once, recorded with a checksum in `flyway_schema_history`. Editing an applied file, even a comment, fails startup with `Migration checksum mismatch`. Change = new `V2`.
  - Hibernate generating the schema (`ddl-auto`) is not how real teams own the schema: no history/review, renames look like drop+add. Pattern: Flyway owns schema, Hibernate `validate`.
  - Service decides what "absent" means (`Optional` -> `MessageNotFoundException`); repository stays plain data access.
- **Broke / gotchas:**
  - **Flyway on a non-empty DB with no history table fails at startup**: `Found non-empty schema(s) "public" but no schema history table. Use baseline() or set baselineOnMigrate`, even with zero migration files. Adopting an existing DB = baseline; for a throwaway dev DB we dropped the table and let `V1` create it.
  - Host port 5432 was already taken by a native Postgres; found via `Get-NetTCPConnection`, solved with `5433:5432`.
  - A careless edit to `compose.yaml` broke the YAML once and `docker compose up` silently failed (see the configuration lesson). Validate with `docker compose config --quiet`.
  - `@SpringBootTest` tests now start Hikari and **run Flyway against the real dev database** (`postgres:5432/hello_db`). `@WebMvcTest` slices do not touch the DB. Fix later: a throwaway database (Testcontainers).
  - VS Code Java server cache is **per window**: a clean in the folder window did not fix the multi-root workspace window (see "Resolved" above). Check a window's registration at `...\workspaceStorage\<id>\redhat.java\jdt_ws\.metadata\.plugins\org.eclipse.core.resources\.projects\hello-boot\.location`.
  - After a Docker daemon restart containers show `Exited (255)`; `docker compose up -d` brought them back and the volume kept the data.
- **Verified by:** `psql` queries; `nc` from `dev` to `postgres:5432` (open) and to `localhost:5432` (refused); Hikari log lines; Flyway log and `flyway_schema_history` rows; `curl` on every `/messages` path; message still present after an app restart **and** after a Docker daemon restart; deliberate removal of `@ResponseStatus(CREATED)` failing exactly `createReturns201WithTheStoredMessage`.

### 2026-10-11 · Testing
- **Did:** Ran the generated `contextLoads` smoke test. Wrote `GreetingServiceTest` (plain unit test), `HelloControllerTest` (`@WebMvcTest` with `@MockitoBean GreetingService`, 4 tests: delegation, valid POST, blank message -> our `ErrorResponse`, wrong Content-Type -> our 415), and `GreetingPropertiesTest` (`@SpringBootTest`). Final result: 9 tests green.
- **Learned:**
  - Three levels: unit (no Spring, ms), slice (`@WebMvcTest`: web layer only), integration (`@SpringBootTest`: whole context, seconds). Many unit, some slice, few integration.
  - Constructor injection is what makes unit tests easy: `new GreetingService(new GreetingProperties("Yo", "Friend"))`, with our own values and no Spring.
  - A slice has no real service, so the controller's constructor needs a bean: `@MockitoBean`.
  - A test only has value if it can fail: removing `@Valid` made exactly one test fail (`Status expected:<400> but was:<200>`), reproducing the silent-200 bug from the validation lesson.
  - Boot 4 moved test annotations: `@WebMvcTest` is now `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest` (new `spring-boot-webmvc-test` module); `@MockitoBean` is `org.springframework.test.context.bean.override.mockito.MockitoBean`.
  - Run tests in the build container: `docker compose exec dev mvn test` (`-Dtest=ClassName` for one class).
- **Broke / gotchas:**
  - **The container's `SPRING_PROFILES_ACTIVE=dev` leaks into tests** (log: `The following 1 profile is active: "dev"`). A config test expecting base `Hello` failed with `expected: <Hello> but was: <Hi>`. Fix: pin the profile in the test with `@ActiveProfiles("test")`. Tests must not depend on where they run.
  - Predicted wrong that tests would ignore the environment's profile.
  - First slice start took ~5.4 s, not the "about a second" I first wrote; I corrected the note.
  - `docker compose exec ... sh -c '...|...'` through PowerShell mangles quotes. Use the Bash tool with `MSYS_NO_PATHCONV=1`, or pass simple args.
  - The editor still shows "non-project file" on test files, so test run/debug buttons in VS Code likely do not work yet; we run tests via Docker instead.
- **Verified by:** `mvn test` output (3 + 4 + 1 + 1 = 9 tests, BUILD SUCCESS), the deliberate `@Valid` removal and restore, the profile line in each test log, and live `curl` afterwards showing the running app was unaffected.

### 2026-10-11 · Configuration and profiles
- **Did:** Added `app.greeting.prefix` and read it with `@Value`. Replaced that with the typed, validated record `config/GreetingProperties` (`@ConfigurationProperties` + `@Validated`, registered with `@ConfigurationPropertiesScan`). Added `application-dev.properties`, activated the `dev` profile through `SPRING_PROFILES_ACTIVE` in `compose.yaml`, and tested precedence with a temporary `APP_GREETING_PREFIX` env var (since removed).
- **Learned:**
  - Precedence (high to low): command-line args, OS environment variables, profile file, base file, defaults in code. Predicted correctly that `Hey` (env var) beats `Hi` (dev profile) and `Hello` (base); confirmed live.
  - Relaxed binding: `app.greeting.default-name` (file) = `defaultName` (record field) = `APP_GREETING_DEFAULTNAME` (env var).
  - `@Value("${key}")` has no default and fails startup if missing; `${key:default}` gives one.
  - `@ConfigurationProperties` + `@Validated` fails startup with `Binding to target ... failed: Property: app.greeting.defaultName, Value: "null", Reason: must not be blank`. The whole app is down, which is the point (bad deploys fail immediately).
  - A profile file holds only the differences. `application-{profile}.properties` is ignored unless the profile is active (log: `No active profile set, falling back to ... "default"` vs `The following 1 profile is active: "dev"`).
  - A container's environment is fixed at creation: changing `environment:` needs `docker compose up -d --force-recreate dev`.
  - Secrets: supply by environment variable or secret store at deploy time, never commit them.
- **Broke / gotchas:**
  - Our watch loop only watched `.java`, so a properties-only edit was never copied to `target/classes` and never restarted the app (source said `Hi`, live said `Hello`). Fixed by also watching `src/main/**/resources/**`; now picked up in ~4 s.
  - A careless edit to `compose.yaml` removed a line break (`ports:` ended up glued to a comment), making the YAML invalid. `docker compose up` then failed silently and the old container kept running with old settings. Always run `docker compose config --quiet` after editing the file and confirm the change took effect.
  - A bad `docker compose exec ... sh -c '...|...'` quoting through PowerShell printed a misleading "none". Use `printenv NAME` for single variables.
- **Verified by:** startup failure report for the missing property; `curl /greet` in each state (Hello, Hi, Hey, Hi again); `docker compose exec dev printenv`; log lines for the active profile.

### 2026-10-11 · Request body, validation and error handling
- **Did:** Added `spring-boot-starter-validation`. Created `dto/CreateGreetingRequest` (`@NotBlank`, `@Min(1)`), `dto/ErrorResponse`, and `exception/GlobalExceptionHandler`. Added `POST /greetings`, first without `@Valid`, then with it. Finished by extending `ResponseEntityExceptionHandler` so every standard MVC error uses our format.
- **Learned:**
  - Constraint annotations only **describe** rules. Without `@Valid` on the parameter nothing runs them, and bad data reaches your method with a 200.
  - Two different failure points before your method: Jackson (broken or mismatched JSON -> `HttpMessageNotReadableException`) and Bean Validation (`MethodArgumentNotValidException`, all violations reported together).
  - `@RestControllerAdvice` only intercepts exceptions you handle. Anything else (415, 405, 406, bad path variable) keeps Spring's default shape, so the API ends up with **two error formats**.
  - `@ExceptionHandler(Exception.class)` is a trap: it would also catch 415/405 and turn client mistakes into 500. Extend `ResponseEntityExceptionHandler` instead and override `handleMethodArgumentNotValid`, `handleHttpMessageNotReadable`, `handleExceptionInternal`.
  - Do not declare your own `@ExceptionHandler` for an exception the base class already handles: ambiguous-handler error. Override the hook method.
  - Field-error order from Hibernate Validator is not guaranteed.
- **Broke / gotchas:**
  - Adding a dependency needs `docker compose restart dev` (DevTools reloads classes, not libraries). Validation jars were downloaded on that restart.
  - Boot 4 has test-companion starters (`spring-boot-starter-validation-test`); skipped until the testing lesson.
  - Predicted wrong twice (see weak spots).
  - Case `Accept: application/xml` still yields a 406 with an empty body: we cannot write our JSON error as XML.
- **Verified by:** `curl` of 8 cases (valid, blank, both rules broken, malformed JSON, wrong Content-Type, wrong method, XML Accept, bad path variable) before and after the handler change; status codes, `Allow` header and body shape compared.

### 2026-10-11 · Dependency injection and the service layer
- **Did:** Created `service/GreetingService`. Made `HelloController` take it through its constructor. Deliberately left off `@Service` first to watch startup fail, then added `@Service`. Routed `/greet` through the service.
- **Learned:**
  - A **bean** is an object the container creates and manages. Component scan registers classes marked `@Component` / `@Service` / `@Repository` / `@RestController` (the last three are specialisations with the same behaviour).
  - Constructor injection with a `final` field: the dependency comes from outside (testable with fakes) and the object cannot exist half-built. A single constructor needs no `@Autowired`.
  - Beans are singletons by default: one shared instance, not one per request.
  - Wiring is checked **eagerly at startup**. One unsatisfiable constructor aborts the entire context, so even endpoints that do not use it go down.
- **Broke / gotchas:**
  - No `@Service` on the class gave `APPLICATION FAILED TO START ... required a bean of type 'GreetingService' that could not be found`. The report names the constructor parameter and the missing type.
  - DevTools recovered by itself (~2 s) when the annotation was added; no container restart needed.
  - Predicted correctly beforehand (startup fails), then confirmed in the log.
- **Verified by:** startup failure report in `docker compose logs`; `curl` to `/hello` (no reply while down), then 200 after the fix; `/greet` returning `Hello from the service, Sri`.

### 2026-10-11 · Request input, JSON and project structure
- **Did:**
  - Added `GET /greet?name=` (`@RequestParam`, `defaultValue`), `GET /hello/{id}` (`@PathVariable int`), and `GET /greeting/{id}?name=` returning the record `Greeting` as JSON.
  - Restructured: `hello-boot` moved to `playground/hello-boot`; packages split into `controller/` and `dto/`; removed `.devcontainer/`; added the `organize-project` skill and layout rules to `CLAUDE.md`.
- **Learned:**
  - Spring resolves and converts arguments **before** your method runs. Failure means a 400 and your code never executes (missing required `@RequestParam`, or `abc` into an `int`).
  - `@RequestParam` is `required=true` by default. `defaultValue` also covers an empty value (`?name=` gives the default).
  - `{id}` in the mapping must match the parameter name, or use `@PathVariable("x")`.
  - Return type picks the `HttpMessageConverter`: `String` -> `text/plain`, a record -> Jackson -> `application/json`. `@RestController` alone does not mean JSON.
  - Content negotiation: `Accept: application/xml` with no XML converter gives **406**. `*/*` gives JSON.
  - With no controller mapping, Spring falls through to the static-resource handler, so the 404 says "No static resource ...".
  - Component scan still finds controllers in sub-packages of the main class's package.
- **Broke / gotchas:**
  - A typo mapping `/hello/{d}i` gave 404 on `/hello/42` and 500 `MissingPathVariableException` on `/hello/42i`.
  - After moving classes between packages, a stale `target/classes/.../Greeting.class` stayed behind. A stale `@RestController` class would cause duplicate-bean or ambiguous-mapping errors. Do **not** run `mvn clean`: it deletes `target/.last-build`, which silently stops the watch loop. Delete only the stale `.class`.
  - An empty `hello-boot/target/...` folder reappeared at the workspace root after the move. Probably the Java language server recreating output dirs for the old path (not fully confirmed).
  - Initializr names the package `hello_boot` for artifact `hello-boot`. Use single-word packages for real services.
  - DevTools makes error responses include the full stack trace (assumed from its "property defaults" log line, not confirmed). Never ship that.
- **Verified by:** `curl` on every endpoint (status, `Content-Type`, body) after each change; `docker compose logs` showing a restart per edit and no startup errors; `target/classes` listing after the moves.

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
- **Framework checks input before your code runs.** Predicted `null`/`200` for a missing `@RequestParam`; real answer 400 (`required=true` default). Re-test in a later quiz.
- **Content negotiation.** Predicted JSON would be returned for `Accept: application/xml`; real answer 406. Re-test in a later quiz.
- **Declared is not enforced.** Predicted 400 for a blank `@NotBlank` field without `@Valid`; real answer 200. Same family: a handler/constraint only works if it is wired in.
- **What generated schema looks like.** Predicted Hibernate maps `String` to `text`; real answer `varchar(255)`. Re-test in a later quiz.
- **A passing check can be invalid.** I reported "validate passes" while validation was not actually running (suppressed by script-generation settings). Lesson: prove a check can fail before trusting that it passed.
- **Adopting Flyway on an existing database.** Predicted Flyway would silently accept the existing schema; real answer: startup fails (`non-empty schema ... no schema history table`), even with zero migrations. Predicted the checksum-mismatch failure correctly. Re-test in a later quiz.
- **Environment leaks into tests.** Predicted tests ignore the container's `SPRING_PROFILES_ACTIVE`; real answer: the `dev` profile is active in tests unless pinned with `@ActiveProfiles`. Re-test in a later quiz.
- (Solid so far: DI/missing-bean startup failure, config precedence, "which test fails when `@Valid` is removed", Flyway checksum mismatch, dirty checking and the lost update without `@Transactional`, and every transaction scenario in the transactions lesson were predicted correctly.)
- **Which exceptions an advice covers.** Predicted a wrong `Content-Type` would use our `ErrorResponse`; real answer 415 in Spring's default shape. Re-test in a later quiz.

## Concept notes
- `request-input-and-json.md`: where request input comes from, how Spring converts it, how objects become JSON, content negotiation.
- `transactions-in-spring.md`: ACID, the `@Transactional` proxy, rollback rules, self-invocation, propagation, isolation levels, lost updates and optimistic vs pessimistic locking, with what we reproduced.
- `jpa-hibernate-and-spring-data.md`: JPA vs Hibernate vs Spring Data, entities, the persistence context and dirty checking, `ddl-auto` values, generated DDL vs Flyway, what we saw.
- `persistence-postgres-jpa-flyway.md`: why a database, the JDBC objects, `JdbcTemplate`, Flyway migrations and checksums, Postgres setup and networking, lesson order (JDBC -> JdbcTemplate -> Flyway -> JPA).
- `testing-spring-boot.md`: unit vs slice vs integration tests, MockMvc and `@MockitoBean`, pinning profiles in tests, running tests in Docker, Boot 4 package changes.
- `configuration-and-profiles.md`: where Boot reads config from and which source wins, `@Value` vs `@ConfigurationProperties`, validated config, profiles, secrets.
- `request-body-validation-and-errors.md`: `@RequestBody`, Bean Validation and `@Valid`, the two failure points, a central error handler, and how to cover every standard error.
- `dependency-injection-and-layers.md`: beans, constructor injection, how the container wires them, the controller/service/repository layers, and the startup failure when a bean is missing.
- Candidates still to write: Spring Boot auto-configuration, DevTools restart.
