# 1. Plan: MySQL revision from scratch (3 h, solve problems)

**Goal:** Get back every core MySQL query by solving problems: say what each clause does and the order a query runs in, write the query for a plain-English question, find the bug in a query that returns wrong rows, and take a first look at `EXPLAIN`. By the end, the [SQL cheat sheet](/notebook/cheat-sheets/sql) is rewritten for MySQL with real outputs.
**Budget:** 3 h (usable 135 min) · **Level on entry:** knows what SQL is, has forgotten the details (what `GROUP BY` does, where `HAVING` fits), so it starts at `SELECT` · **Goal type:** interview revision, plus a cheat sheet that can be trusted

## How each block runs

| Step | Who | What |
|---|---|---|
| Recap | Me | Two or three lines on what the keyword does, with one tiny query that I run so you see the rows. |
| Warm-up | You | An easy problem. You write the query in `block-N.sql` and say "check". |
| Real problem | You | A question in plain English, with the expected rows. I run your query and we read any difference together. |
| Find the bug | You | A query that looks right and returns wrong rows. You spot the trap before I run it. |
| Cheat sheet | Me | When an item passes, I rewrite its section of `cheat-sheets/sql.md` and tell you in one line what changed. |

One problem per turn. Say "hint" and I give the clause first, then the skeleton, and the full answer only when you ask. A mistake is not a failure: every trap you fall into becomes one recall card for the final review.

## The cheat sheet

What is wrong with `cheat-sheets/sql.md` today, checked against the file:

- The sample data has `CREATE TABLE` but no `INSERT` rows, so the examples cannot be run.
- The `LAG`, running total and `RANK` results are marked illustrative and use a `daily` table that does not exist. `ANY/ALL`, `FULL OUTER`, `INSERT`/`UPDATE`/`DELETE` and `EXPLAIN` show no output.
- It is PostgreSQL syntax, so `DISTINCT ON`, `ILIKE`, `NULLS LAST`, `FILTER`, `::`, `STRING_AGG` and `ON CONFLICT` do not run on MySQL.

Rules for the rewrite:

- MySQL 8.4 is the main syntax. Where Postgres differs, a short "Postgres:" note sits beside the query, because the capstone and some interviews use Postgres.
- Every query in the sheet is run on the container, and every output shown is the real output. No "illustrative" tables.
- The sample data section gets the full `CREATE TABLE` and `INSERT` rows (from `playground/mysql-practice/seed/`), so the sheet runs on its own.
- Your structure and your traps stay. Anything I remove or change is listed in one line at the end of the session.

| Item | Cheat sheet section rewritten |
|---|---|
| 1 and 2 | 1. Reading data (including `NULL`, `COALESCE`, `LIKE`, `DISTINCT`) |
| 3 | 2. Aggregation and grouping (`FILTER` becomes `CASE`, `ROLLUP` becomes `WITH ROLLUP`) |
| 4 | 4. Subqueries, CTEs and set operations |
| 5 | 3. Joins (`FULL OUTER JOIN` built from `UNION`) |
| 6 | 5. Window functions (real results on `daily_sales`) |
| 7 and 8 | 7. Changing data and speed (`ON DUPLICATE KEY UPDATE`, a real `EXPLAIN`) |
| C | 6. Functions, 8. Keyword glossary, 9. Traps, the title and the intro |

## Data used

Ready before the clock starts: MySQL 8.4 in one Docker container, with the cheat sheet's `customers` (8 rows) and `orders` (12 rows), so you can check results by eye. Also `products`, `order_items`, `employees`, `daily_sales` and `logins`. A 1-million-row `big_orders` table is added in item 8.

## Schedule

| # | Item | Tier | Planned min | Actual min | Done |
|---|---|---|---|---|---|
| 1 | Reading rows: `SELECT`, `WHERE`, `ORDER BY`, `LIMIT` | MUST | 10 | | |
| 2 | `NULL` and `CASE` | MUST | 10 | | |
| 3 | Aggregates, `GROUP BY`, `HAVING` | MUST | 20 | | |
| 4 | Subqueries, `EXISTS`, CTEs, `UNION` | SHOULD | 10 | | |
| 5 | Joins | MUST | 20 | | |
| 6 | Window functions | MUST | 15 | | |
| R1 | Mixed review (traps from items 1-6) | review | 10 | | |
| 7 | Changing data: `INSERT`, `UPDATE`, `DELETE`, upsert | SHOULD | 10 | | |
| 8 | Indexes and `EXPLAIN`, a first look | SHOULD | 10 | | |
| R2 | Final review (every card, no hints) | review | 10 | | |
| C | Cheat sheet read-through: you read the rewritten sheet and we fix what is still wrong | MUST | 10 | | |

MUST is 85 min, which is 63% of the 135 usable minutes, slightly over the 60% rule. I accepted that because the cheat sheet read-through is the one item you asked for by name. Total planned is 135 min.

## Clock

| Block | Work | Content |
|---|---|---|
| 1 | 50 min | Items 1, 2, 3, 4 |
| Break | 10 min | |
| 2 | 45 min | Items 5, 6, then R1 |
| Break | 10 min | |
| 3 | 40 min | Items 7, 8, then R2, then C |
| Buffer | 25 min | Overruns, or the lightning round on functions from "Not now" |

## What each item covers

- **1. Reading rows.** `SELECT` picks columns, `FROM` picks the table, `WHERE` picks rows. `AND`, `OR`, `IN`, `BETWEEN`, `LIKE`, `DISTINCT`, `ORDER BY`, `LIMIT`. Traps: `AND` binds tighter than `OR`; `BETWEEN` includes both ends and misses the afternoon of the last day when the column has a time. MySQL differs: `LIKE` ignores case, and there is no `ILIKE` or `DISTINCT ON`.
- **2. `NULL` and `CASE`.** `IS NULL`, `COALESCE`, `CASE WHEN`. Trap: `= NULL` never matches.
- **3. Aggregates and grouping.** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, then `GROUP BY` (one row per group), `HAVING` (filter the groups) against `WHERE` (filter the rows), and the order a query runs in. Traps: `COUNT(*)` against `COUNT(col)`, the `ONLY_FULL_GROUP_BY` error, a conditional count with `CASE`.
- **4. Subqueries and CTEs.** `IN (SELECT ...)`, a one-value subquery, `EXISTS` and `NOT EXISTS`, `WITH`, and `UNION` against `UNION ALL`. Trap: `NOT IN` returns nothing when the subquery has a `NULL`.
- **5. Joins.** `INNER JOIN`, `LEFT JOIN`, counting including zeros, a self join. Traps: a filter on the right table belongs in `ON`, and a one-to-many join that double-counts a `SUM`. MySQL differs: no `FULL OUTER JOIN`.
- **6. Window functions.** `OVER (PARTITION BY ...)`, `ROW_NUMBER`, `RANK`, `DENSE_RANK`, top N per group, running total, `LAG`. MySQL differs: `NULL` already sorts last on `DESC`, and `NULLS LAST` does not exist.
- **7. Changing data.** `INSERT`, `UPDATE`, `DELETE` and why they always need a `WHERE`, `ON DUPLICATE KEY UPDATE` (MySQL's upsert; there is no `RETURNING`).
- **8. Indexes and `EXPLAIN`.** What an index is, `EXPLAIN` on a 1M-row table, one index added and the plan read again, and why a function on an indexed column stops the index from being used.

## Checklist

- [ ] 1. Reading rows: every problem solved, or each miss explained in own words
- [ ] 2. `NULL` and `CASE`: can say why `= NULL` returns nothing
- [ ] 3. Grouping: can say what `GROUP BY` does, where `HAVING` fits, and the order a query runs in
- [ ] 4. Subqueries and CTEs: can write `EXISTS` and say why `NOT IN` can fail
- [ ] 5. Joins: can say why a right-table filter in `WHERE` turns a `LEFT JOIN` into an inner join
- [ ] 6. Windows: top N per group solved without hints
- [ ] R1. Mixed review passed
- [ ] 7. Changing data: can write an upsert and say what happens without a `WHERE`
- [ ] 8. Indexes and `EXPLAIN`: can read a plan and say whether it scanned the table or used an index
- [ ] R2. Final review passed (all cards answered without hints)
- [ ] C. Cheat sheet read through and signed off

## Cheat sheet sections

- [ ] Sample data (full `CREATE TABLE` and `INSERT` rows)
- [ ] 1. Reading data
- [ ] 2. Aggregation and grouping
- [ ] 3. Joins
- [ ] 4. Subqueries, CTEs and set operations
- [ ] 5. Window functions
- [ ] 6. Functions and types
- [ ] 7. Changing data and speed
- [ ] 8. Keyword glossary
- [ ] 9. Traps to remember
- [ ] Title and intro say MySQL

## Not now

- Functions you will be asked about (string, date, number) (COULD): I still rewrite section 6 of the sheet in MySQL during C. The 10-question lightning round for you goes in the buffer, if time is left.
- `WITH RECURSIVE`, `ANY` and `ALL`, `INTERSECT` and `EXCEPT` (COULD): the sheet sections are fixed in C, but they are not taught as items. Module 2.
- Composite and covering indexes, rewriting slow queries (SHOULD): module 2. Item 8 only shows the idea.
- Transactions, `SELECT ... FOR UPDATE`, isolation levels, deadlocks (SHOULD): module 2.

## Next module

- MySQL speed and concurrency: composite and covering indexes, a slow-query clinic, transactions, locking, deadlocks. It ties back to the train-ticket design: the unique rule on (seat, journey date) and the guarded confirm.
