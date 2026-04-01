# Phase 3 - Notes

This phase contains important **Basic Maths problems**.

These problems help in improving:

* number logic
* digit manipulation
* divisibility understanding
* mathematical observation
* optimization thinking

---

# Before Solving Basic Maths Problems

For most maths based number problems, these ideas are used again and again:

* `% 10` → gives last digit
* `/ 10` → removes last digit
* loop until number becomes `0`
* divisor logic
* square root optimization

These are the most important building blocks of this phase.

---

# 1. Count all Digits of a Number

## Problem

Find how many digits are present in a given number.

---

## Example

* `12345` → `5`
* `7` → `1`
* `1000` → `4`

---

## Observation

Every time we divide a number by `10`, one digit gets removed from the right side.

Example:

```text id="aep06v"
12345 → 1234 → 123 → 12 → 1 → 0
```

So the number of times this happens = total digits.

---

## Best Way to Think

Keep removing the last digit until the number becomes `0`.

---

## Logic

* initialize count = 0
* while number > 0:

  * divide by 10
  * increase count

---

## Important Points

* `0` is a special case → it has **1 digit**
* if negative number is given, use absolute value if needed

---

## Common Mistakes

* forgetting special case for `0`
* confusing digit count with sum of digits

---

# 2. Reverse a Number

## Problem

Reverse the digits of a given number.

---

## Example

* `1234` → `4321`
* `560` → `65`
* `101` → `101`

---

## Observation

To reverse a number, we need to take digits from the end one by one.

Example:

```text id="y3aq3s"
1234
last digit = 4
remaining = 123
```

Then keep building a new number.

---

## Best Way to Think

Take the last digit and attach it to the answer.

---

## Logic

At each step:

* last digit = `n % 10`
* remove last digit = `n / 10`
* answer = `answer * 10 + last digit`

---

## Important Points

* reversed number should start from `0`
* trailing zeros of original number disappear after reverse

Example:

```text id="95v4k8"
1200 → 21
```

---

## Common Mistakes

* forgetting to multiply answer by `10`
* modifying original number without storing it when needed later

---

# 3. Palindrome Number

## Problem

Check whether a number reads the same forward and backward.

---

## Example

* `121` → palindrome
* `1331` → palindrome
* `123` → not palindrome

---

## Observation

A number is palindrome if:

```text id="olw4m1"
original number == reversed number
```

So this problem directly uses the reverse-number logic.

---

## Best Way to Think

Reverse the number and compare it with the original.

---

## Logic

* store original number
* reverse the number
* compare both values

---

## Important Points

* always store original number before changing it
* if numbers are same after reverse → palindrome

---

## Common Mistakes

* forgetting to store original value
* directly comparing after original number has already become `0`

---

# 4. GCD of Two Numbers

## Problem

Find the **Greatest Common Divisor (GCD)** of two numbers.

---

## Example

* `12, 18` → GCD = `6`
* `20, 28` → GCD = `4`

---

## Meaning

GCD is the largest number that divides both numbers exactly.

---

## Observation

A divisor of both numbers is called a common divisor.
The greatest among them is the GCD.

---

## Brute Force Idea

Check all numbers from `1` to `min(a, b)`
and find the largest number dividing both.

This works, but it is slow.

---

## Best Way to Think

Use **Euclidean Algorithm**

### Core Idea

```text id="sk9vq5"
gcd(a, b) = gcd(b, a % b)
```

This keeps reducing the problem size.

---

## Why it Works

If a number divides both `a` and `b`, it will also divide `a % b`.

So the gcd remains same.

---

## Important Points

* if `b == 0`, then gcd is `a`
* this is much faster than brute force

---

## Common Mistakes

* solving only with brute force
* not understanding why modulo is used

---

# 5. Check if the Number is Armstrong

## Problem

Check whether a number is an Armstrong number.

---

## Example

`153`

Digits:

* `1`
* `5`
* `3`

Now:

```text id="j6p5ew"
1³ + 5³ + 3³ = 153
```

So it is an Armstrong number.

---

## Meaning

A number is Armstrong if:

> sum of each digit raised to the power of total number of digits
> = original number

---

## Best Way to Think

Break the number into digits and process each digit separately.

---

## Logic

* count total digits
* extract each digit one by one
* raise digit to the power of total digits
* add them
* compare with original number

---

## Important Points

* for 3-digit numbers, power is 3
* for generic solution, power should be total digit count

---

## Common Mistakes

* hardcoding cube only
* forgetting to count digits first

---

# 6. Print all Divisors

## Problem

Print all numbers that divide `n` exactly.

---

## Example

For `12`:

```text id="dygg2u"
1 2 3 4 6 12
```

---

## Observation

Divisors always come in pairs.

Example for `12`:

* `1 × 12`
* `2 × 6`
* `3 × 4`

So if `i` is a divisor, then `n / i` is also a divisor.

---

## Brute Force Idea

Check every number from `1` to `n`.

This works, but it is slow.

---

## Best Way to Think

Only check till:

```text id="w9d1zz"
sqrt(n)
```

Because divisors come in pairs.

---

## Optimized Logic

For every `i` from `1` to `sqrt(n)`:

* if `n % i == 0`

  * `i` is divisor
  * `n / i` is also divisor

---

## Important Points

* if `i == n/i`, print/store only once
* divisors may not come in sorted order automatically

---

## Common Mistakes

* checking till `n`
* printing duplicate divisor when `i*i == n`

---

# 7. Check for Prime Number

## Problem

Check whether a number is prime.

---

## Meaning

A prime number has exactly **2 divisors**:

* `1`
* itself

---

## Example

* `2, 3, 5, 7, 11` → prime
* `4, 6, 8, 9` → not prime

---

## Observation

If a number has any divisor other than `1` and itself, then it is not prime.

---

## Brute Force Idea

Check all numbers from `1` to `n` and count divisors.

This works, but it is not efficient.

---

## Best Way to Think

A non-prime number must have a divisor less than or equal to:

```text id="k4mpyn"
sqrt(n)
```

So we only need to check till there.

---

## Optimized Logic

For every `i` from `2` to `sqrt(n)`:

* if `n % i == 0`

  * not prime

If no divisor is found → prime

---

## Important Points

* `1` is **not prime**
* `2` is prime
* checking till `sqrt(n)` is enough

---

## Common Mistakes

* treating `1` as prime
* checking till `n-1` unnecessarily

---

# Common Patterns Used in This Phase

These ideas repeat again and again:

---

## 1. Digit Extraction

Used in:

* count digits
* reverse number
* palindrome
* armstrong

### Core operations

```text id="x3b1jm"
last digit = n % 10
remove digit = n / 10
```

---

## 2. Divisor Logic

Used in:

* gcd
* print divisors
* prime check

### Core idea

Check divisibility using:

```text id="e8a2w8"
n % i == 0
```

---

## 3. Optimization Using Square Root

Used in:

* divisors
* prime
* gcd related thinking

### Core idea

Instead of checking till `n`, many times checking till `sqrt(n)` is enough.

---

# Common Mistakes in Phase 4

* forgetting edge case for `0`
* forgetting `1` is not prime
* using brute force where optimized logic exists
* modifying original number and losing it
* printing duplicate divisors
* confusing reverse logic and palindrome logic

---

# Final Understanding

This phase may look small, but it teaches very important DSA habits:

* observing number patterns
* using loops properly
* thinking in optimized ways
* solving mathematically instead of blindly coding

---

# Final Goal

If after this phase you can:

* extract digits confidently
* reverse numbers correctly
* solve prime/divisor/gcd problems
* understand brute vs optimized approach

👉 then your maths foundation for DSA is strong

---

# Final Truth

Basic maths is not just a “starter topic”.

It builds the exact kind of thinking that helps later in:

* hashing
* recursion
* binary search
* number theory
* problem solving
