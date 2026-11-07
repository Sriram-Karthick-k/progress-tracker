# 4. SQL Cheat Sheet — Queries, Joins, Windows & Interview Patterns

One page, in the order you learn it: reading rows, grouping, joins, subqueries, window functions, functions, then changing data. PostgreSQL syntax; every example runs against the sample data below, and results are shown where they teach something.

## Sample data

```sql
CREATE TABLE customers (
    customer_id  INT PRIMARY KEY,
    name         TEXT,
    city         TEXT,          -- some NULLs
    signup_date  DATE
);

CREATE TABLE orders (
    order_id     INT PRIMARY KEY,
    customer_id  INT REFERENCES customers(customer_id),
    order_date   DATE,
    amount       NUMERIC,       -- some NULLs
    status       TEXT           -- 'completed' / 'pending' / 'cancelled'
);
```

- Priya (id 8) has no orders.
- Meera (id 4) has a NULL city and only a cancelled order.
- Orders 4 and 11 have a NULL amount.
- 12 orders total; 10 have a non-NULL amount (sum 49000, avg 4900).



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

SELECT chooses the columns, FROM chooses the table. \* means all columns.

```sql
SELECT name, city FROM customers;
```

**What to notice.** Text values use single quotes ('Chennai'). Double quotes mean column/table names in Postgres.



### WHERE — pick rows

Keeps only rows where the condition is TRUE. Operators: = , &lt;&gt; (not equal), &gt; , &lt; , &gt;= , &lt;=.

```sql
SELECT order_id, amount, status
FROM orders
WHERE status = 'completed' AND amount < 6000;
```

| order_id | amount | status |
|---|---|---|
| 1 | 5000 | completed |
| 2 | 3000 | completed |
| 6 | 4500 | completed |
| 12 | 3500 | completed |

**What to notice.** Order 4 (completed but NULL amount) is absent — a comparison with NULL is never TRUE.



### NULL — 'unknown', not zero

NULL means unknown. ANY comparison with NULL is 'unknown' (not true), so those rows are silently dropped — and = NULL never works.

_WRONG — returns 0 rows_

```sql
SELECT * FROM orders WHERE amount = NULL;
```

_0 rows (= NULL is never true)_

_RIGHT — use IS NULL_

```sql
SELECT name FROM customers WHERE city IS NULL;
```

| name |
|---|
| Meera |
| Priya |

**What to notice.** Rule: never use = NULL or &lt;&gt; NULL. Always IS NULL / IS NOT NULL.



### COALESCE / NULLIF — NULL utilities

COALESCE(a, b, …) = first non-NULL. NULLIF(a, b) = NULL if a = b (e.g. NULLIF(divisor, 0) to dodge divide-by-zero).

```sql
SELECT order_id, COALESCE(amount, 0) AS amount_or_zero
FROM orders WHERE order_id IN (3, 4, 11);
```

| order_id | amount_or_zero |
|---|---|
| 3 | 8000 |
| 4 | 0 |
| 11 | 0 |



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
| 1 | 5000 |
| 2 | 3000 |
| 6 | 4500 |
| 8 | 7000 |
| 9 | 6000 |
| 12 | 3500 |



### LIKE / ILIKE — pattern matching

Match text against a pattern: % = any run of characters, _ = exactly one character. NOT LIKE negates.

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

**What to notice.** LIKE is CASE-SENSITIVE in Postgres. Use ILIKE for case-insensitive. (MySQL LIKE is case-insensitive by default.)



### DISTINCT — remove duplicates

DISTINCT drops duplicate rows, looking at ALL selected columns together (not just the first). DISTINCT ON (col) is a Postgres extra that keeps the first row per group.

_Unique cities_

```sql
SELECT DISTINCT city FROM customers;
```

| city |
|---|
| Chennai |
| Bengaluru |
| Mumbai |
| NULL |

_DISTINCT ON — highest order per customer (Postgres)_

```sql
SELECT DISTINCT ON (customer_id) customer_id, order_id, amount
FROM orders
ORDER BY customer_id, amount DESC NULLS LAST;
```

| customer_id | order_id | amount |
|---|---|---|
| 1 | 1 | 5000 |
| 2 | 3 | 8000 |
| … | … | … |

**What to notice.** SELECT DISTINCT a, b removes duplicate (a,b) PAIRS — not duplicates of a alone.



### ORDER BY / LIMIT / OFFSET — sort & cap

ORDER BY sorts (DESC = high→low, ASC = low→high default). LIMIT n caps rows; LIMIT n OFFSET m = skip m, take n (pagination).

```sql
SELECT order_id, amount
FROM orders
WHERE amount IS NOT NULL
ORDER BY amount DESC
LIMIT 3;
```

| order_id | amount |
|---|---|
| 10 | 9000 |
| 3 | 8000 |
| 8 | 7000 |

**What to notice.** Always pair LIMIT with ORDER BY, or 'top N' is undefined. (SQL Server uses TOP instead of LIMIT.)



## 2. Aggregation and grouping

### Aggregates — COUNT SUM AVG MIN MAX

Collapse many rows into one summary. Aggregates SKIP NULLs.

```sql
SELECT COUNT(*) AS cnt, COUNT(amount) AS cnt_amt,
       SUM(amount) AS total, AVG(amount) AS avg,
       MIN(amount) AS mn, MAX(amount) AS mx
FROM orders;
```

| cnt | cnt_amt | total | avg | mn | mx |
|---|---|---|---|---|---|
| 12 | 10 | 49000 | 4900 | 1000 | 9000 |

**What to notice.** COUNT(\*) = 12 (all rows) but COUNT(amount) = 10 (non-NULL only). AVG divides by 10, not 12 → 49000/10 = 4900.



### GROUP BY — aggregate per group

Splits rows into piles and aggregates each pile — one row out per group. NULLs form their own single group.

```sql
SELECT status, COUNT(*) AS cnt, SUM(amount) AS total
FROM orders
GROUP BY status;
```

| status | cnt | total |
|---|---|---|
| cancelled | 2 | 1000 |
| completed | 8 | 40000 |
| pending | 2 | 8000 |

**What to notice.** The rule: every SELECT column must be in GROUP BY or inside an aggregate.



### HAVING — filter the groups

WHERE filters rows BEFORE grouping; HAVING filters groups AFTER (and can use aggregates).

```sql
SELECT city, COUNT(*) AS cnt
FROM customers
GROUP BY city
HAVING COUNT(*) >= 2;
```

| city | cnt |
|---|---|
| NULL | 2 |
| Bengaluru | 2 |
| Chennai | 3 |

**What to notice.** Pipeline order: WHERE → GROUP BY → HAVING.



### CASE + conditional aggregation (pivot)

CASE WHEN … THEN … ELSE … END is SQL's if/else. Inside an aggregate it pivots rows → columns.

```sql
SELECT status,
       SUM(CASE WHEN amount > 4000 THEN 1 ELSE 0 END) AS big,
       SUM(CASE WHEN amount <= 4000 THEN 1 ELSE 0 END) AS small
FROM orders
GROUP BY status;
```

| status | big | small |
|---|---|---|
| cancelled | 0 | 1 |
| completed | 5 | 2 |
| pending | 1 | 1 |

**What to notice.** Two equal ways to count a category: SUM(CASE WHEN cond THEN 1 ELSE 0 END) (portable) or COUNT(\*) FILTER (WHERE cond) (Postgres-native, cleaner).



### GROUP BY extensions — ROLLUP / CUBE

Add subtotal and grand-total rows to a GROUP BY. ROLLUP(a, b) gives totals for (a,b), then (a), then the grand total (). CUBE(a, b) gives every combination. GROUPING SETS lets you list exactly which groupings you want.

```sql
SELECT status, COUNT(*) AS cnt
FROM orders
GROUP BY ROLLUP(status);
```

| status | cnt |
|---|---|
| cancelled | 2 |
| completed | 8 |
| pending | 2 |
| NULL | 12 |

**What to notice.** The extra row with NULL in the grouped column is the subtotal/grand total. Use GROUPING(col) to tell a subtotal NULL apart from a real data NULL.



## 3. Joins

### JOIN (INNER) — combine two tables

Match rows across tables on a shared column (ON = the match rule). INNER JOIN keeps only rows matched in BOTH tables. Use table aliases.

_first rows_

```sql
SELECT o.order_id, c.name, o.status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;
```

| order_id | name | status |
|---|---|---|
| 1 | Aarav | completed |
| 2 | Aarav | completed |
| 3 | Diya | completed |
| … | … | … |



### LEFT JOIN — keep unmatched left rows

Keeps EVERY left-table row; the right side is NULL where there's no match. (a LEFT JOIN b == b RIGHT JOIN a.)

```sql
SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.name IN ('Aarav','Priya');
```

| name | order_id |
|---|---|
| Aarav | 1 |
| Aarav | 2 |
| Priya | NULL |

_counting including zeros_

```sql
SELECT c.name, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;
```

| name | order_count |
|---|---|
| Aarav | 2 |
| … | … |
| Priya | 0 |

**What to notice.** To count including zeros use COUNT(o.order_id), NOT COUNT(\*) — COUNT(\*) would count the NULL row as 1.



### ON vs WHERE in a LEFT JOIN (classic trap)

A filter on the RIGHT table: in ON it preserves unmatched left rows; in WHERE it destroys them (turns LEFT into INNER, because NULL = 'completed' is not true).

_Correct: condition in ON → every customer kept_

```sql
SELECT c.name, COUNT(o.order_id) AS completed
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id AND o.status = 'completed'
GROUP BY c.customer_id, c.name;
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

**What to notice.** Right-table filter → put in ON (keeps unmatched). Left-table filter → WHERE is fine.



### More JOIN types — SELF / CROSS / FULL / RIGHT

SELF JOIN = a table joined to itself (compare rows within one table). CROSS JOIN = every combination (Cartesian, N×M rows). FULL OUTER JOIN = all rows from both sides, NULLs where unmatched. RIGHT JOIN = mirror of LEFT (keep all right rows).

_SELF JOIN — pairs of customers in the same city (Chennai)_

```sql
SELECT a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b
  ON a.city = b.city AND a.name < b.name
WHERE a.city = 'Chennai';
```

| c1 | c2 |
|---|---|
| Aarav | Rohan |
| Aarav | Vikram |
| Rohan | Vikram |

_FULL OUTER / RIGHT (shape)_

```sql
-- keep unmatched rows from BOTH tables:
SELECT c.name, o.order_id
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- RIGHT JOIN keeps all RIGHT rows (= LEFT JOIN with tables flipped):
SELECT c.name, o.order_id
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id;
```

**What to notice.** CROSS JOIN has no ON. FULL OUTER keeps unmatched rows from BOTH tables. Prefer LEFT JOIN over RIGHT for readability (just flip the table order).



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
| Meera |
| Vikram |

_Scalar subquery — above-average orders_

```sql
SELECT order_id, amount FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);   -- > 4900
```

| order_id | amount |
|---|---|
| 1 | 5000 |
| 3 | 8000 |
| 8 | 7000 |
| 9 | 6000 |
| 10 | 9000 |



### EXISTS / NOT EXISTS — correlated checks

A correlated subquery references the outer row and re-runs per row. 'Has at least one …' → EXISTS/IN. 'Never / none / no …' → NOT EXISTS (NULL-safe).

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

**What to notice.** NOT IN is DANGEROUS if the subquery can return NULL — it can silently return zero rows. Prefer NOT EXISTS for anti-joins.



### ANY / ALL — compare to a subquery set

Compare one value against a whole set from a subquery. x &gt; ALL(set) = greater than every element; x &gt; ANY(set) = greater than at least one. '= ANY(set)' is exactly the same as IN(set).

```sql
-- orders bigger than EVERY pending order:
SELECT order_id, amount FROM orders
WHERE amount > ALL (
    SELECT amount FROM orders WHERE status = 'pending'
);
```

**What to notice.** &gt; ALL(set) means 'bigger than the max'; &gt; ANY(set) means 'bigger than the min'. If the set is empty, ALL is true and ANY is false.



### Set operations — UNION / INTERSECT / EXCEPT

Stack the results of two SELECTs that have the same column count & types. UNION removes duplicates (and sorts); UNION ALL keeps every row (faster). INTERSECT = rows in both. EXCEPT = rows in the first but not the second.

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

**What to notice.** Reach for UNION ALL unless you actually need de-duplication — UNION pays to sort & dedupe.



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
| Diya | 11500 |
| Sana | 9000 |



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

**What to notice.** You MUST have a stop condition or it loops forever. Shape: anchor  UNION ALL  recursive-step  WHERE &lt;stop&gt;.



## 5. Window functions

### Window functions — OVER (summary without collapsing)

Compute across related rows but KEEP every row. OVER () = whole table; OVER (PARTITION BY x) = per group. GROUP BY destroys detail; OVER keeps it and attaches the summary.

```sql
SELECT order_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id) AS cust_total
FROM orders
WHERE customer_id IN (1, 2);
```

| order_id | customer_id | amount | cust_total |
|---|---|---|---|
| 1 | 1 | 5000 | 8000 |
| 2 | 1 | 3000 | 8000 |
| 3 | 2 | 8000 | 11500 |
| 4 | 2 | NULL | 11500 |
| 12 | 2 | 3500 | 11500 |



### ROW_NUMBER / RANK / DENSE_RANK

Number rows within a window; the window gets its OWN ORDER BY inside OVER(...). Top-per-group = rank in a CTE, then filter (you can't filter rn in the same query).

_Largest order per customer (customers 1 & 2)_

```sql
WITH ranked AS (
    SELECT customer_id, order_id, amount,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY amount DESC NULLS LAST
           ) AS rn
    FROM orders
)
SELECT customer_id, order_id, amount
FROM ranked
WHERE rn = 1;
```

| customer_id | order_id | amount |
|---|---|---|
| 1 | 1 | 5000 |
| 2 | 3 | 8000 |

_Ties — the only difference between the three (illustrative)_

```sql
SELECT order_id, amount,
       RANK()       OVER (ORDER BY amount DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY amount DESC) AS drnk
FROM orders WHERE amount IS NOT NULL;
```

| value | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 100 | 1 | 1 | 1 |
| 100 | 2 | 1 | 1 |
| 90 | 3 | 3 | 2 |
| 80 | 4 | 4 | 3 |

**What to notice.** Postgres gotcha: ORDER BY x DESC puts NULLs FIRST — a NULL amount would wrongly grab rn=1. Fix INSIDE the window with DESC NULLS LAST. An outer filter can't undo a bad ordering.



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
| 8000 |

**What to notice.** DENSE_RANK generalizes to any N and to per-group (add PARTITION BY). Alt for distinct value: ORDER BY amount DESC LIMIT 1 OFFSET 1.



### LAG / LEAD — previous / next row

Window functions that read a value from an earlier (LAG) or later (LEAD) row in the ordered window — perfect for row-to-row differences (change vs previous day, gaps, consecutive detection).

_Change vs the previous day (illustrative)_

```sql
SELECT day, revenue,
       LAG(revenue) OVER (ORDER BY day)          AS prev,
       revenue - LAG(revenue) OVER (ORDER BY day) AS change
FROM daily;
```

| day | revenue | prev | change |
|---|---|---|---|
| 1 | 100 | NULL | NULL |
| 2 | 150 | 100 | 50 |
| 3 | 120 | 150 | -30 |

**What to notice.** Edges are NULL by default. Optional args: LAG(col, offset, default). Add PARTITION BY to reset per group. (Table below is illustrative.)



### Running totals & moving windows (frames)

Add ORDER BY inside OVER to get a cumulative aggregate. The frame ROWS BETWEEN … CURRENT ROW controls which rows are included — running total vs moving average.

_Cumulative sum + 3-row moving average (illustrative)_

```sql
SELECT day, revenue,
       SUM(revenue) OVER (ORDER BY day) AS running_total,
       AVG(revenue) OVER (ORDER BY day
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg3
FROM daily;
```

| day | revenue | running_total | moving_avg3 |
|---|---|---|---|
| 1 | 100 | 100 | 100 |
| 2 | 150 | 250 | 125 |
| 3 | 120 | 370 | 123.33 |

**What to notice.** OVER (ORDER BY x) alone = running total. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW = a 3-row moving window. Related: FIRST_VALUE/LAST_VALUE, NTILE(n) for buckets. (Illustrative.)



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


