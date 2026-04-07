# Unordered Map in C++

## What is `unordered_map`?

`unordered_map` is an **STL container** in C++ used to store data in **key-value pairs**.

* Each **key is unique**
* Values can repeat
* Data is stored using **hashing**
* Unlike `map`, elements are **not stored in sorted order**

---

## Example

```cpp
unordered_map<int, int> mp;
mp[3] = 30;
mp[1] = 10;
mp[2] = 20;
```

### Possible Output

```cpp
2 -> 20
1 -> 10
3 -> 30
```

> **Note:** Output order can be different because `unordered_map` does **not maintain sorted order**.

---

## Why Use `unordered_map`?

`unordered_map` is useful when you want:

* Key-value storage
* Very fast lookup
* Very fast insert/delete
* Frequency counting
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
unordered_map<data_type1, data_type2> variable_name;
```

### Example

```cpp
unordered_map<int, int> mp;
unordered_map<string, int> marks;
```

---

## Basic Operations

### 1. Insert

#### Method 1: Using `[]`

```cpp
mp[key] = value;
```

#### Example

```cpp
mp[1] = 100;
mp[2] = 200;
```

#### Method 2: Using `insert()`

```cpp
mp.insert({key, value});
```

#### Example

```cpp
mp.insert({3, 300});
```

---

### 2. Access Value

```cpp
cout << mp[key];
```

#### Example

```cpp
cout << mp[1];
```

---

### 3. Update Value

```cpp
mp[key] = new_value;
```

#### Example

```cpp
mp[1] = 500;
```

---

### 4. `erase()`

Removes an element by key.

```cpp
mp.erase(key);
```

#### Example

```cpp
mp.erase(2);
```

---

### 5. `find()`

Used to search for a key.

```cpp
auto it = mp.find(key);
```

#### If Found

```cpp
it != mp.end()
```

#### Example

```cpp
auto it = mp.find(1);

if (it != mp.end()) {
    cout << "Found: " << it->first << " -> " << it->second << endl;
}
```

---

### 6. `count()`

Checks whether a key exists or not.

```cpp
mp.count(key);
```

#### Returns

* `1` → exists
* `0` → does not exist

#### Example

```cpp
if (mp.count(5)) {
    cout << "Key exists";
}
```

---

### 7. `size()`

Returns the number of elements.

```cpp
cout << mp.size();
```

---

### 8. `empty()`

Checks whether the map is empty.

```cpp
if (mp.empty()) {
    cout << "Empty";
}
```

---

### 9. `clear()`

Removes all elements.

```cpp
mp.clear();
```

---

## Traversing `unordered_map`

### Using Iterator

```cpp
for (auto it = mp.begin(); it != mp.end(); it++) {
    cout << it->first << " " << it->second << endl;
}
```

---

### Using Range-Based Loop

```cpp
for (auto it : mp) {
    cout << it.first << " " << it.second << endl;
}
```

---

## Input in `unordered_map`

### Example

```cpp
int n;
cin >> n;

unordered_map<int, int> mp;

for (int i = 0; i < n; i++) {
    int key, value;
    cin >> key >> value;
    mp[key] = value;
}
```

---

## Important Properties of `unordered_map`

### 1. Unique Keys

```cpp
mp[1] = 10;
mp[1] = 20;
```

#### Final Value

```cpp
1 -> 20
```

> If the same key is inserted again, the value gets updated.

---

### 2. No Sorted Order

Elements are stored in **hash-based/random order**.

So output order is **not guaranteed**.

---

### 3. Faster Than `map` (Average Case)

Most operations are usually:

```cpp
O(1)
```

This is why `unordered_map` is very useful in DSA and coding interviews.

---

## Common Use Cases of `unordered_map`

### 1. Frequency Count in Array

```cpp
for (auto x : arr) {
    mp[x]++;
}
```

---

### 2. Character Count in String

```cpp
for (char c : str) {
    mp[c]++;
}
```

---

### 3. Fast Lookup

Useful when order does **not matter** and speed is important.

---

### 4. Two Sum / Hashing Problems

One of the most important uses of `unordered_map`.

---

## Time Complexity

| Operation  | Average Case |
| ---------- | ------------ |
| `insert()` | `O(1)`       |
| `erase()`  | `O(1)`       |
| `find()`   | `O(1)`       |
| `count()`  | `O(1)`       |

---

### Worst Case

In rare bad cases:

```cpp
O(n)
```

But in most coding problems, **average complexity matters**.

---

## Important Things to Remember

* `unordered_map` stores **key-value pairs**
* Keys are always **unique**
* Values can repeat
* It does **not maintain sorted order**
* Usually faster than `map`
* Best for **hashing-based problems**

---

## `map` vs `unordered_map`

| Feature  | `map`                       | `unordered_map`      |
| -------- | --------------------------- | -------------------- |
| Order    | Sorted by key               | No order             |
| Search   | `O(log n)`                  | `O(1)` average       |
| Insert   | `O(log n)`                  | `O(1)` average       |
| Use Case | When sorted order is needed | When speed is needed |

---

## Common Mistakes

### 1. Expecting Sorted Output

#### Wrong

```cpp
unordered_map<int, int> mp;
```

> Output order is **not fixed**.

---

### 2. Accessing a Non-Existing Key

```cpp
cout << mp[100];
```

#### Problem

This creates a **new key** with default value:

```cpp
100 -> 0
```

> Use `find()` or `count()` if you only want to check existence.

---

### 3. Dereferencing Invalid Iterator

#### Wrong

```cpp
auto it = mp.find(100);
cout << it->second;
```

#### Correct

```cpp
auto it = mp.find(100);

if (it != mp.end()) {
    cout << it->second;
}
```

---

## Interview / DSA Relevance

`unordered_map` is heavily used in:

* Hashing problems
* Frequency count
* Lookup optimization
* Two Sum
* Duplicate checking
* Counting problems

> This is one of the **most important STL containers** for coding interviews.

---

## Summary

`unordered_map` is used to:

* Store key-value pairs quickly
* Solve hashing-based problems
* Do frequency count efficiently
* Optimize lookup operations

---

## Most Important Concepts to Learn

* Declaration
* Insertion
* Access / Update
* `erase()`
* `find()`
* Traversal
* Frequency Count
* `map` vs `unordered_map`

---

## Full Example Program

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    unordered_map<int, int> mp;

    // Insert
    mp[1] = 100;
    mp[2] = 200;
    mp.insert({3, 300});

    // Access
    cout << "Value at key 1: " << mp[1] << endl;

    // Update
    mp[1] = 500;

    // Traverse
    cout << "\nMap elements:\n";
    for (auto it : mp) {
        cout << it.first << " -> " << it.second << endl;
    }

    // Find
    auto it = mp.find(2);
    if (it != mp.end()) {
        cout << "\nKey 2 found with value: " << it->second << endl;
    }

    // Count
    cout << "\nDoes key 3 exist? " << mp.count(3) << endl;

    // Size
    cout << "\nSize: " << mp.size() << endl;

    // Erase
    mp.erase(2);

    // Final traversal
    cout << "\nAfter erase:\n";
    for (auto it : mp) {
        cout << it.first << " -> " << it.second << endl;
    }

    return 0;
}
```

---

## Output Example

```cpp
Value at key 1: 100

Map elements:
3 -> 300
2 -> 200
1 -> 500

Key 2 found with value: 200

Does key 3 exist? 1

Size: 3

After erase:
3 -> 300
1 -> 500
```

> Output order may vary.

---
