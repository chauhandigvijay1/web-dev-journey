# Space Complexity Notes

Space Complexity is used to measure **how much memory an algorithm uses** with respect to input size.

It helps us understand how efficient a solution is in terms of **memory usage**.

---

# 1. Why Space Complexity is Important

In DSA, not only time but also memory matters.

Sometimes:

* a faster solution uses more memory
* a slower solution uses less memory

We need to balance both.

---

# 2. What is Measured in Space Complexity

Space complexity includes:

* input space
* extra space (auxiliary space)

---

## Important Concept

### Total Space = Input Space + Extra Space

But in DSA, we mainly focus on:

```text
Auxiliary Space (Extra Space)
```

---

# 3. Types of Space

---

## 3.1 Input Space

Memory used to store input.

Example:

* array of size `n` → O(n)
* string of length `n` → O(n)

We usually **do not count this** in complexity.

---

## 3.2 Auxiliary Space

Extra memory used by the algorithm / to solve the problem.

Example:

* extra array
* map / set
* recursion stack
* variables

👉 This is what we focus on.

---

# 4. Common Space Complexities

---

## 4.1 O(1) → Constant Space

### Meaning

No extra memory is used.

### Examples

* swapping variables
* using few variables
* in-place operations

---

## 4.2 O(n) → Linear Space

### Meaning

Extra memory grows with input size.

### Examples

* creating new array of size n
* storing frequency map
* copying elements

---

## 4.3 O(n²)

### Meaning

2D structures or nested storage.

### Example

* matrix of size n × n

---

## 4.4 O(log n)

### Meaning

Memory used in recursion stack (divide by 2 type)

### Example

* binary search recursion

---

# 5. Space Complexity in Loops

Loops usually use:

```text
O(1)
```

Because:

* only few variables are used
* no extra storage created

---

# 6. Space Complexity in Arrays

---

## Example 1: In-place Reverse

Uses only:

* 2 pointers

### Space

```text
O(1)
```

---

## Example 2: Copy Array

Creating new array:

### Space

```text
O(n)
```

---

# 7. Space Complexity in Recursion

This is very important.

---

## Key Idea

Each recursive call uses stack memory.

---

## Example

```text
f(n) → f(n-1)
```

Total calls = n

### Space

```text
O(n)
```

---

## Example: Fibonacci (recursive)

```text
f(n) → f(n-1) + f(n-2)
```

Calls are many, but stack depth is:

```text
O(n)
```

---

## Example: Binary Search (recursive)

Each call halves input:

### Space

```text
O(log n)
```

---

# 8. Space Complexity of Sorting Algorithms

---

## Bubble Sort

```text
O(1)
```

(in-place)

---

## Selection Sort

```text
O(1)
```

---

## Insertion Sort

```text
O(1)
```

---

## Merge Sort

```text
O(n)
```

(extra array needed for merging)

---

## Quick Sort

### Average

```text
O(log n)
```

(recursion stack)

### Worst Case

```text
O(n)
```

---

# 9. Space Complexity of Hashing

---

## Using `map` / `unordered_map`

If storing `n` elements:

```text
O(n)
```

---

## Frequency Array

If range is small:

```text
O(n)
```

(or based on range)

---

# 10. Space Complexity of STL Containers

---

## vector

```text
O(n)
```

---

## set / unordered_set

```text
O(n)
```

---

## map / unordered_map

```text
O(n)
```

---

## stack / queue

```text
O(n)
```

---

## priority_queue

```text
O(n)
```

---

# 11. In-place vs Extra Space

---

## In-place Algorithm

Uses:

```text
O(1)
```

extra space

Example:

* bubble sort
* reversing array using two pointers

---

## Not In-place

Uses extra memory.

Example:

* merge sort
* creating new arrays

---

# 12. Common Beginner Mistakes

---

## 1. Counting input space

We usually ignore input size.

Focus on extra space.

---

## 2. Ignoring recursion stack

Recursive functions use stack memory.

---

## 3. Confusing time and space

* loops → time
* storage → space

---

## 4. Assuming all sorting is O(1)

Merge sort uses extra space.

---

# 13. Time vs Space Trade-off

Sometimes:

* faster solution uses more memory
* slower solution uses less memory

Example:

* using hashing → faster, but O(n) space
* brute force → slower, but O(1) space

---

# 14. How to Think About Space

When solving a problem, ask:

1. Am I creating extra arrays?
2. Am I using map / set?
3. Is recursion used?
4. Can I solve in-place?

---

# 15. Best Practice

Try to:

* reduce unnecessary extra space
* prefer in-place solutions when possible
* understand when extra space is required

---

# Final Understanding

Space complexity helps us understand:

* how much memory is used
* whether solution is memory efficient
* trade-offs between speed and memory

---

# Final Goal

If you can:

* identify extra memory used
* analyze recursion stack space
* differentiate in-place vs extra space
* understand STL memory usage

👉 then your space complexity understanding is strong

---

# Final Truth

Efficient coding is not just about speed.

It is also about **using memory wisely**.
