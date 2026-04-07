# Map in C++

## What is Map?

* `map` is an STL container in C++.
* It stores data in **key-value pairs**.
* Keys are **unique**.
* Data is stored in **sorted order of keys**.

---

## Example

```cpp
map<int, int> mp;
mp[1] = 10;
mp[2] = 20;
mp[1] = 50;
```

Stored values:

```cpp
1 -> 50
2 -> 20
```

Because:

* keys are unique
* value gets updated if key already exists

---

## Why Use Map?

Useful when we want:

* store **key-value mapping**
* fast lookup
* frequency counting
* ordered data by key

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
map<data_type1, data_type2> variable_name;
```

### Example

```cpp
map<int, int> mp;
map<string, int> marks;
```

---

# Basic Operations

## 1. Insert

### Method 1: Using []

```cpp
mp[key] = value;
```

### Example

```cpp
mp[1] = 100;
mp[2] = 200;
```

---

### Method 2: Using insert()

```cpp
mp.insert({key, value});
```

---

## 2. Access Value

```cpp
cout << mp[key];
```

---

## 3. Update Value

```cpp
mp[key] = new_value;
```

---

## 4. erase()

Removes element by key.

```cpp
mp.erase(key);
```

---

## 5. find()

Search for a key.

```cpp
auto it = mp.find(key);
```

If found:

```cpp
it != mp.end()
```

---

## 6. count()

Check if key exists.

```cpp
mp.count(key);
```

Returns:

```cpp
1 (exists)
0 (not exists)
```

---

## 7. size()

```cpp
cout << mp.size();
```

---

## 8. empty()

```cpp
if (mp.empty()) {
    cout << "Empty";
}
```

---

## 9. clear()

```cpp
mp.clear();
```

---

# Traversing Map

## Using Iterator

```cpp
for (auto it = mp.begin(); it != mp.end(); it++) {
    cout << it->first << " " << it->second << endl;
}
```

---

## Using Range Based Loop

```cpp
for (auto it : mp) {
    cout << it.first << " " << it.second << endl;
}
```

---

# Input in Map

### Example

```cpp
int n;
cin >> n;

map<int, int> mp;

for (int i = 0; i < n; i++) {
    int key, value;
    cin >> key >> value;
    mp[key] = value;
}
```

---

# Important Properties of Map

## 1. Unique Keys

```cpp
mp[1] = 10;
mp[1] = 20;
```

Final:

```cpp
1 -> 20
```

---

## 2. Sorted Order

Keys are stored in ascending order.

---

## 3. Fast Operations

Insert, delete, search in:

```cpp
O(log n)
```

---

# lower_bound() and upper_bound() in Map

## lower_bound(key)

Returns first element:

```cpp
>= key
```

---

## upper_bound(key)

Returns first element:

```cpp
> key
```

---

# Common Use Cases of Map

## 1. Frequency Count

```cpp
for (auto x : arr) {
    mp[x]++;
}
```

---

## 2. Character Count

```cpp
for (char c : str) {
    mp[c]++;
}
```

---

## 3. Index Mapping

Store index of elements.

---

## 4. Grouping Data

Group values based on keys.

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

---

# Important Things to Remember

* map stores **key-value pairs**
* keys are always **unique**
* values can be duplicate
* data is sorted by keys
* no indexing like vector
* use `it->first`, `it->second`

---

# Map vs Set

| Feature | Map           | Set        |
| ------- | ------------- | ---------- |
| Stores  | Key-Value     | Only Value |
| Keys    | Unique        | Unique     |
| Order   | Sorted by key | Sorted     |

---

# Common Mistakes

## 1. Accessing non-existing key

```cpp
cout << mp[100];
```

This creates a new key with default value `0`.

---

## 2. Forgetting key uniqueness

```cpp
mp[1] = 10;
mp[1] = 20;
```

Only one key exists.

---

## 3. Dereferencing invalid iterator

```cpp
auto it = mp.find(100);
cout << it->second;
```

Always check:

```cpp
if (it != mp.end())
```

---

# Interview / DSA Relevance

Map is used in:

* frequency counting
* hashing problems
* two sum
* grouping data
* indexing
* lookup problems

This is one of the **most important STL topics**.

---

# Summary

## Map is used to:

* store key-value pairs
* count frequency
* fast lookup
* store sorted data by key

## Most Important Concepts

* declaration
* insertion
* access/update
* erase()
* find()
* traversal
* frequency count

---

