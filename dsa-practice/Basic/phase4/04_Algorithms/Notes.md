# STL Algorithms in C++

## What are STL Algorithms?

* STL provides many **ready-made functions** to perform common operations.
* These functions save time and make code shorter.
* They are mostly used with:

  * arrays
  * vectors
  * strings

---

## Why Learn STL Algorithms?

Because many common tasks like:

* sorting
* reversing
* searching
* counting
* finding maximum/minimum
* sum of elements

can be done in **1 line** using STL.

---

## Header Files

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

# Important STL Algorithms You Must Know

1. `sort()`
2. `reverse()`
3. `max()`
4. `min()`
5. `max_element()`
6. `min_element()`
7. `find()`
8. `count()`
9. `accumulate()`
10. `binary_search()`
11. `lower_bound()`
12. `upper_bound()`

---

# 1. sort()

## What it does

Sorts elements in ascending order by default.

---

## Syntax

```cpp
sort(start_iterator, end_iterator);
```

### Example

```cpp
vector<int> v = {4, 2, 8, 1, 5};
sort(v.begin(), v.end());
```

### Result

```cpp
1 2 4 5 8
```

---

## Descending Order

```cpp
sort(v.begin(), v.end(), greater<int>());
```

---

## Can Be Used On

* array
* vector
* string

---

## Time Complexity

```cpp
O(n log n)
```

---

# 2. reverse()

## What it does

Reverses the order of elements.

---

## Syntax

```cpp
reverse(start_iterator, end_iterator);
```

### Example

```cpp
vector<int> v = {1, 2, 3, 4, 5};
reverse(v.begin(), v.end());
```

### Result

```cpp
5 4 3 2 1
```

---

## Time Complexity

```cpp
O(n)
```

---

# 3. max()

## What it does

Returns maximum of two values.

### Example

```cpp
cout << max(10, 20);
```

### Output

```cpp
20
```

---

# 4. min()

## What it does

Returns minimum of two values.

### Example

```cpp
cout << min(10, 20);
```

### Output

```cpp
10
```

---

# 5. max_element()

## What it does

Finds the maximum element in a range.

---

## Syntax

```cpp
max_element(start_iterator, end_iterator);
```

### Example

```cpp
vector<int> v = {4, 2, 8, 1, 5};
cout << *max_element(v.begin(), v.end());
```

### Output

```cpp
8
```

---

## Important

`max_element()` returns an **iterator**, so use `*` to get value.

---

## Time Complexity

```cpp
O(n)
```

---

# 6. min_element()

## What it does

Finds the minimum element in a range.

### Example

```cpp
vector<int> v = {4, 2, 8, 1, 5};
cout << *min_element(v.begin(), v.end());
```

### Output

```cpp
1
```

---

## Time Complexity

```cpp
O(n)
```

---

# 7. find()

## What it does

Searches for an element in a range.

---

## Syntax

```cpp
find(start_iterator, end_iterator, value);
```

### Example

```cpp
vector<int> v = {10, 20, 30, 40};
auto it = find(v.begin(), v.end(), 30);
```

---

## Important

If element is found:

```cpp
it != v.end()
```

If not found:

```cpp
it == v.end()
```

---

## Example Check

```cpp
if (it != v.end()) {
    cout << "Found";
} else {
    cout << "Not Found";
}
```

---

## Time Complexity

```cpp
O(n)
```

---

# 8. count()

## What it does

Counts how many times a value appears.

---

## Syntax

```cpp
count(start_iterator, end_iterator, value);
```

### Example

```cpp
vector<int> v = {1, 2, 2, 3, 2, 4};
cout << count(v.begin(), v.end(), 2);
```

### Output

```cpp
3
```

---

## Time Complexity

```cpp
O(n)
```

---

# 9. accumulate()

## What it does

Calculates sum of all elements.

---

## Syntax

```cpp
accumulate(start_iterator, end_iterator, initial_sum);
```

### Example

```cpp
vector<int> v = {1, 2, 3, 4, 5};
cout << accumulate(v.begin(), v.end(), 0);
```

### Output

```cpp
15
```

---

## Important

* `0` means starting sum
* if you write `10`, then sum starts from 10

---

## Time Complexity

```cpp
O(n)
```

---

# 10. binary_search()

## What it does

Checks whether an element exists in a **sorted range**.

---

## Important

⚠️ Works correctly only on **sorted data**.

---

## Syntax

```cpp
binary_search(start_iterator, end_iterator, value);
```

### Example

```cpp
vector<int> v = {1, 2, 3, 4, 5};
cout << binary_search(v.begin(), v.end(), 3);
```

### Output

```cpp
1
```

If not found, output:

```cpp
0
```

---

## Time Complexity

```cpp
O(log n)
```

---

# 11. lower_bound()

## What it does

Returns iterator to the **first element >= value**.

---

## Syntax

```cpp
lower_bound(start_iterator, end_iterator, value);
```

### Example

```cpp
vector<int> v = {1, 2, 4, 4, 5, 7};
auto it = lower_bound(v.begin(), v.end(), 4);
cout << it - v.begin();
```

### Output

```cpp
2
```

Because first `4` is at index `2`.

---

## If Value Not Present

It returns position where the value **can be inserted**.

### Example

```cpp
vector<int> v = {1, 2, 4, 5, 7};
auto it = lower_bound(v.begin(), v.end(), 3);
cout << it - v.begin();
```

### Output

```cpp
2
```

Because `3` can be inserted at index `2`.

---

## Time Complexity

```cpp
O(log n)
```

---

# 12. upper_bound()

## What it does

Returns iterator to the **first element > value**.

---

## Syntax

```cpp
upper_bound(start_iterator, end_iterator, value);
```

### Example

```cpp
vector<int> v = {1, 2, 4, 4, 5, 7};
auto it = upper_bound(v.begin(), v.end(), 4);
cout << it - v.begin();
```

### Output

```cpp
4
```

Because first element greater than `4` is `5`, which is at index `4`.

---

## Time Complexity

```cpp
O(log n)
```

---

# Difference Between lower_bound() and upper_bound()

## lower_bound(x)

Returns first element:

```cpp
>= x
```

## upper_bound(x)

Returns first element:

```cpp
> x
```

---

## Example

```cpp
vector<int> v = {1, 2, 4, 4, 4, 5, 7};
```

### For `4`

```cpp
lower_bound -> index 2
upper_bound -> index 5
```

### Count of `4`

```cpp
upper_bound - lower_bound = 5 - 2 = 3
```

This is very important.

---

# Important Notes

## `sort()`, `binary_search()`, `lower_bound()`, `upper_bound()`

These are mostly used on:

* arrays
* vectors

---

## `lower_bound()` and `upper_bound()` need sorted data

Always sort first if needed.

---

# Common Use Cases of STL Algorithms

## 1. Sorting Data

```cpp
sort(v.begin(), v.end());
```

---

## 2. Reverse Data

```cpp
reverse(v.begin(), v.end());
```

---

## 3. Find Largest / Smallest

```cpp
*max_element(v.begin(), v.end())
*min_element(v.begin(), v.end())
```

---

## 4. Search for an Element

```cpp
find(v.begin(), v.end(), x)
```

---

## 5. Count Occurrences

```cpp
count(v.begin(), v.end(), x)
```

---

## 6. Sum of Elements

```cpp
accumulate(v.begin(), v.end(), 0)
```

---

## 7. Binary Search Based Problems

```cpp
binary_search()
lower_bound()
upper_bound()
```

---

# Time Complexity Summary

| Function          | Time Complexity |
| ----------------- | --------------- |
| `sort()`          | `O(n log n)`    |
| `reverse()`       | `O(n)`          |
| `max()` / `min()` | `O(1)`          |
| `max_element()`   | `O(n)`          |
| `min_element()`   | `O(n)`          |
| `find()`          | `O(n)`          |
| `count()`         | `O(n)`          |
| `accumulate()`    | `O(n)`          |
| `binary_search()` | `O(log n)`      |
| `lower_bound()`   | `O(log n)`      |
| `upper_bound()`   | `O(log n)`      |

---

# Important Things to Remember

* STL algorithms save time
* They make code short and clean
* Most algorithms work using iterators
* Some algorithms need **sorted data**
* `max_element()` and `min_element()` return iterators
* `lower_bound()` and `upper_bound()` are very important for DSA

---

# Interview / DSA Relevance

These STL algorithms are used in:

* array problems
* sorting problems
* searching problems
* binary search problems
* frequency based problems
* optimization problems

This topic is **extremely important** for coding rounds and DSA.

---

# Summary

## STL Algorithms are used to:

* sort
* reverse
* search
* count
* find max/min
* calculate sum
* perform binary search operations

## Most Important Functions

* `sort()`
* `reverse()`
* `max_element()`
* `min_element()`
* `find()`
* `count()`
* `accumulate()`
* `binary_search()`
* `lower_bound()`
* `upper_bound()`

---

