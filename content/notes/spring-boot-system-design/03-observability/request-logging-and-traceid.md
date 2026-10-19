# 2. Request logging and traceId

## Goal

Find every log line of **one** request, without the startup noise and without other requests mixed in.

## One line per request

A servlet filter writes a single line through a dedicated logger named `http`:

```java
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("http");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(request, response);
        }
        finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            String query = request.getQueryString() == null ? "" : "?" + request.getQueryString();
            log.info("{} {}{} -> {} ({} ms)", request.getMethod(), request.getRequestURI(), query,
                    response.getStatus(), ms);
        }
    }
}
```

`OncePerRequestFilter` guarantees one execution per request even with forwards. The log happens in `finally`, so the status and duration are known and it is written even when the request failed.

## The traceId

Two dependencies add tracing *(coordinates taken from Spring Initializr for Boot 4.1.1)*:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-micrometer-tracing-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
```

```properties
# application-dev.properties
management.tracing.sampling.probability=1.0
```

For each request, Micrometer Tracing creates a trace context and puts `traceId` and `spanId` into the logging **MDC** (a per-thread map). Boot's log pattern then prints them as `[traceId-spanId]`. Real output *(verified)*:

```text
INFO 154 --- [hello-boot] [nio-8080-exec-2] [6ad34a82d9da13e3df4d1d56fccd1530-df4d1d56fccd1530] http : GET /messages/1 -> 200 (10 ms)
```

For a failing `POST`, the exception resolver's `WARN` and our `http` line carried the **same** `traceId`, so the two are linked.

> [!NOTE]
> The filter's log line has the `traceId` because it runs **inside** the tracing observation, so the MDC is still populated when `finally` executes.

> [!WARNING]
> The editor flags `management.tracing.sampling.probability` as an unknown property in Boot 4. The `traceId` appears in the logs regardless, but I did not confirm that this property takes effect, so treat it as unverified.

## SQL carries the traceId too

`spring.jpa.show-sql=true` writes straight to stdout and **bypasses the logging framework**, so those lines had no `traceId`. We switched to the logger:

```properties
logging.level.org.hibernate.SQL=DEBUG
```

A `GET /messages/1` then produced two lines with the same trace *(verified)*: the `select` from `org.hibernate.SQL` and the `http` line.

## Where the remaining noise comes from

Most clutter is not from requests. Every file save makes Spring DevTools restart the application context, which reprints the whole startup block (banner, Hikari, Flyway, the Hibernate "Database info" block). Earlier we also tried `logging.level.web=DEBUG`; it gave per-request detail (`Mapped to ...`) but was too loud, so the dedicated `http` logger replaced it.

## Not done

The client does not receive the `traceId`, so you read it from a log line. A response header such as `X-Trace-Id` would let `curl -i` show it directly.

## Interview questions

**What is MDC?**
Mapped Diagnostic Context: a per-thread key/value map that the logging framework can print in every line. Tracing libraries put the `traceId` there. It is thread-bound, so you must copy it when work moves to another thread (async, executors).

**How does a trace continue across services?**
The caller sends the trace context in request headers (W3C `traceparent` in recent Boot, B3 for older setups), and the next service continues the same trace with a new span. Standard behaviour, not tested here.

**What is sampling?**
Only a fraction of traces are recorded and exported, to limit cost. The sampling probability is configurable; dev uses 100%.

**Filter or interceptor for request logging?**
A servlet filter sees every request, including ones that never reach a controller (404s, security rejections), and can wrap the whole call to measure time and status.

**Why not log request bodies by default?**
They can contain secrets and personal data and make logs large. Log metadata (method, path, status, duration) and add detail deliberately.
