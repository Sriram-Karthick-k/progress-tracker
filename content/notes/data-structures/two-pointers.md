# Two Pointers

**When:** a sorted array where you need a pair/triplet, or an in-place
partition/dedupe.

## Converging (opposite ends)

```java
int l = 0, r = a.length - 1;
while (l < r) {
    int sum = a[l] + a[r];
    if (sum == target) return new int[]{l, r};
    if (sum < target) l++; else r--;
}
```

Move the pointer that can only improve the sum. O(n) time, O(1) space.

## Same direction (slow / fast)

- **slow** writes the next kept element, **fast** scans ahead.
- Powers dedupe, move-zeroes, and partition problems.

## Traps

- Forgetting to skip duplicates in 3Sum → duplicate triplets.
- Off-by-one when `l == r`.
