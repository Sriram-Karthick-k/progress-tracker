# 1. Contest 1: five problems, easy to hard

| # | Problem | Level | Points | Start date | Start time | Status |
|---|---|---|---|---|---|---|
| Q1 | [860 Lemonade Change](https://leetcode.com/problems/lemonade-change/) | Easy | 3 | | | Solved |
| Q2 | [1094 Car Pooling](https://leetcode.com/problems/car-pooling/) | Medium | 4 | | | Solved |
| Q3 | [767 Reorganize String](https://leetcode.com/problems/reorganize-string/) | Medium | 5 | | | Solved |
| Q4 | [97 Interleaving String](https://leetcode.com/problems/interleaving-string/) | Medium | 6 | | | Not started |
| Q5 | [1235 Maximum Profit in Job Scheduling](https://leetcode.com/problems/maximum-profit-in-job-scheduling/) | Hard | 8 | | | Not started |

Status values: Not started, In progress, Solved, Skipped. Time box: 2 hours 30 minutes in total, 26 points. Java, submitted on LeetCode, then the code is pasted for review.

## Q1. Lemonade Change (Easy, 3 points)

At a lemonade stand, each lemonade costs `$5`. Customers are standing in a queue to buy from you and order one at a time, in the order given by the array `bills`. Each customer buys exactly one lemonade and pays with a `$5`, `$10` or `$20` bill. You must give each customer the correct change, so that the net transaction is that the customer pays `$5`. You start with no change in hand.

Given an integer array `bills`, where `bills[i]` is the bill the `i`-th customer pays with, return `true` if you can give every customer the correct change, or `false` otherwise.

```text
Example 1
Input:  bills = [5,5,5,10,20]
Output: true

Example 2
Input:  bills = [5,5,10,10,20]
Output: false
```

Constraints: `1 <= bills.length <= 100000`, and `bills[i]` is `5`, `10` or `20`.

```java
public boolean lemonadeChange(int[] bills)
```

## Q2. Car Pooling (Medium, 4 points)

A car has `capacity` empty seats. The car only drives east and cannot turn around. You are given the integer `capacity` and an array `trips`, where `trips[i] = [numPassengers, from, to]` means that the `i`-th trip has `numPassengers` passengers, who are picked up at location `from` and dropped off at location `to`. Locations are given as the number of kilometres due east of the car's starting point.

Return `true` if it is possible to pick up and drop off all the passengers of all the trips, or `false` otherwise.

```text
Example 1
Input:  trips = [[2,1,5],[3,3,7]], capacity = 4
Output: false

Example 2
Input:  trips = [[2,1,5],[3,3,7]], capacity = 5
Output: true
```

Constraints: `1 <= trips.length <= 1000`, `trips[i].length == 3`, `1 <= numPassengers <= 100`, `0 <= from < to <= 1000`, `1 <= capacity <= 100000`.

```java
public boolean carPooling(int[][] trips, int capacity)
```

## Q3. Reorganize String (Medium, 5 points)

Given a string `s`, rearrange its characters so that no two adjacent characters are the same. Return any possible rearrangement of `s`, or return an empty string `""` if no such rearrangement exists.

```text
Example 1
Input:  s = "aab"
Output: "aba"

Example 2
Input:  s = "aaab"
Output: ""
```

Constraints: `1 <= s.length <= 500`, and `s` consists of lowercase English letters.

```java
public String reorganizeString(String s)
```

## Q4. Interleaving String (Medium, 6 points)

Given strings `s1`, `s2` and `s3`, return `true` if `s3` is formed by an interleaving of `s1` and `s2`, and `false` otherwise. An interleaving of two strings `s` and `t` is a configuration where `s` and `t` are divided into `n` and `m` non-empty substrings respectively, such that `s = s1 + s2 + ... + sn`, `t = t1 + t2 + ... + tm`, `|n - m| <= 1`, and the interleaving is `s1 + t1 + s2 + t2 + ...` or `t1 + s1 + t2 + s2 + ...`. Here `a + b` is the concatenation of `a` and `b`.

```text
Example 1
Input:  s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"
Output: true

Example 2
Input:  s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"
Output: false

Example 3
Input:  s1 = "", s2 = "", s3 = ""
Output: true
```

Constraints: `0 <= s1.length, s2.length <= 100`, `0 <= s3.length <= 200`, and all three strings consist of lowercase English letters.

```java
public boolean isInterleave(String s1, String s2, String s3)
```

## Q5. Maximum Profit in Job Scheduling (Hard, 8 points)

There are `n` jobs. Job `i` is scheduled from `startTime[i]` to `endTime[i]` and earns `profit[i]`. Given the arrays `startTime`, `endTime` and `profit`, return the maximum profit you can earn, such that no two chosen jobs overlap in time. If you choose a job that ends at time `X`, you may start another job that starts at time `X`.

```text
Example 1
Input:  startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]
Output: 120

Example 2
Input:  startTime = [1,2,3,4,6], endTime = [3,5,10,6,9], profit = [20,20,100,70,60]
Output: 150

Example 3
Input:  startTime = [1,1,1], endTime = [2,3,4], profit = [5,6,4]
Output: 6
```

Constraints: `1 <= startTime.length == endTime.length == profit.length <= 50000`, `1 <= startTime[i] < endTime[i] <= 1000000000`, `1 <= profit[i] <= 10000`.

```java
public int jobScheduling(int[] startTime, int[] endTime, int[] profit)
```
