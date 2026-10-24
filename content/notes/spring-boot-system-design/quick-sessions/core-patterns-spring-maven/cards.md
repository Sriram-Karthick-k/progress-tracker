# 2. Recall cards: Core patterns with Spring Boot and Maven

### Card 1: Spring AOP proxies

**Q:** Your controller calls `service.savePair()`. Which object actually runs first, who created it, and why does `this.inner()` inside the same class skip the transaction?

**A:** A generated CGLIB subclass (`TransactionDemoService$$SpringCGLIB$$0`). A `BeanPostProcessor` (`AbstractAutoProxyCreator`, `wrapIfNecessary` then `createProxy`) swaps it in after the bean is initialised. It runs the advisor chain (`TransactionInterceptor`, your aspect) and each link calls `proceed()` to reach the next, ending at the real method.

**Why:** The advice lives in the wrapper, not in your class. `this.inner()` is a plain call on the real object.

**Trap:** `private` and `final` methods and self-invocation bypass the proxy. Interfaces get a JDK dynamic proxy, classes get CGLIB *(both seen in the startup log)*.

**Hook:** The proxy is a bouncer at the door; a call made from inside the room never passes him.

### Card 2: Aspects and exceptions

**Q:** Your `@Around` aspect catches the exception and logs it. The endpoint returns 200 and a row is committed that should have rolled back. Why?

**A:** The aspect sits inside the transaction link. It swallowed the exception, so `TransactionInterceptor` saw a normal return and committed. Fix: `try/finally` (or rethrow).

**Why:** Exceptions travelling back up the chain are how outer links learn the call failed *(verified: row 15 committed, HTTP 200)*.

**Trap:** The same happens with a `catch` that does not rethrow inside a `@Transactional` method. Annotation order on the method does not change the advisor order; `@Order` does (from knowledge, not tested).

**Hook:** 200 OK plus half-saved data means someone swallowed the exception inside the transaction.

### Card 3: Events and AFTER_COMMIT

**Q:** How does Spring know `plainListener` runs when `savePair` calls `publishEvent`, and why use `@TransactionalEventListener(AFTER_COMMIT)` instead?

**A:** At startup `EventListenerMethodProcessor` wraps each `@EventListener` method in an `ApplicationListenerMethodAdapter` keyed by its parameter type. `publishEvent` makes the multicaster call every listener that supports that type, synchronously, inside the transaction. `AFTER_COMMIT` waits for the commit and drops the event on rollback.

**Why:** The plain listener fired for a row that was then rolled back *(verified: `evt-fail`)*.

**Trap:** With no active transaction the listener is skipped unless `fallbackExecution = true`. A crash between commit and listener loses the event, which is the gap the outbox closes.

**Hook:** Plain listener speaks now; after-commit listener speaks only once the deal is signed.

### Card 4: Effective POM and BOM

**Q:** Your pom lists `spring-boot-starter-webmvc` with no version, yet the build uses 4.1.1. Where does it come from, and how do you override a managed version?

**A:** Maven merges the super-POM, `spring-boot-starter-parent`, `spring-boot-dependencies` (the BOM) and your pom into the effective POM. The BOM's `<dependencyManagement>` is a lookup table that fills in missing versions and scopes, and only `<dependencies>` puts anything on the classpath. Override with a version on the dependency, or by setting the BOM's property (`postgresql.version`).

**Why:** A managed value is used only when the dependency omits it, and a managed version also beats the version a transitive dependency asks for *(verified: slf4j-api 2.0.17 became 2.0.18)*. An explicit version on the dependency beats the table *(verified with the PostgreSQL driver)*.

**Trap:** A version pinned on the dependency is invisible and goes stale after a Boot upgrade. The property override works through the parent, not through a BOM imported with `scope import` (from knowledge, not tested).

**Hook:** `dependencyManagement` is the price list, `<dependencies>` is the shopping cart.

### Card 5: Lifecycle, phases and goals

**Q:** What is the difference between a lifecycle phase and a plugin goal, and why does `mvn package` run the compiler when you never asked for it?

**A:** A phase is just a name in an ordered list. Goals such as `compiler:compile` are bound to phases and do the actual work. Running a phase runs every earlier phase in its lifecycle, so `package` triggers compile and test first.

**Why:** The `mvn package` log showed 7 goals in order, ending with `jar:jar` and then `spring-boot:repackage` *(verified)*.

**Trap:** `clean` and `site` are separate lifecycles, so `mvn package` never cleans. `-DskipTests` skips only the `surefire:test` goal.

**Hook:** A phase is a train station and the goals are the jobs done there.

### Card 6: Fat jar and scopes

**Q:** Why can `java -jar hello-boot.jar` run an app whose libraries are jars inside the jar, and which of your dependencies are left out?

**A:** `repackage` replaces the thin jar (kept as `.original`, 33 KB against 54 MB) with a jar whose `Main-Class` is `JarLauncher` and `Start-Class` is `HelloBootApplication`. Your classes sit in `BOOT-INF/classes` and 85 jars in `BOOT-INF/lib`. Compile and runtime scopes go in. Test scope and devtools do not *(verified)*.

**Why:** The JVM cannot load classes from jars nested inside a jar, so Boot ships a launcher with its own classloader (from knowledge).

**Trap:** Starter jars are empty (manifest only) and are not in the fat jar, because the real libraries arrive transitively *(verified)*.

**Hook:** The jar is a shipping container with its own forklift.

### Card 7: The race and the arbiter

**Q:** Two identical POSTs with the same `Idempotency-Key` arrive at the same instant. Walk through what happens and who decides the winner.

**A:** Both find no stored key, both save a message, and both call `insertIfAbsent`. The unique index on the key lets exactly one insert succeed (returns 1). The others get 0, throw `RequestInFlightException`, return 409, and their transaction rolls back with their message. The client retries and gets a replay.

**Why:** "Check, then insert" is a race, and only a unique constraint is atomic. With 8 parallel requests we got 1 × 201, 7 × 409 and exactly one row *(verified, after forcing the overlap with a pause)*.

**Trap:** The key must be claimed in the same transaction as the work. Otherwise a crash leaves a key without a message, or a message without a key.

**Hook:** The database is the doorman with one guest list.

### Card 8: Replay, reuse, in flight

**Q:** What should the server answer for the same key when (a) the body is the same, (b) the body is different, (c) the first request is still running?

**A:** (a) Replay the stored result: 201 with the same message id. (b) Reject with 422, because the stored request hash differs. (c) 409, retry shortly *(all three verified)*.

**Why:** The request hash is what tells a retry from a client mistake.

**Trap:** Without the hash, a reused key silently returns the wrong result. The replay is rebuilt from the database, so even `createdAt` precision can differ from the first response.

**Hook:** Same receipt number and same order is a reprint. Same number and a different order is a mistake.

### Card 9: ON CONFLICT versus catching the exception

**Q:** Why does the repository use `INSERT ... ON CONFLICT DO NOTHING` and not `save()` plus catching `DataIntegrityViolationException`?

**A:** In Postgres a failed statement aborts the whole transaction (`current transaction is aborted, commands ignored until end of transaction block`), so after catching the exception you cannot even query. `ON CONFLICT DO NOTHING` answers `INSERT 0 1` or `INSERT 0 0` without an error *(verified in psql)*.

**Why:** The returned row count (1 or 0) is the signal, so no exception is needed.

**Trap:** `save()` on an entity with an assigned id does a merge, which would silently overwrite the winner's row (from knowledge, not tested).

**Hook:** In Postgres an error poisons the transaction. `ON CONFLICT` is a polite "no".

### Card 10: Why the outbox row must share the transaction

**Q:** `create` saves a message and then an outbox row. What goes wrong without `@Transactional` on `create`, and why does one annotation fix it?

**A:** `repository.save` and `outbox.save` each commit in their own small transaction. A failure between them leaves a committed message with no event. With `@Transactional` the proxy opens one transaction, both saves join it, and an exception rolls both back.

**Why:** Without the annotation, `boom-1` returned 500 with message 39 committed and 0 outbox rows. With it, `boom-2` left no row at all *(both verified)*.

**Trap:** It is the dual-write problem again, now inside one database. The `AFTER_COMMIT` listener version lost the event silently with HTTP 200 *(verified)*.

**Hook:** Two receipts stapled together: both or neither.

### Card 11: At-least-once and the relay

**Q:** The relay publishes an event and then marks it published. The process dies between the two. What happens on restart, and why not mark first?

**A:** The mark is lost with the rolled-back transaction, so the next tick publishes the same event again (event 4 appeared twice, 5 s apart *(verified)*). Marking first would lose the event if the crash came before publishing. The outbox deliberately chooses duplicates over loss.

**Why:** The relay's batch is one transaction, so a crash re-publishes the whole batch (from knowledge).

**Trap:** Consumers must tolerate duplicates. The event id is the natural idempotency key, with the same unique-constraint trick as the request keys.

**Hook:** Better to say it twice than never.

### Card 12: Kafka partitions, offsets, groups

**Q:** Three messages with keys `a`, `b`, `a` are produced to a topic with 3 partitions. Where do they land, and what do offset and consumer group mean?

**A:** The key is hashed to a partition: both `a` records landed in partition 1 at offsets 0 and 1, and `b` in partition 2 at offset 0. Order is guaranteed only within a partition. An offset is a position inside one partition. A consumer group splits the partitions among its consumers, and each partition has one committed offset per group.

**Why:** `kafka-consumer-groups --describe` showed one consumer owning all 3 partitions, with `CURRENT-OFFSET` equal to `LOG-END-OFFSET` and lag 0 *(verified)*.

**Trap:** `KafkaTemplate.send` is asynchronous, so the relay must wait for the acknowledgement before marking the row. `auto-offset-reset` only applies to a group with no committed offset.

**Hook:** A partition is a queue lane, the key picks the lane, the group is the staff covering the lanes.

## Interview questions

- Why does `@Transactional` not work on a `private` method or on a self-invoked method?
- How does Spring AOP create a proxy, and when is it CGLIB versus a JDK dynamic proxy?
- A `@TransactionalEventListener` never fires. What are the likely causes?
- A pom dependency has no version. Where does Maven get it, and how do you override it safely?
- Explain lifecycle phases versus plugin goals, and what `mvn install` actually runs.
- Two libraries ask for different versions of the same dependency. Which one wins?
- A client retries a payment request after a timeout. How do you make sure it is charged once, even if two retries arrive together?
- Same idempotency key, different request body: what do you return and why?
- Why is "check if the key exists, then insert" not enough on its own?
- You save a row and publish an event to Kafka. How do you guarantee neither is lost, and what delivery guarantee do you get?
- Why does the order of "publish" and "mark published" in an outbox relay matter?
- Two orders for the same customer must be processed in order. How do you choose the Kafka key, and what breaks if you change the partition count?

**Related:** [7. AOP aspects and transactional events](/notebook/spring-boot-system-design/01-spring-boot-basics/aop-aspects-and-transactional-events) · [Plan](/notebook/spring-boot-system-design/quick-sessions/core-patterns-spring-maven/plan)
