# Time Complexity Notes

Time Complexity is used to measure **how the running time of an algorithm grows with input size**.

It does **not** mean exact seconds.
It tells us how efficient or inefficient a solution is as input becomes large.

---

# 1. Why Time Complexity is Important

When solving DSA problems, there can be multiple solutions:

* brute force
* better
* optimized

Time complexity helps us compare them.

A solution that works for small input may fail for large input if its time complexity is poor.

---

# 2. What is `n`?

In most problems:

```text id="yo99xg"
n = size of input
```

Examples:

* array of size `n`
* string of length `n`
* number of elements in vector
* number of nodes in a tree / graph

---

# 3. Big-O Notation

Time complexity is usually written using **Big-O notation**.

Examples:

```text id="j5oqw2"
O(1)
O(n)
O(log n)
O(n²)
```

Big-O describes the **worst case growth** of an algorithm.

---

# 4. Common Time Complexities

---

## 4.1 `O(1)` → Constant Time

### Meaning

Time does not depend on input size.

### Examples

* accessing array element by index
* `push_back()` in vector (average)
* `top()` of stack
* `front()` of queue
* checking `size()` of STL containers

### Example Idea

No matter if input has 10 elements or 1,000,000 elements, operation still takes roughly same time.

---

## 4.2 `O(log n)` → Logarithmic Time

### Meaning

Work reduces very fast in each step.

### Common Pattern

Input gets divided by 2 (or reduced significantly) every time.

### Examples

* binary search
* some operations in `set` / `map`
* repeatedly dividing by 2

### Example Idea

If every step cuts the search space in half, complexity becomes logarithmic.

---

## 4.3 `O(n)` → Linear Time

### Meaning

Work grows directly with input size.

### Examples

* traversing an array
* traversing a string
* finding max/min by scanning
* counting frequency using one loop

### Example Idea

If you visit each element once → `O(n)`

---

## 4.4 `O(n log n)` → Linearithmic Time

### Meaning

A very important efficient complexity in DSA.

### Examples

* merge sort
* quick sort (average case)
* STL `sort()`

This is considered efficient for sorting and many important algorithms.

---

## 4.5 `O(n²)` → Quadratic Time

### Meaning

Usually comes from nested loops.

### Examples

* comparing every pair
* bubble sort
* selection sort
* insertion sort (worst case)

### Example Idea

If one loop runs `n` times and inside it another loop also runs `n` times:

```text id="sqr1m5"
O(n × n) = O(n²)
```

---

## 4.6 `O(2^n)` / Exponential Time

### Meaning

Very slow for large inputs.

### Examples

* naive recursive Fibonacci
* subset / recursion brute force problems

---

# 5. Best, Average, Worst Case

Some algorithms behave differently depending on input.

---

## Best Case

Fastest possible case

## Average Case

Normal / expected case

## Worst Case

Slowest possible case

In DSA, we usually focus more on **worst case**.

---

# 6. How to Find Time Complexity

This is the most important practical section.

---

# 7. Rules to Calculate Time Complexity

---

## Rule 1: Ignore constants

```text id="ayj9zv"
O(2n) = O(n)
O(5n) = O(n)
```

Because for large inputs, constants do not matter much.

---

## Rule 2: Keep the dominant term only

```text id="tvzjlwm"
O(n² + n + 10) = O(n²)
O(n log n + n) = O(n log n)
```

Only the fastest-growing term matters.

---

## Rule 3: Add for separate parts

If two independent loops run one after another:

```text id="qjkg0w"
O(n) + O(n) = O(2n) = O(n)
```

---

## Rule 4: Multiply for nested loops

If one loop is inside another:

```text id="nuh2hl"
O(n) × O(n) = O(n²)
```

---

# 8. Time Complexity of Loops

---

## 8.1 Single Loop

```cpp id="7axtl3"
for(int i = 0; i < n; i++)
```

### Complexity

```text id="3cshsm"
O(n)
```

Because loop runs `n` times.

---

## 8.2 Nested Loops

```cpp id="9b4m4r"
for(int i = 0; i < n; i++) {
    for(int j = 0; j < n; j++) {
    }
}
```

### Complexity

```text id="hl49op"
O(n²)
```

---

## 8.3 Triangular Loop Pattern

```cpp id="avprap"
for(int i = 0; i < n; i++) {
    for(int j = 0; j <= i; j++) {
    }
}
```

### Complexity

```text id="o0cpm9"
O(n²)
```

Because total iterations become:

```text id="ytx8hj"
1 + 2 + 3 + ... + n
```

which is still `O(n²)`.

---

## 8.4 Loop Dividing by 2

```cpp id="trrvdw"
while(n > 1) {
    n = n / 2;
}
```

### Complexity

```text id="ttbik6"
O(log n)
```

---

# 9. Time Complexity of Recursion

Recursion complexity depends on:

* how many recursive calls happen
* how much work is done in each call

---

## 9.1 Single Recursive Call

Example:

```text id="c1r96u"
f(n) → f(n-1)
```

### Complexity

```text id="ykjplh"
O(n)
```

Examples:

* factorial
* sum of first n
* print 1 to n

---

## 9.2 Two Recursive Calls

Example:

```text id="qz2xlt"
f(n) → f(n-1) + f(n-2)
```

### Complexity

```text id="kthjse"
O(2^n)
```

Example:

* recursive Fibonacci

This becomes slow very quickly.

---

## 9.3 Merge Sort Style Recursion

### Complexity

```text id="92j6ar"
O(n log n)
```

Because:

* array is divided recursively
* merge work happens at every level

---

# 10. Time Complexity of Basic Sorting

---

## Bubble Sort

### Complexity

```text id="q2c6jk"
O(n²)
```

---

## Selection Sort

### Complexity

```text id="5ny0o6"
O(n²)
```

---

## Insertion Sort

### Best Case

```text id="igkn3b"
O(n)
```

### Worst Case

```text id="bl06ea"
O(n²)
```

---

## Merge Sort

### Complexity

```text id="0y9qk2"
O(n log n)
```

---

## Quick Sort

### Average Case

```text id="c48qmt"
O(n log n)
```

### Worst Case

```text id="q6ofw1"
O(n²)
```

---

# 11. Time Complexity of Hashing

---

## Frequency Count Using `map`

### Complexity

```text id="lu7v7a"
O(n log n)
```

Because each insertion/search in `map` takes `O(log n)`.

---

## Frequency Count Using `unordered_map`

### Complexity

```text id="1tv4ti"
O(n) average
```

Because each insertion/search is average `O(1)`.

---

# 12. Time Complexity of Important STL Containers

---

# 12.1 `vector`

## Access by index

```text id="lbyhko"
O(1)
```

## Insert at end (`push_back`)

```text id="b3qwyv"
O(1) average
```

## Insert / erase in middle

```text id="l1krfx"
O(n)
```

## Search

```text id="xix3vf"
O(n)
```

---

# 12.2 `set`

## Insert

```text id="x2ndiv"
O(log n)
```

## Erase

```text id="f9u77p"
O(log n)
```

## Find

```text id="mxsmu8"
O(log n)
```

---

# 12.3 `unordered_set`

## Insert

```text id="22klzt"
O(1) average
```

## Erase

```text id="s3g6w2"
O(1) average
```

## Find

```text id="3rrvym"
O(1) average
```

---

# 12.4 `map`

## Insert

```text id="c6mby8"
O(log n)
```

## Access / Find

```text id="ocjlwm"
O(log n)
```

---

# 12.5 `unordered_map`

## Insert

```text id="1c7tzm"
O(1) average
```

## Access / Find

```text id="apjlwm"
O(1) average
```

---

# 12.6 `priority_queue`

## Insert

```text id="s9fmkd"
O(log n)
```

## Remove top

```text id="i99osd"
O(log n)
```

## Access top

```text id="6xhjtt"
O(1)
```

---

# 12.7 `stack`

## push / pop / top

```text id="npr5q5"
O(1)
```

---

# 12.8 `queue`

## push / pop / front

```text id="vbxh15"
O(1)
```

---

# 13. Time Complexity of Common STL Algorithms

---

## `sort()`

```text id="7nlu2n"
O(n log n)
```

---

## `reverse()`

```text id="7b2x0f"
O(n)
```

---

## `find()`

```text id="0mylsz"
O(n)
```

---

## `count()`

```text id="8jz01n"
O(n)
```

---

## `binary_search()`

```text id="xwe26d"
O(log n)
```

(only on sorted data)

---

## `lower_bound()` / `upper_bound()`

```text id="mh0xqj"
O(log n)
```

(only on sorted data)

---

## `min_element()` / `max_element()`

```text id="r6p5ef"
O(n)
```

---

## `accumulate()`

```text id="zkxw5h"
O(n)
```

---

## `next_permutation()`

```text id="gjlwm8"
O(n)
```

---

# 14. How to Improve in Time Complexity

Whenever you solve a problem, always ask:

1. What is my brute force complexity?
2. Can I reduce nested loops?
3. Can hashing help?
4. Can sorting help?
5. Can binary search help?
6. Can I preprocess something?

This habit is what actually improves problem solving.

---

# 15. Best Practical Mindset

When solving any problem:

### First write brute force

Then ask:

```text id="epz7ps"
Can I do better?
```

That is how optimization starts.

---

# Final Truth

A correct solution is good.

But in DSA, an **efficient correct solution** is what really matters.
