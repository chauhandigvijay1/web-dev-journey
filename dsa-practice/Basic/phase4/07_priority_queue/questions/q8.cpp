/*
Question:
- Sort nearly sorted array

Approach / Logic:
- Use min heap of size k
- Push elements and extract smallest

Time Complexity: O(n log k)
Space Complexity: O(k)

Pattern:
- Heap optimization
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 6, k = 2;
    vector<int> v = {3, 2, 6, 5, 4, 8};

    priority_queue<int, vector<int>, greater<int>> pq;

    for (int i = 0; i < n; i++) {
        pq.push(v[i]);

        if (pq.size() > k) {
            cout << pq.top() << " ";
            pq.pop();
        }
    }

    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }

    return 0;
}