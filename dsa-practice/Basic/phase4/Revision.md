# 📌 STL Quick Revision Sheet 

---

## 🧠 Core Rule

* Focus on **patterns, not code**
* Ask: *Which data structure fits this problem?*

---

## 🔹 Vector

```cpp
vector<int> v;
v.push_back(x);
v.pop_back();
v.insert(v.begin() + i, x);
v.erase(v.begin() + i);
sort(v.begin(), v.end());
reverse(v.begin(), v.end());
```

---

## 🔹 Pair

```cpp
pair<int,int> p = {1,2};
p.first;
p.second;
```

---

## 🔹 Set

```cpp
set<int> s;
s.insert(x);
s.find(x);
s.lower_bound(x); // >= x
s.upper_bound(x); // > x
```

---

## 🔹 Unordered Set

```cpp
unordered_set<int> s;
s.insert(x);
s.find(x);
```

---

## 🔹 Map

```cpp
map<int,int> mp;
mp[x]++;
mp[x] = val;
mp.find(x);
```

---

## 🔹 Unordered Map

```cpp
unordered_map<int,int> mp;
mp[x]++;
```

---

## 🔹 Stack

```cpp
stack<int> st;
st.push(x);
st.pop();
st.top();
st.empty();
```

---

## 🔹 Queue

```cpp
queue<int> q;
q.push(x);
q.pop();
q.front();
q.empty();
```

---

## 🔹 Priority Queue (Heap)

```cpp
priority_queue<int> maxHeap;
priority_queue<int, vector<int>, greater<int>> minHeap;
```

---

## 🔹 Iterators

```cpp
for (auto it = v.begin(); it != v.end(); it++) cout << *it;
for (auto x : v) cout << x;
```

---

## 🔹 STL Functions

```cpp
sort(v.begin(), v.end());
reverse(v.begin(), v.end());
max_element(v.begin(), v.end());
min_element(v.begin(), v.end());
accumulate(v.begin(), v.end(), 0);
find(v.begin(), v.end(), x);
count(v.begin(), v.end(), x);
```

---

## 🔹 Comparator

```cpp
bool cmp(int a, int b) {
    return a > b; // descending
}

sort(v.begin(), v.end(), cmp);
```

### Rule:

* return true → correct order

---

## 🔹 Pair Comparator

```cpp
bool cmp(pair<int,int> a, pair<int,int> b) {
    if (a.second == b.second)
        return a.first < b.first;
    return a.second < b.second;
}
```

---

## 🔹 Prefix Sum

```cpp
prefix[0] = v[0];
for (int i = 1; i < n; i++)
    prefix[i] = prefix[i-1] + v[i];
```

---

## 🔹 Patterns Mapping

| Problem Type         | Use                 |
| -------------------- | ------------------- |
| Frequency            | map / unordered_map |
| Unique / duplicates  | set / unordered_set |
| Kth largest/smallest | heap                |
| Next greater         | stack               |
| Range sum            | prefix sum          |
| Sliding window       | two pointers        |

---

## 🧠 Brain Hacks

* Stack → "undo"
* Queue → "line"
* Heap → "top k"
* Map → "count"
* Set → "unique"

---

## ⚡ Recall Checklist

* Duplicate? → set
* Frequency? → map
* Kth element? → heap
* Next greater? → stack
* Subarray sum? → prefix / hashmap

---
