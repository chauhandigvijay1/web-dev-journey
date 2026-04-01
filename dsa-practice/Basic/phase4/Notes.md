# Phase 4 - STL Notes (C++)

This phase focuses on learning **Standard Template Library (STL)** in C++.

Goal:

* reduce code length
* improve performance
* use built-in optimized structures
* prepare for DSA / problem solving

---

# 1. What is STL?

STL (Standard Template Library) is a collection of:

* containers → store data
* algorithms → perform operations
* iterators → traverse data

---

# 2. pair

## What is pair?

* stores two values together

## Syntax

```cpp
pair<int, int> p;
```

## Example

```cpp
pair<int, int> p = {1, 2};
```

## Access

```cpp
p.first
p.second
```

## Use cases

* coordinates (x, y)
* storing (value, index)
* maps, sorting

---

# 3. Iterators

## What is iterator?

* used to traverse containers

## Types

* begin()
* end()
* rbegin()
* rend()

## Example

```cpp
vector<int> v = {1,2,3};

for(auto it = v.begin(); it != v.end(); it++) {
    cout << *it;
}
```

## Shortcut

```cpp
for(auto x : v)
```

---

# 4. Common Functions (Important)

Works in most STL containers

* size()
* empty()
* clear()
* insert()
* erase()
* find()
* count()

---

# 5. vector

## What is vector?

* dynamic array (resizable)

## Declaration

```cpp
vector<int> v;
```

## Important functions

* push_back()
* pop_back()
* size()
* clear()

## Access

```cpp
v[i]
```

## Use case

* arrays replacement
* dynamic data

---

# 6. list

## What is list?

* doubly linked list

## Properties

* fast insertion/deletion
* no random access

## Functions

* push_back()
* push_front()
* pop_back()
* pop_front()

---

# 7. deque

## What is deque?

* double ended queue

## Features

* insert/delete from both ends

## Functions

* push_back()
* push_front()

---

# 8. stack

## What is stack?

* LIFO (Last In First Out)

## Functions

* push()
* pop()
* top()

---

# 9. queue

## What is queue?

* FIFO (First In First Out)

## Functions

* push()
* pop()
* front()

---

# 10. priority_queue

## What is priority_queue?

* heap based structure

## Default

* max heap

## Min heap

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
```

## Functions

* push()
* pop()
* top()

---

# 11. set

## What is set?

* stores unique elements
* sorted

## Functions

* insert()
* erase()
* find()

---

# 12. multiset

## What is multiset?

* allows duplicates
* sorted

---

# 13. unordered_set

## What is unordered_set?

* unique elements
* no order
* faster (average)

---

# 14. map

## What is map?

* key-value pairs
* sorted by key

## Example

```cpp
map<int, int> mp;
mp[1] = 10;
```

---

# 15. multimap

## What is multimap?

* multiple same keys allowed

---

# 16. unordered_map

## What is unordered_map?

* key-value pairs
* no order
* faster access

---

# 17. unordered_multimap

* allows duplicate keys
* unordered

---

# 18. Algorithms

---

## sort()

```cpp
sort(v.begin(), v.end());
```

## Descending

```cpp
sort(v.begin(), v.end(), greater<int>());
```

---

## reverse()

```cpp
reverse(v.begin(), v.end());
```

---

## find()

```cpp
find(v.begin(), v.end(), x);
```

---

## count()

```cpp
count(v.begin(), v.end(), x);
```

---

## binary_search()

```cpp
binary_search(v.begin(), v.end(), x);
```

(only on sorted array)

---

## lower_bound()

```cpp
lower_bound(v.begin(), v.end(), x);
```

* first >= x

---

## upper_bound()

```cpp
upper_bound(v.begin(), v.end(), x);
```

* first > x

---

## min_element()

```cpp
*min_element(v.begin(), v.end());
```

---

## max_element()

```cpp
*max_element(v.begin(), v.end());
```

---

## accumulate()

```cpp
accumulate(v.begin(), v.end(), 0);
```

---

## next_permutation()

```cpp
next_permutation(v.begin(), v.end());
```

---

## __builtin_popcount()

```cpp
__builtin_popcount(x);
```

* counts number of 1s in binary

---

# 19. When to Use What (VERY IMPORTANT)

## vector

* default choice
* most problems

## set / unordered_set

* unique elements
* checking existence

## map / unordered_map

* frequency counting
* key-value mapping

## priority_queue

* max/min element repeatedly

## stack

* reverse, parentheses, recursion-like

## queue

* BFS, level order

---

# 20. Time Complexity (Basic Idea)

| Container     | Insert   | Find     |
| ------------- | -------- | -------- |
| vector        | O(1)     | O(n)     |
| set           | O(log n) | O(log n) |
| unordered_set | O(1) avg | O(1) avg |
| map           | O(log n) | O(log n) |
| unordered_map | O(1) avg | O(1) avg |

---

# 21. Common Mistakes

* using map instead of unordered_map (slow)
* using vector search instead of set/map
* forgetting sort before binary_search
* wrong iterator usage
* accessing empty container

---

# 22. Final Understanding

STL is not about remembering syntax.

It is about:

* choosing right container
* using built-in functions
* writing clean and fast code

---

# Final Goal

If you can:

* choose correct STL structure
* use functions without confusion
* solve problems faster

👉 then your STL is strong

---

# Final Line

STL = speed + simplicity + power

Mastering STL makes coding much easier and faster.
