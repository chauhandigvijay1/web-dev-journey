# Vector in C++

## What is Vector?

* `vector` is a **dynamic array** in C++ STL.
* It stores elements just like an array.
* But unlike array, its **size can grow or shrink automatically**.
* It is one of the **most used STL containers**.

---

## Why Use Vector?

In array, size is usually fixed:

```cpp
int arr[5];
```

But in vector:

```cpp
vector<int> v;
```

You can keep adding elements whenever needed.

### Advantages of Vector

* dynamic size
* easy insertion
* easy deletion
* easy traversal
* useful in DSA and competitive programming

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
vector<data_type> variable_name;
```

### Example

```cpp
vector<int> v;
vector<string> names;
vector<char> ch;
```

---

## Initialization

### Empty Vector

```cpp
vector<int> v;
```

### Fixed Size Vector

```cpp
vector<int> v(5);
```

This creates vector of size 5 with default values:

```cpp
0 0 0 0 0
```

---

### Fixed Size with Given Value

```cpp
vector<int> v(5, 10);
```

Output values:

```cpp
10 10 10 10 10
```

---

# Access Elements

Elements are accessed using index.

### Example

```cpp
vector<int> v = {10, 20, 30, 40};

cout << v[0] << endl;   // 10
cout << v[2] << endl;   // 30
```

---

# Taking Input in Vector

## Method 1: Empty Vector + push_back()

```cpp
int n;
cin >> n;

vector<int> v;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    v.push_back(x);
}
```

---

## Method 2: Predefined Size

```cpp
int n;
cin >> n;

vector<int> v(n);

for (int i = 0; i < n; i++) {
    cin >> v[i];
}
```

---

# Printing Vector

## Method 1: Using Index

```cpp
for (int i = 0; i < v.size(); i++) {
    cout << v[i] << " ";
}
```

---

## Method 2: Range Based Loop

```cpp
for (auto it : v) {
    cout << it << " ";
}
```

---

# Important Vector Functions

---

## 1. push_back()

Adds element at the end.

### Syntax

```cpp
v.push_back(value);
```

### Example

```cpp
vector<int> v;
v.push_back(10);
v.push_back(20);
v.push_back(30);
```

Vector becomes:

```cpp
10 20 30
```

---

## 2. pop_back()

Removes last element.

### Syntax

```cpp
v.pop_back();
```

### Example

```cpp
vector<int> v = {10, 20, 30};
v.pop_back();
```

Now vector becomes:

```cpp
10 20
```

---

## 3. size()

Returns number of elements.

### Example

```cpp
vector<int> v = {10, 20, 30};
cout << v.size();
```

### Output

```cpp
3
```

---

## 4. empty()

Checks whether vector is empty or not.

### Example

```cpp
if (v.empty()) {
    cout << "Empty";
}
```

---

## 5. clear()

Deletes all elements from vector.

### Example

```cpp
v.clear();
```

---

## 6. front()

Returns first element.

### Example

```cpp
cout << v.front();
```

---

## 7. back()

Returns last element.

### Example

```cpp
cout << v.back();
```

---

# Traversing Vector

## Using For Loop

```cpp
for (int i = 0; i < v.size(); i++) {
    cout << v[i] << " ";
}
```

---

## Using Range Based Loop

```cpp
for (auto val : v) {
    cout << val << " ";
}
```

---

## Using Iterator

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

---

# Insert in Vector

Used to insert element at a specific position.

### Syntax

```cpp
v.insert(v.begin() + index, value);
```

### Example

```cpp
vector<int> v = {10, 20, 30};
v.insert(v.begin() + 1, 15);
```

Now vector becomes:

```cpp
10 15 20 30
```

---

# Erase in Vector

Used to delete element from a specific position.

### Syntax

```cpp
v.erase(v.begin() + index);
```

### Example

```cpp
vector<int> v = {10, 20, 30, 40};
v.erase(v.begin() + 2);
```

Now vector becomes:

```cpp
10 20 40
```

---

## Erase a Range

### Syntax

```cpp
v.erase(v.begin() + start, v.begin() + end);
```

### Example

```cpp
vector<int> v = {10, 20, 30, 40, 50};
v.erase(v.begin() + 1, v.begin() + 3);
```

Deletes:

```cpp
20, 30
```

Remaining:

```cpp
10 40 50
```

---

# Sorting Vector

### Ascending Order

```cpp
sort(v.begin(), v.end());
```

---

### Descending Order

```cpp
sort(v.begin(), v.end(), greater<int>());
```

---

# Reversing Vector

```cpp
reverse(v.begin(), v.end());
```

---

# Copying Vector

```cpp
vector<int> v1 = {1, 2, 3};
vector<int> v2 = v1;
```

---

# Comparing Vector

Vectors can be compared directly.

### Example

```cpp
vector<int> a = {1, 2, 3};
vector<int> b = {1, 2, 4};

cout << (a < b);
```

Comparison is **lexicographical**.

---

# 2D Vector

A vector can contain another vector.

This is called **2D vector**.

---

## Declaration

```cpp
vector<vector<int>> matrix;
```

---

## Fixed Size 2D Vector

```cpp
vector<vector<int>> matrix(3, vector<int>(4, 0));
```

This creates:

```cpp
3 rows and 4 columns
```

All values initialized with `0`.

---

## Input in 2D Vector

```cpp
int n, m;
cin >> n >> m;

vector<vector<int>> matrix(n, vector<int>(m));

for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        cin >> matrix[i][j];
    }
}
```

---

## Output in 2D Vector

```cpp
for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        cout << matrix[i][j] << " ";
    }
    cout << endl;
}
```

---

# Vector of Pairs

Very important in DSA.

### Declaration

```cpp
vector<pair<int, int>> v;
```

### Example

```cpp
vector<pair<int, int>> v;

v.push_back({1, 2});
v.push_back({3, 4});
```

### Traversal

```cpp
for (auto it : v) {
    cout << it.first << " " << it.second << endl;
}
```

---

# Common Use Cases of Vector

## 1. Store Dynamic Data

```cpp
vector<int> marks;
```

---

## 2. Store Matrix

```cpp
vector<vector<int>> mat;
```

---

## 3. Store Pairs

```cpp
vector<pair<int, int>> vp;
```

---

## 4. Prefix Sum / Frequency

```cpp
vector<int> prefix(n);
```

---

# Time Complexity

## Access by Index

```cpp
O(1)
```

## push_back()

```cpp
O(1) average
```

## pop_back()

```cpp
O(1)
```

## insert() / erase() in middle

```cpp
O(n)
```

## Traversal

```cpp
O(n)
```

## sort()

```cpp
O(n log n)
```

---

# Important Things to Remember

* Vector is **dynamic array**
* Indexing starts from `0`
* `push_back()` adds at end
* `pop_back()` removes from end
* `insert()` and `erase()` in middle are costly
* `vector<pair<int, int>>` is very important
* `2D vector` is used like matrix

---

# Array vs Vector

| Feature       | Array         | Vector      |
| ------------- | ------------- | ----------- |
| Size          | Fixed         | Dynamic     |
| Insert/Delete | Difficult     | Easy        |
| STL Support   | No            | Yes         |
| Use in DSA    | Less flexible | Very common |

---

# Interview / DSA Relevance

Vector is used in:

* arrays problems
* prefix sum
* sliding window
* sorting
* graphs
* matrices
* binary search problems
* dynamic storage problems

So this is one of the **most important STL topics**.

---

# Summary

## Vector is used to:

* store dynamic elements
* access like array
* easily insert/delete/traverse
* solve most DSA problems efficiently

## Most Important Concepts

* declaration
* input/output
* push_back / pop_back
* size / clear / empty
* front / back
* insert / erase
* sort / reverse
* 2D vector
* vector of pairs

---

# Unique Questions to Practice

## Basic

1. Take input in vector and print it
2. Find sum of all elements
3. Find maximum and minimum element
4. Reverse a vector
5. Sort a vector

## Important

6. Remove duplicates from vector
7. Insert element at a specific index
8. Delete element from a specific index
9. Create and print 2D vector
10. Create and print vector of pairs
11. Merge two vectors
12. Find second largest element
13. Prefix sum using vector
14. Rotate vector by 1 place
15. Count frequency of each element using vector

---
