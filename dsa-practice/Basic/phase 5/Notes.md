# Phase 5 - Basic Recursion Notes

This phase focuses on understanding **recursion fundamentals**.

Goal:

* understand how recursion works
* build recursive thinking
* learn base condition handling
* understand function call flow

---

# 1. What is Recursion?

## Definition

Recursion is when a function calls itself to solve a smaller version of the same problem.

---

## Best Way to Think

Recursion works like:

```text
Big problem → smaller problem → smaller problem → ... → base case → return
```

---

## Example Idea

To print numbers from 1 to N:

Instead of doing everything at once:

* print 1
* then solve for 2 to N

That is recursion.

---

# 2. Structure of Recursion

Every recursive function has 3 parts:

---

## 1. Base Case (MOST IMPORTANT)

This is the stopping condition.

```text
if(n == 0) stop
```

Without this:

* infinite recursion happens
* program crashes (stack overflow)

---

## 2. Work

Do some operation.

Example:

* print
* add
* multiply

---

## 3. Recursive Call

Call the same function with a smaller input.

```text
f(n) → f(n-1)
```

---

# 3. Recursion Flow (VERY IMPORTANT)

Understanding flow is the key.

---

## Example

```text
f(3)
→ f(2)
→ f(1)
→ f(0) (base case)
```

Then it returns:

```text
f(0) returns
f(1) resumes
f(2) resumes
f(3) resumes
```

---

## Key Idea

There are two phases:

### 1. Going Down (calls)

### 2. Coming Back (returns)

---

# 4. Types of Recursion Thinking

---

## 1. Print Before Call

```text
print
call recursion
```

Used in:

* print N to 1

---

## 2. Print After Call

```text
call recursion
print
```

Used in:

* print 1 to N

---

## 3. Work + Return

```text
return n + f(n-1)
```

Used in:

* sum
* factorial

---

# 5. Problems Covered

---

# 5.1 Understand Recursion (Print Something N Times)

## Idea

If you print once, remaining task is:
→ print N-1 times

---

## Logic

* print
* call recursion for smaller N

---

## What it teaches

* recursion structure
* base condition

---

# 5.2 Print Name N Times

## Idea

Same as above but controlled repetition.

---

## Key Thinking

Each call reduces work by 1.

---

# 5.3 Print 1 to N

## Idea

We want output:

```text
1 2 3 4 5
```

---

## Best Thinking

First solve smaller problem:
→ print 1 to n-1

Then print n

---

## Important Insight

Print happens **after recursive call**

---

# 5.4 Print N to 1

## Idea

We want:

```text
5 4 3 2 1
```

---

## Best Thinking

Print first, then reduce problem.

---

## Important Insight

Print happens **before recursive call**

---

# 5.5 Sum of First N Numbers

## Idea

```text
sum(n) = n + sum(n-1)
```

---

## Example

```text
sum(5)
= 5 + sum(4)
= 5 + 4 + sum(3)
...
```

---

## Base Case

```text
sum(0) = 0
```

---

## What it teaches

* returning values
* building answer from recursion

---

# 5.6 Factorial of a Number

## Formula

```text
fact(n) = n * fact(n-1)
```

---

## Example

```text
5! = 5 × 4 × 3 × 2 × 1
```

---

## Base Case

```text
fact(0) = 1
```

---

## Important Insight

Factorial naturally breaks into smaller problem.

---

# 5.7 Reverse an Array

## Idea

Swap outer elements:

```text
arr[l] ↔ arr[r]
```

Then solve smaller array inside.

---

## Thinking

```text
[1 2 3 4 5]
swap 1 & 5
→ solve [2 3 4]
```

---

## What it teaches

* recursion + two pointers
* index handling

---

# 5.8 Check Palindrome (String)

## Idea

Compare:

```text
s[l] == s[r]
```

If true → move inward

---

## Example

```text
"madam"
m == m
a == a
d == d
```

---

## Base Case

Stop when:

```text
l >= r
```

---

## What it teaches

* recursion on strings
* condition-based recursion

---

# 5.9 Fibonacci Number

## Formula

```text
f(n) = f(n-1) + f(n-2)
```

---

## Example

```text
0 1 1 2 3 5 8
```

---

## Base Case

```text
f(0) = 0
f(1) = 1
```

---

## Important Insight

Each call splits into two calls → recursion tree

---

## Warning

This solution is **slow (exponential)**
Later we optimize using DP.

---

# 6. Important Concepts

---

## 6.1 Parameterized vs Functional Recursion

---

### Parameterized

Pass answer in parameter

Example:

```text
sum(i, total)
```

---

### Functional

Return answer

Example:

```text
return n + f(n-1)
```

---

## 6.2 Recursion Tree

Some recursion creates multiple calls:

Example:

* Fibonacci

This increases time complexity.

---

## 6.3 Backtracking (Basic Idea)

After reaching base case, function starts returning.

That return phase is used in:

* subsets
* permutations
* advanced recursion

---

# 7. Common Mistakes

---

## 1. Missing Base Case

→ infinite recursion

---

## 2. Wrong Base Case

→ wrong answer

---

## 3. Infinite Loop

If input is not reducing

Example:

```text
f(n) → f(n)
```

---

## 4. Not Understanding Flow

Confusion between:

* before call
* after call

---

## 5. Stack Overflow

Too many recursive calls without stopping

---

# 8. How to Think Recursively (BEST METHOD)

---

## Step 1

Assume recursion works for smaller input

---

## Step 2

Solve current problem using smaller result

---

## Step 3

Define base case

---

## Example

```text
sum(n)
= n + sum(n-1)
```

---

# 9. Golden Rules

---

## Rule 1

Every recursion must have base case

---

## Rule 2

Input must reduce every time

---

## Rule 3

Understand flow (down + up)

---

## Rule 4

Don’t try to trace everything initially

---

# Final Goal

If you can:

* write recursive functions confidently
* identify base case correctly
* understand call flow
* solve basic recursion problems

👉 then your recursion foundation is strong

---

# Final Truth

Recursion is not difficult.

It feels difficult because:

* flow is invisible
* calls happen internally

Once you understand:

* base case
* smaller problem
* return flow

Recursion becomes simple.
