# 2. Recall cards: MySQL revision

One card per trap that came up in the problems, grouped by item. Cover the answer, say yours out loud, then check. A card you miss twice goes to the weak spots in the wrap-up.

## Item 1: reading rows

### Card 1: BETWEEN on a date-time column

**Q:** A report uses `WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31'` on a `DATETIME` column, and one March order is missing. Which orders go missing, and what is the safe form?

**A:** Every order on 31 March after 00:00:00. The safe form is `order_date >= '2024-03-01' AND order_date < '2024-04-01'`.

**Why:** `BETWEEN` includes both ends, and the string `'2024-03-31'` means that day at midnight, so the afternoon is past the end.

**Trap:** Writing `BETWEEN '2024-03-01' AND '2024-04-01'` looks like a fix but also returns an order at exactly 2024-04-01 00:00:00.

**Hook:** start included, end excluded: the first moment of the next month.

## Item 2: NULL and CASE

### Card 2: comparing with NULL

**Q:** `SELECT * FROM orders WHERE amount = NULL` returns no rows, although orders 4 and 11 have no amount. Why, and what do you write?

**A:** Write `WHERE amount IS NULL` (MySQL also has the null-safe `<=>`).

**Why:** `NULL` means unknown. Any comparison with it gives unknown, which is not true, so the row is dropped.

**Trap:** `<> NULL` and `NOT IN (..., NULL)` fail the same way, silently.

**Hook:** "unknown" is never equal to anything, not even to itself.

### Card 3: CASE and a NULL value

**Q:** You label orders `'big'` above 4000 and `ELSE 'small'`. Orders 4 and 11 have a NULL amount. What label do they get, and how do you fix it?

**A:** They get `'small'`, which is wrong. Add a `WHEN amount IS NULL THEN 'unknown'` branch.

**Why:** `NULL > 4000` is unknown, not true, so it falls through every `WHEN` to the `ELSE`.

**Trap:** With no `ELSE` and no matching `WHEN`, `CASE` returns NULL.

**Hook:** `CASE` uses the first `WHEN` that is true; unknown is not true.

## Item 3: aggregates, GROUP BY, HAVING

### Card 4: WHERE or HAVING

**Q:** Report customers with at least 2 completed orders. Which of `status = 'completed'` and `COUNT(*) >= 2` goes in `WHERE`, which in `HAVING`, and in what order do the clauses run?

**A:** `status = 'completed'` in `WHERE`, `COUNT(*) >= 2` in `HAVING`. The order is `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`.

**Why:** `WHERE` filters single rows before the groups exist, so it cannot see `COUNT(*)`. `HAVING` filters the groups after they are built.

**Trap:** `WHERE COUNT(*) >= 2` fails with `ERROR 1111 Invalid use of group function`. `WHERE n >= 2` using a select alias fails too, because `SELECT` runs later.

**Hook:** `WHERE` = rows, `HAVING` = groups.

### Card 5: a column that is not in the GROUP BY

**Q:** `SELECT city, name, COUNT(*) FROM customers GROUP BY city` fails with error 1055. Why, and how do you fix it when you want the names?

**A:** `name` has several values per city, so MySQL cannot pick one. Group by it too, or aggregate it: `GROUP_CONCAT(name ORDER BY name SEPARATOR ', ')`.

**Why:** `ONLY_FULL_GROUP_BY` is on by default: every selected column must be grouped or aggregated.

**Trap:** `GROUP_CONCAT(name, ' ')` does not set a separator; the separator has its own keyword `SEPARATOR`, and the default is a bare comma.

**Hook:** one row per group means one value per column.

## Item 4: subqueries and CTEs

### Card 6: NOT IN and NULL

**Q:** `WHERE city NOT IN (SELECT city FROM ...)` returns no rows, and the subquery list contains a NULL. Why, and what are two fixes?

**A:** Use `NOT EXISTS`, or keep the NULLs out of the list with `AND city IS NOT NULL` inside the subquery.

**Why:** `x NOT IN (a, NULL)` means `x <> a AND x <> NULL`. The last part is never true, so the whole condition is never true.

**Trap:** Flipping to `IN (... <> 'cancelled')` asks a different question: where somebody has a non-cancelled order.

**Hook:** one NULL in the list poisons `NOT IN`.

### Card 7: at least one, with a join or EXISTS

**Q:** You list customers who have at least one pending order using `customers JOIN orders ON ... AND status = 'pending'`. What goes wrong for a customer with two pending orders, and what do you use instead?

**A:** The customer appears twice. Use `EXISTS (SELECT 1 FROM orders ...)` or `IN (subquery)`; with a join you would need `DISTINCT`.

**Why:** A join returns one row per match. `EXISTS` stops at the first match.

**Trap:** Putting `DISTINCT` inside an `IN` list does nothing: `IN` only tests membership.

**Hook:** a join counts matches, `EXISTS` asks "any?".

### Card 8: is a CTE slower than a subquery

**Q:** A teammate avoids CTEs "because they are costly". In MySQL 8, is a non-recursive CTE slower than the same subquery in `FROM`?

**A:** No. `EXPLAIN` shows the same plan, a `DERIVED` table for both. Use a CTE for readability.

**Why:** MySQL 8 plans a non-recursive CTE like a subquery in `FROM`.

**Trap:** The worry comes from Postgres before version 12, which always computed a CTE on its own first.

**Hook:** judge by `EXPLAIN`, not by the keyword.

## Item 5: joins

### Card 9: counting with a LEFT JOIN

**Q:** You `LEFT JOIN` customers to orders and `COUNT(*)` the orders per customer. Priya has no orders, yet she shows 1. Why, and what do you count instead?

**A:** Count a column from the orders side: `COUNT(o.order_id)`.

**Why:** The `LEFT JOIN` gives Priya one row with NULL on the orders side. `COUNT(*)` counts rows; `COUNT(column)` skips NULL.

**Trap:** Counting a column from the left table (`c.customer_id`) is never NULL either, so it also shows 1.

**Hook:** count something that only exists when the match exists.

### Card 10: ON or WHERE for a filter on the right table

**Q:** You want every customer with the count of their completed orders, 0 for none. Why does `LEFT JOIN orders o ON ... WHERE o.status = 'completed'` lose customers, and where does the filter go?

**A:** Put `AND o.status = 'completed'` in the `ON`.

**Why:** `WHERE` runs after the join. The unmatched rows have `o.status` NULL, `NULL = 'completed'` is not true, so they are deleted and the `LEFT JOIN` behaves like an inner join. Customers whose orders are all cancelled lose their rows too.

**Trap:** A filter on the left table is fine in `WHERE`.

**Hook:** right-table filter goes in `ON`.

### Card 11: a total that is too big after a join

**Q:** `SELECT SUM(o.amount) FROM orders o JOIN order_items i ON i.order_id = o.order_id` returns 87500 and the right answer is 48000. Why, and what do you do?

**A:** Do not join: use `WHERE EXISTS (SELECT 1 FROM order_items ...)`, or total the items per order in a subquery before the join.

**Why:** One order has several items, so the join repeats the order row once per item and `SUM` adds its amount each time (17 rows from 9 orders).

**Trap:** `SUM(DISTINCT o.amount)` gives 48000 here only by coincidence; two orders with the same amount would be counted once.

**Hook:** when a total looks too big, compare the joined row count with the one-side row count.

## Item 6: window functions

### Card 12: what OVER and PARTITION BY do

**Q:** What is the difference between `SUM(amount) OVER (PARTITION BY customer_id)` and `GROUP BY customer_id`, and what does `ORDER BY` inside `OVER` add?

**A:** `GROUP BY` returns one row per customer. The window version keeps every row and adds the customer's total as a new column. `ORDER BY` inside `OVER` makes it a running total.

**Why:** `OVER` defines the window each row looks through; `PARTITION BY` is the window's own `GROUP BY`.

**Trap:** `OVER ()` with nothing inside gives every row the total of all rows.

**Hook:** `GROUP BY` collapses, `OVER` keeps the rows.

### Card 13: ROW_NUMBER, RANK or DENSE_RANK

**Q:** You need the third-lowest distinct salary, and two employees tie for second-lowest. Which function, and what do the other two give?

**A:** `DENSE_RANK() OVER (ORDER BY salary)`, then keep rank 3. `ROW_NUMBER` splits the tie, so its 3rd row is the second tied employee. `RANK` gives both rank 2 and then skips to 4, so no row has rank 3.

**Why:** Only `DENSE_RANK` counts distinct values without gaps.

**Trap:** `LIMIT 1 OFFSET 2` returns one row and cannot return people who tie.

**Hook:** Nth highest or lowest means `DENSE_RANK`.

### Card 14: filtering on a window function

**Q:** `WHERE ROW_NUMBER() OVER (...) = 1` fails with error 3593. Why, and how do you get the top row per group?

**A:** Compute `ROW_NUMBER()` in a CTE or subquery, then filter `WHERE rn = 1` outside.

**Why:** Window functions are evaluated after `WHERE`, so `WHERE` cannot see them.

**Trap:** In MySQL `NULL` sorts last on `DESC`, so `ORDER BY amount DESC` already ranks the biggest real amount first. In Postgres you need `NULLS LAST`.

**Hook:** rank in a CTE, filter outside.

## Interview questions

<details>
<summary>A dashboard counts completed orders per customer and the customers who never completed one vanish from the report. Walk through the cause and the fix.</summary>

The query is a `LEFT JOIN` with `WHERE o.status = 'completed'`. The `WHERE` runs after the join and removes every row whose right side is NULL, which includes customers with no completed order, so the `LEFT JOIN` turns into an inner join. Move the status condition into the `ON` clause and count `o.order_id`, so a customer with none shows 0.
</details>

<details>
<summary>A revenue total jumps from 48000 to 87500 after someone joins order_items to add a units column. What happened?</summary>

A one-to-many join repeats each order row once per item, so `SUM(o.amount)` adds the amount of an order with 3 items three times. Compare the joined row count with the order count (17 against 9). Fix it by aggregating items per order first, or by not joining when you only need to know whether items exist.
</details>

<details>
<summary>You are asked for the second-highest salary and two people share the top salary. Why does LIMIT 1 OFFSET 1 give the wrong person?</summary>

With a tie at the top, offset 1 lands on the second tied person, who has the highest salary, not the second-highest. `DENSE_RANK() OVER (ORDER BY salary DESC)` ranks tied values together without gaps, and filtering `rank = 2` returns the right people, including ties.
</details>

<details>
<summary>The query SELECT department, name, MAX(salary) FROM employees GROUP BY department is rejected by MySQL 8. Explain the error and give two valid versions.</summary>

`name` is neither grouped nor aggregated, and `ONLY_FULL_GROUP_BY` (on by default) rejects it with error 1055, because a department has many names. Either add `name` to the `GROUP BY`, or use the window function `ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)` in a CTE and keep rank 1 to get the person with the top salary.
</details>

**Related:** [Plan](/notebook/mysql/plan) · [SQL cheat sheet](/notebook/cheat-sheets/sql)
