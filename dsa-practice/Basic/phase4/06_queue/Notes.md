# Queue in C++

## What is Queue?

* `queue` is a **linear data structure** in C++ STL.
* It follows:

```md
FIFO = First In First Out
```

This means:

* the element inserted **first** will be removed **first**.

---

## Real Life Example

Think of a line of people waiting for tickets 🎫

* first person in line gets served first
* last person waits at the back

Same concept works in queue.

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
queue<data_type> variable_name;
```

### Example

```cpp
queue<int> q;
queue<string> names;
```

---

# Basic Operations in Queue

## 1. push()

Used to insert element at the back.

### Syntax

```cpp
q.push(value);
```

### Example

```cpp
queue<int> q;
q.push(10);
q.push(20);
q.push(30);
```

Queue becomes:

```md
Front -> 10 20 30 <- Rear
```

---

## 2. pop()

Used to remove front element.

### Syntax

```cpp
q.pop();
```

### Example

```cpp
q.pop();
```

Now queue becomes:

```md
Front -> 20 30 <- Rear
```

---

## 3. front()

Used to access front element.

### Syntax

```cpp
q.front();
```

### Example

```cpp
cout << q.front();
```

### Output

```cpp
10
```

---

## 4. back()

Used to access last element.

### Syntax

```cpp
q.back();
```

### Example

```cpp
cout << q.back();
```

### Output

```cpp
30
```

---

## 5. size()

Returns number of elements in queue.

### Example

```cpp
cout << q.size();
```

---

## 6. empty()

Checks whether queue is empty or not.

### Example

```cpp
if (q.empty()) {
    cout << "Empty";
}
```

---

# Important Rule

In queue, we can only access:

* front element
* back element

We **cannot directly access middle elements** like array/vector.

❌ Not allowed:

```cpp
q[2]
```

---

# Basic Example

```cpp
queue<int> q;

q.push(10);
q.push(20);
q.push(30);

cout << q.front() << endl;   // 10
cout << q.back() << endl;    // 30

q.pop();

cout << q.front() << endl;   // 20
```

---

# Printing Queue

Queue does not allow direct traversal.

So to print it, we usually make a copy or pop elements.

### Example

```cpp
queue<int> temp = q;

while (!temp.empty()) {
    cout << temp.front() << " ";
    temp.pop();
}
```

---

# Input in Queue

Usually input is taken using loop.

### Example

```cpp
int n;
cin >> n;

queue<int> q;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    q.push(x);
}
```

---

# How Queue Works Internally

### Example

```cpp
q.push(1);
q.push(2);
q.push(3);
```

Queue:

```md
Front -> 1 2 3 <- Rear
```

Now:

```cpp
q.pop();
```

Queue:

```md
Front -> 2 3 <- Rear
```

---

# Common Use Cases of Queue

## 1. Waiting Line Problems

Queue naturally models waiting order.

---

## 2. BFS (Breadth First Search)

Very important in:

* graphs
* trees
* shortest path basics

---

## 3. First Non-Repeating Character

Common queue problem.

---

## 4. Scheduling / Simulation Problems

Used in:

* task scheduling
* process handling
* order processing

---

# Time Complexity

## push()

```cpp
O(1)
```

## pop()

```cpp
O(1)
```

## front()

```cpp
O(1)
```

## back()

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

* Queue follows **FIFO**
* Insert using `push()`
* Remove using `pop()`
* Access front using `front()`
* Access last using `back()`
* No direct indexing
* Very useful in BFS and simulation

---

# Queue vs Stack

| Feature | Queue | Stack |
| ------- | ----- | ----- |
| Order   | FIFO  | LIFO  |
| Insert  | Rear  | Top   |
| Delete  | Front | Top   |

---

# Common Mistakes

## 1. Using `pop()` and expecting value

❌ Wrong:

```cpp
cout << q.pop();
```

### Why?

Because `pop()` only removes element, it does **not return** it.

---

## Correct Way

```cpp
cout << q.front();
q.pop();
```

---

## 2. Calling `front()` or `back()` on empty queue

This can cause error.

### Safe Way

```cpp
if (!q.empty()) {
    cout << q.front();
}
```

---

# Interview / DSA Relevance

Queue is used in:

* BFS
* level order traversal
* scheduling problems
* stream problems
* simulation based questions

This is a **very important STL + DSA topic**.

---

# Summary

## Queue is used to:

* store data in FIFO order
* solve waiting line and BFS type problems
* handle simulation and stream based logic

## Most Important Concepts

* declaration
* push()
* pop()
* front()
* back()
* size()
* empty()
* queue printing
* queue use cases

---

