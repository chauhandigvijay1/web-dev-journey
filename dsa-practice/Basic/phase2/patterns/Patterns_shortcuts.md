# Pattern Shortcuts

This file contains the **fastest way to think** while solving pattern problems.

Goal:

* identify pattern type quickly
* avoid confusion
* write loops with confidence
* solve without memorizing code

---

# 1. Golden Rule

Every pattern is built using only these things:

* rows
* columns
* spaces
* stars / numbers / characters

That means every pattern can be reduced to:

```text id="qcb0xq"
for every row:
    print spaces (if needed)
    print left part
    print middle spaces (if needed)
    print right part
```

---

# 2. Most Important Identification Trick

Before coding any pattern, ask:

## Q1. Is it fixed, increasing, decreasing, or symmetric?

This one question solves half the confusion.

---

# 3. Pattern Type Recognition

---

## A. Fixed Pattern

Example:

```text id="z2utqo"
*****
*****
*****
*****
*****
```

### Shortcut

* rows fixed
* columns fixed

### Formula

* rows = `n`
* cols = `n`

---

## B. Increasing Triangle

Examples:

```text id="on9e4w"
*
**
***
****
```

```text id="g6z5ma"
1
12
123
1234
```

```text id="tr0sp6"
A
AB
ABC
ABCD
```

### Shortcut

* row number decides count
* row `i` → print `i` times

### Formula

* count = `i`

---

## C. Decreasing Triangle

Examples:

```text id="dl8vq7"
*****
****
***
**
*
```

```text id="8jlwmn"
12345
1234
123
12
1
```

### Shortcut

* row 1 starts full
* then count decreases

### Formula

* count = `n - i + 1`

---

## D. Pyramid / Centered Pattern

Example:

```text id="d4szt0"
    *
   ***
  *****
 *******
```

### Shortcut

* left spaces + odd stars

### Formula

* spaces = `n - i`
* stars = `2*i - 1`

### Golden Line

If pattern is centered → **spaces will always matter**

---

## E. Inverted Pyramid

Example:

```text id="1a2zvo"
*******
 *****
  ***
   *
```

### Formula

* spaces = `i - 1`
* stars = `2*(n-i)+1`

---

## F. Diamond Pattern

Example:

```text id="e1ojpn"
    *
   ***
  *****
   ***
    *
```

### Shortcut

* upper half + lower half

### Golden Rule

If pattern looks symmetric top-bottom → split into **2 parts**

---

## G. Left + Right Symmetry Pattern

Examples:

```text id="r8z3vv"
1      1
12    21
123  321
12344321
```

```text id="cdj7b9"
*      *
**    **
***  ***
********
```

### Shortcut

Break every row into 3 parts:

1. left block
2. middle spaces
3. right block

### Golden Rule

Never solve these as one big pattern.

Always split into blocks.

---

## H. Hollow Pattern

Example:

```text id="4edwmo"
****
*  *
*  *
****
```

### Shortcut

Only print boundary.

### Boundary Means

* first row
* last row
* first column
* last column

### Condition Idea

```text id="6kz2hb"
if first row OR last row OR first col OR last col
```

---

## I. Special Logic Pattern

Examples:

* binary triangle
* running number triangle
* concentric number pattern

### Shortcut

These are not based only on stars/spaces.
They need:

* parity logic
* counter variable
* distance logic

---

# 4. Most Useful Formulas (Must Remember)

These formulas solve many patterns directly.

---

## Increasing count

```text id="n6o8be"
count = i
```

Used in:

* triangle patterns
* increasing stars / numbers / chars

---

## Decreasing count

```text id="n7atvo"
count = n - i + 1
```

Used in:

* inverted triangles

---

## Left spaces for pyramid

```text id="o5yq9v"
spaces = n - i
```

---

## Left spaces for inverted pyramid

```text id="xzh4ua"
spaces = i - 1
```

---

## Odd stars in centered pyramid

```text id="0zql0k"
stars = 2*i - 1
```

---

## Odd stars in inverted pyramid

```text id="b9uqm8"
stars = 2*(n-i) + 1
```

---

## Middle spaces in mirror patterns

```text id="8rcs2x"
spaces = 2*(n-i)
```

Used in:

* crown pattern
* butterfly pattern
* symmetric patterns

---

# 5. Pattern Solving Roadmap (Use Every Time)

Whenever you see a new pattern:

---

## Step 1 - Look only at row 1, row 2, row 3

Don’t stare at the full pattern.

Just compare first few rows.

Ask:

* what increased?
* what decreased?
* what stayed same?

---

## Step 2 - Count spaces and symbols in each row

Example:

```text id="n63m8q"
row 1 -> 4 spaces, 1 star
row 2 -> 3 spaces, 3 stars
row 3 -> 2 spaces, 5 stars
```

Now pattern becomes easy.

---

## Step 3 - Decide the family

Ask:

* fixed?
* increasing?
* decreasing?
* centered?
* mirrored?
* hollow?
* special?

Once family is known, code becomes easier.

---

## Step 4 - Break pattern into parts

This is the most powerful trick.

### Common breakdowns:

* upper + lower
* left + right
* boundary + inside

---

## Step 5 - Then only code

Never start coding immediately.

First understand.

---

# 6. Pattern Families (Fast Revision)

This is the best way to remember all 22 patterns quickly.

---

## Family 1 - Fixed

* Pattern 1

---

## Family 2 - Increasing

* Pattern 2
* Pattern 3
* Pattern 4
* Pattern 14
* Pattern 16

---

## Family 3 - Decreasing

* Pattern 5
* Pattern 6
* Pattern 15

---

## Family 4 - Centered / Pyramid

* Pattern 7
* Pattern 8
* Pattern 9
* Pattern 17

---

## Family 5 - Combined / Symmetric

* Pattern 10
* Pattern 12
* Pattern 19
* Pattern 20

---

## Family 6 - Special Logic

* Pattern 11
* Pattern 13
* Pattern 18
* Pattern 21
* Pattern 22

---

# 7. Common Mistakes (Very Important)

These mistakes waste a lot of time.

---

## Mistake 1 - Not counting spaces

Most pyramid / mirror patterns fail because spaces were ignored.

---

## Mistake 2 - Treating combined pattern as one pattern

Diamond, butterfly, crown, void patterns should be split.

---

## Mistake 3 - Using wrong formula

Examples:

* `n-i` instead of `n-i+1`
* wrong star count
* wrong space count

Even one small formula mistake breaks the pattern.

---

## Mistake 4 - Forgetting row-based thinking

Always ask:

```text id="68o3os"
What should row i print?
```

That is the key question.

---

## Mistake 5 - Memorizing code

This is the worst way.

Patterns should be solved by observation, not memory.

---

# 8. Fast Dry Run Method

Whenever stuck, dry run like this:

```text id="0h3t33"
Row 1 -> ?
Row 2 -> ?
Row 3 -> ?
```

Then write:

```text id="pm8pcv"
spaces = ?
left part = ?
middle = ?
right part = ?
```

This solves most confusion.

---

# 9. Best Thinking for Interviews / Practice

If someone asks you pattern logic, explain like this:

### Example style:

* outer loop controls rows
* first inner loop prints spaces
* second inner loop prints stars
* third loop prints mirrored part (if any)

This sounds much clearer than saying:

> "maine bas loop chala diya"

---

# 10. Most Powerful Pattern Rule

If a pattern looks difficult, it is usually just:

* 2 easy patterns joined together
  or
* 1 known pattern reversed
  or
* 1 known pattern mirrored

This rule helps a lot.

---

# 11. Final Goal

If you can do these 4 things, your pattern logic is strong:

* identify pattern family quickly
* count row-wise changes correctly
* write formulas without guessing
* split big patterns into smaller parts

---

# Final Line

Pattern solving is not about stars.

It is about learning:

* observation
* decomposition
* loop control
* symmetry
* logic building

That is why patterns are useful before DSA.
