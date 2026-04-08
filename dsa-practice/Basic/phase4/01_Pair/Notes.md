# Pair in C++

## What is Pair?

* `pair` is a **utility container** in C++ STL.
* It is used to store **2 values together** in a single variable.
* Both values can be of:

  * same datatype
  * different datatype
* Mostly used in:

  * coordinates `(x, y)`
  * marks & roll number
  * sorting problems
  * vector of pairs
  * maps
  * graphs

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

## Basic Syntax

```cpp
pair<data_type1, data_type2> variable_name;
```

### Example

```cpp
pair<int, int> p;
```

---

## Initialization

```cpp
pair<int, int> p = {10, 20};
```

### Access Values

```cpp
cout << p.first << endl;
cout << p.second << endl;
```

### Output

```cpp
10
20
```

---

## Important Members

* `first` → first value
* `second` → second value

### Example

```cpp
pair<string, int> student = {"Dugu", 101};

cout << student.first << endl;   // Dugu
cout << student.second << endl;  // 101
```

---

# Why Use Pair?

Instead of making 2 separate variables:

```cpp
int x = 5;
int y = 10;
```

We can store both together:

```cpp
pair<int, int> p = {5, 10};
```

This makes code:

* cleaner
* shorter
* easy to manage

---

# Types of Pair Usage

## 1. Pair of Same Datatype

```cpp
pair<int, int> p = {1, 2};
```

---

## 2. Pair of Different Datatype

```cpp
pair<string, int> p = {"Rahul", 95};
```

---

## 3. Nested Pair

A pair can contain another pair.

### Syntax

```cpp
pair<int, pair<int, int>> p;
```

### Example

```cpp
pair<int, pair<int, int>> p = {1, {2, 3}};
```

### Access Nested Pair

```cpp
cout << p.first << endl;           // 1
cout << p.second.first << endl;    // 2
cout << p.second.second << endl;   // 3
```

---

# Array of Pairs

Used when we want to store multiple pairs.

### Syntax

```cpp
pair<int, int> arr[3];
```

### Example

```cpp
pair<int, int> arr[3] = {{1, 2}, {3, 4}, {5, 6}};
```

### Access

```cpp
cout << arr[0].first << " " << arr[0].second << endl;
cout << arr[1].first << " " << arr[1].second << endl;
cout << arr[2].first << " " << arr[2].second << endl;
```

---

# Vector of Pairs

Used when we want **dynamic storage of pairs**.

### Syntax

```cpp
vector<pair<int, int>> v;
```

### Example

```cpp
vector<pair<int, int>> v;

v.push_back({1, 2});
v.push_back({3, 4});
v.push_back({5, 6});
```

### Traversal

```cpp
for (int i = 0; i < v.size(); i++) {
    cout << v[i].first << " " << v[i].second << endl;
}
```

---

# Input in Pair

### Single Pair Input

```cpp
pair<int, int> p;
cin >> p.first >> p.second;
```

---

## Input in Array of Pairs

```cpp
int n;
cin >> n;
pair<int, int> arr[n];

for (int i = 0; i < n; i++) {
    cin >> arr[i].first >> arr[i].second;
}
```

---

## Input in Vector of Pairs

```cpp
int n;
cin >> n;
vector<pair<int, int>> v(n);

for (int i = 0; i < n; i++) {
    cin >> v[i].first >> v[i].second;
}
```

---

# Output in Pair

## Single Pair

```cpp
cout << p.first << " " << p.second << endl;
```

---

## Vector of Pairs

```cpp
for (auto it : v) {
    cout << it.first << " " << it.second << endl;
}
```

---

# Swapping Pairs

Pairs can be swapped directly.

### Example

```cpp
pair<int, int> p1 = {1, 2};
pair<int, int> p2 = {3, 4};

swap(p1, p2);
```

After swap:

```cpp
p1 = {3, 4}
p2 = {1, 2}
```

---

# Comparison of Pairs

Very important for sorting.

Pairs are compared **lexicographically**.

That means:

1. first compare `first`
2. if equal, then compare `second`

### Example

```cpp
pair<int, int> p1 = {1, 5};
pair<int, int> p2 = {2, 3};

cout << (p1 < p2);
```

### Explanation

Because:

```cpp
1 < 2
```

So result is:

```cpp
true
```

---

## Another Example

```cpp
pair<int, int> p1 = {2, 5};
pair<int, int> p2 = {2, 8};
```

Now first values are same:

```cpp
2 == 2
```

So second values compare:

```cpp
5 < 8
```

So:

```cpp
p1 < p2  => true
```

---

# Sorting with Pair

Very important use case.

If we sort pairs, sorting happens:

* first by `first`
* if same, then by `second`

### Example

```cpp
vector<pair<int, int>> v = {{2, 3}, {1, 5}, {2, 1}, {1, 2}};

sort(v.begin(), v.end());
```

### Sorted Result

```cpp
{1, 2}
{1, 5}
{2, 1}
{2, 3}
```

---

# Common Use Cases of Pair

## 1. Coordinates

```cpp
pair<int, int> point = {4, 7};
```

---

## 2. Student Data

```cpp
pair<string, int> student = {"Aman", 95};
```

---

## 3. Graphs

```cpp
pair<int, int> edge = {u, v};
```

---

## 4. Sorting Problems

```cpp
vector<pair<int, int>> intervals;
```

---

# Time Complexity

## Creating Pair

```cpp
O(1)
```

## Accessing `first` / `second`

```cpp
O(1)
```

## Swapping Pair

```cpp
O(1)
```

---

# Important Things to Remember

* `pair` stores **exactly 2 values**
* Access values using:

  * `.first`
  * `.second`
* Nested pair is possible
* Very useful with:

  * `vector`
  * `sort()`
  * `map`
* Pair comparison is **lexicographical**

---

# Interview / DSA Relevance

`pair` is used in:

* sorting
* intervals
* graphs
* heap / priority queue
* maps
* coordinate based problems

So this is a **must know STL topic**.

---

# Summary

## Pair is used to:

* store 2 values together
* make code shorter
* solve sorting / coordinate / graph problems easily

## Most Important Concepts

* declaration
* initialization
* `.first` and `.second`
* nested pair
* array of pairs
* vector of pairs
* sorting pairs

---

