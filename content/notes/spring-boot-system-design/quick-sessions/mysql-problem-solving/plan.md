# 1. Plan: MySQL query practice (solve, debug, optimise)

**Goal:** Solve interview-style MySQL problems on your own, spot the bug in a query that looks right but returns wrong rows, and make a slow query fast by reading `EXPLAIN`.
**Budget:** 3 h (usable 135 min) · **Level on entry:** basics done in the [SQL cheat sheet](/notebook/cheat-sheets/sql), which is written in PostgreSQL syntax, so the MySQL differences are item 1 · **Goal type:** interview prep and practice

## How each block runs

| Step | Who | What |
|---|---|---|
| Solve | You | I post a problem with the expected output. You write the query in a `.sql` file and say "check". |
| Check | Me | I run it on MySQL, compare the rows with the expected output, and we read the difference together. |
| Find the bug | You | I post a query that looks right and returns wrong rows. You find the trap before I run it. |
| Make it faster | Both | In items 6 and 7 only: run `EXPLAIN`, read the plan, change the query or the index, run it again. |

One problem per turn. I never show the answer first. Say "hint" for a nudge. Every trap you fall into becomes one recall card.

## Data used

The cheat sheet's `customers` and `orders` (8 and 12 rows, so you can verify results by eye), plus `products`, `order_items` and `employees` (a manager tree), and `big_orders` with about 1 million rows for the speed items. MySQL 8.4 in one Docker container.

## Schedule

| # | Item | Tier | Planned min | Actual min | Done |
|---|---|---|---|---|---|
| 1 | Setup and the MySQL differences from the Postgres cheat sheet | MUST | 10 | | |
| 2 | NULLs, filters, `GROUP BY` and `HAVING` | MUST | 10 | | |
| 3 | Joins and their traps | MUST | 20 | | |
| 4 | Subqueries and CTEs | SHOULD | 10 | | |
| 5 | Window functions | MUST | 15 | | |
| 6 | Indexes and `EXPLAIN` on 1M rows | MUST | 25 | | |
| R1 | Mixed review (traps from items 1-6) | review | 10 | | |
| 7 | Slow-query clinic: rewrite 5 slow queries | SHOULD | 20 | | |
| R2 | Final review (every card, no hints) | review | 15 | | |

MUST is 80 min, which is 59% of the 135 usable minutes. Total planned is 135 min.

## Clock

| Block | Work | Content |
|---|---|---|
| 1 | 50 min | Items 1, 2, 3, 4 |
| Break | 10 min | |
| 2 | 50 min | Items 5, 6, then R1 |
| Break | 10 min | |
| 3 | 35 min | Item 7, then R2 |
| Buffer | 25 min | Overruns, or the lightning round from "Not now" |

The hardest MUST items (joins, windows) sit in the first two blocks, while energy is high.

## What each item covers

- **1. Setup and differences.** The container is up and the data is loaded. The gaps from the Postgres sheet: no `FILTER`, `DISTINCT ON`, `ILIKE`, `NULLS LAST` or `::`; `STRING_AGG` is `GROUP_CONCAT`; `FULL OUTER JOIN` needs a `UNION`; `/` returns decimals (`DIV` is integer division); `LIKE` is case-insensitive; `ONLY_FULL_GROUP_BY` is on.
- **2. NULLs and grouping.** `= NULL`, `COUNT(*)` against `COUNT(col)`, `WHERE` against `HAVING`, `BETWEEN` with an end-of-day datetime, the `ONLY_FULL_GROUP_BY` error.
- **3. Joins.** `ON` against `WHERE` in a `LEFT JOIN`, anti-join with `NOT EXISTS` against `NOT IN` with a NULL, self join, `FULL OUTER` emulation, a fan-out that double-counts a `SUM`.
- **4. Subqueries and CTEs.** Correlated subquery against join, `EXISTS`, `WITH`, `WITH RECURSIVE` on the employee tree.
- **5. Windows.** Top N per group, Nth highest with `DENSE_RANK`, running total, `LAG`, consecutive days.
- **6. Indexes and `EXPLAIN`.** Reading `type`, `key`, `rows` and `Extra`; composite index and the leftmost prefix; a function on an indexed column; a leading `%`; implicit type conversion; a covering index.
- **7. Clinic.** Correlated subquery to join, `OFFSET` pagination to keyset, `OR` to `UNION ALL`, `SELECT *` to a covering index, a `GROUP BY` that sorts on disk.

## Checklist

- [ ] 1. Setup and differences: container up, data loaded, can name five MySQL differences from the Postgres sheet
- [ ] 2. NULLs and grouping: every problem solved, or each miss explained in own words
- [ ] 3. Joins: can say why a right-table filter in `WHERE` turns a `LEFT JOIN` into an inner join, and why `NOT IN` fails on a NULL
- [ ] 4. Subqueries and CTEs: can rewrite a correlated subquery as a join and write the recursive tree query
- [ ] 5. Windows: top-N per group and Nth highest solved without hints
- [ ] 6. Indexes and `EXPLAIN`: can read a plan and say which of five queries cannot use an index, and why
- [ ] R1. Mixed review passed
- [ ] 7. Clinic: five slow queries rewritten, with the plan before and after
- [ ] R2. Final review passed (all cards answered without hints)

## Not now

- DML: `UPDATE ... JOIN`, `ON DUPLICATE KEY UPDATE`, safe deletes (SHOULD): moved to module 2, where it sits next to transactions.
- Transactions, `SELECT ... FOR UPDATE`, isolation levels, deadlocks (SHOULD): module 2.
- String, date and JSON functions (COULD): a 10-question lightning round if the buffer is unused.
- Set operations and `WITH ROLLUP` (COULD): lightning round.
- Schema design, partitioning, replication (COULD): not needed for query practice.

## Next module

- MySQL data changes and concurrency: `UPDATE ... JOIN`, upsert, transactions, `FOR UPDATE`, isolation levels, deadlocks. It ties back to the train-ticket design: the unique rule on (seat, journey date) and the guarded confirm.
