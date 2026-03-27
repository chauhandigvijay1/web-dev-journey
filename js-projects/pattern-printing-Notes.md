# Pattern Printing in JavaScript

# The Core Idea

Every pattern follows this structure:

```js
for (let i = 1; i <= n; i++) {
    let row = "";

    // spaces
    for (...) {
        row += " ";
    }

    // left part
    for (...) {
        row += something;
    }

    // right part (if needed)
    for (...) {
        row += something;
    }

    console.log(row);
}
```

### Meaning of variables

* `i` → row number
* `j` → column / item inside a row
* `n` → total number of rows
* `row` → one complete line to print

---

# The 4 Questions You Must Ask Before Solving Any Pattern

Before writing code, inspect the pattern and answer these:

1. **How many rows are there?**
2. **How many symbols/numbers are in each row?**
3. **Are there spaces before or after the symbols?**
4. **What exactly are we printing?**

   * `*`
   * row number `i`
   * column number `j`
   * letters
   * spaces

If you answer these 4 questions, the code becomes much easier.

---

# Universal Pattern Solving Strategy

Use this order every time:

## Step 1 — Draw the pattern

Example:

```text
*
* *
* * *
* * * *
```

## Step 2 — Write row-wise observation

```text
Row 1 -> 1 star
Row 2 -> 2 stars
Row 3 -> 3 stars
Row 4 -> 4 stars
```

## Step 3 — Convert observation into loop logic

```js
for (let j = 1; j <= i; j++)
```

## Step 4 — Decide what to print

```js
row += "* ";
```

## Step 5 — Print row

```js
console.log(row);
```

---

# The Most Important Formulas

These are the formulas you will use again and again.

## 1) Square

```js
j <= n
```

## 2) Increasing triangle

```js
j <= i
```

## 3) Decreasing triangle

```js
j <= n - i + 1
```

## 4) Right aligned triangle

```js
spaces = n - i
stars = i
```

## 5) Pyramid

```js
spaces = n - i
stars = 2 * i - 1
```

## 6) Inverted pyramid

```js
spaces = i - 1
stars = 2 * (n - i) + 1
```

## 7) Diamond

```js
upper pyramid + lower inverted pyramid
```

## 8) Hollow patterns

```js
if border => print "*"
else => print " "
```

---

# 1. Square Pattern

## Output

```text
* * * *
* * * *
* * * *
* * * *
```

## Observation

* Total rows = `n`
* Each row has `n` stars

## Logic

Since every row has a fixed number of stars, inner loop always runs `n` times.

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= n; j++) {
        row += "* ";
    }
    console.log(row);
}
```

---

# 2. Increasing Triangle

## Output

```text
*
* *
* * *
* * * *
```

## Observation

```text
Row 1 -> 1 star
Row 2 -> 2 stars
Row 3 -> 3 stars
Row 4 -> 4 stars
```

## Logic

The number of stars is equal to the row number.

## Formula

```js
j <= i
```

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }
    console.log(row);
}
```

---

# 3. Decreasing Triangle

## Output

```text
* * * *
* * *
* *
*
```

## Observation

```text
Row 1 -> 4 stars
Row 2 -> 3 stars
Row 3 -> 2 stars
Row 4 -> 1 star
```

## Logic

The number of stars decreases by 1 in each row.

## Formula

```js
j <= n - i + 1
```

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= n - i + 1; j++) {
        row += "* ";
    }
    console.log(row);
}
```

---

# 4. Number Triangle

## Output

```text
1
1 2
1 2 3
1 2 3 4
```

## Observation

Each row prints numbers from `1` to `i`.

## Logic

Instead of printing `*`, print `j`.

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += j + " ";
    }
    console.log(row);
}
```

---

# 5. Same Number Row Pattern

## Output

```text
1
2 2
3 3 3
4 4 4 4
```

## Observation

Each row prints the row number multiple times.

## Logic

Instead of printing `j`, print `i`.

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += i + " ";
    }
    console.log(row);
}
```

---

# 6. Right Aligned Triangle

## Output

```text
      *
    * *
  * * *
* * * *
```

## Observation

Each row has:

* some spaces first
* then stars

## Logic

* spaces decrease
* stars increase

## Formula

```js
spaces = n - i
stars = i
```

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= n - i; j++) {
        row += "  ";
    }

    for (let j = 1; j <= i; j++) {
        row += "* ";
    }

    console.log(row);
}
```

---

# 7. Pyramid Pattern

## Output

```text
   *
  ***
 *****
*******
```

## Observation

Each row has:

* left spaces
* odd number of stars

## Logic

* spaces decrease
* stars follow odd count: `1, 3, 5, 7...`

## Formula

```js
spaces = n - i
stars = 2 * i - 1
```

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= n - i; j++) {
        row += " ";
    }

    for (let j = 1; j <= 2 * i - 1; j++) {
        row += "*";
    }

    console.log(row);
}
```

---

# 8. Inverted Pyramid

## Output

```text
*******
 *****
  ***
   *
```

## Observation

This is the reverse of a pyramid.

## Logic

* spaces increase
* stars decrease in odd count

## Formula

```js
spaces = i - 1
stars = 2 * (n - i) + 1
```

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= i - 1; j++) {
        row += " ";
    }

    for (let j = 1; j <= 2 * (n - i) + 1; j++) {
        row += "*";
    }

    console.log(row);
}
```

---

# 9. Diamond Pattern

## Output

```text
   *
  ***
 *****
*******
 *****
  ***
   *
```

## Observation

Diamond is just:

* one normal pyramid
* plus one inverted pyramid

## Logic

Split the problem into two halves.

## Code

```js
let n = 4;

// Upper pyramid
for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= n - i; j++) {
        row += " ";
    }

    for (let j = 1; j <= 2 * i - 1; j++) {
        row += "*";
    }

    console.log(row);
}

// Lower inverted pyramid
for (let i = n - 1; i >= 1; i--) {
    let row = "";

    for (let j = 1; j <= n - i; j++) {
        row += " ";
    }

    for (let j = 1; j <= 2 * i - 1; j++) {
        row += "*";
    }

    console.log(row);
}
```

---

# 10. Hollow Square

## Output

```text
* * * *
*     *
*     *
* * * *
```

## Observation

Only border positions contain `*`.

## Border Conditions

Print `*` when:

* first row
* last row
* first column
* last column

Otherwise print space.

## Code

```js
let n = 4;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= n; j++) {
        if (i === 1 || i === n || j === 1 || j === n) {
            row += "* ";
        } else {
            row += "  ";
        }
    }

    console.log(row);
}
```

---

# How to Solve Any New Pattern (The Real Trick)

Whenever you see a new pattern, do this:

## Step 1

Draw it on paper.

## Step 2

Write row-wise counts.

Example:

```text
Row 1 -> 1 star
Row 2 -> 3 stars
Row 3 -> 5 stars
Row 4 -> 7 stars
```

## Step 3

Ask:

* Is it increasing?
* Is it decreasing?
* Is it centered?
* Is it hollow?

## Step 4

Identify formulas.

Examples:

* increasing → `j <= i`
* decreasing → `j <= n - i + 1`
* pyramid stars → `2 * i - 1`
* pyramid spaces → `n - i`

## Step 5

Build one row first, then print all rows.

---

Use:

```js
let row = "";
row += "* ";
console.log(row);
```

---

# Final Summary

If you remember only one thing, remember this:

> **Pattern printing = Rows + Columns + Spaces + What to Print**

That is the full trick.

You do **not** need to memorize every pattern.
You only need to **observe correctly** and convert it into loops.

---

# Quick Revision Sheet

```js
// Square
j <= n

// Increasing triangle
j <= i

// Decreasing triangle
j <= n - i + 1

// Right aligned triangle
spaces = n - i
stars = i

// Pyramid
spaces = n - i
stars = 2 * i - 1

// Inverted pyramid
spaces = i - 1
stars = 2 * (n - i) + 1

// Diamond
pyramid + inverted pyramid

// Hollow
if border => "*"
else => " "
```
