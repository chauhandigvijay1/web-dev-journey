# Iterators in C++

## What is Iterator?

* An `iterator` is used to **point to elements** of STL containers.
* It works like a **pointer**.
* It helps us to **traverse** containers like:

  * vector
  * set
  * map
  * list
  * deque

---

## Why Use Iterator?

We already use loops like this:

```cpp
for (int i = 0; i < v.size(); i++) {
    cout << v[i] << " ";
}
```

But this works mainly for containers with indexing like `vector`.

For containers like:

* `set`
* `map`
* `list`

we usually use **iterators**.

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

# Basic Syntax

## Iterator for Vector

```cpp
vector<int>::iterator it;
```

### Example

```cpp
vector<int> v = {10, 20, 30};
vector<int>::iterator it = v.begin();
```

---

# Important Functions

## 1. begin()

Returns iterator pointing to the **first element**.

### Example

```cpp
vector<int> v = {10, 20, 30};
auto it = v.begin();
cout << *it;
```

### Output

```cpp
10
```

---

## 2. end()

Returns iterator pointing **just after the last element**.

### Important

* `end()` does **not** point to the last element
* it points to the position **after** last element

### Example

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

---

## 3. rbegin()

Returns reverse iterator pointing to the **last element**.

### Example

```cpp
vector<int> v = {10, 20, 30};
auto it = v.rbegin();
cout << *it;
```

### Output

```cpp
30
```

---

## 4. rend()

Returns reverse iterator pointing **before the first element**.

Used with reverse traversal.

---

# Accessing Value Using Iterator

Use `*` to access the value.

### Example

```cpp
auto it = v.begin();
cout << *it;
```

---

# Traversing Vector Using Iterator

## Forward Traversal

```cpp
vector<int> v = {10, 20, 30, 40};

for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

### Output

```cpp
10 20 30 40
```

---

## Reverse Traversal

```cpp
for (auto it = v.rbegin(); it != v.rend(); it++) {
    cout << *it << " ";
}
```

### Output

```cpp
40 30 20 10
```

---

# Using auto with Iterators

Very important and commonly used.

Instead of writing:

```cpp
vector<int>::iterator it = v.begin();
```

We can write:

```cpp
auto it = v.begin();
```

### Why Use auto?

Because STL iterator types are often long.

So `auto` makes code:

* shorter
* cleaner
* easier to write

---

# Iterator in Vector of Pairs

### Example

```cpp
vector<pair<int, int>> v = {{1, 2}, {3, 4}, {5, 6}};
```

## Method 1

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << (*it).first << " " << (*it).second << endl;
}
```

---

## Method 2 (Shortcut)

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << it->first << " " << it->second << endl;
}
```

---

# Difference Between `(*it).first` and `it->first`

Both mean same.

## Long Form

```cpp
(*it).first
```

## Short Form

```cpp
it->first
```

### Best Practice

Use:

```cpp
it->first
it->second
```

because it is shorter and cleaner.

---

# Iterator in Set

### Example

```cpp
set<int> s = {10, 20, 30};

for (auto it = s.begin(); it != s.end(); it++) {
    cout << *it << " ";
}
```

---

# Iterator in Map

### Example

```cpp
map<int, int> mp;
mp[1] = 100;
mp[2] = 200;
```

### Traversal

```cpp
for (auto it = mp.begin(); it != mp.end(); it++) {
    cout << it->first << " " << it->second << endl;
}
```

---

# Range Based Loop vs Iterator

## Range Based Loop

```cpp
for (auto val : v) {
    cout << val << " ";
}
```

### Good For

* simple traversal
* short code

---

## Iterator Loop

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

### Good For

* understanding STL deeply
* working with set/map
* using insert/erase positions

---

# Common Iterator Operations

## Move Forward

```cpp
it++;
```

---

## Move Backward

```cpp
it--;
```

---

## Next Element

```cpp
++it;
```

---

## Previous Element

```cpp
--it;
```

---

# Important Note

Not all iterators support random indexing like:

```cpp
it + 2
```

This works in:

* vector
* deque

But may not work in:

* set
* map
* list

So always be careful.

---

# Why Iterators Are Important in STL?

Because many STL functions work using iterators.

### Example

```cpp
sort(v.begin(), v.end());
reverse(v.begin(), v.end());
find(v.begin(), v.end(), 10);
```

So to use STL properly, iterator understanding is very important.

---

# Time Complexity

## Accessing begin/end

```cpp
O(1)
```

## Traversal using iterator

```cpp
O(n)
```

---

# Important Things to Remember

* Iterator behaves like a pointer
* Use `*it` to access value
* `begin()` → first element
* `end()` → just after last element
* `rbegin()` → last element
* `rend()` → before first element
* `auto` is commonly used with iterators
* In vector of pairs / map, use:

  * `it->first`
  * `it->second`

---

# Interview / DSA Relevance

Iterators are used in:

* vector traversal
* set traversal
* map traversal
* STL algorithms
* insert / erase operations

This is not a very hard topic, but it is **very important for writing clean STL code**.

---

# Summary

## Iterator is used to:

* point to elements
* traverse STL containers
* use STL algorithms properly

## Most Important Concepts

* begin / end
* rbegin / rend
* `*it`
* `auto`
* iterator in vector
* iterator in vector of pairs
* iterator in set
* iterator in map

---

