# Unordered Set in C++

## What is `unordered_set`?

`unordered_set` is an **STL container** in C++.

* It stores **unique elements only**
* Elements are stored using **hashing**
* Unlike `set`, elements are **not stored in sorted order**

### Key Points

* Duplicates are **not allowed**
* Order is **not guaranteed**

---

## Example

```cpp
unordered_set<int> s;
s.insert(5);
s.insert(2);
s.insert(8);
s.insert(5);
```

### Possible Output

```cpp
8 2 5
```

> Output order can be different.

---

## Why Use `unordered_set`?

Useful when we want:

* Only **unique elements**
* Very fast search
* Very fast insert/delete
* Duplicate removal
* Hashing-based solutions

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

## Basic Syntax

### Declaration

```cpp
unordered_set<data_type> variable_name;
```

### Example

```cpp
unordered_set<int> s;
unordered_set<string> names;
```

---

## Basic Operations

### 1. `insert()`

```cpp
s.insert(value);
```

#### Example

```cpp
s.insert(10);
s.insert(20);
s.insert(30);
```

---

### 2. `erase()`

```cpp
s.erase(value);
```

#### Example

```cpp
s.erase(20);
```

---

### 3. `find()`

```cpp
auto it = s.find(value);
```

#### Example

```cpp
auto it = s.find(10);

if (it != s.end()) {
    cout << "Found";
}
```

---

### 4. `count()`

```cpp
s.count(value);
```

#### Example

```cpp
cout << s.count(10);
```

### Output

```cpp
1
```

---

### 5. `size()`

```cpp
cout << s.size();
```

---

### 6. `empty()`

```cpp
if (s.empty()) {
    cout << "Empty";
}
```

---

### 7. `clear()`

```cpp
s.clear();
```

---

## Traversing `unordered_set`

> `unordered_set` does not support indexing like vector.

❌ Not allowed:

```cpp
s[0];
```

---

### Using Range-Based Loop

```cpp
for (auto val : s) {
    cout << val << " ";
}
```

---

### Using Iterator

```cpp
for (auto it = s.begin(); it != s.end(); it++) {
    cout << *it << " ";
}
```

---

## Input in `unordered_set`

```cpp
int n;
cin >> n;

unordered_set<int> s;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    s.insert(x);
}
```

---

## Important Properties

### 1. Unique Elements Only

```cpp
unordered_set<int> s = {1, 2, 2, 3, 3, 4};
```

### Stored As

```cpp
1 2 3 4
```

---

### 2. No Sorted Order

* Stored in **random/hash-based order**
* Output order is **not guaranteed**

---

### 3. Faster Than `set` (Average Case)

```cpp
O(1)
```

---

## Common Use Cases

### 1. Remove Duplicates Quickly

---

### 2. Fast Search / Lookup

---

### 3. Distinct Element Count

---

### 4. Duplicate Detection

---

## Time Complexity

| Operation | Average Case |
| --------- | ------------ |
| insert()  | O(1)         |
| erase()   | O(1)         |
| find()    | O(1)         |
| count()   | O(1)         |

---

### Worst Case

```cpp
O(n)
```

---

## Important Things to Remember

* Stores **only unique values**
* No sorted order
* Usually faster than `set`
* No indexing support
* Best for duplicate removal & fast lookup

---

## `set` vs `unordered_set`

| Feature    | set                | unordered_set          |
| ---------- | ------------------ | ---------------------- |
| Order      | Sorted             | No order               |
| Duplicates | Not allowed        | Not allowed            |
| Search     | O(log n)           | O(1) average           |
| Insert     | O(log n)           | O(1) average           |
| Use Case   | Sorted data needed | Fast operations needed |

---

## Common Mistakes

### 1. Expecting Sorted Output

```cpp
unordered_set<int> s;
```

> Output order is not fixed.

---

### 2. Using Indexing

❌ Wrong

```cpp
cout << s[0];
```

---

### 3. Invalid Iterator Usage

❌ Wrong

```cpp
auto it = s.find(100);
cout << *it;
```

✅ Correct

```cpp
auto it = s.find(100);

if (it != s.end()) {
    cout << *it;
}
```

---

## Interview / DSA Relevance

Used in:

* Duplicate detection
* Distinct elements
* Fast lookup problems
* Hashing problems
* Search optimization

---

## Summary

`unordered_set` is used to:

* Store unique values
* Remove duplicates
* Perform fast lookup
* Solve hashing problems

---

## Key Concepts

* Declaration
* insert()
* erase()
* find()
* count()
* Traversal
* set vs unordered_set

---

