# 04. volatile: making a change visible to other threads

Locking fixed the lost updates. This chapter is about a different bug: a thread may never see a change that another thread made. `volatile` fixes that for a field.

> [!TIP]
> - **Visibility problem:** one thread writes a field, and another thread keeps using its old value. In the experiment the worker never noticed `stop = true`.
> - **`volatile` on the field** makes every read see the latest write from any thread. With it the worker stopped.
> - **This is not the lost-update bug.** Here nothing was lost: one thread simply never saw the new value.
> - **`volatile` does not fix lost updates.** A `volatile` counter with `counter++` was wrong in 10 of 10 runs.

## What goes wrong

```mermaid
sequenceDiagram
    autonumber
    participant W as worker thread
    participant S as field stop
    participant M as main thread
    W->>S: read stop, gets false
    M->>S: write stop = true
    W->>W: keeps looping on its old value
    Note over W,S: with volatile, every read sees the latest write
```

The worker read `false` once and never asked again. `main` changed the field, but nothing forced the worker to look at the new value.

## The experiment

`src/lab/shared/Visibility.java`, written by you. The worker loops until `stop` becomes true, and `main` sets it after one second. `join(3000)` waits at most 3 seconds for the worker, and `System.exit(0)` ends the whole program even if the worker is still looping. This is the version with `volatile`:

```java
public class Visibility {
  static volatile boolean stop = false;

  public static void main(String args[]) throws Exception {
    Thread t = new Thread(() -> {
      int loops = 0;
      while (!stop) {
        loops += 1;
      }
      System.out.println("worker: saw stop");
    });
    t.start();
    Thread.sleep(1000);
    stop = true;
    System.out.println("main: set stop = " + stop);
    t.join(3000);
    System.exit(0);
  }
}
```

| Version | What was printed | Time | Runs |
|---|---|---|---|
| `static boolean stop` (no `volatile`) | only `main: set stop = true` | 4.6 s | 2 of 2 |
| `static volatile boolean stop` | `worker: saw stop`, then `main: set stop = true` | about 1.5 s | 3 of 3 |

All runs *(verified)*. Without `volatile` the worker never printed, and the 4.6 seconds are 1 second of sleep, 3 seconds waiting in `join(3000)`, and the JVM starting up. With `volatile` the worker saw the change as soon as `main` made it, so the program took only the 1 second of sleep plus startup. You saw the same difference on your own machine.

## Why it happens

A thread does not have to re-read a field from main memory every time. It may keep a copy in a CPU cache or a register, and the compiler may read the field once before a loop and reuse the value. Java promises that one thread sees another's write only when something forces it, such as `volatile` or a lock. I did not inspect the compiled code, so the exact cause in this run is the likely one, not a confirmed one.

| Word | Meaning |
|---|---|
| Visibility | Whether a change made by one thread can be seen by another thread |
| `volatile` | A field marker: every read sees the latest write, and writes are not kept back in a thread's private copy |

> [!WARNING]
> **A missing `volatile` fails silently.** Nothing crashed in the first version. The program just waited, and it would have waited forever without `System.exit(0)`. The same code can pass on one machine and hang on another.

## volatile does not make counter++ atomic

`VolatileCounter.java`, written by you: the first racy counter, with one change, `volatile` on the field. Your file also had an unused line `SafeCounter sc = new SafeCounter();`. It is left out here because it stops the file from compiling on its own.

```java
public class VolatileCounter {
  static volatile int counter = 0;
  public static void main(String args[]) throws Exception{
    int numberOfThreads = 2, maxCounter = 1_00_000;
    Thread[] t = new Thread[2];
    for(int i=0;i<numberOfThreads;i++){
      t[i] = new Thread(()->{
        for(int j=0;j<maxCounter;j++){
          counter+=1;
        }
      });
      t[i].start();
    }
    for(int i=0;i<numberOfThreads;i++){
      t[i].join();
    }
    System.out.print(counter);
  }
}
```

Ten runs, one result per line *(verified)*:

```text
151703
123591
119439
137142
144378
154747
136201
122986
121476
123108
```

All ten are wrong, and the right answer is 200000. `volatile` guarantees that a read sees the latest write, but `counter += 1` is still three steps: read, add, write. Two threads can read the same value before either writes, and one update is lost. Visibility does not turn the three steps into one.

| Tool | Other threads see the change | `counter++` is safe |
|---|---|---|
| Plain field | No guarantee | No |
| `volatile` | Yes | No, 10 of 10 runs wrong |
| `synchronized` | Yes (Java rule, not run) | Yes, 10 of 10 runs right |

Use `volatile` for a flag that one thread writes and others read, where the new value does not depend on the old one, like `stop`. A step that reads and then changes the value needs a lock or an atomic class.

## Where else this applies

`synchronized` also gives visibility: what a thread wrote before leaving a synchronized block is seen by the next thread that takes the same lock. That is the Java memory model rule, and I did not run it here. It is why `get()` in `SafeCounter` is `synchronized` too: without it, a reader is not guaranteed to see the latest count.

## Interview questions

<details>
<summary>A worker loops on while (!stop) and main sets stop = true after a second, but the worker never ends. What is the bug and the smallest fix?</summary>

It is a visibility bug: the worker keeps using an old value of `stop`, and Java does not promise it will see `main`'s write. Declaring the field `volatile` fixes it. In the experiment the worker never stopped in 2 of 2 runs without `volatile`, and stopped in 3 of 3 runs with it.
</details>

<details>
<summary>In one program the counter was wrong because updates were lost, and in another the worker never stopped. Which problem is each?</summary>

The counter is the lost-update (atomicity) problem: two threads read the same value and one write overwrote the other, so the answer was wrong. The worker is the visibility problem: nothing was lost, but one thread never saw the other's write.
</details>

<details>
<summary>SafeCounter has synchronized increment() and synchronized get(). A teammate removes synchronized from get() because reading an int is harmless. What can go wrong?</summary>

The reader may see an old value, because a read without the lock is not guaranteed to see the latest write. The same visibility problem as the stop flag. The fix is to keep `get()` synchronized. I did not run this case.
</details>

<details>
<summary>A teammate makes the counter field volatile and removes synchronized from increment(), saying volatile makes it thread-safe. Is that right?</summary>

No. `volatile` gives visibility but not atomicity, and `counter++` is still read, add, write. In the experiment a `volatile` counter incremented by two threads was wrong in 10 of 10 runs (between 119439 and 154747 instead of 200000). Keep the lock, or use an atomic class.
</details>

## Key takeaways

| Remember | Because |
|---|---|
| Another thread may never see your write | The worker never noticed `stop = true` |
| `volatile` makes reads see the latest write | With it the worker stopped in 3 of 3 runs |
| Visibility and lost updates are different bugs | Nothing was lost in the flag example |
| A missing `volatile` hangs quietly | No error, just a loop that never ends |
| `volatile` does not make `counter++` safe | A volatile counter was wrong in 10 of 10 runs |

**Related:** [Concurrency handbook](/notebook/concurrency/overview) · **Previous:** [synchronized](/notebook/concurrency/02-shared-state/03-synchronized)
