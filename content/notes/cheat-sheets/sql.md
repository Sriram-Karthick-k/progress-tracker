# 4. SQL Cheat Sheet — Queries, Joins, Windows & Interview Patterns

One page, in the order you learn it: reading rows, grouping, joins, subqueries, window functions, functions, then changing data. PostgreSQL syntax; every example runs against the sample data below, and results are shown where they teach something.

> [!NOTE]
> **Being rewritten for MySQL 8.4.** The sample data and sections 1 to 5 are done: every query there was run on MySQL 8.4, and the output shown is the real output. Sections 6 to 9 are still PostgreSQL and have not been re-run. The "Postgres:" notes come from the original sheet and were not re-run.

## Sample data

Run this once on MySQL 8.4. The same script is in `playground/mysql-practice/seed/01-small-tables.sql`, which also builds the extra tables used further down (`products`, `order_items`, `employees`, `daily_sales`, `logins`).

```sql
CREATE TABLE customers (
    customer_id  INT PRIMARY KEY,
    name         VARCHAR(50),
    city         VARCHAR(50),          -- some NULLs
    signup_date  DATE
);

CREATE TABLE orders (
    order_id     INT PRIMARY KEY,
    customer_id  INT,
    order_date   DATETIME,             -- has a time part on purpose (see the BETWEEN trap)
    amount       DECIMAL(10,2),        -- some NULLs
    status       VARCHAR(20),          -- 'completed' / 'pending' / 'cancelled'
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

INSERT INTO customers VALUES
    (1, 'Aarav',   'Chennai',   '2023-01-10'),
    (2, 'Diya',    'Bengaluru', '2023-02-14'),
    (3, 'Rohan',   'Chennai',   '2023-03-05'),
    (4, 'Meera',   NULL,        '2023-04-20'),
    (5, 'Karthik', 'Mumbai',    '2023-05-18'),
    (6, 'Sana',    'Bengaluru', '2023-06-25'),
    (7, 'Vikram',  'Chennai',   '2023-07-30'),
    (8, 'Priya',   NULL,        '2023-09-12');

INSERT INTO orders VALUES
    (1,  1, '2024-01-05 10:15:00', 5000, 'completed'),
    (2,  1, '2024-02-11 18:40:00', 3000, 'completed'),
    (3,  2, '2024-01-20 09:05:00', 8000, 'completed'),
    (4,  2, '2024-02-02 14:30:00', NULL, 'completed'),
    (5,  3, '2024-02-15 11:00:00', 2000, 'pending'),
    (6,  3, '2024-03-03 16:20:00', 4500, 'completed'),
    (7,  7, '2024-02-25 12:45:00', 1000, 'cancelled'),
    (8,  5, '2024-03-10 08:50:00', 7000, 'completed'),
    (9,  5, '2024-03-18 19:10:00', 6000, 'pending'),
    (10, 6, '2024-03-22 13:25:00', 9000, 'completed'),
    (11, 4, '2024-03-27 17:35:00', NULL, 'cancelled'),
    (12, 2, '2024-03-31 15:30:00', 3500, 'completed');
```

- Priya (id 8) has no orders.
- Meera (id 4) has a NULL city and only a cancelled order.
- Orders 4 and 11 have a NULL amount.
- 12 orders total; 10 have a non-NULL amount (sum 49000, avg 4900).
- The dates are invented. The original sheet had none.

**Postgres:** there is no `DATETIME` type, so use `TIMESTAMP`.



## The order a query runs in

You write `SELECT` first, but the database starts at `FROM`. That is why `WHERE` cannot see a `SELECT` alias or an aggregate, and `HAVING` can.

| Step | Clause | What happens |
|---|---|---|
| 1 | `FROM / JOIN` | gather + combine tables |
| 2 | `WHERE` | filter rows (no aggregates yet) |
| 3 | `GROUP BY` | form groups |
| 4 | `HAVING` | filter groups (aggregates OK) |
| 5 | `SELECT` | compute columns / window functions |
| 6 | `ORDER BY` | sort |
| 7 | `LIMIT / OFFSET` | cap |



## 1. Reading data

### SELECT / FROM — pick columns

SELECT chooses the columns, FROM chooses the table. `*` means all columns.

```sql
SELECT name, city FROM customers;
```

| name | city |
|---|---|
| Aarav | Chennai |
| Diya | Bengaluru |
| Rohan | Chennai |
| Meera | NULL |
| Karthik | Mumbai |
| Sana | Bengaluru |
| Vikram | Chennai |
| Priya | NULL |

**What to notice.** Text values use single quotes (`'Chennai'`). MySQL also accepts double quotes for text, but Postgres reads double quotes as a column name, so single quotes run on both. MySQL quotes a column or table name with backticks, which you need only for reserved words such as `order`.



### WHERE — pick rows

Keeps only rows where the condition is TRUE. Operators: `=`, `<>` (not equal; `!=` also works), `>`, `<`, `>=`, `<=`.

```sql
SELECT order_id, amount, status
FROM orders
WHERE status = 'completed' AND amount < 6000;
```

| order_id | amount | status |
|---|---|---|
| 1 | 5000.00 | completed |
| 2 | 3000.00 | completed |
| 6 | 4500.00 | completed |
| 12 | 3500.00 | completed |

**What to notice.** Order 4 (completed but NULL amount) is absent — a comparison with NULL is never TRUE. The same query without `status = 'completed'` would also return the pending and cancelled orders: check that every condition in the question is in the query.



### NULL — 'unknown', not zero

NULL means unknown. ANY comparison with NULL is 'unknown' (not true), so those rows are silently dropped — and `= NULL` never works.

_WRONG — returns 0 rows_

```sql
SELECT * FROM orders WHERE amount = NULL;
```

_0 rows (`= NULL` is never true)_

_RIGHT — use IS NULL_

```sql
SELECT name FROM customers WHERE city IS NULL;
```

| name |
|---|
| Meera |
| Priya |

_MySQL shortcut — `<=>` is a null-safe equals_

```sql
SELECT order_id FROM orders WHERE amount <=> NULL;
```

| order_id |
|---|
| 4 |
| 11 |

**What to notice.** Rule: never use `= NULL` or `<> NULL`. Always `IS NULL` / `IS NOT NULL`. `<=>` works only in MySQL. **Postgres:** `IS NOT DISTINCT FROM` does the same job.



### COALESCE / NULLIF — NULL utilities

COALESCE(a, b, …) returns the first value that is not NULL, reading left to right. NULLIF(a, b) returns NULL if a equals b.

```sql
SELECT order_id, COALESCE(amount, 0) AS amount_or_zero
FROM orders WHERE order_id IN (3, 4, 11);
```

| order_id | amount_or_zero |
|---|---|
| 3 | 8000.00 |
| 4 | 0.00 |
| 11 | 0.00 |

**What to notice.** NULLIF is how you dodge a divide-by-zero: `x / NULLIF(divisor, 0)`. MySQL returns NULL for `5 / 0` in a SELECT (with a warning), so there it is only a safe habit. **Postgres:** `5 / 0` raises an error, so NULLIF is needed there.



### CASE WHEN — if / else inside a query

CASE checks its WHEN lines from top to bottom and uses the first one that is true. It can sit anywhere a value can: in SELECT, in WHERE, in ORDER BY, or inside an aggregate (section 2).

```sql
SELECT order_id,
       CASE
         WHEN amount > 4000  THEN 'big'
         WHEN amount <= 4000 THEN 'small'
         WHEN amount IS NULL THEN 'unknown'
       END AS size
FROM orders;
```

| order_id | size |
|---|---|
| 1 | big |
| 2 | small |
| 3 | big |
| 4 | unknown |
| 5 | small |
| 6 | big |
| 7 | small |
| 8 | big |
| 9 | big |
| 10 | big |
| 11 | unknown |
| 12 | small |

**What to notice.** A NULL amount makes both comparisons 'unknown', so it falls through to the `IS NULL` line. If you write only `WHEN amount > 4000 THEN 'big' ELSE 'small'`, the NULL orders (4 and 11) are labelled 'small', which is wrong. A row that matches no WHEN and has no ELSE gets NULL.



### AND · OR · IN · BETWEEN

IN (...) is shorthand for many ORs. BETWEEN a AND b includes both ends. AND binds tighter than OR — parenthesize when mixing.

```sql
SELECT name, city FROM customers WHERE city IN ('Chennai','Mumbai');
```

| name | city |
|---|---|
| Aarav | Chennai |
| Rohan | Chennai |
| Karthik | Mumbai |
| Vikram | Chennai |

_BETWEEN is inclusive_

```sql
SELECT order_id, amount FROM orders WHERE amount BETWEEN 3000 AND 7000;
```

| order_id | amount |
|---|---|
| 1 | 5000.00 |
| 2 | 3000.00 |
| 6 | 4500.00 |
| 8 | 7000.00 |
| 9 | 6000.00 |
| 12 | 3500.00 |

_AND binds tighter than OR — the brackets change the answer_

```sql
-- reads as: completed, OR (pending AND amount > 5000)  -> 9 rows
SELECT COUNT(*) FROM orders
WHERE status = 'completed' OR status = 'pending' AND amount > 5000;

-- reads as: (completed OR pending), AND amount > 5000  -> 4 rows
SELECT COUNT(*) FROM orders
WHERE (status = 'completed' OR status = 'pending') AND amount > 5000;
```

_BETWEEN on a date-time column — the end-of-day trap_

```sql
-- misses order 12 (placed 2024-03-31 15:30): the end '2024-03-31' means 00:00:00 that day  -> 5 rows
SELECT order_id, order_date FROM orders
WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31';

-- safe: the start is included, the end is the first moment of the next month and is excluded  -> 6 rows
SELECT order_id, order_date FROM orders
WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';
```

| order_id | order_date |
|---|---|
| 6 | 2024-03-03 16:20:00 |
| 8 | 2024-03-10 08:50:00 |
| 9 | 2024-03-18 19:10:00 |
| 10 | 2024-03-22 13:25:00 |
| 11 | 2024-03-27 17:35:00 |
| 12 | 2024-03-31 15:30:00 |

**What to notice.** `BETWEEN '2024-03-01' AND '2024-04-01'` looks like a fix, but it also returns an order placed exactly at 2024-04-01 00:00:00, because BETWEEN includes its end. Use `>=` and `<` against the first moment of the next month.



### LIKE — pattern matching

Match text against a pattern: `%` = any run of characters, `_` = exactly one character. NOT LIKE negates.

_Names starting with 'A'_

```sql
SELECT name FROM customers WHERE name LIKE 'A%';
```

| name |
|---|
| Aarav |

_Names ending in 'a'_

```sql
SELECT name FROM customers WHERE name LIKE '%a';
```

| name |
|---|
| Diya |
| Meera |
| Sana |
| Priya |

**What to notice.** MySQL's LIKE ignores case by default, so `LIKE 'a%'` also returns Aarav. There is no ILIKE. For a case-sensitive match use `LIKE BINARY 'a%'` (it returns nothing here). **Postgres:** LIKE is case-sensitive, and ILIKE is the case-insensitive form.



### DISTINCT — remove duplicates

DISTINCT drops duplicate rows, looking at ALL selected columns together (not just the first).

_Unique cities_

```sql
SELECT DISTINCT city FROM customers;
```

| city |
|---|
| Chennai |
| Bengaluru |
| NULL |
| Mumbai |

**What to notice.** SELECT DISTINCT a, b removes duplicate (a, b) PAIRS — not duplicates of a alone. NULL counts as one value, so it appears once. Without ORDER BY the row order is not guaranteed.

**Postgres:** `DISTINCT ON (col)` keeps the first row per group. MySQL has no `DISTINCT ON`: use `ROW_NUMBER()` and keep row 1 (section 5, top row per group).

```sql
-- Postgres only: the highest order per customer
SELECT DISTINCT ON (customer_id) customer_id, order_id, amount
FROM orders
ORDER BY customer_id, amount DESC NULLS LAST;
```



### ORDER BY / LIMIT / OFFSET — sort & cap

ORDER BY sorts (ASC = low→high is the default, DESC = high→low). LIMIT n caps rows; LIMIT n OFFSET m = skip m, take n (pagination).

```sql
SELECT order_id, amount
FROM orders
WHERE amount IS NOT NULL
ORDER BY amount DESC
LIMIT 3;
```

| order_id | amount |
|---|---|
| 10 | 9000.00 |
| 3 | 8000.00 |
| 8 | 7000.00 |

_Page 2: skip 3, take 3_

```sql
SELECT order_id, amount
FROM orders
WHERE amount IS NOT NULL
ORDER BY amount DESC
LIMIT 3 OFFSET 3;
```

| order_id | amount |
|---|---|
| 9 | 6000.00 |
| 1 | 5000.00 |
| 6 | 4500.00 |

_NULL sorts as the smallest value in MySQL_

```sql
SELECT order_id, amount FROM orders ORDER BY amount ASC LIMIT 3;
```

| order_id | amount |
|---|---|
| 11 | NULL |
| 4 | NULL |
| 7 | 1000.00 |

**What to notice.** Always pair LIMIT with ORDER BY, or 'top N' is undefined. In MySQL ASC puts NULLs first and DESC puts them last; to force NULLs last on ASC, sort by `amount IS NULL` first: `ORDER BY amount IS NULL, amount`. The order of the two NULL rows above is not guaranteed.

**Postgres:** the default is the opposite (ASC puts NULLs last, DESC puts them first) and it has `NULLS FIRST` / `NULLS LAST`; MySQL has neither keyword. MySQL also accepts `LIMIT 3, 3`, which means offset 3, count 3 and is easy to misread, so prefer `OFFSET`. (SQL Server uses TOP instead of LIMIT.)



## 2. Aggregation and grouping

### Aggregates — COUNT SUM AVG MIN MAX

Collapse many rows into one summary. Aggregates SKIP NULLs.

```sql
SELECT COUNT(*) AS cnt, COUNT(amount) AS cnt_amt,
       SUM(amount) AS total, AVG(amount) AS avg_amt,
       MIN(amount) AS mn, MAX(amount) AS mx
FROM orders;
```

| cnt | cnt_amt | total | avg_amt | mn | mx |
|---|---|---|---|---|---|
| 12 | 10 | 49000.00 | 4900.000000 | 1000.00 | 9000.00 |

**What to notice.** COUNT(\*) = 12 (all rows) but COUNT(amount) = 10 (non-NULL only). AVG divides by 10, not 12 → 49000/10 = 4900. `COUNT(order_id)` also gives 12, because a primary key is never NULL.



### GROUP BY — aggregate per group

Splits rows into piles and aggregates each pile — one row out per group. NULLs form their own single group.

```sql
SELECT status, COUNT(*) AS cnt, SUM(amount) AS total
FROM orders
GROUP BY status
ORDER BY status;
```

| status | cnt | total |
|---|---|---|
| cancelled | 2 | 1000.00 |
| completed | 8 | 40000.00 |
| pending | 2 | 8000.00 |

**What to notice.** The rule: every SELECT column must be in GROUP BY or inside an aggregate. MySQL enforces it (`sql_mode` `ONLY_FULL_GROUP_BY`, on by default). Selecting `name` while grouping by `city` fails:

```
ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains
nonaggregated column 'practice.customers.name' which is not functionally dependent on
columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
```

The fix is to group by `name` too, or to aggregate it (next example). MySQL 8 does not sort the groups for you, so add `ORDER BY` whenever the order matters.

_List the members of each group — GROUP_CONCAT (MySQL's STRING_AGG)_

```sql
SELECT city, COUNT(*) AS customer_count,
       GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS people
FROM customers
GROUP BY city
ORDER BY city;
```

| city | customer_count | people |
|---|---|---|
| NULL | 2 | Meera, Priya |
| Bengaluru | 2 | Diya, Sana |
| Chennai | 3 | Aarav, Rohan, Vikram |
| Mumbai | 1 | Karthik |

**What to notice.** Inside GROUP_CONCAT, `ORDER BY` sorts the names and `SEPARATOR` sets the glue; the default glue is a bare comma. `GROUP_CONCAT(name, ' ')` does not set a separator: it glues a space onto the end of every name. The result is cut at `group_concat_max_len` (1024 bytes by default). **Postgres:** `STRING_AGG(name, ', ' ORDER BY name)`.



### HAVING — filter the groups

WHERE filters rows BEFORE grouping; HAVING filters groups AFTER (and can use aggregates).

```sql
SELECT city, COUNT(*) AS cnt
FROM customers
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY city;
```

| city | cnt |
|---|---|
| NULL | 2 |
| Bengaluru | 2 |
| Chennai | 3 |

_Both together: WHERE picks the rows, HAVING picks the groups_

```sql
SELECT customer_id, COUNT(*) AS completed_count
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) >= 2;
```

| customer_id | completed_count |
|---|---|
| 1 | 2 |
| 2 | 3 |

_WRONG — an aggregate in WHERE_

```sql
SELECT customer_id, COUNT(*) AS completed_count
FROM orders
WHERE status = 'completed' AND COUNT(*) >= 2
GROUP BY customer_id;
-- ERROR 1111 (HY000): Invalid use of group function
```

**What to notice.** Pipeline order: WHERE → GROUP BY → HAVING. WHERE runs before the groups exist, so it cannot see `COUNT(*)`. It cannot see a SELECT alias either: `WHERE n >= 2` fails with `Unknown column 'n' in 'where clause'`. MySQL lets HAVING use a SELECT alias (`HAVING cnt >= 2`). **Postgres:** it does not, so repeat `COUNT(*) >= 2` there.



### CASE + conditional aggregation (pivot)

CASE WHEN … THEN … ELSE … END is SQL's if/else (section 1). Inside an aggregate it pivots rows → columns.

```sql
SELECT status,
       SUM(CASE WHEN amount > 4000 THEN 1 ELSE 0 END) AS big,
       SUM(CASE WHEN amount <= 4000 THEN 1 ELSE 0 END) AS small
FROM orders
GROUP BY status
ORDER BY status;
```

| status | big | small |
|---|---|---|
| cancelled | 0 | 1 |
| completed | 5 | 2 |
| pending | 1 | 1 |

_One row per customer, one column per status_

```sql
SELECT customer_id,
       COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
       COUNT(CASE WHEN status = 'pending'   THEN 1 END) AS pending,
       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
FROM orders
GROUP BY customer_id
ORDER BY customer_id;
```

| customer_id | completed | pending | cancelled |
|---|---|---|---|
| 1 | 2 | 0 | 0 |
| 2 | 3 | 0 | 0 |
| 3 | 1 | 1 | 0 |
| 4 | 0 | 0 | 1 |
| 5 | 1 | 1 | 0 |
| 6 | 1 | 0 | 0 |
| 7 | 0 | 0 | 1 |

**What to notice.** Three equal ways to count a category: `SUM(CASE WHEN cond THEN 1 ELSE 0 END)` (works everywhere), `COUNT(CASE WHEN cond THEN 1 END)` (no ELSE, so a miss is NULL and COUNT skips it), and MySQL's shortcut `SUM(cond)`, because a true condition is 1 and a false one is 0. **Postgres:** `COUNT(*) FILTER (WHERE cond)`, which MySQL does not have. In the first table, orders 4 and 11 (NULL amount) are in neither column, so big + small adds up to 10, not 12.



### GROUP BY extensions — WITH ROLLUP

Adds subtotal and grand-total rows to a GROUP BY. With two columns, `GROUP BY a, b WITH ROLLUP` gives the totals for (a, b), then for (a), then the grand total.

```sql
SELECT status, COUNT(*) AS cnt, GROUPING(status) AS is_total
FROM orders
GROUP BY status WITH ROLLUP;
```

| status | cnt | is_total |
|---|---|---|
| cancelled | 2 | 0 |
| completed | 8 | 0 |
| pending | 2 | 0 |
| NULL | 12 | 1 |

**What to notice.** The extra row with NULL in the grouped column is the grand total. `GROUPING(col)` is 1 on a total row and 0 on a real group, so you can tell a total's NULL from a NULL in the data. MySQL has no CUBE and no GROUPING SETS: both fail on 8.4 (errors 3889 and 1064). **Postgres:** `GROUP BY ROLLUP(status)`, plus `CUBE` and `GROUPING SETS` to pick exactly which groupings you want.



## 3. Joins

### JOIN (INNER) — combine two tables

Match rows across tables on a shared column (ON = the match rule). INNER JOIN keeps only rows matched in BOTH tables. Use table aliases.

```sql
SELECT o.order_id, c.name, o.status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_id;
```

| order_id | name | status |
|---|---|---|
| 1 | Aarav | completed |
| 2 | Aarav | completed |
| 3 | Diya | completed |
| 4 | Diya | completed |
| 5 | Rohan | pending |
| 6 | Rohan | completed |
| 7 | Vikram | cancelled |
| 8 | Karthik | completed |
| 9 | Karthik | pending |
| 10 | Sana | completed |
| 11 | Meera | cancelled |
| 12 | Diya | completed |

**What to notice.** Priya has no orders, so she is not in the result. When the two columns have the same name you can write `JOIN customers USING (customer_id)` instead of the ON; the column then appears once, and you do not prefix it.



### LEFT JOIN — keep unmatched left rows

Keeps EVERY left-table row; the right side is NULL where there's no match. (a LEFT JOIN b == b RIGHT JOIN a.)

```sql
SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.name IN ('Aarav','Priya')
ORDER BY c.name, o.order_id;
```

| name | order_id |
|---|---|
| Aarav | 1 |
| Aarav | 2 |
| Priya | NULL |

_Counting including zeros_

```sql
SELECT c.name,
       COUNT(o.order_id) AS order_count,
       COUNT(*)          AS wrong_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;
```

| name | order_count | wrong_count |
|---|---|---|
| Aarav | 2 | 2 |
| Diya | 3 | 3 |
| Rohan | 2 | 2 |
| Meera | 1 | 1 |
| Karthik | 2 | 2 |
| Sana | 1 | 1 |
| Vikram | 1 | 1 |
| Priya | 0 | 1 |

**What to notice.** To count including zeros use `COUNT(o.order_id)`, NOT `COUNT(*)`: Priya's single row (all NULL on the orders side) counts as 1 for `COUNT(*)`.

_Customers with no orders — a LEFT JOIN plus IS NULL (anti-join)_

```sql
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

| name |
|---|
| Priya |

**What to notice.** Here a WHERE on the right table is on purpose: you keep exactly the rows that found no match. Test a column that can never be NULL in the right table (its primary key). `NOT EXISTS` (section 4) says the same thing and reads closer to the question.



### ON vs WHERE in a LEFT JOIN (classic trap)

A filter on the RIGHT table: in ON it preserves unmatched left rows; in WHERE it destroys them (turns LEFT into INNER, because NULL = 'completed' is not true).

_Correct: condition in ON → every customer kept_

```sql
SELECT c.name, COUNT(o.order_id) AS completed
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id AND o.status = 'completed'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;
```

| name | completed |
|---|---|
| Aarav | 2 |
| Diya | 3 |
| Rohan | 1 |
| Meera | 0 |
| Karthik | 1 |
| Sana | 1 |
| Vikram | 0 |
| Priya | 0 |

_WRONG: the same condition in WHERE → 3 customers vanish_

```sql
SELECT c.name, COUNT(o.order_id) AS completed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;
```

| name | completed |
|---|---|
| Aarav | 2 |
| Diya | 3 |
| Rohan | 1 |
| Karthik | 1 |
| Sana | 1 |

**What to notice.** Right-table filter → put it in ON (keeps unmatched). Left-table filter → WHERE is fine. Meera and Vikram are not missing orders: their orders are cancelled. The WHERE runs after the join and deletes those rows, and Priya's all-NULL row goes with them.



### The fan-out trap — one-to-many joins multiply rows

Joining a table to a many-side table repeats the one-side row once per match. A SUM over the one-side column then counts it several times.

```sql
-- WRONG: an order with 3 items is added 3 times
SELECT COUNT(*) AS joined_rows, COUNT(DISTINCT o.order_id) AS distinct_orders,
       SUM(o.amount) AS inflated_total
FROM orders o
JOIN order_items i ON i.order_id = o.order_id;
```

| joined_rows | distinct_orders | inflated_total |
|---|---|---|
| 17 | 9 | 87500.00 |

```sql
-- RIGHT: do not join, just ask "does this order have an item?"
SELECT SUM(o.amount) AS total_amount
FROM orders o
WHERE EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id);
```

| total_amount |
|---|
| 48000.00 |

**What to notice.** 17 joined rows come from only 9 orders. Compare the joined row count with the one-side row count whenever a total looks too big. `SUM(DISTINCT o.amount)` gives 48000 here only by coincidence, because no two of these orders share an amount; with equal amounts it would silently drop one. Use `EXISTS` / `IN`, or total the many-side per order in a subquery before you join.



### More JOIN types — SELF / CROSS / FULL / RIGHT

SELF JOIN = a table joined to itself (compare rows within one table, or follow a parent link). CROSS JOIN = every combination (Cartesian, N×M rows). FULL OUTER JOIN = all rows from both sides, NULLs where unmatched. RIGHT JOIN = mirror of LEFT (keep all right rows).

_SELF JOIN — pairs of customers in the same city (Chennai)_

```sql
SELECT a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b
  ON a.city = b.city AND a.name < b.name
WHERE a.city = 'Chennai'
ORDER BY c1, c2;
```

| c1 | c2 |
|---|---|
| Aarav | Rohan |
| Aarav | Vikram |
| Rohan | Vikram |

_SELF JOIN — each employee and their manager (LEFT keeps the top boss)_

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id
ORDER BY e.emp_id;
```

| employee | manager |
|---|---|
| Asha | NULL |
| Bala | Asha |
| Charu | Asha |
| Dev | Bala |
| Esha | Bala |
| Farhan | Charu |
| Gita | Dev |
| Hari | Dev |
| Isha | Esha |
| Jai | Farhan |

_CROSS JOIN — every customer with every product_

```sql
SELECT COUNT(*) AS customers_x_products
FROM customers CROSS JOIN products;
```

| customers_x_products |
|---|
| 48 |

_FULL OUTER JOIN — not in MySQL_

```sql
-- MySQL: ERROR 1064 (42000) You have an error in your SQL syntax ... near 'FULL OUTER JOIN'
SELECT c.name, o.order_id
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- MySQL: LEFT JOIN UNION RIGHT JOIN gives the same rows
SELECT c.name, o.order_id
FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id
UNION
SELECT c.name, o.order_id
FROM customers c RIGHT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY order_id, name;
```

| name | order_id |
|---|---|
| Priya | NULL |
| Aarav | 1 |
| Aarav | 2 |
| Diya | 3 |
| Diya | 4 |
| Rohan | 5 |
| Rohan | 6 |
| Vikram | 7 |
| Karthik | 8 |
| Karthik | 9 |
| Sana | 10 |
| Meera | 11 |
| Diya | 12 |

**What to notice.** CROSS JOIN has no ON: 8 customers × 6 products = 48 rows. In this data the FULL OUTER result is the 12 orders plus Priya, because every order has a customer (a foreign key guarantees it). A RIGHT JOIN here returns the 12 orders. Prefer LEFT JOIN over RIGHT for readability (just flip the table order). **Postgres:** `FULL OUTER JOIN` works directly.



## 4. Subqueries, CTEs and set operations

### Subqueries — a query inside a query

A list subquery feeds IN (...); a scalar subquery returns one value you compare against. Mindset: 'what smaller value/list do I need first?' → write it, wrap in ( ), plug in.

_List subquery with IN_

```sql
SELECT name FROM customers
WHERE customer_id IN (
    SELECT customer_id FROM orders WHERE status = 'cancelled'
);
```

| name |
|---|
| Vikram |
| Meera |

_Scalar subquery — above-average orders_

```sql
SELECT order_id, amount FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);   -- the average is 4900
```

| order_id | amount |
|---|---|
| 1 | 5000.00 |
| 3 | 8000.00 |
| 8 | 7000.00 |
| 9 | 6000.00 |
| 10 | 9000.00 |

**What to notice.** The scalar subquery runs once and gives one number (4900). AVG skips the NULL amounts, so it divides by 10, not 12. Without an ORDER BY the row order is not guaranteed.



### EXISTS / NOT EXISTS — correlated checks

A correlated subquery references the outer row, so it is evaluated for each outer row. 'Has at least one …' → EXISTS. 'Never / none / no …' → NOT EXISTS (NULL-safe).

_Has at least one pending order_

```sql
SELECT c.name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.customer_id AND o.status = 'pending'
);
```

| name |
|---|
| Rohan |
| Karthik |

_Has NO completed order (the safe 'never')_

```sql
SELECT c.name FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.customer_id AND o.status = 'completed'
);
```

| name |
|---|
| Meera |
| Vikram |
| Priya |

**What to notice.** For 'at least one', a plain JOIN returns one row per match. Give Rohan a second pending order and `customers JOIN orders ON ... AND status = 'pending'` lists Rohan twice (tested inside a rolled-back transaction), while EXISTS lists him once, because it stops at the first match. With a join you would need `SELECT DISTINCT`.

_The NOT IN trap — cities where nobody has a cancelled order_

```sql
-- WRONG: returns 0 rows. The inner list is ('Chennai', NULL), and x NOT IN (..., NULL) is never true.
SELECT name FROM customers
WHERE city NOT IN (
    SELECT c2.city FROM customers c2
    JOIN orders o ON o.customer_id = c2.customer_id
    WHERE o.status = 'cancelled'
);

-- RIGHT: NOT EXISTS (customers with no city are left out on purpose)
SELECT c.name FROM customers c
WHERE c.city IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM customers c2
    JOIN orders o ON o.customer_id = c2.customer_id
    WHERE o.status = 'cancelled' AND c2.city = c.city
);
```

| name |
|---|
| Diya |
| Karthik |
| Sana |

**What to notice.** NOT IN is DANGEROUS if the subquery can return NULL: `x NOT IN (a, NULL)` means `x <> a AND x <> NULL`, which is never true, so the query silently returns zero rows. Prefer NOT EXISTS for anti-joins, or keep the NULLs out of the list (`AND c2.city IS NOT NULL` inside the subquery gives the same 3 rows). Flipping NOT IN into `IN (... status <> 'cancelled')` is not the same question: it asks where somebody has a non-cancelled order.



### ANY / ALL — compare to a subquery set

Compare one value against a whole set from a subquery. x &gt; ALL(set) = greater than every element; x &gt; ANY(set) = greater than at least one. `= ANY(set)` is exactly the same as IN(set).

```sql
-- orders bigger than EVERY pending order (the pending amounts are 2000 and 6000):
SELECT order_id, amount FROM orders
WHERE amount > ALL (
    SELECT amount FROM orders WHERE status = 'pending'
);
```

| order_id | amount |
|---|---|
| 3 | 8000.00 |
| 8 | 7000.00 |
| 10 | 9000.00 |

**What to notice.** `> ALL(set)` means 'bigger than the max' (here 6000). `> ANY(set)` means 'bigger than the min' (here 2000), so the same query with ANY returns 8 rows: orders 1, 2, 3, 6, 8, 9, 10 and 12. NULL amounts never qualify.



### Set operations — UNION / INTERSECT / EXCEPT

Stack the results of two SELECTs that have the same column count and compatible types. UNION removes duplicates; UNION ALL keeps every row (faster). INTERSECT = rows in both. EXCEPT = rows in the first but not the second.

_UNION — in Mumbai OR name starts with 'P'_

```sql
SELECT name FROM customers WHERE city = 'Mumbai'
UNION
SELECT name FROM customers WHERE name LIKE 'P%';
```

| name |
|---|
| Karthik |
| Priya |

_EXCEPT — names ending 'a' that are NOT in Bengaluru_

```sql
SELECT name FROM customers WHERE name LIKE '%a'
EXCEPT
SELECT name FROM customers WHERE city = 'Bengaluru';
```

| name |
|---|
| Meera |
| Priya |

_INTERSECT — names ending 'a' that also have no city_

```sql
SELECT name FROM customers WHERE name LIKE '%a'
INTERSECT
SELECT name FROM customers WHERE city IS NULL;
```

| name |
|---|
| Meera |
| Priya |

**What to notice.** UNION against UNION ALL on the 12 order statuses stacked on themselves: UNION returns 3 rows (the distinct statuses), UNION ALL returns 24. Reach for UNION ALL unless you actually need de-duplication, because UNION does extra work to remove the duplicates. MySQL has INTERSECT and EXCEPT only from 8.0.31; before that you wrote a join or NOT EXISTS.



### CTEs — WITH (name your subproblems)

Compute a result, name it, and use it like a table. Reads top-to-bottom like steps. You can stack: WITH a AS (...), b AS (...) where b uses a.

```sql
WITH customer_totals AS (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
)
SELECT c.name, ct.total
FROM customer_totals ct
JOIN customers c ON c.customer_id = ct.customer_id
WHERE ct.total > 8000;
```

| name | total |
|---|---|
| Diya | 11500.00 |
| Sana | 9000.00 |

**What to notice.** In MySQL 8 a non-recursive CTE is planned like a subquery in FROM: `EXPLAIN` showed the same plan for this CTE and for the same query written as an inline subquery (a `DERIVED` table for the grouped orders). So a CTE is not slower; use it for readability. The same answer also comes from one join with GROUP BY and HAVING (`HAVING SUM(o.amount) > 8000`); group by `customer_id` and `name`, not by `name` alone, or two customers with the same name merge. **Postgres:** before version 12 a CTE was always computed on its own first, which could be slower than the same subquery; from 12 it is inlined unless it is used more than once.



### Recursive CTE — WITH RECURSIVE

Build a result iteratively: an anchor query UNION ALL a recursive query that refers back to the CTE, stopping when it produces no more rows. Used for number/date series and hierarchies (org charts, category trees, graph paths).

_Generate 1..5_

```sql
WITH RECURSIVE nums(n) AS (
    SELECT 1                    -- anchor
    UNION ALL
    SELECT n + 1 FROM nums      -- recursive step
    WHERE n < 5                 -- stop condition
)
SELECT n FROM nums;
```

| n |
|---|
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |

_Walk the manager tree — each employee's level_

```sql
WITH RECURSIVE org AS (
    SELECT emp_id, name, manager_id, 1 AS level           -- anchor: the top of the tree
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.emp_id, e.name, e.manager_id, o.level + 1    -- step: the people reporting to the last round
    FROM employees e
    JOIN org o ON e.manager_id = o.emp_id
)
SELECT name, level FROM org ORDER BY level, name;
```

| name | level |
|---|---|
| Asha | 1 |
| Bala | 2 |
| Charu | 2 |
| Dev | 3 |
| Esha | 3 |
| Farhan | 3 |
| Gita | 4 |
| Hari | 4 |
| Isha | 4 |
| Jai | 4 |

**What to notice.** You MUST have a stop condition or it loops. MySQL aborts a runaway query after 1000 rounds: `ERROR 3636 (HY000): Recursive query aborted after 1001 iterations`. Raise the limit with `SET SESSION cte_max_recursion_depth = ...`. Shape: anchor, UNION ALL, recursive step with a WHERE that eventually fails. In the tree the stop is built in: a person with nobody below them makes the join return no rows.



## 5. Window functions

### Window functions — OVER (summary without collapsing)

Compute across related rows but KEEP every row. Think of `OVER (...)` as a window each row looks through: for every row, the database picks the rows that window shows, runs the function over only those, and writes the answer into a new column. GROUP BY destroys detail; OVER keeps it and attaches the summary.

```sql
SELECT order_id, customer_id, amount,
       SUM(amount) OVER ()                                           AS all_rows,
       SUM(amount) OVER (PARTITION BY customer_id)                   AS per_customer,
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_id) AS running_per_customer
FROM orders
WHERE customer_id IN (1, 2)
ORDER BY order_id;
```

| order_id | customer_id | amount | all_rows | per_customer | running_per_customer |
|---|---|---|---|---|---|
| 1 | 1 | 5000.00 | 19500.00 | 8000.00 | 5000.00 |
| 2 | 1 | 3000.00 | 19500.00 | 8000.00 | 8000.00 |
| 3 | 2 | 8000.00 | 19500.00 | 11500.00 | 8000.00 |
| 4 | 2 | NULL | 19500.00 | 11500.00 | 8000.00 |
| 12 | 2 | 3500.00 | 19500.00 | 11500.00 | 11500.00 |

| Written as | The window of each row is | Result |
|---|---|---|
| `OVER ()` | all the rows | the same number on every row |
| `OVER (PARTITION BY customer_id)` | the rows with the same `customer_id` | one number per customer |
| `OVER (PARTITION BY customer_id ORDER BY order_id)` | the same customer's rows, from the first up to this row | a running total per customer |

**What to notice.** `GROUP BY customer_id` on the same rows would return only two rows (8000.00 and 11500.00) and lose the order detail. `PARTITION BY` is the window's own `GROUP BY`; the `ORDER BY` inside `OVER` sorts the window and, for an aggregate, turns it into a running total. The NULL amount adds nothing, so order 4 repeats 8000.00.



### ROW_NUMBER / RANK / DENSE_RANK

Number rows within a window; the window gets its OWN ORDER BY inside OVER(...). Top-per-group = rank in a CTE, then filter (you can't filter `rn` in the same query).

_Largest order per customer_

```sql
WITH ranked AS (
    SELECT customer_id, order_id, amount,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY amount DESC
           ) AS rn
    FROM orders
)
SELECT customer_id, order_id, amount
FROM ranked
WHERE rn = 1
ORDER BY customer_id;
```

| customer_id | order_id | amount |
|---|---|---|
| 1 | 1 | 5000.00 |
| 2 | 3 | 8000.00 |
| 3 | 6 | 4500.00 |
| 4 | 11 | NULL |
| 5 | 8 | 7000.00 |
| 6 | 10 | 9000.00 |
| 7 | 7 | 1000.00 |

_Top 2 per customer: change `rn = 1` to `rn <= 2` (shown for customers 2 and 3)_

| customer_id | order_id | amount | rn |
|---|---|---|---|
| 2 | 3 | 8000.00 | 1 |
| 2 | 12 | 3500.00 | 2 |
| 3 | 6 | 4500.00 | 1 |
| 3 | 5 | 2000.00 | 2 |

_Ties — the only difference between the three_

```sql
SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary) AS rn,
       RANK()       OVER (ORDER BY salary) AS rnk,
       DENSE_RANK() OVER (ORDER BY salary) AS drnk
FROM employees
ORDER BY salary, name;
```

| name | salary | rn | rnk | drnk |
|---|---|---|---|---|
| Jai | 70000 | 1 | 1 | 1 |
| Gita | 80000 | 2 | 2 | 2 |
| Hari | 80000 | 3 | 2 | 2 |
| Farhan | 90000 | 4 | 4 | 3 |
| Isha | 95000 | 5 | 5 | 4 |
| Dev | 120000 | 6 | 6 | 5 |
| Esha | 125000 | 7 | 7 | 6 |
| Charu | 180000 | 8 | 8 | 7 |
| Bala | 200000 | 9 | 9 | 8 |
| Asha | 300000 | 10 | 10 | 9 |

**What to notice.** Gita and Hari tie. ROW_NUMBER splits the tie (2, 3), RANK gives both 2 and then skips to 4, DENSE_RANK gives both 2 and carries on with 3. MySQL treats NULL as the smallest value, so `ORDER BY amount DESC` puts NULLs last and the largest real amount gets number 1 (customer 4 is reported with NULL only because that is their only order). **Postgres:** the opposite default (`DESC` puts NULLs first), so a NULL amount would grab number 1 unless you write `ORDER BY amount DESC NULLS LAST`. An outer filter cannot undo a bad ordering inside the window.

Window functions are not allowed in WHERE: `WHERE ROW_NUMBER() OVER (ORDER BY order_id) = 1` fails with `ERROR 3593 (HY000): You cannot use the window function 'row_number' in this context`. Compute it in a CTE or subquery and filter outside.



### Nth-highest (the #1 interview question)

Compute DENSE_RANK, then FILTER on the rank. Golden rule: if you compute a rank, you filter on it (WHERE rnk = N) — never bolt on LIMIT/OFFSET (LIMIT can't return ties).

_Second-highest amount_

```sql
WITH ranked AS (
    SELECT amount, DENSE_RANK() OVER (ORDER BY amount DESC) AS d
    FROM orders WHERE amount IS NOT NULL
)
SELECT DISTINCT amount FROM ranked WHERE d = 2;
```

| amount |
|---|
| 8000.00 |

_Third-lowest salary — Farhan, because Gita and Hari tie for 2nd and count as one rank_

```sql
WITH ranked AS (
    SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary) AS d
    FROM employees
)
SELECT name, salary FROM ranked WHERE d = 3;
```

| name | salary |
|---|---|
| Farhan | 90000 |

**What to notice.** DENSE_RANK generalizes to any N and to per-group (add PARTITION BY). `ROW_NUMBER` would return Hari as the 3rd row, and `RANK` has no row with rank 3 at all. For one distinct value only: `SELECT DISTINCT amount ... ORDER BY amount DESC LIMIT 1 OFFSET 1` also gives 8000.00, but it returns a single row and cannot return the people who tie.



### LAG / LEAD — previous / next row

Window functions that read a value from an earlier (LAG) or later (LEAD) row in the ordered window — perfect for row-to-row differences (change vs previous day, gaps, consecutive detection).

```sql
SELECT day, revenue,
       LAG(revenue)  OVER (ORDER BY day) AS prev,
       LEAD(revenue) OVER (ORDER BY day) AS next_day,
       revenue - LAG(revenue) OVER (ORDER BY day) AS change_from_prev
FROM daily_sales
ORDER BY day;
```

| day | revenue | prev | next_day | change_from_prev |
|---|---|---|---|---|
| 2024-03-01 | 100 | NULL | 150 | NULL |
| 2024-03-02 | 150 | 100 | 120 | 50 |
| 2024-03-03 | 120 | 150 | 120 | -30 |
| 2024-03-04 | 120 | 120 | 200 | 0 |
| 2024-03-05 | 200 | 120 | 180 | 80 |
| 2024-03-06 | 180 | 200 | 90 | -20 |
| 2024-03-07 | 90 | 180 | 160 | -90 |
| 2024-03-08 | 160 | 90 | 210 | 70 |
| 2024-03-09 | 210 | 160 | 170 | 50 |
| 2024-03-10 | 170 | 210 | NULL | -40 |

**What to notice.** The edges are NULL by default (no previous row on the first day, no next row on the last). `LAG(revenue, 1, 0)` takes an offset and a default, so the first day shows 0 instead of NULL. Add `PARTITION BY` to restart per group.



### Running totals & moving windows (frames)

Add ORDER BY inside OVER to get a cumulative aggregate. The frame `ROWS BETWEEN … CURRENT ROW` controls which rows are included — running total vs moving average.

```sql
SELECT day, revenue,
       SUM(revenue) OVER (ORDER BY day) AS running_total,
       AVG(revenue) OVER (ORDER BY day
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg3
FROM daily_sales
ORDER BY day;
```

| day | revenue | running_total | moving_avg3 |
|---|---|---|---|
| 2024-03-01 | 100 | 100 | 100.0000 |
| 2024-03-02 | 150 | 250 | 125.0000 |
| 2024-03-03 | 120 | 370 | 123.3333 |
| 2024-03-04 | 120 | 490 | 130.0000 |
| 2024-03-05 | 200 | 690 | 146.6667 |
| 2024-03-06 | 180 | 870 | 166.6667 |
| 2024-03-07 | 90 | 960 | 156.6667 |
| 2024-03-08 | 160 | 1120 | 143.3333 |
| 2024-03-09 | 210 | 1330 | 153.3333 |
| 2024-03-10 | 170 | 1500 | 180.0000 |

**What to notice.** `OVER (ORDER BY x)` alone = running total. `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` = a 3-row moving window (the first rows average fewer rows). Related: `FIRST_VALUE` / `LAST_VALUE`, and `NTILE(n)` for buckets: on this table `FIRST_VALUE(day) OVER (ORDER BY revenue DESC)` is 2024-03-09 on every row, and `NTILE(2) OVER (ORDER BY revenue DESC)` gives 1 to the five biggest days and 2 to the rest.

> [!WARNING]
> **Ties and the default frame.** With `ORDER BY` and no frame, the window runs up to the current row's last tie (frame `RANGE`), so tied rows share one running total. Days 3 and 4 both earn 120, and ordering by revenue gives both a running total of 430, while `ROWS UNBOUNDED PRECEDING` gives 310 and then 430. Write `ROWS` when you mean "row by row".



## 6. Functions and types

### String functions

Join, slice, and reshape text. || and CONCAT join; UPPER/LOWER change case; LENGTH, SUBSTRING, LEFT/RIGHT, TRIM, REPLACE, SPLIT_PART, POSITION do the rest.

_The toolkit (self-contained → provably correct)_

```sql
SELECT 'a' || 'b'               AS concat,
       CONCAT('x', 1, 'y')      AS concat_fn,
       UPPER('hi')              AS upper,
       LENGTH('hello')          AS len,
       SUBSTRING('abcdef', 2, 3) AS sub,
       LEFT('hello', 2)         AS left2,
       TRIM('  x  ')            AS trimmed,
       REPLACE('a-b-c','-','_') AS repl,
       SPLIT_PART('a,b,c', ',', 2) AS part2,
       POSITION('c' IN 'abc')   AS pos;
```

| concat | concat_fn | upper | len | sub | left2 | trimmed | repl | part2 | pos |
|---|---|---|---|---|---|---|---|---|---|
| ab | x1y | HI | 5 | bcd | he | x | a_b_c | b | 3 |

_STRING_AGG — list each city's people_

```sql
SELECT city, STRING_AGG(name, ', ' ORDER BY name) AS people
FROM customers
GROUP BY city;
```

| city | people |
|---|---|
| Bengaluru | Diya, Sana |
| Chennai | Aarav, Rohan, Vikram |
| Mumbai | Karthik |
| NULL | Meera, Priya |

**What to notice.** || returns NULL if ANY operand is NULL — CONCAT() ignores NULLs. STRING_AGG(expr, sep ORDER BY …) concatenates a group; ARRAY_AGG builds an array.



### Date & time functions

Dates support arithmetic and field extraction. Date − Date = integer days; add/subtract an INTERVAL. EXTRACT/DATE_PART pulls a field; DATE_TRUNC rounds down (great for grouping by month).

```sql
SELECT EXTRACT(YEAR FROM DATE '2024-03-15')    AS yr,
       EXTRACT(DOW  FROM DATE '2024-03-15')    AS dow,
       DATE_TRUNC('month', DATE '2024-03-15')  AS month_start,
       DATE '2024-03-15' - DATE '2024-03-01'   AS days_between,
       DATE '2024-03-15' + INTERVAL '7 days'   AS next_week,
       AGE(DATE '2024-03-15', DATE '2000-01-01') AS age;
```

| yr | dow | month_start | days_between | next_week | age |
|---|---|---|---|---|---|
| 2024 | 5 | 2024-03-01 00:00:00 | 14 | 2024-03-22 00:00:00 | 24 years 2 mons 14 days |

**What to notice.** CURRENT_DATE / NOW() / CURRENT_TIMESTAMP give the current date/time. (Literals used below so the output is deterministic.)



### CAST & numeric functions

Convert types with CAST(x AS type) or the Postgres shorthand x::type. Numeric helpers: ROUND, CEIL, FLOOR, ABS, MOD/%, GREATEST, LEAST.

```sql
SELECT 5 / 2            AS int_div,
       5.0 / 2          AS real_div,
       '42'::int + 8    AS casted,
       ROUND(2.567, 2)  AS rounded,
       CEIL(2.1)        AS ceil,
       FLOOR(2.9)       AS floor,
       ABS(-7)          AS abs,
       17 % 5           AS modulo,
       GREATEST(3,9,4)  AS greatest,
       LEAST(3,9,4)     AS least;
```

| int_div | real_div | casted | rounded | ceil | floor | abs | modulo | greatest | least |
|---|---|---|---|---|---|---|---|---|---|
| 2 | 2.5 | 50 | 2.57 | 3 | 2 | 7 | 2 | 9 | 3 |

**What to notice.** Integer ÷ integer TRUNCATES: 5 / 2 = 2. Cast a side to numeric for a real result: 5::numeric / 2 = 2.5 (or write 5.0 / 2).



## 7. Changing data and speed

### INSERT / UPDATE / DELETE / UPSERT

Modify data. INSERT adds rows, UPDATE changes them, DELETE removes them. UPSERT = INSERT … ON CONFLICT (insert, or update if the key already exists — Postgres).

```sql
INSERT INTO customers (customer_id, name, city)
VALUES (9, 'Nisha', 'Pune');

UPDATE orders SET status = 'completed'
WHERE order_id = 4;            -- no WHERE = updates ALL rows!

DELETE FROM orders WHERE status = 'cancelled';

-- UPSERT: insert, or update the existing row on key clash
INSERT INTO customers (customer_id, name)
VALUES (1, 'Aarav K')
ON CONFLICT (customer_id)
DO UPDATE SET name = EXCLUDED.name;
```

**What to notice.** ALWAYS pair UPDATE and DELETE with WHERE — without it they hit EVERY row. Add RETURNING \* to get the affected rows back.



### EXPLAIN + indexes — making queries fast

EXPLAIN ANALYZE shows the plan. Seq Scan = reads the whole table (fine if small; bad for selective lookups on big tables). Index Scan = jumps straight to matching rows.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 5;
```

_Add an index on the column you look up by_

```sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
```

**What to notice.** Index HELPS: WHERE/JOIN/ORDER BY columns on large, selective lookups. USELESS: tiny tables, low-selectivity columns (status with 3 values). COSTS: storage + slower INSERT/UPDATE.



## 8. Keyword glossary

| Keyword | Use it for |
|---|---|
| `SELECT / FROM` | pick columns / table |
| `WHERE` | filter rows (before grouping) |
| `IS NULL / IS NOT NULL` | test for NULL (never = NULL) |
| `AND OR IN BETWEEN` | combine / range conditions |
| `ORDER BY LIMIT OFFSET` | sort / cap / paginate |
| `COUNT SUM AVG MIN MAX` | aggregates (skip NULLs) |
| `GROUP BY` | aggregate per group |
| `HAVING` | filter groups (after grouping) |
| `JOIN / INNER JOIN` | rows matched in both tables |
| `LEFT JOIN` | keep all left rows |
| `ON` | join match rule |
| `IN (subquery)` | membership in a list |
| `scalar ( SELECT … )` | single-value subquery |
| `WITH … AS` | CTE (named subproblem) |
| `OVER (PARTITION BY … ORDER BY …)` | window function |
| `ROW_NUMBER RANK DENSE_RANK` | numbering within a window |
| `NULLS LAST` | control NULL sort position |
| `EXISTS / NOT EXISTS` | correlated existence / absence |
| `COALESCE / NULLIF` | NULL handling |
| `CASE WHEN` | conditional logic / pivots |
| `EXPLAIN [ANALYZE]` | inspect the query plan |
| `CREATE INDEX` | speed up selective lookups |
| `DISTINCT / DISTINCT ON` | drop duplicate rows / first row per group |
| `LIKE / ILIKE` | pattern match (% _); ILIKE = case-insensitive |
| `SELF / CROSS / FULL / RIGHT JOIN` | self-pair / cartesian / keep both / keep right |
| `UNION [ALL] / INTERSECT / EXCEPT` | stack result sets (ALL keeps duplicates) |
| `LAG / LEAD` | previous / next row's value in a window |
| `… OVER (ORDER BY … ROWS BETWEEN)` | running total / moving window |
| `\|\| CONCAT UPPER LENGTH SUBSTRING TRIM` | string functions |
| `STRING_AGG / ARRAY_AGG` | concatenate group values / build array |
| `EXTRACT DATE_TRUNC AGE INTERVAL` | date & time |
| `CAST(x AS t) / x::t` | type conversion |
| `ROUND CEIL FLOOR ABS MOD GREATEST LEAST` | numeric functions |
| `WITH RECURSIVE` | recursive CTE (sequences / hierarchies) |
| `GROUP BY ROLLUP / CUBE / GROUPING SETS` | subtotals & grand totals |
| `INSERT / UPDATE / DELETE` | modify data (UPDATE/DELETE need WHERE!) |
| `ON CONFLICT … DO UPDATE` | upsert (Postgres) |
| `ANY / ALL` | compare a value to a subquery set |



## 9. Traps to remember

> [!WARNING]
> NULL comparisons silently drop rows. Use IS NULL; aggregates skip NULLs; COUNT(col) ≠ COUNT(\*).

> [!WARNING]
> LEFT JOIN filter placement: a right-table condition goes in ON, not WHERE.

> [!WARNING]
> Rank then filter: compute a rank, then WHERE rnk = N. Don't bolt on LIMIT/OFFSET.

> [!WARNING]
> Anti-joins: 'never / no' → NOT EXISTS on the ABSENT thing (not IN, not the wrong status).

> [!WARNING]
> Read the whole prompt: every qualifier — sort, exact output columns, filter — must land in the query.

> [!WARNING]
> Integer ÷ integer truncates: 5 / 2 = 2. Cast a side to numeric: 5::numeric / 2 = 2.5.

> [!WARNING]
> UNION removes duplicates and sorts (costly). Use UNION ALL when you don't need de-duplication.

> [!WARNING]
> LIKE is case-sensitive in Postgres — use ILIKE for case-insensitive matching.

> [!WARNING]
> UPDATE / DELETE without WHERE change EVERY row. Filter first (and RETURNING \* to verify).

> [!WARNING]
> || with any NULL operand yields NULL — use CONCAT() (ignores NULLs) or COALESCE.


