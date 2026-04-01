# Phase 2 - Pattern Notes

These notes are made to help understand **how to think** while solving pattern problems.

This phase is not about memorizing code.
It is about learning:

* how rows work
* how columns work
* how spaces are managed
* how symmetry is formed
* how one pattern transforms into another

---

# Before Solving Any Pattern (MOST IMPORTANT)

Before writing code for any pattern, always ask these 5 questions:

## 1. How many rows are there?

* outer loop always controls rows

## 2. What is being printed?

* `*`
* numbers
* characters
* spaces

## 3. How many things are printed in each row?

* fixed?
* increasing?
* decreasing?

## 4. Are spaces required?

* left spaces?
* middle spaces?
* both?

## 5. Is the pattern made of two parts?

Examples:

* upper + lower
* left + right
* increasing + decreasing

---

# Universal Pattern Solving Formula

Most patterns can be solved using this thinking:

```text
for every row:
    print left spaces (if needed)
    print left part
    print middle spaces (if needed)
    print right part
```

This single idea solves most of the 22 patterns.

---

# Pattern 1 - Rectangular Star Pattern

## Output

```text
*****
*****
*****
*****
*****
```

## Observation

* number of rows = fixed
* number of columns = fixed
* every row looks exactly same

## Thinking

* if every row is same, then inner loop is constant
* outer loop will run `n` times
* inner loop will also run `n` times

## Logic

* outer loop → rows
* inner loop → print `*` exactly `n` times

## Pattern Type

* fixed row
* fixed column

## Common Mistake

* printing extra spaces or forgetting line break

---

# Pattern 2 - Right-Angled Triangle Pattern

## Output

```text
*
**
***
****
*****
```

## Observation

* rows increase
* stars increase row by row
* row 1 has 1 star
* row 2 has 2 stars
* row 3 has 3 stars

## Thinking

* number of stars depends on row number
* in row `i`, print `i` stars

## Logic

* outer loop → rows
* inner loop → run from `1` to `i`

## Pattern Type

* increasing triangle

## Common Mistake

* using `n` instead of `i` in inner loop

---

# Pattern 3 - Right-Angled Number Pyramid

## Output

```text
1
12
123
1234
12345
```

## Observation

* same shape as Pattern 2
* only difference → print numbers instead of stars
* every row starts from `1`

## Thinking

* row `i` prints numbers from `1` to `i`

## Logic

* outer loop → rows
* inner loop → print `1` to `i`

## Pattern Type

* increasing number triangle

## Common Mistake

* printing row number repeatedly instead of `1 to i`

---

# Pattern 4 - Right-Angled Number Triangle

## Output

```text
1
22
333
4444
55555
```

## Observation

* shape same as Pattern 2
* only one number repeated in each row
* row number itself is printed

## Thinking

* row `i` prints number `i`, exactly `i` times

## Logic

* outer loop → rows
* inner loop → print `i`

## Pattern Type

* increasing repeated-number triangle

## Common Mistake

* printing `1 to i` instead of only `i`

---

# Pattern 5 - Inverted Right Pyramid

## Output

```text
*****
****
***
**
*
```

## Observation

* reverse of Pattern 2
* stars decrease row by row

## Thinking

* row 1 has `n` stars
* row 2 has `n-1`
* row 3 has `n-2`

## Logic

* outer loop → rows
* inner loop → print `n - i + 1` stars

## Pattern Type

* decreasing triangle

## Common Mistake

* wrong formula like `n-i` causing one star less

---

# Pattern 6 - Inverted Numbered Right Pyramid

## Output

```text
12345
1234
123
12
1
```

## Observation

* reverse of Pattern 3
* numbers always start from `1`
* count decreases row by row

## Thinking

* row 1 → print `1 to n`
* row 2 → print `1 to n-1`

## Logic

* outer loop → rows
* inner loop → print `1 to (n-i+1)`

## Pattern Type

* decreasing number triangle

## Common Mistake

* starting numbers from row number instead of 1

---

# Pattern 7 - Star Pyramid

## Output

```text
    *
   ***
  *****
 *******
*********
```

## Observation

* stars are centered
* every row has:

  * some spaces
  * then stars
* stars are always odd: `1, 3, 5, 7, 9`

## Thinking

This pattern has **2 parts per row**:

1. left spaces
2. stars

## Row-wise Understanding

* row 1 → 4 spaces, 1 star
* row 2 → 3 spaces, 3 stars
* row 3 → 2 spaces, 5 stars

## Formula

* spaces = `n - i`
* stars = `2*i - 1`

## Logic

* first print spaces
* then print stars

## Pattern Type

* centered pyramid

## Common Mistakes

* forgetting odd star count
* printing too many spaces
* using same loop for both without understanding

---

# Pattern 8 - Inverted Star Pyramid

## Output

```text
*********
 *******
  *****
   ***
    *
```

## Observation

* reverse of Pattern 7
* stars decrease
* spaces increase

## Thinking

This is simply upside-down pyramid.

## Formula

* spaces = `i - 1`
* stars = `2*(n-i)+1`

## Logic

* first spaces
* then stars

## Pattern Type

* inverted centered pyramid

## Common Mistake

* wrong star formula

---

# Pattern 9 - Diamond Star Pattern

## Output

```text
    *
   ***
  *****
 *******
*********
 *******
  *****
   ***
    *
```

## Observation

* upper half = Pattern 7
* lower half = Pattern 8

## Thinking

This pattern is not new.
It is just a **combination of two known patterns**.

## Logic

* first print normal pyramid
* then print inverted pyramid

## Pattern Type

* combined symmetric pattern

## Common Mistake

* repeating middle row twice (depending on implementation)

---

# Pattern 10 - Half Diamond Star Pattern

## Output

```text
*
**
***
****
*****
****
***
**
*
```

## Observation

* upper half = Pattern 2
* lower half = Pattern 5

## Thinking

Again, this is a **combination pattern**.

## Logic

* first increasing triangle
* then decreasing triangle

## Pattern Type

* half diamond

## Common Mistake

* printing peak row twice

---

# Pattern 11 - Binary Number Triangle Pattern

## Output

```text
1
01
101
0101
10101
```

## Observation

* numbers alternate between 0 and 1
* each row starts differently
* parity matters

## Thinking

At every position, value depends on:

* row number
* column number

## Best Trick

Use:

```text
(i + j) % 2
```

If even → one digit
If odd → other digit

## Logic

* outer loop → rows
* inner loop → columns
* print alternating value

## Pattern Type

* parity-based pattern

## Common Mistake

* hardcoding instead of using parity logic

---

# Pattern 12 - Number Crown Pattern

## Output

```text
1      1
12    21
123  321
12344321
```

## Observation

This pattern has **3 parts**:

1. left increasing numbers
2. middle spaces
3. right decreasing numbers

## Thinking

Break it into pieces:

### Left Part

* print `1 to i`

### Middle Spaces

* spaces shrink every row

### Right Part

* print `i to 1`

## Formula

* left count = `i`
* right count = `i`
* middle spaces = `2*(n-i)`

## Pattern Type

* symmetric number pattern

## Common Mistake

* treating it as one block instead of 3 separate blocks

---

# Pattern 13 - Increasing Number Triangle Pattern

## Output

```text
1
2 3
4 5 6
7 8 9 10
11 12 13 14 15
```

## Observation

* numbers do not reset each row
* numbers continue globally

## Thinking

Need one variable:

```text
num = 1
```

Then keep printing and increasing it.

## Logic

* outer loop → rows
* inner loop → print row length
* after printing each number, increment `num`

## Pattern Type

* running counter pattern

## Common Mistake

* restarting from 1 every row

---

# Pattern 14 - Increasing Letter Triangle Pattern

## Output

```text
A
AB
ABC
ABCD
ABCDE
```

## Observation

* same as number triangle
* just use characters instead of numbers

## Thinking

Characters also behave like ordered values:

* A, B, C, D...

## Logic

* row `i` → print letters from `A` to ith character

## Pattern Type

* increasing character triangle

## Common Mistake

* confusion in char increment

---

# Pattern 15 - Reverse Letter Triangle Pattern

## Output

```text
ABCDE
ABCD
ABC
AB
A
```

## Observation

* reverse of Pattern 14
* letters always start from A
* count decreases

## Thinking

* row 1 → print A to E
* row 2 → print A to D

## Logic

* inner loop size decreases row by row

## Pattern Type

* decreasing character triangle

## Common Mistake

* starting from row character instead of A

---

# Pattern 16 - Alpha Ramp Pattern

## Output

```text
A
BB
CCC
DDDD
EEEEE
```

## Observation

* row number decides which character is printed
* same character repeats in that row

## Thinking

* row 1 → A
* row 2 → B
* row 3 → C

## Logic

* row `i` prints character `'A' + i - 1`
* repeated `i` times

## Pattern Type

* repeated character triangle

## Common Mistake

* incrementing character inside inner loop unnecessarily

---

# Pattern 17 - Alpha Hill Pattern

## Output

```text
    A
   ABA
  ABCBA
 ABCDCBA
ABCDEDCBA
```

## Observation

This pattern has **3 parts**:

1. left spaces
2. increasing letters
3. decreasing letters

## Thinking

Example row:

```text
ABCBA
```

This is:

* A to C
* then B to A

So the row grows and then mirrors.

## Logic

* spaces decrease
* letters increase till center
* then decrease

## Pattern Type

* centered character palindrome pattern

## Common Mistake

* repeating center character twice by mistake

---

# Pattern 18 - Alpha Triangle Pattern

## Output

```text
E
DE
CDE
BCDE
ABCDE
```

## Observation

* each row starts earlier in alphabet
* then continues till E

## Thinking

* last row always ends at E
* only starting character changes

## Logic

* row 1 starts from E
* row 2 starts from D
* row 3 starts from C

## Pattern Type

* reverse-start character pattern

## Common Mistake

* trying to force it using row count only without seeing start-end logic

---

# Pattern 19 - Symmetric Void Pattern

## Output

```text
**********
****  ****
***    ***
**      **
*        *
*        *
**      **
***    ***
****  ****
**********
```

## Observation

This pattern has **2 mirrored star blocks** and **middle spaces**.

Each row:

1. left stars
2. middle spaces
3. right stars

## Thinking

This is basically:

* upper half
* lower half

### Upper Half

* stars decrease
* spaces increase

### Lower Half

* stars increase
* spaces decrease

## Logic

Break into 2 parts.

## Pattern Type

* symmetric hollow-like butterfly void

## Common Mistake

* not separating upper and lower half

---

# Pattern 20 - Symmetric Butterfly Pattern

## Output

```text
*        *
**      **
***    ***
****  ****
**********
****  ****
***    ***
**      **
*        *
```

## Observation

Again 3 parts:

1. left stars
2. middle spaces
3. right stars

## Thinking

This is the opposite flow of Pattern 19.

### Upper Half

* stars increase
* spaces decrease

### Lower Half

* stars decrease
* spaces increase

## Logic

* upper triangle + lower inverted triangle

## Pattern Type

* butterfly / mirror pattern

## Common Mistake

* space formula confusion

---

# Pattern 21 - Hollow Rectangle Pattern

## Output

```text
****
*  *
*  *
****
```

## Observation

Only boundary is printed.

### Boundary means:

* first row
* last row
* first column
* last column

Everything else = space

## Thinking

At every position `(i, j)`, ask:
Is it on boundary?

If yes → print `*`
Else → print space

## Logic

Use condition:

* row first/last
* col first/last

## Pattern Type

* boundary / hollow pattern

## Common Mistake

* printing stars everywhere

---

# Pattern 22 - The Number Pattern / Concentric Number Pattern

## Output

```text
4 4 4 4 4 4 4
4 3 3 3 3 3 4
4 3 2 2 2 3 4
4 3 2 1 2 3 4
4 3 2 2 2 3 4
4 3 3 3 3 3 4
4 4 4 4 4 4 4
```

## Observation

This is not a normal print pattern.

This pattern depends on **distance from boundary**.

## Best Way to Think

Each cell value depends on how far it is from:

* top
* bottom
* left
* right

Take the **minimum distance from boundary**.

Then subtract from `n`.

## Core Idea

Closest to boundary → bigger number
Closest to center → smaller number

## Pattern Type

* distance-based matrix pattern

## Common Mistake

* trying to solve it like normal star triangle

---

# Pattern Families (VERY IMPORTANT FOR REVISION)

Instead of memorizing 22 patterns separately, group them like this:

---

## Family 1 - Fixed Patterns

* Pattern 1

These have fixed rows and columns.

---

## Family 2 - Increasing Triangle Patterns

* Pattern 2
* Pattern 3
* Pattern 4
* Pattern 14
* Pattern 16

These grow row by row.

---

## Family 3 - Decreasing Triangle Patterns

* Pattern 5
* Pattern 6
* Pattern 15

These shrink row by row.

---

## Family 4 - Pyramid / Centered Patterns

* Pattern 7
* Pattern 8
* Pattern 9
* Pattern 17

These use:

* left spaces
* odd count printing
* symmetry

---

## Family 5 - Combined Patterns

* Pattern 10
* Pattern 12
* Pattern 19
* Pattern 20

These are made by combining smaller known patterns.

---

## Family 6 - Special Logic Patterns

* Pattern 11
* Pattern 13
* Pattern 18
* Pattern 21
* Pattern 22

These require custom observation.

---

# How to Actually Solve Any Pattern (Best Method)

Use this process every time:

---

## Step 1 - Draw row numbers

Write:

```text
row 1
row 2
row 3
...
```

---

## Step 2 - Count what is printed in each row

Ask:

* how many stars?
* how many spaces?
* how many numbers?
* which character?

---

## Step 3 - Find the formula

Examples:

* stars = `i`
* spaces = `n - i`
* stars = `2*i - 1`
* spaces = `2*(n-i)`

---

## Step 4 - Break into blocks

Many patterns are easier if broken into:

* left part
* middle part
* right part

or:

* upper half
* lower half

---

## Step 5 - Then code

Never start coding first.

Always observe first.

---

# Common Mistakes in Pattern Problems

These are the most common beginner mistakes:

## 1. Starting code without observing row behavior

This causes confusion immediately.

## 2. Mixing row count and column count

Outer loop = rows
Inner loop = what gets printed

## 3. Forgetting spaces are also part of pattern

A lot of patterns are solved mainly by correct spaces.

## 4. Not separating upper and lower halves

Diamond / butterfly / symmetric patterns become much easier when split.

## 5. Hardcoding instead of finding formula

Never manually print rows.

## 6. Not dry running one row at a time

If one row is understood, whole pattern becomes easy.

---

# Golden Revision Trick

If you ever forget a pattern, don’t panic.

Just ask:

### For current row:

* how many spaces?
* how many stars/numbers/chars?
* increasing or decreasing?
* mirrored or not?

That is enough to rebuild most patterns.

---

# Final Goal of Phase 2

If after this phase you can:

* identify pattern type quickly
* write loop structure without fear
* understand spaces properly
* break patterns into smaller parts
* explain logic before coding

Then your **loop + observation + logic base is strong**.

That is the real purpose of this phase.

---

# Final Truth

Pattern problems are not important because of stars.

They are important because they teach:

* row-column thinking
* structure observation
* decomposition
* loop mastery
* DSA-style logic building
