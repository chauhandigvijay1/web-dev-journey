# Priority Queue in C++

## What is Priority Queue?

* `priority_queue` is a special type of queue in C++ STL.
* In normal queue:

  * first inserted element comes out first
* But in priority queue:

  * element with **highest priority** comes out first

By default in C++:

```md
Priority Queue = Max Heap
```

That means:

* **largest element stays on top**

---

## Why Use Priority Queue?

It is useful when we always want:

* largest element quickly
* smallest element quickly
* top K elements
* heap based processing

---

## Header File

```cpp
#include <bits/stdc++.h>
using namespace std;
```

---

# Basic Syntax

## Max Heap (Default)

```cpp
priority_queue<data_type> variable_name;
```

### Example

```cpp
priority_queue<int> pq;
```

---

## Min Heap

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
```

This creates a **min heap**.

That means:

* smallest element stays on top

---

# Max Heap

## Example

```cpp
priority_queue<int> pq;

pq.push(10);
pq.push(30);
pq.push(20);
```

Internally:

```md
Top -> 30
       20
       10
```

### Access Top

```cpp
cout << pq.top();
```

### Output

```cpp
30
```

---

# Min Heap

## Example

```cpp
priority_queue<int, vector<int>, greater<int>> pq;

pq.push(10);
pq.push(30);
pq.push(20);
```

Internally:

```md
Top -> 10
       20
       30
```

### Access Top

```cpp
cout << pq.top();
```

### Output

```cpp
10
```

---

# Basic Operations

## 1. push()

Used to insert element.

### Syntax

```cpp
pq.push(value);
```

---

## 2. pop()

Used to remove top priority element.

### Syntax

```cpp
pq.pop();
```

---

## 3. top()

Used to access top element.

### Syntax

```cpp
pq.top();
```

---

## 4. size()

Returns number of elements.

### Example

```cpp
cout << pq.size();
```

---

## 5. empty()

Checks whether priority queue is empty or not.

### Example

```cpp
if (pq.empty()) {
    cout << "Empty";
}
```

---

# Important Rule

Like stack and queue, priority queue also does **not allow direct indexing**.

❌ Not allowed:

```cpp
pq[2]
```

We can only access:

* top element

---

# Basic Example

## Max Heap

```cpp
priority_queue<int> pq;

pq.push(5);
pq.push(1);
pq.push(10);
pq.push(3);

cout << pq.top() << endl;   // 10
pq.pop();
cout << pq.top() << endl;   // 5
```

---

# Printing Priority Queue

Direct traversal is not possible.

So we usually use a copy.

### Example

```cpp
priority_queue<int> temp = pq;

while (!temp.empty()) {
    cout << temp.top() << " ";
    temp.pop();
}
```

---

# Input in Priority Queue

### Example

```cpp
int n;
cin >> n;

priority_queue<int> pq;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    pq.push(x);
}
```

---

# How Priority Queue Works

## In Max Heap

Largest element always comes first.

### Example

```cpp
pq.push(4);
pq.push(8);
pq.push(2);
pq.push(10);
```

Order of removal:

```cpp
10 8 4 2
```

---

## In Min Heap

Smallest element always comes first.

### Example

```cpp
pq.push(4);
pq.push(8);
pq.push(2);
pq.push(10);
```

Order of removal:

```cpp
2 4 8 10
```

---

# Common Use Cases of Priority Queue

## 1. Kth Largest / Smallest Element

Very common interview problem.

---

## 2. Top K Frequent Elements

Used in heap based ranking problems.

---

## 3. Merge K Sorted Arrays / Lists

Very important DSA pattern.

---

## 4. Scheduling Problems

Used in:

* CPU scheduling
* task processing
* event handling

---

## 5. Graph Algorithms

Used in:

* Dijkstra's Algorithm
* Prim's Algorithm

---

# Time Complexity

## push()

```cpp
O(log n)
```

## pop()

```cpp
O(log n)
```

## top()

```cpp
O(1)
```

## size()

```cpp
O(1)
```

## empty()

```cpp
O(1)
```

---

# Important Things to Remember

* By default, priority queue in C++ is **max heap**
* Use `greater<int>` for **min heap**
* `top()` gives highest priority element
* No direct traversal or indexing
* Very useful in heap and top K problems

---

# Queue vs Priority Queue

| Feature     | Queue            | Priority Queue     |
| ----------- | ---------------- | ------------------ |
| Order       | FIFO             | Based on priority  |
| Top Element | First inserted   | Largest / smallest |
| Use         | BFS / simulation | Heap / top K       |

---

# Common Mistakes

## 1. Thinking it stores elements in insertion order

❌ Wrong

Priority queue stores elements according to **priority**, not insertion order.

---

## 2. Using `pop()` and expecting value

❌ Wrong:

```cpp
cout << pq.pop();
```

### Correct Way

```cpp
cout << pq.top();
pq.pop();
```

---

## 3. Calling `top()` on empty priority queue

This can cause error.

### Safe Way

```cpp
if (!pq.empty()) {
    cout << pq.top();
}
```

---

# Interview / DSA Relevance

Priority Queue is used in:

* heap problems
* Kth largest / smallest
* top K frequent
* graph shortest path
* greedy algorithms

This is a **very important DSA + STL topic**.

---

# Summary

## Priority Queue is used to:

* get highest / lowest priority element quickly
* solve top K and heap based problems
* optimize many DSA problems

## Most Important Concepts

* max heap
* min heap
* push()
* pop()
* top()
* size()
* empty()
* priority based ordering

---


