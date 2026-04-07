# Set in C++

## What is Set?

* `set` is an STL container in C++.
* It stores **unique elements only**.
* Elements are stored in **sorted order** by default.

So in `set`:

* duplicates are **not allowed**
* values remain **sorted automatically**

---

## Example

```cpp
set<int> s;
s.insert(5);
s.insert(2);
s.insert(8);
s.insert(5);
```

Stored values will be:

```cpp
2 5 8
```

Because:

* duplicate `5` is ignored
* values are sorted automatically

---

## Why Use Set?

Useful when we want:

* only unique elements
* sorted storage
* fast search / insert / delete

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

# Basic Syntax

## Declaration

```cpp
set<data_type> variable_name;
```

### Example

```cpp
set<int> s;
set<string> names;
```

---

# Basic Operations in Set

## 1. insert()

Used to insert element.

### Syntax

```cpp
s.insert(value);
```

### Example

```cpp
s.insert(10);
s.insert(20);
s.insert(30);
```

---

## 2. erase()

Used to remove element.

### Syntax

```cpp
s.erase(value);
```

### Example

```cpp
s.erase(20);
```

---

## 3. find()

Used to search an element.

### Syntax

```cpp
s.find(value);
```

### Example

```cpp
auto it = s.find(10);
```

If found:

```cpp
it != s.end()
```

If not found:

```cpp
it == s.end()
```

---

## 4. count()

Checks whether element exists or not.

### Syntax

```cpp
s.count(value);
```

### Example

```cpp
cout << s.count(10);
```

### Output

```cpp
1
```

If not present:

```cpp
0
```

---

## 5. size()

Returns number of unique elements.

### Example

```cpp
cout << s.size();
```

---

## 6. empty()

Checks whether set is empty or not.

### Example

```cpp
if (s.empty()) {
    cout << "Empty";
}
```

---

## 7. clear()

Deletes all elements from set.

### Example

```cpp
s.clear();
```

---

# Traversing Set

Set does not support indexing like vector.

❌ Not allowed:

```cpp
s[0]
```

So we use:

* iterator
* range based loop

---

## Using Range Based Loop

```cpp
for (auto val : s) {
    cout << val << " ";
}
```

---

## Using Iterator

```cpp
for (auto it = s.begin(); it != s.end(); it++) {
    cout << *it << " ";
}
```

---

# Input in Set

### Example

```cpp
int n;
cin >> n;

set<int> s;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    s.insert(x);
}
```

---

# How Set Works

When you insert elements:

```cpp
8 3 1 8 5 2
```

Set stores them as:

```cpp
1 2 3 5 8
```

Because:

* sorted automatically
* duplicate removed

---

# Important Properties of Set

## 1. Unique Elements Only

```cpp
set<int> s = {1, 2, 2, 3, 3, 4};
```

Stored as:

```cpp
1 2 3 4
```

---

## 2. Sorted Order

Elements are always stored in ascending order by default.

---

## 3. Fast Search

Search is faster than normal linear search.

---

# lower_bound() and upper_bound() in Set

Very useful.

---

## lower_bound(x)

Returns iterator to first element:

```cpp
>= x
```

### Example

```cpp
set<int> s = {1, 3, 5, 7, 9};
auto it = s.lower_bound(4);
cout << *it;
```

### Output

```cpp
5
```

---

## upper_bound(x)

Returns iterator to first element:

```cpp
> x
```

### Example

```cpp
set<int> s = {1, 3, 5, 7, 9};
auto it = s.upper_bound(5);
cout << *it;
```

### Output

```cpp
7
```

---

# Common Use Cases of Set

## 1. Remove Duplicates

Very common use.

---

## 2. Store Unique Sorted Data

Useful when order and uniqueness both matter.

---

## 3. Distinct Element Count

Used in many array problems.

---

## 4. Fast Searching

Useful in lookup problems.

---

## 5. Union / Intersection Type Problems

Set is very useful in such problems.

---

# Time Complexity

## insert()

```cpp
O(log n)
```

## erase()

```cpp
O(log n)
```

## find()

```cpp
O(log n)
```

## count()

```cpp
O(log n)
```

## lower_bound()

```cpp
O(log n)
```

## upper_bound()

```cpp
O(log n)
```

---

# Important Things to Remember

* `set` stores only **unique values**
* values are always **sorted**
* no indexing support
* traversal using iterator / loop
* useful for duplicate removal and searching

---

# Vector vs Set

| Feature    | Vector          | Set          |
| ---------- | --------------- | ------------ |
| Duplicates | Allowed         | Not Allowed  |
| Order      | Insertion order | Sorted order |
| Indexing   | Yes             | No           |
| Search     | O(n)            | O(log n)     |

---

# Common Mistakes

## 1. Expecting duplicate storage

❌ Wrong:

```cpp
set<int> s;
s.insert(5);
s.insert(5);
```

Stored only once:

```cpp
5
```

---

## 2. Using indexing like vector

❌ Wrong:

```cpp
cout << s[0];
```

Set does not support indexing.

---

## 3. Dereferencing invalid iterator

Example:

```cpp
auto it = s.find(100);
cout << *it;
```

If element not found, this can cause error.

### Safe Way

```cpp
if (it != s.end()) {
    cout << *it;
}
```

---

# Interview / DSA Relevance

Set is used in:

* distinct elements
* duplicate removal
* ordered unique storage
* union/intersection
* searching problems
* nearest greater/smaller lookup

This is a **very important STL topic**.

---

# Summary

## Set is used to:

* store unique values
* keep elements sorted
* search / insert / delete efficiently

## Most Important Concepts

* declaration
* insert()
* erase()
* find()
* count()
* lower_bound()
* upper_bound()
* traversal
* duplicate removal

---
