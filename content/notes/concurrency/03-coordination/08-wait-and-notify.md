# 08. wait and notify: a thread waits for a signal

Locks stop threads from overlapping. `wait()` and `notify()` do something else: they let one thread sleep until another thread says "something changed".

> [!TIP]
> - **`lock.wait()`** releases the lock and puts the thread to sleep until another thread calls **`lock.notify()`** on the same object. Both calls go inside `synchronized (lock)`.
> - **Check the condition in a `while` loop,** and change the condition before you call `notify()`.
> - **Do not wait for the notified thread while you still hold the lock.** A `join()` inside the `synchronized` block hung the program, even though `ready` was already `volatile`.

## What happens, step by step

```mermaid
sequenceDiagram
    autonumber
    participant W as waiter thread
    participant L as the lock
    participant M as main thread
    W->>L: enter synchronized, takes the lock
    W->>L: ready is false, wait() releases the lock and sleeps
    M->>L: enter synchronized, the lock is free
    M->>L: ready = true, notify(), leave and release the lock
    L-->>W: wakes up, takes the lock again
    W->>W: ready is true, prints waiter got signal
```

The waiter gives the lock away when it calls `wait()`, which is what lets `main` get in. After `notify()` the waiter does not continue at once: it must take the lock again first, and that only works once `main` has left the block.

## The experiment

`src/lab/shared/WaitNotifyDemo.java`, written by you. The waiter waits until `ready` is true. After one second `main` sets `ready` and notifies.

```java
public class WaitNotifyDemo {
  static final Object lock = new Object();
  static volatile boolean ready = false;

  public static void main(String args[]) throws Exception {
    Thread waiter = new Thread(() -> {
      try {
        synchronized (lock) {
          while (!ready) {
            lock.wait();
          }
          System.out.println("waiter got signal");
        }
      } catch (Exception e) {
        System.out.println(e.getMessage());
      }
    });
    waiter.start();
    Thread.sleep(1000);
    synchronized (lock) {
      ready = true;
      lock.notify();
    }
    waiter.join();                      // outside the synchronized block, so main no longer holds the lock
    System.out.println("Main: done");
  }
}
```

Output, the same in 3 of 3 runs *(verified)*:

```text
waiter got signal
Main: done
```

## The hang: join() inside the synchronized block

The first version of the file had `waiter.join()` and the final print inside the `synchronized (lock)` block:

```java
    synchronized (lock) {
      ready = true;
      lock.notify();
      waiter.join();          // main still holds the lock here
      System.out.println("Main: done");
    }
```

It never finished: I ran it with a 5-second limit and it was still running *(verified)*, with `ready` already `volatile`, so it was not a visibility problem. What happened:

1. `main` set `ready` and called `notify()`, which woke the waiter.
2. `wait()` can only return after the thread has taken the lock again. `main` still held the lock.
3. `main` was in `join()`, waiting for the waiter to finish.
4. The waiter was waiting for the lock that `main` holds, and `main` was waiting for the waiter. This is the same circular wait as in the deadlock chapter.

Moving `join()` after the block fixed it, as in the code above.

## A one-slot buffer: producer and consumer

The classic use of `wait()` and `notify()` is a producer that hands items to a consumer through a shared buffer. `Slot` holds one item: `put` waits while the slot is full, and `take` waits while it is empty. Each one calls `notifyAll()` after it changes the slot. Inside a `synchronized` method the lock is `this`, so `wait()` and `notifyAll()` need no prefix. `notifyAll()` wakes every waiting thread, which matters because producers and consumers wait on the same lock for different conditions.

`src/lab/shared/SlotDemo.java`: `Slot` is yours, and the `main` method was written for it.

```java
public class SlotDemo {

  public static void main(String args[]) throws Exception {
    Slot slot = new Slot();

    Thread producer = new Thread(() -> {
      try {
        for (int i = 1; i <= 5; i++) {
          slot.put(i);
          System.out.println("produced " + i);
        }
      } catch (Exception e) {
        System.out.println("producer failed: " + e);
      }
    });

    Thread consumer = new Thread(() -> {
      try {
        for (int i = 1; i <= 5; i++) {
          int v = slot.take();
          System.out.println("consumed " + v);
        }
      } catch (Exception e) {
        System.out.println("consumer failed: " + e);
      }
    });

    producer.start();
    consumer.start();
    producer.join();
    consumer.join();
    System.out.println("done");
  }
}
class Slot{
  private Integer value = null;
  public synchronized void put(int v) throws Exception{
    while (value!=null) {
      wait();
    }
    value = v;
    notifyAll();
  }
  synchronized int take() throws Exception{
    while (value==null) {
      wait();
    }
    int taken = value;
    value = null;
    notifyAll();
    return taken;
  }
}
```

Three runs, with the lines joined by `|` *(verified)*:

```text
produced 1|produced 2|consumed 1|consumed 2|produced 3|consumed 3|produced 4|produced 5|consumed 4|consumed 5|done
consumed 1|produced 1|produced 2|produced 3|consumed 2|produced 4|consumed 3|consumed 4|produced 5|consumed 5|done
consumed 1|produced 1|produced 2|produced 3|consumed 2|produced 4|consumed 3|consumed 4|consumed 5|produced 5|done
```

The consumer received 1, 2, 3, 4, 5 in order in every run, and the program finished. The printed lines look shuffled because each `println` runs after `put` or `take` has returned, outside the lock, so a thread can print late. The slot itself only ever holds one item, so every `put` had to wait for the previous `take`.

Two bugs in the first version of `Slot` were fixed before it ran:

| Bug | Effect | Fix |
|---|---|---|
| `put` was declared `int` but returned nothing | The file did not compile | Declare it `void` |
| `take` set `value = null` and then returned `value` | It would always return `null`, which crashes when unboxed to `int` | Copy the value to a local first: `int taken = value;` |

## The rules

| Rule | Why |
|---|---|
| Call `wait()` and `notify()` inside `synchronized` on the same object | Otherwise they throw `IllegalMonitorStateException` (documented, not run here) |
| `wait()` releases the lock | `main` entered the same synchronized block while the waiter was inside it, and the program finished |
| A woken thread must take the lock again before it continues | It cannot run while the notifier still holds the lock, as the hang showed |
| Use `while`, not `if`, around `wait()` | The thread re-checks the condition after waking, and a wake-up can happen without a `notify()` (documented, not run here) |
| `notify()` wakes one waiting thread, `notifyAll()` wakes all of them | Documented, not run here |

> [!WARNING]
> **Never block while holding the lock a woken thread needs.** Calling `join()`, or any call that waits for the thread you just notified, inside the `synchronized` block hangs the program quietly.

## Interview questions

<details>
<summary>A waiter thread never continues after main calls notify(), although the flag is volatile and already true. main calls waiter.join() inside the synchronized block that sets the flag. Why does it hang?</summary>

After `notify()` the waiter has to take the lock again before `wait()` returns, but `main` still holds it while it sits in `join()`. `main` waits for the waiter and the waiter waits for the lock, so neither moves. It is not a visibility problem: `ready` was already `volatile`. The fix is to leave the `synchronized` block before calling `join()`, and the program then printed both lines in 3 of 3 runs.
</details>

<details>
<summary>The waiter is inside synchronized (lock) when main also enters synchronized (lock). How can main get in?</summary>

The waiter called `wait()`, and `wait()` releases the lock while the thread sleeps. That is the difference from `Thread.sleep()` inside a synchronized block, which keeps the lock. In the experiment `main` got in after one second and the program finished normally.
</details>

<details>
<summary>Why is the condition checked with while (!ready) and not if (!ready)?</summary>

After waking, the thread must check the condition again because it may no longer hold, and a thread can also wake without a `notify()`. A `while` loop sends it back to `wait()` in that case. This is the documented behaviour, and I did not run a case that fails with `if`.
</details>

<details>
<summary>The Slot output shows "produced 2" before "consumed 1", although the slot holds only one item. Is the buffer broken?</summary>

No. The `println` calls run after `put` and `take` have returned, outside the lock, so a thread can print late. The values themselves were consumed in the order 1 to 5 in all 3 runs, and `put(2)` could only happen after `take()` had emptied the slot.
</details>

<details>
<summary>Why do put and take call notifyAll() and not notify()?</summary>

Producers and consumers wait on the same lock for different conditions. A `notify()` wakes one thread chosen by the JVM, which could be a thread of the wrong kind, and then the signal is wasted. `notifyAll()` wakes all of them and each re-checks its own condition in its `while` loop. With one producer and one consumer both would work; I did not run a case where `notify()` fails.
</details>

## Key takeaways

| Remember | Because |
|---|---|
| `wait()` releases the lock, `notify()` wakes a waiter | `main` could enter the block while the waiter slept |
| The woken thread must re-take the lock | It cannot continue while the notifier still holds it |
| `join()` inside the lock hangs | The first version was still running after 5 seconds |
| `volatile` was not the cause | `ready` was already `volatile` in the version that hung |
| A producer and a consumer coordinate with `while` + `wait()` + `notifyAll()` | `Slot` delivered 1 to 5 in order in 3 of 3 runs |
| Save a value before you clear the field | `value = null; return value;` would always return `null` |

**Related:** [Concurrency handbook](/notebook/concurrency/overview) · **Previous:** [Deadlock](/notebook/concurrency/03-coordination/07-deadlock)
