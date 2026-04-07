# Comparator / Custom Sorting in C++

## What is a Comparator?

A **comparator** is used to **change the default sorting order** in C++.

Normally, `sort()` sorts in:

* **Ascending Order**

But sometimes we need to sort:

* Descending
* By second value of pair
* By marks
* By custom rule

For this, we use a **custom comparator**.

---

## Why Learn Comparator?

Many DSA and interview problems require sorting based on **custom logic**.

### Common Examples

* Sort students by marks
* Sort pairs by second value
* Sort intervals by end time
* Greedy problems

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

## Default Sorting

### Ascending Order

```cpp
sort(v.begin(), v.end());
```

---

## Descending Order (Simple)

```cpp
sort(v.begin(), v.end(), greater<int>());
```

> This works for basic descending sorting.

---

## What is a Custom Comparator Function?

It is a function that tells `sort()`:

> **Which element should come first**

---

## Basic Syntax

```cpp
bool cmp(data_type a, data_type b) {
    return condition;
}
```

### Use in `sort()`

```cpp
sort(v.begin(), v.end(), cmp);
```

---

## Rule of Comparator

If comparator returns:

```cpp
true
```

Then:

> `a` should come before `b`

---

## Example 1: Descending Sort

```cpp
bool cmp(int a, int b) {
    return a > b;
}
```

### Use

```cpp
sort(v.begin(), v.end(), cmp);
```

This sorts in **descending order**.

---

## Example 2: Sort Pair by First Value

```cpp
bool cmp(pair<int, int> a, pair<int, int> b) {
    return a.first < b.first;
}
```

---

## Example 3: Sort Pair by Second Value

Very important use case.

```cpp
bool cmp(pair<int, int> a, pair<int, int> b) {
    return a.second < b.second;
}
```

### Use

```cpp
sort(v.begin(), v.end(), cmp);
```

---

## Example 4: If Second is Same, Sort by First

```cpp
bool cmp(pair<int, int> a, pair<int, int> b) {
    if (a.second == b.second)
        return a.first < b.first;
    return a.second < b.second;
}
```

> This is a very useful interview pattern.

---

## Example 5: Sort Students by Marks

Suppose we have:

```cpp
pair<string, int>
```

Where:

* `first` = name
* `second` = marks

### Comparator

```cpp
bool cmp(pair<string, int> a, pair<string, int> b) {
    return a.second > b.second;
}
```

This sorts students by **marks in descending order**.

---

## How Comparator Works Internally

Suppose:

```cpp
a = 5
b = 2
```

Comparator:

```cpp
return a > b;
```

Then:

```cpp
5 > 2 => true
```

So:

> `5` comes before `2`

---

## Important Rules to Remember

### 1. Comparator should return `bool`

```cpp
true / false
```

---

### 2. Comparator should not change values

It should only **compare**.

---

### 3. Comparator is mostly used with `sort()`

---

## Sorting Vector of Pairs

This is a **very common use case**.

### Default Pair Sorting

```cpp
sort(v.begin(), v.end());
```

This sorts:

* First by `first`
* If same, then by `second`

---

## Custom Pair Sorting by Second

```cpp
bool cmp(pair<int, int> a, pair<int, int> b) {
    return a.second < b.second;
}
```

---

## Sorting Strings by Length

Example of a custom rule.

```cpp
bool cmp(string a, string b) {
    return a.size() < b.size();
}
```

This sorts strings by **length**.

---

## Sorting in Descending Without Comparator

For normal integers:

```cpp
sort(v.begin(), v.end(), greater<int>());
```

> Easy shortcut for descending order.

---

## Comparator in Interview Problems

Very important in:

* Greedy
* Intervals
* Scheduling
* Ranking
* Sorting-based logic

---

## Time Complexity

Comparator itself does **not change** sorting complexity.

If using with `sort()`:

```cpp
O(n log n)
```

---

## Important Things to Remember

* Comparator changes sorting rule
* Used when default sorting is not enough
* Mostly used with `sort()`
* Very important for pairs and greedy problems

---

## Common Mistakes

### 1. Wrong Return Type

❌ Wrong:

```cpp
int cmp(int a, int b)
```

✅ Correct:

```cpp
bool cmp(int a, int b)
```

---

### 2. Wrong Comparison Logic

```cpp
return a < b;
```

> This gives **ascending order**, not descending.

---

### 3. Forgetting Tie Condition

If sorting by second value and both second values are same, you may also need:

```cpp
if (a.second == b.second)
```

---

## Common Use Cases

1. Sort in descending order
2. Sort pair by second value
3. Sort students by marks
4. Sort intervals by ending time
5. Sort strings by length

---

## Interview / DSA Relevance

Comparator is used in:

* Greedy problems
* Interval scheduling
* Activity selection
* Ranking / sorting problems
* Pair sorting

> This is a very important STL + DSA topic.

---

## Summary

Comparator is used to:

* Customize sorting
* Sort by custom rules
* Solve pair / greedy / interval problems

---

## Most Important Concepts

* Custom compare function
* Descending sorting
* Pair sorting
* Tie conditions
* Sort by second value

---

## Full Example Program

```cpp
#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int, int> a, pair<int, int> b) {
    if (a.second == b.second)
        return a.first < b.first;
    return a.second < b.second;
}

int main() {
    vector<pair<int, int>> v = {{1, 4}, {3, 2}, {2, 2}, {5, 1}};

    sort(v.begin(), v.end(), cmp);

    cout << "Sorted pairs:\n";
    for (auto p : v) {
        cout << p.first << " " << p.second << endl;
    }

    return 0;
}
```

---

## Output Example

```cpp
Sorted pairs:
5 1
2 2
3 2
1 4
```

---

## Bonus: Lambda Comparator

You can also write comparator directly inside `sort()` using **lambda function**.

```cpp
sort(v.begin(), v.end(), [](pair<int, int> a, pair<int, int> b) {
    return a.second < b.second;
});
```

> This is commonly used in modern C++.


