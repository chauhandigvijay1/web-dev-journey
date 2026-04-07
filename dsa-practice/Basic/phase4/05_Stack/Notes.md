# Stack in C++

## What is Stack?

* `stack` is a **linear data structure** in C++ STL.
* It follows:

```md
LIFO = Last In First Out
```

This means:

* the element inserted **last** will be removed **first**.

---

## Real Life Example

Think of a stack of plates 🍽️

* last plate placed on top
* first plate removed from top

Same concept works in stack.

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
stack<data_type> variable_name;
```

### Example

```cpp
stack<int> st;
stack<char> ch;
```

---

# Basic Operations in Stack

## 1. push()

Used to insert element into stack.

### Syntax

```cpp
st.push(value);
```

### Example

```cpp
stack<int> st;
st.push(10);
st.push(20);
st.push(30);
```

Stack becomes:

```cpp
Top
30
20
10
Bottom
```

---

## 2. pop()

Used to remove top element.

### Syntax

```cpp
st.pop();
```

### Example

```cpp
st.pop();
```

Now stack becomes:

```cpp
Top
20
10
Bottom
```

---

## 3. top()

Used to access top element.

### Syntax

```cpp
st.top();
```

### Example

```cpp
cout << st.top();
```

### Output

```cpp
30
```

---

## 4. size()

Returns number of elements in stack.

### Example

```cpp
cout << st.size();
```

---

## 5. empty()

Checks whether stack is empty or not.

### Example

```cpp
if (st.empty()) {
    cout << "Empty";
}
```

---

# Important Rule

In stack, we can only access:

* top element

We **cannot directly access middle elements** like array/vector.

❌ Not allowed:

```cpp
st[2]
```

---

# Basic Example

```cpp
stack<int> st;

st.push(10);
st.push(20);
st.push(30);

cout << st.top() << endl;   // 30
st.pop();
cout << st.top() << endl;   // 20
```

---

# Printing Stack

Stack does not allow direct traversal.

So to print it, we usually make a copy or pop elements.

### Example

```cpp
stack<int> temp = st;

while (!temp.empty()) {
    cout << temp.top() << " ";
    temp.pop();
}
```

---

# Input in Stack

Usually input is taken using loop.

### Example

```cpp
int n;
cin >> n;

stack<int> st;

for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    st.push(x);
}
```

---

# How Stack Works Internally

### Example

```cpp
st.push(1);
st.push(2);
st.push(3);
```

Stack:

```md
Top -> 3
       2
       1
```

Now:

```cpp
st.pop();
```

Stack:

```md
Top -> 2
       1
```

---

# Common Use Cases of Stack

## 1. Reverse Data

Stack can reverse order automatically because of LIFO.

---

## 2. Balanced Parentheses

Used to solve bracket problems.

Example:

```md
()[]{}
```

---

## 3. Expression Problems

Used in:

* infix
* postfix
* prefix

---

## 4. Next Greater / Smaller Problems

Very important in DSA.

---

## 5. Undo / Backtracking

Used in:

* browser back button
* undo operations

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

* Stack follows **LIFO**
* Insert only using `push()`
* Remove only using `pop()`
* Access only using `top()`
* No direct indexing
* Very useful in DSA

---

# Stack vs Queue

| Feature | Stack | Queue |
| ------- | ----- | ----- |
| Order   | LIFO  | FIFO  |
| Insert  | Top   | Rear  |
| Delete  | Top   | Front |

---

# Common Mistakes

## 1. Using `pop()` and expecting value

❌ Wrong:

```cpp
cout << st.pop();
```

### Why?

Because `pop()` only removes element, it does **not return** it.

---

## Correct Way

```cpp
cout << st.top();
st.pop();
```

---

## 2. Calling `top()` on empty stack

This can cause error.

### Safe Way

```cpp
if (!st.empty()) {
    cout << st.top();
}
```

---

# Interview / DSA Relevance

Stack is used in:

* parentheses problems
* next greater element
* monotonic stack
* expression conversion
* histogram problems
* recursion simulation

This is a **very important DSA topic**.

---

# Summary

## Stack is used to:

* store data in LIFO order
* reverse data
* solve parentheses and next greater type problems

## Most Important Concepts

* declaration
* push()
* pop()
* top()
* size()
* empty()
* stack printing
* stack use cases

---

