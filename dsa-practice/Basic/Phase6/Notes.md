# Phase 6 - Basic Hashing Notes

This phase focuses on understanding the basics of **hashing** in DSA.

Hashing is one of the most important concepts in problem solving because it helps in:

* counting frequencies
* checking existence quickly
* reducing time complexity
* solving lookup based problems efficiently

---

# 1. What is Hashing?

## Definition

Hashing is a technique used to **store and access data quickly** using a key.

Instead of searching linearly every time, hashing helps us answer many questions in:

```text id="2mx0pw"
O(1) average time
```

---

## Best Way to Think

Hashing is mainly used when we want to answer questions like:

* how many times does this number appear?
* does this number exist?
* which number appears most?
* what is the frequency of each element?

---

## Example

Given:

```text id="iv2pbr"
[1, 2, 1, 3, 2, 1]
```

We may want to know:

* frequency of `1` → `3`
* frequency of `2` → `2`
* frequency of `3` → `1`

Hashing helps solve this efficiently.

---

# 2. Why Hashing is Important

Without hashing, many frequency or lookup problems are solved using nested loops.

That makes time complexity:

```text id="1rb4dd"
O(n²)
```

With hashing, the same work is often reduced to:

```text id="9zve6m"
O(n)
```

That is why hashing is very powerful.

---

# 3. Where Hashing is Used

Hashing is commonly used in:

* frequency counting
* duplicate detection
* finding repeating / non-repeating elements
* checking presence of elements
* string character counting
* array based problem solving

Later in DSA, hashing is heavily used in:

* arrays
* strings
* sliding window
* maps / sets
* prefix sum problems

---

# 4. Basic Idea of Hashing

Hashing means:

> store useful information in a structure so that it can be accessed quickly later

The most common useful information stored is:

* frequency
* existence
* count

---

# 5. Ways to Do Hashing in C++

At beginner level, hashing is usually done using:

* arrays
* `map`
* `unordered_map`

---

# 6. Basic Hashing

---

## Problem Idea

Given an array, answer questions like:

* how many times does a number appear?
* does a number exist?

---

## Example

```text id="w4qq5o"
Array = [1, 2, 1, 3, 2, 1]
```

If someone asks:

* frequency of `1` → `3`
* frequency of `2` → `2`

We should be able to answer quickly.

---

## Brute Force Approach

For every query:

* scan the whole array
* count manually

### Time Complexity

```text id="6m1yd6"
O(n) per query
```

If many queries are asked, this becomes slow.

---

## Better Thinking

Instead of counting again and again, count everything once and store it.

Then answer directly.

That is hashing.

---

## Core Idea

```text id="vg2z2q"
precompute once → answer many times
```

This is one of the biggest benefits of hashing.

---

# 7. Hashing Using Array

This method is useful when:

* values are small
* range is known

---

## Example

If array elements are between `0` and `100`, we can make a frequency array.

Example idea:

```text id="52w1ti"
freq[x] = how many times x appears
```

---

## Example

For:

```text id="0d3xaj"
[1, 2, 1, 3, 2, 1]
```

Frequency array concept becomes:

```text id="q50tlr"
freq[1] = 3
freq[2] = 2
freq[3] = 1
```

---

## When to Use This

Use array hashing when:

* numbers are small
* no negative values
* max value is manageable

---

## Limitation

This is **not good** when:

* numbers are very large
* numbers are negative
* range is huge

Example:

```text id="o6zh0f"
10^9
```

We cannot make array of that size.

---

# 8. Hashing Using `map`

This is the most important beginner hashing tool.

---

## What `map` Does

A `map` stores:

```text id="vq6xd3"
key → value
```

In hashing problems:

```text id="vjq90o"
element → frequency
```

---

## Example

For:

```text id="qqpk8a"
[1, 2, 1, 3, 2, 1]
```

We can store:

```text id="5vc6s4"
1 → 3
2 → 2
3 → 1
```

---

## Why Useful

Because now:

* frequency can be found directly
* no repeated counting needed

---

## Important Point

### `map`

* sorted by key
* slower than unordered_map

### `unordered_map`

* not sorted
* usually faster
* average O(1)

---

# 9. Counting Frequencies of Array Elements

This is one of the most important beginner hashing problems.

---

## Problem

Given an array, count frequency of each element.

---

## Example

```text id="ofe9ne"
Input:  [4, 2, 4, 5, 2, 2, 7]
Output:
4 → 2
2 → 3
5 → 1
7 → 1
```

---

## Observation

Every element may repeat multiple times.

So instead of checking each number again and again, store its count.

---

## Best Way to Think

For every element:

```text id="6wn9sp"
increase its frequency by 1
```

That’s the full idea.

---

## Core Logic

When visiting an element:

* if seen first time → frequency becomes 1
* if already seen → increase frequency

---

## Data Structure Used

Best choices:

* `map`
* `unordered_map`

---

## What This Problem Teaches

This single problem teaches:

* hashing basics
* frequency mapping
* repeated value tracking
* map usage

This is why it is a **very important problem**.

---

## Common Mistakes

* trying nested loops first even when hashing is clearly better
* forgetting to print all frequencies
* confusing value with index

---

# 10. Highest Occurring Element in an Array

This is a direct application of frequency hashing.

---

## Problem

Find the element that appears the maximum number of times in an array.

---

## Example

```text id="9u4x7m"
Input:  [1, 2, 2, 3, 1, 2]
Output: 2
```

Because:

```text id="h4n6k0"
1 → 2 times
2 → 3 times
3 → 1 time
```

So answer = `2`

---

## Best Way to Think

This problem is solved in **2 steps**:

### Step 1

Store frequency of every element

### Step 2

Find which frequency is maximum

---

## Core Idea

Hashing helps count everything first.
Then answer is found by checking the maximum frequency.

---

## What This Problem Teaches

This problem teaches:

* using frequency for decision making
* comparing mapped values
* deriving answer after preprocessing

---

## Important Edge Case

What if **multiple elements** have same highest frequency?

Example:

```text id="qodx03"
[1, 1, 2, 2, 3]
```

Now:

* `1 → 2`
* `2 → 2`

Both have same highest frequency.

So problem statement should decide:

* smallest one?
* first occurring one?
* any one?

Always read this carefully.

---

## Common Mistakes

* returning frequency instead of element
* ignoring tie cases
* using brute force unnecessarily

---

# 11. Brute Force vs Hashing

This is very important to understand.

---

## Brute Force

For each element:

* count manually by scanning whole array

### Time Complexity

```text id="5bks6s"
O(n²)
```

---

## Hashing

* count frequencies once
* answer from stored values

### Time Complexity

```text id="t35o2c"
O(n)
```

---

## Final Insight

Whenever problem involves:

* frequency
* repetition
* counting
* existence

Always think:

```text id="gu5gfi"
Can hashing help here?
```

This is one of the best DSA habits.

---

# 12. `map` vs `unordered_map`

This is important for beginners.

---

## `map`

* stores keys in sorted order
* operations are slower than unordered_map
* good when sorted output is needed

### Time Complexity

```text id="1b3weo"
O(log n)
```

---

## `unordered_map`

* no sorted order
* usually faster
* best for most frequency / lookup problems

### Time Complexity

```text id="yyx7ss"
O(1) average
```

---

## Best Beginner Rule

Use:

### `unordered_map`

when:

* order does not matter
* fast lookup is needed

Use:

### `map`

when:

* sorted output is required

---

# 13. Common Patterns in Hashing

These ideas repeat again and again.

---

## 1. Frequency Count

```text id="gpt4q8"
element → frequency
```

Used in:

* counting occurrences
* highest frequency
* duplicates
* anagrams

---

## 2. Existence Check

```text id="c2ifvp"
element → present or not
```

Used in:

* duplicate check
* lookup problems

---

## 3. Query Answering

Precompute once, answer many times.

Used in:

* frequency queries
* range / repeated checks

---

# 14. Common Mistakes in Basic Hashing

* using brute force even when hashing is obvious
* confusing index and value
* forgetting that array hashing needs small range
* using array hashing for very large numbers
* not handling repeated maximum frequency carefully
* not understanding when to use map vs unordered_map

---

# 15. How to Identify a Hashing Problem

Whenever a problem asks something like:

* how many times does x occur?
* which element occurs most?
* is this element present?
* find duplicates
* count frequencies

Immediately think:

```text id="1p7gg2"
Hashing
```

That is the biggest takeaway from this phase.

---

# Final Understanding

This phase is small, but very important.

Because it introduces one of the most useful DSA tools:

## Hashing

And once hashing becomes natural, many problems become much easier.

---

# Final Goal

If after this phase you can:

* count frequencies confidently
* use map / unordered_map correctly
* solve highest occurring element problems
* identify when hashing is useful

👉 then your hashing foundation is strong

---

# Final Truth

Hashing is one of the first major problem-solving shortcuts in DSA.

It turns many slow brute force problems into fast and elegant solutions.
