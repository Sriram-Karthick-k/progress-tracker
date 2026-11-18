# 1. Plan: Amazon SDE II prep, module 1 (heap, intervals, greedy)

**Goal:** For heap, interval and greedy problems, recognise the pattern from the wording, state the complexity before coding, write the Java solution, and explain why it works, inside the time an interview gives you.
**Budget:** 3 h (usable 135 min) · **Level on entry:** 272 LeetCode problems solved (173 medium), Java is the main language, strong on arrays, hashing, trees, graphs, DP and backtracking; heap, intervals and greedy are the untested patterns · **Goal type:** interview prep (Amazon SDE II, Financial Technology team, job ID A10502808)

## Why these three

Your tracker and profile show heap at 1 of 16 problems, greedy at 0 of 16 and intervals at 0 of 11, and the last 15 problems you solved include none of them. Amazon rounds ask them often (top K, merge intervals, meeting rooms, task scheduling). The call date is not known, so this plan puts the most likely misses first. The Leadership Principles stories, the payments design and a timed mock set are the next modules.

## How each item runs

| Step | Who | What |
|---|---|---|
| Teach | Me | The cue words that signal the pattern, the mental model, a Java template, the exact complexity, and the pitfalls. About 8 minutes. |
| Solve | You | 2 or 3 LeetCode problems, each on a 25-minute timer. Say the brute force and the target complexity before you code. |
| Discuss | You | Tell me your approach, the complexity, and what tripped you. You can paste your Java and I will review it. I cannot see your LeetCode submissions. |
| Check | Me | Two open questions. The item is ticked only when you can explain it in your own words. |
| Card | Me | One recall card per core idea, in `cards.md`. |

Problems marked "(Premium)" need LeetCode Premium. A free alternative is named next to each.

## Schedule

| # | Item | Tier | Planned min | Actual min | Done |
|---|---|---|---|---|---|
| 1 | Heap in Java: `PriorityQueue`, comparators, complexity | MUST | 10 | | |
| 2 | Top K and K-way merge | MUST | 25 | | |
| 3 | Intervals: sort, merge, insert, remove overlaps | MUST | 25 | | |
| 4 | Scheduling: one problem, the room-count heap | SHOULD | 15 | | |
| R1 | Mixed review (cards 1-4) | review | 10 | | |
| 5 | Greedy: when it works, and the exchange argument | SHOULD | 25 | | |
| 6 | DP beyond 1D: state, transition, 2D tables (added at your request) | MUST | 30 | | |
| R2 | Final review (all cards, no hints) | review | 12 | | |

MUST is now 90 min, which is 67% of the 135 usable minutes and over the 60% rule, because you added DP. Total planned is 152 min against 135 usable, so the plan has no buffer left. Task Scheduler and Reorganize String were dropped to make room.

## Clock

| Block | Work | Content |
|---|---|---|
| 1 | 35 min planned, 50 min slot | Items 1, 2 |
| Break | 10 min | |
| 2 | 40 min | Items 3, 4 |
| Break | 10 min | |
| 3 | 35 min | R1, item 5 |
| Break | 10 min | |
| 4 | 42 min | Item 6, R2 |
| Buffer | none | The plan is about 2 min over a 3 h clock. If you must stop at 3 h, item 6 moves to the next sprint. |

## What each item covers

- **1. Heap in Java.** `PriorityQueue` is a min-heap, `offer` and `poll` cost O(log n), `peek` is O(1), `remove(Object)` is O(n), and there is no decrease-key. Comparator traps: `a - b` overflows, so use `Integer.compare`. Problems: 1046 Last Stone Weight, 703 Kth Largest Element in a Stream.
- **2. Top K and K-way merge.** A min-heap of size K gives the K largest in O(n log k). Tie-break comparators. Merge several sorted lists by keeping one pointer per list in the heap. Problems: 973 K Closest Points to Origin, 692 Top K Frequent Words, 373 Find K Pairs with Smallest Sums, and 23 Merge k Sorted Lists as the stretch.
- **3. Intervals.** Sort by start and merge; sort by end for the greedy choice. Problems: 56 Merge Intervals, 57 Insert Interval, 435 Non-overlapping Intervals.
- **4. Scheduling.** A min-heap of end times counts the rooms needed, and a sweep line over start and end events counts overlaps. One problem only: 253 Meeting Rooms II (Premium; free alternative 1094 Car Pooling). 621 Task Scheduler and 767 Reorganize String are dropped.
- **5. Greedy.** Pick the locally best step and prove it never hurts later (the exchange argument), and learn the signs that greedy fails and DP is needed. Problems: 55 Jump Game, 45 Jump Game II, 763 Partition Labels, and 134 Gas Station as the stretch.
- **6. DP beyond 1D.** Your LeetCode profile shows 22 DP problems, mostly 1D. This item is the harder part: define the state in words, write the transition, fill a 2D table by hand, then compress it. Problems: 62 Unique Paths, 1143 Longest Common Subsequence, 322 Coin Change, with 72 Edit Distance as the stretch.

## Checklist

- [x] **1** Heap in Java: can write a max-heap and a comparator for pairs without overflow, and state the cost of `offer`, `poll`, `peek` and `remove(Object)`
- [ ] **2** Top K and K-way merge: can explain why a size-K min-heap gives the K largest, and the cost against sorting
- [x] **3** Intervals: can say why you sort by start for merging and by end for removing overlaps
- [ ] **4** Scheduling: can explain why the heap of end times gives the number of rooms
- [ ] **R1** Mixed review passed
- [ ] **5** Greedy: can state the exchange argument for one problem and a case where greedy fails
- [ ] **6** DP beyond 1D: can define the state and transition for one 2D problem and fill its table by hand
- [ ] **R2** Final review passed (all cards answered without hints)

## Carried to the mixed review (R1)

- Item 2 is not ticked yet. Solved: 973 K Closest Points, 692 Top K Frequent Words (sort-based, with an `Integer ==` tie-break bug at counts of 128 or more), 373 Find K Pairs.
- Open question: in 973, what is at the heap's root when the loop ends, and why a max-heap for the K closest?
- Open task: rewrite 692 with a size-K heap (the root must be the word you would evict first).
- Open question: the time complexity of K-way merge with a heap against merging the lists one by one.
- Item 3 is ticked: 56, 57 and 435 are solved, and the cost of 435 was stated correctly (O(n log n) time, O(1) extra space apart from the sort). Still to explain, in the greedy check: why 435 sorts by end (the exchange argument).
- Item 3 history: 56 Merge Intervals was solved with a walk-back loop that is O(n squared) in the worst case (measured: 3.6 s at 80,000 intervals against 6 ms for the usual version), an output in reverse order, and a `-1` marker that changes the input. 57 Insert Interval is solved. 435 Non-overlapping Intervals is left. To state: why the clean version (compare with the last kept interval) is O(n log n).

## DP progress (item 6, not ticked yet)

- Coin Change II (518): the attempt had no return value and the memo key was only the amount, so it counted ordered sequences. Diagnosed, then viewed the solution.
- 983 Minimum Cost For Tickets: solved with the four-question routine (contract, state, choices and combine, base case), written in words before any code. Two off-by-one bugs were found by tests (base case `days.length`, and a pass of length L covers `d` to `d+L-1`). Left to fix: the memo was an instance field, so a reused instance returns stale answers.
- Still to do: one problem with a 2D state (state is two indexes), then fill its table by hand. Chosen: 1143 Longest Common Subsequence, planned for the morning of 2026-11-18. First question to answer in words: what do `i` and `j` point at, and what does `f(i, j)` return?

## Not now

- Task Scheduler (621) and Reorganize String (767) (SHOULD): dropped from item 4 to make room for DP.
- Two heaps and running median (295, 480) (SHOULD): next sprint.
- Trie, bit manipulation, LRU cache and other design problems (SHOULD): next sprint.
- Timed mock set: 2 mediums in 70 minutes (SHOULD): its own sprint, once the patterns above are solid.
- Leadership Principles stories (MUST for the interview, not for this sprint): own module.
- Payments or ledger system design (SHOULD): own module, with `/coach-hld`.

## Next module

- Leadership Principles: 8 STAR stories from your Zoho work, written and said aloud.
- Timed practice: 2 mediums in 70 minutes, three times a week, plus your "revisit" list cold.
- Payments design: one ledger or payments service design for the Financial Technology team.
- DP from recursion (needs more than the 30 minutes in item 6): a ladder of about 8 problems, written as contract, state, transition and base cases in words before any code. Ladder: 198 House Robber, 322 Coin Change, 518 Coin Change II, 62 Unique Paths, 1143 Longest Common Subsequence, 72 Edit Distance, 416 Partition Equal Subset Sum.
