# 11. ExecutorService: a ready-made thread pool

`Executors.newFixedThreadPool(3)` gives the pool built by hand in the previous chapter: a task queue and 3 reusable worker threads. Tasks are submitted, and the pool is shut down when finished.

> [!TIP]
> - **`pool.submit(task)`** puts a task on the pool's queue. A free worker runs it. The workers are named `pool-1-thread-1`, `pool-1-thread-2` and so on.
> - **Always call `pool.shutdown()`.** Without it the worker threads wait for more tasks forever and the program never ends.
> - **`pool.awaitTermination(10, TimeUnit.SECONDS)`** waits up to 10 seconds for the queued tasks to finish.
> - **`submit` hides a failing task's exception inside the `Future`.** It surfaces only when `get()` is called.

## The life of a pool

```mermaid
flowchart LR
    M[main thread]:::app -->|submit tasks| P[pool: queue and 3 workers]:::store
    M -->|shutdown, then awaitTermination| P
    classDef app   fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef store fill:#dcfce7,stroke:#16a34a,color:#14532d
```

`main` hands tasks to the pool and never starts a worker itself. `shutdown()` tells the pool to accept no more tasks. Tasks already on the queue still run.

## Example

`ExecutorService` is the pool interface, `Executors` makes pools, and `TimeUnit` is the unit for a timeout, all in `java.util.concurrent`.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ExecutorDemo {

  public static void main(String[] args) {
    int maxNumberOfThreads = 3;
    ExecutorService pool = Executors.newFixedThreadPool(maxNumberOfThreads);
    int numberOfTasks = 10;
    for (int i = 0; i < numberOfTasks; i++) {
      int taskId = i;
      pool.submit(() -> {
        System.out.println("Task " + taskId + " on " + Thread.currentThread().getName());
      });
    }
    pool.shutdown();
    try {
      pool.awaitTermination(10, TimeUnit.SECONDS);
    } catch (Exception e) {
      System.out.println("Exception while await termination");
    }
  }
}
```

Example output of one run:

```text
Task 2 on pool-1-thread-3
Task 3 on pool-1-thread-3
Task 4 on pool-1-thread-3
Task 5 on pool-1-thread-3
Task 6 on pool-1-thread-3
Task 7 on pool-1-thread-3
Task 8 on pool-1-thread-3
Task 9 on pool-1-thread-3
Task 1 on pool-1-thread-2
Task 0 on pool-1-thread-1
```

One worker ran 8 of the 10 tasks. The tasks only print a line, so they finish almost instantly, and a worker that finishes a task takes the next one off the queue before the other workers have even started.

## Longer tasks spread out

When each task also sleeps for 300 ms, as a task that does real work would, the tasks spread across the workers:

```java
      pool.submit(() -> {
        System.out.println("Task " + taskId + " on " + Thread.currentThread().getName());
        try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
      });
```

Example output, sorted by task number:

```text
Task 0 on pool-1-thread-1
Task 1 on pool-1-thread-2
Task 2 on pool-1-thread-3
Task 3 on pool-1-thread-1
Task 4 on pool-1-thread-2
Task 5 on pool-1-thread-3
Task 6 on pool-1-thread-2
Task 7 on pool-1-thread-1
Task 8 on pool-1-thread-3
Task 9 on pool-1-thread-2
done
```

The workers share the 10 tasks as 3, 4 and 3, because each task keeps its worker busy long enough for the others to take the next ones. The `done` line is printed after `awaitTermination` returns.

## Without shutdown()

Without `shutdown()` and `awaitTermination`, a program that submits 3 tasks prints:

```text
main: all tasks submitted, main ends here
Task 1 on pool-1-thread-2
Task 2 on pool-1-thread-3
Task 0 on pool-1-thread-1
```

All three tasks finish and `main` ends, yet the process keeps running. The three workers are still alive, waiting on the queue for more tasks.

> [!WARNING]
> **A pool that is never shut down keeps the program alive.** Call `shutdown()` when done submitting, then `awaitTermination` to wait for the tasks.

| Call | What it does |
|---|---|
| `Executors.newFixedThreadPool(3)` | Makes a pool with 3 worker threads and a task queue. The factory methods are in `Executors`, with an `s`. |
| `pool.submit(task)` | Queues the task for a worker |
| `pool.shutdown()` | Accepts no new tasks. Tasks already queued still run. It returns at once. |
| `pool.awaitTermination(10, TimeUnit.SECONDS)` | Waits up to 10 seconds for the queued tasks to finish |

## Getting a result back: Callable and Future

A `Runnable` returns nothing. A **`Callable`** is a task that returns a value and may throw a checked exception. When a lambda that returns a value is passed to `submit`, the pool treats it as a `Callable` and returns a **`Future`**: a handle for a result that is not ready yet. `future.get()` waits until the task has finished and returns its result.

Three tasks each sleep for 500 ms and return the square of a number:

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class FutureDemo {

  public static void main(String[] args) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(3);
    List<Future<Integer>> futures = new ArrayList<>();

    long begin = System.currentTimeMillis();
    for (int i = 1; i <= 3; i++) {
      int n = i;
      // the lambda returns a value, so submit treats it as a Callable and gives back a Future
      Future<Integer> future = pool.submit(() -> {
        Thread.sleep(500);
        return n * n;
      });
      futures.add(future);
    }
    System.out.println("all 3 submitted after " + (System.currentTimeMillis() - begin) + " ms");

    for (Future<Integer> future : futures) {
      int result = future.get();            // waits here until this task has finished
      System.out.println("result " + result + " after " + (System.currentTimeMillis() - begin) + " ms");
    }
    System.out.println("total " + (System.currentTimeMillis() - begin) + " ms");
    pool.shutdown();
  }
}
```

Example output:

```text
all 3 submitted after 1 ms
result 1 after 510 ms
result 4 after 513 ms
result 9 after 513 ms
total 513 ms
```

| Line | What it shows |
|---|---|
| `all 3 submitted after 1 ms` | `submit` returns at once. `main` does not wait for any task. |
| `result 1 after 510 ms` | The first `get()` waits until the first task finishes, about 500 ms. |
| `result 4` and `result 9` at 513 ms | Those tasks had already finished, so `get()` returned straight away. |
| `total 513 ms` | The three tasks ran at the same time. One after another they would take about 1500 ms. |

> [!WARNING]
> **`get()` blocks the thread that calls it.** Call it only after all the work has been submitted. Calling `get()` right after each `submit` runs the tasks one after another and loses the speed-up.

## When a task throws

Two tasks throw `IllegalStateException("boom")`. The first one's `Future` is ignored, and the second one's `get()` is called inside a `try` that catches `ExecutionException`.

```java
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class FailingTask {

  public static void main(String[] args) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(1);

    // case 1: the task throws, and the Future is ignored
    pool.submit(() -> {
      throw new IllegalStateException("boom");
    });
    System.out.println("case 1: submitted");

    Thread.sleep(500);                       // give the task time to run and fail

    // case 2: the task throws, and the Future is kept and get() is called
    Future<?> future = pool.submit(() -> {
      throw new IllegalStateException("boom");
    });
    try {
      future.get();
      System.out.println("case 2: get() returned normally");
    } catch (ExecutionException e) {
      System.out.println("case 2: get() threw ExecutionException, cause = " + e.getCause());
    }

    pool.shutdown();
  }
}
```

Output:

```text
case 1: submitted
case 2: get() threw ExecutionException, cause = java.lang.IllegalStateException: boom
```

In case 1 nothing at all is printed about the failure: no stack trace and no error. `submit` catches the exception and stores it inside the `Future`. In case 2, `get()` re-throws it wrapped in an **`ExecutionException`**, and `e.getCause()` is the real exception.

## execute() behaves differently

The same failing task run with `pool.execute(...)` instead of `submit(...)` prints:

```text
Exception in thread "pool-1-thread-1" java.lang.IllegalStateException: boom
	at ExecuteFails.lambda$main$0(ExecuteFails.java:8)
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
	at java.base/java.lang.Thread.run(Thread.java:840)
main: still running after execute()
```

`execute` has no `Future`, so the exception reaches the worker thread's uncaught-exception handler and the stack trace is printed, as with a plain `Thread`. `main` carries on.

| Call | Returns | A task that throws |
|---|---|---|
| `pool.submit(task)` | a `Future` | The exception is stored in the `Future`. Nothing is printed unless `get()` is called. |
| `pool.execute(task)` | nothing | The stack trace is printed on the console |

> [!WARNING]
> **A failure inside a `submit` task is silent unless `get()` is called.** If the `Future` is never looked at, the work failed and nothing says so. Either call `get()` and handle `ExecutionException`, or catch exceptions inside the task and log them.

## Interview questions

<details>
<summary>main submits 3 tasks, prints "main ends here" and every task has finished, but the process keeps running. Why?</summary>

The pool was never shut down. Its 3 worker threads stay alive waiting on the queue for more tasks, so the JVM cannot exit. Call `shutdown()` after the last `submit`.
</details>

<details>
<summary>10 quick tasks are submitted to a pool of 3 and one thread ran 8 of them. Is the pool broken?</summary>

No. A worker that finishes a quick task takes the next one before the other workers have started, so one worker can end up with most of them. With tasks that take longer, they spread more evenly. Do not rely on an even split of short tasks.
</details>

<details>
<summary>What is the difference between shutdown() and awaitTermination()?</summary>

`shutdown()` returns at once and only tells the pool to accept no new tasks. `awaitTermination(10, TimeUnit.SECONDS)` blocks the caller for up to 10 seconds, until the queued tasks have finished or the time runs out. Normally `shutdown()` is called first and then `awaitTermination`.
</details>

<details>
<summary>Three tasks each take 500 ms and each returns a value. All are submitted, then get() is called on each Future. How long does the whole thing take?</summary>

About 500 ms, not 1500 ms. `submit` returns at once and the three tasks run at the same time on three workers. The first `get()` waits about 500 ms, and the other two results are already there.
</details>

<details>
<summary>What does submit() return when the lambda returns a value, and what does get() do?</summary>

A `Future`, a handle for a result that is not ready yet. `get()` blocks the calling thread until the task has finished and then returns the result. If the result is already there, it returns at once.
</details>

<details>
<summary>A task submitted with pool.submit() throws an exception, but nothing appears in the logs and the program carries on. Where did the exception go, and how is it seen?</summary>

`submit` catches it and stores it in the returned `Future`. Calling `get()` re-throws it wrapped in an `ExecutionException`, and `getCause()` returns the real exception. An ignored `Future` produces no output at all.
</details>

<details>
<summary>The same failing task is run with execute() instead of submit(). What is different?</summary>

`execute` returns no `Future`, so the exception reaches the worker thread's uncaught-exception handler and the stack trace is printed to the console as `Exception in thread "pool-1-thread-1" ...`. `main` keeps running. With `submit` the same failure is silent.
</details>

## Key takeaways

| Remember | Because |
|---|---|
| A fixed pool is a queue and reusable workers | It is the hand-built pool as a ready-made class |
| `shutdown()` is not optional | Without it the idle workers keep the program alive |
| Worker names are `pool-1-thread-N` | The default thread factory names them that way |
| Short tasks do not spread evenly | One free worker can take most of them |
| `submit` of a value-returning task gives a `Future` | `get()` waits for the result |
| Submit everything first, then call `get()` | Three 500 ms tasks take about 500 ms in total, not 1500 ms |
| `submit` hides a task's exception in the `Future` | Nothing prints, and `get()` throws `ExecutionException` |
| `execute` prints the stack trace | There is no `Future`, so the worker's handler reports it |

**Related:** [Concurrency handbook](/notebook/concurrency/overview) · **Previous:** [A thread pool from scratch](/notebook/concurrency/05-executors-and-async/10-thread-pool-from-scratch)
