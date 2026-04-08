/*
Question:
- Implement max heap operations

Approach / Logic:
- Use priority_queue (default max heap)
- push, pop, top operations

Time Complexity: push/pop → O(log n)
Space Complexity: O(n)

Pattern:
- Max Heap

Mistake / Note:
- Default priority_queue = max heap
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    priority_queue<int> pq;

    cout << "Enter number of elements: ";
    int n; cin >> n;

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        pq.push(x);
    }

    cout << "Max Heap elements: ";
    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }

    return 0;
}

/* Sample Input:
5
1 5 2 10 3

Sample Output:
Max Heap elements: 10 5 3 2 1
*/