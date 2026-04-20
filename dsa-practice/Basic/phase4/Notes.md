# Phase 4 - STL Notes (C++)

![C++](https://img.shields.io/badge/C++-STL-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![STL](https://img.shields.io/badge/STL-Containers%20%26%20Algorithms-FF9800?style=for-the-badge)
![Vector & Map](https://img.shields.io/badge/Vector%20%26%20Map-DSA%20Tools-00C853?style=for-the-badge)
![Problem Solving](https://img.shields.io/badge/Problem-Solving-8E44AD?style=for-the-badge)
![DSA Prep](https://img.shields.io/badge/DSA-Foundation-E91E63?style=for-the-badge)

This phase focuses on learning the **Standard Template Library (STL)** in C++.

## Goal

* Reduce code length
* Improve performance
* Use built-in optimized structures
* Prepare for DSA / problem solving

---

## 1. What is STL?

**STL (Standard Template Library)** is a collection of:

* **Containers** → Store data
* **Algorithms** → Perform operations
* **Iterators** → Traverse data

---

## 2. `pair`

### What is `pair`?

Stores **two values together**.

### Syntax

```cpp
pair<int, int> p;
```

### Example

```cpp
pair<int, int> p = {1, 2};
```

### Access

```cpp
p.first
p.second
```

### Use Cases

* Coordinates `(x, y)`
* Storing `(value, index)`
* Sorting / vector of pairs

---

## 3. `vector`

### What is `vector`?

A **dynamic array** (resizable).

### Declaration

```cpp
vector<int> v;
```

### Important Functions

* `push_back()`
* `pop_back()`
* `size()`
* `clear()`
* `empty()`
* `front()`
* `back()`

### Access

```cpp
v[i]
```

### Use Cases

* Array replacement
* Dynamic data
* Most DSA problems

---

## 4. Iterators

### What is an Iterator?

Used to **traverse containers**.

### Types

* `begin()`
* `end()`
* `rbegin()`
* `rend()`

### Example

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it;
}
```

### Shortcut

```cpp
for (auto x : v) {
    cout << x;
}
```

---

## 5. Common Functions

These work in many STL containers:

* `size()`
* `empty()`
* `clear()`
* `insert()`
* `erase()`
* `find()`
* `count()`

---

## 6. `stack`

### What is `stack`?

**LIFO** → Last In First Out

### Functions

* `push()`
* `pop()`
* `top()`

### Use Cases

* Reverse
* Parentheses
* Next greater / smaller element

---

## 7. `queue`

### What is `queue`?

**FIFO** → First In First Out

### Functions

* `push()`
* `pop()`
* `front()`
* `back()`

### Use Cases

* BFS
* Level order traversal
* Simulation problems

---

## 8. `priority_queue`

### What is `priority_queue`?

A **heap-based structure**.

### Default

```cpp
priority_queue<int> pq;
```

> By default, it is a **max heap**.

### Min Heap

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
```

### Functions

* `push()`
* `pop()`
* `top()`

### Use Cases

* Kth largest / smallest
* Top K problems
* Heap-based questions

---

## 9. `set`

### What is `set`?

Stores:

* Unique elements
* In sorted order

### Functions

* `insert()`
* `erase()`
* `find()`
* `count()`

### Use Cases

* Remove duplicates
* Unique sorted data

---

## 10. `unordered_set`

### What is `unordered_set`?

Stores:

* Unique elements
* No order
* Faster average access

### Use Cases

* Fast lookup
* Duplicate checking

---

## 11. `map`

### What is `map`?

Stores **key-value pairs** in **sorted order by key**.

### Example

```cpp
map<int, int> mp;
mp[1] = 10;
```

### Use Cases

* Frequency count
* Key-value mapping
* Sorted key storage

---

## 12. `unordered_map`

### What is `unordered_map`?

Stores **key-value pairs** with:

* No order
* Faster average access

### Use Cases

* Hashing problems
* Fast frequency count
* Two Sum type problems

---

## 13. Comparator / Custom Sorting

### Why use it?

To change the **default sorting order**.

### Example

```cpp
bool cmp(pair<int, int> a, pair<int, int> b) {
    return a.second < b.second;
}
```

### Use

```cpp
sort(v.begin(), v.end(), cmp);
```

### Use Cases

* Sort by second value
* Sort students by marks
* Interval / greedy problems

---

## 14. Algorithms

### `sort()`

```cpp
sort(v.begin(), v.end());
```

### Descending Sort

```cpp
sort(v.begin(), v.end(), greater<int>());
```

### `reverse()`

```cpp
reverse(v.begin(), v.end());
```

### `find()`

```cpp
find(v.begin(), v.end(), x);
```

### `count()`

```cpp
count(v.begin(), v.end(), x);
```

### `binary_search()`

```cpp
binary_search(v.begin(), v.end(), x);
```

> Works only on **sorted data**.

### `lower_bound()`

```cpp
lower_bound(v.begin(), v.end(), x);
```

> Returns first element **>= x**

### `upper_bound()`

```cpp
upper_bound(v.begin(), v.end(), x);
```

> Returns first element **> x**

### `min_element()`

```cpp
*min_element(v.begin(), v.end());
```

### `max_element()`

```cpp
*max_element(v.begin(), v.end());
```

### `accumulate()`

```cpp
accumulate(v.begin(), v.end(), 0);
```

---

## 15. When to Use What

### `vector`

* Default choice
* Most problems

### `set` / `unordered_set`

* Unique elements
* Checking existence

### `map` / `unordered_map`

* Frequency counting
* Key-value mapping

### `priority_queue`

* Repeated max/min extraction

### `stack`

* Reverse
* Parentheses
* Monotonic stack

### `queue`

* BFS
* Level order
* Simulation

---

## 16. Time Complexity (Basic Idea)

| Container       | Insert             | Find       |
| --------------- | ------------------ | ---------- |
| `vector`        | `O(1)` (push_back) | `O(n)`     |
| `set`           | `O(log n)`         | `O(log n)` |
| `unordered_set` | `O(1)` avg         | `O(1)` avg |
| `map`           | `O(log n)`         | `O(log n)` |
| `unordered_map` | `O(1)` avg         | `O(1)` avg |

---

## 17. Common Mistakes

* Using `map` instead of `unordered_map` when order is not needed
* Using vector search instead of set/map for repeated lookup
* Forgetting to sort before `binary_search()`
* Wrong iterator usage
* Accessing empty container

---

## 18. Final Understanding

STL is **not just about remembering syntax**.

It is about:

* Choosing the right container
* Using built-in functions smartly
* Writing clean and fast code

---

## Final Line

> **STL = Speed + Simplicity + Power**

Mastering STL makes coding much easier and faster.

---

## Quick STL Summary Table

| Topic            | Main Purpose               |
| ---------------- | -------------------------- |
| `pair`           | Store 2 values together    |
| `vector`         | Dynamic array              |
| Iterators        | Traverse containers        |
| `stack`          | LIFO operations            |
| `queue`          | FIFO operations            |
| `priority_queue` | Heap / top element access  |
| `set`            | Unique sorted elements     |
| `unordered_set`  | Unique fast lookup         |
| `map`            | Sorted key-value pairs     |
| `unordered_map`  | Fast key-value pairs       |
| Comparator       | Custom sorting             |
| Algorithms       | Built-in useful operations |

---
