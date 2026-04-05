# Pattern Shortcuts

## Table of Contents

* Pattern Reading
* Core Formulas
* Loop Roles
* Pattern Shortcuts
* Cheatsheet

---

## Pattern Reading

1. Total rows = `n`
2. Count per row
3. What to print (`*`, number, letter)
4. Alignment (left or center)

---

## Core Formulas

### Increasing Count

```cpp
count = i;
```

### Decreasing Count

```cpp
count = n - i + 1;
```

### Left Spaces

```cpp
spaces = n - i;
```

### Increasing Spaces

```cpp
spaces = i - 1;
```

### Pyramid Stars

```cpp
stars = 2 * i - 1;
```

### Inverted Pyramid Stars

```cpp
stars = 2 * (n - i) + 1;
```

### Increasing Letters

```cpp
char('A' + j - 1)
```

### Same Letter Row

```cpp
char('A' + i - 1)
```

---

## Loop Roles

### Outer Loop (Rows)

```cpp
for(int i = 1; i <= n; i++)
```

### Inner Loop (Columns)

```cpp
for(int j = 1; j <= value; j++)
```

---

## Pattern Shortcuts

### Square Star Pattern

```
****
****
****
****
```

* rows = `n`
* stars = `n`

---

### Right Triangle Star Pattern

```
*
**
***
****
```

* stars = `i`

---

### Right Triangle Number Pattern

```
1
12
123
1234
```

* count = `i`
* print = `j`

---

### Repeated Number Triangle

```
1
22
333
4444
```

* count = `i`
* print = `i`

---

### Inverted Star Triangle

```
****
***
**
*
```

* stars = `n - i + 1`

---

### Inverted Number Triangle

```
1234
123
12
1
```

* count = `n - i + 1`
* print = `j`

---

### Pyramid Star Pattern

```
    *
   ***
  *****
```

* spaces = `n - i`
* stars = `2 * i - 1`

---

### Inverted Pyramid Star Pattern

```
*****
 ***
  *
```

* spaces = `i - 1`
* stars = `2 * (n - i) + 1`

---

### Diamond Star Pattern

```
    *
   ***
  *****
   ***
    *
```

* diamond = pyramid + inverted pyramid

---

### Half Diamond Star Pattern

```
*
**
***
**
*
```

* half = increasing + decreasing

---

### Binary Number Triangle

```
1
01
101
0101
```

* print = `(i + j) % 2`

---

### Number Crown Pattern

```
1      1
12    21
123  321
12344321
```

* left = `i`
* spaces = `2 * (n - i)`
* right = reverse(`i to 1`)

---

### Increasing Number Triangle

```
1
2 3
4 5 6
7 8 9 10
```

* count = `i`
* `num++`

---

### Increasing Letter Triangle

```
A
AB
ABC
ABCD
```

* count = `i`
* print = `char('A' + j - 1)`

---

### Reverse Letter Triangle

```
ABCD
ABC
AB
A
```

* count = `n - i + 1`
* print = `char('A' + j - 1)`

---

### Repeated Letter Triangle

```
A
BB
CCC
DDDD
```

* count = `i`
* print = `char('A' + i - 1)`

---

### Alpha Hill Pattern

```
    A
   ABA
  ABCBA
 ABCDCBA
```

* spaces = `n - i`
* left = `A to i`
* right = reverse(`i - 1 to A`)

---

### Alpha Triangle Pattern

```
A
BB
CCC
DDDD
```

* print = `char('A' + i - 1)`

---

### Symmetric Void Pattern

```
****    ****
***      ***
**        **
*          *
```

* left + spaces + right

---

### Butterfly Pattern

```
*      *
**    **
***  ***
********
```

* upper + lower
* stars = `i`
* spaces = `2 * (n - i)`

---

### Hollow Rectangle Pattern

```
*****
*   *
*   *
*****
```

```cpp
if(i==1 || i==n || j==1 || j==m)
    cout << "*";
else
    cout << " ";
```

---

### Concentric Rectangle Pattern

```
4444444
4333334
4322234
4321234
```

* size = `2 * n - 1`

---

## Cheatsheet

```
i            -> increasing
n - i + 1    -> decreasing
n - i        -> left spaces
i - 1        -> increasing spaces
2*i - 1      -> pyramid
'A' + j - 1  -> letters
'A' + i - 1  -> same row
```
